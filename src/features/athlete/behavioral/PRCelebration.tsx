import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import html2canvas from 'html2canvas'
import { THEME } from '../../../lib/theme'
import { useBehavioralStore, type PRPayload } from './useBehavioralStore'
import { AnimatedNumber } from './AnimatedNumber'
import { ShareableCard } from './ShareableCard'

function isMobile() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 640px)').matches
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds - m * 60
  return `${m}:${s.toFixed(1).padStart(4, '0')}`
}

function formatNumeric(target: PRPayload, value: number): string {
  if (target.format === 'time') return formatTime(value)
  return Math.round(value).toString()
}

type Props = {
  athleteName: string
}

export function PRCelebration({ athleteName }: Props) {
  const pr = useBehavioralStore((s) => s.activePR)
  const dismissPR = useBehavioralStore((s) => s.dismissPR)

  return (
    <AnimatePresence>
      {pr ? <PRCelebrationOverlay pr={pr} athleteName={athleteName} onClose={dismissPR} /> : null}
    </AnimatePresence>
  )
}

function PRCelebrationOverlay({
  pr,
  athleteName,
  onClose,
}: {
  pr: PRPayload
  athleteName: string
  onClose: () => void
}) {
  const [showActions, setShowActions] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const dismissTimerRef = useRef<number | null>(null)
  const initials = athleteName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const dateLabel = pr.date ?? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Confetti burst on mount.
  useEffect(() => {
    const particleCount = isMobile() ? 50 : 150
    confetti({
      particleCount,
      spread: 90,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.55 },
      colors: ['#10B981', '#059669', '#A7F3D0', '#FFFFFF', '#F59E0B'],
      scalar: 1.1,
    })
    const t = window.setTimeout(() => {
      confetti({
        particleCount: Math.round(particleCount * 0.6),
        spread: 120,
        startVelocity: 35,
        origin: { x: 0.2, y: 0.6 },
        colors: ['#10B981', '#059669', '#A7F3D0'],
      })
      confetti({
        particleCount: Math.round(particleCount * 0.6),
        spread: 120,
        startVelocity: 35,
        origin: { x: 0.8, y: 0.6 },
        colors: ['#10B981', '#059669', '#A7F3D0'],
      })
    }, 220)
    return () => window.clearTimeout(t)
  }, [])

  // Reveal share/continue after 2s.
  useEffect(() => {
    const t = window.setTimeout(() => setShowActions(true), 2000)
    return () => window.clearTimeout(t)
  }, [])

  // Auto-dismiss after 8s if no interaction.
  useEffect(() => {
    dismissTimerRef.current = window.setTimeout(() => onClose(), 8000)
    return () => {
      if (dismissTimerRef.current !== null) window.clearTimeout(dismissTimerRef.current)
    }
  }, [onClose])

  function cancelAutoDismiss() {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
  }

  async function captureCard(): Promise<Blob | null> {
    if (!cardRef.current) return null
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      logging: false,
    })
    return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
  }

  async function handleShare() {
    cancelAutoDismiss()
    const blob = await captureCard()
    if (!blob) return
    const file = new File([blob], `synth-pr-${Date.now()}.png`, { type: 'image/png' })
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
    if (
      isMobile() &&
      typeof nav.share === 'function' &&
      typeof nav.canShare === 'function' &&
      nav.canShare({ files: [file] })
    ) {
      try {
        await nav.share({ files: [file], title: 'New PR', text: `${pr.eventLabel} — ${pr.displayValue}` })
        return
      } catch {
        // user cancelled — fall through to download.
      }
    }
    triggerDownload(blob, file.name)
  }

  async function handleCopy() {
    cancelAutoDismiss()
    const blob = await captureCard()
    if (!blob) return
    try {
      // ClipboardItem may not exist on older browsers.
      const ClipboardItemCtor = (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem
      if (ClipboardItemCtor && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItemCtor({ 'image/png': blob })])
        return
      }
    } catch {
      // fall through
    }
    triggerDownload(blob, `synth-pr-${Date.now()}.png`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{
        background:
          'radial-gradient(circle at 50% 45%, rgba(5,150,105,0.55) 0%, rgba(0,0,0,0.78) 60%)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.1, 1], opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.6, times: [0, 0.65, 1], ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] overflow-hidden rounded-3xl border p-8 sm:p-10"
        style={{
          background: 'var(--bg-primary)',
          borderColor: THEME.primary,
          boxShadow: '0 60px 140px -40px rgba(5,150,105,0.7), 0 0 0 1px rgba(16,185,129,0.4)',
          width: '90vw',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${THEME.primary}, transparent 70%)`,
          }}
        />

        <div className="relative flex flex-col items-center text-center">
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[11px] font-semibold uppercase"
            style={{
              fontFamily: THEME.fontMono,
              color: THEME.primary,
              letterSpacing: '0.16em',
            }}
          >
            New personal record
          </motion.div>

          <div
            className="mt-6 leading-none"
            style={{
              fontFamily: THEME.fontSerif,
              fontWeight: 600,
              color: THEME.primary,
              fontSize: 'clamp(56px, 13vw, 96px)',
            }}
          >
            <AnimatedNumber
              value={pr.numericTarget}
              duration={1400}
              format={(n) => formatNumeric(pr, n)}
            />
          </div>

          <div
            className="mt-4 text-[14px]"
            style={{
              fontFamily: THEME.fontMono,
              color: THEME.textSecondary,
              letterSpacing: '0.1em',
            }}
          >
            {pr.eventLabel}
          </div>

          <AnimatePresence>
            {showActions ? (
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 flex w-full flex-wrap items-center justify-center gap-3"
              >
                {isMobile() ? (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 text-[13px] font-semibold text-white"
                    style={{
                      background: THEME.primary,
                      fontFamily: THEME.fontMono,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Share
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border px-5 text-[13px] font-semibold"
                      style={{
                        borderColor: THEME.border,
                        color: THEME.textPrimary,
                        background: 'var(--bg-surface)',
                        fontFamily: THEME.fontMono,
                        letterSpacing: '0.04em',
                      }}
                    >
                      Copy image
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 text-[13px] font-semibold text-white"
                      style={{
                        background: THEME.primary,
                        fontFamily: THEME.fontMono,
                        letterSpacing: '0.04em',
                      }}
                    >
                      Download
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 text-[13px] font-semibold"
                  style={{
                    color: THEME.textSecondary,
                    fontFamily: THEME.fontMono,
                    letterSpacing: '0.04em',
                  }}
                >
                  Continue
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      <ShareableCard
        ref={cardRef}
        athleteName={athleteName}
        initials={initials}
        eventLabel={pr.eventLabel}
        displayValue={pr.displayValue}
        date={dateLabel}
      />
    </motion.div>
  )
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
