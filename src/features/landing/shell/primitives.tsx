import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BG, FG, MUTED, DIM, HAIR, FAINT,
  GREEN, GREEN_2, G_GLOW, G_DIM,
  DRUK, MONO,
} from './tokens'

/* ─── KO — green knockout highlight on a key noun ────────────────────── */

export function KO({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: GREEN,
        color: '#000',
        padding: '0 0.16em',
        marginRight: '0.04em',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      }}
    >
      {children}
    </span>
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
      <span className="h-px flex-1" style={{ background: HAIR }} />
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
  const className = 'inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity hover:opacity-80'
  const style = { fontFamily: MONO, color: GREEN }
  if (external) {
    return (
      <a href={to} className={className} style={style}>
        {children} <span aria-hidden>›</span>
      </a>
    )
  }
  return (
    <Link to={to} className={className} style={style}>
      {children} <span aria-hidden>›</span>
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

/* ─── Nav — site-wide top navigation ─────────────────────────────────── */

export function Nav({
  onStart,
  ctaLabel = 'start free',
  active,
}: {
  onStart?: () => void
  ctaLabel?: string
  active?: 'home' | 'platform' | 'sports' | 'teams' | 'pricing' | 'why-us' | 'resources'
}) {
  const items: { key: typeof active; label: string; to: string }[] = [
    { key: 'platform',  label: 'platform',   to: '/platform' },
    { key: 'sports',    label: 'sports',     to: '/sports' },
    { key: 'teams',     label: 'for teams',  to: '/sports/teams' },
    { key: 'pricing',   label: 'pricing',    to: '/#pricing' },
    { key: 'why-us',    label: 'why us',     to: '/why-us' },
    { key: 'resources', label: 'resources',  to: '/resources' },
  ]
  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 sm:px-10 py-4"
      style={{
        background: 'rgba(5,5,5,0.78)',
        backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${HAIR}`,
      }}
    >
      <Link to="/" className="text-[20px] font-semibold leading-none" style={{ fontFamily: MONO, color: FG }}>
        synth<span style={{ color: GREEN }}>.</span>
      </Link>
      <nav className="flex items-center gap-3 text-[11px] sm:gap-5" style={{ fontFamily: MONO, color: MUTED }}>
        {items.map(item => (
          <Link
            key={item.key}
            to={item.to}
            className="hidden transition-colors hover:text-white md:inline"
            style={{
              color: active === item.key ? FG : MUTED,
              borderBottom: active === item.key ? `1px solid ${GREEN}` : '1px solid transparent',
              paddingBottom: 2,
            }}
          >
            {item.label}
          </Link>
        ))}
        <Link to="/login" className="transition-colors hover:text-white">sign in</Link>
        {onStart ? (
          <button
            type="button"
            onClick={onStart}
            className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{
              background: GREEN,
              color: '#000',
              fontFamily: MONO,
              boxShadow: `0 0 24px ${G_GLOW}`,
            }}
          >
            {ctaLabel}
          </button>
        ) : (
          <Link
            to="/signup"
            className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{
              background: GREEN,
              color: '#000',
              fontFamily: MONO,
              boxShadow: `0 0 24px ${G_GLOW}`,
            }}
          >
            {ctaLabel}
          </Link>
        )}
      </nav>
    </header>
  )
}

/* ─── SideRail — vertical floating "contact" tab (Kitman move) ───────── */

export function SideRail() {
  return (
    <a
      href="mailto:supportsynth@gmail.com"
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
      { label: 'pricing',      to: '/#pricing' },
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
            className="mt-5 leading-[0.88] tracking-[-0.015em]"
            style={{
              fontFamily: DRUK,
              fontSize: 'clamp(48px, 7.5vw, 112px)',
              textTransform: 'uppercase',
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
                primaryCta.onClick ? (
                  <button
                    type="button"
                    onClick={primaryCta.onClick}
                    className="px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ background: GREEN, color: '#000', fontFamily: MONO, boxShadow: `0 0 32px ${G_GLOW}` }}
                  >
                    {primaryCta.label} →
                  </button>
                ) : (
                  <Link
                    to={primaryCta.to}
                    className="px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ background: GREEN, color: '#000', fontFamily: MONO, boxShadow: `0 0 32px ${G_GLOW}` }}
                  >
                    {primaryCta.label} →
                  </Link>
                )
              )}
              {secondaryCta && (
                <Link
                  to={secondaryCta.to}
                  className="border px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-white hover:text-black"
                  style={{ borderColor: FAINT, color: FG, fontFamily: MONO }}
                >
                  {secondaryCta.label}
                </Link>
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
            className="mt-5 leading-[0.92] tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(40px, 6vw, 88px)', textTransform: 'uppercase' }}
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
            className="mt-4 leading-[0.92] tracking-[-0.015em]"
            style={{ fontFamily: DRUK, fontSize: 'clamp(36px, 5vw, 72px)', textTransform: 'uppercase' }}
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
            // 16+ integrations
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
          className="leading-[0.88] tracking-[-0.02em]"
          style={{ fontFamily: DRUK, fontSize: 'clamp(56px, 10vw, 160px)', textTransform: 'uppercase' }}
        >
          {headline}
        </motion.h2>
        {body && (
          <p className="mt-8 max-w-[640px] text-[16px] leading-relaxed" style={{ color: FG }}>
            {body}
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {primary.onClick ? (
            <button
              type="button"
              onClick={primary.onClick}
              className="px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ background: GREEN, color: '#000', fontFamily: MONO, boxShadow: `0 0 36px ${G_GLOW}` }}
            >
              {primary.label} →
            </button>
          ) : (
            <Link
              to={primary.to}
              className="px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ background: GREEN, color: '#000', fontFamily: MONO, boxShadow: `0 0 36px ${G_GLOW}` }}
            >
              {primary.label} →
            </Link>
          )}
          {secondary && (
            <Link
              to={secondary.to}
              className="border px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-white hover:text-black"
              style={{ borderColor: FAINT, color: FG, fontFamily: MONO }}
            >
              {secondary.label}
            </Link>
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
  children,
}: {
  active?: 'home' | 'platform' | 'sports' | 'teams' | 'pricing' | 'why-us' | 'resources'
  onStart?: () => void
  ctaLabel?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh w-full flex-col" style={{ background: BG, color: FG }}>
      <Nav active={active} onStart={onStart} ctaLabel={ctaLabel} />
      <SideRail />
      <main className="flex flex-col">{children}</main>
      <Footer />
    </div>
  )
}
