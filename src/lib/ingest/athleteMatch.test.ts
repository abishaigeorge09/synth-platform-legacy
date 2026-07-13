import { describe, expect, it } from 'vitest'
import {
  bestMatches,
  MATCH_AUTO_THRESHOLD,
  MATCH_FLAG_THRESHOLD,
  nameSimilarity,
} from '@lib/ingest/athleteMatch'

describe('nameSimilarity', () => {
  it('returns 1 for exact matches (case + whitespace insensitive)', () => {
    expect(nameSimilarity('Maria Sanchez', 'Maria Sanchez')).toBe(1)
    expect(nameSimilarity('  Maria  Sanchez ', 'maria sanchez')).toBe(1)
  })

  it('scores last-name-only matches highly', () => {
    // "Sanchez" against full "Maria Sanchez" — token shortcut
    expect(nameSimilarity('Sanchez', 'Maria Sanchez')).toBeGreaterThanOrEqual(0.9)
    expect(nameSimilarity('Maria', 'Maria Sanchez')).toBeGreaterThanOrEqual(0.9)
  })

  it('handles initials', () => {
    expect(nameSimilarity('M. Sanchez', 'Maria Sanchez')).toBeGreaterThanOrEqual(0.85)
    expect(nameSimilarity('Maria S.', 'Maria Sanchez')).toBeGreaterThanOrEqual(0.85)
  })

  it('penalizes typos by edit distance', () => {
    const score = nameSimilarity('Maria Sanchz', 'Maria Sanchez')
    expect(score).toBeGreaterThan(MATCH_FLAG_THRESHOLD)
    expect(score).toBeLessThan(1)
  })

  it('returns low score for unrelated names', () => {
    expect(nameSimilarity('Bob Smith', 'Maria Sanchez')).toBeLessThan(MATCH_FLAG_THRESHOLD)
  })

  it('returns 0 when either side is empty', () => {
    expect(nameSimilarity('', 'Maria Sanchez')).toBe(0)
    expect(nameSimilarity('Maria', '')).toBe(0)
  })
})

describe('bestMatches', () => {
  const roster = [
    { id: 'a1', name: 'Maria Sanchez' },
    { id: 'a2', name: 'Maria Lopez' },
    { id: 'a3', name: 'Bob Smith' },
    { id: 'a4', name: 'Ella Wheeler' },
  ]

  it('returns the top candidates in descending score order', () => {
    const out = bestMatches('M. Sanchez', roster, 3)
    expect(out).toHaveLength(3)
    expect(out[0].athleteId).toBe('a1')
    expect(out[0].score).toBeGreaterThanOrEqual(MATCH_AUTO_THRESHOLD)
    expect(out[0].score).toBeGreaterThanOrEqual(out[1].score)
  })

  it('still returns the requested count even when scores are low', () => {
    const out = bestMatches('totally unrelated', roster, 2)
    expect(out).toHaveLength(2)
  })

  it('handles empty rosters cleanly', () => {
    expect(bestMatches('Maria', [], 3)).toEqual([])
  })

  it('exact matches outrank partial ones', () => {
    const out = bestMatches('Maria Sanchez', roster, 4)
    expect(out[0].athleteId).toBe('a1')
    expect(out[0].score).toBe(1)
  })
})
