import { motion } from 'framer-motion'
import { SYNTH } from '../../lib/theme'
import { APP_MOCK_ATHLETES, type AppMockAthlete } from '../../data/mockTeam'
import {
  COXED,
  seatSide,
  type Boat,
  type BoatSize,
} from '../../data/lineupBuilderStore'

type Props = {
  boat: Boat
  onSeatTap: (seatPosition: number, athlete: AppMockAthlete | null) => void
}

/**
 * Hero-style boat illustration for the lineup-hero home page. Stylized hull
 * + seat chips arranged stroke (top) → bow (bottom), with the cox lifted on
 * top of the hull. Designed to be the focal point of the screen — not a
 * crammed picker. For interaction-heavy editing, the existing
 * BoatLineupCard in the builder is the right tool.
 */
export function BoatHero({ boat, onSeatTap }: Props) {
  const hasCox = COXED[boat.size]
  // Sort rower seats stroke (highest position) → bow (lowest), so they read
  // top-to-bottom on the page in the order the crew sits.
  const rowerSeats = boat.seats
    .filter((s) => seatSide(boat.size, s.position) !== 'X')
    .sort((a, b) => b.position - a.position)
  const coxSeat = boat.seats.find((s) => seatSide(boat.size, s.position) === 'X') ?? null

  return (
    <div className="flex w-full flex-col items-center px-1">
      {/* Boat label band */}
      <div
        className="mb-3 flex items-center gap-2 rounded-full px-3 py-1.5"
        style={{
          background: 'rgba(255,255,255,0.10)',
          border: `1px solid ${SYNTH.glassBorder}`,
        }}
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold"
          style={{ background: boat.color, color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          {boat.size}
        </span>
        <span
          className="text-[12px] font-bold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          {boat.name}
        </span>
      </div>

      {/* Hero hull */}
      <div className="relative w-full" style={{ maxWidth: 320 }}>
        {/* Cox medallion sits ABOVE the hull */}
        {hasCox && coxSeat ? (
          <div className="mb-2 flex justify-center">
            <SeatChip
              seat={coxSeat}
              boatSize={boat.size}
              onTap={() => onSeatTap(coxSeat.position, athleteFor(coxSeat.athleteId))}
              variant="cox"
            />
          </div>
        ) : null}

        {/* Hull SVG */}
        <div className="relative">
          <HullBackdrop />

          <div className="relative z-10 flex flex-col gap-2 px-5 py-6">
            {rowerSeats.map((seat) => (
              <SeatRow
                key={seat.position}
                position={seat.position}
                boatSize={boat.size}
                athleteId={seat.athleteId}
                onTap={() => onSeatTap(seat.position, athleteFor(seat.athleteId))}
              />
            ))}
          </div>
        </div>

        {/* Filled-count strip */}
        <div className="mt-3 flex items-center justify-between px-1">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {boat.seats.filter((s) => s.athleteId).length}/{boat.seats.length} seats
          </span>
          <span
            className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: SYNTH.sideStarboard }} />
            stbd
            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ background: SYNTH.sidePort }} />
            port
          </span>
        </div>
      </div>
    </div>
  )
}

function athleteFor(id: string | null): AppMockAthlete | null {
  if (!id) return null
  return APP_MOCK_ATHLETES.find((a) => a.id === id) ?? null
}

// ─── Seat row (one rower) ────────────────────────────────────────────────────

function SeatRow({
  position,
  boatSize,
  athleteId,
  onTap,
}: {
  position: number
  boatSize: BoatSize
  athleteId: string | null
  onTap: () => void
}) {
  const side = seatSide(boatSize, position)
  return (
    <div className="flex items-center gap-2">
      {/* Seat number (stroke / bow / 1..N) */}
      <span
        className="w-7 shrink-0 text-right text-[10px] font-bold uppercase tracking-[0.1em]"
        style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
      >
        {seatLabelFor(boatSize, position)}
      </span>

      {/* Side oar bar (port = red, stbd = green) — lives only on its side */}
      <span
        className="h-[3px] flex-1 rounded-full"
        style={{
          background: side === 'P' ? SYNTH.sidePort : 'transparent',
          opacity: 0.6,
        }}
      />

      {/* Seat chip (the athlete) */}
      <SeatChip
        seat={{ position, athleteId, label: '', isCox: false } as never}
        boatSize={boatSize}
        onTap={onTap}
        variant="rower"
      />

      <span
        className="h-[3px] flex-1 rounded-full"
        style={{
          background: side === 'S' ? SYNTH.sideStarboard : 'transparent',
          opacity: 0.6,
        }}
      />

      {/* Seat number on the opposite side for symmetry — keeps the hull balanced */}
      <span className="w-7 shrink-0" />
    </div>
  )
}

function seatLabelFor(_size: BoatSize, position: number): string {
  if (position === 1) return 'BOW'
  // Stroke and middle seats just show their seat number — we render the
  // BOW callout for position 1 to match the rower's mental model.
  return String(position)
}

// ─── Seat chip ───────────────────────────────────────────────────────────────

type SeatLike = { position: number; athleteId: string | null }

function SeatChip({
  seat,
  boatSize,
  onTap,
  variant,
}: {
  seat: SeatLike
  boatSize: BoatSize
  onTap: () => void
  variant: 'rower' | 'cox'
}) {
  const athlete = athleteFor(seat.athleteId)
  const side = seatSide(boatSize, seat.position)
  const sideColor =
    variant === 'cox'
      ? SYNTH.accentBlack
      : side === 'P'
        ? SYNTH.sidePort
        : SYNTH.sideStarboard
  const filled = !!athlete
  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.94 }}
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: variant === 'cox' ? 46 : 42,
        height: variant === 'cox' ? 46 : 42,
        background: filled ? sideColor : 'rgba(255,255,255,0.08)',
        border: filled
          ? `2px solid rgba(255,255,255,0.4)`
          : `1.5px dashed rgba(255,255,255,0.32)`,
        color: filled ? SYNTH.inkOnBrand : SYNTH.inkOnBrandFaint,
        fontFamily: SYNTH.font,
        boxShadow: filled
          ? '0 6px 14px -4px rgba(8,8,40,0.55), 0 1px 0 rgba(255,255,255,0.3) inset'
          : 'none',
      }}
      aria-label={
        filled
          ? `Seat ${seat.position}: ${athlete!.name}`
          : `Seat ${seat.position}: empty — tap to fill`
      }
    >
      <span
        className="text-[12px] font-bold tracking-[0.04em]"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {filled ? athlete!.initials : '+'}
      </span>
      {/* Tiny variant pip in the corner of the cox medallion */}
      {variant === 'cox' ? (
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-px text-[8px] font-bold uppercase tracking-[0.14em]"
          style={{
            background: SYNTH.accentBlack,
            color: SYNTH.inkOnBrand,
            border: `1px solid rgba(255,255,255,0.32)`,
            fontFamily: SYNTH.font,
          }}
        >
          Cox
        </span>
      ) : null}
    </motion.button>
  )
}

// ─── Hull backdrop SVG ───────────────────────────────────────────────────────

function HullBackdrop() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 200"
    >
      <defs>
        <linearGradient id="hull-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </linearGradient>
      </defs>
      {/* Boat hull — pointed at top (stroke side) and bow (bottom). The shape
          is intentionally stretched to look like a long racing shell. */}
      <path
        d="M 50 0
           C 80 4, 90 30, 90 100
           C 90 170, 80 196, 50 200
           C 20 196, 10 170, 10 100
           C 10 30, 20 4, 50 0 Z"
        fill="url(#hull-gradient)"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="0.6"
      />
      {/* Center keel line */}
      <line
        x1="50"
        y1="6"
        x2="50"
        y2="194"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="0.4"
        strokeDasharray="2 3"
      />
    </svg>
  )
}
