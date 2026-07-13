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
export { useStaticQuery } from '@shared/data/queries/useStaticQuery'
export type { StaticQueryResult } from '@shared/data/queries/useStaticQuery'

// Team + identity
export { useTeam, useCoach, useTeamStats } from '@shared/data/queries/useTeamQueries'

// Athletes + erg scores
export {
  useAthletes,
  useAthlete,
  useErgScores,
  useErgScoreForAthlete,
  useAthleteYoy,
  useAllAthleteYoy,
} from '@shared/data/queries/useAthleteQueries'

// Athlete profile extras (sessions, wellness, lineups, notes)
export {
  useAthleteProfileSessions,
  useAthleteProfileLineups,
  useAthleteWellness,
  useAthleteCoachNotes,
  getAthleteRecovery,
  isAthleteFlagged,
} from '@shared/data/queries/useAthleteProfileExtras'

// Sources + scan logs
export {
  useSources,
  useScanLogs,
  useScanLogsForSource,
  useLatestScanForSource,
} from '@shared/data/queries/useSourceQueries'

// Alerts + activity + sessions
export { useAlerts, useActivity, useSessions } from '@shared/data/queries/useActivityQueries'

// Dashboard aggregations
export { useMonthlyTrends, useAiInsight } from '@shared/data/queries/useDashboardQueries'

// Lineups
export { usePublishedLineups, makeEmptyBoat } from '@shared/data/queries/useLineupQueries'
export type { SeatAssignment, BoatLineup, PublishedLineup } from '@shared/data/queries/useLineupQueries'

// Timeline + connectors + AI import (SCHEMA §9)
export { useTimelineEvents, useTimelineForAthlete } from '@shared/data/queries/useTimelineQueries'
export { useConnectorAccounts } from '@shared/data/queries/useConnectorAccountsQuery'
export { useAiImportJobs } from '@shared/data/queries/useAiImportQueries'

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
} from '@shared/data/queries/useDemoAthleteQueries'

// Ingestion (file uploads → confirmed events). Empty in demo mode;
// populated when the coach is signed in to a real Supabase project.
export {
  useSourceUploads,
  useIngestedEventsForAthlete,
  useIngestedEventsForTeam,
} from '@shared/data/queries/useIngestionQueries'
