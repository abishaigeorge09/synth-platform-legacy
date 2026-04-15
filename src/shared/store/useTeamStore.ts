import { create } from 'zustand'
import type { Team } from '../data/types'
import { SEED_TEAM_CAL_WOMENS } from '../data/seeds'

type TeamState = {
  activeTeam: Team
  setActiveTeam: (team: Team) => void
}

export const useTeamStore = create<TeamState>((set) => ({
  activeTeam: SEED_TEAM_CAL_WOMENS,
  setActiveTeam: (team) => set({ activeTeam: team }),
}))
