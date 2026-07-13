/**
 * Direct browser-side Anthropic API client — DEV ONLY.
 *
 * Activates when:
 *   1. import.meta.env.DEV is true (Vite dev server)
 *   2. VITE_ANTHROPIC_API_KEY is set in .env.local
 *
 * In dev, the request goes through the Vite server proxy at
 * `/api/anthropic/*` (configured in `vite.config.ts`). The proxy forwards
 * server-side to api.anthropic.com — the key never ships to a browser
 * bundle that's deployed anywhere.
 *
 * Production paths:
 *   - DO NOT set VITE_ANTHROPIC_API_KEY in Vercel env vars. Even though
 *     `isDirectKeyConfigured()` is gated to dev, leaving the key out of
 *     the prod build keeps it out of the bundle entirely.
 *   - In production, the Edge Function `claude-chat` is the canonical
 *     path. It holds the Anthropic key as a Supabase secret.
 */

import { modelChainForTier, type ContentBlock } from '@lib/ai/claude'

const ANTHROPIC_API = '/api/anthropic/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

function getDirectKey(): string {
  if (!import.meta.env.DEV) return ''
  return (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined) ?? ''
}

export function isDirectKeyConfigured(): boolean {
  return getDirectKey().length > 10
}

// Phase 4 — content can be a plain string OR an Anthropic content
// block array (used for image attachments). Both ride the same wire
// format; we just forward whatever the caller passed.
type Msg = { role: 'user' | 'assistant'; content: string | ContentBlock[] }

function handleSseLine(raw: string, onDelta: (t: string) => void): void {
  if (!raw || raw === '[DONE]') return
  try {
    const ev = JSON.parse(raw) as {
      type?: string
      delta?: { type?: string; text?: string }
    }
    if (
      ev.type === 'content_block_delta' &&
      ev.delta?.type === 'text_delta' &&
      ev.delta.text
    ) {
      onDelta(ev.delta.text)
    }
  } catch {
    // ignore partial / non-JSON lines
  }
}

export async function streamDirectMessages(args: {
  system: string
  model: string
  messages: Msg[]
  onTextDelta: (fullText: string) => void
}): Promise<string> {
  const key = getDirectKey()
  if (!key) throw new Error('Direct Anthropic key not available')

  // Anthropic's model access varies by key — AG's current key supports
  // opus-4-7 but rejects 3.5 Sonnet. Resolve `args.model` (a tier name
  // like "haiku" / "sonnet" / "opus") into a tier-aware fallback list:
  // cheap models first, escalate to higher tiers only if the whole
  // requested tier 404s. First hit wins.
  const tryModels: string[] = (() => {
    if (args.model === 'haiku' || args.model === 'sonnet' || args.model === 'opus') {
      return modelChainForTier(args.model)
    }
    // Caller passed a literal model ID. Try it first, then walk the
    // sonnet → opus chain as a safety net.
    return [...new Set([args.model, ...modelChainForTier('sonnet')])]
  })()

  let res: Response | null = null
  let lastBody = ''
  for (const model of tryModels) {
    res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': ANTHROPIC_VERSION,
        // Required when Anthropic detects a browser-context request
        // (Origin header forwarded by the Vite dev proxy).
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        stream: true,
        system: args.system,
        messages: args.messages,
      }),
    })
    if (res.ok) {
      console.log('[anthropic-direct] using model:', model)
      break
    }
    // Streaming responses can't be replayed, so we have to clone the
    // body for the error log before potentially trying the next model.
    lastBody = await res.clone().text()
    console.warn('[anthropic-direct] model failed:', model, res.status, lastBody)
    // Authentication / rate-limit errors aren't model-specific. Stop
    // the fallback so we don't hammer the API with bad attempts.
    if (res.status === 401 || res.status === 403 || res.status === 429) break
  }

  if (!res || !res.ok) {
    const trimmed = lastBody.length > 500 ? `${lastBody.slice(0, 500)}…` : lastBody
    throw new Error(`Anthropic ${res?.status ?? 'no response'}: ${trimmed || '(empty body)'}`)
  }
  if (!res.body) throw new Error('No response body from Anthropic')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let lineBuf = ''
  let full = ''

  const flushLines = (final: boolean) => {
    const parts = lineBuf.split('\n')
    lineBuf = final ? '' : (parts.pop() ?? '')
    for (const line of parts) {
      if (!line.startsWith('data:')) continue
      handleSseLine(line.slice(5).trim(), (delta) => {
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
}
