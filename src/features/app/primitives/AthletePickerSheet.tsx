import { useEffect, useMemo, useState } from 'react'
import { Search, Check, X as XIcon } from 'lucide-react'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_ATHLETES, type AppMockAthlete } from '../data/mockTeam'

type SideFilter = 'all' | 'P' | 'S' | 'X'

const PREF_LABEL: Record<NonNullable<AppMockAthlete['preferredSeat']>, string> = {
  stroke: 'Stroke',
  bow: 'Bow',
  middle: 'Middle',
  cox: 'Cox',
  any: 'Any',
}

type Props = {
  open: boolean
  onClose: () => void
  /** "single" = old behavior (tap to pick), "multi" = checkbox + Done CTA. */
  mode?: 'single' | 'multi'
  /** For multi-mode: starting seat position the picks will fill. */
  anchorPosition?: number
  /** Max number of athletes that can be picked in multi mode. */
  maxPicks?: number
  /** Currently assigned athlete (single mode highlight). */
  selectedId?: string | null
  title?: string
  /** When the picker is opened for a specific seat side, auto-filter to
   * matching athletes and surface the cox chip if the seat is the cox. */
  forSide?: 'P' | 'S' | 'X'
  onPick?: (athlete: AppMockAthlete) => void
  onMultiPick?: (athleteIds: string[]) => void
  /** Single-mode only — when present and a current athlete is assigned,
   * shows a "Remove from boat" button. */
  onClear?: () => void
}

/**
 * Athlete picker. Single-mode preserves the original "tap one and done"
 * behavior. Multi-mode is the new builder default — multi-select with
 * a side filter (red/green) and selection-order pills.
 */
export function AthletePickerSheet({
  open,
  onClose,
  mode = 'single',
  anchorPosition,
  maxPicks,
  selectedId,
  title,
  forSide,
  onPick,
  onMultiPick,
  onClear,
}: Props) {
  const [q, setQ] = useState('')
  const [side, setSide] = useState<SideFilter>('all')
  const [picked, setPicked] = useState<string[]>([])

  // Reset transient state when re-opened. If the seat the picker is opened
  // for has a side preference, default-filter to that side.
  useEffect(() => {
    if (!open) return
    setQ('')
    setSide(forSide ?? 'all')
    setPicked([])
  }, [open, forSide])

  const filtered = useMemo(() => {
    let rows = APP_MOCK_ATHLETES
    if (side !== 'all') {
      rows = rows.filter((a) => a.side === side)
    }
    const trimmed = q.trim().toLowerCase()
    if (trimmed) {
      rows = rows.filter((a) => a.name.toLowerCase().includes(trimmed))
    }
    return rows
  }, [q, side])

  const togglePick = (a: AppMockAthlete) => {
    setPicked((prev) => {
      if (prev.includes(a.id)) return prev.filter((x) => x !== a.id)
      if (maxPicks !== undefined && prev.length >= maxPicks) return prev
      return [...prev, a.id]
    })
  }

  const submitMulti = () => {
    if (picked.length === 0) return
    onMultiPick?.(picked)
    onClose()
  }

  const titleText = title ?? (mode === 'multi' ? 'Pick athletes' : 'Pick an athlete')
  const fillCount =
    mode === 'multi' && anchorPosition !== undefined && maxPicks !== undefined
      ? maxPicks
      : undefined

  return (
    // Auto-fit content height — short filters (e.g. PORT only, 3 athletes)
    // dock at the bottom instead of stretching to 78dvh. Long filters (ALL,
    // 46 athletes) still scroll inside SheetShell's 88dvh ceiling.
    <SheetShell open={open} onClose={onClose} title={titleText}>
      {/* Search */}
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

      {/* Side filter chips — Cox chip surfaces only when the picker is
          opened for a cox seat (forSide === 'X'). */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={side === 'all'}
          onClick={() => setSide('all')}
          label="All"
          accent={SYNTH.ink}
        />
        <FilterChip
          active={side === 'S'}
          onClick={() => setSide('S')}
          label="Starboard"
          accent={SYNTH.sideStarboard}
          dot
        />
        <FilterChip
          active={side === 'P'}
          onClick={() => setSide('P')}
          label="Port"
          accent={SYNTH.sidePort}
          dot
        />
        {forSide === 'X' ? (
          <FilterChip
            active={side === 'X'}
            onClick={() => setSide('X')}
            label="Cox"
            accent={SYNTH.accentBlack}
            dot
          />
        ) : null}
        {mode === 'multi' && fillCount !== undefined ? (
          <span
            className="ml-auto text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Fills {fillCount} seat{fillCount === 1 ? '' : 's'} from #{anchorPosition}
          </span>
        ) : null}
      </div>

      {/* Athletes list */}
      <div className="flex flex-col gap-1">
        {filtered.length === 0 ? (
          <p
            className="px-3 py-6 text-center text-[13px]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            No athletes match.
          </p>
        ) : (
          filtered.map((a) => {
            const sideColor =
              a.side === 'P'
                ? SYNTH.sidePort
                : a.side === 'S'
                  ? SYNTH.sideStarboard
                  : SYNTH.accentBlack
            const pickIndex = picked.indexOf(a.id)
            const isPicked = pickIndex !== -1
            const isSingleSelected = a.id === selectedId
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  if (mode === 'multi') {
                    togglePick(a)
                  } else {
                    onPick?.(a)
                    onClose()
                  }
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left active:opacity-70"
                style={{
                  background: isPicked || isSingleSelected ? SYNTH.sheetMuted : 'transparent',
                }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: sideColor,
                    color: SYNTH.inkOnBrand,
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
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: sideColor }}
                    />
                    <span
                      className="text-[10px] uppercase tracking-[0.12em]"
                      style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
                    >
                      {a.side === 'P' ? 'Port' : a.side === 'S' ? 'Starboard' : 'Cox'}
                    </span>
                    {a.preferredSeat ? (
                      <span
                        className="rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.1em]"
                        style={{
                          background: 'rgba(0,0,0,0.06)',
                          color: SYNTH.inkMuted,
                          fontFamily: SYNTH.font,
                        }}
                      >
                        Pref · {PREF_LABEL[a.preferredSeat]}
                      </span>
                    ) : null}
                  </div>
                </div>
                {/* Right side: multi-mode order pill or single-mode check */}
                {mode === 'multi' ? (
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      background: isPicked ? SYNTH.accentEmerald : 'transparent',
                      border: `2px solid ${isPicked ? SYNTH.accentEmerald : 'rgba(0,0,0,0.18)'}`,
                      color: isPicked ? SYNTH.inkOnBrand : SYNTH.inkMuted,
                      fontFamily: SYNTH.font,
                    }}
                  >
                    {isPicked ? pickIndex + 1 : ''}
                  </span>
                ) : isSingleSelected ? (
                  <Check size={16} color={SYNTH.accentEmerald} strokeWidth={3} />
                ) : null}
              </button>
            )
          })
        )}
      </div>

      {/* Multi-mode CTA */}
      {mode === 'multi' ? (
        <button
          type="button"
          onClick={submitMulti}
          disabled={picked.length === 0}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-bold disabled:opacity-40"
          style={{
            background: SYNTH.accentEmerald,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          <Check size={14} strokeWidth={2.8} />
          Done · Fill {picked.length} seat{picked.length === 1 ? '' : 's'}
        </button>
      ) : null}

      {/* Single-mode "Remove from boat" — only when a seat is currently
          assigned (parent passed onClear + selectedId). */}
      {mode === 'single' && onClear ? (
        <button
          type="button"
          onClick={() => {
            onClear()
            onClose()
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full border py-3 text-[13px] font-semibold"
          style={{
            background: 'transparent',
            borderColor: '#FCA5A5',
            color: '#B91C1C',
            fontFamily: SYNTH.font,
          }}
        >
          <XIcon size={14} strokeWidth={2.6} />
          Remove from boat
        </button>
      ) : null}
    </SheetShell>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  accent,
  dot,
}: {
  active: boolean
  onClick: () => void
  label: string
  accent: string
  dot?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
      style={{
        background: active ? accent : 'transparent',
        border: `1px solid ${active ? accent : 'rgba(0,0,0,0.12)'}`,
        color: active ? (accent === SYNTH.ink ? SYNTH.inkOnBrand : SYNTH.inkOnBrand) : SYNTH.inkMuted,
        fontFamily: SYNTH.font,
      }}
    >
      {dot ? (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: active ? SYNTH.inkOnBrand : accent }}
        />
      ) : null}
      {label}
    </button>
  )
}
