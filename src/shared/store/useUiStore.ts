import { create } from 'zustand'

type UiState = {
  sidebarCollapsed: boolean
  agentModalOpen: boolean
  mobileDrawerOpen: boolean
  commandPaletteOpen: boolean
  coachProfileOpen: boolean
  requestToolOpen: boolean
  hideTopRightControls: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  openAgentModal: () => void
  closeAgentModal: () => void
  openMobileDrawer: () => void
  closeMobileDrawer: () => void
  toggleMobileDrawer: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
  openCoachProfile: () => void
  closeCoachProfile: () => void
  openRequestTool: () => void
  closeRequestTool: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  agentModalOpen: false,
  mobileDrawerOpen: false,
  commandPaletteOpen: false,
  coachProfileOpen: false,
  requestToolOpen: false,
  hideTopRightControls: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  openAgentModal: () => set({ agentModalOpen: true }),
  closeAgentModal: () => set({ agentModalOpen: false }),
  openMobileDrawer: () => set({ mobileDrawerOpen: true }),
  closeMobileDrawer: () => set({ mobileDrawerOpen: false }),
  toggleMobileDrawer: () => set((s) => ({ mobileDrawerOpen: !s.mobileDrawerOpen })),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  openCoachProfile: () => set({ coachProfileOpen: true }),
  closeCoachProfile: () => set({ coachProfileOpen: false }),
  openRequestTool: () => set({ requestToolOpen: true }),
  closeRequestTool: () => set({ requestToolOpen: false }),
}))
