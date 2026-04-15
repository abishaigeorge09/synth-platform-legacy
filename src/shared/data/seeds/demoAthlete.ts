/**
 * The "current athlete" for the athlete-side demo. In production this comes
 * from the signed-in user. For now we hardcode Star Miller — she's in both
 * the 2025 and 2026 erg tests (see SEED_ATHLETE_YOY), so her stats page
 * renders a real progression chart.
 */
import { SEED_ATHLETES, SEED_ERG_SCORES, SEED_TEAM_CAL_WOMENS, SEED_COACH } from './index'
import { SEED_ATHLETE_YOY } from './athleteExtras'

const DEMO_ATHLETE_ID = 'athlete-miller-star'

export const DEMO_ATHLETE = SEED_ATHLETES.find((a) => a.id === DEMO_ATHLETE_ID) ?? SEED_ATHLETES[0]

export const DEMO_ATHLETE_ERG = SEED_ERG_SCORES.find((e) => e.athleteId === DEMO_ATHLETE.id)
export const DEMO_ATHLETE_YOY = SEED_ATHLETE_YOY.find((p) => p.athleteId === DEMO_ATHLETE.id) ?? null

/** Teammates list — everyone else on the roster, sorted by 2K time. */
export const DEMO_ATHLETE_TEAMMATES = SEED_ATHLETES.filter((a) => a.id !== DEMO_ATHLETE.id)

/** Synthetic session history for the demo athlete. */
export const DEMO_ATHLETE_SESSIONS = [
  {
    id: 'sess-2026-04-14',
    date: '2026-04-14',
    title: 'Morning pieces',
    boat: '1V 8+',
    seat: '5',
    splits: ['1:48.2', '1:49.0', '1:47.8', '1:48.4', '1:47.1'],
    note: '5 × 500m at race cadence',
  },
  {
    id: 'sess-2026-04-12',
    date: '2026-04-12',
    title: 'Erg pieces',
    boat: '—',
    seat: '—',
    splits: ['1:45.3', '1:46.1', '1:46.8'],
    note: '3 × 1k — simulated 2K splits',
  },
  {
    id: 'sess-2026-04-10',
    date: '2026-04-10',
    title: 'Steady state',
    boat: '1V 8+',
    seat: '5',
    splits: ['1:52.4', '1:52.9', '1:52.6'],
    note: '3 × 20 min UT2',
  },
  {
    id: 'sess-2026-04-08',
    date: '2026-04-08',
    title: 'Pyramid',
    boat: '2V 8+',
    seat: '3',
    splits: ['1:50.2', '1:48.3', '1:47.0', '1:48.1', '1:50.0'],
    note: '5 x pyramid stroke rate',
  },
]

export const DEMO_ATHLETE_LINEUPS = [
  { id: 'l1', date: '2026-04-14', session: 'Saturday pieces', boat: '1V 8+', seat: 5, side: 'starboard' },
  { id: 'l2', date: '2026-04-07', session: 'Race day', boat: '1V 8+', seat: 5, side: 'starboard' },
  { id: 'l3', date: '2026-03-31', session: '2K race sim', boat: '1V 8+', seat: 4, side: 'port' },
  { id: 'l4', date: '2026-03-24', session: 'Steady state', boat: '2V 8+', seat: 6, side: 'port' },
]

export const DEMO_ATHLETE_PERSONAL_SOURCES = [
  { id: 'ps1', name: 'My personal erg log', type: 'Google Sheets', status: 'connected', lastSync: '2h ago' },
  { id: 'ps2', name: 'Whoop (personal)', type: 'Wearable', status: 'connected', lastSync: 'live' },
  { id: 'ps3', name: 'Screenshots folder', type: 'Manual upload', status: 'idle', lastSync: '—' },
]

export const DEMO_TEAM = SEED_TEAM_CAL_WOMENS
export const DEMO_COACH = SEED_COACH
