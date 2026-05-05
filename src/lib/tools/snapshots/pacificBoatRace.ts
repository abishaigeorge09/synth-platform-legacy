import type { ResolvedBindings } from '../resolver'

/**
 * Sprint 5.7 — fixture for PACIFIC_BOAT_RACE.
 *
 * Sprint 5.8 — split into three bindings to drive the multi-page tool:
 *   - `available_boats`: full pool of crews ({ boats: [...] }), source for
 *     both the lineup picker and the race
 *   - `selected_boats`: the string[] of crew names that are racing today
 *     (lineup picker writes here via toggle_set_member; boat_race reads
 *     this via filterStateKey)
 *   - `race_results`: ranked finish table for the Results page
 */
export const PACIFIC_BOAT_RACE_DATA: ResolvedBindings = {
  available_boats: {
    boats: [
      { name: '1V', finishMs: 390000 },
      { name: '2V', finishMs: 398000 },
      { name: '3V', finishMs: 405000 },
      { name: '4V', finishMs: 411000 },
      { name: '1F', finishMs: 418000 },
      { name: '2F', finishMs: 424000 },
    ],
  },
  selected_boats: ['1V', '2V', '3V', '4V'],
  race_results: [
    { rank: 1, boat: '1V', time: '6:30' },
    { rank: 2, boat: '2V', time: '6:38' },
    { rank: 3, boat: '3V', time: '6:45' },
    { rank: 4, boat: '4V', time: '6:51' },
    { rank: 5, boat: '1F', time: '6:58' },
    { rank: 6, boat: '2F', time: '7:04' },
  ],
}
