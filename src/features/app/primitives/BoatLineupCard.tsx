import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, MoreVertical } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_ATHLETES } from '../data/mockTeam'
import type { Boat, Seat } from '../data/lineupBuilderStore'
import { SEAT_COUNT } from '../data/lineupBuilderStore'
import { AthletePickerSheet } from './AthletePickerSheet'

type Props = {
  boat: Boat
  /** When provided, renders a small select indicator for the multi-boat race picker */
  selected?: boolean
  onToggleSelect?: () => void
  onAssignSeat: (position: number, athleteId: string | null) => void
  onMore?: () => void
}

/**
 * Boat-shaped card with tappable seat circles. Stack of these makes the
 * Lineup Builder's body — no live racing animation, no preview clutter.
 * Just a visual lineup the coach can fill in seat by seat.
 */
export function BoatLineupCard({ boat, selected, onToggleSelect, onAssignSeat, onMore }: Props) {
  const [pickerSeat, setPickerSeat] = useState<number | null>(null)
  const total = SEAT_COUNT[boat.size]
  const filled = boat.seats.filter((s) => s.athleteId !== null).length

  return (
    <motion.div
      layout
      className="rounded-3xl border p-4"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        border: `1px solid ${selected ? boat.color : SYNTH.glassBorder}`,
        boxShadow: selected ? `0 0 0 1px ${boat.color}88` : undefined,
      }}
    >
      {/* Header: name + size + filled count + select toggle */}
      <div className="flex items-center gap-2.5">
        {onToggleSelect ? (
          <button
            type="button"
            onClick={onToggleSelect}
            aria-label={selected ? 'Deselect boat' : 'Select boat for race'}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{
              background: selected ? boat.color : 'transparent',
              border: `2px solid ${selected ? boat.color : 'rgba(255,255,255,0.32)'}`,
            }}
          >
            {selected ? (
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 13l4 4L19 7" stroke={SYNTH.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </button>
        ) : null}
        <span
          className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg"
          style={{ background: boat.color, color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          <span className="text-[12px] font-bold leading-none">{boat.size}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[14px] font-bold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {boat.name}
          </p>
          <p
            className="text-[10px] uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            {filled}/{total} seats filled
          </p>
        </div>
        {onMore ? (
          <button
            type="button"
            onClick={onMore}
            aria-label="Boat options"
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ color: SYNTH.inkOnBrandMuted }}
          >
            <MoreVertical size={16} strokeWidth={2.4} />
          </button>
        ) : null}
      </div>

      {/* Boat illustration with tappable seats */}
      <BoatIllustration
        boat={boat}
        onSeatTap={(position) => setPickerSeat(position)}
      />

      <AthletePickerSheet
        open={pickerSeat !== null}
        onClose={() => setPickerSeat(null)}
        title={
          pickerSeat !== null
            ? `${boat.name} · ${boat.seats.find((s) => s.position === pickerSeat)?.label ?? ''}`
            : undefined
        }
        selectedId={
          pickerSeat !== null
            ? boat.seats.find((s) => s.position === pickerSeat)?.athleteId ?? null
            : null
        }
        onPick={(a) => {
          if (pickerSeat === null) return
          onAssignSeat(pickerSeat, a.id)
        }}
      />
    </motion.div>
  )
}

// ─── Boat illustration ──────────────────────────────────────────────────────

function BoatIllustration({
  boat,
  onSeatTap,
}: {
  boat: Boat
  onSeatTap: (position: number) => void
}) {
  // 1x renders as a single-seat compact card (no horizontal hull)
  const seats = boat.seats
  const isWide = seats.length >= 4
  if (!isWide) return <CompactSeatRow seats={seats} color={boat.color} onSeatTap={onSeatTap} />

  // Horizontal V8 / V4 visualization
  // Cox compartment for coxed boats
  const hasCox = boat.size === '8+' || boat.size === '4+'
  const startX = hasCox ? 145 : 80
  const span = 760 - startX - 60
  const step = span / (seats.length - 1 + 0.5)

  return (
    <div className="mt-3">
      <svg viewBox="0 0 760 180" width="100%" className="block">
        <defs>
          <linearGradient id={`hull-${boat.id}`} x1="0" x2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>
        </defs>
        {/* hull */}
        <path
          d="M 60,90 Q 40,60 90,55 L 670,55 Q 720,55 740,90 Q 720,125 670,125 L 90,125 Q 40,120 60,90 Z"
          fill={`url(#hull-${boat.id})`}
          stroke={`${boat.color}77`}
          strokeWidth="1.5"
        />
        <line
          x1="80"
          y1="90"
          x2="720"
          y2="90"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {hasCox ? (
          <g>
            <rect
              x="92"
              y="76"
              width="42"
              height="28"
              rx="6"
              fill="rgba(255,255,255,0.08)"
              stroke="rgba(255,255,255,0.28)"
            />
            <text
              x="113"
              y="94"
              textAnchor="middle"
              fill={SYNTH.inkOnBrandMuted}
              fontSize="9"
              fontWeight="700"
              fontFamily="Geist, Inter, sans-serif"
            >
              COX
            </text>
          </g>
        ) : null}

        {seats.map((s, i) => {
          const isStrokeSide = i % 2 === 0
          const x = startX + i * step
          const a = APP_MOCK_ATHLETES.find((x) => x.id === s.athleteId)
          return (
            <g
              key={s.position}
              style={{ cursor: 'pointer' }}
              onClick={() => onSeatTap(s.position)}
            >
              {/* rigger */}
              <line
                x1={x}
                y1="90"
                x2={x}
                y2={isStrokeSide ? 60 : 120}
                stroke={`${boat.color}aa`}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* seat tap target */}
              <circle
                cx={x}
                cy="90"
                r="14"
                fill={a ? boat.color : 'rgba(255,255,255,0.22)'}
                stroke={a ? boat.color : 'rgba(255,255,255,0.42)'}
                strokeWidth="1.5"
              />
              <text
                x={x}
                y="93.5"
                textAnchor="middle"
                fill={a ? SYNTH.ink : SYNTH.inkOnBrand}
                fontSize="10"
                fontWeight="800"
                fontFamily="Geist, Inter, sans-serif"
              >
                {s.position}
              </text>
              {/* athlete initials below or above */}
              {a ? (
                <text
                  x={x}
                  y={isStrokeSide ? 50 : 145}
                  textAnchor="middle"
                  fill={SYNTH.inkOnBrand}
                  fontSize="8"
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
      <p
        className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
      >
        Tap a seat to assign
      </p>
    </div>
  )
}

function CompactSeatRow({
  seats,
  color,
  onSeatTap,
}: {
  seats: Seat[]
  color: string
  onSeatTap: (position: number) => void
}) {
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      {seats.map((s) => {
        const a = APP_MOCK_ATHLETES.find((x) => x.id === s.athleteId)
        return (
          <button
            key={s.position}
            type="button"
            onClick={() => onSeatTap(s.position)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left active:opacity-70"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
              style={{ background: color, color: SYNTH.ink, fontWeight: 800, fontSize: 11 }}
            >
              {s.position}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[13px] font-bold"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {a?.name ?? 'Empty'}
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.12em]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {s.label}
              </p>
            </div>
            <ChevronDown size={14} color={SYNTH.inkOnBrandFaint} />
          </button>
        )
      })}
    </div>
  )
}
