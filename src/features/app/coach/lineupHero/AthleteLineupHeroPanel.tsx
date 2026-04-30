import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { SYNTH } from '../../lib/theme'
import { type Boat } from '../../data/lineupBuilderStore'
import { useSessionsStore, type Session } from '../../data/useSessionsStore'
import { isoFromDate } from '../../primitives/AppleCalendar'
import { BoatSilhouette } from './BoatSilhouette'

type HeroSource =
  | { kind: 'session'; session: Session }
  | { kind: 'empty' }

export function AthleteLineupHeroPanel({ onPeekDashboard }: { onPeekDashboard: () => void }) {
  const sessions = useSessionsStore((s) => s.sessions)

  const today = useMemo(() => isoFromDate(new Date()), [])

  const source: HeroSource = useMemo(
    () => resolveSource(today, sessions),
    [today, sessions],
  )
  const boats: Boat[] = source.kind === 'session' ? source.session.boats : []

  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [activeBoatIndex, setActiveBoatIndex] = useState(0)

  useEffect(() => {
    setActiveBoatIndex(0)
    carouselRef.current?.scrollTo({ left: 0 })
  }, [today])

  const onCarouselScroll = () => {
    const el = carouselRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    if (idx !== activeBoatIndex) setActiveBoatIndex(idx)
  }

  const goToBoat = (idx: number) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollTo({ left: Math.max(0, Math.min(boats.length - 1, idx)) * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: '100svh',
        maxHeight: '100svh',
        background: '#050B1C',
        color: '#FFFFFF',
        fontFamily: SYNTH.font,
      }}
    >
      {/* Background video */}
      <video
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        src="/dark-water-loop.mp4"
        autoPlay
        muted
        loop
        playsInline
        poster=""
        aria-hidden
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,8,28,0.55) 0%, rgba(5,8,28,0.35) 35%, rgba(5,8,28,0.55) 70%, rgba(5,8,28,0.88) 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 50%, transparent 50%, rgba(5,8,28,0.55) 100%)',
        }}
      />

      {/* Header */}
      <header
        className="absolute inset-x-0 z-10 flex items-center justify-between px-5"
        style={{
          top: 0,
          paddingTop: 'max(env(safe-area-inset-top), 12px)',
          paddingBottom: 6,
        }}
      >
        <span
          className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em]"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          synth · athlete
        </span>
        <div className="flex items-center gap-1">
          <GlassPill ariaLabel="Today's date">
            {fmtPillDate(today)}
          </GlassPill>
          <GlassPill onClick={onPeekDashboard} ariaLabel="Open dashboard">
            Dashboard
            <ChevronRight size={11} strokeWidth={2.6} />
          </GlassPill>
        </div>
      </header>

      {/* Date headline */}
      <div
        className="absolute inset-x-0 z-10 px-5"
        style={{ top: 'calc(max(env(safe-area-inset-top), 12px) + 38px)' }}
      >
        <h1
          className="text-[30px] font-bold leading-[1] tracking-[-0.02em]"
          style={{ color: '#FFFFFF' }}
        >
          {heroHeadline(today)}
        </h1>
        {source.kind === 'session' && source.session.time ? (
          <p
            className="mt-1.5 text-[12px]"
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.01em',
            }}
          >
            {fmt12h(source.session.time)}
          </p>
        ) : null}
      </div>

      {/* Boat carousel */}
      <div
        className="absolute inset-x-0 z-[5] overflow-hidden"
        style={{
          top: 'calc(max(env(safe-area-inset-top), 12px) + 90px)',
          bottom: 'calc(max(env(safe-area-inset-bottom, 0px), 20px) + 80px)',
        }}
      >
        <div
          ref={carouselRef}
          onScroll={onCarouselScroll}
          className="synth-scroll flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {boats.length > 0 ? boats.map((boat) => (
            <div
              key={boat.id}
              className="flex h-full w-full shrink-0 snap-center items-center justify-center px-3"
            >
              <div className="block max-h-full" style={{ aspectRatio: '540 / 474', width: '100%' }}>
                <BoatSilhouette
                  boat={boat}
                  onSeatTap={() => {}}
                />
              </div>
            </div>
          )) : (
            <div className="flex h-full w-full items-center justify-center">
              <p
                className="text-[13px] font-medium"
                style={{ color: 'rgba(255,255,255,0.4)', fontFamily: SYNTH.font }}
              >
                No lineup scheduled for today
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Page dots */}
      {boats.length > 1 ? (
        <div
          className="absolute inset-x-0 z-10 flex justify-center"
          style={{ bottom: 'calc(max(env(safe-area-inset-bottom, 0px), 20px) + 58px)' }}
        >
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5"
            style={{
              background: 'rgba(8,8,40,0.45)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px) saturate(140%)',
              WebkitBackdropFilter: 'blur(8px) saturate(140%)',
            }}
          >
            {boats.map((_, i) => {
              const active = i === activeBoatIndex
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to boat ${i + 1}`}
                  onClick={() => goToBoat(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: active ? 16 : 4,
                    height: 4,
                    background: active ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                  }}
                />
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Bottom hint */}
      <div
        className="absolute inset-x-0 z-10 flex items-center justify-center"
        style={{
          bottom: 0,
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)',
          paddingTop: 12,
        }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: SYNTH.font }}
        >
          Swipe right for your stats →
        </p>
      </div>
    </section>
  )
}

function GlassPill({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick?: () => void
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={!onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
      style={{
        background: 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.22)',
        color: '#FFFFFF',
        backdropFilter: 'blur(10px) saturate(140%)',
        WebkitBackdropFilter: 'blur(10px) saturate(140%)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </button>
  )
}

function resolveSource(selectedDate: string, sessions: Session[]): HeroSource {
  const match = sessions.find((s) => s.date === selectedDate)
  if (match) return { kind: 'session', session: match }
  return { kind: 'empty' }
}

function fmtPillDate(iso: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function heroHeadline(iso: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000)
  if (diff === 0) return 'Today.'
  if (diff === 1) return 'Tomorrow.'
  if (diff > 1 && diff < 7) return d.toLocaleDateString(undefined, { weekday: 'long' }) + '.'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + '.'
}

function fmt12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h)) return hhmm
  const meridiem = h >= 12 ? 'PM' : 'AM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:${String(m ?? 0).padStart(2, '0')} ${meridiem}`
}
