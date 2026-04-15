import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { AgentModalPortal } from './AgentModalPortal'
import { THEME } from '../../lib/theme'

export function CoachLayout() {
  return (
    <div className="flex h-dvh w-full overflow-hidden" style={{ background: THEME.light }}>
      <Sidebar />
      <main className="synth-scroll min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <AgentModalPortal />
    </div>
  )
}
