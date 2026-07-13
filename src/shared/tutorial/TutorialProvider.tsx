import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTutorialStore } from '@shared/tutorial/useTutorialStore'
import { getTourForPath } from '@shared/tutorial/tours'
import { TutorialOverlay } from '@shared/tutorial/TutorialOverlay'

const AUTO_START_DELAY_MS = 350

/**
 * Watches the current route. If a tour is bound to it and the user hasn't
 * seen it yet, auto-starts after a small delay so entrance animations on the
 * page have time to settle and the anchor element is in the DOM.
 *
 * Mount once near the app root (we put it inside AppShell).
 */
export function TutorialProvider() {
  const { pathname } = useLocation()
  const start = useTutorialStore((s) => s.start)
  const seen = useTutorialStore((s) => s.seen)
  const activeTourId = useTutorialStore((s) => s.activeTourId)
  const abort = useTutorialStore((s) => s.abort)

  // If the user navigates while a tour is active, end it (graceful exit).
  useEffect(() => {
    if (!activeTourId) return
    return () => {
      // On unmount of this pathname effect (i.e. route change), abort.
      // The overlay will not have a target anyway.
      abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    const tour = getTourForPath(pathname)
    if (!tour || !tour.autoStart) return
    if (seen.has(tour.id)) return
    if (activeTourId) return
    const t = window.setTimeout(() => {
      start(tour.id)
    }, AUTO_START_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [pathname, seen, activeTourId, start])

  return <TutorialOverlay />
}
