import type { ToolSpec } from '../schema'

/**
 * Sprint 5.7 — first schema_version: 2 example. Showcases the `boat_race`
 * element with six lanes from a Pacific Invite 2K. Animation runs at
 * proportional speeds; the fastest crew lands at the right edge, slower
 * crews trail behind in finish order.
 */
export const PACIFIC_BOAT_RACE: ToolSpec = {
  schema_version: 2,
  id: 'pacific-boat-race',
  name: 'Pacific Boat Race',
  description:
    'Animated 2K race replay across six varsity boats. Tap Replay to re-run the finish.',
  category: 'analysis',
  icon_key: 'flag',
  version: '1.0.0',
  scope: 'team',
  inputs: [],
  bindings: {
    race: {
      source: 'static',
      params: {
        boats: [
          { name: '1V', finishMs: 390000 },
          { name: '2V', finishMs: 398000 },
          { name: '3V', finishMs: 405000 },
          { name: '4V', finishMs: 411000 },
          { name: '1F', finishMs: 418000 },
          { name: '2F', finishMs: 424000 },
        ],
      },
    },
    race_results: {
      source: 'static',
      params: {
        rows: [
          { rank: 1, boat: '1V', time: '6:30' },
          { rank: 2, boat: '2V', time: '6:38' },
          { rank: 3, boat: '3V', time: '6:45' },
          { rank: 4, boat: '4V', time: '6:51' },
          { rank: 5, boat: '1F', time: '6:58' },
          { rank: 6, boat: '2F', time: '7:04' },
        ],
      },
    },
  },
  elements: [
    {
      type: 'text',
      tone: 'kicker',
      content: 'Pacific Invite — 2K replay',
    },
    {
      type: 'boat_race',
      dataKey: 'race',
      durationMs: 8000,
    },
    {
      type: 'table',
      title: 'Finish order',
      dataKey: 'race_results',
      columns: [
        { key: 'rank', label: '#' },
        { key: 'boat', label: 'Boat' },
        { key: 'time', label: 'Time' },
      ],
    },
  ],
}
