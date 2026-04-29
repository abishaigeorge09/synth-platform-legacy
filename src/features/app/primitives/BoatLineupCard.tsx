import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Users } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_ATHLETES } from '../data/mockTeam'
import { AthletePickerSheet } from './AthletePickerSheet'
import {
  type Boat,
  SEAT_COUNT,
  seatSide,
  useLineupBuilderStore,
} from '../data/lineupBuilderStore'

type Props = {
  boat: Boat
  onEdit?: () => void
}

/**
 * Container-based boat lineup card. NO illustration. Two-column split:
 *   left = Starboard (green tint), right = Port (red tint).
 * Each seat is a row with a position number, label, and tap target. The
 * AthletePickerSheet opens in multi-select mode anchored at the tapped
 * seat — selection order fills consecutive seats.
 *
 * 1x / 2x / 2- collapse to a single column (no left/right split needed).
 */
export function BoatLineupCard({ boat, onEdit }: Props) {
  const setSeatAthletes = useLineupBuilderStore((s) => s.setSeatAthletes)
  const [pickerAnchor, setPickerAnchor] = useState<number | null>(null)
  const [pickerMode, setPickerMode] = useState<'fill' | 'replace'>('fill')

  const total = SEAT_COUNT[boat.size]
  const filled = boat.seats.filter((s) => s.athleteId !== null).length
  const isWide = total >= 4

  const starboardSeats = boat.seats.filter((s) => seatSide(boat.size, s.position) === 'S')
  const portSeats = boat.seats.filter((s) => seatSide(boat.size, s.position) === 'P')

  const handleMultiPick = (athleteIds: string[]) => {
    if (pickerAnchor === null) return
    setSeatAthletes(boat.id, pickerAnchor, athleteIds)
    setPickerAnchor(null)
  }

  return (
    <motion.div
      layout
      className="rounded-3xl border p-4"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold"
          style={{ background: boat.color, color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          {boat.size}
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
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit boat"
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: SYNTH.inkOnBrand,
            }}
          >
            <Pencil size={14} strokeWidth={2.4} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setPickerMode('fill')
            setPickerAnchor(1)
          }}
          className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: SYNTH.inkOnBrand,
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
          }}
        >
          <Users size={12} strokeWidth={2.6} />
          Fill seats
        </button>
      </div>

      {/* Seat container */}
      {isWide ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <SideColumn
            label="Starboard"
            color={SYNTH.sideStarboard}
            seats={starboardSeats}
            onSeatTap={(pos) => {
              setPickerMode('replace')
              setPickerAnchor(pos)
            }}
          />
          <SideColumn
            label="Port"
            color={SYNTH.sidePort}
            seats={portSeats}
            onSeatTap={(pos) => {
              setPickerMode('replace')
              setPickerAnchor(pos)
            }}
          />
        </div>
      ) : (
        <div className="mt-4">
          <SideColumn
            label="Crew"
            color={SYNTH.inkOnBrandMuted}
            seats={boat.seats}
            onSeatTap={(pos) => {
              setPickerMode('replace')
              setPickerAnchor(pos)
            }}
          />
        </div>
      )}

      <AthletePickerSheet
        open={pickerAnchor !== null}
        onClose={() => setPickerAnchor(null)}
        title={
          pickerAnchor !== null
            ? pickerMode === 'fill'
              ? `Fill ${boat.name} from seat ${pickerAnchor}`
              : `${boat.name} · ${boat.seats.find((s) => s.position === pickerAnchor)?.label ?? ''}`
            : undefined
        }
        mode="multi"
        anchorPosition={pickerAnchor ?? undefined}
        maxPicks={pickerAnchor !== null ? Math.max(0, total - pickerAnchor + 1) : undefined}
        onMultiPick={handleMultiPick}
      />
    </motion.div>
  )
}

function SideColumn({
  label,
  color,
  seats,
  onSeatTap,
}: {
  label: string
  color: string
  seats: Boat['seats']
  onSeatTap: (position: number) => void
}) {
  return (
    <div
      className="flex flex-col rounded-2xl p-2"
      style={{
        background: `${color}1F`, // 14% tint
        border: `1px solid ${color}55`,
      }}
    >
      <div className="flex items-center gap-1.5 px-2 pt-1 pb-2">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
        />
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color, fontFamily: SYNTH.font }}
        >
          {label}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        {seats.map((s) => {
          const a = APP_MOCK_ATHLETES.find((x) => x.id === s.athleteId)
          return (
            <button
              key={s.position}
              type="button"
              onClick={() => onSeatTap(s.position)}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left active:opacity-70"
              style={{
                background: 'rgba(255,255,255,0.10)',
              }}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
                style={{
                  background: color,
                  color: SYNTH.inkOnBrand,
                  fontFamily: SYNTH.font,
                }}
              >
                {s.position}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[12px] font-semibold leading-tight"
                  style={{
                    color: a ? SYNTH.inkOnBrand : SYNTH.inkOnBrandFaint,
                    fontFamily: SYNTH.font,
                  }}
                >
                  {a?.name ?? 'Empty'}
                </p>
                <p
                  className="text-[9px] uppercase tracking-[0.12em]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  {s.label}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
