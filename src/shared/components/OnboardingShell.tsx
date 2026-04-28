import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEME } from '../../lib/theme'
import { AuthIllustrationView, type AuthIllustrationId } from './AuthIllustrations'

export function OnboardingShell({
  kicker,
  title,
  subtitle,
  backTo,
  children,
  illustration = 'dataStreams',
  stepIndex = 0,
  totalSteps = 0,
}: {
  kicker: string
  title: string
  subtitle?: string
  backTo?: string
  children: ReactNode
  illustration?: AuthIllustrationId
  stepIndex?: number
  totalSteps?: number
}) {
  const navigate = useNavigate()
  const showProgress = totalSteps > 0

  return (
    <div
      className="grid min-h-dvh w-full grid-cols-1 md:grid-cols-2"
      style={{ background: `linear-gradient(180deg, var(--bg-primary) 0%, ${THEME.light} 100%)` }}
    >
      <div className="order-2 flex flex-col justify-center px-6 py-10 md:order-1 md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="flex min-h-10 items-center justify-between">
            {backTo ? (
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
                style={{ borderColor: THEME.border, color: THEME.textSecondary, fontFamily: THEME.fontMono, background: 'var(--bg-primary)' }}
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              {kicker}
            </div>
            {showProgress && (
              <div className="flex gap-1.5" aria-label="Onboarding progress">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: i < stepIndex ? THEME.primary : THEME.border,
                      opacity: i < stepIndex ? 1 : 0.32,
                    }}
                  />
                ))}
              </div>
            )}
            {!showProgress && <span className="w-16" />}
          </div>

          <div className="mt-8">
            <h1
              className="text-balance text-[30px] font-semibold leading-[1.12] sm:text-[34px]"
              style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
            >
              {title}
            </h1>
            {subtitle && (
              <div
                className="mt-3 text-[14px] leading-relaxed"
                style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
              >
                {subtitle}
              </div>
            )}
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </div>

      <div
        className="order-1 hidden min-h-[220px] items-center justify-center p-8 md:order-2 md:min-h-0 md:flex"
        style={{
          background: `linear-gradient(145deg, ${THEME.primaryLight} 0%, ${THEME.accent}33 45%, #ecfdf5 100%)`,
        }}
      >
        <div className="flex max-w-[min(100%,400px)] flex-col items-center justify-center p-4">
          <AuthIllustrationView id={illustration} className="w-full" />
        </div>
      </div>
    </div>
  )
}
