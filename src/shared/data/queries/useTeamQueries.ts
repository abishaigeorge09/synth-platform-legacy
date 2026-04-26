/**
 * Team + coach identity queries. Swap internals for Supabase hooks later.
 */
import { useMemo } from 'react'
import { useStaticQuery } from './useStaticQuery'
import {
  SEED_COACH,
  SEED_TEAM_CAL_MENS,
  SEED_ATHLETES_ALL,
  SEED_SOURCES_ALL,
  SEED_ALERTS,
} from '../seeds'
import { ROWIQ_SHEET_316_DATE } from '../rowiqWomensData'
import { useTeamStore } from '../../store/useTeamStore'

export function useTeam() {
  const team = useTeamStore((s) => s.activeTeam)
  return useStaticQuery(team)
}

export function useCoach() {
  return useStaticQuery(SEED_COACH)
}

export function useTeamStats() {
  const teamId = useTeamStore((s) => s.activeTeam.id)
  const stats = useMemo(() => {
    const athletes = SEED_ATHLETES_ALL.filter((a) => a.teamId === teamId)
    const sources = SEED_SOURCES_ALL.filter((s) => s.teamId === teamId)
    const alerts = SEED_ALERTS.filter((a) => a.teamId === teamId)
    const latestErgDate =
      teamId === SEED_TEAM_CAL_MENS.id ? '2026-04-10' : ROWIQ_SHEET_316_DATE
    return {
      rosterCount: athletes.length,
      latestErgDate,
      activeSourcesCount: sources.filter((s) => s.status === 'healthy').length,
      pendingSyncs: 0,
      activeAlerts: alerts.length,
      trainingLoad: 6.8,
      avgRecovery: 71,
    }
  }, [teamId])
  return useStaticQuery(stats)
}
