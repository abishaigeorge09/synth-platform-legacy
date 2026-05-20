import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AUTH_TOKENS } from './authTokens'

const { GREEN, MUTED, HAIR, FAINT, MONO, BODY, FG, BG } = AUTH_TOKENS

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
      {/* LEFT — full-bleed image slideshow, top-to-bottom.
       *  `isolate` is critical: it forces the aside to start its own
       *  stacking context so the slideshow's absolute layer can paint
       *  at z-0 without escaping behind the page-root black. */}
      <aside
        className="relative isolate hidden flex-col justify-between overflow-hidden px-10 py-10 lg:flex"
        style={{ width: '50%', minWidth: 480, borderRight: `1px solid ${HAIR}` }}
      >
        <SlideshowBackdrop />

        {/* Top — logo */}
        <Link
          to="/"
          className="relative z-10 inline-flex items-center text-[20px] font-semibold leading-none"
          style={{ fontFamily: MONO, color: FG, textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
        >
          synth<span style={{ color: GREEN }}>.</span>
        </Link>

        {/* Bottom-left — trust line, sits on top of the slide */}
        <div className="relative z-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: 'rgba(255,255,255,0.65)', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: GREEN }}
          />
          <span>Berkeley SkyDeck · Pad-13</span>
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
          <div className="w-full max-w-[420px]">
            <TabSwitcher tab={tab} />
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

/* ─── Slideshow — 4 full-bleed images, cross-fading on a 5s interval ──
 *  Drop your images at /public/auth-slides/slide-{1..4}.jpg (or .webp).
 *  Recommended size: 1600 × 2400 portrait, JPEG quality 80–85, < 500 KB
 *  each. Falls back to a labeled gradient placeholder if a file is
 *  missing so the slideshow still rotates while you prep assets. */

const SLIDES = [
  { src: '/auth-slides/slide-1.png', placeholder: '#0a1410' }, // trail runner — dawn ridge
  { src: '/auth-slides/slide-2.png', placeholder: '#100a14' }, // cyclist — mountain road
  { src: '/auth-slides/slide-3.png', placeholder: '#0a0f14' }, // open-water swimmer
  { src: '/auth-slides/slide-4.png', placeholder: '#0a140d' }, // team — football line of scrimmage
] as const

const SLIDE_DURATION_MS = 9000

function SlideshowBackdrop() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setI(v => (v + 1) % SLIDES.length)
    }, SLIDE_DURATION_MS)
    return () => window.clearInterval(id)
  }, [])

  const slide = SLIDES[i]

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <SlideMedia src={slide.src} placeholder={slide.placeholder} index={i} />
        </motion.div>
      </AnimatePresence>

      {/* Dark wash so logo + trust line stay readable */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 35%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Subtle green tint */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.10) 0%, transparent 65%)' }}
      />

      {/* Bottom-center indicators */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-2">
        {SLIDES.map((_, idx) => (
          <span
            key={idx}
            className="transition-all"
            style={{
              width: idx === i ? 22 : 6,
              height: 6,
              borderRadius: 999,
              background: idx === i ? GREEN : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* SlideMedia — shows the image; if the file 404s, shows a dark
 *  gradient placeholder with a tiny "// slide-N" label so the asset
 *  slot is obvious until images land. */
function SlideMedia({ src, placeholder, index }: { src: string; placeholder: string; index: number }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <div className="absolute inset-0">
      {/* Placeholder painted underneath — shows through if the image hasn't loaded yet */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 30%, rgba(16,185,129,0.12) 0%, transparent 55%), linear-gradient(180deg, ${placeholder} 0%, #050505 100%)`,
        }}
      />

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

      {/* If image missing, surface a tiny slot label so it's obvious where to drop assets */}
      {errored && (
        <div
          className="absolute left-6 top-24 inline-flex items-center gap-2 border px-3 py-1.5 text-[9px] uppercase tracking-[0.32em]"
          style={{
            borderColor: 'rgba(16,185,129,0.4)',
            background: 'rgba(0,0,0,0.55)',
            color: GREEN,
            fontFamily: MONO,
          }}
        >
          <span>// slide-{index + 1}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>· drop image here</span>
        </div>
      )}
    </div>
  )
}

/* ─── Tab switcher ────────────────────────────────────────────────── */

function TabSwitcher({ tab }: { tab: AuthTab }) {
  return (
    <div
      className="mb-7 grid grid-cols-2 overflow-hidden rounded-md"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${FAINT}`, fontFamily: MONO }}
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
