import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../../dashboard/components/PageHeader'
import { BoatTimerCard } from './components/BoatTimerCard'
import { THEME } from '../../../../lib/theme'
import { useAthletes } from '../../../../shared/data/queries'
import { SkeletonBlock, SkeletonLine } from '../../../../shared/components/Skeleton'
import { QueryError } from '../../../../shared/components/QueryError'
import { useSessionTimerStore } from '../../../../shared/store/useSessionTimerStore'
import { fmtElapsed, fmtInterval } from './components/useStopwatch'
import { posthog } from '../../../../shared/analytics/posthog'

export function SessionTimerPage() {
  const { data: athletes, isLoading, isError, error } = useAthletes()
  const boats = useSessionTimerStore((s) => s.boats)
  const history = useSessionTimerStore((s) => s.history)
  const setInitialBoatsIfEmpty = useSessionTimerStore((s) => s.setInitialBoatsIfEmpty)
  const addBoat = useSessionTimerStore((s) => s.addBoat)
  const removeBoat = useSessionTimerStore((s) => s.removeBoat)
  const renameBoat = useSessionTimerStore((s) => s.renameBoat)
  const recordFinish = useSessionTimerStore((s) => s.recordFinish)
  const clearHistory = useSessionTimerStore((s) => s.clearHistory)
  const [recording, setRecording] = useState(false)
  const [exerciseType, setExerciseType] = useState<
    'rowing' | 'erg' | 'running' | 'circuit' | 'custom'
  >('rowing')

  const exerciseLabel =
    (
      {
        rowing: 'On-water piece',
        erg: 'Indoor erg',
        running: 'Run or cross-train',
        circuit: 'Circuit / strength',
        custom: 'Custom session',
      } as const
    )[exerciseType]

  useEffect(() => {
    if (isLoading || isError) return
    // Seed two demo boats drawn from the current roster (team-scoped).
    setInitialBoatsIfEmpty([
      {
        id: 'boat-1v',
        name: '1V 8+',
        athleteNames: athletes.slice(0, 8).map((a) => a.name),
      },
      {
        id: 'boat-2v',
        name: '2V 8+',
        athleteNames: athletes.slice(8, 16).map((a) => a.name),
      },
    ])
  }, [athletes, setInitialBoatsIfEmpty, isLoading, isError])

  const latestByBoatId = useMemo(() => {
    const map: Record<string, (typeof history)[number]> = {}
    for (const h of history) if (!map[h.boatId]) map[h.boatId] = h
    return map
  }, [history])

  if (isError) return <QueryError label="Session Timer" error={error} />

  if (isLoading) {
    return (
      <div className="flex min-h-full w-full flex-col pb-12">
        <header className="px-5 sm:px-10 pb-5 pt-8">
          <SkeletonLine width={180} height={8} />
          <SkeletonLine width={260} height={28} className="mt-2" />
          <SkeletonLine width={380} height={12} className="mt-2" />
        </header>
        <div className="grid gap-4 px-5 sm:px-10 lg:grid-cols-2">
          <SkeletonBlock className="w-full" style={{ height: 280, borderRadius: 12 }} />
          <SkeletonBlock className="w-full" style={{ height: 280, borderRadius: 12 }} />
        </div>
      </div>
    )
  }

  const hasBoats = boats.length > 0

  return (
    <div className="flex min-h-full w-full flex-col pb-8">
      <PageHeader
        kicker="Timer"
        title="Session timer"
        subtitle={boats.length === 1 ? '1 boat' : `${boats.length} boats`}
        showLive={false}
      />

      <div className="flex flex-wrap items-center gap-2 px-5 sm:px-10 pb-3">
        <div className="mr-3 flex items-center gap-2">
          <div
            className="flex rounded-full border p-1"
            style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}
            title="Workout type (labels only in demo)"
          >
            {(
              [
                { id: 'rowing', label: 'Row' },
                { id: 'erg', label: 'Erg' },
                { id: 'running', label: 'Run' },
                { id: 'circuit', label: 'Circuit' },
                { id: 'custom', label: 'Custom' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setExerciseType(opt.id)}
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  fontFamily: THEME.fontMono,
                  background:
                    exerciseType === opt.id ? 'var(--green-subtle)' : 'transparent',
                  color:
                    exerciseType === opt.id ? 'var(--green-primary)' : THEME.textSecondary,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => addBoat()}
          className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary, fontFamily: THEME.fontMono }}
        >
          + Boat
        </button>
        <button
          type="button"
          onClick={() => setRecording((v) => !v)}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
          style={{
            background: recording ? THEME.red : 'var(--bg-primary)',
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
                style={{ background: 'var(--bg-primary)' }}
              />
              Rec
            </>
          ) : (
            <>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: THEME.red }}
              />
              Video (demo)
            </>
          )}
        </button>
        <button
          type="button"
          onClick={clearHistory}
          className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textSecondary, fontFamily: THEME.fontMono }}
        >
          Clear
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-4 px-5 sm:px-10 lg:grid-cols-2"
      >
        {boats.map((boat) => (
          <BoatTimerCard
            key={boat.id}
            boatId={boat.id}
            boatName={boat.name}
            athletes={boat.athleteNames}
            exerciseLabel={exerciseLabel}
            onRename={(name) => renameBoat(boat.id, name)}
            onRemove={boats.length > 1 ? () => removeBoat(boat.id) : undefined}
            onFinished={(args) => {
              posthog.capture('session_timer_finished', {
                boat_name: args.boatName,
                elapsed_ms: args.elapsedMs,
                split_count: args.splits.length,
                exercise_type: exerciseType,
              })
              recordFinish(args)
            }}
          />
        ))}
      </motion.div>

      <div className="mt-6 px-5 sm:px-10">
        <div className="rounded-2xl border p-5" style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}>
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-semibold" style={{ color: THEME.textPrimary }}>
              Session history
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              {history.length} run{history.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {hasBoats ? (
              boats.map((b) => {
                const latest = latestByBoatId[b.id]
                return (
                  <div key={b.id} className="rounded-2xl border p-4" style={{ borderColor: THEME.border, background: THEME.light }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[12px] font-semibold" style={{ color: THEME.textPrimary }}>
                          {b.name}
                        </div>
                        <div className="text-[10px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                          {latest ? latest.createdAt.slice(11, 16) : '—'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[12px] font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
                          {latest ? fmtElapsed(latest.elapsedMs) : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {(latest?.splits ?? []).map((sp) => (
                        <div
                          key={sp.index}
                          className="flex items-center justify-between rounded-lg border px-3 py-2"
                          style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}
                        >
                          <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                            #{String(sp.index).padStart(2, '0')}
                          </div>
                          <div className="text-[12px] font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
                            {fmtElapsed(sp.totalMs)}
                          </div>
                          <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
                            +{fmtInterval(sp.intervalMs)}
                          </div>
                        </div>
                      ))}
                      {!latest?.splits?.length && (
                        <div className="text-[12px]" style={{ color: THEME.textSecondary }}>
                          No splits until finish
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-[12px]" style={{ color: THEME.textSecondary }}>
                Add a boat first
              </div>
            )}
          </div>
          <div className="mt-4 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            {history.length} run{history.length === 1 ? '' : 's'} saved
          </div>
        </div>
      </div>

      <div className="mt-4 px-5 sm:px-10">
        <details className="rounded-2xl border border-dashed p-3" style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}>
          <summary className="cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wider" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
            Post-session report — soon
          </summary>
          <div className="mt-2 text-[12px]" style={{ color: THEME.textSecondary }}>
            Auto summary after finishes (splits, chapters) → scan history.
          </div>
        </details>
      </div>
    </div>
  )
}
