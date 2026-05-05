import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Camera,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  LogOut,
  Mic,
  Sparkles,
} from 'lucide-react'

import { SYNTH } from '../../lib/theme'
import { type Boat } from '../../data/lineupBuilderStore'
import { useSessionsStore, type Session } from '../../data/useSessionsStore'
import { type AppMockAthlete } from '../../data/mockTeam'
import { AppleCalendar, isoFromDate } from '../../primitives/AppleCalendar'
import { AuroraVoiceOverlay } from '../../primitives/AuroraVoiceOverlay'
import { PhotoCaptureSheet } from '../../primitives/CaptureSheets'
import { toast } from '../../../../shared/store/useToastStore'
import { BoatSilhouette } from './BoatSilhouette'
import { AthleteSheet } from './AthleteSheet'

type HeroSource =
  | { kind: 'session'; session: Session }
  | { kind: 'empty' }

/**
 * Lineup-first hero — full-bleed dark-water video, boat silhouette,
 * inline header toolbar, and a Strava-style action bar at the bottom.
 * The floating tab bar is hidden while this panel is active (managed via
 * useUiStore.heroPageActive in HomePage + AppCoachShell).
 */
export function LineupHeroPanel({
  onPeekDashboard,
  onLogout,
}: {
  onPeekDashboard: () => void
  onLogout: () => void
}) {
  const navigate = useNavigate()
  const sessions = useSessionsStore((s) => s.sessions)

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    pickDefaultDate(sessions),
  )
  const [pickerOpen, setPickerOpen] = useState(false)

  // Quick-capture state
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)

  useEffect(() => {
    if (sessions.length === 0) return
    // Pick the default once `sessions` hydrates; the functional updater
    // keeps the user's choice if they've already picked a date.
    setSelectedDate((prev) => prev || pickDefaultDate(sessions))
    // sessions intentionally omitted from deps — only react to length flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions.length])

  const source: HeroSource = useMemo(
    () => resolveSource(selectedDate, sessions),
    [selectedDate, sessions],
  )
  const boats: Boat[] = source.kind === 'session' ? source.session.boats : []

  const sessionDates = useMemo(() => sessions.map((s) => s.date), [sessions])

  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [activeBoatIndex, setActiveBoatIndex] = useState(0)

  useEffect(() => {
    setActiveBoatIndex(0)
    carouselRef.current?.scrollTo({ left: 0 })
  }, [selectedDate])

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

  const goToBoat = (idx: number) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollTo({ left: Math.max(0, Math.min(boats.length - 1, idx)) * el.clientWidth, behavior: 'smooth' })
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
      className="relative w-full overflow-hidden"
      style={{
        height: '100svh',
        maxHeight: '100svh',
        background: '#050B1C',
        color: '#FFFFFF',
        fontFamily: SYNTH.font,
      }}
    >
      {/* ── Background ─────────────────────────────────────────────────────── */}
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

      {/* ── Header row 1: brand ← → date + dashboard ───────────────────────── */}
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
          synth · coach
        </span>
        <div className="flex items-center gap-1">
          <GlassPill onClick={() => setPickerOpen((v) => !v)} ariaLabel="Pick date">
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtPillDate(selectedDate)}</span>
            <ChevronDown size={11} strokeWidth={2.6} />
          </GlassPill>
          <GlassPill onClick={onPeekDashboard} ariaLabel="Open dashboard">
            Dashboard
            <ChevronRight size={11} strokeWidth={2.6} />
          </GlassPill>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sign out"
            className="flex items-center justify-center rounded-full"
            style={{
              width: 28,
              height: 28,
              flexShrink: 0,
              background: 'rgba(239,68,68,0.85)',
              border: '1px solid rgba(239,68,68,0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#FFFFFF',
            }}
          >
            <LogOut size={12} strokeWidth={2.4} />
          </button>
        </div>
      </header>

      {/* ── Headline row 2: date text + subtitle ← → capture icons ─────────── */}
      <motion.div
        key={selectedDate}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 z-10 flex items-center justify-between px-5"
        style={{ top: 'calc(max(env(safe-area-inset-top), 12px) + 38px)' }}
      >
        {/* Left: date headline + session subtitle */}
        <div>
          <h1
            className="text-[30px] font-bold leading-[1] tracking-[-0.02em]"
            style={{ color: '#FFFFFF' }}
          >
            {heroHeadline(selectedDate)}
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

        {/* Right: capture icons */}
        <div className="flex items-center gap-2">
          <CircleFab size={44} icon={<Camera size={19} strokeWidth={2} />} ariaLabel="Photo" onClick={() => setPhotoOpen(true)} />
          <CircleFab size={44} icon={<Mic size={19} strokeWidth={2} />} ariaLabel="Voice" onClick={() => setVoiceOpen(true)} />
          <CircleFab size={44} icon={<Sparkles size={19} strokeWidth={2} />} ariaLabel="AI" onClick={() => navigate('/app/coach/ai')} />
        </div>
      </motion.div>

      {/* ── Boat carousel ──────────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 z-[5] overflow-hidden"
        style={{
          top: 'calc(max(env(safe-area-inset-top), 12px) + 126px)',
          // Bottom clears action bar + leaves room for page dots (20px)
          bottom: 'calc(max(env(safe-area-inset-bottom, 0px), 20px) + 178px)',
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
                  onSeatTap={(seatPosition, athlete) =>
                    setOpenAthlete({ seatPosition, athlete })
                  }
                />
              </div>
            </div>
          )) : (
            // Empty state — no session for this date
            <div className="flex h-full w-full items-center justify-center">
              <p
                className="text-[13px] font-medium"
                style={{ color: 'rgba(255,255,255,0.4)', fontFamily: SYNTH.font }}
              >
                No lineup scheduled
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Page dots — just above the action bar ──────────────────────────── */}
      {boats.length > 1 ? (
        <div
          className="absolute inset-x-0 z-10 flex justify-center"
          style={{ bottom: 'calc(max(env(safe-area-inset-bottom, 0px), 20px) + 156px)' }}
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

      {/* ── Strava-style action bar ─────────────────────────────────────────
          Covers the tab bar zone. Three actions: Lineup | Start | Notify. */}
      <div
        className="absolute inset-x-0 z-10"
        style={{ bottom: 0 }}
      >
        <div
          style={{
            background: 'rgba(28, 30, 38, 0.88)',
            backdropFilter: 'blur(32px) saturate(160%)',
            WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-2.5 pb-1">
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.22)',
              }}
            />
          </div>
        <div
          className="flex items-center justify-around px-6 py-3"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)',
          }}
        >
          {/* Lineup */}
          <BarAction
            icon={<LayoutGrid size={20} strokeWidth={1.8} />}
            label="Lineup"
            onClick={() => navigate('/app/coach/lineups')}
          />

          {/* Start — center, larger, emerald */}
          <div className="flex flex-col items-center gap-1.5">
            <motion.button
              type="button"
              aria-label="Start session"
              whileTap={{ scale: 0.93 }}
              onClick={onStartSession}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 64,
                height: 64,
                background: source.kind === 'session' ? SYNTH.accentEmerald : 'rgba(255,255,255,0.14)',
                boxShadow: source.kind === 'session'
                  ? '0 10px 28px -6px rgba(16,185,129,0.70)'
                  : 'none',
                border: '1px solid rgba(255,255,255,0.20)',
              }}
            >
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M8 5.5 L19.5 12 L8 18.5 Z" fill="#FFFFFF" />
              </svg>
            </motion.button>
            <span
              className="text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{
                color: source.kind === 'session' ? SYNTH.accentEmerald : 'rgba(255,255,255,0.45)',
                fontFamily: SYNTH.font,
              }}
            >
              Start
            </span>
          </div>

          {/* Notify */}
          <BarAction
            icon={<Bell size={18} strokeWidth={1.8} />}
            label="Notify"
            onClick={() => {
              const name = source.kind === 'session' ? source.session.name : 'session'
              toast(`Athletes notified for ${name}`, 'success')
            }}
          />
        </div>
        </div>
      </div>

      {/* ── Calendar dropdown ───────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {pickerOpen ? (
          <motion.div
            key="cal"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute inset-x-0 z-20 px-5"
            style={{ top: 'calc(max(env(safe-area-inset-top), 12px) + 96px)' }}
          >
            <AppleCalendar
              value={selectedDate}
              markedDates={sessionDates}
              onChange={(iso) => {
                setSelectedDate(iso)
                setPickerOpen(false)
              }}
              className=""
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Sheets ─────────────────────────────────────────────────────────── */}
      <AuroraVoiceOverlay
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSave={(t) => { if (t) toast('Voice memo saved', 'success') }}
        scopeLabel="your team"
      />
      <PhotoCaptureSheet
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onSave={() => toast('Photo saved', 'success')}
      />
      <AthleteSheet
        open={openAthlete !== null}
        onClose={() => setOpenAthlete(null)}
        athlete={openAthlete?.athlete ?? null}
        seatLabel={openAthlete ? String(openAthlete.seatPosition) : undefined}
      />
    </section>
  )
}

// ─── Glass pill button (date, dashboard) ────────────────────────────────────

function GlassPill({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
      style={{
        background: 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.22)',
        color: '#FFFFFF',
        backdropFilter: 'blur(10px) saturate(140%)',
        WebkitBackdropFilter: 'blur(10px) saturate(140%)',
      }}
    >
      {children}
    </button>
  )
}

// ─── Circle icon button for header toolbar ──────────────────────────────────
function CircleFab({
  icon,
  ariaLabel,
  onClick,
  size = 27,
}: {
  icon: React.ReactNode
  ariaLabel: string
  onClick: () => void
  size?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(12px) saturate(160%)',
        WebkitBackdropFilter: 'blur(12px) saturate(160%)',
        color: 'rgba(255,255,255,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </button>
  )
}

// ─── Action bar side button ──────────────────────────────────────────────────

function BarAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        type="button"
        aria-label={label}
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        className="flex items-center justify-center rounded-full"
        style={{
          width: 52,
          height: 52,
          background: 'rgba(255,255,255,0.10)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: '#FFFFFF',
        }}
      >
        {icon}
      </motion.button>
      <span
        className="text-[11px] font-medium"
        style={{ color: 'rgba(255,255,255,0.65)', fontFamily: SYNTH.font }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Source resolution ───────────────────────────────────────────────────────

function pickDefaultDate(sessions: Session[]): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcoming = sessions
    .filter((s) => s.status === 'scheduled')
    .filter((s) => {
      const d = new Date(s.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() >= today.getTime()
    })
    .sort((a, b) => a.date.localeCompare(b.date))[0]
  return upcoming?.date ?? isoFromDate(today)
}

function resolveSource(selectedDate: string, sessions: Session[]): HeroSource {
  const match = sessions.find((s) => s.date === selectedDate)
  if (match) return { kind: 'session', session: match }
  return { kind: 'empty' }
}

// ─── Date / copy helpers ─────────────────────────────────────────────────────

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
