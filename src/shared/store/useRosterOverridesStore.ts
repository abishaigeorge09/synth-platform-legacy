import { create } from 'zustand'
import type { Athlete } from '@shared/data/types'

const KEY = 'synth:roster-overrides'

type Persisted = {
  addedAthletes: Athlete[]
  statusOverrides: Array<[string, Athlete['status']]>
}

type State = {
  addedAthletes: Athlete[]
  statusOverrides: Map<string, Athlete['status']>
  addMany: (athletes: Athlete[]) => void
  setStatus: (athleteId: string, status: Athlete['status']) => void
  clear: () => void
}

function read(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { addedAthletes: [], statusOverrides: [] }
    const v = JSON.parse(raw) as Persisted
    return {
      addedAthletes: Array.isArray(v.addedAthletes) ? v.addedAthletes : [],
      statusOverrides: Array.isArray(v.statusOverrides) ? v.statusOverrides : [],
    }
  } catch {
    return { addedAthletes: [], statusOverrides: [] }
  }
}

function write(v: Persisted) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}

export const useRosterOverridesStore = create<State>((set, get) => {
  const initial = typeof window === 'undefined' ? { addedAthletes: [], statusOverrides: [] as Array<[string, Athlete['status']]> } : read()
  const statusMap = new Map<string, Athlete['status']>(initial.statusOverrides)

  const commit = (next: { addedAthletes: Athlete[]; statusOverrides: Map<string, Athlete['status']> }) => {
    write({ addedAthletes: next.addedAthletes, statusOverrides: Array.from(next.statusOverrides.entries()) })
    set({ addedAthletes: next.addedAthletes, statusOverrides: next.statusOverrides })
  }

  return {
    addedAthletes: initial.addedAthletes,
    statusOverrides: statusMap,
    addMany: (athletes) => {
      const s = get()
      const merged = [...s.addedAthletes, ...athletes]
      commit({ addedAthletes: merged, statusOverrides: s.statusOverrides })
    },
    setStatus: (athleteId, status) => {
      const s = get()
      const next = new Map(s.statusOverrides)
      next.set(athleteId, status)
      commit({ addedAthletes: s.addedAthletes, statusOverrides: next })
    },
    clear: () => {
      commit({ addedAthletes: [], statusOverrides: new Map<string, Athlete['status']>() })
    },
  }
})
