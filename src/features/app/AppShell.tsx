import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppAuthStore } from './store/useAppAuthStore'
import { SYNTH } from './lib/theme'

export function AppShell() {
  const hydrate = useAppAuthStore((s) => s.hydrate)
  const isReady = useAppAuthStore((s) => s.isReady)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    document.body.setAttribute('data-surface', 'app')
    return () => {
      document.body.removeAttribute('data-surface')
    }
  }, [])

  return (
    <div className="app-shell-root">
      <div className="app-shell-frame">
        {isReady ? <Outlet /> : <AppShellSplash />}
      </div>
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
