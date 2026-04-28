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
    athleteId: 'a-isla-park',
    athleteName: 'Isla Park',
    initials: 'IP',
    body: 'Talk to her tomorrow about sleep. WHOOP shows 3 short nights — split slipped 7s.',
    minutesAgo: 12,
    visibleToAthlete: false,
  },
  {
    id: 'n-2',
    athleteId: 'a-juno-okafor',
    athleteName: 'Juno Okafor',
    initials: 'JO',
    body: 'Big PR on the 6K — 23-day streak. Send a recognition note before practice.',
    minutesAgo: 48,
    visibleToAthlete: true,
  },
  {
    id: 'n-3',
    athleteId: 'a-coral-mendez',
    athleteName: 'Coral Mendez',
    initials: 'CM',
    body: 'Volume jump 38% w-o-w. Watch for overtraining — keep her at 4×500 this week.',
    minutesAgo: 4 * 60 + 20,
    visibleToAthlete: false,
  },
  {
    id: 'n-4',
    athleteId: 'a-star-miller',
    athleteName: 'Star Miller',
    initials: 'SM',
    body: 'V8 5-seat, port. Stroke timing solid in last 3 sessions.',
    minutesAgo: 24 * 60,
    visibleToAthlete: true,
  },
  {
    id: 'n-5',
    athleteId: 'a-rae-akhtar',
    athleteName: 'Rae Akhtar',
    initials: 'RA',
    body: 'Ask her about left shoulder — saw her short-arming bow on stbd Tuesday.',
    minutesAgo: 2 * 24 * 60,
    visibleToAthlete: false,
  },
]
