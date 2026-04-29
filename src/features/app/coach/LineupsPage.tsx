import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Calendar, Send, FileText, Star, Settings2 } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { BoatLineupCard } from '../primitives/BoatLineupCard'
import { BoatConfigSheet } from '../primitives/BoatConfigSheet'
import { RacePresetSheet } from '../primitives/RacePresetSheet'
import { PublishSessionSheet } from '../primitives/PublishSessionSheet'
import { useLineupBuilderStore } from '../data/lineupBuilderStore'
import {
  useSessionsStore,
  sortSessionsByDate,
  type Session,
} from '../data/useSessionsStore'
import { SYNTH } from '../lib/theme'

type TabKey = 'builder' | 'sessions' | 'ratings'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'builder', label: 'Builder' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'ratings', label: 'Ratings' },
]

const STATUS_COLOR: Record<Session['status'], string> = {
  scheduled: SYNTH.cardLemon,
  'in-progress': SYNTH.cardSky,
  'needs-rating': SYNTH.accentAmber,
  completed: SYNTH.accentEmerald,
}

const STATUS_LABEL: Record<Session['status'], string> = {
  scheduled: 'Scheduled',
  'in-progress': 'Live',
  'needs-rating': 'Needs rating',
  completed: 'Completed',
}

export function LineupsPage() {
  const [tab, setTab] = useState<TabKey>('builder')

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Lineup Builder" back="/app/coach/tools" />

      <div className="px-5">
        <div
          className="flex gap-1.5 rounded-full p-1"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="flex-1 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
                style={{
                  background: active ? SYNTH.inkOnBrand : 'transparent',
                  color: active ? SYNTH.ink : SYNTH.inkOnBrandMuted,
                  fontFamily: SYNTH.font,
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-3"
        >
          {tab === 'builder' && <BuilderTab />}
          {tab === 'sessions' && <SessionsTab />}
          {tab === 'ratings' && <RatingsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Builder ────────────────────────────────────────────────────────────────

function BuilderTab() {
  const navigate = useNavigate()
  const boats = useLineupBuilderStore((s) => s.boats)
  const preset = useLineupBuilderStore((s) => s.preset)
  const [editingBoatId, setEditingBoatId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [presetOpen, setPresetOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)

  const canPublish = boats.length > 0

  return (
    <>
      {/* Race preset chip */}
      <section className="mx-5 mt-2">
        <button
          type="button"
          onClick={() => setPresetOpen(true)}
          className="flex w-full items-center gap-3 rounded-3xl p-4 text-left active:opacity-90"
          style={{ background: SYNTH.cardLemon, boxShadow: SYNTH.shadow.card }}
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}
          >
            <Settings2 size={20} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: SYNTH.ink, opacity: 0.6, fontFamily: SYNTH.font }}
            >
              Session preset · tap to edit
            </p>
            <p
              className="mt-1 text-[15px] font-bold leading-tight"
              style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
            >
              {preset.raceFor}
            </p>
            <p
              className="mt-0.5 text-[11px]"
              style={{ color: SYNTH.ink, opacity: 0.65, fontFamily: SYNTH.font }}
            >
              {preset.distance} · {preset.splits.length} splits · timing in{' '}
              {preset.splitUnit === 'ms' ? 'milliseconds' : 'seconds'}
            </p>
          </div>
          <ChevronRight size={16} color={SYNTH.ink} />
        </button>
      </section>

      {/* Boats */}
      <section className="mx-5 mt-4 flex flex-col gap-3">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Boats · tap a seat to fill from there
        </p>
        {boats.map((b) => (
          <BoatLineupCard
            key={b.id}
            boat={b}
            onEdit={() => setEditingBoatId(b.id)}
          />
        ))}

        <motion.button
          type="button"
          whileTap={{ scale: 0.99 }}
          onClick={() => setAdding(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 text-[12px] font-semibold uppercase tracking-[0.14em]"
          style={{
            borderColor: 'rgba(255,255,255,0.30)',
            color: SYNTH.inkOnBrandMuted,
            fontFamily: SYNTH.font,
          }}
        >
          <Plus size={14} strokeWidth={2.6} />
          Add a boat
        </motion.button>
      </section>

      {/* Publish */}
      <section className="mx-5 mt-5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => setPublishOpen(true)}
          disabled={!canPublish}
          className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-bold uppercase tracking-[0.04em] disabled:opacity-40"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            boxShadow: `0 14px 32px ${SYNTH.accentEmerald}88`,
          }}
        >
          <Send size={16} strokeWidth={2.6} />
          Publish session
        </motion.button>
        <p
          className="mt-2 text-center text-[11px]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          Saves to Sessions. Start the timer later from there.
        </p>
      </section>

      {/* Sheets */}
      <BoatConfigSheet
        open={editingBoatId !== null || adding}
        onClose={() => {
          setEditingBoatId(null)
          setAdding(false)
        }}
        boatId={editingBoatId}
      />
      <RacePresetSheet open={presetOpen} onClose={() => setPresetOpen(false)} />
      <PublishSessionSheet
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onPublished={(id) => navigate(`/app/coach/sessions/${id}`)}
      />
    </>
  )
}

// ─── Sessions list ─────────────────────────────────────────────────────────

function SessionsTab() {
  const sessions = useSessionsStore((s) => s.sessions)
  const sorted = sortSessionsByDate(sessions)

  return (
    <section className="mx-5 mt-2 flex flex-col gap-2">
      {sorted.length === 0 ? (
        <div
          className="rounded-3xl border-2 border-dashed px-6 py-10 text-center"
          style={{
            borderColor: 'rgba(255,255,255,0.25)',
            color: SYNTH.inkOnBrandMuted,
            fontFamily: SYNTH.font,
          }}
        >
          <FileText size={20} className="mx-auto mb-2 opacity-50" />
          <p className="text-[13px]">No sessions yet.</p>
          <p
            className="mt-1 text-[11px]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
          >
            Build a lineup and publish to create your first session.
          </p>
        </div>
      ) : (
        sorted.map((s) => <SessionRow key={s.id} session={s} />)
      )}
    </section>
  )
}

function SessionRow({ session }: { session: Session }) {
  const navigate = useNavigate()
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate(`/app/coach/sessions/${session.id}`)}
      className="rounded-2xl border p-4 text-left"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        borderColor: SYNTH.glassBorder,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]"
          style={{
            background: STATUS_COLOR[session.status],
            color:
              session.status === 'scheduled' || session.status === 'in-progress'
                ? SYNTH.ink
                : SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          {STATUS_LABEL[session.status]}
        </span>
        <Calendar size={10} color={SYNTH.inkOnBrandFaint} />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          {session.date} · {session.type}
        </span>
        <ChevronRight size={14} color={SYNTH.inkOnBrandFaint} className="ml-auto" />
      </div>
      <p
        className="mt-2 text-[15px] font-bold leading-tight"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {session.name || 'Untitled session'}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {session.boats.map((b) => (
          <span
            key={b.id}
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: `${b.color}55`,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              border: `1px solid ${b.color}99`,
            }}
          >
            {b.name}
          </span>
        ))}
      </div>
    </motion.button>
  )
}

// ─── Ratings ────────────────────────────────────────────────────────────────

function RatingsTab() {
  const sessions = useSessionsStore((s) => s.sessions)
  const navigate = useNavigate()

  const allRatings = useMemo(() => {
    const out: {
      sessionId: string
      sessionName: string
      sessionDate: string
      runId: string
      runIndex: number
      ratedByCoach?: string
      boatId: string
      boatName: string
      boatColor: string
      avg: number
    }[] = []
    sessions.forEach((s) => {
      s.runs.forEach((r, runIdx) => {
        ;(r.ratings ?? []).forEach((rating) => {
          const boat = s.boats.find((b) => b.id === rating.boatId)
          if (!boat) return
          const avg = (rating.technique + rating.power + rating.sync) / 3
          out.push({
            sessionId: s.id,
            sessionName: s.name,
            sessionDate: s.date,
            runId: r.id,
            runIndex: runIdx + 1,
            ratedByCoach: r.ratedByCoach,
            boatId: rating.boatId,
            boatName: boat.name,
            boatColor: boat.color,
            avg,
          })
        })
      })
    })
    out.sort((a, b) => b.avg - a.avg)
    return out
  }, [sessions])

  return (
    <section className="mx-5 mt-2 flex flex-col gap-2">
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        Ratings across all sessions · top first
      </p>
      {allRatings.length === 0 ? (
        <div
          className="rounded-3xl border-2 border-dashed px-6 py-10 text-center"
          style={{
            borderColor: 'rgba(255,255,255,0.25)',
            color: SYNTH.inkOnBrandMuted,
            fontFamily: SYNTH.font,
          }}
        >
          <Star size={20} className="mx-auto mb-2 opacity-50" />
          <p className="text-[13px]">No ratings yet.</p>
          <p
            className="mt-1 text-[11px]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
          >
            Rate a session at finish and the boat ratings show up here.
          </p>
        </div>
      ) : (
        allRatings.map((r, i) => (
          <button
            key={`${r.sessionId}-${r.runId}-${r.boatId}-${i}`}
            type="button"
            onClick={() => navigate(`/app/coach/sessions/${r.sessionId}`)}
            className="flex items-center gap-3 rounded-2xl border p-3 text-left"
            style={{
              background: SYNTH.glass,
              borderColor: SYNTH.glassBorder,
            }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: r.boatColor, color: SYNTH.ink }}
            >
              <Star size={18} fill={SYNTH.ink} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[13px] font-bold"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {r.boatName}
              </p>
              <p
                className="text-[11px]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {r.sessionName} · {r.sessionDate} · Run {r.runIndex}
                {r.ratedByCoach ? ` · ${r.ratedByCoach}` : ''}
              </p>
            </div>
            <span className="flex items-center gap-1">
              <Star size={12} color={SYNTH.accentEmerald} fill={SYNTH.accentEmerald} />
              <span
                className="text-[16px] font-bold"
                style={{
                  color: SYNTH.inkOnBrand,
                  fontFamily: SYNTH.font,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {r.avg.toFixed(1)}
              </span>
            </span>
          </button>
        ))
      )}
    </section>
  )
}
