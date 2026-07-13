/**
 * YoY erg pairs sourced from rowiqWomensData.ERG_2K_YOY — 8 athletes who took
 * both the 2025-03-17 and 2026-03-16 tests. Used on AthleteProfilePage to
 * render progression deltas. The rest of the roster has a single data point.
 */
import { ERG_2K_YOY } from '@shared/data/prototype/rowiqWomensData'
import { SEED_ATHLETES } from '@shared/data/seeds/index'

function parseErgTime(time: string): number {
  const [m, s] = time.split(':')
  return parseInt(m, 10) * 60 + parseFloat(s)
}

export type AthleteYoyPair = {
  athleteId: string
  date2025: string
  date2026: string
  sec2025: number
  sec2026: number
  deltaSec: number
}

// Match the "E. Wheeler" shortName format back to an athlete by last-name.
function matchShortToAthlete(short: string) {
  const lastName = short.split('. ')[1]?.trim().toLowerCase()
  if (!lastName) return null
  return SEED_ATHLETES.find((a) => a.name.toLowerCase().endsWith(lastName)) ?? null
}

export const SEED_ATHLETE_YOY: AthleteYoyPair[] = ERG_2K_YOY.flatMap((pair) => {
  const athlete = matchShortToAthlete(pair.short)
  if (!athlete) return []
  return [
    {
      athleteId: athlete.id,
      date2025: '2025-03-17',
      date2026: '2026-03-16',
      sec2025: parseErgTime(pair.y2025),
      sec2026: parseErgTime(pair.y2026),
      deltaSec: pair.deltaSec,
    },
  ]
})

export function getYoyFor(athleteId: string) {
  return SEED_ATHLETE_YOY.find((p) => p.athleteId === athleteId) ?? null
}
