import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, BarChart3 } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { QuickStatsSheet } from '../primitives/SourcesSheets'
import { APP_MOCK_TEAM, APP_MOCK_ATTENTION, APP_MOCK_ATHLETES, fmtAgo } from '../data/mockTeam'

export function HomePage() {
  const navigate = useNavigate()
  const greeting = greetingForNow()
  const topAttention = APP_MOCK_ATTENTION.slice(0, 3)
  const [statsOpen, setStatsOpen] = useState(false)

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[120px]">
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="px-5 pt-3 text-[26px] font-bold leading-[1.15] tracking-[-0.01em]"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {greeting}, Coach.
        <br />
        Two athletes need a closer look.
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
            color={SYNTH.cardYellow}
            kicker="High priority"
            headline="Star Miller's split is 7.2s slower than her 4-week average."
            ctaLabel="Open profile"
            provenance="Concept2 · synced 4m ago"
            onClick={() => navigate('/app/coach/athlete/a-isla-park')}
          />
          <CandyCard
            color={SYNTH.cardSky}
            kicker="Today's session"
            headline="8 × 500m at 22 spm — water at 06:30."
            ctaLabel="Open plan"
            provenance="TrainingPeaks · synced 12m ago"
            onClick={() => navigate('/app/coach/lineups')}
          />
          <CandyCard
            color={SYNTH.cardMint}
            kicker="Wellness"
            headline={`${APP_MOCK_ATHLETES.length} of ${APP_MOCK_TEAM.athleteCount} athletes checked in.`}
            ctaLabel="See check-ins"
            provenance="synth · live"
            onClick={() => navigate('/app/coach/notes')}
          />
          <CandyCard
            color={SYNTH.cardPink}
            kicker="Streak"
            headline="Juno Okafor hit 23 days — longest on the team."
            ctaLabel="Send a note"
            provenance="synth · live"
            onClick={() => navigate('/app/coach/athlete/a-juno-okafor')}
          />
        </CardCarousel>
      </section>

      <section className="mt-7 px-5">
        <header className="flex items-baseline justify-between pb-3">
          <h2
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Top of attention
          </h2>
        </header>
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          {topAttention.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/app/coach/athlete/${item.athleteId}`)}
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
                {item.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[14px] font-semibold leading-tight"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {item.athleteName}
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.4]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  {item.signal}
                </p>
                <p
                  className="mt-1.5 text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: SYNTH.provenanceOnBrand, fontFamily: SYNTH.font }}
                >
                  {item.source} · synced {fmtAgo(item.syncedMinutesAgo)}
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
      <div className="flex items-center justify-between">
        <span
          className="rounded-full px-4 py-2 text-[12px] font-semibold"
          style={{
            background: SYNTH.accentBlack,
            color: SYNTH.inkOnBrand,
            letterSpacing: '0.02em',
          }}
        >
          {ctaLabel}
        </span>
        <span
          className="text-[10px] font-medium uppercase tracking-[0.14em]"
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
