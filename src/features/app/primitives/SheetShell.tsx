import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { SYNTH } from '../lib/theme'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Shared bottom-sheet shell — drag-handle, dimmed backdrop, rounded top,
 * cream/white sheet body. Used across capture / settings / sources /
 * lineups for any modal that's contextual to a page.
 */
export function SheetShell({ open, onClose, title, children }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(8,8,40,0.55)', backdropFilter: 'blur(6px)' }}
          />
          <motion.div
            initial={{ y: 600 }}
            animate={{ y: 0 }}
            exit={{ y: 600 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
            style={{
              background: SYNTH.sheet,
              borderRadius: `${SYNTH.radius.sheet}px ${SYNTH.radius.sheet}px 0 0`,
              maxHeight: '88dvh',
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
            }}
          >
            <header className="relative flex items-center justify-between px-5 pt-5 pb-2">
              <div
                className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full"
                style={{ background: SYNTH.sheetMuted }}
              />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
              >
                {title}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </header>
            <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-2">
              {children}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
