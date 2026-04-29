import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Users, ChevronRight } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_ATHLETES, type AppMockAthlete } from '../data/mockTeam'
import { AthletePickerSheet } from './AthletePickerSheet'
import {
  type Boat,
  COXED,
  totalSeats,
  seatSide,
  useLineupBuilderStore,
} from '../data/lineupBuilderStore'

type Props = {
  boat: Boat
  onEdit?: () => void
}

/** What kind of picker is open */
type PickerState =
  | { kind: 'single'; position: number; currentAthleteId: string | null; forSide: 'P' | 'S' | 'X' }
  | { kind: 'multi'; anchorPosition: number }
  | null

/**
 * Container-based boat lineup card — no SVG illustration. Layout:
 *
 *   [size]  Boat name             [edit pencil]  [Fill seats]
 *           N/M seats filled                       chevron >
 *   ─────────────────────────────────────────────────
 *   ┌─ Cox ────────────────────────────────────────┐  ← only on coxed boats
 *   │  Cox · Empty                              ➜  │
 *   └──────────────────────────────────────────────┘
 *   ┌── STARBOARD (green) ──┐  ┌── PORT (red) ──┐
 *   │ 1 · Stroke · …        │  │ 2 · 7 seat · … │
 *   │ 3 · 6 seat · …        │  │ 4 · 5 seat · … │
 *   │ …                     │  │ …              │
 *   └───────────────────────┘  └────────────────┘
 *
 * Tap a single seat → quick single-select picker (with Remove if filled).
 * Tap "Fill seats" → multi-select anchored at the first empty seat.
 * Tap the entire header strip → opens the parent's onEdit (config sheet).
 * 1x / 2x / 2- collapse to a single column.
 */
export function BoatLineupCard({ boat, onEdit }: Props) {
  const setSeatAthlete = useLineupBuilderStore((s) => s.setSeatAthlete)
  const setSeatAthletes = useLineupBuilderStore((s) => s.setSeatAthletes)
  const [picker, setPicker] = useState<PickerState>(null)

  const limit = totalSeats(boat.size)
  const filled = boat.seats.filter((s) => s.athleteId !== null).length
  const isWide = boat.size === '4+' || boat.size === '4-' || boat.size === '4x' || boat.size === '8+'
  const hasCox = COXED[boat.size]

  const rowerSeats = boat.seats.filter((s) => seatSide(boat.size, s.position) !== 'X')
  const coxSeat = boat.seats.find((s) => seatSide(boat.size, s.position) === 'X') ?? null
  const starboardSeats = rowerSeats.filter((s) => seatSide(boat.size, s.position) === 'S')
  const portSeats = rowerSeats.filter((s) => seatSide(boat.size, s.position) === 'P')

  const onSeatTap = (position: number) => {
    const seat = boat.seats.find((s) => s.position === position)
    if (!seat) return
    const side = seatSide(boat.size, position)
    setPicker({
      kind: 'single',
      position,
      currentAthleteId: seat.athleteId,
      forSide: side,
    })
  }

  const onFillSeats = () => {
    const firstEmpty = boat.seats.find((s) => s.athleteId === null)?.position ?? 1
    setPicker({ kind: 'multi', anchorPosition: firstEmpty })
  }

  const onPickSingle = (a: AppMockAthlete) => {
    if (picker?.kind !== 'single') return
    setSeatAthlete(boat.id, picker.position, a.id)
    setPicker(null)
  }

  const onClearSingle = () => {
    if (picker?.kind !== 'single') return
    setSeatAthlete(boat.id, picker.position, null)
    setPicker(null)
  }

  const onPickMulti = (athleteIds: string[]) => {
    if (picker?.kind !== 'multi') return
    setSeatAthletes(boat.id, picker.anchorPosition, athleteIds)
    setPicker(null)
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
      {/* Header — entire strip is tappable for edit */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onEdit}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-1 py-1 text-left active:opacity-80"
        >
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
              {filled}/{limit} seats {hasCox ? '· incl. cox' : ''}
            </p>
          </div>
          {onEdit ? (
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{
                background: 'rgba(255,255,255,0.10)',
                color: SYNTH.inkOnBrandMuted,
              }}
            >
              <Pencil size={12} strokeWidth={2.4} />
            </span>
          ) : null}
          <ChevronRight size={14} color={SYNTH.inkOnBrandFaint} />
        </button>
        <button
          type="button"
          onClick={onFillSeats}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.12em]"
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

      {/* Cox row — coxed boats only, full-width above the side columns */}
      {coxSeat ? (
        <CoxRow boat={boat} seat={coxSeat} onTap={() => onSeatTap(coxSeat.position)} />
      ) : null}

      {/* Side columns / single column */}
      {isWide ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <SideColumn
            label="Starboard"
            color={SYNTH.sideStarboard}
            seats={starboardSeats}
            onSeatTap={onSeatTap}
          />
          <SideColumn
            label="Port"
            color={SYNTH.sidePort}
            seats={portSeats}
            onSeatTap={onSeatTap}
          />
        </div>
      ) : (
        <div className="mt-3">
          <SideColumn
            label="Crew"
            color={SYNTH.inkOnBrandMuted}
            seats={rowerSeats}
            onSeatTap={onSeatTap}
          />
        </div>
      )}

      {/* Picker — single OR multi */}
      <AthletePickerSheet
        open={picker !== null}
        onClose={() => setPicker(null)}
        title={
          picker?.kind === 'single'
            ? `${boat.name} · ${boat.seats.find((s) => s.position === picker.position)?.label ?? ''}`
            : picker?.kind === 'multi'
              ? `Fill ${boat.name} from seat ${picker.anchorPosition}`
              : undefined
        }
        mode={picker?.kind === 'multi' ? 'multi' : 'single'}
        anchorPosition={picker?.kind === 'multi' ? picker.anchorPosition : undefined}
        maxPicks={
          picker?.kind === 'multi' ? Math.max(0, limit - picker.anchorPosition + 1) : undefined
        }
        forSide={picker?.kind === 'single' ? picker.forSide : undefined}
        selectedId={picker?.kind === 'single' ? picker.currentAthleteId : undefined}
        onPick={onPickSingle}
        onClear={picker?.kind === 'single' && picker.currentAthleteId ? onClearSingle : undefined}
        onMultiPick={onPickMulti}
      />
    </motion.div>
  )
}

// ─── Cox row ────────────────────────────────────────────────────────────────

function CoxRow({
  boat,
  seat,
  onTap,
}: {
  boat: Boat
  seat: { position: number; athleteId: string | null }
  onTap: () => void
}) {
  const a = APP_MOCK_ATHLETES.find((x) => x.id === seat.athleteId)
  return (
    <button
      type="button"
      onClick={onTap}
      className="mt-3 flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left active:opacity-70"
      style={{
        background: 'rgba(255,255,255,0.10)',
        border: `1px solid rgba(255,255,255,0.18)`,
      }}
    >
      <span
        className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{
          background: SYNTH.accentBlack,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        Cox
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[13px] font-semibold"
          style={{
            color: a ? SYNTH.inkOnBrand : SYNTH.inkOnBrandFaint,
            fontFamily: SYNTH.font,
          }}
        >
          {a?.name ?? 'Empty'}
        </p>
        <p
          className="text-[10px] uppercase tracking-[0.12em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          {boat.name} · steers + calls the race
        </p>
      </div>
      <ChevronRight size={14} color={SYNTH.inkOnBrandFaint} />
    </button>
  )
}

// ─── Side column ───────────────────────────────────────────────────────────

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
        background: `${color}1F`,
        border: `1px solid ${color}55`,
      }}
    >
      <div className="flex items-center gap-1.5 px-2 pt-1 pb-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} />
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
              style={{ background: 'rgba(255,255,255,0.10)' }}
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
