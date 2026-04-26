import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'
import { useSources } from '../../../../shared/data/queries'
import type { Source } from '../../../../shared/data/types'
import { SkeletonLine } from '../../../../shared/components/Skeleton'

const COLOR_MAP: Record<NonNullable<Source['colorKey']>, string> = {
  primary: THEME.primary,
  cyan: THEME.cyan,
  purple: THEME.purple,
  amber: THEME.amber,
  blue: THEME.blue,
}

function statusLabel(source: Source) {
  if (!source.lastScanAt) return source.scheduleCron ?? source.status
  const then = new Date(source.lastScanAt).getTime()
  const now = Date.now()
  const mins = Math.max(0, Math.round((now - then) / 60000))
  if (source.scheduleCron === null) return 'live'
  if (mins < 60) return `${mins}m ago`
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`
  return `${Math.round(mins / 60 / 24)}d ago`
}

export function ConnectorChipRow() {
  const { data: sources, isLoading, isError } = useSources()

  if (isError || isLoading) {
    return (
      <div className="flex flex-wrap items-center gap-2 px-5 sm:px-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLine key={i} width={110} height={30} className="!rounded-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 sm:px-10">
      {sources.map((source, i) => {
        const accent = COLOR_MAP[source.colorKey ?? 'primary']
        return (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            className="flex items-center gap-2 rounded-full border px-3 py-1.5"
            style={{ borderColor: THEME.border, background: THEME.white }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
            <span className="text-[12px] font-semibold" style={{ color: THEME.textPrimary }}>
              {source.name}
            </span>
            <span
              className="text-[10px]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              {statusLabel(source)}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
