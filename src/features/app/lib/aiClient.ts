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

import { streamClaudeMessages, selectModel, type ContentBlock } from '../../../lib/ai/claude'
import { isClaudeConfigured } from '../../../lib/ai/env'
import {
  isDirectKeyConfigured,
  streamDirectMessages,
} from '../../../lib/ai/directClient'

export type AIClientMode = 'live' | 'mock'

/**
 * `live` when either:
 *   - VITE_ANTHROPIC_API_KEY is set (dev only, see directClient.ts), OR
 *   - Supabase is configured (the claude-chat Edge Function path)
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
  if (isDirectKeyConfigured()) return 'live'
  if (!isClaudeConfigured()) return 'mock'
  return 'live'
}

export type AIRole = 'user' | 'assistant'
/**
 * Phase 4 — content is either a plain string (the common text-only
 * case) or an Anthropic content-block array (used when the user has
 * attached an image). Both ride the same wire format; aiClient just
 * forwards whatever shape callers pass.
 */
export type AIMessage = { role: AIRole; content: string | ContentBlock[] }

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

  // selectModel reads the last user prompt to decide the tier; pull a
  // string out of either content shape (plain string OR content blocks)
  // so the heuristic still has something to look at when an image is
  // attached. The text block sits last in buildUserContent's output.
  const lastContent = messages[messages.length - 1]?.content ?? ''
  const lastUser =
    typeof lastContent === 'string'
      ? lastContent
      : lastContent
          .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
          .map((b) => b.text)
          .join(' ')
  const chosenModel = model ?? selectModel(lastUser, systemPrompt)

  let prev = ''
  const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }))
  const onDelta = (full: string) => {
    if (cancelled) return
    const delta = full.slice(prev.length)
    prev = full
    if (delta) onEvent({ kind: 'delta', text: delta })
  }

  try {
    if (isDirectKeyConfigured()) {
      // Dev-only: VITE_ANTHROPIC_API_KEY through the Vite proxy.
      await streamDirectMessages({
        system: systemPrompt,
        model: chosenModel,
        messages: apiMessages,
        onTextDelta: onDelta,
      })
    } else {
      // Production / no direct key: Supabase Edge Function path.
      await streamClaudeMessages({
        system: systemPrompt,
        model: chosenModel,
        messages: apiMessages,
        onTextDelta: onDelta,
      })
    }
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
  hasImage = false,
}: {
  scope: 'team' | 'athlete' | 'self'
  scopeLabel: string
  scopeData: Record<string, unknown>
  customization: Customization
  /** Phase 4 follow-up — when the user attached an image to the
   *  current message, we lean the prompt into observation +
   *  clarifying questions rather than letting Claude fall back to
   *  generic prose. The auto-tagging line below sets expectations
   *  honestly: synth can't classify images yet, but it's planned
   *  (see docs/TODO-ai-image-tagging.md). */
  hasImage?: boolean
}): string {
  const lines: string[] = [
    'You are synth, an AI assistant for a rowing coach/athlete data platform.',
    'You answer from the data the user has connected. Never invent metrics.',
    `Current scope: ${scopeLabel} (${scope}).`,
    `Scope data:\n${JSON.stringify(scopeData, null, 2)}`,
    '',
    'WRITING RULES (apply to every response):',
    '- Plain words. No corporate jargon. Banned phrases: "leverage", "synergy", "deep dive", "unlock", "circle back", "at the end of the day", "moving forward".',
    '- Never use em-dashes (—) or en-dashes (–). Use a comma, period, colon, or simple hyphen (-) instead. This rule has no exceptions.',
    '- Short sentences. Aim for 12-18 words each.',
    '- Default response length: 3-6 lines. Expand only when explicitly asked.',
    '',
    'CONVERSATION RULES:',
    '- For greetings or chit-chat ("hi", "thanks", "ok", "cool"), respond conversationally in 1-2 short sentences. NO data dump, NO citations, NO bullet points, NO charts.',
    '- For data-related questions, lead with the answer. Use the data above; never invent metrics.',
    '',
    'STRUCTURED OUTPUT (data answers only):',
    '- Markdown is fine: ## headers, **bold** for key numbers, - bullets.',
    '- Cite a data source inline with [c:source|subject|date]. Example: [c:Concept2|Star Miller|2026-04-26]. Use citations sparingly. At most one or two per response, attached to the most important number.',
    '- For time-series or trend data, embed [chart:title|source|metric|window]. Example: [chart:Avg recovery, 7 days|WHOOP|recovery|7d]. The renderer turns these into interactive graphs. Prefer charts over long bullet lists.',
    '- For team rosters, athlete comparisons, or any multi-row data with consistent columns, embed [table:title|col1,col2,col3|row1cell,row1cell,row1cell|row2cell,row2cell,row2cell]. Example: [table:1V vs 2V boats|Boat,Avg recovery,Flagged|1V,72,1|2V,68,2]. Pipe separates segments. The first segment after the title is the column header row.',
    '- For motivational or thematic moments (race day, wins, recovery wins), embed [illustration:glyph|caption]. Glyph must be one of: boat, erg, trophy, heart, stopwatch. Example: [illustration:trophy|First sub-7 of the season]. Use sparingly, only when a visual cue helps.',
    '- For data, performance, or coaching questions, end with [suggest:Question 1|Question 2|Question 3] where each item is a short, complete follow-up question the coach might ask next (1 to 3 items, max 80 characters each). The UI shows these as tappable chips above the composer. Example: [suggest:Show me each piece split|Compare to last month|Who paced too hot?]. Skip the suggest token entirely for casual greetings.',
    '- After [suggest:...], do not also add a written question. The chips replace the inline question.',
    '',
    `Tone: ${TONE_GUIDANCE[customization.tone]}`,
  ]

  if (hasImage) {
    // The user attached an image to THIS message. Force a structured
    // response shape: short observation, expectation-setting line
    // about auto-tagging being a roadmap item, then 1-3 clarifying
    // questions as suggestion chips. Skipping the chips here is the
    // most common failure mode -- without this hard rule, Claude
    // tends to dump a wall of generic "I see X, Y, Z" prose with no
    // follow-up.
    lines.push(
      '',
      'IMAGE ATTACHED — special handling for this message:',
      '1. In ONE short sentence, say what you see in the image. No more than 18 words. No bullet list, no markdown headers.',
      '2. Then add this exact disclaimer once, on its own short line: "synth can\'t auto-tag images yet, that\'s coming soon."',
      '3. Then ask 1-3 clarifying questions ONLY via [suggest:Q1|Q2|Q3] so the coach can tap to send. Pick questions that pin down WHAT they want analysed (e.g. catch position, finish, blade depth, comparison to a prior session, technique vs. force, who they\'re comparing against). Each item max 80 characters, each one a complete sentence ending in "?".',
      '4. Do not ask the same question in prose AND in a chip. Chips replace inline questions on this turn.',
      '5. Do not add citations, charts, tables, or illustrations to this message. Keep it minimal until the coach picks a follow-up.',
    )
  }

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
