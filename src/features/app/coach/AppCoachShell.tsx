import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CoachFloatingTabBar } from '../primitives/FloatingTabBar'
import { MoreSheet } from '../primitives/MoreSheet'
import { SYNTH } from '../lib/theme'
import { useUiStore } from '../../../shared/store/useUiStore'

const HIDE_TAB_BAR_PREFIXES = [
  '/app/coach/ai',
  '/app/coach/athlete/',
]

export function AppCoachShell() {
  const { pathname } = useLocation()
  const isAI = pathname.startsWith('/app/coach/ai')
  const heroPageActive = useUiStore((s) => s.heroPageActive)
  const hideTabBar =
    HIDE_TAB_BAR_PREFIXES.some((p) => pathname.startsWith(p)) || heroPageActive
  const [moreOpen, setMoreOpen] = useState(false)

  // Tag the body so the surrounding wrappers (.app-shell-root,
  // .app-shell-frame, body) paint the right canvas color — keeps overscroll
  // from exposing the default white frame.
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
      {hideTabBar ? null : <CoachFloatingTabBar onMoreClick={() => setMoreOpen(true)} />}
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  )
}
