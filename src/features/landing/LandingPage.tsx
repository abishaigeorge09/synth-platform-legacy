import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useInstallPrompt } from './useInstallPrompt'

/* ─── Palette + type tokens ───────────────────────────────────────────── */

const BG       = '#050505'
const ELEVATED = '#0f0f10'
const FG       = '#fafafa'
const MUTED    = '#a1a1aa'
const DIM      = '#71717a'
const HAIR     = '#27272a'
const FAINT    = 'rgba(255,255,255,0.07)'
const GREEN    = '#10B981'
const GREEN_2  = '#059669'
const G_GLOW   = 'rgba(16,185,129,0.22)'
const G_DIM    = 'rgba(16,185,129,0.08)'

const DRUK = '"Anton", "Bebas Neue", "Impact", sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'
const BODY = '"Geist", "Inter", system-ui, -apple-system, sans-serif'

/* ─── Re-usable primitives ────────────────────────────────────────────── */

/** Knockout-box highlight on a key noun. The Kitman move — adapted to green. */
function KO({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: GREEN,
        color: '#000',
        padding: '0 0.16em',
        marginRight: '0.04em',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      }}
    >
      {children}
    </span>
  )
}

/** Thin top-and-bottom hairlines with a faint center axis. Background texture. */
function Hairlines() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {[20, 40, 60, 80].map(p => (
        <div key={`v-${p}`} className="absolute inset-y-0" style={{ left: `${p}%`, width: 1, background: FAINT }} />
      ))}
      <div className="absolute inset-y-0" style={{ left: '60%', width: 1, background: G_DIM }} />
    </div>
  )
}

/** Scattered "+" crosshair decorations — small, green-tinted. */
function Crosshairs({ count = 5, opacity = 0.5 }: { count?: number; opacity?: number }) {
  const positions = [
    { top: '8%',  left: '6%'  }, { top: '12%', left: '88%' },
    { top: '42%', left: '4%'  }, { top: '78%', left: '93%' },
    { top: '88%', left: '12%' }, { top: '22%', left: '50%' },
    { top: '65%', left: '70%' }, { top: '34%', left: '30%' },
  ].slice(0, count)
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden style={{ opacity }}>
      {positions.map((p, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" className="absolute" style={{ ...p, color: GREEN }}>
          <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}
    </div>
  )
}

/** Mono section eyebrow — "// some label". */
function SectionLabel({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'center' }) {
  return (
    <div
      className={`relative z-10 mx-auto flex w-full max-w-[1280px] items-center gap-4 text-[10px] uppercase tracking-[0.3em] ${align === 'center' ? 'justify-center' : ''}`}
      style={{ fontFamily: MONO, color: DIM }}
    >
      {align === 'center' && <span className="h-px w-12" style={{ background: HAIR }} />}
      <span>{children}</span>
      <span className="h-px flex-1" style={{ background: HAIR }} />
    </div>
  )
}

/** Chevron CTA — Kitman's tertiary mechanic, recolored green. */
function Chevron({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity hover:opacity-80"
      style={{ fontFamily: MONO, color: GREEN }}
    >
      {children} <span aria-hidden>›</span>
    </Link>
  )
}

/* ─── Top nav ─────────────────────────────────────────────────────────── */

function Nav({ onStart, ctaLabel }: { onStart: () => void; ctaLabel: string }) {
  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 sm:px-10 py-4"
      style={{
        background: 'rgba(5,5,5,0.7)',
        backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${HAIR}`,
      }}
    >
      <Link to="/" className="text-[20px] font-semibold leading-none" style={{ fontFamily: MONO, color: FG }}>
        synth<span style={{ color: GREEN }}>.</span>
      </Link>
      <nav className="flex items-center gap-3 sm:gap-6 text-[11px]" style={{ fontFamily: MONO, color: MUTED }}>
        <a href="#pillars" className="hidden sm:inline transition-colors hover:text-white">product</a>
        <a href="#teams" className="hidden sm:inline transition-colors hover:text-white">for teams</a>
        <a href="#pricing" className="hidden sm:inline transition-colors hover:text-white">pricing</a>
        <Link to="/login" className="transition-colors hover:text-white">sign in</Link>
        <button
          type="button"
          onClick={onStart}
          className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{
            background: GREEN,
            color: '#000',
            fontFamily: MONO,
            boxShadow: `0 0 24px ${G_GLOW}`,
          }}
        >
          {ctaLabel}
        </button>
      </nav>
    </header>
  )
}

/* ─── Hero — cinematic, full-bleed ────────────────────────────────────── */

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section
      className="relative flex min-h-dvh flex-col justify-between overflow-hidden px-5 sm:px-10 pt-32 pb-12"
      style={{ background: BG, color: FG }}
    >
      {/* Cinematic background — black with a slow radial sweep + grain.
          This is the video slot; replace this div with a <video> tag once
          amateur-athlete footage exists. The motion below keeps the slot
          alive even with no asset. */}
      <CinematicBackdrop />
      <Crosshairs count={6} opacity={0.6} />

      {/* Top eyebrow row */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>
          // synth — for athletes who train serious
        </div>
        <div className="hidden sm:block text-right text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>
          v 0.1 · alpha<br />
          built for athletes
        </div>
      </div>

      {/* Hero headline */}
      <div className="relative z-10 mt-12 sm:mt-0">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="select-none leading-[0.84] tracking-[-0.02em]"
          style={{
            fontFamily: DRUK,
            fontSize: 'clamp(64px, 13vw, 200px)',
            color: FG,
            textTransform: 'uppercase',
          }}
        >
          <span className="block">Every signal.</span>
          <span className="block"><KO>One screen.</KO></span>
        </motion.h1>
      </div>

      {/* Bottom row — subhead + CTAs */}
      <div className="relative z-10 mt-12 sm:mt-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[560px]" style={{ fontFamily: BODY }}>
          <p className="text-[15px] sm:text-[17px] leading-snug" style={{ color: FG }}>
            Your training, your sleep, your plan — synthesized every morning.
            One screen tells you what's working, what's slipping, and what to do next.
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: DIM }}>
            no spreadsheet stitching. no second app to install on your wrist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onStart}
            className="px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{
              background: GREEN,
              color: '#000',
              fontFamily: MONO,
              boxShadow: `0 0 36px ${G_GLOW}`,
            }}
          >
            start free →
          </button>
          <Link
            to="/coach/dashboard"
            className="border px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-white hover:text-black"
            style={{ borderColor: FAINT, color: FG, fontFamily: MONO }}
          >
            watch demo ▶
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="relative z-10 mt-12 sm:mt-16 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>
        <span>scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="h-3 w-px"
          style={{ background: FG }}
        />
      </div>
    </section>
  )
}

/** Cinematic backdrop — slow radial gradient sweep + film grain.
 *  Stands in for athlete-training footage until real video lands. */
function CinematicBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Slow drifting green halo */}
      <motion.div
        className="absolute"
        style={{
          width: '70vw',
          height: '70vw',
          maxWidth: 1100,
          maxHeight: 1100,
          background: `radial-gradient(circle, ${G_GLOW} 0%, transparent 65%)`,
          filter: 'blur(20px)',
        }}
        animate={{ x: ['-20%', '10%', '-20%'], y: ['-10%', '15%', '-10%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Hairline grid */}
      <Hairlines />
      {/* Bottom-up vignette */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, transparent 30%, ${BG} 95%)` }}
      />
    </div>
  )
}

/* ─── Trust strip ─────────────────────────────────────────────────────── */

function TrustStrip() {
  return (
    <section
      className="relative overflow-hidden border-t border-b px-5 sm:px-10 py-5"
      style={{ background: BG, borderColor: HAIR }}
    >
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: MUTED }}>
        <span><span style={{ color: GREEN }}>●</span> built by world championship rowers</span>
        <span className="hidden sm:inline" style={{ color: HAIR }}>·</span>
        <span><span style={{ color: GREEN }}>●</span> backed by berkeley skydeck</span>
        <span className="hidden sm:inline" style={{ color: HAIR }}>·</span>
        <span><span style={{ color: GREEN }}>●</span> 250+ athletes on the alpha</span>
      </div>
    </section>
  )
}

/* ─── Manifesto block with knockout highlights ───────────────────────── */

function Manifesto() {
  return (
    <section
      className="relative overflow-hidden px-5 sm:px-10 py-28 sm:py-40"
      style={{ background: BG, color: FG }}
    >
      <Hairlines />
      <Crosshairs count={4} opacity={0.4} />

      <SectionLabel align="center">// the problem</SectionLabel>

      <div className="relative z-10 mx-auto mt-12 max-w-[1100px] text-center">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="leading-[0.95] tracking-[-0.01em]"
          style={{
            fontFamily: DRUK,
            fontSize: 'clamp(36px, 6.4vw, 96px)',
            textTransform: 'uppercase',
          }}
        >
          Your training lives in <KO>Strava</KO>.<br />
          Your sleep lives in <KO>Apple Health</KO>.<br />
          Your plan lives in <KO>a notes app</KO>.<br />
          Nothing sees <KO>the whole picture</KO>.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 text-[12px] uppercase tracking-[0.3em]"
          style={{ fontFamily: MONO, color: DIM }}
        >
          until synth ↓
        </motion.p>
      </div>
    </section>
  )
}

/* ─── Three billboard pillars: CONNECT · SYNTHESIZE · ACT ────────────── */

type Pillar = {
  num: string
  word: string
  sub: string
  body: string
  detail: string[]
  cta: { label: string; to: string }
}

const PILLARS: Pillar[] = [
  {
    num: '01',
    word: 'Connect',
    sub: 'Every tool you already use',
    body: 'Whoop, Strava, Oura, Garmin, Apple Health, your coach\'s spreadsheet, your training plan. If it has an API, synth connects. If it doesn\'t, our AI Import reads photos, voice notes, and pasted text.',
    detail: ['16+ direct integrations live', 'AI Import — any photo, voice, or text', 'OAuth or one paste, never a migration'],
    cta: { label: 'see every connector', to: '/coach/sources' },
  },
  {
    num: '02',
    word: 'Synthesize',
    sub: 'While you sleep',
    body: 'Every morning, synth normalizes your signals, computes training load and recovery readiness, and writes the pattern back to whatever tool you live in. You wake up to one screen — not five.',
    detail: ['Training load · recovery readiness · trend', 'Patterns you can\'t see yourself', 'Two-way sync — keep your tools, keep your workflow'],
    cta: { label: 'see the dashboard', to: '/coach/dashboard' },
  },
  {
    num: '03',
    word: 'Act',
    sub: 'Ask anything. know now',
    body: 'Ask "am I overtrained?" Ask "what was my best week last quarter?" Get a sourced answer in seconds — every claim cites the row it came from. No black box. No hallucination.',
    detail: ['Athlete-scoped or team-wide', 'Sourced answers with row-level citations', 'No generic AI — just your data, read carefully'],
    cta: { label: 'try the demo', to: '/coach/ai' },
  },
]

function PillarsSection() {
  return (
    <section id="pillars" className="relative" style={{ background: BG, color: FG }}>
      <SectionLabel>// what synth does</SectionLabel>
      {PILLARS.map((p, i) => (
        <BillboardPillar key={p.word} pillar={p} flip={i % 2 === 1} />
      ))}
    </section>
  )
}

function BillboardPillar({ pillar, flip }: { pillar: Pillar; flip: boolean }) {
  return (
    <div
      className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32"
      style={{ borderColor: HAIR }}
    >
      <Hairlines />
      <Crosshairs count={3} opacity={0.5} />

      <div className={`relative z-10 mx-auto grid w-full max-w-[1280px] gap-12 lg:grid-cols-2 lg:items-center ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        {/* Left — type column */}
        <div>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: GREEN }}>
            <span>// pillar {pillar.num}</span>
            <span className="h-px w-12" style={{ background: GREEN_2 }} />
          </div>

          <motion.h3
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55 }}
            className="mt-5 leading-[0.85] tracking-[-0.02em]"
            style={{
              fontFamily: DRUK,
              fontSize: 'clamp(72px, 12vw, 180px)',
              textTransform: 'uppercase',
            }}
          >
            {pillar.word}<span style={{ color: GREEN }}>.</span>
          </motion.h3>

          <div className="mt-6 text-[12px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: MUTED }}>
            {pillar.sub}
          </div>

          <p className="mt-6 max-w-[460px] text-[16px] leading-relaxed" style={{ fontFamily: BODY, color: FG }}>
            {pillar.body}
          </p>

          <ul className="mt-6 space-y-2" style={{ fontFamily: MONO }}>
            {pillar.detail.map(d => (
              <li key={d} className="flex items-start gap-3 text-[12px]" style={{ color: MUTED }}>
                <span className="mt-2 inline-block h-px w-3 shrink-0" style={{ background: GREEN }} />
                <span>{d}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <Chevron to={pillar.cta.to}>{pillar.cta.label}</Chevron>
          </div>
        </div>

        {/* Right — paired visual placeholder */}
        <PillarVisual pillar={pillar} />
      </div>
    </div>
  )
}

function PillarVisual({ pillar }: { pillar: Pillar }) {
  // Stylized product-screenshot stand-in. Each pillar gets a different motif.
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative aspect-[5/4] w-full overflow-hidden"
      style={{
        background: ELEVATED,
        border: `1px solid ${HAIR}`,
        boxShadow: `0 40px 80px rgba(0,0,0,0.55), inset 0 0 100px ${G_DIM}`,
      }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: HAIR }}>
        <span className="h-2 w-2 rounded-full" style={{ background: '#EF4444' }} />
        <span className="h-2 w-2 rounded-full" style={{ background: '#F59E0B' }} />
        <span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />
        <span className="ml-3 text-[10px]" style={{ fontFamily: MONO, color: DIM }}>
          synth.app/{pillar.word.toLowerCase()}
        </span>
      </div>

      {/* Visual content per pillar */}
      <div className="relative h-full p-6">
        {pillar.num === '01' && <ConnectMotif />}
        {pillar.num === '02' && <SynthesizeMotif />}
        {pillar.num === '03' && <ActMotif />}
      </div>
    </motion.div>
  )
}

function ConnectMotif() {
  const SOURCES = ['Whoop', 'Strava', 'Oura', 'Garmin', 'Apple Health', 'Google Sheets']
  return (
    <div className="grid h-full grid-cols-3 gap-2" style={{ fontFamily: MONO }}>
      {SOURCES.map(s => (
        <div
          key={s}
          className="flex flex-col justify-between border p-3"
          style={{ borderColor: FAINT, background: BG }}
        >
          <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
            {s}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
            <span className="text-[10px]" style={{ color: GREEN }}>synced</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SynthesizeMotif() {
  return (
    <div className="flex h-full flex-col gap-4" style={{ fontFamily: MONO }}>
      <div className="grid grid-cols-3 gap-2">
        {[
          { k: 'load', v: '7.2', sub: 'moderate' },
          { k: 'recovery', v: '84', sub: 'ready' },
          { k: 'trend', v: '↑12%', sub: '7-day' },
        ].map(m => (
          <div key={m.k} className="border p-3" style={{ borderColor: FAINT, background: BG }}>
            <div className="text-[9px] uppercase tracking-[0.25em]" style={{ color: DIM }}>{m.k}</div>
            <div className="mt-1 text-[24px] font-bold leading-none" style={{ color: GREEN, fontFamily: DRUK }}>{m.v}</div>
            <div className="mt-1 text-[10px]" style={{ color: MUTED }}>{m.sub}</div>
          </div>
        ))}
      </div>
      {/* Sparkline */}
      <div className="relative h-20 border p-3" style={{ borderColor: FAINT, background: BG }}>
        <div className="text-[9px] uppercase tracking-[0.25em]" style={{ color: DIM }}>14-day load</div>
        <svg viewBox="0 0 200 40" className="mt-1 h-12 w-full">
          <polyline
            fill="none"
            stroke={GREEN}
            strokeWidth="1.5"
            points="0,30 15,28 30,24 45,26 60,20 75,22 90,18 105,14 120,16 135,12 150,10 165,14 180,8 200,6"
          />
        </svg>
      </div>
    </div>
  )
}

function ActMotif() {
  return (
    <div className="flex h-full flex-col gap-2" style={{ fontFamily: MONO }}>
      <div className="border p-3" style={{ borderColor: FAINT, background: BG }}>
        <div className="text-[9px] uppercase tracking-[0.25em]" style={{ color: DIM }}>you</div>
        <div className="mt-1 text-[12px]" style={{ color: FG }}>am I overtrained this week?</div>
      </div>
      <div className="border p-3" style={{ borderColor: GREEN, background: G_DIM }}>
        <div className="text-[9px] uppercase tracking-[0.25em]" style={{ color: GREEN }}>synth</div>
        <div className="mt-1 text-[12px] leading-snug" style={{ color: FG }}>
          slightly. load is up 18% week-over-week and HRV is down 8%.
          back off intensity for two days.
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[9px]" style={{ color: MUTED }}>
          <span className="px-1.5 py-0.5" style={{ background: BG, border: `1px solid ${HAIR}` }}>whoop · hrv</span>
          <span className="px-1.5 py-0.5" style={{ background: BG, border: `1px solid ${HAIR}` }}>strava · load</span>
          <span className="px-1.5 py-0.5" style={{ background: BG, border: `1px solid ${HAIR}` }}>oura · sleep</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Tool wall ───────────────────────────────────────────────────────── */

const TOOLS = [
  'Whoop', 'Strava', 'Oura', 'Garmin', 'Apple Health', 'Google Health',
  'Polar', 'Coros', 'TrainingPeaks', 'Concept2', 'Zwift', 'Peloton',
  'TeamWorks', 'Hudl', 'Google Sheets', 'Notion',
]

function ToolWall() {
  return (
    <section
      className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      <Hairlines />
      <Crosshairs count={4} opacity={0.4} />
      <SectionLabel>// the ecosystem</SectionLabel>

      <div className="relative z-10 mx-auto mt-12 w-full max-w-[1280px]">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
          className="leading-[0.9] tracking-[-0.015em]"
          style={{
            fontFamily: DRUK,
            fontSize: 'clamp(48px, 8vw, 128px)',
            textTransform: 'uppercase',
          }}
        >
          Connect <KO>anything</KO>.
        </motion.h2>

        <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: MUTED }}>
          Every tool you already use. And if it doesn't have an API,
          our AI Import reads photos, voice notes, and pasted text.
        </p>

        {/* 4×4 grid */}
        <div className="mt-12 grid gap-px sm:grid-cols-3 lg:grid-cols-4" style={{ background: HAIR }}>
          {TOOLS.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="flex items-center justify-between px-5 py-6"
              style={{ background: BG, fontFamily: MONO }}
            >
              <span className="text-[15px] uppercase tracking-[0.02em]" style={{ color: FG }}>{t}</span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
            </motion.div>
          ))}
        </div>

        {/* AI Import closer */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex flex-col gap-4 border p-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: GREEN, background: G_DIM }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: GREEN }}>
              // ai import
            </div>
            <div className="mt-2 text-[16px] leading-snug" style={{ fontFamily: BODY, color: FG }}>
              If it has an API, we connect to it. If it doesn't,
              <span style={{ color: GREEN }}> our AI Import still reads it.</span>
            </div>
          </div>
          <Chevron to="/coach/sources">how AI Import works</Chevron>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Built by champions — team credibility ──────────────────────────── */

type Member = { name: string; role: string; cred: string[] }

const TEAM: Member[] = [
  { name: 'Abishai Gosula', role: 'CEO · founder', cred: ['CS · UC Berkeley', 'built the platform'] },
  { name: 'Matthew Waddell', role: 'advisor', cred: ['2025 U23 Worlds silver · NZ rowing', 'Cal Men\'s Rowing · admitted Cambridge'] },
  { name: 'Star Miller', role: 'athlete advisor', cred: ['Cal Women\'s Rowing', 'AUS · U23 Worlds'] },
  { name: 'Lily Pember', role: 'athlete advisor', cred: ['Cal Women\'s Rowing', 'USA · Junior World gold'] },
]

function TeamSection() {
  return (
    <section
      className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      <Hairlines />
      <Crosshairs count={3} opacity={0.4} />
      <SectionLabel>// the team</SectionLabel>

      <div className="relative z-10 mx-auto mt-12 w-full max-w-[1280px]">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
          className="leading-[0.9] tracking-[-0.015em]"
          style={{
            fontFamily: DRUK,
            fontSize: 'clamp(44px, 7vw, 112px)',
            textTransform: 'uppercase',
          }}
        >
          Built by <KO>champions</KO>.
        </motion.h2>

        <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: MUTED }}>
          We lived this problem before we built the thing.
          synth is shaped by athletes who compete at the level the product serves.
        </p>

        <div className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: HAIR }}>
          {TEAM.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex flex-col gap-3 p-6"
              style={{ background: BG }}
            >
              <div className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: GREEN }}>
                {m.role}
              </div>
              <div className="leading-[0.95] tracking-[-0.01em]" style={{ fontFamily: DRUK, fontSize: 28, textTransform: 'uppercase', color: FG }}>
                {m.name}
              </div>
              <ul className="mt-1 space-y-1.5" style={{ fontFamily: MONO }}>
                {m.cred.map(c => (
                  <li key={c} className="flex items-start gap-2 text-[11px]" style={{ color: MUTED }}>
                    <span className="mt-2 inline-block h-px w-2 shrink-0" style={{ background: GREEN }} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-[11px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>
          + backed by berkeley skydeck · pad-13 batch 22
        </div>
      </div>
    </section>
  )
}

/* ─── For Teams switcher ─────────────────────────────────────────────── */

function TeamsSwitcher() {
  return (
    <section
      id="teams"
      className="relative overflow-hidden border-t px-5 sm:px-10 py-20"
      style={{ background: ELEVATED, color: FG, borderColor: HAIR }}
    >
      <Hairlines />
      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: GREEN }}>
            // coaching a team?
          </div>
          <div className="mt-3 leading-[0.95] tracking-[-0.01em]" style={{ fontFamily: DRUK, fontSize: 'clamp(28px, 4vw, 48px)', textTransform: 'uppercase' }}>
            synth scales with you<span style={{ color: GREEN }}>.</span>
          </div>
          <p className="mt-3 max-w-[520px] text-[14px]" style={{ fontFamily: BODY, color: MUTED }}>
            Team plans start at $199/mo. Two-way sync writes your synth lineups, splits, and check-ins back into your existing tools.
          </p>
        </div>
        <Chevron to="/coach/dashboard">see for teams</Chevron>
      </div>
    </section>
  )
}

/* ─── Pricing + closing CTA fused ────────────────────────────────────── */

function PricingCta({ onStart }: { onStart: () => void }) {
  return (
    <section
      id="pricing"
      className="relative flex min-h-[80vh] items-center overflow-hidden border-t px-5 sm:px-10 py-24"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      {/* Wash */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '120vw',
          height: '70vh',
          background: `radial-gradient(ellipse, ${G_GLOW} 0%, transparent 65%)`,
        }}
      />
      <Hairlines />
      <Crosshairs count={5} opacity={0.5} />

      <div className="relative z-10 mx-auto w-full max-w-[1280px]">
        <motion.h2
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
          className="leading-[0.85] tracking-[-0.02em]"
          style={{ fontFamily: DRUK, fontSize: 'clamp(72px, 14vw, 220px)', textTransform: 'uppercase' }}
        >
          Start <KO>free</KO>.
        </motion.h2>

        <p className="mt-8 max-w-[640px] text-[16px] leading-relaxed" style={{ fontFamily: BODY, color: FG }}>
          Free during the alpha. Connect your first source in 60 seconds.
          Cancel any time — your data exports back to wherever you came from.
        </p>

        {/* Pricing tiers */}
        <div className="mt-12 grid gap-px sm:grid-cols-3" style={{ background: HAIR }}>
          {[
            { tier: 'Athlete', price: '$9', unit: '/mo', detail: 'individual training' },
            { tier: 'Athlete Pro', price: '$19', unit: '/mo', detail: '+ unlimited AI · trend engine' },
            { tier: 'Team', price: '$199+', unit: '/mo', detail: 'club & program tiers' },
          ].map((t, i) => (
            <div
              key={t.tier}
              className="flex flex-col gap-3 p-6"
              style={{
                background: BG,
                borderTop: i === 1 ? `1px solid ${GREEN}` : 'none',
              }}
            >
              <div className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: i === 1 ? GREEN : DIM }}>
                {t.tier}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="leading-none" style={{ fontFamily: DRUK, fontSize: 56, color: FG }}>
                  {t.price}
                </span>
                <span className="text-[12px]" style={{ fontFamily: MONO, color: MUTED }}>{t.unit}</span>
              </div>
              <div className="text-[12px]" style={{ fontFamily: MONO, color: MUTED }}>{t.detail}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onStart}
            className="px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.22em]"
            style={{
              background: GREEN,
              color: '#000',
              fontFamily: MONO,
              boxShadow: `0 0 50px ${G_GLOW}`,
            }}
          >
            get the app →
          </button>
          <Link
            to="/signup"
            className="border px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-white hover:text-black"
            style={{ borderColor: FAINT, color: FG, fontFamily: MONO }}
          >
            join the waitlist
          </Link>
          <span className="text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: DIM }}>
            no credit card
          </span>
        </div>
      </div>
    </section>
  )
}

/* ─── Cold FAQ — athlete-focused ──────────────────────────────────────── */

const FAQS = [
  { q: 'which tools does synth connect to?', a: 'every tool you already use — Whoop, Strava, Oura, Garmin, Apple Health, TrainingPeaks, Concept2, your coach\'s spreadsheet. if it doesn\'t have an API, our AI Import reads photos, voice notes, and pasted text.' },
  { q: 'do I have to switch off my current apps?', a: 'no. synth reads from what you already use and writes back. zero switching cost.' },
  { q: 'how much does it cost?', a: 'free during the alpha. $9/mo Athlete, $19/mo Athlete Pro when we open. teams start at $199/mo.' },
  { q: 'who can see my data?', a: 'you. your data, your tenant. you decide what\'s public and what stays private — per metric.' },
]

function FaqSection() {
  return (
    <section className="relative border-t px-5 sm:px-10 py-20 sm:py-28" style={{ background: BG, color: FG, borderColor: HAIR }}>
      <SectionLabel>// fast answers</SectionLabel>

      <div className="relative z-10 mx-auto mt-12 grid w-full max-w-[1280px] gap-px sm:grid-cols-2" style={{ background: HAIR }}>
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
            <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: GREEN }}>
              q.0{i + 1}
            </div>
            <div className="text-[15px] leading-snug" style={{ color: FG }}>
              {f.q}
            </div>
            <div className="text-[13px] leading-relaxed" style={{ fontFamily: BODY, color: MUTED }}>
              → {f.a}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ─── Footer ──────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t px-5 sm:px-10 py-10" style={{ background: BG, borderColor: HAIR }}>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 text-[10px] uppercase tracking-[0.3em] sm:flex-row sm:items-center sm:justify-between" style={{ fontFamily: MONO, color: DIM }}>
        <div className="flex items-center gap-3">
          <span style={{ color: FG }}>synth<span style={{ color: GREEN }}>.</span></span>
          <span>the data layer for sports</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href="mailto:supportsynth@gmail.com" className="transition-colors hover:text-white">supportsynth@gmail.com</a>
          <Link to="/login" className="transition-colors hover:text-white">sign in</Link>
          <Link to="/signup" className="transition-colors hover:text-white">sign up</Link>
          <Link to="/app" className="transition-colors hover:text-white">app access →</Link>
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

  function handleStart() {
    if (canInstall) { trigger(); return }
    if (isIos) { setShowIosTip(true); return }
    setShowIosTip(true)
  }

  const ctaLabel = installed ? 'installed' : 'start free'

  return (
    <div className="flex min-h-dvh w-full flex-col" style={{ background: BG, fontFamily: BODY, color: FG }}>
      <Nav onStart={handleStart} ctaLabel={ctaLabel} />

      <main className="flex flex-col">
        <Hero onStart={handleStart} />
        <TrustStrip />
        <Manifesto />
        <PillarsSection />
        <ToolWall />
        <TeamSection />
        <TeamsSwitcher />
        <PricingCta onStart={handleStart} />
        <FaqSection />
        <Footer />
      </main>

      <AnimatePresence>
        {showIosTip && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-5 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIosTip(false)}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />
            <motion.div
              className="relative w-full max-w-sm border p-6"
              style={{ background: BG, borderColor: GREEN, fontFamily: MONO }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: GREEN }}>install synth</div>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: FG }}>
                tap <strong style={{ color: GREEN }}>share</strong> then <strong style={{ color: GREEN }}>add to home screen</strong> in safari.
              </p>
              <p className="mt-2 text-[11px]" style={{ color: DIM }}>works on iphone, ipad, mac.</p>
              <button
                type="button"
                onClick={() => setShowIosTip(false)}
                className="mt-5 w-full px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ background: GREEN, color: '#000', fontFamily: MONO }}
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
