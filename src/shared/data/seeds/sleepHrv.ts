/**
 * 14 days of sleep + HRV data (April 11–24, 2026) for the first 10 athletes.
 *
 * Star Miller (athlete-miller-star, index 3) has HRV trending DOWN ~10%
 * over the two-week window — a pattern the dashboard should flag.
 * Most other athletes are stable or slightly improving.
 */
import type { SleepHrvEntry } from '../types'

// ── Helpers ────────────────────────────────────────────────────────────────

const DATES = Array.from({ length: 14 }, (_, i) => {
  const d = 11 + i // April 11 … 24
  return `2026-04-${String(d).padStart(2, '0')}`
})

const ATHLETE_IDS = [
  'athlete-wheeler-ella',     // 0
  'athlete-irmler-julia',     // 1
  'athlete-abbott-lily',      // 2
  'athlete-miller-star',      // 3  ← HRV decline
  'athlete-roth-olivia',      // 4
  'athlete-cox-madeline',     // 5
  'athlete-bouman-minou',     // 6
  'athlete-crampin-lola',     // 7
  'athlete-johnson-charly',   // 8
  'athlete-bosio-giulia',     // 9
]

type AthleteProfile = {
  baseHrv: number
  hrvTrend: 'declining' | 'stable' | 'improving'
  baseRestHR: number
  baseSleep: number
  baseSleepQuality: number
}

const PROFILES: AthleteProfile[] = [
  { baseHrv: 62, hrvTrend: 'stable',    baseRestHR: 52, baseSleep: 7.5, baseSleepQuality: 7 },
  { baseHrv: 58, hrvTrend: 'improving', baseRestHR: 54, baseSleep: 7.8, baseSleepQuality: 8 },
  { baseHrv: 65, hrvTrend: 'stable',    baseRestHR: 50, baseSleep: 8.0, baseSleepQuality: 8 },
  { baseHrv: 60, hrvTrend: 'declining', baseRestHR: 55, baseSleep: 7.0, baseSleepQuality: 6 }, // Star Miller
  { baseHrv: 55, hrvTrend: 'stable',    baseRestHR: 56, baseSleep: 7.2, baseSleepQuality: 7 },
  { baseHrv: 63, hrvTrend: 'improving', baseRestHR: 51, baseSleep: 7.6, baseSleepQuality: 7 },
  { baseHrv: 57, hrvTrend: 'stable',    baseRestHR: 58, baseSleep: 7.4, baseSleepQuality: 7 },
  { baseHrv: 61, hrvTrend: 'stable',    baseRestHR: 53, baseSleep: 7.7, baseSleepQuality: 8 },
  { baseHrv: 54, hrvTrend: 'improving', baseRestHR: 57, baseSleep: 7.1, baseSleepQuality: 6 },
  { baseHrv: 59, hrvTrend: 'stable',    baseRestHR: 54, baseSleep: 7.3, baseSleepQuality: 7 },
]

/**
 * Deterministic pseudo-random variation seeded by athlete + day index so the
 * data is stable across hot-reloads but still looks organic.
 */
function jitter(athleteIdx: number, dayIdx: number, range: number): number {
  const hash = ((athleteIdx * 17 + dayIdx * 31) % 97) / 97 // 0-1
  return (hash - 0.5) * 2 * range // ±range
}

function clamp(v: number, lo: number, hi: number) {
  return Math.round(Math.min(hi, Math.max(lo, v)) * 10) / 10
}

function buildEntries(): SleepHrvEntry[] {
  const entries: SleepHrvEntry[] = []

  for (let a = 0; a < ATHLETE_IDS.length; a++) {
    const p = PROFILES[a]!
    for (let d = 0; d < DATES.length; d++) {
      const dayFraction = d / 13 // 0 … 1

      // HRV trend: declining loses ~10%, improving gains ~8%, stable ±2%
      let hrvShift = 0
      if (p.hrvTrend === 'declining') hrvShift = -p.baseHrv * 0.10 * dayFraction
      else if (p.hrvTrend === 'improving') hrvShift = p.baseHrv * 0.08 * dayFraction

      const hrv = clamp(p.baseHrv + hrvShift + jitter(a, d, 3), 30, 80)

      // Sleep degrades slightly when HRV is declining
      const sleepDelta = p.hrvTrend === 'declining' ? -0.5 * dayFraction : 0
      const sleepHours = clamp(p.baseSleep + sleepDelta + jitter(a, d, 0.5), 5.5, 9.5)

      const sleepQuality = clamp(
        p.baseSleepQuality + (p.hrvTrend === 'declining' ? -2 * dayFraction : 0) + jitter(a, d, 1),
        1,
        10,
      )

      // Resting HR rises when HRV drops
      const restingHR = clamp(
        p.baseRestHR + (p.hrvTrend === 'declining' ? 3 * dayFraction : 0) + jitter(a, d, 2),
        45,
        70,
      )

      entries.push({
        id: `shrv-${a}-${d}`,
        athleteId: ATHLETE_IDS[a]!,
        date: DATES[d]!,
        sleepHours,
        sleepQuality: Math.round(sleepQuality),
        hrvMs: hrv,
        restingHR: Math.round(restingHR),
      })
    }
  }

  return entries
}

export const SEED_SLEEP_HRV: SleepHrvEntry[] = buildEntries()
