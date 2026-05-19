import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useInstallPrompt } from './useInstallPrompt'
import {
  PageShell, KO, Hairlines, Crosshairs, SectionLabel, Chevron, PlaceholderMedia,
  ClosingCta, IntegrationsStrip,
} from './shell/primitives'
import {
  BG, ELEVATED, FG, MUTED, DIM, HAIR, FAINT,
  GREEN, GREEN_2, G_GLOW, G_DIM, DRUK, MONO, BODY,
} from './shell/tokens'

/* ─── Hero — cleaner composition, no text overlap ─────────────────────── */

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section
      className="relative isolate overflow-hidden px-5 sm:px-10 pt-32 sm:pt-40"
      style={{ background: BG, color: FG, minHeight: '92vh' }}
    >
      {/* Backdrop layer — strictly behind the headline, never overlaps it */}
      <CinematicBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col">
        {/* Eyebrow row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: DIM }}>
          <span>// synth — for athletes who train serious</span>
          <span className="hidden sm:inline">v 0.1 · alpha</span>
        </div>

        {/* Headline — single block, fixed cap so it doesn't crash bottom row */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-12 sm:mt-16 leading-[0.86] tracking-[-0.02em]"
          style={{
            fontFamily: DRUK,
            fontSize: 'clamp(56px, 11vw, 160px)',
            textTransform: 'uppercase',
          }}
        >
          <span className="block">Every signal.</span>
          <span className="block"><KO>One screen.</KO></span>
        </motion.h1>

        {/* Subhead + CTAs row — pushed below headline with deliberate spacing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end"
        >
          <div style={{ fontFamily: BODY }}>
            <p className="text-[17px] sm:text-[19px] leading-snug" style={{ color: FG }}>
              Your training, your sleep, your plan — synthesized every morning. <span style={{ color: MUTED }}>One screen tells you what's working, what's slipping, and what to do next.</span>
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.28em]" style={{ fontFamily: MONO, color: DIM }}>
              no spreadsheet stitching · no rip-and-replace · works on the phone you already have
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
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
        </motion.div>

        {/* Bottom mono row — way below CTAs, doesn't fight headline */}
        <div className="mt-16 mb-12 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: DIM }}>
          <span>scroll ↓</span>
          <span className="h-px w-12" style={{ background: HAIR }} />
          <span>built by world championship rowers</span>
          <span className="h-px w-12" style={{ background: HAIR }} />
          <span>backed by berkeley skydeck</span>
        </div>
      </div>
    </section>
  )
}

function CinematicBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      {/* Slow drifting green halo — kept low-left, never under the headline center */}
      <motion.div
        className="absolute"
        style={{
          left: '-10%',
          bottom: '-15%',
          width: '70vw',
          height: '70vw',
          maxWidth: 1100,
          maxHeight: 1100,
          background: `radial-gradient(circle, ${G_GLOW} 0%, transparent 60%)`,
          filter: 'blur(24px)',
        }}
        animate={{ x: ['0%', '15%', '0%'], y: ['0%', '-8%', '0%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Hairlines />
      {/* Top vignette so the eyebrow row is always legible */}
      <div className="absolute inset-x-0 top-0 h-[40vh]" style={{ background: `linear-gradient(180deg, ${BG} 0%, transparent 100%)` }} />
      {/* Bottom vignette so the next section feels continuous */}
      <div className="absolute inset-x-0 bottom-0 h-[20vh]" style={{ background: `linear-gradient(0deg, ${BG} 0%, transparent 100%)` }} />
    </div>
  )
}

/* ─── Manifesto — clean spacing, knockout highlights ──────────────────── */

function Manifesto() {
  return (
    <section
      className="relative overflow-hidden border-t px-5 sm:px-10 py-28 sm:py-40"
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
    detail: ['16+ direct integrations live', 'AI Import — any photo, voice, or text', 'OAuth in 60 seconds — no migration'],
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
      className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32"
      style={{ borderColor: HAIR }}
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
            className="mt-5 leading-[0.86] tracking-[-0.02em]"
            style={{
              fontFamily: DRUK,
              fontSize: 'clamp(56px, 10vw, 140px)',
              textTransform: 'uppercase',
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: 0.1 }}
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
          synth.app/{motif}
        </span>
      </div>

      <div className="relative h-full p-6">
        {motif === 'connect' && <ConnectMotif />}
        {motif === 'synthesize' && <SynthesizeMotif />}
        {motif === 'act' && <ActMotif />}
      </div>
    </motion.div>
  )
}

function ConnectMotif() {
  const SOURCES = ['Whoop', 'Strava', 'Oura', 'Garmin', 'Apple Health', 'Sheets']
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
          className="leading-[0.92] tracking-[-0.015em]"
          style={{
            fontFamily: DRUK,
            fontSize: 'clamp(44px, 7vw, 112px)',
            textTransform: 'uppercase',
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
          className="leading-[0.92] tracking-[-0.015em]"
          style={{
            fontFamily: DRUK,
            fontSize: 'clamp(44px, 7vw, 112px)',
            textTransform: 'uppercase',
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

function Pricing({ onStart }: { onStart: () => void }) {
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
          className="leading-[0.92] tracking-[-0.015em]"
          style={{ fontFamily: DRUK, fontSize: 'clamp(40px, 6vw, 88px)', textTransform: 'uppercase' }}
        >
          Start <KO>free</KO>. Pick your tier when you're ready.
        </h2>
        <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed" style={{ color: MUTED }}>
          Free during the alpha. No credit card. Your data is yours — export back to the tool you came from at any time.
        </p>

        <div className="mt-12 grid gap-px sm:grid-cols-3" style={{ background: HAIR }}>
          {[
            { tier: 'Athlete', price: '$9', unit: '/mo', detail: 'individual training', feats: ['16+ integrations', 'recovery + training + progress', 'synth AI · 100 q/mo'] },
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
          <button
            type="button"
            onClick={onStart}
            className="px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ background: GREEN, color: '#000', fontFamily: MONO, boxShadow: `0 0 36px ${G_GLOW}` }}
          >
            get the app →
          </button>
          <Link
            to="/sports/teams"
            className="border px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-white hover:text-black"
            style={{ borderColor: FAINT, color: FG, fontFamily: MONO }}
          >
            talk to us about teams
          </Link>
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
  { q: 'which tools does synth connect to?', a: 'every tool you already use — Whoop, Strava, Oura, Garmin, Apple Health, TrainingPeaks, Concept2, your coach\'s spreadsheet. if it doesn\'t have an API, our AI Import reads photos, voice notes, and pasted text.' },
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
    <PageShell active="home" onStart={handleStart} ctaLabel={ctaLabel}>
      <Hero onStart={handleStart} />
      <IntegrationsStrip />
      <Manifesto />
      <PillarsSection />
      <ToolWall />
      <TeamSection />
      <Pricing onStart={handleStart} />
      <FaqSection />
      <ClosingCta
        headline={<>Start <KO>free</KO>.</>}
        body="Connect your first source in 60 seconds. Cancel any time — your data exports back to wherever you came from."
        primary={{ label: 'get the app', to: '/signup', onClick: handleStart }}
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
