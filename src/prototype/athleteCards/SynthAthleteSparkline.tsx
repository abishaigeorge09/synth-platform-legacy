import { THEME } from '../../lib/theme'
import type { SparklinePoint } from './model'

export function SynthAthleteSparkline({ data }: { data: SparklinePoint[] }) {
  if (data.length < 2) return null
  const splits = data.map((d) => d.splitSec)
  const rawMin = Math.min(...splits)
  const rawMax = Math.max(...splits)
  const min = rawMin - 1
  const max = rawMax === rawMin ? rawMax + 2 : rawMax + 1
  const w = 200
  const h = 48
  const pad = 4
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = pad + ((max - d.splitSec) / (max - min)) * (h - pad * 2)
    return `${x},${y}`
  })
  const dPath = `M ${pts.join(' L ')}`

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.25} />
          <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`${dPath} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`}
        fill="url(#sparkFill)"
        stroke="none"
      />
      <path d={dPath} fill="none" stroke={THEME.primary} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
