import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, ChevronUp, ChevronDown, X } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SYNTH } from '../lib/theme'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSplit(raw: string): number {
  const [minPart, secPart = '0'] = raw.split(':')
  return Number(minPart) * 60 + Number(secPart)
}

function fmtSplit(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  const [whole, dec = '0'] = s.toFixed(1).split('.')
  return `${m}:${whole.padStart(2, '0')}.${dec}`
}

function formatElapsed(ms: number): string {
  const totalSeconds = ms / 1000
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  const tenths = Math.floor((totalSeconds * 10) % 10)
  return `${m}:${s.toString().padStart(2, '0')}.${tenths}`
}

const DISTANCE_OPTIONS = [500, 1000, 2000, 4000, 6000]

// ─── Main page ────────────────────────────────────────────────────────────────

export function ErgPacerPage() {
  const [running, setRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const startedAtRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  // Target config
  const [targetDistanceM, setTargetDistanceM] = useState(2000)
  const [targetSplitStr, setTargetSplitStr] = useState('1:45.3')
  const [targetRate, setTargetRate] = useState(22)
  const [configOpen, setConfigOpen] = useState(false)

  const targetSplitSec = parseSplit(targetSplitStr)

  useEffect(() => {
    if (!running) return
    startedAtRef.current = performance.now() - elapsedMs
    const tick = () => {
      setElapsedMs(performance.now() - startedAtRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // elapsedMs intentionally omitted — read once on resume
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const reset = () => {
    setRunning(false)
    setElapsedMs(0)
  }

  const elapsedSec = elapsedMs / 1000
  const splits = elapsedMs > 0 ? generateSplits(elapsedMs, targetSplitSec, targetDistanceM) : []

  // Simulated current split delta — oscillates after 5s
  const liveDeltaSec =
    elapsedSec > 3
      ? Math.sin(elapsedSec / 8) * 1.2
      : null

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto" style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 16px) + 88px)' }}>
      <CoachPageHeader title="Erg pacer" subtitle={`${targetDistanceM}m target`} back="/app/athlete/home" />

      {/* Main timer */}
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

        {/* Live pace badge */}
        <AnimatePresence>
          {liveDeltaSec !== null ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mt-2"
            >
              <span
                className="rounded-full px-3 py-1 text-[12px] font-bold tracking-[0.06em]"
                style={{
                  background: liveDeltaSec < 0 ? 'rgba(52,199,89,0.18)' : 'rgba(255,69,58,0.18)',
                  color: liveDeltaSec < 0 ? '#34C759' : '#FF453A',
                  border: `1px solid ${liveDeltaSec < 0 ? 'rgba(52,199,89,0.35)' : 'rgba(255,69,58,0.35)'}`,
                  fontFamily: SYNTH.font,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {liveDeltaSec < 0 ? '–' : '+'}{Math.abs(liveDeltaSec).toFixed(1)}s vs target
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Target label — tap to configure */}
        <button
          type="button"
          data-tour="athlete-pacer-target"
          onClick={() => setConfigOpen(true)}
          className="mt-2 rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em]"
          style={{
            color: SYNTH.inkOnBrandFaint,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
            background: SYNTH.glass,
            border: `1px solid ${SYNTH.glassBorder}`,
          }}
        >
          {targetSplitStr} · {targetRate} spm · tap to change
        </button>

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

      {/* Pace prediction card */}
      <section data-tour="athlete-pacer-chart" className="mx-5 mt-3 rounded-3xl p-5"
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
          On pace for {predictFinish(elapsedMs, targetSplitSec, targetDistanceM)}.
        </p>
        <p
          className="mt-1 text-[12px]"
          style={{ color: SYNTH.ink, opacity: 0.6, fontFamily: SYNTH.font }}
        >
          {elapsedMs > 0
            ? 'Hold rate. Keep the split consistent through 1500m.'
            : 'Tap start. synth will pace you live.'}
        </p>
      </section>

      {/* Splits */}
      <section className="mx-5 mt-5">
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          500m splits
        </p>
        <div
          className="overflow-hidden rounded-3xl"
          style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
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
                <span className="text-[13px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                  {s.label}
                </span>
                <div className="flex items-center gap-2">
                  {s.delta !== 0 ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        background: s.delta > 0 ? 'rgba(255,69,58,0.14)' : 'rgba(52,199,89,0.14)',
                        color: s.delta > 0 ? '#FF453A' : '#34C759',
                      }}
                    >
                      {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}s
                    </span>
                  ) : null}
                  <span
                    className="text-[16px] font-bold"
                    style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {s.value}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Config sheet */}
      <AnimatePresence>
        {configOpen ? (
          <TargetConfigSheet
            distanceM={targetDistanceM}
            splitStr={targetSplitStr}
            rate={targetRate}
            onSave={(d, s, r) => {
              setTargetDistanceM(d)
              setTargetSplitStr(s)
              setTargetRate(r)
              setConfigOpen(false)
            }}
            onClose={() => setConfigOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

// ─── Config sheet ─────────────────────────────────────────────────────────────

function TargetConfigSheet({
  distanceM,
  splitStr,
  rate,
  onSave,
  onClose,
}: {
  distanceM: number
  splitStr: string
  rate: number
  onSave: (d: number, s: string, r: number) => void
  onClose: () => void
}) {
  const [localDist, setLocalDist] = useState(distanceM)
  const [localSplit, setLocalSplit] = useState(splitStr)
  const [localRate, setLocalRate] = useState(rate)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(8,8,40,0.55)', backdropFilter: 'blur(6px)' }}
      />
      <motion.div
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-5 px-5"
        style={{
          background: SYNTH.sheet,
          borderRadius: `${SYNTH.radius.sheet}px ${SYNTH.radius.sheet}px 0 0`,
          paddingTop: 24,
          paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
          color: SYNTH.ink,
          fontFamily: SYNTH.font,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold" style={{ color: SYNTH.ink }}>Set target</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: SYNTH.sheetMuted }}
          >
            <X size={16} strokeWidth={2.2} style={{ color: SYNTH.ink }} />
          </button>
        </div>

        {/* Distance */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkMuted }}>
            Distance
          </p>
          <div className="flex flex-wrap gap-2">
            {DISTANCE_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setLocalDist(d)}
                className="rounded-full px-4 py-1.5 text-[13px] font-semibold"
                style={{
                  background: localDist === d ? SYNTH.accentBlack : SYNTH.sheetMuted,
                  color: localDist === d ? SYNTH.inkOnBrand : SYNTH.ink,
                  fontFamily: SYNTH.font,
                }}
              >
                {d >= 1000 ? `${d / 1000}K` : `${d}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Target split */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkMuted }}>
            Target split /500m
          </p>
          <input
            value={localSplit}
            onChange={(e) => setLocalSplit(e.target.value)}
            placeholder="1:45.0"
            className="w-full rounded-2xl px-4 py-3 text-[20px] font-bold tracking-[-0.01em] outline-none"
            style={{
              background: SYNTH.sheetMuted,
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          />
        </div>

        {/* Target rate */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkMuted }}>
            Target rate (spm)
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocalRate((r) => Math.max(14, r - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
            >
              <ChevronDown size={18} strokeWidth={2.4} />
            </button>
            <span
              className="w-14 text-center text-[28px] font-bold"
              style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
            >
              {localRate}
            </span>
            <button
              type="button"
              onClick={() => setLocalRate((r) => Math.min(40, r + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
            >
              <ChevronUp size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSave(localDist, localSplit, localRate)}
          className="rounded-full py-3.5 text-[14px] font-semibold"
          style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          Save target
        </button>
      </motion.div>
    </>
  )
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateSplits(elapsedMs: number, targetSplitSec: number, totalM: number) {
  const completed = Math.min(
    Math.floor(elapsedMs / 1000 / targetSplitSec),
    Math.floor(totalM / 500),
  )
  return Array.from({ length: completed }).map((_, i) => {
    const delta = i % 2 === 0 ? 0 : 0.8
    return {
      label: `${(i + 1) * 500}m`,
      value: fmtSplit(targetSplitSec + delta),
      delta,
    }
  })
}

function predictFinish(elapsedMs: number, targetSplitSec: number, totalM: number): string {
  const numSplits = totalM / 500
  if (elapsedMs === 0) return fmtSplit(targetSplitSec * numSplits)
  const elapsedSec = elapsedMs / 1000
  const completedFraction = elapsedSec / (targetSplitSec * numSplits)
  const projectedTotal = elapsedSec / Math.max(completedFraction, 0.01)
  return fmtSplit(Math.min(projectedTotal, targetSplitSec * numSplits * 1.15))
}
