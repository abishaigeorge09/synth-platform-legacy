import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { APP_THEME } from '../lib/theme'

type Props = {
  initials: string
  athleteName: string
  signal: string
  source: string
  syncedAgo: string
  severity?: 'high' | 'med' | 'low'
  onClick?: () => void
}

const SEVERITY_DOT: Record<NonNullable<Props['severity']>, string> = {
  high: '#EF4444',
  med: '#F59E0B',
  low: APP_THEME.brand,
}

export function CoachAttentionRow({
  initials,
  athleteName,
  signal,
  source,
  syncedAgo,
  severity = 'med',
  onClick,
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.99 }}
      className="flex w-full items-start gap-3 px-4 py-4 text-left"
      style={{ background: 'transparent' }}
    >
      <div
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ background: APP_THEME.brandWashSoft }}
      >
        <span
          className="text-[14px] font-bold"
          style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.brand, letterSpacing: '0.04em' }}
        >
          {initials}
        </span>
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
          style={{ background: SEVERITY_DOT[severity], borderColor: APP_THEME.canvas }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[15px] font-semibold"
          style={{ fontFamily: APP_THEME.fontSans, color: APP_THEME.text }}
        >
          {athleteName}
        </p>
        <p
          className="mt-0.5 line-clamp-2 text-[13px] leading-[1.4]"
          style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textMuted }}
        >
          {signal}
        </p>
        <p
          className="mt-1.5 text-[10px] uppercase tracking-[0.12em]"
          style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}
        >
          {source} · synced {syncedAgo}
        </p>
      </div>

      <ChevronRight size={16} color={APP_THEME.textFaint} className="mt-2 shrink-0" />
    </motion.button>
  )
}
