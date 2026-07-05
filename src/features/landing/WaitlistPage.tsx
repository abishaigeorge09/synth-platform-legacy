import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { joinWaitlist, type WaitlistResult } from '../../lib/waitlist'
import { KO } from './shell/primitives'
import {
  BG, FG, MUTED, DIM, HAIR, FAINT,
  GREEN, G_GLOW, MONO, BODY, SERIF,
} from './shell/tokens'

/**
 * One-page waitlist. Rendered as the *entire* public site when
 * VITE_WAITLIST_MODE=true (see src/app/routes.tsx). Deliberately
 * self-contained — no Nav / SideRail / Footer overlay from the full
 * marketing shell — so nothing links back into the site that's being
 * held behind the flag. Visuals reuse the shared marketing tokens
 * (dark canvas, Fraunces serif headline, green accent, mono labels)
 * so it reads as the same brand.
 */

type Phase = 'idle' | 'submitting' | 'done'

export function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<WaitlistResult | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (phase === 'submitting') return
    setPhase('submitting')
    const r = await joinWaitlist(email, { source: 'waitlist-hero' })
    setResult(r)
    // On a hard error we stay on the form so they can retry; on
    // joined/already we flip to the confirmation state.
    setPhase(r.status === 'error' ? 'idle' : 'done')
  }

  const joined = phase === 'done' && result?.status !== 'error'

  return (
    <div
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-5 py-16 text-center"
      style={{ background: BG, color: FG, fontFamily: BODY }}
    >
      <BackgroundTexture />

      <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center gap-8">
        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[15px] font-semibold uppercase tracking-[0.5em]"
          style={{ fontFamily: MONO, color: FG }}
        >
          synth<span style={{ color: GREEN }}>.</span>
        </motion.div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.28em]"
          style={{
            borderColor: FAINT,
            background: 'rgba(0,0,0,0.4)',
            fontFamily: MONO,
            color: MUTED,
          }}
        >
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}` }}
          />
          <span>Private beta · Coming soon</span>
        </motion.div>

        {/* Serif headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="tracking-[-0.02em]"
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: 'clamp(38px, 7vw, 72px)',
            lineHeight: 1.05,
          }}
        >
          Every data signal.
          <br />
          <KO>One platform.</KO>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="max-w-[420px] text-[15px] leading-relaxed"
          style={{ color: MUTED }}
        >
          synth unifies every athlete signal — training, recovery, and
          performance — into one intelligence layer. Join the waitlist for
          early access.
        </motion.p>

        {/* Form / confirmation */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="w-full max-w-[440px]"
        >
          {joined ? (
            <ConfirmationCard already={result?.status === 'already'} />
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@team.com"
                  autoComplete="email"
                  disabled={phase === 'submitting'}
                  className="flex-1 rounded-none border bg-transparent px-4 py-4 text-[14px] outline-none transition-colors focus:border-white/40"
                  style={{
                    borderColor: HAIR,
                    color: FG,
                    fontFamily: MONO,
                  }}
                />
                <button
                  type="submit"
                  disabled={phase === 'submitting'}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity disabled:opacity-60"
                  style={{
                    background: GREEN,
                    color: '#000',
                    fontFamily: MONO,
                    boxShadow: `0 0 32px ${G_GLOW}`,
                  }}
                >
                  {phase === 'submitting' ? 'Joining…' : 'Join waitlist'}
                </button>
              </div>

              {result?.status === 'error' && (
                <p
                  role="alert"
                  className="text-left text-[12px]"
                  style={{ color: '#f87171', fontFamily: MONO }}
                >
                  {result.message}
                </p>
              )}
            </form>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <div
        className="relative z-10 mt-16 text-[10px] uppercase tracking-[0.24em]"
        style={{ color: DIM, fontFamily: MONO }}
      >
        © {new Date().getFullYear()} synth · Backed by Berkeley SkyDeck
      </div>
    </div>
  )
}

function ConfirmationCard({ already }: { already: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-3 border px-6 py-8"
      style={{ borderColor: HAIR, background: 'rgba(16,185,129,0.06)' }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ background: GREEN, color: '#000', boxShadow: `0 0 28px ${G_GLOW}` }}
        aria-hidden
      >
        {/* Checkmark */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <p
        className="text-[16px]"
        style={{ fontFamily: SERIF, fontWeight: 500, color: FG }}
      >
        {already ? "You're already on the list." : "You're on the list."}
      </p>
      <p className="text-[12px]" style={{ color: MUTED, fontFamily: MONO }}>
        We'll email you when early access opens.
      </p>
    </motion.div>
  )
}

/* Subtle hairline grid + radial vignette — a stripped-down echo of the
 * marketing hero background, kept inline so this page has zero dependency
 * on the full shell's positioned layers. */
function BackgroundTexture() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${FAINT} 1px, transparent 1px), linear-gradient(90deg, ${FAINT} 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 42%, #000 0%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 42%, #000 0%, transparent 78%)',
        }}
      />
      <div
        className="absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${G_GLOW} 0%, transparent 68%)`, filter: 'blur(40px)' }}
      />
    </div>
  )
}

export default WaitlistPage
