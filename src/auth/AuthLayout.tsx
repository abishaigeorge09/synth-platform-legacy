import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AUTH_LIGHT } from './authTokens'

const T = AUTH_LIGHT

type AuthTab = 'login' | 'signup'

/**
 * The professional auth shell: a light form panel on the left, a cross-fading
 * photo carousel on the right. Both /login and /signup render through here. The
 * carousel is hidden below `lg`, where the form takes the full width.
 */
export function AuthLayout({
  tab,
  children,
}: {
  tab: AuthTab
  children: React.ReactNode
}) {
  return (
    <div
      className="flex min-h-dvh w-full"
      style={{
        // Soft light wash (no dark panel), matching the reference feel.
        background: 'linear-gradient(160deg, #F4F8FF 0%, #FFFFFF 55%)',
        color: T.INK,
        fontFamily: T.BODY,
      }}
    >
      {/* LEFT — form panel */}
      <main className="relative flex w-full flex-col lg:w-[52%] lg:min-w-[520px]">
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

        <div
          className="flex items-center gap-2 px-6 py-5 text-[11px] uppercase tracking-[0.24em] sm:px-10"
          style={{ color: T.DIM, fontFamily: T.MONO }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: T.GREEN }} />
          Backed by Berkeley SkyDeck · Pad-13
        </div>
      </main>

      {/* RIGHT — photo carousel */}
      <aside className="relative hidden overflow-hidden lg:block lg:flex-1" aria-hidden>
        <PhotoCarousel />
      </aside>
    </div>
  )
}

/* ─── Photo carousel ──────────────────────────────────────────────────────────
 *  The original scene set only — 4 full-bleed sport photos cross-fading. Drop
 *  replacements at /public/auth-slides/slide-{1..4}.png. A light gradient
 *  placeholder shows if a file is missing so the panel never goes blank. */

const SLIDES = [
  { src: '/auth-slides/slide-1.png', tint: '#EAF1FF' },
  { src: '/auth-slides/slide-2.png', tint: '#F0ECFF' },
  { src: '/auth-slides/slide-3.png', tint: '#E9F5FF' },
  { src: '/auth-slides/slide-4.png', tint: '#EAFBF1' },
] as const

const SLIDE_MS = 6000

function PhotoCarousel() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % SLIDES.length), SLIDE_MS)
    return () => window.clearInterval(id)
  }, [])
  const slide = SLIDES[i]

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.src}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <SlideMedia src={slide.src} tint={slide.tint} />
        </motion.div>
      </AnimatePresence>

      {/* Soft bottom scrim just for the dots — keeps the panel light overall. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.28) 0%, transparent 100%)' }}
      />
      <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-2">
        {SLIDES.map((_, idx) => (
          <span
            key={idx}
            className="transition-all"
            style={{
              width: idx === i ? 22 : 6,
              height: 6,
              borderRadius: 999,
              background: idx === i ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function SlideMedia({ src, tint }: { src: string; tint: string }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  return (
    <div className="absolute inset-0">
      {/* Light placeholder — no dark panel. */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${tint} 0%, #FFFFFF 100%)` }} />
      {!errored && (
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  )
}

/* ─── Tab switcher ────────────────────────────────────────────────────────── */

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
    <div
      className="mb-8 grid grid-cols-2 gap-1 rounded-lg p-1"
      style={{ background: '#FFFFFF', border: `1px solid ${T.HAIR}` }}
    >
      {item('/signup', 'Join waitlist', tab === 'signup')}
      {item('/login', 'Log in', tab === 'login')}
    </div>
  )
}
