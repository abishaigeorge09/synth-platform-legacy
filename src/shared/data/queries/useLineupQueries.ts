/**
 * Lineup queries. Swap internals for Supabase hooks later.
 * Re-exports lineup types so consumers don't need to import from seeds.
 */
import { useStaticQuery } from './useStaticQuery'
import { SEED_PUBLISHED_LINEUPS, makeEmptyBoat } from '../seeds/lineups'
export type { SeatAssignment, BoatLineup, PublishedLineup } from '../seeds/lineups'

export function usePublishedLineups() {
  return useStaticQuery(SEED_PUBLISHED_LINEUPS)
}

export { makeEmptyBoat }
