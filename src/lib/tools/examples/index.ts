import type { ToolSpec } from '../schema'
import { STROKE_RATE_LOGGER } from './strokeRateLogger'
import { LINEUP_COMPARE } from './lineupCompare'
import { WELLNESS_SUMMARY } from './wellnessSummary'
import { LAP_COUNTER } from './lapCounter'
import { RACE_PLAN } from './racePlan'

export {
  STROKE_RATE_LOGGER,
  LINEUP_COMPARE,
  WELLNESS_SUMMARY,
  LAP_COUNTER,
  RACE_PLAN,
}

export const EXAMPLES: ToolSpec[] = [
  STROKE_RATE_LOGGER,
  LINEUP_COMPARE,
  WELLNESS_SUMMARY,
  LAP_COUNTER,
  RACE_PLAN,
]
