/**
 * Capability manifest for the vibe-code Custom Tools MVP.
 *
 * Single source of truth for what synth's tool renderer can express
 * today. Read by:
 *   - The Anthropic system prompt in `supabase/functions/tool-generate/`
 *     (so Claude knows the constraints and declines out-of-scope asks).
 *   - The frontend, when explaining declines or showing "not available
 *     yet" state.
 *
 * The manifest is kept in lock-step with `src/lib/tools/schema.ts`
 * via `capabilities.test.ts` — bumping the schema without bumping the
 * manifest fails CI.
 *
 * Architectural note: this file is the gate that turns "we're an MVP"
 * into a concrete contract. Anything not in `SUPPORTED_*` is something
 * the renderer cannot express; the bot must decline the request and
 * suggest something we *can* build.
 */

// ─── What we CAN render ────────────────────────────────────────────────────

export const SUPPORTED_ELEMENTS = [
  'stat',
  'line_chart',
  'bar_chart',
  'table',
  'athlete_card',
  'boat_lineup',
  'timer',
  'badge',
  'button',
  'input',
  'select',
  'text',
  'boat_race',
  'lineup_picker',
] as const

export const SUPPORTED_SOURCES = [
  'concept2',
  'strava',
  'whoop',
  'sheets',
  'manual',
  'computed',
  'static',
] as const

export const SUPPORTED_INPUTS = [
  'athlete_id',
  'team_id',
  'text',
  'number',
  'date_range',
  'select',
] as const

export const SUPPORTED_SCOPES = ['team', 'athlete', 'self'] as const

export const SUPPORTED_CATEGORIES = [
  'lineups',
  'timing',
  'analysis',
  'coaching',
  'data',
  'wellness',
] as const

export const SUPPORTED_SCHEMA_VERSIONS = [1, 2] as const

// ─── What we explicitly do NOT do (yet) ────────────────────────────────────

/**
 * The MVP does not include any of the capabilities below. When a coach's
 * request implies one of these, the bot must decline with a plain-English
 * explanation and a suggested alternative built from supported pieces.
 *
 * Each entry has `match` keywords (case-insensitive substring; the bot
 * uses these as hints, the actual decision is Claude's), a `reason` (what
 * to tell the coach), and an `alternative` chip the bot can offer.
 */
export type UnsupportedCapability = {
  id: string
  match: string[]
  reason: string
  alternative: string
}

export const UNSUPPORTED_CAPABILITIES: UnsupportedCapability[] = [
  {
    id: 'computer_vision',
    match: ['computer vision', 'cv model', 'video analysis', 'analyze video', 'form check from video'],
    reason:
      "synth's MVP renders charts, tables, and timers from numeric data. Computer-vision pipelines aren't part of the renderer yet.",
    alternative:
      'A self-rated form score on a 1–10 scale per session, plotted over time, would give you a similar trend without the video pipeline.',
  },
  {
    id: 'video_form_analysis',
    match: ['rate my form', 'rate form', 'grade form', 'rower form', 'form analysis', 'biomechanics'],
    reason:
      "We can't auto-grade rowing form from video in the MVP — there's no biomechanics or pose-estimation engine wired up.",
    alternative:
      'A coach-tagged form journal: athlete logs a session, coach drops in a 1–5 rating + a note. Renders as a sparkline.',
  },
  {
    id: 'realtime_gps',
    match: ['live gps', 'real-time gps', 'realtime tracking', 'live position', 'live boat tracking'],
    reason:
      "Real-time GPS streaming during a session isn't a synth capability today. Strava data lands after the workout uploads.",
    alternative:
      "A post-practice piece-by-piece breakdown built from Strava — splits, rate, distance per piece — is fully supported.",
  },
  {
    id: 'voice_audio',
    match: ['voice memo', 'voice note', 'audio recording', 'transcribe audio', 'speech to text'],
    reason:
      'Audio capture and transcription aren\'t in the MVP. The renderer is text + numeric.',
    alternative: 'A typed quick-note input on every session — searchable later, taggable to athletes.',
  },
  {
    id: 'ml_predictions',
    match: ['predict injury', 'injury risk model', 'ml model', 'ai predict', 'machine learning predict'],
    reason:
      "synth surfaces data; it doesn't run ML predictions in the MVP. We don't ship a model artifact.",
    alternative:
      "A load-balance dashboard that highlights athletes whose 7-day load is >15% above their 28-day baseline — the same signal coaches use to flag injury risk manually.",
  },
  {
    id: 'native_camera',
    match: ['take a photo', 'camera capture', 'snap a picture', 'photo upload tool'],
    reason:
      "Direct camera access from a generated tool isn't supported. The MVP renderer is data, not media capture.",
    alternative:
      "An upload-to-session field where the coach attaches a phone photo through the standard session-detail screen.",
  },
  {
    id: 'biomechanics_sensor',
    match: ['imu', 'accelerometer', 'sensor data', 'wearable sensor'],
    reason:
      "Direct sensor ingest (IMU / accelerometer) isn't a connector synth supports. WHOOP and Concept2 are the available wearables.",
    alternative:
      'A dashboard built from WHOOP recovery / strain + Concept2 erg data — most of the same signals reach you that way.',
  },
  {
    id: 'free_form_chatbot',
    match: ['chatbot for athletes', 'chat assistant', 'q&a bot', 'conversational tool'],
    reason:
      "Tools generated by synth render dashboards/forms — not chat surfaces. The platform already has synth AI for athletes; new tools should surface metrics, not host conversations.",
    alternative:
      "A daily-check-in form that appears on the athlete's home — a 3-question wellness pulse with rolling charts.",
  },
]

// ─── Connectors ────────────────────────────────────────────────────────────

/**
 * Sources that require an external account connection in
 * `connector_accounts`. `manual`, `computed`, `static` don't — they're
 * always available. The bot pre-flights the team's connector list before
 * generating; missing connectors are surfaced as a "you'll need to connect
 * X" message but DON'T block generation. The resolver falls back to
 * `MOCK_SNAPSHOTS` (Pacific Women's seed data) in demo mode.
 */
export const CONNECTOR_SOURCES = ['concept2', 'strava', 'whoop', 'sheets'] as const
export type ConnectorSource = (typeof CONNECTOR_SOURCES)[number]

export const CONNECTOR_LABELS: Record<ConnectorSource, string> = {
  concept2: 'Concept2',
  strava: 'Strava',
  whoop: 'WHOOP',
  sheets: 'Google Sheets',
}

// ─── Inferred types ────────────────────────────────────────────────────────

export type SupportedElement = (typeof SUPPORTED_ELEMENTS)[number]
export type SupportedSource = (typeof SUPPORTED_SOURCES)[number]
export type SupportedInput = (typeof SUPPORTED_INPUTS)[number]
export type SupportedScope = (typeof SUPPORTED_SCOPES)[number]
export type SupportedCategory = (typeof SUPPORTED_CATEGORIES)[number]
export type SupportedSchemaVersion = (typeof SUPPORTED_SCHEMA_VERSIONS)[number]

// ─── System prompt fragment ────────────────────────────────────────────────

/**
 * Compact, human-readable manifest the Anthropic system prompt embeds.
 * Kept short so it doesn't dominate the context window — Claude can
 * always inspect the schema for shape details.
 */
export function manifestForSystemPrompt(): string {
  const unsupportedLines = UNSUPPORTED_CAPABILITIES.map(
    (c) => `- ${c.id}: ${c.reason} Alternative: ${c.alternative}`,
  ).join('\n')

  return [
    `Element types you can compose into a tool spec: ${SUPPORTED_ELEMENTS.join(', ')}.`,
    `Binding sources you can wire: ${SUPPORTED_SOURCES.join(', ')}.`,
    `Input kinds: ${SUPPORTED_INPUTS.join(', ')}.`,
    `Scopes: ${SUPPORTED_SCOPES.join(', ')}.`,
    `Categories: ${SUPPORTED_CATEGORIES.join(', ')}.`,
    `Schema versions: ${SUPPORTED_SCHEMA_VERSIONS.join(', ')}.`,
    '',
    'CAPABILITIES THE MVP DOES NOT HAVE — call decline_request with the',
    'matching reason if a coach asks for any of these:',
    unsupportedLines,
  ].join('\n')
}
