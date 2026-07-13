import { describe, expect, it } from 'vitest'
import { filterScopes, type ScopeOption } from './AIChat'

const TEAM: ScopeOption = { id: 'team', label: "Pacific Women's Rowing", pinned: true }
const STAR: ScopeOption = { id: 'a-star', label: 'Star Miller' }
const OLIVIA: ScopeOption = { id: 'a-olivia', label: 'Olivia Roth', flagged: true }
const ELLA: ScopeOption = { id: 'a-ella', label: 'Ella Wheeler' }
const LOLA: ScopeOption = { id: 'a-lola', label: 'Lola Crampin', flagged: true }

const ROSTER = [TEAM, STAR, OLIVIA, ELLA, LOLA]

describe('filterScopes', () => {
  it('returns everything with no query and no flagged toggle', () => {
    const out = filterScopes(ROSTER, '', false)
    expect(out.pinned).toEqual([TEAM])
    expect(out.athletes).toEqual([STAR, OLIVIA, ELLA, LOLA])
  })

  it('case-insensitive substring match on label', () => {
    expect(filterScopes(ROSTER, 'oliv', false).athletes).toEqual([OLIVIA])
    expect(filterScopes(ROSTER, 'OLIV', false).athletes).toEqual([OLIVIA])
    expect(filterScopes(ROSTER, 'ella', false).athletes).toEqual([ELLA])
  })

  it('matches multiple athletes with a shared substring', () => {
    // 'l' matches every athlete: Star MiL_ler, OL_ivia, EL_la, LoL_a.
    expect(filterScopes(ROSTER, 'l', false).athletes.map((o) => o.id)).toEqual([
      'a-star',
      'a-olivia',
      'a-ella',
      'a-lola',
    ])
  })

  it('keeps the pinned option visible regardless of search', () => {
    // Even when the search would exclude every athlete, the pinned
    // team option still surfaces so the coach has a way back.
    const out = filterScopes(ROSTER, 'zzzzznever', false)
    expect(out.pinned).toEqual([TEAM])
    expect(out.athletes).toEqual([])
  })

  it('keeps the pinned option visible regardless of flagged toggle', () => {
    const out = filterScopes(ROSTER, '', true)
    expect(out.pinned).toEqual([TEAM])
    expect(out.athletes).toEqual([OLIVIA, LOLA])
  })

  it('combines search + flagged filter', () => {
    const out = filterScopes(ROSTER, 'olivia', true)
    expect(out.athletes).toEqual([OLIVIA])
    // Search "ella" yields Ella who is NOT flagged, so the flagged
    // filter excludes her too.
    expect(filterScopes(ROSTER, 'ella', true).athletes).toEqual([])
  })

  it('returns empty athletes when nothing matches', () => {
    const out = filterScopes(ROSTER, 'nobody', false)
    expect(out.athletes).toEqual([])
  })
})
