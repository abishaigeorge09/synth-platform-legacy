import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { THEME } from '../../lib/theme'
import { ROWIQ_CARD_ATHLETES, TEAM_AVG_2K_SEC } from './buildRowiqAthletes'
import { filterAthletes, sortAthletes, type FilterMode, type SortMode } from './calculations'
import { formatSecAs2k } from './formatters'
import { SynthAthleteCard } from './SynthAthleteCard'
import { SynthQuickCompare } from './SynthQuickCompare'

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'top10', label: 'Top 10' },
  { key: 'most_improved', label: 'Improved' },
  { key: 'declining', label: 'Declining' },
]

const SORTS: { key: SortMode; label: string }[] = [
  { key: 'rank', label: 'Rank' },
  { key: 'name', label: 'Name' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'improvement', label: 'Improvement' },
]

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-zinc-400" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm0-2a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"
        fill="currentColor"
      />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconCompare() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <path d="M4 8h12M4 16h12M8 4v16M16 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function SynthAthleteRoster({ onSelectAthlete }: { onSelectAthlete: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const [sort, setSort] = useState<SortMode>('rank')
  const [compareMode, setCompareMode] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])

  const displayed = useMemo(
    () => sortAthletes(filterAthletes(ROWIQ_CARD_ATHLETES, filter, search), sort),
    [filter, search, sort]
  )

  const toggleCompareId = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev
    )
  }

  const compareAthletes = useMemo(
    () => ROWIQ_CARD_ATHLETES.filter((a) => compareIds.includes(a.id)),
    [compareIds]
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className="flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-3 sm:gap-4 sm:px-4"
        style={{ borderColor: THEME.border }}
      >
        <div className="relative w-full sm:w-64">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <IconSearch />
          </span>
          <input
            type="search"
            placeholder="Search athletes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none ring-emerald-500/0 transition focus:ring-2"
            style={{
              fontFamily: THEME.fontSans,
              borderColor: THEME.border,
              background: THEME.white,
            }}
          />
        </div>

        <div className="hidden h-6 w-px sm:block" style={{ background: THEME.border }} />

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              style={{
                fontFamily: THEME.fontMono,
                background: filter === f.key ? `${THEME.primary}18` : 'transparent',
                color: filter === f.key ? THEME.primaryDark : THEME.textMuted,
                border: `1px solid ${filter === f.key ? `${THEME.primary}44` : 'transparent'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="min-w-4 flex-1" />

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="cursor-pointer appearance-none rounded-lg border py-2 pl-3 pr-8 text-xs font-semibold text-zinc-700"
            style={{ fontFamily: THEME.fontMono, borderColor: THEME.border, background: THEME.white }}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
        </div>

        <button
          type="button"
          onClick={() => {
            setCompareMode(!compareMode)
            if (compareMode) setCompareIds([])
          }}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold transition"
          style={{
            fontFamily: THEME.fontMono,
            background: compareMode ? THEME.primary : THEME.white,
            color: compareMode ? THEME.white : THEME.textSecondary,
            borderColor: compareMode ? THEME.primary : THEME.border,
          }}
        >
          <IconCompare />
          {compareMode ? `Compare (${compareIds.length})` : 'Compare'}
        </button>
      </div>

      <div
        className={`min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-y-contain px-3 py-4 sm:px-6 lg:px-8 ${
          compareMode && compareIds.length >= 2 ? 'pb-24' : ''
        }`}
      >
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayed.map((a) => (
            <SynthAthleteCard
              key={a.id}
              athlete={a}
              onClick={() => onSelectAthlete(a.id)}
              compareMode={compareMode}
              selected={compareIds.includes(a.id)}
              onToggle={() => toggleCompareId(a.id)}
            />
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="py-20 text-center text-sm text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
            No athletes match your search.
          </div>
        ) : null}
      </div>

      <div
        className="shrink-0 border-t py-2 text-center text-[11px] text-zinc-500"
        style={{ borderColor: THEME.border, background: `${THEME.light}` }}
      >
        <span className="font-semibold text-zinc-700" style={{ fontFamily: THEME.fontMono }}>
          {displayed.length}
        </span>
        {displayed.length !== ROWIQ_CARD_ATHLETES.length ? ` of ${ROWIQ_CARD_ATHLETES.length}` : null} athletes ·{' '}
        <span className="font-semibold text-zinc-700" style={{ fontFamily: THEME.fontMono }}>
          13
        </span>{' '}
        season sessions (25–26) · Team avg 2k:{' '}
        <span className="font-semibold tabular-nums text-zinc-800" style={{ fontFamily: THEME.fontMono }}>
          {formatSecAs2k(TEAM_AVG_2K_SEC)}
        </span>
      </div>

      <AnimatePresence>
        {compareMode && compareIds.length >= 2 ? (
          <SynthQuickCompare
            athletes={compareAthletes}
            onClose={() => {
              setCompareMode(false)
              setCompareIds([])
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
