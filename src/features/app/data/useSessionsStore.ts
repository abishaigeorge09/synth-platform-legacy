import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Boat, RacePreset } from './lineupBuilderStore'

export type SessionStatus = 'scheduled' | 'in-progress' | 'completed'

export type RunSplit = {
  boatId: string
  ts: number // ms since that boat's individual start
}

export type SessionRun = {
  id: string
  /** ISO timestamp when this run was started */
  startedAt: string
  finishedAt?: string
  /** Per-boat individual elapsed ms (boats can be started/stopped independently) */
  boatElapsed: Record<string, number>
  /** Per-boat individual start ms (perf.now()) — only present while live */
  boatStartedAt?: Record<string, number | null>
  splits: RunSplit[]
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
  /** Add a freshly published session (status='scheduled' if future, 'in-progress' if started). */
  addSession: (session: Omit<Session, 'id' | 'runs' | 'createdAt' | 'status'> & { status?: SessionStatus }) => Session
  updateSession: (id: string, patch: Partial<Session>) => void
  removeSession: (id: string) => void
  addRun: (sessionId: string, run: Omit<SessionRun, 'id'>) => SessionRun
  updateRun: (sessionId: string, runId: string, patch: Partial<SessionRun>) => void
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
