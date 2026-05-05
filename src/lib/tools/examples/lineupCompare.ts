import type { ToolSpec } from '../schema'

export const LINEUP_COMPARE: ToolSpec = {
  schema_version: 1,
  id: 'lineup-compare',
  name: 'Lineup compare',
  description:
    'Side-by-side compare of two boats. Per-seat erg delta and predicted boat-speed gap.',
  category: 'analysis',
  icon_key: 'compare',
  version: '1.0.0',
  scope: 'team',
  inputs: [
    { kind: 'team_id', name: 'team', label: 'Team', required: true },
  ],
  bindings: {
    boat_a: {
      source: 'sheets',
      params: { sheet: 'lineups', column: 'boat_a' },
    },
    boat_b: {
      source: 'sheets',
      params: { sheet: 'lineups', column: 'boat_b' },
    },
    seat_delta: {
      source: 'computed',
      params: {
        dependsOn: ['boat_a', 'boat_b'],
        op: 'per_seat_erg_delta',
      },
    },
  },
  elements: [
    {
      type: 'select',
      name: 'boatA',
      label: 'Boat A',
      width: 'half',
      options: [
        { value: '1v', label: '1V 8+' },
        { value: '2v', label: '2V 8+' },
        { value: '3v', label: '3V 8+' },
      ],
    },
    {
      type: 'select',
      name: 'boatB',
      label: 'Boat B',
      width: 'half',
      options: [
        { value: '1v', label: '1V 8+' },
        { value: '2v', label: '2V 8+' },
        { value: '3v', label: '3V 8+' },
      ],
    },
    { type: 'boat_lineup', dataKey: 'boat_a', width: 'half' },
    { type: 'boat_lineup', dataKey: 'boat_b', width: 'half' },
    {
      type: 'table',
      title: 'Per-seat erg delta',
      dataKey: 'seat_delta',
      columns: [
        { key: 'seat', label: 'Seat' },
        { key: 'a_split', label: 'Boat A 2K' },
        { key: 'b_split', label: 'Boat B 2K' },
        { key: 'delta', label: 'Δ' },
      ],
    },
  ],
}
