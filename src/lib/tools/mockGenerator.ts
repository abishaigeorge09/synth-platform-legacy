/**
 * Mock generator — keyword matcher that maps a chat description to one of
 * the 5 example specs. Sprint 4 only.
 *
 * Sprint 9 swaps this for a real Edge Function call to the v0 Platform
 * API. The signature stays `(description: string) => ToolSpec` so the
 * UI doesn't change. Async transition lands when Sprint 9 promotes the
 * return type to `Promise<ToolSpec>`.
 *
 * Matching is linear and first-match-wins. Multi-word phrases are listed
 * before their substrings (e.g. "stroke rate" before "rate") so a query
 * like "stroke rate logger" hits the right rule deterministically.
 */
import type { ToolSpec } from './schema'
import {
  STROKE_RATE_LOGGER,
  LINEUP_COMPARE,
  WELLNESS_SUMMARY,
  LAP_COUNTER,
  RACE_PLAN,
} from './examples'

type Rule = { keyword: string; spec: ToolSpec }

const RULES: Rule[] = [
  // Multi-word and high-specificity phrases first.
  { keyword: 'stroke rate', spec: STROKE_RATE_LOGGER },
  { keyword: 'race plan', spec: RACE_PLAN },
  { keyword: 'concept2', spec: STROKE_RATE_LOGGER },
  { keyword: 'regatta', spec: RACE_PLAN },
  // Lineup-compare cluster
  { keyword: 'lineup', spec: LINEUP_COMPARE },
  { keyword: 'compare', spec: LINEUP_COMPARE },
  { keyword: 'boat', spec: LINEUP_COMPARE },
  // Wellness cluster
  { keyword: 'wellness', spec: WELLNESS_SUMMARY },
  { keyword: 'recovery', spec: WELLNESS_SUMMARY },
  { keyword: 'sleep', spec: WELLNESS_SUMMARY },
  { keyword: 'hrv', spec: WELLNESS_SUMMARY },
  // Lap counter cluster
  { keyword: 'lap', spec: LAP_COUNTER },
  { keyword: 'stopwatch', spec: LAP_COUNTER },
  { keyword: 'timer', spec: LAP_COUNTER },
  // Less-specific fallbacks last so the multi-word phrases above win.
  { keyword: 'race', spec: RACE_PLAN },
  { keyword: 'rate', spec: STROKE_RATE_LOGGER },
]

export function generateToolSpec(description: string): ToolSpec {
  const q = description.toLowerCase()
  for (const rule of RULES) {
    if (q.includes(rule.keyword)) return rule.spec
  }
  return STROKE_RATE_LOGGER
}
