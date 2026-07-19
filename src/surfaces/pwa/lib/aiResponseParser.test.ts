import { describe, it, expect } from 'vitest'
import { parseAIText, sanitizeEmDashes } from './aiResponseParser'

describe('sanitizeEmDashes', () => {
  it('replaces em-dash with comma-space', () => {
    expect(sanitizeEmDashes('synth — every signal')).toBe('synth, every signal')
  })

  it('replaces en-dash with comma-space', () => {
    expect(sanitizeEmDashes('Mon – Fri')).toBe('Mon, Fri')
  })

  it('handles em-dash with no surrounding spaces', () => {
    expect(sanitizeEmDashes('synth—every')).toBe('synth, every')
  })

  it('preserves regular hyphens', () => {
    expect(sanitizeEmDashes('high-risk-protocol')).toBe('high-risk-protocol')
  })

  it('handles multiple em-dashes', () => {
    expect(sanitizeEmDashes('one — two — three')).toBe('one, two, three')
  })

  it('returns input unchanged when no em-dashes', () => {
    expect(sanitizeEmDashes('plain text, simple')).toBe('plain text, simple')
  })
})

describe('parseAIText — empty + plain text', () => {
  it('returns empty array for empty input', () => {
    expect(parseAIText('')).toEqual([])
  })

  it('returns single text part for plain prose', () => {
    const out = parseAIText('Recovery looks solid this week.')
    expect(out).toEqual([{ kind: 'text', text: 'Recovery looks solid this week.' }])
  })

  it('sanitizes em-dashes in plain text', () => {
    const out = parseAIText('Solid week — keep it up')
    expect(out).toEqual([{ kind: 'text', text: 'Solid week, keep it up' }])
  })
})

describe('parseAIText — citation chips', () => {
  it('parses a single citation', () => {
    const out = parseAIText('Olivia is at [c:Concept2|Larkin Tremaine|2026-04-26] today.')
    expect(out).toHaveLength(3)
    expect(out[0]).toEqual({ kind: 'text', text: 'Olivia is at ' })
    expect(out[1]).toEqual({
      kind: 'chip',
      source: 'Concept2',
      subject: 'Larkin Tremaine',
      date: '2026-04-26',
    })
    expect(out[2]).toEqual({ kind: 'text', text: ' today.' })
  })

  it('parses multiple citations', () => {
    const out = parseAIText('A [c:Concept2|A|2026-01-01] then B [c:WHOOP|B|2026-01-02] done.')
    expect(out.filter((p) => p.kind === 'chip')).toHaveLength(2)
  })

  it('rejects malformed citation (wrong number of segments)', () => {
    const out = parseAIText('Bad [c:only-one-segment] tag.')
    // Falls through to literal text, brackets preserved
    expect(out).toHaveLength(1)
    expect(out[0]).toEqual({ kind: 'text', text: 'Bad [c:only-one-segment] tag.' })
  })
})

describe('parseAIText — chart tokens', () => {
  it('parses a chart token', () => {
    const out = parseAIText('Trend: [chart:Recovery 7d|WHOOP|recovery|7d]')
    expect(out).toHaveLength(2)
    expect(out[0]).toEqual({ kind: 'text', text: 'Trend: ' })
    const chart = out[1]
    expect(chart.kind).toBe('chart')
    if (chart.kind === 'chart') {
      expect(chart.title).toBe('Recovery 7d')
      expect(chart.data.length).toBe(7)
      expect(chart.data[0]).toHaveProperty('label')
      expect(chart.data[0]).toHaveProperty('value')
      expect(chart.provenance).toContain('WHOOP')
    }
  })

  it('synthesizes 14 days for a 14d window', () => {
    const out = parseAIText('[chart:Strain|WHOOP|strain|14d]')
    const chart = out[0]
    if (chart.kind === 'chart') {
      expect(chart.data.length).toBe(14)
    }
  })

  it('produces deterministic data on re-parse', () => {
    const a = parseAIText('[chart:R|WHOOP|recovery|7d]')
    const b = parseAIText('[chart:R|WHOOP|recovery|7d]')
    expect(a).toEqual(b)
  })
})

describe('parseAIText — table tokens', () => {
  it('parses a table with header + rows', () => {
    const out = parseAIText('[table:Boats|Boat,Recovery,Flagged|1V,72,1|2V,68,2]')
    expect(out).toHaveLength(1)
    const table = out[0]
    expect(table.kind).toBe('table')
    if (table.kind === 'table') {
      expect(table.title).toBe('Boats')
      expect(table.columns).toEqual(['Boat', 'Recovery', 'Flagged'])
      expect(table.rows).toEqual([
        ['1V', '72', '1'],
        ['2V', '68', '2'],
      ])
    }
  })

  it('handles a header-only table (no rows)', () => {
    const out = parseAIText('[table:Empty|Col1,Col2]')
    const table = out[0]
    if (table.kind === 'table') {
      expect(table.columns).toEqual(['Col1', 'Col2'])
      expect(table.rows).toEqual([])
    }
  })

  it('pads short rows to match column count', () => {
    const out = parseAIText('[table:T|A,B,C|x,y]')
    const table = out[0]
    if (table.kind === 'table') {
      expect(table.rows[0]).toEqual(['x', 'y', ''])
    }
  })
})

describe('parseAIText — illustration tokens', () => {
  it('parses an illustration with caption', () => {
    const out = parseAIText('[illustration:trophy|First sub-7]')
    expect(out).toEqual([
      { kind: 'illustration', glyph: 'trophy', caption: 'First sub-7' },
    ])
  })

  it('parses without caption', () => {
    const out = parseAIText('[illustration:boat]')
    expect(out).toEqual([{ kind: 'illustration', glyph: 'boat', caption: undefined }])
  })

  it('rejects unknown glyph (renders as plain text)', () => {
    const out = parseAIText('[illustration:unicorn|caption]')
    expect(out[0]).toEqual({ kind: 'text', text: '[illustration:unicorn|caption]' })
  })
})

describe('parseAIText — callout tokens', () => {
  it('parses an info callout with title + text', () => {
    const out = parseAIText('[callout:info|On track|Sleep average steady at 7.4h]')
    expect(out).toEqual([
      {
        kind: 'callout',
        tone: 'info',
        title: 'On track',
        text: 'Sleep average steady at 7.4h',
      },
    ])
  })

  it('accepts warn + success tones', () => {
    expect(
      parseAIText('[callout:warn|Heads up|Two short-sleep nights]')[0],
    ).toMatchObject({ tone: 'warn' })
    expect(
      parseAIText('[callout:success|Strong block|HRV trending up]')[0],
    ).toMatchObject({ tone: 'success' })
  })

  it('rejects unknown tones (renders as literal text)', () => {
    const out = parseAIText('[callout:danger|Bad|Something]')
    expect(out[0]).toEqual({ kind: 'text', text: '[callout:danger|Bad|Something]' })
  })

  it('keeps pipes inside the text segment intact', () => {
    const out = parseAIText('[callout:info|Pattern|Fast days follow 7+ hour sleep | tracked daily]')
    const cb = out[0]
    if (cb.kind === 'callout') {
      expect(cb.text).toBe('Fast days follow 7+ hour sleep | tracked daily')
    }
  })

  it('hides a partial [callout: token at the tail', () => {
    const out = parseAIText('Heads up: [callout:warn|Watch')
    expect(out).toEqual([{ kind: 'text', text: 'Heads up: ' }])
  })
})

describe('parseAIText — streaming safety', () => {
  it('hides a partial known-token at the tail (chart prefix)', () => {
    // After the partial-token-hiding fix: `[chart:Recovery|WHOOP` is
    // a known-prefix token without a closing bracket yet, so it's
    // truncated from the rendered text. The user sees the prose
    // before the bracket only; the rendered chart appears in one
    // shot when the next delta delivers the closing `]`.
    const out = parseAIText('Early text [chart:Recovery|WHOOP')
    expect(out).toEqual([{ kind: 'text', text: 'Early text ' }])
  })

  it('resolves the partial once the closing bracket arrives', () => {
    const out = parseAIText('Early text [chart:Recovery|WHOOP|recovery|7d] more text')
    expect(out.find((p) => p.kind === 'chart')).toBeTruthy()
  })

  it('handles trailing literal `[` followed by no more tokens', () => {
    const out = parseAIText('hello [ world')
    expect(out).toEqual([{ kind: 'text', text: 'hello [ world' }])
  })
})

describe('parseAIText — suggestion tokens', () => {
  it('parses 1-3 suggestions', () => {
    const out = parseAIText('Anything else? [suggest:What about pace?|Top boats?]')
    const sug = out.find((p) => p.kind === 'suggestions')
    expect(sug).toBeTruthy()
    if (sug && sug.kind === 'suggestions') {
      expect(sug.items).toEqual(['What about pace?', 'Top boats?'])
    }
  })

  it('caps at 5 items', () => {
    const out = parseAIText('[suggest:a|b|c|d|e|f|g]')
    const sug = out.find((p) => p.kind === 'suggestions')
    if (sug && sug.kind === 'suggestions') {
      expect(sug.items).toHaveLength(5)
    }
  })

  it('rejects empty payload', () => {
    const out = parseAIText('[suggest:]')
    // Falls through to literal text
    expect(out[0]).toEqual({ kind: 'text', text: '[suggest:]' })
  })

  it('drops items longer than 120 chars', () => {
    const tooLong = 'x'.repeat(150)
    const out = parseAIText(`[suggest:short|${tooLong}|other]`)
    const sug = out.find((p) => p.kind === 'suggestions')
    if (sug && sug.kind === 'suggestions') {
      expect(sug.items).toEqual(['short', 'other'])
    }
  })
})

describe('parseAIText — partial known-token hiding', () => {
  it('hides a partial [chart: token at the tail', () => {
    const out = parseAIText('Trend: [chart:Recovery|WHOOP')
    expect(out).toEqual([{ kind: 'text', text: 'Trend: ' }])
  })

  it('hides a partial [table: token at the tail', () => {
    const out = parseAIText('Boats: [table:1V vs 2V|Boat,Avg')
    expect(out).toEqual([{ kind: 'text', text: 'Boats: ' }])
  })

  it('hides a partial [c: token at the tail', () => {
    const out = parseAIText('Olivia [c:Concept2|Olivia')
    expect(out).toEqual([{ kind: 'text', text: 'Olivia ' }])
  })

  it('hides a partial [suggest: token at the tail', () => {
    const out = parseAIText('Done. [suggest:What now?|Show more')
    expect(out).toEqual([{ kind: 'text', text: 'Done. ' }])
  })

  it('keeps unrelated brackets in the buffer', () => {
    const out = parseAIText('Use the [link to the source')
    expect(out).toEqual([{ kind: 'text', text: 'Use the [link to the source' }])
  })
})

describe('parseAIText — combined complex input', () => {
  it('parses a full mixed response', () => {
    const input =
      'Avg recovery is **71** [c:WHOOP|team|2026-05-05]. ' +
      'Trend: [chart:Recovery 7d|WHOOP|recovery|7d]. ' +
      'Boats: [table:Boats|Name,Score|1V,72|2V,68]. ' +
      'Big win — keep it up!'
    const out = parseAIText(input)
    const kinds = out.map((p) => p.kind)
    expect(kinds).toContain('chip')
    expect(kinds).toContain('chart')
    expect(kinds).toContain('table')
    // Em-dash got sanitized
    const last = out[out.length - 1]
    if (last.kind === 'text') {
      expect(last.text).not.toContain('—')
      expect(last.text).toContain(', ')
    }
  })
})
