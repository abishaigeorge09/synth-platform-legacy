import {
  ERG_2K_YOY,
  ERG_316_2K,
  ROWIQ_SHEET_316_DATE,
} from '../rowiqWomensData'
import type { AthleteSessionRow, SparklinePoint, SynthAthleteCard, WorkoutCategory } from './model'
import { parseTimeToSec } from './formatters'

const SEASON_SESSIONS: { date: string; workoutName: string; cat: WorkoutCategory }[] = [
  { date: '2025-09-15', workoutName: '2×6k', cat: 'steady_state' },
  { date: '2025-09-19', workoutName: '6k', cat: 'steady_state' },
  { date: '2025-09-29', workoutName: '2×6k', cat: 'steady_state' },
  { date: '2025-10-13', workoutName: '2×6k', cat: 'steady_state' },
  { date: '2025-10-20', workoutName: '30′', cat: 'steady_state' },
  { date: '2025-10-27', workoutName: '3×12′', cat: 'threshold' },
  { date: '2026-01-13', workoutName: '6k', cat: 'steady_state' },
  { date: '2026-01-26', workoutName: '2×6k', cat: 'steady_state' },
  { date: '2026-01-30', workoutName: '6k', cat: 'steady_state' },
  { date: '2026-02-17', workoutName: '9×2k', cat: 'intervals' },
  { date: '2026-02-23', workoutName: '4×1k', cat: 'intervals' },
  { date: '2026-03-11', workoutName: '2×6k', cat: 'steady_state' },
  { date: '2026-03-16', workoutName: '2k test', cat: 'threshold' },
]

function slugId(lastFirst: string): string {
  return lastFirst
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function shortName(lastFirst: string): string {
  const [last, first] = lastFirst.split(', ').map((x) => x.trim())
  if (!first || !last) return lastFirst
  return `${first[0]}. ${last}`
}

function yoYDeltaFor(lastFirst: string): { delta: number; trend: 'improving' | 'declining' | 'stable' } {
  const sn = shortName(lastFirst)
  const row = ERG_2K_YOY.find((y) => y.short === sn)
  if (!row) return { delta: 0, trend: 'stable' }
  const d = row.deltaSec
  if (Math.abs(d) < 0.2) return { delta: d, trend: 'stable' }
  return { delta: d, trend: d < 0 ? 'improving' : 'declining' }
}

function syntheticSessions(
  id: string,
  base2k: number,
  rate: number,
  rank: number,
  rosterSize: number
): AthleteSessionRow[] {
  return SEASON_SESSIONS.map((row, i) => {
    const seed = hashSeed(`${id}-${i}`)
    const jitter = ((seed % 23) - 11) * 0.4
    const isLast = row.date === '2026-03-16'
    const splitSec = isLast
      ? Math.round(base2k * 10) / 10
      : Math.round((base2k + jitter + (i * 0.15 - 1)) * 10) / 10
    const spm = Math.max(26, Math.min(40, rate + ((seed >> 3) % 5) - 2))
    const rnk = Math.max(1, Math.min(rosterSize, rank + ((seed >> 5) % 5) - 2))
    return {
      sessionId: row.date,
      date: row.date,
      workoutName: row.workoutName,
      workoutCategory: row.cat,
      side: rank <= rosterSize / 2 ? 'groupA' : 'groupB',
      splitSec,
      spm,
      rank: rnk,
      of: rosterSize,
    }
  })
}

function sparklineFromSessions(sessions: AthleteSessionRow[]): SparklinePoint[] {
  const last5 = sessions.slice(-5)
  return last5.map((s) => ({ date: s.date, splitSec: s.splitSec }))
}

function categoryBreakdown(sessions: AthleteSessionRow[]): SynthAthleteCard['categoryBreakdown'] {
  const cats: WorkoutCategory[] = ['steady_state', 'intervals', 'threshold', 'triathlon']
  const out: SynthAthleteCard['categoryBreakdown'] = {}
  for (const c of cats) {
    const sub = sessions.filter((s) => s.workoutCategory === c)
    const avg =
      sub.length === 0
        ? null
        : sub.reduce((a, b) => a + b.splitSec, 0) / sub.length
    out[c] = { sessions: sub.length, avgSplitSec: avg === null ? null : Math.round(avg * 10) / 10 }
  }
  return out
}

/** Build card athletes from 316 2k table: rank by time, synthetic season sessions for charts/tabs. */
export function buildRowiqAthletes(): SynthAthleteCard[] {
  const sorted = [...ERG_316_2K].sort((a, b) => parseTimeToSec(a.time) - parseTimeToSec(b.time))
  const rosterSize = sorted.length

  return sorted.map((row, idx) => {
    const id = slugId(row.lastFirst)
    const base2k = parseTimeToSec(row.time)
    const { delta, trend } = yoYDeltaFor(row.lastFirst)
    const sessions = syntheticSessions(id, base2k, row.rate, idx + 1, rosterSize)
    const best = sessions.reduce((a, b) => (a.splitSec < b.splitSec ? a : b))
    const sparklineData = sparklineFromSessions(sessions)
    const variance =
      sessions.reduce((s, x) => s + (x.splitSec - base2k) ** 2, 0) / Math.max(1, sessions.length)
    const consistency = Math.max(55, Math.min(99, Math.round(100 - Math.sqrt(variance) * 2)))

    return {
      id,
      name: shortName(row.lastFirst),
      fullName: row.lastFirst,
      group: idx < rosterSize / 2 ? 'A' : 'B',
      rank: idx + 1,
      avgSplitSec: base2k,
      bestSplitSec: best.splitSec,
      bestSplitDate: best.date,
      sessionCount: sessions.length,
      trend,
      trendDeltaSec: delta,
      consistency,
      categoryBreakdown: categoryBreakdown(sessions),
      sparklineData,
      sessions,
      watts316: row.watts,
      rate316: row.rate,
      twoKDisplay: row.time,
      note: row.note,
    }
  })
}

export const ROWIQ_CARD_ATHLETES: SynthAthleteCard[] = buildRowiqAthletes()

export const TEAM_AVG_2K_SEC =
  Math.round((ROWIQ_CARD_ATHLETES.reduce((s, a) => s + a.avgSplitSec, 0) / ROWIQ_CARD_ATHLETES.length) * 10) / 10

export const ANCHOR_DATE_316 = ROWIQ_SHEET_316_DATE
