import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  parseToolSpec,
  safeParseToolSpec,
  type ToolElement,
  type ToolSpec,
} from '@lib/tools/schema'
import { EXAMPLES } from '@lib/tools/examples'

// Each test does its own JSON.parse(JSON.stringify(...)) to defend against
// mutation across tests. Round-tripping through JSON also catches anything
// that's not actually JSON-safe (Dates, undefineds, bigints, etc.).

function clone(spec: ToolSpec): unknown {
  return JSON.parse(JSON.stringify(spec))
}

describe('ToolSpec — example round-trips', () => {
  for (const spec of EXAMPLES) {
    it(`${spec.id} parses cleanly from JSON`, () => {
      const json = clone(spec)
      const parsed = parseToolSpec(json)
      expect(parsed).toEqual(spec)
    })
  }
})

describe('ToolSpec — coverage across examples', () => {
  it('uses every one of the 14 element types at least once', () => {
    const seen = new Set<ToolElement['type']>()
    for (const spec of EXAMPLES) {
      // Sprint 5.8 — examples may be multi-page. Coverage scans every
      // element across both top-level `elements` and any pages.
      for (const el of spec.elements) seen.add(el.type)
      for (const page of spec.pages ?? []) {
        for (const el of page.elements) seen.add(el.type)
      }
    }
    const expected: ToolElement['type'][] = [
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
    ]
    for (const type of expected) {
      expect(seen.has(type), `missing element type: ${type}`).toBe(true)
    }
    expect(seen.size).toBe(14)
  })
})

describe('ToolSpec — negative cases', () => {
  function bad(mutator: (spec: Record<string, unknown>) => void): unknown {
    const j = clone(EXAMPLES[0]) as Record<string, unknown>
    mutator(j)
    return j
  }

  it('throws when id is missing', () => {
    const input = bad((s) => {
      delete s.id
    })
    expect(() => parseToolSpec(input)).toThrow(z.ZodError)
  })

  // Sprint 5.7 — schema_version: 2 is now valid (boat_race element).
  // The negative case asserts only versions outside {1, 2} throw.
  it('throws when schema_version is outside the supported range', () => {
    const input = bad((s) => {
      s.schema_version = 3
    })
    expect(() => parseToolSpec(input)).toThrow(z.ZodError)
  })

  it('throws when an element has an unknown type', () => {
    const input = bad((s) => {
      ;(s.elements as Record<string, unknown>[])[0] = {
        type: 'unknown',
        label: 'x',
      }
    })
    expect(() => parseToolSpec(input)).toThrow(z.ZodError)
  })

  it('throws when an element width is invalid', () => {
    const input = bad((s) => {
      ;(s.elements as Record<string, unknown>[])[0].width = 'quarter'
    })
    expect(() => parseToolSpec(input)).toThrow(z.ZodError)
  })

  it('throws when scope is not one of the three values', () => {
    const input = bad((s) => {
      s.scope = 'coach'
    })
    expect(() => parseToolSpec(input)).toThrow(z.ZodError)
  })

  it('throws when a binding source is unknown', () => {
    const input = bad((s) => {
      const bindings = s.bindings as Record<string, { source: string; params: unknown }>
      const firstKey = Object.keys(bindings)[0]
      bindings[firstKey].source = 'unknown_source'
    })
    expect(() => parseToolSpec(input)).toThrow(z.ZodError)
  })
})

describe('ToolSpec — schema_version union', () => {
  // Sprint 5.7 — backwards-compat assertion. v1 specs (the original five
  // examples) and v2 specs (Pacific Boat Race) must both parse through
  // the same parser without modification.
  it('accepts schema_version: 1', () => {
    const input = clone(EXAMPLES.find((s) => s.schema_version === 1)!)
    expect(() => parseToolSpec(input)).not.toThrow()
  })

  it('accepts schema_version: 2', () => {
    const input = clone(EXAMPLES.find((s) => s.schema_version === 2)!)
    expect(() => parseToolSpec(input)).not.toThrow()
  })
})

describe('safeParseToolSpec', () => {
  it('returns success for a valid spec', () => {
    const r = safeParseToolSpec(clone(EXAMPLES[0]))
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.id).toBe(EXAMPLES[0].id)
  })

  it('returns failure with a ZodError for an invalid spec', () => {
    const r = safeParseToolSpec({})
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error).toBeInstanceOf(z.ZodError)
  })
})
