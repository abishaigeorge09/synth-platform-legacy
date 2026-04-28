import { useCallback, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../dashboard/components/PageHeader'
import { AthleteCard } from './components/AthleteCard'
import { THEME } from '../../../lib/theme'
import { useAthletes, useErgScores, getAthleteRecovery, isAthleteFlagged } from '../../../shared/data/queries'
import { SkeletonCard, SkeletonLine } from '../../../shared/components/Skeleton'
import { QueryError } from '../../../shared/components/QueryError'
import { toast } from '../../../shared/store/useToastStore'
import { useRosterOverridesStore } from '../../../shared/store/useRosterOverridesStore'
import { RosterStatsStrip } from './components/RosterStatsStrip'
import { SourceHealthBar } from '../dashboard/components/SourceHealthBar'
import type { Athlete } from '../../../shared/data/types'

type SortMode = 'rank' | 'name' | 'watts' | 'recovery'
type SideFilter = 'all' | 'port' | 'starboard' | 'cox'
type YearFilter = 'all' | 'FR' | 'SO' | 'JR' | 'SR' | 'GR'
type StatusFilter = 'all' | 'active' | 'inactive' | 'injured'

export function AthletesPage() {
  const navigate = useNavigate()
  const { data: athletes, isLoading: l1, isError: e1, error: err1 } = useAthletes()
  const { data: ergScores, isLoading: l2, isError: e2, error: err2 } = useErgScores()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('recovery')
  const [side, setSide] = useState<SideFilter>('all')
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [year, setYear] = useState<YearFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const setStatusOverride = useRosterOverridesStore((s) => s.setStatus)

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelected(new Set())
    setSelectMode(false)
  }, [])

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

  const recoveryMap = useMemo(() => {
    const map = new Map<string, number>()
    athletes.forEach((a) => map.set(a.id, getAthleteRecovery(a.id)))
    return map
  }, [athletes])

  const flaggedMap = useMemo(() => {
    const map = new Map<string, boolean>()
    athletes.forEach((a) => map.set(a.id, isAthleteFlagged(a.id)))
    return map
  }, [athletes])

  const visible = useMemo(() => {
    let rows = athletes.map((a) => ({
      athlete: a,
      erg: ergScores.find((e) => e.athleteId === a.id),
      rank: sortedRankings.get(a.id) ?? 999,
      recovery: recoveryMap.get(a.id) ?? 50,
      flagged: flaggedMap.get(a.id) ?? false,
    }))
    if (side !== 'all') rows = rows.filter((r) => r.athlete.side === side)
    if (year !== 'all') rows = rows.filter((r) => r.athlete.year === year)
    if (status !== 'all') rows = rows.filter((r) => r.athlete.status === status)
    if (flaggedOnly) rows = rows.filter((r) => r.flagged)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      rows = rows.filter((r) => r.athlete.name.toLowerCase().includes(q))
    }
    if (sort === 'rank') rows.sort((a, b) => a.rank - b.rank)
    if (sort === 'name') rows.sort((a, b) => a.athlete.name.localeCompare(b.athlete.name))
    if (sort === 'watts') rows.sort((a, b) => (b.erg?.watts ?? 0) - (a.erg?.watts ?? 0))
    if (sort === 'recovery') rows.sort((a, b) => a.recovery - b.recovery)
    return rows
  }, [query, sort, side, year, status, flaggedOnly, sortedRankings, athletes, ergScores, recoveryMap, flaggedMap])

  const selectAllVisible = useCallback(() => {
    setSelected(new Set(visible.map((r) => r.athlete.id)))
  }, [visible])

  const bulkSetStatus = useCallback((newStatus: Athlete['status']) => {
    selected.forEach((id) => setStatusOverride(id, newStatus))
    toast(`${selected.size} athlete${selected.size > 1 ? 's' : ''} → ${newStatus}`)
    clearSelection()
  }, [selected, setStatusOverride, clearSelection])

  const exportSelectedCsv = useCallback(() => {
    const rows = visible.filter((r) => selected.has(r.athlete.id))
    const header = 'Rank,Name,Side,Year,Status,2K (sec),Split (sec),SPM,Watts\n'
    const csvRows = rows.map((r) => {
      const a = r.athlete
      const e = r.erg
      return [r.rank, a.name, a.side, a.year, a.status, e?.timeSeconds ?? '', e?.splitSeconds ?? '', e?.spm ?? '', e?.watts ?? ''].join(',')
    })
    const blob = new Blob([header + csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `synth-selected-${selected.size}-athletes-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast(`Exported ${selected.size} athletes`)
  }, [visible, selected])

  const exportCsv = useCallback(() => {
    const header = 'Rank,Name,Side,Year,2K (sec),Split (sec),SPM,Watts\n'
    const csvRows = visible.map((r) => {
      const a = r.athlete
      const e = r.erg
      return [r.rank, a.name, a.side, a.year, e?.timeSeconds ?? '', e?.splitSeconds ?? '', e?.spm ?? '', e?.watts ?? ''].join(',')
    })
    const blob = new Blob([header + csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `synth-roster-export-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast('CSV downloaded')
  }, [visible])

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

  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => { setSelectMode((p) => !p); if (selectMode) clearSelection() }}
        className="rounded-md border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors"
        style={{
          fontFamily: THEME.fontMono,
          color: selectMode ? THEME.primary : THEME.textSecondary,
          borderColor: selectMode ? THEME.primary : THEME.border,
          background: selectMode ? 'rgba(5,150,105,0.06)' : 'var(--bg-primary)',
        }}
      >
        {selectMode ? 'Cancel' : 'Select'}
      </button>
      <button
        onClick={exportCsv}
        className="rounded-md border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors hover:bg-emerald-50"
        style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary, borderColor: THEME.border, background: 'var(--bg-primary)' }}
      >
        Export CSV
      </button>
    </div>
  )

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="Athletes"
        title="Roster"
        subtitle={`${athletes.length} athletes`}
        actions={headerActions}
      />

      <RosterStatsStrip />
      <div className="mt-3">
        <SourceHealthBar />
      </div>

      {/* Filter bar — row 1: search + sort */}
      <div className="mt-4 flex flex-wrap items-center gap-3 px-5 sm:px-10">
        <div
          className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 sm:w-auto"
          style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}
        >
          <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Search
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a name..."
            aria-label="Search athletes by name"
            className="w-full bg-transparent text-[13px] outline-none sm:w-48"
            style={{ color: THEME.textPrimary }}
          />
        </div>
        <ButtonGroup
          label="Sort"
          value={sort}
          options={[
            { value: 'recovery', label: 'Recovery' },
            { value: 'rank', label: '2K rank' },
            { value: 'name', label: 'Name' },
            { value: 'watts', label: 'Watts' },
          ]}
          onChange={(v) => setSort(v as SortMode)}
        />
        <div
          className="text-[11px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {visible.length} / {athletes.length}
        </div>
      </div>

      {/* Filter bar — row 2: side + status + year + flagged */}
      <div className="mt-2 flex flex-wrap items-center gap-3 px-5 sm:px-10 pb-4">
        <ButtonGroup
          label="Side"
          value={side}
          options={[
            { value: 'all', label: 'All' },
            { value: 'port', label: 'Port' },
            { value: 'starboard', label: 'Stbd' },
            { value: 'cox', label: 'Cox' },
          ]}
          onChange={(v) => setSide(v as SideFilter)}
        />
        <div className="h-4 w-px hidden sm:block" style={{ background: THEME.border }} />
        <ButtonGroup
          label="Status"
          value={status}
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'injured', label: 'Injured' },
          ]}
          onChange={(v) => setStatus(v as StatusFilter)}
        />
        <div className="h-4 w-px hidden sm:block" style={{ background: THEME.border }} />
        <ButtonGroup
          label="Year"
          value={year}
          options={[
            { value: 'all', label: 'All' },
            { value: 'FR', label: 'FR' },
            { value: 'SO', label: 'SO' },
            { value: 'JR', label: 'JR' },
            { value: 'SR', label: 'SR' },
            { value: 'GR', label: 'GR' },
          ]}
          onChange={(v) => setYear(v as YearFilter)}
        />
        <button
          type="button"
          onClick={() => setFlaggedOnly((p) => !p)}
          className="rounded-md border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors"
          style={{
            fontFamily: THEME.fontMono,
            color: flaggedOnly ? THEME.red : THEME.textSecondary,
            borderColor: flaggedOnly ? THEME.red : THEME.border,
            background: flaggedOnly ? `${THEME.red}08` : 'transparent',
          }}
        >
          Flagged{flaggedOnly ? ` (${visible.length})` : ''}
        </button>
      </div>

      <AnimatePresence>
        {selectMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mx-5 sm:mx-10 mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
              style={{ background: 'var(--bg-primary)', borderColor: THEME.primary, boxShadow: `0 0 0 1px ${THEME.primary}22` }}
            >
              <span
                className="text-[11px] font-semibold"
                style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
              >
                {selected.size} selected
              </span>
              <button
                type="button"
                onClick={selectAllVisible}
                className="rounded-md border px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors hover:bg-emerald-50"
                style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary, borderColor: THEME.border }}
              >
                Select all ({visible.length})
              </button>
              {selected.size > 0 && (
                <>
                  <div className="h-4 w-px" style={{ background: THEME.border }} />
                  <span
                    className="text-[10px] uppercase tracking-wider"
                    style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                  >
                    Set status:
                  </span>
                  {(['active', 'inactive', 'injured'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => bulkSetStatus(s)}
                      className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors hover:bg-zinc-50"
                      style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary, borderColor: THEME.border }}
                    >
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: s === 'active' ? THEME.primary : s === 'injured' ? THEME.red : THEME.textMuted }}
                      />
                      {s}
                    </button>
                  ))}
                  <div className="h-4 w-px" style={{ background: THEME.border }} />
                  <button
                    type="button"
                    onClick={exportSelectedCsv}
                    className="rounded-md border px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors hover:bg-emerald-50"
                    style={{ fontFamily: THEME.fontMono, color: THEME.primary, borderColor: THEME.primary }}
                  >
                    Export selected CSV
                  </button>
                  {selected.size === 2 && (
                    <>
                      <div className="h-4 w-px" style={{ background: THEME.border }} />
                      <button
                        type="button"
                        onClick={() => {
                          const ids = Array.from(selected)
                          navigate(`/coach/athletes/compare?a=${ids[0]}&b=${ids[1]}`)
                        }}
                        className="rounded-md border px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors hover:bg-blue-50"
                        style={{ fontFamily: THEME.fontMono, color: THEME.blue, borderColor: THEME.blue }}
                      >
                        Compare (2)
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="grid gap-3 px-5 sm:px-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {visible.map(({ athlete, erg, rank, recovery, flagged }) => (
          <AthleteCard
            key={athlete.id}
            athlete={athlete}
            erg={erg}
            rank={rank}
            recovery={recovery}
            flagged={flagged}
            selectMode={selectMode}
            isSelected={selected.has(athlete.id)}
            onToggleSelect={() => toggleSelect(athlete.id)}
          />
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
        style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}
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
