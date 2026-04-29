import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Square, X, MapPin, BarChart3 } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { BoatLanesView, type LaneBoat } from './BoatLanesView'

export type RaceBoat = {
  id: string
  name: string
  color: string
  speed?: number
}

export type Split = {
  boatId: string
  ts: number
}

type Status = 'running' | 'paused' | 'finished'
type Mode = 'solo' | 'multi'

type Props = {
  boats: RaceBoat[]
  totalSplits?: number
  expectedRaceMs?: number
  splitUnitLabel?: string // "/500m" or "/lap" — shown under SPLIT AVG PACE
  splitUnit?: 's' | 'ms'
  label?: string
  onFinish: (result: { elapsedMs: number; splits: Split[] }) => void
  /** Called when user closes (× icon) without finishing. */
  onDismiss: () => void
  /** Forces multi-boat layout regardless of boat count. Default infers from boats.length. */
  mode?: Mode
}

/**
 * Full-screen session timer. Two layouts:
 *
 *   solo  (1 boat)  — Strava stopwatch screen 1:1:
 *     ┌─────────────────────────────────────┐
 *     │             TIME                    │
 *     │           00:00:02                  │   HUGE bold
 *     │ ─────────────────────────────────── │
 *     │           SPLIT AVG PACE            │
 *     │              0:00                   │   HUGE bold
 *     │              /500m                  │
 *     │ ─────────────────────────────────── │
 *     │  ┌──┐                  DISTANCE     │
 *     │  │██│                    0.00       │
 *     │  └──┘                   METERS      │
 *     │  0:00                               │
 *     │                                     │
 *     │       [ ⏹ STOP ]    [ map ]         │
 *     └─────────────────────────────────────┘
 *
 *   multi (>1 boats) — Strava stopped screen with map-on-top translated:
 *     ┌─────────────────────────────────────┐
 *     │  [×]                                │
 *     │  ┌─── BOAT LANES ANIMATION ──────┐  │   continuous
 *     │  │ V8A ────────●                  │  │
 *     │  │ V8B ──────●                    │  │
 *     │  │ V4A ───●                       │  │
 *     │  └────────────────────────────────┘  │
 *     │                                     │
 *     │   TIME            SPLITS            │
 *     │  00:42.3           4 of 16          │
 *     │   ─────────────────────────────────  │
 *     │   AVG PACE         BOAT SPLITS      │
 *     │   1:42             [bars per boat]  │
 *     │                                     │
 *     │  [V8A] [V8B] [V4A]                  │  per-boat split tap
 *     │                                     │
 *     │       [ ⏹ STOP ]                    │
 *     └─────────────────────────────────────┘
 */
export function RaceRecorder({
  boats,
  totalSplits = 4,
  expectedRaceMs = 400_000,
  splitUnitLabel = '/500m',
  splitUnit = 's',
  label,
  onFinish,
  onDismiss,
  mode,
}: Props) {
  const layout: Mode = mode ?? (boats.length > 1 ? 'multi' : 'solo')
  const [status, setStatus] = useState<Status>('running')
  const [view, setView] = useState<'lanes' | 'stats'>('lanes')
  const [elapsed, setElapsed] = useState(0)
  const [splits, setSplits] = useState<Split[]>([])
  const startedAtRef = useRef<number | null>(performance.now())
  const accumRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const [activeBoatId, setActiveBoatId] = useState<string | null>(boats[0]?.id ?? null)

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

  const onSplit = (boatId: string) => {
    if (status !== 'running') return
    const now = performance.now()
    const ts = startedAtRef.current
      ? accumRef.current + (now - startedAtRef.current)
      : accumRef.current
    setSplits((prev) => [...prev, { boatId, ts }])
  }

  const finish = () => {
    if (startedAtRef.current !== null) {
      accumRef.current += performance.now() - startedAtRef.current
      startedAtRef.current = null
    }
    const finalElapsed = accumRef.current
    setElapsed(finalElapsed)
    setStatus('finished')
    onFinish({ elapsedMs: finalElapsed, splits })
  }

  const splitCounts = useMemo(() => {
    const m = new Map<string, number>()
    boats.forEach((b) => m.set(b.id, 0))
    splits.forEach((s) => m.set(s.boatId, (m.get(s.boatId) ?? 0) + 1))
    return m
  }, [boats, splits])

  // Continuous boat progress: position driven by elapsed × per-boat speed.
  // When splits land they anchor higher (we never look slower than actual).
  const laneBoats: LaneBoat[] = useMemo(() => {
    return boats.map((b) => {
      const captured = splitCounts.get(b.id) ?? 0
      const speed = b.speed ?? 1
      const continuous = (elapsed / expectedRaceMs) * speed
      const splitAnchor = captured / totalSplits
      const progress = Math.min(1, Math.max(splitAnchor, continuous))
      const lastSplit = [...splits].reverse().find((s) => s.boatId === b.id)?.ts
      return {
        id: b.id,
        name: b.name,
        color: b.color,
        progress,
        lastSplit: lastSplit !== undefined ? fmtSplit(lastSplit, splitUnit) : undefined,
      }
    })
  }, [boats, splitCounts, splits, totalSplits, elapsed, expectedRaceMs, splitUnit])

  const totalSplitsTaken = splits.length
  const totalSplitsTarget = boats.length * totalSplits

  // Average per-boat split pace
  const avgSplitMs = useMemo(() => {
    if (splits.length === 0) return 0
    const totalSec = splits.reduce((acc, s) => acc + s.ts, 0)
    return totalSec / splits.length
  }, [splits])

  return (
    <motion.div
      key="immersive"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background:
          layout === 'solo' ? '#FFFFFF' : `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
      }}
    >
      {/* Top bar — close button (small in solo to feel Strava-ish) */}
      <header
        className="flex shrink-0 items-center justify-between px-5"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 16px)',
          paddingBottom: 8,
        }}
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="flex h-9 items-center gap-1 rounded-full px-3 text-[14px] font-semibold"
          style={{
            background: 'transparent',
            color: layout === 'solo' ? SYNTH.ink : SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          <X size={14} strokeWidth={2.6} />
          Close
        </button>
        <p
          className="truncate text-center text-[14px] font-bold"
          style={{
            color: layout === 'solo' ? SYNTH.ink : SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          {label ?? (layout === 'solo' ? 'Stopwatch' : 'Race timer')}
        </p>
        <span className="h-9 w-9" />
      </header>

      {layout === 'solo' ? (
        <SoloLayout
          status={status}
          elapsed={elapsed}
          splits={splits}
          totalSplits={totalSplits}
          splitUnit={splitUnit}
          splitUnitLabel={splitUnitLabel}
          avgSplitMs={avgSplitMs}
          activeBoat={boats[0]}
          onLap={() => boats[0] && onSplit(boats[0].id)}
          onStop={finish}
        />
      ) : (
        <MultiLayout
          status={status}
          elapsed={elapsed}
          splits={splits}
          totalSplits={totalSplits}
          totalSplitsTaken={totalSplitsTaken}
          totalSplitsTarget={totalSplitsTarget}
          splitUnit={splitUnit}
          splitUnitLabel={splitUnitLabel}
          avgSplitMs={avgSplitMs}
          boats={boats}
          laneBoats={laneBoats}
          view={view}
          onSetView={setView}
          activeBoatId={activeBoatId}
          onSetActiveBoat={setActiveBoatId}
          onSplit={onSplit}
          onStop={finish}
        />
      )}
    </motion.div>
  )
}

// ─── Solo / Strava stopwatch ───────────────────────────────────────────────

function SoloLayout({
  elapsed,
  splits,
  totalSplits,
  splitUnit,
  splitUnitLabel,
  avgSplitMs,
  onLap,
  onStop,
}: {
  status: Status
  elapsed: number
  splits: Split[]
  totalSplits: number
  splitUnit: 's' | 'ms'
  splitUnitLabel: string
  avgSplitMs: number
  activeBoat?: RaceBoat
  onLap: () => void
  onStop: () => void
}) {
  const lastSplitMs = splits.length > 0 ? splits[splits.length - 1].ts : 0

  return (
    <>
      {/* TIME */}
      <section className="flex shrink-0 flex-col items-center px-5 pt-6 pb-4">
        <p
          className="text-[12px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: '#9A9AAB' }}
        >
          Time
        </p>
        <p
          className="mt-3 leading-none tracking-[-0.04em]"
          style={{
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
            fontSize: 'clamp(56px, 18vw, 96px)',
            fontWeight: 800,
          }}
        >
          {fmtClock(elapsed)}
        </p>
      </section>

      <Divider />

      {/* SPLIT AVG PACE */}
      <section className="flex flex-1 flex-col items-center justify-center px-5">
        <p
          className="text-[12px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: '#9A9AAB' }}
        >
          Split avg pace
        </p>
        <p
          className="mt-3 leading-none tracking-[-0.04em]"
          style={{
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
            fontSize: 'clamp(72px, 22vw, 120px)',
            fontWeight: 800,
          }}
        >
          {avgSplitMs > 0 ? fmtPace(avgSplitMs, splitUnit) : '0:00'}
        </p>
        <p
          className="mt-3 text-[12px] font-medium"
          style={{ color: '#9A9AAB' }}
        >
          {splitUnitLabel}
        </p>
      </section>

      <Divider />

      {/* Bottom row — last split bar + DISTANCE / split count */}
      <section className="grid shrink-0 grid-cols-2 px-5 py-5">
        <div className="flex flex-col items-center gap-2">
          <div
            className="rounded-md"
            style={{
              width: 56,
              height: 80,
              background: '#256BFF',
            }}
          />
          <p
            className="text-[14px] font-bold"
            style={{
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {lastSplitMs > 0 ? fmtSplit(lastSplitMs, splitUnit) : '0:00'}
          </p>
        </div>
        <div className="flex flex-col items-end justify-center">
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: '#9A9AAB' }}
          >
            Splits
          </p>
          <p
            className="leading-none tracking-[-0.02em]"
            style={{
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
              fontSize: 'clamp(40px, 12vw, 64px)',
              fontWeight: 800,
            }}
          >
            {splits.length.toString().padStart(2, '0')}
          </p>
          <p
            className="text-[12px] font-medium uppercase tracking-[0.18em]"
            style={{ color: '#9A9AAB' }}
          >
            of {totalSplits}
          </p>
        </div>
      </section>

      {/* STOP + map (lap) */}
      <section
        className="flex shrink-0 items-center justify-center gap-4 pb-[max(env(safe-area-inset-bottom),28px)] pt-2"
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onStop}
          aria-label="Stop"
          className="flex h-[78px] w-[78px] items-center justify-center rounded-full"
          style={{
            background: '#FC4C02',
            boxShadow: '0 14px 32px rgba(252,76,2,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <Square size={28} strokeWidth={2.8} color="#FFFFFF" fill="#FFFFFF" />
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={onLap}
          aria-label="Lap"
          className="flex h-[58px] w-[58px] items-center justify-center rounded-full"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E0E0E0',
            color: '#FC4C02',
          }}
        >
          <MapPin size={20} strokeWidth={2.4} fill="#FC4C02" />
        </motion.button>
      </section>
    </>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />
}

// ─── Multi-boat layout ─────────────────────────────────────────────────────

function MultiLayout({
  status,
  elapsed,
  splits,
  totalSplits,
  totalSplitsTaken,
  totalSplitsTarget,
  splitUnit,
  splitUnitLabel,
  avgSplitMs,
  boats,
  laneBoats,
  view,
  onSetView,
  activeBoatId,
  onSetActiveBoat,
  onSplit,
  onStop,
}: {
  status: Status
  elapsed: number
  splits: Split[]
  totalSplits: number
  totalSplitsTaken: number
  totalSplitsTarget: number
  splitUnit: 's' | 'ms'
  splitUnitLabel: string
  avgSplitMs: number
  boats: RaceBoat[]
  laneBoats: LaneBoat[]
  view: 'lanes' | 'stats'
  onSetView: (v: 'lanes' | 'stats') => void
  activeBoatId: string | null
  onSetActiveBoat: (id: string) => void
  onSplit: (boatId: string) => void
  onStop: () => void
}) {
  return (
    <>
      {/* Boats lane animation TOP (replaces Strava map) */}
      <section className="shrink-0 px-5 pb-3">
        <div className="relative">
          {view === 'lanes' ? (
            <BoatLanesView
              boats={laneBoats}
              highlightedId={activeBoatId ?? undefined}
              onSelectBoat={onSetActiveBoat}
              markers={totalSplits}
              mode="race"
              height={240}
            />
          ) : (
            <SplitsBars boats={boats} splits={splits} totalSplits={totalSplits} splitUnit={splitUnit} />
          )}
          {/* Lanes ↔ Stats toggle pinned to top-right */}
          <div
            className="absolute right-3 top-3 flex items-center gap-1 rounded-full p-1"
            style={{
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <SmallToggle
              active={view === 'lanes'}
              onClick={() => onSetView('lanes')}
              icon={<MapPin size={12} strokeWidth={2.4} />}
            />
            <SmallToggle
              active={view === 'stats'}
              onClick={() => onSetView('stats')}
              icon={<BarChart3 size={12} strokeWidth={2.4} />}
            />
          </div>
        </div>
      </section>

      {/* Stats row — TIME + SPLITS + AVG PACE */}
      <section className="grid shrink-0 grid-cols-2 gap-px px-5">
        <StatBlock
          label="Time"
          value={fmtClock(elapsed)}
          big
        />
        <StatBlock
          label="Splits"
          value={`${totalSplitsTaken} / ${totalSplitsTarget}`}
          big
        />
      </section>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.16)', margin: '0 20px' }} />
      <section className="grid shrink-0 grid-cols-2 gap-px px-5 pb-3">
        <StatBlock
          label={`Avg pace ${splitUnitLabel}`}
          value={avgSplitMs > 0 ? fmtPace(avgSplitMs, splitUnit) : '0:00'}
        />
        <div className="flex flex-col items-end justify-center">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
          >
            Active boat
          </p>
          <p
            className="text-[16px] font-bold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {boats.find((b) => b.id === activeBoatId)?.name ?? '—'}
          </p>
        </div>
      </section>

      {/* Per-boat split row — bottom action chips like Strava */}
      <section className="synth-scroll min-h-0 flex-1 overflow-y-auto px-5">
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Tap a boat to mark a split
        </p>
        <div className="grid grid-cols-2 gap-2">
          {boats.map((b) => {
            const count = splits.filter((s) => s.boatId === b.id).length
            const finishedThisBoat = count >= totalSplits
            const lastTs = [...splits].reverse().find((s) => s.boatId === b.id)?.ts
            const isActive = b.id === activeBoatId
            return (
              <motion.button
                key={b.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onSetActiveBoat(b.id)
                  onSplit(b.id)
                }}
                disabled={finishedThisBoat || status !== 'running'}
                className="rounded-2xl border px-3 py-3 text-left disabled:opacity-50"
                style={{
                  background: isActive ? `${b.color}33` : SYNTH.glass,
                  border: `1px solid ${isActive ? b.color : SYNTH.glassBorder}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: b.color }}
                  />
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                  >
                    {b.name}
                  </span>
                </div>
                <p
                  className="mt-1 text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  {count}/{totalSplits} · {lastTs !== undefined ? fmtSplit(lastTs, splitUnit) : '—'}
                </p>
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* STOP */}
      <section
        className="flex shrink-0 items-center justify-center gap-4 px-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-3"
        style={{
          background: 'rgba(31, 38, 201, 0.78)',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={onStop}
          aria-label="Finish"
          className="flex h-[68px] items-center gap-2.5 rounded-full px-9"
          style={{
            background: '#FC4C02',
            color: '#FFFFFF',
            fontFamily: SYNTH.font,
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '0.04em',
            boxShadow: '0 14px 32px rgba(252,76,2,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <Square size={20} strokeWidth={2.8} fill="#FFFFFF" />
          FINISH
        </motion.button>
      </section>
    </>
  )
}

function SmallToggle({
  active,
  onClick,
  icon,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full"
      style={{
        background: active ? '#FFFFFF' : 'transparent',
        color: active ? SYNTH.ink : SYNTH.inkOnBrandMuted,
      }}
    >
      {icon}
    </button>
  )
}

function StatBlock({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex flex-col items-start py-3">
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
      >
        {label}
      </p>
      <p
        className="leading-none tracking-[-0.02em]"
        style={{
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
          fontVariantNumeric: 'tabular-nums',
          fontSize: big ? 36 : 22,
          fontWeight: 800,
        }}
      >
        {value}
      </p>
    </div>
  )
}

function SplitsBars({
  boats,
  splits,
  totalSplits,
  splitUnit,
}: {
  boats: RaceBoat[]
  splits: Split[]
  totalSplits: number
  splitUnit: 's' | 'ms'
}) {
  const byBoat = new Map<string, Split[]>()
  boats.forEach((b) => byBoat.set(b.id, []))
  splits.forEach((s) => byBoat.get(s.boatId)?.push(s))

  return (
    <div
      className="rounded-3xl px-4 py-4"
      style={{
        background: 'rgba(8, 11, 56, 0.65)',
        border: `1px solid ${SYNTH.glassBorder}`,
        height: 240,
        overflow: 'auto',
      }}
    >
      {boats.map((b) => {
        const list = byBoat.get(b.id) ?? []
        return (
          <div key={b.id} className="mb-3 flex flex-col gap-1.5">
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
                        height: filled ? 32 : 14,
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
                        {fmtSplit(split.ts, splitUnit)}
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

// ─── Formatters ────────────────────────────────────────────────────────────

/** "00:00:02" — Strava clock style (HH:MM:SS but we use MM:SS:hundredths since rowing) */
export function fmtClock(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec - m * 60
  const cs = Math.floor((ms % 1000) / 10)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(cs).padStart(2, '0')}`
}

/** "1:42.3" or "0:42.350" (ms) for a split */
export function fmtSplit(ms: number, unit: 's' | 'ms'): string {
  const totalSec = ms / 1000
  const m = Math.floor(totalSec / 60)
  const s = totalSec - m * 60
  if (unit === 'ms') {
    return `${m}:${s.toFixed(3).padStart(6, '0')}`
  }
  return `${m}:${s.toFixed(1).padStart(4, '0')}`
}

/** Avg pace formatter — m:ss */
export function fmtPace(ms: number, unit: 's' | 'ms'): string {
  return fmtSplit(ms, unit)
}

/** Backwards-compat alias */
export const fmtElapsed = fmtClock
