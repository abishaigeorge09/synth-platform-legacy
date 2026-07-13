/**
 * Demo athlete queries — the athlete-side "current user" data.
 * In production these become auth-scoped queries on the signed-in athlete.
 */
import { useStaticQuery } from '@shared/data/queries/useStaticQuery'
import {
  DEMO_ATHLETE,
  DEMO_ATHLETE_ERG,
  DEMO_ATHLETE_YOY,
  DEMO_ATHLETE_TEAMMATES,
  DEMO_ATHLETE_SESSIONS,
  DEMO_ATHLETE_LINEUPS,
  DEMO_ATHLETE_PERSONAL_SOURCES,
  DEMO_TEAM,
  DEMO_COACH,
} from '@shared/data/seeds/demoAthlete'

export function useDemoAthlete() {
  return useStaticQuery(DEMO_ATHLETE)
}

export function useDemoAthleteErg() {
  return useStaticQuery(DEMO_ATHLETE_ERG)
}

export function useDemoAthleteYoy() {
  return useStaticQuery(DEMO_ATHLETE_YOY)
}

export function useDemoAthleteTeammates() {
  return useStaticQuery(DEMO_ATHLETE_TEAMMATES)
}

export function useDemoAthleteSessions() {
  return useStaticQuery(DEMO_ATHLETE_SESSIONS)
}

export function useDemoAthleteLineups() {
  return useStaticQuery(DEMO_ATHLETE_LINEUPS)
}

export function useDemoAthletePersonalSources() {
  return useStaticQuery(DEMO_ATHLETE_PERSONAL_SOURCES)
}

export function useDemoTeam() {
  return useStaticQuery(DEMO_TEAM)
}

export function useDemoCoach() {
  return useStaticQuery(DEMO_COACH)
}
