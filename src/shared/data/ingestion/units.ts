/**
 * Unit normalization helpers (DATA_INTELLIGENCE — unit table).
 * Pure functions — safe to run in worker or Edge Function later.
 */

/** Parse strings like "1:38.2" or "6:35.6" to seconds. */
export function parseClockToSeconds(clock: string): number {
  const s = clock.trim()
  const parts = s.split(':')
  if (parts.length === 2) {
    const mm = parseInt(parts[0]!, 10)
    const sec = parseFloat(parts[1]!)
    return mm * 60 + sec
  }
  return parseFloat(s)
}

/** Erg split: always seconds per 500m in storage. */
export function ergSplitToSeconds(input: string | number): number {
  if (typeof input === 'number') return input
  return parseClockToSeconds(input)
}

export function metersFromDistance(input: string): number {
  const t = input.trim().toLowerCase()
  if (t.endsWith('km')) return parseFloat(t) * 1000
  if (t.endsWith('mi')) return parseFloat(t) * 1609.34
  if (t.endsWith('m')) return parseFloat(t)
  return parseFloat(t)
}
