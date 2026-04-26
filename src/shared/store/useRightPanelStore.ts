import { create } from 'zustand'

type State = {
  open: boolean
  mode: 'chat' | 'compare' | 'none'
  athleteId?: string
  leftSessionId?: string
  rightSessionId?: string
  openChat: (args: { athleteId?: string }) => void
  openCompareEmpty: () => void
  openCompare: (args: { athleteId: string; leftSessionId: string; rightSessionId?: string }) => void
  close: () => void
}

export const useRightPanelStore = create<State>((set) => ({
  open: false,
  mode: 'none',
  openChat: ({ athleteId }) => set({ open: true, mode: 'chat', athleteId }),
  openCompareEmpty: () => set({ open: true, mode: 'compare', athleteId: undefined, leftSessionId: undefined, rightSessionId: undefined }),
  openCompare: ({ athleteId, leftSessionId, rightSessionId }) =>
    set({ open: true, mode: 'compare', athleteId, leftSessionId, rightSessionId }),
  close: () => set({ open: false, mode: 'none' }),
}))
