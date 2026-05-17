/**
 * Athlete fuzzy-matching for client-side suggestion lists.
 *
 * Mirrors the Levenshtein scorer in supabase/functions/ingest/index.ts.
 * Both copies must agree on what "0.8" means or the preview panel
 * suggestions will disagree with the server's auto-tagging decisions.
 */

import type { Athlete } from '../../shared/data/types'

export type AthleteMatch = {
  athleteId: string
  name: string
  score: number
}

/** Pure Levenshtein edit distance. ~30 LOC, no deps. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

export function nameSimilarity(a: string, b: string): number {
  const na = a.toLowerCase().trim().replace(/\s+/g, ' ')
  const nb = b.toLowerCase().trim().replace(/\s+/g, ' ')
  if (!na || !nb) return 0
  if (na === nb) return 1
  const ta = na.split(' ')
  const tb = nb.split(' ')
  // First/last name token shortcut
  if (ta.length === 1 && tb.includes(ta[0])) return 0.9
  if (tb.length === 1 && ta.includes(tb[0])) return 0.9
  // Initial matching, e.g. "M. Smith" vs "Maria Smith"
  if (
    ta.length === tb.length &&
    ta.every((t, i) => {
      const u = tb[i]
      if (t === u) return true
      if (t.endsWith('.') && u.startsWith(t.slice(0, -1))) return true
      if (u.endsWith('.') && t.startsWith(u.slice(0, -1))) return true
      return false
    })
  ) {
    return 0.85
  }
  const dist = levenshtein(na, nb)
  const max = Math.max(na.length, nb.length)
  return 1 - dist / max
}

/** Top-N athlete suggestions for a candidate name, descending by score. */
export function bestMatches(
  candidate: string,
  roster: Pick<Athlete, 'id' | 'name'>[],
  topN = 5,
): AthleteMatch[] {
  const scored = roster.map((r) => ({
    athleteId: r.id,
    name: r.name,
    score: nameSimilarity(candidate, r.name),
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topN)
}

export const MATCH_AUTO_THRESHOLD = 0.8
export const MATCH_FLAG_THRESHOLD = 0.6
