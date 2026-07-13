import type { ToolSpec } from '@lib/tools/schema'
import { STROKE_RATE_LOGGER } from '@lib/tools/examples/strokeRateLogger'
import { LINEUP_COMPARE } from '@lib/tools/examples/lineupCompare'
import { WELLNESS_SUMMARY } from '@lib/tools/examples/wellnessSummary'
import { LAP_COUNTER } from '@lib/tools/examples/lapCounter'
import { RACE_PLAN } from '@lib/tools/examples/racePlan'
import { PACIFIC_BOAT_RACE } from '@lib/tools/examples/pacificBoatRace'

export {
  STROKE_RATE_LOGGER,
  LINEUP_COMPARE,
  WELLNESS_SUMMARY,
  LAP_COUNTER,
  RACE_PLAN,
  PACIFIC_BOAT_RACE,
}

export const EXAMPLES: ToolSpec[] = [
  STROKE_RATE_LOGGER,
  LINEUP_COMPARE,
  WELLNESS_SUMMARY,
  LAP_COUNTER,
  RACE_PLAN,
  PACIFIC_BOAT_RACE,
]
