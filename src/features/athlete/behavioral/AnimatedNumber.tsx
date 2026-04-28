import { useEffect, useRef, useState } from 'react'

type Props = {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
  style?: React.CSSProperties
}

/** Animated count-up. Re-runs whenever value changes. */
export function AnimatedNumber({ value, duration = 600, format, className, style }: Props) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    fromRef.current = display
    startRef.current = null
    const target = value

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(1, elapsed / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      const current = fromRef.current + (target - fromRef.current) * eased
      setDisplay(current)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  const formatted = format ? format(display) : Math.round(display).toString()
  return (
    <span className={className} style={style}>
      {formatted}
    </span>
  )
}
