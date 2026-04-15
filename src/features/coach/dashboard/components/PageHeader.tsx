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
    <div className="flex items-start justify-between gap-6 px-10 pb-6 pt-10">
      <div>
        <div
          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {kicker}
        </div>
        <h1
          className="text-[32px] font-semibold leading-[1.1]"
          style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
        >
          {title}
        </h1>
        <div
          className="mt-2 flex items-center gap-2 text-[12px]"
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
        className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
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
