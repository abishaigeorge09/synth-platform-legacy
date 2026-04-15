import { Link, useParams } from 'react-router-dom'
import { THEME } from '../../../lib/theme'
import { SEED_ATHLETES } from '../../../shared/data/seeds'
import { ChatView } from './ChatView'

export function AthleteScopedChatPage() {
  const { athleteId } = useParams()
  const athlete = SEED_ATHLETES.find((a) => a.id === athleteId)

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
