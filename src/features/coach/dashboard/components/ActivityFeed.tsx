import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'
import { useActivity } from '../../../../shared/data/queries'
import type { ActivityItem } from '../../../../shared/data/types'
import { SkeletonLine, SkeletonCircle } from '../../../../shared/components/Skeleton'

const KIND_COLOR: Record<ActivityItem['kind'], string> = {
  scan: THEME.primary,
  session: THEME.cyan,
  lineup_published: THEME.accent,
  source_added: THEME.purple,
  athlete_joined: THEME.amber,
}

const KIND_LABEL: Record<ActivityItem['kind'], string> = {
  scan: 'Scan',
  session: 'Session',
  lineup_published: 'Lineup',
  source_added: 'Source',
  athlete_joined: 'Roster',
}

function relativeTime(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 60) return `${mins}m ago`
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`
  return `${Math.round(mins / 60 / 24)}d ago`
}

export function ActivityFeed() {
  const { data: activity, isLoading, isError } = useActivity()

  if (isError || isLoading) {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}
      >
        <SkeletonLine width={60} height={8} />
        <SkeletonLine width={180} height={16} className="mt-2" />
        <div className="mt-4 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 pl-5">
              <SkeletonCircle size={12} />
              <div className="flex-1 flex flex-col gap-1">
                <SkeletonLine width="30%" height={8} />
                <SkeletonLine width="60%" height={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

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
      <header>
        <div
          className="text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Activity
        </div>
        <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
          Latest across every source
        </div>
      </header>
      <ol className="mt-4 flex flex-col gap-0">
        {activity.map((item, idx) => {
          const color = KIND_COLOR[item.kind]
          return (
            <li key={item.id} className="relative flex gap-3 pb-4 pl-5">
              {/* timeline rail */}
              {idx < activity.length - 1 && (
                <span
                  className="absolute left-[7px] top-3 w-px"
                  style={{ bottom: 0, background: THEME.border }}
                />
              )}
              <span
                className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2"
                style={{ background: 'var(--bg-primary)', borderColor: color }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="text-[9px] font-semibold uppercase tracking-[0.16em]"
                    style={{ fontFamily: THEME.fontMono, color }}
                  >
                    {KIND_LABEL[item.kind]}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                  >
                    {relativeTime(item.at)}
                  </span>
                </div>
                <div className="mt-0.5 text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                  {item.title}
                </div>
                {item.detail && (
                  <div className="text-[11px]" style={{ color: THEME.textSecondary }}>
                    {item.detail}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </motion.div>
  )
}
