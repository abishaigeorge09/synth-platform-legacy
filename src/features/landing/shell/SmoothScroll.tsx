import { useEffect } from 'react'
import { useReducedMotion } from 'framer-motion'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * Marketing-surface smooth scroll. Mounts once at the top of <PageShell />
 * and gives every landing route an inertial / momentum-feel wheel + touch
 * scroll without affecting the app surfaces (which mount their own layouts
 * outside PageShell and so never see this provider).
 *
 * Config is tuned to match the XENKRYPT scroll feel — long duration with
 * an expo-out easing so the page coasts instead of stopping dead. Wheel
 * smoothing is on; touch gets a slight multiplier so flick gestures still
 * feel responsive (pure smooth-touch can feel sluggish on iOS).
 *
 * Disabled entirely when the user has prefers-reduced-motion. In that case
 * the browser's native scroll runs as it always did — no virtualization,
 * no momentum, no hijacking.
 *
 * Renders nothing. The Lenis instance attaches itself to documentElement
 * and adds the `lenis lenis-smooth` classes (whose styles ship from the
 * imported lenis.css). Cleans up on unmount.
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
    })

    let rafId = 0
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [reducedMotion])

  return null
}
