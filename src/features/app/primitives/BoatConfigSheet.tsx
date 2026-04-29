import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { AthletePickerSheet } from './AthletePickerSheet'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_ATHLETES, type AppMockAthlete } from '../data/mockTeam'
import {
  type BoatSize,
  SEAT_COUNT,
  BOAT_SIZE_LABEL,
  useLineupBuilderStore,
} from '../data/lineupBuilderStore'

type Props = {
  open: boolean
  onClose: () => void
  /** When non-null, edit this boat. When null, create a new one. */
  boatId: string | null
  /** Default size for new boats */
  defaultSize?: BoatSize
}

const SIZES: BoatSize[] = ['1x', '2x', '2-', '4+', '4-', '4x', '8+']

export function BoatConfigSheet({ open, onClose, boatId, defaultSize = '8+' }: Props) {
  const boats = useLineupBuilderStore((s) => s.boats)
  const addBoat = useLineupBuilderStore((s) => s.addBoat)
  const removeBoat = useLineupBuilderStore((s) => s.removeBoat)
  const renameBoat = useLineupBuilderStore((s) => s.renameBoat)
  const setSeatAthlete = useLineupBuilderStore((s) => s.setSeatAthlete)

  const editing = boatId ? boats.find((b) => b.id === boatId) ?? null : null
  const [name, setName] = useState(editing?.name ?? '')
  const [size, setSize] = useState<BoatSize>(editing?.size ?? defaultSize)
  const [pickerSeat, setPickerSeat] = useState<number | null>(null)

  // Reset local state whenever the sheet opens
  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name)
      setSize(editing.size)
    } else {
      setName('')
      setSize(defaultSize)
    }
  }, [open, editing, defaultSize])

  const onPickAthlete = (a: AppMockAthlete) => {
    if (!editing || pickerSeat === null) return
    setSeatAthlete(editing.id, pickerSeat, a.id)
  }

  const onSubmit = () => {
    if (!editing) {
      const finalName = name.trim() || `Boat ${boats.length + 1}`
      addBoat(finalName, size)
      onClose()
      return
    }
    if (name.trim() && name.trim() !== editing.name) {
      renameBoat(editing.id, name.trim())
    }
    // Size changes for existing boats are intentionally not supported
    // (would invalidate seat assignments). Save is implicit otherwise.
    onClose()
  }

  const onDelete = () => {
    if (!editing) return
    removeBoat(editing.id)
    onClose()
  }

  return (
    <>
      <SheetShell open={open} onClose={onClose} title={editing ? 'Edit boat' : 'Add a boat'}>
        {/* Name */}
        <Field label="Boat name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={editing ? editing.name : 'e.g. V8 A'}
            className="w-full rounded-xl border px-3 py-3 text-[14px] outline-none"
            style={{
              background: SYNTH.sheetMuted,
              borderColor: 'transparent',
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
            }}
          />
        </Field>

        {/* Size */}
        <Field label="Boat type">
          <div className="grid grid-cols-4 gap-1.5">
            {SIZES.map((s) => {
              const active = size === s
              const disabled = !!editing && editing.size !== s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => !disabled && setSize(s)}
                  disabled={disabled}
                  className="rounded-xl px-2 py-3 text-center disabled:opacity-30"
                  style={{
                    background: active ? SYNTH.ink : SYNTH.sheetMuted,
                    color: active ? SYNTH.inkOnBrand : SYNTH.ink,
                    fontFamily: SYNTH.font,
                  }}
                >
                  <p className="text-[18px] font-bold leading-none">{s}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.1em] opacity-70">
                    {SEAT_COUNT[s]} seat{SEAT_COUNT[s] === 1 ? '' : 's'}
                  </p>
                </button>
              )
            })}
          </div>
          <p
            className="mt-2 text-[11px]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            {BOAT_SIZE_LABEL[size]}
            {editing ? ' · type cannot be changed once a boat is created' : ''}
          </p>
        </Field>

        {/* Seats — only when editing */}
        {editing ? (
          <Field label={`${SEAT_COUNT[editing.size]} seats`}>
            <div className="flex flex-col gap-1.5">
              {editing.seats.map((s) => {
                const a = APP_MOCK_ATHLETES.find((x) => x.id === s.athleteId)
                return (
                  <button
                    key={s.position}
                    type="button"
                    onClick={() => setPickerSeat(s.position)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left active:opacity-70"
                    style={{ background: SYNTH.sheetMuted }}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                      style={{
                        background: editing.color,
                        color: SYNTH.ink,
                        fontFamily: SYNTH.font,
                        fontWeight: 800,
                        fontSize: 11,
                      }}
                    >
                      {s.position}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[13px] font-bold"
                        style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                      >
                        {a?.name ?? 'Empty'}
                      </p>
                      <p
                        className="text-[10px] uppercase tracking-[0.12em]"
                        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
                      >
                        {s.label}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
                    >
                      Tap to assign
                    </span>
                  </button>
                )
              })}
            </div>
          </Field>
        ) : null}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {editing ? (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[12px] font-semibold"
              style={{
                background: 'transparent',
                borderColor: '#FCA5A5',
                color: '#B91C1C',
                fontFamily: SYNTH.font,
              }}
            >
              <Trash2 size={12} strokeWidth={2.4} />
              Delete
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSubmit}
            className="ml-auto rounded-full px-5 py-2.5 text-[13px] font-semibold"
            style={{
              background: SYNTH.accentEmerald,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
            }}
          >
            {editing ? 'Done' : 'Add boat'}
          </button>
        </div>
      </SheetShell>

      <AthletePickerSheet
        open={pickerSeat !== null}
        onClose={() => setPickerSeat(null)}
        title={
          editing && pickerSeat !== null
            ? `${editing.seats.find((s) => s.position === pickerSeat)?.label} · ${editing.name}`
            : undefined
        }
        selectedId={
          editing && pickerSeat !== null
            ? editing.seats.find((s) => s.position === pickerSeat)?.athleteId ?? null
            : null
        }
        onPick={onPickAthlete}
      />
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}
