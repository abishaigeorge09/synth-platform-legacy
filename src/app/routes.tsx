import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { CoachLayout } from '../shared/layout/CoachLayout'
import { AthleteLayout } from '../features/athlete/AthleteLayout'
import { RouteFallback } from '../shared/layout/RouteFallback'

// Phase 12 — route-level code splitting. Each feature page becomes its own
// chunk that's only fetched when the route is visited. Keeps the landing /
// auth surface small (no Recharts, no dnd-kit, no Framer Motion until a
// coach or athlete page is actually opened).

// React.lazy expects a default export; every feature module in this repo uses
// named exports, so we pluck the named export into a default inside the dynamic
// import callback.
function lazyNamed<T extends string>(
  loader: () => Promise<Record<T, ComponentType<unknown>>>,
  name: T,
) {
  return lazy(async () => {
    const mod = await loader()
    return { default: mod[name] }
  })
}

const LandingPage = lazyNamed(
  () => import('../features/landing/LandingPage'),
  'LandingPage',
)
const LoginPage = lazyNamed(
  () => import('../features/auth/LoginPage'),
  'LoginPage',
)
const JoinWithInvitePage = lazyNamed(
  () => import('../features/auth/JoinWithInvitePage'),
  'JoinWithInvitePage',
)

const DashboardPage = lazyNamed(
  () => import('../features/coach/dashboard/DashboardPage'),
  'DashboardPage',
)
const AthletesPage = lazyNamed(
  () => import('../features/coach/athletes/AthletesPage'),
  'AthletesPage',
)
const AthleteProfilePage = lazyNamed(
  () => import('../features/coach/athletes/AthleteProfilePage'),
  'AthleteProfilePage',
)
const SourcesPage = lazyNamed(
  () => import('../features/coach/sources/SourcesPage'),
  'SourcesPage',
)
const LineupsPage = lazyNamed(
  () => import('../features/coach/tools/lineups/LineupsPage'),
  'LineupsPage',
)
const SessionTimerPage = lazyNamed(
  () => import('../features/coach/tools/sessionTimer/SessionTimerPage'),
  'SessionTimerPage',
)
const TeamChatPage = lazyNamed(
  () => import('../features/coach/ai/TeamChatPage'),
  'TeamChatPage',
)
const AthleteScopedChatPage = lazyNamed(
  () => import('../features/coach/ai/AthleteScopedChatPage'),
  'AthleteScopedChatPage',
)
const SettingsPage = lazyNamed(
  () => import('../features/coach/settings/SettingsPage'),
  'SettingsPage',
)

const MyDashboardPage = lazyNamed(
  () => import('../features/athlete/athletePages'),
  'MyDashboardPage',
)
const MyStatsPage = lazyNamed(
  () => import('../features/athlete/athletePages'),
  'MyStatsPage',
)
const MySessionsPage = lazyNamed(
  () => import('../features/athlete/athletePages'),
  'MySessionsPage',
)
const MyLineupsPage = lazyNamed(
  () => import('../features/athlete/athletePages'),
  'MyLineupsPage',
)
const MySourcesPage = lazyNamed(
  () => import('../features/athlete/athletePages'),
  'MySourcesPage',
)
const MyChatPage = lazyNamed(
  () => import('../features/athlete/athletePages'),
  'MyChatPage',
)
const AthleteSettingsPage = lazyNamed(
  () => import('../features/athlete/athletePages'),
  'AthleteSettingsPage',
)

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>
}

export const routes: RouteObject[] = [
  { path: '/', element: withSuspense(<LandingPage />) },
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/join/:code', element: withSuspense(<JoinWithInvitePage />) },
  {
    path: '/coach',
    element: <CoachLayout />,
    children: [
      { index: true, element: <Navigate to="/coach/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<DashboardPage />) },
      { path: 'athletes', element: withSuspense(<AthletesPage />) },
      { path: 'athletes/:athleteId', element: withSuspense(<AthleteProfilePage />) },
      { path: 'athletes/:athleteId/ai', element: withSuspense(<AthleteScopedChatPage />) },
      { path: 'sources', element: withSuspense(<SourcesPage />) },
      { path: 'tools/lineups', element: withSuspense(<LineupsPage />) },
      { path: 'tools/session-timer', element: withSuspense(<SessionTimerPage />) },
      { path: 'ai', element: withSuspense(<TeamChatPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
    ],
  },
  {
    path: '/athlete',
    element: <AthleteLayout />,
    children: [
      { index: true, element: <Navigate to="/athlete/home" replace /> },
      { path: 'home', element: withSuspense(<MyDashboardPage />) },
      { path: 'stats', element: withSuspense(<MyStatsPage />) },
      { path: 'sessions', element: withSuspense(<MySessionsPage />) },
      { path: 'lineups', element: withSuspense(<MyLineupsPage />) },
      { path: 'sources', element: withSuspense(<MySourcesPage />) },
      { path: 'ai', element: withSuspense(<MyChatPage />) },
      { path: 'settings', element: withSuspense(<AthleteSettingsPage />) },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
