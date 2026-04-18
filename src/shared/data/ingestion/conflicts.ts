/**
 * Source priority when two normalized values disagree (DATA_INTELLIGENCE).
 */

export type SourceKey = string

/** Lower number = higher priority (Concept2 machine beats manual sheet). */
export const DEFAULT_SOURCE_PRIORITY: Record<string, number> = {
  concept2_logbook: 1,
  synth_session_timer: 2,
  google_sheets: 3,
  ai_import_photo: 4,
  ai_import_voice: 4,
  ai_import_paste: 4,
  strava: 5,
}

export function pickPreferredSource(a: SourceKey, b: SourceKey, overrides?: Record<string, number>): SourceKey {
  const table = { ...DEFAULT_SOURCE_PRIORITY, ...overrides }
  const pa = table[a] ?? 50
  const pb = table[b] ?? 50
  return pa <= pb ? a : b
}
