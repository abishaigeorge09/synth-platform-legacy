import { create } from 'zustand'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

const KEY = 'synth:coach-onboarding'

export type CoachOnboardingTeam = {
  teamName: string
  sport: string
}

export type CoachOnboardingState = {
  team: CoachOnboardingTeam | null
  csvUploaded: boolean
  sourcesConnected: boolean
  setTeam: (team: CoachOnboardingTeam) => void
  setCsvUploaded: (v: boolean) => void
  setSourcesConnected: (v: boolean) => void
  reset: () => void
}

function read(): Pick<CoachOnboardingState, 'team' | 'csvUploaded' | 'sourcesConnected'> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      if (isSupabaseConfigured()) return { team: null, csvUploaded: false, sourcesConnected: false }
      return { team: { teamName: "Cal Women's Rowing", sport: 'Rowing' }, csvUploaded: true, sourcesConnected: true }
    }
    const v = JSON.parse(raw) as { team?: CoachOnboardingTeam | null; csvUploaded?: boolean; sourcesConnected?: boolean }
    return { team: v.team ?? null, csvUploaded: !!v.csvUploaded, sourcesConnected: !!v.sourcesConnected }
  } catch {
    return { team: { teamName: "Cal Women's Rowing", sport: 'Rowing' }, csvUploaded: true, sourcesConnected: true }
  }
}

function write(v: Pick<CoachOnboardingState, 'team' | 'csvUploaded' | 'sourcesConnected'>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}

export const useCoachOnboardingStore = create<CoachOnboardingState>((set) => {
  const initial = typeof window === 'undefined' ? { team: null, csvUploaded: false, sourcesConnected: false } : read()

  const commit = (next: Partial<Pick<CoachOnboardingState, 'team' | 'csvUploaded' | 'sourcesConnected'>>) =>
    set((s) => {
      const merged = {
        team: next.team ?? s.team,
        csvUploaded: next.csvUploaded ?? s.csvUploaded,
        sourcesConnected: next.sourcesConnected ?? s.sourcesConnected,
      }
      write(merged)
      return merged
    })

  return {
    ...initial,
    setTeam: (team) => commit({ team }),
    setCsvUploaded: (v) => commit({ csvUploaded: v }),
    setSourcesConnected: (v) => commit({ sourcesConnected: v }),
    reset: () => {
      try {
        localStorage.removeItem(KEY)
      } catch {
        /* ignore */
      }
      set({ team: null, csvUploaded: false, sourcesConnected: false })
    },
  }
})

export function isCoachOnboardingComplete(s: Pick<CoachOnboardingState, 'team' | 'csvUploaded' | 'sourcesConnected'>) {
  return !!s.team && s.csvUploaded && s.sourcesConnected
}
