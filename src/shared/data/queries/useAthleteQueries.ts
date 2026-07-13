/**
 * Athlete roster + erg score queries. Swap internals for Supabase hooks later.
 */
import { useMemo } from 'react'
import { useStaticQuery } from '@shared/data/queries/useStaticQuery'
import { SEED_ATHLETES, SEED_ERG_SCORES } from '@shared/data/seeds'
import { getYoyFor, SEED_ATHLETE_YOY } from '@shared/data/seeds/athleteExtras'

export function useAthletes() {
  return useStaticQuery(SEED_ATHLETES)
}

export function useAthlete(athleteId: string) {
  const athlete = useMemo(
    () => SEED_ATHLETES.find((a) => a.id === athleteId) ?? null,
    [athleteId],
  )
  return useStaticQuery(athlete)
}

export function useErgScores() {
  return useStaticQuery(SEED_ERG_SCORES)
}

export function useErgScoreForAthlete(athleteId: string) {
  const score = useMemo(
    () => SEED_ERG_SCORES.find((e) => e.athleteId === athleteId) ?? null,
    [athleteId],
  )
  return useStaticQuery(score)
}

export function useAthleteYoy(athleteId: string) {
  return useStaticQuery(getYoyFor(athleteId))
}

export function useAllAthleteYoy() {
  return useStaticQuery(SEED_ATHLETE_YOY)
}
