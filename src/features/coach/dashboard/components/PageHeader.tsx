import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'

function todayStr(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Page title block: one eyebrow, one headline, optional short line + live dot.
 * Keep subtitles human (sans); avoid long bullet chains — put detail in the page body.
 */
export function PageHeader({
  kicker,
  title,
  subtitle,
  showLive = true,
  showDate = false,
  actions,
}: {
  kicker: string
  title: string
  subtitle?: string
  showLive?: boolean
  /** When true, appends the current date to the kicker row (off by default to reduce noise). */
  showDate?: boolean
  /** Optional action buttons rendered in the top-right corner. */
  actions?: ReactNode
}) {
  const eyebrow = showDate ? `${kicker} · ${todayStr()}` : kicker

  return (
    <header className="flex flex-col items-start gap-3 px-5 pb-5 pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-10 sm:pb-6 sm:pt-10">
      <div className="min-w-0 flex-1">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {eyebrow}
        </p>
        <h1
          className="mt-1.5 text-[26px] font-semibold leading-[1.12] sm:text-[32px]"
          style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
        >
          {title}
        </h1>
        {(subtitle?.trim() || showLive) && (
          <div
            className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-snug"
            style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}
          >
            {subtitle?.trim() ? <span>{subtitle.trim()}</span> : null}
            {showLive && (
              <>
                {subtitle?.trim() ? <span style={{ color: THEME.border }} aria-hidden>·</span> : null}
                <motion.span
                  animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: THEME.accent }}
                />
                <span style={{ color: THEME.primary, fontWeight: 600 }}>Live</span>
              </>
            )}
          </div>
        )}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}
