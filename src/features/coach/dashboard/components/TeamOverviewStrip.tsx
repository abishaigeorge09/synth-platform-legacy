import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'
import { useTeamStats, useSources } from '../../../../shared/data/queries'
import { SkeletonStatTile } from '../../../../shared/components/Skeleton'

type Tile = {
  kicker: string
  value: string
  detail: string
  accent: string
  link?: string
  provenance: { source: string; syncedAt: string }
}

function relativeTime(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`
  return `${Math.round(mins / 60 / 24)}d ago`
}

export function TeamOverviewStrip() {
  const { data: stats, isLoading: l1, isError: e1 } = useTeamStats()
  const { data: sources, isLoading: l3, isError: e3 } = useSources()

  if (e1 || e3 || l1 || l3) {
    return (
      <div className="grid grid-cols-2 gap-3 px-5 sm:px-10 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatTile key={i} />
        ))}
      </div>
    )
  }
  const healthySources = sources.filter((s) => s.status === 'healthy').length

  const ergSource = sources.find((s) => s.type === 'google_sheets')
  const teamworksSource = sources.find((s) => s.type === 'teamworks')
  const wearableSource = sources.find((s) => s.type === 'wearable')

  const tiles: Tile[] = [
    {
      kicker: 'Roster',
      value: String(stats.rosterCount),
      detail: 'active athletes on team',
      accent: THEME.primary,
      link: '/coach/athletes',
      provenance: {
        source: ergSource?.name ?? 'Erg workbooks',
        syncedAt: ergSource?.lastScanAt ?? '2026-04-25T18:00:00Z',
      },
    },
    {
      kicker: 'Training load',
      value: String(stats.trainingLoad ?? '6.8'),
      detail: 'team avg · spring racing block',
      accent: THEME.cyan,
      link: '/coach/tools/session-timer',
      provenance: {
        source: 'synth. computed',
        syncedAt: teamworksSource?.lastScanAt ?? '2026-04-25T21:58:00Z',
      },
    },
    {
      kicker: 'Active sources',
      value: `${healthySources} / ${sources.length}`,
      detail: 'all connectors healthy',
      accent: THEME.purple,
      link: '/coach/sources',
      provenance: {
        source: 'synth. agent',
        syncedAt: wearableSource?.lastScanAt ?? '2026-04-25T22:00:00Z',
      },
    },
    {
      kicker: 'Open alerts',
      value: String(stats.activeAlerts),
      detail: 'Cox 42% · Miller HRV · Spitz missed',
      accent: THEME.amber,
      link: '/coach/athletes',
      provenance: {
        source: wearableSource?.name ?? 'Wearable hub',
        syncedAt: wearableSource?.lastScanAt ?? '2026-04-25T22:00:00Z',
      },
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 px-5 sm:px-10 lg:grid-cols-4">
      {tiles.map((t, i) => {
        const card = (
          <motion.div
            key={t.kicker}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
            className={`rounded-xl border p-4${t.link ? ' transition-shadow hover:shadow-md' : ''}`}
            style={{
              background: 'var(--bg-primary)',
              borderColor: THEME.border,
              borderLeft: `3px solid ${t.accent}`,
              boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 10px 30px -20px rgba(24,24,27,0.18)',
            }}
          >
            <div
              className="text-[9px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              {t.kicker}
            </div>
            <div
              className="mt-2 text-[34px] font-bold leading-none"
              style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
            >
              {t.value}
            </div>
            <div className="mt-1 text-[11px]" style={{ color: THEME.textSecondary }}>
              {t.detail}
            </div>
            <div
              className="mt-2.5 flex items-center gap-1.5 border-t pt-2"
              style={{ borderColor: THEME.border }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: t.accent }}
              />
              <span
                className="truncate text-[9px]"
                style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
              >
                {t.provenance.source} · {relativeTime(t.provenance.syncedAt)}
              </span>
            </div>
          </motion.div>
        )
        return t.link ? (
          <Link key={t.kicker} to={t.link} className="no-underline">
            {card}
          </Link>
        ) : (
          card
        )
      })}
    </div>
  )
}
