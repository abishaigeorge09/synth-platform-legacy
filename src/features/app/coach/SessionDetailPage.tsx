import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Play, FileText, Users } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { useSessionsStore } from '../data/useSessionsStore'
import { APP_MOCK_ATHLETES } from '../data/mockTeam'
import { SEAT_COUNT } from '../data/lineupBuilderStore'
import { SYNTH } from '../lib/theme'

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

/**
 * Session detail — view a published session, see its boats and lineups,
 * and launch the live timer. Also entry point for editing notes after
 * the session has been run.
 */
export function SessionDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const session = useSessionsStore((s) => s.sessions.find((x) => x.id === id) ?? null)

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

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Session" back="/app/coach/lineups" />

      {/* Hero — session card */}
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
        <div className="mt-3 flex items-center gap-3 text-[12px]" style={{ color: SYNTH.ink, opacity: 0.7 }}>
          <span className="inline-flex items-center gap-1">
            <Calendar size={11} />
            {session.date}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Users size={11} />
            {session.boats.length} boat{session.boats.length === 1 ? '' : 's'}
          </span>
        </div>
        {session.status !== 'completed' ? (
          <button
            type="button"
            onClick={startSession}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-bold uppercase tracking-[0.04em]"
            style={{
              background: SYNTH.accentBlack,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
            }}
          >
            <Play size={14} strokeWidth={2.6} fill={SYNTH.inkOnBrand} />
            {session.status === 'in-progress' ? 'Resume session' : 'Start session'}
          </button>
        ) : null}
      </motion.section>

      {/* Boats summary */}
      <section className="mx-5 mt-4 flex flex-col gap-2">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Boats in this session
        </p>
        {session.boats.map((b) => {
          const filled = b.seats.filter((s) => s.athleteId !== null).length
          const total = SEAT_COUNT[b.size]
          return (
            <div
              key={b.id}
              className="rounded-2xl border p-4"
              style={{
                background: SYNTH.glass,
                backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                borderColor: SYNTH.glassBorder,
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: b.color, color: SYNTH.ink }}
                >
                  <span className="text-[12px] font-bold">{b.size}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                  >
                    {b.name}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.14em]"
                    style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                  >
                    {filled}/{total} seats
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {b.seats.map((s) => {
                  const a = APP_MOCK_ATHLETES.find((x) => x.id === s.athleteId)
                  return (
                    <div
                      key={s.position}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                        style={{ background: b.color, color: SYNTH.ink }}
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
            </div>
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
    </div>
  )
}
