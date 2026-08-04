import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AUTH_DARK } from './authTokens'

const T = AUTH_DARK

type AuthTab = 'login' | 'signup'

/**
 * Dark auth shell: the sport photos cross-fade full-bleed behind a heavy black
 * scrim, a brand hero sits on the left, and the form floats in a glass card on
 * the right. The card is height-capped and scrolls internally, so a long survey
 * step never grows the page (only the card body scrolls).
 */
export function AuthLayout({
  tab,
  children,
}: {
  tab: AuthTab
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden" style={{ background: '#050506', color: T.INK, fontFamily: T.BODY }}>
      <PhotoBackdrop />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-[1140px] flex-col justify-center px-6 py-8 sm:px-10">
        {/* Mobile logo (hero hidden below lg) */}
        <Link to="/" className="mb-6 flex justify-center lg:hidden" aria-label="synth home">
          <img src="/logos/synth-logos/synth-logo-white.svg" alt="synth" className="h-6 w-auto" />
        </Link>

        <div className="grid items-center gap-14 lg:grid-cols-[1fr_460px]">
          <Hero />

          <div className="flex w-full justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full max-w-[460px] flex-col rounded-[28px] p-6 sm:p-8"
              style={{
                // Height-capped glass card; body scrolls, page does not.
                maxHeight: 'calc(100dvh - 48px)',
                background: 'rgba(16,16,20,0.72)',
                backdropFilter: 'blur(20px) saturate(130%)',
                WebkitBackdropFilter: 'blur(20px) saturate(130%)',
                border: `1px solid ${T.HAIR}`,
                boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
              }}
            >
              <TabSwitcher tab={tab} />
              {/* Scrollable body — the fix for the box extending the page. */}
              <div className="synth-scroll -mr-2 overflow-y-auto pr-2" style={{ minHeight: 0, flex: '1 1 auto' }}>
                {children}
              </div>
            </motion.div>
          </div>
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
        <img src="/logos/synth-logos/synth-logo-white.svg" alt="synth" className="h-7 w-auto" />
      </Link>

      <h1
        className="mt-10 tracking-[-0.02em]"
        style={{ color: T.INK, fontFamily: T.SERIF, fontWeight: 600, fontSize: 46, lineHeight: 1.08, textWrap: 'balance' as const }}
      >
        Every data signal.
        <br />
        One platform<span style={{ color: T.GREEN_DEEP }}>.</span>
      </h1>
      <p className="mt-5 max-w-[420px] text-[16px] leading-[1.55]" style={{ color: 'rgba(255,255,255,0.72)' }}>
        Connect the tools you already use. synth synthesizes the rest into one readable picture, for
        athletes and coaches alike.
      </p>

      <div className="mt-12 max-w-[440px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: T.MONO }}>
          Backed by
        </p>
        <BackerMarquee />
      </div>
    </div>
  )
}

/* Backer logos as a scrolling carousel. Each logo sits on its own white chip so
 * it reads on the dark surface regardless of the source colour (no invert
 * filter, which turned the colour PNGs into white blocks). */
function BackerMarquee() {
  const loop = [...BACKERS, ...BACKERS]
  return (
    <div
      className="mt-4 overflow-hidden"
      style={{ maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}
    >
      <motion.div
        className="flex w-max items-center gap-3"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
      >
        {loop.map((b, i) => (
          <div
            key={`${b.src}-${i}`}
            className="flex h-11 shrink-0 items-center rounded-xl px-3.5"
            style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <img src={b.src} alt={b.alt} style={{ height: b.h, width: 'auto' }} className="object-contain" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ─── Full-bleed photo backdrop (dark) ────────────────────────────────────────
 *  The original scene set — 4 sport photos cross-fading behind a heavy black
 *  scrim so the surface reads dark while the imagery still shows through. Drop
 *  replacements at /public/auth-slides/slide-{1..4}.png. */

const SLIDES = ['/auth-slides/slide-1.png', '/auth-slides/slide-2.png', '/auth-slides/slide-3.png', '/auth-slides/slide-4.png'] as const
const SLIDE_MS = 6000

function PhotoBackdrop() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % SLIDES.length), SLIDE_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="absolute inset-0" aria-hidden>
      <AnimatePresence mode="wait">
        <motion.div
          key={SLIDES[i]}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img src={SLIDES[i]} alt="" className="h-full w-full object-cover" />
        </motion.div>
      </AnimatePresence>

      {/* Dark scrim — still dark, but light enough that the photos read. Left
          side stays darker so the hero text stays legible. */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,5,6,0.52) 0%, rgba(5,5,6,0.42) 42%, rgba(5,5,6,0.78) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(5,5,6,0.86) 0%, rgba(5,5,6,0.34) 54%, rgba(5,5,6,0.5) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(70% 60% at 20% 30%, rgba(16,185,129,0.10) 0%, transparent 70%)' }} />
    </div>
  )
}

/* ─── Tab switcher (inside the card) ──────────────────────────────────────── */

function TabSwitcher({ tab }: { tab: AuthTab }) {
  const item = (to: string, label: string, active: boolean) => (
    <Link
      to={to}
      className="flex items-center justify-center rounded-md py-2.5 text-[13px] font-semibold transition-all"
      style={{ background: active ? T.INK : 'transparent', color: active ? '#0A0A0C' : T.MUTED, fontFamily: T.BODY }}
    >
      {label}
    </Link>
  )
  return (
    <div className="mb-7 grid shrink-0 grid-cols-2 gap-1 rounded-lg p-1" style={{ background: T.FAINT, border: `1px solid ${T.HAIR}` }}>
      {item('/signup', 'Join waitlist', tab === 'signup')}
      {item('/login', 'Log in', tab === 'login')}
    </div>
  )
}
