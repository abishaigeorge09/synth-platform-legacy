import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, ArrowUpRight, BarChart3 } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { QuickStatsSheet } from '../primitives/SourcesSheets'
import { APP_MOCK_ATHLETES, fmtErgTime, fmtAgo } from '../data/mockTeam'
import { APP_MOCK_NOTES } from '../data/mockNotes'

const RING_RADIUS = 64
const RING_CIRC = 2 * Math.PI * RING_RADIUS

export function HomePage() {
  const navigate = useNavigate()
  const me = APP_MOCK_ATHLETES[0] // Star Miller as the demo athlete
  const greeting = greetingForNow()
  const sharedNotes = APP_MOCK_NOTES.filter((n) => n.athleteId === me.id || n.visibleToAthlete).slice(0, 3)
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
          synth · athlete
        </span>
        <button
          type="button"
          aria-label="My week"
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
        title="My week"
        stats={[
          { label: 'Best 2K', value: fmtErgTime(me.twoKBestSeconds), source: 'Concept2', syncedAgo: '4m' },
          { label: 'Recovery', value: `${me.recoveryScore}`, delta: { direction: 'up', value: '+5' }, source: 'WHOOP', syncedAgo: '6m' },
          { label: 'Streak', value: `${me.streakDays}`, unit: 'd', source: 'synth.', syncedAgo: 'live' },
          { label: 'Volume', value: `${(me.weeklyVolumeMeters / 1000).toFixed(0)}k`, unit: 'm', delta: { direction: 'up', value: '+12%' }, source: 'Concept2', syncedAgo: '4m' },
          { label: 'Sleep avg', value: '7.2', unit: 'h', source: 'WHOOP', syncedAgo: '8h' },
          { label: 'HRV', value: '64', unit: 'ms', source: 'WHOOP', syncedAgo: '8h' },
        ]}
      />

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="px-5 pt-3 text-[26px] font-bold leading-[1.15] tracking-[-0.01em]"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {greeting}, {me.name.split(' ')[0]}.
        <br />
        <span style={{ color: SYNTH.inkOnBrandMuted }}>
          You're recovered. Today is a green light.
        </span>
      </motion.h1>

      <AthleteHero athlete={me} />

      <CandyCarousel>
        <CandyCard
          color={SYNTH.cardYellow}
          kicker="Today"
          headline="8 × 500m at 22 spm — water at 06:30."
          ctaLabel="See plan"
          provenance="TrainingPeaks · 12m ago"
          onClick={() => {
            /* would link to today's plan */
          }}
        />
        <CandyCard
          color={SYNTH.cardSky}
          kicker="Erg pacer"
          headline="Last 2K avg pace: 1:46.7. Try 1:45.3 today?"
          ctaLabel="Open pacer"
          provenance="Concept2 · 4m ago"
          onClick={() => navigate('/app/athlete/erg-pacer')}
        />
        <CandyCard
          color={SYNTH.cardMint}
          kicker="Wellness"
          headline={`${me.streakDays}-day streak. Don't break it.`}
          ctaLabel="Check in"
          provenance="synth · live"
          onClick={() => navigate('/app/athlete/capture')}
        />
        <CandyCard
          color={SYNTH.cardPink}
          kicker="Race"
          headline="Cal Cup heat in 9 days."
          ctaLabel="Race plan"
          provenance="Coach Geri · 2d ago"
          onClick={() => navigate('/app/athlete/notes')}
        />
      </CandyCarousel>

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
              <p
                className="text-[12px]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
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
                <p
                  className="text-[14px] leading-[1.4]"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {note.body}
                </p>
                <p
                  className="mt-1.5 text-[10px] uppercase tracking-[0.14em]"
                  style={{
                    color: SYNTH.provenanceOnBrand,
                    fontFamily: SYNTH.font,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  Coach Geri · {fmtAgo(note.minutesAgo)}
                </p>
              </button>
            ))
          )}
        </div>
      </section>

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
            <p
              className="mt-0.5 text-[14px] font-semibold"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              "Why did my split slip last week?"
            </p>
          </div>
          <ArrowUpRight size={18} color={SYNTH.inkOnBrandMuted} />
        </button>
      </section>
    </div>
  )
}

function AthleteHero({ athlete }: { athlete: typeof APP_MOCK_ATHLETES[number] }) {
  const ringProgress = useMotionValue(0)
  const dashOffset = useTransform(ringProgress, (v) => RING_CIRC * (1 - v / 100))

  useEffect(() => {
    const ctrl = animate(ringProgress, athlete.recoveryScore, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    })
    return () => ctrl.stop()
  }, [athlete.recoveryScore, ringProgress])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-5 mt-5 rounded-3xl px-5 py-6"
      style={{
        background: SYNTH.inlineCard,
        border: `1px solid ${SYNTH.inlineCardBorder}`,
      }}
    >
      <div className="flex items-center gap-5">
        <div className="relative flex h-[150px] w-[150px] shrink-0 items-center justify-center">
          <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
            <circle
              cx="75"
              cy="75"
              r={RING_RADIUS}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="6"
              fill="none"
            />
            <motion.circle
              cx="75"
              cy="75"
              r={RING_RADIUS}
              stroke={SYNTH.accentEmerald}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              fill="none"
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute flex h-[100px] w-[100px] items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, ${SYNTH.accentEmerald}, #047857)`,
              boxShadow: '0 12px 28px -10px rgba(5,150,105,0.55)',
            }}
          >
            <span
              className="text-[34px] font-bold"
              style={{
                color: '#FFFFFF',
                fontFamily: SYNTH.font,
                letterSpacing: '0.04em',
              }}
            >
              {athlete.initials}
            </span>
          </motion.div>
          <span
            className="absolute -bottom-1 right-1 flex h-7 min-w-[44px] items-center justify-center rounded-full px-2 text-[12px] font-bold"
            style={{
              background: SYNTH.canvasInk,
              border: `1.5px solid ${SYNTH.accentEmerald}`,
              color: SYNTH.accentEmerald,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {athlete.recoveryScore}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Recovery
          </p>
          <p
            className="text-[20px] font-bold leading-tight"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {athlete.position}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <HeroPill icon={<Flame size={11} color={SYNTH.accentAmber} strokeWidth={2.4} />} value={`${athlete.streakDays}d`} label="streak" />
            <HeroPill value={fmtErgTime(athlete.twoKBestSeconds)} label="best 2K" />
            <HeroPill value={`${(athlete.weeklyVolumeMeters / 1000).toFixed(0)}k`} label="weekly m" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function HeroPill({
  icon,
  value,
  label,
}: {
  icon?: React.ReactNode
  value: string
  label: string
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{
        background: SYNTH.glass,
        border: `1px solid ${SYNTH.glassBorder}`,
        color: SYNTH.inkOnBrand,
        fontFamily: SYNTH.font,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {icon}
      <span className="text-[12px] font-bold leading-none">{value}</span>
      <span
        className="text-[10px] font-semibold uppercase leading-none"
        style={{ color: SYNTH.inkOnBrandMuted, letterSpacing: '0.12em' }}
      >
        {label}
      </span>
    </span>
  )
}

function CandyCarousel({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-7 pl-5">
      <header className="flex items-baseline justify-between pr-5 pb-3">
        <h2
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Today
        </h2>
      </header>
      <div
        className="flex gap-3 overflow-x-auto pb-2 pr-5"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
    </section>
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
      className="flex shrink-0 cursor-pointer flex-col gap-3 p-5"
      style={{
        background: color,
        boxShadow: SYNTH.shadow.cardLifted,
        borderRadius: SYNTH.radius.card,
        width: 'min(82vw, 300px)',
        minHeight: 200,
        scrollSnapAlign: 'center',
        color: SYNTH.ink,
        fontFamily: SYNTH.font,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ background: SYNTH.ink }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.ink, opacity: 0.7 }}
        >
          {kicker}
        </span>
      </div>
      <p
        className="flex-1 text-[18px] font-bold leading-[1.2] tracking-[-0.01em]"
        style={{ color: SYNTH.ink }}
      >
        {headline}
      </p>
      <div className="flex items-center justify-between">
        <span
          className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold"
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
          style={{ color: SYNTH.ink, opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}
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
