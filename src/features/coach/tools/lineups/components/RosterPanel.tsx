import { useMemo, useState } from 'react'
import { AthleteChip } from './AthleteChip'
import { THEME } from '../../../../../lib/theme'
import type { Athlete, ErgScore } from '../../../../../shared/data/types'

type SideFilter = 'all' | 'port' | 'starboard'

export function RosterPanel({
  athletes,
  ergByAthleteId,
  assignedIds,
}: {
  athletes: Athlete[]
  ergByAthleteId: Record<string, ErgScore>
  assignedIds: Set<string>
}) {
  const [query, setQuery] = useState('')
  const [side, setSide] = useState<SideFilter>('all')

  const visible = useMemo(() => {
    let rows = athletes.filter((a) => !assignedIds.has(a.id))
    if (side !== 'all') rows = rows.filter((a) => a.side === side)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      rows = rows.filter((a) => a.name.toLowerCase().includes(q))
    }
    rows.sort((a, b) => {
      const aErg = ergByAthleteId[a.id]?.timeSeconds ?? Infinity
      const bErg = ergByAthleteId[b.id]?.timeSeconds ?? Infinity
      return aErg - bErg
    })
    return rows
  }, [athletes, query, side, assignedIds, ergByAthleteId])

  return (
    <aside
      className="flex h-full flex-col rounded-2xl border"
      style={{
        background: THEME.white,
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
      }}
    >
      <header className="border-b px-4 pb-3 pt-4" style={{ borderColor: THEME.border }}>
        <div
          className="text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Roster · available
        </div>
        <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
          Drag into a seat
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name…"
          aria-label="Search athletes for lineup"
          className="mt-3 w-full rounded-lg border px-3 py-2 text-[12px] outline-none"
          style={{ borderColor: THEME.border, color: THEME.textPrimary, background: THEME.light }}
        />
        <div className="mt-2 flex gap-1">
          {(['all', 'port', 'starboard'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className="flex-1 rounded-md border px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors"
              style={{
                borderColor: side === s ? THEME.primary : THEME.border,
                background: side === s ? 'rgba(5,150,105,0.08)' : THEME.white,
                color: side === s ? THEME.primary : THEME.textSecondary,
                fontFamily: THEME.fontMono,
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div
          className="mt-2 text-[10px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {visible.length} available · {assignedIds.size} assigned
        </div>
      </header>

      <div className="synth-scroll flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {visible.map((a) => (
            <AthleteChip key={a.id} athlete={a} erg={ergByAthleteId[a.id]} />
          ))}
          {visible.length === 0 && (
            <div
              className="rounded-lg border border-dashed p-4 text-center text-[11px]"
              style={{ borderColor: THEME.border, color: THEME.textMuted, fontFamily: THEME.fontMono }}
            >
              Nothing matches.
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
