import { describe, it, expect } from 'vitest'
import { ELEMENT_RENDERERS } from './registry'
import type { ToolElement } from './schema'

const EXPECTED_TYPES: ToolElement['type'][] = [
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
]

describe('ELEMENT_RENDERERS', () => {
  it('exposes a renderer for every one of the 13 ToolElement types', () => {
    const keys = Object.keys(ELEMENT_RENDERERS).sort()
    expect(keys).toEqual([...EXPECTED_TYPES].sort())
  })

  it('has 13 entries, no extras', () => {
    expect(Object.keys(ELEMENT_RENDERERS)).toHaveLength(13)
  })

  it('every entry is a function (component)', () => {
    for (const type of EXPECTED_TYPES) {
      expect(typeof ELEMENT_RENDERERS[type]).toBe('function')
    }
  })
})
