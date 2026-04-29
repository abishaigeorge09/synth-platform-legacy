import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Calendar, Send, FileText } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { BoatLineupCard } from '../primitives/BoatLineupCard'
import { BoatConfigSheet } from '../primitives/BoatConfigSheet'
import { RacePresetSheet } from '../primitives/RacePresetSheet'
import { useLineupBuilderStore, SESSION_TYPE_OPTIONS } from '../data/lineupBuilderStore'
import { useSessionsStore, sortSessionsByDate, type Session } from '../data/useSessionsStore'
import { SYNTH } from '../lib/theme'

type TabKey = 'builder' | 'sessions'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'builder', label: 'Builder' },
  { key: 'sessions', label: 'Sessions' },
]

const STATUS_COLOR = {
  scheduled: SYNTH.cardLemon,
  'in-progress': SYNTH.cardSky,
  completed: SYNTH.accentEmerald,
} as const

const STATUS_LABEL = {
  scheduled: 'Scheduled',
  'in-progress': 'In progress',
  completed: 'Completed',
} as const

export function LineupsPage() {
  const [tab, setTab] = useState<TabKey>('builder')

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Lineup Builder" back="/app/coach/tools" />

      {/* Tab strip */}
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
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Builder ────────────────────────────────────────────────────────────────

function BuilderTab() {
  const navigate = useNavigate()
  const boats = useLineupBuilderStore((s) => s.boats)
  const meta = useLineupBuilderStore((s) => s.meta)
  const preset = useLineupBuilderStore((s) => s.preset)
  const setMeta = useLineupBuilderStore((s) => s.setMeta)
  const setSeatAthlete = useLineupBuilderStore((s) => s.setSeatAthlete)
  const resetDraft = useLineupBuilderStore((s) => s.resetDraft)
  const addSession = useSessionsStore((s) => s.addSession)

  const [editingBoatId, setEditingBoatId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [presetOpen, setPresetOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const canPublish = meta.name.trim().length > 0 && boats.length > 0
  const isFutureDate = meta.date > new Date().toISOString().slice(0, 10)

  const onPublish = () => {
    if (!canPublish) return
    setPublishing(true)
    const session = addSession({
      name: meta.name.trim(),
      type: meta.type,
      date: meta.date,
      notes: meta.notes.trim(),
      boats,
      preset,
      status: isFutureDate ? 'scheduled' : 'scheduled',
    })
    // Briefly show success then navigate to the session detail
    setTimeout(() => {
      setPublishing(false)
      resetDraft()
      navigate(`/app/coach/sessions/${session.id}`)
    }, 700)
  }

  return (
    <>
      {/* Session metadata card */}
      <section className="mx-5 mt-2">
        <div
          className="rounded-3xl border p-4"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            borderColor: SYNTH.glassBorder,
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Session details
          </p>
          {/* Name */}
          <input
            type="text"
            value={meta.name}
            onChange={(e) => setMeta({ name: e.target.value })}
            placeholder="e.g. Wednesday AM steady state"
            className="mt-2 w-full bg-transparent text-[18px] font-bold outline-none placeholder:text-white/40"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          />
          {/* Type pills */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SESSION_TYPE_OPTIONS.map((type) => {
              const active = meta.type === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMeta({ type })}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{
                    background: active ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.10)',
                    color: active ? SYNTH.ink : SYNTH.inkOnBrandMuted,
                    fontFamily: SYNTH.font,
                  }}
                >
                  {type}
                </button>
              )
            })}
          </div>
          {/* Date + notes inline */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
              >
                Date
              </span>
              <input
                type="date"
                value={meta.date}
                onChange={(e) => setMeta({ date: e.target.value })}
                className="rounded-xl border px-3 py-2 text-[13px] outline-none"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: SYNTH.glassBorder,
                  color: SYNTH.inkOnBrand,
                  fontFamily: SYNTH.font,
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setPresetOpen(true)}
              className="flex flex-col gap-1 rounded-xl border px-3 py-2 text-left"
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderColor: SYNTH.glassBorder,
              }}
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
              >
                Race preset
              </span>
              <span
                className="truncate text-[13px] font-bold"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {preset.raceFor}
              </span>
            </button>
          </div>
          {/* Notes */}
          <textarea
            value={meta.notes}
            onChange={(e) => setMeta({ notes: e.target.value })}
            placeholder="Optional notes — context for the coaches"
            rows={2}
            className="mt-3 w-full resize-none rounded-xl border px-3 py-2 text-[13px] outline-none placeholder:text-white/40"
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderColor: SYNTH.glassBorder,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
            }}
          />
        </div>
      </section>

      {/* Boats */}
      <section className="mx-5 mt-4 flex flex-col gap-3">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Boats · tap a seat to assign
        </p>
        {boats.map((b) => (
          <BoatLineupCard
            key={b.id}
            boat={b}
            onAssignSeat={(position, athleteId) => setSeatAthlete(b.id, position, athleteId)}
            onMore={() => setEditingBoatId(b.id)}
          />
        ))}

        {/* Add boat dashed card */}
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
          onClick={onPublish}
          disabled={!canPublish || publishing}
          className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-bold uppercase tracking-[0.04em] disabled:opacity-40"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            boxShadow: `0 14px 32px ${SYNTH.accentEmerald}88`,
          }}
        >
          {publishing ? (
            'Publishing…'
          ) : (
            <>
              <Send size={16} strokeWidth={2.6} />
              Publish session
            </>
          )}
        </motion.button>
        <p
          className="mt-2 text-center text-[11px]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          {canPublish
            ? `Saves ${boats.length} boat${boats.length === 1 ? '' : 's'} for ${meta.date}. Start it later from Sessions.`
            : 'Add a session name + at least one boat to publish.'}
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
            color: SYNTH.ink,
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
