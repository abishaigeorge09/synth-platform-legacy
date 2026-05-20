/** Auth-surface design tokens — split out of authShared.tsx so the
 *  shared component file only exports components (React Fast Refresh
 *  requirement). */

const BG    = '#050505'
const FG    = '#fafafa'
const MUTED = '#a1a1aa'
const DIM   = '#71717a'
const HAIR  = '#27272a'
const FAINT = 'rgba(255,255,255,0.08)'
const GREEN = '#10B981'

const SERIF = '"Fraunces", "Iowan Old Style", Georgia, serif'
const MONO  = '"JetBrains Mono", ui-monospace, monospace'
const BODY  = '"Geist", "Inter", system-ui, -apple-system, sans-serif'

export const AUTH_TOKENS = { BG, FG, MUTED, DIM, HAIR, FAINT, GREEN, SERIF, MONO, BODY }
