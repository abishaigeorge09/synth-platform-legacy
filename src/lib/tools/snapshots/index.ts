import type { ResolvedBindings } from '@lib/tools/resolver'
import { STROKE_RATE_LOGGER_DATA } from '@lib/tools/snapshots/strokeRateLogger'
import { LINEUP_COMPARE_DATA } from '@lib/tools/snapshots/lineupCompare'
import { WELLNESS_SUMMARY_DATA } from '@lib/tools/snapshots/wellnessSummary'
import { LAP_COUNTER_DATA } from '@lib/tools/snapshots/lapCounter'
import { RACE_PLAN_DATA } from '@lib/tools/snapshots/racePlan'
import { PACIFIC_BOAT_RACE_DATA } from '@lib/tools/snapshots/pacificBoatRace'

export {
  STROKE_RATE_LOGGER_DATA,
  LINEUP_COMPARE_DATA,
  WELLNESS_SUMMARY_DATA,
  LAP_COUNTER_DATA,
  RACE_PLAN_DATA,
  PACIFIC_BOAT_RACE_DATA,
}

/**
 * Mock binding data, keyed by `ToolSpec.id`. The resolver looks up against
 * this map in Sprint 3. Sprint 9 swaps the resolver internals for live
 * Supabase queries reading from `connector_accounts` + `source_data`.
 */
export const MOCK_SNAPSHOTS: Record<string, ResolvedBindings> = {
  'stroke-rate-logger': STROKE_RATE_LOGGER_DATA,
  'lineup-compare': LINEUP_COMPARE_DATA,
  'wellness-summary': WELLNESS_SUMMARY_DATA,
  'lap-counter': LAP_COUNTER_DATA,
  'race-plan': RACE_PLAN_DATA,
  'pacific-boat-race': PACIFIC_BOAT_RACE_DATA,
}
