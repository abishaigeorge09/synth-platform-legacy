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

const ANTHROPIC_API = '/api/anthropic/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

function getDirectKey(): string {
  if (!import.meta.env.DEV) return ''
  return (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined) ?? ''
}

export function isDirectKeyConfigured(): boolean {
  return getDirectKey().length > 10
}

type Msg = { role: 'user' | 'assistant'; content: string }

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

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: args.model,
      max_tokens: 2048,
      stream: true,
      system: args.system,
      messages: args.messages,
    }),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Anthropic ${res.status}: ${t}`)
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
