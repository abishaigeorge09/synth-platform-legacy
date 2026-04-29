import { useMemo, useState } from 'react'
import { Search, Check } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_ATHLETES, type AppMockAthlete } from '../data/mockTeam'

type Props = {
  open: boolean
  onClose: () => void
  /** Currently assigned athlete id, if any (shows the active checkmark). */
  selectedId?: string | null
  /** Optional title (e.g. "Stroke seat" or "5 seat"). */
  title?: string
  onPick: (athlete: AppMockAthlete) => void
}

/**
 * Athlete picker — opens from a seat tap in the lineup builder. Search
 * by name + tap to assign. Closes automatically once a pick is made.
 */
export function AthletePickerSheet({ open, onClose, selectedId, title, onPick }: Props) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const trimmed = q.trim().toLowerCase()
    if (!trimmed) return APP_MOCK_ATHLETES
    return APP_MOCK_ATHLETES.filter((a) => a.name.toLowerCase().includes(trimmed))
  }, [q])

  return (
    <SheetShell open={open} onClose={onClose} title={title ?? 'Pick an athlete'}>
      <label
        className="flex items-center gap-2 rounded-2xl px-3"
        style={{ background: SYNTH.sheetMuted }}
      >
        <Search size={14} color={SYNTH.inkMuted} strokeWidth={2.4} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the roster"
          className="flex-1 bg-transparent py-3 text-[14px] outline-none"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        />
      </label>

      <div className="flex flex-col gap-1">
        {filtered.length === 0 ? (
          <p
            className="px-3 py-6 text-center text-[13px]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            No athletes match "{q}".
          </p>
        ) : (
          filtered.map((a) => {
            const isSelected = a.id === selectedId
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  onPick(a)
                  onClose()
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left active:opacity-70"
                style={{
                  background: isSelected ? SYNTH.sheetMuted : 'transparent',
                }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: a.side === 'P' ? `${SYNTH.cardSky}` : `${SYNTH.cardYellow}`,
                    color: SYNTH.ink,
                    fontFamily: SYNTH.font,
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: '0.04em',
                  }}
                >
                  {a.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[14px] font-semibold leading-tight"
                    style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                  >
                    {a.name}
                  </p>
                  <p
                    className="mt-0.5 text-[11px] uppercase tracking-[0.12em]"
                    style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
                  >
                    {a.position} · {a.side === 'P' ? 'Port' : a.side === 'S' ? 'Stbd' : 'Cox'}
                  </p>
                </div>
                {isSelected ? (
                  <Check size={16} color={SYNTH.accentEmerald} strokeWidth={3} />
                ) : null}
              </button>
            )
          })
        )}
      </div>
    </SheetShell>
  )
}
