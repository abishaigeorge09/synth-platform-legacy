import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { useAppAuthStore } from '../store/useAppAuthStore'

const INTEREST_KEY = 'synth:interest:emails'

function saveEmail(email: string) {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(INTEREST_KEY)
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : []
    if (!list.includes(email)) list.push(email)
    window.localStorage.setItem(INTEREST_KEY, JSON.stringify(list))
  } catch {
    // ignore
  }
}

export function ComingSoonPage() {
  const navigate = useNavigate()
  const setDemoUser = useAppAuthStore((s) => s.setDemoUser)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [fieldError, setFieldError] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setFieldError('Enter a valid email address.')
      return
    }
    saveEmail(trimmed)
    setSubmitted(true)
    setFieldError('')
  }

  const onTryDemo = () => {
    setDemoUser({ id: 'demo-user', email: 'demo@synth.local' })
    navigate('/app', { replace: true })
  }

  return (
    <div
      className="flex flex-1 flex-col"
      style={{
        background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
      }}
    >
      {/* Back button */}
      <div className="relative z-10 px-5 pt-[max(env(safe-area-inset-top),20px)] pb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          <ChevronLeft size={14} strokeWidth={2.4} />
          Back
        </button>
      </div>

      {/* Illustration zone */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        style={{ minHeight: '40vh' }}
      >
        <ComingSoonIllustration />
      </motion.div>

      {/* Dark bottom panel */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-4 px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-8"
        style={{
          background: SYNTH.accentBlack,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
      >
        {!submitted ? (
          <>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: SYNTH.accentEmerald, fontFamily: SYNTH.font }}
              >
                Coming soon
              </span>
              <h1
                className="text-center text-[28px] font-bold leading-[1.1] tracking-[-0.01em]"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                Are you interested?
              </h1>
              <p
                className="mt-1 text-center text-[13px] leading-[1.55]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                We're building real accounts. Enter your email and we'll keep you posted.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFieldError('')
                }}
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full rounded-2xl px-4 py-3.5 text-[14px] outline-none"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: `1px solid ${fieldError ? '#EF4444' : 'rgba(255,255,255,0.18)'}`,
                  color: SYNTH.inkOnBrand,
                  fontFamily: SYNTH.font,
                }}
              />
              {fieldError ? (
                <p
                  className="text-center text-[12px]"
                  style={{ color: '#EF4444', fontFamily: SYNTH.font }}
                >
                  {fieldError}
                </p>
              ) : null}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.985 }}
                className="flex w-full items-center justify-center rounded-full py-3.5 text-[14px] font-semibold"
                style={{
                  background: SYNTH.inkOnBrand,
                  color: SYNTH.ink,
                  fontFamily: SYNTH.font,
                  letterSpacing: '0.01em',
                }}
              >
                Stay in the loop →
              </motion.button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <CheckCircle size={40} color={SYNTH.accentEmerald} strokeWidth={1.8} />
            <h2
              className="text-center text-[22px] font-bold leading-[1.2]"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              You're on the list.
            </h2>
            <p
              className="text-center text-[13px] leading-[1.55]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              We'll keep you posted via email as soon as we're ready.
            </p>
          </motion.div>
        )}

        <button
          type="button"
          onClick={onTryDemo}
          className="mt-1 text-center text-[12px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          ← Try the demo
        </button>
      </motion.div>
    </div>
  )
}

function ComingSoonIllustration() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 280,
          height: 280,
          background: `radial-gradient(circle, ${SYNTH.accentEmerald}38 0%, transparent 65%)`,
          filter: 'blur(20px)',
        }}
      />
      <motion.svg
        width={110}
        height={110}
        viewBox="0 0 110 110"
        style={{ position: 'relative' }}
      >
        {/* Outer ring */}
        <circle cx={55} cy={55} r={48} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
        {/* Middle ring */}
        <circle cx={55} cy={55} r={32} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        {/* Center dot */}
        <circle cx={55} cy={55} r={5} fill={SYNTH.accentEmerald} />
        {/* Hour hand */}
        <motion.line
          x1={55}
          y1={55}
          x2={55}
          y2={14}
          stroke={SYNTH.inkOnBrand}
          strokeWidth={2}
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '55px', originY: '55px' }}
        />
        {/* Minute hand — faster */}
        <motion.line
          x1={55}
          y1={55}
          x2={55}
          y2={20}
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={1.2}
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '55px', originY: '55px' }}
        />
        {/* Tick marks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
          const rad = (angle * Math.PI) / 180
          const x1 = 55 + 44 * Math.sin(rad)
          const y1 = 55 - 44 * Math.cos(rad)
          const x2 = 55 + 40 * Math.sin(rad)
          const y2 = 55 - 40 * Math.cos(rad)
          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={angle % 90 === 0 ? 1.5 : 0.8}
            />
          )
        })}
      </motion.svg>
    </div>
  )
}
