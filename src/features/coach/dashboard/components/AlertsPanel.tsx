import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'
import { useAlerts, useAthletes } from '../../../../shared/data/queries'
import type { Alert } from '../../../../shared/data/types'
import { SkeletonLine } from '../../../../shared/components/Skeleton'

function severityColor(sev: Alert['severity']) {
  if (sev === 'danger') return THEME.red
  if (sev === 'warning') return THEME.amber
  return THEME.blue
}

function relativeTime(iso: string) {
  const then = new Date(iso).getTime()
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000))
  if (mins < 60) return `${mins}m ago`
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`
  return `${Math.round(mins / 60 / 24)}d ago`
}

export function AlertsPanel() {
  const { data: alerts, isLoading: l1, isError: e1 } = useAlerts()
  const { data: athletes, isLoading: l2, isError: e2 } = useAthletes()

  if (e1 || e2 || l1 || l2) {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}
      >
        <SkeletonLine width={80} height={8} />
        <SkeletonLine width={160} height={16} className="mt-2" />
        <div className="mt-4 flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border px-3 py-3" style={{ borderColor: THEME.border, background: THEME.light }}>
              <SkeletonLine width="40%" height={8} />
              <SkeletonLine width="70%" height={12} className="mt-1.5" />
              <SkeletonLine width="50%" height={10} className="mt-1" />
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
      transition={{ duration: 0.4 }}
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
            Alerts · {alerts.length}
          </div>
          <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
            Flags worth a look
          </div>
        </div>
      </header>
      <ul className="mt-4 flex flex-col gap-2">
        {alerts.map((alert) => {
          const color = severityColor(alert.severity)
          const athlete = alert.athleteId ? athletes.find((a) => a.id === alert.athleteId) : null
          return (
            <li
              key={alert.id}
              className="flex items-start gap-3 rounded-lg border px-3 py-3"
              style={{
                borderColor: THEME.border,
                background: THEME.light,
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div className="flex-1">
                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                  style={{ fontFamily: THEME.fontMono, color }}
                >
                  {alert.kind} · {alert.severity}
                </div>
                <div className="mt-0.5 text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                  {alert.title}
                </div>
                <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary }}>
                  {athlete ? `${athlete.name} · ` : ''}
                  {alert.detail}
                </div>
              </div>
              <div
                className="text-[10px]"
                style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
              >
                {relativeTime(alert.createdAt)}
              </div>
            </li>
          )
        })}
      </ul>
    </motion.div>
  )
}
