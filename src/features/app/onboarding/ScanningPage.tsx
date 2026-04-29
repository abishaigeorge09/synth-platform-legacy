import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { SYNTH } from '../lib/theme'
import { OnboardingBackground } from '../primitives/OnboardingBackground'

const SCAN_STEPS: { pct: number; status: string; delay: number }[] = [
  { pct: 12, status: 'Pulling Concept2 history', delay: 600 },
  { pct: 31, status: 'Reading Strava sessions', delay: 800 },
  { pct: 48, status: 'Mapping recovery signals', delay: 800 },
  { pct: 64, status: 'Synthesizing training load', delay: 800 },
  { pct: 82, status: 'Building provenance map', delay: 800 },
  { pct: 100, status: 'Ready', delay: 700 },
]

const ARTIFACTS = [
  'Training load · 7d / 28d',
  'Recovery score',
  'Streak + days active',
  'Volume + distance',
  'Provenance map',
]

export function ScanningPage() {
  const navigate = useNavigate()
  const role = useAppAuthStore((s) => s.role)
  const scanProgress = useOnboardingStore((s) => s.scanProgress)
  const scanStatus = useOnboardingStore((s) => s.scanStatus)
  const setScanProgress = useOnboardingStore((s) => s.setScanProgress)

  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => {
      document.body.removeAttribute('data-app-canvas')
    }
  }, [])

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

  // SVG ring math
  const RADIUS = 70
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const offset = CIRCUMFERENCE - (scanProgress / 100) * CIRCUMFERENCE

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
      }}
    >
      <OnboardingBackground variant="scanning" />
      <div className="synth-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center px-6 py-6">
          <div className="mx-auto w-full max-w-[420px]">
            {/* Circular progress */}
            <div className="mx-auto flex h-[180px] w-[180px] items-center justify-center">
              <svg width={180} height={180} viewBox="0 0 180 180" className="-rotate-90">
                <circle
                  cx={90}
                  cy={90}
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={6}
                />
                <motion.circle
                  cx={90}
                  cy={90}
                  r={RADIUS}
                  fill="none"
                  stroke={SYNTH.accentEmerald}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span
                  className="text-[42px] font-bold leading-none tracking-[-0.02em]"
                  style={{
                    color: SYNTH.inkOnBrand,
                    fontFamily: SYNTH.font,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {scanProgress}
                </span>
                <span
                  className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
                >
                  Percent
                </span>
              </div>
            </div>

            <h1
              className="mt-6 text-center text-[24px] font-bold leading-[1.15] tracking-[-0.01em]"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              synth is scanning your sources
            </h1>
            <motion.p
              key={scanStatus}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-2 text-center text-[13px]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              {scanStatus || 'Starting…'}
            </motion.p>

            {/* Artifacts */}
            <div className="mt-8">
              <p
                className="text-center text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
              >
                What we're computing
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {ARTIFACTS.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border px-3 py-1.5 text-[11px] font-semibold"
                    style={{
                      background: SYNTH.glass,
                      backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                      WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                      borderColor: SYNTH.glassBorder,
                      color: SYNTH.inkOnBrand,
                      fontFamily: SYNTH.font,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
