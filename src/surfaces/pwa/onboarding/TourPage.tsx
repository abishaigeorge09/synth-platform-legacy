import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Boxes,
  Sparkles,
  MoreHorizontal,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { useGuidedTourStore } from '@shared/tutorial/useGuidedTourStore'
import { SYNTH } from '../lib/theme'
import { OnboardingBackground } from '../primitives/OnboardingBackground'

type TourStep = {
  key: string
  kicker: string
  title: string
  body: string
  icon: React.ReactNode
  bg: 'role' | 'sport' | 'team' | 'capabilities' | 'connectors' | 'reveal'
}

const STEPS: TourStep[] = [
  {
    key: 'home',
    kicker: 'Home',
    title: 'Your daily snapshot',
    body: "Greeting, today's plan, and the week ahead — lineups, races, attendance flags. The signals that need your eye, not the noise.",
    icon: <Home size={36} strokeWidth={2} />,
    bg: 'role',
  },
  {
    key: 'tools',
    kicker: 'Tools',
    title: 'Your custom toolkit',
    body: 'Lineup Builder + Stopwatch ship today. Build boats, time pieces with per-boat splits, rate sessions post-race. Request anything you wish was here.',
    icon: <Boxes size={36} strokeWidth={2} />,
    bg: 'capabilities',
  },
  {
    key: 'capture',
    kicker: 'Capture',
    title: 'Quick add anywhere',
    body: 'Voice-note, photo, or paste-text any data point — synth parses it and attributes it to the right athlete and session automatically.',
    icon: <Plus size={36} strokeWidth={2.4} />,
    bg: 'sport',
  },
  {
    key: 'ai',
    kicker: 'synth AI',
    title: 'Ask synth anything',
    body: "Scoped chat that pulls from every connector you've authorized. Ask about an athlete, the team, last weekend's race — answers come with charts and provenance.",
    icon: <Sparkles size={36} strokeWidth={2} />,
    bg: 'team',
  },
  {
    key: 'more',
    kicker: 'More',
    title: 'Roster · Attention · Sources · Settings',
    body: 'Everything secondary tucked under the dots. Roster for drill-in, Attention for flagged signals, Sources for connector health, Settings for invite codes and prefs.',
    icon: <MoreHorizontal size={36} strokeWidth={2.4} />,
    bg: 'connectors',
  },
  {
    key: 'done',
    kicker: "You're set",
    title: 'Welcome to synth.',
    body: 'Every signal. One platform. We synthesize what you connect, and surface what you should care about. Ready when you are.',
    icon: <Sparkles size={36} strokeWidth={2} />,
    bg: 'reveal',
  },
]

export function TourPage() {
  const navigate = useNavigate()
  const role = useAppAuthStore((s) => s.role)
  const markOnboardingDone = useAppAuthStore((s) => s.markOnboardingDone)
  const startTour = useGuidedTourStore((s) => s.startTour)
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => {
      document.body.removeAttribute('data-app-canvas')
    }
  }, [])

  const finish = () => {
    markOnboardingDone()
    startTour()
    navigate(role === 'coach' ? '/app/coach/home' : '/app/athlete/home', { replace: true })
  }

  const next = () => {
    if (isLast) finish()
    else setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
      }}
    >
      <OnboardingBackground variant={current.bg} />

      {/* Top bar — Skip + step dots */}
      <div className="relative z-10 flex shrink-0 items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),20px)] pb-3">
        <div className="flex flex-1 items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                background: i <= step ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.2)',
                maxWidth: 28,
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={finish}
          className="text-[12px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          Skip
        </button>
      </div>

      {/* Centered step content */}
      <div className="synth-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div
          className="flex min-h-full flex-col justify-center px-6 py-6"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 110px)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-[420px]"
            >
              {/* Hero icon */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl"
                style={{
                  background: SYNTH.glass,
                  backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                  WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                  border: `1px solid ${SYNTH.glassBorder}`,
                  color: SYNTH.inkOnBrand,
                }}
              >
                {current.icon}
              </motion.div>

              <p
                className="mt-7 text-center text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: SYNTH.accentEmerald, fontFamily: SYNTH.font }}
              >
                {current.kicker}
              </p>
              <h1
                className="mt-2 text-center text-[30px] font-bold leading-[1.1] tracking-[-0.01em]"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {current.title}
              </h1>
              <p
                className="mx-auto mt-4 max-w-[360px] text-center text-[14px] leading-[1.55]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {current.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pinned CTA */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3"
        style={{
          background: 'rgba(31, 38, 201, 0.82)',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <button
          type="button"
          onClick={next}
          className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99]"
          style={{
            background: SYNTH.inkOnBrand,
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
            letterSpacing: '0.01em',
          }}
        >
          {isLast ? 'Open synth' : 'Next'}
          {!isLast ? <ChevronRight size={16} strokeWidth={2.4} /> : null}
        </button>
      </div>
    </motion.div>
  )
}
