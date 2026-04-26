import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'
import { useAthletes, useErgScores, isAthleteFlagged, getAthleteRecovery } from '../../../../shared/data/queries'
import { SkeletonTable } from '../../../../shared/components/Skeleton'

function fmt2k(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

export function RosterPreviewTable({
  sideFilter = 'all',
  flaggedOnly = false,
}: {
  sideFilter?: 'all' | 'port' | 'starboard'
  flaggedOnly?: boolean
}) {
  const { data: athletes, isLoading: l1, isError: e1 } = useAthletes()
  const { data: ergScores, isLoading: l2, isError: e2 } = useErgScores()

  if (e1 || e2 || l1 || l2) return <SkeletonTable rows={8} />

  const rows = ergScores
    .map((score) => {
      const athlete = athletes.find((a) => a.id === score.athleteId)
      return { score, athlete }
    })
    .filter(({ athlete }) => {
      if (!athlete) return false
      if (sideFilter !== 'all' && athlete.side !== sideFilter) return false
      if (flaggedOnly && !isAthleteFlagged(athlete.id, athlete.name)) return false
      return true
    })
    .slice(0, 8)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="rounded-2xl border"
      style={{
        background: THEME.white,
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
      }}
    >
      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Roster · 316 2K results
          </div>
          <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
            Top 8 by 2K time
          </div>
        </div>
        <Link
          to="/coach/athletes"
          className="text-[11px] font-semibold uppercase tracking-wider transition-colors hover:underline"
          style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
        >
          View all {athletes.length} →
        </Link>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]" style={{ fontFamily: THEME.fontMono }}>
          <thead>
            <tr style={{ color: THEME.textMuted, borderTop: `1px solid ${THEME.border}` }}>
              <th className="px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.16em] sm:px-5">#</th>
              <th className="px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.16em] sm:px-5">Athlete</th>
              <th className="px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.16em] sm:px-5">2K</th>
              <th className="hidden px-5 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.16em] sm:table-cell">Split</th>
              <th className="hidden px-5 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.16em] md:table-cell">SPM</th>
              <th className="hidden px-5 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.16em] md:table-cell">Watts</th>
              <th className="px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.16em] sm:px-5">Recovery</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ score, athlete }, i) => {
              const recovery = athlete ? getAthleteRecovery(athlete.id, athlete.name) : 50
              const recoveryColor =
                recovery >= 75 ? THEME.primary : recovery >= 50 ? THEME.amber : THEME.red
              return (
                <tr
                  key={score.id}
                  className="transition-colors hover:bg-zinc-50"
                  style={{ borderTop: `1px solid ${THEME.border}` }}
                >
                  <td className="px-3 py-3 sm:px-5" style={{ color: THEME.textMuted }}>
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td
                    className="px-3 py-3 font-semibold sm:px-5"
                    style={{ color: THEME.textPrimary, fontFamily: THEME.fontSans }}
                  >
                    {athlete?.name ?? score.athleteId}
                  </td>
                  <td className="px-3 py-3 sm:px-5" style={{ color: THEME.textPrimary }}>
                    {fmt2k(score.timeSeconds)}
                  </td>
                  <td className="hidden px-5 py-3 sm:table-cell" style={{ color: THEME.textSecondary }}>
                    {score.splitSeconds ? fmt2k(score.splitSeconds) : '—'}
                  </td>
                  <td className="hidden px-5 py-3 md:table-cell" style={{ color: THEME.textSecondary }}>
                    {score.spm ?? '—'}
                  </td>
                  <td className="hidden px-5 py-3 md:table-cell" style={{ color: THEME.textSecondary }}>
                    {score.watts ?? '—'}
                  </td>
                  <td className="px-3 py-3 sm:px-5">
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                      style={{
                        background: `${recoveryColor}15`,
                        color: recoveryColor,
                      }}
                    >
                      {recovery}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
