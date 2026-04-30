import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Settings, ArrowUpRight } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_ATHLETES, fmtErgTime, fmtAgo } from '../data/mockTeam'
import { APP_MOCK_NOTES } from '../data/mockNotes'
import { AthleteLineupHeroPanel } from '../coach/lineupHero/AthleteLineupHeroPanel'
import { useUiStore } from '../../../shared/store/useUiStore'

export function HomePage() {
  const pagerRef = useRef<HTMLDivElement | null>(null)
  const setHeroPageActive = useUiStore((s) => s.setHeroPageActive)

  const goToPage = (index: number) => {
    const el = pagerRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
  }

  const onPagerScroll = () => {
    const el = pagerRef.current
    if (!el) return
    const pageIdx = Math.round(el.scrollLeft / el.clientWidth)
    setHeroPageActive(pageIdx === 0)
  }

  useEffect(() => {
    setHeroPageActive(true)
    return () => setHeroPageActive(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        height: '100svh',
        maxHeight: '100svh',
        background: '#050B1C',
      }}
    >
      <div
        ref={pagerRef}
        onScroll={onPagerScroll}
        className="synth-scroll flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: 'none', overscrollBehaviorX: 'contain' }}
      >
        {/* Page 0 — view-only lineup hero */}
        <div className="flex h-full w-full shrink-0 snap-center">
          <AthleteLineupHeroPanel onPeekDashboard={() => goToPage(1)} />
        </div>
        {/* Page 1 — GO Club dashboard */}
        <div className="flex h-full w-full shrink-0 snap-center">
          <AthleteDashboardPanel />
        </div>
      </div>
    </div>
  )
}

function AthleteDashboardPanel() {
  const navigate = useNavigate()
  const me = APP_MOCK_ATHLETES[0]
  const greeting = greetingForNow()
  const sharedNotes = APP_MOCK_NOTES.filter((n) => n.athleteId === me.id || n.visibleToAthlete).slice(0, 3)
  const [activeCard, setActiveCard] = useState(0)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const onCardScroll = () => {
    const el = cardRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    setActiveCard(idx)
  }

  const HERO_CARDS = [
    {
      word: 'PULL',
      metric: fmtErgTime(me.twoKBestSeconds),
      label: 'Best 2K',
      provenance: 'Concept2 · 4m ago',
      bg: '#0D1030',
      accent: SYNTH.cardSky,
      onClick: () => navigate('/app/athlete/erg-pacer'),
      Illustration: OarIllustration,
    },
    {
      word: 'STREAK',
      metric: `${me.streakDays}`,
      label: 'Days consecutive',
      provenance: 'synth · live',
      bg: '#083320',
      accent: SYNTH.accentEmerald,
      onClick: () => navigate('/app/athlete/capture'),
      Illustration: FlameIllustration,
    },
    {
      word: 'RACE',
      metric: '9',
      label: 'Days to Pacific Cup',
      provenance: 'Coach Geri · 2d ago',
      bg: '#1A0A00',
      accent: SYNTH.accentAmber,
      onClick: () => navigate('/app/athlete/notes'),
      Illustration: FlagIllustration,
    },
    {
      word: 'RECOVER',
      metric: `${me.recoveryScore}`,
      label: 'Recovery score',
      provenance: 'WHOOP · 6m ago',
      bg: '#070D22',
      accent: SYNTH.cardMint,
      onClick: () => navigate('/app/athlete/telemetry'),
      Illustration: WaveformIllustration,
    },
  ] as const

  return (
    <div
      className="synth-scroll flex h-full w-full flex-col overflow-y-auto pb-[120px]"
      style={{
        background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2"
        style={{ color: SYNTH.inkOnBrand }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          synth · athlete
        </span>
        <button
          type="button"
          aria-label="Settings"
          onClick={() => navigate('/app/athlete/settings')}
          className="flex h-9 items-center gap-1.5 rounded-full px-3"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <Settings size={14} strokeWidth={2.2} />
        </button>
      </header>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="px-5 pt-3"
      >
        <h1
          className="text-[26px] font-bold leading-[1.15] tracking-[-0.01em]"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          {greeting}, {me.name.split(' ')[0]}.
        </h1>
        <p
          className="text-[15px] leading-[1.3]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          You're recovered. Today is a green light.
        </p>
      </motion.div>

      {/* GO Club hero cards */}
      <section className="mt-6">
        <div
          ref={cardRef}
          onScroll={onCardScroll}
          className="synth-scroll flex overflow-x-auto pl-5"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', gap: 12 }}
        >
          {HERO_CARDS.map((card) => (
            <motion.article
              key={card.word}
              whileTap={{ scale: 0.97 }}
              onClick={card.onClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.onClick() } }}
              className="relative flex shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-[28px] p-5 pr-5"
              style={{
                background: card.bg,
                border: `1px solid rgba(255,255,255,0.08)`,
                width: 'min(82vw, 300px)',
                minHeight: 220,
                scrollSnapAlign: 'center',
              }}
            >
              {/* Decorative watermark word */}
              <span
                className="pointer-events-none absolute right-3 bottom-3 select-none font-bold leading-none"
                style={{
                  fontSize: 80,
                  color: 'rgba(255,255,255,0.07)',
                  fontFamily: SYNTH.font,
                  letterSpacing: '-0.04em',
                }}
              >
                {card.word}
              </span>

              {/* Top: label */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ background: card.accent }}
                />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: card.accent, fontFamily: SYNTH.font }}
                >
                  {card.word}
                </span>
              </div>

              {/* Middle: illustration + metric */}
              <div className="flex items-end justify-between">
                <div>
                  <p
                    className="text-[56px] font-bold leading-none tracking-[-0.02em]"
                    style={{ color: '#FFFFFF', fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {card.metric}
                  </p>
                  <p
                    className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: 'rgba(255,255,255,0.55)', fontFamily: SYNTH.font }}
                  >
                    {card.label}
                  </p>
                </div>
                <div className="shrink-0 opacity-60">
                  <card.Illustration />
                </div>
              </div>

              {/* Bottom: provenance */}
              <p
                className="text-[10px] font-medium uppercase tracking-[0.14em]"
                style={{ color: 'rgba(255,255,255,0.35)', fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
              >
                {card.provenance}
              </p>
            </motion.article>
          ))}
          {/* Right spacer */}
          <div className="w-5 shrink-0" />
        </div>

        {/* Page dots */}
        <div className="mt-3 flex justify-center gap-1.5 pr-5">
          {HERO_CARDS.map((_, cardIndex) => (
            <span
              key={cardIndex}
              className="rounded-full transition-all"
              style={{
                width: cardIndex === activeCard ? 16 : 4,
                height: 4,
                background: cardIndex === activeCard ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      </section>

      {/* Coach notes */}
      <section className="mt-7 px-5">
        <header className="flex items-baseline justify-between pb-3">
          <h2
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Notes from your coach
          </h2>
          <button
            type="button"
            onClick={() => navigate('/app/athlete/notes')}
            className="text-[12px] font-semibold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            View all ›
          </button>
        </header>
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          {sharedNotes.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                No notes yet. Quiet today.
              </p>
            </div>
          ) : (
            sharedNotes.map((note, i) => (
              <button
                type="button"
                key={note.id}
                onClick={() => navigate('/app/athlete/notes')}
                className="block w-full px-4 py-3.5 text-left active:opacity-80"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
              >
                <p className="text-[14px] leading-[1.4]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                  {note.body}
                </p>
                <p
                  className="mt-1.5 text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: SYNTH.provenanceOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
                >
                  Coach Geri · {fmtAgo(note.minutesAgo)}
                </p>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Ask synth CTA */}
      <section className="mt-5 px-5">
        <button
          type="button"
          onClick={() => navigate('/app/athlete/ai')}
          className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 active:opacity-80"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          <div className="text-left">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              Ask synth
            </p>
            <p className="mt-0.5 text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
              "Why did my split slip last week?"
            </p>
          </div>
          <ArrowUpRight size={18} color={SYNTH.inkOnBrandMuted} />
        </button>
      </section>
    </div>
  )
}

// ─── Inline SVG illustrations ─────────────────────────────────────────────────

function OarIllustration() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden>
      <line x1={10} y1={46} x2={46} y2={10} stroke="rgba(255,255,255,0.7)" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={8} cy={48} rx={7} ry={3} fill="rgba(255,255,255,0.5)" transform="rotate(-45 8 48)" />
      <circle cx={44} cy={12} r={4} fill="rgba(99,179,237,0.8)" />
    </svg>
  )
}

function FlameIllustration() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden>
      <path d="M28 48 C14 40 10 28 18 20 C18 28 24 30 24 30 C22 20 28 10 28 10 C28 10 38 20 36 30 C36 30 42 28 42 20 C50 28 46 40 28 48Z"
        fill="rgba(245,158,11,0.6)" />
      <path d="M28 44 C20 38 18 30 22 24 C22 30 26 32 26 32 C25 26 28 18 28 18 C28 18 34 26 32 32 C32 32 36 30 36 24 C40 30 38 38 28 44Z"
        fill="rgba(245,158,11,0.9)" />
      <circle cx={28} cy={38} r={4} fill="rgba(255,255,255,0.4)" />
    </svg>
  )
}

function FlagIllustration() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden>
      <line x1={14} y1={10} x2={14} y2={48} stroke="rgba(255,255,255,0.7)" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M14 12 L42 18 L38 30 L14 30 Z" fill="rgba(245,158,11,0.7)" />
      <rect x={14} y={12} width={14} height={9} fill="rgba(245,158,11,0.4)" />
      <rect x={28} y={21} width={14} height={9} fill="rgba(245,158,11,0.4)" />
      <line x1={10} y1={44} x2={46} y2={44} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

function WaveformIllustration() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden>
      <polyline
        points="4,28 10,28 14,14 20,42 26,20 32,36 38,22 42,34 46,28 52,28"
        stroke="rgba(52,211,153,0.8)"
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={28} cy={28} r={3} fill="rgba(52,211,153,0.6)" />
    </svg>
  )
}

function greetingForNow(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
