import type { ToolSpec } from '@lib/tools/schema'

export const WELLNESS_SUMMARY: ToolSpec = {
  schema_version: 1,
  id: 'wellness-summary',
  name: 'Wellness summary',
  description:
    'Daily team-wide wellness rollup: sleep, HRV, energy, soreness — plus a flag chip when anyone trips a threshold.',
  category: 'wellness',
  icon_key: 'gauge',
  version: '1.0.0',
  scope: 'team',
  inputs: [
    { kind: 'team_id', name: 'team', label: 'Team', required: true },
    {
      kind: 'date_range',
      name: 'window',
      label: 'Window',
      default: ['2026-04-28', '2026-05-04'],
    },
  ],
  bindings: {
    recovery_avg: {
      source: 'whoop',
      params: { metric: 'recovery', agg: 'team_mean' },
    },
    checkins: {
      source: 'manual',
      params: { form: 'morning_checkin' },
    },
    flagged: {
      source: 'computed',
      params: {
        dependsOn: ['recovery_avg', 'checkins'],
        rule: 'recovery_lt_50_or_soreness_gt_7',
      },
    },
  },
  elements: [
    {
      type: 'stat',
      label: 'Avg recovery',
      value: { binding: 'recovery_avg' },
      unit: '%',
      width: 'half',
    },
    {
      type: 'stat',
      label: 'Avg sleep',
      value: { binding: 'checkins' },
      unit: 'hr',
      width: 'half',
    },
    {
      type: 'stat',
      label: 'Avg energy',
      value: { binding: 'checkins' },
      unit: '/10',
      width: 'half',
    },
    {
      type: 'stat',
      label: 'Avg soreness',
      value: { binding: 'checkins' },
      unit: '/10',
      width: 'half',
    },
    {
      type: 'bar_chart',
      title: 'Energy by day',
      xKey: 'date',
      yKeys: ['energy'],
      dataKey: 'checkins',
    },
    {
      type: 'badge',
      label: 'Athletes flagged',
      tone: 'warning',
    },
  ],
}
