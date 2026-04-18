import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../dashboard/components/PageHeader'
import { AthleteCard } from './components/AthleteCard'
import { THEME } from '../../../lib/theme'
import { useAthletes, useErgScores } from '../../../shared/data/queries'
import { SkeletonCard, SkeletonLine } from '../../../shared/components/Skeleton'
import { QueryError } from '../../../shared/components/QueryError'

type SortMode = 'rank' | 'name' | 'watts'
type SideFilter = 'all' | 'port' | 'starboard'

export function AthletesPage() {
  const { data: athletes, isLoading: l1, isError: e1, error: err1 } = useAthletes()
  const { data: ergScores, isLoading: l2, isError: e2, error: err2 } = useErgScores()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('rank')
  const [side, setSide] = useState<SideFilter>('all')

  const sortedRankings = useMemo(() => {
    const withErg = athletes.map((a) => ({
      athlete: a,
      erg: ergScores.find((e) => e.athleteId === a.id),
    }))
    withErg.sort((a, b) => (a.erg?.timeSeconds ?? Infinity) - (b.erg?.timeSeconds ?? Infinity))
    const rankMap = new Map<string, number>()
    withErg.forEach((row, i) => rankMap.set(row.athlete.id, i + 1))
    return rankMap
  }, [athletes, ergScores])

  const visible = useMemo(() => {
    let rows = athletes.map((a) => ({
      athlete: a,
      erg: ergScores.find((e) => e.athleteId === a.id),
      rank: sortedRankings.get(a.id) ?? 999,
    }))
    if (side !== 'all') rows = rows.filter((r) => r.athlete.side === side)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      rows = rows.filter((r) => r.athlete.name.toLowerCase().includes(q))
    }
    if (sort === 'rank') rows.sort((a, b) => a.rank - b.rank)
    if (sort === 'name') rows.sort((a, b) => a.athlete.name.localeCompare(b.athlete.name))
    if (sort === 'watts') rows.sort((a, b) => (b.erg?.watts ?? 0) - (a.erg?.watts ?? 0))
    return rows
  }, [query, sort, side, sortedRankings, athletes, ergScores])

  if (e1 || e2) return <QueryError label="Athletes" error={err1 ?? err2} />

  if (l1 || l2) {
    return (
      <div className="flex min-h-full w-full flex-col pb-12">
        <header className="px-5 sm:px-10 pb-5 pt-8">
          <SkeletonLine width={100} height={8} />
          <SkeletonLine width={160} height={28} className="mt-2" />
          <SkeletonLine width={240} height={12} className="mt-2" />
        </header>
        <div className="grid gap-3 px-5 sm:px-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="Coach · Athletes"
        title="Full roster"
        subtitle={`${athletes.length} athletes · latest erg 2026-03-16 · sorted by ${sort}`}
      />

      <div className="flex flex-wrap items-center gap-3 px-5 sm:px-10 pb-5">
        <div
          className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 sm:w-auto"
          style={{ background: THEME.white, borderColor: THEME.border }}
        >
          <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Search
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a name…"
            aria-label="Search athletes by name"
            className="w-full bg-transparent text-[13px] outline-none sm:w-48"
            style={{ color: THEME.textPrimary }}
          />
        </div>
        <ButtonGroup
          label="Sort"
          value={sort}
          options={[
            { value: 'rank', label: '2K rank' },
            { value: 'name', label: 'Name' },
            { value: 'watts', label: 'Watts' },
          ]}
          onChange={(v) => setSort(v as SortMode)}
        />
        <ButtonGroup
          label="Side"
          value={side}
          options={[
            { value: 'all', label: 'All' },
            { value: 'port', label: 'Port' },
            { value: 'starboard', label: 'Starboard' },
          ]}
          onChange={(v) => setSide(v as SideFilter)}
        />
        <div
          className="ml-auto text-[11px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Showing {visible.length} / {athletes.length}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="grid gap-3 px-5 sm:px-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {visible.map(({ athlete, erg, rank }) => (
          <AthleteCard key={athlete.id} athlete={athlete} erg={erg} rank={rank} />
        ))}
      </motion.div>
    </div>
  )
}

function ButtonGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </span>
      <div
        className="flex overflow-hidden rounded-lg border"
        style={{ borderColor: THEME.border, background: THEME.white }}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-3 py-2 text-[11px] transition-colors"
            style={{
              fontFamily: THEME.fontMono,
              color: value === opt.value ? THEME.white : THEME.textSecondary,
              background: value === opt.value ? THEME.primary : 'transparent',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
