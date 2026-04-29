import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowRight } from 'lucide-react'
import { SYNTH } from '../../lib/theme'
import { useLineupBuilderStore, type Boat } from '../../data/lineupBuilderStore'
import { useSessionsStore, type Session } from '../../data/useSessionsStore'
import { type AppMockAthlete } from '../../data/mockTeam'
import { BoatHero } from './BoatHero'
import { AthleteSheet } from './AthleteSheet'
import { MicroActions } from './MicroActions'

type HeroSource =
  | { kind: 'session'; session: Session; relativeLabel: string }
  | { kind: 'draft'; boats: Boat[]; relativeLabel: string }
  | { kind: 'empty' }

/**
 * Lineup-first hero — what the coach sees the moment the app opens.
 *
 *   "This is the lineup for tomorrow"
 *      [boat carousel · swipe between boats]
 *           [boat illustration]
 *      [● ○ ○]   start session →
 *
 * Right edge: tiny capture / voice / AI FABs.
 * Empty fallback: prompt to build a lineup.
 *
 * Pulls the next scheduled session if one exists, otherwise falls back to
 * the lineup builder draft.
 */
export function LineupHeroPanel({ onPeekDashboard }: { onPeekDashboard: () => void }) {
  const navigate = useNavigate()
  const sessions = useSessionsStore((s) => s.sessions)
  const draftBoats = useLineupBuilderStore((s) => s.boats)

  const source: HeroSource = useMemo(() => resolveSource(sessions, draftBoats), [sessions, draftBoats])
  const boats: Boat[] = source.kind === 'session' ? source.session.boats : source.kind === 'draft' ? source.boats : []

  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [activeBoatIndex, setActiveBoatIndex] = useState(0)

  const [openAthlete, setOpenAthlete] = useState<{
    seatPosition: number
    athlete: AppMockAthlete | null
  } | null>(null)

  const onCarouselScroll = () => {
    const el = carouselRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    if (idx !== activeBoatIndex) setActiveBoatIndex(idx)
  }

  const onStartSession = () => {
    if (source.kind === 'session') {
      navigate(`/app/coach/sessions/${source.session.id}/timer`)
    } else {
      navigate('/app/coach/lineups')
    }
  }

  return (
    <section
      className="relative flex h-full w-full flex-col"
      style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
    >
      {/* Top bar with brand + dashboard hint */}
      <header
        className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2"
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          synth · coach
        </span>
        <button
          type="button"
          onClick={onPeekDashboard}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
          aria-label="Swipe right or tap to open the dashboard"
        >
          Dashboard
          <ArrowRight size={12} strokeWidth={2.6} />
        </button>
      </header>

      {/* Hero copy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="px-5 pb-2 pt-3"
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          Today's hero · Lineup
        </p>
        <h1
          className="mt-1 text-[26px] font-bold leading-[1.15] tracking-[-0.01em]"
          style={{ color: SYNTH.inkOnBrand }}
        >
          {heroHeadline(source)}
        </h1>
        <p
          className="mt-1 text-[12px]"
          style={{ color: SYNTH.inkOnBrandMuted, fontVariantNumeric: 'tabular-nums' }}
        >
          {heroSubtitle(source)}
        </p>
      </motion.div>

      {/* Body — boat carousel + right-side micro actions */}
      <div className="relative flex flex-1 items-stretch gap-2 px-2 pb-4">
        {/* Carousel */}
        <div className="min-w-0 flex-1">
          {boats.length > 0 ? (
            <>
              <div
                ref={carouselRef}
                onScroll={onCarouselScroll}
                className="synth-scroll flex h-full snap-x snap-mandatory overflow-x-auto pl-3"
                style={{ scrollbarWidth: 'none' }}
              >
                {boats.map((boat) => (
                  <div
                    key={boat.id}
                    className="flex h-full w-full shrink-0 snap-center items-start justify-center pt-1"
                  >
                    <BoatHero
                      boat={boat}
                      onSeatTap={(seatPosition, athlete) =>
                        setOpenAthlete({ seatPosition, athlete })
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Page dots for boats */}
              {boats.length > 1 ? (
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  {boats.map((_, i) => {
                    const active = i === activeBoatIndex
                    return (
                      <span
                        key={i}
                        className="rounded-full transition-all"
                        style={{
                          width: active ? 18 : 5,
                          height: 5,
                          background: active ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.3)',
                        }}
                      />
                    )
                  })}
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Right edge micro FABs */}
        <div className="flex flex-col justify-center pr-3">
          <MicroActions />
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="px-5 pb-[max(env(safe-area-inset-bottom),100px)] pt-2"
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onStartSession}
          disabled={source.kind === 'empty'}
          className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-bold tracking-[0.04em] disabled:opacity-50"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            boxShadow: '0 12px 32px -10px rgba(16,185,129,0.6)',
          }}
        >
          {source.kind === 'session' ? (
            <>
              <Send size={14} strokeWidth={2.8} />
              Start session
              <ArrowRight size={14} strokeWidth={2.8} />
            </>
          ) : source.kind === 'draft' ? (
            <>Publish + start session</>
          ) : (
            <>Build a lineup</>
          )}
        </motion.button>
      </div>

      {/* Athlete sheet — opens on seat tap */}
      <AthleteSheet
        open={openAthlete !== null}
        onClose={() => setOpenAthlete(null)}
        athlete={openAthlete?.athlete ?? null}
        seatLabel={openAthlete ? String(openAthlete.seatPosition) : undefined}
      />
    </section>
  )
}

// ─── Source resolution ──────────────────────────────────────────────────────

function resolveSource(sessions: Session[], draftBoats: Boat[]): HeroSource {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Pick the earliest scheduled session whose date is today-or-later.
  const upcoming = sessions
    .filter((s) => s.status === 'scheduled')
    .filter((s) => {
      const d = new Date(s.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() >= today.getTime()
    })
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  if (upcoming) {
    return { kind: 'session', session: upcoming, relativeLabel: relativeWhen(upcoming.date) }
  }

  // No scheduled session — show the builder draft if any boat has anyone in it.
  const draftHasContent = draftBoats.some((b) => b.seats.some((s) => s.athleteId))
  if (draftHasContent) {
    return { kind: 'draft', boats: draftBoats, relativeLabel: 'in your draft' }
  }

  return { kind: 'empty' }
}

function relativeWhen(iso: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  if (diff > 1 && diff < 7) return d.toLocaleDateString(undefined, { weekday: 'long' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function heroHeadline(source: HeroSource): string {
  if (source.kind === 'session') return `This is the lineup for ${source.relativeLabel}.`
  if (source.kind === 'draft') return 'This is your draft lineup.'
  return 'Build your first lineup.'
}

function heroSubtitle(source: HeroSource): string {
  if (source.kind === 'session') {
    const s = source.session
    const dateLabel = new Date(s.date).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    const time = s.time ? ` · ${fmt12h(s.time)}` : ''
    return `${s.name} · ${dateLabel}${time}`
  }
  if (source.kind === 'draft') {
    return `Open the builder to publish — synth keeps this hero in sync.`
  }
  return 'Build it once — the hero shows up here next time you open the app.'
}

function fmt12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h)) return hhmm
  const meridiem = h >= 12 ? 'PM' : 'AM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:${String(m ?? 0).padStart(2, '0')} ${meridiem}`
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full text-[20px]"
        style={{
          background: 'rgba(255,255,255,0.10)',
          border: `1px solid ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        ⛵
      </span>
      <p
        className="mt-3 text-[16px] font-bold"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        No lineup scheduled.
      </p>
      <p
        className="mt-1 max-w-[260px] text-[12px] leading-[1.45]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        Build your first lineup in the Lineup Builder — it'll show up here as the hero next time you open the app.
      </p>
      <button
        type="button"
        onClick={() => navigate('/app/coach/lineups')}
        className="mt-4 rounded-full px-4 py-2 text-[12px] font-bold"
        style={{
          background: SYNTH.inkOnBrand,
          color: SYNTH.ink,
          fontFamily: SYNTH.font,
        }}
      >
        Open builder
      </button>
    </div>
  )
}
