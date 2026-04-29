import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, BarChart3 } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { QuickStatsSheet } from '../primitives/SourcesSheets'
import { APP_MOCK_TEAM, APP_MOCK_SCHEDULE } from '../data/mockTeam'
import { LineupHeroPanel } from './lineupHero/LineupHeroPanel'
import { useUiStore } from '../../../shared/store/useUiStore'

/**
 * Coach home — horizontal pager.
 *   Page 0 (left)  = Lineup hero — dark water, boat illustration.
 *   Page 1 (right) = Dashboard  — cobalt canvas, team overview.
 *
 * On every fresh load the pager instantly snaps to page 1 (dashboard) then
 * smoothly slides back to page 0 (lineup hero) so the user sees both in a
 * brief reveal. Pressing the Home nav button always snaps to page 1.
 */
export function HomePage() {
  const pagerRef = useRef<HTMLDivElement | null>(null)
  const homePanelRequest = useUiStore((s) => s.homePanelRequest)
  const setHomePanelRequest = useUiStore((s) => s.setHomePanelRequest)
  const setHeroPageActive = useUiStore((s) => s.setHeroPageActive)

  const goToPage = (index: number) => {
    const el = pagerRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
  }

  // Track which page is visible so the tab bar can hide on the lineup hero.
  const onPagerScroll = () => {
    const el = pagerRef.current
    if (!el) return
    const pageIdx = Math.round(el.scrollLeft / el.clientWidth)
    setHeroPageActive(pageIdx === 0)
  }

  // Start on page 0 (lineup hero), hide tab bar immediately.
  useEffect(() => {
    setHeroPageActive(true)
    const pendingPanel = useUiStore.getState().homePanelRequest
    if (pendingPanel !== null) {
      const el = pagerRef.current
      if (el) {
        el.scrollLeft = pendingPanel * el.clientWidth
        setHeroPageActive(pendingPanel === 0)
      }
      setHomePanelRequest(null)
    }
    return () => setHeroPageActive(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When home button is pressed while already on this page.
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
        {/* Page 0 — Lineup hero */}
        <div className="flex h-full w-full shrink-0 snap-center">
          <LineupHeroPanel onPeekDashboard={() => goToPage(1)} />
        </div>
        {/* Page 1 — Dashboard */}
        <div className="flex h-full w-full shrink-0 snap-center">
          <DashboardPanel />
        </div>
      </div>
    </div>
  )
}

function DashboardPanel() {
  const navigate = useNavigate()
  const greeting = greetingForNow()
  const weekItems = APP_MOCK_SCHEDULE
  const [statsOpen, setStatsOpen] = useState(false)
  return (
    <div
      className="synth-scroll flex h-full w-full flex-col overflow-y-auto pb-[120px]"
      style={{ background: 'linear-gradient(180deg, #2E37F2 0%, #1F26C9 100%)' }}
    >
      <header
        className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2"
        style={{ color: SYNTH.inkOnBrand }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          synth · coach
        </span>
        <button
          type="button"
          aria-label="Quick stats"
          data-tour="coach-home-stats-button"
          onClick={() => setStatsOpen(true)}
          className="flex h-9 items-center gap-1.5 rounded-full px-3"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <BarChart3 size={14} strokeWidth={2.2} />
        </button>
      </header>

      <QuickStatsSheet
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        title="Team at a glance"
        stats={[
          { label: 'Active today', value: `${APP_MOCK_TEAM.activeToday}`, unit: `/${APP_MOCK_TEAM.athleteCount}`, source: 'synth.', syncedAgo: 'just now' },
          { label: 'Avg recovery', value: `${APP_MOCK_TEAM.avgRecovery}`, delta: { direction: 'up', value: '+3' }, source: 'WHOOP', syncedAgo: '6m' },
          { label: 'Attention', value: `${APP_MOCK_TEAM.attentionCount}`, source: 'synth.', syncedAgo: 'live' },
          { label: 'Sessions today', value: `${APP_MOCK_TEAM.sessionsToday}`, source: 'Concept2', syncedAgo: '4m' },
          { label: 'Avg 2K (30d)', value: '7:14', source: 'Concept2', syncedAgo: '4m' },
          { label: 'Volume (wk)', value: '142k', unit: 'm', delta: { direction: 'up', value: '+8%' }, source: 'Concept2', syncedAgo: '4m' },
        ]}
      />

      <motion.h1
        data-tour="coach-home-greeting"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="px-5 pt-3 text-[26px] font-bold leading-[1.15] tracking-[-0.01em]"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {greeting}, Coach.
        <br />
        <span data-tour="coach-home-race-countdown">Race day in 3 days.</span>
      </motion.h1>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-5 mt-6 rounded-3xl p-5"
        style={{
          background: SYNTH.inlineCard,
          border: `1px solid ${SYNTH.inlineCardBorder}`,
        }}
      >
        <div className="mb-3 flex items-center gap-2">
          <span
            className="inline-flex h-1.5 w-1.5 rounded-full"
            style={{ background: SYNTH.accentEmerald, boxShadow: `0 0 0 4px ${SYNTH.accentEmerald}33` }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Today's state
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <p
            className="flex-1 text-[18px] font-semibold leading-[1.3]"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {APP_MOCK_TEAM.activeToday} of {APP_MOCK_TEAM.athleteCount} athletes synced.{' '}
            {APP_MOCK_TEAM.sessionsToday} sessions logged. {APP_MOCK_TEAM.attentionCount} flags raised.
          </p>
          <ArrowUpRight size={20} color={SYNTH.inkOnBrandMuted} />
        </div>
        <p
          className="mt-3 text-[11px] leading-[1.5]"
          style={{ color: SYNTH.provenanceOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
        >
          Concept2 · Strava · TrainingPeaks · last sync 4m ago
        </p>
      </motion.section>

      <section className="mt-7 px-5">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Today's plan
        </p>
        <div
          className="mt-2 flex items-baseline gap-5 text-[15px] font-semibold"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
        >
          <span>6 boats</span>
          <span style={{ color: SYNTH.inkOnBrandFaint }}>·</span>
          <span>90 min</span>
          <span style={{ color: SYNTH.inkOnBrandFaint }}>·</span>
          <span>{APP_MOCK_TEAM.activeToday} athletes</span>
        </div>
        <div className="mt-4 flex gap-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: 4,
                background: i < 14 ? SYNTH.inkOnBrand : SYNTH.inlineCard,
                opacity: i < 14 ? 1 : 0.6,
              }}
            />
          ))}
        </div>
        <div
          className="mt-2 flex justify-between text-[10px] font-medium"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          <span>5:00</span>
          <span>9:00</span>
          <span>13:00</span>
          <span>17:00</span>
          <span>21:00</span>
        </div>
      </section>

      <section className="mt-8 pl-5">
        <header className="flex items-baseline justify-between pr-5 pb-3">
          <h2
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Needs your eye
          </h2>
          <button
            type="button"
            onClick={() => navigate('/app/coach/attention')}
            className="text-[12px] font-semibold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            View all ›
          </button>
        </header>
        <CardCarousel>
          <CandyCard
            color={SYNTH.cardSky}
            kicker="Today's session"
            headline="8 × 500m at 22 spm — water at 06:30."
            ctaLabel="Open plan"
            provenance="TrainingPeaks · synced 12m ago"
            onClick={() => navigate('/app/coach/lineups')}
          />
          <CandyCard
            color={SYNTH.cardYellow}
            kicker="Lineup"
            headline="V8 lineup posted for tomorrow — stroke seat changed."
            ctaLabel="Review lineup"
            provenance="Lineups · just now"
            onClick={() => navigate('/app/coach/lineups')}
          />
          <CandyCard
            color={SYNTH.cardMint}
            kicker="Race"
            headline="Cal Invite Regatta in 3 days — Saturday, 5:30 AM."
            ctaLabel="Open schedule"
            provenance="Google Calendar · synced 8m ago"
            onClick={() => navigate('/app/coach/lineups')}
          />
          <CandyCard
            color={SYNTH.cardPink}
            kicker="Attendance"
            headline="2 athletes missed AM practice yesterday."
            ctaLabel="See who"
            provenance="TeamWorks · synced 2h ago"
            onClick={() => navigate('/app/coach/notes')}
          />
        </CardCarousel>
      </section>

      <section className="mt-7 px-5">
        <header className="flex items-baseline justify-between pb-3">
          <h2
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            This week
          </h2>
          <button
            type="button"
            onClick={() => navigate('/app/coach/lineups')}
            className="text-[12px] font-semibold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            Open schedule ›
          </button>
        </header>
        <div
          data-tour="coach-home-schedule"
          className="overflow-hidden rounded-3xl"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          {weekItems.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate('/app/coach/lineups')}
              className="flex w-full items-start gap-3 px-4 py-4 text-left active:opacity-80"
              style={{
                borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}`,
              }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: SYNTH.glass,
                  border: `1px solid ${SYNTH.glassBorder}`,
                  color: SYNTH.inkOnBrand,
                  fontFamily: SYNTH.font,
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.04em',
                }}
              >
                {item.iconLetter}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[14px] font-semibold leading-tight"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {item.when} · {item.headline}
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.4]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  {item.detail}
                </p>
                <p
                  className="mt-1.5 text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: SYNTH.provenanceOnBrand, fontFamily: SYNTH.font }}
                >
                  {item.provenance}
                </p>
              </div>
              <span
                className="ml-2 mt-2 inline-flex h-2 w-2 shrink-0 rounded-full"
                style={{
                  background:
                    item.severity === 'high'
                      ? SYNTH.accentRed
                      : item.severity === 'med'
                        ? SYNTH.accentAmber
                        : SYNTH.accentEmerald,
                }}
              />
            </button>
          ))}
        </div>
      </section>

    </div>
  )
}

function CardCarousel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 pr-5"
      style={{
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style>{`.synth-carousel::-webkit-scrollbar{display:none}`}</style>
      {children}
    </div>
  )
}

function CandyCard({
  color,
  kicker,
  headline,
  ctaLabel,
  provenance,
  onClick,
}: {
  color: string
  kicker: string
  headline: string
  ctaLabel: string
  provenance: string
  onClick: () => void
}) {
  // Use a darker tint of the card color for the CTA pill / kicker dot
  const ink = SYNTH.ink
  return (
    <motion.article
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="flex shrink-0 cursor-pointer flex-col gap-3 p-6"
      style={{
        background: color,
        boxShadow: SYNTH.shadow.cardLifted,
        borderRadius: SYNTH.radius.card,
        width: 'min(86vw, 320px)',
        minHeight: 220,
        scrollSnapAlign: 'center',
        color: ink,
        fontFamily: SYNTH.font,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-1.5 w-1.5 rounded-full"
          style={{ background: ink }}
        />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: ink, opacity: 0.7 }}
        >
          {kicker}
        </span>
      </div>
      <p className="flex-1 text-[20px] font-bold leading-[1.2] tracking-[-0.01em]" style={{ color: ink }}>
        {headline}
      </p>
      <div className="flex items-center justify-between gap-3">
        <span
          className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold"
          style={{
            background: SYNTH.accentBlack,
            color: SYNTH.inkOnBrand,
            letterSpacing: '0.02em',
          }}
        >
          {ctaLabel}
        </span>
        <span
          className="min-w-0 text-right text-[10px] font-medium uppercase leading-[1.3] tracking-[0.14em]"
          style={{ color: ink, opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}
        >
          {provenance}
        </span>
      </div>
    </motion.article>
  )
}

function greetingForNow(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
