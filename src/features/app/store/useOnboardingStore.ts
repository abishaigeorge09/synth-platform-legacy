import { create } from 'zustand'

type OnboardingState = {
  sport: string | null
  teamName: string
  athleteCountBand: string | null
  capabilities: string[]
  coachConnectors: string[]
  inviteCode: string
  athleteConnectors: string[]
  scanProgress: number
  scanStatus: string
  setSport: (sport: string) => void
  setTeamName: (name: string) => void
  setAthleteCountBand: (band: string) => void
  toggleCapability: (value: string) => void
  toggleCoachConnector: (id: string) => void
  setInviteCode: (code: string) => void
  toggleAthleteConnector: (id: string) => void
  setScanProgress: (pct: number, status?: string) => void
  reset: () => void
}

const initial: Pick<
  OnboardingState,
  | 'sport'
  | 'teamName'
  | 'athleteCountBand'
  | 'capabilities'
  | 'coachConnectors'
  | 'inviteCode'
  | 'athleteConnectors'
  | 'scanProgress'
  | 'scanStatus'
> = {
  sport: null,
  teamName: '',
  athleteCountBand: null,
  capabilities: [],
  coachConnectors: [],
  inviteCode: '',
  athleteConnectors: [],
  scanProgress: 0,
  scanStatus: '',
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  setSport: (sport) => set({ sport }),
  setTeamName: (teamName) => set({ teamName }),
  setAthleteCountBand: (athleteCountBand) => set({ athleteCountBand }),
  toggleCapability: (value) =>
    set((s) => ({
      capabilities: s.capabilities.includes(value)
        ? s.capabilities.filter((v) => v !== value)
        : [...s.capabilities, value],
    })),
  toggleCoachConnector: (id) =>
    set((s) => ({
      coachConnectors: s.coachConnectors.includes(id)
        ? s.coachConnectors.filter((v) => v !== id)
        : [...s.coachConnectors, id],
    })),
  setInviteCode: (inviteCode) => set({ inviteCode }),
  toggleAthleteConnector: (id) =>
    set((s) => ({
      athleteConnectors: s.athleteConnectors.includes(id)
        ? s.athleteConnectors.filter((v) => v !== id)
        : [...s.athleteConnectors, id],
    })),
  setScanProgress: (pct, status) =>
    set({ scanProgress: pct, scanStatus: status ?? '' }),
  reset: () => set({ ...initial }),
}))
