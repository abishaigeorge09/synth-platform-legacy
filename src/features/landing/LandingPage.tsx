import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { THEME } from '../../lib/theme'
import { STAGGER } from '../../lib/motion'
import { useInstallPrompt } from './useInstallPrompt'
import { Hero3D } from './Hero3D'
import {
  DashboardIllustration,
  AthletesIllustration,
  SourcesIllustration,
  LineupsIllustration,
  SessionTimerIllustration,
  SynthAiIllustration,
} from '../../shared/illustrations/sidebarIllustrations'

/* ─── Data ────────────────────────────────────────────────────────────── */

type Feature = {
  kicker: string
  title: string
  body: string
  Glyph: React.ComponentType<{ size?: number }>
}

const FEATURES: Feature[] = [
  {
    kicker: '01',
    title: 'Unified coach dashboard',
    body: 'Every athlete, every signal, one surface. Roster health, compliance, wellness, and alerts rolled up from every connector.',
    Glyph: DashboardIllustration,
  },
  {
    kicker: '02',
    title: 'Connect once, it updates forever',
    body: 'OAuth Sheets, TeamWorks, Whoop, Slack, or browser-extension scrape. Scheduled scans write clean markdown reports.',
    Glyph: SourcesIllustration,
  },
  {
    kicker: '03',
    title: 'Rank, drill, decide',
    body: '52-athlete rosters sortable by 2K, watts, side. Click any card to open a full profile with trend charts and scoped AI.',
    Glyph: AthletesIllustration,
  },
  {
    kicker: '04',
    title: 'Sport-specific custom tools',
    body: 'Lineups, session timers, practice planners. Drag athletes into boats, publish with one tap, notify the roster.',
    Glyph: LineupsIllustration,
  },
  {
    kicker: '05',
    title: 'Strava-style piece timer',
    body: 'Sub-100ms clock per boat, multi-boat swipe, splits that flow back into the dashboard and each athlete profile.',
    Glyph: SessionTimerIllustration,
  },
  {
    kicker: '06',
    title: 'synth. AI with citations',
    body: 'Team-wide, athlete-scoped, or athlete-own. Every answer carries the source rows it drew from. No black-box insights.',
    Glyph: SynthAiIllustration,
  },
]

const TIERS = [
  {
    name: 'Pilot',
    price: '$0',
    period: 'free for the first 3 programs',
    bullets: ['Up to 1 team', '3 connectors', 'Email support'],
    cta: 'Join pilot',
    featured: false,
  },
  {
    name: 'Club',
    price: '$199',
    period: 'per team / month',
    bullets: ['Up to 60 athletes', 'All connectors', 'synth. Agent extension', 'Priority support'],
    cta: 'Start trial',
    featured: true,
  },
  {
    name: 'Program',
    price: '$499',
    period: 'per program / month',
    bullets: ['Multi-team', 'Custom tools', 'SSO + audit', 'Dedicated onboarding'],
    cta: 'Talk to us',
    featured: false,
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Connect your tools',
    body: 'Link the spreadsheets, wearables, team-ops apps, and calendars your program already uses. OAuth handshake or browser extension — done in 60 seconds.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="14" r="3" />
        <circle cx="21" cy="7" r="3" />
        <circle cx="21" cy="21" r="3" />
        <path d="M10 13 L18 8" />
        <path d="M10 15 L18 20" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'synth. scrapes & synthesizes',
    body: 'Scheduled scans pull fresh data from every source. The intelligence layer computes training load, recovery readiness, risk flags, and trend lines across the entire roster.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="20" height="20" rx="4" />
        <path d="M9 18 L12 12 L16 15 L20 8" />
        <circle cx="20" cy="8" r="1.5" fill={THEME.primary} stroke="none" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Coach and athletes act',
    body: 'One dashboard for the coach, one view for the athlete. Build lineups, time sessions, ask the AI — every action is grounded in real data with provenance.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4 L14 12" />
        <path d="M8 8 L14 12 L20 8" />
        <rect x="4" y="16" width="8" height="8" rx="2" />
        <rect x="16" y="16" width="8" height="8" rx="2" />
        <path d="M14 12 L8 16" />
        <path d="M14 12 L20 16" />
      </svg>
    ),
  },
]

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What data sources does synth. connect to?',
    a: 'Google Sheets, Concept2 Logbook, Strava, Apple Health, Whoop, Garmin, Oura, Google Calendar, TrainingPeaks, TeamWorks, and Slack. For anything without an API, the synth. Agent browser extension or AI import (photo, voice, paste) fills the gap.',
  },
  {
    q: 'Is my data safe? Where is it stored?',
    a: 'All data is stored in a dedicated Supabase (Postgres) instance with row-level security. Coaches see their team only. Athletes see their own data plus what the coach explicitly shares. OAuth tokens are held server-side in edge functions — never in the browser.',
  },
  {
    q: 'What sports does synth. support?',
    a: 'synth. launches with rowing (our pilot partner is Cal Women\'s Rowing), but the platform is sport-agnostic. The custom tools system lets us add sport-specific features — lineups for rowing, pitch charts for baseball, rotation planners for basketball — without changing the core data model.',
  },
  {
    q: 'How does synth. AI work? Is it a black box?',
    a: 'synth. AI is backed by Claude with full citation grounding. Every answer carries the specific source rows it drew from — the table, the date, the connector. Coaches can verify any insight by clicking through to the underlying data.',
  },
  {
    q: 'Can athletes see each other\'s data?',
    a: 'No. Athletes only see their own metrics unless the coach explicitly enables team stats visibility in Settings. Coaches control what\'s shared through granular visibility toggles — show team stats, show other boats, share videos — all off by default.',
  },
  {
    q: 'Do I need to replace the tools I already use?',
    a: 'No — that\'s the point. synth. connects to the tools your program already runs. Keep your Google Sheets, keep TeamWorks, keep Whoop. synth. reads from them, synthesizes across them, and gives you one surface. You don\'t rip and replace; you unify.',
  },
  {
    q: 'What does the Pilot (free) tier include?',
    a: 'One team, up to 3 connected sources, the full dashboard, all custom tools, synth. AI, and email support. It\'s free for the first 3 programs while we build alongside early adopters. No credit card required.',
  },
  {
    q: 'How long does setup take?',
    a: 'Under five minutes. Create your team, connect your first source (most coaches start with their erg spreadsheet), and you\'re looking at real data. Athletes join via an invite code you share — no app store, just a link.',
  },
]

const TEAM = [
  { name: 'Abishai Gosula', role: 'CEO / Engineering', photo: '/team/abishai-gosula.png' },
  { name: 'Star Rose', role: 'Head of Product', photo: '/team/star-rose.png' },
  { name: 'Lily Pember', role: 'Design Lead', photo: '/team/lily-pember.png' },
  { name: 'Matthew Waddell', role: 'Growth', photo: '/team/matthew-waddell.png' },
]

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
      style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
    >
      {children}
    </div>
  )
}

function SectionHeadline({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[clamp(28px,4.2vw,44px)] font-semibold leading-[1.05]"
      style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
    >
      {children}
    </h2>
  )
}

function SectionSubhead({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-4 max-w-[600px] text-[15px] leading-relaxed"
      style={{ color: THEME.textSecondary }}
    >
      {children}
    </p>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export function LandingPage() {
  const { canInstall, installed, isIos, trigger } = useInstallPrompt()
  const [showIosTip, setShowIosTip] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)


  const handleDownload = () => {
    if (canInstall) {
      trigger()
      return
    }
    if (isIos) {
      setShowIosTip(true)
      return
    }
    setShowIosTip(true)
  }

  return (
    <div className="flex min-h-dvh w-full flex-col" style={{ background: THEME.white }}>
      {/* ── Top nav (floats over 3D hero) ── */}
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
        <nav
          className="hidden sm:flex items-center gap-6 text-[12px]"
          style={{ fontFamily: THEME.fontMono, color: 'rgba(255,255,255,0.85)' }}
        >
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
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
        {/* Mobile: just sign-in + download */}
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
            style={{
              background: THEME.white,
              color: THEME.primaryDarker,
              fontFamily: THEME.fontMono,
            }}
          >
            {installed ? 'Installed' : 'Download'}
          </button>
        </div>
      </header>

      <main>
        {/* ── 1. Hero ── */}
        <Hero3D
          onDownload={handleDownload}
          downloadLabel={installed ? 'Installed' : 'Download app'}
        />

        {/* ── 2. How it works ── */}
        <section id="how-it-works" className="px-5 sm:px-10 py-20 sm:py-28">
          <div className="mb-14 max-w-[640px]">
            <SectionKicker>How it works</SectionKicker>
            <SectionHeadline>Three steps. Under five minutes.</SectionHeadline>
            <SectionSubhead>
              No rip-and-replace. Connect the tools you already use, let synth. do the synthesis, and start making decisions from one surface.
            </SectionSubhead>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * STAGGER.cards }}
                className="relative rounded-2xl border p-6"
                style={{
                  background: THEME.white,
                  borderColor: THEME.border,
                  boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.12)',
                }}
              >
                {/* Step connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute -right-3 top-1/2 hidden h-px w-6 md:block"
                    style={{ background: THEME.border }}
                  />
                )}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${THEME.primary}10` }}
                >
                  {step.icon}
                </div>
                <div
                  className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
                >
                  Step {step.num}
                </div>
                <h3 className="mt-1 text-[18px] font-semibold" style={{ color: THEME.textPrimary }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: THEME.textSecondary }}>
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 3. Product Demo ── */}
        <section id="demo" className="px-5 sm:px-10 py-20 sm:py-28" style={{ background: THEME.light }}>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[640px]">
              <SectionKicker>Product demo</SectionKicker>
              <SectionHeadline>See it in action.</SectionHeadline>
              <SectionSubhead>
                Explore the full coach dashboard, athlete profiles, connectors, lineups, and AI — all running on real Cal Women's Rowing data.
              </SectionSubhead>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                to="/coach/dashboard"
                className="rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
                style={{
                  background: THEME.primary,
                  color: THEME.white,
                  fontFamily: THEME.fontMono,
                }}
              >
                Enter live demo
              </Link>
              <Link
                to="/product-demo"
                className="rounded-full border px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
                style={{
                  borderColor: THEME.border,
                  color: THEME.textPrimary,
                  fontFamily: THEME.fontMono,
                }}
              >
                Full screen
              </Link>
            </div>
          </div>

          {/* Demo embed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl border"
            style={{
              borderColor: THEME.border,
              boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 40px 80px -40px rgba(24,24,27,0.2)',
            }}
          >
            {/* Browser chrome bar */}
            <div
              className="flex items-center gap-2 border-b px-4 py-2.5"
              style={{ background: THEME.white, borderColor: THEME.border }}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#EF4444' }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#F59E0B' }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#22C55E' }} />
              </div>
              <div
                className="ml-3 flex-1 rounded-md px-3 py-1 text-[11px]"
                style={{
                  background: THEME.light,
                  color: THEME.textMuted,
                  fontFamily: THEME.fontMono,
                }}
              >
                synthsports.com/coach/dashboard
              </div>
            </div>
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                title="synth. Product Demo"
                src="/demos/synth_demo_nature.html"
                className="absolute inset-0 h-full w-full"
                style={{ border: 'none', background: THEME.white }}
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Quick feature highlights below the demo */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Dashboard', desc: 'Team stats, trends, alerts' },
              { label: 'Athletes', desc: '52-card roster with profiles' },
              { label: 'Lineups', desc: 'Drag-and-drop boat builder' },
              { label: 'synth. AI', desc: 'Ask anything, get citations' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-xl border px-4 py-3"
                style={{ background: THEME.white, borderColor: THEME.border }}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: THEME.primary }}
                />
                <div>
                  <div
                    className="text-[12px] font-semibold"
                    style={{ color: THEME.textPrimary, fontFamily: THEME.fontMono }}
                  >
                    {item.label}
                  </div>
                  <div className="text-[11px]" style={{ color: THEME.textMuted }}>
                    {item.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 4. Features grid ── */}
        <section id="features" className="px-5 sm:px-10 py-20 sm:py-28">
          <div className="mb-10 max-w-[640px]">
            <SectionKicker>What's in the box</SectionKicker>
            <SectionHeadline>Six surfaces. One source of truth.</SectionHeadline>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.kicker}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-2xl border p-6"
                style={{
                  background: THEME.white,
                  borderColor: THEME.border,
                  boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
                }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: `${THEME.primary}12` }}
                >
                  <f.Glyph size={24} />
                </div>
                <div
                  className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
                >
                  {f.kicker}
                </div>
                <h3 className="mt-1 text-[18px] font-semibold" style={{ color: THEME.textPrimary }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: THEME.textSecondary }}>
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 5. Social proof / Pilot story ── */}
        <section className="px-5 sm:px-10 py-20 sm:py-28" style={{ background: THEME.light }}>
          <div className="mb-14 max-w-[640px]">
            <SectionKicker>Built with coaches</SectionKicker>
            <SectionHeadline>Designed alongside Cal Women's Rowing.</SectionHeadline>
            <SectionSubhead>
              Our pilot partner is the UC Berkeley Women's Rowing program — 52 athletes, 4+ data sources, real erg data. Every surface in synth. was built with their coaching staff in the room.
            </SectionSubhead>
          </div>

          {/* Proof points */}
          <div className="grid gap-4 sm:grid-cols-3 mb-14">
            {[
              { value: '52', label: 'Athletes in pilot', sub: 'Cal Women\'s Rowing' },
              { value: '4+', label: 'Data sources', sub: 'Sheets, TeamWorks, Whoop, Email' },
              { value: '<5 min', label: 'Setup time', sub: 'Connect to dashboard' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * STAGGER.cards }}
                className="rounded-2xl border p-6"
                style={{ background: THEME.white, borderColor: THEME.border }}
              >
                <div
                  className="text-[36px] font-bold leading-none"
                  style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
                >
                  {stat.value}
                </div>
                <div className="mt-2 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>
                  {stat.label}
                </div>
                <div className="mt-0.5 text-[12px]" style={{ color: THEME.textMuted }}>
                  {stat.sub}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Team */}
          <div className="mb-4">
            <SectionKicker>The team</SectionKicker>
            <h3
              className="text-[22px] font-semibold"
              style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
            >
              Athletes building for athletes.
            </h3>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {TEAM.map((person, i) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="overflow-hidden rounded-2xl border"
                style={{ background: THEME.white, borderColor: THEME.border }}
              >
                <div className="aspect-square overflow-hidden" style={{ background: THEME.light }}>
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                    {person.name}
                  </div>
                  <div
                    className="mt-0.5 text-[11px]"
                    style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                  >
                    {person.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 6. Pricing ── */}
        <section id="pricing" className="px-5 sm:px-10 py-20 sm:py-28">
          <div className="mb-10 max-w-[640px]">
            <SectionKicker>Pricing</SectionKicker>
            <SectionHeadline>Flat tiers. Simple to buy.</SectionHeadline>
            <SectionSubhead>
              Start free with the Pilot tier. Upgrade when your program grows.
            </SectionSubhead>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-2xl border p-6"
                style={{
                  background: THEME.white,
                  borderColor: t.featured ? THEME.primary : THEME.border,
                  boxShadow: t.featured
                    ? '0 1px 0 rgba(24,24,27,0.02), 0 30px 60px -30px rgba(5,150,105,0.35)'
                    : '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
                  transform: t.featured ? 'translateY(-8px)' : 'none',
                }}
              >
                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
                >
                  {t.name}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span
                    className="text-[38px] font-bold leading-none"
                    style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
                  >
                    {t.price}
                  </span>
                </div>
                <div
                  className="mt-1 text-[11px]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
                >
                  {t.period}
                </div>
                <ul className="mt-5 flex flex-col gap-2">
                  {t.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-[12px]"
                      style={{ color: THEME.textSecondary }}
                    >
                      <span
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: THEME.primary }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className="mt-auto block rounded-full px-4 py-2.5 text-center text-[12px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
                  style={{
                    background: t.featured ? THEME.primary : THEME.white,
                    color: t.featured ? THEME.white : THEME.textPrimary,
                    border: `1px solid ${t.featured ? THEME.primary : THEME.border}`,
                    fontFamily: THEME.fontMono,
                    marginTop: 20,
                  }}
                >
                  {t.cta} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. FAQ ── */}
        <section id="faq" className="px-5 sm:px-10 py-20 sm:py-28" style={{ background: THEME.light }}>
          <div className="mx-auto max-w-[800px]">
            <div className="mb-10 text-center">
              <SectionKicker>FAQ</SectionKicker>
              <SectionHeadline>Common questions.</SectionHeadline>
            </div>
            <div className="flex flex-col gap-2">
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl border"
                    style={{ background: THEME.white, borderColor: isOpen ? THEME.primary : THEME.border }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
                    >
                      <span
                        className="text-[14px] font-semibold"
                        style={{ color: THEME.textPrimary }}
                      >
                        {faq.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0 text-[18px] leading-none"
                        style={{ color: THEME.primary, fontFamily: THEME.fontMono }}
                      >
                        +
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                          <div
                            className="border-t px-5 pb-5 pt-3 text-[13px] leading-relaxed"
                            style={{ borderColor: THEME.border, color: THEME.textSecondary }}
                          >
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 8. Close CTA ── */}
        <section className="px-5 sm:px-10 py-20 sm:py-28" style={{ background: THEME.darkDeep, color: THEME.white }}>
          <div className="max-w-[720px]">
            <SectionKicker>Get started</SectionKicker>
            <h2
              className="text-[clamp(28px,4.2vw,44px)] font-semibold leading-[1.05]"
              style={{ fontFamily: THEME.fontSerif }}
            >
              Stop stitching tabs. Start coaching.
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed opacity-80">
              Download synth. to your laptop or phone and connect your first source in under 60 seconds.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={installed}
                className="rounded-full px-6 py-3 text-[13px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02] disabled:opacity-60"
                style={{
                  background: THEME.accent,
                  color: THEME.darkDeep,
                  fontFamily: THEME.fontMono,
                }}
              >
                {installed ? 'Installed' : 'Download app'}
              </button>
              <Link
                to="/coach/dashboard"
                className="rounded-full border px-6 py-3 text-[13px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-100"
                style={{
                  borderColor: 'rgba(255,255,255,0.25)',
                  color: THEME.white,
                  fontFamily: THEME.fontMono,
                }}
              >
                Try the demo
              </Link>
            </div>
          </div>
        </section>

        {/* ── 9. Footer ── */}
        <footer style={{ background: THEME.darkDeep, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid gap-10 px-5 sm:px-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[20px] font-semibold leading-none"
                  style={{ fontFamily: THEME.fontMono, color: THEME.white }}
                >
                  synth<span style={{ color: THEME.accent }}>.</span>
                </span>
              </div>
              <p
                className="mt-3 max-w-[280px] text-[12px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                Every data signal. One platform. Built for coaches, by athletes.
              </p>
            </div>

            {/* Product links */}
            <div>
              <div
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ fontFamily: THEME.fontMono, color: 'rgba(255,255,255,0.4)' }}
              >
                Product
              </div>
              <ul className="flex flex-col gap-2">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'Demo', href: '#demo' },
                  { label: 'FAQ', href: '#faq' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[12px] transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.6)', fontFamily: THEME.fontMono }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <div
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ fontFamily: THEME.fontMono, color: 'rgba(255,255,255,0.4)' }}
              >
                Company
              </div>
              <ul className="flex flex-col gap-2">
                {(
                  [
                    { label: 'About', href: '#team' },
                    { label: 'Contact', href: 'mailto:supportsynth@gmail.com' },
                    { label: 'Sign up', href: '/signup' },
                    { label: 'Sign in', href: '/login' },
                    { label: 'Join as athlete', href: '/join/demo' },
                  ] as const
                ).map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-[12px] transition-colors hover:text-white"
                        style={{ color: 'rgba(255,255,255,0.6)', fontFamily: THEME.fontMono }}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-[12px] transition-colors hover:text-white"
                        style={{ color: 'rgba(255,255,255,0.6)', fontFamily: THEME.fontMono }}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal + contact */}
            <div>
              <div
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ fontFamily: THEME.fontMono, color: 'rgba(255,255,255,0.4)' }}
              >
                Legal
              </div>
              <ul className="flex flex-col gap-2">
                <li>
                  <span
                    className="text-[12px]"
                    style={{ color: 'rgba(255,255,255,0.6)', fontFamily: THEME.fontMono }}
                  >
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span
                    className="text-[12px]"
                    style={{ color: 'rgba(255,255,255,0.6)', fontFamily: THEME.fontMono }}
                  >
                    Terms of Service
                  </span>
                </li>
              </ul>
              <div className="mt-5">
                <a
                  href="mailto:supportsynth@gmail.com"
                  className="text-[12px] transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.5)', fontFamily: THEME.fontMono }}
                >
                  supportsynth@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Copyright bar */}
          <div
            className="px-5 sm:px-10 py-5 text-[11px]"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.35)',
              fontFamily: THEME.fontMono,
            }}
          >
            © 2026 synth. All rights reserved.
          </div>
        </footer>
      </main>

      {/* ── iOS install instructions modal ── */}
      <AnimatePresence>
        {showIosTip && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close install instructions"
              className="absolute inset-0"
              style={{ background: 'rgba(12,10,9,0.55)', backdropFilter: 'blur(6px)' }}
              onClick={() => setShowIosTip(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="iOS install instructions"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-[440px] rounded-2xl p-6"
              style={{ background: THEME.white, border: `1px solid ${THEME.border}` }}
            >
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
              >
                Install on {isIos ? 'iOS' : 'this browser'}
              </div>
              <h3 className="mt-1 text-[20px] font-semibold" style={{ color: THEME.textPrimary }}>
                Add synth. to your home screen
              </h3>
              <ol className="mt-4 flex flex-col gap-3 text-[13px]" style={{ color: THEME.textSecondary }}>
                {isIos ? (
                  <>
                    <li>1. Tap the <strong>Share</strong> button in Safari's toolbar.</li>
                    <li>2. Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                    <li>3. Tap <strong>Add</strong>. synth. will appear as a standalone app.</li>
                  </>
                ) : (
                  <>
                    <li>Your browser doesn't expose the install prompt to us right now. Look for an "Install" option in your browser's address bar or menu.</li>
                    <li>On Chrome/Edge/Brave: click the <strong>+</strong> icon in the address bar.</li>
                    <li>On Firefox / Safari desktop: use <strong>File → Add to Dock</strong>.</li>
                  </>
                )}
              </ol>
              <button
                type="button"
                onClick={() => setShowIosTip(false)}
                className="mt-5 rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-wider"
                style={{
                  background: THEME.primary,
                  color: THEME.white,
                  fontFamily: THEME.fontMono,
                }}
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
