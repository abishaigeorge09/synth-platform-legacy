import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScanningLoader } from '../primitives/ScanningLoader'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { APP_THEME } from '../lib/theme'

const SCAN_STEPS: { pct: number; status: string; delay: number }[] = [
  { pct: 12, status: 'Pulling Concept2 history', delay: 600 },
  { pct: 31, status: 'Reading Strava sessions', delay: 800 },
  { pct: 48, status: 'Mapping recovery signals', delay: 800 },
  { pct: 64, status: 'Synthesizing training load', delay: 800 },
  { pct: 82, status: 'Building provenance map', delay: 800 },
  { pct: 100, status: 'Ready', delay: 700 },
]

export function ScanningPage() {
  const navigate = useNavigate()
  const role = useAppAuthStore((s) => s.role)
  const scanProgress = useOnboardingStore((s) => s.scanProgress)
  const scanStatus = useOnboardingStore((s) => s.scanStatus)
  const setScanProgress = useOnboardingStore((s) => s.setScanProgress)

  useEffect(() => {
    let cancelled = false
    let stepIdx = 0
    setScanProgress(0, SCAN_STEPS[0].status)

    const tick = () => {
      if (cancelled) return
      const step = SCAN_STEPS[stepIdx]
      setScanProgress(step.pct, step.status)
      stepIdx += 1
      if (stepIdx >= SCAN_STEPS.length) {
        setTimeout(() => {
          if (!cancelled) navigate('/app/onboarding/reveal')
        }, 600)
        return
      }
      setTimeout(tick, step.delay)
    }

    const startId = setTimeout(tick, 400)
    return () => {
      cancelled = true
      clearTimeout(startId)
    }
  }, [navigate, setScanProgress, role])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col"
      style={{ background: APP_THEME.canvas }}
    >
      <ScanningLoader
        percent={scanProgress}
        headline="synth is scanning your sources"
        status={scanStatus}
        artifactsLabel="What we're computing"
        artifacts={[
          'Training load · 7d / 28d',
          'Recovery score',
          'Streak + days active',
          'Volume + distance',
          'Provenance map',
        ]}
      />
    </motion.div>
  )
}
