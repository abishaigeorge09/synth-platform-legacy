import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../../dashboard/components/PageHeader'
import { BoatTimerCard } from './components/BoatTimerCard'
import { THEME } from '../../../../lib/theme'
import { SEED_ATHLETES } from '../../../../shared/data/seeds'

type BoatRef = {
  id: string
  name: string
  athleteNames: string[]
}

export function SessionTimerPage() {
  // Seed two demo boats drawn from the Cal Women's roster.
  const [boats] = useState<BoatRef[]>(() => [
    {
      id: 'boat-1v',
      name: '1V 8+',
      athleteNames: SEED_ATHLETES.slice(0, 8).map((a) => a.name),
    },
    {
      id: 'boat-2v',
      name: '2V 8+',
      athleteNames: SEED_ATHLETES.slice(8, 16).map((a) => a.name),
    },
  ])
  const [recording, setRecording] = useState(false)

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="Custom Tools · Session Timer"
        title="Piece timer · multi-boat"
        subtitle={`${boats.length} boats ready · tap Split to record piece times · video markers on each tap`}
      />

      <div className="flex flex-wrap items-center gap-3 px-5 sm:px-10 pb-4">
        <button
          type="button"
          onClick={() => setRecording((v) => !v)}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
          style={{
            background: recording ? THEME.red : THEME.white,
            color: recording ? THEME.white : THEME.textPrimary,
            border: `1px solid ${recording ? THEME.red : THEME.border}`,
            fontFamily: THEME.fontMono,
            boxShadow: recording ? '0 12px 28px -14px rgba(239,68,68,0.55)' : 'none',
          }}
        >
          {recording ? (
            <>
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: THEME.white }}
              />
              Recording · tap splits to mark chapters
            </>
          ) : (
            <>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: THEME.red }}
              />
              Start video recording (stub)
            </>
          )}
        </button>
        <div
          className="text-[11px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Splits feed session_splits; video chapters write to session_media.split_markers_json
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-4 px-5 sm:px-10 lg:grid-cols-2"
      >
        {boats.map((boat) => (
          <BoatTimerCard key={boat.id} boatName={boat.name} athletes={boat.athleteNames} />
        ))}
      </motion.div>

      <div className="mt-6 px-5 sm:px-10">
        <div
          className="rounded-2xl border border-dashed p-5"
          style={{ background: THEME.white, borderColor: THEME.border }}
        >
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Post-session report (auto)
          </div>
          <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
            Generated when you tap Finish on all boats
          </div>
          <p className="mt-3 text-[12px] leading-relaxed" style={{ color: THEME.textSecondary }}>
            After both boats finish, synth. will stitch together a per-boat markdown report: piece times, intervals,
            video chapter markers, and deltas vs. the most recent equivalent session. The report lands in
            <code
              className="mx-1 rounded px-1 py-0.5 text-[11px]"
              style={{ background: THEME.light, border: `1px solid ${THEME.border}`, fontFamily: THEME.fontMono }}
            >
              scan_logs
            </code>
            under a new <em>session_timer</em> source so it shows up on the coach dashboard Activity feed.
          </p>
        </div>
      </div>
    </div>
  )
}
