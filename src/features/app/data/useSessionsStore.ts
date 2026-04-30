import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Boat, RacePreset } from './lineupBuilderStore'

// ─── Demo seed data ─────────────────────────────────────────────────────────
// Seeded once (when localStorage is empty). Dates are relative to 2026-04-29.

// V8 A — top 8 Pacific Women athletes by 2026 erg performance
// (Star Miller first as demo self; then Wheeler, Irmler, Abbott, Roth, Cox, Bouman, Crampin)
const V8A: Boat = {
  id: 'seed-boat-v8a',
  name: 'V8 A',
  size: '8+',
  color: '#BAE6FD', // cardSky
  speed: 1.0,
  seats: [
    { position: 1, label: 'Stroke',  athleteId: 'a-miller-star'   },
    { position: 2, label: '7 seat',  athleteId: 'a-wheeler-ella'  },
    { position: 3, label: '6 seat',  athleteId: 'a-irmler-julia'  },
    { position: 4, label: '5 seat',  athleteId: 'a-abbott-lily'   },
    { position: 5, label: '4 seat',  athleteId: 'a-roth-olivia'   },
    { position: 6, label: '3 seat',  athleteId: 'a-cox-madeline'  },
    { position: 7, label: '2 seat',  athleteId: 'a-bouman-minou'  },
    { position: 8, label: 'Bow',     athleteId: 'a-crampin-lola'  },
    { position: 9, label: 'Cox',     athleteId: 'a-andie-vega'    },
  ],
}

// V4+ A — next tier by erg rank
const V4A: Boat = {
  id: 'seed-boat-v4a',
  name: 'V4+ A',
  size: '4+',
  color: '#BBF7D0', // cardMint
  speed: 0.988,
  seats: [
    { position: 1, label: 'Stroke', athleteId: 'a-johnson-charly'  },
    { position: 2, label: '3 seat', athleteId: 'a-bosio-giulia'    },
    { position: 3, label: '2 seat', athleteId: 'a-osullivan-allegra' },
    { position: 4, label: 'Bow',    athleteId: 'a-mollee-bonnie'   },
    { position: 5, label: 'Cox',    athleteId: 'a-pia-roman'       },
  ],
}

// V8 B — second eight (Jamieson through Curven by erg rank)
const V8B: Boat = {
  id: 'seed-boat-v8b',
  name: 'V8 B',
  size: '8+',
  color: '#FBCFE8', // cardPink
  speed: 0.988,
  seats: [
    { position: 1, label: 'Stroke',  athleteId: 'a-jamieson-pippa'   },
    { position: 2, label: '7 seat',  athleteId: 'a-frushtick-chloe'  },
    { position: 3, label: '6 seat',  athleteId: 'a-gallo-alice'      },
    { position: 4, label: '5 seat',  athleteId: 'a-banks-claire'     },
    { position: 5, label: '4 seat',  athleteId: 'a-hoadley-zara'     },
    { position: 6, label: '3 seat',  athleteId: 'a-pember-lily'      },
    { position: 7, label: '2 seat',  athleteId: 'a-pearson-alex'     },
    { position: 8, label: 'Bow',     athleteId: 'a-curven-sidney'    },
    { position: 9, label: 'Cox',     athleteId: 'a-tess-kim'         },
  ],
}

const SEED_PRESET: RacePreset = {
  raceFor: 'Steady state',
  distance: '20 min',
  splits: [],
  splitUnit: 's',
  expectedDurationMs: 20 * 60 * 1000,
}

const DEMO_SESSIONS: Session[] = [
  {
    id: 'seed-sess-today',
    name: 'AM steady state · V8',
    type: 'Steady state',
    date: '2026-04-29',
    time: '06:30',
    notes: '',
    status: 'scheduled',
    boats: [V8A],
    preset: SEED_PRESET,
    runs: [],
    createdAt: '2026-04-28T18:00:00.000Z',
  },
  {
    id: 'seed-sess-tomorrow',
    name: 'Race-pace pieces · 4 × 500m',
    type: 'Practice piece',
    date: '2026-04-30',
    time: '06:00',
    notes: '',
    status: 'scheduled',
    boats: [V8A, V8B],
    preset: SEED_PRESET,
    runs: [],
    createdAt: '2026-04-28T18:01:00.000Z',
  },
  {
    id: 'seed-sess-may1',
    name: 'V8 seat race · stroke vs 7',
    type: 'Seat race',
    date: '2026-05-01',
    time: '06:00',
    notes: '',
    status: 'scheduled',
    boats: [V8A, V4A],
    preset: SEED_PRESET,
    runs: [],
    createdAt: '2026-04-28T18:02:00.000Z',
  },
  {
    id: 'seed-sess-race',
    name: 'Pacific Invite Regatta · grand finals',
    type: 'Race',
    date: '2026-05-03',
    time: '05:30',
    notes: 'Race day — arrive early.',
    status: 'scheduled',
    boats: [V8A, V4A],
    preset: SEED_PRESET,
    runs: [],
    createdAt: '2026-04-28T18:03:00.000Z',
  },
]

export type SessionStatus = 'scheduled' | 'in-progress' | 'needs-rating' | 'completed'

export type RunSplit = {
  boatId: string
  ts: number // ms since that boat's individual start
}

export type RunSwap = {
  /** Boat the swap was applied within (cross-boat swaps not yet supported) */
  boatId: string
  /** Seat position the new athlete now occupies */
  position: number
  fromAthleteId: string | null
  toAthleteId: string | null
}

export type SessionRun = {
  id: string
  /** "Run 1", "Run 2", … */
  title: string
  /** ISO timestamp when this run was started */
  startedAt: string
  finishedAt?: string
  /** Lineup snapshot at the start of this run — cloned from the prior
   * run (or the session's published boats for the first run) and with
   * any inter-run swaps applied. */
  boatsSnapshot: Boat[]
  /** Boats started together — each entry is a list of boatIds. Solo
   * boats appear as single-element arrays. */
  raceGroups: string[][]
  /** Per-boat final elapsed ms */
  boatElapsed: Record<string, number>
  splits: RunSplit[]
  /** Athlete swaps applied between the previous run and this one. */
  swaps?: RunSwap[]
  notes?: string
  ratings?: { boatId: string; technique: number; power: number; sync: number }[]
  ratedByCoach?: string
}

export type Session = {
  id: string
  /** Coach-given name, e.g. "Wednesday AM steady state" */
  name: string
  /** "Practice piece" / "Time trial" / "Seat race" / "Race" / "Open" */
  type: string
  /** YYYY-MM-DD */
  date: string
  /** HH:mm in 24h. Optional — older sessions may not have a time. */
  time?: string
  notes: string
  status: SessionStatus
  /** Snapshot of boats at the moment the session was published */
  boats: Boat[]
  preset: RacePreset
  /** Runs accumulated across the session */
  runs: SessionRun[]
  createdAt: string
}

type State = {
  sessions: Session[]
  _seeded: boolean
  seedIfEmpty: () => void
  addSession: (session: Omit<Session, 'id' | 'runs' | 'createdAt' | 'status'> & { status?: SessionStatus }) => Session
  updateSession: (id: string, patch: Partial<Session>) => void
  removeSession: (id: string) => void
  addRun: (sessionId: string, run: Omit<SessionRun, 'id'>) => SessionRun
  updateRun: (sessionId: string, runId: string, patch: Partial<SessionRun>) => void
  /** Coach skipped rating at finish — session is awaiting ratings. */
  markNeedsRating: (sessionId: string) => void
  /** Ratings saved (or session genuinely complete). */
  markCompleted: (sessionId: string) => void
  finishSession: (sessionId: string) => void
}

const STORAGE_KEY = 'synth:app:sessions:v2'

export const useSessionsStore = create<State>()(
  persist(
    (set, get) => ({
      sessions: [],
      _seeded: false,
      seedIfEmpty: () => {
        const { sessions, _seeded } = get()
        if (_seeded || sessions.length > 0) {
          set({ _seeded: true })
          return
        }
        set({ sessions: DEMO_SESSIONS, _seeded: true })
      },
      addSession: (input) => {
        const session: Session = {
          ...input,
          id: `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: input.status ?? 'scheduled',
          runs: [],
          createdAt: new Date().toISOString(),
        }
        set({ sessions: [session, ...get().sessions] })
        return session
      },
      updateSession: (id, patch) => {
        set({
          sessions: get().sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })
      },
      removeSession: (id) => {
        set({ sessions: get().sessions.filter((s) => s.id !== id) })
      },
      addRun: (sessionId, run) => {
        const newRun: SessionRun = {
          ...run,
          id: `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        }
        set({
          sessions: get().sessions.map((s) =>
            s.id === sessionId ? { ...s, runs: [...s.runs, newRun], status: 'in-progress' } : s,
          ),
        })
        return newRun
      },
      updateRun: (sessionId, runId, patch) => {
        set({
          sessions: get().sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  runs: s.runs.map((r) => (r.id === runId ? { ...r, ...patch } : r)),
                }
              : s,
          ),
        })
      },
      markNeedsRating: (sessionId) => {
        set({
          sessions: get().sessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'needs-rating' } : s,
          ),
        })
      },
      markCompleted: (sessionId) => {
        set({
          sessions: get().sessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'completed' } : s,
          ),
        })
      },
      finishSession: (sessionId) => {
        set({
          sessions: get().sessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'completed' } : s,
          ),
        })
      },
    }),
    { name: STORAGE_KEY },
  ),
)

/** Helper for sorting sessions by date, most-recent first. */
export function sortSessionsByDate(sessions: Session[]): Session[] {
  return [...sessions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}
