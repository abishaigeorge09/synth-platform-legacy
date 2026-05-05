import type { ToolSpec } from '../schema'

/**
 * Sprint 5.7 — first schema_version: 2 example.
 *
 * Sprint 5.8 — multi-page tool. Three pages: Lineups (pick crews),
 * Race (animated playback of selected crews), Results (rank order).
 * The lineup_picker on page 1 toggles names in `selected_boats` and
 * the boat_race on page 2 reads from that same key via
 * `filterStateKey`, keeping the views in sync.
 */
export const PACIFIC_BOAT_RACE: ToolSpec = {
  schema_version: 2,
  id: 'pacific-boat-race',
  name: 'Pacific Boat Race',
  description:
    'Pick which crews race, watch the 2K animation, then check finish order. Multi-page tool with live lineup selection.',
  category: 'analysis',
  icon_key: 'flag',
  version: '1.0.0',
  scope: 'team',
  inputs: [],
  bindings: {
    available_boats: {
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
    selected_boats: {
      source: 'static',
      params: {
        // Initial selection — coach can toggle on the Lineups page.
        rows: ['1V', '2V', '3V', '4V'],
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
  // Top-level elements left empty — pages drive the rendering.
  elements: [],
  pages: [
    {
      id: 'lineups',
      title: 'Lineups',
      elements: [
        {
          type: 'text',
          tone: 'kicker',
          content: 'Pick the crews racing today',
        },
        {
          type: 'lineup_picker',
          dataKey: 'available_boats',
          stateKey: 'selected_boats',
        },
        {
          type: 'text',
          tone: 'caption',
          content:
            'Tap a crew to add or remove. Selections drive the **Race** and **Results** tabs.',
        },
      ],
    },
    {
      id: 'race',
      title: 'Race',
      elements: [
        {
          type: 'text',
          tone: 'kicker',
          content: 'Pacific Invite — 2K replay',
        },
        {
          type: 'boat_race',
          dataKey: 'available_boats',
          filterStateKey: 'selected_boats',
          durationMs: 8000,
        },
        {
          type: 'text',
          tone: 'caption',
          content: 'Tap **Replay** to re-run the finish.',
        },
      ],
    },
    {
      id: 'results',
      title: 'Results',
      elements: [
        {
          type: 'text',
          tone: 'kicker',
          content: 'Finish order',
        },
        {
          type: 'table',
          dataKey: 'race_results',
          columns: [
            { key: 'rank', label: '#' },
            { key: 'boat', label: 'Boat' },
            { key: 'time', label: 'Time' },
          ],
        },
      ],
    },
  ],
}
