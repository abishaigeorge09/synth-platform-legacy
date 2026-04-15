import { PageHeader } from './components/PageHeader'
import { TeamOverviewStrip } from './components/TeamOverviewStrip'
import { ConnectorChipRow } from './components/ConnectorChipRow'
import { TeamSessionsChart, TeamComplianceChart } from './components/TeamTrendsChart'
import { RosterPreviewTable } from './components/RosterPreviewTable'
import { AlertsPanel } from './components/AlertsPanel'
import { ActivityFeed } from './components/ActivityFeed'
import { AiInsightBlock } from './components/AiInsightBlock'
import { useTeamStore } from '../../../shared/store/useTeamStore'
import { SEED_TEAM_STATS } from '../../../shared/data/seeds'

export function DashboardPage() {
  const team = useTeamStore((s) => s.activeTeam)
  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="Coach · Dashboard"
        title={`${team.name} · team overview`}
        subtitle={`${SEED_TEAM_STATS.rosterCount} on roster · latest erg ${SEED_TEAM_STATS.latestErgDate}`}
      />
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
