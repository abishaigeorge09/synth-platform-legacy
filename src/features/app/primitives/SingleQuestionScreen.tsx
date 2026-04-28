import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { APP_THEME } from '../lib/theme'

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
  const showProgress = typeof step === 'number' && typeof totalSteps === 'number' && totalSteps > 0
  const pct = showProgress ? Math.max(4, Math.min(100, (step / totalSteps) * 100)) : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col"
      style={{ background: APP_THEME.canvas }}
    >
      <div className="flex items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          disabled={!onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-40"
          style={{ borderColor: APP_THEME.divider, background: APP_THEME.surface }}
        >
          <ChevronLeft size={18} color={APP_THEME.text} />
        </button>
        {showProgress ? (
          <div
            className="flex-1 overflow-hidden rounded-full"
            style={{ height: 4, background: APP_THEME.divider }}
          >
            <motion.div
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: '100%', background: APP_THEME.brand }}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      <div className="synth-scroll flex flex-1 flex-col justify-center overflow-y-auto px-6 pb-4 pt-4">
        <div className="mx-auto w-full max-w-[420px]">
          <h1
            className="text-center text-[28px] font-semibold leading-[1.15]"
            style={{ fontFamily: APP_THEME.fontSerif, color: APP_THEME.text }}
          >
            {title}
          </h1>
          {helper ? (
            <p
              className="mx-auto mt-2 max-w-[340px] text-center text-[14px] leading-[1.5]"
              style={{ fontFamily: APP_THEME.fontSans, color: APP_THEME.textMuted }}
            >
              {helper}
            </p>
          ) : null}
          <div className="mt-7">{children}</div>
        </div>
      </div>

      <div
        className="px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-4"
        style={{ background: APP_THEME.canvas }}
      >
        <button
          type="button"
          onClick={onCta}
          disabled={ctaDisabled}
          className="block w-full rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99]"
          style={{
            background: ctaDisabled ? APP_THEME.dividerStrong : APP_THEME.brand,
            color: '#FFFFFF',
            fontFamily: APP_THEME.fontMono,
            letterSpacing: '0.03em',
            opacity: ctaDisabled ? 0.6 : 1,
          }}
        >
          {ctaLabel}
        </button>
        {secondary ? (
          <button
            type="button"
            onClick={secondary.onClick}
            className="mt-3 block w-full text-center text-[13px] font-semibold"
            style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textMuted }}
          >
            {secondary.label}
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}
