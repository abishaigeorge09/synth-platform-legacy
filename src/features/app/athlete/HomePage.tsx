import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Settings, ArrowUpRight, X, Share2 } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_ATHLETES, fmtErgTime, fmtAgo } from '../data/mockTeam'
import { APP_MOCK_NOTES } from '../data/mockNotes'
import { AthleteLineupHeroPanel } from '../coach/lineupHero/AthleteLineupHeroPanel'
import { useUiStore } from '../../../shared/store/useUiStore'

// ─── Card data ───────────────────────────────────────────────────────────────

type SubMetric = { value: string; label: string }
type HeroCard = {
  word: string
  metric: string
  label: string
  provenance: string
  bg: string
  accent: string
  subMetrics: SubMetric[]
  Illustration: () => React.ReactElement
  LargeScene: () => React.ReactElement
}

export function HomePage() {
  const pagerRef = useRef<HTMLDivElement | null>(null)
  const setHeroPageActive = useUiStore((s) => s.setHeroPageActive)
  const homePanelRequest = useUiStore((s) => s.homePanelRequest)
  const setHomePanelRequest = useUiStore((s) => s.setHomePanelRequest)

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

  useEffect(() => {
    if (homePanelRequest === null) return
    goToPage(homePanelRequest)
    setHeroPageActive(homePanelRequest === 0)
    setHomePanelRequest(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homePanelRequest])

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{ height: '100svh', maxHeight: '100svh', background: '#050B1C' }}
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

// ─── Dashboard Panel ──────────────────────────────────────────────────────────

function AthleteDashboardPanel() {
  const navigate = useNavigate()
  const me = APP_MOCK_ATHLETES[0]
  const greeting = greetingForNow()
  const sharedNotes = APP_MOCK_NOTES.filter(
    (n) => n.athleteId === me.id || n.visibleToAthlete,
  ).slice(0, 3)
  const [activeCard, setActiveCard] = useState(0)
  const [fullCard, setFullCard] = useState<HeroCard | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const HERO_CARDS: HeroCard[] = [
    {
      word: 'PULL',
      metric: fmtErgTime(me.twoKBestSeconds),
      label: 'Best 2K time',
      provenance: 'Concept2 · 4m ago',
      bg: '#0B0E2A',
      accent: '#63B3ED',
      subMetrics: [
        { value: '1:48', label: 'Avg split' },
        { value: '253W', label: 'Avg power' },
        { value: '2,000m', label: 'Distance' },
      ],
      Illustration: OarIllustration,
      LargeScene: PullScene,
    },
    {
      word: 'STREAK',
      metric: `${me.streakDays}`,
      label: 'Days consecutive',
      provenance: 'synth · live',
      bg: '#071A0E',
      accent: SYNTH.accentEmerald,
      subMetrics: [
        { value: '5', label: 'This week' },
        { value: '18.2km', label: 'Volume' },
        { value: '6', label: 'Record' },
      ],
      Illustration: FlameIllustration,
      LargeScene: StreakScene,
    },
    {
      word: 'RACE',
      metric: '9',
      label: 'Days to Pacific Cup',
      provenance: 'Coach Geri · 2d ago',
      bg: '#1A0A00',
      accent: SYNTH.accentAmber,
      subMetrics: [
        { value: '2K', label: 'Race dist.' },
        { value: 'W8+', label: 'Event' },
        { value: 'Fri', label: 'Tune-up' },
      ],
      Illustration: FlagIllustration,
      LargeScene: RaceScene,
    },
    {
      word: 'RECOVER',
      metric: `${me.recoveryScore}`,
      label: 'Recovery score',
      provenance: 'WHOOP · 6m ago',
      bg: '#040C20',
      accent: '#34D399',
      subMetrics: [
        { value: '52ms', label: 'HRV' },
        { value: '7.2h', label: 'Sleep' },
        { value: '84%', label: 'Readiness' },
      ],
      Illustration: WaveformIllustration,
      LargeScene: RecoverScene,
    },
  ]

  const onCardScroll = () => {
    const el = cardRef.current
    if (!el) return
    setActiveCard(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div
      className="synth-scroll flex h-full w-full flex-col overflow-y-auto pb-safe-tab"
      style={{
        background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font,
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 pb-2"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 16px)',
          color: SYNTH.inkOnBrand,
        }}
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
        <p className="text-[15px] leading-[1.3]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
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
              onClick={() => setFullCard(card)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setFullCard(card)
                }
              }}
              className="relative flex shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-[28px] p-5"
              style={{
                background: card.bg,
                border: `1px solid rgba(255,255,255,0.09)`,
                width: 'min(82vw, 300px)',
                minHeight: 220,
                scrollSnapAlign: 'center',
              }}
            >
              {/* Watermark */}
              <span
                className="pointer-events-none absolute right-3 bottom-3 select-none font-bold leading-none"
                style={{
                  fontSize: 80,
                  color: 'rgba(255,255,255,0.06)',
                  fontFamily: SYNTH.font,
                  letterSpacing: '-0.04em',
                }}
              >
                {card.word}
              </span>

              {/* Top label */}
              <div className="flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ background: card.accent }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: card.accent, fontFamily: SYNTH.font }}
                >
                  {card.word}
                </span>
              </div>

              {/* Metric + illustration */}
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

              {/* Provenance */}
              <p
                className="text-[10px] font-medium uppercase tracking-[0.14em]"
                style={{ color: 'rgba(255,255,255,0.3)', fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
              >
                {card.provenance}
              </p>
            </motion.article>
          ))}
          <div className="w-5 shrink-0" />
        </div>

        {/* Page dots */}
        <div className="mt-3 flex justify-center gap-1.5 pr-5">
          {HERO_CARDS.map((_, cardIndex) => (
            <span
              key={cardIndex}
              className="rounded-full transition-all duration-200"
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
          style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
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

      {/* Ask synth */}
      <section className="mt-5 px-5">
        <button
          type="button"
          onClick={() => navigate('/app/athlete/ai')}
          className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 active:opacity-80"
          style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
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

      {/* ── Full-screen GO Club card overlay ── */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {fullCard && (
              <>
                <motion.div
                  key="full-card-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[90]"
                  style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
                />
                <motion.div
                  key="full-card"
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100%' }}
                  transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                  className="fixed inset-x-0 bottom-0 z-[100] flex flex-col overflow-hidden"
                  style={{
                    top: 0,
                    background: fullCard.bg,
                    fontFamily: SYNTH.font,
                  }}
                >
                  {/* Top bar */}
                  <div
                    className="flex shrink-0 items-center justify-between px-6"
                    style={{ paddingTop: 'max(env(safe-area-inset-top), 24px)', paddingBottom: 12 }}
                  >
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                      style={{ color: fullCard.accent, fontFamily: SYNTH.font }}
                    >
                      {fullCard.word}
                    </span>
                    <motion.button
                      type="button"
                      aria-label="Close"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFullCard(null)}
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        color: '#FFFFFF',
                      }}
                    >
                      <X size={18} strokeWidth={2.4} />
                    </motion.button>
                  </div>

                  {/* Large illustration — fills the visual center */}
                  <div className="flex flex-1 items-center justify-center">
                    <fullCard.LargeScene />
                  </div>

                  {/* Stats overlay at bottom */}
                  <div
                    className="shrink-0 px-7"
                    style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 36px)' }}
                  >
                    {/* Date */}
                    <p
                      className="text-[13px]"
                      style={{ color: 'rgba(255,255,255,0.45)', fontFamily: SYNTH.font }}
                    >
                      {fmtFullDate()}
                    </p>

                    {/* Metric */}
                    <p
                      className="mt-1 leading-none font-bold tracking-[-0.03em]"
                      style={{
                        fontSize: 'clamp(56px, 18vw, 80px)',
                        color: '#FFFFFF',
                        fontFamily: SYNTH.font,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {fullCard.metric}
                    </p>
                    <p
                      className="mt-1 text-[15px] font-semibold"
                      style={{ color: 'rgba(255,255,255,0.65)', fontFamily: SYNTH.font }}
                    >
                      {fullCard.label}
                    </p>

                    {/* Sub-metrics */}
                    <div className="mt-5 flex gap-8">
                      {fullCard.subMetrics.map((sm) => (
                        <div key={sm.label}>
                          <p
                            className="text-[22px] font-bold leading-none"
                            style={{ color: '#FFFFFF', fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
                          >
                            {sm.value}
                          </p>
                          <p
                            className="mt-1 text-[10px] uppercase tracking-[0.14em]"
                            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: SYNTH.font }}
                          >
                            {sm.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Page dots */}
                    <div className="mt-6 flex gap-2">
                      {HERO_CARDS.map((c) => (
                        <span
                          key={c.word}
                          className="rounded-full transition-all duration-200"
                          style={{
                            width: c.word === fullCard.word ? 20 : 6,
                            height: 6,
                            background:
                              c.word === fullCard.word
                                ? fullCard.accent
                                : 'rgba(255,255,255,0.25)',
                          }}
                        />
                      ))}
                    </div>

                    {/* Share CTA */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-semibold"
                      style={{
                        background: fullCard.accent + '1A',
                        border: `1.5px solid ${fullCard.accent}55`,
                        color: fullCard.accent,
                        fontFamily: SYNTH.font,
                        letterSpacing: '0.02em',
                      }}
                    >
                      <Share2 size={16} strokeWidth={2.2} />
                      Share
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtFullDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  })
}

function greetingForNow(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Small card illustrations ─────────────────────────────────────────────────

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
      <path d="M28 48 C14 40 10 28 18 20 C18 28 24 30 24 30 C22 20 28 10 28 10 C28 10 38 20 36 30 C36 30 42 28 42 20 C50 28 46 40 28 48Z" fill="rgba(245,158,11,0.6)" />
      <path d="M28 44 C20 38 18 30 22 24 C22 30 26 32 26 32 C25 26 28 18 28 18 C28 18 34 26 32 32 C32 32 36 30 36 24 C40 30 38 38 28 44Z" fill="rgba(245,158,11,0.9)" />
      <circle cx={28} cy={38} r={4} fill="rgba(255,255,255,0.4)" />
    </svg>
  )
}

function FlagIllustration() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden>
      <line x1={14} y1={10} x2={14} y2={48} stroke="rgba(255,255,255,0.7)" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M14 12 L42 18 L38 30 L14 30 Z" fill="rgba(245,158,11,0.7)" />
      <line x1={10} y1={44} x2={46} y2={44} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

function WaveformIllustration() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden>
      <polyline points="4,28 10,28 14,14 20,42 26,20 32,36 38,22 42,34 46,28 52,28" stroke="rgba(52,211,153,0.8)" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={28} cy={28} r={3} fill="rgba(52,211,153,0.6)" />
    </svg>
  )
}

// ─── Large full-screen scene illustrations ────────────────────────────────────

function PullScene() {
  return (
    <svg width={260} height={320} viewBox="0 0 260 320" fill="none" aria-hidden>
      {/* Sky gradient band */}
      <defs>
        <linearGradient id="pullSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1240" />
          <stop offset="100%" stopColor="#1A2A60" />
        </linearGradient>
        <linearGradient id="pullWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D2080" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#060E30" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width={260} height={200} fill="url(#pullSky)" />
      <rect y={200} width={260} height={120} fill="url(#pullWater)" />

      {/* City skyline silhouette */}
      <rect x={0} y={148} width={18} height={52} fill="rgba(255,255,255,0.05)" />
      <rect x={22} y={130} width={14} height={70} fill="rgba(255,255,255,0.05)" />
      <rect x={40} y={140} width={22} height={60} fill="rgba(255,255,255,0.05)" />
      <rect x={66} y={118} width={16} height={82} fill="rgba(255,255,255,0.05)" />
      <rect x={86} y={135} width={11} height={65} fill="rgba(255,255,255,0.05)" />
      <rect x={160} y={128} width={14} height={72} fill="rgba(255,255,255,0.04)" />
      <rect x={178} y={115} width={20} height={85} fill="rgba(255,255,255,0.04)" />
      <rect x={202} y={138} width={12} height={62} fill="rgba(255,255,255,0.04)" />
      <rect x={218} y={125} width={18} height={75} fill="rgba(255,255,255,0.04)" />
      <rect x={240} y={140} width={20} height={60} fill="rgba(255,255,255,0.04)" />

      {/* Bridge arc left */}
      <path d="M 0 188 Q 65 155 130 188" stroke="rgba(255,255,255,0.14)" strokeWidth={2} fill="none" />
      {/* Bridge cables */}
      <line x1={65} y1={155} x2={20} y2={188} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <line x1={65} y1={155} x2={45} y2={188} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <line x1={65} y1={155} x2={90} y2={188} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <line x1={65} y1={155} x2={112} y2={188} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

      {/* Bridge arc right */}
      <path d="M 130 188 Q 195 155 260 188" stroke="rgba(255,255,255,0.14)" strokeWidth={2} fill="none" />
      <line x1={195} y1={155} x2={148} y2={188} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <line x1={195} y1={155} x2={172} y2={188} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <line x1={195} y1={155} x2={218} y2={188} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <line x1={195} y1={155} x2={242} y2={188} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

      {/* Water lane lines */}
      <line x1={0} y1={215} x2={260} y2={215} stroke="rgba(99,179,237,0.15)" strokeWidth={1} strokeDasharray="6 8" />
      <line x1={0} y1={240} x2={260} y2={240} stroke="rgba(99,179,237,0.10)" strokeWidth={1} strokeDasharray="6 8" />
      <line x1={0} y1={268} x2={260} y2={268} stroke="rgba(99,179,237,0.08)" strokeWidth={1} strokeDasharray="6 8" />

      {/* Boat hull — elongated ellipse */}
      <path d="M 18 218 Q 130 210 242 218 Q 242 226 130 222 Q 18 226 18 218 Z"
        fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.28)" strokeWidth={1.5} />
      {/* Seat dots */}
      <circle cx={70} cy={217} r={2.5} fill="rgba(255,255,255,0.4)" />
      <circle cx={95} cy={216} r={2.5} fill="rgba(255,255,255,0.4)" />
      <circle cx={120} cy={216} r={2.5} fill="rgba(255,255,255,0.4)" />
      <circle cx={145} cy={216} r={2.5} fill="rgba(255,255,255,0.4)" />
      <circle cx={170} cy={217} r={2.5} fill="rgba(255,255,255,0.4)" />

      {/* Oar left */}
      <line x1={36} y1={218} x2={112} y2={210} stroke="rgba(255,255,255,0.65)" strokeWidth={2.2} strokeLinecap="round" />
      <ellipse cx={30} cy={219} rx={10} ry={3.5} fill="rgba(99,179,237,0.55)" transform="rotate(-8 30 219)" />
      {/* Oar right */}
      <line x1={224} y1={218} x2={148} y2={210} stroke="rgba(255,255,255,0.65)" strokeWidth={2.2} strokeLinecap="round" />
      <ellipse cx={230} cy={219} rx={10} ry={3.5} fill="rgba(99,179,237,0.55)" transform="rotate(8 230 219)" />

      {/* Finish gate posts */}
      <line x1={118} y1={170} x2={118} y2={214} stroke="rgba(255,255,255,0.45)" strokeWidth={2} />
      <line x1={142} y1={170} x2={142} y2={214} stroke="rgba(255,255,255,0.45)" strokeWidth={2} />
      {/* Finish banner */}
      <rect x={118} y={170} width={24} height={4} fill="rgba(99,179,237,0.8)" rx={1} />
      {/* Timing board */}
      <rect x={122} y={176} width={16} height={10} rx={2} fill="rgba(0,0,0,0.5)" stroke="rgba(99,179,237,0.6)" strokeWidth={1} />
      <text x={130} y={184} fill="rgba(99,179,237,0.9)" fontSize="5" fontFamily="monospace" textAnchor="middle">6:44</text>

      {/* Water splash at left oar */}
      <circle cx={30} cy={222} r={5} fill="none" stroke="rgba(99,179,237,0.35)" strokeWidth={1.2} />
      <circle cx={30} cy={222} r={9} fill="none" stroke="rgba(99,179,237,0.18)" strokeWidth={1} />
      {/* Stars */}
      <circle cx={25} cy={28} r={1.2} fill="rgba(255,255,255,0.55)" />
      <circle cx={58} cy={45} r={0.8} fill="rgba(255,255,255,0.4)" />
      <circle cx={90} cy={20} r={1} fill="rgba(255,255,255,0.5)" />
      <circle cx={170} cy={35} r={1.2} fill="rgba(255,255,255,0.45)" />
      <circle cx={210} cy={18} r={0.9} fill="rgba(255,255,255,0.5)" />
      <circle cx={238} cy={52} r={1.1} fill="rgba(255,255,255,0.4)" />

      {/* Accent glow at finish */}
      <circle cx={130} cy={188} r={20} fill="rgba(99,179,237,0.06)" />
      <circle cx={130} cy={188} r={10} fill="rgba(99,179,237,0.1)" />
    </svg>
  )
}

function StreakScene() {
  return (
    <svg width={260} height={320} viewBox="0 0 260 320" fill="none" aria-hidden>
      <defs>
        <radialGradient id="fireGlow" cx="50%" cy="70%" r="55%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#071A0E" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Background glow */}
      <rect width={260} height={320} fill="url(#fireGlow)" />

      {/* Back flame (large, faint) */}
      <path d="M 130 40 C 90 80 70 130 90 180 C 90 150 110 140 110 140 C 100 100 120 60 130 60 C 140 60 160 100 150 140 C 150 140 170 150 170 180 C 190 130 170 80 130 40 Z"
        fill="rgba(245,158,11,0.18)" />

      {/* Mid flame */}
      <path d="M 130 70 C 100 105 85 148 103 192 C 103 165 118 156 118 156 C 109 122 124 88 130 88 C 136 88 151 122 142 156 C 142 156 157 165 157 192 C 175 148 160 105 130 70 Z"
        fill="rgba(245,158,11,0.45)" />

      {/* Front flame (brightest) */}
      <path d="M 130 100 C 112 128 106 160 116 200 C 116 178 124 172 124 172 C 118 150 126 128 130 128 C 134 128 142 150 136 172 C 136 172 144 178 144 200 C 154 160 148 128 130 100 Z"
        fill="rgba(245,158,11,0.85)" />

      {/* Inner flame core */}
      <path d="M 130 130 C 122 148 120 168 125 192 C 125 175 128 170 130 165 C 132 170 135 175 135 192 C 140 168 138 148 130 130 Z"
        fill="rgba(255,255,255,0.6)" />

      {/* Ember sparks */}
      <circle cx={100} cy={95} r={2} fill="rgba(245,158,11,0.7)" />
      <circle cx={158} cy={88} r={2.5} fill="rgba(245,158,11,0.6)" />
      <circle cx={88} cy={130} r={1.5} fill="rgba(245,158,11,0.5)" />
      <circle cx={172} cy={118} r={1.8} fill="rgba(245,158,11,0.5)" />
      <circle cx={115} cy={72} r={1.2} fill="rgba(255,200,50,0.6)" />
      <circle cx={148} cy={68} r={1} fill="rgba(255,200,50,0.5)" />

      {/* Calendar grid (faint, below the flame) */}
      {[0, 1, 2, 3, 4, 5, 6].map((col) =>
        [0, 1, 2, 3].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={50 + col * 24}
            y={248 + row * 16}
            width={18}
            height={11}
            rx={3}
            fill={col < 5 && row < 3 ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.06)'}
          />
        )),
      )}

      {/* Streak count labels */}
      <text x={130} y={312} fill="rgba(255,255,255,0.2)" fontSize={10} fontFamily="monospace" textAnchor="middle">
        {new Date().toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
      </text>

      {/* Ground reflection */}
      <ellipse cx={130} cy={238} rx={38} ry={8} fill="rgba(245,158,11,0.12)" />
      <line x1={0} y1={240} x2={260} y2={240} stroke="rgba(245,158,11,0.08)" strokeWidth={1} />
    </svg>
  )
}

function RaceScene() {
  return (
    <svg width={260} height={320} viewBox="0 0 260 320" fill="none" aria-hidden>
      <defs>
        <linearGradient id="raceSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#200800" />
          <stop offset="100%" stopColor="#3D1200" />
        </linearGradient>
        <linearGradient id="raceWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A0E00" />
          <stop offset="100%" stopColor="#0A0400" />
        </linearGradient>
      </defs>
      <rect width={260} height={160} fill="url(#raceSky)" />
      <rect y={160} width={260} height={160} fill="url(#raceWater)" />

      {/* Crowd silhouette banks */}
      {/* Left bank */}
      <path d="M 0 158 Q 20 145 40 155 Q 60 140 80 152 Q 100 138 120 150 Q 140 142 160 152 Q 180 138 200 148 Q 220 135 240 145 Q 250 140 260 148 L 260 160 L 0 160 Z"
        fill="rgba(255,160,80,0.12)" />

      {/* Race lanes (converging perspective) */}
      <line x1={130} y1={100} x2={0} y2={320} stroke="rgba(255,160,80,0.18)" strokeWidth={1} />
      <line x1={130} y1={100} x2={52} y2={320} stroke="rgba(255,160,80,0.14)" strokeWidth={1} />
      <line x1={130} y1={100} x2={104} y2={320} stroke="rgba(255,160,80,0.10}" strokeWidth={1} />
      <line x1={130} y1={100} x2={156} y2={320} stroke="rgba(255,160,80,0.10)" strokeWidth={1} />
      <line x1={130} y1={100} x2={208} y2={320} stroke="rgba(255,160,80,0.14)" strokeWidth={1} />
      <line x1={130} y1={100} x2={260} y2={320} stroke="rgba(255,160,80,0.18)" strokeWidth={1} />

      {/* Finish line banner */}
      <rect x={60} y={96} width={140} height={6} rx={3} fill="rgba(245,158,11,0.85)" />
      {/* Finish posts */}
      <line x1={60} y1={82} x2={60} y2={160} stroke="rgba(255,255,255,0.4)" strokeWidth={2.5} />
      <line x1={200} y1={82} x2={200} y2={160} stroke="rgba(255,255,255,0.4)" strokeWidth={2.5} />
      {/* Checkered flag pattern on banner */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          x={60 + i * 20}
          y={96}
          width={10}
          height={6}
          fill={i % 2 === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'}
        />
      ))}

      {/* Boats at the line — 8 boats */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const lanes = 8
        const x = 10 + (i * (240 / lanes))
        const y = 168 + i * 1.5
        return (
          <g key={i}>
            <path d={`M ${x} ${y + 4} Q ${x + 14} ${y} ${x + 28} ${y + 4} Q ${x + 28} ${y + 8} ${x + 14} ${y + 6} Q ${x} ${y + 8} ${x} ${y + 4} Z`}
              fill={i === 4 ? 'rgba(245,158,11,0.7)' : 'rgba(255,255,255,0.12)'}
              stroke={i === 4 ? 'rgba(245,158,11,0.9)' : 'rgba(255,255,255,0.25)'}
              strokeWidth={1} />
            {/* Oar hints */}
            <line x1={x - 4} y1={y + 4} x2={x + 10} y2={y + 2} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <line x1={x + 32} y1={y + 4} x2={x + 18} y2={y + 2} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
          </g>
        )
      })}

      {/* Water reflections */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={0}
          y1={195 + i * 25}
          x2={260}
          y2={195 + i * 25}
          stroke="rgba(245,158,11,0.06)"
          strokeWidth={8}
        />
      ))}

      {/* Spotlight glow at finish */}
      <ellipse cx={130} cy={102} rx={60} ry={18} fill="rgba(245,158,11,0.12)" />

      {/* Timer/clock display */}
      <rect x={104} y={74} width={52} height={18} rx={4} fill="rgba(0,0,0,0.6)" stroke="rgba(245,158,11,0.5)" strokeWidth={1} />
      <text x={130} y={86} fill="rgba(245,158,11,0.95)" fontSize="9" fontFamily="monospace" textAnchor="middle">6:44.2</text>
    </svg>
  )
}

function RecoverScene() {
  return (
    <svg width={260} height={320} viewBox="0 0 260 320" fill="none" aria-hidden>
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="30%" r="40%">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#040C20" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="recoverSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#040C20" />
          <stop offset="70%" stopColor="#071528" />
          <stop offset="100%" stopColor="#0A2030" />
        </linearGradient>
        <linearGradient id="recoverWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A2030" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#020810" />
        </linearGradient>
      </defs>
      <rect width={260} height={220} fill="url(#recoverSky)" />
      <rect y={220} width={260} height={100} fill="url(#recoverWater)" />
      <rect width={260} height={320} fill="url(#moonGlow)" />

      {/* Moon */}
      <circle cx={130} cy={72} r={32} fill="rgba(52,211,153,0.10)" />
      <circle cx={130} cy={72} r={24} fill="rgba(52,211,153,0.16)" />
      <circle cx={130} cy={72} r={18} fill="rgba(52,211,153,0.55)" />
      {/* Moon crescent shadow */}
      <circle cx={139} cy={68} r={15} fill="rgba(4,12,32,0.65)" />

      {/* Stars */}
      {[
        [40, 30], [70, 52], [200, 28], [220, 55], [55, 90], [190, 80],
        [240, 100], [30, 110], [185, 45], [165, 95],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 0.9} fill="rgba(255,255,255,0.55)" />
      ))}

      {/* HRV waveform */}
      <polyline
        points="0,182 20,182 28,165 36,200 44,158 52,192 60,175 68,188 76,170 84,185 92,173 100,180 108,168 116,182 124,165 132,185 140,170 148,180 156,165 164,185 172,175 180,183 188,170 196,182 204,173 212,181 220,165 228,185 236,175 244,182 252,178 260,182"
        stroke="rgba(52,211,153,0.65)"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* HRV fill area */}
      <path
        d="M 0,182 20,182 28,165 36,200 44,158 52,192 60,175 68,188 76,170 84,185 92,173 100,180 108,168 116,182 124,165 132,185 140,170 148,180 156,165 164,185 172,175 180,183 188,170 196,182 204,173 212,181 220,165 228,185 236,175 244,182 252,178 260,182 L 260,210 L 0,210 Z"
        fill="rgba(52,211,153,0.06)"
      />

      {/* Calm water surface */}
      <line x1={0} y1={222} x2={260} y2={222} stroke="rgba(52,211,153,0.18)" strokeWidth={1.5} />

      {/* Moon reflection on water */}
      <ellipse cx={130} cy={240} rx={22} ry={6} fill="rgba(52,211,153,0.12)" />
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={108 + i * 8}
          y1={246 + i * 8}
          x2={152 - i * 8}
          y2={246 + i * 8}
          stroke="rgba(52,211,153,0.08)"
          strokeWidth={2}
        />
      ))}

      {/* Lone boat on water */}
      <path d="M 94 225 Q 130 219 166 225 Q 166 230 130 227 Q 94 230 94 225 Z"
        fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

      {/* HRV ring arc */}
      <circle cx={130} cy={72} r={44} fill="none" stroke="rgba(52,211,153,0.15)" strokeWidth={2} strokeDasharray="8 5" />

      {/* Recovery score ring — 84% */}
      <circle cx={130} cy={72} r={50} fill="none" stroke="rgba(52,211,153,0.08)" strokeWidth={4} />
      <circle
        cx={130}
        cy={72}
        r={50}
        fill="none"
        stroke="rgba(52,211,153,0.5)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${2 * Math.PI * 50 * 0.84} ${2 * Math.PI * 50}`}
        transform="rotate(-90 130 72)"
      />
    </svg>
  )
}

