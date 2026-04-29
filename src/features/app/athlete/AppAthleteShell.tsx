import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AthleteFloatingTabBar } from '../primitives/FloatingTabBar'
import { SYNTH } from '../lib/theme'

const HIDE_TAB_BAR_PREFIXES = ['/app/athlete/ai']

export function AppAthleteShell() {
  const { pathname } = useLocation()
  const isAI = pathname.startsWith('/app/athlete/ai')
  const hideTabBar = HIDE_TAB_BAR_PREFIXES.some((p) => pathname.startsWith(p))

  // Same body-canvas tagging as the coach shell — keeps overscroll on cream
  // for AI surfaces, cobalt elsewhere.
  useEffect(() => {
    document.body.setAttribute('data-app-canvas', isAI ? 'cream' : 'cobalt')
    return () => {
      document.body.removeAttribute('data-app-canvas')
    }
  }, [isAI])

  return (
    <div
      className="relative flex flex-1 flex-col"
      style={{
        background: isAI
          ? SYNTH.aiCanvas
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
