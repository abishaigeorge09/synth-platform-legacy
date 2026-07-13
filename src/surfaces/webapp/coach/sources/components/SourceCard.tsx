import { motion } from 'framer-motion'
import { THEME } from '@lib/theme'
import type { ScanLog, Source } from '@shared/data/types'

const COLOR_KEY: Record<string, string> = {
  primary: THEME.primary,
  cyan: THEME.cyan,
  purple: THEME.purple,
  amber: THEME.amber,
  blue: THEME.blue,
}

const TYPE_LABEL: Record<Source['type'], string> = {
  google_sheets: 'Google Sheets',
  google_drive: 'Google Drive',
  slack: 'Slack',
  teamworks: 'TeamWorks',
  wearable: 'Wearable hub',
  email_digest: 'Email digest',
  extension: 'Browser extension',
  manual_upload: 'Manual upload',
}

const STATUS_STYLE: Record<Source['status'], { fg: string; bg: string; label: string }> = {
  healthy: { fg: THEME.primary, bg: 'rgba(16,185,129,0.14)', label: 'healthy' },
  stale: { fg: THEME.amber, bg: 'rgba(245,158,11,0.14)', label: 'stale' },
  failed: { fg: THEME.red, bg: 'rgba(239,68,68,0.14)', label: 'failed' },
  pending: { fg: THEME.textSecondary, bg: 'rgba(161,161,170,0.14)', label: 'pending' },
  disconnected: { fg: THEME.textMuted, bg: 'rgba(161,161,170,0.14)', label: 'offline' },
}

function relativeFromNow(iso: string) {
  const now = new Date('2026-04-14T22:10:00Z').getTime()
  const then = new Date(iso).getTime()
  const diffS = Math.round((now - then) / 1000)
  if (diffS < 60) return `${diffS}s ago`
  if (diffS < 3600) return `${Math.round(diffS / 60)}m ago`
  if (diffS < 86400) return `${Math.round(diffS / 3600)}h ago`
  return `${Math.round(diffS / 86400)}d ago`
}

export function SourceCard({
  source,
  latestScan,
  scanCount,
  selected,
  onSelect,
  onDetail,
}: {
  source: Source
  latestScan: ScanLog | null
  scanCount: number
  selected: boolean
  onSelect: () => void
  onDetail?: () => void
}) {
  const accent = source.colorKey ? COLOR_KEY[source.colorKey] ?? THEME.primary : THEME.primary
  const statusStyle = STATUS_STYLE[source.status]

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="relative overflow-hidden rounded-xl border p-4 text-left"
      style={{
        background: 'var(--bg-primary)',
        borderColor: selected ? accent : THEME.border,
        boxShadow: selected
          ? `0 1px 0 rgba(24,24,27,0.02), 0 18px 36px -24px ${accent}55`
          : '0 1px 0 rgba(24,24,27,0.02), 0 12px 28px -24px rgba(24,24,27,0.18)',
      }}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: accent }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            {TYPE_LABEL[source.type]}
          </div>
          <div
            className="mt-1 truncate text-[15px] font-semibold leading-tight"
            style={{ color: THEME.textPrimary }}
          >
            {source.name}
          </div>
          {source.url && (
            <div
              className="mt-1 truncate text-[11px]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
            >
              {source.url.replace(/^https?:\/\//, '')}
            </div>
          )}
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider"
          style={{
            background: statusStyle.bg,
            color: statusStyle.fg,
            fontFamily: THEME.fontMono,
          }}
        >
          {statusStyle.label}
        </span>
      </div>

      <div
        className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 pl-2"
        style={{ borderColor: THEME.border }}
      >
        <Metric
          label="Cadence"
          value={source.scheduleCron ? cronToLabel(source.scheduleCron) : 'real-time'}
        />
        <Metric
          label="Last scan"
          value={latestScan ? relativeFromNow(latestScan.scannedAt) : '—'}
        />
        <div className="flex flex-col items-end">
          <Metric label="Scans logged" value={String(scanCount)} align="right" />
          {onDetail ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDetail()
              }}
              className="mt-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
            >
              Details
            </button>
          ) : null}
        </div>
      </div>
    </motion.button>
  )
}

function Metric({ label, value, align = 'left' }: { label: string; value: string; align?: 'left' | 'right' }) {
  return (
    <div className="flex flex-col" style={{ textAlign: align }}>
      <div
        className="text-[8px] font-semibold uppercase tracking-[0.16em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </div>
      <div
        className="mt-0.5 text-[12px] font-semibold"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        {value}
      </div>
    </div>
  )
}

function cronToLabel(cron: string) {
  // Quick-and-friendly labels for the handful of cadences we actually seed.
  if (cron === '0 18 * * *') return 'daily · 18:00'
  if (cron === '0 9 * * *') return 'daily · 09:00'
  if (cron === '*/15 * * * *') return 'every 15m'
  if (cron === '*/5 * * * *') return 'every 5m'
  return cron
}
