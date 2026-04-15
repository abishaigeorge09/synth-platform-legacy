import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { AgentModalPortal } from './AgentModalPortal'
import { MobileSidebarDrawer } from './MobileSidebarDrawer'
import { MobileTopBar } from './MobileTopBar'
import { THEME } from '../../lib/theme'

export function CoachLayout() {
  return (
    <div className="flex h-dvh w-full overflow-hidden" style={{ background: THEME.light }}>
      {/* Desktop fixed sidebar (>= md). Hidden on mobile via its own class. */}
      <Sidebar />

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile-only top bar with hamburger. Hidden at md+. */}
        <MobileTopBar />

        <main className="synth-scroll min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile slide-in drawer (portal overlay; only renders when open) */}
      <MobileSidebarDrawer />

      {/* synth. Agent modal (already mobile-safe after Phase 13 sizing pass) */}
      <AgentModalPortal />
    </div>
  )
}
