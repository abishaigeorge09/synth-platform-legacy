import { create } from 'zustand'

type UiState = {
  sidebarCollapsed: boolean
  agentModalOpen: boolean
  mobileDrawerOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  openAgentModal: () => void
  closeAgentModal: () => void
  openMobileDrawer: () => void
  closeMobileDrawer: () => void
  toggleMobileDrawer: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  agentModalOpen: false,
  mobileDrawerOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  openAgentModal: () => set({ agentModalOpen: true }),
  closeAgentModal: () => set({ agentModalOpen: false }),
  openMobileDrawer: () => set({ mobileDrawerOpen: true }),
  closeMobileDrawer: () => set({ mobileDrawerOpen: false }),
  toggleMobileDrawer: () => set((s) => ({ mobileDrawerOpen: !s.mobileDrawerOpen })),
}))
