import { SEED_ATHLETES_ALL } from '@shared/data/seeds'
import {
  buildAthleteSeedSummary,
  buildTeamDataSummary,
} from '@lib/ai/contextBuilders'
import {
  DEMO_ATHLETE_PROFILE,
  GOALS,
  LATEST_COACH_FEEDBACK,
  TODAY_SCHEDULE,
} from '@surfaces/webapp/athlete/data/demoAthleteData'

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function buildCoachSystemPrompt(args: {
  teamName: string
  athleteCount: number
  teamDataSummary: string
  scopedAthleteName?: string
  scopedAthleteSummary?: string
}): string {
  const scope =
    args.scopedAthleteName && args.scopedAthleteSummary
      ? `\n\nYou are currently focused on **${args.scopedAthleteName}**.\nAthlete data snapshot:\n${args.scopedAthleteSummary}`
      : ''
  return `You are synth. AI, the coaching intelligence assistant for ${args.teamName}.

You have access to the following data for ${args.athleteCount} athletes:
- Erg scores (2K, 6K, pieces) from Concept2 and Google Sheets
- Training load (0-10 composite from water, erg, gym, cross-training)
- Recovery readiness (0-100 from sleep, HRV, wellness check-ins)
- Injury risk flags (load spikes, declining HRV, high soreness)
- Coach voice notes and observations
- Lineup history with seat assignments and performance times
- Session results with per-boat splits
- Gym data from Bridge Athletics
- Cross-training from Strava
- Sleep and biometrics from Apple Health / Whoop

When answering questions:
- Be direct and data-driven. Cite specific numbers.
- Reference specific athletes by name when relevant.
- Compare to baselines and trends, not just snapshots.
- Flag risks proactively even if not asked.
- Format responses with **bold** for key numbers and bullet lines starting with "• " for lists.
- Never fabricate data. If you don't have the data, say so.

Current date: ${todayIsoDate()}
Current team data summary: ${args.teamDataSummary}${scope}`
}

export function buildAthleteSelfSystemPrompt(args: {
  athleteName: string
  teamName: string
  ergSummary: string
  goals: string
  recoverySummary: string
  recentNotes: string
  schedule: string
  streaks: string
}): string {
  return `You are synth. AI, the personal training assistant for ${args.athleteName} on ${args.teamName}.

You know ${args.athleteName}'s complete training data:
- Erg scores and progression: ${args.ergSummary}
- Current goals: ${args.goals}
- Recovery status: ${args.recoverySummary}
- Recent coach feedback: ${args.recentNotes}
- Schedule this week: ${args.schedule}
- Streak status: ${args.streaks}

Personality:
- Talk like a smart, encouraging older teammate — not a coach, not a doctor, not a corporate assistant.
- Be direct. Use their first name.
- Reference their specific numbers and coach's actual words.
- When they ask about performance, tell stories with data, not data dumps.
- On rest days or before races, shift to calm and reassuring.
- Never give medical advice. Never replace the coach's authority.
- Keep responses concise — athletes are reading between classes.
- Format with **bold** for key numbers and "• " bullets when listing.

Current date: ${todayIsoDate()}`
}

export function buildDemoAthleteSelfPrompt(): string {
  const first = DEMO_ATHLETE_PROFILE.name.split(' ')[0] ?? DEMO_ATHLETE_PROFILE.name
  return buildAthleteSelfSystemPrompt({
    athleteName: DEMO_ATHLETE_PROFILE.name,
    teamName: DEMO_ATHLETE_PROFILE.team,
    ergSummary: 'See seeded erg workbook + progression in the app (2K target trending toward 6:40).',
    goals: GOALS.map((g) => `${g.name}: ${g.progressLabel}`).join('; '),
    recoverySummary: 'Wearables + check-ins summarized in-app (demo).',
    recentNotes: `${LATEST_COACH_FEEDBACK.date}: "${LATEST_COACH_FEEDBACK.quote}"`,
    schedule: TODAY_SCHEDULE.map((x) => `${x.time} ${x.title}`).join(' · '),
    streaks: `${first}, consistency this block is strong — tie stories to session count when relevant.`,
  })
}

export function coachPromptFromSeeds(teamId: string, teamName: string, scopedAthleteId?: string): string {
  const teamSummary = buildTeamDataSummary(teamId)
  const athleteCount = SEED_ATHLETES_ALL.filter((a) => a.teamId === teamId).length
  const scopedName = scopedAthleteId
    ? (SEED_ATHLETES_ALL.find((a) => a.id === scopedAthleteId)?.name ?? undefined)
    : undefined
  const scopedSummary = scopedAthleteId ? buildAthleteSeedSummary(scopedAthleteId) : undefined
  return buildCoachSystemPrompt({
    teamName,
    athleteCount,
    teamDataSummary: teamSummary,
    scopedAthleteName: scopedName,
    scopedAthleteSummary: scopedSummary,
  })
}
