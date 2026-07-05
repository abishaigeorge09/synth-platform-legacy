import { useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { joinWaitlist, type WaitlistResult } from '../../lib/waitlist'
import { KO } from './shell/primitives'
import { DotGridHover } from './shell/DotGridHover'
import { WordReveal } from './shell/WordReveal'
import {
  BG, FG, MUTED, DIM, HAIR, FAINT,
  GREEN, G_GLOW, MONO, BODY, SERIF,
} from './shell/tokens'

/**
 * One-page waitlist. Rendered as the *entire* public site when
 * VITE_WAITLIST_MODE=true (see src/app/routes.tsx). Deliberately
 * self-contained — no Nav / SideRail / Footer overlay from the full
 * marketing shell — so nothing links back into the site that's being
 * held behind the flag.
 *
 * Visuals reuse the shared marketing tokens + primitives (dark canvas,
 * Fraunces serif headline, green knockout, mono labels, the DotGridHover
 * cursor field, WordReveal cascade) so it reads as the same brand, plus
 * a bespoke "signal convergence" backdrop — faint streams flowing into a
 * single pulsing node — that literally draws the product thesis: every
 * data signal, one platform.
 */

type Phase = 'idle' | 'submitting' | 'done'

// Product-true source names — the marquee reinforces "every tool you
// already use" without needing logos (which the strict CSP would block).
const SOURCES = [
  'Strava', 'Garmin', 'Whoop', 'TrainingPeaks', 'Concept2',
  'Oura', 'Coros', 'Google Sheets', 'Apple Health', 'Polar',
]

export function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<WaitlistResult | null>(null)
  const [focused, setFocused] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (phase === 'submitting') return
    setPhase('submitting')
    const r = await joinWaitlist(email, { source: 'waitlist-hero' })
    setResult(r)
    setPhase(r.status === 'error' ? 'idle' : 'done')
  }

  const joined = phase === 'done' && result?.status !== 'error'

  return (
    <div
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-5 py-16 text-center"
      style={{ background: BG, color: FG, fontFamily: BODY }}
    >
      <SignalField />
      {/* Cursor-reactive dot lattice — the shell's signature hover canvas,
          tuned green so the cursor leaves an emerald wake. */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <DotGridHover
          spacing={30}
          dotRadius={1.1}
          hoverRadius={150}
          baseAlpha={0.05}
          hoverAlpha={0.5}
          baseColor="255, 255, 255"
          hoverColor="16, 185, 129"
        />
      </div>

      <div className="relative z-10 flex w-full max-w-[600px] flex-col items-center gap-8">
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

        {/* Serif headline — WordReveal cascade on line 1, custom knockout
            reveal on line 2 (WordReveal skips inline highlights). */}
        <h1
          className="tracking-[-0.02em]"
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: 'clamp(38px, 7vw, 76px)',
            lineHeight: 1.04,
          }}
        >
          <WordReveal
            text="Every data signal."
            viewport={false}
            delay={0.15}
            stagger={0.07}
            duration={0.7}
          />
          <motion.span
            className="mt-2 block"
            initial={{ opacity: 0, y: 14, clipPath: 'inset(0 100% 0 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.7, 0, 0.3, 1] }}
          >
            <KO>One platform.</KO>
          </motion.span>
        </h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="max-w-[440px] text-[15px] leading-relaxed"
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
          transition={{ duration: 0.6, delay: 0.82 }}
          className="w-full max-w-[460px]"
        >
          {joined ? (
            <ConfirmationCard already={result?.status === 'already'} />
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <div
                className="flex flex-col gap-3 sm:flex-row"
                style={{
                  filter: focused
                    ? `drop-shadow(0 0 24px ${G_GLOW})`
                    : 'none',
                  transition: 'filter 0.25s ease',
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="you@team.com"
                  autoComplete="email"
                  disabled={phase === 'submitting'}
                  className="flex-1 rounded-none border bg-transparent px-4 py-4 text-[14px] outline-none transition-colors"
                  style={{
                    borderColor: focused ? GREEN : HAIR,
                    color: FG,
                    fontFamily: MONO,
                  }}
                />
                <motion.button
                  type="submit"
                  disabled={phase === 'submitting'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative inline-flex items-center justify-center gap-2 overflow-hidden px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] disabled:opacity-70"
                  style={{
                    background: GREEN,
                    color: '#000',
                    fontFamily: MONO,
                    boxShadow: `0 0 32px ${G_GLOW}`,
                  }}
                >
                  {/* Sheen sweep */}
                  <motion.span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)',
                    }}
                    animate={{ x: ['-120%', '120%'] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      repeatDelay: 1.4,
                      ease: 'easeInOut',
                    }}
                  />
                  <span className="relative">
                    {phase === 'submitting' ? 'Joining…' : 'Join waitlist'}
                  </span>
                </motion.button>
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

        {/* Source ticker — "every tool you already use" */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="w-full max-w-[520px]"
        >
          <SourceTicker />
        </motion.div>
      </div>

      {/* Footer */}
      <div
        className="relative z-10 mt-14 text-[10px] uppercase tracking-[0.24em]"
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
      <motion.div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ background: GREEN, color: '#000', boxShadow: `0 0 28px ${G_GLOW}` }}
        aria-hidden
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 16 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </motion.div>
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

/* Infinite marquee of source names. Two copies back-to-back translated
 * -50% so the loop is seamless. Edges fade via a mask. */
function SourceTicker() {
  const reduce = useReducedMotion()
  const row = [...SOURCES, ...SOURCES]
  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        WebkitMaskImage:
          'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
      }}
    >
      <motion.div
        className="flex w-max gap-8 whitespace-nowrap"
        animate={reduce ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
      >
        {row.map((name, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: DIM, fontFamily: MONO }}
          >
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ background: GREEN, opacity: 0.6 }}
            />
            {name}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* "Signal convergence" backdrop — faint streams from the edges flow into
 * one pulsing central node. SVG in a 1000×1000 space, slice-scaled to
 * cover. Reduced-motion renders the static lines + node without the
 * traveling packets. */
function SignalField() {
  const reduce = useReducedMotion()
  const cx = 500
  const cy = 430
  const sources = [
    [60, 120], [940, 90], [120, 800], [880, 830],
    [500, 40], [30, 460], [970, 520], [640, 960],
    [250, 60], [760, 940],
  ]

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {/* Radial glow behind the node */}
      <div
        className="absolute left-1/2 top-[42%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${G_GLOW} 0%, transparent 66%)`,
          filter: 'blur(46px)',
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        {sources.map(([sx, sy], i) => (
          <g key={i}>
            <line
              x1={sx} y1={sy} x2={cx} y2={cy}
              stroke={GREEN}
              strokeWidth={0.6}
              strokeOpacity={0.1}
            />
            {!reduce && (
              <motion.circle
                r={2.6}
                fill={GREEN}
                initial={{ cx: sx, cy: sy, opacity: 0 }}
                animate={{
                  cx: [sx, cx],
                  cy: [sy, cy],
                  opacity: [0, 0.9, 0.9, 0],
                }}
                transition={{
                  duration: 3.2 + (i % 4) * 0.6,
                  repeat: Infinity,
                  delay: i * 0.45,
                  ease: 'linear',
                  times: [0, 0.1, 0.85, 1],
                }}
                style={{ filter: `drop-shadow(0 0 4px ${GREEN})` }}
              />
            )}
          </g>
        ))}
        {/* Central node */}
        <motion.circle
          cx={cx} cy={cy} r={5}
          fill={GREEN}
          animate={reduce ? undefined : { r: [4, 6, 4], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${GREEN})` }}
        />
      </svg>
    </div>
  )
}

export default WaitlistPage
