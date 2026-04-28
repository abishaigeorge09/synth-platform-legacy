export type AppMockAthlete = {
  id: string
  name: string
  initials: string
  position: string
  side: 'P' | 'S' | 'X'
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
  athleteCount: 28,
  activeToday: 22,
  avgRecovery: 71,
  attentionCount: 4,
  sessionsToday: 18,
}

export const APP_MOCK_ATHLETES: AppMockAthlete[] = [
  {
    id: 'a-star-miller',
    name: 'Star Miller',
    initials: 'SM',
    position: 'V8 — 5 seat',
    side: 'P',
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
    recoveryScore: 73,
    twoKBestSeconds: 7 * 60 + 22,
    twoKAvg30dSeconds: 7 * 60 + 26,
    weeklyVolumeMeters: 102_000,
    streakDays: 5,
    lastSyncMinutes: 22,
    primarySource: 'Apple Health',
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
