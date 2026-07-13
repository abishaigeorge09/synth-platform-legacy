import { motion } from 'framer-motion'
import { THEME } from '@lib/theme'
import type { ScanLog } from '@shared/data/types'

const STATUS_DOT: Record<ScanLog['status'], string> = {
  success: THEME.primary,
  partial: THEME.amber,
  failed: THEME.red,
}

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function ScanLogRow({
  log,
  selected,
  onSelect,
}: {
  log: ScanLog
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left"
      style={{
        background: selected ? THEME.light : THEME.white,
        borderColor: selected ? THEME.primary : THEME.border,
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: STATUS_DOT[log.status] }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div
            className="text-[11px] font-semibold"
            style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
          >
            {formatTimestamp(log.scannedAt)}
          </div>
          <div
            className="text-[10px]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            · {(log.durationMs / 1000).toFixed(2)}s
          </div>
        </div>
        <div
          className="mt-0.5 text-[11px]"
          style={{ color: THEME.textSecondary }}
        >
          <span style={{ color: THEME.primary }}>+{log.itemsAdded}</span>
          {log.itemsUpdated > 0 && (
            <>
              {' · '}
              <span style={{ color: THEME.cyan }}>~{log.itemsUpdated}</span>
            </>
          )}
          {log.itemsRemoved > 0 && (
            <>
              {' · '}
              <span style={{ color: THEME.red }}>-{log.itemsRemoved}</span>
            </>
          )}
          {log.itemsAdded === 0 && log.itemsUpdated === 0 && log.itemsRemoved === 0 && (
            <span style={{ color: THEME.textMuted }}>no-op</span>
          )}
        </div>
      </div>
      <span
        className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
        style={{
          background: log.status === 'success' ? 'rgba(16,185,129,0.12)' : log.status === 'partial' ? 'rgba(245,158,11,0.14)' : 'rgba(239,68,68,0.14)',
          color: STATUS_DOT[log.status],
          fontFamily: THEME.fontMono,
        }}
      >
        {log.status}
      </span>
    </motion.button>
  )
}
