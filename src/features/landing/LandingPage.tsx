import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { THEME } from '../../lib/theme'
import { useInstallPrompt } from './useInstallPrompt'
import {
  DashboardIllustration,
  AthletesIllustration,
  SourcesIllustration,
  LineupsIllustration,
  SessionTimerIllustration,
  SynthAiIllustration,
} from '../../shared/illustrations/sidebarIllustrations'

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

export function LandingPage() {
  const { canInstall, installed, isIos, trigger } = useInstallPrompt()
  const [showIosTip, setShowIosTip] = useState(false)

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
      {/* Top nav */}
      <header className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-2">
          <span
            className="text-[22px] font-semibold leading-none"
            style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
          >
            synth<span style={{ color: THEME.accent }}>.</span>
          </span>
        </div>
        <nav
          className="flex items-center gap-6 text-[12px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          <a href="#features" className="hover:text-black">Features</a>
          <a href="#pricing" className="hover:text-black">Pricing</a>
          <Link to="/login" className="hover:text-black">Sign in</Link>
          <button
            type="button"
            onClick={handleDownload}
            disabled={installed}
            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02] disabled:opacity-60"
            style={{
              background: THEME.primary,
              color: THEME.white,
              fontFamily: THEME.fontMono,
              boxShadow: '0 12px 28px -14px rgba(5,150,105,0.5)',
            }}
          >
            {installed ? 'Installed ✓' : 'Download'}
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden px-10 pb-24 pt-16"
        style={{
          background: `linear-gradient(165deg, ${THEME.primaryDarker} 0%, ${THEME.primary} 45%, ${THEME.primaryLight} 180%)`,
          color: THEME.white,
        }}
      >
        <motion.div
          className="max-w-[840px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ fontFamily: THEME.fontMono, color: 'rgba(255,255,255,0.8)' }}
          >
            Coach data · unified
          </div>
          <h1
            className="mb-6 text-[clamp(44px,7vw,88px)] font-semibold leading-[0.95] tracking-[-0.03em]"
            style={{ fontFamily: THEME.fontMono }}
          >
            Every data signal.
            <br />
            One platform.
          </h1>
          <p
            className="mb-8 max-w-[580px] text-[18px] leading-relaxed opacity-95"
            style={{ fontFamily: THEME.fontSerif }}
          >
            synth. connects every tool your program already uses, scrapes and synthesizes the data, and hands
            coaches and athletes one surface to act on.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/coach/dashboard"
              className="rounded-full px-6 py-3 text-[13px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
              style={{
                background: THEME.white,
                color: THEME.primaryDarker,
                fontFamily: THEME.fontMono,
              }}
            >
              Enter demo dashboard
            </Link>
            <button
              type="button"
              onClick={handleDownload}
              disabled={installed}
              className="rounded-full border px-6 py-3 text-[13px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-100 disabled:opacity-60"
              style={{
                borderColor: 'rgba(255,255,255,0.45)',
                color: THEME.white,
                fontFamily: THEME.fontMono,
                background: 'transparent',
              }}
            >
              {installed ? '✓ Installed' : 'Download app'}
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features grid */}
      <section id="features" className="px-10 py-20">
        <div className="mb-10 max-w-[640px]">
          <div
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
          >
            What's in the box
          </div>
          <h2
            className="text-[clamp(28px,4.2vw,44px)] font-semibold leading-[1.05]"
            style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
          >
            Six surfaces. One source of truth.
          </h2>
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

      {/* Pricing */}
      <section id="pricing" className="px-10 py-20" style={{ background: THEME.light }}>
        <div className="mb-10 max-w-[640px]">
          <div
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
          >
            Pricing
          </div>
          <h2
            className="text-[clamp(28px,4.2vw,44px)] font-semibold leading-[1.05]"
            style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
          >
            Flat tiers. Simple to buy.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border p-6"
              style={{
                background: t.featured ? THEME.white : THEME.white,
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
              <button
                type="button"
                className="mt-auto rounded-full px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
                style={{
                  background: t.featured ? THEME.primary : THEME.white,
                  color: t.featured ? THEME.white : THEME.textPrimary,
                  border: `1px solid ${t.featured ? THEME.primary : THEME.border}`,
                  fontFamily: THEME.fontMono,
                  marginTop: 20,
                }}
              >
                {t.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Close CTA */}
      <section className="px-10 py-20" style={{ background: THEME.darkDeep, color: THEME.white }}>
        <div className="max-w-[720px]">
          <div
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.accent }}
          >
            Get started
          </div>
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
              {installed ? '✓ Installed' : 'Download app'}
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
              Try the demo first
            </Link>
          </div>
        </div>
      </section>

      <footer
        className="px-10 py-8 text-[11px]"
        style={{ background: THEME.darkDeep, color: 'rgba(255,255,255,0.5)', fontFamily: THEME.fontMono }}
      >
        © 2026 synth. — Every data signal. One platform. · synthsports.com
      </footer>

      {/* iOS install instructions modal */}
      <AnimatePresence>
        {showIosTip && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(12,10,9,0.55)', backdropFilter: 'blur(6px)' }}
              onClick={() => setShowIosTip(false)}
            />
            <motion.div
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
                    <li>On Chrome/Edge/Brave: click the <strong>⊕</strong> icon in the address bar.</li>
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
