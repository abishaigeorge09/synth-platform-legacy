import { Link, useParams } from 'react-router-dom'
import { THEME } from '../../../lib/theme'
import { useAthlete } from '../../../shared/data/queries'
import { ChatView } from './ChatView'
import { QueryError } from '../../../shared/components/QueryError'
import { SkeletonLine } from '../../../shared/components/Skeleton'

export function AthleteScopedChatPage() {
  const { athleteId } = useParams()
  const { data: athlete, isLoading, isError, error } = useAthlete(athleteId ?? '')

  if (isError) return <QueryError label="Athlete chat" error={error} />

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col p-10">
        <SkeletonLine width={120} height={10} />
        <SkeletonLine width={240} height={24} className="mt-3" />
        <SkeletonLine width="60%" height={14} className="mt-4" />
      </div>
    )
  }

  if (!athlete) {
    return (
      <div className="p-10">
        <Link to="/coach/athletes" className="text-[12px]" style={{ color: THEME.primary }}>
          ← Athletes
        </Link>
        <div className="mt-4 text-[15px]" style={{ color: THEME.textSecondary }}>
          Athlete not found.
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="px-5 sm:px-10 pt-6">
        <Link
          to={`/coach/athletes/${athlete.id}`}
          className="text-[11px] font-semibold uppercase tracking-wider transition-colors hover:underline"
          style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono }}
        >
          ← Back to {athlete.name.split(' ')[0]}'s profile
        </Link>
      </div>
      <ChatView
        scope="athlete"
        scopedAthleteId={athlete.id}
        scopedAthleteName={athlete.name}
        kicker={`synth. AI · scoped to ${athlete.name.split(' ')[0]}`}
        title={`Ask about ${athlete.name}`}
        subtitle="Responses draw only from this athlete's erg, gym, wellness, and lineup data. Nothing team-wide."
        suggestions={[
          `Is ${athlete.name.split(' ')[0]} ready for Saturday?`,
          `How has ${athlete.name.split(' ')[0]}'s 2K trend changed?`,
          `Compare October vs November splits`,
          `What's ${athlete.name.split(' ')[0]}'s training load trend?`,
        ]}
      />
    </div>
  )
}
