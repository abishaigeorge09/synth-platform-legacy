/**
 * Parsed from WOMENS_DATA.md (rowing_women_* ERGS-2 workbooks).
 * Source: /Users/abishaigeorgegosula/rowIQ/rowIQ_women_dashboard/WOMENS_DATA.md
 */
import type { DashboardAthleteRow } from '../components/SynthLayerDashboardMockup'

export const ROWIQ_SOURCE_FILES =
  'rowing_women__ 2024-2025 ERGS-2.xlsx · rowing_women_2025-2026 ERGS-2.xlsx'

export const ROWIQ_ROSTER_COUNT_2526 = 52
export const ROWIQ_SESSIONS_2425 = 19
export const ROWIQ_SESSIONS_2526 = 13

/** Sheet `316 2k` — 2026-03-16 (primary roster table for prototype). */
export const ROWIQ_SHEET_316_DATE = '2026-03-16'

/** Sheet `317 2K` — 2025-03-17 (YoY compare). */
export const ROWIQ_SHEET_317_DATE = '2025-03-17'

export type Erg2k316Row = {
  lastFirst: string
  time: string
  avgSplit: string
  rate: number
  watts: number
  note?: string
}

/** Full erg table — 316 2k (51 athletes with times; includes RP3 row). */
export const ERG_316_2K: Erg2k316Row[] = [
  { lastFirst: 'Wheeler, Ella', time: '6:35.6', avgSplit: '1:38.9', rate: 35, watts: 362 },
  { lastFirst: 'Irmler, Julia', time: '6:38.6', avgSplit: '1:39.6', rate: 34, watts: 354 },
  { lastFirst: 'Abbott, Lily', time: '6:41.7', avgSplit: '1:40.4', rate: 33, watts: 346 },
  { lastFirst: 'Miller, Star', time: '6:44.9', avgSplit: '1:41.2', rate: 35, watts: 337 },
  { lastFirst: 'Roth, Olivia', time: '6:48.1', avgSplit: '1:42.0', rate: 36, watts: 330 },
  { lastFirst: 'Cox, Madeline', time: '6:48.9', avgSplit: '1:42.2', rate: 36, watts: 327 },
  { lastFirst: 'Bouman, Minou', time: '6:50.0', avgSplit: '1:42.5', rate: 35, watts: 325 },
  { lastFirst: 'Crampin, Lola', time: '6:55.8', avgSplit: '1:43.9', rate: 34, watts: 312 },
  { lastFirst: 'Johnson, Charly', time: '6:56.5', avgSplit: '1:44.1', rate: 32, watts: 310 },
  { lastFirst: 'Bosio, Giulia', time: '6:57.2', avgSplit: '1:44.3', rate: 36, watts: 308 },
  { lastFirst: "O'Sullivan, Allegra", time: '6:57.5', avgSplit: '1:44.3', rate: 35, watts: 308 },
  { lastFirst: 'Mollee, Bonnie', time: '6:57.7', avgSplit: '1:44.4', rate: 31, watts: 307 },
  { lastFirst: 'Jamieson, Pippa', time: '6:58.7', avgSplit: '1:44.6', rate: 34, watts: 305 },
  { lastFirst: 'Frushtick, Chloe', time: '7:01.0', avgSplit: '1:45.2', rate: 34, watts: 300 },
  { lastFirst: 'Gallo, Alice', time: '7:02.7', avgSplit: '1:45.6', rate: 32, watts: 297 },
  { lastFirst: 'Banks, Claire', time: '7:02.8', avgSplit: '1:45.7', rate: 34, watts: 296 },
  { lastFirst: 'Hoadley, Zara', time: '7:03.7', avgSplit: '1:45.9', rate: 35, watts: 294 },
  { lastFirst: 'Pember, Lily', time: '7:03.8', avgSplit: '1:45.9', rate: 35, watts: 294 },
  { lastFirst: 'Pearson, Alex', time: '7:04.7', avgSplit: '1:46.1', rate: 38, watts: 292 },
  { lastFirst: 'Curven, Sidney', time: '7:05.0', avgSplit: '1:46.2', rate: 32, watts: 292 },
  { lastFirst: 'Spitz, Vivi', time: '7:06.2', avgSplit: '1:46.5', rate: 34, watts: 289 },
  { lastFirst: 'Knight, Beatrice', time: '7:06.4', avgSplit: '1:46.6', rate: 32, watts: 289 },
  { lastFirst: 'Pastorelli, Vicky', time: '7:06.7', avgSplit: '1:46.6', rate: 35, watts: 288 },
  { lastFirst: 'Furtaw, Rachel', time: '7:07.6', avgSplit: '1:46.9', rate: 35, watts: 287 },
  { lastFirst: 'Ausfahl, Alexandra', time: '7:13.5', avgSplit: '1:48.3', rate: 34, watts: 275 },
  { lastFirst: 'Brown, Annie', time: '7:13.8', avgSplit: '1:48.4', rate: 37, watts: 274 },
  { lastFirst: 'Landers, Kylie', time: '7:13.9', avgSplit: '1:48.4', rate: 36, watts: 274 },
  { lastFirst: 'Turner, Sophia', time: '7:15.5', avgSplit: '1:48.8', rate: 33, watts: 271 },
  { lastFirst: 'Harrington, Kylee', time: '7:16.5', avgSplit: '1:49.1', rate: 32, watts: 269 },
  { lastFirst: 'Hill, Charlotte', time: '7:16.8', avgSplit: '1:49.2', rate: 34, watts: 269 },
  { lastFirst: 'Bonnem, Lily', time: '7:17.4', avgSplit: '1:49.3', rate: 33, watts: 268 },
  { lastFirst: 'Nixon, Kate', time: '7:18.1', avgSplit: '1:49.5', rate: 32, watts: 266 },
  { lastFirst: 'Hammerer, Francesca', time: '7:18.3', avgSplit: '1:49.5', rate: 33, watts: 266 },
  { lastFirst: 'Barrancotto, Eve', time: '7:18.5', avgSplit: '1:49.6', rate: 32, watts: 266 },
  { lastFirst: 'Cheetham, Harri', time: '7:19.4', avgSplit: '1:49.8', rate: 34, watts: 264 },
  { lastFirst: 'Jennings, Gabby', time: '7:19.4', avgSplit: '1:49.8', rate: 36, watts: 264 },
  { lastFirst: 'Cramer, Frieda', time: '7:19.8', avgSplit: '1:49.9', rate: 36, watts: 263 },
  { lastFirst: 'Molloy, Louisa', time: '7:24.1', avgSplit: '1:51.0', rate: 34, watts: 256 },
  { lastFirst: 'Nelson, Maile', time: '7:26.6', avgSplit: '1:51.6', rate: 34, watts: 251 },
  { lastFirst: 'Furlonger, Amy', time: '7:26.6', avgSplit: '1:51.6', rate: 28, watts: 251 },
  { lastFirst: 'Andrews, Ava', time: '7:27.6', avgSplit: '1:51.9', rate: 33, watts: 250 },
  { lastFirst: 'Campbell, Amalia', time: '7:29.7', avgSplit: '1:52.4', rate: 36, watts: 246 },
  { lastFirst: 'Lovell, Cami', time: '7:33.2', avgSplit: '1:53.9', rate: 34, watts: 241 },
  { lastFirst: 'Laddy, Bella', time: '7:34.0', avgSplit: '1:53.5', rate: 30, watts: 239 },
  { lastFirst: 'Brooks, Ava', time: '7:38.7', avgSplit: '1:54.6', rate: 35, watts: 232 },
  {
    lastFirst: 'Van Westreenen, Lotta',
    time: '6:45.6',
    avgSplit: '1:41.4',
    rate: 39,
    watts: 305,
    note: 'RP3 (not Concept2)',
  },
]

/** Paired 317 vs 316 times for athletes in both tests (seconds). */
export const ERG_2K_YOY: { short: string; y2025: string; y2026: string; deltaSec: number }[] = [
  { short: 'E. Wheeler', y2025: '6:42.5', y2026: '6:35.6', deltaSec: -6.9 },
  { short: 'L. Abbott', y2025: '6:44.4', y2026: '6:41.7', deltaSec: -2.7 },
  { short: 'J. Irmler', y2025: '6:46.5', y2026: '6:38.6', deltaSec: -7.9 },
  { short: 'S. Miller', y2025: '6:46.6', y2026: '6:44.9', deltaSec: -1.7 },
  { short: 'O. Roth', y2025: '6:48.6', y2026: '6:48.1', deltaSec: -0.5 },
  { short: 'M. Cox', y2025: '6:59.2', y2026: '6:48.9', deltaSec: -10.3 },
  { short: 'M. Bouman', y2025: '6:57.7', y2026: '6:50.0', deltaSec: -7.7 },
  { short: 'L. Crampin', y2025: '6:57.6', y2026: '6:55.8', deltaSec: -1.8 },
]

function shortAthleteName(lastFirst: string): string {
  const parts = lastFirst.split(', ')
  const last = parts[0]?.trim()
  const first = parts[1]?.trim()
  if (!first || !last) return lastFirst
  return `${first[0]}. ${last}`
}

function ergSeconds(time: string): number {
  const [mins, sec] = time.split(':')
  return parseInt(mins, 10) * 60 + parseFloat(sec)
}

function loadFromWatts(watts: number): 'High' | 'Med' | 'Low' {
  if (watts >= 325) return 'High'
  if (watts >= 285) return 'Med'
  return 'Low'
}

function toDashboardRow(r: Erg2k316Row): DashboardAthleteRow {
  const risk = r.watts <= 240 || ergSeconds(r.time) > 7 * 60 + 35
  return {
    name: shortAthleteName(r.lastFirst),
    pos: r.note ?? `${r.rate} spm`,
    erg: r.time,
    split: r.avgSplit,
    squat: String(r.watts),
    load: loadFromWatts(r.watts),
    sleep: '—',
    comply: '—',
    risk,
  }
}

export const ROWIQ_TABLE_HEADERS = [
  'Athlete',
  'Erg 2K',
  'Avg /500',
  'Watts',
  'Load',
  'Wellness',
  'Team log',
  'Status',
] as const

export const ROWIQ_TEAM_SUBTITLE = `Cal Women's · ${ROWIQ_ROSTER_COUNT_2526} on Names roster · ${ROWIQ_SESSIONS_2425} sessions (24–25) + ${ROWIQ_SESSIONS_2526} sessions (25–26) · Latest erg: ${ROWIQ_SHEET_316_DATE} sheet 316 2k`

export const ROWIQ_ATHLETE_ROWS: DashboardAthleteRow[] = ERG_316_2K.map(toDashboardRow)

/** Primary strip: 2025–26 workbook sessions by calendar month (Sep–Mar). */
export const ROWIQ_SIGNAL_MONTH_LABELS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
/** Session counts from WOMENS_DATA.md season table (zeros = no dated sessions that month). */
export const ROWIQ_SESSIONS_BY_MONTH_SEP_MAR = [3, 3, 0, 0, 3, 2, 2] as const
export const ROWIQ_SIGNAL_MONTH_VALUES = [...ROWIQ_SESSIONS_BY_MONTH_SEP_MAR]

/** Secondary: last four scored workouts before 316 2k (chronological blocks). */
export const ROWIQ_SIGNAL_BLOCK_LABELS = ['6k 1/30', '9×2k', '4×1k', '2×6k']
export const ROWIQ_SIGNAL_BLOCK_VALUES = [78, 92, 85, 88]

export const ROWIQ_AI_INSIGHT = `Latest pull: sheet 316 2k (${ROWIQ_SHEET_316_DATE}) — ${ERG_316_2K.length} rows including RP3 note. Team leader Wheeler, Ella at 6:35.6 / 362W (was 6:42.5 on 317 2K ${ROWIQ_SHEET_317_DATE}). Cox, Madeline improved ~10s YoY (6:59.2 → 6:48.9). Data quality: 317 2K row Hunt-Davis split 3 reads 2:42.3 — doc flags as likely typo for 1:42.3. Watts only exist on 2k and race-pace pieces per notes. Ingest: ${ROWIQ_SOURCE_FILES}.`

export const ROWIQ_SOURCES_INGEST = `${ROWIQ_SESSIONS_2425 + ROWIQ_SESSIONS_2526} erg sessions · ${ROWIQ_SOURCE_FILES}`
