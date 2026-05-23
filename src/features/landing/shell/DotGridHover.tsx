import { useEffect, useRef } from 'react'

/**
 * Cursor-following dot-grid hover canvas. Sits as an absolute overlay
 * inside any card (parent must be `position: relative`); the canvas
 * fills the parent via inset-0 and never receives pointer events.
 *
 * Behaviour:
 *   - Draws a uniform dot lattice across the canvas at the dim base
 *     color (subtle, doesn't fight the card content).
 *   - When the cursor enters the parent card, dots within `radius`
 *     pixels of the cursor brighten toward the accent color via a
 *     falloff. As the cursor moves, the highlight follows.
 *   - When the cursor leaves, the highlight fades back to base.
 *
 * Performance:
 *   - Only redraws when the cursor is inside the card (RAF loop runs
 *     on enter, stops on leave).
 *   - Pauses entirely when the canvas is offscreen (IntersectionObserver).
 *   - Listens to ResizeObserver so dot density stays consistent if the
 *     parent changes size (responsive layouts).
 *
 * Inspired by xenkrypt.com's card-hover canvas — the single most
 * distinctive piece of their feel.
 */

export function DotGridHover({
  spacing = 14,
  dotRadius = 1.0,
  hoverRadius = 80,
  baseAlpha = 0.06,
  hoverAlpha = 0.42,
  baseColor = '255, 255, 255',
  hoverColor = '255, 255, 255',
}: {
  /** Distance between dots, in CSS px. */
  spacing?: number
  /** Dot radius, in CSS px. */
  dotRadius?: number
  /** Radius of the cursor-following highlight halo. */
  hoverRadius?: number
  /** Base dot alpha (idle). */
  baseAlpha?: number
  /** Peak dot alpha at cursor center. */
  hoverAlpha?: number
  /** Comma-separated rgb triplet for base dots, e.g. '255, 255, 255'. */
  baseColor?: string
  /** Comma-separated rgb triplet for cursor-hovered dots. */
  hoverColor?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  })
  const rafRef = useRef<number | null>(null)
  const visibleRef = useRef(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))

    function resize() {
      const rect = parent!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    function draw() {
      if (!visibleRef.current) return
      ctx!.clearRect(0, 0, width, height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const active = mouseRef.current.active
      const hr2 = hoverRadius * hoverRadius

      // Start at half-spacing so dots aren't flush with the card edge.
      const startX = spacing / 2
      const startY = spacing / 2

      for (let x = startX; x < width; x += spacing) {
        for (let y = startY; y < height; y += spacing) {
          let alpha = baseAlpha
          let color = baseColor

          if (active) {
            const dx = x - mx
            const dy = y - my
            const d2 = dx * dx + dy * dy
            if (d2 < hr2) {
              const t = 1 - d2 / hr2
              alpha = baseAlpha + (hoverAlpha - baseAlpha) * t * t
              color = hoverColor
            }
          }

          ctx!.fillStyle = `rgba(${color}, ${alpha})`
          ctx!.beginPath()
          ctx!.arc(x, y, dotRadius, 0, Math.PI * 2)
          ctx!.fill()
        }
      }
    }

    function tick() {
      draw()
      if (mouseRef.current.active) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
      }
    }

    function onMove(e: MouseEvent) {
      const rect = parent!.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      if (!mouseRef.current.active) {
        mouseRef.current.active = true
        if (rafRef.current == null) {
          rafRef.current = requestAnimationFrame(tick)
        }
      }
    }

    function onLeave() {
      mouseRef.current.active = false
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
      // One more draw to clear the highlight back to base.
      draw()
    }

    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)

    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visibleRef.current = e.isIntersecting
          if (visibleRef.current) draw()
        }
      },
      { rootMargin: '100px' },
    )
    io.observe(parent)

    resize()

    return () => {
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
      ro.disconnect()
      io.disconnect()
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [spacing, dotRadius, hoverRadius, baseAlpha, hoverAlpha, baseColor, hoverColor])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
