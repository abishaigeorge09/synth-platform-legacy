import { THEME } from '../../lib/theme'
import type { AthleteSessionRow } from './model'

export function SynthScatterChart({ sessions }: { sessions: AthleteSessionRow[] }) {
  if (sessions.length < 2) {
    return <p className="text-sm text-zinc-500" style={{ fontFamily: THEME.fontSans }}>Not enough sessions.</p>
  }
  const spms = sessions.map((s) => s.spm)
  const splits = sessions.map((s) => s.splitSec)
  const minX = Math.min(...spms) - 1
  const maxX = Math.max(...spms) + 1
  const minY = Math.min(...splits) - 3
  const maxY = Math.max(...splits) + 3
  const w = 520
  const h = 220
  const pad = 36
  const innerW = w - pad * 2
  const innerH = h - pad * 2

  const px = (spm: number) => pad + ((spm - minX) / (maxX - minX)) * innerW
  const py = (sec: number) => pad + ((maxY - sec) / (maxY - minY)) * innerH

  const total = sessions.length
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
      <text x={w / 2} y={h - 4} textAnchor="middle" fill={THEME.textMuted} fontSize={9} fontFamily={THEME.fontMono}>
        SPM
      </text>
      <text
        x={12}
        y={h / 2}
        fill={THEME.textMuted}
        fontSize={9}
        fontFamily={THEME.fontMono}
        transform={`rotate(-90 12 ${h / 2})`}
        textAnchor="middle"
      >
        2k (s)
      </text>
      {sessions.map((s, i) => {
        const recency = (i + 1) / total
        const opacity = 0.25 + recency * 0.75
        return <circle key={`${s.date}-${i}`} cx={px(s.spm)} cy={py(s.splitSec)} r={5} fill={THEME.primary} fillOpacity={opacity} />
      })}
    </svg>
  )
}
