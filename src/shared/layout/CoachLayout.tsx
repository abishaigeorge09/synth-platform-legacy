import { Outlet } from 'react-router-dom'
import { Sidebar } from '@shared/layout/Sidebar'
import { AgentModalPortal } from '@shared/layout/AgentModalPortal'
import { CommandPalette } from '@shared/layout/CommandPalette'
import { MobileSidebarDrawer } from '@shared/layout/MobileSidebarDrawer'
import { MobileTopBar } from '@shared/layout/MobileTopBar'
import { CoachProfileModal } from '@shared/layout/CoachProfileModal'
import { RequestToolModal } from '@shared/layout/RequestToolModal'
import { WritebackConfirmBar } from '@shared/components/WritebackConfirmBar'
import { RightPanel } from '@shared/layout/RightPanel'
import { THEME } from '@lib/theme'

export function CoachLayout() {
  return (
    <div className="flex h-dvh w-full overflow-hidden" style={{ background: 'var(--bg-surface, #FAFAF9)' }}>
      {/* Phase 19 — skip link for keyboard users. Visually hidden until
          focused, then appears at the top of the viewport so Tab users can
          jump past the sidebar directly into the main content area. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:shadow-lg"
        style={{
          background: 'var(--bg-primary)',
          color: THEME.primary,
          fontFamily: THEME.fontMono,
          outline: `2px solid ${THEME.primary}`,
          outlineOffset: '2px',
        }}
      >
        Skip to content
      </a>

      {/* Desktop fixed sidebar (>= md). Hidden on mobile via its own class. */}
      <Sidebar />

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile-only top bar with hamburger. Hidden at md+. */}
        <MobileTopBar />

        <main id="main-content" className="synth-scroll min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile slide-in drawer (portal overlay; only renders when open) */}
      <MobileSidebarDrawer />

      {/* synth. Agent modal (already mobile-safe after Phase 13 sizing pass) */}
      <AgentModalPortal />

      {/* Phase 17 — global command palette (Cmd+K / Ctrl+K). Mounted at the
          layout level so every coach surface inherits the shortcut without
          per-page wiring. */}
      <CommandPalette />

      {/* Coach profile (top-right avatar button) and Request-tool (sidebar)
          modals — wired so those buttons actually do something visible. */}
      <CoachProfileModal />
      <RequestToolModal />

      <WritebackConfirmBar />

      {/* Right-side analysis drawer — Athlete AI + Session Compare */}
      <RightPanel />
    </div>
  )
}
