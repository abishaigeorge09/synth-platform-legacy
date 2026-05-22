import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { PasscodeInput } from './PasscodeInput'

/**
 * Global access gate. Wraps the entire app (landing + /app/*).
 *
 * Behaviour:
 *   - Every fresh page load that targets a protected route shows the
 *     passcode overlay, regardless of viewport. Both the website
 *     (desktop) and the installed app (mobile / PWA) gate identically.
 *   - Children stay mounted behind a backdrop-blur scrim. Once the code
 *     lands, the overlay fades out and the children re-receive pointer
 *     events without remounting.
 *   - Unlock state is intentionally **in-memory only**. We do NOT write
 *     to localStorage / sessionStorage, so closing the tab and coming
 *     back means re-entering the passcode. SPA navigation within a
 *     protected surface (e.g. /coach/dashboard → /coach/athletes) does
 *     not re-prompt because the unlocked state lives in this component.
 *
 * This is a SOFT gate. The passcode lives in the bundle; anyone with
 * DevTools can grep it. The point is to keep the live preview behind
 * one extra step for casual visitors, not to harden against motivated
 * inspection. Real auth still happens via Supabase downstream.
 */

const PASSCODE = '010619'

/**
 * Route prefixes that require the passcode. Anything outside this list
 * (the marketing landing, /product-demo, sign-in / sign-up / invite
 * flows) renders without the gate. Order doesn't matter; we match
 * either exact equality or `prefix + '/'` so a path of `/app/coach`
 * counts as protected via the `/app` prefix without `/applications`
 * or anything else accidentally matching.
 */
const PROTECTED_PREFIXES = ['/coach', '/athlete', '/app'] as const

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )
}

export function AccessGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  // Always start locked. No persistence — closing the tab and coming
  // back re-prompts. The state lives only as long as this component
  // is mounted, which means SPA navigation between protected routes
  // doesn't re-prompt (component stays mounted), but a hard reload or
  // a fresh visit does.
  const [unlocked, setUnlocked] = useState<boolean>(false)
  const [hasError, setHasError] = useState(false)
  const [verifying, setVerifying] = useState(false)
  // Each wrong attempt bumps this. The PasscodeInput receives it as
  // its key, so a wrong attempt remounts the input with fresh state +
  // re-runs autofocus. Cleaner than mid-component setState side
  // effects and lets the shake animation play to completion before
  // the cells reset.
  const [attemptId, setAttemptId] = useState(0)
  const reducedMotion = useReducedMotion()

  // Gate fires when:
  //   - The user hasn't unlocked yet this session.
  //   - The current path is one of the demo product surfaces
  //     (/coach, /athlete, /app — not the marketing landing).
  // Desktop and mobile gate identically. There used to be a viewport
  // pass-through that disabled the gate at ≥1024px; that's been
  // removed so the website and the app both ask for the passcode.
  const gateActive = !unlocked && isProtectedPath(pathname)

  // Lock body scroll only while the overlay is actually showing so a
  // long landing page can still pull-to-refresh on the public surfaces.
  useEffect(() => {
    if (!gateActive) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [gateActive])

  const onSubmit = (code: string) => {
    if (verifying) return
    if (code === PASSCODE) {
      // Tiny delay so the user sees the cells lock in green before the
      // overlay fades out. Feels intentional vs jarring.
      setVerifying(true)
      window.setTimeout(() => {
        setUnlocked(true)
      }, 280)
      return
    }
    // Wrong code: trigger the shake on the current input, then after
    // the animation completes (320ms), bump attemptId to remount with
    // a fresh blank set of cells + clear hasError. The remount also
    // re-fires the input's autofocus.
    setHasError(true)
    window.setTimeout(() => {
      setAttemptId((n) => n + 1)
      setHasError(false)
    }, 340)
  }

  return (
    <>
      {/* Children always render. While the gate is active we blur +
          dim them so the gate feels like an overlay on top of the
          real product, not a replacement for it. On public surfaces
          (or once unlocked) blur clears and children re-receive
          pointer events. */}
      <div
        aria-hidden={gateActive ? true : undefined}
        style={{
          filter: gateActive ? 'blur(18px) saturate(1.2) brightness(0.7)' : 'none',
          transition: 'filter 350ms ease',
          // Disable interaction with everything beneath while the
          // overlay is up, including focus traversal. Without this,
          // Tab from the passcode boxes can land in the underlying app.
          pointerEvents: gateActive ? 'none' : 'auto',
        }}
      >
        {children}
      </div>

      <AnimatePresence>
        {gateActive ? (
          <motion.div
            key="gate"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              // Layered scrim: deep cobalt at the back, a subtle radial
              // glow centered on the card. backdrop-filter on its own
              // is too plain; the gradient gives the overlay weight.
              background:
                'radial-gradient(ellipse at center, rgba(30, 38, 130, 0.55) 0%, rgba(8, 8, 40, 0.85) 60%, rgba(8, 8, 40, 0.95) 100%)',
              backdropFilter: 'blur(8px) saturate(1.1)',
              WebkitBackdropFilter: 'blur(8px) saturate(1.1)',
              // iOS safe areas — the card centers within the safe
              // viewport, but the scrim covers full bleed.
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)',
            }}
          >
            <GateCard
              onSubmit={onSubmit}
              hasError={hasError}
              attemptId={attemptId}
              verifying={verifying}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function GateCard({
  onSubmit,
  hasError,
  attemptId,
  verifying,
}: {
  onSubmit: (code: string) => void
  hasError: boolean
  attemptId: number
  verifying: boolean
}) {
  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
      className="mx-5 flex w-full max-w-[380px] flex-col items-center gap-10"
      style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}
    >
      <span
        className="text-[28px] font-bold leading-none tracking-[-0.02em]"
        style={{ color: '#FFFFFF' }}
      >
        synth
        <span style={{ color: '#10B981' }}>.</span>
      </span>

      <PasscodeInput
        // attemptId bumps after each wrong code → remount with fresh
        // blank cells + autofocus. Lets the shake animation play to
        // completion before the cells reset.
        key={attemptId}
        length={6}
        onSubmit={onSubmit}
        hasError={hasError}
        disabled={verifying}
      />

      <p
        className="min-h-[16px] text-center text-[11px] leading-[1.4]"
        aria-live="polite"
        style={{
          color: hasError ? 'rgba(239, 68, 68, 0.85)' : 'transparent',
          transition: 'color 200ms ease',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        }}
      >
        {hasError ? 'Wrong code' : '·'}
      </p>
    </motion.div>
  )
}
