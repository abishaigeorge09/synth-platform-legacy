import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Square, Pause, Flag, X, Plus, Layers, ArrowLeftRight } from 'lucide-react'
import {
  useSessionsStore,
  type RunSwap,
} from '../data/useSessionsStore'
import { type Boat } from '../data/lineupBuilderStore'
import { APP_MOCK_ATHLETES } from '../data/mockTeam'
import { SYNTH } from '../lib/theme'
import { fmtClock, fmtSplit } from '../primitives/RaceRecorder'
import { LiveBoatStrip, type StripBoat } from '../primitives/LiveBoatStrip'
import { RunSwapSheet } from '../primitives/RunSwapSheet'
import { SaveRaceSheet, type SaveRaceResult } from '../primitives/SaveRaceSheet'

type LiveBoatTimer = {
  id: string
  status: 'idle' | 'running' | 'paused' | 'finished'
  startedAt: number | null
  accum: number
  splits: number[]
}

type ActiveRun = {
  id: string
  title: string
  boats: Boat[]
  liveBoats: Record<string, LiveBoatTimer>
  raceGroups: string[][]
  swaps: RunSwap[]
  finishedAt: string | null
}

function makeIdleTimer(id: string): LiveBoatTimer {
  return { id, status: 'idle', startedAt: null, accum: 0, splits: [] }
}

function makeRun(boats: Boat[], index: number, swaps: RunSwap[] = []): ActiveRun {
  return {
    id: `run-${Date.now()}-${index}`,
    title: `Run ${index + 1}`,
    boats: boats.map((b) => ({ ...b, seats: b.seats.map((s) => ({ ...s })) })),
    liveBoats: Object.fromEntries(boats.map((b) => [b.id, makeIdleTimer(b.id)])),
    raceGroups: [],
    swaps,
    finishedAt: null,
  }
}

function elapsedFor(t: LiveBoatTimer, now: number): number {
  if (t.status === 'running' && t.startedAt !== null) {
    return t.accum + (now - t.startedAt)
  }
  return t.accum
}

export function SessionTimerPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const session = useSessionsStore((s) => s.sessions.find((x) => x.id === id) ?? null)
  const updateSession = useSessionsStore((s) => s.updateSession)
  const addRun = useSessionsStore((s) => s.addRun)
  const markCompleted = useSessionsStore((s) => s.markCompleted)
  const markNeedsRating = useSessionsStore((s) => s.markNeedsRating)

  const [runs, setRuns] = useState<ActiveRun[]>(() => (session ? [makeRun(session.boats, 0)] : []))
  const [activeRunIdx, setActiveRunIdx] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [raceTogetherOpen, setRaceTogetherOpen] = useState(false)
  const [swapOpen, setSwapOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [, forceTick] = useState(0)

  // Move session to in-progress on mount
  useEffect(() => {
    if (session && session.status === 'scheduled') {
      updateSession(session.id, { status: 'in-progress' })
    }
  }, [session, updateSession])

  // RAF — drives the live timers across the active run
  useEffect(() => {
    const active = runs[activeRunIdx]
    if (!active) return
    const anyRunning = Object.values(active.liveBoats).some((t) => t.status === 'running')
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
  }, [runs, activeRunIdx])

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>Session not found.</p>
      </div>
    )
  }

  const active = runs[activeRunIdx]
  const now = performance.now()

  const updateActiveRun = useCallback(
    (mut: (run: ActiveRun) => ActiveRun) => {
      setRuns((prev) => prev.map((r, i) => (i === activeRunIdx ? mut(r) : r)))
    },
    [activeRunIdx],
  )

  const startBoats = (boatIds: string[]) => {
    const start = performance.now()
    updateActiveRun((run) => ({
      ...run,
      raceGroups: boatIds.length >= 2 ? [...run.raceGroups, [...boatIds]] : [...run.raceGroups, ...boatIds.map((id) => [id])],
      liveBoats: Object.fromEntries(
        Object.entries(run.liveBoats).map(([id, t]) =>
          boatIds.includes(id) && (t.status === 'idle' || t.status === 'paused')
            ? [id, { ...t, status: 'running', startedAt: start }]
            : [id, t],
        ),
      ),
    }))
  }

  const pauseBoat = (boatId: string) => {
    updateActiveRun((run) => ({
      ...run,
      liveBoats: Object.fromEntries(
        Object.entries(run.liveBoats).map(([id, t]) => {
          if (id !== boatId || t.status !== 'running') return [id, t]
          const e = elapsedFor(t, performance.now())
          return [id, { ...t, status: 'paused', accum: e, startedAt: null }]
        }),
      ),
    }))
  }

  const finishBoat = (boatId: string) => {
    updateActiveRun((run) => ({
      ...run,
      liveBoats: Object.fromEntries(
        Object.entries(run.liveBoats).map(([id, t]) => {
          if (id !== boatId) return [id, t]
          const e = elapsedFor(t, performance.now())
          return [id, { ...t, status: 'finished', accum: e, startedAt: null }]
        }),
      ),
    }))
  }

  const splitBoat = (boatId: string) => {
    updateActiveRun((run) => ({
      ...run,
      liveBoats: Object.fromEntries(
        Object.entries(run.liveBoats).map(([id, t]) => {
          if (id !== boatId || t.status !== 'running') return [id, t]
          const e = elapsedFor(t, performance.now())
          return [id, { ...t, splits: [...t.splits, e] }]
        }),
      ),
    }))
  }

  const endRun = () => {
    if (!active) return
    // Finish anything still running
    let mutatedRun = active
    Object.values(active.liveBoats).forEach((t) => {
      if (t.status === 'running' || t.status === 'paused') {
        const e = elapsedFor(t, performance.now())
        mutatedRun = {
          ...mutatedRun,
          liveBoats: {
            ...mutatedRun.liveBoats,
            [t.id]: { ...t, status: 'finished', accum: e, startedAt: null },
          },
        }
      }
    })
    mutatedRun = { ...mutatedRun, finishedAt: new Date().toISOString() }
    setRuns((prev) => prev.map((r, i) => (i === activeRunIdx ? mutatedRun : r)))

    // Commit to the persistent store
    const boatElapsed: Record<string, number> = {}
    const splits: { boatId: string; ts: number }[] = []
    Object.values(mutatedRun.liveBoats).forEach((t) => {
      boatElapsed[t.id] = t.accum
      t.splits.forEach((ts) => splits.push({ boatId: t.id, ts }))
    })
    addRun(session.id, {
      title: mutatedRun.title,
      startedAt: new Date().toISOString(),
      finishedAt: mutatedRun.finishedAt ?? new Date().toISOString(),
      boatsSnapshot: mutatedRun.boats,
      raceGroups: mutatedRun.raceGroups,
      boatElapsed,
      splits,
      swaps: mutatedRun.swaps,
    })
  }

  const startNewRun = (nextBoats: Boat[], swaps: RunSwap[]) => {
    setRuns((prev) => {
      const newRun = makeRun(nextBoats, prev.length, swaps)
      const next = [...prev, newRun]
      setActiveRunIdx(next.length - 1)
      setPageIndex(0)
      return next
    })
  }

  const finishSession = (saved: SaveRaceResult | null) => {
    if (saved) {
      // Find the latest finished run that doesn't yet have ratings — attach
      // the ratings to it via updateRun.
      const state = useSessionsStore.getState()
      const persisted = state.sessions.find((s) => s.id === session.id)
      const lastUnrated = persisted?.runs.findLast?.((r) => !r.ratings)
      if (persisted && lastUnrated) {
        state.updateRun(session.id, lastUnrated.id, {
          ratings: saved.ratings,
          ratedByCoach: saved.ratedByCoach,
          notes: saved.privateNotes,
        })
      }
      markCompleted(session.id)
    } else {
      markNeedsRating(session.id)
    }
    navigate(`/app/coach/sessions/${session.id}`)
  }

  // ── Strip data ────────────────────────────────────────────────────────────
  const stripBoats: StripBoat[] = active
    ? active.boats.map((b) => {
        const t = active.liveBoats[b.id] ?? makeIdleTimer(b.id)
        return {
          id: b.id,
          name: b.name,
          color: b.color,
          status: t.status,
          elapsedMs: elapsedFor(t, now),
        }
      })
    : []

  const focusedBoatId = active?.boats[pageIndex]?.id

  // Boats currently idle — eligible for "Race together" picker
  const idleBoats = active
    ? active.boats.filter((b) => active.liveBoats[b.id]?.status === 'idle')
    : []

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
      {/* Top bar — close + session title */}
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
            {session.type}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRaceTogetherOpen(true)}
          aria-label="Race boats together"
          disabled={idleBoats.length === 0}
          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.12em] disabled:opacity-40"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          <Layers size={12} strokeWidth={2.6} />
          Race
        </button>
      </header>

      {/* Run tabs */}
      <RunTabs
        runs={runs}
        activeIdx={activeRunIdx}
        onPick={(i) => {
          setActiveRunIdx(i)
          setPageIndex(0)
        }}
        onAddRun={() => setSwapOpen(true)}
      />

      {/* Live boat strip */}
      <LiveBoatStrip
        boats={stripBoats}
        raceGroups={active?.raceGroups ?? []}
        focusedId={focusedBoatId}
        onTap={(id) => {
          const idx = active?.boats.findIndex((b) => b.id === id) ?? -1
          if (idx < 0) return
          setPageIndex(idx)
          const sc = scrollerRef.current
          if (sc) sc.scrollTo({ left: idx * sc.clientWidth, behavior: 'smooth' })
        }}
      />

      {/* Page indicator dots */}
      <div className="flex shrink-0 justify-center gap-1.5 py-1.5">
        {(active?.boats ?? []).map((b, i) => (
          <span
            key={b.id}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === pageIndex ? 22 : 6,
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
        {(active?.boats ?? []).map((boat) => {
          const t = active!.liveBoats[boat.id] ?? makeIdleTimer(boat.id)
          const liveMs = elapsedFor(t, now)
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
              <BoatPage
                boat={boat}
                timer={t}
                live={liveMs}
                splitsTarget={session.preset.splits.length}
                splitUnit={session.preset.splitUnit}
                onStart={() => startBoats([boat.id])}
                onPause={() => pauseBoat(boat.id)}
                onFinish={() => finishBoat(boat.id)}
                onSplit={() => splitBoat(boat.id)}
              />
            </div>
          )
        })}
      </div>

      {/* Bottom — End run / Finish session */}
      <footer
        className="flex shrink-0 items-center justify-center gap-3 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3"
        style={{
          background: 'rgba(31, 38, 201, 0.78)',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {active && !active.finishedAt ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={endRun}
            className="flex h-12 items-center gap-2 rounded-full px-5 text-[12px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: SYNTH.glass,
              border: `1px solid ${SYNTH.glassBorder}`,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
            }}
          >
            <Square size={14} strokeWidth={2.6} fill={SYNTH.inkOnBrand} />
            End run
          </motion.button>
        ) : null}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            // Make sure any in-flight run gets committed first
            if (active && !active.finishedAt) endRun()
            setSaveOpen(true)
          }}
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
      </footer>

      {/* Sheets */}
      <RaceTogetherSheet
        open={raceTogetherOpen}
        onClose={() => setRaceTogetherOpen(false)}
        idleBoats={idleBoats}
        onStart={(ids) => {
          startBoats(ids)
          setRaceTogetherOpen(false)
        }}
      />

      {active ? (
        <RunSwapSheet
          open={swapOpen}
          onClose={() => setSwapOpen(false)}
          boats={active.boats}
          onConfirm={(nextBoats, swaps) => {
            // End the current run before starting a new one
            if (!active.finishedAt) endRun()
            startNewRun(nextBoats, swaps)
          }}
        />
      ) : null}

      <SaveRaceSheet
        open={saveOpen}
        onClose={() => {
          setSaveOpen(false)
        }}
        boats={(runs[runs.length - 1]?.boats ?? []).map((b) => ({
          id: b.id,
          name: b.name,
          color: b.color,
        }))}
        elapsedMs={Object.values(runs[runs.length - 1]?.liveBoats ?? {}).reduce(
          (mx, t) => Math.max(mx, t.accum),
          0,
        )}
        splits={Object.values(runs[runs.length - 1]?.liveBoats ?? {}).flatMap((t) =>
          t.splits.map((ts) => ({ boatId: t.id, ts })),
        )}
        onSave={(saved) => finishSession(saved)}
        onSkip={() => finishSession(null)}
      />
    </div>
  )
}

// ─── Run tabs ───────────────────────────────────────────────────────────────

function RunTabs({
  runs,
  activeIdx,
  onPick,
  onAddRun,
}: {
  runs: ActiveRun[]
  activeIdx: number
  onPick: (i: number) => void
  onAddRun: () => void
}) {
  return (
    <div
      className="synth-scroll flex shrink-0 items-center gap-1.5 overflow-x-auto px-4 py-2"
      style={{ scrollbarWidth: 'none' }}
    >
      {runs.map((r, i) => {
        const active = i === activeIdx
        const anyRunning = Object.values(r.liveBoats).some((t) => t.status === 'running')
        const allFinished = r.finishedAt !== null
        const status = allFinished ? 'Completed' : anyRunning ? 'Live' : 'Ready'
        const statusColor =
          status === 'Live'
            ? SYNTH.accentEmerald
            : status === 'Completed'
              ? SYNTH.inkOnBrandFaint
              : SYNTH.cardLemon
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(i)}
            className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: active ? SYNTH.inkOnBrand : SYNTH.glass,
              color: active ? SYNTH.ink : SYNTH.inkOnBrand,
              border: `1px solid ${active ? SYNTH.inkOnBrand : SYNTH.glassBorder}`,
              fontFamily: SYNTH.font,
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: statusColor }}
            />
            {r.title}
          </button>
        )
      })}
      <button
        type="button"
        onClick={onAddRun}
        className="flex shrink-0 items-center gap-1 rounded-full border-2 border-dashed px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{
          borderColor: 'rgba(255,255,255,0.32)',
          color: SYNTH.inkOnBrandMuted,
          fontFamily: SYNTH.font,
        }}
      >
        <Plus size={11} strokeWidth={2.6} />
        New run
      </button>
    </div>
  )
}

// ─── Per-boat page ─────────────────────────────────────────────────────────

function BoatPage({
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
  timer: LiveBoatTimer
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

  const status = timer.status
  const splitsTaken = timer.splits.length
  const lastSplit = timer.splits[timer.splits.length - 1] ?? null

  return (
    <div className="flex h-full flex-col px-5">
      <div
        className="mt-2 flex items-center gap-3 rounded-2xl border px-4 py-3"
        style={{
          background: SYNTH.glass,
          borderColor: SYNTH.glassBorder,
        }}
      >
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[12px] font-bold"
          style={{ background: boat.color, color: SYNTH.ink }}
        >
          {boat.size}
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
      </div>

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
            fontSize: 'clamp(56px, 18vw, 88px)',
            fontWeight: 800,
          }}
        >
          {fmtClock(live)}
        </p>
        <p
          className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          {splitsTaken} / {splitsTarget} splits
          {lastSplit !== null ? ` · last ${fmtSplit(lastSplit, splitUnit)}` : ''}
        </p>
      </div>

      {timer.splits.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {timer.splits.map((ts, i) => (
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

      <div className="mb-4 grid shrink-0 grid-cols-3 gap-2">
        {status === 'idle' || status === 'paused' ? (
          <Ctrl
            onClick={onStart}
            color={SYNTH.accentEmerald}
            icon={<Play size={20} strokeWidth={2.6} fill={SYNTH.inkOnBrand} />}
            label={status === 'paused' ? 'Resume' : 'Start'}
          />
        ) : status === 'running' ? (
          <Ctrl
            onClick={onPause}
            color={SYNTH.accentAmber}
            icon={<Pause size={20} strokeWidth={2.6} fill={SYNTH.inkOnBrand} />}
            label="Pause"
          />
        ) : (
          <Ctrl
            onClick={() => {}}
            color="rgba(255,255,255,0.16)"
            icon={null}
            label="Done"
            disabled
          />
        )}
        <Ctrl
          onClick={onSplit}
          color="rgba(255,255,255,0.18)"
          icon={<Flag size={18} strokeWidth={2.6} color={SYNTH.inkOnBrand} />}
          label="Split"
          disabled={status !== 'running'}
        />
        <Ctrl
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

function Ctrl({
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

// ─── Race-together sheet ───────────────────────────────────────────────────

function RaceTogetherSheet({
  open,
  onClose,
  idleBoats,
  onStart,
}: {
  open: boolean
  onClose: () => void
  idleBoats: Boat[]
  onStart: (boatIds: string[]) => void
}) {
  const [picked, setPicked] = useState<string[]>([])
  useEffect(() => {
    if (open) setPicked(idleBoats.map((b) => b.id))
  }, [open, idleBoats])

  if (!open) return null

  const toggle = (id: string) => {
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end justify-center"
      style={{ background: 'rgba(8,8,40,0.55)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="w-full max-w-[420px] rounded-t-3xl p-5"
        style={{ background: '#FFFFFF', fontFamily: SYNTH.font }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ background: SYNTH.sheetMuted }} />
        <p
          className="text-[12px] font-bold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkMuted }}
        >
          <ArrowLeftRight size={11} className="-mt-0.5 inline" /> Race together
        </p>
        <p className="mt-2 text-[14px]" style={{ color: SYNTH.ink }}>
          Pick which boats start at the same time.
        </p>

        <div className="mt-3 flex flex-col gap-2">
          {idleBoats.map((b) => {
            const isOn = picked.includes(b.id)
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggle(b.id)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left"
                style={{
                  background: isOn ? `${b.color}26` : SYNTH.sheetMuted,
                  border: `1px solid ${isOn ? b.color : 'transparent'}`,
                }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[12px] font-bold"
                  style={{ background: b.color, color: SYNTH.ink }}
                >
                  {b.size}
                </span>
                <p
                  className="flex-1 text-[14px] font-bold"
                  style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                >
                  {b.name}
                </p>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    background: isOn ? SYNTH.accentEmerald : 'transparent',
                    border: `2px solid ${isOn ? SYNTH.accentEmerald : 'rgba(0,0,0,0.18)'}`,
                  }}
                >
                  {isOn ? (
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="#FFFFFF"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => onStart(picked)}
          disabled={picked.length === 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-bold disabled:opacity-40"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          <Play size={14} strokeWidth={2.8} fill={SYNTH.inkOnBrand} />
          Start race ({picked.length} boat{picked.length === 1 ? '' : 's'})
        </button>
      </motion.div>
    </motion.div>
  )
}
