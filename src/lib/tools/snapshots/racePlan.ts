import type { ResolvedBindings } from '@lib/tools/resolver'

export const RACE_PLAN_DATA: ResolvedBindings = {
  schedule: {
    athlete: { name: 'Sloane Carrow', side: 'S', year: 'JR' },
    rows: [
      { piece: 'Open',     distance: '0–250m',     rate: 36, target_split: '1:38' },
      { piece: 'Settle',   distance: '250–500m',   rate: 32, target_split: '1:42' },
      { piece: 'Body',     distance: '500–1500m',  rate: 32, target_split: '1:43' },
      { piece: 'Build',    distance: '1500–1750m', rate: 34, target_split: '1:42' },
      { piece: 'Sprint',   distance: '1750–2000m', rate: 38, target_split: '1:39' },
    ],
  },
  predicted_splits: [
    { piece: 'Open', split: 1.63 },
    { piece: 'Settle', split: 1.70 },
    { piece: 'Body', split: 1.71 },
    { piece: 'Build', split: 1.70 },
    { piece: 'Sprint', split: 1.65 },
  ],
}
