import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEME } from '@lib/theme'
import { useBehavioralStore } from './useBehavioralStore'

export function BehavioralDevPanel() {
  const [open, setOpen] = useState(false)
  const triggerPR = useBehavioralStore((s) => s.triggerPR)
  const showNudge = useBehavioralStore((s) => s.showNudge)
  const incrementStreak = useBehavioralStore((s) => s.incrementStreak)
  const resetStreak = useBehavioralStore((s) => s.resetStreak)
  const openDigest = useBehavioralStore((s) => s.openDigest)
  const streak = useBehavioralStore((s) => s.streak)

  if (!import.meta.env.DEV) return null

  const buttons: Array<{ label: string; onClick: () => void }> = [
    {
      label: 'Trigger PR celebration',
      onClick: () =>
        triggerPR({
          eventLabel: '2K · personal record',
          displayValue: '6:34.9',
          numericTarget: 394.9,
          format: 'time',
        }),
    },
    {
      label: 'Show wellness nudge',
      onClick: () =>
        showNudge({
          kind: 'wellness_reminder',
          title: 'Quick wellness check?',
          body: "Two minutes — log how you slept, your soreness, and your energy.",
          cta: 'Check in',
          ctaHref: '/athlete/record',
        }),
    },
    {
      label: 'Show recovery alert',
      onClick: () =>
        showNudge({
          kind: 'recovery_alert',
          title: 'Your HRV is down',
          body: 'Recovery dropped 18% in 24h. Consider an easy day.',
          cta: 'View recovery',
          ctaHref: '/athlete/progress',
        }),
    },
    {
      label: 'Show streak risk nudge',
      onClick: () =>
        showNudge({
          kind: 'streak_risk',
          title: `Don't break your ${streak}-day streak`,
          body: "Last check-in was yesterday. Two minutes keeps it alive.",
          cta: 'Check in',
          ctaHref: '/athlete/record',
        }),
    },
    {
      label: 'Show sleep nudge',
      onClick: () =>
        showNudge({
          kind: 'sleep_nudge',
          title: 'Sleep is running low',
          body: 'You averaged 6.2h this week. Splits drop ~2% per hour under 7.',
          cta: 'Set sleep goal',
          ctaHref: '/athlete/progress',
        }),
    },
    {
      label: 'Show engagement nudge',
      onClick: () =>
        showNudge({
          kind: 'engagement',
          title: 'Welcome back',
          body: 'Your team logged 8 sessions while you were gone.',
          cta: 'See what you missed',
          ctaHref: '/athlete/sessions',
        }),
    },
    { label: 'Open weekly digest', onClick: openDigest },
    { label: 'Increment streak', onClick: incrementStreak },
    { label: 'Reset streak', onClick: resetStreak },
  ]

  return (
    <div
      className="fixed bottom-4 right-4 z-[300]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="mb-2 w-[260px] overflow-hidden rounded-2xl border shadow-xl"
            style={{
              background: 'var(--bg-primary)',
              borderColor: THEME.border,
            }}
          >
            <div
              className="flex items-center justify-between border-b px-3 py-2"
              style={{ borderColor: THEME.border }}
            >
              <span
                className="text-[10px] font-semibold uppercase"
                style={{
                  fontFamily: THEME.fontMono,
                  color: THEME.textMuted,
                  letterSpacing: '0.14em',
                }}
              >
                Behavioral · DEV
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close dev panel"
                className="text-[14px] leading-none"
                style={{ color: THEME.textMuted }}
              >
                ×
              </button>
            </div>
            <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto p-2">
              {buttons.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={b.onClick}
                  className="rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  style={{ color: THEME.textPrimary, fontFamily: THEME.fontMono }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle behavioral dev panel"
        className="flex h-11 w-11 items-center justify-center rounded-full text-[16px] text-white shadow-xl"
        style={{
          background: THEME.primary,
          fontFamily: THEME.fontMono,
          boxShadow: '0 16px 36px -10px rgba(5,150,105,0.6)',
        }}
      >
        {open ? '×' : '⚡'}
      </button>
    </div>
  )
}
