import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { THEME } from '../../../lib/theme'
import { LINEUP_ENTRIES, TODAY_META, WORKBOOK_SHEETS } from '../data/demoAthleteData'

type Seat = {
  seat: string
  side: string
  name: string
  highlight?: boolean
}

type SeatPosition = {
  x: number
  y: number
  /** Where the popover should hinge: above or below the seat. */
  popoverAnchor: 'above' | 'below'
}

const VIEW_W = 760
const VIEW_H = 200
const PORT_Y = 70
const STBD_Y = 130

/** V8 seat order: Bow, 2, 3, 4, 5, 6, 7, Str, Cox.
 *  Bow on the left, stern on the right. Port = top, Starboard = bottom.
 *  Cox sits in a small compartment behind stroke. */
const SEAT_LAYOUT: Array<{ side: 'Port' | 'Stbd' | 'Cox'; x: number }> = [
  { side: 'Port', x: 130 },
  { side: 'Stbd', x: 200 },
  { side: 'Port', x: 270 },
  { side: 'Stbd', x: 340 },
  { side: 'Port', x: 410 },
  { side: 'Stbd', x: 480 },
  { side: 'Port', x: 550 },
  { side: 'Stbd', x: 620 },
  { side: 'Cox', x: 695 },
]

function buildPositions(seats: Seat[]): SeatPosition[] {
  return seats.map((_, i) => {
    const slot = SEAT_LAYOUT[i]
    if (slot.side === 'Cox') {
      return { x: slot.x, y: 100, popoverAnchor: 'above' }
    }
    return {
      x: slot.x,
      y: slot.side === 'Port' ? PORT_Y : STBD_Y,
      popoverAnchor: slot.side === 'Port' ? 'above' : 'below',
    }
  })
}

function stripMarker(name: string): string {
  return name.replace(/^★\s*/, '').trim()
}

function initialsOf(name: string): string {
  return stripMarker(name)
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

type ErgStat = { twoK: string; split: string }

function buildErgLookup(): Map<string, ErgStat> {
  const m = new Map<string, ErgStat>()
  for (const row of WORKBOOK_SHEETS['Erg Log']) {
    const [, name, twoK, split] = row
    m.set(stripMarker(name), { twoK, split })
  }
  return m
}

export function TodayLineupCard() {
  const navigate = useNavigate()
  const lineup = LINEUP_ENTRIES[0]
  const seats: Seat[] = lineup.seats
  const positions = useMemo(() => buildPositions(seats), [seats])
  const ergLookup = useMemo(() => buildErgLookup(), [])

  const initialIdx = Math.max(
    0,
    seats.findIndex((s) => s.highlight),
  )
  const [selectedIdx, setSelectedIdx] = useState<number>(initialIdx)

  const selected = seats[selectedIdx]
  const selectedPos = positions[selectedIdx]
  const selectedErg = ergLookup.get(stripMarker(selected.name))

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border"
      style={{
        background:
          'linear-gradient(135deg, rgba(5,150,105,0.05) 0%, rgba(16,185,129,0.02) 40%, var(--bg-primary) 100%)',
        borderColor: THEME.border,
        boxShadow:
          '0 1px 0 rgba(24,24,27,0.02), 0 30px 60px -34px rgba(5,150,105,0.35)',
      }}
    >
      {/* corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.32), transparent 65%)',
        }}
      />

      <div className="relative flex flex-col gap-4 p-5 sm:p-6">
        {/* header strip */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div
              className="flex flex-wrap items-center gap-2"
              style={{ fontFamily: THEME.fontMono }}
            >
              <span
                className="text-[10px] font-semibold uppercase"
                style={{ color: THEME.primary, letterSpacing: '0.18em' }}
              >
                Today's lineup
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: THEME.textMuted, letterSpacing: '0.16em' }}
              >
                ·
              </span>
              <span
                className="text-[10px] font-semibold uppercase"
                style={{ color: THEME.textMuted, letterSpacing: '0.16em' }}
              >
                {TODAY_META.raceCountdown.date}
              </span>
            </div>
            <h2
              className="mt-1 text-[22px] font-semibold leading-tight sm:text-[26px]"
              style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
            >
              {lineup.title}
            </h2>
            <p
              className="mt-1 text-[12px] sm:text-[13px]"
              style={{ color: THEME.textSecondary }}
            >
              {lineup.athleteSummary}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/athlete/lineups')}
            className="hidden shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-zinc-50 sm:inline-flex"
            style={{
              borderColor: THEME.border,
              color: THEME.textPrimary,
              fontFamily: THEME.fontMono,
            }}
          >
            All lineups →
          </button>
        </div>

        {/* boat + popover region */}
        <div className="relative">
          <div
            className="relative w-full overflow-visible"
            style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
          >
            <BoatIllustration
              seats={seats}
              positions={positions}
              selectedIdx={selectedIdx}
              onSelect={setSelectedIdx}
            />

            <AnimatePresence mode="wait">
              {selected ? (
                <SeatPopover
                  key={selectedIdx}
                  seat={selected}
                  pos={selectedPos}
                  ergStat={selectedErg}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* legend */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-[10px]"
          style={{
            borderColor: THEME.border,
            fontFamily: THEME.fontMono,
            color: THEME.textMuted,
            letterSpacing: '0.14em',
          }}
        >
          <div className="flex items-center gap-3 uppercase">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: THEME.primary }}
              />
              You
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: THEME.blue }}
              />
              Port
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: THEME.amber }}
              />
              Stbd
            </span>
          </div>
          <span className="hidden sm:inline">Tap any seat for athlete details</span>
          <span className="sm:hidden">Tap a seat</span>
        </div>
      </div>
    </motion.section>
  )
}

// ─── Boat illustration ─────────────────────────────────────────────────────

function BoatIllustration({
  seats,
  positions,
  selectedIdx,
  onSelect,
}: {
  seats: Seat[]
  positions: SeatPosition[]
  selectedIdx: number
  onSelect: (i: number) => void
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-full w-full"
      role="img"
      aria-label="Boat lineup"
    >
      {/* Hull outline — pointed bow on the left, rounded stern on the right */}
      <path
        d="M 18 100
           C 50 60, 95 42, 140 42
           L 660 42
           C 700 42, 730 65, 738 100
           C 730 135, 700 158, 660 158
           L 140 158
           C 95 158, 50 140, 18 100 Z"
        fill="var(--bg-primary)"
        stroke={THEME.border}
        strokeWidth="1.5"
      />

      {/* subtle inner gradient */}
      <path
        d="M 30 100
           C 60 70, 100 55, 145 55
           L 655 55
           C 695 55, 720 70, 728 100
           C 720 130, 695 145, 655 145
           L 145 145
           C 100 145, 60 130, 30 100 Z"
        fill="url(#hullGradient)"
        opacity="0.6"
      />

      <defs>
        <linearGradient id="hullGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(16,185,129,0.08)" />
          <stop offset="60%" stopColor="rgba(16,185,129,0)" />
        </linearGradient>
      </defs>

      {/* Centerline (keel) */}
      <line
        x1="40"
        y1="100"
        x2="720"
        y2="100"
        stroke={THEME.border}
        strokeWidth="1"
        strokeDasharray="3 5"
      />

      {/* Cox compartment — small inset rectangle in the stern */}
      <rect
        x="660"
        y="78"
        width="68"
        height="44"
        rx="10"
        fill="var(--bg-surface)"
        stroke={THEME.border}
        strokeWidth="1"
      />

      {/* Riggers + seats */}
      {seats.map((seat, i) => {
        const pos = positions[i]
        const layout = SEAT_LAYOUT[i]
        const isStar = !!seat.highlight
        const isSelected = selectedIdx === i
        const isCox = layout.side === 'Cox'

        // Rigger: line going outward from seat to outside the hull
        const riggerY1 = layout.side === 'Port' ? 50 : 150
        const riggerY2 = layout.side === 'Port' ? 18 : 182
        const riggerColor = layout.side === 'Port' ? THEME.blue : THEME.amber

        // Seat fill: emerald for star, surface for everyone else.
        const seatFill = isStar
          ? THEME.primary
          : 'var(--bg-primary)'
        const seatStroke = isStar
          ? THEME.primary
          : isSelected
            ? THEME.textPrimary
            : THEME.border
        const seatStrokeW = isStar || isSelected ? 2 : 1.25
        const labelColor = isStar
          ? '#FFFFFF'
          : isCox
            ? THEME.textPrimary
            : THEME.textSecondary

        return (
          <g key={seat.seat + i}>
            {!isCox ? (
              <line
                x1={pos.x}
                y1={riggerY1}
                x2={pos.x}
                y2={riggerY2}
                stroke={riggerColor}
                strokeWidth={isStar ? 2 : 1.25}
                strokeLinecap="round"
                opacity={isStar ? 0.95 : 0.55}
              />
            ) : null}

            {/* Pulsing ring on star's seat */}
            {isStar ? (
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={20}
                fill="none"
                stroke={THEME.primary}
                strokeWidth={1.5}
                animate={{ r: [20, 28, 20], opacity: [0.65, 0, 0.65] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              />
            ) : null}

            {/* Seat hit area (large, transparent, easier tap target) */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={26}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(i)}
            />

            {/* Visible seat */}
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={isCox ? 14 : 18}
              fill={seatFill}
              stroke={seatStroke}
              strokeWidth={seatStrokeW}
              animate={{ scale: isSelected ? 1.08 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              style={{ transformOrigin: `${pos.x}px ${pos.y}px`, pointerEvents: 'none' }}
            />

            {/* Seat number / Cox label */}
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              fontFamily={THEME.fontMono}
              fontSize={isCox ? 9 : 11}
              fontWeight={700}
              fill={labelColor}
              style={{ pointerEvents: 'none', letterSpacing: '0.04em' }}
            >
              {isCox ? 'COX' : seat.seat.toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Popover ───────────────────────────────────────────────────────────────

function SeatPopover({
  seat,
  pos,
  ergStat,
}: {
  seat: Seat
  pos: SeatPosition
  ergStat: ErgStat | undefined
}) {
  const cleanName = stripMarker(seat.name)
  const initials = initialsOf(seat.name)
  const isCox = seat.side === '—'
  const isStar = !!seat.highlight
  const sideColor =
    seat.side === 'Port' ? THEME.blue : seat.side === 'Stbd' ? THEME.amber : THEME.purple

  const xPct = (pos.x / VIEW_W) * 100
  const yPct = (pos.y / VIEW_H) * 100

  // Avoid popover escaping container at the bow / stern edges.
  const horizontalAnchor: 'left' | 'center' | 'right' =
    xPct < 22 ? 'left' : xPct > 78 ? 'right' : 'center'
  const xTransform =
    horizontalAnchor === 'left' ? '-12%' : horizontalAnchor === 'right' ? '-88%' : '-50%'
  const yTransform =
    pos.popoverAnchor === 'above' ? 'calc(-100% - 18px)' : '18px'
  const translate = `translate(${xTransform}, ${yTransform})`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: pos.popoverAnchor === 'above' ? 6 : -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="pointer-events-none absolute z-10 w-[210px] sm:w-[230px]"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: translate,
      }}
    >
      <div
        className="relative rounded-2xl border p-3 shadow-xl"
        style={{
          background: 'var(--bg-primary)',
          borderColor: isStar ? THEME.primary : THEME.border,
          boxShadow: isStar
            ? '0 22px 50px -22px rgba(5,150,105,0.55), 0 0 0 1px rgba(5,150,105,0.18)'
            : '0 22px 50px -28px rgba(24,24,27,0.4)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
            style={{
              background: isStar
                ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDarker})`
                : `linear-gradient(135deg, ${sideColor}, ${sideColor}cc)`,
              fontFamily: THEME.fontMono,
              letterSpacing: '0.04em',
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div
              className="truncate text-[13px] font-semibold leading-tight"
              style={{ color: THEME.textPrimary, fontFamily: THEME.fontSerif }}
            >
              {cleanName}
              {isStar ? (
                <span
                  className="ml-1.5 align-middle text-[10px] font-bold uppercase"
                  style={{ color: THEME.primary, fontFamily: THEME.fontMono, letterSpacing: '0.1em' }}
                >
                  · You
                </span>
              ) : null}
            </div>
            <div
              className="text-[10px] uppercase"
              style={{
                color: THEME.textMuted,
                fontFamily: THEME.fontMono,
                letterSpacing: '0.14em',
              }}
            >
              {isCox ? 'Coxswain' : `${seat.side} · Seat ${seat.seat}`}
            </div>
          </div>
        </div>

        {/* Stat row */}
        <div
          className="mt-3 grid gap-1.5 border-t pt-2.5"
          style={{
            borderColor: THEME.border,
            gridTemplateColumns: isCox || !ergStat ? '1fr' : '1fr 1fr',
          }}
        >
          {isCox ? (
            <Stat label="Role" value="Calls the race" />
          ) : ergStat ? (
            <>
              <Stat label="2K" value={ergStat.twoK} />
              <Stat label="Split" value={ergStat.split} />
            </>
          ) : (
            <Stat label="Erg" value="—" />
          )}
        </div>

        {/* tail pointer — hidden when popover is shifted off-center to avoid a visually disconnected nub. */}
        {horizontalAnchor === 'center' ? (
          <div
            aria-hidden
            className="absolute h-3 w-3 rotate-45 border"
            style={{
              background: 'var(--bg-primary)',
              borderColor: isStar ? THEME.primary : THEME.border,
              ...(pos.popoverAnchor === 'above'
                ? { bottom: -7, left: '50%', transform: 'translateX(-50%) rotate(45deg)', borderTop: 'none', borderLeft: 'none' }
                : { top: -7, left: '50%', transform: 'translateX(-50%) rotate(45deg)', borderRight: 'none', borderBottom: 'none' }),
            }}
          />
        ) : null}
      </div>
    </motion.div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="text-[9px] font-semibold uppercase"
        style={{
          color: THEME.textMuted,
          fontFamily: THEME.fontMono,
          letterSpacing: '0.14em',
        }}
      >
        {label}
      </div>
      <div
        className="mt-0.5 text-[13px] font-bold"
        style={{ color: THEME.textPrimary, fontFamily: THEME.fontMono }}
      >
        {value}
      </div>
    </div>
  )
}
