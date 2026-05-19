import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { THEME } from '../../lib/theme'
import { useInstallPrompt } from './useInstallPrompt'

/* ─── Palette ─────────────────────────────────────────────────────────── */

const BG     = '#000000'
const FG     = '#ffffff'
const DIM    = 'rgba(255,255,255,0.42)'
const FAINT  = 'rgba(255,255,255,0.16)'
const HAIR   = 'rgba(255,255,255,0.10)'
const NEON   = '#22ee99'
const RED    = '#ff3b30'
const MONO   = THEME.fontMono

/* ─── Top nav ─────────────────────────────────────────────────────────── */

function Nav({ onDownload, downloadLabel, installed }: {
  onDownload: () => void
  downloadLabel: string
  installed: boolean
}) {
  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 sm:px-10 py-5"
      style={{
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${HAIR}`,
      }}
    >
      <span className="text-[20px] font-semibold leading-none" style={{ fontFamily: MONO, color: FG }}>
        synth<span style={{ color: NEON }}>.</span>
      </span>
      <nav className="flex items-center gap-3 sm:gap-5 text-[11px]" style={{ fontFamily: MONO, color: DIM }}>
        <a href="#numbers" className="hidden sm:inline transition-colors hover:text-white">the numbers</a>
        <a href="#proof" className="hidden sm:inline transition-colors hover:text-white">the proof</a>
        <Link to="/login" className="transition-colors hover:text-white">sign in</Link>
        <button
          type="button"
          onClick={onDownload}
          disabled={installed}
          className="rounded-none px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] disabled:opacity-50"
          style={{
            background: NEON,
            color: '#000',
            fontFamily: MONO,
            boxShadow: `0 0 24px rgba(34,238,153,0.45)`,
          }}
        >
          {installed ? 'installed' : downloadLabel}
        </button>
      </nav>
    </header>
  )
}

/* ─── Hero — manifesto ────────────────────────────────────────────────── */

function ManifestoHero() {
  return (
    <section
      className="relative flex min-h-dvh flex-col justify-between overflow-hidden px-5 sm:px-10 pt-32 pb-12"
      style={{ background: BG, color: FG }}
    >
      {/* hairline grid in background */}
      <Hairlines />

      {/* tiny mono eyebrow — top-left */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>
          synth. / coach data, unified
        </div>
        <div className="hidden sm:block text-[10px] uppercase tracking-[0.3em] text-right" style={{ fontFamily: MONO, color: DIM }}>
          v 0.1 · beta<br />
          built for programs
        </div>
      </div>

      {/* manifesto type — broken across the grid */}
      <div className="relative z-10 mt-12 sm:mt-0">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="select-none font-semibold leading-[0.82] tracking-[-0.045em]"
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(56px, 14vw, 200px)',
          }}
        >
          <span className="block" style={{ color: FG }}>STITCHING</span>
          <span className="block pl-[8vw]" style={{ color: DIM }}>
            <span style={{ color: RED, textDecoration: 'line-through', textDecorationColor: RED }}>DATA</span>
          </span>
          <span className="block pl-[20vw]" style={{ color: FG }}>IS NOT</span>
          <span className="block">
            COACHING<span style={{ color: NEON }}>.</span>
          </span>
        </motion.h1>
      </div>

      {/* bottom row — one-liner + CTAs */}
      <div className="relative z-10 mt-16 sm:mt-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[480px] text-[13px] leading-snug" style={{ fontFamily: MONO, color: DIM }}>
          we built synth. so you never have to open another tab.<br />
          <span style={{ color: FG }}>5 sources. 1 surface. 0 rip-and-replace.</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/coach/dashboard"
            className="rounded-none px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{
              background: NEON,
              color: '#000',
              fontFamily: MONO,
              boxShadow: `0 0 30px rgba(34,238,153,0.5)`,
            }}
          >
            see what we mean →
          </Link>
          <a
            href="#numbers"
            className="rounded-none border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-white hover:text-black"
            style={{ borderColor: FAINT, color: FG, fontFamily: MONO }}
          >
            scroll ↓
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── Background — thin grid lines ────────────────────────────────────── */

function Hairlines() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* vertical lines */}
      {[20, 40, 60, 80].map(p => (
        <div key={`v-${p}`} className="absolute inset-y-0" style={{ left: `${p}%`, width: 1, background: HAIR }} />
      ))}
      {/* one accent line */}
      <div className="absolute inset-y-0" style={{ left: '60%', width: 1, background: 'rgba(34,238,153,0.12)' }} />
    </div>
  )
}

/* ─── Big numbers — three slabs ───────────────────────────────────────── */

type Slab = { from: string; to: string; label: string; tag: string }

const SLABS: Slab[] = [
  { tag: '01', from: '45 min', to: '5 min', label: 'weekly roster review' },
  { tag: '02', from: '5 tools', to: '1 surface', label: 'no rip-and-replace' },
  { tag: '03', from: 'after', to: '2 weeks before', label: 'you spot the injury' },
]

function NumbersSection() {
  return (
    <section id="numbers" className="relative" style={{ background: BG, color: FG }}>
      <SectionLabel>// the numbers</SectionLabel>
      {SLABS.map((s, i) => (
        <BigSlab key={s.tag} slab={s} index={i} />
      ))}
    </section>
  )
}

function BigSlab({ slab, index }: { slab: Slab; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const leftDrift = useTransform(scrollYProgress, [0, 1], [0, -200])
  const rightDrift = useTransform(scrollYProgress, [0, 1], [0, 200])
  const x = index % 2 === 0 ? leftDrift : rightDrift

  return (
    <div
      ref={ref}
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden border-t px-5 sm:px-10 py-20"
      style={{ borderColor: HAIR }}
    >
      <Hairlines />

      <div className="relative z-10 mx-auto w-full max-w-[1280px]">
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>
          <span>{slab.tag}</span>
          <span className="h-px flex-1" style={{ background: HAIR }} />
          <span>{slab.label}</span>
        </div>

        <motion.div
          style={{ x }}
          className="mt-8 sm:mt-12 flex flex-wrap items-baseline gap-x-6 sm:gap-x-10"
        >
          <span
            className="font-semibold leading-[0.85] tracking-[-0.045em]"
            style={{
              fontFamily: MONO,
              color: RED,
              fontSize: 'clamp(64px, 12vw, 180px)',
              textDecoration: 'line-through',
              textDecorationThickness: '6px',
              textDecorationColor: 'rgba(255,59,48,0.7)',
            }}
          >
            {slab.from}
          </span>
          <span
            className="font-semibold leading-[0.85] tracking-[-0.045em]"
            style={{
              fontFamily: MONO,
              color: DIM,
              fontSize: 'clamp(40px, 6vw, 80px)',
            }}
          >
            →
          </span>
          <span
            className="font-semibold leading-[0.85] tracking-[-0.045em]"
            style={{
              fontFamily: MONO,
              color: NEON,
              fontSize: 'clamp(64px, 16vw, 240px)',
              textShadow: `0 0 60px rgba(34,238,153,0.35)`,
            }}
          >
            {slab.to}
          </span>
        </motion.div>
      </div>
    </div>
  )
}

/* ─── Sources collapse — 5 → 1 ────────────────────────────────────────── */

const SOURCES = ['WHOOP', 'STRAVA', 'TEAMWORKS', 'SHEETS', 'VIDEO']

function SourcesSection() {
  return (
    <section className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32" style={{ background: BG, color: FG, borderColor: HAIR }}>
      <Hairlines />
      <SectionLabel>// every tool you already use</SectionLabel>

      <div className="relative z-10 mx-auto mt-16 w-full max-w-[1280px]">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
          {/* left — 5 sources stacked */}
          <div className="flex flex-col gap-3">
            {SOURCES.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center justify-between border px-5 py-4"
                style={{ borderColor: FAINT, fontFamily: MONO }}
              >
                <span className="text-[18px] sm:text-[22px] font-semibold tracking-tight" style={{ color: FG }}>
                  {s}
                </span>
                <span
                  className="inline-flex h-2 w-2 rounded-full"
                  style={{ background: NEON, boxShadow: `0 0 10px ${NEON}` }}
                />
              </motion.div>
            ))}
          </div>

          {/* middle — giant arrow */}
          <div className="flex items-center justify-center py-8 lg:py-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-[120px] sm:text-[180px] leading-none"
              style={{ fontFamily: MONO, color: NEON, textShadow: `0 0 40px rgba(34,238,153,0.5)` }}
            >
              →
            </motion.div>
          </div>

          {/* right — synth surface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.55 }}
            className="border p-8 sm:p-10"
            style={{
              borderColor: NEON,
              background: 'rgba(34,238,153,0.04)',
              boxShadow: `0 0 80px rgba(34,238,153,0.18), inset 0 0 60px rgba(34,238,153,0.05)`,
              fontFamily: MONO,
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: NEON }}>
              one surface
            </div>
            <div className="mt-3 text-[40px] sm:text-[64px] font-semibold leading-[0.9]" style={{ color: FG }}>
              synth<span style={{ color: NEON }}>.</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]" style={{ color: DIM }}>
              <div>· every athlete</div>
              <div>· every signal</div>
              <div>· every morning</div>
              <div>· no migration</div>
            </div>
          </motion.div>
        </div>

        {/* tagline below */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <div className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>
            keep what works. plug it in. walk away.
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Proof — Pacific Women's Rowing ──────────────────────────────────── */

function ProofSection() {
  return (
    <section
      id="proof"
      className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      <Hairlines />
      <SectionLabel>// real team, real numbers</SectionLabel>

      <div className="relative z-10 mx-auto mt-16 w-full max-w-[1280px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="font-semibold leading-[0.88] tracking-[-0.04em]"
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(40px, 7vw, 96px)',
          }}
        >
          PACIFIC WOMEN'S ROWING.
          <br />
          <span style={{ color: DIM }}>46 ATHLETES.</span>
          <br />
          <span>ONE SCREEN<span style={{ color: NEON }}>.</span></span>
        </motion.h2>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: '46', v: 'athletes synced' },
            { k: '5', v: 'sources connected' },
            { k: '2', v: 'flags caught early' },
            { k: '45→5', v: 'min review/week' },
          ].map(m => (
            <motion.div
              key={m.v}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45 }}
              className="border p-6"
              style={{ borderColor: FAINT, fontFamily: MONO }}
            >
              <div className="text-[44px] sm:text-[56px] font-semibold leading-none tracking-tight" style={{ color: NEON }}>
                {m.k}
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.22em]" style={{ color: DIM }}>
                {m.v}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-16 max-w-[820px] border-l-2 pl-6"
          style={{ borderColor: NEON }}
        >
          <p className="text-[20px] sm:text-[28px] leading-snug" style={{ fontFamily: MONO, color: FG }}>
            "synth. flagged Star's HRV drop a week before she would have.
            we pulled back load that tuesday — race weekend was still on."
          </p>
          <div className="mt-4 text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>
            — head coach · pacific women's rowing
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Big CTA slab ────────────────────────────────────────────────────── */

function BigCtaSection({ onDownload, downloadLabel, installed }: {
  onDownload: () => void
  downloadLabel: string
  installed: boolean
}) {
  return (
    <section
      className="relative flex min-h-dvh items-center overflow-hidden border-t px-5 sm:px-10 py-24"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      {/* gigantic green wash */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '120vw',
          height: '60vh',
          background: 'radial-gradient(ellipse, rgba(34,238,153,0.18) 0%, transparent 65%)',
        }}
      />
      <Hairlines />

      <div className="relative z-10 mx-auto w-full max-w-[1280px]">
        <motion.h2
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="font-semibold leading-[0.85] tracking-[-0.045em]"
          style={{ fontFamily: MONO, fontSize: 'clamp(64px, 14vw, 220px)' }}
        >
          TYPE LESS<span style={{ color: NEON }}>.</span>
          <br />
          <span style={{ color: NEON }}>KNOW MORE.</span>
        </motion.h2>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            to="/coach/dashboard"
            className="rounded-none px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.22em]"
            style={{
              background: NEON,
              color: '#000',
              fontFamily: MONO,
              boxShadow: `0 0 40px rgba(34,238,153,0.55)`,
            }}
          >
            open the demo →
          </Link>
          <button
            type="button"
            onClick={onDownload}
            disabled={installed}
            className="rounded-none border px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.22em] disabled:opacity-50 transition-colors hover:bg-white hover:text-black"
            style={{ borderColor: FAINT, color: FG, fontFamily: MONO }}
          >
            {installed ? 'installed' : downloadLabel}
          </button>
          <a
            href="#signup"
            className="text-[11px] uppercase tracking-[0.22em] underline-offset-4 hover:underline"
            style={{ fontFamily: MONO, color: DIM }}
          >
            or join the beta →
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── Cold FAQ — minimal mono cards ───────────────────────────────────── */

const FAQS = [
  { q: 'rip out my current tools?', a: 'no. synth. reads from what you already use.' },
  { q: 'do athletes install anything?', a: 'one tap PWA on their phone. no app store.' },
  { q: 'what sports?', a: 'rowing now. track, swim, basketball next.' },
  { q: 'where does the data live?', a: 'your tenant. athletes see only what you allow.' },
  { q: 'cost?', a: 'free for the first 3 programs in beta.' },
]

function ColdFaq() {
  return (
    <section className="relative border-t px-5 sm:px-10 py-20 sm:py-28" style={{ background: BG, color: FG, borderColor: HAIR }}>
      <SectionLabel>// fast answers</SectionLabel>

      <div className="relative z-10 mx-auto mt-12 grid w-full max-w-[1280px] gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: HAIR }}>
        {FAQS.map((f, i) => (
          <motion.div
            key={f.q}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="flex flex-col gap-3 p-6"
            style={{ background: BG, fontFamily: MONO }}
          >
            <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: NEON }}>
              q.0{i + 1}
            </div>
            <div className="text-[15px] leading-snug" style={{ color: FG }}>
              {f.q}
            </div>
            <div className="text-[13px] leading-relaxed" style={{ color: DIM }}>
              → {f.a}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ─── Signup — tight, mono ────────────────────────────────────────────── */

function SignupSection() {
  const [done, setDone] = useState(false)

  return (
    <section
      id="signup"
      className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      <Hairlines />

      <div className="relative z-10 mx-auto w-full max-w-[680px]">
        <div className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: NEON }}>
          // beta access
        </div>
        <h2
          className="mt-4 font-semibold leading-[0.9] tracking-[-0.04em]"
          style={{ fontFamily: MONO, fontSize: 'clamp(40px, 6vw, 80px)' }}
        >
          WALK INTO MONDAY<br />
          ALREADY KNOWING<span style={{ color: NEON }}>.</span>
        </h2>
        <div className="mt-5 text-[12px] uppercase tracking-[0.18em]" style={{ fontFamily: MONO, color: DIM }}>
          250+ coaches & athletes in. free for the first 3 programs.
        </div>

        {done ? (
          <div className="mt-10 border p-8" style={{ borderColor: NEON, background: 'rgba(34,238,153,0.04)' }}>
            <div className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: NEON }}>
              you're in.
            </div>
            <div className="mt-3 text-[18px]" style={{ fontFamily: MONO, color: FG }}>
              expect a note this week.
            </div>
          </div>
        ) : (
          <form
            onSubmit={e => { e.preventDefault(); setDone(true) }}
            className="mt-10 flex flex-col gap-3"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
              <MonoInput required type="text" placeholder="your name" />
              <MonoInput required type="email" placeholder="coach@school.edu" />
            </div>
            <MonoInput type="text" placeholder="school / org" />
            <button
              type="submit"
              className="mt-2 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.3em]"
              style={{
                background: NEON,
                color: '#000',
                fontFamily: MONO,
                boxShadow: `0 0 40px rgba(34,238,153,0.5)`,
              }}
            >
              get in →
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

function MonoInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="bg-transparent px-4 py-3.5 text-[14px] outline-none"
      style={{
        border: `1px solid ${FAINT}`,
        color: FG,
        fontFamily: MONO,
        caretColor: NEON,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = NEON; props.onFocus?.(e) }}
      onBlur={e => { e.currentTarget.style.borderColor = FAINT; props.onBlur?.(e) }}
    />
  )
}

/* ─── Section label — tiny mono row ───────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center gap-4 text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>
      <span>{children}</span>
      <span className="h-px flex-1" style={{ background: HAIR }} />
    </div>
  )
}

/* ─── Footer ──────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t px-5 sm:px-10 py-10" style={{ background: BG, borderColor: HAIR }}>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>
        <div className="flex items-center gap-3">
          <span style={{ color: FG }}>synth<span style={{ color: NEON }}>.</span></span>
          <span>every data signal. one platform.</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href="mailto:supportsynth@gmail.com" className="hover:text-white transition-colors">supportsynth@gmail.com</a>
          <Link to="/login" className="hover:text-white transition-colors">sign in</Link>
          <Link to="/signup" className="hover:text-white transition-colors">sign up</Link>
          <Link to="/app" className="hover:text-white transition-colors">app access →</Link>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export function LandingPage() {
  const { canInstall, installed, isIos, trigger } = useInstallPrompt()
  const [showIosTip, setShowIosTip] = useState(false)

  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'black')
    return () => document.body.removeAttribute('data-app-canvas')
  }, [])

  function handleDownload() {
    if (canInstall) { trigger(); return }
    if (isIos) { setShowIosTip(true); return }
    setShowIosTip(true)
  }

  const downloadLabel = installed ? 'installed' : 'install'

  return (
    <div className="flex min-h-dvh w-full flex-col" style={{ background: BG }}>
      <Nav onDownload={handleDownload} downloadLabel={downloadLabel} installed={installed} />

      <main className="flex flex-col">
        <ManifestoHero />
        <NumbersSection />
        <SourcesSection />
        <ProofSection />
        <BigCtaSection onDownload={handleDownload} downloadLabel={downloadLabel} installed={installed} />
        <ColdFaq />
        <SignupSection />
        <Footer />
      </main>

      <AnimatePresence>
        {showIosTip && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIosTip(false)}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />
            <motion.div
              className="relative w-full max-w-sm border p-6"
              style={{ background: BG, borderColor: NEON, fontFamily: MONO }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: NEON }}>
                install synth.
              </div>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: FG }}>
                tap <strong style={{ color: NEON }}>share</strong> then <strong style={{ color: NEON }}>add to home screen</strong> in safari.
              </p>
              <p className="mt-2 text-[11px]" style={{ color: DIM }}>
                works on iphone, ipad, mac.
              </p>
              <button
                type="button"
                onClick={() => setShowIosTip(false)}
                className="mt-5 w-full px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ background: NEON, color: '#000', fontFamily: MONO }}
              >
                got it →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
