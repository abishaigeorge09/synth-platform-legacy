import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { THEME } from '@lib/theme'
import { useSessions, useAthletes } from '@shared/data/queries'
import { SkeletonLine } from '@shared/components/Skeleton'
import { SessionTimerIllustration } from '@shared/illustrations/sidebarIllustrations'

// Cache "now" once per module load to keep render pure/idempotent.
const NOW_MS = Date.now()

export function LastSessionCard() {
  const { data: sessions, isLoading: l1, isError: e1 } = useSessions()
  const { data: athletes, isLoading: l2, isError: e2 } = useAthletes()

  if (e1 || e2 || l1 || l2) {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}
      >
        <SkeletonLine width={100} height={8} />
        <SkeletonLine width={200} height={16} className="mt-2" />
        <SkeletonLine width="80%" height={12} className="mt-3" />
      </div>
    )
  }

  if (!sessions || sessions.length === 0) return null

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const latest = sorted[0]

  const typeLabel: Record<string, string> = {
    erg_test: 'Erg test',
    water: 'On-water',
    lift: 'Lift',
    meeting: 'Meeting',
  }

  const daysDiff = Math.round((NOW_MS - new Date(latest.date).getTime()) / (1000 * 60 * 60 * 24))
  const dateLabel =
    daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Yesterday' : `${daysDiff}d ago`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="rounded-2xl border p-5"
      style={{
        background: 'var(--bg-primary)',
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
      }}
    >
      <header className="flex items-center justify-between">
        <div>
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Last session · {dateLabel}
          </div>
          <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
            {latest.title}
          </div>
        </div>
        <Link
          to="/coach/tools/session-timer"
          className="text-[11px] font-semibold uppercase tracking-wider transition-colors hover:underline"
          style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
        >
          Session timer →
        </Link>
      </header>

      <div className="mt-4 flex items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${THEME.primary}10` }}
        >
          <SessionTimerIllustration size={22} />
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <MetricChip label="Type" value={typeLabel[latest.type] ?? latest.type} />
          <MetricChip label="Date" value={latest.date} />
          <MetricChip label="Roster" value={`${athletes.length} athletes`} />
        </div>
      </div>

      {latest.notes && (
        <div
          className="mt-3 rounded-lg border px-3 py-2 text-[12px]"
          style={{
            borderColor: THEME.border,
            background: THEME.light,
            color: THEME.textSecondary,
            fontFamily: THEME.fontSans,
          }}
        >
          {latest.notes}
        </div>
      )}
    </motion.div>
  )
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="text-[8px] font-semibold uppercase tracking-[0.16em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </div>
      <div
        className="text-[13px] font-semibold"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        {value}
      </div>
    </div>
  )
}
