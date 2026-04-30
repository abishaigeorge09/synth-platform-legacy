import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppAuthStore } from './store/useAppAuthStore'
import { SYNTH } from './lib/theme'
import { TutorialProvider } from '../../shared/tutorial'
import { GuidedTourOrchestrator } from '../../shared/tutorial/GuidedTourOrchestrator'
import { useSessionsStore } from './data/useSessionsStore'
import { DesktopAppIntercept } from './desktopIntercept/DesktopAppIntercept'
import { useMediaQuery } from './desktopIntercept/useMediaQuery'

const DISMISS_KEY = 'synth-desktop-intercept-dismissed'

export function AppShell() {
  const hydrate = useAppAuthStore((s) => s.hydrate)
  const isReady = useAppAuthStore((s) => s.isReady)
  const seedIfEmpty = useSessionsStore((s) => s.seedIfEmpty)
  const { pathname } = useLocation()

  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  })

  // Intercept only on the unauthenticated welcome surface — that's where
  // a desktop visitor lands when we share a demo link. After login (coach
  // / athlete app), or mid-onboarding, the intercept would be noise.
  const onWelcomeSurface = pathname === '/app' || pathname === '/app/' || pathname.startsWith('/app/welcome')
  const showIntercept = isDesktop && onWelcomeSurface && !dismissed

  const dismissIntercept = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Ignore — private mode / quota
    }
    setDismissed(true)
  }

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    seedIfEmpty()
  }, [seedIfEmpty])

  useEffect(() => {
    document.body.setAttribute('data-surface', 'app')
    return () => {
      document.body.removeAttribute('data-surface')
    }
  }, [])

  if (showIntercept) {
    return <DesktopAppIntercept onDismiss={dismissIntercept} />
  }

  return (
    <div className="app-shell-root">
      <div className="app-shell-frame">
        {isReady ? <Outlet /> : <AppShellSplash />}
      </div>
      {isReady && <TutorialProvider />}
      {isReady && <GuidedTourOrchestrator />}
    </div>
  )
}

/**
 * Splash — cobalt canvas, centered synth wordmark with subtle entrance.
 * Mirrors the GO Club splash style. Shown during auth hydration.
 */
function AppShellSplash() {
  return (
    <div
      className="flex flex-1 items-center justify-center"
      style={{
        background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-3"
      >
        <span
          className="text-[44px] font-bold leading-none tracking-[-0.02em]"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          synth
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ color: SYNTH.accentEmerald, display: 'inline-block' }}
          >
            .
          </motion.span>
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          Every signal · one platform
        </span>
      </motion.div>
    </div>
  )
}
