import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, EyeOff } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { OnboardingBackground } from '../primitives/OnboardingBackground'

const PROMISES: { icon: React.ReactNode; title: string; body: string }[] = [
  {
    icon: <Lock size={16} strokeWidth={2.2} color={SYNTH.accentEmerald} />,
    title: 'Encrypted in transit',
    body: 'Every connector handshake runs over TLS — your tokens never touch our logs.',
  },
  {
    icon: <EyeOff size={16} strokeWidth={2.2} color={SYNTH.accentEmerald} />,
    title: 'Never sold',
    body: "We don't sell or share your data with anyone. Period.",
  },
  {
    icon: <ShieldCheck size={16} strokeWidth={2.2} color={SYNTH.accentEmerald} />,
    title: 'Yours to delete',
    body: 'One tap disconnects a source. One tap deletes everything.',
  },
]

export function TrustCardPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => {
      document.body.removeAttribute('data-app-canvas')
    }
  }, [])

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
      <OnboardingBackground variant="trust" />
      <div className="synth-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center px-6 py-6">
          <div className="mx-auto w-full max-w-[420px]">
            {/* Hero shield */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{
                background: SYNTH.glass,
                backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                border: `1px solid ${SYNTH.glassBorder}`,
              }}
            >
              <ShieldCheck size={40} color={SYNTH.accentEmerald} strokeWidth={1.6} />
            </motion.div>

            <h1
              className="mt-6 text-center text-[30px] font-bold leading-[1.1] tracking-[-0.01em]"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              Your data stays yours
            </h1>
            <p
              className="mx-auto mt-3 max-w-[340px] text-center text-[14px] leading-[1.5]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              Three promises before we connect anything.
            </p>

            <div className="mt-8 flex flex-col gap-2.5">
              {PROMISES.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-3 rounded-2xl border px-4 py-4"
                  style={{
                    background: SYNTH.glass,
                    backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                    WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                    borderColor: SYNTH.glassBorder,
                  }}
                >
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.18)' }}
                  >
                    {p.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[14px] font-semibold"
                      style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                    >
                      {p.title}
                    </p>
                    <p
                      className="mt-1 text-[12px] leading-[1.45]"
                      style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                    >
                      {p.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 shrink-0 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3"
        style={{
          background: 'rgba(31, 38, 201, 0.82)',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/app/onboarding/scanning')}
          className="block w-full rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99]"
          style={{
            background: SYNTH.inkOnBrand,
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
            letterSpacing: '0.01em',
          }}
        >
          Continue
        </button>
      </div>
    </motion.div>
  )
}
