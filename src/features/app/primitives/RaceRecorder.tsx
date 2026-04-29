import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Pause, Play, Square, Map as MapIcon, BarChart3, Flag } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { BoatLanesView, type LaneBoat } from './BoatLanesView'

export type RaceBoat = {
  id: string
  name: string
  color: string
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
  /** Race target — number of split markers (e.g. 4 for 2K with 500m splits) */
  totalSplits?: number
  onFinish: (result: { elapsedMs: number; splits: Split[] }) => void
  /** Default false — when true, shows a "Lap" button instead of per-boat splits (stopwatch mode) */
  lapMode?: boolean
}

/**
 * RaceRecorder — Strava's recording screen translated for boat racing.
 *
 *   ┌──────────────────────────────┐
 *   │   TIME                        │
 *   │   00:42.3                     │  ← big tabular timer
 *   │                               │
 *   │   [ Lanes view  ←→ Stats ]   │  ← view toggle
 *   │                               │
 *   │   ┌────────────────────────┐ │
 *   │   │ V8 A ────────●  3      │ │  ← BoatLanesView OR
 *   │   │ V8 B ──────● 2         │ │     bar chart of splits
 *   │   │ V4 A ───● 1            │ │
 *   │   │ V4 B ●  0              │ │
 *   │   └────────────────────────┘ │
 *   │                               │
 *   │   [V8A] [V8B] [V4A] [V4B]    │  ← per-boat split buttons
 *   │                               │
 *   │   [ ⏸ ]   [ ⏹ ]              │  ← pause + finish
 *   └──────────────────────────────┘
 */
export function RaceRecorder({ boats, totalSplits = 4, onFinish, lapMode = false }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [view, setView] = useState<ViewMode>('lanes')
  const [elapsed, setElapsed] = useState(0)
  const [splits, setSplits] = useState<Split[]>([])
  const startedAtRef = useRef<number | null>(null)
  const accumRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const tick = () => {
    if (startedAtRef.current === null) return
    const now = performance.now()
    setElapsed(accumRef.current + (now - startedAtRef.current))
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (status === 'running') {
      startedAtRef.current = performance.now()
      rafRef.current = requestAnimationFrame(tick)
    } else if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [status])

  const start = () => {
    accumRef.current = 0
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

  const resume = () => {
    setStatus('running')
  }

  const finish = () => {
    if (startedAtRef.current !== null) {
      accumRef.current += performance.now() - startedAtRef.current
      startedAtRef.current = null
    }
    setStatus('finished')
    onFinish({ elapsedMs: accumRef.current, splits })
  }

  const onSplit = (boatId: string) => {
    if (status !== 'running') return
    const now = performance.now()
    const ts = startedAtRef.current ? accumRef.current + (now - startedAtRef.current) : accumRef.current
    setSplits((prev) => [...prev, { boatId, ts }])
  }

  // Per-boat split count → progress
  const splitCounts = useMemo(() => {
    const m = new Map<string, number>()
    boats.forEach((b) => m.set(b.id, 0))
    splits.forEach((s) => m.set(s.boatId, (m.get(s.boatId) ?? 0) + 1))
    return m
  }, [boats, splits])

  // Lane data
  const laneBoats: LaneBoat[] = useMemo(
    () =>
      boats.map((b) => {
        const captured = splitCounts.get(b.id) ?? 0
        const lastSplit = [...splits].reverse().find((s) => s.boatId === b.id)?.ts
        return {
          id: b.id,
          name: b.name,
          color: b.color,
          progress: Math.min(1, captured / totalSplits),
          lastSplit: lastSplit !== undefined ? fmtElapsed(lastSplit) : undefined,
        }
      }),
    [boats, splitCounts, splits, totalSplits],
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Big timer */}
      <div
        className="flex flex-col items-center rounded-3xl px-6 py-6"
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
          {status === 'finished' ? 'Race time' : 'Time'}
        </p>
        <p
          className="mt-1 text-[56px] font-bold leading-none tracking-[-0.02em]"
          style={{
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmtElapsed(elapsed)}
        </p>
        {status === 'idle' ? (
          <p
            className="mt-2 text-[12px]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {boats.length === 1
              ? 'Tap START when ready'
              : `${boats.length} boats lined up · ${totalSplits} split markers`}
          </p>
        ) : null}
      </div>

      {/* View toggle (only relevant when there's at least one boat) */}
      {status !== 'idle' && !lapMode ? (
        <div
          className="flex items-center justify-center gap-1 self-center rounded-full p-1"
          style={{
            background: SYNTH.glass,
            border: `1px solid ${SYNTH.glassBorder}`,
          }}
        >
          <ToggleChip active={view === 'lanes'} onClick={() => setView('lanes')} icon={<MapIcon size={12} strokeWidth={2.4} />}>
            Lanes
          </ToggleChip>
          <ToggleChip active={view === 'stats'} onClick={() => setView('stats')} icon={<BarChart3 size={12} strokeWidth={2.4} />}>
            Stats
          </ToggleChip>
        </div>
      ) : null}

      {/* Lanes view OR stats */}
      {status !== 'idle' && view === 'lanes' && !lapMode ? (
        <BoatLanesView boats={laneBoats} markers={totalSplits} />
      ) : null}
      {status !== 'idle' && (view === 'stats' || lapMode) ? (
        <SplitsBars boats={boats} splits={splits} totalSplits={totalSplits} lapMode={lapMode} />
      ) : null}

      {/* Per-boat split buttons */}
      {status === 'running' ? (
        <div className={`grid gap-2 ${boats.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {boats.map((b) => {
            const count = splitCounts.get(b.id) ?? 0
            const finishedThisBoat = count >= totalSplits
            return (
              <motion.button
                key={b.id}
                type="button"
                whileTap={{ scale: 0.985 }}
                onClick={() => onSplit(b.id)}
                disabled={finishedThisBoat}
                className="flex items-center gap-2 rounded-2xl border px-3 py-3 text-left disabled:opacity-50"
                style={{
                  background: SYNTH.glass,
                  border: `1px solid ${SYNTH.glassBorder}`,
                }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: b.color, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  <Flag size={14} strokeWidth={2.4} />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[13px] font-bold leading-tight"
                    style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                  >
                    {lapMode ? 'Lap' : `Split ${b.name}`}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.12em]"
                    style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                  >
                    {count}/{totalSplits}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>
      ) : null}

      {/* Bottom controls — START / PAUSE-RESUME-FINISH */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {status === 'idle' ? (
          <BigCircleButton onClick={start} bg={SYNTH.accentEmerald} aria="Start race">
            <Play size={26} strokeWidth={2.6} color={SYNTH.inkOnBrand} fill={SYNTH.inkOnBrand} />
          </BigCircleButton>
        ) : null}
        {status === 'running' ? (
          <>
            <SmallPillButton onClick={pause} icon={<Pause size={16} strokeWidth={2.4} />} label="Pause" />
            <BigCircleButton onClick={finish} bg={SYNTH.accentRed} aria="Finish race">
              <Square size={22} strokeWidth={2.6} color={SYNTH.inkOnBrand} fill={SYNTH.inkOnBrand} />
            </BigCircleButton>
          </>
        ) : null}
        {status === 'paused' ? (
          <>
            <SmallPillButton onClick={resume} icon={<Play size={16} strokeWidth={2.4} />} label="Resume" />
            <BigCircleButton onClick={finish} bg={SYNTH.accentRed} aria="Finish race">
              <Square size={22} strokeWidth={2.6} color={SYNTH.inkOnBrand} fill={SYNTH.inkOnBrand} />
            </BigCircleButton>
          </>
        ) : null}
        {status === 'finished' ? (
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.accentEmerald, fontFamily: SYNTH.font }}
          >
            Race finished — saving…
          </p>
        ) : null}
      </div>
    </div>
  )
}

function ToggleChip({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
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
      {children}
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
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-md transition-colors"
                      style={{
                        height: filled ? 32 : 16,
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

function BigCircleButton({
  onClick,
  bg,
  aria,
  children,
}: {
  onClick: () => void
  bg: string
  aria: string
  children: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={aria}
      className="flex h-16 w-16 items-center justify-center rounded-full"
      style={{
        background: bg,
        boxShadow: `0 12px 28px ${bg}99, inset 0 1px 0 rgba(255,255,255,0.12)`,
      }}
    >
      {children}
    </motion.button>
  )
}

function SmallPillButton({
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
