import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useInstallPrompt } from './useInstallPrompt'
import {
  PageShell, KO, Hairlines, Crosshairs, SectionLabel, Chevron, PlaceholderMedia,
  ClosingCta, IntegrationsStrip, PrimaryButton, OutlineButton,
} from './shell/primitives'
import {
  BG, ELEVATED, FG, MUTED, DIM, HAIR, FAINT,
  GREEN, GREEN_2, G_GLOW, G_DIM, DRUK, MONO, BODY,
} from './shell/tokens'

/* ─── Hero — GMV-style 2-column: trimmed copy + live dashboard mock ────── */

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section
      className="relative isolate overflow-hidden px-5 sm:px-10 pt-28 pb-16 sm:pt-32 sm:pb-20"
      style={{ background: BG, color: FG, minHeight: '88vh' }}
    >
      <CinematicBackdrop />

      <div className="relative z-10 mx-auto grid w-full max-w-[1320px] gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        {/* LEFT — trimmed copy */}
        <div className="flex flex-col">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: DIM }}>
            // for athletes who train serious
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-6 tracking-[-0.02em]"
            style={{
              fontFamily: DRUK,
              fontSize: 'clamp(56px, 9vw, 132px)',
              textTransform: 'uppercase',
              lineHeight: 1.02,
            }}
          >
            <span className="block">Every signal.</span>
            <span className="block mt-2"><KO>One screen.</KO></span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-7 max-w-[420px] text-[16px] leading-relaxed"
            style={{ fontFamily: BODY, color: MUTED }}
          >
            Your training, synthesized every morning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <PrimaryButton onClick={onStart}>start free →</PrimaryButton>
            <OutlineButton to="/coach/dashboard">watch demo ▶</OutlineButton>
          </motion.div>
        </div>

        {/* RIGHT — live synthesis dashboard */}
        <HeroDashboard />
      </div>
    </section>
  )
}

function CinematicBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <motion.div
        className="absolute"
        style={{
          left: '-15%',
          bottom: '-20%',
          width: '70vw',
          height: '70vw',
          maxWidth: 1100,
          maxHeight: 1100,
          background: `radial-gradient(circle, ${G_GLOW} 0%, transparent 60%)`,
          filter: 'blur(28px)',
        }}
        animate={{ x: ['0%', '12%', '0%'], y: ['0%', '-6%', '0%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Hairlines />
      <div className="absolute inset-x-0 top-0 h-[30vh]" style={{ background: `linear-gradient(180deg, ${BG} 0%, transparent 100%)` }} />
      <div className="absolute inset-x-0 bottom-0 h-[20vh]" style={{ background: `linear-gradient(0deg, ${BG} 0%, transparent 100%)` }} />
    </div>
  )
}

/* ─── HeroDashboard — live synthesis mock (right side of the hero) ────── */

function HeroDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative w-full"
      style={{ perspective: 1400 }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          background: ELEVATED,
          border: `1px solid ${HAIR}`,
          boxShadow: `0 60px 140px rgba(0,0,0,0.7), 0 0 80px ${G_DIM}, inset 0 0 80px rgba(16,185,129,0.04)`,
        }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: HAIR, background: BG }}>
          <span className="h-2 w-2 rounded-full" style={{ background: '#EF4444' }} />
          <span className="h-2 w-2 rounded-full" style={{ background: '#F59E0B' }} />
          <span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />
          <span className="ml-3 text-[10px]" style={{ fontFamily: MONO, color: DIM }}>synth.app/today</span>
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

        {/* SOURCES row — incoming signals with pulsing dots */}
        <div className="border-b px-5 py-4" style={{ borderColor: HAIR }}>
          <div className="mb-3 flex items-center gap-3 text-[9px] uppercase tracking-[0.28em]" style={{ fontFamily: MONO, color: DIM }}>
            <span>// syncing 16 sources</span>
            <span className="h-px flex-1" style={{ background: HAIR }} />
            <span style={{ color: GREEN }}>auto</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: 'whoop',  value: 'HRV 58',     unit: 'ms'  },
              { name: 'strava', value: '8.4',       unit: 'mi'  },
              { name: 'oura',   value: '7h 32',     unit: 'sleep' },
              { name: 'garmin', value: '142',       unit: 'bpm' },
            ].map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                className="flex flex-col gap-1.5 border px-2.5 py-2"
                style={{ borderColor: FAINT, background: BG, fontFamily: MONO }}
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

        {/* Synthesis arrows — visual "data flowing into the center" */}
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

        {/* SYNTHESIS row — readiness + load */}
        <div className="grid grid-cols-2 gap-px border-b" style={{ borderColor: HAIR, background: HAIR }}>
          {/* Readiness gauge */}
          <div className="flex flex-col justify-between px-5 py-5" style={{ background: BG }}>
            <div className="text-[9px] uppercase tracking-[0.28em]" style={{ fontFamily: MONO, color: GREEN }}>
              readiness
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                style={{ fontFamily: DRUK, fontSize: 68, lineHeight: 0.9, color: GREEN, textShadow: `0 0 24px ${G_GLOW}` }}
              >
                84
              </motion.span>
              <span className="text-[11px]" style={{ fontFamily: MONO, color: DIM }}>/ 100</span>
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: GREEN }}>
              ready · go hard
            </div>
            {/* Mini ring */}
            <svg viewBox="0 0 80 8" className="mt-3 h-2 w-full">
              <rect x="0" y="3" width="80" height="2" fill={HAIR} />
              <motion.rect
                y="3" height="2" fill={GREEN}
                initial={{ width: 0 }}
                animate={{ width: 67 }}
                transition={{ duration: 1.2, delay: 1.0, ease: 'easeOut' }}
              />
            </svg>
          </div>

          {/* Training load */}
          <div className="flex flex-col justify-between px-5 py-5" style={{ background: BG }}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.28em]" style={{ fontFamily: MONO, color: DIM }}>
                training load
              </span>
              <span className="text-[9px]" style={{ fontFamily: MONO, color: GREEN }}>↑ 12%</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span style={{ fontFamily: DRUK, fontSize: 44, lineHeight: 0.9, color: FG }}>7.2</span>
              <span className="text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: MUTED }}>moderate</span>
            </div>
            <svg viewBox="0 0 100 24" className="mt-2 h-7 w-full">
              <motion.polyline
                fill="none"
                stroke={GREEN}
                strokeWidth="1.4"
                points="0,18 10,16 20,14 30,18 40,12 50,14 60,10 70,8 80,12 90,6 100,4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 1.0, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="100" cy="4" r="2.5" fill={GREEN}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.3, delay: 2.3 }}
                style={{ filter: `drop-shadow(0 0 4px ${GREEN})` }}
              />
            </svg>
          </div>
        </div>

        {/* PATTERN DETECTED — the "wow" moment */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 1.5 }}
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
            <span className="text-[9px] uppercase tracking-[0.28em]" style={{ fontFamily: MONO, color: GREEN }}>
              pattern detected — across 184 days
            </span>
          </div>
          <div className="mt-3 text-[13px] leading-snug" style={{ fontFamily: BODY, color: FG }}>
            Your last <span style={{ color: GREEN, fontWeight: 600 }}>4 PR weeks</span> all share:
            HRV <span style={{ color: GREEN, fontWeight: 600 }}>≥55ms</span>,
            sleep <span style={{ color: GREEN, fontWeight: 600 }}>≥7h</span>,
            <span style={{ color: GREEN, fontWeight: 600 }}> low-RPE day prior</span>.
          </div>
          <div className="mt-2 flex items-center gap-3 text-[9px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: DIM }}>
            <span>confidence 94%</span>
            <span className="h-px flex-1" style={{ background: HAIR }} />
            <span style={{ color: GREEN }}>view source rows ›</span>
          </div>
        </motion.div>
      </div>

      {/* Floating "synthesizing" badge — bottom-right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.8 }}
        className="absolute -bottom-4 -right-2 hidden sm:block"
        style={{
          background: GREEN,
          color: '#000',
          padding: '8px 14px',
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          boxShadow: `0 0 40px ${G_GLOW}`,
        }}
      >
        synthesized · 6:04 am
      </motion.div>
    </motion.div>
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
          <PrimaryButton onClick={onStart}>get the app →</PrimaryButton>
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
