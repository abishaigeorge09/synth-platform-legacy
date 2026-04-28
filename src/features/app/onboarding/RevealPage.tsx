import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Heart, Flame, TrendingUp } from 'lucide-react'
import { DashboardRevealGrid, type RevealCard } from '../primitives/DashboardRevealGrid'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { APP_THEME } from '../lib/theme'
import { METRIC_COLOR } from '../lib/theme'

export function RevealPage() {
  const navigate = useNavigate()
  const role = useAppAuthStore((s) => s.role)
  const coachConnectors = useOnboardingStore((s) => s.coachConnectors)
  const athleteConnectors = useOnboardingStore((s) => s.athleteConnectors)
  const sourceCount = role === 'coach' ? coachConnectors.length : athleteConnectors.length

  const cards: RevealCard[] = [
    {
      label: 'Training load',
      value: '142',
      unit: 'TSS/d',
      ringPercent: 72,
      color: METRIC_COLOR.ergPerformance,
      icon: <Activity size={14} color={METRIC_COLOR.ergPerformance} strokeWidth={2.4} />,
    },
    {
      label: 'Recovery',
      value: '78',
      ringPercent: 78,
      color: METRIC_COLOR.recovery,
      icon: <Heart size={14} color={METRIC_COLOR.recovery} strokeWidth={2.4} />,
    },
    {
      label: 'Streak',
      value: '11',
      unit: 'd',
      ringPercent: 55,
      color: METRIC_COLOR.streak,
      icon: <Flame size={14} color={METRIC_COLOR.streak} strokeWidth={2.4} />,
    },
    {
      label: 'Volume',
      value: '28k',
      unit: 'm',
      ringPercent: 65,
      color: METRIC_COLOR.volume,
      icon: <TrendingUp size={14} color={METRIC_COLOR.volume} strokeWidth={2.4} />,
    },
  ]

  const onContinue = () => {
    navigate(role === 'coach' ? '/app/coach/home' : '/app/athlete/home')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col"
      style={{ background: APP_THEME.canvas }}
    >
      <div className="flex flex-1 flex-col px-5 pt-[max(env(safe-area-inset-top),24px)]">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: APP_THEME.brand }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        <h1
          className="mt-5 text-center text-[28px] font-semibold leading-[1.15]"
          style={{ fontFamily: APP_THEME.fontSerif, color: APP_THEME.text }}
        >
          synth is ready
          <br />
          <span style={{ color: APP_THEME.brand }}>for you.</span>
        </h1>
        <p
          className="mt-2 text-center text-[13px]"
          style={{ fontFamily: APP_THEME.fontSans, color: APP_THEME.textMuted }}
        >
          Powered by{' '}
          <span style={{ color: APP_THEME.text, fontWeight: 600 }}>{Math.max(sourceCount, 1)}</span>{' '}
          connected source{sourceCount === 1 ? '' : 's'}.
        </p>

        <div className="mt-7">
          <DashboardRevealGrid cards={cards} />
        </div>

        <p
          className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textFaint }}
        >
          Edit anything later in Sources
        </p>
      </div>

      <div className="border-t px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-4"
           style={{ borderColor: APP_THEME.divider, background: APP_THEME.canvas }}>
        <button
          type="button"
          onClick={onContinue}
          className="block w-full rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99]"
          style={{
            background: APP_THEME.brand,
            color: '#FFFFFF',
            fontFamily: APP_THEME.fontMono,
            letterSpacing: '0.03em',
          }}
        >
          Open synth
        </button>
      </div>
    </motion.div>
  )
}
