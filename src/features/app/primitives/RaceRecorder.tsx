import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, Square, X, MapPin, BarChart3, Flag } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { BoatLanesView, type LaneBoat } from './BoatLanesView'

export type RaceBoat = {
  id: string
  name: string
  color: string
  /** Relative speed multiplier (1.0 = reference). Used so boats visibly
   * race each other when no splits have been captured yet. */
  speed?: number
}

export type Split = {
  boatId: string
  /** ms since race start */
  ts: number
}

type Status = 'idle' | 'running' | 'paused' | 'finished'
type ViewMode = 'lanes' | 'stats'

type Props = {
  boats: RaceBoat[]
  /** Number of split markers along the course (e.g. 4 for a 2K with 500m splits) */
  totalSplits?: number
  /** Expected race duration in ms — drives continuous boat animation
   * before splits start landing. Default 390000 (6:30 for an elite 2K). */
  expectedRaceMs?: number
  onFinish: (result: { elapsedMs: number; splits: Split[] }) => void
  /** Default false — when true, single boat with Lap captures (stopwatch). */
  lapMode?: boolean
  /** Race or session label shown in the immersive header. */
  label?: string
  /** Called when the user dismisses without finishing (close button on idle). */
  onDismiss?: () => void
}

/**
 * Strava-translated race recorder. Two visual states:
 *
 *   IDLE — a hero card in the parent page with a big START button
 *   ACTIVE/PAUSED/FINISHED — full-screen immersive overlay:
 *
 *     ┌────────────────────────────────────┐
 *     │ [×]                                │  close
 *     │                                    │
 *     │             T I M E                │  tiny label
 *     │           00:42.3                  │  HUGE bold timer
 *     │                                    │
 *     │   ┌──── lanes view (or splits) ───┐│  toggle
 *     │   │  V8 A ────●  3                ││
 *     │   │  V8 B ───● 2                  ││
 *     │   └────────────────────────────────┘│
 *     │                                    │
 *     │  [ V8A ] [ V8B ] [ V4A ] [ V4B ]  │  per-boat split
 *     │                                    │
 *     │      [ ⏸ ]   [ ⏹ FINISH ]         │  controls
 *     └────────────────────────────────────┘
 */
export function RaceRecorder({
  boats,
  totalSplits = 4,
  expectedRaceMs = 390_000,
  onFinish,
  lapMode = false,
  label,
  onDismiss,
}: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [view, setView] = useState<ViewMode>('lanes')
  const [elapsed, setElapsed] = useState(0)
  const [splits, setSplits] = useState<Split[]>([])
  const startedAtRef = useRef<number | null>(null)
  const accumRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  // requestAnimationFrame loop — drives both the timer display and the
  // continuous boat animation in BoatLanesView.
  useEffect(() => {
    if (status !== 'running') {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      return
    }
    startedAtRef.current = performance.now()
    const tick = () => {
      if (startedAtRef.current === null) return
      const now = performance.now()
      setElapsed(accumRef.current + (now - startedAtRef.current))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [status])

  const start = () => {
    accumRef.current = 0
    setElapsed(0)
    setSplits([])
    setStatus('running')
  }

  const pause = () => {
    if (startedAtRef.current !== null) {
      accumRef.current += performance.now() - startedAtRef.current
      startedAtRef.current = null
    }
    setStatus('paused')
  }

  const resume = () => setStatus('running')

  const finish = () => {
    if (startedAtRef.current !== null) {
      accumRef.current += performance.now() - startedAtRef.current
      startedAtRef.current = null
    }
    const finalElapsed = accumRef.current
    setElapsed(finalElapsed)
    setStatus('finished')
    onFinish({ elapsedMs: finalElapsed, splits })
    // Reset for a potential next run
    setTimeout(() => {
      setStatus('idle')
      accumRef.current = 0
      setElapsed(0)
      setSplits([])
    }, 500)
  }

  const onSplit = (boatId: string) => {
    if (status !== 'running') return
    const now = performance.now()
    const ts = startedAtRef.current
      ? accumRef.current + (now - startedAtRef.current)
      : accumRef.current
    setSplits((prev) => [...prev, { boatId, ts }])
  }

  const splitCounts = useMemo(() => {
    const m = new Map<string, number>()
    boats.forEach((b) => m.set(b.id, 0))
    splits.forEach((s) => m.set(s.boatId, (m.get(s.boatId) ?? 0) + 1))
    return m
  }, [boats, splits])

  // Boat progress: continuous, driven by elapsed time × per-boat speed.
  // When splits are captured, anchor at (splits/total) so the visual
  // doesn't drift further than the actual progress recorded.
  const laneBoats: LaneBoat[] = useMemo(() => {
    return boats.map((b) => {
      const captured = splitCounts.get(b.id) ?? 0
      const speed = b.speed ?? 1
      const continuous = (elapsed / expectedRaceMs) * speed
      const splitAnchor = captured / totalSplits
      // Use whichever is greater — but cap at 1 so finished boats stop.
      const progress = Math.min(1, Math.max(splitAnchor, continuous))
      const lastSplit = [...splits].reverse().find((s) => s.boatId === b.id)?.ts
      return {
        id: b.id,
        name: b.name,
        color: b.color,
        progress,
        lastSplit: lastSplit !== undefined ? fmtElapsed(lastSplit) : undefined,
      }
    })
  }, [boats, splitCounts, splits, totalSplits, elapsed, expectedRaceMs])

  // ─── IDLE: in-flow hero card ──────────────────────────────────────────
  if (status === 'idle') {
    return (
      <div
        className="flex flex-col items-center gap-5 rounded-3xl px-6 py-8"
        style={{
          background: SYNTH.glass,
          backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          border: `1px solid ${SYNTH.glassBorder}`,
        }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          {lapMode ? 'Stopwatch' : 'Race timer'}
        </p>
        <p
          className="text-center text-[20px] font-bold leading-[1.15] tracking-[-0.01em]"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          {label ?? (lapMode ? 'Tap to start the clock' : `${boats.length} boats lined up`)}
        </p>
        {!lapMode ? (
          <div className="flex flex-wrap justify-center gap-2">
            {boats.map((b) => (
              <span
                key={b.id}
                className="rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{
                  background: b.color,
                  color: SYNTH.ink,
                  fontFamily: SYNTH.font,
                  letterSpacing: '0.02em',
                }}
              >
                {b.name}
              </span>
            ))}
          </div>
        ) : null}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={start}
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: SYNTH.accentEmerald,
            boxShadow: `0 16px 36px ${SYNTH.accentEmerald}99, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
          aria-label="Start"
        >
          <Play size={32} strokeWidth={2.6} color={SYNTH.inkOnBrand} fill={SYNTH.inkOnBrand} />
        </motion.button>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          {lapMode ? 'Tap to start' : 'Hold ready · tap to start'}
        </p>
      </div>
    )
  }

  // ─── ACTIVE / PAUSED / FINISHED: full-screen immersive ────────────────
  return (
    <AnimatePresence>
      <motion.div
        key="immersive"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[60] flex flex-col"
        style={{
          background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
          fontFamily: SYNTH.font,
        }}
      >
        {/* Tiny top bar — close + race name */}
        <header
          className="flex shrink-0 items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),20px)] pb-2"
        >
          <button
            type="button"
            onClick={() => {
              // Mid-race close = pause + bail. Use Finish button to log the run.
              if (status === 'running') pause()
              setStatus('idle')
              setSplits([])
              setElapsed(0)
              accumRef.current = 0
              onDismiss?.()
            }}
            aria-label="Close timer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              border: `1px solid ${SYNTH.glassBorder}`,
              color: SYNTH.inkOnBrand,
            }}
          >
            <X size={18} strokeWidth={2.4} />
          </button>
          <p
            className="flex-1 truncate text-center text-[12px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: SYNTH.inkOnBrandMuted }}
          >
            {label ?? (lapMode ? 'Stopwatch' : `${boats.length}-boat race`)}
          </p>
          {/* Symmetry placeholder */}
          <span className="h-10 w-10" />
        </header>

        {/* HUGE TIMER — the Strava signature */}
        <div className="flex flex-col items-center px-5 pt-2 pb-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: SYNTH.inkOnBrandFaint }}
          >
            Time
          </p>
          <p
            className="leading-none tracking-[-0.04em]"
            style={{
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
              fontSize: 'clamp(72px, 22vw, 112px)',
              fontWeight: 800,
            }}
          >
            {fmtElapsed(elapsed)}
          </p>
          {status === 'paused' ? (
            <span
              className="mt-2 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ background: SYNTH.accentAmber, color: SYNTH.ink }}
            >
              Paused
            </span>
          ) : null}
        </div>

        {/* View toggle (only multi-boat) */}
        {!lapMode && boats.length > 1 ? (
          <div className="flex shrink-0 justify-center px-5 pb-2">
            <div
              className="flex items-center gap-1 rounded-full p-1"
              style={{
                background: SYNTH.glass,
                border: `1px solid ${SYNTH.glassBorder}`,
              }}
            >
              <ToggleChip
                active={view === 'lanes'}
                onClick={() => setView('lanes')}
                icon={<MapPin size={11} strokeWidth={2.4} />}
                label="Lanes"
              />
              <ToggleChip
                active={view === 'stats'}
                onClick={() => setView('stats')}
                icon={<BarChart3 size={11} strokeWidth={2.4} />}
                label="Stats"
              />
            </div>
          </div>
        ) : null}

        {/* Lanes or stats — fills remaining space */}
        <div className="synth-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-3">
          {view === 'lanes' && !lapMode ? (
            <BoatLanesView boats={laneBoats} markers={totalSplits} />
          ) : (
            <SplitsBars boats={boats} splits={splits} totalSplits={totalSplits} lapMode={lapMode} />
          )}
        </div>

        {/* Per-boat split buttons */}
        {status === 'running' ? (
          <div className="shrink-0 px-5 pb-3">
            <div className={`grid gap-2 ${boats.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {boats.map((b) => {
                const count = splitCounts.get(b.id) ?? 0
                const finishedThisBoat = count >= totalSplits
                return (
                  <motion.button
                    key={b.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSplit(b.id)}
                    disabled={finishedThisBoat}
                    className="flex items-center gap-2 rounded-2xl border px-3 py-3 text-left disabled:opacity-50"
                    style={{
                      background: SYNTH.glass,
                      border: `1px solid ${SYNTH.glassBorder}`,
                    }}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: b.color, color: SYNTH.ink }}
                    >
                      <Flag size={14} strokeWidth={2.6} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[13px] font-bold leading-tight"
                        style={{ color: SYNTH.inkOnBrand }}
                      >
                        {lapMode ? 'Lap' : `Split ${b.name}`}
                      </p>
                      <p
                        className="text-[10px] uppercase tracking-[0.12em]"
                        style={{ color: SYNTH.inkOnBrandMuted }}
                      >
                        {count}/{totalSplits}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        ) : null}

        {/* Big controls — Strava-styled */}
        <div
          className="flex shrink-0 items-center justify-center gap-4 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3"
          style={{
            background: 'rgba(31, 38, 201, 0.78)',
            backdropFilter: 'blur(18px) saturate(140%)',
            WebkitBackdropFilter: 'blur(18px) saturate(140%)',
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {status === 'running' ? (
            <SmallPill onClick={pause} icon={<Pause size={16} strokeWidth={2.6} />} label="Pause" />
          ) : null}
          {status === 'paused' ? (
            <SmallPill onClick={resume} icon={<Play size={16} strokeWidth={2.6} />} label="Resume" />
          ) : null}

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={finish}
            className="flex h-16 items-center gap-2.5 rounded-full px-7"
            style={{
              background: SYNTH.accentRed,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '0.04em',
              boxShadow: `0 14px 34px ${SYNTH.accentRed}aa, inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          >
            <Square size={18} strokeWidth={2.8} fill={SYNTH.inkOnBrand} />
            FINISH
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Subcomponents ──────────────────────────────────────────────────────

function ToggleChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors"
      style={{
        background: active ? SYNTH.inkOnBrand : 'transparent',
        color: active ? SYNTH.ink : SYNTH.inkOnBrandMuted,
        fontFamily: SYNTH.font,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function SplitsBars({
  boats,
  splits,
  totalSplits,
  lapMode,
}: {
  boats: RaceBoat[]
  splits: Split[]
  totalSplits: number
  lapMode: boolean
}) {
  const byBoat = new Map<string, Split[]>()
  boats.forEach((b) => byBoat.set(b.id, []))
  splits.forEach((s) => byBoat.get(s.boatId)?.push(s))

  return (
    <div
      className="flex flex-col gap-3 rounded-3xl px-4 py-4"
      style={{
        background: 'rgba(8, 11, 56, 0.65)',
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        {lapMode ? 'Laps' : 'Splits'}
      </p>
      {boats.map((b) => {
        const list = byBoat.get(b.id) ?? []
        return (
          <div key={b.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span
                className="text-[12px] font-semibold"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {b.name}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.12em]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {list.length}/{totalSplits}
              </span>
            </div>
            <div className="flex items-end gap-1">
              {Array.from({ length: totalSplits }).map((_, i) => {
                const split = list[i]
                const filled = split !== undefined
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-md transition-colors"
                      style={{
                        height: filled ? 36 : 16,
                        background: filled ? b.color : 'rgba(255,255,255,0.10)',
                      }}
                    />
                    {filled ? (
                      <span
                        className="text-[9px] font-semibold"
                        style={{
                          color: SYNTH.inkOnBrandMuted,
                          fontFamily: SYNTH.font,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {fmtElapsed(split.ts)}
                      </span>
                    ) : (
                      <span style={{ height: 12 }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SmallPill({
  onClick,
  icon,
  label,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 items-center gap-2 rounded-full border px-5 text-[13px] font-semibold"
      style={{
        background: SYNTH.glass,
        border: `1px solid ${SYNTH.glassBorder}`,
        color: SYNTH.inkOnBrand,
        fontFamily: SYNTH.font,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

export function fmtElapsed(ms: number): string {
  const totalSec = ms / 1000
  const m = Math.floor(totalSec / 60)
  const s = totalSec - m * 60
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`
}
