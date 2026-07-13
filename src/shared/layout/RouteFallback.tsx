import { motion } from 'framer-motion'
import { THEME } from '@lib/theme'

/**
 * Phase 12 — lightweight fallback shown while a lazy-loaded route chunk is
 * fetching. Matches the synth. palette (light canvas, emerald accent, mono
 * label) so it doesn't feel like a generic spinner.
 */
export function RouteFallback() {
  return (
    <div
      className="flex min-h-[60vh] w-full items-center justify-center"
      style={{ backgroundColor: THEME.light }}
    >
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-3"
      >
        <motion.div
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: THEME.accent }}
        />
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{
            fontFamily: THEME.fontMono,
            color: THEME.textMuted,
          }}
        >
          loading
        </span>
      </motion.div>
    </div>
  )
}
