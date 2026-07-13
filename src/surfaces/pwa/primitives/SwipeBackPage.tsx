import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, type PanInfo } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Optional explicit target. If omitted, falls back to navigate(-1). */
  to?: string
  /** Distance in px to trigger back navigation. Default 80. */
  threshold?: number
}

/**
 * Wraps a page so the user can swipe rightward (drag from anywhere) to
 * navigate back. Vertical scroll inside the page still works because we
 * use dragDirectionLock + touchAction: pan-y.
 */
export function SwipeBackPage({ children, to, threshold = 80 }: Props) {
  const navigate = useNavigate()
  const x = useMotionValue(0)

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > threshold || info.velocity.x > 500) {
      if (to) navigate(to)
      else navigate(-1)
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.4 }}
      dragDirectionLock
      onDragEnd={onDragEnd}
      style={{ x, touchAction: 'pan-y' }}
      // min-h-0 keeps the flex chain honest: without it, child
      // overflow-y-auto containers grow to fit content (the AI
      // thread's long table) instead of clipping + scrolling
      // internally, which leaves the parent header scrolling out
      // of view with the page.
      className="flex min-h-0 flex-1 flex-col"
    >
      {children}
    </motion.div>
  )
}
