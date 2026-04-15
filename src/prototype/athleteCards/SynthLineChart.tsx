import { THEME } from '../../lib/theme'
import { formatDate } from './formatters'

type Pt = { date: string; y: number }

/** Div-free SVG line chart — lower y values = faster (axis reversed visually). */
export function SynthLineChart({
  series,
  referenceY,
  referenceLabel,
  height = 200,
}: {
  series: { label: string; color: string; points: Pt[] }[]
  referenceY?: number
  referenceLabel?: string
  height?: number
}) {
  const all = series.flatMap((s) => s.points.map((p) => p.y))
  if (!all.length) {
    return (
      <div className="flex h-[120px] items-center justify-center text-xs text-zinc-400" style={{ fontFamily: THEME.fontSans }}>
        No points
      </div>
    )
  }
  const min = Math.min(...all, referenceY ?? Infinity) - 2
  const max = Math.max(...all, referenceY ?? -Infinity) + 2
  const w = 560
  const padL = 36
  const padR = 12
  const padT = 12
  const padB = 28
  const innerW = w - padL - padR
  const innerH = height - padT - padB

  const xFor = (i: number, n: number) => padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const yFor = (v: number) => padT + ((max - v) / (max - min)) * innerH

  const dates = series[0]?.points.map((p) => p.date) ?? []

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} className="text-zinc-500">
      {referenceY !== undefined ? (
        <line
          x1={padL}
          x2={w - padR}
          y1={yFor(referenceY)}
          y2={yFor(referenceY)}
          stroke={THEME.textMuted}
          strokeDasharray="4 4"
        />
      ) : null}
      {referenceY !== undefined && referenceLabel ? (
        <text x={w - padR - 4} y={yFor(referenceY) - 4} textAnchor="end" fill={THEME.textMuted} fontSize={9} fontFamily={THEME.fontMono}>
          {referenceLabel}
        </text>
      ) : null}
      {series.map((s) => {
        const n = s.points.length
        const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i, n)} ${yFor(p.y)}`).join(' ')
        return (
          <path key={s.label} d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
        )
      })}
      {dates.map((date, i) => (
        <text
          key={date}
          x={xFor(i, dates.length)}
          y={height - 8}
          textAnchor="middle"
          fill={THEME.textMuted}
          fontSize={8}
          fontFamily={THEME.fontMono}
        >
          {formatDate(date)}
        </text>
      ))}
      <text x={4} y={padT + 10} fill={THEME.textMuted} fontSize={8} fontFamily={THEME.fontMono}>
        {formatSecShort(min)}
      </text>
      <text x={4} y={padT + innerH / 2} fill={THEME.textMuted} fontSize={8} fontFamily={THEME.fontMono}>
        {formatSecShort((min + max) / 2)}
      </text>
      <text x={4} y={padT + innerH - 4} fill={THEME.textMuted} fontSize={8} fontFamily={THEME.fontMono}>
        {formatSecShort(max)}
      </text>
    </svg>
  )
}

function formatSecShort(sec: number): string {
  const m = Math.floor(sec / 60)
  const r = sec - m * 60
  return `${m}:${r.toFixed(0).padStart(2, '0')}`
}
