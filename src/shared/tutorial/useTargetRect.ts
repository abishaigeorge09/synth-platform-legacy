import { useEffect, useState } from 'react'

export type Rect = { top: number; left: number; width: number; height: number }

/**
 * Find an element by `[data-tour="<anchor>"]` and return its viewport rect.
 * Re-measures on resize, scroll (capture phase, so scroll containers are caught),
 * and on a `ResizeObserver` of the target itself. Returns `null` if not in DOM.
 */
export function useTargetRect(anchor: string | null): { rect: Rect | null; el: HTMLElement | null } {
  const [rect, setRect] = useState<Rect | null>(null)
  const [el, setEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!anchor) {
      setRect(null)
      setEl(null)
      return
    }

    let raf = 0
    let target: HTMLElement | null = null
    let resizeObs: ResizeObserver | null = null

    const measure = () => {
      if (!target) return
      const r = target.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }

    const find = () => {
      target = document.querySelector<HTMLElement>(`[data-tour="${anchor}"]`)
      if (target) {
        setEl(target)
        measure()
        if ('ResizeObserver' in window) {
          resizeObs = new ResizeObserver(() => {
            // Defer to next frame — avoids layout thrash during animation.
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(measure)
          })
          resizeObs.observe(target)
        }
      } else {
        // Element not in DOM yet — retry once on next paint. After a few
        // failed attempts give up (the engine treats null rect as "lost").
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(find)
      }
    }

    find()

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }

    // Capture phase so we catch scroll on inner scroll containers too.
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
      resizeObs?.disconnect()
    }
  }, [anchor])

  return { rect, el }
}
