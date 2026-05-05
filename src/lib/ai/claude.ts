// Real Claude calls — routed through the `claude-chat` Supabase Edge Function
// so the Anthropic API key never ships in the JS bundle. Requires the user
// to be signed in to Supabase: the function verifies the JWT before invoking
// Anthropic.
//
// Two entry points:
//   - claudeChat()           non-streaming. Returns full text.
//   - streamClaudeMessages() SSE streaming. Calls onTextDelta(fullText) as
//                            tokens arrive; resolves with final full text.

import { supabase } from '../supabaseClient'
import { isClaudeConfigured } from './env'

// Anthropic model tiers. We don't pin to a single ID — directClient
// runs a fallback chain within each tier so a key with patchy model
// access still works (AG's key supports opus-4-7 + likely some
// sonnets, but 404s on 3.5 Sonnet for example). Cheap models first;
// escalate to Opus only when the query genuinely warrants it.
export const ANTHROPIC_MODELS = {
  haiku: 'haiku',
  sonnet: 'sonnet',
  opus: 'opus',
  // Backwards-compat — old code paths reference opusStable. Maps to
  // sonnet tier so we don't accidentally upgrade everyone to Opus.
  opusStable: 'sonnet',
} as const

// Per-tier preference order. directClient tries them in order, falls
// back to the next-higher tier when the whole tier is rejected by
// the user's API key. Opus tier is the final stop.
export const MODEL_TIER_CHAINS = {
  haiku: [
    'claude-haiku-4-5-20251001',
    'claude-haiku-4-5',
    'claude-3-5-haiku-20241022',
    'claude-3-haiku-20240307',
  ],
  sonnet: [
    'claude-sonnet-4-5',
    'claude-sonnet-4-6',
    'claude-sonnet-4-20250514',
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-latest',
  ],
  opus: [
    'claude-opus-4-7',
    'claude-opus-4-6',
    'claude-opus-4-20250514',
  ],
} as const

export type ModelTier = keyof typeof MODEL_TIER_CHAINS

/**
 * Build the full fallback list for a given tier — that tier's models
 * first, then escalate. Cheaper tiers don't include Opus by default;
 * escalation only happens automatically when all cheaper options 404.
 */
export function modelChainForTier(tier: ModelTier): string[] {
  if (tier === 'haiku') {
    return [...MODEL_TIER_CHAINS.haiku, ...MODEL_TIER_CHAINS.sonnet, ...MODEL_TIER_CHAINS.opus]
  }
  if (tier === 'sonnet') {
    return [...MODEL_TIER_CHAINS.sonnet, ...MODEL_TIER_CHAINS.opus]
  }
  return [...MODEL_TIER_CHAINS.opus]
}

// Anthropic content blocks. Phase 4 — vision support. The wire format
// for `messages[].content` is either a plain string OR an array of
// these block objects. We forward whichever form callers pass through
// to the API verbatim.
export type ImageContentBlock = {
  type: 'image'
  source: {
    type: 'base64'
    /** Anthropic accepts: image/jpeg, image/png, image/gif, image/webp. */
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    /** Base64-encoded image bytes (no data:URL prefix). */
    data: string
  }
}
export type TextContentBlock = { type: 'text'; text: string }
export type ContentBlock = TextContentBlock | ImageContentBlock

export type ClaudeChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string | ContentBlock[]
}

/**
 * Build a user-message content array from a text prompt + optional image
 * attachments. Anthropic's docs recommend image blocks BEFORE the text
 * block when they relate to the same prompt — the model attends to
 * earlier context first, so leading with the image gives the text a
 * chance to reference it naturally.
 *
 * Pass an empty `images` array (or call with just text) and the helper
 * falls back to a single text block; callers can also keep using the
 * plain-string content shape and skip this helper entirely.
 */
export function buildUserContent(
  text: string,
  images: { dataBase64: string; mediaType: ImageContentBlock['source']['media_type'] }[],
): ContentBlock[] {
  const blocks: ContentBlock[] = []
  for (const img of images) {
    blocks.push({
      type: 'image',
      source: { type: 'base64', media_type: img.mediaType, data: img.dataBase64 },
    })
  }
  blocks.push({ type: 'text', text })
  return blocks
}

/**
 * Strip the `data:<mime>;base64,` prefix from a FileReader DataURL so
 * the result can drop straight into an Anthropic image block's `data`
 * field. Returns `{ data, mediaType }` or `null` if the URL isn't a
 * recognized image DataURL.
 */
export function parseImageDataUrl(
  dataUrl: string,
): { data: string; mediaType: ImageContentBlock['source']['media_type'] } | null {
  const m = /^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/i.exec(dataUrl)
  if (!m) return null
  return {
    mediaType: m[1].toLowerCase() as ImageContentBlock['source']['media_type'],
    data: m[2],
  }
}

/**
 * Pick a model tier based on query intent.
 *
 *   haiku  — short conversational replies, greetings, follow-ups.
 *            Cheapest tier. Default for queries under ~80 chars.
 *   sonnet — typical analysis, summaries, comparisons. Default tier.
 *   opus   — explicitly complex reasoning: predictions, multi-athlete
 *            cross-analysis, very long context windows. Use sparingly;
 *            it's the most expensive.
 *
 * Returns a tier string that directClient + claude-chat resolve into
 * an actual model ID via modelChainForTier().
 */
export function selectModel(query: string, context: string): ModelTier {
  const q = query.toLowerCase()
  // Genuinely complex requests — these warrant Opus tier.
  const isComplex =
    q.includes('predict') ||
    q.includes('forecast') ||
    q.includes('strategy') ||
    q.includes('plan for the') ||
    context.length > 30_000
  if (isComplex) return 'opus'
  // Short or conversational — Haiku is plenty.
  const isShort = query.length < 80
  const isCasual = /^(hi|hey|hello|thanks|thank you|yo|ok|okay|sure|cool|nice|got it)\b/i.test(query.trim())
  if (isShort || isCasual) return 'haiku'
  // Everything else — Sonnet, the workhorse tier.
  return 'sonnet'
}

// ---------------------------------------------------------------------------
// Edge Function plumbing
// ---------------------------------------------------------------------------

function functionURL(): string {
  const base = (import.meta.env.VITE_SUPABASE_URL as string) || ''
  return `${base}/functions/v1/claude-chat`
}

async function authHeaders(): Promise<Record<string, string>> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Not signed in')
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''
  return {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`,
    apikey: anonKey,
  }
}

// ---------------------------------------------------------------------------
// Non-streaming
// ---------------------------------------------------------------------------

export async function claudeChat(args: {
  model?: string
  messages: ClaudeChatMessage[]
  system?: string
  maxTokens?: number
  temperature?: number
}): Promise<{ id: string; content: string }> {
  if (!isClaudeConfigured()) {
    return {
      id: `mock-${Date.now()}`,
      content: `AI is not configured. (${args.messages.length} messages in thread)`,
    }
  }

  const userMessages = args.messages.filter((m) => m.role !== 'system')
  const systemPrompt =
    args.system ?? args.messages.find((m) => m.role === 'system')?.content

  const res = await fetch(functionURL(), {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      model: args.model ?? ANTHROPIC_MODELS.sonnet,
      max_tokens: args.maxTokens ?? 1024,
      system: systemPrompt,
      messages: userMessages,
      temperature: args.temperature,
    }),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`AI call failed (${res.status}): ${t}`)
  }

  const json = (await res.json()) as {
    id?: string
    content?: { type: string; text: string }[]
  }
  const text = json.content?.find((c) => c.type === 'text')?.text ?? ''
  return { id: json.id ?? `chat-${Date.now()}`, content: text }
}

// ---------------------------------------------------------------------------
// Streaming (SSE pass-through from the Edge Function)
// ---------------------------------------------------------------------------

// Phase 4 — content can be a plain string (text-only path, the
// majority of calls) or a Content-Block array (when the user has
// attached an image). The Edge Function and the direct path both
// forward this verbatim to api.anthropic.com.
type Msg = { role: 'user' | 'assistant'; content: string | ContentBlock[] }

function handleSseDataLine(raw: string, onText: (t: string) => void): void {
  if (!raw || raw === '[DONE]') return
  try {
    const ev = JSON.parse(raw) as {
      type?: string
      delta?: { type?: string; text?: string }
    }
    if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && ev.delta.text) {
      onText(ev.delta.text)
    }
  } catch {
    // ignore partial / non-JSON lines
  }
}

export async function streamClaudeMessages(args: {
  system: string
  model: string
  messages: Msg[]
  onTextDelta: (fullText: string) => void
}): Promise<string> {
  if (!isClaudeConfigured()) {
    throw new Error('Claude is not configured')
  }

  let full = ''
  // Tier-aware fallback chain. selectModel returns a tier name
  // ('haiku' | 'sonnet' | 'opus'); modelChainForTier expands it to
  // the per-tier model-ID list, escalating only if the whole tier
  // 404s. Falls back to the sonnet chain when args.model is already
  // a literal model ID (e.g. user explicitly overrode the tier).
  const tryModels: string[] =
    args.model === 'haiku' || args.model === 'sonnet' || args.model === 'opus'
      ? modelChainForTier(args.model)
      : [...new Set([args.model, ...modelChainForTier('sonnet')])]
  let lastErr: unknown
  const headers = await authHeaders()
  for (const model of tryModels) {
    try {
      const res = await fetch(functionURL(), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          stream: true,
          system: args.system,
          messages: args.messages,
        }),
      })

      if (!res.ok) {
        const t = await res.text()
        throw new Error(`${res.status} ${t}`)
      }
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let lineBuf = ''
      const flushLines = (final: boolean) => {
        const parts = lineBuf.split('\n')
        lineBuf = final ? '' : (parts.pop() ?? '')
        for (const line of parts) {
          if (!line.startsWith('data:')) continue
          handleSseDataLine(line.slice(5).trim(), (delta) => {
            full += delta
            args.onTextDelta(full)
          })
        }
      }
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        lineBuf += decoder.decode(value, { stream: true })
        flushLines(false)
      }
      lineBuf += decoder.decode()
      flushLines(true)
      return full
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}
