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

/**
 * Light auth surface — the professional redesign (Framer-style: light form
 * panel beside an image-grid carousel). The dark AUTH_TOKENS above are kept for
 * any other consumer; the auth screens read AUTH_LIGHT.
 */
export const AUTH_LIGHT = {
  /** Page + form-panel canvas. */
  BG: '#FFFFFF',
  /** A hair off-white for insets / hovered rows. */
  SUNK: '#F7F7F8',
  INK: '#0A0A0A',
  MUTED: '#52525B',
  DIM: '#8A8A94',
  HAIR: '#E6E6EA',
  FAINT: 'rgba(0,0,0,0.05)',
  /** Accent fill. */
  GREEN: '#10B981',
  /** Accent for text/borders on white (darker for AA contrast). */
  GREEN_DEEP: '#059669',
  GREEN_WASH: 'rgba(16,185,129,0.08)',
  DANGER: '#DC2626',
  DANGER_WASH: 'rgba(220,38,38,0.06)',
  SERIF,
  MONO,
  BODY,
} as const
