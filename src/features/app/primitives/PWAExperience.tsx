import { useEffect, useState } from 'react'
import { useInstallPrompt } from '../../landing/useInstallPrompt'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { InstallNudgeBanner } from './InstallNudgeBanner'
import { InstallSheet, type InstallVariant } from './InstallSheet'
import { SwUpdateToast } from './SwUpdateToast'

const DISMISS_KEY = 'synth:app:installNudgeDismissedAt'
const COOLDOWN_DAYS = 7
const SHOW_DELAY_MS = 4000

/**
 * Single mount point for PWA-related UX:
 *  - Install nudge banner (top of viewport, dismissible).
 *  - Install instructions sheet (Android native prompt vs iOS walkthrough).
 *  - Service-worker update toast.
 *
 * Lives in AppShell so it sits above every /app/* route.
 */
export function PWAExperience() {
  const { canInstall, installed, isIos, trigger } = useInstallPrompt()
  // `installed` already absorbs the standalone display-mode check — the
  // hook folds it in on line 56 of useInstallPrompt.ts.
  const isReady = useAppAuthStore((s) => s.isReady)
  const [showBanner, setShowBanner] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  // Decide whether to surface the banner. Phone-shaped viewport OR iOS
  // Safari, not already installed, not within the 7-day cool-down. 4s
  // delay so we don't ambush the welcome animation.
  useEffect(() => {
    if (!isReady) return
    if (installed) return

    const phoneShape =
      typeof window !== 'undefined' &&
      (window.matchMedia('(max-width: 480px)').matches || isIos)
    if (!phoneShape) return

    if (typeof window !== 'undefined') {
      const dismissedAtRaw = window.localStorage.getItem(DISMISS_KEY)
      const dismissedAt = dismissedAtRaw ? Number(dismissedAtRaw) : 0
      const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000
      if (Number.isFinite(dismissedAt) && Date.now() - dismissedAt < cooldownMs) return
    }

    const t = window.setTimeout(() => setShowBanner(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [isReady, installed, isIos])

  // Hide the banner + sheet the moment the install completes, regardless
  // of route.
  useEffect(() => {
    if (installed) {
      setShowBanner(false)
      setSheetOpen(false)
    }
  }, [installed])

  const onInstall = async () => {
    if (canInstall && !isIos) {
      // Try to fire the native browser prompt directly. If it succeeds the
      // appinstalled event will flip `installed` and clear the banner.
      setBusy(true)
      try {
        await trigger()
      } finally {
        setBusy(false)
      }
      return
    }
    // iOS or no deferred prompt available — open the instructions sheet.
    setSheetOpen(true)
  }

  const onDismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, Date.now().toString())
    }
    setShowBanner(false)
  }

  const variant: InstallVariant = canInstall && !isIos ? 'android' : isIos ? 'ios' : 'fallback'

  return (
    <>
      <InstallNudgeBanner
        visible={showBanner && !installed}
        onInstall={onInstall}
        onDismiss={onDismiss}
      />
      <InstallSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        variant={variant}
        busy={busy}
        onInstall={async () => {
          setBusy(true)
          try {
            await trigger()
            setSheetOpen(false)
          } finally {
            setBusy(false)
          }
        }}
      />
      <SwUpdateToast />
    </>
  )
}
