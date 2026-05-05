import type { ResolvedBindings } from '../resolver'

/**
 * Sprint 5.6 — empty `laps` array so user-added rows from the Lap
 * button show up. The button renderer dispatches `append_row` against
 * this target when the spec's button.action.payload.append_to === 'laps'.
 */
export const LAP_COUNTER_DATA: ResolvedBindings = {
  laps: [],
}
