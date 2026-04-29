import { SYNTH } from '../lib/theme'

export type MockSessionBoat = {
  id: string
  name: string
  color: string
  /** Per-split times in mm:ss.t */
  splits: string[]
  /** Aggregate rating 1-5 */
  rating: number
}

export type MockSession = {
  id: string
  date: string // 'Apr 21'
  title: string
  duration: string // '06:42.1'
  type: 'Practice piece' | 'Time trial' | 'Seat race' | 'Regatta'
  ratedByCoach: string
  description: string
  boats: MockSessionBoat[]
}

export const APP_MOCK_SESSIONS: MockSession[] = [
  {
    id: 'sess-1',
    date: 'Apr 21',
    title: 'V8 race-pace pieces · 4 × 500m',
    duration: '06:42.1',
    type: 'Practice piece',
    ratedByCoach: 'Coach Geri',
    description:
      'Strong start, V8 A held a comfortable seat through the third 500m. Sync slipped slightly at high rate — work on catch timing.',
    boats: [
      {
        id: 'v8a',
        name: 'V8 A',
        color: SYNTH.cardSky,
        splits: ['1:38.4', '1:40.1', '1:41.7', '1:42.0'],
        rating: 4.4,
      },
      {
        id: 'v8b',
        name: 'V8 B',
        color: SYNTH.cardPink,
        splits: ['1:42.6', '1:43.8', '1:44.5', '1:45.2'],
        rating: 4.0,
      },
    ],
  },
  {
    id: 'sess-2',
    date: 'Apr 14',
    title: 'V8 B seat race · stroke vs 7',
    duration: '07:01.6',
    type: 'Seat race',
    ratedByCoach: 'Coach Mike',
    description:
      'Seat race for the V8 B stroke seat. Star Miller was 1.4s ahead at the 1000m mark. Decision pending — will rerun on Saturday.',
    boats: [
      {
        id: 'v8b',
        name: 'V8 B (stroke)',
        color: SYNTH.cardLemon,
        splits: ['1:46.0', '1:46.8', '1:47.1', '1:47.4'],
        rating: 3.8,
      },
      {
        id: 'v8b-alt',
        name: 'V8 B (alt 7)',
        color: SYNTH.cardMint,
        splits: ['1:47.2', '1:47.4', '1:47.5', '1:47.5'],
        rating: 3.6,
      },
    ],
  },
  {
    id: 'sess-3',
    date: 'Apr 07',
    title: 'V4 A time trial · 2K',
    duration: '07:18.3',
    type: 'Time trial',
    ratedByCoach: 'Coach Geri',
    description:
      'Clean rate ladder — sub-7:20 at race pace. Bow pair looking sharp, stroke timing is the cleanest it has been all season.',
    boats: [
      {
        id: 'v4a',
        name: 'V4 A',
        color: SYNTH.cardMint,
        splits: ['1:48.1', '1:49.4', '1:50.2', '1:50.6'],
        rating: 4.1,
      },
    ],
  },
]
