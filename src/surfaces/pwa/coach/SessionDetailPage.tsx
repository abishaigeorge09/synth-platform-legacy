import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Play,
  FileText,
  Users,
  ChevronDown,
  Star,
  ArrowLeftRight,
} from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { useSessionsStore, type SessionRun, type Session } from '../data/useSessionsStore'
import { APP_MOCK_ATHLETES } from '../data/mockTeam'
import { SEAT_COUNT, type Boat } from '../data/lineupBuilderStore'
import { SYNTH } from '../lib/theme'
import { fmtClock, fmtSplit } from '../primitives/RaceRecorder'
import { SaveRaceSheet, type SaveRaceResult } from '../primitives/SaveRaceSheet'

const STATUS_COLOR: Record<Session['status'], string> = {
  scheduled: SYNTH.cardLemon,
  'in-progress': SYNTH.cardSky,
  'needs-rating': SYNTH.accentAmber,
  completed: SYNTH.accentEmerald,
}

const STATUS_LABEL: Record<Session['status'], string> = {
  scheduled: 'Scheduled',
  'in-progress': 'In progress',
  'needs-rating': 'Needs rating',
  completed: 'Completed',
}

export function SessionDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const session = useSessionsStore((s) => s.sessions.find((x) => x.id === id) ?? null)
  const updateRun = useSessionsStore((s) => s.updateRun)
  const markCompleted = useSessionsStore((s) => s.markCompleted)
  const [ratingsOpen, setRatingsOpen] = useState(false)

  if (!session) {
    return (
      <div className="flex flex-1 flex-col">
        <CoachPageHeader title="Session" back="/app/coach/lineups" />
        <div className="flex flex-1 items-center justify-center px-6">
          <p
            className="text-center text-[14px]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Session not found.
          </p>
        </div>
      </div>
    )
  }

  const startSession = () => {
    navigate(`/app/coach/sessions/${session.id}/timer`)
  }

  // Find the most recent unrated run — that's where the SaveRaceSheet will
  // attach ratings when the coach taps "Add ratings".
  const unratedRun = [...session.runs].reverse().find((r) => !r.ratings) ?? null
  const ratableBoats = unratedRun
    ? unratedRun.boatsSnapshot.map((b) => ({ id: b.id, name: b.name, color: b.color }))
    : []

  const heroCta = (() => {
    if (session.status === 'scheduled') return { label: 'Start session', onClick: startSession }
    if (session.status === 'in-progress') return { label: 'Resume session', onClick: startSession }
    if (session.status === 'needs-rating')
      return { label: 'Add ratings', onClick: () => setRatingsOpen(true) }
    return null
  })()

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
      <CoachPageHeader title="Session" back="/app/coach/lineups" />

      {/* Status hero */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-5 mt-2 rounded-3xl p-5"
        style={{
          background: STATUS_COLOR[session.status],
          boxShadow: SYNTH.shadow.card,
          color: SYNTH.ink,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ background: SYNTH.ink }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.ink, opacity: 0.7, fontFamily: SYNTH.font }}
          >
            {STATUS_LABEL[session.status]} · {session.type}
          </span>
        </div>
        <p
          className="mt-2 text-[20px] font-bold leading-[1.2]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          {session.name || 'Untitled session'}
        </p>
        <div
          className="mt-3 flex items-center gap-3 text-[12px]"
          style={{ color: SYNTH.ink, opacity: 0.7 }}
        >
          <span className="inline-flex items-center gap-1">
            <Calendar size={11} />
            {session.date}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Users size={11} />
            {session.boats.length} boat{session.boats.length === 1 ? '' : 's'}
          </span>
          {session.runs.length > 0 ? (
            <>
              <span>·</span>
              <span>
                {session.runs.length} run{session.runs.length === 1 ? '' : 's'}
              </span>
            </>
          ) : null}
        </div>
        {heroCta ? (
          <button
            type="button"
            onClick={heroCta.onClick}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-bold uppercase tracking-[0.04em]"
            style={{
              background: SYNTH.accentBlack,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
            }}
          >
            {session.status === 'needs-rating' ? (
              <Star size={14} strokeWidth={2.6} />
            ) : (
              <Play size={14} strokeWidth={2.6} fill={SYNTH.inkOnBrand} />
            )}
            {heroCta.label}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setRatingsOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border py-3 text-[13px] font-bold uppercase tracking-[0.04em]"
            style={{
              background: 'transparent',
              borderColor: SYNTH.ink,
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
            }}
          >
            Edit ratings
          </button>
        )}
      </motion.section>

      {/* Runs section */}
      {session.runs.length > 0 ? (
        <section className="mx-5 mt-4 flex flex-col gap-2">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Runs · split times + ratings
          </p>
          {session.runs.map((r, i) => (
            <RunCard key={r.id} run={r} runIdx={i} preset={session} />
          ))}
        </section>
      ) : null}

      {/* Initial boats summary (always visible — this is the published lineup) */}
      <section className="mx-5 mt-4 flex flex-col gap-2">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Published lineup
        </p>
        {session.boats.map((b) => {
          const filled = b.seats.filter((s) => s.athleteId !== null).length
          const total = SEAT_COUNT[b.size]
          return (
            <BoatRosterCard
              key={b.id}
              boat={b}
              meta={`${filled}/${total} seats`}
              startCollapsed
            />
          )
        })}
      </section>

      {/* Notes */}
      {session.notes ? (
        <section className="mx-5 mt-4">
          <p
            className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            <FileText size={10} className="-mt-0.5 inline" /> Notes
          </p>
          <div
            className="rounded-2xl border p-4"
            style={{
              background: SYNTH.glass,
              borderColor: SYNTH.glassBorder,
            }}
          >
            <p
              className="text-[13px] leading-[1.5]"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {session.notes}
            </p>
          </div>
        </section>
      ) : null}

      {/* Preset summary */}
      <section className="mx-5 mt-4">
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Race preset
        </p>
        <div
          className="rounded-2xl border px-4 py-3"
          style={{
            background: SYNTH.glass,
            borderColor: SYNTH.glassBorder,
          }}
        >
          <p
            className="text-[13px] font-semibold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {session.preset.raceFor} · {session.preset.distance}
          </p>
          <p
            className="text-[11px]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {session.preset.splits.length} splits · timing in{' '}
            {session.preset.splitUnit === 'ms' ? 'milliseconds' : 'seconds'}
          </p>
        </div>
      </section>

      {/* Add / edit ratings */}
      {unratedRun ? (
        <SaveRaceSheet
          open={ratingsOpen}
          onClose={() => setRatingsOpen(false)}
          boats={ratableBoats}
          elapsedMs={Math.max(0, ...Object.values(unratedRun.boatElapsed))}
          splits={unratedRun.splits}
          onSave={(saved: SaveRaceResult) => {
            updateRun(session.id, unratedRun.id, {
              ratings: saved.ratings,
              ratedByCoach: saved.ratedByCoach,
              notes: saved.privateNotes,
            })
            markCompleted(session.id)
          }}
        />
      ) : null}
    </div>
  )
}

// ─── Run card with expandable per-boat detail ──────────────────────────────

function RunCard({
  run,
  runIdx,
  preset,
}: {
  run: SessionRun
  runIdx: number
  preset: Session
}) {
  const [open, setOpen] = useState(false)
  const totalElapsed = Math.max(0, ...Object.values(run.boatElapsed))
  const hasSwaps = (run.swaps?.length ?? 0) > 0

  return (
    <motion.div
      layout
      className="rounded-2xl border"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        borderColor: SYNTH.glassBorder,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          R{runIdx + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-[14px] font-bold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {run.title}
          </p>
          <p
            className="text-[10px] uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {run.boatsSnapshot.length} boat{run.boatsSnapshot.length === 1 ? '' : 's'} ·{' '}
            {fmtClock(totalElapsed)}
            {hasSwaps ? ` · ${run.swaps!.length / 2} swap${run.swaps!.length / 2 === 1 ? '' : 's'}` : ''}
          </p>
        </div>
        {run.ratings ? (
          <span className="flex items-center gap-1">
            <Star size={11} color={SYNTH.accentEmerald} fill={SYNTH.accentEmerald} />
            <span
              className="text-[12px] font-bold"
              style={{
                color: SYNTH.accentEmerald,
                fontFamily: SYNTH.font,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {(
                run.ratings.reduce((acc, r) => acc + (r.technique + r.power + r.sync) / 3, 0) /
                run.ratings.length
              ).toFixed(1)}
            </span>
          </span>
        ) : null}
        <ChevronDown
          size={16}
          color={SYNTH.inkOnBrandFaint}
          style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-4 pb-4">
              {run.boatsSnapshot.map((boat) => (
                <RunBoatRow
                  key={boat.id}
                  boat={boat}
                  elapsedMs={run.boatElapsed[boat.id] ?? 0}
                  splits={run.splits.filter((s) => s.boatId === boat.id).map((s) => s.ts)}
                  splitUnit={preset.preset.splitUnit}
                  swapped={(run.swaps ?? [])
                    .filter((sw) => sw.boatId === boat.id)
                    .map((sw) => sw.position)}
                  rating={run.ratings?.find((r) => r.boatId === boat.id)}
                />
              ))}
              {run.ratedByCoach ? (
                <p
                  className="px-1 text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
                >
                  Rated by {run.ratedByCoach}
                </p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function RunBoatRow({
  boat,
  elapsedMs,
  splits,
  splitUnit,
  swapped,
  rating,
}: {
  boat: Boat
  elapsedMs: number
  splits: number[]
  splitUnit: 's' | 'ms'
  swapped: number[]
  rating?: { technique: number; power: number; sync: number }
}) {
  const [rosterOpen, setRosterOpen] = useState(false)

  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${SYNTH.glassBorder}` }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold"
          style={{ background: boat.color, color: SYNTH.ink }}
        >
          {boat.size}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-[13px] font-bold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {boat.name}
          </p>
          <p
            className="text-[10px] uppercase tracking-[0.12em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Total {fmtClock(elapsedMs)} · {splits.length} split{splits.length === 1 ? '' : 's'}
          </p>
        </div>
        {rating ? (
          <span className="flex items-center gap-1">
            <Star size={10} color={SYNTH.accentEmerald} fill={SYNTH.accentEmerald} />
            <span
              className="text-[11px] font-bold"
              style={{
                color: SYNTH.accentEmerald,
                fontFamily: SYNTH.font,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {((rating.technique + rating.power + rating.sync) / 3).toFixed(1)}
            </span>
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => setRosterOpen((o) => !o)}
          aria-label="Show roster"
          className="flex h-7 items-center gap-1 rounded-full px-2 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: 'rgba(255,255,255,0.10)',
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          <Users size={10} />
          Crew
          <ChevronDown
            size={11}
            style={{
              transform: rosterOpen ? 'rotate(180deg)' : undefined,
              transition: 'transform 0.2s',
            }}
          />
        </button>
      </div>

      {/* Splits row */}
      {splits.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {splits.map((ts, i) => (
            <span
              key={i}
              className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
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

      {rating ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <RatingPill label="Tech" value={rating.technique} />
          <RatingPill label="Power" value={rating.power} />
          <RatingPill label="Sync" value={rating.sync} />
        </div>
      ) : null}

      {/* Roster dropdown */}
      <AnimatePresence>
        {rosterOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {boat.seats.map((s) => {
                const a = APP_MOCK_ATHLETES.find((x) => x.id === s.athleteId)
                const wasSwapped = swapped.includes(s.position)
                return (
                  <div
                    key={s.position}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: wasSwapped ? `1px solid ${SYNTH.accentEmerald}` : '1px solid transparent',
                    }}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                      style={{ background: boat.color, color: SYNTH.ink }}
                    >
                      {s.position}
                    </span>
                    <span
                      className="flex-1 truncate text-[11px]"
                      style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                    >
                      {a?.name.split(' ')[0] ?? '—'}
                    </span>
                    {wasSwapped ? (
                      <span
                        className="rounded-full px-1 py-px text-[8px] font-bold uppercase tracking-[0.12em]"
                        style={{
                          background: SYNTH.accentEmerald,
                          color: SYNTH.inkOnBrand,
                          fontFamily: SYNTH.font,
                        }}
                      >
                        <ArrowLeftRight size={8} className="-mt-0.5 inline" /> Swap
                      </span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function RatingPill({ label, value }: { label: string; value: number }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{
        background: `${SYNTH.accentEmerald}26`,
        color: SYNTH.accentEmerald,
        fontFamily: SYNTH.font,
      }}
    >
      {label} {value}
    </span>
  )
}

// ─── Boat roster card (collapsible, used for the published lineup) ─────────

function BoatRosterCard({
  boat,
  meta,
  startCollapsed,
}: {
  boat: Boat
  meta: string
  startCollapsed?: boolean
}) {
  const [open, setOpen] = useState(!startCollapsed)
  return (
    <motion.div
      layout
      className="rounded-2xl border"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        borderColor: SYNTH.glassBorder,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[12px] font-bold"
          style={{ background: boat.color, color: SYNTH.ink }}
        >
          {boat.size}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-[14px] font-bold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {boat.name}
          </p>
          <p
            className="text-[10px] uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {meta}
          </p>
        </div>
        <ChevronDown
          size={14}
          color={SYNTH.inkOnBrandFaint}
          style={{
            transform: open ? 'rotate(180deg)' : undefined,
            transition: 'transform 0.2s',
          }}
        />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-1.5 px-4 pb-4">
              {boat.seats.map((s) => {
                const a = APP_MOCK_ATHLETES.find((x) => x.id === s.athleteId)
                return (
                  <div
                    key={s.position}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                      style={{ background: boat.color, color: SYNTH.ink }}
                    >
                      {s.position}
                    </span>
                    <span
                      className="truncate text-[11px]"
                      style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                    >
                      {a?.name.split(' ')[0] ?? '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
