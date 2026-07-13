import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { SYNTH } from '../lib/theme'

type Props = {
  visible: boolean
  onInstall: () => void
  onDismiss: () => void
}

/**
 * Top-pinned glass capsule that nudges phone visitors to install the PWA.
 * Lives above the floating tab bar / page content via fixed positioning,
 * dismissible. The "Download" button is the primary CTA — it either fires
 * the native install prompt directly (Android Chromium) or opens the
 * `InstallSheet` with iOS instructions.
 */
export function InstallNudgeBanner({ visible, onInstall, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="pointer-events-none fixed inset-x-0 z-[55] flex justify-center px-3"
          style={{ top: 'max(env(safe-area-inset-top), 12px)' }}
          role="region"
          aria-label="Install synth"
        >
          <div
            className="pointer-events-auto flex w-full max-w-[380px] items-center gap-2 rounded-full px-2 py-2"
            style={{
              background: 'rgba(15, 18, 42, 0.78)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 14px 30px rgba(8,8,40,0.35)',
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: SYNTH.accentEmerald, color: SYNTH.inkOnBrand }}
            >
              <Download size={14} strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1 pr-1">
              <p
                className="truncate text-[12px] font-semibold leading-tight"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                Install synth on your phone
              </p>
              <p
                className="truncate text-[10px] leading-tight"
                style={{ color: 'rgba(255,255,255,0.62)', fontFamily: SYNTH.font }}
              >
                Faster · fullscreen · works offline
              </p>
            </div>
            <button
              type="button"
              onClick={onInstall}
              className="rounded-full px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.04em]"
              style={{
                background: SYNTH.accentEmerald,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                letterSpacing: '0.04em',
              }}
            >
              Download
            </button>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
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
