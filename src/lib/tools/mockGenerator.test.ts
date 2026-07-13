import { describe, it, expect } from 'vitest'
import { generateToolSpec, MockGenerationError } from '@lib/tools/mockGenerator'
import {
  STROKE_RATE_LOGGER,
  LINEUP_COMPARE,
  WELLNESS_SUMMARY,
  LAP_COUNTER,
  RACE_PLAN,
} from '@lib/tools/examples'

describe('generateToolSpec — keyword matching', () => {
  it('routes "stroke rate logger that pulls from concept2" to STROKE_RATE_LOGGER', () => {
    expect(generateToolSpec('stroke rate logger that pulls from concept2')).toBe(STROKE_RATE_LOGGER)
  })

  it('routes "compare boats" to LINEUP_COMPARE', () => {
    expect(generateToolSpec('compare boats')).toBe(LINEUP_COMPARE)
  })

  it('routes "wellness summary for the 1V" to WELLNESS_SUMMARY', () => {
    expect(generateToolSpec('wellness summary for the 1V')).toBe(WELLNESS_SUMMARY)
  })

  it('routes "lap counter" to LAP_COUNTER', () => {
    expect(generateToolSpec('lap counter')).toBe(LAP_COUNTER)
  })

  it('routes "race plan for Pacific Invite" to RACE_PLAN', () => {
    expect(generateToolSpec('race plan for Pacific Invite')).toBe(RACE_PLAN)
  })
})

describe('generateToolSpec — case insensitivity', () => {
  it('matches uppercase input', () => {
    expect(generateToolSpec('WELLNESS')).toBe(WELLNESS_SUMMARY)
  })

  it('matches mixed-case input', () => {
    expect(generateToolSpec('Lap Counter')).toBe(LAP_COUNTER)
  })
})

describe('generateToolSpec — keyword priority', () => {
  it('"stroke rate logger" matches before plain "rate"', () => {
    // "stroke rate" is listed before "rate" in RULES so the multi-word
    // phrase wins, not the substring fallback.
    expect(generateToolSpec('stroke rate logger')).toBe(STROKE_RATE_LOGGER)
  })

  it('"race plan" matches before plain "race"', () => {
    expect(generateToolSpec('race plan brief')).toBe(RACE_PLAN)
  })
})

describe('generateToolSpec — fallback', () => {
  it('returns STROKE_RATE_LOGGER for unmatched gibberish', () => {
    expect(generateToolSpec('asdfqwer xyzzy nonsense')).toBe(STROKE_RATE_LOGGER)
  })

  it('returns STROKE_RATE_LOGGER for an empty string', () => {
    expect(generateToolSpec('')).toBe(STROKE_RATE_LOGGER)
  })
})

describe('generateToolSpec — error path', () => {
  it('throws MockGenerationError when description contains "fail"', () => {
    expect(() => generateToolSpec('fail demo')).toThrow(MockGenerationError)
  })

  it('throws on uppercase "FAIL"', () => {
    expect(() => generateToolSpec('FAIL THIS')).toThrow(MockGenerationError)
  })

  it('does not throw on benign inputs that lack "fail"', () => {
    expect(() => generateToolSpec('stroke rate logger')).not.toThrow()
  })
})
