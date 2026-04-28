import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, animate, useTransform } from 'framer-motion'
import { THEME } from '../../../lib/theme'
import { useBehavioralStore, statusLabel, recoveryColor } from './useBehavioralStore'
import { AnimatedNumber } from './AnimatedNumber'
import { StreakDetailModal } from './StreakDetailModal'
import { useNavigate } from 'react-router-dom'

const RING_RADIUS = 58
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

type Props = {
  name: string
  handle?: string
  team?: string
}

export function AthleteCard({ name, handle, team }: Props) {
  const navigate = useNavigate()
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const streak = useBehavioralStore((s) => s.streak)
  const recovery = useBehavioralStore((s) => s.recovery)
  const recoveryStatus = useBehavioralStore((s) => s.recoveryStatus)
  const prCount = useBehavioralStore((s) => s.prCount)
  const sessionsLogged = useBehavioralStore((s) => s.sessionsLogged)
  const daysActive = useBehavioralStore((s) => s.daysActive)
  const flamePulseAt = useBehavioralStore((s) => s.flamePulseAt)
  const checkIn = useBehavioralStore((s) => s.checkIn)
  const lastCheckIn = useBehavioralStore((s) => s.lastCheckIn)

  const [streakOpen, setStreakOpen] = useState(false)
  const [glow, setGlow] = useState(false)

  // Recovery ring fill on first paint.
  const ringProgress = useMotionValue(0)
  const dashOffset = useTransform(ringProgress, (v) => RING_CIRCUMFERENCE * (1 - v / 100))
  useEffect(() => {
    const controls = animate(ringProgress, recovery, { duration: 1.2, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [recovery, ringProgress])

  const ringColor = recoveryColor(recovery)
  const todayISO = new Date().toISOString().slice(0, 10)
  const checkedInToday = lastCheckIn === todayISO

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, mass: 0.9 }}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onHoverStart={() => setGlow(true)}
        onHoverEnd={() => setGlow(false)}
        className="relative w-full overflow-hidden rounded-3xl border"
        style={{
          background: 'var(--bg-primary)',
          borderColor: THEME.border,
          boxShadow: glow
            ? '0 1px 0 rgba(24,24,27,0.02), 0 30px 60px -28px rgba(5,150,105,0.35)'
            : '0 1px 0 rgba(24,24,27,0.02), 0 24px 48px -32px rgba(24,24,27,0.25)',
          transition: 'box-shadow 240ms ease',
        }}
      >
        {/* corner glow */}
        <motion.div
          aria-hidden
          animate={{ opacity: glow ? 0.55 : 0.25 }}
          transition={{ duration: 0.24 }}
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${ringColor}, transparent 70%)` }}
        />

        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          {/* Avatar with recovery ring */}
          <div className="relative flex shrink-0 items-center justify-center self-center sm:self-auto">
            <svg
              width={140}
              height={140}
              viewBox="0 0 140 140"
              className="-rotate-90"
              aria-hidden
            >
              {/* track */}
              <circle
                cx={70}
                cy={70}
                r={RING_RADIUS}
                fill="none"
                stroke={THEME.border}
                strokeWidth={6}
              />
              {/* progress */}
              <motion.circle
                cx={70}
                cy={70}
                r={RING_RADIUS}
                fill="none"
                stroke={ringColor}
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                style={{ strokeDashoffset: dashOffset }}
              />
            </svg>

            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute flex h-[100px] w-[100px] items-center justify-center rounded-full"
              style={{
                background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDarker})`,
                boxShadow: '0 12px 28px -10px rgba(5,150,105,0.45)',
              }}
            >
              <span
                className="text-[36px] font-bold text-white"
                style={{ fontFamily: THEME.fontMono, letterSpacing: '0.04em' }}
              >
                {initials}
              </span>
            </motion.div>

            {/* recovery score badge */}
            <div
              className="absolute -bottom-1 right-0 flex h-7 min-w-[44px] items-center justify-center rounded-full border px-2 text-[12px] font-bold"
              style={{
                background: 'var(--bg-primary)',
                borderColor: ringColor,
                color: ringColor,
                fontFamily: THEME.fontMono,
              }}
            >
              <AnimatedNumber value={recovery} duration={1200} />
            </div>
          </div>

          {/* Name / status block */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2
                className="text-[24px] font-semibold leading-tight sm:text-[28px]"
                style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
              >
                {name}
              </h2>
              <button
                type="button"
                onClick={() => setStreakOpen(true)}
                className="group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors"
                style={{
                  background: 'var(--amber-subtle)',
                  border: '1px solid var(--amber-primary)',
                }}
                aria-label={`${streak} day streak — view details`}
              >
                <FlameIcon pulseKey={flamePulseAt ?? 0} fresh={!!flamePulseAt} />
                <span
                  className="text-[12px] font-bold leading-none"
                  style={{ color: 'var(--amber-primary)', fontFamily: THEME.fontMono }}
                >
                  <AnimatedNumber value={streak} duration={600} />
                </span>
                <span
                  className="text-[10px] font-semibold uppercase leading-none"
                  style={{ color: 'var(--amber-primary)', fontFamily: THEME.fontMono, letterSpacing: '0.1em' }}
                >
                  day
                </span>
              </button>
            </div>
            <div
              className="mt-1 flex flex-wrap items-center gap-2 text-[12px]"
              style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}
            >
              {handle ? <span>@{handle}</span> : null}
              {handle && team ? <span aria-hidden>·</span> : null}
              {team ? <span>{team}</span> : null}
            </div>

            {/* Today's status */}
            <div className="mt-3 flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: ringColor, boxShadow: `0 0 0 4px ${ringColor}22` }}
              />
              <span
                className="text-[10px] font-semibold uppercase"
                style={{ color: THEME.textMuted, fontFamily: THEME.fontMono, letterSpacing: '0.16em' }}
              >
                Today
              </span>
              <span
                className="text-[14px] font-semibold"
                style={{ color: THEME.textPrimary, fontFamily: THEME.fontSerif }}
              >
                {statusLabel(recoveryStatus)}
              </span>
            </div>

            {/* Mini stat pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              <MiniStat label="PRs" value={prCount} />
              <MiniStat label="Sessions" value={sessionsLogged} />
              <MiniStat label="Days active" value={daysActive} />
            </div>

            {/* Bottom strip */}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/athlete/record?tab=score')}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-transform active:scale-[0.98]"
                style={{
                  background: THEME.primary,
                  fontFamily: THEME.fontMono,
                  letterSpacing: '0.04em',
                  boxShadow: '0 10px 22px -12px rgba(5,150,105,0.6)',
                }}
              >
                Quick log
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!checkedInToday) checkIn()
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border px-4 py-2 text-[12px] font-semibold transition-colors"
                style={{
                  borderColor: THEME.border,
                  color: THEME.textPrimary,
                  background: 'var(--bg-surface)',
                  fontFamily: THEME.fontMono,
                  letterSpacing: '0.04em',
                  opacity: checkedInToday ? 0.6 : 1,
                }}
              >
                {checkedInToday ? 'Checked in ✓' : 'Wellness check'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {streakOpen ? (
          <StreakDetailModal onClose={() => setStreakOpen(false)} />
        ) : null}
      </AnimatePresence>
    </>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border px-3 py-1.5"
      style={{ borderColor: THEME.border, background: 'var(--bg-surface)' }}
    >
      <span
        className="text-[14px] font-bold leading-none"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        <AnimatedNumber value={value} duration={500} />
      </span>
      <span
        className="text-[10px] font-semibold uppercase leading-none"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted, letterSpacing: '0.14em' }}
      >
        {label}
      </span>
    </div>
  )
}

function FlameIcon({ pulseKey, fresh }: { pulseKey: number; fresh: boolean }) {
  return (
    <motion.svg
      key={pulseKey}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      initial={fresh ? { scale: 0.7 } : false}
      animate={fresh ? { scale: [0.7, 1.4, 1] } : { scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <path
        d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3-1-5 2 1 4 3 4 7a7 7 0 1 1-14 0c0-5 4-7 7-11Z"
        fill="#F97316"
        stroke="#EA580C"
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </motion.svg>
  )
}
