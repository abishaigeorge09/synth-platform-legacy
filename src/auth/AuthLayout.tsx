import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AUTH_LIGHT } from './authTokens'

const T = AUTH_LIGHT

type AuthTab = 'login' | 'signup'

/**
 * Auth shell modelled on the reference: one full-bleed light scene behind
 * everything, a brand hero on the left, and the form as a floating white card
 * on the right. Fully light — no dark panel. Below `lg` the hero drops away and
 * the card centers with the logo above it.
 */
export function AuthLayout({
  tab,
  children,
}: {
  tab: AuthTab
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden" style={{ color: T.INK, fontFamily: T.BODY }}>
      <SceneBackground />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-[1140px] flex-col justify-center px-6 py-10 sm:px-10">
        {/* Mobile logo (hero is hidden below lg) */}
        <Link to="/" className="mb-8 flex justify-center lg:hidden" aria-label="synth home">
          <img src="/logos/synth-logos/synth-logo-dark.svg" alt="synth" className="h-6 w-auto" />
        </Link>

        <div className="grid items-center gap-14 lg:grid-cols-[1fr_460px]">
          <Hero />

          <div className="flex w-full justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[460px] rounded-[28px] p-6 sm:p-8"
              style={{
                background: '#FFFFFF',
                border: `1px solid ${T.HAIR}`,
                boxShadow: '0 24px 70px rgba(20,40,80,0.12), 0 2px 10px rgba(20,40,80,0.05)',
              }}
            >
              <TabSwitcher tab={tab} />
              {children}
            </motion.div>
          </div>
        </div>

        <div className="mt-8 flex justify-center lg:hidden">
          <Link to="/" className="text-[12px] font-medium" style={{ color: T.MUTED }}>← Back to site</Link>
        </div>
      </div>
    </div>
  )
}

/* ─── Left hero ───────────────────────────────────────────────────────────── */

const BACKERS = [
  { src: '/logos/backers/berkeley-skydeck.svg', alt: 'Berkeley SkyDeck', h: 22 },
  { src: '/logos/backers/pad-13.svg', alt: 'Pad-13', h: 20 },
  { src: '/logos/backers/nvidia-inception.svg', alt: 'NVIDIA Inception', h: 22 },
  { src: '/logos/backers/google-for-startups.png', alt: 'Google for Startups', h: 20 },
  { src: '/logos/backers/microsoft-for-startups.png', alt: 'Microsoft for Startups', h: 20 },
]

function Hero() {
  return (
    <div className="hidden lg:block">
      <Link to="/" aria-label="synth home">
        <img src="/logos/synth-logos/synth-logo-dark.svg" alt="synth" className="h-7 w-auto" />
      </Link>

      <h1
        className="mt-10 tracking-[-0.02em]"
        style={{ color: T.INK, fontFamily: T.SERIF, fontWeight: 600, fontSize: 46, lineHeight: 1.08, textWrap: 'balance' as const }}
      >
        Every data signal.
        <br />
        One platform<span style={{ color: T.GREEN_DEEP }}>.</span>
      </h1>
      <p className="mt-5 max-w-[420px] text-[16px] leading-[1.55]" style={{ color: T.MUTED }}>
        Connect the tools you already use. synth synthesizes the rest into one readable picture, for
        athletes and coaches alike.
      </p>

      <div className="mt-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: T.DIM, fontFamily: T.MONO }}>
          Backed by
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-4">
          {BACKERS.map((b) => (
            <img
              key={b.src}
              src={b.src}
              alt={b.alt}
              style={{ height: b.h, width: 'auto', filter: 'grayscale(1)', opacity: 0.5 }}
              className="object-contain"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Full-bleed scene ────────────────────────────────────────────────────────
 *  A light gradient wash with faint flowing lines converging from the left,
 *  echoing the reference. Pure CSS/SVG — no external image, crisp at any size. */

function SceneBackground() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #EEF4FF 0%, #F6FAFF 46%, #EFFBF4 100%)' }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="rgba(16,185,129,0.20)" strokeWidth="1.4">
          <path d="M-120,470 C 60,470 150,452 250,450" />
          <path d="M-120,360 C 60,392 150,444 250,450" />
          <path d="M250,450 C 520,450 720,170 1560,130" />
          <path d="M250,450 C 540,450 740,320 1560,300" />
        </g>
        <g stroke="rgba(59,130,246,0.16)" strokeWidth="1.4">
          <path d="M250,450 C 540,450 740,470 1560,485" />
          <path d="M250,450 C 520,450 720,610 1560,650" />
          <path d="M250,450 C 500,450 700,770 1560,830" />
        </g>
        <g fill="#10B981">
          <circle cx="250" cy="450" r="4.5" opacity="0.55" />
          <circle cx="560" cy="336" r="3.5" opacity="0.4" />
          <circle cx="620" cy="606" r="3.5" opacity="0.35" />
        </g>
      </svg>
      {/* Soft glows for depth. */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(60% 50% at 12% 30%, rgba(16,185,129,0.10) 0%, transparent 70%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(50% 45% at 90% 80%, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
      />
    </div>
  )
}

/* ─── Tab switcher (inside the card) ──────────────────────────────────────── */

function TabSwitcher({ tab }: { tab: AuthTab }) {
  const item = (to: string, label: string, active: boolean) => (
    <Link
      to={to}
      className="flex items-center justify-center rounded-md py-2.5 text-[13px] font-semibold transition-all"
      style={{ background: active ? T.INK : 'transparent', color: active ? '#fff' : T.MUTED, fontFamily: T.BODY }}
    >
      {label}
    </Link>
  )
  return (
    <div className="mb-7 grid grid-cols-2 gap-1 rounded-lg p-1" style={{ background: T.SUNK, border: `1px solid ${T.HAIR}` }}>
      {item('/signup', 'Join waitlist', tab === 'signup')}
      {item('/login', 'Log in', tab === 'login')}
    </div>
  )
}
