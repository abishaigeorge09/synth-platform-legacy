import { motion } from 'framer-motion'
import { THEME } from '../../lib/theme'
import { TRANSITIONS } from '../../lib/motion'
import type { SynthAthleteCard } from './model'
import { formatSecAs2k } from './formatters'

export function SynthQuickCompare({ athletes, onClose }: { athletes: SynthAthleteCard[]; onClose: () => void }) {
  if (athletes.length < 2) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={TRANSITIONS.smooth}
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 px-4 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:left-[200px] md:left-[220px]"
      style={{ borderColor: THEME.border }}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {athletes.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: THEME.border, fontFamily: THEME.fontMono }}
            >
              <span className="text-[10px] font-bold text-zinc-400">#{a.rank}</span>{' '}
              <span className="text-[12px] font-semibold text-zinc-900">{a.name}</span>
              <div className="text-[11px] tabular-nums" style={{ color: THEME.primary }}>
                {formatSecAs2k(a.avgSplitSec)}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-[12px] font-bold text-white"
          style={{ fontFamily: THEME.fontMono, background: THEME.primary }}
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </motion.div>
  )
}
