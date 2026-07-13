export type AppMockNote = {
  id: string
  athleteId: string
  athleteName: string
  initials: string
  body: string
  minutesAgo: number
  visibleToAthlete: boolean
}

export const APP_MOCK_NOTES: AppMockNote[] = [
  {
    id: 'n-1',
    athleteId: 'a-roth-olivia',
    athleteName: 'Olivia Roth',
    initials: 'OR',
    body: 'Talk to her tomorrow about sleep. WHOOP shows 3 short nights — split slipped 6s.',
    minutesAgo: 12,
    visibleToAthlete: false,
  },
  {
    id: 'n-2',
    athleteId: 'a-wheeler-ella',
    athleteName: 'Ella Wheeler',
    initials: 'EW',
    body: 'Big PR on the 2K — 6:35.6, 362W. 24-day streak. Send a recognition note before practice.',
    minutesAgo: 48,
    visibleToAthlete: true,
  },
  {
    id: 'n-3',
    athleteId: 'a-crampin-lola',
    athleteName: 'Lola Crampin',
    initials: 'LC',
    body: 'Volume jump 34% w-o-w. Watch for overtraining — keep her at 4×500 this week.',
    minutesAgo: 4 * 60 + 20,
    visibleToAthlete: false,
  },
  {
    id: 'n-4',
    athleteId: 'a-miller-star',
    athleteName: 'Star Miller',
    initials: 'SM',
    body: 'V8 Stroke, starboard. Timing solid in last 3 sessions — catch leading the pair well.',
    minutesAgo: 24 * 60,
    visibleToAthlete: true,
  },
  {
    id: 'n-5',
    athleteId: 'a-irmler-julia',
    athleteName: 'Julia Irmler',
    initials: 'JI',
    body: 'Ask her about left shoulder — saw her short-arming bow on stbd Tuesday.',
    minutesAgo: 2 * 24 * 60,
    visibleToAthlete: false,
  },
]
