import { featureFlags } from '@lib/featureFlags'

const levels = { debug: 0, info: 1, warn: 2, error: 3 }
const min = levels[featureFlags.logLevel] ?? 1

export const log = {
  debug: (...args: unknown[]) => {
    if (min <= 0) console.debug('[synth]', ...args)
  },
  info: (...args: unknown[]) => {
    if (min <= 1) console.info('[synth]', ...args)
  },
  warn: (...args: unknown[]) => {
    if (min <= 2) console.warn('[synth]', ...args)
  },
  error: (...args: unknown[]) => {
    console.error('[synth]', ...args)
  },
}
