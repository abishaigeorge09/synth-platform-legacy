import { THEME } from '../../../../lib/theme'
import { useAthletes, useErgScores, getAthleteRecovery } from '../../../../shared/data/queries'

function fmt2k(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

export function RosterStatsStrip() {
  const { data: athletes } = useAthletes()
  const { data: ergScores } = useErgScores()

  const count = athletes.length
  const avgWatts = ergScores.length
    ? Math.round(ergScores.reduce((s, e) => s + (e.watts ?? 0), 0) / ergScores.length)
    : 0
  const best = [...ergScores].sort((a, b) => a.timeSeconds - b.timeSeconds)[0]

  let healthy = 0
  let atRisk = 0
  let critical = 0
  athletes.forEach((a) => {
    const r = getAthleteRecovery(a.id)
    if (r >= 75) healthy++
    else if (r >= 50) atRisk++
    else critical++
  })

  const tiles = [
    { label: 'Total', value: String(count) },
    { label: 'Avg watts', value: avgWatts ? String(avgWatts) : '—' },
    { label: 'Best 2K', value: best ? fmt2k(best.timeSeconds) : '—' },
  ]

  return (
    <div className="flex flex-col gap-3 px-5 sm:px-10">
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-2xl border p-4"
            style={{ borderColor: THEME.border, background: THEME.white }}
          >
            <div
              className="text-[9px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              {t.label}
            </div>
            <div
              className="mt-1 text-[20px] font-bold"
              style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
            >
              {t.value}
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex flex-wrap items-center gap-5 rounded-xl border px-4 py-3"
        style={{ background: THEME.white, borderColor: THEME.border }}
      >
        <HealthDot color={THEME.primary} count={healthy} label="healthy" />
        <span style={{ color: THEME.border }}>·</span>
        <HealthDot color={THEME.amber} count={atRisk} label="at risk" />
        <span style={{ color: THEME.border }}>·</span>
        <HealthDot color={THEME.red} count={critical} label="critical" />
      </div>
    </div>
  )
}

function HealthDot({
  color,
  count,
  label,
}: {
  color: string
  count: number
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      <span
        className="text-[13px] font-semibold"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        {count}
      </span>
      <span className="text-[12px]" style={{ color: THEME.textSecondary }}>
        {label}
      </span>
    </div>
  )
}
