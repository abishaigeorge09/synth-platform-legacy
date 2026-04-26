/**
 * Expanded session seed data with boats and splits.
 * The minimal SEED_SESSIONS in index.ts only had 1 entry — this module
 * provides a richer set for the Session Timer history and session detail views.
 */
import type { Session, SessionBoat, SessionSplit } from '../types'

const TEAM_ID = 'team-cal-womens-rowing'
const COACH_ID = 'user-coach-cal-womens'

// ─── Sessions ─────────────────────────────────────────────────────────────

export const SEED_SESSIONS_EXPANDED: Session[] = [
  {
    id: 'session-1',
    teamId: TEAM_ID,
    coachId: COACH_ID,
    date: '2026-03-16',
    type: 'erg_test',
    title: '316 2K test',
    notes: 'Primary season benchmark. Full roster tested.',
  },
  {
    id: 'session-2',
    teamId: TEAM_ID,
    coachId: COACH_ID,
    date: '2026-04-20',
    type: 'practice',
    title: 'Steady state 6K',
    notes: '1×6K at UT2, focus on consistent splits and ratio.',
  },
  {
    id: 'session-3',
    teamId: TEAM_ID,
    coachId: COACH_ID,
    date: '2026-04-18',
    type: 'race',
    title: 'Race piece practice',
    notes: '3×2K at race pace. 1V vs 2V side-by-side.',
  },
  {
    id: 'session-4',
    teamId: TEAM_ID,
    coachId: COACH_ID,
    date: '2026-04-15',
    type: 'practice',
    title: 'Interval session — 8×500m',
    notes: '8×500m with 2 min paddle rest. Descend 1–4, repeat.',
  },
]

// ─── Session boats ────────────────────────────────────────────────────────

export const SEED_SESSION_BOATS: SessionBoat[] = [
  // Session 1: 316 2K — erg test, no boats on water
  {
    id: 'sboat-1-1',
    sessionId: 'session-1',
    boatName: 'Erg bay',
    boatSize: 8,
    label: 'Erg',
  },

  // Session 2: Steady state 6K
  {
    id: 'sboat-2-1',
    sessionId: 'session-2',
    boatName: '1V',
    boatSize: 8,
    label: '8+',
  },
  {
    id: 'sboat-2-2',
    sessionId: 'session-2',
    boatName: '2V',
    boatSize: 8,
    label: '8+',
  },

  // Session 3: Race piece practice
  {
    id: 'sboat-3-1',
    sessionId: 'session-3',
    boatName: '1V',
    boatSize: 8,
    label: '8+',
  },
  {
    id: 'sboat-3-2',
    sessionId: 'session-3',
    boatName: '2V',
    boatSize: 8,
    label: '8+',
  },

  // Session 4: Intervals
  {
    id: 'sboat-4-1',
    sessionId: 'session-4',
    boatName: '1V',
    boatSize: 8,
    label: '8+',
  },
  {
    id: 'sboat-4-2',
    sessionId: 'session-4',
    boatName: '2V',
    boatSize: 8,
    label: '8+',
  },
  {
    id: 'sboat-4-3',
    sessionId: 'session-4',
    boatName: 'V4+',
    boatSize: 4,
    label: '4+',
  },
]

// ─── Session splits ───────────────────────────────────────────────────────

// Helper: ms from mm:ss.t
function t(min: number, sec: number): number {
  return (min * 60 + sec) * 1000
}

export const SEED_SESSION_SPLITS: SessionSplit[] = [
  // ── Session 2: Steady state 6K — 1V (12 splits at 500m) ────────────
  { id: 'sp-2-1-1',  sessionBoatId: 'sboat-2-1', splitNumber: 1,  elapsedMs: t(1, 52.3), intervalMs: t(1, 52.3), hasVideoMarker: false },
  { id: 'sp-2-1-2',  sessionBoatId: 'sboat-2-1', splitNumber: 2,  elapsedMs: t(3, 44.8), intervalMs: t(1, 52.5), hasVideoMarker: false },
  { id: 'sp-2-1-3',  sessionBoatId: 'sboat-2-1', splitNumber: 3,  elapsedMs: t(5, 37.0), intervalMs: t(1, 52.2), hasVideoMarker: false },
  { id: 'sp-2-1-4',  sessionBoatId: 'sboat-2-1', splitNumber: 4,  elapsedMs: t(7, 29.1), intervalMs: t(1, 52.1), hasVideoMarker: true, notes: 'Clean catches' },
  { id: 'sp-2-1-5',  sessionBoatId: 'sboat-2-1', splitNumber: 5,  elapsedMs: t(9, 21.8), intervalMs: t(1, 52.7), hasVideoMarker: false },
  { id: 'sp-2-1-6',  sessionBoatId: 'sboat-2-1', splitNumber: 6,  elapsedMs: t(11, 14.0), intervalMs: t(1, 52.2), hasVideoMarker: false },
  { id: 'sp-2-1-7',  sessionBoatId: 'sboat-2-1', splitNumber: 7,  elapsedMs: t(13, 6.5),  intervalMs: t(1, 52.5), hasVideoMarker: false },
  { id: 'sp-2-1-8',  sessionBoatId: 'sboat-2-1', splitNumber: 8,  elapsedMs: t(14, 58.7), intervalMs: t(1, 52.2), hasVideoMarker: false },
  { id: 'sp-2-1-9',  sessionBoatId: 'sboat-2-1', splitNumber: 9,  elapsedMs: t(16, 51.1), intervalMs: t(1, 52.4), hasVideoMarker: false },
  { id: 'sp-2-1-10', sessionBoatId: 'sboat-2-1', splitNumber: 10, elapsedMs: t(18, 43.0), intervalMs: t(1, 51.9), hasVideoMarker: true, notes: 'Rating crept up to 22' },
  { id: 'sp-2-1-11', sessionBoatId: 'sboat-2-1', splitNumber: 11, elapsedMs: t(20, 35.4), intervalMs: t(1, 52.4), hasVideoMarker: false },
  { id: 'sp-2-1-12', sessionBoatId: 'sboat-2-1', splitNumber: 12, elapsedMs: t(22, 27.0), intervalMs: t(1, 51.6), hasVideoMarker: false },

  // ── Session 2: Steady state 6K — 2V ────────────────────────────────
  { id: 'sp-2-2-1',  sessionBoatId: 'sboat-2-2', splitNumber: 1,  elapsedMs: t(1, 55.0), intervalMs: t(1, 55.0), hasVideoMarker: false },
  { id: 'sp-2-2-2',  sessionBoatId: 'sboat-2-2', splitNumber: 2,  elapsedMs: t(3, 50.5), intervalMs: t(1, 55.5), hasVideoMarker: false },
  { id: 'sp-2-2-3',  sessionBoatId: 'sboat-2-2', splitNumber: 3,  elapsedMs: t(5, 45.3), intervalMs: t(1, 54.8), hasVideoMarker: false },
  { id: 'sp-2-2-4',  sessionBoatId: 'sboat-2-2', splitNumber: 4,  elapsedMs: t(7, 40.8), intervalMs: t(1, 55.5), hasVideoMarker: false },
  { id: 'sp-2-2-5',  sessionBoatId: 'sboat-2-2', splitNumber: 5,  elapsedMs: t(9, 35.6), intervalMs: t(1, 54.8), hasVideoMarker: false },
  { id: 'sp-2-2-6',  sessionBoatId: 'sboat-2-2', splitNumber: 6,  elapsedMs: t(11, 31.0), intervalMs: t(1, 55.4), hasVideoMarker: false },
  { id: 'sp-2-2-7',  sessionBoatId: 'sboat-2-2', splitNumber: 7,  elapsedMs: t(13, 26.2), intervalMs: t(1, 55.2), hasVideoMarker: false },
  { id: 'sp-2-2-8',  sessionBoatId: 'sboat-2-2', splitNumber: 8,  elapsedMs: t(15, 21.0), intervalMs: t(1, 54.8), hasVideoMarker: false },
  { id: 'sp-2-2-9',  sessionBoatId: 'sboat-2-2', splitNumber: 9,  elapsedMs: t(17, 16.5), intervalMs: t(1, 55.5), hasVideoMarker: false },
  { id: 'sp-2-2-10', sessionBoatId: 'sboat-2-2', splitNumber: 10, elapsedMs: t(19, 11.3), intervalMs: t(1, 54.8), hasVideoMarker: false },
  { id: 'sp-2-2-11', sessionBoatId: 'sboat-2-2', splitNumber: 11, elapsedMs: t(21, 6.8),  intervalMs: t(1, 55.5), hasVideoMarker: false },
  { id: 'sp-2-2-12', sessionBoatId: 'sboat-2-2', splitNumber: 12, elapsedMs: t(23, 1.0),  intervalMs: t(1, 54.2), hasVideoMarker: false },

  // ── Session 3: Race pieces — 1V, 3 × 2K ────────────────────────────
  // Piece 1
  { id: 'sp-3-1-1', sessionBoatId: 'sboat-3-1', splitNumber: 1, elapsedMs: t(1, 42.8), intervalMs: t(1, 42.8), hasVideoMarker: true, notes: 'Strong start sequence' },
  { id: 'sp-3-1-2', sessionBoatId: 'sboat-3-1', splitNumber: 2, elapsedMs: t(3, 26.5), intervalMs: t(1, 43.7), hasVideoMarker: false },
  { id: 'sp-3-1-3', sessionBoatId: 'sboat-3-1', splitNumber: 3, elapsedMs: t(5, 10.0), intervalMs: t(1, 43.5), hasVideoMarker: false },
  { id: 'sp-3-1-4', sessionBoatId: 'sboat-3-1', splitNumber: 4, elapsedMs: t(6, 50.4), intervalMs: t(1, 40.4), hasVideoMarker: true, notes: 'Sprint — moved through 2V' },
  // Piece 2
  { id: 'sp-3-1-5', sessionBoatId: 'sboat-3-1', splitNumber: 5, elapsedMs: t(8, 34.0), intervalMs: t(1, 43.6), hasVideoMarker: false },
  { id: 'sp-3-1-6', sessionBoatId: 'sboat-3-1', splitNumber: 6, elapsedMs: t(10, 17.2), intervalMs: t(1, 43.2), hasVideoMarker: false },
  { id: 'sp-3-1-7', sessionBoatId: 'sboat-3-1', splitNumber: 7, elapsedMs: t(12, 0.8),  intervalMs: t(1, 43.6), hasVideoMarker: false },
  { id: 'sp-3-1-8', sessionBoatId: 'sboat-3-1', splitNumber: 8, elapsedMs: t(13, 41.5), intervalMs: t(1, 40.7), hasVideoMarker: false },
  // Piece 3
  { id: 'sp-3-1-9',  sessionBoatId: 'sboat-3-1', splitNumber: 9,  elapsedMs: t(15, 25.0), intervalMs: t(1, 43.5), hasVideoMarker: false },
  { id: 'sp-3-1-10', sessionBoatId: 'sboat-3-1', splitNumber: 10, elapsedMs: t(17, 9.2),  intervalMs: t(1, 44.2), hasVideoMarker: false },
  { id: 'sp-3-1-11', sessionBoatId: 'sboat-3-1', splitNumber: 11, elapsedMs: t(18, 52.0), intervalMs: t(1, 42.8), hasVideoMarker: false },
  { id: 'sp-3-1-12', sessionBoatId: 'sboat-3-1', splitNumber: 12, elapsedMs: t(20, 32.0), intervalMs: t(1, 40.0), hasVideoMarker: true, notes: 'Last sprint — PR pace' },

  // ── Session 3: Race pieces — 2V ─────────────────────────────────────
  { id: 'sp-3-2-1', sessionBoatId: 'sboat-3-2', splitNumber: 1, elapsedMs: t(1, 45.2), intervalMs: t(1, 45.2), hasVideoMarker: false },
  { id: 'sp-3-2-2', sessionBoatId: 'sboat-3-2', splitNumber: 2, elapsedMs: t(3, 31.0), intervalMs: t(1, 45.8), hasVideoMarker: false },
  { id: 'sp-3-2-3', sessionBoatId: 'sboat-3-2', splitNumber: 3, elapsedMs: t(5, 16.5), intervalMs: t(1, 45.5), hasVideoMarker: false },
  { id: 'sp-3-2-4', sessionBoatId: 'sboat-3-2', splitNumber: 4, elapsedMs: t(6, 59.8), intervalMs: t(1, 43.3), hasVideoMarker: false },

  // ── Session 4: Intervals — 1V, 8×500m (showing first 4) ────────────
  { id: 'sp-4-1-1', sessionBoatId: 'sboat-4-1', splitNumber: 1, elapsedMs: t(1, 41.5), intervalMs: t(1, 41.5), hasVideoMarker: false },
  { id: 'sp-4-1-2', sessionBoatId: 'sboat-4-1', splitNumber: 2, elapsedMs: t(3, 23.8), intervalMs: t(1, 42.3), hasVideoMarker: false },
  { id: 'sp-4-1-3', sessionBoatId: 'sboat-4-1', splitNumber: 3, elapsedMs: t(5, 4.5),  intervalMs: t(1, 40.7), hasVideoMarker: true, notes: 'Best interval of the set' },
  { id: 'sp-4-1-4', sessionBoatId: 'sboat-4-1', splitNumber: 4, elapsedMs: t(6, 46.2), intervalMs: t(1, 41.7), hasVideoMarker: false },
  { id: 'sp-4-1-5', sessionBoatId: 'sboat-4-1', splitNumber: 5, elapsedMs: t(8, 28.5), intervalMs: t(1, 42.3), hasVideoMarker: false },
  { id: 'sp-4-1-6', sessionBoatId: 'sboat-4-1', splitNumber: 6, elapsedMs: t(10, 10.0), intervalMs: t(1, 41.5), hasVideoMarker: false },
  { id: 'sp-4-1-7', sessionBoatId: 'sboat-4-1', splitNumber: 7, elapsedMs: t(11, 52.8), intervalMs: t(1, 42.8), hasVideoMarker: false },
  { id: 'sp-4-1-8', sessionBoatId: 'sboat-4-1', splitNumber: 8, elapsedMs: t(13, 33.0), intervalMs: t(1, 40.2), hasVideoMarker: true, notes: 'Sprint finish — full send' },

  // ── Session 4: Intervals — 2V ──────────────────────────────────────
  { id: 'sp-4-2-1', sessionBoatId: 'sboat-4-2', splitNumber: 1, elapsedMs: t(1, 44.0), intervalMs: t(1, 44.0), hasVideoMarker: false },
  { id: 'sp-4-2-2', sessionBoatId: 'sboat-4-2', splitNumber: 2, elapsedMs: t(3, 28.8), intervalMs: t(1, 44.8), hasVideoMarker: false },
  { id: 'sp-4-2-3', sessionBoatId: 'sboat-4-2', splitNumber: 3, elapsedMs: t(5, 12.5), intervalMs: t(1, 43.7), hasVideoMarker: false },
  { id: 'sp-4-2-4', sessionBoatId: 'sboat-4-2', splitNumber: 4, elapsedMs: t(6, 56.8), intervalMs: t(1, 44.3), hasVideoMarker: false },
  { id: 'sp-4-2-5', sessionBoatId: 'sboat-4-2', splitNumber: 5, elapsedMs: t(8, 41.0), intervalMs: t(1, 44.2), hasVideoMarker: false },
  { id: 'sp-4-2-6', sessionBoatId: 'sboat-4-2', splitNumber: 6, elapsedMs: t(10, 24.5), intervalMs: t(1, 43.5), hasVideoMarker: false },
  { id: 'sp-4-2-7', sessionBoatId: 'sboat-4-2', splitNumber: 7, elapsedMs: t(12, 9.2),  intervalMs: t(1, 44.7), hasVideoMarker: false },
  { id: 'sp-4-2-8', sessionBoatId: 'sboat-4-2', splitNumber: 8, elapsedMs: t(13, 51.5), intervalMs: t(1, 42.3), hasVideoMarker: false },

  // ── Session 4: Intervals — V4+ ─────────────────────────────────────
  { id: 'sp-4-3-1', sessionBoatId: 'sboat-4-3', splitNumber: 1, elapsedMs: t(1, 48.0), intervalMs: t(1, 48.0), hasVideoMarker: false },
  { id: 'sp-4-3-2', sessionBoatId: 'sboat-4-3', splitNumber: 2, elapsedMs: t(3, 37.5), intervalMs: t(1, 49.5), hasVideoMarker: false },
  { id: 'sp-4-3-3', sessionBoatId: 'sboat-4-3', splitNumber: 3, elapsedMs: t(5, 25.0), intervalMs: t(1, 47.5), hasVideoMarker: false },
  { id: 'sp-4-3-4', sessionBoatId: 'sboat-4-3', splitNumber: 4, elapsedMs: t(7, 13.8), intervalMs: t(1, 48.8), hasVideoMarker: false },
]
