import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AUTH_TOKENS } from './authTokens'

const { GREEN, MUTED, DIM, HAIR, SERIF, MONO, BODY, FG, BG } = AUTH_TOKENS

/** Shared split-panel auth shell — brand on the left, form on the right.
 *  Matches the synth landing aesthetic: dark canvas, Fraunces serif for
 *  the headline, JetBrains Mono for chips/labels, soft hero photo behind
 *  the left panel with a dark wash. */

type AuthTab = 'login' | 'signup'

export function AuthLayout({
  tab,
  children,
}: {
  tab: AuthTab
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh w-full" style={{ background: BG, color: FG, fontFamily: BODY }}>
      {/* LEFT — brand panel */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden px-10 py-10 lg:flex"
        style={{ width: '46%', minWidth: 480 }}
      >
        <div className="absolute inset-0 -z-10" aria-hidden>
          <img
            src="/hero-landscape.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: 'center 40%' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.85) 100%)' }}
          />
          <div
            className="absolute inset-0 mix-blend-overlay"
            style={{ background: `radial-gradient(ellipse at 30% 60%, rgba(16,185,129,0.14) 0%, transparent 65%)` }}
          />
        </div>

        <Link to="/" className="flex items-center gap-2 text-[20px] font-semibold" style={{ fontFamily: MONO, color: FG }}>
          synth<span style={{ color: GREEN }}>.</span>
        </Link>

        <div className="flex flex-col gap-7">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="tracking-[-0.01em]"
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(36px, 4vw, 64px)',
              fontWeight: 500,
              lineHeight: 1.04,
            }}
          >
            Every signal you generate.<br />
            <span style={{ color: GREEN }}>One screen.</span>
          </motion.h1>

          <p className="max-w-[440px] text-[15px] leading-relaxed" style={{ color: MUTED }}>
            synth pulls every tool you already use — Whoop, Strava, Oura, Garmin, Apple Health, your training spreadsheet — into one morning glance.
          </p>

          <ul className="flex flex-col gap-3 pt-2">
            {[
              'Recovery readiness, daily.',
              'Patterns you can\'t see yourself.',
              'No rip-and-replace — keep your tools.',
            ].map(f => (
              <li key={f} className="flex items-start gap-3 text-[13px]" style={{ fontFamily: MONO, color: FG }}>
                <span
                  className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.12)', border: `1px solid ${GREEN}`, color: GREEN }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 5l2 2 4-4" />
                  </svg>
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: DIM }}>
          <span style={{ color: GREEN }}>●</span>
          <span>Built by World Championship rowers</span>
          <span style={{ color: HAIR }}>·</span>
          <span>Backed by Berkeley SkyDeck</span>
        </div>
      </aside>

      {/* RIGHT — form column */}
      <main className="relative flex flex-1 flex-col" style={{ background: BG }}>
        <div className="flex items-center justify-between px-5 py-5 lg:hidden" style={{ borderBottom: `1px solid ${HAIR}` }}>
          <Link to="/" className="text-[18px] font-semibold" style={{ fontFamily: MONO, color: FG }}>
            synth<span style={{ color: GREEN }}>.</span>
          </Link>
          <Link to="/" className="text-[11px] uppercase tracking-[0.28em]" style={{ fontFamily: MONO, color: MUTED }}>
            ← back
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-[440px]">
            <TabSwitcher tab={tab} />
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

function TabSwitcher({ tab }: { tab: AuthTab }) {
  return (
    <div
      className="mb-8 grid grid-cols-2 overflow-hidden rounded-md"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${AUTH_TOKENS.FAINT}`, fontFamily: MONO }}
    >
      <Link
        to="/signup"
        className="flex items-center justify-center py-2.5 text-[12px] transition-colors"
        style={{
          background: tab === 'signup' ? GREEN : 'transparent',
          color: tab === 'signup' ? '#000' : MUTED,
          fontWeight: tab === 'signup' ? 600 : 400,
        }}
      >
        Join waitlist
      </Link>
      <Link
        to="/login"
        className="flex items-center justify-center py-2.5 text-[12px] transition-colors"
        style={{
          background: tab === 'login' ? GREEN : 'transparent',
          color: tab === 'login' ? '#000' : MUTED,
          fontWeight: tab === 'login' ? 600 : 400,
        }}
      >
        Log in
      </Link>
    </div>
  )
}
