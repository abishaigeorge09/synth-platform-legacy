import type { ResolvedBindings } from '../resolver'

/**
 * Mock data for the stroke-rate-logger example spec.
 *
 * Sprint 3 only — Sprint 9 swaps mocks for live Concept2 data through the
 * connector_accounts table. Keep the shape minimal and realistic.
 */
export const STROKE_RATE_LOGGER_DATA: ResolvedBindings = {
  rate_history: [
    { date: 'Apr 28', rate: 30 },
    { date: 'Apr 29', rate: 31 },
    { date: 'Apr 30', rate: 32 },
    { date: 'May 1', rate: 31 },
    { date: 'May 2', rate: 33 },
    { date: 'May 3', rate: 32 },
    { date: 'May 4', rate: 34 },
  ],
}
