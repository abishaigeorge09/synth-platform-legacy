import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { THEME } from '../../lib/theme'
import { useInstallPrompt } from './useInstallPrompt'
import { Hero3D } from './Hero3D'
import { MockConnect, MockSynthesize, MockDashboard, MockAthleteView, MockAI } from './StepMockups'

/* ─── Dark-section constants ──────────────────────────────────────────── */

const BG        = '#000000'
const SURFACE   = '#0a0a0a'
const CARD      = '#0f0f10'
const BORDER    = 'rgba(255,255,255,0.07)'
const BORDER_HI = 'rgba(255,255,255,0.13)'
const T1        = '#ffffff'
const T2        = 'rgba(255,255,255,0.50)'
const T3        = 'rgba(255,255,255,0.25)'
const GREEN     = '#10B981'
const G_DIM     = 'rgba(16,185,129,0.10)'
const G_GLOW    = 'rgba(16,185,129,0.22)'
const FONT_MONO = THEME.fontMono
const FONT_SERIF = THEME.fontSerif

const SPORTS = ['Rowing', 'Track & Field', 'Swimming', 'Baseball / Softball', 'Basketball', 'Soccer', 'Other']

type Step = {
  num: string
  label: string
  desc: string
  url: string
  Mockup: React.ComponentType
}

const STEPS: Step[] = [
  {
    num: '01',
    label: 'Connect your sources',
    desc: 'Link Google Sheets, TeamWorks, Whoop, Strava, and Apple Health in 60 seconds. OAuth handshake — no rip-and-replace.',
    url: 'synthsports.com/coach/sources',
    Mockup: MockConnect,
  },
  {
    num: '02',
    label: 'synth. synthesizes',
    desc: 'Scheduled scans pull fresh data. The engine normalises athletes, computes training load, recovery readiness, and risk flags.',
    url: 'synthsports.com/coach/sources/data-view',
    Mockup: MockSynthesize,
  },
  {
    num: '03',
    label: 'Coach from one surface',
    desc: 'Every athlete, every signal in one dashboard. Sort by 2K, wellness, compliance. Build lineups with drag-and-drop.',
    url: 'synthsports.com/coach/dashboard',
    Mockup: MockDashboard,
  },
  {
    num: '04',
    label: 'Athletes see their view',
    desc: 'Athletes join via invite code. They see their schedule, stats, lineups, coach feedback — nothing else unless you share it.',
    url: 'synthsports.com/athlete/today',
    Mockup: MockAthleteView,
  },
  {
    num: '05',
    label: 'Ask synth. AI',
    desc: 'Team-wide or athlete-scoped. Every answer carries the exact source rows it drew from — full provenance, no black box.',
    url: 'synthsports.com/coach/ai',
    Mockup: MockAI,
  },
]

/* ─── Background decorations shared across dark sections ──────────────── */

/** Floating translucent green orbs for depth */
function Orbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Large top-left orb */}
      <div
        className="absolute"
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          top: -200,
          left: -180,
          background: 'radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)',
          filter: 'blur(2px)',
        }}
      />
      {/* Mid-right orb */}
      <div
        className="absolute"
        style={{
          width: 480,
          height: 480,
          borderRadius: '50%',
          top: '35%',
          right: -120,
          background: 'radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)',
        }}
      />
      {/* Bottom-center orb */}
      <div
        className="absolute"
        style={{
          width: 700,
          height: 300,
          borderRadius: '50%',
          bottom: -120,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

/** Dot-grid background pattern. `uid` must be unique per instance to avoid SVG ID collisions. */
function DotGrid({ uid }: { uid: string }) {
  const pid = `dg-pat-${uid}`
  const gid = `dg-grad-${uid}`
  const mid = `dg-mask-${uid}`
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={pid} width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.06)" />
        </pattern>
        <radialGradient id={gid} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={mid}>
          <rect width="100%" height="100%" fill={`url(#${gid})`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} mask={`url(#${mid})`} />
    </svg>
  )
}


/* ─── 3D browser-chrome mockup window ────────────────────────────────── */

function MockupWindow({ url, Mockup }: { url: string; Mockup: React.ComponentType }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx  = useMotionValue(0)
  const my  = useMotionValue(0)
  const sx  = useSpring(mx, { stiffness: 110, damping: 22, mass: 0.5 })
  const sy  = useSpring(my, { stiffness: 110, damping: 22, mass: 0.5 })
  const rotY = useTransform(sx, [-1, 1], [7, -7])
  const rotX = useTransform(sy, [-1, 1], [-4, 4])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set(((e.clientX - r.left) / r.width  - 0.5) * 2)
    my.set(((e.clientY - r.top)  / r.height - 0.5) * 2)
  }
  function onLeave() { mx.set(0); my.set(0) }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ perspective: '1200px' }}>
      {/* Green glow halo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: `0 0 80px 0 ${G_GLOW}`, borderRadius: 18, zIndex: 0 }}
      />
      <motion.div
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: 'preserve-3d',
          borderRadius: 14,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          border: `1px solid ${BORDER_HI}`,
          boxShadow: [
            '0 0 0 1px rgba(255,255,255,0.04)',
            '0 24px 60px rgba(0,0,0,0.88)',
            '0 60px 120px rgba(0,0,0,0.55)',
            `0 0 60px 0 ${G_DIM}`,
          ].join(', '),
        }}
      >
        {/* Browser chrome bar */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ background: '#0a0a0b', borderBottom: `1px solid ${BORDER}` }}
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#EF4444' }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#F59E0B' }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#22C55E' }} />
          <div
            className="ml-3 flex-1 rounded px-3 py-1 text-[11px] truncate"
            style={{ background: '#161618', color: T3, fontFamily: FONT_MONO }}
          >
            {url}
          </div>
        </div>

        {/* React mockup — fixed height so it doesn't collapse */}
        <div style={{ height: 440, overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={url}
              className="h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Mockup />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── How it works section ────────────────────────────────────────────── */

function HowItWorksSection() {
  const [active, setActive] = useState(0)

  return (
    <section
      id="how"
      className="relative overflow-hidden px-5 sm:px-10 py-20 sm:py-28"
      style={{ background: BG }}
    >
      <DotGrid uid="how" />
      <Orbs />

      <div className="relative z-10 mx-auto w-full max-w-[1160px] grid gap-12 lg:grid-cols-12 lg:items-start">

        {/* LEFT — steps */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            {/* Section chip */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ border: `1px solid rgba(16,185,129,0.3)`, background: G_DIM, color: GREEN, fontFamily: FONT_MONO }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
              How it works
            </div>

            <h2
              className="text-[clamp(28px,3.8vw,44px)] font-semibold leading-[1.05] text-white"
              style={{ fontFamily: FONT_SERIF }}
            >
              Built to handle your entire program.
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed max-w-[400px]" style={{ color: T2 }}>
              Five steps, under five minutes. Click each step to preview it live.
            </p>
          </motion.div>

          {/* Accordion steps */}
          <div className="mt-10">
            {STEPS.map((step, i) => {
              const isActive = active === i
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  {/* Top rule */}
                  <div
                    className="h-px w-full transition-colors duration-300"
                    style={{ background: isActive ? GREEN : BORDER_HI }}
                  />

                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-4 py-4">
                      {/* Number badge */}
                      <div
                        className="shrink-0 mt-0.5 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                        style={{
                          fontFamily: FONT_MONO,
                          background: isActive ? GREEN : 'transparent',
                          color: isActive ? '#050505' : T3,
                          border: `1px solid ${isActive ? GREEN : BORDER_HI}`,
                        }}
                      >
                        {i + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[15px] font-semibold leading-snug transition-colors duration-200"
                          style={{ color: isActive ? T1 : T2 }}
                        >
                          {step.label}
                        </div>

                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                              className="overflow-hidden"
                            >
                              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: T2 }}>
                                {step.desc}
                              </p>
                              <Link
                                to={`/${step.url.replace('synthsports.com/', '')}`}
                                className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
                                style={{ fontFamily: FONT_MONO, color: GREEN }}
                              >
                                <span
                                  className="h-1 w-1 rounded-full"
                                  style={{ background: GREEN }}
                                />
                                Open in demo →
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </button>
                </motion.div>
              )
            })}
            {/* Final rule */}
            <div className="h-px w-full" style={{ background: BORDER_HI }} />
          </div>
        </div>

        {/* RIGHT — sticky 3D mockup window */}
        <div className="relative lg:col-span-7 lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <MockupWindow url={STEPS[active].url} Mockup={STEPS[active].Mockup} />
          </motion.div>

          {/* Step dots */}
          <div className="mt-5 flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: active === i ? 22 : 7,
                  height: 7,
                  background: active === i ? GREEN : BORDER_HI,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Signup section ──────────────────────────────────────────────────── */

function SignupSection() {
  const [role, setRole] = useState<'Coach' | 'Athlete' | 'AD' | null>(null)
  const [done, setDone] = useState(false)

  return (
    <section
      id="signup"
      className="relative overflow-hidden px-5 sm:px-10 py-24 sm:py-32"
      style={{ background: BG }}
    >
      <DotGrid uid="signup" />
      <Orbs />

      {/* Central green bloom */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 800,
          height: 400,
          background: `radial-gradient(ellipse, rgba(16,185,129,0.10) 0%, transparent 70%)`,
          borderRadius: '50%',
        }}
      />

      {/* No hard divider — flows from the how-it-works section */}

      <div className="relative z-10 mx-auto max-w-[620px]">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ border: `1px solid rgba(16,185,129,0.3)`, background: G_DIM, color: GREEN, fontFamily: FONT_MONO }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
            Early access
          </div>

          <h2
            className="text-[clamp(34px,5vw,56px)] font-semibold leading-[1.03] text-white"
            style={{ fontFamily: FONT_SERIF }}
          >
            Join the Beta.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: T2 }}>
            250+ coaches and athletes already signed up. Free for the first 3 programs — no credit card required.
          </p>
        </motion.div>

        {/* Form / success */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          {done ? (
            <div
              className="mt-10 rounded-2xl border p-10 text-center"
              style={{ background: CARD, borderColor: BORDER_HI }}
            >
              {/* Green check ring */}
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: G_DIM, border: `1px solid rgba(16,185,129,0.3)` }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div className="text-[22px] font-bold text-white mb-2" style={{ fontFamily: FONT_SERIF }}>
                You're on the list.
              </div>
              <div className="text-[14px]" style={{ color: T2 }}>
                We'll reach out with early access details within a week.
              </div>
            </div>
          ) : (
            <form
              className="mt-10 rounded-2xl border p-6 sm:p-8 flex flex-col gap-5"
              style={{
                background: CARD,
                borderColor: BORDER_HI,
                boxShadow: `0 0 0 1px ${BORDER}, 0 40px 80px rgba(0,0,0,0.6), 0 0 60px ${G_DIM}`,
              }}
              onSubmit={(e) => { e.preventDefault(); setDone(true) }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Name', placeholder: 'Alex Martinez', type: 'text', req: true, span: false },
                  { label: 'Email', placeholder: 'coach@university.edu', type: 'email', req: true, span: false },
                  { label: 'School / Org', placeholder: 'UC Berkeley Athletics', type: 'text', req: false, span: true },
                ].map(f => (
                  <label
                    key={f.label}
                    className={`flex flex-col gap-1.5 ${f.span ? 'sm:col-span-2' : ''}`}
                  >
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{ fontFamily: FONT_MONO, color: T3 }}
                    >
                      {f.label}
                    </span>
                    <input
                      type={f.type}
                      required={f.req}
                      placeholder={f.placeholder}
                      className="rounded-xl px-3.5 py-2.5 text-[14px] text-white outline-none transition-all"
                      style={{
                        background: SURFACE,
                        border: `1px solid ${BORDER_HI}`,
                        fontFamily: FONT_MONO,
                        caretColor: GREEN,
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = GREEN)}
                      onBlur={e => (e.currentTarget.style.borderColor = BORDER_HI)}
                    />
                  </label>
                ))}

                <label className="flex flex-col gap-1.5">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ fontFamily: FONT_MONO, color: T3 }}
                  >
                    Sport
                  </span>
                  <select
                    className="rounded-xl px-3.5 py-2.5 text-[14px] text-white outline-none"
                    style={{ background: SURFACE, border: `1px solid ${BORDER_HI}`, fontFamily: FONT_MONO }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select sport</option>
                    {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>

              {/* Role pills */}
              <div>
                <div
                  className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: FONT_MONO, color: T3 }}
                >
                  I am a
                </div>
                <div className="flex gap-2">
                  {(['Coach', 'Athlete', 'AD'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-wider transition-all duration-200"
                      style={{
                        fontFamily: FONT_MONO,
                        border: `1px solid ${role === r ? GREEN : BORDER_HI}`,
                        background: role === r ? G_DIM : 'transparent',
                        color: role === r ? GREEN : T2,
                        boxShadow: role === r ? `0 0 12px ${G_DIM}` : 'none',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-full py-3.5 text-[13px] font-semibold uppercase tracking-wider transition-all hover:scale-[1.01]"
                style={{
                  background: GREEN,
                  color: '#050505',
                  fontFamily: FONT_MONO,
                  boxShadow: `0 0 40px ${G_GLOW}, 0 4px 20px rgba(0,0,0,0.4)`,
                }}
              >
                Join →
              </button>

              <div className="text-center text-[11px]" style={{ fontFamily: FONT_MONO, color: T3 }}>
                Already have access?{' '}
                <Link to="/login" className="transition-colors hover:text-white" style={{ color: T2 }}>
                  Sign in →
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Footer ──────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer
      className="relative px-5 sm:px-10 py-8"
      style={{ background: '#000000', borderTop: 'none' }}
    >
      <div className="mx-auto max-w-[1160px] flex flex-col sm:flex-row items-center justify-between gap-5 text-[11px]" style={{ fontFamily: FONT_MONO, color: T3 }}>
        <div className="flex items-center gap-3">
          <span className="text-[17px] font-semibold" style={{ fontFamily: FONT_MONO, color: T1 }}>
            synth<span style={{ color: GREEN }}>.</span>
          </span>
          <span>Every data signal. One platform.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <a href="mailto:supportsynth@gmail.com" className="hover:text-white transition-colors">
            supportsynth@gmail.com
          </a>
          <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
          <Link to="/signup" className="hover:text-white transition-colors">Sign up</Link>
          <Link to="/join/demo" className="hover:text-white transition-colors">Join as athlete</Link>
          <span>© 2026 synth.</span>
        </div>
      </div>
    </footer>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export function LandingPage() {
  const { canInstall, installed, isIos, trigger } = useInstallPrompt()
  const [showIosTip, setShowIosTip] = useState(false)

  function handleDownload() {
    if (canInstall) { trigger(); return }
    if (isIos) { setShowIosTip(true); return }
    setShowIosTip(true)
  }

  return (
    <div className="flex min-h-dvh w-full flex-col" style={{ background: '#000000' }}>

      {/* ── Floating nav (over the green hero) ── */}
      <header
        className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 sm:px-10 py-5"
        style={{ color: THEME.white }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[22px] font-semibold leading-none"
            style={{ fontFamily: THEME.fontMono, color: THEME.white }}
          >
            synth<span style={{ color: THEME.accent }}>.</span>
          </span>
        </div>

        {/* Desktop nav links */}
        <nav
          className="hidden sm:flex items-center gap-6 text-[12px]"
          style={{ fontFamily: THEME.fontMono, color: 'rgba(255,255,255,0.82)' }}
        >
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#signup" className="hover:text-white transition-colors">Beta</a>
          <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
          <Link
            to="/signup"
            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: THEME.white,
              fontFamily: THEME.fontMono,
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(4px)',
            }}
          >
            Sign up
          </Link>
          <button
            type="button"
            onClick={handleDownload}
            disabled={installed}
            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02] disabled:opacity-60"
            style={{
              background: THEME.white,
              color: THEME.primaryDarker,
              fontFamily: THEME.fontMono,
              boxShadow: '0 12px 28px -14px rgba(4,120,87,0.6)',
            }}
          >
            {installed ? 'Installed' : 'Download'}
          </button>
        </nav>

        {/* Mobile: sign-in + download */}
        <div className="flex sm:hidden items-center gap-3">
          <Link
            to="/login"
            className="text-[12px] hover:text-white transition-colors"
            style={{ fontFamily: THEME.fontMono, color: 'rgba(255,255,255,0.85)' }}
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={handleDownload}
            disabled={installed}
            className="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider disabled:opacity-60"
            style={{ background: THEME.white, color: THEME.primaryDarker, fontFamily: THEME.fontMono }}
          >
            {installed ? 'Installed' : 'Download'}
          </button>
        </div>
      </header>

      <main className="flex flex-col">
        {/* ── Hero — fully green, no dark overlay ── */}
        <Hero3D onDownload={handleDownload} downloadLabel={installed ? 'Installed' : 'Download app'} />

        {/* ── How it works + live demo ── */}
        <HowItWorksSection />

        {/* ── Signup / Beta ── */}
        <SignupSection />

        {/* ── Footer ── */}
        <Footer />
      </main>

      {/* ── iOS install modal ── */}
      <AnimatePresence>
        {showIosTip && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIosTip(false)}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              className="relative w-full max-w-sm rounded-2xl border p-6"
              style={{ background: CARD, borderColor: BORDER_HI }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ fontFamily: THEME.fontMono, color: GREEN }}
              >
                Install synth.
              </div>
              <p className="text-[14px] leading-relaxed text-white mb-1">
                Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong> in Safari to install synth. as an app.
              </p>
              <p className="text-[12px]" style={{ color: T2 }}>Works on iPhone, iPad, and Mac.</p>
              <button
                type="button"
                onClick={() => setShowIosTip(false)}
                className="mt-5 w-full rounded-full py-2.5 text-[12px] font-semibold uppercase tracking-wider"
                style={{ background: GREEN, color: '#050505', fontFamily: THEME.fontMono }}
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
