/**
 * All athlete data is derived from the real Pacific Women's Rowing 2025-26 erg
 * workbook (ERG_316_2K — 2026-03-16 benchmark test).
 * Wellness, volume, and recovery fields are deterministically generated from
 * each athlete's erg performance so the data is stable across reloads.
 */
import { ERG_316_2K } from '@shared/data/prototype/rowiqWomensData'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppMockAthlete = {
  id: string
  name: string
  initials: string
  position: string
  side: 'P' | 'S' | 'X'
  preferredSeat?: 'stroke' | 'bow' | 'middle' | 'cox' | 'any'
  recoveryScore: number
  twoKBestSeconds: number
  twoKAvg30dSeconds: number
  weeklyVolumeMeters: number
  streakDays: number
  lastSyncMinutes: number
  primarySource: string
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export const APP_MOCK_TEAM = {
  id: 'team-cal-w-rowing',
  name: "Pacific Women's Rowing",
  sport: 'rowing' as const,
  athleteCount: 46,
  activeToday: 38,
  avgRecovery: 71,
  attentionCount: 10,
  sessionsToday: 24,
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export type AppScheduleItem = {
  id: string
  when: string
  iconLetter: string
  category: 'lineup' | 'race' | 'practice' | 'attendance' | 'meeting'
  headline: string
  detail: string
  provenance: string
  severity: 'high' | 'med' | 'low'
}

export const APP_MOCK_SCHEDULE: AppScheduleItem[] = [
  {
    id: 'sch-lineup-tomorrow',
    when: 'Tomorrow',
    iconLetter: 'LU',
    category: 'lineup',
    headline: 'V8 lineup posted for AM practice',
    detail: 'Stroke seat change — Irmler → Wheeler. Confirm before 10pm.',
    provenance: 'Lineups · just now',
    severity: 'med',
  },
  {
    id: 'sch-race-saturday',
    when: 'Sat',
    iconLetter: 'RC',
    category: 'race',
    headline: 'Pacific Invite Regatta — race day',
    detail: 'V8 + V4+ entries · report time 5:30 AM · 3 days out',
    provenance: 'Google Calendar · 8m ago',
    severity: 'high',
  },
  {
    id: 'sch-attendance',
    when: 'Yesterday',
    iconLetter: 'AB',
    category: 'attendance',
    headline: '2 athletes missed AM practice',
    detail: 'Marisol Ulverton (excused) · Odile Ashcombe (no notice)',
    provenance: 'TeamWorks · 2h ago',
    severity: 'med',
  },
  {
    id: 'sch-time-trial',
    when: 'Thu',
    iconLetter: 'TT',
    category: 'practice',
    headline: '2K time trials for V8 selection',
    detail: '6:00 AM water session · 4 seats open',
    provenance: 'TrainingPeaks · 1h ago',
    severity: 'med',
  },
  {
    id: 'sch-meeting',
    when: 'Tonight',
    iconLetter: 'MT',
    category: 'meeting',
    headline: 'Coaches meeting · 6:00 PM',
    detail: 'Race-day strategy + bow pair selection',
    provenance: 'Google Calendar · 14m ago',
    severity: 'low',
  },
  {
    id: 'sch-erg-test',
    when: 'Wed',
    iconLetter: 'ER',
    category: 'practice',
    headline: '6K erg test scheduled',
    detail: '38 athletes signed up · 3 erg bays from 5:30 AM',
    provenance: 'Concept2 · 30m ago',
    severity: 'low',
  },
]

// ─── Athlete generation helpers ──────────────────────────────────────────────

function toSlug(lastFirst: string): string {
  return lastFirst
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toFirstLast(lastFirst: string): string {
  const comma = lastFirst.indexOf(', ')
  if (comma === -1) return lastFirst
  return `${lastFirst.slice(comma + 2)} ${lastFirst.slice(0, comma)}`
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

function ergToSeconds(time: string): number {
  const [m, s] = time.split(':')
  return parseInt(m, 10) * 60 + parseFloat(s)
}

function prand(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  const frac = x - Math.floor(x)
  return Math.round(min + frac * (max - min))
}

const SEAT_8 = ['Stroke', '7', '6', '5', '4', '3', '2', 'Bow'] as const
const SEAT_4 = ['Stroke', '3', '2', 'Bow'] as const

function positionLabel(i: number): string {
  if (i < 8)  return `V8 — ${SEAT_8[i]} seat`
  if (i < 16) return `2V8 — ${SEAT_8[i - 8]} seat`
  if (i < 20) return `V4 — ${SEAT_4[i - 16]} seat`
  if (i < 24) return `2V4 — ${SEAT_4[i - 20]} seat`
  return 'Reserve'
}

function sideLabel(i: number): 'P' | 'S' {
  // Stroke & even seats: S, odd seats (7, 5, 3, Bow): P
  return (i % 8) % 2 === 0 ? 'S' : 'P'
}

function preferredSeatLabel(i: number): 'stroke' | 'bow' | 'middle' | 'any' {
  const seat = i % 8
  if (seat === 0) return 'stroke'
  if (seat === 7) return 'bow'
  if (seat === 3 || seat === 4) return 'middle'
  return 'any'
}

const SOURCES = ['Concept2', 'WHOOP', 'Apple Health', 'Strava', 'Concept2', 'Garmin', 'Oura', 'Concept2'] as const

// ─── Rowers from real erg data ────────────────────────────────────────────────
// Sloane Carrow is placed first so she serves as the athlete-view "self" demo.
// All other athletes are ordered by erg performance (best first).

const STAR_IDX = ERG_316_2K.findIndex((r) => r.lastFirst === 'Carrow, Sloane')
const REORDERED_ERG = [
  ERG_316_2K[STAR_IDX],
  ...ERG_316_2K.slice(0, STAR_IDX),
  ...ERG_316_2K.slice(STAR_IDX + 1),
]

const ROWER_ATHLETES: AppMockAthlete[] = REORDERED_ERG.map((r, i) => {
  const name = toFirstLast(r.lastFirst)
  const bestSec = ergToSeconds(r.time)
  return {
    id: `a-${toSlug(r.lastFirst)}`,
    name,
    initials: getInitials(name),
    position: positionLabel(i),
    side: sideLabel(i),
    preferredSeat: preferredSeatLabel(i),
    recoveryScore: prand(i * 7 + 3, 58, 94),
    twoKBestSeconds: bestSec,
    twoKAvg30dSeconds: bestSec + prand(i * 3 + 1, 4, 14),
    weeklyVolumeMeters: Math.round(
      (r.watts / 362) * 180_000 * (0.85 + prand(i * 11 + 5, 0, 30) / 100),
    ),
    streakDays: prand(i * 5 + 2, 3, 28),
    lastSyncMinutes: prand(i * 4 + 7, 1, 60),
    primarySource: SOURCES[i % SOURCES.length],
  }
})

// ─── Coxswains (not in erg data — they steer the boat) ───────────────────────

const COX_ATHLETES: AppMockAthlete[] = [
  {
    id: 'a-nadia-quillan',
    name: 'Nadia Quillan',
    initials: 'AV',
    position: 'V8 — Cox',
    side: 'X',
    preferredSeat: 'cox',
    recoveryScore: 84,
    twoKBestSeconds: 8 * 60 + 12,
    twoKAvg30dSeconds: 8 * 60 + 24,
    weeklyVolumeMeters: 14_000,
    streakDays: 19,
    lastSyncMinutes: 6,
    primarySource: 'WHOOP',
  },
  {
    id: 'a-sable-ashford',
    name: 'Sable Ashford',
    initials: 'PR',
    position: '2V8 — Cox',
    side: 'X',
    preferredSeat: 'cox',
    recoveryScore: 76,
    twoKBestSeconds: 8 * 60 + 28,
    twoKAvg30dSeconds: 8 * 60 + 36,
    weeklyVolumeMeters: 9_000,
    streakDays: 8,
    lastSyncMinutes: 14,
    primarySource: 'Apple Health',
  },
  {
    id: 'a-kestrel-fenwick',
    name: 'Kestrel Fenwick',
    initials: 'TK',
    position: 'Reserve — Cox',
    side: 'X',
    preferredSeat: 'cox',
    recoveryScore: 68,
    twoKBestSeconds: 8 * 60 + 41,
    twoKAvg30dSeconds: 8 * 60 + 49,
    weeklyVolumeMeters: 6_000,
    streakDays: 4,
    lastSyncMinutes: 32,
    primarySource: 'Strava',
  },
]

export const APP_MOCK_ATHLETES: AppMockAthlete[] = [...ROWER_ATHLETES, ...COX_ATHLETES]

// ID of the demo "self" athlete surfaced in the athlete-side views.
export const DEMO_ATHLETE_ID = ROWER_ATHLETES[0].id // 'a-carrow-sloane'

// ─── Attention ────────────────────────────────────────────────────────────────

export type AppAttentionItem = {
  id: string
  athleteId: string
  athleteName: string
  initials: string
  signal: string
  source: string
  syncedMinutesAgo: number
  severity: 'high' | 'med' | 'low'
}

// Reference real Pacific Women athletes by their computed IDs.
// Larkin Tremaine  (index 4 in reordered list): poor-recovery story
// Marisol Ulverton (index 7): volume-spike story
// Marnie Rothmore (index 1): race-ready / streak
// Nadia Quillan (cox): race-day ready

export const APP_MOCK_ATTENTION: AppAttentionItem[] = [
  {
    id: 'att-1',
    athleteId: 'a-tremaine-larkin',
    athleteName: 'Larkin Tremaine',
    initials: 'OR',
    signal: '2K erg slipped 6.4s vs 4-week avg',
    source: 'Concept2',
    syncedMinutesAgo: 36,
    severity: 'high',
  },
  {
    id: 'att-2',
    athleteId: 'a-tremaine-larkin',
    athleteName: 'Larkin Tremaine',
    initials: 'OR',
    signal: 'Recovery 44 — 3 nights of poor sleep',
    source: 'WHOOP',
    syncedMinutesAgo: 36,
    severity: 'high',
  },
  {
    id: 'att-3',
    athleteId: 'a-ulverton-marisol',
    athleteName: 'Marisol Ulverton',
    initials: 'LC',
    signal: 'Volume up 34% week-over-week',
    source: 'Concept2',
    syncedMinutesAgo: 8,
    severity: 'med',
  },
  {
    id: 'att-4',
    athleteId: 'a-rothmore-marnie',
    athleteName: 'Marnie Rothmore',
    initials: 'EW',
    signal: 'Streak hit 24 days — longest on team',
    source: 'synth.',
    syncedMinutesAgo: 12,
    severity: 'low',
  },
  {
    id: 'att-5',
    athleteId: 'a-nadia-quillan',
    athleteName: 'Nadia Quillan',
    initials: 'AV',
    signal: 'Race-day ready — recovery 84, slept 8.1h',
    source: 'WHOOP',
    syncedMinutesAgo: 6,
    severity: 'low',
  },
]

// ─── Session history helpers ──────────────────────────────────────────────────

export type AppSessionPoint = { date: string; seconds: number; meters: number }

export function buildErgHistory(athleteId: string): AppSessionPoint[] {
  const athlete = APP_MOCK_ATHLETES.find((a) => a.id === athleteId)
  const base = athlete?.twoKAvg30dSeconds ?? 7 * 60 + 15
  const today = new Date()
  return Array.from({ length: 14 }).map((_, i) => {
    const dayOffset = 13 - i
    const d = new Date(today)
    d.setDate(d.getDate() - dayOffset)
    const drift = Math.sin(i * 0.6) * 4 + (i - 7) * 0.4
    return {
      date: d.toISOString().slice(5, 10),
      seconds: Math.round(base + drift),
      meters: 2000,
    }
  })
}

export function fmtErgTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const raw = totalSeconds % 60
  const s = Math.round(raw * 10) / 10
  const [whole, dec = '0'] = s.toFixed(1).split('.')
  return `${m}:${whole.padStart(2, '0')}.${dec}`
}

export function fmtAgo(minutes: number): string {
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const h = Math.floor(minutes / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
