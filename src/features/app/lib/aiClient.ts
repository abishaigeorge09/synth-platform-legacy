/**
 * Direct-browser Anthropic Messages client. When a `VITE_ANTHROPIC_API_KEY`
 * is set in `.env.local`, the AI page calls this; otherwise it falls back
 * to the local mock generator. Browser-side keys are visible to anyone
 * who opens devtools — fine for solo dev / demo, but for production you
 * want a server proxy (TODO once auth lands).
 */

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-sonnet-4-5-20251001'

export type AIClientMode = 'live' | 'mock'

export function getAIClientMode(): AIClientMode {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
  return key && key.startsWith('sk-ant-') ? 'live' : 'mock'
}

export type AIRole = 'user' | 'assistant'
export type AIMessage = { role: AIRole; content: string }

export type StreamEvent =
  | { kind: 'delta'; text: string }
  | { kind: 'done' }
  | { kind: 'error'; message: string }

type StreamArgs = {
  systemPrompt: string
  messages: AIMessage[]
  onEvent: (e: StreamEvent) => void
  signal?: AbortSignal
  model?: string
  maxTokens?: number
}

/**
 * Streams an Anthropic completion as SSE deltas. Each text delta is fed
 * back via onEvent. Caller appends to its own running buffer for display.
 * Aborting the AbortSignal cleanly cancels the in-flight request.
 */
export async function streamCompletion({
  systemPrompt,
  messages,
  onEvent,
  signal,
  model = DEFAULT_MODEL,
  maxTokens = 1024,
}: StreamArgs): Promise<void> {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
  if (!key) {
    onEvent({ kind: 'error', message: 'No API key — set VITE_ANTHROPIC_API_KEY in .env.local.' })
    return
  }

  let res: Response
  try {
    res = await fetch(ANTHROPIC_ENDPOINT, {
      method: 'POST',
      signal,
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
        stream: true,
      }),
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      onEvent({ kind: 'done' })
      return
    }
    onEvent({
      kind: 'error',
      message: err instanceof Error ? err.message : 'Network error contacting Anthropic.',
    })
    return
  }

  if (!res.ok) {
    const body = await safeReadText(res)
    onEvent({ kind: 'error', message: `Anthropic ${res.status}: ${body || res.statusText}` })
    return
  }
  if (!res.body) {
    onEvent({ kind: 'error', message: 'Anthropic response had no body.' })
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // Split on SSE record boundaries (\n\n).
      let recordEnd = buffer.indexOf('\n\n')
      while (recordEnd !== -1) {
        const record = buffer.slice(0, recordEnd)
        buffer = buffer.slice(recordEnd + 2)
        handleRecord(record, onEvent)
        recordEnd = buffer.indexOf('\n\n')
      }
    }
    if (buffer.trim().length > 0) {
      handleRecord(buffer, onEvent)
    }
    onEvent({ kind: 'done' })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      onEvent({ kind: 'done' })
      return
    }
    onEvent({
      kind: 'error',
      message: err instanceof Error ? err.message : 'Stream read error.',
    })
  }
}

function handleRecord(record: string, onEvent: (e: StreamEvent) => void) {
  // SSE record is one or more lines. We only care about `data: …` lines
  // for content_block_delta events.
  for (const line of record.split('\n')) {
    if (!line.startsWith('data:')) continue
    const data = line.slice(5).trim()
    if (!data || data === '[DONE]') continue
    let parsed: { type?: string; delta?: { type?: string; text?: string } }
    try {
      parsed = JSON.parse(data)
    } catch {
      continue
    }
    if (
      parsed.type === 'content_block_delta' &&
      parsed.delta?.type === 'text_delta' &&
      typeof parsed.delta.text === 'string'
    ) {
      onEvent({ kind: 'delta', text: parsed.delta.text })
    }
  }
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text()
  } catch {
    return ''
  }
}

// — System prompt builder —

type Customization = {
  instructions: string
  tone: 'normal' | 'coach' | 'raceday' | 'recovery'
  references: { name: string; ext: string }[]
  alwaysPlans: boolean
  alwaysWellness: boolean
  neverPrivateNotes: boolean
}

const TONE_GUIDANCE: Record<Customization['tone'], string> = {
  normal: 'Balanced narrative with citations. Lead with the metric, end with a follow-up question.',
  coach: 'Practical and action-first. Give the coach what to DO, not just what is. Short paragraphs.',
  raceday: 'Tight, high-signal, no fluff. Numbers + recommended action only. Race-day mindset.',
  recovery: 'Lean into sleep, load, readiness. Emphasize the WHY behind recovery patterns.',
}

export function buildSystemPrompt({
  scope,
  scopeLabel,
  scopeData,
  customization,
}: {
  scope: 'team' | 'athlete' | 'self'
  scopeLabel: string
  scopeData: Record<string, unknown>
  customization: Customization
}): string {
  const lines: string[] = [
    'You are synth, an AI assistant for a rowing coach/athlete data platform.',
    'You answer from the data the user has connected — never invent metrics.',
    `Current scope: ${scopeLabel} (${scope}).`,
    `Scope data:\n${JSON.stringify(scopeData, null, 2)}`,
    '',
    'FORMAT RULES:',
    '- Keep answers tight and easy to read. Aim for 5–8 lines unless asked to expand.',
    '- Use markdown: ## headers for sections, **bold** for key numbers, - for bullets.',
    '- When citing a data source inline, use the format [c:source|subject|date], for example [c:Concept2|Star Miller|2026-04-26].',
    '- End with one short follow-up question the user might ask next, when natural.',
    '',
    `Tone: ${TONE_GUIDANCE[customization.tone]}`,
  ]

  if (customization.instructions.trim()) {
    lines.push('', `Coach's custom instructions:\n${customization.instructions.trim()}`)
  }

  if (customization.references.length > 0) {
    const refs = customization.references.map((r) => `- ${r.name} (${r.ext})`).join('\n')
    lines.push('', `Reference materials uploaded by the coach:\n${refs}`)
    lines.push('Treat these references as authoritative context for any answer that touches them.')
  }

  const alwaysList: string[] = []
  if (customization.alwaysPlans) alwaysList.push('Race plans + lineups')
  if (customization.alwaysWellness) alwaysList.push('Wellness check-ins')
  if (alwaysList.length > 0) {
    lines.push('', `Always reference when relevant: ${alwaysList.join(', ')}.`)
  }

  if (customization.neverPrivateNotes) {
    lines.push('Never reference: private coach notes (notes flagged as Private).')
  }

  return lines.join('\n')
}
