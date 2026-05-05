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

// Anthropic model IDs current as of May 2026.
// `claude-sonnet-4-20250514` + `claude-opus-4-6` were the IDs in this file
// previously and they 404 against the Messages API now — Anthropic
// retired the date-suffixed variants in favor of the rolling aliases.
// The fallback chain in streamClaudeMessages tries opus → sonnet → haiku
// in order, so any one of these going stale gracefully degrades rather
// than failing the whole stream.
export const ANTHROPIC_MODELS = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-6',
  opus: 'claude-opus-4-7',
  opusStable: 'claude-opus-4-7',
} as const

export type ClaudeChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export function selectModel(query: string, context: string): string {
  const q = query.toLowerCase()
  const isSimple = query.length < 100 && !q.includes('compare') && !q.includes('analyze')
  const isComplex =
    q.includes('predict') || q.includes('department') || context.length > 10_000
  if (isComplex) return ANTHROPIC_MODELS.opus
  if (isSimple) return ANTHROPIC_MODELS.haiku
  return ANTHROPIC_MODELS.sonnet
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

type Msg = { role: 'user' | 'assistant'; content: string }

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
  // Try the requested model first; fall back to opusStable / sonnet / haiku
  // if Anthropic rejects it (model deprecation).
  const tryModels = [
    ...new Set([args.model, ANTHROPIC_MODELS.opusStable, ANTHROPIC_MODELS.sonnet, ANTHROPIC_MODELS.haiku]),
  ]
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
