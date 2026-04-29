import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { SYNTH } from '../lib/theme'

type Props = {
  step?: number
  totalSteps?: number
  onBack?: () => void
  title: string
  helper?: string
  ctaLabel: string
  ctaDisabled?: boolean
  onCta: () => void
  secondary?: { label: string; onClick: () => void }
  children: ReactNode
}

/**
 * The shared chrome for every onboarding step.
 *
 *   ┌─────────────────────────┐
 *   │ [back]   ━━━━━━━━━━     │  glass back, glass progress
 *   │                         │
 *   │   Title (centered)      │  vertically centered when content
 *   │   helper text           │  fits, scrolls when it doesn't
 *   │                         │
 *   │   [interactive area]    │  PillRows / chips / inputs / switches
 *   │                         │
 *   │   ━━━━ Continue ━━━━    │  shrink-0 so it stays pinned to the
 *   └─────────────────────────┘  bottom of the phone-frame, never below
 *
 * Cobalt canvas, white type. Tags the body so .app-shell-frame paints
 * cobalt too — overscroll never exposes the white frame underneath.
 */
export function SingleQuestionScreen({
  step,
  totalSteps,
  onBack,
  title,
  helper,
  ctaLabel,
  ctaDisabled,
  onCta,
  secondary,
  children,
}: Props) {
  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => {
      document.body.removeAttribute('data-app-canvas')
    }
  }, [])

  const showProgress = typeof step === 'number' && typeof totalSteps === 'number' && totalSteps > 0
  const pct = showProgress ? Math.max(4, Math.min(100, (step / totalSteps) * 100)) : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 flex-1 flex-col"
      style={{
        background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
      }}
    >
      {/* Header — back + progress */}
      <div className="flex shrink-0 items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),20px)] pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          disabled={!onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-30"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
        </button>
        {showProgress ? (
          <div
            className="flex-1 overflow-hidden rounded-full"
            style={{ height: 4, background: 'rgba(255,255,255,0.18)' }}
          >
            <motion.div
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: '100%', background: SYNTH.inkOnBrand }}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Centered scroll area */}
      <div className="synth-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center px-6 py-6">
          <div className="mx-auto w-full max-w-[420px]">
            <h1
              className="text-center text-[30px] font-bold leading-[1.1] tracking-[-0.01em]"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {title}
            </h1>
            {helper ? (
              <p
                className="mx-auto mt-3 max-w-[340px] text-center text-[14px] leading-[1.5]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {helper}
              </p>
            ) : null}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>

      {/* Pinned CTA — shrink-0 so it never falls below the frame */}
      <div
        className="shrink-0 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3"
        style={{
          background: 'rgba(31, 38, 201, 0.82)',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <button
          type="button"
          onClick={onCta}
          disabled={ctaDisabled}
          className="block w-full rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99] disabled:opacity-40"
          style={{
            background: SYNTH.inkOnBrand,
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
            letterSpacing: '0.01em',
          }}
        >
          {ctaLabel}
        </button>
        {secondary ? (
          <button
            type="button"
            onClick={secondary.onClick}
            className="mt-3 block w-full text-center text-[12px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
          >
            {secondary.label}
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}
