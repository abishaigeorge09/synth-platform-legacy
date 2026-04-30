import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AthleteFloatingTabBar } from '../primitives/FloatingTabBar'
import { SYNTH } from '../lib/theme'
import { useUiStore } from '../../../shared/store/useUiStore'

const HIDE_TAB_BAR_PREFIXES = ['/app/athlete/ai']

export function AppAthleteShell() {
  const { pathname } = useLocation()
  const heroPageActive = useUiStore((s) => s.heroPageActive)
  const isAI = pathname.startsWith('/app/athlete/ai')
  const hideTabBar = HIDE_TAB_BAR_PREFIXES.some((p) => pathname.startsWith(p)) || heroPageActive

  // Same body-canvas tagging as the coach shell — keeps overscroll on cream
  // for AI surfaces, cobalt elsewhere.
  useEffect(() => {
    const canvas = isAI ? 'cream' : heroPageActive ? 'dark-water' : 'cobalt'
    document.body.setAttribute('data-app-canvas', canvas)
    return () => {
      document.body.removeAttribute('data-app-canvas')
    }
  }, [isAI, heroPageActive])

  return (
    <div
      className="relative flex flex-1 flex-col"
      style={{
        background: isAI
          ? SYNTH.aiCanvas
          : heroPageActive
          ? '#050B1C'
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
