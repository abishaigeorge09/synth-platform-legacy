import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppAuthStore } from '../../features/app/store/useAppAuthStore'
import { useGuidedTourStore } from './useGuidedTourStore'
import { SYNTH } from '../../features/app/lib/theme'

type TourStop = {
  route: string
  kicker: string
  title: string
  body: string
}

const COACH_STEPS: TourStop[] = [
  {
    route: '/app/coach/home',
    kicker: 'Home',
    title: 'Your daily snapshot',
    body: "Your lineup hero is on the left — swipe right to see your team's key stats, recovery, and week schedule.",
  },
  {
    route: '/app/coach/roster',
    kicker: 'Roster',
    title: 'Your full team',
    body: 'Tap any athlete card to open their full profile — performance, wellness, notes, and lineups all in one place.',
  },
  {
    route: '/app/coach/ai',
    kicker: 'synth. AI',
    title: 'Ask synth. anything',
    body: 'Try asking: "Who needs the most attention this week?" — synth. pulls from every connected source to answer.',
  },
  {
    route: '/app/coach/sources/connectors',
    kicker: 'Sources',
    title: 'All your data, one place',
    body: 'Connect your erg machines, wearables, video, and schedules. synth. synthesizes them into one picture automatically.',
  },
]

const ATHLETE_STEPS: TourStop[] = [
  {
    route: '/app/athlete/home',
    kicker: 'Home',
    title: 'Your daily snapshot',
    body: "Your recovery signal, today's plan, and your erg pacer — the essentials at a glance every morning.",
  },
  {
    route: '/app/athlete/capture',
    kicker: 'Capture',
    title: 'Log every effort',
    body: 'Form video, erg scores, daily wellness — capture once and synth. files it next to your splits for coach to see.',
  },
  {
    route: '/app/athlete/erg-pacer',
    kicker: 'Erg pacer',
    title: 'Hit your splits',
    body: 'Live target pace calibrated to your last five efforts. Adjust if today calls for harder or easier.',
  },
  {
    route: '/app/athlete/ai',
    kicker: 'synth. AI',
    title: 'Ask synth. anything',
    body: 'Try asking: "How should I taper this week?" — synth. answers using your splits, wellness, and coach\'s notes.',
  },
  {
    route: '/app/athlete/sources',
    kicker: 'Sources',
    title: 'Connect your data',
    body: 'Concept2, Strava, WHOOP, Apple Health. Plug them in once and synth. keeps everything in sync for you and coach.',
  },
]

export function GuidedTourOrchestrator() {
  const role = useAppAuthStore((s) => s.role)
  const { active, step, done, advanceStep, completeTour } = useGuidedTourStore()
  const navigate = useNavigate()

  const steps = role === 'athlete' ? ATHLETE_STEPS : COACH_STEPS
  const current = steps[step]
  const homeRoute = role === 'athlete' ? '/app/athlete/home' : '/app/coach/home'

  // Navigate on step change only — never lock the user to the current route.
  // Once the route is reached, they can interact freely with that page;
  // hitting "Next" advances to the next stop.
  const lastNavStepRef = useRef<number | null>(null)
  useEffect(() => {
    if (!active || done || !current) {
      lastNavStepRef.current = null
      return
    }
    if (lastNavStepRef.current === step) return
    lastNavStepRef.current = step
    navigate(current.route)
  }, [active, step, done, current, navigate])

  const isLast = step === steps.length - 1

  const finish = () => {
    completeTour()
    navigate(homeRoute)
  }

  const onNext = () => {
    if (isLast) {
      finish()
    } else {
      advanceStep(steps.length)
    }
  }

  return (
    <AnimatePresence>
      {active && !done && current ? (
        <motion.div
          key={`guided-tour-step-${step}`}
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 32, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-[55]"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom), 20px)',
            background: 'rgba(31, 38, 201, 0.92)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            borderTop: '1px solid rgba(255,255,255,0.14)',
            fontFamily: SYNTH.font,
          }}
        >
          {/* Step dots + Skip */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-6 rounded-full transition-colors duration-300"
                  style={{
                    background: i <= step ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={finish}
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: SYNTH.inkOnBrandFaint }}
            >
              Skip tour
            </button>
          </div>

          {/* Content */}
          <div className="px-5 pb-3">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: SYNTH.accentEmerald }}
            >
              {current.kicker}
            </p>
            <h2
              className="mt-1 text-[20px] font-bold leading-[1.15] tracking-[-0.01em]"
              style={{ color: SYNTH.inkOnBrand }}
            >
              {current.title}
            </h2>
            <p
              className="mt-1.5 text-[13px] leading-[1.5]"
              style={{ color: SYNTH.inkOnBrandMuted }}
            >
              {current.body}
            </p>
          </div>

          {/* CTA */}
          <div className="px-5 pb-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.985 }}
              onClick={onNext}
              className="flex w-full items-center justify-center rounded-full py-3.5 text-[14px] font-semibold"
              style={{
                background: SYNTH.inkOnBrand,
                color: SYNTH.ink,
                letterSpacing: '0.01em',
              }}
            >
              {isLast ? 'Done →' : 'Next →'}
            </motion.button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
