import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'
import { useUiStore } from '../../../../shared/store/useUiStore'

export function PageHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker: string
  title: string
  subtitle: string
}) {
  const openAgent = useUiStore((s) => s.openAgentModal)
  return (
    <div className="flex flex-col items-start gap-4 px-5 pb-5 pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-10 sm:pt-10 sm:pb-6">
      <div className="min-w-0">
        <div
          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {kicker}
        </div>
        <h1
          className="text-[26px] font-semibold leading-[1.1] sm:text-[32px]"
          style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
        >
          {title}
        </h1>
        <div
          className="mt-2 flex flex-wrap items-center gap-2 text-[12px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          <span>{subtitle}</span>
          <motion.span
            animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: THEME.accent }}
          />
          <span style={{ color: THEME.primary }}>live</span>
        </div>
      </div>
      <button
        type="button"
        onClick={openAgent}
        className="shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
        style={{
          background: THEME.white,
          color: THEME.primary,
          border: `1px solid ${THEME.border}`,
          fontFamily: THEME.fontMono,
        }}
      >
        Open synth. Agent →
      </button>
    </div>
  )
}
