/**
 * Query hooks — the data access layer for the feature components.
 *
 * Today each hook wraps seed data via `useStaticQuery` (synchronous, no
 * network). When @tanstack/react-query + Supabase land:
 *
 *   1. `npm install @tanstack/react-query`
 *   2. Replace `useStaticQuery` calls with `useQuery(...)` pointing at
 *      Supabase RPCs / `.from()` calls.
 *   3. Add `<QueryClientProvider>` in App.tsx.
 *   4. Feature components stay unchanged — they already destructure
 *      `{ data, isLoading, isError }` from these hooks.
 *
 * Consumers import from here:
 *   import { useAthletes, useTeamStats } from '@/shared/data/queries'
 */

// Shim
export { useStaticQuery } from './useStaticQuery'
export type { StaticQueryResult } from './useStaticQuery'

// Team + identity
export { useTeam, useCoach, useTeamStats } from './useTeamQueries'

// Athletes + erg scores
export {
  useAthletes,
  useAthlete,
  useErgScores,
  useErgScoreForAthlete,
  useAthleteYoy,
  useAllAthleteYoy,
} from './useAthleteQueries'

// Sources + scan logs
export {
  useSources,
  useScanLogs,
  useScanLogsForSource,
  useLatestScanForSource,
} from './useSourceQueries'

// Alerts + activity + sessions
export { useAlerts, useActivity, useSessions } from './useActivityQueries'

// Dashboard aggregations
export { useMonthlyTrends, useAiInsight } from './useDashboardQueries'

// Lineups
export { usePublishedLineups, makeEmptyBoat } from './useLineupQueries'
export type { SeatAssignment, BoatLineup, PublishedLineup } from './useLineupQueries'

// Timeline + connectors + AI import (SCHEMA §9)
export { useTimelineEvents, useTimelineForAthlete } from './useTimelineQueries'
export { useConnectorAccounts } from './useConnectorAccountsQuery'
export { useAiImportJobs } from './useAiImportQueries'

// Demo athlete (athlete-side current user)
export {
  useDemoAthlete,
  useDemoAthleteErg,
  useDemoAthleteYoy,
  useDemoAthleteTeammates,
  useDemoAthleteSessions,
  useDemoAthleteLineups,
  useDemoAthletePersonalSources,
  useDemoTeam,
  useDemoCoach,
} from './useDemoAthleteQueries'
