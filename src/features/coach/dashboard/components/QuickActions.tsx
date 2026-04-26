import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'

const ACTIONS = [
  { label: 'Build lineup', path: '/coach/tools/lineups' },
  { label: 'Start timer', path: '/coach/tools/session-timer' },
  { label: 'Record note', path: '/coach/ai' },
  { label: 'View sources', path: '/coach/sources/connectors' },
] as const

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 sm:px-10">
      <span
        className="mr-1 text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Quick
      </span>
      {ACTIONS.map((action, i) => (
        <motion.button
          key={action.label}
          type="button"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 * i }}
          onClick={() => navigate(action.path)}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:border-emerald-300 hover:bg-emerald-50"
          style={{
            fontFamily: THEME.fontMono,
            borderColor: THEME.border,
            color: THEME.textPrimary,
            background: THEME.white,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: THEME.accent }} aria-hidden />
          {action.label} →
        </motion.button>
      ))}
    </div>
  )
}
