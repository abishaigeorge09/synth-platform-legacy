import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

/**
 * Integer counter that ticks 0 → target when scrolled into view.
 * Uses requestAnimationFrame + an ease-out curve, and *snaps to
 * integers* every frame (no decimals flicker by) — matches the
 * XENKRYPT spec: `snap: { val: 1 }, ease: 'power2.out'`.
 *
 * Renders an inline `<span>` so it slots into any headline-style
 * stat block. Numbers > 999 use Intl.NumberFormat for thousands
 * separators (`1,000`, `12,500`).
 *
 * If `prefers-reduced-motion`, the final value renders immediately.
 */

export function CountUp({
  to,
  duration = 1.4,
  prefix = '',
  suffix = '',
  className,
  style,
}: {
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reducedMotion = useReducedMotion()
  const [val, setVal] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Reduced-motion users don't animate — the final value is rendered
    // directly via `displayVal` below, so the effect just bails out
    // without touching state (avoids set-state-in-effect lint rule).
    if (reducedMotion || !inView) return

    const start = performance.now()
    const ms = duration * 1000

    function tick(t: number) {
      const elapsed = t - start
      const p = Math.min(1, elapsed / ms)
      // ease-out cubic — same shape as GSAP's power2.out
      const eased = 1 - Math.pow(1 - p, 3)
      const current = Math.round(to * eased)
      setVal(current)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [inView, to, duration, reducedMotion])

  // When the user has reduced motion on, the animation is skipped
  // entirely — render the target value directly. Otherwise render the
  // animated `val` from the RAF loop.
  const displayVal = reducedMotion ? to : val
  const formatted = displayVal.toLocaleString('en-US')

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums', ...style }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
