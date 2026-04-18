import { PageHeader } from './components/PageHeader'
import { TeamOverviewStrip } from './components/TeamOverviewStrip'
import { ConnectorChipRow } from './components/ConnectorChipRow'
import { TeamSessionsChart, TeamComplianceChart } from './components/TeamTrendsChart'
import { RosterPreviewTable } from './components/RosterPreviewTable'
import { AlertsPanel } from './components/AlertsPanel'
import { ActivityFeed } from './components/ActivityFeed'
import { AiInsightBlock } from './components/AiInsightBlock'
import { useTeam, useTeamStats } from '../../../shared/data/queries'
import { SkeletonLine } from '../../../shared/components/Skeleton'
import { QueryError } from '../../../shared/components/QueryError'

export function DashboardPage() {
  const { data: team, isLoading: l1, isError: e1, error: err1 } = useTeam()
  const { data: stats, isLoading: l2, isError: e2, error: err2 } = useTeamStats()

  if (e1 || e2) return <QueryError label="Dashboard" error={err1 ?? err2} />

  const headerLoading = l1 || l2
  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      {headerLoading ? (
        <header className="px-5 sm:px-10 pb-5 pt-8">
          <SkeletonLine width={120} height={8} />
          <SkeletonLine width={280} height={28} className="mt-2" />
          <SkeletonLine width={200} height={12} className="mt-2" />
        </header>
      ) : (
        <PageHeader
          kicker="Coach · Dashboard"
          title={`${team.name} · team overview`}
          subtitle={`${stats.rosterCount} on roster · latest erg ${stats.latestErgDate}`}
        />
      )}
      <TeamOverviewStrip />

      <div className="mt-6">
        <ConnectorChipRow />
      </div>

      <div className="mt-6 grid gap-4 px-5 sm:px-10 xl:grid-cols-2">
        <TeamSessionsChart />
        <TeamComplianceChart />
      </div>

      <div className="mt-6 px-5 sm:px-10">
        <RosterPreviewTable />
      </div>

      <div className="mt-6 grid gap-4 px-5 sm:px-10 xl:grid-cols-2">
        <AlertsPanel />
        <ActivityFeed />
      </div>

      <div className="mt-6 px-5 sm:px-10">
        <AiInsightBlock />
      </div>
    </div>
  )
}
