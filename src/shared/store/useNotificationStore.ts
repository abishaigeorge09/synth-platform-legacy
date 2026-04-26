import { create } from 'zustand'

const KEY = 'synth:notifications-read'

type State = {
  readIds: Set<string>
  panelOpen: boolean
  openPanel: () => void
  closePanel: () => void
  markRead: (id: string) => void
  markManyRead: (ids: string[]) => void
  clear: () => void
}

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function write(setIds: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(setIds)))
  } catch {
    /* ignore */
  }
}

export const useNotificationStore = create<State>((set, get) => ({
  readIds: typeof window === 'undefined' ? new Set() : read(),
  panelOpen: false,
  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),
  markRead: (id) => {
    const next = new Set(get().readIds)
    next.add(id)
    write(next)
    set({ readIds: next })
  },
  markManyRead: (ids) => {
    const next = new Set(get().readIds)
    ids.forEach((id) => next.add(id))
    write(next)
    set({ readIds: next })
  },
  clear: () => {
    const next = new Set<string>()
    write(next)
    set({ readIds: next, panelOpen: false })
  },
}))

