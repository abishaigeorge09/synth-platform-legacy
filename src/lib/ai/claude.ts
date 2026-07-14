// Real Claude calls — routed through the `claude-chat` Supabase Edge Function
// so the Anthropic API key never ships in the JS bundle. Requires the user
// to be signed in to Supabase: the function verifies the JWT before invoking
// Anthropic.
//
// Two entry points:
//   - claudeChat()           non-streaming. Returns full text.
//   - streamClaudeMessages() SSE streaming. Calls onTextDelta(fullText) as
//                            tokens arrive; resolves with final full text.

import { supabase } from '@lib/supabaseClient'
import { isClaudeConfigured } from '@lib/ai/env'

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
//
// Trimmed to ONLY the model IDs that are in claude-chat's
// ALLOWED_MODELS (supabase/functions/claude-chat/index.ts). Earlier
// chains included a dozen legacy and current IDs to maximise the
// chance of landing on something Anthropic accepted, but every one
// not on the edge function's allowlist returned a 400 and forced the
// next iteration. On a slow network those 400 round-trips stacked into
// 2-5 seconds of false starts before the actual success call, which is
// what made AG's prod synth-AI feel "sometimes works, sometimes
// doesn't" — local always works because the Vite proxy bypasses the
// edge function entirely.
//
// Keep this list IN LOCK-STEP with claude-chat/index.ts ALLOWED_MODELS.
// Adding a model here without adding it there is silent waste.
export const MODEL_TIER_CHAINS = {
  haiku: [
    'claude-haiku-4-5-20251001',
  ],
  sonnet: [
    'claude-sonnet-4-6',
    'claude-sonnet-4-20250514',
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

  // Race recovery — Continue with Demo fires signInAnonymously in the
  // background and lets the splash unblock immediately so the page
  // feels snappy. If the user types a chat message before that
  // network call lands, the first getSession() returns null and we
  // throw "Not signed in". Auto-heal: wait briefly, then attempt one
  // recovery sign-in if still empty. After this, persistent "Not
  // signed in" means anonymous sign-ins are disabled on the project,
  // which is a real config issue worth surfacing.
  let session = (await supabase.auth.getSession()).data.session
  if (!session) {
    await new Promise((r) => setTimeout(r, 600))
    session = (await supabase.auth.getSession()).data.session
    if (!session) {
      try {
        await supabase.auth.signInAnonymously()
      } catch (err) {
        console.warn('[auth] recovery anon sign-in threw', err)
      }
      session = (await supabase.auth.getSession()).data.session
    }
  }
  const token = session?.access_token
  if (!token) {
    throw new Error(
      'Not signed in. If anonymous sign-ins are disabled on this Supabase project, enable them in Authentication → Providers → Anonymous sign-ins.',
    )
  }
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

// No request should hang forever — a cold Edge Function start, a stalled
// upstream connection, or a network blip should surface as a clear error
// the user can retry, not an infinite "thinking" indicator. This bounds
// both "never got a response" and "stream stalled partway through": the
// watchdog resets on every chunk and aborts if none arrive in time.
const STREAM_WATCHDOG_MS = 25_000

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
    const controller = new AbortController()
    let watchdog: ReturnType<typeof setTimeout> | undefined
    const armWatchdog = () => {
      clearTimeout(watchdog)
      watchdog = setTimeout(() => controller.abort(), STREAM_WATCHDOG_MS)
    }
    try {
      armWatchdog()
      const res = await fetch(functionURL(), {
        method: 'POST',
        headers,
        signal: controller.signal,
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
        // 429 is the demo daily cap from claude-chat; 401/403 are
        // auth issues. None are model-availability problems, so we
        // tag them as hard errors and let the catch below escape
        // the model loop instead of hammering the next model on the
        // chain (which would just hit the same cap or auth wall).
        if (res.status === 429 || res.status === 401 || res.status === 403) {
          let message = t
          try {
            const parsed = JSON.parse(t) as { error?: string }
            if (parsed.error) message = parsed.error
          } catch {
            /* keep raw */
          }
          const hard: Error & { isHardError?: boolean } = new Error(message)
          hard.isHardError = true
          throw hard
        }
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
        armWatchdog()
        if (done) break
        lineBuf += decoder.decode(value, { stream: true })
        flushLines(false)
      }
      lineBuf += decoder.decode()
      flushLines(true)
      return full
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        lastErr = new Error('synth took too long to respond. Try again.')
        continue
      }
      // Hard errors (429 / 401 / 403) escape the chain immediately.
      // Everything else gets stashed and we try the next model.
      if ((e as { isHardError?: boolean })?.isHardError) {
        throw e
      }
      lastErr = e
    } finally {
      clearTimeout(watchdog)
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}
