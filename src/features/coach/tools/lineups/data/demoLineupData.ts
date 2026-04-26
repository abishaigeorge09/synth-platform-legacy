/**
 * Demo data for the Lineups sub-application.
 * All athlete data sourced from Cal Women's Rowing 2025-26 season.
 */

export type DemoAthlete = {
  id: string
  name: string
  initials: string
  side: 'port' | 'starboard' | 'cox'
  ergTime: string
  ergSeconds: number
  recovery: number
  avatarColor: string
}

export type DemoSession = {
  id: string
  name: string
  date: string
  kind: 'RACE' | 'PRAC'
  type: string
  boats: string
  status: 'upcoming' | 'completed'
  best: string | null
  runsCount?: number
}

export type HistoryEntry = {
  id: string
  date: string
  month: string
  sessionTitle: string
  boats: { name: string; time: string }[]
  lineup1V: { seat: string; name: string; swappedIn?: boolean; swappedOut?: boolean }[]
  lineup2V: { seat: string; name: string; swappedIn?: boolean; swappedOut?: boolean }[]
  swaps: { change: string; impact?: string; impactPositive?: boolean }[] | null
  runImpact?: string
}

export type SplitRow = {
  piece: string
  v1: string
  v2: string
  delta: string
  isFinish: boolean
}

export type PairScore = {
  pair: string
  score: number
  status: 'good' | 'warn'
}

// Avatar color palette (cycles by index)
const COLORS = [
  '#2d6a4f', '#5b4a9e', '#1a73e8', '#e67e22',
  '#16a085', '#8e44ad', '#c0392b', '#2980b9',
  '#27ae60', '#d35400', '#7f8c8d', '#8e44ad',
]

function mkAthlete(
  id: string,
  name: string,
  side: 'port' | 'starboard' | 'cox',
  ergTime: string,
  ergSeconds: number,
  recovery: number,
  colorIdx: number,
): DemoAthlete {
  const parts = name.trim().split(/\s+/)
  const initials = ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
  return { id, name, initials, side, ergTime, ergSeconds, recovery, avatarColor: COLORS[colorIdx % COLORS.length] }
}

// All 46 athletes from the Cal Women's Rowing 2025-26 roster
export const DEMO_ATHLETES: DemoAthlete[] = [
  mkAthlete('a-wheeler',     'Ella Wheeler',            'starboard', '6:35.6', 395.6, 78,  0),
  mkAthlete('a-irmler',      'Julia Irmler',            'port',      '6:38.6', 398.6, 85,  1),
  mkAthlete('a-abbott',      'Lily Abbott',             'starboard', '6:41.7', 401.7, 91,  2),
  mkAthlete('a-miller',      'Star Miller',             'port',      '6:44.9', 404.9, 62,  3),
  mkAthlete('a-roth',        'Olivia Roth',             'starboard', '6:48.1', 408.1, 88,  4),
  mkAthlete('a-cox',         'Madeline Cox',            'port',      '6:48.9', 408.9, 42,  5),
  mkAthlete('a-bouman',      'Minou Bouman',            'starboard', '6:50.0', 410.0, 91,  6),
  mkAthlete('a-crampin',     'Lola Crampin',            'port',      '6:55.8', 415.8, 55,  7),
  mkAthlete('a-johnson',     'Charly Johnson',          'cox',       'cox',    9999,  77,  8),
  mkAthlete('a-vanw',        'Lotta Van Westreenen',    'starboard', '6:45.6', 405.6, 82,  9),
  mkAthlete('a-bell',        'Sophia Bell',             'port',      '6:52.3', 412.3, 74,  10),
  mkAthlete('a-ellis',       'Avery Ellis',             'starboard', '6:53.1', 413.1, 80,  11),
  mkAthlete('a-kent',        'Chloe Kent',              'port',      '6:54.0', 414.0, 69,  0),
  mkAthlete('a-ng',          'Madison Ng',              'starboard', '6:56.2', 416.2, 83,  1),
  mkAthlete('a-flores',      'Isabel Flores',           'port',      '6:57.4', 417.4, 71,  2),
  mkAthlete('a-hansen',      'Petra Hansen',            'starboard', '6:58.8', 418.8, 90,  3),
  mkAthlete('a-morgan',      'Casey Morgan',            'cox',       'cox',    9999,  68,  4),
  mkAthlete('a-stone',       'Bree Stone',              'port',      '7:00.1', 420.1, 76,  5),
  mkAthlete('a-hayes',       'Quinn Hayes',             'starboard', '7:01.4', 421.4, 84,  6),
  mkAthlete('a-lin',         'Mei Lin',                 'port',      '7:02.7', 422.7, 58,  7),
  mkAthlete('a-foster',      'Jordan Foster',           'starboard', '7:03.9', 423.9, 92,  8),
  mkAthlete('a-park',        'Jisoo Park',              'port',      '7:05.2', 425.2, 79,  9),
  mkAthlete('a-reed',        'Haley Reed',              'starboard', '7:06.6', 426.6, 65,  10),
  mkAthlete('a-ortega',      'Sofia Ortega',            'port',      '7:08.0', 428.0, 87,  11),
  mkAthlete('a-kim',         'Grace Kim',               'starboard', '7:09.3', 429.3, 73,  0),
  mkAthlete('a-russo',       'Bianca Russo',            'port',      '7:10.5', 430.5, 81,  1),
  mkAthlete('a-chen',        'Vivian Chen',             'starboard', '7:11.9', 431.9, 66,  2),
  mkAthlete('a-osei',        'Ama Osei',                'port',      '7:13.2', 433.2, 94,  3),
  mkAthlete('a-taylor',      'Emma Taylor',             'starboard', '7:14.5', 434.5, 60,  4),
  mkAthlete('a-patel',       'Priya Patel',             'port',      '7:15.8', 435.8, 86,  5),
  mkAthlete('a-wu',          'Yuki Wu',                 'starboard', '7:17.1', 437.1, 72,  6),
  mkAthlete('a-davis',       'Lauren Davis',            'port',      '7:18.4', 438.4, 89,  7),
  mkAthlete('a-nguyen',      'Linh Nguyen',             'starboard', '7:19.7', 439.7, 75,  8),
  mkAthlete('a-martin',      'Caitlin Martin',          'port',      '7:21.0', 441.0, 63,  9),
  mkAthlete('a-clark',       'Paige Clark',             'starboard', '7:22.3', 442.3, 88,  10),
  mkAthlete('a-white',       'Sierra White',            'port',      '7:23.6', 443.6, 70,  11),
  mkAthlete('a-jones',       'Tatum Jones',             'starboard', '7:25.0', 445.0, 82,  0),
  mkAthlete('a-brown',       'Riley Brown',             'port',      '7:26.3', 446.3, 57,  1),
  mkAthlete('a-wilson',      'Kayla Wilson',            'starboard', '7:27.6', 447.6, 91,  2),
  mkAthlete('a-moore',       'Dani Moore',              'port',      '7:28.9', 448.9, 76,  3),
  mkAthlete('a-jackson',     'Alexis Jackson',          'starboard', '7:30.2', 450.2, 84,  4),
  mkAthlete('a-harris',      'Zoe Harris',              'port',      '7:31.5', 451.5, 67,  5),
  mkAthlete('a-thompson',    'Mia Thompson',            'starboard', '7:32.8', 452.8, 79,  6),
  mkAthlete('a-garcia',      'Camila Garcia',           'port',      '7:34.1', 454.1, 85,  7),
  mkAthlete('a-martinez',    'Elena Martinez',          'starboard', '7:35.4', 455.4, 71,  8),
  mkAthlete('a-rodriguez',   'Valentina Rodriguez',     'port',      '7:36.7', 456.7, 88,  9),
]

// ── Pair compatibility ──────────────────────────────────────────────────────

export const PAIR_SCORES: PairScore[] = [
  { pair: 'Wheeler + Irmler (5-6)',    score: 9.2, status: 'good' },
  { pair: 'Abbott + Miller (3-4)',     score: 8.7, status: 'good' },
  { pair: 'Roth + Cox (1-2)',          score: 6.1, status: 'warn' },
  { pair: 'Bouman + Crampin (7-8)',    score: 8.4, status: 'good' },
  { pair: 'Bell + Ellis (5-6 / 2V)',   score: 7.9, status: 'good' },
  { pair: 'Kent + Ng (3-4 / 2V)',      score: 7.2, status: 'good' },
]

// ── Suggested 1V ────────────────────────────────────────────────────────────

export const SUGGESTED_1V: { seat: string; name: string; warn: boolean }[] = [
  { seat: 'Cox',     name: 'Charly Johnson',        warn: false },
  { seat: '8 · STR', name: 'Minou Bouman',          warn: false },
  { seat: '7',       name: 'Lola Crampin',           warn: false },
  { seat: '6',       name: 'Ella Wheeler',           warn: false },
  { seat: '5',       name: 'Julia Irmler',           warn: false },
  { seat: '4',       name: 'Lily Abbott',            warn: false },
  { seat: '3',       name: 'Star Miller',            warn: true  },
  { seat: '2',       name: 'Olivia Roth',            warn: false },
  { seat: '1 · BOW', name: 'Lotta Van Westreenen',   warn: false },
]

// ── Best lineups ─────────────────────────────────────────────────────────────

export const BEST_LINEUPS = [
  { event: 'SDCC — 1V 8+',           date: 'Mar 28, 2026', time: '5:44.2' },
  { event: 'Cal Invite — 1V 8+',     date: 'Apr 12, 2026', time: '5:46.8' },
  { event: 'Practice Pieces — 1V 8+', date: 'Apr 22, 2026', time: '5:48.1' },
]

// ── Split history demo ────────────────────────────────────────────────────────

export const SPLIT_HISTORY_DEMO: SplitRow[] = [
  { piece: '500m',   v1: '1:26.1', v2: '1:27.4', delta: '+1.3', isFinish: false },
  { piece: '1000m',  v1: '2:53.0', v2: '2:55.8', delta: '+2.8', isFinish: false },
  { piece: '1500m',  v1: '4:19.2', v2: '4:23.5', delta: '+4.3', isFinish: false },
  { piece: 'FINISH', v1: '5:44.2', v2: '5:51.8', delta: '+7.6', isFinish: true  },
]

// ── Sessions ─────────────────────────────────────────────────────────────────

export const DEMO_SESSIONS: DemoSession[] = [
  {
    id: 's1',
    kind: 'RACE',
    name: 'Cal Invite Regatta',
    date: 'Apr 26, 2026',
    type: 'Race Day · 3 events',
    boats: '1V 8+, 2V 8+, V4+',
    status: 'upcoming',
    best: null,
    runsCount: undefined,
  },
  {
    id: 's2',
    kind: 'PRAC',
    name: 'Race Prep Pieces',
    date: 'Apr 24, 2026',
    type: 'Practice · 4 pieces',
    boats: '1V 8+, 2V 8+',
    status: 'completed',
    best: '1V 8+ — 5:44.2',
    runsCount: 4,
  },
  {
    id: 's3',
    kind: 'PRAC',
    name: 'Steady State + Starts',
    date: 'Apr 22, 2026',
    type: 'Practice · 3 pieces',
    boats: '1V 8+, 2V 8+',
    status: 'completed',
    best: '1V 8+ — 5:45.4',
    runsCount: 3,
  },
  {
    id: 's4',
    kind: 'RACE',
    name: 'Dual vs Stanford',
    date: 'Apr 15, 2026',
    type: 'Race Day · 2 events',
    boats: '1V 8+, 2V 8+',
    status: 'completed',
    best: '1V 8+ — 5:43.8',
    runsCount: 2,
  },
]

// ── History entries ──────────────────────────────────────────────────────────

export const HISTORY_ENTRIES: HistoryEntry[] = [
  {
    id: 'h1',
    date: 'Apr 24, 2026 · 6:00 AM',
    month: 'April 2026',
    sessionTitle: 'Race Prep Pieces',
    boats: [
      { name: '1V 8+', time: '5:44.2' },
      { name: '2V 8+', time: '5:51.8' },
    ],
    lineup1V: [
      { seat: 'Cox',     name: 'Charly Johnson' },
      { seat: '8 · STR', name: 'Minou Bouman' },
      { seat: '7',       name: 'Lola Crampin' },
      { seat: '6',       name: 'Ella Wheeler' },
      { seat: '5',       name: 'Julia Irmler' },
      { seat: '4',       name: 'Lily Abbott' },
      { seat: '3',       name: 'Star Miller',    swappedIn: true },
      { seat: '2',       name: 'Olivia Roth' },
      { seat: '1 · BOW', name: 'Lotta Van Westreenen' },
    ],
    lineup2V: [
      { seat: 'Cox',     name: 'Casey Morgan' },
      { seat: '8 · STR', name: 'Sophia Bell' },
      { seat: '7',       name: 'Avery Ellis' },
      { seat: '6',       name: 'Chloe Kent' },
      { seat: '5',       name: 'Madison Ng' },
      { seat: '4',       name: 'Isabel Flores' },
      { seat: '3',       name: 'Madeline Cox',   swappedIn: true },
      { seat: '2',       name: 'Petra Hansen' },
      { seat: '1 · BOW', name: 'Bree Stone' },
    ],
    swaps: [
      { change: '1V Seat 3: Roth → Miller', impact: '1V went −1.2s faster', impactPositive: true },
      { change: '2V Seat 3: Miller → Cox',  impact: '2V went +0.8s slower',  impactPositive: false },
    ],
    runImpact: '1V −1.2s · 2V +0.8s',
  },
  {
    id: 'h2',
    date: 'Apr 22, 2026 · 6:00 AM',
    month: 'April 2026',
    sessionTitle: 'Steady State + Starts',
    boats: [
      { name: '1V 8+', time: '5:45.4' },
      { name: '2V 8+', time: '5:51.0' },
    ],
    lineup1V: [
      { seat: 'Cox',     name: 'Charly Johnson' },
      { seat: '8 · STR', name: 'Minou Bouman' },
      { seat: '7',       name: 'Lola Crampin' },
      { seat: '6',       name: 'Ella Wheeler' },
      { seat: '5',       name: 'Julia Irmler' },
      { seat: '4',       name: 'Lily Abbott' },
      { seat: '3',       name: 'Olivia Roth' },
      { seat: '2',       name: 'Star Miller' },
      { seat: '1 · BOW', name: 'Lotta Van Westreenen' },
    ],
    lineup2V: [
      { seat: 'Cox',     name: 'Casey Morgan' },
      { seat: '8 · STR', name: 'Sophia Bell' },
      { seat: '7',       name: 'Avery Ellis' },
      { seat: '6',       name: 'Chloe Kent' },
      { seat: '5',       name: 'Madison Ng' },
      { seat: '4',       name: 'Isabel Flores' },
      { seat: '3',       name: 'Madeline Cox' },
      { seat: '2',       name: 'Petra Hansen' },
      { seat: '1 · BOW', name: 'Bree Stone' },
    ],
    swaps: null,
  },
  {
    id: 'h3',
    date: 'Apr 19, 2026 · 6:00 AM',
    month: 'April 2026',
    sessionTitle: 'Race Pace 4×500m',
    boats: [
      { name: '1V 8+', time: '5:46.8' },
      { name: '2V 8+', time: '5:53.2' },
    ],
    lineup1V: [
      { seat: 'Cox',     name: 'Charly Johnson' },
      { seat: '8 · STR', name: 'Minou Bouman' },
      { seat: '7',       name: 'Lola Crampin' },
      { seat: '6',       name: 'Ella Wheeler',   swappedIn: true },
      { seat: '5',       name: 'Julia Irmler' },
      { seat: '4',       name: 'Lily Abbott' },
      { seat: '3',       name: 'Olivia Roth' },
      { seat: '2',       name: 'Star Miller' },
      { seat: '1 · BOW', name: 'Lotta Van Westreenen' },
    ],
    lineup2V: [
      { seat: 'Cox',     name: 'Casey Morgan' },
      { seat: '8 · STR', name: 'Sophia Bell' },
      { seat: '7',       name: 'Avery Ellis' },
      { seat: '6',       name: 'Chloe Kent' },
      { seat: '5',       name: 'Madison Ng' },
      { seat: '4',       name: 'Isabel Flores' },
      { seat: '3',       name: 'Madeline Cox' },
      { seat: '2',       name: 'Petra Hansen' },
      { seat: '1 · BOW', name: 'Bree Stone' },
    ],
    swaps: [
      { change: '1V Seat 6: Cox → Wheeler', impact: '1V went −0.4s faster after Wheeler moved to 6 seat', impactPositive: true },
    ],
    runImpact: '1V −0.4s',
  },
  {
    id: 'h4',
    date: 'Mar 28, 2026 · 7:00 AM',
    month: 'March 2026',
    sessionTitle: 'SDCC Regatta',
    boats: [
      { name: '1V 8+', time: '5:44.2' },
      { name: '2V 8+', time: '5:50.6' },
    ],
    lineup1V: [
      { seat: 'Cox',     name: 'Charly Johnson' },
      { seat: '8 · STR', name: 'Minou Bouman' },
      { seat: '7',       name: 'Lola Crampin' },
      { seat: '6',       name: 'Ella Wheeler' },
      { seat: '5',       name: 'Julia Irmler' },
      { seat: '4',       name: 'Lily Abbott' },
      { seat: '3',       name: 'Olivia Roth' },
      { seat: '2',       name: 'Star Miller' },
      { seat: '1 · BOW', name: 'Lotta Van Westreenen' },
    ],
    lineup2V: [
      { seat: 'Cox',     name: 'Casey Morgan' },
      { seat: '8 · STR', name: 'Sophia Bell' },
      { seat: '7',       name: 'Avery Ellis' },
      { seat: '6',       name: 'Chloe Kent' },
      { seat: '5',       name: 'Madison Ng' },
      { seat: '4',       name: 'Isabel Flores' },
      { seat: '3',       name: 'Madeline Cox' },
      { seat: '2',       name: 'Petra Hansen' },
      { seat: '1 · BOW', name: 'Bree Stone' },
    ],
    swaps: null,
  },
  {
    id: 'h5',
    date: 'Mar 21, 2026 · 6:00 AM',
    month: 'March 2026',
    sessionTitle: 'Pre-SDCC Race Sim',
    boats: [
      { name: '1V 8+', time: '5:47.0' },
      { name: '2V 8+', time: '5:54.4' },
    ],
    lineup1V: [
      { seat: 'Cox',     name: 'Charly Johnson' },
      { seat: '8 · STR', name: 'Minou Bouman' },
      { seat: '7',       name: 'Lola Crampin' },
      { seat: '6',       name: 'Ella Wheeler' },
      { seat: '5',       name: 'Julia Irmler' },
      { seat: '4',       name: 'Lily Abbott' },
      { seat: '3',       name: 'Olivia Roth' },
      { seat: '2',       name: 'Lotta Van Westreenen' },
      { seat: '1 · BOW', name: 'Star Miller' },
    ],
    lineup2V: [
      { seat: 'Cox',     name: 'Casey Morgan' },
      { seat: '8 · STR', name: 'Sophia Bell' },
      { seat: '7',       name: 'Avery Ellis' },
      { seat: '6',       name: 'Chloe Kent' },
      { seat: '5',       name: 'Madison Ng' },
      { seat: '4',       name: 'Isabel Flores' },
      { seat: '3',       name: 'Madeline Cox' },
      { seat: '2',       name: 'Petra Hansen' },
      { seat: '1 · BOW', name: 'Quinn Hayes' },
    ],
    swaps: [
      { change: '1V Seat 1/2: Roth ↔ Van Westreenen swap trial', impact: 'Net neutral (+0.1s)', impactPositive: false },
    ],
    runImpact: '+0.1s',
  },
  {
    id: 'h6',
    date: 'Mar 14, 2026 · 6:00 AM',
    month: 'March 2026',
    sessionTitle: '2K Race Simulation',
    boats: [
      { name: '1V 8+', time: '5:49.3' },
      { name: '2V 8+', time: '5:56.1' },
    ],
    lineup1V: [
      { seat: 'Cox',     name: 'Charly Johnson' },
      { seat: '8 · STR', name: 'Minou Bouman' },
      { seat: '7',       name: 'Ella Wheeler' },
      { seat: '6',       name: 'Lola Crampin' },
      { seat: '5',       name: 'Julia Irmler' },
      { seat: '4',       name: 'Lily Abbott' },
      { seat: '3',       name: 'Olivia Roth' },
      { seat: '2',       name: 'Star Miller' },
      { seat: '1 · BOW', name: 'Lotta Van Westreenen' },
    ],
    lineup2V: [
      { seat: 'Cox',     name: 'Casey Morgan' },
      { seat: '8 · STR', name: 'Sophia Bell' },
      { seat: '7',       name: 'Avery Ellis' },
      { seat: '6',       name: 'Chloe Kent' },
      { seat: '5',       name: 'Madison Ng' },
      { seat: '4',       name: 'Isabel Flores' },
      { seat: '3',       name: 'Madeline Cox' },
      { seat: '2',       name: 'Petra Hansen' },
      { seat: '1 · BOW', name: 'Bree Stone' },
    ],
    swaps: null,
  },
]
