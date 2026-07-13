import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { THEME } from '@lib/theme'
import { useBehavioralStore } from './useBehavioralStore'

type Props = { onClose: () => void }

export function StreakDetailModal({ onClose }: Props) {
  const streak = useBehavioralStore((s) => s.streak)
  const longest = useBehavioralStore((s) => s.longestStreak)
  const checkInDays = useBehavioralStore((s) => s.checkInDays)

  const days90 = useMemo(() => {
    const set = new Set(checkInDays)
    const out: { iso: string; checked: boolean; dayOfMonth: number; isToday: boolean }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const iso = d.toISOString().slice(0, 10)
      out.push({ iso, checked: set.has(iso), dayOfMonth: d.getDate(), isToday: i === 0 })
    }
    return out
  }, [checkInDays])

  const motivational = streak === 0
    ? 'Start a fresh streak today.'
    : streak >= longest
      ? "You're at your all-time longest streak. Keep going."
      : `${longest - streak} day${longest - streak === 1 ? '' : 's'} until your longest streak.`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] rounded-t-3xl border p-6 sm:rounded-3xl"
        style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div
              className="text-[10px] font-semibold uppercase"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted, letterSpacing: '0.16em' }}
            >
              Wellness streak
            </div>
            <h3
              className="mt-1 text-[22px] font-semibold"
              style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
            >
              {streak} day{streak === 1 ? '' : 's'} 🔥
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: THEME.border, color: THEME.textSecondary }}
          >
            ×
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Current" value={streak} />
          <Stat label="Longest" value={longest} />
        </div>

        <p
          className="mt-3 text-[13px]"
          style={{ color: THEME.textSecondary, fontFamily: THEME.fontSans }}
        >
          {motivational}
        </p>

        <div className="mt-5">
          <div
            className="mb-2 text-[10px] font-semibold uppercase"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted, letterSpacing: '0.14em' }}
          >
            Last 90 days
          </div>
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
            role="grid"
            aria-label="Last 90 days check-ins"
          >
            {days90.map((d) => (
              <div
                key={d.iso}
                title={`${d.iso}${d.checked ? ' — checked in' : ''}`}
                className="aspect-square rounded-[3px]"
                style={{
                  background: d.checked ? THEME.primary : 'var(--bg-surface-raised)',
                  outline: d.isToday ? `2px solid ${THEME.accent}` : 'none',
                  outlineOffset: '1px',
                  opacity: d.checked ? (d.isToday ? 1 : 0.85) : 0.6,
                }}
              />
            ))}
          </div>
          <div
            className="mt-3 flex items-center gap-3 text-[10px]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted, letterSpacing: '0.1em' }}
          >
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-[3px]"
                style={{ background: 'var(--bg-surface-raised)' }}
              />
              MISSED
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-[3px]"
                style={{ background: THEME.primary }}
              />
              CHECKED IN
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: 'var(--bg-surface)', borderColor: THEME.border }}
    >
      <div
        className="text-[10px] font-semibold uppercase"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted, letterSpacing: '0.14em' }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-[26px] font-bold leading-none"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        {value}
      </div>
    </div>
  )
}
