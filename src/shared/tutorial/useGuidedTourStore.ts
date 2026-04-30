import { create } from 'zustand'

const GUIDED_TOUR_KEY = 'synth:guided-tour:v1'

type PersistedState = { active: boolean; step: number; done: boolean }

type GuidedTourState = PersistedState & {
  startTour: () => void
  advanceStep: (totalSteps: number) => void
  completeTour: () => void
}

function readState(): PersistedState {
  if (typeof window === 'undefined') return { active: false, step: 0, done: false }
  try {
    const raw = window.localStorage.getItem(GUIDED_TOUR_KEY)
    if (!raw) return { active: false, step: 0, done: false }
    return JSON.parse(raw) as PersistedState
  } catch {
    return { active: false, step: 0, done: false }
  }
}

function persist(state: PersistedState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(GUIDED_TOUR_KEY, JSON.stringify(state))
}

export const useGuidedTourStore = create<GuidedTourState>((set) => {
  const initial = readState()
  return {
    ...initial,
    startTour: () => {
      const next: PersistedState = { active: true, step: 0, done: false }
      persist(next)
      set(next)
    },
    advanceStep: (totalSteps) => {
      set((s) => {
        const nextStep = s.step + 1
        if (nextStep >= totalSteps) {
          const next: PersistedState = { active: false, step: 0, done: true }
          persist(next)
          return next
        }
        const next: PersistedState = { active: true, step: nextStep, done: false }
        persist(next)
        return next
      })
    },
    completeTour: () => {
      const next: PersistedState = { active: false, step: 0, done: true }
      persist(next)
      set(next)
    },
  }
})

/** Call this on sign-out so a fresh user sees the tour. */
export function clearGuidedTour() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(GUIDED_TOUR_KEY)
  }
}
