export type ClaudeModel = 'mock'

export type ClaudeChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function claudeChat(_args: {
  model?: ClaudeModel
  messages: ClaudeChatMessage[]
  maxTokens?: number
  temperature?: number
}) {
  return {
    id: `mock-${Date.now()}`,
    content: `AI is disabled in this build. (${_args.messages.length} messages in thread)`,
  }
}

import { isClaudeConfigured } from './env'

export const ANTHROPIC_MODELS = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-20250514',
  /** Spec name; falls back in `selectModel` if API rejects. */
  opus: 'claude-opus-4-6',
  opusStable: 'claude-opus-4-20250514',
} as const

export function selectModel(query: string, context: string): string {
  const q = query.toLowerCase()
  const isSimple = query.length < 100 && !q.includes('compare') && !q.includes('analyze')
  const isComplex =
    q.includes('predict') || q.includes('department') || context.length > 10_000
  if (isComplex) return ANTHROPIC_MODELS.opus
  if (isSimple) return ANTHROPIC_MODELS.haiku
  return ANTHROPIC_MODELS.sonnet
}

function anthropicApiBase(): string {
  if (import.meta.env.DEV && import.meta.env.VITE_ANTHROPIC_USE_DEV_PROXY === 'true') {
    return '/api/anthropic'
  }
  return 'https://api.anthropic.com'
}

function anthropicHeaders(): Record<string, string> {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
  const useProxy = import.meta.env.DEV && import.meta.env.VITE_ANTHROPIC_USE_DEV_PROXY === 'true'
  const h: Record<string, string> = {
    'content-type': 'application/json',
    'anthropic-version': '2023-06-01',
  }
  if (!useProxy && key) {
    h['x-api-key'] = key
    h['anthropic-dangerous-direct-browser-access'] = 'true'
  }
  return h
}

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
  const tryModels = [...new Set([args.model, ANTHROPIC_MODELS.opusStable, ANTHROPIC_MODELS.sonnet, ANTHROPIC_MODELS.haiku])]
  let lastErr: unknown
  for (const model of tryModels) {
    try {
      const res = await fetch(`${anthropicApiBase()}/v1/messages`, {
        method: 'POST',
        headers: anthropicHeaders(),
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
