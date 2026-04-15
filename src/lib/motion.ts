export const TRANSITIONS = {
  page: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  /** Slightly longer crossfade for paired slides (e.g. setup → workflow). */
  pageCrossfade: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const },
  spring: { type: 'spring', stiffness: 200, damping: 25 },
  springSnappy: { type: 'spring', stiffness: 400, damping: 30 },
  smooth: { duration: 0.4, ease: 'easeOut' as const },
  fast: { duration: 0.15, ease: 'easeOut' as const },
} as const

export const STAGGER = {
  cards: 0.08,
  highlights: 0.1,
  pixels: 0.03,
  bars: 0.15,
  letters: 0.08,
} as const

export const VARIANTS = {
  fadeUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  highlightBar: {
    initial: { scaleX: 0, transformOrigin: 'left' as const },
    animate: { scaleX: 1 },
  },
} as const

