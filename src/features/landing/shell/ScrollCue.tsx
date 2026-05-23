import { motion, useReducedMotion } from 'framer-motion'
import { MONO } from './tokens'

/**
 * The "scroll to discover" cue — small mono label + downward chevron
 * with an infinite y-bounce. Sits anchored to the bottom corner of
 * a hero so the next page-fold reads as a destination. Modeled on
 * xenkrypt.com's "SCROLL TO DISCOVER ↓" affordance.
 *
 * Reduced-motion: chevron stops bouncing, label stays. The intent
 * (here's where to scroll) is preserved without the motion.
 */

export function ScrollCue({
  label = '// scroll',
  className,
}: {
  label?: string
  className?: string
}) {
  const reducedMotion = useReducedMotion()
  return (
    <div
      className={`pointer-events-none flex flex-col items-center gap-2 ${className ?? ''}`}
      aria-hidden
    >
      <span
        className="text-[10px] uppercase tracking-[0.32em]"
        style={{ fontFamily: MONO, color: 'rgba(255,255,255,0.55)' }}
      >
        {label}
      </span>
      <motion.svg
        width="14"
        height="20"
        viewBox="0 0 14 20"
        fill="none"
        animate={reducedMotion ? undefined : { y: [0, 4, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        <path
          d="M7 1 L7 17 M2 12 L7 17 L12 12"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </div>
  )
}
