import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { CoachLayout } from '../shared/layout/CoachLayout'
import { AthleteLayout } from '../features/athlete/AthleteLayout'
import { RouteFallback } from '../shared/layout/RouteFallback'
import { ErrorBoundary } from '../shared/layout/ErrorBoundary'
import { PageTitle } from '../shared/components/PageTitle'
import { NotFoundPage } from '../features/notFound/NotFoundPage'
import { COACH_TOOLS } from '../features/coach/tools/toolRegistry'
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
import { AppCoachShell } from '../features/app/coach/AppCoachShell'
import { HomePage as AppCoachHomePage } from '../features/app/coach/HomePage'
import { AttentionPage as AppCoachAttentionPage } from '../features/app/coach/AttentionPage'
import { RosterPage as AppCoachRosterPage } from '../features/app/coach/RosterPage'
import { AthleteDetailPage as AppCoachAthleteDetailPage } from '../features/app/coach/AthleteDetailPage'
import { AIPage as AppCoachAIPage } from '../features/app/coach/AIPage'
import { CapturePage as AppCoachCapturePage } from '../features/app/coach/CapturePage'
import { LineupsPage as AppCoachLineupsPage } from '../features/app/coach/LineupsPage'
import { CustomToolsPage as AppCoachToolsPage } from '../features/app/coach/CustomToolsPage'
import { ToolsBuildPage as AppCoachToolsBuildPage } from '../features/app/coach/ToolsBuildPage'
import { ToolFullscreenPage as AppCoachToolFullscreenPage } from '../features/app/coach/ToolFullscreenPage'
import { StopwatchPage as AppCoachStopwatchPage } from '../features/app/coach/StopwatchPage'
import { SessionDetailPage as AppCoachSessionDetailPage } from '../features/app/coach/SessionDetailPage'
import { SessionTimerPage as AppCoachSessionTimerPage } from '../features/app/coach/SessionTimerPage'
import { NotesPage as AppCoachNotesPage } from '../features/app/coach/NotesPage'
import { SourcesPage as AppCoachSourcesPage } from '../features/app/coach/SourcesPage'
import { SourcesDataViewPage as AppCoachSourcesDataViewPage } from '../features/app/coach/SourcesDataViewPage'
import { SettingsPage as AppCoachSettingsPage } from '../features/app/coach/SettingsPage'
import { AppAthleteShell } from '../features/app/athlete/AppAthleteShell'
import { HomePage as AppAthleteHomePage } from '../features/app/athlete/HomePage'
import { AIPage as AppAthleteAIPage } from '../features/app/athlete/AIPage'
import { ErgPacerPage as AppAthleteErgPacerPage } from '../features/app/athlete/ErgPacerPage'
import { CapturePage as AppAthleteCapturePage } from '../features/app/athlete/CapturePage'
import { NotesPage as AppAthleteNotesPage } from '../features/app/athlete/NotesPage'
import { SourcesPage as AppAthleteSourcesPage } from '../features/app/athlete/SourcesPage'
import { SettingsPage as AppAthleteSettingsPage } from '../features/app/athlete/SettingsPage'
import { TelemetryPage as AppAthleteTelemetryPage } from '../features/app/athlete/TelemetryPage'
import { MyProfilePage as AppAthleteMyProfilePage } from '../features/app/athlete/MyProfilePage'
import { AthleteToolsPage as AppAthleteToolsPage } from '../features/app/athlete/AthleteToolsPage'
import { AthleteAttentionPage as AppAthleteAttentionPage } from '../features/app/athlete/AthleteAttentionPage'
import { FormVideoPage as AppAthleteFormVideoPage } from '../features/app/athlete/FormVideoPage'

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
const AthleteComparePage = lazyNamed(
  () => import('../features/coach/athletes/AthleteComparePage'),
  'AthleteComparePage',
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
      { path: 'athletes/compare', element: withSuspense(<AthleteComparePage />, 'Compare athletes') },
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
      {
        path: 'coach',
        element: <AppCoachShell />,
        children: [
          { index: true, element: <Navigate to="/app/coach/home" replace /> },
          { path: 'home', element: withSuspense(<AppCoachHomePage />, 'Coach home') },
          { path: 'attention', element: withSuspense(<AppCoachAttentionPage />, 'Attention') },
          { path: 'roster', element: withSuspense(<AppCoachRosterPage />, 'Roster') },
          { path: 'athlete/:athleteId', element: withSuspense(<AppCoachAthleteDetailPage />, 'Athlete') },
          { path: 'capture', element: withSuspense(<AppCoachCapturePage />, 'Capture') },
          { path: 'ai', element: withSuspense(<AppCoachAIPage />, 'Coach AI') },
          { path: 'lineups', element: withSuspense(<AppCoachLineupsPage />, 'Lineups') },
          { path: 'tools', element: withSuspense(<AppCoachToolsPage />, 'Tools') },
          { path: 'tools/build', element: withSuspense(<AppCoachToolsBuildPage />, 'Build a tool') },
          { path: 'tools/build/:chatId', element: withSuspense(<AppCoachToolsBuildPage />, 'Build a tool') },
          { path: 'tools/stopwatch', element: withSuspense(<AppCoachStopwatchPage />, 'Stopwatch') },
          { path: 'tools/:slug', element: withSuspense(<AppCoachToolFullscreenPage />, 'Tool') },
          { path: 'sessions/:id', element: withSuspense(<AppCoachSessionDetailPage />, 'Session') },
          { path: 'sessions/:id/timer', element: withSuspense(<AppCoachSessionTimerPage />, 'Session timer') },
          { path: 'notes', element: withSuspense(<AppCoachNotesPage />, 'Notes') },
          { path: 'sources', element: <Navigate to="/app/coach/sources/connectors" replace /> },
          { path: 'sources/connectors', element: withSuspense(<AppCoachSourcesPage />, 'Sources') },
          { path: 'sources/data-view', element: withSuspense(<AppCoachSourcesDataViewPage />, 'Sources data view') },
          { path: 'settings', element: withSuspense(<AppCoachSettingsPage />, 'Settings') },
        ],
      },
      {
        path: 'athlete',
        element: <AppAthleteShell />,
        children: [
          { index: true, element: <Navigate to="/app/athlete/home" replace /> },
          { path: 'home', element: withSuspense(<AppAthleteHomePage />, 'Athlete home') },
          { path: 'capture', element: withSuspense(<AppAthleteCapturePage />, 'Capture') },
          { path: 'erg-pacer', element: withSuspense(<AppAthleteErgPacerPage />, 'Erg pacer') },
          { path: 'ai', element: withSuspense(<AppAthleteAIPage />, 'synth. AI') },
          { path: 'notes', element: withSuspense(<AppAthleteNotesPage />, 'Notes') },
          { path: 'sources', element: withSuspense(<AppAthleteSourcesPage />, 'Sources') },
          { path: 'settings', element: withSuspense(<AppAthleteSettingsPage />, 'Settings') },
          { path: 'telemetry', element: withSuspense(<AppAthleteTelemetryPage />, 'Telemetry') },
          { path: 'profile', element: withSuspense(<AppAthleteMyProfilePage />, 'My profile') },
          { path: 'tools', element: withSuspense(<AppAthleteToolsPage />, 'Tools') },
          { path: 'attention', element: withSuspense(<AppAthleteAttentionPage />, 'Attention') },
          { path: 'form-video', element: withSuspense(<AppAthleteFormVideoPage />, 'Form Video') },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]
