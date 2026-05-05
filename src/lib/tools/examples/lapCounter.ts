import type { ToolSpec } from '../schema'

export const LAP_COUNTER: ToolSpec = {
  schema_version: 1,
  id: 'lap-counter',
  name: 'Lap counter',
  description:
    'Tap to log laps during a piece. Records into a running table with elapsed and split times.',
  category: 'timing',
  icon_key: 'timer',
  version: '1.0.0',
  scope: 'team',
  inputs: [
    {
      kind: 'select',
      name: 'boat',
      label: 'Boat',
      required: true,
      options: [
        { value: '1v', label: '1V 8+' },
        { value: '2v', label: '2V 8+' },
      ],
    },
  ],
  bindings: {
    laps: {
      source: 'static',
      params: {
        rows: [
          { lap: 1, elapsed: '00:00:00', split: '—' },
          { lap: 2, elapsed: '00:00:00', split: '—' },
        ],
      },
    },
  },
  elements: [
    { type: 'timer', label: 'Elapsed', mode: 'stopwatch' },
    {
      type: 'button',
      label: 'Lap',
      action: { kind: 'submit', payload: { append_to: 'laps', kind: 'lap' } },
    },
    {
      type: 'table',
      title: 'Recorded laps',
      dataKey: 'laps',
      columns: [
        { key: 'lap', label: '#' },
        { key: 'elapsed', label: 'Elapsed' },
        { key: 'split', label: 'Split' },
      ],
    },
  ],
}
