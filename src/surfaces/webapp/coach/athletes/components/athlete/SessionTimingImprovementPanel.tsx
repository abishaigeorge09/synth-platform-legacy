import { useMemo, useState } from 'react'
import { THEME } from '@lib/theme'
import { useAthleteProfileSessions } from '@shared/data/queries'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type RangeKey = '30d' | '90d' | 'all'

const RANGE_LABELS: Record<RangeKey, string> = {
  '30d': '30 days',
  '90d': '90 days',
  all: 'All',
}

function cutoffFor(range: RangeKey) {
  if (range === 'all') return null
  const days = range === '30d' ? 30 : 90
  return Date.now() - days * 86400000
}

function splitToSeconds(split: string): number {
  const [mm, ss] = split.split(':')
  const m = parseInt(mm ?? '', 10)
  const s = parseFloat(ss ?? '')
  if (!Number.isFinite(m) || !Number.isFinite(s)) return Number.NaN
  return m * 60 + s
}

function fmtSplit(seconds?: number) {
  if (seconds === undefined || !Number.isFinite(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

function avg(nums: number[]) {
  if (!nums.length) return Number.NaN
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

const BOAT_COLORS: Record<string, string> = {
  '1V 8+': THEME.primary,
  '2V 8+': THEME.blue,
  '3V 8+': THEME.purple,
  '1V 4+': THEME.cyan,
  '2V 4+': THEME.amber,
}

export function SessionTimingImprovementPanel({ athleteId }: { athleteId: string }) {
  const { data: raw } = useAthleteProfileSessions(athleteId)
  const [range, setRange] = useState<RangeKey>('90d')

  const sessions = useMemo(() => {
    const cutoff = cutoffFor(range)
    return [...raw]
      .filter((s) => {
        if (!cutoff) return true
        return new Date(s.date).getTime() >= cutoff
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [raw, range])

  const series = useMemo(() => {
    return sessions.map((s) => {
      const secs = s.splits.map(splitToSeconds).filter((v) => Number.isFinite(v))
      const avgSplit = avg(secs)
      return {
        id: s.id,
        date: s.date.slice(5),
        dateIso: s.date,
        avgSplit,
        boat: s.boat,
        seat: s.seat,
        title: s.title,
        color: BOAT_COLORS[s.boat] ?? THEME.textMuted,
      }
    })
  }, [sessions])

  const improvement = useMemo(() => {
    const first = series.find((r) => Number.isFinite(r.avgSplit))
    const last = [...series].reverse().find((r) => Number.isFinite(r.avgSplit))
    if (!first || !last) return null
    return {
      first: fmtSplit(first.avgSplit),
      last: fmtSplit(last.avgSplit),
      deltaSec: (last.avgSplit - first.avgSplit),
    }
  }, [series])

  const label = useMemo(() => {
    if (range === 'all') return `${series.length} sessions`
    const days = range === '30d' ? 30 : 90
    return `${series.length} sessions · last ${days} days`
  }, [range, series.length])

  return (
    <section className="rounded-xl border border-zinc-200 bg-[var(--bg-primary)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">Sessions</div>
          <div className="mt-1 text-[15px] font-semibold text-zinc-900">Timing improvement</div>
          <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontSans }}>
            {label}
            {improvement ? (
              <span>
                {' '}
                · {improvement.first} → {improvement.last} ({improvement.deltaSec < 0 ? '' : '+'}
                {improvement.deltaSec.toFixed(1)}s)
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
            {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setRange(k)}
                className="px-2.5 py-1 text-[11px]"
                style={{
                  fontFamily: THEME.fontMono,
                  background: range === k ? THEME.primary : 'transparent',
                  color: range === k ? THEME.white : THEME.textSecondary,
                }}
              >
                {RANGE_LABELS[k]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid stroke={THEME.border} vertical={false} strokeDasharray="2 4" />
            <XAxis
              dataKey="date"
              stroke={THEME.textMuted}
              tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={THEME.textMuted}
              tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtSplit(v as number)}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-primary)',
                border: `1px solid ${THEME.border}`,
                borderRadius: 8,
                fontFamily: THEME.fontMono,
                fontSize: 11,
              }}
              formatter={(v, _k, item) => {
                const row = (item as unknown as { payload?: { boat?: string; seat?: string; title?: string; dateIso?: string } }).payload
                const labelParts = [row?.title, row?.boat ? `${row.boat} seat ${row.seat}` : null, row?.dateIso].filter(Boolean)
                return [fmtSplit(v as number), labelParts.join(' · ')]
              }}
            />
            <Line type="monotone" dataKey="avgSplit" stroke={THEME.primary} strokeWidth={2.6} dot={false} name="Avg /500" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="synth-scroll mt-4 max-h-[220px] overflow-y-auto rounded-lg border" style={{ borderColor: THEME.border }}>
        <table className="w-full text-left text-[12px]">
          <thead style={{ background: THEME.light }}>
            <tr>
              {['Date', 'Session', 'Boat', 'Seat', 'Avg /500'].map((h) => (
                <th key={h} className="border-b px-3 py-2" style={{ borderColor: THEME.border, fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...series].reverse().map((s) => (
              <tr key={s.id}>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
                  {s.dateIso}
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
                  {s.title}
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: s.color, fontFamily: THEME.fontMono, fontWeight: 700 }}>
                  {s.boat}
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
                  {s.seat}
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}>
                  {fmtSplit(s.avgSplit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

