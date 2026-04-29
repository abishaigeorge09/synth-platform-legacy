import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Square, X, Pause, Flag, Layers } from 'lucide-react'
import { useSessionsStore } from '../data/useSessionsStore'
import { APP_MOCK_ATHLETES } from '../data/mockTeam'
import { SYNTH } from '../lib/theme'
import { fmtClock, fmtSplit } from '../primitives/RaceRecorder'
import type { Boat } from '../data/lineupBuilderStore'

type BoatTimer = {
  status: 'idle' | 'running' | 'paused' | 'finished'
  elapsed: number
  startedAt: number | null // perf.now()
  accum: number
  splitTimes: number[]
}

function defaultTimer(): BoatTimer {
  return { status: 'idle', elapsed: 0, startedAt: null, accum: 0, splitTimes: [] }
}

/**
 * Live race timer for an entire session. Each boat is its own swipeable
 * page (CSS scroll-snap). Per-boat:
 *   - huge black timer (Strava style)
 *   - lineup chips
 *   - START · PAUSE · FINISH controls
 *   - SPLIT button captures a split
 *
 * Top bar has "Race together" — shows a compact picker; selecting boats
 * and tapping start/finish-all kicks them off simultaneously.
 *
 * Finish (all boats) writes the run into the session and routes back.
 */
export function SessionTimerPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const session = useSessionsStore((s) => s.sessions.find((x) => x.id === id) ?? null)
  const updateSession = useSessionsStore((s) => s.updateSession)
  const addRun = useSessionsStore((s) => s.addRun)

  // Per-boat timer state
  const boatIds = session?.boats.map((b) => b.id) ?? []
  const [timers, setTimers] = useState<Record<string, BoatTimer>>(() =>
    Object.fromEntries(boatIds.map((bid) => [bid, defaultTimer()])),
  )
  // Currently focused page index (for race-together button context)
  const [pageIndex, setPageIndex] = useState(0)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [, forceTick] = useState(0)

  // Mark session in-progress on mount (idempotent)
  useEffect(() => {
    if (session && session.status === 'scheduled') {
      updateSession(session.id, { status: 'in-progress' })
    }
  }, [session, updateSession])

  // RAF — drives the displayed elapsed for any running boat
  useEffect(() => {
    const anyRunning = Object.values(timers).some((t) => t.status === 'running')
    if (!anyRunning) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      return
    }
    const tick = () => {
      forceTick((n) => n + 1)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [timers])

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p
          className="text-center text-[14px]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Session not found.
        </p>
      </div>
    )
  }

  // ── Timer ops ─────────────────────────────────────────────────────────────
  const elapsedFor = (t: BoatTimer): number => {
    if (t.status === 'running' && t.startedAt !== null) {
      return t.accum + (performance.now() - t.startedAt)
    }
    return t.elapsed
  }

  const startBoat = (boatId: string) => {
    setTimers((prev) => ({
      ...prev,
      [boatId]: {
        ...prev[boatId],
        status: 'running',
        startedAt: performance.now(),
      },
    }))
  }
  const pauseBoat = (boatId: string) => {
    setTimers((prev) => {
      const t = prev[boatId]
      if (!t || t.status !== 'running') return prev
      const now = performance.now()
      const elapsed = t.accum + (t.startedAt ? now - t.startedAt : 0)
      return {
        ...prev,
        [boatId]: { ...t, status: 'paused', elapsed, accum: elapsed, startedAt: null },
      }
    })
  }
  const finishBoat = (boatId: string) => {
    setTimers((prev) => {
      const t = prev[boatId]
      if (!t) return prev
      const elapsed = elapsedFor(t)
      return {
        ...prev,
        [boatId]: { ...t, status: 'finished', elapsed, accum: elapsed, startedAt: null },
      }
    })
  }
  const splitBoat = (boatId: string) => {
    setTimers((prev) => {
      const t = prev[boatId]
      if (!t || t.status !== 'running') return prev
      const elapsed = elapsedFor(t)
      return {
        ...prev,
        [boatId]: { ...t, splitTimes: [...t.splitTimes, elapsed] },
      }
    })
  }
  const startAll = () => {
    setTimers((prev) => {
      const next: Record<string, BoatTimer> = {}
      const now = performance.now()
      Object.keys(prev).forEach((bid) => {
        const t = prev[bid]
        if (t.status === 'idle' || t.status === 'paused') {
          next[bid] = { ...t, status: 'running', startedAt: now }
        } else {
          next[bid] = t
        }
      })
      return next
    })
  }

  const finishSession = () => {
    // Capture a single Run snapshot of the session
    const boatElapsed: Record<string, number> = {}
    const splits: { boatId: string; ts: number }[] = []
    Object.entries(timers).forEach(([bid, t]) => {
      boatElapsed[bid] = t.elapsed || elapsedFor(t)
      t.splitTimes.forEach((ts) => splits.push({ boatId: bid, ts }))
    })
    addRun(session.id, {
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      boatElapsed,
      splits,
    })
    updateSession(session.id, { status: 'completed' })
    navigate(`/app/coach/sessions/${session.id}`)
  }

  // ── Page-snap scroll handler ─────────────────────────────────────────────
  const onScroll = () => {
    const sc = scrollerRef.current
    if (!sc) return
    const i = Math.round(sc.scrollLeft / sc.clientWidth)
    if (i !== pageIndex) setPageIndex(i)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
      }}
    >
      {/* Top bar */}
      <header
        className="flex shrink-0 items-center gap-2 px-4"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)', paddingBottom: 6 }}
      >
        <button
          type="button"
          onClick={() => navigate(`/app/coach/sessions/${session.id}`)}
          aria-label="Close timer"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{
            background: SYNTH.glass,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <X size={16} strokeWidth={2.4} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p
            className="truncate text-[12px] font-bold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {session.name || 'Session'}
          </p>
          <p
            className="text-[10px] uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
          >
            Boat {pageIndex + 1} of {session.boats.length}
          </p>
        </div>
        <button
          type="button"
          onClick={startAll}
          aria-label="Start all boats together"
          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          <Layers size={12} strokeWidth={2.6} />
          Start all
        </button>
      </header>

      {/* Page indicator dots */}
      <div className="flex shrink-0 justify-center gap-1.5 py-2">
        {session.boats.map((b, i) => (
          <span
            key={b.id}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === pageIndex ? 24 : 8,
              background: i === pageIndex ? b.color : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>

      {/* Boat pages — horizontal scroll-snap */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex flex-1 overflow-x-auto overflow-y-hidden"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
        }}
      >
        {session.boats.map((boat) => {
          const t = timers[boat.id] ?? defaultTimer()
          const live = elapsedFor(t)
          return (
            <div
              key={boat.id}
              className="flex shrink-0 flex-col"
              style={{
                width: '100%',
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always',
              }}
            >
              <BoatTimerPage
                boat={boat}
                timer={t}
                live={live}
                splitsTarget={session.preset.splits.length}
                splitUnit={session.preset.splitUnit}
                onStart={() => startBoat(boat.id)}
                onPause={() => pauseBoat(boat.id)}
                onFinish={() => finishBoat(boat.id)}
                onSplit={() => splitBoat(boat.id)}
              />
            </div>
          )
        })}
      </div>

      {/* Bottom — finish session */}
      <div
        className="flex shrink-0 items-center justify-center gap-3 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3"
        style={{
          background: 'rgba(31, 38, 201, 0.78)',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={finishSession}
          className="flex h-14 items-center gap-2 rounded-full px-7 text-[14px] font-bold uppercase tracking-[0.04em]"
          style={{
            background: '#FC4C02',
            color: '#FFFFFF',
            fontFamily: SYNTH.font,
            boxShadow: '0 10px 26px rgba(252,76,2,0.4)',
          }}
        >
          <Square size={16} strokeWidth={2.8} fill="#FFFFFF" />
          Finish session
        </motion.button>
      </div>
    </div>
  )
}

// ─── Single boat page ──────────────────────────────────────────────────────

function BoatTimerPage({
  boat,
  timer,
  live,
  splitsTarget,
  splitUnit,
  onStart,
  onPause,
  onFinish,
  onSplit,
}: {
  boat: Boat
  timer: BoatTimer
  live: number
  splitsTarget: number
  splitUnit: 's' | 'ms'
  onStart: () => void
  onPause: () => void
  onFinish: () => void
  onSplit: () => void
}) {
  const seatedAthletes = useMemo(
    () =>
      boat.seats
        .map((s) => APP_MOCK_ATHLETES.find((a) => a.id === s.athleteId))
        .filter((a): a is NonNullable<typeof a> => Boolean(a)),
    [boat.seats],
  )

  const splitsTaken = timer.splitTimes.length
  const lastSplit = timer.splitTimes[timer.splitTimes.length - 1] ?? null
  const status = timer.status

  return (
    <div className="flex h-full flex-col px-5">
      {/* Boat header */}
      <div
        className="mt-2 flex items-center gap-3 rounded-2xl border px-4 py-3"
        style={{
          background: SYNTH.glass,
          backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          borderColor: SYNTH.glassBorder,
        }}
      >
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: boat.color, color: SYNTH.ink }}
        >
          <span className="text-[12px] font-bold">{boat.size}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-[16px] font-bold leading-tight"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {boat.name}
          </p>
          <p
            className="truncate text-[10px] uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {seatedAthletes
              .slice(0, 4)
              .map((a) => a.name.split(' ')[0])
              .join(' · ')}
            {seatedAthletes.length > 4 ? ` +${seatedAthletes.length - 4}` : ''}
          </p>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]"
          style={{
            background:
              status === 'running'
                ? SYNTH.accentEmerald
                : status === 'paused'
                  ? SYNTH.accentAmber
                  : status === 'finished'
                    ? SYNTH.accentBlack
                    : 'rgba(255,255,255,0.18)',
            color: status === 'idle' ? SYNTH.inkOnBrand : SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          {status === 'idle' ? 'Ready' : status}
        </span>
      </div>

      {/* HUGE timer */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: SYNTH.inkOnBrandFaint }}
        >
          Time
        </p>
        <p
          className="mt-2 leading-none tracking-[-0.04em]"
          style={{
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
            fontSize: 'clamp(64px, 20vw, 104px)',
            fontWeight: 800,
          }}
        >
          {fmtClock(live)}
        </p>
        <p
          className="mt-3 text-[12px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          {splitsTaken} / {splitsTarget} splits
          {lastSplit !== null ? ` · last ${fmtSplit(lastSplit, splitUnit)}` : ''}
        </p>
      </div>

      {/* Splits chips */}
      {timer.splitTimes.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {timer.splitTimes.map((ts, i) => (
            <span
              key={i}
              className="rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={{
                background: boat.color,
                color: SYNTH.ink,
                fontFamily: SYNTH.font,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              #{i + 1} {fmtSplit(ts, splitUnit)}
            </span>
          ))}
        </div>
      ) : null}

      {/* Per-boat controls */}
      <div className="mb-4 grid shrink-0 grid-cols-3 gap-2">
        {status === 'idle' || status === 'paused' ? (
          <ControlButton
            onClick={onStart}
            color={SYNTH.accentEmerald}
            icon={<Play size={20} strokeWidth={2.6} fill={SYNTH.inkOnBrand} />}
            label={status === 'paused' ? 'Resume' : 'Start'}
          />
        ) : status === 'running' ? (
          <ControlButton
            onClick={onPause}
            color={SYNTH.accentAmber}
            icon={<Pause size={20} strokeWidth={2.6} fill={SYNTH.inkOnBrand} />}
            label="Pause"
          />
        ) : (
          <ControlButton onClick={() => {}} color="rgba(255,255,255,0.16)" icon={null} label="Done" disabled />
        )}
        <ControlButton
          onClick={onSplit}
          color="rgba(255,255,255,0.18)"
          icon={<Flag size={18} strokeWidth={2.6} color={SYNTH.inkOnBrand} />}
          label="Split"
          disabled={status !== 'running'}
        />
        <ControlButton
          onClick={onFinish}
          color="#FC4C02"
          icon={<Square size={18} strokeWidth={2.8} fill="#FFFFFF" />}
          label="Finish"
          disabled={status === 'finished' || status === 'idle'}
        />
      </div>
    </div>
  )
}

function ControlButton({
  onClick,
  color,
  icon,
  label,
  disabled,
}: {
  onClick: () => void
  color: string
  icon: React.ReactNode
  label: string
  disabled?: boolean
}) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl disabled:opacity-40"
      style={{
        background: color,
        color: SYNTH.inkOnBrand,
        fontFamily: SYNTH.font,
      }}
    >
      {icon}
      <span className="text-[11px] font-bold uppercase tracking-[0.12em]">{label}</span>
    </motion.button>
  )
}
