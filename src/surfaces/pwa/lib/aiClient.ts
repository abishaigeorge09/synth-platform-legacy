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

import { streamClaudeMessages, selectModel, type ContentBlock } from '@lib/ai/claude'
import { isClaudeConfigured } from '@lib/ai/env'
import {
  isDirectKeyConfigured,
  streamDirectMessages,
} from '@lib/ai/directClient'

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
    '- Prose budget: AT MOST 2 short sentences between any two structured blocks (chart / table / callout / illustration / chip). The visual blocks carry the response, not the paragraphs.',
    '- Lead with a 1-line headline (≤14 words) before the first block. Bold the key number with **markdown bold**.',
    '',
    'CONVERSATION RULES:',
    '- For greetings or chit-chat ("hi", "thanks", "ok", "cool", "thx", "got it"), respond conversationally in 1-2 short sentences. NO citations, NO charts, NO tables, NO callouts, NO illustrations, NO suggestion chips. Just chat.',
    '- For ANY question that touches data (status, trends, comparison, why, who, what, when, recovery, splits, lineups, race plan, sleep, training load, attention list, flagged): you MUST emit a structured response. Generic prose answers are forbidden for data questions.',
    '',
    'STRUCTURED OUTPUT — REQUIRED for data questions:',
    'Every data answer must include the right blocks for the scenario. Pick from these tokens — they render as interactive UI, not literal text. The user sees graphs, tables, callouts, illustrations, citation chips, and tappable follow-up chips, NOT the raw token syntax.',
    '',
    '  [c:source|subject|date]                      citation chip (e.g. [c:WHOOP|Olivia Roth|2026-05-05])',
    '  [chart:title|source|metric|window]           time-series graph (e.g. [chart:Avg recovery, 7d|WHOOP|recovery|7d])',
    '  [table:title|col1,col2,col3|r1a,r1b,r1c|r2a,r2b,r2c]   data table (header row first, then rows)',
    '  [callout:tone|title|text]                    boxed insight, tone is one of info | warn | success',
    '  [illustration:glyph|caption]                 visual cue, glyph is one of boat | erg | trophy | heart | stopwatch',
    '  [suggest:Q1|Q2|Q3]                           1-3 tappable follow-up questions (max 80 chars each), end of message only',
    '',
    'Required block recipe by scenario (pick the matching one and follow the template literally):',
    '',
    '  • TEAM STATUS / "how is the team / today / this week":',
    '      1 short headline sentence with the active count.',
    '      [chart:Avg recovery, 7d|WHOOP|recovery|7d]',
    '      [table:Athletes to watch|Athlete,Signal,Source|<3 rows>]',
    '      [callout:warn|<top concern title>|<one-line cause>]   if there is a concern',
    '      [callout:success|<bright spot title>|<one line>]      if there is a clear win',
    '      One citation chip on the most important number.',
    '      [suggest:Q1|Q2|Q3]',
    '',
    '  • ATHLETE DEEP-DIVE / "how is X / what\'s wrong with X / show X\'s splits":',
    '      1 headline sentence ("**Olivia\'s 2K** has slipped 6.4s in 4 weeks.").',
    '      [chart:2K time, 14d|Concept2|split|14d]   pick the metric they asked about',
    '      [callout:warn|Likely cause|<one line tying data points together>]',
    '      One citation chip [c:source|athlete|date].',
    '      [suggest:Q1|Q2|Q3]',
    '',
    '  • COMPARISON / "compare 1V vs 2V / olivia vs ella":',
    '      1 headline sentence naming the winner.',
    '      [table:<title>|<col_csv>|<row1_csv>|<row2_csv>...]   table is required for comparisons',
    '      Optional [chart:...] if both have a shared trend.',
    '      [suggest:Q1|Q2|Q3]',
    '',
    '  • WELLNESS / RECOVERY / SLEEP:',
    '      1 headline sentence with current value.',
    '      [chart:Recovery, 7d|WHOOP|recovery|7d]',
    '      [callout:info|Pattern|<one line on what drives the trend>]',
    '      [suggest:Q1|Q2|Q3]',
    '',
    '  • RACE DAY / WIN / MOTIVATIONAL:',
    '      [illustration:trophy|<caption>] (or boat / heart depending on tone)',
    '      1-2 short sentences.',
    '      [suggest:Q1|Q2|Q3]',
    '',
    '  • LINEUP / BOAT / SEAT:',
    '      [illustration:boat|<boat name + published time>]',
    '      [table:<lineup title>|Seat,Athlete,Side|<rows>]',
    '      [suggest:Q1|Q2|Q3]',
    '',
    'Block usage rules:',
    '- Tokens render as UI — never wrap them in code fences or quotes.',
    '- Citations: at most TWO chips per response, attached to the most important numbers. Never on every sentence.',
    '- After [suggest:...], do not write a follow-up question in prose. Chips replace that question.',
    '- Skip blocks that don\'t fit. A pure "hi" gets zero blocks; a team status gets all of chart + table + callout + chip + suggest.',
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
