/**
 * Alerts + activity feed queries. Swap internals for Supabase hooks later.
 */
import { useStaticQuery } from '@shared/data/queries/useStaticQuery'
import { SEED_ALERTS, SEED_ACTIVITY, SEED_SESSIONS } from '@shared/data/seeds'

export function useAlerts() {
  return useStaticQuery(SEED_ALERTS)
}

export function useActivity() {
  return useStaticQuery(SEED_ACTIVITY)
}

export function useSessions() {
  return useStaticQuery(SEED_SESSIONS)
}
