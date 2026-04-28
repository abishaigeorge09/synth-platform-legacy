import { Outlet, useLocation } from 'react-router-dom'
import { AthleteFloatingTabBar } from '../primitives/FloatingTabBar'
import { SYNTH } from '../lib/theme'

const HIDE_TAB_BAR_PREFIXES = ['/app/athlete/ai']

export function AppAthleteShell() {
  const { pathname } = useLocation()
  const isAI = pathname.startsWith('/app/athlete/ai')
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
      {hideTabBar ? null : <AthleteFloatingTabBar />}
    </div>
  )
}
