import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { AUTH_LIGHT } from './authTokens'

const T = AUTH_LIGHT

type AuthTab = 'login' | 'signup'

/**
 * The professional auth shell: a light form panel on the left, a slow image-grid
 * carousel on the right (Framer-style). Both /login and /signup render through
 * here. The right panel is hidden below `lg`, where the form takes the full width.
 */
export function AuthLayout({
  tab,
  children,
}: {
  tab: AuthTab
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh w-full" style={{ background: T.BG, color: T.INK, fontFamily: T.BODY }}>
      {/* LEFT — form panel */}
      <main className="relative flex w-full flex-col lg:w-[52%] lg:min-w-[520px]">
        {/* Top bar — logo + back */}
        <div className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Link to="/" className="inline-flex items-center" aria-label="synth home">
            <img src="/logos/synth-logos/synth-logo-dark.svg" alt="synth" className="h-6 w-auto" />
          </Link>
          <Link
            to="/"
            className="text-[12px] font-medium transition-colors hover:opacity-70"
            style={{ color: T.MUTED, fontFamily: T.BODY }}
          >
            ← Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16 pt-4 sm:px-10">
          <div className="w-full max-w-[440px]">
            <TabSwitcher tab={tab} />
            {children}
          </div>
        </div>

        {/* Bottom trust line */}
        <div
          className="flex items-center gap-2 px-6 py-5 text-[11px] uppercase tracking-[0.24em] sm:px-10"
          style={{ color: T.DIM, fontFamily: T.MONO }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: T.GREEN }} />
          Backed by Berkeley SkyDeck · Pad-13
        </div>
      </main>

      {/* RIGHT — image-grid carousel */}
      <aside
        className="relative hidden overflow-hidden lg:block lg:flex-1"
        style={{ background: '#0A0C1B', borderLeft: `1px solid ${T.HAIR}` }}
        aria-hidden
      >
        <ImageGridCarousel />
      </aside>
    </div>
  )
}

/* ─── Image-grid carousel ─────────────────────────────────────────────────── */

const COLUMNS: string[][] = [
  [
    '/auth-slides/slide-1.png',
    '/solution-mockups/synth-team-overview.png',
    '/coach_tools_images/image_erg_screen.PNG',
    '/team/star-rose.png',
  ],
  [
    '/auth-slides/slide-2.png',
    '/coach_tools_images/google-sheets-rowing-erg-intervals.png',
    '/solution-mockups/rowiq-lineup.png',
    '/team/matthew-waddell.png',
  ],
  [
    '/auth-slides/slide-3.png',
    '/coach_tools_images/team_works_calaender.PNG',
    '/auth-slides/slide-4.png',
    '/team/lily-pember.png',
  ],
]

function ImageGridCarousel() {
  const reduce = useReducedMotion()
  return (
    <div className="absolute inset-0">
      <div className="flex h-full gap-4 p-4">
        {COLUMNS.map((imgs, idx) => (
          <MarqueeColumn
            key={idx}
            images={imgs}
            // Alternate direction per column; vary duration so it never locksteps.
            direction={idx % 2 === 0 ? 'up' : 'down'}
            durationSec={reduce ? 0 : 46 + idx * 7}
          />
        ))}
      </div>

      {/* Top + bottom fades so tiles enter/leave softly. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{ background: 'linear-gradient(180deg, #0A0C1B 0%, rgba(10,12,27,0) 100%)' }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
        style={{ background: 'linear-gradient(0deg, #0A0C1B 0%, rgba(10,12,27,0) 100%)' }}
      />
      {/* Subtle brand tint. */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(16,185,129,0.18) 0%, transparent 60%)' }}
      />
    </div>
  )
}

function MarqueeColumn({
  images,
  direction,
  durationSec,
}: {
  images: string[]
  direction: 'up' | 'down'
  durationSec: number
}) {
  // Two copies stacked so the -50% loop is seamless.
  const doubled = [...images, ...images]
  const animate =
    durationSec > 0
      ? { y: direction === 'up' ? ['0%', '-50%'] : ['-50%', '0%'] }
      : undefined

  return (
    <div className="relative h-full flex-1 overflow-hidden">
      <motion.div
        className="flex flex-col gap-4"
        animate={animate}
        transition={durationSec > 0 ? { duration: durationSec, ease: 'linear', repeat: Infinity } : undefined}
      >
        {doubled.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="overflow-hidden rounded-2xl"
            style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}
          >
            <img src={src} alt="" loading="lazy" className="block w-full object-cover" style={{ aspectRatio: '3 / 4' }} />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ─── Tab switcher ────────────────────────────────────────────────────────── */

function TabSwitcher({ tab }: { tab: AuthTab }) {
  const item = (to: string, label: string, active: boolean) => (
    <Link
      to={to}
      className="flex items-center justify-center rounded-md py-2.5 text-[13px] font-semibold transition-all"
      style={{
        background: active ? T.INK : 'transparent',
        color: active ? '#fff' : T.MUTED,
        fontFamily: T.BODY,
      }}
    >
      {label}
    </Link>
  )
  return (
    <div
      className="mb-8 grid grid-cols-2 gap-1 rounded-lg p-1"
      style={{ background: T.SUNK, border: `1px solid ${T.HAIR}` }}
    >
      {item('/signup', 'Join waitlist', tab === 'signup')}
      {item('/login', 'Log in', tab === 'login')}
    </div>
  )
}
