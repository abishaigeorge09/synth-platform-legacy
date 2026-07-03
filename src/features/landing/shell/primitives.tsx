import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SmoothScroll } from './SmoothScroll'
import { FooterOverlay } from './FooterOverlay'
import {
  BG, FG, MUTED, DIM, HAIR, FAINT,
  GREEN, GREEN_2, G_GLOW, G_DIM,
  DRUK, MONO,
} from './tokens'

/* ─── KO — green knockout highlight on a key noun ─────────────────────────
 *  Critical: an inline-block with its own line-height so the box can't
 *  bleed up into the line above when the parent heading uses a tight
 *  (sub-1.0) line-height. vertical-align: baseline keeps it sitting on
 *  the type baseline. padding: '0.04em 0.16em' adds a hair of breathing
 *  room without making the box overflow the line. */

export function KO({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: GREEN,
        color: '#000',
        padding: '0.04em 0.16em',
        marginRight: '0.04em',
        display: 'inline-block',
        lineHeight: '0.92',
        verticalAlign: 'baseline',
      }}
    >
      {children}
    </span>
  )
}

/* ─── Buttons — state-based hover so inline styles don't clobber it ─── */

export function PrimaryButton({
  to, onClick, children, external,
}: {
  to?: string
  onClick?: () => void
  children: React.ReactNode
  external?: boolean
}) {
  const [hover, setHover] = useState(false)
  const style: React.CSSProperties = {
    background: hover ? '#fff' : GREEN,
    color: '#000',
    fontFamily: MONO,
    boxShadow: hover ? `0 0 60px ${G_GLOW}` : `0 0 32px ${G_GLOW}`,
    transition: 'background 0.18s ease, box-shadow 0.18s ease',
  }
  const className = 'inline-flex items-center gap-2 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]'
  const enter = () => setHover(true)
  const leave = () => setHover(false)

  if (onClick) {
    return (
      <button type="button" onClick={onClick} onMouseEnter={enter} onMouseLeave={leave} className={className} style={style}>
        {children}
      </button>
    )
  }
  if (external && to) {
    const newTab = to.startsWith('https://')
    return (
      <a href={to} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} onMouseEnter={enter} onMouseLeave={leave} className={className} style={style}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to ?? '#'} onMouseEnter={enter} onMouseLeave={leave} className={className} style={style}>
      {children}
    </Link>
  )
}

export function OutlineButton({
  to, onClick, children, external,
}: {
  to?: string
  onClick?: () => void
  children: React.ReactNode
  external?: boolean
}) {
  const [hover, setHover] = useState(false)
  const style: React.CSSProperties = {
    background: hover ? '#fff' : 'transparent',
    color: hover ? '#000' : FG,
    fontFamily: MONO,
    border: `1px solid ${hover ? '#fff' : FAINT}`,
    transition: 'background 0.18s ease, color 0.18s ease, border-color 0.18s ease',
  }
  const className = 'inline-flex items-center gap-2 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]'
  const enter = () => setHover(true)
  const leave = () => setHover(false)

  if (onClick) {
    return (
      <button type="button" onClick={onClick} onMouseEnter={enter} onMouseLeave={leave} className={className} style={style}>
        {children}
      </button>
    )
  }
  if (external && to) {
    const newTab = to.startsWith('https://')
    return (
      <a href={to} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} onMouseEnter={enter} onMouseLeave={leave} className={className} style={style}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to ?? '#'} onMouseEnter={enter} onMouseLeave={leave} className={className} style={style}>
      {children}
    </Link>
  )
}

/* ─── Hairlines — background grid texture ─────────────────────────────── */

export function Hairlines() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {[20, 40, 60, 80].map(p => (
        <div key={`v-${p}`} className="absolute inset-y-0" style={{ left: `${p}%`, width: 1, background: FAINT }} />
      ))}
      <div className="absolute inset-y-0" style={{ left: '60%', width: 1, background: G_DIM }} />
    </div>
  )
}

/* ─── Crosshairs — "+" decoration scattered, kept clear of center text ─ */

export function Crosshairs({ count = 4, opacity = 0.4 }: { count?: number; opacity?: number }) {
  // Positions are intentionally pushed to the edges so they never collide
  // with center-aligned headlines or body copy.
  const positions = [
    { top: '6%',  left: '4%'  }, { top: '10%', left: '92%' },
    { top: '46%', left: '3%'  }, { top: '82%', left: '94%' },
    { top: '90%', left: '8%'  }, { top: '14%', left: '50%' },
    { top: '74%', left: '70%' }, { top: '38%', left: '95%' },
  ].slice(0, count)
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden style={{ opacity }}>
      {positions.map((p, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" className="absolute" style={{ ...p, color: GREEN }}>
          <line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}
    </div>
  )
}

/* ─── SectionLabel — tiny mono "// some label" row ───────────────────── */

export function SectionLabel({
  children,
  align = 'left',
}: {
  children: React.ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <div
      className={`relative z-10 mx-auto flex w-full max-w-[1280px] items-center gap-4 text-[10px] uppercase tracking-[0.3em] ${align === 'center' ? 'justify-center' : ''}`}
      style={{ fontFamily: MONO, color: DIM }}
    >
      {align === 'center' && <span className="h-px w-12" style={{ background: HAIR }} />}
      <span>{children}</span>
      <span className="h-px w-24" style={{ background: HAIR }} />
    </div>
  )
}

/* ─── Chevron — Kitman's tertiary CTA, recolored green ───────────────── */

export function Chevron({
  to,
  children,
  external,
}: {
  to: string
  children: React.ReactNode
  external?: boolean
}) {
  const className = 'group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity hover:opacity-80'
  const style = { fontFamily: MONO, color: GREEN }
  const arrow = (
    <span
      aria-hidden
      className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1"
    >
      ›
    </span>
  )
  if (external) {
    return (
      <a href={to} className={className} style={style}>
        {children} {arrow}
      </a>
    )
  }
  return (
    <Link to={to} className={className} style={style}>
      {children} {arrow}
    </Link>
  )
}

/* ─── PlaceholderMedia — explicit asset slot ─────────────────────────── */

/**
 * Renders an explicit placeholder for a photo / video / illustration that
 * will be supplied later. The slot is intentionally NOT decorative — it
 * tells the user what to put there.
 */
export function PlaceholderMedia({
  kind,
  label,
  ratio = '5/4',
  caption,
}: {
  kind: 'photo' | 'video' | 'illustration' | 'screenshot'
  label: string
  ratio?: string
  caption?: string
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        aspectRatio: ratio,
        background: `repeating-linear-gradient(135deg, ${HAIR} 0 1px, transparent 1px 12px), ${BG}`,
        border: `1px dashed ${GREEN}`,
        color: GREEN,
      }}
    >
      {/* Corner ticks */}
      {[
        { top: 8, left: 8 }, { top: 8, right: 8 },
        { bottom: 8, left: 8 }, { bottom: 8, right: 8 },
      ].map((p, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" className="absolute" style={{ ...p, color: GREEN }}>
          <line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
          // {kind} slot
        </div>
        <div className="text-[15px] leading-snug" style={{ fontFamily: MONO, color: FG }}>
          {label}
        </div>
        {caption && (
          <div className="mt-2 max-w-[420px] text-[11px] leading-relaxed" style={{ fontFamily: MONO, color: DIM }}>
            {caption}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Nav — Giga-style two-pill glassmorphism navbar ─────────────────────
 *  Fixed top, split into two separate translucent pills with the middle
 *  fully transparent. No scroll-driven state changes — the look adapts
 *  via the blur sitting over whatever section is scrolling underneath. */

const PILL_STYLE: React.CSSProperties = {
  background: 'rgba(0,0,0,0.20)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  fontFamily: MONO,
}

type PlatformDropdownItem = { label: string; to: string; hint?: string }

const PRODUCT_PLATFORM: PlatformDropdownItem[] = [
  { label: 'synth Core',           to: '/platform/synth-core',           hint: 'the data layer' },
  { label: 'Recovery & Health',    to: '/platform/recovery-health',      hint: 'HRV · sleep · injury' },
  { label: 'Training & Load',      to: '/platform/training-load',        hint: 'plan vs actual' },
  { label: 'Progress & Development', to: '/platform/progress-development', hint: 'PRs · trends' },
  { label: 'Team Operations',      to: '/platform/team-operations',      hint: 'lineups · attendance' },
  { label: 'Custom Analytics',     to: '/platform/custom-analytics',     hint: 'bespoke engagements' },
  { label: 'Integrations',         to: '/platform/integrations',         hint: '12+ live' },
  { label: 'API',                  to: '/platform/api',                  hint: 'build on your tenant' },
]

const PRODUCT_SPORTS: PlatformDropdownItem[] = [
  { label: 'Running',  to: '/sports/running',  hint: 'sub-3 · 5K · ultra' },
  { label: 'Cycling',  to: '/sports/cycling',  hint: 'FTP · indoor · road' },
  { label: 'Swimming', to: '/sports/swimming', hint: 'pool · open water' },
  { label: 'Rowing',   to: '/sports/rowing',   hint: 'erg · on-water · boats' },
  { label: 'Lifting',  to: '/sports/lifting',  hint: 'powerlifting · oly' },
  { label: 'Teams',    to: '/sports/teams',    hint: 'clubs · schools' },
]

const COMPANY_ITEMS: PlatformDropdownItem[] = [
  { label: 'Why us',     to: '/why-us',     hint: 'built by champions' },
  { label: 'Resources',  to: '/resources',  hint: 'guides · blog · video' },
  { label: 'Pricing',    to: '/pricing',    hint: '$9 · $19 · teams' },
  { label: 'Contact',    to: 'mailto:supportsynth@gmail.com', hint: 'supportsynth@gmail.com' },
]

function NavTriggerButton({
  label,
  active,
  open,
  onMouseEnter,
  onFocus,
}: {
  label: string
  active?: boolean
  open: boolean
  onMouseEnter: () => void
  onFocus: () => void
}) {
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] transition-colors"
      style={{
        color: active || open ? FG : 'rgba(255,255,255,0.78)',
        fontFamily: MONO,
      }}
    >
      <span>{label}</span>
      <motion.span
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="inline-block text-[9px]"
        aria-hidden
      >
        ▾
      </motion.span>
    </button>
  )
}

function ProductDropdownPanel({
  onClose,
}: {
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      onMouseLeave={onClose}
      className="absolute left-0 top-full mt-2 w-[640px] p-2"
      style={{
        ...PILL_STYLE,
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(24px)',
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="px-3 py-2 text-[9px] uppercase tracking-[0.3em]" style={{ color: GREEN }}>
            // platform
          </div>
          <ul className="flex flex-col">
            {PRODUCT_PLATFORM.map(item => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="flex flex-col gap-0.5 rounded-md px-3 py-2 transition-colors hover:bg-white/5"
                >
                  <span className="text-[13px]" style={{ color: FG, fontFamily: MONO }}>
                    {item.label}
                  </span>
                  {item.hint && (
                    <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: DIM }}>
                      {item.hint}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="px-3 py-2 text-[9px] uppercase tracking-[0.3em]" style={{ color: GREEN }}>
            // sports
          </div>
          <ul className="flex flex-col">
            {PRODUCT_SPORTS.map(item => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="flex flex-col gap-0.5 rounded-md px-3 py-2 transition-colors hover:bg-white/5"
                >
                  <span className="text-[13px]" style={{ color: FG, fontFamily: MONO }}>
                    {item.label}
                  </span>
                  {item.hint && (
                    <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: DIM }}>
                      {item.hint}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

function CompanyDropdownPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      onMouseLeave={onClose}
      className="absolute left-0 top-full mt-2 w-[260px] p-2"
      style={{
        ...PILL_STYLE,
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(24px)',
      }}
    >
      <ul className="flex flex-col">
        {COMPANY_ITEMS.map(item => {
          const external = /^(mailto:|https?:|tel:)/.test(item.to)
          const inner = (
            <span className="flex flex-col gap-0.5">
              <span className="text-[13px]" style={{ color: FG, fontFamily: MONO }}>
                {item.label}
              </span>
              {item.hint && (
                <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: DIM }}>
                  {item.hint}
                </span>
              )}
            </span>
          )
          return (
            <li key={item.label}>
              {external ? (
                <a
                  href={item.to}
                  onClick={onClose}
                  className="block rounded-md px-3 py-2 transition-colors hover:bg-white/5"
                >
                  {inner}
                </a>
              ) : (
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="block rounded-md px-3 py-2 transition-colors hover:bg-white/5"
                >
                  {inner}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </motion.div>
  )
}

export function Nav({
  onStart,
  ctaLabel = 'Start free',
  active,
}: {
  onStart?: () => void
  ctaLabel?: string
  active?: 'home' | 'platform' | 'sports' | 'teams' | 'pricing' | 'why-us' | 'resources'
}) {
  const [openMenu, setOpenMenu] = useState<'product' | 'company' | null>(null)
  const closeTimer = useRef<number | null>(null)

  // small delay on close so moving from trigger → panel doesn't kill the menu
  const queueClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140)
  }
  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const open = (which: 'product' | 'company') => {
    cancelClose()
    setOpenMenu(which)
  }

  const productActive = active === 'platform' || active === 'sports' || active === 'teams'
  const companyActive = active === 'why-us' || active === 'resources' || active === 'pricing'

  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header
        className="fixed inset-x-0 z-40 flex items-start justify-between px-4 sm:px-6"
        style={{ top: 16, pointerEvents: 'none' }}
      >
        {/* LEFT PILL — logo + Product + Company (Product/Company hidden on mobile) */}
        <div
          className="relative flex items-center gap-1 px-2 py-1.5"
          style={{ ...PILL_STYLE, pointerEvents: 'auto' }}
          onMouseLeave={queueClose}
        >
          <Link to="/" className="px-2.5 text-[16px] font-semibold leading-none" style={{ fontFamily: MONO, color: FG }}>
            synth<span style={{ color: GREEN }}>.</span>
          </Link>

          <div className="mx-1 hidden h-5 w-px md:block" style={{ background: 'rgba(255,255,255,0.12)' }} />

          <div className="relative hidden md:block" onMouseEnter={() => open('product')}>
            <NavTriggerButton
              label="Product"
              open={openMenu === 'product'}
              active={productActive}
              onMouseEnter={() => open('product')}
              onFocus={() => open('product')}
            />
            <AnimatePresence>
              {openMenu === 'product' && <ProductDropdownPanel onClose={() => setOpenMenu(null)} />}
            </AnimatePresence>
          </div>

          <div className="relative hidden md:block" onMouseEnter={() => open('company')}>
            <NavTriggerButton
              label="Company"
              open={openMenu === 'company'}
              active={companyActive}
              onMouseEnter={() => open('company')}
              onFocus={() => open('company')}
            />
            <AnimatePresence>
              {openMenu === 'company' && <CompanyDropdownPanel onClose={() => setOpenMenu(null)} />}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PILL — desktop only: Download + Sign in + Start free */}
        <div
          className="hidden md:flex items-center gap-1 px-2 py-1.5"
          style={{ ...PILL_STYLE, pointerEvents: 'auto' }}
        >
          {onStart ? (
            <button
              type="button"
              onClick={onStart}
              className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.6)', fontFamily: MONO }}
              aria-label="Download synth"
            >
              <span aria-hidden>↓</span>
              <span>Download</span>
              <span className="pointer-events-none absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </button>
          ) : (
            <Link
              to="/"
              className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.6)', fontFamily: MONO }}
              aria-label="Download synth"
            >
              <span aria-hidden>↓</span>
              <span>Download</span>
              <span className="pointer-events-none absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          )}
          <Link
            to="/login"
            className="group relative px-3 py-1.5 text-[12px] transition-colors hover:text-white"
            style={{ color: 'rgba(255,255,255,0.78)', fontFamily: MONO }}
          >
            Sign in
            <span className="pointer-events-none absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-[11px] font-semibold"
            style={{ background: '#fff', color: '#000', fontFamily: MONO }}
          >
            {ctaLabel}
          </Link>
          <a
            href="https://cal.com/abishai-gosula-oilvxc/book-a-call"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-[11px] font-semibold"
            style={{ background: '#059669', color: '#fff', fontFamily: MONO }}
          >
            Book a call
          </a>
        </div>

        {/* RIGHT PILL — mobile only: hamburger button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center md:hidden"
          style={{
            ...PILL_STYLE,
            pointerEvents: 'auto',
            width: 44,
            height: 44,
            padding: 0,
          }}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        >
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke={FG} strokeWidth="1.5" strokeLinecap="round">
            <line x1="2" y1="2"  x2="18" y2="2"  />
            <line x1="2" y1="7"  x2="18" y2="7"  />
            <line x1="2" y1="12" x2="18" y2="12" />
          </svg>
        </button>
      </header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            onClose={() => setMobileOpen(false)}
            onStart={onStart}
            active={active}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function MobileMenu({
  onClose,
  onStart,
  active,
}: {
  onClose: () => void
  onStart?: () => void
  active?: string
}) {
  // Lock body scroll while the menu is open; restore on close
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{ background: BG, color: FG, fontFamily: MONO }}
    >
      {/* Top bar — logo + close */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${HAIR}` }}>
        <Link to="/" onClick={onClose} className="text-[18px] font-semibold" style={{ color: FG }}>
          synth<span style={{ color: GREEN }}>.</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center"
          aria-label="Close menu"
          style={{ border: `1px solid ${HAIR}`, borderRadius: 8 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={FG} strokeWidth="1.5" strokeLinecap="round">
            <line x1="2" y1="2"  x2="12" y2="12" />
            <line x1="12" y1="2" x2="2" y2="12" />
          </svg>
        </button>
      </div>

      {/* Content — scrollable */}
      <div className="flex flex-1 flex-col gap-8 px-5 py-8">
        <MobileMenuGroup
          title="// platform"
          items={PRODUCT_PLATFORM}
          onClick={onClose}
          activeKey={active === 'platform' ? 'all' : undefined}
        />
        <MobileMenuGroup
          title="// sports"
          items={PRODUCT_SPORTS}
          onClick={onClose}
          activeKey={active === 'sports' ? 'all' : undefined}
        />
        <MobileMenuGroup
          title="// company"
          items={COMPANY_ITEMS}
          onClick={onClose}
        />
      </div>

      {/* Sticky bottom — CTAs */}
      <div className="flex flex-col gap-3 px-5 pb-8 pt-4" style={{ borderTop: `1px solid ${HAIR}` }}>
        {onStart && (
          <button
            type="button"
            onClick={() => { onStart(); onClose() }}
            className="flex items-center justify-center gap-2 rounded-md px-4 py-3 text-[12px] uppercase tracking-[0.22em]"
            style={{ border: `1px solid ${HAIR}`, color: FG, fontFamily: MONO }}
          >
            <span aria-hidden>↓</span>
            <span>Download app</span>
          </button>
        )}
        <Link
          to="/login"
          onClick={onClose}
          className="flex items-center justify-center px-4 py-3 text-[12px] uppercase tracking-[0.22em]"
          style={{ border: `1px solid ${HAIR}`, color: FG, fontFamily: MONO }}
        >
          Sign in
        </Link>
        <Link
          to="/signup"
          onClick={onClose}
          className="flex items-center justify-center rounded-md px-4 py-3.5 text-[12px] font-semibold uppercase tracking-[0.22em]"
          style={{ background: GREEN, color: '#000', fontFamily: MONO, boxShadow: `0 0 24px ${G_GLOW}` }}
        >
          Start free →
        </Link>
        <a
          href="https://cal.com/abishai-gosula-oilvxc/book-a-call"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center justify-center rounded-md px-4 py-3.5 text-[12px] font-semibold uppercase tracking-[0.22em]"
          style={{ background: '#059669', color: '#fff', fontFamily: MONO }}
        >
          Book a Call →
        </a>
      </div>
    </motion.div>
  )
}

function MobileMenuGroup({
  title,
  items,
  onClick,
  activeKey,
}: {
  title: string
  items: PlatformDropdownItem[]
  onClick: () => void
  activeKey?: string
}) {
  return (
    <div>
      <div className="mb-3 text-[10px] uppercase tracking-[0.32em]" style={{ color: GREEN }}>
        {title}
      </div>
      <ul className="flex flex-col gap-px" style={{ background: HAIR }}>
        {items.map(item => {
          const external = /^(mailto:|https?:|tel:)/.test(item.to)
          const inner = (
            <div className="flex flex-col gap-0.5 px-1 py-3">
              <div className="text-[15px]" style={{ color: FG }}>{item.label}</div>
              {item.hint && (
                <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: DIM }}>
                  {item.hint}
                </div>
              )}
            </div>
          )
          return (
            <li key={item.label} style={{ background: BG }}>
              {external ? (
                <a href={item.to} onClick={onClick} className="block">
                  {inner}
                </a>
              ) : (
                <Link to={item.to} onClick={onClick} className="block">
                  {inner}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
      {activeKey === 'all' && (
        <div className="mt-1 text-[9px] uppercase tracking-[0.22em]" style={{ color: GREEN }}>
          you are here
        </div>
      )}
    </div>
  )
}

/* ─── SideRail — vertical floating "contact" tab (Kitman move) ───────── */

export function SideRail() {
  return (
    <a
      href="https://cal.com/abishai-gosula-oilvxc/book-a-call"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 px-3 py-4 text-[10px] font-semibold uppercase tracking-[0.32em] md:block"
      style={{
        background: GREEN,
        color: '#000',
        fontFamily: MONO,
        writingMode: 'vertical-rl',
        boxShadow: `-6px 0 20px ${G_GLOW}`,
      }}
    >
      get in touch ↑
    </a>
  )
}

/* ─── Footer ──────────────────────────────────────────────────────────── */

const FOOTER_COLS: { title: string; links: { label: string; to: string; external?: boolean }[] }[] = [
  {
    title: 'platform',
    links: [
      { label: 'synth core',              to: '/platform/synth-core' },
      { label: 'recovery & health',       to: '/platform/recovery-health' },
      { label: 'training & load',         to: '/platform/training-load' },
      { label: 'progress & development',  to: '/platform/progress-development' },
      { label: 'team operations',         to: '/platform/team-operations' },
      { label: 'custom analytics',        to: '/platform/custom-analytics' },
      { label: 'integrations',            to: '/platform/integrations' },
      { label: 'api',                     to: '/platform/api' },
    ],
  },
  {
    title: 'sports',
    links: [
      { label: 'running',   to: '/sports/running' },
      { label: 'cycling',   to: '/sports/cycling' },
      { label: 'swimming',  to: '/sports/swimming' },
      { label: 'rowing',    to: '/sports/rowing' },
      { label: 'lifting',   to: '/sports/lifting' },
      { label: 'for teams', to: '/sports/teams' },
    ],
  },
  {
    title: 'company',
    links: [
      { label: 'why us',       to: '/why-us' },
      { label: 'resources',    to: '/resources' },
      { label: 'pricing',      to: '/pricing' },
      { label: 'contact',      to: 'mailto:supportsynth@gmail.com', external: true },
    ],
  },
  {
    title: 'app',
    links: [
      { label: 'sign in',         to: '/login' },
      { label: 'sign up',         to: '/signup' },
      { label: 'app access →',    to: '/app' },
      { label: 'demo dashboard',  to: '/coach/dashboard' },
    ],
  },
  {
    title: 'legal',
    links: [
      { label: 'privacy',     to: '/legal/privacy' },
      { label: 'terms',       to: '/legal/terms' },
      { label: 'security',    to: '/legal/security' },
      { label: 'sub-processors', to: '/legal/sub-processors' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t px-5 sm:px-10 py-16" style={{ background: BG, borderColor: HAIR }}>
      <div className="mx-auto w-full max-w-[1280px]">
        {/* brand row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[28px] font-semibold leading-none" style={{ fontFamily: MONO, color: FG }}>
              synth<span style={{ color: GREEN }}>.</span>
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: DIM }}>
              the data layer for sports
            </div>
          </div>
          <div className="text-[11px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: DIM }}>
            built in berkeley · skydeck pad-13 · batch 22
          </div>
        </div>

        {/* column grid */}
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
                {col.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    {l.external ? (
                      <a
                        href={l.to}
                        className="text-[12px] transition-colors hover:text-white"
                        style={{ fontFamily: MONO, color: MUTED }}
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        to={l.to}
                        className="text-[12px] transition-colors hover:text-white"
                        style={{ fontFamily: MONO, color: MUTED }}
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: HAIR }}>
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: DIM }}>
            © 2026 synth · all rights reserved
          </div>
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: DIM }}>
            built by world championship rowers
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Standard hero — text left + media right, used by module/sport pages ── */

export type StandardHeroProps = {
  eyebrow: string
  headline: React.ReactNode      // pass <>WORDS WITH <KO>HIGHLIGHT</KO></> if needed
  subhead: string
  primaryCta?: { label: string; to: string; onClick?: () => void }
  secondaryCta?: { label: string; to: string }
  media: { kind: 'photo' | 'video' | 'illustration' | 'screenshot'; label: string; caption?: string }
}

export function StandardHero({
  eyebrow,
  headline,
  subhead,
  primaryCta,
  secondaryCta,
  media,
}: StandardHeroProps) {
  const isExternal = (t?: string) => !!t && /^(mailto:|https?:|tel:)/.test(t)
  return (
    <section
      className="relative overflow-hidden px-5 sm:px-10 pt-32 pb-20 sm:pt-40 sm:pb-24"
      style={{ background: BG, color: FG }}
    >
      <Hairlines />
      <Crosshairs count={4} opacity={0.4} />

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
            // {eyebrow}
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mt-5 tracking-[-0.015em]"
            style={{
              fontFamily: DRUK,
              fontSize: 'clamp(48px, 7.5vw, 112px)',
              textTransform: 'uppercase',
              lineHeight: 1.02,
            }}
          >
            {headline}
          </motion.h1>
          <p className="mt-6 max-w-[560px] text-[16px] leading-relaxed" style={{ color: FG }}>
            {subhead}
          </p>
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {primaryCta && (
                <PrimaryButton
                  to={primaryCta.to}
                  onClick={primaryCta.onClick}
                  external={isExternal(primaryCta.to)}
                >
                  {primaryCta.label} →
                </PrimaryButton>
              )}
              {secondaryCta && (
                <OutlineButton to={secondaryCta.to} external={isExternal(secondaryCta.to)}>
                  {secondaryCta.label}
                </OutlineButton>
              )}
            </div>
          )}
        </div>

        <PlaceholderMedia
          kind={media.kind}
          label={media.label}
          caption={media.caption}
          ratio="4/3"
        />
      </div>
    </section>
  )
}

/* ─── Value bridge — bold short statement + knockout ─────────────────── */

export function ValueBridge({
  eyebrow,
  headline,
  body,
  media,
}: {
  eyebrow: string
  headline: React.ReactNode
  body: string
  media?: { kind: 'photo' | 'video' | 'illustration' | 'screenshot'; label: string; caption?: string }
}) {
  return (
    <section
      className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      <Hairlines />
      <Crosshairs count={3} opacity={0.35} />

      <div className={`relative z-10 mx-auto grid w-full max-w-[1280px] gap-12 ${media ? 'lg:grid-cols-2 lg:items-center' : ''}`}>
        <div>
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
            // {eyebrow}
          </div>
          <h2
            className="mt-5 tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(40px, 6vw, 88px)', textTransform: 'uppercase', lineHeight: 1.05 }}
          >
            {headline}
          </h2>
          <p className="mt-6 max-w-[560px] text-[16px] leading-relaxed" style={{ color: MUTED }}>
            {body}
          </p>
        </div>
        {media && (
          <PlaceholderMedia
            kind={media.kind}
            label={media.label}
            caption={media.caption}
            ratio="4/3"
          />
        )}
      </div>
    </section>
  )
}

/* ─── CapabilityList — Kitman's vertical capability item ─────────────── */

export type Capability = {
  title: string
  body: string
  hint?: string // e.g., "+ blog: 'how synth scores recovery'"
}

export function CapabilityList({
  eyebrow,
  title,
  capabilities,
  tabs,
  activeTab,
  onTab,
}: {
  eyebrow?: string
  title?: string
  capabilities: Capability[]
  tabs?: string[]
  activeTab?: string
  onTab?: (t: string) => void
}) {
  return (
    <section className="relative overflow-hidden border-t px-5 sm:px-10 py-24 sm:py-32" style={{ background: BG, color: FG, borderColor: HAIR }}>
      <Hairlines />

      <div className="relative z-10 mx-auto w-full max-w-[1280px]">
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
            // {eyebrow}
          </div>
        )}
        {title && (
          <h2
            className="mt-4 tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(36px, 5vw, 72px)', textTransform: 'uppercase', lineHeight: 1.05 }}
          >
            {title}
          </h2>
        )}
        {tabs && tabs.length > 0 && (
          <div className="mt-8 flex items-center gap-6 border-b" style={{ borderColor: HAIR }}>
            {tabs.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onTab?.(t)}
                className="-mb-px pb-3 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors"
                style={{
                  fontFamily: MONO,
                  color: activeTab === t ? GREEN : MUTED,
                  borderBottom: activeTab === t ? `2px solid ${GREEN}` : '2px solid transparent',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-px sm:grid-cols-2" style={{ background: HAIR }}>
          {capabilities.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: (i % 6) * 0.03 }}
              className="flex flex-col gap-3 p-7"
              style={{ background: BG }}
            >
              <div className="flex h-7 w-7 items-center justify-center" style={{ border: `1px solid ${GREEN}`, color: GREEN }}>
                <span className="text-[12px]" style={{ fontFamily: MONO }}>+</span>
              </div>
              <div
                className="leading-[1.04] tracking-[-0.005em]"
                style={{ fontFamily: DRUK, fontSize: 24, textTransform: 'uppercase', color: FG }}
              >
                {c.title}
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: MUTED }}>
                {c.body}
              </p>
              {c.hint && (
                <div className="mt-1 text-[10px] uppercase tracking-[0.22em]" style={{ fontFamily: MONO, color: GREEN_2 }}>
                  {c.hint}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Quote — featured Kitman-style pull-quote ───────────────────────── */

export function FeaturedQuote({
  quote,
  attribution,
  role,
}: {
  quote: string
  attribution: string
  role: string
}) {
  return (
    <section className="relative overflow-hidden border-t px-5 sm:px-10 py-24" style={{ background: BG, color: FG, borderColor: HAIR }}>
      <Hairlines />
      <div className="relative z-10 mx-auto w-full max-w-[1080px]">
        <div className="flex gap-6">
          <div className="shrink-0 leading-none" style={{ fontFamily: DRUK, fontSize: 120, color: GREEN }}>
            "
          </div>
          <div>
            <p
              className="text-[24px] leading-snug sm:text-[32px]"
              style={{ fontFamily: DRUK, color: FG, textTransform: 'none' }}
            >
              {quote}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="text-[12px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: GREEN }}>
                {attribution}
              </span>
              <span className="h-px w-8" style={{ background: HAIR }} />
              <span className="text-[11px] uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: DIM }}>
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Integrations strip — 5-up logo placeholders ─────────────────────── */

export function IntegrationsStrip() {
  const logos = ['Whoop', 'Strava', 'Oura', 'Garmin', 'Apple Health']
  return (
    <section className="relative border-t border-b px-5 sm:px-10 py-12" style={{ background: BG, borderColor: HAIR }}>
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.32em]" style={{ fontFamily: MONO, color: GREEN }}>
            // 12+ integrations
          </span>
          <span className="h-px flex-1" style={{ background: HAIR }} />
        </div>
        <div className="mt-6 grid gap-px sm:grid-cols-5" style={{ background: HAIR }}>
          {logos.map(l => (
            <div
              key={l}
              className="flex items-center justify-center px-5 py-6"
              style={{ background: BG, fontFamily: MONO }}
            >
              <span className="text-[14px] uppercase tracking-[0.05em]" style={{ color: MUTED }}>{l}</span>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Chevron to="/platform/integrations">view all integrations</Chevron>
        </div>
      </div>
    </section>
  )
}

/* ─── Closing CTA — strong end-of-page push ──────────────────────────── */

export function ClosingCta({
  headline,
  body,
  primary,
  secondary,
}: {
  headline: React.ReactNode
  body?: string
  primary: { label: string; to: string; onClick?: () => void }
  secondary?: { label: string; to: string }
}) {
  const isExternal = (t?: string) => !!t && /^(mailto:|https?:|tel:)/.test(t)
  return (
    <section
      className="relative flex min-h-[70vh] items-center overflow-hidden border-t px-5 sm:px-10 py-24"
      style={{ background: BG, color: FG, borderColor: HAIR }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: '110vw', height: '60vh', background: `radial-gradient(ellipse, ${G_GLOW} 0%, transparent 60%)` }}
        aria-hidden
      />
      <Hairlines />
      <Crosshairs count={4} opacity={0.5} />

      <div className="relative z-10 mx-auto w-full max-w-[1280px]">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
          className="tracking-[-0.02em]"
          style={{ fontFamily: DRUK, fontSize: 'clamp(48px, 8vw, 128px)', textTransform: 'uppercase', lineHeight: 1.02 }}
        >
          {headline}
        </motion.h2>
        {body && (
          <p className="mt-8 max-w-[640px] text-[16px] leading-relaxed" style={{ color: FG }}>
            {body}
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <PrimaryButton
            to={primary.to}
            onClick={primary.onClick}
            external={isExternal(primary.to)}
          >
            {primary.label} →
          </PrimaryButton>
          {secondary && (
            <OutlineButton to={secondary.to} external={isExternal(secondary.to)}>
              {secondary.label}
            </OutlineButton>
          )}
        </div>
      </div>
    </section>
  )
}

/* ─── Page shell — wraps every marketing page ────────────────────────── */

export function PageShell({
  active,
  onStart,
  ctaLabel,
  canvas = 'dark',
  children,
}: {
  active?: 'home' | 'platform' | 'sports' | 'teams' | 'pricing' | 'why-us' | 'resources'
  onStart?: () => void
  ctaLabel?: string
  /** Body overscroll color. Defaults to 'green' (brand). Use 'dark' for
   *  platform pages so the overscroll matches the dark section background. */
  canvas?: 'green' | 'dark'
  children: React.ReactNode
}) {
  useEffect(() => {
    document.body.setAttribute('data-app-canvas', canvas)
    return () => document.body.removeAttribute('data-app-canvas')
  }, [canvas])

  return (
    <div className="flex min-h-dvh w-full flex-col" style={{ background: BG, color: FG }}>
      <SmoothScroll />
      <Nav active={active} onStart={onStart} ctaLabel={ctaLabel} />
      <SideRail />
      <main className="flex flex-col">{children}</main>
      <FooterOverlay />
    </div>
  )
}
