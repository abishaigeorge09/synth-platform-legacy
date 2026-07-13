# synth. — Splash → Onboarding → Coach App Reference

The complete entry flow for the mobile app: splash screen, welcome/login, "Continue with Google" / demo, role pick, every onboarding step, and the redirect into the coach app.

All files under `src/features/app/`. Theme tokens (`SYNTH`) are in `MOBILE-COACH-UI-REFERENCE.md`.

---

## The flow, end to end

```
/app  (AppShell)
  └─ splash (AppShellSplash) while auth hydrates
  └─ AppRoleGate (index) decides where to send you:
        no user      → /app/welcome
        no role      → /app/onboarding/role
        role=coach   → /app/coach/home
        role=athlete → /app/athlete/home

/app/welcome  (WelcomePage)
  ├─ "Continue with Google" → /app/coming-soon   (placeholder; real OAuth not wired)
  ├─ "Continue with email"  → /app/coming-soon
  └─ "Continue as demo"     → setDemoUser() → /app  (re-runs AppRoleGate → onboarding/role)

/app/coming-soon  (ComingSoonPage) — email interest form + "Try the demo"

/app/onboarding/*  (wrapped in OnboardingGuard — redirects out if already done)
  role ──┬─ COACH:   sport → team → capabilities → sources/coach ┐
         └─ ATHLETE: invite-code → sources/athlete ──────────────┤
                                                                  ▼
                                    trust → scanning → reveal → tour
                                                                  │
                            tour finish: markOnboardingDone() + startTour()
                                                                  ▼
                              /app/coach/home   or   /app/athlete/home
```

**Coach path is 5 numbered steps** (role, sport, team, capabilities, connectors) then 4 shared steps (trust, scanning, reveal, tour). **Athlete path is 3 numbered steps** (invite-code, connectors) then the same shared tail.

---

## Route wiring — `src/app/routes.tsx`

```tsx
import { AppShell } from '../features/app/AppShell'
import { AppRoleGate } from '../features/app/AppRoleGate'
import { WelcomePage as AppWelcomePage } from '../features/app/onboarding/WelcomePage'
import { RolePickPage as AppOnboardingRolePage } from '../features/app/onboarding/RolePickPage'
import { SportPickPage as AppOnboardingSportPage } from '../features/app/onboarding/SportPickPage'
import { CoachTeamSetupPage as AppOnboardingTeamPage } from '../features/app/onboarding/CoachTeamSetupPage'
import { CoachCapabilitiesPage as AppOnboardingCapabilitiesPage } from '../features/app/onboarding/CoachCapabilitiesPage'
import { CoachConnectorsPage as AppOnboardingCoachConnectorsPage } from '../features/app/onboarding/CoachConnectorsPage'
import { AthleteInviteCodePage as AppOnboardingInviteCodePage } from '../features/app/onboarding/AthleteInviteCodePage'
import { AthleteConnectorsPage as AppOnboardingAthleteConnectorsPage } from '../features/app/onboarding/AthleteConnectorsPage'
import { TrustCardPage as AppOnboardingTrustPage } from '../features/app/onboarding/TrustCardPage'
import { ScanningPage as AppOnboardingScanningPage } from '../features/app/onboarding/ScanningPage'
import { RevealPage as AppOnboardingRevealPage } from '../features/app/onboarding/RevealPage'
import { TourPage as AppOnboardingTourPage } from '../features/app/onboarding/TourPage'
import { ComingSoonPage as AppComingSoonPage } from '../features/app/onboarding/ComingSoonPage'
import { OnboardingGuard } from '../features/app/onboarding/OnboardingGuard'

// …in the route tree:
{
  path: '/app',
  element: (
    <ErrorBoundary label="App surface">
      <AppShell />
    </ErrorBoundary>
  ),
  children: [
    { index: true, element: <AppRoleGate /> },
    { path: 'welcome', element: withSuspense(<AppWelcomePage />, 'Welcome') },
    { path: 'coming-soon', element: <AppComingSoonPage /> },
    {
      element: <OnboardingGuard />,
      children: [
        { path: 'onboarding/role', element: withSuspense(<AppOnboardingRolePage />, 'Choose role') },
        { path: 'onboarding/sport', element: withSuspense(<AppOnboardingSportPage />, 'Choose sport') },
        { path: 'onboarding/team', element: withSuspense(<AppOnboardingTeamPage />, 'Team setup') },
        { path: 'onboarding/capabilities', element: withSuspense(<AppOnboardingCapabilitiesPage />, 'Capabilities') },
        { path: 'onboarding/sources/coach', element: withSuspense(<AppOnboardingCoachConnectorsPage />, 'Connect sources') },
        { path: 'onboarding/invite-code', element: withSuspense(<AppOnboardingInviteCodePage />, 'Invite code') },
        { path: 'onboarding/sources/athlete', element: withSuspense(<AppOnboardingAthleteConnectorsPage />, 'Connect your sources') },
        { path: 'onboarding/trust', element: withSuspense(<AppOnboardingTrustPage />, 'Privacy') },
        { path: 'onboarding/scanning', element: withSuspense(<AppOnboardingScanningPage />, 'Scanning') },
        { path: 'onboarding/reveal', element: withSuspense(<AppOnboardingRevealPage />, 'synth is ready') },
        { path: 'onboarding/tour', element: withSuspense(<AppOnboardingTourPage />, 'Tour') },
      ],
    },
    { path: 'coach', element: <AppCoachShell />, children: [ /* … coach app … */ ] },
    { path: 'athlete', element: <AppAthleteShell />, children: [ /* … athlete app … */ ] },
  ],
}
```

---

## 1. Splash + shell — `src/features/app/AppShell.tsx`

Root of `/app`. Calls `hydrate()` on mount; shows `AppShellSplash` until `isReady`, then renders the `<Outlet/>`.

```tsx
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppAuthStore } from './store/useAppAuthStore'
import { SYNTH } from './lib/theme'
import { TutorialProvider } from '../../shared/tutorial'
import { GuidedTourOrchestrator } from '../../shared/tutorial/GuidedTourOrchestrator'
import { useSessionsStore } from './data/useSessionsStore'
import { DesktopAppIntercept } from './desktopIntercept/DesktopAppIntercept'
import { useMediaQuery } from './desktopIntercept/useMediaQuery'
import { PWAExperience } from './primitives/PWAExperience'

const DISMISS_KEY = 'synth-desktop-intercept-dismissed'

export function AppShell() {
  const hydrate = useAppAuthStore((s) => s.hydrate)
  const isReady = useAppAuthStore((s) => s.isReady)
  const seedIfEmpty = useSessionsStore((s) => s.seedIfEmpty)
  const { pathname } = useLocation()

  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  })

  // Intercept only on the unauthenticated welcome surface (desktop visitors
  // landing on a shared demo link). Noise after login / mid-onboarding.
  const onWelcomeSurface = pathname === '/app' || pathname === '/app/' || pathname.startsWith('/app/welcome')
  const showIntercept = isDesktop && onWelcomeSurface && !dismissed

  const dismissIntercept = () => {
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* private mode */ }
    setDismissed(true)
  }

  useEffect(() => { void hydrate() }, [hydrate])
  useEffect(() => { seedIfEmpty() }, [seedIfEmpty])
  useEffect(() => {
    document.body.setAttribute('data-surface', 'app')
    return () => { document.body.removeAttribute('data-surface') }
  }, [])

  if (showIntercept) {
    return <DesktopAppIntercept onDismiss={dismissIntercept} />
  }

  return (
    <div className="app-shell-root">
      <div className="app-shell-frame">
        {isReady ? <Outlet /> : <AppShellSplash />}
      </div>
      {isReady && <TutorialProvider />}
      {isReady && <GuidedTourOrchestrator />}
      <PWAExperience />
    </div>
  )
}

/** Splash — cobalt canvas, centered synth wordmark with a blinking dot. */
function AppShellSplash() {
  return (
    <div className="flex flex-1 items-center justify-center"
      style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, fontFamily: SYNTH.font }}>
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-center gap-3">
        <span className="text-[44px] font-bold leading-none tracking-[-0.02em]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
          synth
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ color: SYNTH.accentEmerald, display: 'inline-block' }}>.</motion.span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
          Every signal · one platform
        </span>
      </motion.div>
    </div>
  )
}
```

---

## 2. The router gate — `src/features/app/AppRoleGate.tsx`

The index route at `/app`. Decides where an arriving user goes.

```tsx
import { Navigate } from 'react-router-dom'
import { useAppAuthStore } from './store/useAppAuthStore'

export function AppRoleGate() {
  const user = useAppAuthStore((s) => s.user)
  const role = useAppAuthStore((s) => s.role)
  const isReady = useAppAuthStore((s) => s.isReady)

  if (!isReady) return null
  if (!user) return <Navigate to="/app/welcome" replace />
  if (!role) return <Navigate to="/app/onboarding/role" replace />
  if (role === 'coach') return <Navigate to="/app/coach/home" replace />
  return <Navigate to="/app/athlete/home" replace />
}
```

---

## 3. Welcome / login — `src/features/app/onboarding/WelcomePage.tsx`

Perplexity-style: cobalt illustration on top, dark panel with the wordmark + three buttons (Google, email, demo). **`onGoogle`/`onEmail` route to `/app/coming-soon`; `onDemo` calls `setDemoUser()` then `/app`.**

```tsx
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { useAppAuthStore } from '../store/useAppAuthStore'

export function WelcomePage() {
  const navigate = useNavigate()
  const setDemoUser = useAppAuthStore((s) => s.setDemoUser)

  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => { document.body.removeAttribute('data-app-canvas') }
  }, [])

  // ── What happens on each button ──
  const onGoogle = () => navigate('/app/coming-soon')   // real OAuth not wired yet
  const onEmail = () => navigate('/app/coming-soon')
  const onDemo = () => {
    setDemoUser({ id: 'demo-user', email: 'demo@synth.local' })
    navigate('/app', { replace: true })                 // re-runs AppRoleGate
  }

  return (
    <div className="flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
        fontFamily: SYNTH.font, height: '100dvh', overflow: 'hidden', overscrollBehavior: 'none',
      }}>
      {/* Illustration zone — abstract synth scene over cobalt */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-1 items-center justify-center overflow-hidden">
        <SynthIllustration />
      </motion.div>

      {/* Dark panel — wordmark + button stack */}
      <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex shrink-0 flex-col gap-4 px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-8"
        style={{ background: SYNTH.accentBlack, borderTopLeftRadius: 32, borderTopRightRadius: 32, color: SYNTH.inkOnBrand }}>
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[36px] font-bold leading-none tracking-[-0.02em]" style={{ color: SYNTH.inkOnBrand }}>
            synth<span style={{ color: SYNTH.accentEmerald }}>.</span>
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: SYNTH.inkOnBrandFaint }}>
            Every signal · one platform
          </span>
        </div>

        {/* Button stack */}
        <div className="mt-4 flex flex-col gap-2.5">
          <PillButton primary onClick={onGoogle} label="Continue with Google" icon={<GoogleGlyph />} />
          <PillButton onClick={onEmail} label="Continue with email" icon={<Mail size={16} strokeWidth={2.2} color={SYNTH.ink} />} />
          <button type="button" onClick={onDemo}
            className="mt-1 text-center text-[12px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
            Continue as demo
          </button>
        </div>

        {/* Footer micro-copy */}
        <div className="mt-3 flex justify-center gap-6">
          <FooterLink>Privacy policy</FooterLink>
          <FooterLink>Terms of service</FooterLink>
        </div>
      </motion.div>
    </div>
  )
}

function PillButton({ primary, onClick, label, icon }: { primary?: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.985 }} onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-full py-3.5 text-[14px] font-semibold"
      style={{
        background: primary ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.10)',
        color: primary ? SYNTH.ink : SYNTH.inkOnBrand,
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.18)',
        fontFamily: SYNTH.font, letterSpacing: '0.01em',
      }}>
      {icon}{label}
    </motion.button>
  )
}

function FooterLink({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="text-[11px] font-medium" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
      {children}
    </button>
  )
}

// Radial cobalt aurora + twinkling stars + a centered concentric-ring glyph.
function SynthIllustration() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute" style={{ top: '8%', left: '50%', transform: 'translateX(-50%)', width: 420, height: 420, background: `radial-gradient(circle, ${SYNTH.accentEmerald}55 0%, transparent 60%)`, filter: 'blur(8px)' }} />
      <div className="absolute" style={{ top: '40%', left: '-10%', width: 320, height: 320, background: `radial-gradient(circle, ${SYNTH.cardSky}30 0%, transparent 60%)`, filter: 'blur(12px)' }} />
      <div className="absolute" style={{ bottom: '5%', right: '-8%', width: 300, height: 300, background: `radial-gradient(circle, ${SYNTH.cardPink}30 0%, transparent 60%)`, filter: 'blur(12px)' }} />
      <div className="absolute inset-0">
        {STAR_POSITIONS.map((s, i) => (
          <motion.span key={i} className="absolute rounded-full"
            style={{ left: s.x, top: s.y, width: s.size, height: s.size, background: SYNTH.inkOnBrand, opacity: s.opacity }}
            animate={{ opacity: [s.opacity, s.opacity * 0.4, s.opacity] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }} />
        ))}
      </div>
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <SynthGlyph />
      </motion.div>
    </div>
  )
}

const STAR_POSITIONS = [
  { x: '12%', y: '14%', size: 3, opacity: 0.7 }, { x: '24%', y: '6%', size: 2, opacity: 0.5 },
  { x: '70%', y: '10%', size: 4, opacity: 0.8 }, { x: '88%', y: '18%', size: 2.5, opacity: 0.6 },
  { x: '8%', y: '40%', size: 2, opacity: 0.5 }, { x: '92%', y: '55%', size: 3, opacity: 0.7 },
  { x: '18%', y: '70%', size: 2, opacity: 0.4 }, { x: '78%', y: '78%', size: 3, opacity: 0.6 },
  { x: '40%', y: '22%', size: 2, opacity: 0.5 }, { x: '56%', y: '88%', size: 2.5, opacity: 0.5 },
] as const

function SynthGlyph() {
  return (
    <svg width={180} height={180} viewBox="0 0 180 180" aria-hidden>
      <defs>
        <radialGradient id="synth-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={SYNTH.accentEmerald} stopOpacity={0.6} />
          <stop offset="100%" stopColor={SYNTH.accentEmerald} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={90} cy={90} r={84} fill="url(#synth-glow)" />
      {[78, 60, 42, 24].map((r, i) => (
        <circle key={r} cx={90} cy={90} r={r} fill="none" stroke={SYNTH.inkOnBrand} strokeWidth={1} strokeOpacity={0.18 + i * 0.08} />
      ))}
      <circle cx={90} cy={90} r={6} fill={SYNTH.accentEmerald} />
    </svg>
  )
}

// The official multicolor Google "G".
function GoogleGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.717v2.258h2.908c1.702-1.567 2.685-3.874 2.685-6.616z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.346l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
    </svg>
  )
}
```

---

## 4. What "Continue with Google" lands on — `src/features/app/onboarding/ComingSoonPage.tsx`

Google/email are placeholders today. They route here: an email interest-list form (saved to localStorage) plus a "Try the demo" escape hatch that calls `setDemoUser()`.

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { useAppAuthStore } from '../store/useAppAuthStore'

const INTEREST_KEY = 'synth:interest:emails'

function saveEmail(email: string) {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(INTEREST_KEY)
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : []
    if (!list.includes(email)) list.push(email)
    window.localStorage.setItem(INTEREST_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

export function ComingSoonPage() {
  const navigate = useNavigate()
  const setDemoUser = useAppAuthStore((s) => s.setDemoUser)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [fieldError, setFieldError] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) { setFieldError('Enter a valid email address.'); return }
    saveEmail(trimmed)
    setSubmitted(true)
    setFieldError('')
  }

  const onTryDemo = () => {
    setDemoUser({ id: 'demo-user', email: 'demo@synth.local' })
    navigate('/app', { replace: true })
  }

  return (
    <div className="flex flex-1 flex-col" style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, fontFamily: SYNTH.font }}>
      {/* Back */}
      <div className="relative z-10 px-5 pt-[max(env(safe-area-inset-top),20px)] pb-2">
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
          <ChevronLeft size={14} strokeWidth={2.4} /> Back
        </button>
      </div>

      {/* Spinning-clock illustration */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-1 items-center justify-center overflow-hidden" style={{ minHeight: '40vh' }}>
        <ComingSoonIllustration />
      </motion.div>

      {/* Dark panel — email form or success */}
      <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-4 px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-8"
        style={{ background: SYNTH.accentBlack, borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
        {!submitted ? (
          <>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: SYNTH.accentEmerald, fontFamily: SYNTH.font }}>Coming soon</span>
              <h1 className="text-center text-[28px] font-bold leading-[1.1] tracking-[-0.01em]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>Are you interested?</h1>
              <p className="mt-1 text-center text-[13px] leading-[1.55]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                We're building real accounts. Enter your email and we'll keep you posted.
              </p>
            </div>
            <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-2.5">
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setFieldError('') }}
                placeholder="your@email.com" autoComplete="email"
                className="w-full rounded-2xl px-4 py-3.5 text-[14px] outline-none"
                style={{ background: 'rgba(255,255,255,0.10)', border: `1px solid ${fieldError ? '#EF4444' : 'rgba(255,255,255,0.18)'}`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }} />
              {fieldError ? <p className="text-center text-[12px]" style={{ color: '#EF4444', fontFamily: SYNTH.font }}>{fieldError}</p> : null}
              <motion.button type="submit" whileTap={{ scale: 0.985 }}
                className="flex w-full items-center justify-center rounded-full py-3.5 text-[14px] font-semibold"
                style={{ background: SYNTH.inkOnBrand, color: SYNTH.ink, fontFamily: SYNTH.font, letterSpacing: '0.01em' }}>
                Stay in the loop →
              </motion.button>
            </form>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={40} color={SYNTH.accentEmerald} strokeWidth={1.8} />
            <h2 className="text-center text-[22px] font-bold leading-[1.2]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>You're on the list.</h2>
            <p className="text-center text-[13px] leading-[1.55]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
              We'll keep you posted via email as soon as we're ready.
            </p>
          </motion.div>
        )}

        <button type="button" onClick={onTryDemo} className="mt-1 text-center text-[12px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
          ← Try the demo
        </button>
      </motion.div>
    </div>
  )
}

// Animated clock: emerald glow + two rotating hands + tick marks.
function ComingSoonIllustration() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 280, height: 280, background: `radial-gradient(circle, ${SYNTH.accentEmerald}38 0%, transparent 65%)`, filter: 'blur(20px)' }} />
      <motion.svg width={110} height={110} viewBox="0 0 110 110" style={{ position: 'relative' }}>
        <circle cx={55} cy={55} r={48} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
        <circle cx={55} cy={55} r={32} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        <circle cx={55} cy={55} r={5} fill={SYNTH.accentEmerald} />
        <motion.line x1={55} y1={55} x2={55} y2={14} stroke={SYNTH.inkOnBrand} strokeWidth={2} strokeLinecap="round"
          animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} style={{ originX: '55px', originY: '55px' }} />
        <motion.line x1={55} y1={55} x2={55} y2={20} stroke="rgba(255,255,255,0.45)" strokeWidth={1.2} strokeLinecap="round"
          animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ originX: '55px', originY: '55px' }} />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
          const rad = (angle * Math.PI) / 180
          const x1 = 55 + 44 * Math.sin(rad), y1 = 55 - 44 * Math.cos(rad)
          const x2 = 55 + 40 * Math.sin(rad), y2 = 55 - 40 * Math.cos(rad)
          return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.3)" strokeWidth={angle % 90 === 0 ? 1.5 : 0.8} />
        })}
      </motion.svg>
    </div>
  )
}
```

---

## 5. Auth store — `src/features/app/store/useAppAuthStore.ts`

The state machine: `user`, `role`, `isReady`, `isDemo`, `hasCompletedOnboarding`. Persists to localStorage; `setDemoUser` also mints a real Supabase anonymous session in the background so demo users get a JWT for Edge Functions.

```ts
import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { getSupabase, signOutFromSupabase } from '../lib/supabase'
import { clearGuidedTour } from '../../../shared/tutorial/useGuidedTourStore'

export type AppRole = 'coach' | 'athlete'

const ROLE_STORAGE_KEY = 'synth:app:role'
const DEMO_USER_STORAGE_KEY = 'synth:app:demoUser'
const ONBOARDING_DONE_KEY = 'synth:onboarding:done'

type DemoUser = { id: string; email: string }

function readOnboardingDone(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(ONBOARDING_DONE_KEY) === '1'
}
function readRole(): AppRole | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(ROLE_STORAGE_KEY)
  return raw === 'coach' || raw === 'athlete' ? raw : null
}
function readDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(DEMO_USER_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as DemoUser
    return parsed.id && parsed.email ? parsed : null
  } catch { return null }
}

type AppAuthState = {
  user: User | DemoUser | null
  role: AppRole | null
  isReady: boolean
  isDemo: boolean
  hasCompletedOnboarding: boolean
  setRole: (role: AppRole) => void
  setDemoUser: (user: DemoUser) => void
  markOnboardingDone: () => void
  hydrate: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAppAuthStore = create<AppAuthState>((set) => ({
  user: readDemoUser(),
  role: readRole(),
  isReady: false,
  isDemo: readDemoUser() !== null,
  hasCompletedOnboarding: readOnboardingDone(),

  setRole: (role) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(ROLE_STORAGE_KEY, role)
    set({ role })
  },

  setDemoUser: (user) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user))
    set({ user, isDemo: true })
    // Mint a real Supabase anonymous session so demo users can call Edge
    // Functions. Failures are silent — the localStorage demo flag still
    // works; only the live AI paths degrade to mock mode.
    void (async () => {
      const supabase = getSupabase()
      if (!supabase) return
      const { data: existing } = await supabase.auth.getSession()
      if (existing.session) return
      try {
        await supabase.auth.signInAnonymously()
      } catch (err) {
        if (typeof console !== 'undefined') console.warn('[demo] anonymous sign-in failed', err)
      }
    })()
  },

  markOnboardingDone: () => {
    if (typeof window !== 'undefined') window.localStorage.setItem(ONBOARDING_DONE_KEY, '1')
    set({ hasCompletedOnboarding: true })
  },

  hydrate: async () => {
    const supabase = getSupabase()
    if (!supabase) { set({ isReady: true }); return }

    // Wire the auth listener FIRST — Supabase fires INITIAL_SESSION on
    // registration, delivering the stored session without us awaiting
    // getSession() (which can hang on a stale refresh token in v2).
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? readDemoUser(), isDemo: readDemoUser() !== null })
    })

    // Splash clears synchronously from localStorage; the listener replaces
    // `user` with the real Supabase user once INITIAL_SESSION fires.
    set({ user: readDemoUser(), isReady: true, isDemo: readDemoUser() !== null })

    // Demo recovery: flag present but no session yet — fire anon sign-in
    // in the background, guarded by a 1.5s race so a hung getSession can't
    // block recovery.
    if (readDemoUser() !== null) {
      void (async () => {
        const sessionCheck = Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>((resolve) => setTimeout(() => resolve({ data: { session: null } }), 1500)),
        ])
        const { data } = await sessionCheck
        if (data.session) return
        try { await supabase.auth.signInAnonymously() }
        catch (err) { if (typeof console !== 'undefined') console.warn('[demo] anon recovery failed', err) }
      })()
    }
  },

  signOut: async () => {
    // Clear local state + localStorage FIRST so the auth listener doesn't
    // reinstate the demo user, then fire supabase signOut (timeout-raced
    // in the helper so it never blocks the UI).
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ROLE_STORAGE_KEY)
      window.localStorage.removeItem(DEMO_USER_STORAGE_KEY)
      window.localStorage.removeItem(ONBOARDING_DONE_KEY)
    }
    clearGuidedTour()
    set({ user: null, role: null, isDemo: false, hasCompletedOnboarding: false })
    await signOutFromSupabase()
  },
}))
```

---

## 6. Onboarding progress store — `src/features/app/store/useOnboardingStore.ts`

Client-side staging of every onboarding form value. Not persisted to a backend yet.

```ts
import { create } from 'zustand'

type OnboardingState = {
  sport: string | null
  teamName: string
  athleteCountBand: string | null
  capabilities: string[]
  coachConnectors: string[]
  inviteCode: string
  athleteConnectors: string[]
  scanProgress: number
  scanStatus: string
  setSport: (sport: string) => void
  setTeamName: (name: string) => void
  setAthleteCountBand: (band: string) => void
  toggleCapability: (value: string) => void
  toggleCoachConnector: (id: string) => void
  setInviteCode: (code: string) => void
  toggleAthleteConnector: (id: string) => void
  setScanProgress: (pct: number, status?: string) => void
  reset: () => void
}

const initial = {
  sport: null, teamName: '', athleteCountBand: null, capabilities: [],
  coachConnectors: [], inviteCode: '', athleteConnectors: [], scanProgress: 0, scanStatus: '',
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  setSport: (sport) => set({ sport }),
  setTeamName: (teamName) => set({ teamName }),
  setAthleteCountBand: (athleteCountBand) => set({ athleteCountBand }),
  toggleCapability: (value) =>
    set((s) => ({ capabilities: s.capabilities.includes(value) ? s.capabilities.filter((v) => v !== value) : [...s.capabilities, value] })),
  toggleCoachConnector: (id) =>
    set((s) => ({ coachConnectors: s.coachConnectors.includes(id) ? s.coachConnectors.filter((v) => v !== id) : [...s.coachConnectors, id] })),
  setInviteCode: (inviteCode) => set({ inviteCode }),
  toggleAthleteConnector: (id) =>
    set((s) => ({ athleteConnectors: s.athleteConnectors.includes(id) ? s.athleteConnectors.filter((v) => v !== id) : [...s.athleteConnectors, id] })),
  setScanProgress: (pct, status) => set({ scanProgress: pct, scanStatus: status ?? '' }),
  reset: () => set({ ...initial }),
}))
```

---

## 7. Onboarding guard — `src/features/app/onboarding/OnboardingGuard.tsx`

Wraps all `/app/onboarding/*`. Once done, bounces back to the role-appropriate home.

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAppAuthStore } from '../store/useAppAuthStore'

export function OnboardingGuard() {
  const hasCompleted = useAppAuthStore((s) => s.hasCompletedOnboarding)
  const role = useAppAuthStore((s) => s.role)

  if (hasCompleted) {
    const dest = role === 'athlete' ? '/app/athlete/home' : '/app/coach/home'
    return <Navigate to={dest} replace />
  }
  return <Outlet />
}
```

---

## 8. The shared step chrome — `src/features/app/primitives/SingleQuestionScreen.tsx`

Every numbered onboarding step renders inside this: glass back button + progress bar, centered title/helper, scroll area, pinned CTA (+ optional secondary). `pinTitle` keeps the header fixed for long lists (connectors).

```tsx
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { SYNTH } from '../lib/theme'
import { OnboardingBackground } from './OnboardingBackground'

type BgVariant = 'default' | 'role' | 'sport' | 'team' | 'capabilities' | 'connectors' | 'trust' | 'scanning' | 'reveal'

type Props = {
  step?: number
  totalSteps?: number
  onBack?: () => void
  title: string
  helper?: string
  ctaLabel: string
  ctaDisabled?: boolean
  onCta: () => void
  secondary?: { label: string; onClick: () => void }
  children: ReactNode
  bgVariant?: BgVariant
  pinTitle?: boolean
}

export function SingleQuestionScreen({
  step, totalSteps, onBack, title, helper, ctaLabel, ctaDisabled, onCta, secondary, children, bgVariant = 'default', pinTitle = false,
}: Props) {
  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => { document.body.removeAttribute('data-app-canvas') }
  }, [])

  const showProgress = typeof step === 'number' && typeof totalSteps === 'number' && totalSteps > 0
  const pct = showProgress ? Math.max(4, Math.min(100, (step / totalSteps) * 100)) : 0

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, fontFamily: SYNTH.font }}>
      <OnboardingBackground variant={bgVariant} />

      {/* Header — back + progress */}
      <div className="relative z-10 flex shrink-0 items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),20px)] pb-3">
        <button type="button" onClick={onBack} aria-label="Back" disabled={!onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-30"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand,
          }}>
          <ChevronLeft size={18} strokeWidth={2.4} />
        </button>
        {showProgress ? (
          <div className="flex-1 overflow-hidden rounded-full" style={{ height: 4, background: 'rgba(255,255,255,0.18)' }}>
            <motion.div initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: '100%', background: SYNTH.inkOnBrand }} />
          </div>
        ) : <div className="flex-1" />}
      </div>

      {pinTitle ? (
        <>
          <div className="relative z-10 shrink-0 px-6 pb-4 pt-2">
            <div className="mx-auto w-full max-w-[420px]">
              <h1 className="text-center text-[28px] font-bold leading-[1.1] tracking-[-0.01em]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{title}</h1>
              {helper ? <p className="mx-auto mt-2 max-w-[340px] text-center text-[13px] leading-[1.45]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{helper}</p> : null}
            </div>
          </div>
          <div className="synth-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
            <div className="px-6 pt-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 110px)' }}>
              <div className="mx-auto w-full max-w-[420px]">{children}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="synth-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col justify-center px-6 py-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 110px)' }}>
            <div className="mx-auto w-full max-w-[420px]">
              <h1 className="text-center text-[30px] font-bold leading-[1.1] tracking-[-0.01em]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{title}</h1>
              {helper ? <p className="mx-auto mt-3 max-w-[340px] text-center text-[14px] leading-[1.5]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{helper}</p> : null}
              <div className="mt-8">{children}</div>
            </div>
          </div>
        </div>
      )}

      {/* Pinned CTA */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3"
        style={{ background: 'rgba(31, 38, 201, 0.82)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <button type="button" onClick={onCta} disabled={ctaDisabled}
          className="block w-full rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99] disabled:opacity-40"
          style={{ background: SYNTH.inkOnBrand, color: SYNTH.ink, fontFamily: SYNTH.font, letterSpacing: '0.01em' }}>
          {ctaLabel}
        </button>
        {secondary ? (
          <button type="button" onClick={secondary.onClick}
            className="mt-3 block w-full text-center text-[12px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>
            {secondary.label}
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}
```

### Ambient background — `src/features/app/primitives/OnboardingBackground.tsx`

Drifting blurred orbs (palette per step) + twinkling stars + vignette. Pointer-events-none so it never steals taps.

```tsx
import { motion } from 'framer-motion'
import { SYNTH } from '../lib/theme'

type Variant = 'default' | 'role' | 'sport' | 'team' | 'capabilities' | 'connectors' | 'trust' | 'scanning' | 'reveal'
type Orb = { x: string; y: string; size: number; color: string; delay: number; drift: number }
type Star = { x: string; y: string; size: number; opacity: number; period: number }

export function OnboardingBackground({ variant = 'default' }: { variant?: Variant }) {
  const orbs = ORBS_BY_VARIANT[variant] ?? ORBS_BY_VARIANT.default
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ left: orb.x, top: orb.y, width: orb.size, height: orb.size, background: `radial-gradient(circle, ${orb.color}66 0%, ${orb.color}00 60%)`, filter: 'blur(40px)', transform: 'translate(-50%, -50%)' }}
          animate={{ x: [0, orb.drift, -orb.drift * 0.6, 0], y: [0, -orb.drift * 0.4, orb.drift * 0.6, 0] }}
          transition={{ duration: 18 + i * 2, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
      {STARS.map((star, i) => (
        <motion.span key={`s-${i}`} className="absolute rounded-full"
          style={{ left: star.x, top: star.y, width: star.size, height: star.size, background: SYNTH.inkOnBrand, opacity: star.opacity, boxShadow: `0 0 ${star.size * 1.5}px ${SYNTH.inkOnBrand}55` }}
          animate={{ opacity: [star.opacity, star.opacity * 0.25, star.opacity] }}
          transition={{ duration: star.period, repeat: Infinity, ease: 'easeInOut', delay: i * 0.07 }} />
      ))}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(15, 18, 80, 0.35) 100%)' }} />
    </div>
  )
}

const ORBS_BY_VARIANT: Record<Variant, Orb[]> = {
  default: [
    { x: '20%', y: '20%', size: 380, color: SYNTH.accentEmerald, delay: 0, drift: 30 },
    { x: '85%', y: '30%', size: 320, color: SYNTH.cardSky, delay: 1.5, drift: 24 },
    { x: '15%', y: '75%', size: 360, color: SYNTH.cardPink, delay: 3, drift: 28 },
    { x: '78%', y: '82%', size: 300, color: SYNTH.cardLemon, delay: 4.5, drift: 22 },
  ],
  role: [
    { x: '22%', y: '18%', size: 400, color: SYNTH.accentEmerald, delay: 0, drift: 32 },
    { x: '82%', y: '24%', size: 320, color: SYNTH.cardSky, delay: 2, drift: 24 },
    { x: '50%', y: '85%', size: 360, color: SYNTH.cardPink, delay: 4, drift: 26 },
  ],
  sport: [
    { x: '25%', y: '20%', size: 380, color: SYNTH.cardSky, delay: 0, drift: 30 },
    { x: '80%', y: '25%', size: 320, color: SYNTH.accentEmerald, delay: 2, drift: 22 },
    { x: '40%', y: '85%', size: 360, color: SYNTH.cardSky, delay: 4, drift: 28 },
    { x: '90%', y: '80%', size: 280, color: SYNTH.cardMint, delay: 6, drift: 20 },
  ],
  team: [
    { x: '20%', y: '22%', size: 380, color: SYNTH.cardPink, delay: 0, drift: 30 },
    { x: '85%', y: '28%', size: 320, color: SYNTH.accentEmerald, delay: 2, drift: 24 },
    { x: '60%', y: '88%', size: 340, color: SYNTH.cardCream, delay: 4, drift: 26 },
  ],
  capabilities: [
    { x: '18%', y: '18%', size: 380, color: SYNTH.cardLemon, delay: 0, drift: 30 },
    { x: '82%', y: '30%', size: 320, color: SYNTH.accentEmerald, delay: 1.5, drift: 24 },
    { x: '50%', y: '85%', size: 360, color: SYNTH.cardLemon, delay: 3, drift: 28 },
  ],
  connectors: [
    { x: '15%', y: '15%', size: 320, color: SYNTH.accentEmerald, delay: 0, drift: 24 },
    { x: '85%', y: '20%', size: 300, color: SYNTH.cardSky, delay: 1.5, drift: 22 },
    { x: '10%', y: '70%', size: 320, color: SYNTH.cardPink, delay: 3, drift: 24 },
    { x: '88%', y: '78%', size: 300, color: SYNTH.cardLemon, delay: 4.5, drift: 22 },
    { x: '50%', y: '50%', size: 260, color: SYNTH.cardMint, delay: 6, drift: 18 },
  ],
  trust: [
    { x: '50%', y: '20%', size: 460, color: SYNTH.accentEmerald, delay: 0, drift: 32 },
    { x: '15%', y: '70%', size: 340, color: SYNTH.accentEmerald, delay: 2, drift: 26 },
    { x: '85%', y: '78%', size: 320, color: SYNTH.cardMint, delay: 4, drift: 22 },
  ],
  scanning: [
    { x: '20%', y: '20%', size: 360, color: SYNTH.accentEmerald, delay: 0, drift: 50 },
    { x: '82%', y: '28%', size: 320, color: SYNTH.cardSky, delay: 1, drift: 44 },
    { x: '20%', y: '78%', size: 340, color: SYNTH.cardLemon, delay: 2, drift: 48 },
    { x: '82%', y: '82%', size: 300, color: SYNTH.cardPink, delay: 3, drift: 40 },
  ],
  reveal: [
    { x: '15%', y: '15%', size: 360, color: SYNTH.cardLemon, delay: 0, drift: 28 },
    { x: '85%', y: '20%', size: 340, color: SYNTH.cardPink, delay: 1.5, drift: 26 },
    { x: '20%', y: '80%', size: 360, color: SYNTH.accentEmerald, delay: 3, drift: 28 },
    { x: '82%', y: '82%', size: 320, color: SYNTH.cardSky, delay: 4.5, drift: 24 },
  ],
}

const STARS: Star[] = [
  { x: '8%', y: '10%', size: 2.5, opacity: 0.7, period: 3.2 }, { x: '18%', y: '6%', size: 1.5, opacity: 0.5, period: 4.0 },
  { x: '28%', y: '14%', size: 3, opacity: 0.6, period: 3.6 }, { x: '40%', y: '8%', size: 1.5, opacity: 0.45, period: 5.0 },
  { x: '56%', y: '12%', size: 2.5, opacity: 0.55, period: 4.4 }, { x: '72%', y: '6%', size: 2, opacity: 0.7, period: 3.8 },
  { x: '88%', y: '14%', size: 3, opacity: 0.6, period: 4.2 }, { x: '5%', y: '38%', size: 2, opacity: 0.4, period: 4.6 },
  { x: '94%', y: '40%', size: 2.5, opacity: 0.55, period: 3.4 }, { x: '12%', y: '52%', size: 1.5, opacity: 0.45, period: 5.2 },
  { x: '90%', y: '58%', size: 2, opacity: 0.5, period: 4.0 }, { x: '8%', y: '88%', size: 2, opacity: 0.5, period: 3.8 },
  { x: '24%', y: '92%', size: 1.5, opacity: 0.4, period: 5.4 }, { x: '42%', y: '88%', size: 2.5, opacity: 0.55, period: 4.2 },
  { x: '62%', y: '92%', size: 1.5, opacity: 0.4, period: 5.0 }, { x: '82%', y: '88%', size: 3, opacity: 0.6, period: 3.6 },
  { x: '36%', y: '32%', size: 1.5, opacity: 0.4, period: 4.8 }, { x: '64%', y: '36%', size: 2, opacity: 0.5, period: 4.2 },
  { x: '50%', y: '70%', size: 1.5, opacity: 0.4, period: 5.6 }, { x: '76%', y: '66%', size: 2, opacity: 0.5, period: 4.0 },
]
```

### Single-select rows — `src/features/app/primitives/PillRows.tsx`

```tsx
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { SYNTH } from '../lib/theme'

export type PillRowOption = { value: string; label: string; description?: string; icon?: ReactNode; iconBackground?: string; disabled?: boolean; badge?: string }

export function PillRows({ options, selectedValue, onSelect }: { options: PillRowOption[]; selectedValue: string | null; onSelect: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value
        return (
          <motion.button key={opt.value} type="button" onClick={() => !opt.disabled && onSelect(opt.value)} disabled={opt.disabled}
            whileTap={opt.disabled ? undefined : { scale: 0.985 }}
            className="flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors disabled:opacity-40"
            style={{
              background: isSelected ? SYNTH.glassActive : SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              borderColor: isSelected ? SYNTH.accentEmerald : SYNTH.glassBorder, color: SYNTH.inkOnBrand, minHeight: 64,
            }}>
            {opt.icon ? (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.2)' }}>{opt.icon}</span>
            ) : null}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[15px] font-semibold leading-tight" style={{ fontFamily: SYNTH.font, color: SYNTH.inkOnBrand }}>{opt.label}</span>
              {opt.description ? <span className="mt-1 text-[12px] leading-[1.4]" style={{ fontFamily: SYNTH.font, color: SYNTH.inkOnBrandMuted }}>{opt.description}</span> : null}
            </span>
            {opt.badge ? (
              <span className="ml-2 shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ borderColor: 'rgba(255,255,255,0.28)', color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{opt.badge}</span>
            ) : null}
            <span className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: isSelected ? SYNTH.accentEmerald : 'transparent', border: `1.5px solid ${isSelected ? SYNTH.accentEmerald : 'rgba(255,255,255,0.32)'}` }}>
              {isSelected ? <Check size={13} strokeWidth={3} color={SYNTH.inkOnBrand} /> : null}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
```

### Multi-select chips — `src/features/app/primitives/MultiSelectChips.tsx`

Identical structure to `PillRows` but each row toggles independently (`selectedValues: string[]`, `onToggle`). See `PillRows` above; the only difference is `selectedValues.includes(opt.value)` and no `badge`/`disabled`.

### Connector switch — `src/features/app/primitives/ConnectorSwitchRow.tsx`

The OAuth-style toggle: tap → `off → connecting` (spinner) → `connected` (check). The `useConnectorSwitchStates` hook manages the per-id state machine.

```tsx
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { SYNTH } from '../lib/theme'

export type ConnectorSwitchState = 'off' | 'connecting' | 'connected'
export type ConnectorSwitchOption = { id: string; name: string; description?: string; brandColor: string }

export function ConnectorSwitchRow({ option, state, onToggle, simulateAuth = true, onAuthComplete }: {
  option: ConnectorSwitchOption; state: ConnectorSwitchState; onToggle: () => void; simulateAuth?: boolean; onAuthComplete?: () => void
}) {
  // After tap, "connecting" auto-resolves to "connected" in 1.1s (simulated OAuth).
  useEffect(() => {
    if (!simulateAuth || state !== 'connecting') return
    const t = window.setTimeout(() => onAuthComplete?.(), 1100)
    return () => window.clearTimeout(t)
  }, [state, simulateAuth, onAuthComplete])

  const on = state !== 'off'
  const label = state === 'connecting' ? 'Connecting…' : state === 'connected' ? 'Connected' : 'Connect'
  const labelColor = state === 'connecting' || state === 'connected' ? SYNTH.accentEmerald : SYNTH.inkOnBrandMuted

  return (
    <motion.button type="button" whileTap={{ scale: 0.99 }} onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors"
      style={{
        background: state === 'connected' ? SYNTH.glassActive : SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        borderColor: state === 'connected' ? SYNTH.accentEmerald : SYNTH.glassBorder,
      }}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[14px] font-bold" style={{ background: option.brandColor, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
        {option.name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{option.name}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em]" style={{ color: labelColor, fontFamily: SYNTH.font }}>
          {label}
          {option.description ? <span style={{ color: SYNTH.inkOnBrandFaint, textTransform: 'none', letterSpacing: 0 }}> · {option.description}</span> : null}
        </p>
      </div>
      <Switch state={state} on={on} />
    </motion.button>
  )
}

function Switch({ state, on }: { state: ConnectorSwitchState; on: boolean }) {
  return (
    <span className="relative flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors"
      style={{ background: on ? SYNTH.accentEmerald : 'rgba(255,255,255,0.20)', border: '1px solid rgba(255,255,255,0.18)' }}>
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="flex h-5 w-5 items-center justify-center rounded-full"
        style={{ background: SYNTH.inkOnBrand, marginLeft: on ? 18 : 0, boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
        {state === 'connecting' ? (
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} className="flex">
            <Loader2 size={11} strokeWidth={2.6} color={SYNTH.accentEmerald} />
          </motion.span>
        ) : state === 'connected' ? <Check size={11} strokeWidth={3} color={SYNTH.accentEmerald} /> : null}
      </motion.span>
    </span>
  )
}

export function useConnectorSwitchStates(initialIds: string[] = []) {
  const [states, setStates] = useState<Record<string, ConnectorSwitchState>>(Object.fromEntries(initialIds.map((id) => [id, 'connected'])))
  const get = (id: string): ConnectorSwitchState => states[id] ?? 'off'
  const toggle = (id: string) => setStates((prev) => {
    const cur = prev[id] ?? 'off'
    return cur === 'off' ? { ...prev, [id]: 'connecting' } : { ...prev, [id]: 'off' }
  })
  const markConnected = (id: string) => setStates((prev) => (prev[id] !== 'connecting' ? prev : { ...prev, [id]: 'connected' }))
  const connectedIds = Object.entries(states).filter(([, s]) => s === 'connected').map(([id]) => id)
  return { get, toggle, markConnected, connectedIds }
}
```

### Onboarding options data — `src/features/app/data/onboardingOptions.ts`

```ts
export type SportOption = { value: string; label: string; description: string; available: boolean }

export const SPORTS: SportOption[] = [
  { value: 'rowing', label: 'Rowing', description: 'Erg + on-water, full coverage today', available: true },
  { value: 'running', label: 'Running', description: 'Coming soon', available: false },
  { value: 'cycling', label: 'Cycling', description: 'Coming soon', available: false },
  { value: 'swimming', label: 'Swimming', description: 'Coming soon', available: false },
]

export type CapabilityOption = { value: string; label: string; description: string }

export const COACH_CAPABILITIES: CapabilityOption[] = [
  { value: 'training-load', label: 'Training load', description: 'Volume + intensity across the week' },
  { value: 'recovery', label: 'Recovery', description: 'HRV, sleep, soreness check-ins' },
  { value: 'lineup', label: 'Lineup planning', description: 'Boats, seats, sub strategies' },
  { value: 'form', label: 'Form video', description: 'Send notes on stroke video' },
  { value: 'wellness', label: 'Wellness signals', description: 'Mood, stress, life context' },
  { value: 'attendance', label: 'Attendance', description: 'Who showed up, who missed' },
]
```

---

## 9. Step 1 — Role pick (`RolePickPage.tsx`)

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Users } from 'lucide-react'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { PillRows, type PillRowOption } from '../primitives/PillRows'
import { useAppAuthStore, type AppRole } from '../store/useAppAuthStore'
import { SYNTH } from '../lib/theme'

export function RolePickPage() {
  const navigate = useNavigate()
  const setRole = useAppAuthStore((s) => s.setRole)
  const [selected, setSelected] = useState<AppRole | null>(null)

  const options: PillRowOption[] = [
    { value: 'coach', label: 'Coach', description: 'See your whole team, leave notes, plan lineups', icon: <Users size={18} color={SYNTH.inkOnBrand} strokeWidth={2.2} /> },
    { value: 'athlete', label: 'Athlete', description: 'Track your own data, log sessions, get coach notes', icon: <ClipboardList size={18} color={SYNTH.inkOnBrand} strokeWidth={2.2} /> },
  ]

  const onContinue = () => {
    if (!selected) return
    setRole(selected)                                   // persist role to localStorage
    if (selected === 'coach') navigate('/app/onboarding/sport')
    else navigate('/app/onboarding/invite-code')
  }

  return (
    <SingleQuestionScreen step={1} totalSteps={5} onBack={() => navigate('/app/welcome')}
      title="Who are you?" helper="synth tailors what you see based on how you use it."
      ctaLabel="Continue" ctaDisabled={!selected} onCta={onContinue} bgVariant="role">
      <PillRows options={options} selectedValue={selected} onSelect={(v) => setSelected(v as AppRole)} />
    </SingleQuestionScreen>
  )
}
```

---

## 10. COACH path

### Step 2 — Sport (`SportPickPage.tsx`)

```tsx
import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { PillRows, type PillRowOption } from '../primitives/PillRows'
import { SPORTS } from '../data/onboardingOptions'
import { useOnboardingStore } from '../store/useOnboardingStore'

export function SportPickPage() {
  const navigate = useNavigate()
  const sport = useOnboardingStore((s) => s.sport)
  const setSport = useOnboardingStore((s) => s.setSport)

  const options: PillRowOption[] = SPORTS.map((s) => ({
    value: s.value, label: s.label, description: s.description,
    disabled: !s.available, badge: s.available ? undefined : 'Soon',
  }))

  return (
    <SingleQuestionScreen step={2} totalSteps={5} onBack={() => navigate(-1)}
      title="Which sport?" helper="synth tunes for rowing today. More sports come online next."
      ctaLabel="Continue" ctaDisabled={!sport} onCta={() => navigate('/app/onboarding/team')} bgVariant="sport">
      <PillRows options={options} selectedValue={sport} onSelect={setSport} />
    </SingleQuestionScreen>
  )
}
```

### Step 3 — Team setup (`CoachTeamSetupPage.tsx`)

```tsx
import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { PillRows, type PillRowOption } from '../primitives/PillRows'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { SYNTH } from '../lib/theme'

const ATHLETE_COUNT_BANDS: PillRowOption[] = [
  { value: 'lt-10', label: 'Under 10' }, { value: '10-25', label: '10–25' },
  { value: '25-50', label: '25–50' }, { value: 'gt-50', label: '50+' },
]

export function CoachTeamSetupPage() {
  const navigate = useNavigate()
  const teamName = useOnboardingStore((s) => s.teamName)
  const setTeamName = useOnboardingStore((s) => s.setTeamName)
  const band = useOnboardingStore((s) => s.athleteCountBand)
  const setBand = useOnboardingStore((s) => s.setAthleteCountBand)

  const canContinue = teamName.trim().length >= 2 && Boolean(band)

  return (
    <SingleQuestionScreen step={3} totalSteps={5} onBack={() => navigate(-1)}
      title="Tell us about your team" helper="We use this to label everything synth surfaces for you."
      ctaLabel="Continue" ctaDisabled={!canContinue} onCta={() => navigate('/app/onboarding/capabilities')} bgVariant="team">
      <div className="flex flex-col gap-6">
        <div>
          <label className="mb-2 block text-center text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: SYNTH.font, color: SYNTH.inkOnBrandMuted }}>Team name</label>
          <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Pacific Women's Rowing"
            className="w-full rounded-2xl border px-4 py-4 text-center text-[16px] outline-none transition-colors placeholder:text-white/40 focus:border-[var(--app-emerald)]"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              borderColor: SYNTH.glassBorder, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font,
              ['--app-emerald' as never]: SYNTH.accentEmerald,
            }} />
        </div>
        <div>
          <label className="mb-2 block text-center text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: SYNTH.font, color: SYNTH.inkOnBrandMuted }}>Roster size</label>
          <PillRows options={ATHLETE_COUNT_BANDS} selectedValue={band} onSelect={setBand} />
        </div>
      </div>
    </SingleQuestionScreen>
  )
}
```

### Step 4 — Capabilities (`CoachCapabilitiesPage.tsx`)

```tsx
import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { MultiSelectChips, type MultiSelectOption } from '../primitives/MultiSelectChips'
import { COACH_CAPABILITIES } from '../data/onboardingOptions'
import { useOnboardingStore } from '../store/useOnboardingStore'

export function CoachCapabilitiesPage() {
  const navigate = useNavigate()
  const capabilities = useOnboardingStore((s) => s.capabilities)
  const toggle = useOnboardingStore((s) => s.toggleCapability)

  const options: MultiSelectOption[] = COACH_CAPABILITIES.map((c) => ({ value: c.value, label: c.label, description: c.description }))

  return (
    <SingleQuestionScreen step={4} totalSteps={5} onBack={() => navigate(-1)}
      title="What do you want to track?" helper="Pick anything synth should synthesize for your team. Change this anytime."
      ctaLabel="Continue" ctaDisabled={capabilities.length === 0} onCta={() => navigate('/app/onboarding/sources/coach')} bgVariant="capabilities">
      <MultiSelectChips options={options} selectedValues={capabilities} onToggle={toggle} />
    </SingleQuestionScreen>
  )
}
```

### Step 5 — Connect sources (`CoachConnectorsPage.tsx`)

```tsx
import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { ConnectorSwitchRow, useConnectorSwitchStates } from '../primitives/ConnectorSwitchRow'
import { RequestConnectorRow } from '../primitives/RequestConnectorRow'
import { COACH_CONNECTORS } from '../data/mockConnectors'
import { useOnboardingStore } from '../store/useOnboardingStore'

export function CoachConnectorsPage() {
  const navigate = useNavigate()
  const selected = useOnboardingStore((s) => s.coachConnectors)
  const toggleStore = useOnboardingStore((s) => s.toggleCoachConnector)
  const switches = useConnectorSwitchStates(selected)

  const handleToggle = (id: string) => { switches.toggle(id); toggleStore(id) }

  return (
    <SingleQuestionScreen step={5} totalSteps={5} onBack={() => navigate(-1)}
      title="Connect your sources" helper="Tap a switch to authenticate. synth Agent will scan and synthesize on demand."
      ctaLabel={switches.connectedIds.length > 0 ? `Continue · ${switches.connectedIds.length} connected` : 'Skip for now'}
      onCta={() => navigate('/app/onboarding/trust')} bgVariant="connectors" pinTitle>
      <div className="flex flex-col gap-2">
        {COACH_CONNECTORS.map((c) => (
          <ConnectorSwitchRow key={c.id}
            option={{ id: c.id, name: c.name, description: c.description, brandColor: c.brandColor }}
            state={switches.get(c.id)} onToggle={() => handleToggle(c.id)} onAuthComplete={() => switches.markConnected(c.id)} />
        ))}
        <RequestConnectorRow />
      </div>
    </SingleQuestionScreen>
  )
}
```

---

## 11. ATHLETE path

### Step 1 — Invite code (`AthleteInviteCodePage.tsx`)

```tsx
import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { SYNTH } from '../lib/theme'

export function AthleteInviteCodePage() {
  const navigate = useNavigate()
  const code = useOnboardingStore((s) => s.inviteCode)
  const setCode = useOnboardingStore((s) => s.setInviteCode)
  const canContinue = code.trim().length >= 4

  return (
    <SingleQuestionScreen step={1} totalSteps={3} onBack={() => navigate(-1)}
      title="Enter your invite code" helper="Your coach should have shared a 6-character code with you."
      ctaLabel="Continue" ctaDisabled={!canContinue} onCta={() => navigate('/app/onboarding/sources/athlete')}
      secondary={{ label: "I don't have a code", onClick: () => navigate('/app/onboarding/sources/athlete') }} bgVariant="team">
      <div className="flex flex-col gap-3">
        <label className="text-center text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: SYNTH.font, color: SYNTH.inkOnBrandMuted }}>Invite code</label>
        <input type="text" inputMode="text" autoCapitalize="characters" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="—  —  —  —  —  —" maxLength={8}
          className="w-full rounded-2xl border px-4 py-5 text-center text-[24px] font-bold tracking-[0.32em] outline-none transition-colors placeholder:text-white/35 focus:border-[var(--app-emerald)]"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            borderColor: SYNTH.glassBorder, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font,
            ['--app-emerald' as never]: SYNTH.accentEmerald,
          }} />
      </div>
    </SingleQuestionScreen>
  )
}
```

### Step 2 — Connect sources (`AthleteConnectorsPage.tsx`)

Same shape as `CoachConnectorsPage` but reads `ATHLETE_CONNECTORS` and writes `athleteConnectors`; continues to `/app/onboarding/trust`.

```tsx
import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { ConnectorSwitchRow, useConnectorSwitchStates } from '../primitives/ConnectorSwitchRow'
import { RequestConnectorRow } from '../primitives/RequestConnectorRow'
import { ATHLETE_CONNECTORS } from '../data/mockConnectors'
import { useOnboardingStore } from '../store/useOnboardingStore'

export function AthleteConnectorsPage() {
  const navigate = useNavigate()
  const selected = useOnboardingStore((s) => s.athleteConnectors)
  const toggleStore = useOnboardingStore((s) => s.toggleAthleteConnector)
  const switches = useConnectorSwitchStates(selected)
  const handleToggle = (id: string) => { switches.toggle(id); toggleStore(id) }

  return (
    <SingleQuestionScreen step={2} totalSteps={3} onBack={() => navigate(-1)}
      title="Connect your sources" helper="Tap a switch to authenticate. Anything you wear, log, or train on."
      ctaLabel={switches.connectedIds.length > 0 ? `Continue · ${switches.connectedIds.length} connected` : 'Skip for now'}
      onCta={() => navigate('/app/onboarding/trust')} bgVariant="connectors" pinTitle>
      <div className="flex flex-col gap-2">
        {ATHLETE_CONNECTORS.map((c) => (
          <ConnectorSwitchRow key={c.id}
            option={{ id: c.id, name: c.name, description: c.description, brandColor: c.brandColor }}
            state={switches.get(c.id)} onToggle={() => handleToggle(c.id)} onAuthComplete={() => switches.markConnected(c.id)} />
        ))}
        <RequestConnectorRow />
      </div>
    </SingleQuestionScreen>
  )
}
```

### Request-a-connector row — `src/features/app/primitives/RequestConnectorRow.tsx`

Dashed card at the bottom of both connector lists. Expands into a name + context form, settles into a success state.

```tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Send } from 'lucide-react'
import { SYNTH } from '../lib/theme'

export function RequestConnectorRow() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [context, setContext] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    if (!name.trim()) return
    // Stub: real flow would POST to /api/connector-requests.
    setSubmitted(true); setName(''); setContext('')
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}
        className="flex w-full items-center gap-3 rounded-2xl border px-4 py-4"
        style={{ background: 'rgba(16,185,129,0.18)', border: `1px solid ${SYNTH.accentEmerald}55` }}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: SYNTH.accentEmerald }}>
          <Check size={18} color={SYNTH.inkOnBrand} strokeWidth={3} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>Got it — we'll add it.</p>
          <p className="mt-0.5 text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>We'll email you when it's ready.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div layout transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="rounded-2xl border-2 border-dashed"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        borderColor: 'rgba(255,255,255,0.32)',
      }}>
      {!open ? (
        <motion.button type="button" whileTap={{ scale: 0.99 }} onClick={() => setOpen(true)} className="flex w-full items-center gap-3 px-4 py-4 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)' }}>
            <Plus size={18} color={SYNTH.inkOnBrand} strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>Don't see your tool?</p>
            <p className="mt-0.5 text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>Request a connector — we'll wire it up.</p>
          </div>
        </motion.button>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2.5 px-4 py-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>Request a connector</p>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tool name (e.g. Trainerize)"
              className="w-full rounded-xl border px-3 py-3 text-[14px] outline-none placeholder:text-white/35 focus:border-[var(--app-emerald)]"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: SYNTH.glassBorder, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, ['--app-emerald' as never]: SYNTH.accentEmerald }} />
            <input type="text" value={context} onChange={(e) => setContext(e.target.value)} placeholder="What does it track? (optional)"
              className="w-full rounded-xl border px-3 py-3 text-[13px] outline-none placeholder:text-white/35 focus:border-[var(--app-emerald)]"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: SYNTH.glassBorder, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, ['--app-emerald' as never]: SYNTH.accentEmerald }} />
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => { setOpen(false); setName(''); setContext('') }} className="rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>Cancel</button>
              <button type="button" onClick={submit} disabled={!name.trim()} className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold disabled:opacity-40" style={{ background: SYNTH.accentEmerald, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                <Send size={12} strokeWidth={2.4} /> Send
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}
```

---

## 12. Shared tail — Trust (`TrustCardPage.tsx`)

Privacy promise screen → `/app/onboarding/scanning`.

```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, EyeOff } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { OnboardingBackground } from '../primitives/OnboardingBackground'

const PROMISES = [
  { icon: <Lock size={16} strokeWidth={2.2} color={SYNTH.accentEmerald} />, title: 'Encrypted in transit', body: 'Every connector handshake runs over TLS — your tokens never touch our logs.' },
  { icon: <EyeOff size={16} strokeWidth={2.2} color={SYNTH.accentEmerald} />, title: 'Never sold', body: "We don't sell or share your data with anyone. Period." },
  { icon: <ShieldCheck size={16} strokeWidth={2.2} color={SYNTH.accentEmerald} />, title: 'Yours to delete', body: 'One tap disconnects a source. One tap deletes everything.' },
]

export function TrustCardPage() {
  const navigate = useNavigate()
  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => { document.body.removeAttribute('data-app-canvas') }
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, fontFamily: SYNTH.font }}>
      <OnboardingBackground variant="trust" />
      <div className="synth-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center px-6 py-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 110px)' }}>
          <div className="mx-auto w-full max-w-[420px]">
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{ background: SYNTH.glass, backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`, WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`, border: `1px solid ${SYNTH.glassBorder}` }}>
              <ShieldCheck size={40} color={SYNTH.accentEmerald} strokeWidth={1.6} />
            </motion.div>
            <h1 className="mt-6 text-center text-[30px] font-bold leading-[1.1] tracking-[-0.01em]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>Your data stays yours</h1>
            <p className="mx-auto mt-3 max-w-[340px] text-center text-[14px] leading-[1.5]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>Three promises before we connect anything.</p>
            <div className="mt-8 flex flex-col gap-2.5">
              {PROMISES.map((p, i) => (
                <motion.div key={p.title} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-3 rounded-2xl border px-4 py-4"
                  style={{ background: SYNTH.glass, backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`, WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`, borderColor: SYNTH.glassBorder }}>
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(16,185,129,0.18)' }}>{p.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{p.title}</p>
                    <p className="mt-1 text-[12px] leading-[1.45]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{p.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3"
        style={{ background: 'rgba(31, 38, 201, 0.82)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <button type="button" onClick={() => navigate('/app/onboarding/scanning')}
          className="block w-full rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99]"
          style={{ background: SYNTH.inkOnBrand, color: SYNTH.ink, fontFamily: SYNTH.font, letterSpacing: '0.01em' }}>
          Continue
        </button>
      </div>
    </motion.div>
  )
}
```

---

## 13. Shared tail — Scanning (`ScanningPage.tsx`)

Auto-running progress ring (6 timed steps) → auto-navigates to `/app/onboarding/reveal`.

```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { SYNTH } from '../lib/theme'
import { OnboardingBackground } from '../primitives/OnboardingBackground'

const SCAN_STEPS = [
  { pct: 12, status: 'Pulling Concept2 history', delay: 600 },
  { pct: 31, status: 'Reading Strava sessions', delay: 800 },
  { pct: 48, status: 'Mapping recovery signals', delay: 800 },
  { pct: 64, status: 'Synthesizing training load', delay: 800 },
  { pct: 82, status: 'Building provenance map', delay: 800 },
  { pct: 100, status: 'Ready', delay: 700 },
]
const ARTIFACTS = ['Training load · 7d / 28d', 'Recovery score', 'Streak + days active', 'Volume + distance', 'Provenance map']

export function ScanningPage() {
  const navigate = useNavigate()
  const role = useAppAuthStore((s) => s.role)
  const scanProgress = useOnboardingStore((s) => s.scanProgress)
  const scanStatus = useOnboardingStore((s) => s.scanStatus)
  const setScanProgress = useOnboardingStore((s) => s.setScanProgress)

  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => { document.body.removeAttribute('data-app-canvas') }
  }, [])

  // Step the progress ring, then route to reveal.
  useEffect(() => {
    let cancelled = false
    let stepIdx = 0
    setScanProgress(0, SCAN_STEPS[0].status)
    const tick = () => {
      if (cancelled) return
      const step = SCAN_STEPS[stepIdx]
      setScanProgress(step.pct, step.status)
      stepIdx += 1
      if (stepIdx >= SCAN_STEPS.length) {
        setTimeout(() => { if (!cancelled) navigate('/app/onboarding/reveal') }, 600)
        return
      }
      setTimeout(tick, step.delay)
    }
    const startId = setTimeout(tick, 400)
    return () => { cancelled = true; clearTimeout(startId) }
  }, [navigate, setScanProgress, role])

  const RADIUS = 70
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const offset = CIRCUMFERENCE - (scanProgress / 100) * CIRCUMFERENCE

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, fontFamily: SYNTH.font }}>
      <OnboardingBackground variant="scanning" />
      <div className="synth-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center px-6 py-6">
          <div className="mx-auto w-full max-w-[420px]">
            {/* Circular progress ring */}
            <div className="mx-auto flex h-[180px] w-[180px] items-center justify-center">
              <svg width={180} height={180} viewBox="0 0 180 180" className="-rotate-90">
                <circle cx={90} cy={90} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={6} />
                <motion.circle cx={90} cy={90} r={RADIUS} fill="none" stroke={SYNTH.accentEmerald} strokeWidth={6} strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[42px] font-bold leading-none tracking-[-0.02em]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{scanProgress}</span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>Percent</span>
              </div>
            </div>
            <h1 className="mt-6 text-center text-[24px] font-bold leading-[1.15] tracking-[-0.01em]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>synth is scanning your sources</h1>
            <motion.p key={scanStatus} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              className="mt-2 text-center text-[13px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{scanStatus || 'Starting…'}</motion.p>
            {/* Artifact chips */}
            <div className="mt-8">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>What we're computing</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {ARTIFACTS.map((label) => (
                  <span key={label} className="rounded-full border px-3 py-1.5 text-[11px] font-semibold"
                    style={{ background: SYNTH.glass, backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`, WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`, borderColor: SYNTH.glassBorder, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
```

---

## 14. Shared tail — Reveal (`RevealPage.tsx`)

"synth is ready" with 2×2 stat tiles → `/app/onboarding/tour`.

```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Heart, Flame, TrendingUp, Check } from 'lucide-react'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { SYNTH } from '../lib/theme'
import { OnboardingBackground } from '../primitives/OnboardingBackground'

const CARDS = [
  { label: 'Training load', value: '142', unit: 'TSS/d', icon: <Activity size={14} strokeWidth={2.4} />, accent: SYNTH.cardSky },
  { label: 'Recovery', value: '78', icon: <Heart size={14} strokeWidth={2.4} />, accent: SYNTH.accentEmerald },
  { label: 'Streak', value: '11', unit: 'd', icon: <Flame size={14} strokeWidth={2.4} />, accent: SYNTH.cardLemon },
  { label: 'Volume', value: '28k', unit: 'm', icon: <TrendingUp size={14} strokeWidth={2.4} />, accent: SYNTH.cardPink },
]

export function RevealPage() {
  const navigate = useNavigate()
  const role = useAppAuthStore((s) => s.role)
  const coachConnectors = useOnboardingStore((s) => s.coachConnectors)
  const athleteConnectors = useOnboardingStore((s) => s.athleteConnectors)
  const sourceCount = role === 'coach' ? coachConnectors.length : athleteConnectors.length

  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => { document.body.removeAttribute('data-app-canvas') }
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, fontFamily: SYNTH.font }}>
      <OnboardingBackground variant="reveal" />
      <div className="synth-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center px-6 py-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 110px)' }}>
          <div className="mx-auto w-full max-w-[420px]">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: SYNTH.accentEmerald }}>
              <Check size={28} color={SYNTH.inkOnBrand} strokeWidth={3} />
            </motion.div>
            <h1 className="mt-6 text-center text-[30px] font-bold leading-[1.1] tracking-[-0.01em]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
              synth is ready<br /><span style={{ color: SYNTH.accentEmerald }}>for you.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-[340px] text-center text-[13px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
              Powered by <span style={{ color: SYNTH.inkOnBrand, fontWeight: 600 }}>{Math.max(sourceCount, 1)}</span> connected source{sourceCount === 1 ? '' : 's'}.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-2.5">
              {CARDS.map((c, i) => (
                <motion.div key={c.label} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
                  className="rounded-3xl border p-4"
                  style={{ background: SYNTH.glass, backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`, WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`, borderColor: SYNTH.glassBorder }}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `${c.accent}33`, color: c.accent }}>{c.icon}</span>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{c.label}</p>
                  </div>
                  <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: c.accent, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                    {c.value}{c.unit ? <span className="ml-1 text-[12px] font-semibold" style={{ color: SYNTH.inkOnBrandFaint }}>{c.unit}</span> : null}
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>Edit anything later in Sources</p>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3"
        style={{ background: 'rgba(31, 38, 201, 0.82)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <button type="button" onClick={() => navigate('/app/onboarding/tour')}
          className="block w-full rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99]"
          style={{ background: SYNTH.inkOnBrand, color: SYNTH.ink, fontFamily: SYNTH.font, letterSpacing: '0.01em' }}>
          Open synth
        </button>
      </div>
    </motion.div>
  )
}
```

---

## 15. Shared tail — Tour & finish (`TourPage.tsx`)

The 6-step feature tour. **On finish: `markOnboardingDone()` + `startTour()` + navigate to the role home** — this is the point the user actually enters the coach app.

```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Boxes, Sparkles, MoreHorizontal, Plus, ChevronRight } from 'lucide-react'
import { useAppAuthStore } from '../store/useAppAuthStore'
import { useGuidedTourStore } from '../../../shared/tutorial/useGuidedTourStore'
import { SYNTH } from '../lib/theme'
import { OnboardingBackground } from '../primitives/OnboardingBackground'

type TourStep = { key: string; kicker: string; title: string; body: string; icon: React.ReactNode; bg: 'role' | 'sport' | 'team' | 'capabilities' | 'connectors' | 'reveal' }

const STEPS: TourStep[] = [
  { key: 'home', kicker: 'Home', title: 'Your daily snapshot', body: "Greeting, today's plan, and the week ahead — lineups, races, attendance flags. The signals that need your eye, not the noise.", icon: <Home size={36} strokeWidth={2} />, bg: 'role' },
  { key: 'tools', kicker: 'Tools', title: 'Your custom toolkit', body: 'Lineup Builder + Stopwatch ship today. Build boats, time pieces with per-boat splits, rate sessions post-race. Request anything you wish was here.', icon: <Boxes size={36} strokeWidth={2} />, bg: 'capabilities' },
  { key: 'capture', kicker: 'Capture', title: 'Quick add anywhere', body: 'Voice-note, photo, or paste-text any data point — synth parses it and attributes it to the right athlete and session automatically.', icon: <Plus size={36} strokeWidth={2.4} />, bg: 'sport' },
  { key: 'ai', kicker: 'synth AI', title: 'Ask synth anything', body: "Scoped chat that pulls from every connector you've authorized. Ask about an athlete, the team, last weekend's race — answers come with charts and provenance.", icon: <Sparkles size={36} strokeWidth={2} />, bg: 'team' },
  { key: 'more', kicker: 'More', title: 'Roster · Attention · Sources · Settings', body: 'Everything secondary tucked under the dots. Roster for drill-in, Attention for flagged signals, Sources for connector health, Settings for invite codes and prefs.', icon: <MoreHorizontal size={36} strokeWidth={2.4} />, bg: 'connectors' },
  { key: 'done', kicker: "You're set", title: 'Welcome to synth.', body: 'Every signal. One platform. We synthesize what you connect, and surface what you should care about. Ready when you are.', icon: <Sparkles size={36} strokeWidth={2} />, bg: 'reveal' },
]

export function TourPage() {
  const navigate = useNavigate()
  const role = useAppAuthStore((s) => s.role)
  const markOnboardingDone = useAppAuthStore((s) => s.markOnboardingDone)
  const startTour = useGuidedTourStore((s) => s.startTour)
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    document.body.setAttribute('data-app-canvas', 'cobalt')
    return () => { document.body.removeAttribute('data-app-canvas') }
  }, [])

  // ── THE EXIT: this is what lands you in the coach app ──
  const finish = () => {
    markOnboardingDone()                                  // sets localStorage flag + state
    startTour()                                           // arms the in-app guided tour overlay
    navigate(role === 'coach' ? '/app/coach/home' : '/app/athlete/home', { replace: true })
  }
  const next = () => { if (isLast) finish(); else setStep((s) => Math.min(s + 1, STEPS.length - 1)) }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, fontFamily: SYNTH.font }}>
      <OnboardingBackground variant={current.bg} />

      {/* Top bar — step segments + Skip (also calls finish) */}
      <div className="relative z-10 flex shrink-0 items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),20px)] pb-3">
        <div className="flex flex-1 items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span key={i} className="h-1.5 flex-1 rounded-full transition-colors" style={{ background: i <= step ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.2)', maxWidth: 28 }} />
          ))}
        </div>
        <button type="button" onClick={finish} className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>Skip</button>
      </div>

      {/* Step content */}
      <div className="synth-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center px-6 py-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 110px)' }}>
          <AnimatePresence mode="wait">
            <motion.div key={current.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-[420px]">
              <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl"
                style={{ background: SYNTH.glass, backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`, WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`, border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand }}>
                {current.icon}
              </motion.div>
              <p className="mt-7 text-center text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: SYNTH.accentEmerald, fontFamily: SYNTH.font }}>{current.kicker}</p>
              <h1 className="mt-2 text-center text-[30px] font-bold leading-[1.1] tracking-[-0.01em]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{current.title}</h1>
              <p className="mx-auto mt-4 max-w-[360px] text-center text-[14px] leading-[1.55]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{current.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pinned CTA — Next / Open synth */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3"
        style={{ background: 'rgba(31, 38, 201, 0.82)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <button type="button" onClick={next}
          className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-semibold transition-opacity active:scale-[0.99]"
          style={{ background: SYNTH.inkOnBrand, color: SYNTH.ink, fontFamily: SYNTH.font, letterSpacing: '0.01em' }}>
          {isLast ? 'Open synth' : 'Next'}
          {!isLast ? <ChevronRight size={16} strokeWidth={2.4} /> : null}
        </button>
      </div>
    </motion.div>
  )
}
```

After `finish()` navigates to `/app/coach/home`, the coach app (`AppCoachShell` + `HomePage`) takes over — documented in `MOBILE-COACH-UI-REFERENCE.md`.

---

## Flow recap

| # | Screen | Route | File | Exit |
|---|---|---|---|---|
| 0 | Splash | `/app` | `AppShell.tsx` (`AppShellSplash`) | hydrate → gate |
| — | Gate | `/app` index | `AppRoleGate.tsx` | welcome / onboarding / home |
| 1 | Welcome | `/app/welcome` | `WelcomePage.tsx` | Google/email → coming-soon · demo → `/app` |
| — | Coming soon | `/app/coming-soon` | `ComingSoonPage.tsx` | email form · Try demo |
| 2 | Role | `/app/onboarding/role` | `RolePickPage.tsx` | coach→sport · athlete→invite-code |
| 3a | Sport | `…/sport` | `SportPickPage.tsx` | →team |
| 4a | Team | `…/team` | `CoachTeamSetupPage.tsx` | →capabilities |
| 5a | Capabilities | `…/capabilities` | `CoachCapabilitiesPage.tsx` | →sources/coach |
| 6a | Sources | `…/sources/coach` | `CoachConnectorsPage.tsx` | →trust |
| 3b | Invite code | `…/invite-code` | `AthleteInviteCodePage.tsx` | →sources/athlete |
| 4b | Sources | `…/sources/athlete` | `AthleteConnectorsPage.tsx` | →trust |
| 7 | Trust | `…/trust` | `TrustCardPage.tsx` | →scanning |
| 8 | Scanning | `…/scanning` | `ScanningPage.tsx` | auto →reveal |
| 9 | Reveal | `…/reveal` | `RevealPage.tsx` | →tour |
| 10 | Tour | `…/tour` | `TourPage.tsx` | **finish → /app/coach/home** |

**Stores:** `useAppAuthStore` (`user/role/isReady/isDemo/hasCompletedOnboarding` + `setRole/setDemoUser/markOnboardingDone/hydrate/signOut`) and `useOnboardingStore` (form staging). **Guard:** `OnboardingGuard` bounces completed users out. **Shared chrome:** `SingleQuestionScreen` + `OnboardingBackground` + `PillRows` / `MultiSelectChips` / `ConnectorSwitchRow` / `RequestConnectorRow`.
</content>
</invoke>
