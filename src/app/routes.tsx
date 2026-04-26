import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { CoachLayout } from '../shared/layout/CoachLayout'
import { AthleteLayout } from '../features/athlete/AthleteLayout'
import { RouteFallback } from '../shared/layout/RouteFallback'
import { ErrorBoundary } from '../shared/layout/ErrorBoundary'
import { PageTitle } from '../shared/components/PageTitle'
import { NotFoundPage } from '../features/notFound/NotFoundPage'
import { COACH_TOOLS } from '../features/coach/tools/toolRegistry'

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
const SignUpPage = lazyNamed(
  () => import('../features/auth/SignUpPage'),
  'SignUpPage',
)

const ProductDemoPage = lazyNamed(
  () => import('../features/productDemo/ProductDemoPage'),
  'ProductDemoPage',
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
const ConnectorsDataViewPage = lazyNamed(
  () => import('../features/coach/sources/ConnectorsDataViewPage'),
  'ConnectorsDataViewPage',
)
// Lineups + Session Timer are sourced from COACH_TOOLS (Phase 16 —
// ToolRegistry). Adding a new Custom Tool is one entry in toolRegistry.tsx
// plus one illustration, not a three-place edit across routes / sidebar /
// lazy imports.
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
  () => import('../features/athlete/athleteAppPages'),
  'MyDashboardPage',
)
const MyStatsPage = lazyNamed(
  () => import('../features/athlete/athleteAppPages'),
  'MyStatsPage',
)
const MyRecordPage = lazyNamed(
  () => import('../features/athlete/athleteAppPages'),
  'MyRecordPage',
)
const MyWorkbookPage = lazyNamed(
  () => import('../features/athlete/athleteAppPages'),
  'MyWorkbookPage',
)
const MySessionsPage = lazyNamed(
  () => import('../features/athlete/athleteAppPages'),
  'MySessionsPage',
)
const MyLineupsPage = lazyNamed(
  () => import('../features/athlete/athleteAppPages'),
  'MyLineupsPage',
)
const AthleteSourcesConnectorsPage = lazyNamed(
  () => import('../features/athlete/athleteAppPages'),
  'AthleteSourcesConnectorsPage',
)
const AthleteSourcesDataViewPage = lazyNamed(
  () => import('../features/athlete/athleteAppPages'),
  'AthleteSourcesDataViewPage',
)
const MyChatPage = lazyNamed(
  () => import('../features/athlete/athleteAppPages'),
  'MyChatPage',
)
const MySettingsPage = lazyNamed(
  () => import('../features/athlete/athleteAppPages'),
  'MySettingsPage',
)

// Phase 14 — every lazy route is wrapped in an ErrorBoundary → Suspense pair.
// ErrorBoundary is the outer layer so a chunk-load failure (network drop mid
// navigation) surfaces as a retryable card instead of a blank screen, and any
// render error inside the loaded page lands in the same fallback.
// Phase 27 — PageTitle sets document.title per route using the same label.
function withSuspense(node: React.ReactNode, label?: string) {
  return (
    <ErrorBoundary label={label}>
      <Suspense fallback={<RouteFallback />}>
        <PageTitle title={label}>{node}</PageTitle>
      </Suspense>
    </ErrorBoundary>
  )
}

export const routes: RouteObject[] = [
  { path: '/', element: withSuspense(<LandingPage />, 'Landing') },
  { path: '/product-demo', element: withSuspense(<ProductDemoPage />, 'Product demo') },
  { path: '/login', element: withSuspense(<LoginPage />, 'Sign in') },
  { path: '/signup', element: withSuspense(<SignUpPage />, 'Sign up') },
  { path: '/join/:code', element: withSuspense(<JoinWithInvitePage />, 'Join team') },
  {
    path: '/coach',
    element: (
      <ErrorBoundary label="Coach surface">
        <CoachLayout />
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Navigate to="/coach/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<DashboardPage />, 'Dashboard') },
      { path: 'athletes', element: withSuspense(<AthletesPage />, 'Athletes') },
      { path: 'athletes/:athleteId', element: withSuspense(<AthleteProfilePage />, 'Athlete profile') },
      { path: 'athletes/:athleteId/ai', element: withSuspense(<AthleteScopedChatPage />, 'Athlete AI') },
      { path: 'sources', element: <Navigate to="/coach/sources/connectors" replace /> },
      { path: 'sources/connectors', element: withSuspense(<SourcesPage />, 'Sources') },
      { path: 'sources/data-view', element: withSuspense(<ConnectorsDataViewPage />, 'Sources data view') },
      ...COACH_TOOLS.map((tool) => ({
        path: tool.path,
        element: withSuspense(<tool.Component />, tool.routeLabel),
      })),
      { path: 'ai', element: withSuspense(<TeamChatPage />, 'Team chat') },
      { path: 'settings', element: withSuspense(<SettingsPage />, 'Settings') },
    ],
  },
  {
    path: '/athlete',
    element: (
      <ErrorBoundary label="Athlete surface">
        <AthleteLayout />
      </ErrorBoundary>
    ),
    children: [
      // New athlete IA (Today/Progress/Record/Workbook/Chat/Sources subpages)
      { index: true, element: <Navigate to="/athlete/today" replace /> },

      // Back-compat redirects
      { path: 'home', element: <Navigate to="/athlete/today" replace /> },
      { path: 'stats', element: <Navigate to="/athlete/progress" replace /> },
      { path: 'ai', element: <Navigate to="/athlete/chat" replace /> },
      { path: 'sources', element: <Navigate to="/athlete/sources/connectors" replace /> },

      { path: 'today', element: withSuspense(<MyDashboardPage />, 'Today') },
      { path: 'progress', element: withSuspense(<MyStatsPage />, 'My progress') },
      { path: 'record', element: withSuspense(<MyRecordPage />, 'Record') },
      { path: 'workbook', element: withSuspense(<MyWorkbookPage />, 'Erg workbook') },
      { path: 'sessions', element: withSuspense(<MySessionsPage />, 'My sessions') },
      { path: 'lineups', element: withSuspense(<MyLineupsPage />, 'My lineups') },
      {
        path: 'sources/connectors',
        element: withSuspense(<AthleteSourcesConnectorsPage />, 'Sources connectors'),
      },
      {
        path: 'sources/data-view',
        element: withSuspense(<AthleteSourcesDataViewPage />, 'Sources data view'),
      },
      { path: 'chat', element: withSuspense(<MyChatPage />, 'synth. AI') },
      { path: 'settings', element: withSuspense(<MySettingsPage />, 'Settings') },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]
