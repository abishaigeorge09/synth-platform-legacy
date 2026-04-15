import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { THEME } from '../../lib/theme'
import { TRANSITIONS } from '../../lib/motion'
import { ROWIQ_CARD_ATHLETES, TEAM_AVG_2K_SEC } from './buildRowiqAthletes'
import type { SynthAthleteCard } from './model'
import { getSessionsInCommon } from './calculations'
import { formatDate, formatSecAs2k, formatTrend } from './formatters'
import { SynthLineChart } from './SynthLineChart'
import { SynthScatterChart } from './SynthScatterChart'

const TABS = ['Overview', 'Sessions', 'Compare', 'Stroke rate'] as const
type TabId = (typeof TABS)[number]

function catColor(cat: string): string {
  switch (cat) {
    case 'steady_state':
      return THEME.blue
    case 'intervals':
      return THEME.purple
    case 'threshold':
      return THEME.amber
    case 'triathlon':
      return THEME.primary
    default:
      return THEME.textMuted
  }
}

function catLabel(cat: string): string {
  switch (cat) {
    case 'steady_state':
      return 'Steady'
    case 'intervals':
      return 'Intervals'
    case 'threshold':
      return 'Threshold'
    case 'triathlon':
      return 'Tri'
    default:
      return cat
  }
}

function CategoryBadge({ category }: { category: string }) {
  const c = catColor(category)
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
      style={{ fontFamily: THEME.fontMono, background: `${c}18`, color: c, border: `1px solid ${c}44` }}
    >
      {catLabel(category)}
    </span>
  )
}

export function SynthAthleteProfile({ athlete, onBack }: { athlete: SynthAthleteCard; onBack: () => void }) {
  const [tab, setTab] = useState<TabId>('Overview')

  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-2 rounded-lg px-2 py-1 text-[13px] font-semibold transition hover:bg-zinc-100"
        style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
      >
        ← Back to roster
      </button>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl" style={{ fontFamily: THEME.fontSerif }}>
            {athlete.name}
          </h2>
          <span
            className="rounded-md px-2 py-1 text-xs font-bold"
            style={{ fontFamily: THEME.fontMono, background: `${THEME.primary}18`, color: THEME.primaryDark }}
          >
            Group {athlete.group}
          </span>
          {athlete.note ? (
            <span className="text-[11px] text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
              {athlete.note}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <span className="text-sm text-zinc-600" style={{ fontFamily: THEME.fontSans }}>
            <span className="font-bold tabular-nums text-zinc-900" style={{ fontFamily: THEME.fontMono }}>
              #{athlete.rank}
            </span>{' '}
            of {ROWIQ_CARD_ATHLETES.length}
          </span>
          <span style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>{formatTrend(athlete.trendDeltaSec)}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { label: '316 2k', value: athlete.twoKDisplay, color: THEME.primary },
            { label: 'Watts', value: String(athlete.watts316), color: THEME.blue },
            { label: 'Rate', value: `${athlete.rate316} spm`, color: THEME.purple },
            { label: 'Consistency', value: `${athlete.consistency}%`, color: THEME.amber },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border px-4 py-2.5"
              style={{ borderColor: `${s.color}40`, background: `${s.color}08` }}
            >
              <div className="text-[10px] uppercase tracking-wider text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
                {s.label}
              </div>
              <div className="mt-0.5 text-lg font-bold tabular-nums" style={{ fontFamily: THEME.fontMono, color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 rounded-lg border p-1" style={{ borderColor: THEME.border, background: THEME.light }}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex-1 rounded-md px-2 py-2 text-center text-[12px] font-semibold transition sm:px-3 sm:text-[13px]"
            style={{
              fontFamily: THEME.fontSans,
              background: tab === t ? THEME.primary : 'transparent',
              color: tab === t ? THEME.white : THEME.textSecondary,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={TRANSITIONS.smooth}>
        {tab === 'Overview' ? <OverviewTab athlete={athlete} /> : null}
        {tab === 'Sessions' ? <SessionsTab athlete={athlete} /> : null}
        {tab === 'Compare' ? <CompareTab athlete={athlete} /> : null}
        {tab === 'Stroke rate' ? <StrokeTab athlete={athlete} /> : null}
      </motion.div>
    </div>
  )
}

function OverviewTab({ athlete }: { athlete: SynthAthleteCard }) {
  const points = athlete.sessions.map((s) => ({ date: s.date, y: s.splitSec }))
  const cats = Object.entries(athlete.categoryBreakdown).filter(([, v]) => v.sessions > 0)
  const bestSession = athlete.sessions.reduce((a, b) => (a.splitSec < b.splitSec ? a : b))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-700" style={{ fontFamily: THEME.fontSans }}>
          2k-equivalent progression (synthetic season curve)
        </h3>
        <div className="rounded-xl border bg-white p-3" style={{ borderColor: THEME.border }}>
          <SynthLineChart
            series={[{ label: athlete.name, color: THEME.primary, points }]}
            referenceY={TEAM_AVG_2K_SEC}
            referenceLabel={`Team avg ${formatSecAs2k(TEAM_AVG_2K_SEC)}`}
            height={220}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4" style={{ borderColor: THEME.border }}>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700" style={{ fontFamily: THEME.fontSans }}>
            Personal best (rolled up)
          </h3>
          <div className="text-2xl font-bold tabular-nums" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
            {formatSecAs2k(bestSession.splitSec)}
          </div>
          <p className="mt-1 text-xs text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
            {formatDate(bestSession.date)} · {bestSession.workoutName}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4" style={{ borderColor: THEME.border }}>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700" style={{ fontFamily: THEME.fontSans }}>
            Category mix
          </h3>
          <div className="flex flex-col gap-2">
            {cats.map(([cat, stats]) => {
              const pct = (stats.sessions / athlete.sessionCount) * 100
              const c = catColor(cat)
              return (
                <div key={cat}>
                  <div className="mb-0.5 flex justify-between text-[11px]" style={{ fontFamily: THEME.fontMono }}>
                    <span style={{ color: c }}>{catLabel(cat)}</span>
                    <span className="text-zinc-400">{stats.sessions} sess</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function SessionsTab({ athlete }: { athlete: SynthAthleteCard }) {
  const [sortKey, setSortKey] = useState<'date' | 'split' | 'spm' | 'rank'>('date')
  const [asc, setAsc] = useState(false)

  const sorted = useMemo(() => {
    const s = [...athlete.sessions]
    s.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'date':
          cmp = a.date.localeCompare(b.date)
          break
        case 'split':
          cmp = a.splitSec - b.splitSec
          break
        case 'spm':
          cmp = a.spm - b.spm
          break
        case 'rank':
          cmp = a.rank - b.rank
          break
      }
      return asc ? cmp : -cmp
    })
    return s
  }, [athlete.sessions, sortKey, asc])

  const head = (key: typeof sortKey, label: string) => (
    <button
      type="button"
      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500 hover:text-zinc-800"
      style={{ fontFamily: THEME.fontMono }}
      onClick={() => {
        if (sortKey === key) setAsc(!asc)
        else {
          setSortKey(key)
          setAsc(key === 'date')
        }
      }}
    >
      {label}
      {sortKey === key ? (asc ? ' ↑' : ' ↓') : ''}
    </button>
  )

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: THEME.border }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-zinc-50" style={{ borderBottom: `1px solid ${THEME.border}` }}>
              <th className="px-4 py-2.5 text-left">{head('date', 'Date')}</th>
              <th className="px-4 py-2.5 text-left">
                <span className="text-[10px] uppercase tracking-wide text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
                  Workout
                </span>
              </th>
              <th className="px-4 py-2.5 text-right">{head('split', '2k eq')}</th>
              <th className="px-4 py-2.5 text-right">{head('spm', 'SPM')}</th>
              <th className="px-4 py-2.5 text-right">{head('rank', 'Rank')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.sessionId} className="border-t border-zinc-100 hover:bg-zinc-50/80">
                <td className="px-4 py-2.5 text-xs text-zinc-600" style={{ fontFamily: THEME.fontMono }}>
                  {formatDate(s.date)}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={s.workoutCategory} />
                    <span className="max-w-[200px] truncate text-xs text-zinc-600">{s.workoutName}</span>
                  </div>
                </td>
                <td
                  className="px-4 py-2.5 text-right text-sm font-bold tabular-nums"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
                >
                  {formatSecAs2k(s.splitSec)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600" style={{ fontFamily: THEME.fontMono }}>
                  {s.spm}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span
                    className="inline-flex rounded px-2 py-0.5 text-xs font-semibold"
                    style={{
                      fontFamily: THEME.fontMono,
                      background: `${THEME.primary}14`,
                      color: THEME.primaryDark,
                    }}
                  >
                    #{s.rank} / {s.of}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CompareTab({ athlete }: { athlete: SynthAthleteCard }) {
  const [compareId, setCompareId] = useState('')
  const compareAthlete = ROWIQ_CARD_ATHLETES.find((a) => a.id === compareId)

  const chartData = useMemo(() => {
    if (!compareAthlete) return []
    const set = new Set<string>()
    athlete.sessions.forEach((s) => set.add(s.date))
    compareAthlete.sessions.forEach((s) => set.add(s.date))
    const dates = [...set].sort()
    return dates.map((d) => ({
      date: d,
      a: athlete.sessions.find((s) => s.date === d)?.splitSec,
      b: compareAthlete.sessions.find((s) => s.date === d)?.splitSec,
    }))
  }, [athlete, compareAthlete])

  const common = compareAthlete ? getSessionsInCommon(athlete, compareAthlete) : []
  const diff = compareAthlete ? athlete.avgSplitSec - compareAthlete.avgSplitSec : 0
  const wins = common.filter((s) => s.splitA < s.splitB).length

  const series = useMemo(() => {
    if (!compareAthlete) return []
    return [
      {
        label: athlete.name,
        color: THEME.primary,
        points: chartData.map((d) => ({ date: d.date, y: d.a ?? athlete.avgSplitSec })),
      },
      {
        label: compareAthlete.name,
        color: THEME.purple,
        points: chartData.map((d) => ({ date: d.date, y: d.b ?? compareAthlete.avgSplitSec })),
      },
    ]
  }, [athlete, compareAthlete, chartData])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-1.5 block text-xs text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
          Compare with
        </label>
        <select
          value={compareId}
          onChange={(e) => setCompareId(e.target.value)}
          className="w-full max-w-md rounded-lg border px-3 py-2 text-sm text-zinc-900 outline-none"
          style={{ fontFamily: THEME.fontSans, borderColor: THEME.border, background: THEME.white }}
        >
          <option value="">Select athlete</option>
          {ROWIQ_CARD_ATHLETES.filter((a) => a.id !== athlete.id).map((a) => (
            <option key={a.id} value={a.id}>
              #{a.rank} {a.name} — {formatSecAs2k(a.avgSplitSec)}
            </option>
          ))}
        </select>
      </div>

      {compareAthlete ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-white p-4 text-center" style={{ borderColor: THEME.border }}>
              <div className="text-xs text-zinc-500">{athlete.name}</div>
              <div className="text-2xl font-bold tabular-nums" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
                {formatSecAs2k(athlete.avgSplitSec)}
              </div>
              <div className="mt-1 text-xs text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
                #{athlete.rank} · {athlete.sessionCount} sessions
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4 text-center" style={{ borderColor: THEME.border }}>
              <div className="text-xs text-zinc-500">{compareAthlete.name}</div>
              <div className="text-2xl font-bold tabular-nums" style={{ fontFamily: THEME.fontMono, color: THEME.purple }}>
                {formatSecAs2k(compareAthlete.avgSplitSec)}
              </div>
              <div className="mt-1 text-xs text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
                #{compareAthlete.rank} · {compareAthlete.sessionCount} sessions
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-zinc-600" style={{ fontFamily: THEME.fontSans }}>
            <span style={{ color: diff < 0 ? THEME.primary : THEME.red }}>
              {athlete.name} is {Math.abs(diff).toFixed(1)}s {diff < 0 ? 'faster' : 'slower'}
            </span>
            {common.length > 0 ? (
              <span className="text-zinc-400"> · Won {wins}/{common.length} common sessions</span>
            ) : null}
          </p>

          <div className="rounded-xl border bg-white p-3" style={{ borderColor: THEME.border }}>
            <SynthLineChart series={series} referenceY={TEAM_AVG_2K_SEC} referenceLabel="Team avg" height={220} />
          </div>

          {common.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-800" style={{ fontFamily: THEME.fontSans }}>
                Head-to-head ({common.length} sessions)
              </h3>
              <div className="overflow-hidden rounded-xl border" style={{ borderColor: THEME.border }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50">
                      <th className="px-3 py-2 text-left text-[10px] uppercase text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
                        Date
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
                        Type
                      </th>
                      <th className="px-3 py-2 text-right" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
                        {athlete.name}
                      </th>
                      <th className="px-3 py-2 text-right" style={{ fontFamily: THEME.fontMono, color: THEME.purple }}>
                        {compareAthlete.name}
                      </th>
                      <th className="px-3 py-2 text-right text-[10px] uppercase text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
                        Δ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {common.map((s) => {
                      const d = s.splitA - s.splitB
                      return (
                        <tr key={s.date} className="border-t border-zinc-100">
                          <td className="px-3 py-2 text-xs text-zinc-600">{formatDate(s.date)}</td>
                          <td className="px-3 py-2">
                            <CategoryBadge category={s.workoutCategory} />
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-xs tabular-nums" style={{ color: d <= 0 ? THEME.primary : THEME.textSecondary }}>
                            {formatSecAs2k(s.splitA)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-xs tabular-nums" style={{ color: d >= 0 ? THEME.purple : THEME.textSecondary }}>
                            {formatSecAs2k(s.splitB)}
                          </td>
                          <td className="px-3 py-2 text-right text-xs" style={{ color: d < 0 ? THEME.primary : d > 0 ? THEME.red : THEME.textMuted }}>
                            {d < 0 ? `${Math.abs(d).toFixed(1)}s` : d > 0 ? `${d.toFixed(1)}s` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p className="py-10 text-center text-sm text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
          Pick another athlete to overlay curves and head-to-head rows.
        </p>
      )}
    </div>
  )
}

function StrokeTab({ athlete }: { athlete: SynthAthleteCard }) {
  const avgSpm = Math.round(athlete.sessions.reduce((s, x) => s + x.spm, 0) / athlete.sessions.length)
  const sorted = [...athlete.sessions].sort((a, b) => a.splitSec - b.splitSec)
  const top3 = sorted.slice(0, 3)
  const sweet =
    top3.length >= 3
      ? {
          spm: Math.round(top3.reduce((s, x) => s + x.spm, 0) / 3),
          split: (top3.reduce((s, x) => s + x.splitSec, 0) / 3).toFixed(1),
        }
      : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-zinc-800" style={{ fontFamily: THEME.fontSans }}>
          Stroke rate vs 2k (equivalent)
        </h3>
        <p className="mb-3 text-xs text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
          Each point is a session. Darker = more recent. Lower on chart = faster.
        </p>
        <div className="rounded-xl border bg-white p-3" style={{ borderColor: THEME.border }}>
          <SynthScatterChart sessions={athlete.sessions} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-4" style={{ borderColor: THEME.border }}>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
            Avg stroke rate
          </div>
          <div className="text-xl font-bold tabular-nums text-zinc-900" style={{ fontFamily: THEME.fontMono }}>
            {avgSpm} spm
          </div>
        </div>
        {sweet ? (
          <div className="rounded-xl border bg-white p-4" style={{ borderColor: `${THEME.primary}44` }}>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500" style={{ fontFamily: THEME.fontMono }}>
              Sweet spot (best 3)
            </div>
            <div className="text-xl font-bold tabular-nums" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
              ~{sweet.spm} spm
            </div>
            <div className="text-xs text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
              Avg ~{sweet.split}s on those pieces
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
