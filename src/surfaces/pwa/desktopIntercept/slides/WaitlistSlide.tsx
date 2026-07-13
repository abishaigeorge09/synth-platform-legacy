import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { SYNTH } from '../../lib/theme'
import { posthog } from '@shared/analytics/posthog'

const STORAGE_KEY = 'synth-waitlist'

export function WaitlistSlide() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) return

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const list: { email: string; at: string }[] = raw ? JSON.parse(raw) : []
      list.push({ email: trimmed, at: new Date().toISOString() })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
      // Ignore — quota / private mode
    }

    try {
      posthog.capture('waitlist_joined', { email: trimmed })
    } catch {
      // Ignore — analytics never breaks the UI
    }

    setSubmitted(true)
    setEmail('')
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span
          style={{
            fontFamily: SYNTH.font,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: SYNTH.inkOnBrandFaint,
          }}
        >
          One more thing
        </span>
        <h1
          style={{
            marginTop: 12,
            fontFamily: SYNTH.font,
            fontSize: 'clamp(36px, 4.5vw, 60px)',
            fontWeight: 700,
            color: SYNTH.inkOnBrand,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            maxWidth: 720,
          }}
        >
          Want early access to synth?
        </h1>
        <p
          style={{
            marginTop: 16,
            fontFamily: SYNTH.font,
            fontSize: 16,
            color: SYNTH.inkOnBrandMuted,
            lineHeight: 1.5,
            maxWidth: 540,
            margin: '16px auto 0',
          }}
        >
          We'll send you the install link and a short note when synth opens to
          new teams.
        </p>
      </motion.div>

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-10 flex w-full max-w-md items-center gap-2"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@team.com"
          disabled={submitted}
          style={{
            flex: 1,
            padding: '14px 18px',
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.20)',
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            fontSize: 14,
            outline: 'none',
            backdropFilter: 'blur(20px)',
          }}
        />
        <motion.button
          type="submit"
          disabled={submitted}
          whileHover={submitted ? undefined : { scale: 1.04 }}
          whileTap={submitted ? undefined : { scale: 0.97 }}
          style={{
            padding: '14px 24px',
            borderRadius: 9999,
            background: submitted ? 'rgba(16,185,129,0.6)' : SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: submitted ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: submitted ? 'none' : '0 12px 32px rgba(16,185,129,0.45)',
          }}
        >
          {submitted ? (
            <>
              <Check size={14} strokeWidth={2.8} />
              You're in
            </>
          ) : (
            <>
              Join waitlist
              <ArrowRight size={14} strokeWidth={2.6} />
            </>
          )}
        </motion.button>
      </motion.form>
    </div>
  )
}
