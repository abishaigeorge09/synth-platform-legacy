import { SEED_TIMELINE_EVENTS } from '@shared/data/seeds'
import type { UUID } from '@shared/data/types'
import { eventsForAthlete } from '@shared/data/ingestion/timeline'
import { useStaticQuery } from '@shared/data/queries/useStaticQuery'

export function useTimelineEvents() {
  return useStaticQuery(SEED_TIMELINE_EVENTS)
}

export function useTimelineForAthlete(athleteId: UUID | undefined) {
  const { data, ...rest } = useTimelineEvents()
  const filtered =
    athleteId !== undefined ? eventsForAthlete(data, athleteId) : data
  return { data: filtered, ...rest }
}
