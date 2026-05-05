import type { ToolSpec } from '../schema'

export const STROKE_RATE_LOGGER: ToolSpec = {
  schema_version: 1,
  id: 'stroke-rate-logger',
  name: 'Stroke rate logger',
  description:
    'Pulls live stroke rate from Concept2 for the selected athlete and tracks it against a target.',
  category: 'analysis',
  icon_key: 'gauge',
  version: '1.0.0',
  scope: 'athlete',
  inputs: [
    { kind: 'athlete_id', name: 'athlete', label: 'Athlete', required: true },
    { kind: 'number', name: 'targetRate', label: 'Target rate (spm)', default: 32 },
  ],
  bindings: {
    rate_history: {
      source: 'concept2',
      params: { metric: 'stroke_rate', window: 'last_7_days' },
    },
  },
  elements: [
    { type: 'text', content: 'Current vs. target stroke rate', tone: 'kicker' },
    {
      type: 'stat',
      label: 'Current',
      value: { binding: 'rate_history' },
      unit: 'spm',
      trend: 'up',
    },
    {
      type: 'line_chart',
      title: 'Rate, last 7 days',
      xKey: 'date',
      yKeys: ['rate'],
      dataKey: 'rate_history',
    },
    {
      type: 'input',
      name: 'note',
      label: 'Session note',
      kind: 'text',
      placeholder: 'What changed in this piece?',
    },
  ],
}
