import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Square } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SYNTH } from '../lib/theme'

const TARGET_SPLIT = '1:45.3'
const TARGET_RATE = 22

export function ErgPacerPage() {
  const [running, setRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const startedAtRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!running) return
    startedAtRef.current = performance.now() - elapsedMs
    const tick = () => {
      const now = performance.now()
      setElapsedMs(now - startedAtRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // elapsedMs is intentionally omitted — we read it once on resume, then drive it ourselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const reset = () => {
    setRunning(false)
    setElapsedMs(0)
  }

  const splits = elapsedMs > 0 ? generateSplits(elapsedMs) : []

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[120px]">
      <CoachPageHeader title="Erg pacer" subtitle="2K target" back="/app/athlete/home" />

      <section className="mx-5 mt-2 flex flex-col items-center px-5 py-7">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Elapsed · {running ? 'live' : 'paused'}
        </p>
        <motion.div
          key={running ? 'running' : 'paused'}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.32 }}
          className="mt-2 text-center"
        >
          <div
            className="text-[88px] font-bold leading-none tracking-[-0.04em]"
            style={{
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatElapsed(elapsedMs)}
          </div>
        </motion.div>
        <p
          className="mt-2 text-[12px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
        >
          Target {TARGET_SPLIT} · {TARGET_RATE} spm
        </p>

        <div className="mt-7 flex items-center gap-4">
          <button
            type="button"
            onClick={reset}
            disabled={!running && elapsedMs === 0}
            className="flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-30"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              border: `1px solid ${SYNTH.glassBorder}`,
              color: SYNTH.inkOnBrand,
            }}
            aria-label="Reset"
          >
            <Square size={16} strokeWidth={2.4} />
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setRunning((r) => !r)}
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: SYNTH.accentBlack,
              color: SYNTH.inkOnBrand,
              boxShadow: SYNTH.shadow.actionCircle,
            }}
            aria-label={running ? 'Pause' : 'Start'}
          >
            {running ? <Pause size={28} strokeWidth={2.4} /> : <Play size={28} strokeWidth={2.4} />}
          </motion.button>
          <div className="h-12 w-12" />
        </div>
      </section>

      <section className="mx-5 mt-3 rounded-3xl p-5"
               style={{ background: SYNTH.cardSky, boxShadow: SYNTH.shadow.card }}>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.ink, opacity: 0.65, fontFamily: SYNTH.font }}
        >
          Pace prediction
        </p>
        <p
          className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.01em]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          On pace for {predictFinish(elapsedMs)}.
        </p>
        <p
          className="mt-1 text-[12px]"
          style={{ color: SYNTH.ink, opacity: 0.6, fontFamily: SYNTH.font }}
        >
          {elapsedMs > 0
            ? 'Hold rate. You can win 0.6s by stroke 18.'
            : 'Tap start. synth will pace you live.'}
        </p>
      </section>

      <section className="mx-5 mt-5">
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          500m splits
        </p>
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          {splits.length === 0 ? (
            <p
              className="px-4 py-6 text-center text-[12px]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              Splits appear once you start.
            </p>
          ) : (
            splits.map((s, i) => (
              <div
                key={s.label}
                className="flex items-center justify-between px-4 py-3.5"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
              >
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {s.label}
                </span>
                <span
                  className="text-[16px] font-bold"
                  style={{
                    color: SYNTH.inkOnBrand,
                    fontFamily: SYNTH.font,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {s.value}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function formatElapsed(ms: number): string {
  const totalSeconds = ms / 1000
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  const tenths = Math.floor((totalSeconds * 10) % 10)
  return `${m}:${s.toString().padStart(2, '0')}.${tenths}`
}

function predictFinish(ms: number): string {
  if (ms === 0) return '7:01.4'
  const elapsedSec = ms / 1000
  // Linearly extrapolate to ~2K based on rough 1:45 split target
  const projectedTotal = Math.max(elapsedSec, 60) * (8 / Math.max(ms / 1000 / 105, 1))
  const m = Math.floor(projectedTotal / 60)
  const s = Math.floor(projectedTotal % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function generateSplits(elapsedMs: number) {
  const splitDurationSec = 105 // 1:45 per 500m
  const completed = Math.floor(elapsedMs / 1000 / splitDurationSec)
  return Array.from({ length: Math.min(completed, 4) }).map((_, i) => ({
    label: `${(i + 1) * 500}m`,
    value: i % 2 === 0 ? '1:45.3' : '1:46.1',
  }))
}
