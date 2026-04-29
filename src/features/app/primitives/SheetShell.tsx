import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { SYNTH } from '../lib/theme'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /**
   * When true, the sheet always fills ~78dvh from the bottom
   * (use for content-heavy sheets like the athlete picker).
   * Default false — sheet sizes to its content with an 88dvh ceiling.
   */
  tall?: boolean
}

/**
 * Shared bottom-sheet shell — drag-handle, dimmed backdrop, rounded top,
 * cream/white sheet body. Used across capture / settings / sources /
 * lineups for any modal that's contextual to a page.
 *
 * Rendered through a portal to document.body so the fixed-position sheet
 * always anchors to the viewport — not to the nearest ancestor with a
 * `transform`, `filter`, or `backdrop-filter`. (e.g. BoatLineupCard's glass
 * card: without the portal, the sheet would slide out of the card itself
 * instead of from the bottom of the screen.)
 */
export function SheetShell({ open, onClose, title, children, tall = false }: Props) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          {/* Backdrop sits above the floating tab bar (z-40). Tap to close. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(8,8,40,0.55)', backdropFilter: 'blur(6px)' }}
          />
          {/* Sheet — sizes to its content by default, or fills 78dvh when
              the consumer asks (tall=true). Always covers the floating
              tab bar via z-[70]. */}
          <motion.div
            initial={{ y: 800 }}
            animate={{ y: 0 }}
            exit={{ y: 800 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-[70] flex flex-col overflow-hidden"
            style={{
              background: SYNTH.sheet,
              borderRadius: `${SYNTH.radius.sheet}px ${SYNTH.radius.sheet}px 0 0`,
              ...(tall ? { height: '78dvh' } : { maxHeight: '88dvh' }),
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
              boxShadow: SYNTH.shadow.sheet,
            }}
          >
            {/* Pinned header — shrink-0 so the flex layout never collapses
                it (was the bug: maxHeight + tall content squashed the
                title + drag handle + close offscreen). */}
            <header className="relative flex shrink-0 items-center justify-between px-5 pt-5 pb-3">
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
            {/* Scrollable body — flex-1 min-h-0 makes overflow-y-auto
                actually constrain + scroll inside the sheet. */}
            <div
              className="synth-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-2"
            >
              {children}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
