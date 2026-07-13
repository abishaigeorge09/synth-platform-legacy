import { useEffect } from 'react'
import { useBehavioralStore } from './useBehavioralStore'
import { PRCelebration } from './PRCelebration'
import { WeeklyDigestModal } from './WeeklyDigestModal'
import { BehavioralDevPanel } from './DevPanel'
import { DEMO_ATHLETE_PROFILE } from '../data/demoAthleteData'

const DIGEST_LAST_OPENED_KEY = 'synth:athlete:digestLastOpened'

/** Mounts PR celebration overlay, weekly digest modal, and dev-only test panel.
 * Lives at the athlete-layout level so behavioral overlays surface from any
 * athlete route (Today, Progress, Record, etc.). Coach surfaces never mount
 * this. */
export function BehavioralSurface() {
  const openDigest = useBehavioralStore((s) => s.openDigest)
  const digestOpen = useBehavioralStore((s) => s.digestOpen)

  // Auto-open weekly digest on Sunday after 6pm (or first visit after a missed
  // Sunday). Stores last-opened week key in localStorage so we don't loop.
  useEffect(() => {
    if (digestOpen) return
    try {
      const now = new Date()
      const sunday6pm = lastSundayAt6pm(now)
      if (now.getTime() < sunday6pm.getTime()) return
      const weekKey = sunday6pm.toISOString().slice(0, 10)
      const seen = localStorage.getItem(DIGEST_LAST_OPENED_KEY)
      if (seen === weekKey) return
      localStorage.setItem(DIGEST_LAST_OPENED_KEY, weekKey)
      openDigest()
    } catch {
      // ignore — localStorage may be unavailable in some browsing modes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <PRCelebration athleteName={DEMO_ATHLETE_PROFILE.name} />
      <WeeklyDigestModal athleteName={DEMO_ATHLETE_PROFILE.name} />
      <BehavioralDevPanel />
    </>
  )
}

function lastSundayAt6pm(now: Date): Date {
  const d = new Date(now)
  const dayOfWeek = d.getDay() // 0 = Sunday
  const daysSinceSunday = dayOfWeek
  d.setDate(d.getDate() - daysSinceSunday)
  d.setHours(18, 0, 0, 0)
  return d
}
