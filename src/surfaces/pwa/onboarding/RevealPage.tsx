import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Heart, Flame, TrendingUp, Check } from 'lucide-react'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { SYNTH } from '../lib/theme'
import { OnboardingBackground } from '../primitives/OnboardingBackground'

type Card = {
  label: string
  value: string
  unit?: string
  icon: React.ReactNode
  accent: string
}

const CARDS: Card[] = [
  {
    label: 'Training load',
    value: '142',
    unit: 'TSS/d',
    icon: <Activity size={14} strokeWidth={2.4} />,
    accent: SYNTH.cardSky,
  },
  {
    label: 'Recovery',
    value: '78',
    icon: <Heart size={14} strokeWidth={2.4} />,
    accent: SYNTH.accentEmerald,
  },
  {
    label: 'Streak',
    value: '11',
    unit: 'd',
    icon: <Flame size={14} strokeWidth={2.4} />,
    accent: SYNTH.cardLemon,
  },
  {
    label: 'Volume',
    value: '28k',
    unit: 'm',
    icon: <TrendingUp size={14} strokeWidth={2.4} />,
    accent: SYNTH.cardPink,
  },
]

export function RevealPage() {
  const navigate = useNavigate()
  const role = useAppAuthStore((s) => s.role)
  const coachConnectors = useOnboardingStore((s) => s.coachConnectors)
  const athleteConnectors = useOnboardingStore((s) => s.athleteConnectors)
  const sourceCount = role === 'coach' ? coachConnectors.length : athleteConnectors.length

  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => {
      document.body.removeAttribute('data-app-canvas')
    }
  }, [])

  const onContinue = () => {
    // Walk the user through the app's main features before dropping them
    // on home. The tour finishes by routing to the role-appropriate home.
    navigate('/app/onboarding/tour')
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
      <OnboardingBackground variant="reveal" />
      <div className="synth-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div
          className="flex min-h-full flex-col justify-center px-6 py-6"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 110px)' }}
        >
          <div className="mx-auto w-full max-w-[420px]">
            {/* Hero check */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: SYNTH.accentEmerald }}
            >
              <Check size={28} color={SYNTH.inkOnBrand} strokeWidth={3} />
            </motion.div>

            <h1
              className="mt-6 text-center text-[30px] font-bold leading-[1.1] tracking-[-0.01em]"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              synth is ready
              <br />
              <span style={{ color: SYNTH.accentEmerald }}>for you.</span>
            </h1>
            <p
              className="mx-auto mt-3 max-w-[340px] text-center text-[13px]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              Powered by{' '}
              <span style={{ color: SYNTH.inkOnBrand, fontWeight: 600 }}>
                {Math.max(sourceCount, 1)}
              </span>{' '}
              connected source{sourceCount === 1 ? '' : 's'}.
            </p>

            {/* Reveal grid — 2×2 glass tiles */}
            <div className="mt-8 grid grid-cols-2 gap-2.5">
              {CARDS.map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
                  className="rounded-3xl border p-4"
                  style={{
                    background: SYNTH.glass,
                    backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                    WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                    borderColor: SYNTH.glassBorder,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-lg"
                      style={{ background: `${c.accent}33`, color: c.accent }}
                    >
                      {c.icon}
                    </span>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                    >
                      {c.label}
                    </p>
                  </div>
                  <p
                    className="mt-2 text-[24px] font-bold leading-none"
                    style={{
                      color: c.accent,
                      fontFamily: SYNTH.font,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {c.value}
                    {c.unit ? (
                      <span
                        className="ml-1 text-[12px] font-semibold"
                        style={{ color: SYNTH.inkOnBrandFaint }}
                      >
                        {c.unit}
                      </span>
                    ) : null}
                  </p>
                </motion.div>
              ))}
            </div>

            <p
              className="mt-6 text-center text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
            >
              Edit anything later in Sources
            </p>
          </div>
        </div>
      </div>

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
          onClick={onContinue}
          className="block w-full rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99]"
          style={{
            background: SYNTH.inkOnBrand,
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
            letterSpacing: '0.01em',
          }}
        >
          Open synth
        </button>
      </div>
    </motion.div>
  )
}
