import { motion } from 'framer-motion'
import { THEME } from '../../../../lib/theme'
import { SEED_TEAM_STATS, SEED_ACTIVITY, SEED_SOURCES } from '../../../../shared/data/seeds'

type Tile = {
  kicker: string
  value: string
  detail: string
  accent: string
}

export function TeamOverviewStrip() {
  const thisWeekSessions = SEED_ACTIVITY.filter((a) => a.kind === 'session').length + 12
  const healthySources = SEED_SOURCES.filter((s) => s.status === 'healthy').length
  const tiles: Tile[] = [
    {
      kicker: 'Roster',
      value: String(SEED_TEAM_STATS.rosterCount),
      detail: 'active athletes on team',
      accent: THEME.primary,
    },
    {
      kicker: 'Sessions this week',
      value: String(thisWeekSessions),
      detail: 'pieces · erg · water · gym',
      accent: THEME.cyan,
    },
    {
      kicker: 'Active sources',
      value: `${healthySources} / ${SEED_SOURCES.length}`,
      detail: 'all connectors healthy',
      accent: THEME.purple,
    },
    {
      kicker: 'Open alerts',
      value: String(SEED_TEAM_STATS.activeAlerts),
      detail: 'wellness + compliance',
      accent: THEME.amber,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 px-10 lg:grid-cols-4">
      {tiles.map((t, i) => (
        <motion.div
          key={t.kicker}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
          className="rounded-xl border p-4"
          style={{
            background: THEME.white,
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
        </motion.div>
      ))}
    </div>
  )
}
