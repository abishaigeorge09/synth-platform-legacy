import { Link } from 'react-router-dom'
import {
  BG, ELEVATED, FG, MUTED, DIM, GREEN, HAIR, MONO, SERIF,
} from './tokens'
import { WordReveal } from './WordReveal'

/**
 * World-Labs-style site footer — one tall image block with the brand
 * headline, primary CTA, and a flat link column all overlaid on it.
 * No colored card, no panel: the image (placeholder for now) is the
 * background, and every other element floats on top.
 *
 * Replaces both the prior dark 5-column Footer and the per-page
 * ClosingCta call. Used site-wide via PageShell.
 *
 * To swap the placeholder for a real image, drop a file at
 * /public/footer-hero.png (or similar) and set IMAGE_SRC below.
 */

const IMAGE_SRC: string | null = null // ← user will set this later

const LINKS: { label: string; to: string; external?: boolean }[] = [
  { label: 'about',     to: '/why-us' },
  { label: 'platform',  to: '/platform' },
  { label: 'sports',    to: '/sports' },
  { label: 'pricing',   to: '/pricing' },
  { label: 'resources', to: '/resources' },
  { label: 'sign in',   to: '/login' },
  { label: 'sign up',   to: '/signup' },
  { label: 'terms',     to: '/legal/terms' },
  { label: 'privacy',   to: '/legal/privacy' },
  { label: 'security',  to: '/legal/security' },
]

export function FooterOverlay() {
  return (
    <footer
      className="relative w-full border-t px-5 sm:px-10 pt-10 pb-8"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      <div className="mx-auto w-full max-w-[1400px]">
        {/* Image block — fills the section, all text overlays it. */}
        <div
          className="relative overflow-hidden rounded-[28px]"
          style={{
            minHeight: 'clamp(420px, 60vh, 680px)',
            // Placeholder fill until IMAGE_SRC is set. Slightly lighter
            // than BG so the dashed border reads as "drop image here".
            background: IMAGE_SRC ? undefined : ELEVATED,
            border: IMAGE_SRC ? 'none' : `1px dashed ${HAIR}`,
          }}
        >
          {/* Background image (when present). */}
          {IMAGE_SRC ? (
            <img
              src={IMAGE_SRC}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            // Visible "placeholder" hint while no image is set. Sits
            // dead-center, low contrast so it doesn't fight the overlay.
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{ opacity: 0.35 }}
            >
              <span
                className="text-[11px] uppercase tracking-[0.42em]"
                style={{ fontFamily: MONO, color: DIM }}
              >
                placeholder image
              </span>
            </div>
          )}

          {/* Subtle bottom-to-top dark gradient so the overlay text
              keeps contrast even after a real photo is dropped in. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.55) 100%)',
            }}
          />

          {/* Centered headline + primary CTA */}
          <div className="relative z-10 flex min-h-[clamp(420px,60vh,680px)] flex-col items-center justify-center px-5 text-center">
            <WordReveal
              as="h2"
              text="start free."
              stagger={0.08}
              duration={0.7}
              className="tracking-[-0.012em]"
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(44px, 7.5vw, 128px)',
                lineHeight: 1.02,
                fontWeight: 500,
                color: '#ffffff',
              }}
            />

            <Link
              to="/signup"
              className="mt-10 inline-flex items-center gap-3 rounded-full px-7 py-4 text-[13px] font-semibold uppercase tracking-[0.24em] transition-transform duration-150 hover:scale-[1.02]"
              style={{
                background: '#18181b',
                color: '#ffffff',
                fontFamily: MONO,
                boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 12px 36px rgba(0,0,0,0.45)',
              }}
            >
              sign up
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Bottom-left link column, overlaid */}
          <nav
            aria-label="Footer"
            className="absolute bottom-8 left-6 z-10 hidden flex-col gap-2.5 sm:left-10 sm:flex"
          >
            {LINKS.map((l) =>
              l.external ? (
                <a
                  key={l.to}
                  href={l.to}
                  className="text-[15px] leading-[1.1] transition-opacity hover:opacity-100"
                  style={{ color: '#ffffff', opacity: 0.85, fontFamily: 'inherit' }}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-[15px] leading-[1.1] transition-opacity hover:opacity-100"
                  style={{ color: '#ffffff', opacity: 0.85, fontFamily: 'inherit' }}
                >
                  {l.label}
                </Link>
              ),
            )}
          </nav>

          {/* Mobile link grid — sits below the headline since the
              left-overlay column would crowd on narrow screens. */}
          <div className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-3 px-6 pb-10 sm:hidden">
            {LINKS.map((l) =>
              l.external ? (
                <a
                  key={l.to}
                  href={l.to}
                  className="text-[14px] leading-[1.2]"
                  style={{ color: '#ffffff', opacity: 0.85 }}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-[14px] leading-[1.2]"
                  style={{ color: '#ffffff', opacity: 0.85 }}
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>
        </div>

        {/* Utility bar below the image block */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left: tiny synth logo */}
          <Link to="/" className="flex items-center gap-2">
            <span
              className="text-[18px] font-bold leading-none tracking-[-0.02em]"
              style={{ fontFamily: MONO, color: FG }}
            >
              synth<span style={{ color: GREEN }}>.</span>
            </span>
          </Link>

          {/* Center: copyright + trademark */}
          <div
            className="text-center text-[10px] uppercase tracking-[0.32em]"
            style={{ fontFamily: MONO, color: DIM }}
          >
            <div>© 2026 synth · all rights reserved</div>
            <div className="mt-1">synth™ is a trademark of its respective owner</div>
          </div>

          {/* Right: social-icon placeholders (no hrefs wired yet — drop
              real URLs in when accounts exist). Kept as buttons so the
              shape sits in the bar; clicking does nothing for now. */}
          <div className="flex items-center gap-4">
            {SOCIAL_PLACEHOLDERS.map((s) => (
              <span
                key={s.label}
                aria-label={s.label}
                title={`${s.label} (not yet wired)`}
                className="flex h-6 w-6 items-center justify-center"
                style={{ color: MUTED, opacity: 0.6 }}
              >
                {s.glyph}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

const SOCIAL_PLACEHOLDERS: { label: string; glyph: React.ReactNode }[] = [
  {
    label: 'X',
    glyph: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2H21.5l-7.51 8.585L23 22h-7.094l-5.554-7.27L3.5 22H.244l8.04-9.193L1 2h7.25l5.02 6.65L18.244 2Zm-1.243 18h1.802L7.062 4H5.13l11.872 16Z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    glyph: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    glyph: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31.6 31.6 0 0 0 2 12a31.6 31.6 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 22 12a31.6 31.6 0 0 0-.4-4.8ZM10 15.2V8.8L15.6 12 10 15.2Z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    glyph: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM0 8h5v16H0V8Zm7.5 0H12v2.2h.06c.63-1.2 2.17-2.46 4.47-2.46 4.78 0 5.66 3.14 5.66 7.22V24h-5v-7.18c0-1.71-.03-3.9-2.38-3.9-2.38 0-2.75 1.86-2.75 3.78V24h-5V8Z" />
      </svg>
    ),
  },
]
