import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEME } from '@lib/theme'
import { useBehavioralStore, type NudgeKind } from './useBehavioralStore'

const TONE: Record<NudgeKind, { gradient: string; icon: string; accent: string }> = {
  streak_risk: {
    gradient: 'linear-gradient(90deg, rgba(245,158,11,0.18), rgba(245,158,11,0.04))',
    icon: '🔥',
    accent: '#F59E0B',
  },
  recovery_alert: {
    gradient: 'linear-gradient(90deg, rgba(239,68,68,0.16), rgba(239,68,68,0.04))',
    icon: '◐',
    accent: '#EF4444',
  },
  wellness_reminder: {
    gradient: 'linear-gradient(90deg, rgba(5,150,105,0.16), rgba(5,150,105,0.04))',
    icon: '✦',
    accent: '#059669',
  },
  sleep_nudge: {
    gradient: 'linear-gradient(90deg, rgba(139,92,246,0.16), rgba(139,92,246,0.04))',
    icon: '☾',
    accent: '#8B5CF6',
  },
  engagement: {
    gradient: 'linear-gradient(90deg, rgba(59,130,246,0.16), rgba(59,130,246,0.04))',
    icon: '↻',
    accent: '#3B82F6',
  },
}

export function NudgeBanner() {
  const nudge = useBehavioralStore((s) => s.activeNudge)
  const dismissNudge = useBehavioralStore((s) => s.dismissNudge)
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  return (
    <AnimatePresence>
      {nudge ? (
        <motion.div
          key={nudge.kind}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="overflow-hidden rounded-2xl border"
          style={{
            background: TONE[nudge.kind].gradient,
            borderColor: TONE[nudge.kind].accent + '55',
          }}
        >
          <div className="flex items-stretch gap-3 p-3 sm:items-center sm:p-3.5">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px]"
              style={{
                background: 'var(--bg-primary)',
                border: `1px solid ${TONE[nudge.kind].accent}66`,
                color: TONE[nudge.kind].accent,
              }}
            >
              {TONE[nudge.kind].icon}
            </span>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="min-w-0 flex-1 text-left"
              aria-expanded={expanded}
              aria-label={`Nudge: ${nudge.title}`}
            >
              <div
                className="text-[12px] font-semibold sm:text-[13px]"
                style={{ color: THEME.textPrimary, fontFamily: THEME.fontMono }}
              >
                {nudge.title}
              </div>
              <div
                className={`text-[11px] sm:text-[12px] ${expanded ? '' : 'truncate'} sm:whitespace-normal`}
                style={{ color: THEME.textSecondary }}
              >
                {nudge.body}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (nudge.onCta) nudge.onCta()
                else if (nudge.ctaHref) navigate(nudge.ctaHref)
                dismissNudge()
              }}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full px-3 text-[11px] font-semibold text-white"
              style={{
                background: TONE[nudge.kind].accent,
                fontFamily: THEME.fontMono,
                letterSpacing: '0.04em',
              }}
            >
              {nudge.cta}
            </button>

            <button
              type="button"
              onClick={dismissNudge}
              aria-label="Dismiss"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px] leading-none"
              style={{ color: THEME.textMuted }}
            >
              ×
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
