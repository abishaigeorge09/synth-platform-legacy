import type { ToolSpec } from '@lib/tools/schema'

export const RACE_PLAN: ToolSpec = {
  schema_version: 1,
  id: 'race-plan',
  name: 'Race plan',
  description:
    'Per-piece race plan for the selected athlete with predicted splits and a long-form coach brief.',
  category: 'coaching',
  icon_key: 'map',
  version: '1.0.0',
  scope: 'athlete',
  inputs: [
    { kind: 'athlete_id', name: 'athlete', label: 'Athlete', required: true },
  ],
  bindings: {
    schedule: {
      source: 'sheets',
      params: { sheet: 'race_plans', range: 'A:E' },
    },
    predicted_splits: {
      source: 'computed',
      params: {
        dependsOn: ['schedule'],
        op: 'predict_splits_from_recent_pieces',
      },
    },
  },
  elements: [
    { type: 'athlete_card', dataKey: 'schedule' },
    {
      type: 'text',
      tone: 'body',
      content:
        '**Race plan — Pacific Invite**\n\nOpen at 36 spm for the first 250m. Settle to 32 by 500m. Sit at 32 through the 1500 mark. Build to 34 by the 1750. Sprint at 38+ from 1750 to the line.\n\nKey reminders: long catches, square loads, breath out at the catch. The first three strokes set the rhythm — make them count.',
    },
    {
      type: 'table',
      title: 'Per-piece schedule',
      dataKey: 'schedule',
      columns: [
        { key: 'piece', label: 'Piece' },
        { key: 'distance', label: 'Distance' },
        { key: 'rate', label: 'Rate (spm)' },
        { key: 'target_split', label: 'Target /500m' },
      ],
    },
    {
      type: 'line_chart',
      title: 'Predicted splits',
      xKey: 'piece',
      yKeys: ['split'],
      dataKey: 'predicted_splits',
    },
  ],
}
