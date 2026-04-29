import { create } from 'zustand'

/**
 * Tutorial state — tracks which tours the current user (this device) has
 * completed, plus the in-flight active tour. Persists to localStorage so a
 * tour only auto-fires once per page.
 */

const STORAGE_KEY = 'synth:tutorial:v1'

type Persisted = {
  seen: string[] // tour ids the user has finished or skipped
}

function readPersisted(): Persisted {
  if (typeof window === 'undefined') return { seen: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { seen: [] }
    const parsed = JSON.parse(raw) as Partial<Persisted>
    return { seen: Array.isArray(parsed.seen) ? parsed.seen.filter((x): x is string => typeof x === 'string') : [] }
  } catch {
    return { seen: [] }
  }
}

function writePersisted(state: Persisted) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors (private mode etc.)
  }
}

type TutorialState = {
  /** Tour ids that have been completed or skipped on this device. */
  seen: Set<string>
  /** Currently running tour id (null if none). */
  activeTourId: string | null
  /** Index into the active tour's steps array. */
  stepIndex: number

  /** Begin or resume a tour. Resets stepIndex to 0. */
  start: (tourId: string) => void
  /** Advance to the next step. If past the last step, completes. */
  next: () => void
  /** Step backwards (clamped to 0). */
  back: () => void
  /** Skip / dismiss — marks the active tour as seen and closes. */
  skip: () => void
  /** Mark complete — same as skip but semantically "finished". */
  complete: () => void
  /** Forget the active tour without marking it seen (e.g. lost-target). */
  abort: () => void
  /** Has the user already seen this tour? */
  hasSeen: (tourId: string) => boolean
  /** Wipe the seen set so every tour can auto-fire again. */
  resetAll: () => void
  /** Replay a specific tour even if seen. */
  replay: (tourId: string) => void
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  seen: new Set(readPersisted().seen),
  activeTourId: null,
  stepIndex: 0,

  start: (tourId) => set({ activeTourId: tourId, stepIndex: 0 }),

  next: () => set((s) => ({ stepIndex: s.stepIndex + 1 })),

  back: () => set((s) => ({ stepIndex: Math.max(0, s.stepIndex - 1) })),

  skip: () => {
    const id = get().activeTourId
    if (!id) return
    const seen = new Set(get().seen)
    seen.add(id)
    writePersisted({ seen: [...seen] })
    set({ seen, activeTourId: null, stepIndex: 0 })
  },

  complete: () => {
    const id = get().activeTourId
    if (!id) return
    const seen = new Set(get().seen)
    seen.add(id)
    writePersisted({ seen: [...seen] })
    set({ seen, activeTourId: null, stepIndex: 0 })
  },

  abort: () => set({ activeTourId: null, stepIndex: 0 }),

  hasSeen: (tourId) => get().seen.has(tourId),

  resetAll: () => {
    writePersisted({ seen: [] })
    set({ seen: new Set(), activeTourId: null, stepIndex: 0 })
  },

  replay: (tourId) => {
    // Remove from seen so it's eligible again, then start.
    const seen = new Set(get().seen)
    seen.delete(tourId)
    writePersisted({ seen: [...seen] })
    set({ seen, activeTourId: tourId, stepIndex: 0 })
  },
}))
