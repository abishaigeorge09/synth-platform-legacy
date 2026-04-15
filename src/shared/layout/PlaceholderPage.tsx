import { motion } from 'framer-motion'
import { THEME } from '../../lib/theme'

export function PlaceholderPage({
  kicker,
  title,
  description,
  phase,
}: {
  kicker: string
  title: string
  description: string
  phase: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex min-h-full w-full items-start justify-start p-10"
    >
      <div className="max-w-[720px]">
        <div
          className="mb-3 text-[10px] uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {kicker}
        </div>
        <h1
          className="mb-4 text-[34px] font-semibold leading-[1.1]"
          style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
        >
          {title}
        </h1>
        <p className="mb-6 text-[15px] leading-relaxed" style={{ color: THEME.textSecondary }}>
          {description}
        </p>
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em]"
          style={{
            borderColor: THEME.border,
            background: THEME.white,
            color: THEME.primary,
            fontFamily: THEME.fontMono,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: THEME.accent }}
          />
          {phase}
        </div>
      </div>
    </motion.div>
  )
}
