export type AppMockAthlete = {
  id: string
  name: string
  initials: string
  position: string
  side: 'P' | 'S' | 'X'
  /** Coach-set preferred seat type — surfaces in the picker so you know
   * who likes stroke vs bow vs middle vs cox. */
  preferredSeat?: 'stroke' | 'bow' | 'middle' | 'cox' | 'any'
  recoveryScore: number
  twoKBestSeconds: number
  twoKAvg30dSeconds: number
  weeklyVolumeMeters: number
  streakDays: number
  lastSyncMinutes: number
  primarySource: string
}

export const APP_MOCK_TEAM = {
  id: 'team-cal-w-rowing',
  name: "Cal Women's Rowing",
  sport: 'rowing' as const,
  athleteCount: 46,
  activeToday: 38,
  avgRecovery: 71,
  attentionCount: 10,
  sessionsToday: 24,
}

export type AppScheduleItem = {
  id: string
  when: string // "Tonight" | "Tomorrow" | "Wed" | "Sat" …
  iconLetter: string // 1–2 char circle label, e.g. "LU" / "RC" / "AB"
  category: 'lineup' | 'race' | 'practice' | 'attendance' | 'meeting'
  headline: string
  detail: string
  provenance: string
  severity: 'high' | 'med' | 'low'
}

// One week of performance + scheduling items shown under "This week" on
// home. Excludes fatigue/wellness — those live on the Attention tab.
export const APP_MOCK_SCHEDULE: AppScheduleItem[] = [
  {
    id: 'sch-lineup-tomorrow',
    when: 'Tomorrow',
    iconLetter: 'LU',
    category: 'lineup',
    headline: 'V8 lineup posted for AM practice',
    detail: 'Stroke seat changed — Juno → Star. Confirm before 10pm.',
    provenance: 'Lineups · just now',
    severity: 'med',
  },
  {
    id: 'sch-race-saturday',
    when: 'Sat',
    iconLetter: 'RC',
    category: 'race',
    headline: 'Cal Invite Regatta — race day',
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
    detail: 'Coral Mendez (excused) · Rae Akhtar (no notice)',
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

export const APP_MOCK_ATHLETES: AppMockAthlete[] = [
  {
    id: 'a-star-miller',
    name: 'Star Miller',
    initials: 'SM',
    position: 'V8 — 5 seat',
    side: 'P',
    preferredSeat: 'middle',
    recoveryScore: 78,
    twoKBestSeconds: 7 * 60 + 6,
    twoKAvg30dSeconds: 7 * 60 + 14,
    weeklyVolumeMeters: 142_000,
    streakDays: 11,
    lastSyncMinutes: 4,
    primarySource: 'Concept2',
  },
  {
    id: 'a-juno-okafor',
    name: 'Juno Okafor',
    initials: 'JO',
    position: 'V8 — Stroke',
    side: 'S',
    preferredSeat: 'stroke',
    recoveryScore: 64,
    twoKBestSeconds: 7 * 60 + 1,
    twoKAvg30dSeconds: 7 * 60 + 8,
    weeklyVolumeMeters: 156_000,
    streakDays: 23,
    lastSyncMinutes: 12,
    primarySource: 'Concept2',
  },
  {
    id: 'a-isla-park',
    name: 'Isla Park',
    initials: 'IP',
    position: 'V8 — 7 seat',
    side: 'S',
    preferredSeat: 'middle',
    recoveryScore: 42,
    twoKBestSeconds: 7 * 60 + 9,
    twoKAvg30dSeconds: 7 * 60 + 19,
    weeklyVolumeMeters: 121_000,
    streakDays: 3,
    lastSyncMinutes: 36,
    primarySource: 'WHOOP',
  },
  {
    id: 'a-rae-akhtar',
    name: 'Rae Akhtar',
    initials: 'RA',
    position: 'V8 — Bow',
    side: 'P',
    preferredSeat: 'bow',
    recoveryScore: 81,
    twoKBestSeconds: 7 * 60 + 12,
    twoKAvg30dSeconds: 7 * 60 + 17,
    weeklyVolumeMeters: 134_000,
    streakDays: 14,
    lastSyncMinutes: 18,
    primarySource: 'Strava',
  },
  {
    id: 'a-coral-mendez',
    name: 'Coral Mendez',
    initials: 'CM',
    position: '2V8 — 4 seat',
    side: 'P',
    preferredSeat: 'middle',
    recoveryScore: 58,
    twoKBestSeconds: 7 * 60 + 18,
    twoKAvg30dSeconds: 7 * 60 + 24,
    weeklyVolumeMeters: 118_000,
    streakDays: 7,
    lastSyncMinutes: 8,
    primarySource: 'Concept2',
  },
  {
    id: 'a-noor-haidari',
    name: 'Noor Haidari',
    initials: 'NH',
    position: '2V8 — 2 seat',
    side: 'S',
    preferredSeat: 'any',
    recoveryScore: 73,
    twoKBestSeconds: 7 * 60 + 22,
    twoKAvg30dSeconds: 7 * 60 + 26,
    weeklyVolumeMeters: 102_000,
    streakDays: 5,
    lastSyncMinutes: 22,
    primarySource: 'Apple Health',
  },
  // ─── Coxswains ─────────────────────────────────────────────────────────
  // Cox athletes don't row, so 2K + volume fields are minimal/representative.
  // Surfaces in AthletePickerSheet under the COX filter chip when picking
  // for a cox seat (forSide === 'X').
  {
    id: 'a-andie-vega',
    name: 'Andie Vega',
    initials: 'AV',
    position: 'V8 — Cox',
    side: 'X',
    preferredSeat: 'cox',
    recoveryScore: 84,
    twoKBestSeconds: 8 * 60 + 12, // ergs occasionally for fitness tests
    twoKAvg30dSeconds: 8 * 60 + 24,
    weeklyVolumeMeters: 14_000, // light cross-training rows
    streakDays: 19,
    lastSyncMinutes: 6,
    primarySource: 'WHOOP',
  },
  {
    id: 'a-pia-roman',
    name: 'Pia Roman',
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
    id: 'a-tess-kim',
    name: 'Tess Kim',
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

export const APP_MOCK_ATTENTION: AppAttentionItem[] = [
  {
    id: 'att-1',
    athleteId: 'a-isla-park',
    athleteName: 'Isla Park',
    initials: 'IP',
    signal: '2K erg slipped 7.2s vs 4-week avg',
    source: 'Concept2',
    syncedMinutesAgo: 36,
    severity: 'high',
  },
  {
    id: 'att-2',
    athleteId: 'a-isla-park',
    athleteName: 'Isla Park',
    initials: 'IP',
    signal: 'Recovery 42 — 3 nights of poor sleep',
    source: 'WHOOP',
    syncedMinutesAgo: 36,
    severity: 'high',
  },
  {
    id: 'att-3',
    athleteId: 'a-coral-mendez',
    athleteName: 'Coral Mendez',
    initials: 'CM',
    signal: 'Volume up 38% week-over-week',
    source: 'Concept2',
    syncedMinutesAgo: 8,
    severity: 'med',
  },
  {
    id: 'att-4',
    athleteId: 'a-juno-okafor',
    athleteName: 'Juno Okafor',
    initials: 'JO',
    signal: 'Streak hit 23 days — longest on team',
    source: 'synth.',
    syncedMinutesAgo: 12,
    severity: 'low',
  },
  {
    id: 'att-5',
    athleteId: 'a-andie-vega',
    athleteName: 'Andie Vega',
    initials: 'AV',
    signal: 'Race-day ready — recovery 84, slept 8.1h',
    source: 'WHOOP',
    syncedMinutesAgo: 6,
    severity: 'low',
  },
]

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
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function fmtAgo(minutes: number): string {
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const h = Math.floor(minutes / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
