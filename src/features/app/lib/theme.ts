import { THEME } from '../../../lib/theme'

/**
 * SYNTH — token set for the post-auth /app surfaces (coach + athlete).
 * Translated from GO Club Plan/Steps refs. Cobalt canvas IS the brand.
 *
 * APP_THEME (below) is retained for the onboarding flow only — onboarding
 * follows Cal AI's light-canvas inheritance.
 */
export const SYNTH = {
  // Canvas — full-bleed brand wash, top-to-bottom gradient
  canvasTop: '#2E37F2',
  canvasBottom: '#1F26C9',
  canvasInk: '#0B0E2E', // dark navy for AI/loading surfaces only

  // Solid candy cards
  cardYellow: '#F5EE3D',
  cardMint: '#B4E8C7',
  cardSky: '#A8DBF5',
  cardPink: '#F5C9D0',
  cardCream: '#FFF6B8',
  cardLemon: '#FCFB7A',

  // Glass — for floating controls only (one element per screen)
  glass: 'rgba(255,255,255,0.14)',
  glassActive: 'rgba(255,255,255,0.22)',
  glassBorder: 'rgba(255,255,255,0.28)',
  glassInset: 'rgba(255,255,255,0.35)',
  glassBlur: 24,
  glassSaturate: 140,

  // Inline translucent cards — embedded in the canvas, no backdrop-filter
  inlineCard: 'rgba(255,255,255,0.10)',
  inlineCardBorder: 'rgba(255,255,255,0.16)',

  // Detail sheet — paper-white pinned bottom on chart drill-ins
  sheet: '#FFFFFF',
  sheetMuted: '#F4F4F8',

  // Ink
  ink: '#0A0A12',
  inkMuted: '#7A7A8C',
  inkOnBrand: '#FFFFFF',
  inkOnBrandMuted: 'rgba(255,255,255,0.62)',
  inkOnBrandFaint: 'rgba(255,255,255,0.42)',

  // Signal accents (semantic, not chrome)
  accentAmber: '#F39E5C',
  accentRed: '#E64A3C',
  accentBlack: '#0A0A12',
  accentEmerald: '#10B981',

  // Provenance — synth's signature element
  provenanceOnBrand: 'rgba(255,255,255,0.55)',
  provenanceOnSheet: '#9A9AAB',

  // Type
  font: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',

  // Shadows
  shadow: {
    card: '0 8px 24px rgba(8,8,40,0.18)',
    cardLifted: '0 16px 40px rgba(8,8,40,0.28)',
    glass: '0 12px 32px rgba(8,8,40,0.25), 0 2px 4px rgba(8,8,40,0.18)',
    sheet: '0 -12px 40px rgba(8,8,40,0.25)',
    actionCircle: '0 8px 20px rgba(8,8,40,0.35)',
  },

  // Radii
  radius: {
    card: 28,
    sheet: 24,
    capsule: 9999,
    button: 20,
    chip: 14,
  },
} as const

export const APP_THEME = {
  canvas: '#FAFAF9',
  surface: '#FFFFFF',
  surroundLight: '#F4F4F5',
  brand: THEME.primary,
  brandDeep: THEME.primaryDark,
  brandWash: THEME.primaryLight,
  brandWashSoft: '#ECFDF5',
  text: '#18181B',
  textMuted: '#52525B',
  textFaint: '#A1A1AA',
  divider: '#E4E4E7',
  dividerStrong: '#D4D4D8',
  dark: THEME.darkDeep,
  fontMono: THEME.fontMono,
  fontSerif: THEME.fontSerif,
  fontSans: THEME.fontSans,
  column: 390,
} as const

export const METRIC_COLOR = {
  ergPerformance: '#059669',
  recovery: '#F59E0B',
  streak: '#F97316',
  sleep: '#6366F1',
  hr: '#EF4444',
  volume: '#3B82F6',
  calories: '#06B6D4',
  lineup: '#8B5CF6',
} as const

export type MetricKey = keyof typeof METRIC_COLOR
