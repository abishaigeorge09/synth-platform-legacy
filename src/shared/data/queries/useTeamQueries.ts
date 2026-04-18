/**
 * Team + coach identity queries. Swap internals for Supabase hooks later.
 */
import { useStaticQuery } from './useStaticQuery'
import { SEED_TEAM_CAL_WOMENS, SEED_COACH, SEED_TEAM_STATS } from '../seeds'

export function useTeam() {
  return useStaticQuery(SEED_TEAM_CAL_WOMENS)
}

export function useCoach() {
  return useStaticQuery(SEED_COACH)
}

export function useTeamStats() {
  return useStaticQuery(SEED_TEAM_STATS)
}
