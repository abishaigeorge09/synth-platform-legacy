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
  {
    id: 'sess-4',
    date: 'Apr 26',
    title: 'Pacific Invite Regatta · grand finals',
    duration: '06:35.4',
    type: 'Regatta',
    ratedByCoach: 'Coach Geri',
    description:
      'V8 took 2nd by 0.6s — held bow position through 1500m, lost margin in the last 250 to a hard finish from Stanford. V4+ won by 1.2 lengths.',
    boats: [
      {
        id: 'v8a-regatta',
        name: 'V8 A · 2nd',
        color: SYNTH.cardSky,
        splits: ['1:36.9', '1:38.4', '1:39.6', '1:40.5'],
        rating: 4.7,
      },
      {
        id: 'v4-regatta',
        name: 'V4+ A · 1st',
        color: SYNTH.cardYellow,
        splits: ['1:42.1', '1:43.8', '1:44.0', '1:43.7'],
        rating: 4.8,
      },
    ],
  },
  {
    id: 'sess-5',
    date: 'Apr 24',
    title: 'V8 race-pace tune-up · 3 × 750m',
    duration: '04:58.7',
    type: 'Practice piece',
    ratedByCoach: 'Coach Geri',
    description:
      'Pre-race sharpening, all three pieces under target split. Crew was relaxed at the catch — best rhythm we have had pre-race.',
    boats: [
      {
        id: 'v8a-tuneup',
        name: 'V8 A',
        color: SYNTH.cardMint,
        splits: ['1:39.2', '1:39.6', '1:39.4'],
        rating: 4.5,
      },
    ],
  },
  {
    id: 'sess-6',
    date: 'Apr 18',
    title: 'Technical drills · pause + pick-4',
    duration: '01:12:00',
    type: 'Practice piece',
    ratedByCoach: 'Coach Mike',
    description:
      'Low-rate technical work. Half-slide pause drill exposed body-prep issues in the bow pair — assigned video review for Star and Rae before Saturday.',
    boats: [
      {
        id: 'v8b-drills',
        name: 'V8 B (drills)',
        color: SYNTH.cardLemon,
        splits: ['2:08.4', '2:07.9', '2:08.1', '2:07.6'],
        rating: 3.6,
      },
      {
        id: 'v4b-drills',
        name: 'V4 B (drills)',
        color: SYNTH.cardCream,
        splits: ['2:11.0', '2:10.4', '2:10.2', '2:09.8'],
        rating: 3.4,
      },
    ],
  },
  {
    id: 'sess-7',
    date: 'Apr 11',
    title: 'UT2 long row · 90 min',
    duration: '01:30:00',
    type: 'Practice piece',
    ratedByCoach: 'Coach Geri',
    description:
      'Aerobic base-builder, rate 18-20. Steady rhythm, HR zones held all the way through. Coral kept volume in check after last week\'s spike.',
    boats: [
      {
        id: 'mixed-ut2',
        name: 'Mixed crew · UT2',
        color: SYNTH.cardPink,
        splits: ['2:04.1', '2:03.8', '2:04.2', '2:03.6', '2:03.9', '2:04.1'],
        rating: 4.0,
      },
    ],
  },
  {
    id: 'sess-8',
    date: 'Apr 04',
    title: 'Erg interval ladder · 30/60/90/120s',
    duration: '00:42:00',
    type: 'Practice piece',
    ratedByCoach: 'Coach Mike',
    description:
      'On-erg session for fitness check. Juno set a 90s power PR — average watts up 6% YoY across the squad.',
    boats: [
      {
        id: 'erg-pod-a',
        name: 'Erg pod A',
        color: SYNTH.cardSky,
        splits: ['1:33.0', '1:36.2', '1:39.4', '1:41.1'],
        rating: 4.2,
      },
      {
        id: 'erg-pod-b',
        name: 'Erg pod B',
        color: SYNTH.cardMint,
        splits: ['1:34.8', '1:37.5', '1:40.3', '1:42.0'],
        rating: 3.9,
      },
    ],
  },
]
