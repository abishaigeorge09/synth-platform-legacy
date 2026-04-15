import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { THEME } from '../../../lib/theme'

type Item = {
  to: string
  label: string
  Glyph: ComponentType<{ size?: number; muted?: boolean }>
}

/**
 * Bottom-sheet modal for the athlete "More" tab. Slides up from below,
 * reuses the backdrop + motion recipe from AgentModalPortal.
 */
export function AthleteMoreSheet({
  open,
  onClose,
  items,
}: {
  open: boolean
  onClose: () => void
  items: Item[]
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <motion.button
            type="button"
            aria-label="Close more menu"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            style={{ background: 'rgba(12,10,9,0.55)', backdropFilter: 'blur(6px)' }}
          />
          <motion.div
            role="dialog"
            aria-label="More"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t p-4 pb-8"
            style={{
              background: THEME.white,
              borderColor: THEME.border,
              paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
              boxShadow: '0 -30px 60px -30px rgba(24,24,27,0.4)',
            }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: THEME.border }} />
            <div
              className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              More
            </div>
            <div className="flex flex-col gap-1">
              {items.map((it) => (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-zinc-100"
                >
                  <it.Glyph size={22} muted />
                  <span className="text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>
                    {it.label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
