import { useEffect, useState } from 'react'
import { ArrowLeftRight, Check } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_ATHLETES } from '../data/mockTeam'
import type { Boat } from '../data/lineupBuilderStore'
import type { RunSwap } from '../data/useSessionsStore'
import { seatSide } from '../data/lineupBuilderStore'

type Props = {
  open: boolean
  onClose: () => void
  /** Boats from the previous (most recent) run — coach picks two athletes
   * to swap before kicking off the next run. */
  boats: Boat[]
  /** Confirmed: returns updated boats + the swap log. */
  onConfirm: (next: Boat[], swaps: RunSwap[]) => void
}

type Pick = { boatId: string; position: number }

/**
 * "+ New run" → opens this sheet. Coach taps two athletes (any two
 * seats, including across boats) to swap them. Confirm starts a new
 * run with the modified lineups; the swap is logged for history.
 */
export function RunSwapSheet({ open, onClose, boats: initialBoats, onConfirm }: Props) {
  const [boats, setBoats] = useState<Boat[]>(initialBoats)
  const [swaps, setSwaps] = useState<RunSwap[]>([])
  const [first, setFirst] = useState<Pick | null>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return
    setBoats(initialBoats.map((b) => ({ ...b, seats: b.seats.map((s) => ({ ...s })) })))
    setSwaps([])
    setFirst(null)
  }, [open, initialBoats])
  /* eslint-enable react-hooks/set-state-in-effect */

  const onSeatTap = (boatId: string, position: number) => {
    if (!first) {
      setFirst({ boatId, position })
      return
    }
    if (first.boatId === boatId && first.position === position) {
      setFirst(null)
      return
    }
    // Apply the swap
    const fromBoat = boats.find((b) => b.id === first.boatId)
    const toBoat = boats.find((b) => b.id === boatId)
    if (!fromBoat || !toBoat) return
    const fromSeat = fromBoat.seats.find((s) => s.position === first.position)
    const toSeat = toBoat.seats.find((s) => s.position === position)
    if (!fromSeat || !toSeat) return
    const fromAth = fromSeat.athleteId
    const toAth = toSeat.athleteId
    setBoats((prev) =>
      prev.map((b) => {
        if (b.id === fromBoat.id || b.id === toBoat.id) {
          return {
            ...b,
            seats: b.seats.map((s) => {
              if (b.id === fromBoat.id && s.position === first.position) {
                return { ...s, athleteId: toAth }
              }
              if (b.id === toBoat.id && s.position === position) {
                return { ...s, athleteId: fromAth }
              }
              return s
            }),
          }
        }
        return b
      }),
    )
    setSwaps((prev) => [
      ...prev,
      {
        boatId: fromBoat.id,
        position: first.position,
        fromAthleteId: fromAth,
        toAthleteId: toAth,
      },
      {
        boatId: toBoat.id,
        position,
        fromAthleteId: toAth,
        toAthleteId: fromAth,
      },
    ])
    setFirst(null)
  }

  const submit = () => {
    onConfirm(boats, swaps)
    onClose()
  }

  return (
    <SheetShell open={open} onClose={onClose} title="Plan the next run">
      <p className="text-[13px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
        Tap any two athletes to swap them. They can be in different boats. Confirm to start
        Run {/* derived run index passed in label, or just say "next run" */} with the new lineup.
      </p>

      <div className="flex flex-col gap-3">
        {boats.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl px-3 py-3"
            style={{ background: SYNTH.sheetMuted }}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold"
                style={{ background: b.color, color: SYNTH.ink }}
              >
                {b.size}
              </span>
              <p
                className="text-[13px] font-bold"
                style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
              >
                {b.name}
              </p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {b.seats.map((s) => {
                const a = APP_MOCK_ATHLETES.find((x) => x.id === s.athleteId)
                const side = seatSide(b.size, s.position)
                const sideColor = side === 'S' ? SYNTH.sideStarboard : SYNTH.sidePort
                const isFirst = first?.boatId === b.id && first?.position === s.position
                return (
                  <button
                    key={s.position}
                    type="button"
                    onClick={() => onSeatTap(b.id, s.position)}
                    className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left"
                    style={{
                      background: isFirst ? `${SYNTH.accentEmerald}33` : '#FFFFFF',
                      border: `1px solid ${isFirst ? SYNTH.accentEmerald : 'rgba(0,0,0,0.06)'}`,
                    }}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                      style={{ background: sideColor, color: SYNTH.inkOnBrand }}
                    >
                      {s.position}
                    </span>
                    <span
                      className="truncate text-[11px] font-semibold"
                      style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                    >
                      {a?.name.split(' ')[0] ?? 'Empty'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {swaps.length > 0 ? (
        <div
          className="rounded-2xl px-3 py-2"
          style={{ background: `${SYNTH.accentEmerald}1A`, border: `1px solid ${SYNTH.accentEmerald}55` }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.accentEmerald, fontFamily: SYNTH.font }}
          >
            <ArrowLeftRight size={10} className="-mt-0.5 inline" /> {swaps.length / 2} swap
            {swaps.length / 2 === 1 ? '' : 's'} queued
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={submit}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-bold"
        style={{
          background: SYNTH.accentEmerald,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        <Check size={14} strokeWidth={2.8} />
        Start next run
      </button>
    </SheetShell>
  )
}
