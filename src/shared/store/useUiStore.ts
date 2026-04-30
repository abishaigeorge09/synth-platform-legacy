import { create } from 'zustand'

type UiState = {
  sidebarCollapsed: boolean
  agentModalOpen: boolean
  mobileDrawerOpen: boolean
  commandPaletteOpen: boolean
  coachProfileOpen: boolean
  requestToolOpen: boolean
  hideTopRightControls: boolean
  // Which panel index the home page should snap to (set by nav Home button).
  // null = no pending request. HomePage clears this after consuming it.
  homePanelRequest: number | null
  setHomePanelRequest: (panel: number | null) => void
  // True when the lineup-hero panel (page 0) is the visible page in the home
  // swiper. AppCoachShell hides the floating tab bar while this is true.
  heroPageActive: boolean
  setHeroPageActive: (v: boolean) => void
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
  homePanelRequest: null,
  setHomePanelRequest: (panel) => set({ homePanelRequest: panel }),
  heroPageActive: false,
  setHeroPageActive: (v) => set({ heroPageActive: v }),
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
