import { SEED_TIMELINE_EVENTS } from '../seeds'
import type { UUID } from '../types'
import { eventsForAthlete } from '../ingestion/timeline'
import { useStaticQuery } from './useStaticQuery'

export function useTimelineEvents() {
  return useStaticQuery(SEED_TIMELINE_EVENTS)
}

export function useTimelineForAthlete(athleteId: UUID | undefined) {
  const { data, ...rest } = useTimelineEvents()
  const filtered =
    athleteId !== undefined ? eventsForAthlete(data, athleteId) : data
  return { data: filtered, ...rest }
}
