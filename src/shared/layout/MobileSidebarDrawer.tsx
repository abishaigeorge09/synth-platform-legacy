import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { THEME } from '../../lib/theme'
import { useUiStore } from '../store/useUiStore'
import { SidebarContent } from './Sidebar'

/**
 * Mobile-only slide-in drawer that hosts the same SidebarContent the
 * desktop sidebar renders. Opens from the left, closes on:
 *  - backdrop click
 *  - X button
 *  - ESC keypress
 *  - route change (auto-close when the user navigates)
 */
export function MobileSidebarDrawer() {
  const open = useUiStore((s) => s.mobileDrawerOpen)
  const close = useUiStore((s) => s.closeMobileDrawer)
  const location = useLocation()

  // Auto-close on route change
  useEffect(() => {
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Close on ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  // Prevent body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            style={{ background: 'rgba(12,10,9,0.55)', backdropFilter: 'blur(6px)' }}
          />

          {/* Drawer panel */}
          <motion.aside
            role="dialog"
            aria-label="Navigation"
            initial={{ x: -340, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -340, opacity: 0.4 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative h-full w-[86vw] max-w-[320px] overflow-y-auto border-r shadow-2xl"
            style={{ background: THEME.white, borderColor: THEME.border }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-zinc-50"
              style={{ borderColor: THEME.border, color: THEME.textSecondary }}
            >
              ✕
            </button>
            <SidebarContent variant="drawer" />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
