import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Calendar, Plus } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { RaceRecorder, type Split } from '../primitives/RaceRecorder'
import { SaveRaceSheet, type SaveRaceResult } from '../primitives/SaveRaceSheet'
import { AthletePickerSheet } from '../primitives/AthletePickerSheet'
import { SessionDetailSheet } from '../primitives/SessionDetailSheet'
import { APP_MOCK_ATHLETES, APP_MOCK_TEAM, type AppMockAthlete } from '../data/mockTeam'
import { APP_MOCK_SESSIONS, type MockSession } from '../data/mockSessions'
import { SYNTH } from '../lib/theme'

type TabKey = 'builder' | 'timer' | 'ratings' | 'sessions' | 'history'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'builder', label: 'Builder' },
  { key: 'timer', label: 'Timer' },
  { key: 'ratings', label: 'Ratings' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'history', label: 'History' },
]

type Seat = { seat: string; label: string; side: 'P' | 'S' }
const SEATS: Seat[] = [
  { seat: 'S', label: 'Stroke', side: 'S' },
  { seat: '7', label: '7 seat', side: 'S' },
  { seat: '6', label: '6 seat', side: 'P' },
  { seat: '5', label: '5 seat', side: 'P' },
  { seat: '4', label: '4 seat', side: 'S' },
  { seat: '3', label: '3 seat', side: 'P' },
  { seat: '2', label: '2 seat', side: 'S' },
  { seat: 'B', label: 'Bow', side: 'P' },
]

const DEFAULT_LINEUP: Record<string, string> = {
  S: 'a-juno-okafor',
  '7': 'a-isla-park',
  '6': 'a-noor-haidari',
  '5': 'a-star-miller',
  '4': 'a-coral-mendez',
  '3': 'a-rae-akhtar',
  '2': 'a-noor-haidari',
  B: 'a-star-miller',
}

const RACE_BOATS = [
  { id: 'v8a', name: 'V8 A', color: SYNTH.cardSky, speed: 1.02 },
  { id: 'v8b', name: 'V8 B', color: SYNTH.cardPink, speed: 0.99 },
  { id: 'v4a', name: 'V4 A', color: SYNTH.cardLemon, speed: 0.97 },
  { id: 'v4b', name: 'V4 B', color: SYNTH.cardMint, speed: 1.0 },
]

export function LineupsPage() {
  const [tab, setTab] = useState<TabKey>('builder')

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Lineup Builder" back="/app/coach/tools" />

      {/* Tab strip */}
      <div className="px-5">
        <div
          className="synth-scroll flex gap-1.5 overflow-x-auto rounded-full p-1"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            scrollbarWidth: 'none',
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
                style={{
                  background: active ? SYNTH.inkOnBrand : 'transparent',
                  color: active ? SYNTH.ink : SYNTH.inkOnBrandMuted,
                  fontFamily: SYNTH.font,
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-3"
        >
          {tab === 'builder' && <BuilderTab />}
          {tab === 'timer' && <TimerTab />}
          {tab === 'ratings' && <RatingsTab />}
          {tab === 'sessions' && <SessionsTab />}
          {tab === 'history' && <HistoryTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Builder (editable seats) ──────────────────────────────────────────────

function BuilderTab() {
  const [lineup, setLineup] = useState<Record<string, string>>(DEFAULT_LINEUP)
  const [pickerSeat, setPickerSeat] = useState<Seat | null>(null)
  const [published, setPublished] = useState(false)

  const onPick = (athlete: AppMockAthlete) => {
    if (!pickerSeat) return
    setLineup((prev) => ({ ...prev, [pickerSeat.seat]: athlete.id }))
    setPublished(false)
  }

  return (
    <>
      {/* Status hero */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="mx-5 mt-2 rounded-3xl p-5"
        style={{
          background: published ? SYNTH.cardMint : SYNTH.cardLemon,
          boxShadow: SYNTH.shadow.card,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ background: SYNTH.ink }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.ink, opacity: 0.7, fontFamily: SYNTH.font }}
          >
            {published ? 'Published · Wed AM' : 'Draft · 8 of 8 seats filled'}
          </span>
        </div>
        <p
          className="mt-2 text-[20px] font-bold leading-[1.2] tracking-[-0.01em]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          V8 — Wednesday AM · race-pace pieces
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPublished((p) => !p)}
            className="rounded-full px-4 py-2 text-[12px] font-semibold"
            style={{
              background: SYNTH.accentBlack,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              letterSpacing: '0.02em',
            }}
          >
            {published ? 'Unpublish' : 'Publish lineup'}
          </button>
          <button
            type="button"
            onClick={() => setLineup(DEFAULT_LINEUP)}
            className="rounded-full border px-4 py-2 text-[12px] font-semibold"
            style={{
              background: 'transparent',
              borderColor: SYNTH.ink,
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
            }}
          >
            Reset
          </button>
        </div>
      </motion.section>

      {/* Boat visual — tap a seat to swap */}
      <BoatVisual
        lineup={lineup}
        onSeatTap={(seat) => setPickerSeat(seat)}
      />

      {/* Seat list */}
      <section className="mt-6 px-5">
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Seats · tap to swap
        </p>
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: SYNTH.inlineCard,
            border: `1px solid ${SYNTH.inlineCardBorder}`,
          }}
        >
          {SEATS.map((seat, i) => {
            const a = APP_MOCK_ATHLETES.find((x) => x.id === lineup[seat.seat])
            return (
              <button
                key={seat.seat}
                type="button"
                onClick={() => setPickerSeat(seat)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left active:opacity-70"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: seat.side === 'P' ? `${SYNTH.cardSky}DD` : `${SYNTH.cardYellow}DD`,
                    color: SYNTH.ink,
                    fontFamily: SYNTH.font,
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {seat.seat}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[14px] font-semibold"
                    style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                  >
                    {a?.name ?? 'Empty'}
                  </p>
                  <p
                    className="text-[11px] uppercase tracking-[0.12em]"
                    style={{
                      color: SYNTH.inkOnBrandMuted,
                      fontFamily: SYNTH.font,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {seat.label} · {seat.side === 'P' ? 'Port' : 'Stbd'}
                  </p>
                </div>
                <span
                  className="text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
                >
                  Swap
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <AthletePickerSheet
        open={pickerSeat !== null}
        onClose={() => setPickerSeat(null)}
        title={pickerSeat ? `${pickerSeat.label} · ${pickerSeat.side === 'P' ? 'Port' : 'Stbd'}` : undefined}
        selectedId={pickerSeat ? lineup[pickerSeat.seat] : null}
        onPick={onPick}
      />
    </>
  )
}

// ─── Timer (immersive Strava-style) ────────────────────────────────────────

function TimerTab() {
  const [saveOpen, setSaveOpen] = useState(false)
  const [result, setResult] = useState<{ elapsedMs: number; splits: Split[] } | null>(null)

  return (
    <section className="mx-5 mt-2">
      <RaceRecorder
        boats={RACE_BOATS}
        totalSplits={4}
        expectedRaceMs={400_000}
        label={`${APP_MOCK_TEAM.name} · 4-boat race`}
        onFinish={(r) => {
          setResult(r)
          setSaveOpen(true)
        }}
      />
      {result ? (
        <SaveRaceSheet
          open={saveOpen}
          onClose={() => setSaveOpen(false)}
          boats={RACE_BOATS}
          elapsedMs={result.elapsedMs}
          splits={result.splits}
          onSave={(saved: SaveRaceResult) => {
            // Stub: would persist to sessions store
            console.log('Race saved', saved, result)
          }}
        />
      ) : null}
    </section>
  )
}

// ─── Sessions (real list, tap-to-detail) ───────────────────────────────────

function SessionsTab() {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = APP_MOCK_SESSIONS.find((s) => s.id === openId) ?? null

  return (
    <>
      <section className="mx-5 mt-2 flex flex-col gap-2">
        {APP_MOCK_SESSIONS.map((s) => (
          <SessionRow key={s.id} session={s} onOpen={() => setOpenId(s.id)} />
        ))}
      </section>
      <SessionDetailSheet open={openId !== null} onClose={() => setOpenId(null)} session={open} />
    </>
  )
}

function SessionRow({ session, onOpen }: { session: MockSession; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onOpen}
      className="w-full rounded-2xl border p-4 text-left"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        borderColor: SYNTH.glassBorder,
      }}
    >
      <div className="flex items-center gap-2">
        <Calendar size={12} color={SYNTH.inkOnBrandFaint} />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          {session.date} · {session.type} · {session.ratedByCoach}
        </span>
      </div>
      <p
        className="mt-1.5 text-[14px] font-bold leading-tight"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {session.title}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <span
          className="text-[20px] font-bold"
          style={{
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {session.duration}
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {session.boats.map((b) => (
            <span
              key={b.id}
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: `${b.color}55`,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                border: `1px solid ${b.color}99`,
              }}
            >
              {b.name}
            </span>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-1">
          <Star size={11} color={SYNTH.accentEmerald} fill={SYNTH.accentEmerald} />
          <span
            className="text-[12px] font-bold"
            style={{
              color: SYNTH.accentEmerald,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {avgRating(session).toFixed(1)}
          </span>
        </span>
      </div>
    </motion.button>
  )
}

function avgRating(session: MockSession): number {
  if (session.boats.length === 0) return 0
  const sum = session.boats.reduce((acc, b) => acc + b.rating, 0)
  return sum / session.boats.length
}

// ─── Ratings ────────────────────────────────────────────────────────────────

function RatingsTab() {
  // Aggregate ratings across all session boats
  const allRatings = APP_MOCK_SESSIONS.flatMap((s) =>
    s.boats.map((b) => ({
      session: s,
      boatName: b.name,
      boatColor: b.color,
      rating: b.rating,
    })),
  ).sort((a, b) => b.rating - a.rating)

  return (
    <section className="mx-5 mt-2 flex flex-col gap-2">
      <p
        className="pb-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        Top-rated boats
      </p>
      {allRatings.map((r, i) => (
        <div
          key={`${r.session.id}-${r.boatName}-${i}`}
          className="flex items-center gap-3 rounded-2xl border p-3"
          style={{
            background: SYNTH.glass,
            borderColor: SYNTH.glassBorder,
          }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: r.boatColor, color: SYNTH.ink }}
          >
            <Star size={18} fill={SYNTH.ink} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="text-[13px] font-bold"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {r.boatName}
            </p>
            <p
              className="text-[11px]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              {r.session.title} · {r.session.date}
            </p>
          </div>
          <span
            className="text-[16px] font-bold"
            style={{
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {r.rating.toFixed(1)}
          </span>
        </div>
      ))}
      <p
        className="mt-2 text-center text-[11px]"
        style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
      >
        Open a session for the full rating breakdown.
      </p>
    </section>
  )
}

// ─── History ────────────────────────────────────────────────────────────────

function HistoryTab() {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = APP_MOCK_SESSIONS.find((s) => s.id === openId) ?? null

  return (
    <>
      <section className="mx-5 mt-2 flex flex-col gap-2">
        <p
          className="pb-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Past races · all coaches
        </p>
        {APP_MOCK_SESSIONS.map((s) => (
          <SessionRow key={s.id} session={s} onOpen={() => setOpenId(s.id)} />
        ))}
      </section>
      <SessionDetailSheet open={openId !== null} onClose={() => setOpenId(null)} session={open} />
    </>
  )
}

// ─── Boat visual (tap to edit) ─────────────────────────────────────────────

function BoatVisual({
  lineup,
  onSeatTap,
}: {
  lineup: Record<string, string>
  onSeatTap: (seat: Seat) => void
}) {
  const seatPositions: Array<{ seat: string; x: number; side: 'P' | 'S' }> = [
    { seat: 'S', x: 180, side: 'S' },
    { seat: '7', x: 250, side: 'P' },
    { seat: '6', x: 320, side: 'S' },
    { seat: '5', x: 390, side: 'P' },
    { seat: '4', x: 460, side: 'S' },
    { seat: '3', x: 530, side: 'P' },
    { seat: '2', x: 600, side: 'S' },
    { seat: 'B', x: 670, side: 'P' },
  ]

  return (
    <div className="px-5 pt-5">
      <svg width="100%" viewBox="0 0 760 180" className="block">
        <defs>
          <linearGradient id="hullGrad" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.10)" />
          </linearGradient>
        </defs>
        <path
          d="M 60,90 Q 40,60 90,55 L 670,55 Q 720,55 740,90 Q 720,125 670,125 L 90,125 Q 40,120 60,90 Z"
          fill="url(#hullGrad)"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="1.5"
        />
        <line x1="80" y1="90" x2="720" y2="90" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="4 6" />
        <rect x="92" y="76" width="42" height="28" rx="6" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.32)" />
        <text x="113" y="94" textAnchor="middle" fill={SYNTH.inkOnBrandMuted} fontSize="9" fontWeight="700" fontFamily="Geist, Inter, sans-serif">
          COX
        </text>

        {seatPositions.map((sp) => {
          const seatSpec = SEATS.find((s) => s.seat === sp.seat)
          if (!seatSpec) return null
          const a = APP_MOCK_ATHLETES.find((x) => x.id === lineup[sp.seat])
          return (
            <g
              key={sp.seat}
              style={{ cursor: 'pointer' }}
              onClick={() => onSeatTap(seatSpec)}
            >
              <line
                x1={sp.x}
                y1="90"
                x2={sp.x}
                y2={sp.side === 'P' ? 60 : 120}
                stroke={sp.side === 'P' ? SYNTH.cardSky : SYNTH.cardYellow}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx={sp.x} cy="90" r="13" fill="rgba(255,255,255,0.30)" stroke="rgba(255,255,255,0.55)" />
              <text x={sp.x} y="93.5" textAnchor="middle" fill={SYNTH.inkOnBrand} fontSize="9.5" fontWeight="800" fontFamily="Geist, Inter, sans-serif">
                {sp.seat}
              </text>
              {a ? (
                <text
                  x={sp.x}
                  y={sp.side === 'P' ? 50 : 145}
                  textAnchor="middle"
                  fill={SYNTH.inkOnBrand}
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="Geist, Inter, sans-serif"
                  opacity={0.85}
                >
                  {a.initials}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
      <div className="mt-2 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: SYNTH.cardSky }} />
          Port
        </span>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: SYNTH.cardYellow }} />
          Starboard
        </span>
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
          <Plus size={10} />
          Tap a seat to swap
        </span>
      </div>
    </div>
  )
}
