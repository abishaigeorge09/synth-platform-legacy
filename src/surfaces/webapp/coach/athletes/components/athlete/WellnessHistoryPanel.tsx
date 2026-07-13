import { useMemo, useState } from 'react'
import { THEME } from '@lib/theme'
import { useAthleteWellness } from '@shared/data/queries'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type RangeKey = '14d' | '30d' | '90d' | 'all'

const RANGE_LABELS: Record<RangeKey, string> = {
  '14d': '14 days',
  '30d': '30 days',
  '90d': '90 days',
  all: 'All',
}

function cutoffFor(range: RangeKey) {
  if (range === 'all') return null
  const days = range === '14d' ? 14 : range === '30d' ? 30 : 90
  return Date.now() - days * 86400000
}

export function WellnessHistoryPanel({ athleteId }: { athleteId: string }) {
  const { data: raw } = useAthleteWellness(athleteId)
  const [range, setRange] = useState<RangeKey>('30d')

  const filtered = useMemo(() => {
    const cutoff = cutoffFor(range)
    return [...raw]
      .filter((c) => {
        if (!cutoff) return true
        return new Date(c.date).getTime() >= cutoff
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [raw, range])

  const chartData = useMemo(
    () =>
      filtered.map((c) => ({
        date: c.date.slice(5),
        recovery: c.recovery,
        hrv: c.hrv,
        sleep: c.sleepHours,
        restingHr: c.restingHr,
        energy: c.energy,
        soreness: c.soreness,
      })),
    [filtered],
  )

  const label = useMemo(() => {
    if (range === 'all') return `Showing ${filtered.length} check-ins`
    const days = range === '14d' ? 14 : range === '30d' ? 30 : 90
    return `Showing ${filtered.length} check-ins · last ${days} days`
  }, [filtered.length, range])

  const latest = filtered[filtered.length - 1]

  return (
    <section className="rounded-xl border border-zinc-200 bg-[var(--bg-primary)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">Wellness</div>
          <div className="mt-1 text-[15px] font-semibold text-zinc-900">Complete history</div>
          <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontSans }}>
            {label}
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

      {latest && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Stat label="Recovery" value={`${latest.recovery}%`} color={THEME.primary} />
          <Stat label="Sleep" value={`${latest.sleepHours}h`} color={THEME.blue} />
          <Stat label="HRV" value={`${latest.hrv}`} color={THEME.cyan} />
          <Stat label="HR" value={`${latest.restingHr}`} color={THEME.purple} />
          <Stat label="Energy" value={`${latest.energy}/10`} color={THEME.amber} />
          <Stat label="Sore" value={`${latest.soreness}/10`} color={THEME.red} />
        </div>
      )}

      <div className="mt-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
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
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-primary)',
                border: `1px solid ${THEME.border}`,
                borderRadius: 8,
                fontFamily: THEME.fontMono,
                fontSize: 11,
              }}
            />
            <Line type="monotone" dataKey="recovery" stroke={THEME.primary} strokeWidth={2.4} dot={false} name="Recovery" />
            <Line type="monotone" dataKey="energy" stroke={THEME.amber} strokeWidth={2.0} dot={false} name="Energy" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="synth-scroll mt-4 max-h-[220px] overflow-y-auto rounded-lg border" style={{ borderColor: THEME.border }}>
        <table className="w-full text-left text-[12px]">
          <thead style={{ background: THEME.light }}>
            <tr>
              {['Date', 'Recovery', 'Sleep', 'HRV', 'HR', 'Energy', 'Sore'].map((h) => (
                <th key={h} className="border-b px-3 py-2" style={{ borderColor: THEME.border, fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...filtered].reverse().map((c) => (
              <tr key={c.id}>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
                  {c.date}
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
                  {c.recovery}%
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
                  {c.sleepHours}h
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
                  {c.hrv}
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
                  {c.restingHr}
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
                  {c.energy}/10
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
                  {c.soreness}/10
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: THEME.border, background: THEME.light }}>
      <div className="text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
        {label}
      </div>
      <div className="mt-0.5 text-[14px] font-bold" style={{ fontFamily: THEME.fontMono, color }}>
        {value}
      </div>
    </div>
  )
}

