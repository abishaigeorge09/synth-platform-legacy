import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { THEME } from '../../lib/theme'

/**
 * Phase 10 will flesh this into a full marketing site with PWA install.
 * For now it's a minimal brand cover that links into the coach experience
 * so the routing shell is traversable end-to-end.
 */
export function LandingPage() {
  return (
    <div
      className="flex min-h-dvh w-full flex-col"
      style={{
        background: `linear-gradient(165deg, ${THEME.primaryDarker} 0%, ${THEME.primary} 40%, ${THEME.primaryLight} 180%)`,
        color: THEME.white,
      }}
    >
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <span
            className="text-[22px] font-semibold leading-none"
            style={{ fontFamily: THEME.fontMono }}
          >
            synth
            <span style={{ color: THEME.primaryLight }}>.</span>
          </span>
        </div>
        <nav className="flex items-center gap-6 text-[13px]" style={{ fontFamily: THEME.fontMono }}>
          <a href="#features" className="opacity-80 hover:opacity-100">Features</a>
          <a href="#pricing" className="opacity-80 hover:opacity-100">Pricing</a>
          <button
            type="button"
            className="rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors"
            style={{ background: THEME.white, color: THEME.primaryDarker }}
          >
            Download
          </button>
        </nav>
      </header>

      <main className="flex flex-1 items-center px-8">
        <motion.div
          className="max-w-[780px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div
            className="mb-4 text-[11px] uppercase tracking-[0.22em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.primaryLight }}
          >
            Coach data · unified
          </div>
          <h1
            className="mb-6 text-[clamp(44px,7vw,84px)] font-semibold leading-[0.95] tracking-[-0.03em]"
            style={{ fontFamily: THEME.fontMono }}
          >
            Every data signal.
            <br />
            One platform.
          </h1>
          <p className="mb-8 max-w-[560px] text-[17px] leading-relaxed opacity-90" style={{ fontFamily: THEME.fontSerif }}>
            synth. connects every tool your program already uses, scrapes and synthesizes the data, and hands coaches and athletes
            one surface to act on.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/coach/dashboard"
              className="rounded-full px-6 py-3 text-[14px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
              style={{ background: THEME.white, color: THEME.primaryDarker, fontFamily: THEME.fontMono }}
            >
              Enter demo dashboard
            </Link>
            <Link
              to="/login"
              className="rounded-full border px-6 py-3 text-[14px] font-semibold uppercase tracking-wider opacity-90 transition-opacity hover:opacity-100"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: THEME.white, fontFamily: THEME.fontMono }}
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="px-8 pb-6 text-[11px] opacity-70" style={{ fontFamily: THEME.fontMono }}>
        Demo build · phase 0 scaffolding · coach and athlete experience in progress
      </footer>
    </div>
  )
}
