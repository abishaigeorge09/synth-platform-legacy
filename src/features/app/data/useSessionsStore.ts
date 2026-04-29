import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Boat, RacePreset } from './lineupBuilderStore'

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

const STORAGE_KEY = 'synth:app:sessions'

export const useSessionsStore = create<State>()(
  persist(
    (set, get) => ({
      sessions: [],
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
