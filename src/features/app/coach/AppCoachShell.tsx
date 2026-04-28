import { Outlet, useLocation } from 'react-router-dom'
import { CoachFloatingTabBar } from '../primitives/FloatingTabBar'
import { SYNTH } from '../lib/theme'

const HIDE_TAB_BAR_PREFIXES = [
  '/app/coach/ai',
  '/app/coach/attention',
  '/app/coach/athlete/',
]

export function AppCoachShell() {
  const { pathname } = useLocation()
  const isAI = pathname.startsWith('/app/coach/ai')
  const hideTabBar = HIDE_TAB_BAR_PREFIXES.some((p) => pathname.startsWith(p))

  return (
    <div
      className="relative flex flex-1 flex-col"
      style={{
        background: isAI
          ? SYNTH.canvasInk
          : `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
      }}
    >
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
      {hideTabBar ? null : <CoachFloatingTabBar />}
    </div>
  )
}
