import type { AthleteTimelineEvent, UUID } from '../types'

/** Shape check before persisting a timeline row (client or server). */
export function validateTimelineEvent(e: Partial<AthleteTimelineEvent>): e is AthleteTimelineEvent {
  return (
    typeof e.id === 'string' &&
    typeof e.teamId === 'string' &&
    typeof e.athleteId === 'string' &&
    typeof e.occurredAt === 'string' &&
    typeof e.source === 'string' &&
    typeof e.category === 'string' &&
    e.data !== undefined &&
    typeof e.confidence === 'number'
  )
}

export function sortTimelineEvents(events: AthleteTimelineEvent[]): AthleteTimelineEvent[] {
  return [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )
}

export function eventsForAthlete(events: AthleteTimelineEvent[], athleteId: UUID): AthleteTimelineEvent[] {
  return sortTimelineEvents(events.filter((e) => e.athleteId === athleteId))
}
