import { motion } from 'framer-motion'
import { SeatSlot } from './SeatSlot'
import { THEME } from '../../../../../lib/theme'
import type { Athlete, ErgScore } from '../../../../../shared/data/types'
import type { BoatLineup } from '../../../../../shared/data/seeds/lineups'

export function BoatCard({
  boat,
  athleteById,
  ergByAthleteId,
  onRename,
  onRemoveSeat,
  onResize,
}: {
  boat: BoatLineup
  athleteById: Record<string, Athlete>
  ergByAthleteId: Record<string, ErgScore>
  onRename: (name: string) => void
  onRemoveSeat: (seatNumber: number, isCox: boolean) => void
  onResize: (size: 4 | 8) => void
}) {
  const cox = boat.seats.find((s) => s.isCox)
  const rowers = boat.seats.filter((s) => !s.isCox)
  const filledCount = boat.seats.filter((s) => s.athleteId).length
  const totalSeats = boat.seats.length

  return (
    <motion.div
      layout
      className="rounded-2xl border p-5"
      style={{
        background: 'var(--bg-primary)',
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
      }}
    >
      <header className="mb-4 flex items-start justify-between">
        <div>
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Boat
          </div>
          <input
            value={boat.name}
            onChange={(e) => onRename(e.target.value)}
            aria-label="Boat name"
            className="mt-0.5 -ml-1 rounded-md bg-transparent px-1 text-[22px] font-semibold leading-tight outline-none transition-colors focus:bg-zinc-50"
            style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
          />
          <div
            className="mt-0.5 text-[11px]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
          >
            {boat.label} · {filledCount} / {totalSeats} seats filled
          </div>
        </div>
        <div className="flex overflow-hidden rounded-full border" style={{ borderColor: THEME.border }}>
          {([4, 8] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onResize(size)}
              className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: boat.size === size ? THEME.primary : 'var(--bg-primary)',
                color: boat.size === size ? THEME.white : THEME.textSecondary,
                fontFamily: THEME.fontMono,
              }}
            >
              {size}+
            </button>
          ))}
        </div>
      </header>

      {/* Cox */}
      {cox && (
        <div className="mb-3">
          <SeatSlot
            boatId={boat.id}
            seat={cox}
            athlete={cox.athleteId ? athleteById[cox.athleteId] : undefined}
            erg={cox.athleteId ? ergByAthleteId[cox.athleteId] : undefined}
            label="COX"
            onRemove={() => onRemoveSeat(cox.seatNumber, true)}
          />
        </div>
      )}

      {/* Rowers, stroke at top (descending seat number) */}
      <div className="flex flex-col gap-2">
        {[...rowers]
          .sort((a, b) => b.seatNumber - a.seatNumber)
          .map((seat) => (
            <SeatSlot
              key={`${boat.id}-${seat.seatNumber}`}
              boatId={boat.id}
              seat={seat}
              athlete={seat.athleteId ? athleteById[seat.athleteId] : undefined}
              erg={seat.athleteId ? ergByAthleteId[seat.athleteId] : undefined}
              label={seat.seatNumber === boat.size ? `${seat.seatNumber} · STROKE` : seat.seatNumber === 1 ? `${seat.seatNumber} · BOW` : String(seat.seatNumber)}
              onRemove={() => onRemoveSeat(seat.seatNumber, false)}
            />
          ))}
      </div>
    </motion.div>
  )
}
