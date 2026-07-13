import { useRegisterSW } from 'virtual:pwa-register/react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'
import { SYNTH } from '../lib/theme'

/**
 * Bottom-anchored toast that appears when vite-plugin-pwa's service worker
 * detects a new build and is ready to swap in. With registerType=autoUpdate
 * the SW downloads silently — this toast just tells the user the new
 * version is ready and offers a one-tap reload.
 */
export function SwUpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(err: unknown) {
      // SW registration can fail in dev or on browsers without SW support —
      // we ignore silently. Console-only so devs see it.
      console.warn('[synth] service worker register error', err)
    },
  })

  const reload = () => {
    void updateServiceWorker(true)
  }

  return (
    <AnimatePresence>
      {needRefresh ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="pointer-events-none fixed inset-x-0 z-[55] flex justify-center px-3"
          style={{ bottom: 'calc(max(env(safe-area-inset-bottom), 16px) + 92px)' }}
          role="status"
          aria-live="polite"
        >
          <div
            className="pointer-events-auto flex w-full max-w-[380px] items-center gap-2 rounded-full px-2 py-2"
            style={{
              background: 'rgba(15, 18, 42, 0.85)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 14px 30px rgba(8,8,40,0.45)',
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: SYNTH.accentEmerald, color: SYNTH.inkOnBrand }}
            >
              <RefreshCw size={14} strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1 pr-1">
              <p
                className="truncate text-[12px] font-semibold leading-tight"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                synth was updated
              </p>
              <p
                className="truncate text-[10px] leading-tight"
                style={{ color: 'rgba(255,255,255,0.62)', fontFamily: SYNTH.font }}
              >
                Reload to see what's new
              </p>
            </div>
            <button
              type="button"
              onClick={reload}
              className="rounded-full px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.04em]"
              style={{
                background: SYNTH.accentEmerald,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                letterSpacing: '0.04em',
              }}
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              aria-label="Dismiss update"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{
                background: 'rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.72)',
              }}
            >
              <X size={12} strokeWidth={2.6} />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
