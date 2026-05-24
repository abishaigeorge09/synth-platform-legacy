import { motion, useReducedMotion } from 'framer-motion'
import type { ElementType, CSSProperties } from 'react'

/**
 * Cinematic word-by-word reveal — each word animates from below the
 * baseline with a clip mask above. Used to elevate the few headlines
 * that anchor a page (Hero, footer "start free", etc.) — applied
 * selectively, not everywhere.
 *
 * Mechanics: every word becomes its own <motion.span> with display:
 * inline-block, wrapped in a per-line span with overflow:hidden so
 * the y-shift reads as a clip from below. Stagger across all words
 * in all lines (continuous, not per-line), with the easing curve
 * matching XENKRYPT's "0.7, 0, 0.3, 1" headline easing.
 *
 * Reduced-motion fallback: renders plain text with no animation.
 *
 * Two ways to pass content:
 *   <WordReveal text="Unlock every signal." as="h1" />
 *   <WordReveal lines={['Unlock every signal.', 'Push past every limit.']} as="h1" />
 *
 * For headlines that contain inline highlights (e.g. <KO>knockouts</KO>),
 * skip this primitive — the existing motion patterns already work.
 */

type WordRevealProps = {
  /** Single-line variant: text is split by spaces into words. */
  text?: string
  /** Multi-line variant: each entry is split by spaces; lines stack
   *  with `block` display so they break independently. */
  lines?: string[]
  /** Element type for the outer wrapper. Defaults to span. */
  as?: ElementType
  /** Animation delay (s) before the first word starts. */
  delay?: number
  /** Per-word stagger (s). XENKRYPT-feel default of 0.08. */
  stagger?: number
  /** Per-word duration (s). */
  duration?: number
  /** Fire on scroll-in (default) or immediately on mount. Above-the-fold
   *  headlines should pass viewport={false}. */
  viewport?: boolean
  /** Only run the reveal once per page (default true). */
  once?: boolean
  /** Extra space between consecutive lines (when `lines` is used).
   *  e.g. `'0.3em'`, `'12px'`, or a number (px). */
  lineGap?: string | number
  /** Pass through to the outer element. */
  className?: string
  style?: CSSProperties
}

const EASE_REVEAL = [0.7, 0, 0.3, 1] as const

export function WordReveal({
  text,
  lines,
  as: Comp = 'span' as ElementType,
  delay = 0,
  stagger = 0.08,
  duration = 0.7,
  viewport = true,
  once = true,
  lineGap,
  className,
  style,
}: WordRevealProps) {
  const reducedMotion = useReducedMotion()

  const normalized: string[][] = lines
    ? lines.map((l) => l.split(' '))
    : text
      ? [text.split(' ')]
      : [[]]

  if (reducedMotion) {
    return (
      <Comp className={className} style={style}>
        {normalized.map((words, li) => (
          <span
            key={li}
            className="block"
            style={{ marginTop: li > 0 ? lineGap : undefined }}
          >
            {words.join(' ')}
          </span>
        ))}
      </Comp>
    )
  }

  // Continuous word index across lines so the cascade reads as one
  // motion, not three independent line reveals.
  let wordIdx = 0

  return (
    <Comp className={className} style={style}>
      {normalized.map((words, lineIdx) => (
        <span
          key={lineIdx}
          className="block"
          style={{
            overflow: 'hidden',
            marginTop: lineIdx > 0 ? lineGap : undefined,
          }}
        >
          {words.map((word, wIdx) => {
            const idx = wordIdx++
            const isLast = wIdx === words.length - 1
            const motionProps = viewport
              ? {
                  initial: 'hidden',
                  whileInView: 'visible',
                  viewport: { once, amount: 0.3 },
                }
              : { initial: 'hidden', animate: 'visible' }

            return (
              <motion.span
                key={`${lineIdx}-${wIdx}`}
                {...motionProps}
                variants={{
                  hidden: { y: '110%', opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
                transition={{
                  duration,
                  delay: delay + idx * stagger,
                  ease: EASE_REVEAL,
                }}
                className="inline-block"
                style={{
                  // Word spacing without the natural space character
                  // (which is collapsed when each word becomes its own
                  // inline-block).
                  marginRight: isLast ? 0 : '0.25em',
                  // Match the parent's tracking instead of inheriting,
                  // since inline-block can break tracking inheritance
                  // in some browsers.
                  letterSpacing: 'inherit',
                }}
              >
                {word}
              </motion.span>
            )
          })}
        </span>
      ))}
    </Comp>
  )
}
