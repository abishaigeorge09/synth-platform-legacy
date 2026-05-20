import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useInstallPrompt } from './useInstallPrompt'
import {
  PageShell, KO, Hairlines, Crosshairs, SectionLabel, Chevron, PlaceholderMedia,
  ClosingCta, PrimaryButton, OutlineButton,
} from './shell/primitives'
import {
  BG, ELEVATED, FG, MUTED, DIM, HAIR, FAINT,
  GREEN, GREEN_2, G_GLOW, G_DIM, DRUK, MONO, BODY, SERIF,
} from './shell/tokens'

/* ─── Hero — full-bleed background + serif mission headline ───────────── */

function Hero() {
  return (
    <section
      className="relative isolate flex items-center justify-center overflow-hidden px-5 sm:px-10 py-24 text-center"
      style={{ background: BG, color: FG, minHeight: '100vh' }}
    >
      <HeroBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center gap-9">
        {/* Trust pill — Berkeley SkyDeck */}
        <motion.a
          href="/why-us"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden sm:inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.28em] transition-colors hover:bg-white/10"
          style={{
            borderColor: 'rgba(255,255,255,0.18)',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(10px)',
            fontFamily: MONO,
            color: FG,
          }}
        >
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}` }}
          />
          <span>Backed by Berkeley SkyDeck</span>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
          <span>Pad-13 Batch 22</span>
          <span aria-hidden style={{ color: GREEN }}>›</span>
        </motion.a>

        {/* Serif mission headline — explicit text-center + clamped size so
         *  long lines never push the headline off the visible center */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full text-center tracking-[-0.02em]"
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: 'clamp(40px, 6.2vw, 100px)',
            lineHeight: 1.06,
            letterSpacing: '-0.01em',
          }}
        >
          <span className="block">Unlock every signal.</span>
          <span className="block mt-3">Push past every limit.</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-[12px] uppercase tracking-[0.32em]"
          style={{ fontFamily: MONO, color: 'rgba(255,255,255,0.7)' }}
        >
          the data layer for sports
        </motion.p>

        {/* Pill CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.22em]"
            style={{
              background: '#fff',
              color: '#000',
              fontFamily: MONO,
              boxShadow: `0 0 40px ${G_GLOW}`,
            }}
          >
            start free →
          </Link>
        </motion.div>
      </div>

      {/* Integration marquee — sits near the bottom of the hero with a
       *  bit of breathing room above and below. No section line below. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute inset-x-0 bottom-10 z-10"
      >
        <LogoMarquee />
      </motion.div>
    </section>
  )
}

/* ─── HeroBackground — massive full-bleed image placeholder ────────────── */

function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Real photo — b&w runners on a ridge above the cloud line */}
      <img
        src="/hero-landscape.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: 'center 40%' }}
      />

      {/* Dark wash so the white headline reads with high contrast */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.85) 100%)' }}
      />

      {/* Vignettes so the nav and marquee bands read */}
      <div className="absolute inset-x-0 top-0 h-[22vh]" style={{ background: `linear-gradient(180deg, ${BG} 0%, transparent 100%)` }} />
      <div className="absolute inset-x-0 bottom-0 h-[35vh]" style={{ background: `linear-gradient(0deg, ${BG} 0%, transparent 100%)` }} />
    </div>
  )
}

/* ─── LogoMarquee — bare ticker, rendered INSIDE the hero ──────────────
 *  No wrapping section / background / borders — just the masked scrolling
 *  ul. The hero's HeroBackground shows through, exactly like Giga: logos
 *  fade in/out at the edges via a horizontal alpha mask, no blur.
 *  4× duplication makes the loop visually seamless. */

const MARQUEE_TOOLS: string[] = [
  'WHOOP', 'Strava', 'Oura', 'Garmin', 'Apple Health', 'Google Health',
  'Fitbit', 'Concept2', 'Google Sheets', 'Excel', 'Google Calendar', 'Notion',
]

function LogoMarquee() {
  const sequence = [...MARQUEE_TOOLS, ...MARQUEE_TOOLS, ...MARQUEE_TOOLS, ...MARQUEE_TOOLS]
  return (
    // Outer wrapper centers + caps the marquee at 1200px. The mask is on
    // this same box so the edge fade lives inside the centered band — the
    // hero background to the left and right is untouched, exactly like Giga.
    <div
      className="relative mx-auto overflow-hidden py-2"
      style={{
        maxWidth: 1200,
        maskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgb(0,0,0) 25%, rgb(0,0,0) 75%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgb(0,0,0) 25%, rgb(0,0,0) 75%, rgba(0,0,0,0) 100%)',
      }}
    >
      <motion.ul
        className="flex items-center whitespace-nowrap"
        style={{ gap: 100, width: 'max-content', listStyle: 'none', margin: 0, padding: 0 }}
        animate={{ x: ['0%', '-25%'] }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      >
        {sequence.map((t, i) => (
          <li
            key={`${t}-${i}`}
            className="flex items-center justify-center"
            style={{
              height: 24,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: '-0.005em',
              color: 'rgba(255,255,255,0.62)',
              whiteSpace: 'nowrap',
            }}
          >
            {t}
          </li>
        ))}
      </motion.ul>
    </div>
  )
}

/* ─── Manifesto — clean spacing, knockout highlights ──────────────────── */

function Manifesto() {
  return (
    <section
      className="relative overflow-hidden px-5 sm:px-10 py-28 sm:py-40"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      <Hairlines />
      <Crosshairs count={3} opacity={0.35} />
      <SectionLabel align="center">// the problem</SectionLabel>

      <div className="relative z-10 mx-auto mt-12 max-w-[1100px] text-center">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
          className="leading-[1.05] tracking-[-0.01em]"
          style={{
            fontFamily: DRUK,
            fontSize: 'clamp(30px, 5.4vw, 80px)',
            textTransform: 'uppercase',
          }}
        >
          Your training lives in <KO>Strava</KO>.<br />
          Your sleep lives in <KO>Apple Health</KO>.<br />
          Your plan lives in <KO>a notes app</KO>.<br />
          <span className="block mt-3">Nothing sees <KO>the whole picture</KO>.</span>
        </motion.h2>

        <p className="mt-10 text-[12px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: DIM }}>
          until synth ↓
        </p>
      </div>
    </section>
  )
}

/* ─── Pillars: CONNECT · SYNTHESIZE · ACT ─────────────────────────────── */

type Pillar = {
  num: string
  word: string
  sub: string
  body: string
  detail: string[]
  cta: { label: string; to: string }
  motif: 'connect' | 'synthesize' | 'act'
}

const PILLARS: Pillar[] = [
  {
    num: '01',
    word: 'Connect',
    sub: 'every tool you already use',
    body: 'Whoop, Strava, Oura, Garmin, Apple Health, your coach\'s spreadsheet, your training plan. If it has an API, synth connects. If it doesn\'t, our AI Import reads photos, voice notes, and pasted text.',
    detail: ['12+ direct integrations live', 'AI Import — any photo, voice, or text', 'OAuth in 60 seconds — no migration'],
    cta: { label: 'see every connector', to: '/platform/integrations' },
    motif: 'connect',
  },
  {
    num: '02',
    word: 'Synthesize',
    sub: 'while you sleep',
    body: 'Every morning, synth normalizes your signals, computes training load and recovery readiness, and writes the pattern back to whatever tool you live in. You wake up to one screen — not five.',
    detail: ['Training load · recovery readiness · trend', 'Patterns you can\'t see yourself', 'Two-way sync — keep your tools, keep your workflow'],
    cta: { label: 'see the dashboard', to: '/coach/dashboard' },
    motif: 'synthesize',
  },
  {
    num: '03',
    word: 'Act',
    sub: 'ask anything. know now',
    body: 'Ask "am I overtrained?" Ask "what was my best week last quarter?" Get a sourced answer in seconds — every claim cites the row it came from. No black box. No hallucination.',
    detail: ['Athlete-scoped or team-wide', 'Sourced answers with row citations', 'No generic AI — just your data, read carefully'],
    cta: { label: 'try the demo', to: '/coach/ai' },
    motif: 'act',
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
      className="relative overflow-hidden px-5 sm:px-10 py-24 sm:py-32"
    >
      <Hairlines />
      <Crosshairs count={3} opacity={0.4} />

      <div className={`relative z-10 mx-auto grid w-full max-w-[1280px] gap-12 lg:grid-cols-2 lg:items-center ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        {/* Type column */}
        <div>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
            <span>// pillar {pillar.num}</span>
            <span className="h-px w-12" style={{ background: GREEN_2 }} />
          </div>

          <motion.h3
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55 }}
            className="mt-5 tracking-[-0.02em]"
            style={{
              fontFamily: DRUK,
              fontSize: 'clamp(56px, 10vw, 140px)',
              textTransform: 'uppercase',
              lineHeight: 0.95,
            }}
          >
            {pillar.word}<span style={{ color: GREEN }}>.</span>
          </motion.h3>

          <div className="mt-5 text-[12px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: MUTED }}>
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

        {/* Visual column */}
        <PillarVisual motif={pillar.motif} />
      </div>
    </div>
  )
}

function PillarVisual({ motif }: { motif: 'connect' | 'synthesize' | 'act' }) {
  // Every motif drives its own height now — Connect (3×2 tiles), Synthesize
  // (full dashboard), Act (three Q/A exchanges). The container hugs the
  // content with no forced aspect ratio.
  const autoHeight = true
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: 0.1 }}
      className={`relative w-full overflow-hidden ${autoHeight ? '' : 'aspect-[5/4]'}`}
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
          synth.app/{motif}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: GREEN }}>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: GREEN, boxShadow: `0 0 8px ${GREEN}` }}
          />
          live
        </span>
      </div>

      <div className={`relative p-3 ${autoHeight ? '' : 'h-full'}`}>
        {motif === 'connect' && <ConnectMotif />}
        {motif === 'synthesize' && <SynthesizeMotif />}
        {motif === 'act' && <ActMotif />}
      </div>
    </motion.div>
  )
}

/* Each source tile renders a tiny reproduction of how the data looks on
 * that platform — so a viewer who knows Strava or Whoop sees their own
 * UI inside synth's card. */

type SourceTileProps = {
  name: string
  bg: string
  Illustration: React.ComponentType
}

function SourceTile({ name, bg, Illustration }: SourceTileProps) {
  return (
    <div
      className="relative flex flex-col overflow-hidden border"
      style={{ borderColor: FAINT, background: bg, fontFamily: MONO, minHeight: 170 }}
    >
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <span className="text-[9px] uppercase tracking-[0.22em]" style={{ color: MUTED }}>
          {name}
        </span>
      </div>
      <div className="relative flex-1 px-2" style={{ minHeight: 110 }}>
        <Illustration />
      </div>
      <div className="flex items-center gap-1.5 px-3 pb-2 pt-1">
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}` }}
        />
        <span className="text-[9px]" style={{ color: GREEN }}>synced</span>
      </div>
    </div>
  )
}

/* ── Whoop — recovery ring, the platform's signature view ──────────── */
function WhoopArt() {
  const recovery = 78
  const C = 2 * Math.PI * 28
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      <defs>
        <linearGradient id="whoop-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="40" r="28" fill="none" stroke="#1a1a1a" strokeWidth="6" />
      <circle
        cx="50" cy="40" r="28" fill="none"
        stroke="url(#whoop-glow)" strokeWidth="6"
        strokeDasharray={`${(recovery / 100) * C} ${C}`}
        strokeLinecap="round"
        transform="rotate(-90 50 40)"
      />
      <text x="50" y="42" fill="#fff" fontSize="16" fontFamily={MONO} fontWeight="700" textAnchor="middle">{recovery}%</text>
      <text x="50" y="56" fill="#666" fontSize="5" letterSpacing="1.5" textAnchor="middle">RECOVERY</text>
    </svg>
  )
}

/* ── Strava — activity card with map polyline + stats row ───────────── */
function StravaArt() {
  return (
    <div className="flex h-full flex-col gap-1 py-1">
      <div className="text-[8px] font-bold uppercase tracking-[0.06em]" style={{ color: '#FC4C02' }}>
        ▲ Morning Run
      </div>
      <svg viewBox="0 0 100 40" className="h-full flex-1" preserveAspectRatio="none">
        <rect width="100" height="40" fill="#0f0f10" />
        <path
          d="M 5 32 Q 18 12, 30 22 T 55 18 Q 70 14, 82 26 L 95 20"
          fill="none" stroke="#FC4C02" strokeWidth="1.6" strokeLinecap="round"
        />
        <circle cx="5" cy="32" r="1.6" fill="#FC4C02" />
        <circle cx="95" cy="20" r="1.6" fill="#FC4C02" />
      </svg>
      <div className="flex items-center justify-between text-[7px]" style={{ color: '#888' }}>
        <span><strong style={{ color: '#fff' }}>8.4</strong>mi</span>
        <span><strong style={{ color: '#fff' }}>7:34</strong>/mi</span>
        <span><strong style={{ color: '#fff' }}>1:03</strong></span>
      </div>
    </div>
  )
}

/* ── Oura — sleep score ring + 4-stage sleep bar ────────────────────── */
function OuraArt() {
  const score = 84
  const C = 2 * Math.PI * 22
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5">
      <svg viewBox="0 0 80 64" className="h-full max-h-[60px]">
        <defs>
          <linearGradient id="oura-ring" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="32" r="22" fill="none" stroke="#1a1a2e" strokeWidth="4" />
        <circle
          cx="40" cy="32" r="22" fill="none"
          stroke="url(#oura-ring)" strokeWidth="4"
          strokeDasharray={`${(score / 100) * C} ${C}`}
          strokeLinecap="round"
          transform="rotate(-90 40 32)"
        />
        <text x="40" y="35" fill="#fff" fontSize="14" fontFamily={MONO} fontWeight="700" textAnchor="middle">{score}</text>
      </svg>
      <div className="flex h-1 w-full gap-px overflow-hidden">
        <div className="h-full" style={{ width: '15%', background: '#312e81' }} />
        <div className="h-full" style={{ width: '40%', background: '#6366f1' }} />
        <div className="h-full" style={{ width: '25%', background: '#a78bfa' }} />
        <div className="h-full" style={{ width: '20%', background: '#c4b5fd' }} />
      </div>
      <div className="flex items-center gap-1 text-[7px]" style={{ color: '#888' }}>
        <span style={{ color: '#a78bfa' }}>REM</span>
        <span>·</span>
        <span>7h 32m</span>
      </div>
    </div>
  )
}

/* ── Garmin — Connect-style steps bar chart + number ────────────────── */
function GarminArt() {
  const bars = [42, 58, 71, 38, 65, 84, 92] // 7-day steps
  return (
    <div className="flex h-full flex-col gap-1 py-1">
      <div className="flex items-baseline gap-1">
        <span className="text-[14px] font-bold" style={{ color: '#fff', fontFamily: MONO }}>8,432</span>
        <span className="text-[7px] uppercase tracking-[0.08em]" style={{ color: '#007cc3' }}>steps</span>
      </div>
      <div className="flex flex-1 items-end gap-[3px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1"
            style={{
              height: `${h}%`,
              background: i === bars.length - 1 ? '#007cc3' : '#1e3a5f',
              minHeight: 2,
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[7px]" style={{ color: '#888' }}>
        <span>M T W T F S <strong style={{ color: '#007cc3' }}>S</strong></span>
        <span><strong style={{ color: '#fff' }}>92%</strong></span>
      </div>
    </div>
  )
}

/* ── Apple Health — activity rings (move/exercise/stand) ────────────── */
function AppleHealthArt() {
  return (
    <div className="flex h-full items-center justify-center gap-2">
      <svg viewBox="0 0 64 64" className="h-full max-h-[80px]">
        {/* Move — red */}
        <circle cx="32" cy="32" r="26" fill="none" stroke="#2a0a0e" strokeWidth="4" />
        <circle cx="32" cy="32" r="26" fill="none" stroke="#FF375F" strokeWidth="4"
          strokeDasharray={`${0.78 * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
          strokeLinecap="round" transform="rotate(-90 32 32)" />
        {/* Exercise — green */}
        <circle cx="32" cy="32" r="19" fill="none" stroke="#0a2014" strokeWidth="4" />
        <circle cx="32" cy="32" r="19" fill="none" stroke="#30D158" strokeWidth="4"
          strokeDasharray={`${0.65 * 2 * Math.PI * 19} ${2 * Math.PI * 19}`}
          strokeLinecap="round" transform="rotate(-90 32 32)" />
        {/* Stand — blue */}
        <circle cx="32" cy="32" r="12" fill="none" stroke="#0a1a24" strokeWidth="4" />
        <circle cx="32" cy="32" r="12" fill="none" stroke="#00C7BE" strokeWidth="4"
          strokeDasharray={`${0.90 * 2 * Math.PI * 12} ${2 * Math.PI * 12}`}
          strokeLinecap="round" transform="rotate(-90 32 32)" />
      </svg>
      <div className="flex flex-col gap-0.5 text-[7px]" style={{ fontFamily: MONO, color: '#888' }}>
        <div><span style={{ color: '#FF375F' }}>● </span>420 cal</div>
        <div><span style={{ color: '#30D158' }}>● </span>26 min</div>
        <div><span style={{ color: '#00C7BE' }}>● </span>11 hrs</div>
      </div>
    </div>
  )
}

/* ── Google Sheets — a literal mini-spreadsheet grid ────────────────── */
function SheetsArt() {
  const rows = [
    ['5/12', '8.4mi', '7:34'],
    ['5/13', '5.2mi', '8:02'],
    ['5/14', 'rest',  '—'],
    ['5/15', '10mi',  '7:12'],
  ]
  return (
    <div className="flex h-full flex-col py-1 text-[7px]" style={{ fontFamily: MONO }}>
      {/* Header */}
      <div className="grid grid-cols-[1fr_1fr_1fr] border-b" style={{ borderColor: '#2a2a2a' }}>
        {['DATE', 'DIST', 'PACE'].map(h => (
          <div key={h} className="px-1 py-0.5 font-semibold" style={{ color: '#888' }}>{h}</div>
        ))}
      </div>
      {/* Rows */}
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_1fr_1fr] border-b"
          style={{ borderColor: '#1a1a1a', background: i % 2 ? '#0a0a0a' : 'transparent' }}
        >
          {r.map((c, j) => (
            <div key={j} className="px-1 py-0.5" style={{ color: j === 0 ? '#888' : '#fff' }}>
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const CONNECT_SOURCES: Array<{ name: string; bg: string; Art: React.ComponentType }> = [
  { name: 'whoop',       bg: '#0a0a0a', Art: WhoopArt },
  { name: 'strava',      bg: '#0f0f10', Art: StravaArt },
  { name: 'oura',        bg: '#0d0c1f', Art: OuraArt },
  { name: 'garmin',      bg: '#0a1420', Art: GarminArt },
  { name: 'apple health',bg: '#0a0a0a', Art: AppleHealthArt },
  { name: 'sheets',      bg: '#0a0a0a', Art: SheetsArt },
]

function ConnectMotif() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CONNECT_SOURCES.map(s => (
        <SourceTile key={s.name} name={s.name} bg={s.bg} Illustration={s.Art} />
      ))}
    </div>
  )
}

/* SynthesizeMotif — the full live-synthesis dashboard. Lives inside the
 *  Synthesize billboard pillar. PillarVisual provides the browser chrome,
 *  so this component renders the sections only, no outer frame. */
function SynthesizeMotif() {
  return (
    <div className="-m-3 flex flex-col" style={{ fontFamily: MONO }}>
      {/* SOURCES row */}
      <div className="border-b px-5 py-4" style={{ borderColor: HAIR }}>
        <div className="mb-3 flex items-center gap-3 text-[9px] uppercase tracking-[0.28em]" style={{ color: DIM }}>
          <span>// syncing 12 sources</span>
          <span className="h-px flex-1" style={{ background: HAIR }} />
          <span style={{ color: GREEN }}>auto</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: 'whoop',  value: 'HRV 58', unit: 'ms' },
            { name: 'strava', value: '8.4',    unit: 'mi' },
            { name: 'oura',   value: '7h 32',  unit: 'sleep' },
            { name: 'garmin', value: '142',    unit: 'bpm' },
          ].map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col gap-1.5 border px-2.5 py-2"
              style={{ borderColor: FAINT, background: BG }}
            >
              <div className="flex items-center gap-1.5">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}` }}
                />
                <span className="text-[8px] uppercase tracking-[0.22em]" style={{ color: MUTED }}>{s.name}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[14px] leading-none" style={{ color: FG }}>{s.value}</span>
                <span className="text-[9px]" style={{ color: DIM }}>{s.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Synthesis arrows */}
      <div className="relative h-6 border-b" style={{ borderColor: HAIR, background: BG }}>
        <svg viewBox="0 0 400 24" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {[50, 150, 250, 350].map((x, i) => (
            <motion.line
              key={x}
              x1={x} y1="0" x2="200" y2="24"
              stroke={GREEN}
              strokeWidth="0.7"
              strokeOpacity="0.4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            />
          ))}
          <circle cx="200" cy="22" r="2.5" fill={GREEN} />
        </svg>
      </div>

      {/* Readiness + Load */}
      <div className="grid grid-cols-2 gap-px border-b" style={{ borderColor: HAIR, background: HAIR }}>
        <div className="flex flex-col justify-between px-5 py-5" style={{ background: BG }}>
          <div className="text-[9px] uppercase tracking-[0.28em]" style={{ color: GREEN }}>readiness</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span style={{ fontFamily: DRUK, fontSize: 68, lineHeight: 0.9, color: GREEN, textShadow: `0 0 24px ${G_GLOW}` }}>84</span>
            <span className="text-[11px]" style={{ color: DIM }}>/ 100</span>
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.22em]" style={{ color: GREEN }}>ready · go hard</div>
          <svg viewBox="0 0 80 8" className="mt-3 h-2 w-full">
            <rect x="0" y="3" width="80" height="2" fill={HAIR} />
            <motion.rect y="3" height="2" fill={GREEN}
              initial={{ width: 0 }}
              whileInView={{ width: 67 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
        </div>

        <div className="flex flex-col justify-between px-5 py-5" style={{ background: BG }}>
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.28em]" style={{ color: DIM }}>training load</span>
            <span className="text-[9px]" style={{ color: GREEN }}>↑ 12%</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span style={{ fontFamily: DRUK, fontSize: 44, lineHeight: 0.9, color: FG }}>7.2</span>
            <span className="text-[11px] uppercase tracking-[0.22em]" style={{ color: MUTED }}>moderate</span>
          </div>
          <svg viewBox="0 0 100 24" className="mt-2 h-7 w-full">
            <motion.polyline
              fill="none"
              stroke={GREEN}
              strokeWidth="1.4"
              points="0,18 10,16 20,14 30,18 40,12 50,14 60,10 70,8 80,12 90,6 100,4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />
          </svg>
        </div>
      </div>

      {/* Pattern detected */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55, delay: 0.4 }}
        className="px-5 py-5"
        style={{ background: `linear-gradient(180deg, ${BG} 0%, rgba(16,185,129,0.06) 100%)` }}
      >
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: GREEN, boxShadow: `0 0 8px ${GREEN}` }}
          />
          <span className="text-[9px] uppercase tracking-[0.28em]" style={{ color: GREEN }}>what synth noticed</span>
        </div>
        <div className="mt-3 text-[14px] leading-snug" style={{ fontFamily: BODY, color: FG }}>
          Your best weeks always start with <span style={{ color: GREEN, fontWeight: 600 }}>7+ hours of sleep</span> and an <span style={{ color: GREEN, fontWeight: 600 }}>easy day before</span>.
        </div>
        <div className="mt-2 text-[13px] leading-snug" style={{ fontFamily: BODY, color: MUTED }}>
          Make tonight one of those nights.
        </div>
      </motion.div>
    </div>
  )
}

function ActMotif() {
  const exchanges: { q: string; a: string; cites: string[] }[] = [
    {
      q: 'am I overtrained this week?',
      a: 'slightly. load is up 18% week-over-week and HRV is down 8%. back off intensity for two days.',
      cites: ['whoop · hrv', 'strava · load', 'oura · sleep'],
    },
    {
      q: 'what was my best week last quarter?',
      a: 'march 18–24. you slept 7.6h average, hit two HRV peaks, and PR\'d your tempo. repeat the sleep pattern.',
      cites: ['oura · sleep', 'strava · tempo', 'pr engine'],
    },
    {
      q: 'should I run intervals tomorrow?',
      a: 'yes. recovery is at 84 and sleep is trending up. your block is on plan — hit it.',
      cites: ['whoop · recovery', 'sheets · plan'],
    },
  ]
  return (
    <div className="flex h-full flex-col gap-2" style={{ fontFamily: MONO }}>
      {exchanges.map((ex, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="border p-2.5" style={{ borderColor: FAINT, background: BG }}>
            <div className="text-[9px] uppercase tracking-[0.25em]" style={{ color: DIM }}>you</div>
            <div className="mt-1 text-[11px]" style={{ color: FG }}>{ex.q}</div>
          </div>
          <div className="border p-2.5" style={{ borderColor: GREEN, background: G_DIM }}>
            <div className="text-[9px] uppercase tracking-[0.25em]" style={{ color: GREEN }}>synth</div>
            <div className="mt-1 text-[11px] leading-snug" style={{ color: FG }}>
              {ex.a}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1 text-[9px]" style={{ color: MUTED }}>
              {ex.cites.map(c => (
                <span key={c} className="px-1.5 py-0.5" style={{ background: BG, border: `1px solid ${HAIR}` }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Tool wall ───────────────────────────────────────────────────────── */

const TOOLS = [
  'Whoop', 'Strava', 'Oura', 'Garmin', 'Apple Health', 'Google Health',
  'Fitbit', 'Concept2', 'Google Sheets', 'Excel', 'Google Calendar', 'Notion',
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
          className="tracking-[-0.015em]"
          style={{
            fontFamily: DRUK,
            fontSize: 'clamp(44px, 7vw, 112px)',
            textTransform: 'uppercase',
            lineHeight: 1.05,
          }}
        >
          Connect <KO>anything</KO>.
        </motion.h2>

        <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: MUTED }}>
          Every tool you already use. And if it doesn't have an API, our AI Import reads photos, voice notes, and pasted text.
        </p>

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

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex flex-col gap-4 border p-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: GREEN, background: G_DIM }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
              // ai import
            </div>
            <div className="mt-2 text-[16px] leading-snug" style={{ fontFamily: BODY, color: FG }}>
              If it has an API, we connect to it. If it doesn't,
              <span style={{ color: GREEN }}> our AI Import still reads it.</span>
            </div>
          </div>
          <Chevron to="/platform/integrations">how AI Import works</Chevron>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Built by champions ──────────────────────────────────────────────── */

const TEAM = [
  { name: 'Abishai Gosula',  role: 'CEO · founder',     cred: ['CS · UC Berkeley', 'built the platform'] },
  { name: 'Matthew Waddell', role: 'advisor',           cred: ['2025 U23 Worlds silver · NZ rowing', 'Cal Rowing · admitted Cambridge'] },
  { name: 'Star Miller',     role: 'athlete advisor',   cred: ['Cal Women\'s Rowing', 'AUS · U23 Worlds'] },
  { name: 'Lily Pember',     role: 'athlete advisor',   cred: ['Cal Women\'s Rowing', 'USA · Junior World gold'] },
]

function TeamSection() {
  return (
    <section
      className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      <Hairlines />
      <Crosshairs count={3} opacity={0.35} />
      <SectionLabel>// the team</SectionLabel>

      <div className="relative z-10 mx-auto mt-12 w-full max-w-[1280px]">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
          className="tracking-[-0.015em]"
          style={{
            fontFamily: DRUK,
            fontSize: 'clamp(44px, 7vw, 112px)',
            textTransform: 'uppercase',
            lineHeight: 1.05,
          }}
        >
          Built by <KO>champions</KO>.
        </motion.h2>

        <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: MUTED }}>
          We lived this problem before we built the thing. synth is shaped by athletes who compete at the level the product serves.
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
              <PlaceholderMedia kind="photo" label={`${m.name} — portrait`} ratio="1/1" />
              <div className="mt-2 text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
                {m.role}
              </div>
              <div className="leading-[0.95] tracking-[-0.01em]" style={{ fontFamily: DRUK, fontSize: 26, textTransform: 'uppercase', color: FG }}>
                {m.name}
              </div>
              <ul className="space-y-1.5" style={{ fontFamily: MONO }}>
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
      </div>
    </section>
  )
}

/* ─── Pricing ────────────────────────────────────────────────────────── */

function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      <Hairlines />
      <SectionLabel>// pricing</SectionLabel>

      <div className="relative z-10 mx-auto mt-12 w-full max-w-[1280px]">
        <h2
          className="tracking-[-0.015em]"
          style={{ fontFamily: DRUK, fontSize: 'clamp(40px, 6vw, 88px)', textTransform: 'uppercase', lineHeight: 1.05 }}
        >
          Start <KO>free</KO>. Pick your tier when you're ready.
        </h2>
        <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed" style={{ color: MUTED }}>
          Free during the alpha. No credit card. Your data is yours — export back to the tool you came from at any time.
        </p>

        <div className="mt-12 grid gap-px sm:grid-cols-3" style={{ background: HAIR }}>
          {[
            { tier: 'Athlete', price: '$9', unit: '/mo', detail: 'individual training', feats: ['12+ integrations', 'recovery + training + progress', 'synth AI · 100 q/mo'] },
            { tier: 'Athlete Pro', price: '$19', unit: '/mo', detail: '+ unlimited AI · API · trends', feats: ['everything in Athlete', 'unlimited synth AI', 'API access · custom export'] },
            { tier: 'Team', price: '$199+', unit: '/mo', detail: 'clubs · schools · programs', feats: ['lineup builder · 2-way sync', '$199 ≤30 · $499 ≤100', 'collegiate from $15K/yr'] },
          ].map((t, i) => (
            <div
              key={t.tier}
              className="flex flex-col gap-4 p-7"
              style={{
                background: BG,
                borderTop: i === 1 ? `2px solid ${GREEN}` : 'none',
              }}
            >
              <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: i === 1 ? GREEN : DIM }}>
                {t.tier}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="leading-none" style={{ fontFamily: DRUK, fontSize: 56, color: FG }}>
                  {t.price}
                </span>
                <span className="text-[12px]" style={{ fontFamily: MONO, color: MUTED }}>{t.unit}</span>
              </div>
              <div className="text-[12px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: MUTED }}>
                {t.detail}
              </div>
              <ul className="mt-2 space-y-1.5" style={{ fontFamily: MONO }}>
                {t.feats.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[12px]" style={{ color: FG }}>
                    <span className="mt-2 inline-block h-px w-2 shrink-0" style={{ background: GREEN }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <PrimaryButton to="/signup">get started →</PrimaryButton>
          <OutlineButton to="/sports/teams">talk to us about teams</OutlineButton>
          <span className="text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: DIM }}>
            no credit card
          </span>
        </div>
      </div>
    </section>
  )
}

/* ─── Cold FAQ ────────────────────────────────────────────────────────── */

const FAQS = [
  { q: 'which tools does synth connect to?', a: 'every tool you already use — Whoop, Strava, Oura, Garmin, Apple Health, Concept2, your training spreadsheet. if it doesn\'t have an API, our AI Import reads photos, voice notes, and pasted text.' },
  { q: 'do I have to switch off my current apps?', a: 'no. synth reads from what you already use and writes back. zero switching cost.' },
  { q: 'how much does it cost?', a: 'free during the alpha. $9/mo Athlete, $19/mo Athlete Pro when we open. teams start at $199/mo.' },
  { q: 'who can see my data?', a: 'you. your data, your tenant. you decide what\'s public and what stays private — per metric.' },
]

function FaqSection() {
  return (
    <section
      className="relative border-t px-5 sm:px-10 py-20 sm:py-28"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
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
            <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: GREEN }}>
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

/* ─── Page ────────────────────────────────────────────────────────────── */

export function LandingPage() {
  const { canInstall, installed, isIos, trigger } = useInstallPrompt()
  const [showIosTip, setShowIosTip] = useState(false)

  function handleStart() {
    if (canInstall) { trigger(); return }
    if (isIos) { setShowIosTip(true); return }
    setShowIosTip(true)
  }

  const ctaLabel = installed ? 'installed' : 'start free'

  return (
    <PageShell active="home" onStart={handleStart} ctaLabel={ctaLabel}>
      <Hero />
      <Manifesto />
      <PillarsSection />
      <ToolWall />
      <TeamSection />
      <Pricing />
      <FaqSection />
      <ClosingCta
        headline={<>Start <KO>free</KO>.</>}
        body="Connect your first source in 60 seconds. Cancel any time — your data exports back to wherever you came from."
        primary={{ label: 'start free', to: '/signup' }}
        secondary={{ label: 'see the platform', to: '/platform' }}
      />

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
              <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: GREEN }}>install synth</div>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: FG }}>
                tap <strong style={{ color: GREEN }}>share</strong> then <strong style={{ color: GREEN }}>add to home screen</strong> in safari.
              </p>
              <p className="mt-2 text-[11px]" style={{ color: DIM }}>works on iphone, ipad, mac.</p>
              <button
                type="button"
                onClick={() => setShowIosTip(false)}
                className="mt-5 w-full px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.32em]"
                style={{ background: GREEN, color: '#000', fontFamily: MONO }}
              >
                got it →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}
