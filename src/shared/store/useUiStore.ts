import { create } from 'zustand'

type UiState = {
  sidebarCollapsed: boolean
  agentModalOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  openAgentModal: () => void
  closeAgentModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  agentModalOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  openAgentModal: () => set({ agentModalOpen: true }),
  closeAgentModal: () => set({ agentModalOpen: false }),
}))
