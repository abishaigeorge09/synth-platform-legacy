import type { ResolvedBindings } from '@lib/tools/resolver'

/**
 * Wellness summary uses the label-match heuristic on the `stat` renderer:
 * stats whose label includes a field name (e.g. "Avg sleep") read that
 * field's mean from the bound array. See `registry.tsx` for the heuristic.
 */
export const WELLNESS_SUMMARY_DATA: ResolvedBindings = {
  recovery_avg: 71,
  checkins: [
    { date: 'Apr 28', sleep: 7.2, energy: 7, soreness: 3 },
    { date: 'Apr 29', sleep: 7.8, energy: 8, soreness: 3 },
    { date: 'Apr 30', sleep: 6.9, energy: 6, soreness: 4 },
    { date: 'May 1', sleep: 7.5, energy: 7, soreness: 3 },
    { date: 'May 2', sleep: 8.1, energy: 8, soreness: 2 },
    { date: 'May 3', sleep: 7.4, energy: 7, soreness: 3 },
    { date: 'May 4', sleep: 7.6, energy: 8, soreness: 3 },
  ],
  flagged: { count: 2, names: ['Star Miller', 'Madeline Cox'] },
}
