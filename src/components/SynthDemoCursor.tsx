import { motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'
import { THEME } from '../lib/theme'

/**
 * Decorative pointer that eases toward the Synth agent control (for solution story beats).
 */
export function SynthDemoCursor({
  agentRef,
  rootRef,
}: {
  agentRef: RefObject<HTMLButtonElement | null>
  rootRef: RefObject<HTMLElement | null>
}) {
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const root = rootRef.current
      const agent = agentRef.current
      if (!root || !agent) return
      const rr = root.getBoundingClientRect()
      const ar = agent.getBoundingClientRect()
      setTarget({
        x: ((ar.left + ar.width / 2 - rr.left) / rr.width) * 100,
        y: ((ar.top + ar.height / 2 - rr.top) / rr.height) * 100,
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (rootRef.current) ro.observe(rootRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [agentRef, rootRef])

  if (target == null) return null

  return (
    <motion.div
      className="pointer-events-none absolute z-[60]"
      initial={false}
      animate={{
        left: ['88%', `${target.x}%`, `${target.x}%`, '88%'],
        top: ['12%', `${target.y}%`, `${target.y}%`, '12%'],
      }}
      transition={{
        duration: 5,
        times: [0, 0.35, 0.72, 1],
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{ marginLeft: -2, marginTop: -2 }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M5 3v14l4.5-4.5L13 20l2-1-3.2-7.2L17 11.5 5 3z"
          fill="#18181B"
          stroke="#fff"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
      <motion.span
        className="absolute left-4 top-5 h-2 w-2 rounded-full border-2 border-white"
        style={{ background: THEME.primary }}
        animate={{ scale: [1, 1.35, 1], opacity: [1, 0.65, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

/**
 * Cursor hops between two nav targets (e.g. “Custom tools” group → “Lineups”).
 */
export function SynthNavFlowCursor({
  rootRef,
  firstRef,
  secondRef,
}: {
  rootRef: RefObject<HTMLElement | null>
  firstRef: RefObject<HTMLElement | null>
  secondRef: RefObject<HTMLElement | null>
}) {
  const [step, setStep] = useState(0)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const t = window.setInterval(() => setStep((s) => (s + 1) % 2), 2600)
    return () => window.clearInterval(t)
  }, [])

  useLayoutEffect(() => {
    const measure = () => {
      const root = rootRef.current
      const el = step === 0 ? firstRef.current : secondRef.current
      if (!root || !el) return
      const rr = root.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      setPos({
        x: ((er.left + er.width / 2 - rr.left) / rr.width) * 100,
        y: ((er.top + er.height / 2 - rr.top) / rr.height) * 100,
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (rootRef.current) ro.observe(rootRef.current)
    const a = firstRef.current
    const b = secondRef.current
    if (a) ro.observe(a)
    if (b) ro.observe(b)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [step, rootRef, firstRef, secondRef])

  if (pos == null) return null

  return (
    <motion.div
      className="pointer-events-none absolute z-[60]"
      initial={false}
      animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      transition={{ duration: 0.75, ease: 'easeInOut' }}
      style={{ marginLeft: -3, marginTop: -3 }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M5 3v14l4.5-4.5L13 20l2-1-3.2-7.2L17 11.5 5 3z"
          fill="#18181B"
          stroke="#fff"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
      <motion.span
        className="absolute left-3 top-4 h-2 w-2 rounded-full border-2 border-white"
        style={{ background: THEME.primary }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
