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
