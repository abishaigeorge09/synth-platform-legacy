import { useDroppable } from '@dnd-kit/core'
import { THEME } from '@lib/theme'
import { AthleteChip } from './AthleteChip'
import type { Athlete, ErgScore, RowingSide } from '@shared/data/types'
import type { SeatAssignment } from '@shared/data/seeds/lineups'

export function SeatSlot({
  boatId,
  seat,
  athlete,
  erg,
  label,
  onRemove,
}: {
  boatId: string
  seat: SeatAssignment
  athlete?: Athlete
  erg?: ErgScore
  label: string
  onRemove: () => void
}) {
  const dropId = `${boatId}::${seat.seatNumber}${seat.isCox ? '-cox' : ''}`
  const { setNodeRef, isOver } = useDroppable({ id: dropId })

  const sideColor = sideAccent(seat.side, seat.isCox)
  const filled = !!athlete

  return (
    <div
      ref={setNodeRef}
      className="relative flex items-center gap-2 rounded-lg border-2 p-1.5 transition-colors"
      style={{
        borderStyle: filled ? 'solid' : 'dashed',
        borderColor: isOver ? THEME.primary : filled ? THEME.border : THEME.border,
        background: isOver ? 'rgba(5,150,105,0.08)' : filled ? THEME.white : 'transparent',
        minHeight: 44,
      }}
    >
      <div className="flex w-14 shrink-0 flex-col items-center" style={{ color: sideColor }}>
        <span
          className="text-[8px] font-semibold uppercase tracking-[0.16em]"
          style={{ fontFamily: THEME.fontMono }}
        >
          {label}
        </span>
        <span
          className="text-[9px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {seat.isCox ? 'cox' : seat.side}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        {filled && athlete ? (
          <AthleteChip athlete={athlete} erg={erg} compact onRemove={onRemove} />
        ) : (
          <span
            className="text-[11px]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            drop athlete
          </span>
        )}
      </div>
    </div>
  )
}

function sideAccent(side: RowingSide, isCox?: boolean) {
  if (isCox) return THEME.amber
  if (side === 'port') return THEME.cyan
  if (side === 'starboard') return THEME.purple
  return THEME.textSecondary
}
