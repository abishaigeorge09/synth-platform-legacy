import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from './components/PageHeader'
import { TeamOverviewStrip } from './components/TeamOverviewStrip'
import { ConnectorChipRow } from './components/ConnectorChipRow'
import { SourceHealthBar } from './components/SourceHealthBar'
import { QuickActions } from './components/QuickActions'
import { TeamSessionsChart, TeamComplianceChart } from './components/TeamTrendsChart'
import { RosterPreviewTable } from './components/RosterPreviewTable'
import { AlertsPanel } from './components/AlertsPanel'
import { ActivityFeed } from './components/ActivityFeed'
import { AiInsightBlock } from './components/AiInsightBlock'
import { LastSessionCard } from './components/LastSessionCard'
import { DashboardDateRangeProvider, DashboardDateRangePicker } from './DashboardDateRange'
import { useTeam, useTeamStats } from '../../../shared/data/queries'
import { SkeletonLine } from '../../../shared/components/Skeleton'
import { QueryError } from '../../../shared/components/QueryError'
import { THEME } from '../../../lib/theme'

const UPCOMING_EVENTS = [
  { date: 'Apr 26', label: 'Pacific Invite Regatta', detail: 'Report time 5:30 AM', accent: THEME.red },
  { date: 'Apr 28', label: 'AM practice + midterms', detail: '6:00-8:00 · heavy academic load', accent: THEME.amber },
  { date: 'May 1', label: 'IRA qualifier seed deadline', detail: 'Lineups must be finalized', accent: THEME.primary },
]

type RosterFilter = 'all' | 'port' | 'starboard' | 'flagged'

export function DashboardPage() {
  const { data: team, isLoading: l1, isError: e1, error: err1 } = useTeam()
  const { data: stats, isLoading: l2, isError: e2, error: err2 } = useTeamStats()
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>('all')

  if (e1 || e2) return <QueryError label="Dashboard" error={err1 ?? err2} />

  const headerLoading = l1 || l2
  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      {headerLoading ? (
        <header className="px-5 sm:px-10 pb-5 pt-8">
          <SkeletonLine width={100} height={8} />
          <SkeletonLine width={220} height={28} className="mt-2" />
          <SkeletonLine width={140} height={12} className="mt-2" />
        </header>
      ) : (
        <PageHeader
          kicker="Dashboard"
          title={team.name}
          subtitle={`${stats.rosterCount} athletes · latest erg ${stats.latestErgDate}`}
        />
      )}
      <TeamOverviewStrip />

      <div className="mt-4">
        <QuickActions />
      </div>

      <div className="mt-6">
        <ConnectorChipRow />
      </div>

      <div className="mt-2">
        <SourceHealthBar />
      </div>

      {/* Wellness flags — most actionable, no date range needed */}
      <div className="mt-6 grid gap-4 px-5 sm:px-10 xl:grid-cols-[1fr_320px]">
        <AlertsPanel />
        <UpcomingEventsPanel />
      </div>

      {/* Charts with range picker directly above */}
      <DashboardDateRangeProvider>
        <div className="mt-6 flex items-center justify-between px-5 sm:px-10">
          <div
            className="text-[13px] font-semibold"
            style={{ color: THEME.textPrimary }}
          >
            Team trends
          </div>
          <DashboardDateRangePicker />
        </div>

        <div className="mt-3 grid gap-4 px-5 sm:px-10 xl:grid-cols-2">
          <TeamSessionsChart />
          <TeamComplianceChart />
        </div>

        {/* Roster preview with filter pills */}
        <div className="mt-6 px-5 sm:px-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              Filter
            </span>
            {(['all', 'port', 'starboard', 'flagged'] as RosterFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setRosterFilter(f)}
                className="rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.12em] transition-colors"
                style={{
                  fontFamily: THEME.fontMono,
                  borderColor: rosterFilter === f ? THEME.primary : THEME.border,
                  color: rosterFilter === f ? THEME.white : THEME.textSecondary,
                  background: rosterFilter === f ? THEME.primary : 'transparent',
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <RosterPreviewTable
            sideFilter={rosterFilter === 'port' || rosterFilter === 'starboard' ? rosterFilter : 'all'}
            flaggedOnly={rosterFilter === 'flagged'}
          />
        </div>

        <div className="mt-6 px-5 sm:px-10">
          <ActivityFeed />
        </div>
      </DashboardDateRangeProvider>

      <div className="mt-6 grid gap-4 px-5 sm:px-10 xl:grid-cols-2">
        <LastSessionCard />
        <AiInsightBlock />
      </div>
    </div>
  )
}

function UpcomingEventsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border p-5"
      style={{
        background: 'var(--bg-primary)',
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
      }}
    >
      <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
        Upcoming
      </div>
      <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
        This week
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {UPCOMING_EVENTS.map((ev) => (
          <div
            key={ev.date}
            className="rounded-lg border px-3 py-2.5"
            style={{ borderColor: THEME.border, background: THEME.light, borderLeft: `3px solid ${ev.accent}` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: THEME.fontMono, color: ev.accent }}>
                {ev.date}
              </span>
              <span className="text-[12px] font-semibold" style={{ color: THEME.textPrimary }}>{ev.label}</span>
            </div>
            <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary }}>{ev.detail}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 border-t pt-2.5" style={{ borderColor: THEME.border }}>
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: THEME.blue }} />
        <span className="text-[9px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Google Calendar · synced 12m ago
        </span>
      </div>
    </motion.div>
  )
}
