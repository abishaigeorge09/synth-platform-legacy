import type { ResolvedBindings } from '../resolver'

/**
 * Sprint 5.7 — fixture data for the PACIFIC_BOAT_RACE example.
 *
 * `race.boats[].finishMs` is wall-clock race time in milliseconds. The
 * boat_race renderer scales positions so the fastest crew (lowest
 * finishMs) lands at the right edge; slower crews are proportionally
 * behind, holding rank order visually.
 */
export const PACIFIC_BOAT_RACE_DATA: ResolvedBindings = {
  race: {
    boats: [
      { name: '1V', finishMs: 390000 },
      { name: '2V', finishMs: 398000 },
      { name: '3V', finishMs: 405000 },
      { name: '4V', finishMs: 411000 },
      { name: '1F', finishMs: 418000 },
      { name: '2F', finishMs: 424000 },
    ],
  },
  race_results: [
    { rank: 1, boat: '1V', time: '6:30' },
    { rank: 2, boat: '2V', time: '6:38' },
    { rank: 3, boat: '3V', time: '6:45' },
    { rank: 4, boat: '4V', time: '6:51' },
    { rank: 5, boat: '1F', time: '6:58' },
    { rank: 6, boat: '2F', time: '7:04' },
  ],
}
