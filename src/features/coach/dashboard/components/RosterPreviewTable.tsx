import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'
import { SEED_ATHLETES, SEED_ERG_SCORES } from '../../../../shared/data/seeds'

function fmt2k(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

function statusFor(idx: number) {
  if (idx === 4) return { label: 'At risk', color: THEME.amber }
  if (idx === 12) return { label: 'Flagged', color: THEME.red }
  return { label: 'OK', color: THEME.primary }
}

export function RosterPreviewTable() {
  const rows = SEED_ERG_SCORES
    .map((score) => {
      const athlete = SEED_ATHLETES.find((a) => a.id === score.athleteId)
      return { score, athlete }
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
          View all {SEED_ATHLETES.length} →
        </Link>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[12px]" style={{ fontFamily: THEME.fontMono }}>
          <thead>
            <tr style={{ color: THEME.textMuted, borderTop: `1px solid ${THEME.border}` }}>
              {['#', 'Athlete', '2K', 'Split', 'SPM', 'Watts', 'Status'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.16em]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ score, athlete }, i) => {
              const status = statusFor(i)
              return (
                <tr
                  key={score.id}
                  className="transition-colors hover:bg-zinc-50"
                  style={{ borderTop: `1px solid ${THEME.border}` }}
                >
                  <td className="px-5 py-3" style={{ color: THEME.textMuted }}>
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td
                    className="px-5 py-3 font-semibold"
                    style={{ color: THEME.textPrimary, fontFamily: THEME.fontSans }}
                  >
                    {athlete?.name ?? score.athleteId}
                  </td>
                  <td className="px-5 py-3" style={{ color: THEME.textPrimary }}>
                    {fmt2k(score.timeSeconds)}
                  </td>
                  <td className="px-5 py-3" style={{ color: THEME.textSecondary }}>
                    {score.splitSeconds ? fmt2k(score.splitSeconds) : '—'}
                  </td>
                  <td className="px-5 py-3" style={{ color: THEME.textSecondary }}>
                    {score.spm ?? '—'}
                  </td>
                  <td className="px-5 py-3" style={{ color: THEME.textSecondary }}>
                    {score.watts ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                      style={{
                        background: `${status.color}15`,
                        color: status.color,
                      }}
                    >
                      {status.label}
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
