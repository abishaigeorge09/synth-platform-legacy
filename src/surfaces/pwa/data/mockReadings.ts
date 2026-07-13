import { APP_MOCK_ATHLETES, type AppMockAthlete } from './mockTeam'

/**
 * Wellness / biometric reading from a wearable or self-report. One per
 * athlete per day. Surfaces in the Quick Stats sheet, Attention page,
 * AthleteDetailPage wellness tab, and any future "what's coach reading?"
 * source-data view.
 *
 * Sources mirror the connectors listed on /app/coach/sources:
 *   WHOOP · Oura · Apple Health · Garmin · Strava · self-report
 *
 * `recovery` is normalized 0-100 across providers (the provider's own
 * native scale would live in a `raw` field — out of scope for demo).
 */
export type WellnessReading = {
  id: string
  athleteId: string
  /** ISO date YYYY-MM-DD */
  date: string
  recovery: number
  sleepHours: number
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent'
  /** Heart-rate variability, milliseconds (rolling 7-day ln-RMSSD) */
  hrv: number
  /** Resting heart rate, bpm */
  rhr: number
  /** Athlete-reported soreness, 1-10 (10 = wrecked) */
  soreness: number
  /** Athlete-reported energy, 1-10 (10 = sharp) */
  energy: number
  source: 'WHOOP' | 'Oura' | 'Apple Health' | 'Garmin' | 'Strava' | 'self-report'
  /** Optional flag — coach-flagged or auto-flagged for follow-up. */
  flagged?: boolean
  /** Optional one-line note attached to this reading. */
  note?: string
}

// ─── Hand-picked story-driving readings ─────────────────────────────────────
// Each of these matches a signal on the Attention page so the data tells
// the same story end-to-end.
export const APP_HANDPICKED_READINGS: WellnessReading[] = [
  // Olivia Roth — three short nights matches "Recovery 44 — 3 nights of poor sleep"
  {
    id: 'r-roth-1',
    athleteId: 'a-roth-olivia',
    date: dateNDaysAgo(1),
    recovery: 44,
    sleepHours: 5.4,
    sleepQuality: 'poor',
    hrv: 38,
    rhr: 62,
    soreness: 6,
    energy: 4,
    source: 'WHOOP',
    flagged: true,
    note: 'Third short night — message before practice.',
  },
  {
    id: 'r-roth-2',
    athleteId: 'a-roth-olivia',
    date: dateNDaysAgo(2),
    recovery: 48,
    sleepHours: 5.8,
    sleepQuality: 'poor',
    hrv: 40,
    rhr: 60,
    soreness: 5,
    energy: 5,
    source: 'WHOOP',
  },
  {
    id: 'r-roth-3',
    athleteId: 'a-roth-olivia',
    date: dateNDaysAgo(3),
    recovery: 51,
    sleepHours: 6.0,
    sleepQuality: 'fair',
    hrv: 42,
    rhr: 59,
    soreness: 4,
    energy: 6,
    source: 'WHOOP',
  },

  // Lola Crampin — volume jump signal: good sleep but creeping soreness
  {
    id: 'r-crampin-1',
    athleteId: 'a-crampin-lola',
    date: dateNDaysAgo(0),
    recovery: 58,
    sleepHours: 7.4,
    sleepQuality: 'good',
    hrv: 51,
    rhr: 58,
    soreness: 7,
    energy: 5,
    source: 'WHOOP',
    flagged: true,
    note: 'Soreness creeping after the volume spike.',
  },

  // Ella Wheeler — race-ready storyline: top erg, long streak
  {
    id: 'r-wheeler-1',
    athleteId: 'a-wheeler-ella',
    date: dateNDaysAgo(0),
    recovery: 88,
    sleepHours: 8.0,
    sleepQuality: 'excellent',
    hrv: 76,
    rhr: 49,
    soreness: 2,
    energy: 9,
    source: 'WHOOP',
  },

  // Andie Vega (cox) — race-day ready storyline that matches att-5
  {
    id: 'r-andie-1',
    athleteId: 'a-andie-vega',
    date: dateNDaysAgo(0),
    recovery: 84,
    sleepHours: 8.1,
    sleepQuality: 'excellent',
    hrv: 68,
    rhr: 54,
    soreness: 1,
    energy: 9,
    source: 'WHOOP',
    note: 'Race-day ready — calling V8 grand final.',
  },

  // Julia Irmler — moderate shoulder soreness after a heavy piece block
  {
    id: 'r-irmler-1',
    athleteId: 'a-irmler-julia',
    date: dateNDaysAgo(0),
    recovery: 71,
    sleepHours: 7.6,
    sleepQuality: 'good',
    hrv: 58,
    rhr: 55,
    soreness: 5,
    energy: 7,
    source: 'Oura',
    note: 'Left shoulder soreness — short-arming on stbd Tuesday.',
  },

  // Star Miller — solid, unremarkable. Stroke timing positive signal.
  {
    id: 'r-miller-1',
    athleteId: 'a-miller-star',
    date: dateNDaysAgo(0),
    recovery: 78,
    sleepHours: 7.8,
    sleepQuality: 'good',
    hrv: 62,
    rhr: 54,
    soreness: 3,
    energy: 8,
    source: 'WHOOP',
  },
]

// ─── Generated 14-day backfill ──────────────────────────────────────────────
// Hand-picked readings tell the story; the generator fills the rest of the
// timeline so charts and rolling averages have something real to plot.
function dateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function pseudoRand(seed: string, i: number): number {
  // Deterministic per-(athlete,day) noise so reloads are stable.
  let h = 0
  for (let k = 0; k < seed.length; k++) {
    h = (h * 31 + seed.charCodeAt(k)) | 0
  }
  h = (h + i * 2654435761) | 0
  return (Math.abs(h) % 1000) / 1000
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function buildAthleteBackfill(athlete: AppMockAthlete, days: number): WellnessReading[] {
  const baseRecovery = athlete.recoveryScore
  const isCox = athlete.side === 'X'
  const out: WellnessReading[] = []
  for (let i = 0; i < days; i++) {
    const date = dateNDaysAgo(i)
    const noise = pseudoRand(athlete.id, i)
    const recovery = clamp(Math.round(baseRecovery + (noise - 0.5) * 18), 28, 96)
    const sleepHours = clamp(7.4 + (noise - 0.5) * 2.4, 4.6, 9.4)
    const sleepQuality: WellnessReading['sleepQuality'] =
      sleepHours >= 8.2 ? 'excellent' : sleepHours >= 7.2 ? 'good' : sleepHours >= 6.0 ? 'fair' : 'poor'
    const hrv = clamp(Math.round(60 + (recovery - 70) * 0.5 + (noise - 0.5) * 14), 24, 92)
    const rhr = clamp(
      Math.round(54 + (75 - recovery) * 0.18 + (noise - 0.5) * 4),
      40,
      72,
    )
    const soreness = clamp(Math.round(5 - (recovery - 60) * 0.07 + (noise - 0.5) * 2), 1, 9)
    const energy = clamp(Math.round(6 + (recovery - 60) * 0.06 + (noise - 0.5) * 2), 2, 10)
    const sourceList: WellnessReading['source'][] =
      athlete.primarySource === 'WHOOP'
        ? ['WHOOP']
        : athlete.primarySource === 'Apple Health'
          ? ['Apple Health']
          : athlete.primarySource === 'Strava'
            ? ['Strava', 'self-report']
            : ['WHOOP', 'self-report']
    out.push({
      id: `r-${athlete.id}-${i}`,
      athleteId: athlete.id,
      date,
      recovery,
      sleepHours: Number(sleepHours.toFixed(1)),
      sleepQuality,
      hrv,
      rhr,
      soreness,
      energy,
      source: sourceList[i % sourceList.length],
      // Cox readings carry slightly less weight in coach surfaces — no flag.
      ...(isCox ? {} : {}),
    })
  }
  return out
}

/**
 * 14-day backfill across every athlete (rowers + coxswains) plus the
 * hand-picked entries layered on top, sorted newest-first.
 */
export const APP_MOCK_READINGS: WellnessReading[] = (() => {
  const backfill = APP_MOCK_ATHLETES.flatMap((a) => buildAthleteBackfill(a, 14))
  // Hand-picked readings replace the auto-generated entry for the same
  // (athlete, date) so the story-driving values win.
  const handpickedKeys = new Set(
    APP_HANDPICKED_READINGS.map((r) => `${r.athleteId}::${r.date}`),
  )
  const merged = [
    ...APP_HANDPICKED_READINGS,
    ...backfill.filter((r) => !handpickedKeys.has(`${r.athleteId}::${r.date}`)),
  ]
  return merged.sort((a, b) => b.date.localeCompare(a.date))
})()

// ─── Convenience selectors ──────────────────────────────────────────────────
export function getReadingsForAthlete(athleteId: string): WellnessReading[] {
  return APP_MOCK_READINGS.filter((r) => r.athleteId === athleteId)
}

export function getLatestReading(athleteId: string): WellnessReading | null {
  return getReadingsForAthlete(athleteId)[0] ?? null
}

export function getTeamAvgRecovery(): number {
  const today = APP_MOCK_READINGS.filter((r) => r.date === dateNDaysAgo(0))
  if (today.length === 0) return 0
  const sum = today.reduce((acc, r) => acc + r.recovery, 0)
  return Math.round(sum / today.length)
}

export function getFlaggedReadings(): WellnessReading[] {
  return APP_MOCK_READINGS.filter((r) => r.flagged)
}
