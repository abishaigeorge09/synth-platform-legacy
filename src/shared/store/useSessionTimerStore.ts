import { create } from 'zustand'
import type { Split } from '../../features/coach/tools/sessionTimer/components/useStopwatch'

export type TimerBoat = {
  id: string
  name: string
  athleteNames: string[]
}

export type TimerHistoryEntry = {
  id: string
  boatId: string
  boatName: string
  createdAt: string
  elapsedMs: number
  splits: Split[]
}

type SessionTimerState = {
  boats: TimerBoat[]
  history: TimerHistoryEntry[]
  setInitialBoatsIfEmpty: (boats: TimerBoat[]) => void
  addBoat: (boat?: Partial<TimerBoat>) => void
  removeBoat: (boatId: string) => void
  renameBoat: (boatId: string, name: string) => void
  recordFinish: (args: { boatId: string; boatName: string; elapsedMs: number; splits: Split[] }) => void
  clearHistory: () => void
}

export const useSessionTimerStore = create<SessionTimerState>((set) => ({
  boats: [],
  history: [],
  setInitialBoatsIfEmpty: (boats) =>
    set((s) => (s.boats.length ? s : { boats })),
  addBoat: (boat) =>
    set((s) => ({
      boats: [
        ...s.boats,
        {
          id: boat?.id ?? `boat-${Date.now()}`,
          name: boat?.name ?? `${s.boats.length + 1}V 4+`,
          athleteNames: boat?.athleteNames ?? [],
        },
      ],
    })),
  removeBoat: (boatId) =>
    set((s) => ({ boats: s.boats.filter((b) => b.id !== boatId) })),
  renameBoat: (boatId, name) =>
    set((s) => ({ boats: s.boats.map((b) => (b.id === boatId ? { ...b, name } : b)) })),
  recordFinish: ({ boatId, boatName, elapsedMs, splits }) =>
    set((s) => ({
      history: [
        {
          id: `timer-${boatId}-${Date.now()}`,
          boatId,
          boatName,
          createdAt: new Date().toISOString(),
          elapsedMs,
          splits,
        },
        ...s.history,
      ],
    })),
  clearHistory: () => set({ history: [] }),
}))

