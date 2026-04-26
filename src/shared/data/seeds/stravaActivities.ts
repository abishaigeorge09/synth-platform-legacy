/**
 * Seed Strava activities for Star Miller (athlete-miller-star).
 * 15 activities across April 1–24 2026: 8 rowing, 4 run, 2 cycle, 1 yoga.
 * Realistic HR / distance / duration for a college women's rower.
 */
import type { StravaActivity } from '../types'

const AID = 'athlete-miller-star'

export const SEED_STRAVA_ACTIVITIES: StravaActivity[] = [
  // ── Rowing (8) ────────────────────────────────────────────────────────────
  {
    id: 'strava-1',
    athleteId: AID,
    date: '2026-04-01',
    type: 'rowing',
    title: 'AM steady state — 12 km OTW',
    distanceMeters: 12000,
    durationSeconds: 3600, // 60 min
    avgHR: 148,
    maxHR: 162,
    calories: 620,
  },
  {
    id: 'strava-2',
    athleteId: AID,
    date: '2026-04-03',
    type: 'rowing',
    title: 'Pieces: 4×2 km race pace',
    distanceMeters: 10400,
    durationSeconds: 4200, // 70 min
    avgHR: 168,
    maxHR: 184,
    calories: 740,
  },
  {
    id: 'strava-3',
    athleteId: AID,
    date: '2026-04-06',
    type: 'rowing',
    title: '16 km OTW — long row',
    distanceMeters: 16000,
    durationSeconds: 5400, // 90 min
    avgHR: 142,
    maxHR: 158,
    calories: 810,
  },
  {
    id: 'strava-4',
    athleteId: AID,
    date: '2026-04-09',
    type: 'rowing',
    title: 'AM row — technical focus, 8 km',
    distanceMeters: 8000,
    durationSeconds: 2700, // 45 min
    avgHR: 138,
    maxHR: 152,
    calories: 420,
  },
  {
    id: 'strava-5',
    athleteId: AID,
    date: '2026-04-12',
    type: 'rowing',
    title: 'Race simulation — 2 km TT',
    distanceMeters: 9600,
    durationSeconds: 3300, // 55 min
    avgHR: 172,
    maxHR: 190,
    calories: 680,
  },
  {
    id: 'strava-6',
    athleteId: AID,
    date: '2026-04-15',
    type: 'rowing',
    title: 'PM steady state — 14 km OTW',
    distanceMeters: 14000,
    durationSeconds: 4500, // 75 min
    avgHR: 145,
    maxHR: 160,
    calories: 700,
  },
  {
    id: 'strava-7',
    athleteId: AID,
    date: '2026-04-19',
    type: 'rowing',
    title: 'AM pieces: 6×500 m sprint',
    distanceMeters: 11000,
    durationSeconds: 3900, // 65 min
    avgHR: 164,
    maxHR: 186,
    calories: 690,
  },
  {
    id: 'strava-8',
    athleteId: AID,
    date: '2026-04-22',
    type: 'rowing',
    title: 'Easy paddle + drills — 10 km',
    distanceMeters: 10000,
    durationSeconds: 3300, // 55 min
    avgHR: 134,
    maxHR: 148,
    calories: 480,
  },

  // ── Running (4) ───────────────────────────────────────────────────────────
  {
    id: 'strava-9',
    athleteId: AID,
    date: '2026-04-02',
    type: 'run',
    title: 'Easy recovery run — 5 km',
    distanceMeters: 5000,
    durationSeconds: 1560, // 26 min
    avgHR: 142,
    maxHR: 155,
    calories: 310,
    elevationGain: 32,
  },
  {
    id: 'strava-10',
    athleteId: AID,
    date: '2026-04-08',
    type: 'run',
    title: 'Tempo run — 6.5 km',
    distanceMeters: 6500,
    durationSeconds: 1920, // 32 min
    avgHR: 162,
    maxHR: 176,
    calories: 390,
    elevationGain: 48,
  },
  {
    id: 'strava-11',
    athleteId: AID,
    date: '2026-04-14',
    type: 'run',
    title: 'Hill repeats — campus loop',
    distanceMeters: 4200,
    durationSeconds: 1500, // 25 min
    avgHR: 168,
    maxHR: 182,
    calories: 340,
    elevationGain: 85,
  },
  {
    id: 'strava-12',
    athleteId: AID,
    date: '2026-04-20',
    type: 'run',
    title: 'Long easy run — 8 km',
    distanceMeters: 8000,
    durationSeconds: 2640, // 44 min
    avgHR: 146,
    maxHR: 160,
    calories: 470,
    elevationGain: 55,
  },

  // ── Cycling (2) ───────────────────────────────────────────────────────────
  {
    id: 'strava-13',
    athleteId: AID,
    date: '2026-04-05',
    type: 'cycle',
    title: 'Recovery spin — Grizzly Peak',
    distanceMeters: 18000,
    durationSeconds: 2700, // 45 min
    avgHR: 128,
    maxHR: 148,
    calories: 380,
    elevationGain: 220,
  },
  {
    id: 'strava-14',
    athleteId: AID,
    date: '2026-04-17',
    type: 'cycle',
    title: 'Endurance ride — Tilden loop',
    distanceMeters: 28000,
    durationSeconds: 4020, // 67 min
    avgHR: 138,
    maxHR: 158,
    calories: 540,
    elevationGain: 340,
  },

  // ── Yoga (1) ──────────────────────────────────────────────────────────────
  {
    id: 'strava-15',
    athleteId: AID,
    date: '2026-04-11',
    type: 'yoga',
    title: 'Vinyasa flow — team recovery',
    distanceMeters: 0,
    durationSeconds: 3000, // 50 min
    avgHR: 92,
    maxHR: 110,
    calories: 180,
  },
]
