import { Navigate, Outlet } from 'react-router-dom'
import { useAppAuthStore } from '../store/useAppAuthStore'

/**
 * Route guard wrapping all /app/onboarding/* routes.
 * Once onboarding is complete, any attempt to revisit onboarding
 * redirects back to the main app surface.
 */
export function OnboardingGuard() {
  const hasCompleted = useAppAuthStore((s) => s.hasCompletedOnboarding)
  const role = useAppAuthStore((s) => s.role)

  if (hasCompleted) {
    const dest = role === 'athlete' ? '/app/athlete/home' : '/app/coach/home'
    return <Navigate to={dest} replace />
  }

  return <Outlet />
}
