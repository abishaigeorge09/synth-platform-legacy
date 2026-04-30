/**
 * Direct browser-side Anthropic API client.
 * Used when VITE_ANTHROPIC_API_KEY is set in .env.local — no Supabase
 * required. Anthropic allows browser calls with the
 * `anthropic-dangerous-allow-browser` header.
 *
 * This path is intentionally for local dev / demo. Production keeps the
 * key server-side in the Supabase Edge Function.
 */

// In dev the Vite proxy at /api/anthropic forwards server-side to
// api.anthropic.com, bypassing CORS. In production (Vercel / PWA) there is
// no proxy, so calls fall back to the Edge Function path — VITE_ANTHROPIC_API_KEY
// should not be set in production builds.
const ANTHROPIC_API =
  import.meta.env.DEV
    ? '/api/anthropic/v1/messages'
    : 'https://api.anthropic.com/v1/messages'

const ANTHROPIC_VERSION = '2023-06-01'

function getDirectKey(): string {
  return (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined) ?? ''
}

export function isDirectKeyConfigured(): boolean {
  const k = getDirectKey()
  return k.length > 10
}

type Msg = { role: 'user' | 'assistant'; content: string }

function handleSseLine(raw: string, onDelta: (t: string) => void): void {
  if (!raw || raw === '[DONE]') return
  try {
    const ev = JSON.parse(raw) as {
      type?: string
      delta?: { type?: string; text?: string }
    }
    if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && ev.delta.text) {
      onDelta(ev.delta.text)
    }
  } catch {
    // ignore partial lines
  }
}

export async function streamDirectMessages(args: {
  system: string
  model: string
  messages: Msg[]
  onTextDelta: (fullText: string) => void
}): Promise<string> {
  const key = getDirectKey()
  if (!key) throw new Error('VITE_ANTHROPIC_API_KEY is not set')

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
