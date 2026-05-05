/**
 * Thin adapter on top of the existing claude-chat Supabase Edge Function
 * (proxy lives at src/lib/ai/claude.ts). The Anthropic API key is held
 * server-side in the function's secrets — nothing ships to the browser.
 *
 * This file keeps the same external API the AI pages already call
 * (streamCompletion / buildSystemPrompt / getAIClientMode), so the
 * coach + athlete AIPage components don't need to know whether they're
 * talking to the proxy or to a local mock.
 */

import { streamClaudeMessages, selectModel } from '../../../lib/ai/claude'
import { isClaudeConfigured } from '../../../lib/ai/env'

export type AIClientMode = 'live' | 'mock'

/**
 * `live` when Supabase is configured. Demo users with anonymous Supabase
 * sessions still hit `live` — the Edge Function accepts anonymous JWTs.
 *
 * The previous version returned `mock` whenever isDemo was true. That
 * predates anonymous sign-in: useAppAuthStore.setDemoUser now calls
 * supabase.auth.signInAnonymously() which gives demo users a real JWT.
 * Forcing them to mock mode left coaches stuck on canned responses even
 * with a valid session. The opts param stays for backwards compat but
 * is intentionally ignored.
 */
export function getAIClientMode(_opts?: { isDemo?: boolean }): AIClientMode {
  void _opts
  if (!isClaudeConfigured()) return 'mock'
  return 'live'
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
  /** Abort signal — flips a guard so onEvent stops firing. The underlying
   *  fetch keeps running until completion (the proxy doesn't expose a
   *  cancel hook). Acceptable trade-off for v1. */
  signal?: AbortSignal
  /** Override model. Defaults to selectModel() heuristic. */
  model?: string
  /** Reserved — the proxy hard-codes max_tokens=2048 for the streaming
   *  path today. Keeping the prop in the signature for forward-compat. */
  maxTokens?: number
}

/**
 * Streams a Claude completion as text deltas. The proxy's onTextDelta
 * passes the accumulated full text after each token; we diff against
 * the previous accumulator to emit raw deltas via onEvent.
 */
export async function streamCompletion({
  systemPrompt,
  messages,
  onEvent,
  signal,
  model,
}: StreamArgs): Promise<void> {
  let cancelled = signal?.aborted ?? false
  const onAbort = () => {
    cancelled = true
  }
  signal?.addEventListener('abort', onAbort)

  const lastUser = messages[messages.length - 1]?.content ?? ''
  const chosenModel = model ?? selectModel(lastUser, systemPrompt)

  let prev = ''
  try {
    await streamClaudeMessages({
      system: systemPrompt,
      model: chosenModel,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      onTextDelta: (full: string) => {
        if (cancelled) return
        const delta = full.slice(prev.length)
        prev = full
        if (delta) onEvent({ kind: 'delta', text: delta })
      },
    })
    if (!cancelled) onEvent({ kind: 'done' })
  } catch (err) {
    if (cancelled) {
      onEvent({ kind: 'done' })
      return
    }
    onEvent({
      kind: 'error',
      message: err instanceof Error ? err.message : 'AI request failed.',
    })
  } finally {
    signal?.removeEventListener('abort', onAbort)
  }
}

// ---------------------------------------------------------------------------
// System prompt builder — synth-specific. Layers customization (instructions,
// tone, references, always/never toggles) on top of scope-aware data context.
// ---------------------------------------------------------------------------

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
