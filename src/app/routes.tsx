import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { CoachLayout } from '@shared/layout/CoachLayout'
import { AthleteLayout } from '@surfaces/webapp/athlete/AthleteLayout'
import { RouteFallback } from '@shared/layout/RouteFallback'
import { ErrorBoundary } from '@shared/layout/ErrorBoundary'
import { PageTitle } from '@shared/components/PageTitle'
import { NotFoundPage } from '@pages/notFound/NotFoundPage'
import { COACH_TOOLS } from '@surfaces/webapp/coach/tools/toolRegistry'
import { featureFlags } from '@lib/featureFlags'
import { AppShell } from '@surfaces/pwa/AppShell'
import { AppRoleGate } from '@surfaces/pwa/AppRoleGate'
import { WelcomePage as AppWelcomePage } from '@surfaces/pwa/onboarding/WelcomePage'
import { RolePickPage as AppOnboardingRolePage } from '@surfaces/pwa/onboarding/RolePickPage'
import { SportPickPage as AppOnboardingSportPage } from '@surfaces/pwa/onboarding/SportPickPage'
import { CoachTeamSetupPage as AppOnboardingTeamPage } from '@surfaces/pwa/onboarding/CoachTeamSetupPage'
import { CoachCapabilitiesPage as AppOnboardingCapabilitiesPage } from '@surfaces/pwa/onboarding/CoachCapabilitiesPage'
import { CoachConnectorsPage as AppOnboardingCoachConnectorsPage } from '@surfaces/pwa/onboarding/CoachConnectorsPage'
import { AthleteInviteCodePage as AppOnboardingInviteCodePage } from '@surfaces/pwa/onboarding/AthleteInviteCodePage'
import { AthleteConnectorsPage as AppOnboardingAthleteConnectorsPage } from '@surfaces/pwa/onboarding/AthleteConnectorsPage'
import { TrustCardPage as AppOnboardingTrustPage } from '@surfaces/pwa/onboarding/TrustCardPage'
import { ScanningPage as AppOnboardingScanningPage } from '@surfaces/pwa/onboarding/ScanningPage'
import { RevealPage as AppOnboardingRevealPage } from '@surfaces/pwa/onboarding/RevealPage'
import { TourPage as AppOnboardingTourPage } from '@surfaces/pwa/onboarding/TourPage'
import { ComingSoonPage as AppComingSoonPage } from '@surfaces/pwa/onboarding/ComingSoonPage'
import { OnboardingGuard } from '@surfaces/pwa/onboarding/OnboardingGuard'
import { AppCoachShell } from '@surfaces/pwa/coach/AppCoachShell'
import { HomePage as AppCoachHomePage } from '@surfaces/pwa/coach/HomePage'
import { AttentionPage as AppCoachAttentionPage } from '@surfaces/pwa/coach/AttentionPage'
import { RosterPage as AppCoachRosterPage } from '@surfaces/pwa/coach/RosterPage'
import { AthleteDetailPage as AppCoachAthleteDetailPage } from '@surfaces/pwa/coach/AthleteDetailPage'
import { AIPage as AppCoachAIPage } from '@surfaces/pwa/coach/AIPage'
import { CapturePage as AppCoachCapturePage } from '@surfaces/pwa/coach/CapturePage'
import { LineupsPage as AppCoachLineupsPage } from '@surfaces/pwa/coach/LineupsPage'
import { CustomToolsPage as AppCoachToolsPage } from '@surfaces/pwa/coach/CustomToolsPage'
import { ToolsBuildPage as AppCoachToolsBuildPage } from '@surfaces/pwa/coach/ToolsBuildPage'
import { ToolFullscreenPage as AppCoachToolFullscreenPage } from '@surfaces/pwa/coach/ToolFullscreenPage'
import { StopwatchPage as AppCoachStopwatchPage } from '@surfaces/pwa/coach/StopwatchPage'
import { SessionDetailPage as AppCoachSessionDetailPage } from '@surfaces/pwa/coach/SessionDetailPage'
import { SessionTimerPage as AppCoachSessionTimerPage } from '@surfaces/pwa/coach/SessionTimerPage'
import { NotesPage as AppCoachNotesPage } from '@surfaces/pwa/coach/NotesPage'
import { SourcesPage as AppCoachSourcesPage } from '@surfaces/pwa/coach/SourcesPage'
import { SourcesDataViewPage as AppCoachSourcesDataViewPage } from '@surfaces/pwa/coach/SourcesDataViewPage'
import { SettingsPage as AppCoachSettingsPage } from '@surfaces/pwa/coach/SettingsPage'
import { AppAthleteShell } from '@surfaces/pwa/athlete/AppAthleteShell'
import { HomePage as AppAthleteHomePage } from '@surfaces/pwa/athlete/HomePage'
import { AIPage as AppAthleteAIPage } from '@surfaces/pwa/athlete/AIPage'
import { ErgPacerPage as AppAthleteErgPacerPage } from '@surfaces/pwa/athlete/ErgPacerPage'
import { CapturePage as AppAthleteCapturePage } from '@surfaces/pwa/athlete/CapturePage'
import { NotesPage as AppAthleteNotesPage } from '@surfaces/pwa/athlete/NotesPage'
import { SourcesPage as AppAthleteSourcesPage } from '@surfaces/pwa/athlete/SourcesPage'
import { SettingsPage as AppAthleteSettingsPage } from '@surfaces/pwa/athlete/SettingsPage'
import { TelemetryPage as AppAthleteTelemetryPage } from '@surfaces/pwa/athlete/TelemetryPage'
import { MyProfilePage as AppAthleteMyProfilePage } from '@surfaces/pwa/athlete/MyProfilePage'
import { AthleteToolsPage as AppAthleteToolsPage } from '@surfaces/pwa/athlete/AthleteToolsPage'
import { AthleteAttentionPage as AppAthleteAttentionPage } from '@surfaces/pwa/athlete/AthleteAttentionPage'
import { FormVideoPage as AppAthleteFormVideoPage } from '@surfaces/pwa/athlete/FormVideoPage'

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
  () => import('@surfaces/landing/LandingPage'),
  'LandingPage',
)

/* ─── Marketing surface (Kitman-inspired multi-page site) ──────────────── */
const PlatformHubPage = lazyNamed(
  () => import('@surfaces/landing/marketing/PlatformHubPage'),
  'PlatformHubPage',
)
const SportsHubPage = lazyNamed(
  () => import('@surfaces/landing/marketing/SportsHubPage'),
  'SportsHubPage',
)
const WhyUsPage = lazyNamed(
  () => import('@surfaces/landing/marketing/WhyUsPage'),
  'WhyUsPage',
)
const ResourcesPage = lazyNamed(
  () => import('@surfaces/landing/marketing/ResourcesPage'),
  'ResourcesPage',
)
const PricingPage = lazyNamed(
  () => import('@surfaces/landing/marketing/PricingPage'),
  'PricingPage',
)
const LegalPage = lazyNamed(
  () => import('@pages/legal/LegalPage'),
  'LegalPage',
)

const PlatformSynthCorePage           = lazyNamed(() => import('@surfaces/landing/marketing/platformPages'), 'SynthCorePage')
const PlatformRecoveryHealthPage      = lazyNamed(() => import('@surfaces/landing/marketing/platformPages'), 'RecoveryHealthPage')
const PlatformTrainingLoadPage        = lazyNamed(() => import('@surfaces/landing/marketing/platformPages'), 'TrainingLoadPage')
const PlatformProgressDevelopmentPage = lazyNamed(() => import('@surfaces/landing/marketing/platformPages'), 'ProgressDevelopmentPage')
const PlatformTeamOperationsPage      = lazyNamed(() => import('@surfaces/landing/marketing/platformPages'), 'TeamOperationsPage')
const PlatformCustomAnalyticsPage     = lazyNamed(() => import('@surfaces/landing/marketing/platformPages'), 'CustomAnalyticsPage')
const PlatformIntegrationsPage        = lazyNamed(() => import('@surfaces/landing/marketing/platformPages'), 'IntegrationsPage')
const PlatformApiPage                 = lazyNamed(() => import('@surfaces/landing/marketing/platformPages'), 'ApiPage')

const SportRunningPage   = lazyNamed(() => import('@surfaces/landing/marketing/sportPages'), 'RunningPage')
const SportCyclingPage   = lazyNamed(() => import('@surfaces/landing/marketing/sportPages'), 'CyclingPage')
const SportSwimmingPage  = lazyNamed(() => import('@surfaces/landing/marketing/sportPages'), 'SwimmingPage')
const SportRowingPage    = lazyNamed(() => import('@surfaces/landing/marketing/sportPages'), 'RowingPage')
const SportLiftingPage   = lazyNamed(() => import('@surfaces/landing/marketing/sportPages'), 'LiftingPage')
const SportTeamsPage     = lazyNamed(() => import('@surfaces/landing/marketing/sportPages'), 'TeamsPage')
const LoginPage = lazyNamed(
  () => import('@auth/LoginPage'),
  'LoginPage',
)
const JoinWithInvitePage = lazyNamed(
  () => import('@auth/JoinWithInvitePage'),
  'JoinWithInvitePage',
)
const SignUpPage = lazyNamed(
  () => import('@auth/SignUpPage'),
  'SignUpPage',
)

const ProductDemoPage = lazyNamed(
  () => import('@pages/productDemo/ProductDemoPage'),
  'ProductDemoPage',
)

const DashboardPage = lazyNamed(
  () => import('@surfaces/webapp/coach/dashboard/DashboardPage'),
  'DashboardPage',
)
const AthletesPage = lazyNamed(
  () => import('@surfaces/webapp/coach/athletes/AthletesPage'),
  'AthletesPage',
)
const AthleteProfilePage = lazyNamed(
  () => import('@surfaces/webapp/coach/athletes/AthleteProfilePage'),
  'AthleteProfilePage',
)
const SourcesPage = lazyNamed(
  () => import('@surfaces/webapp/coach/sources/SourcesPage'),
  'SourcesPage',
)
const ConnectorsDataViewPage = lazyNamed(
  () => import('@surfaces/webapp/coach/sources/ConnectorsDataViewPage'),
  'ConnectorsDataViewPage',
)
// Lineups + Session Timer are sourced from COACH_TOOLS (Phase 16 —
// ToolRegistry). Adding a new Custom Tool is one entry in toolRegistry.tsx
// plus one illustration, not a three-place edit across routes / sidebar /
// lazy imports.
const TeamChatPage = lazyNamed(
  () => import('@surfaces/webapp/coach/ai/TeamChatPage'),
  'TeamChatPage',
)
const AthleteScopedChatPage = lazyNamed(
  () => import('@surfaces/webapp/coach/ai/AthleteScopedChatPage'),
  'AthleteScopedChatPage',
)
const AthleteComparePage = lazyNamed(
  () => import('@surfaces/webapp/coach/athletes/AthleteComparePage'),
  'AthleteComparePage',
)
const SettingsPage = lazyNamed(
  () => import('@surfaces/webapp/coach/settings/SettingsPage'),
  'SettingsPage',
)

const MyDashboardPage = lazyNamed(
  () => import('@surfaces/webapp/athlete/athleteAppPages'),
  'MyDashboardPage',
)
const MyStatsPage = lazyNamed(
  () => import('@surfaces/webapp/athlete/athleteAppPages'),
  'MyStatsPage',
)
const MyRecordPage = lazyNamed(
  () => import('@surfaces/webapp/athlete/athleteAppPages'),
  'MyRecordPage',
)
const MyWorkbookPage = lazyNamed(
  () => import('@surfaces/webapp/athlete/athleteAppPages'),
  'MyWorkbookPage',
)
const MySessionsPage = lazyNamed(
  () => import('@surfaces/webapp/athlete/athleteAppPages'),
  'MySessionsPage',
)
const MyLineupsPage = lazyNamed(
  () => import('@surfaces/webapp/athlete/athleteAppPages'),
  'MyLineupsPage',
)
const AthleteSourcesConnectorsPage = lazyNamed(
  () => import('@surfaces/webapp/athlete/athleteAppPages'),
  'AthleteSourcesConnectorsPage',
)
const AthleteSourcesDataViewPage = lazyNamed(
  () => import('@surfaces/webapp/athlete/athleteAppPages'),
  'AthleteSourcesDataViewPage',
)
const MyChatPage = lazyNamed(
  () => import('@surfaces/webapp/athlete/athleteAppPages'),
  'MyChatPage',
)
const MySettingsPage = lazyNamed(
  () => import('@surfaces/webapp/athlete/athleteAppPages'),
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
  // Landing intentionally has no PageTitle label so document.title stays
  // at the full marketing line ("synth. — Every data signal. One platform.")
  // — Google's SERP snapshot uses document.title from the rendered DOM, so
  // labelling this "Landing" was producing the unhelpful "Landing — synth."
  // search result.
  { path: '/', element: withSuspense(<LandingPage />) },
  { path: '/product-demo', element: withSuspense(<ProductDemoPage />, 'Product demo') },
  { path: '/login', element: withSuspense(<LoginPage />, 'Sign in') },
  { path: '/signup', element: withSuspense(<SignUpPage />, 'Sign up') },
  { path: '/join/:code', element: withSuspense(<JoinWithInvitePage />, 'Join team') },

  /* ─── Marketing surface ──────────────────────────────────────────────── */
  { path: '/platform',                          element: withSuspense(<PlatformHubPage />,                  'Platform') },
  { path: '/platform/synth-core',               element: withSuspense(<PlatformSynthCorePage />,            'synth Core') },
  { path: '/platform/recovery-health',          element: withSuspense(<PlatformRecoveryHealthPage />,       'Recovery & Health') },
  { path: '/platform/training-load',            element: withSuspense(<PlatformTrainingLoadPage />,         'Training & Load') },
  { path: '/platform/progress-development',     element: withSuspense(<PlatformProgressDevelopmentPage />,  'Progress & Development') },
  { path: '/platform/team-operations',          element: withSuspense(<PlatformTeamOperationsPage />,       'Team Operations') },
  { path: '/platform/custom-analytics',         element: withSuspense(<PlatformCustomAnalyticsPage />,      'Custom Analytics') },
  { path: '/platform/integrations',             element: withSuspense(<PlatformIntegrationsPage />,         'Integrations') },
  { path: '/platform/api',                      element: withSuspense(<PlatformApiPage />,                  'API') },

  { path: '/sports',                            element: withSuspense(<SportsHubPage />,    'Sports') },
  { path: '/sports/running',                    element: withSuspense(<SportRunningPage />, 'Running') },
  { path: '/sports/cycling',                    element: withSuspense(<SportCyclingPage />, 'Cycling') },
  { path: '/sports/swimming',                   element: withSuspense(<SportSwimmingPage />,'Swimming') },
  { path: '/sports/rowing',                     element: withSuspense(<SportRowingPage />,  'Rowing') },
  { path: '/sports/lifting',                    element: withSuspense(<SportLiftingPage />, 'Lifting') },
  { path: '/sports/teams',                      element: withSuspense(<SportTeamsPage />,   'For Teams') },

  { path: '/why-us',                            element: withSuspense(<WhyUsPage />,        'Why us') },
  { path: '/resources',                         element: withSuspense(<ResourcesPage />,    'Resources') },
  { path: '/pricing',                           element: withSuspense(<PricingPage />,      'Pricing') },
  { path: '/legal',                             element: <Navigate to="/legal/privacy" replace /> },
  { path: '/legal/:slug',                       element: withSuspense(<LegalPage />,        'Legal') },
  { path: '/privacy',                           element: <Navigate to="/legal/privacy" replace /> },
  { path: '/terms',                             element: <Navigate to="/legal/terms" replace /> },
  { path: '/delete-account',                    element: <Navigate to="/legal/delete-account" replace /> },
  { path: '/support',                           element: <Navigate to="/legal/support" replace /> },
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
          // AI build flow is deferred to a future phase (see featureFlags.ts).
          // Redirect straight to Tools rather than dropping a direct link
          // into a chat workspace the coach can't reach any other way.
          {
            path: 'tools/build',
            element: featureFlags.aiToolBuild
              ? withSuspense(<AppCoachToolsBuildPage />, 'Build a tool')
              : <Navigate to="/app/coach/tools" replace />,
          },
          {
            path: 'tools/build/:chatId',
            element: featureFlags.aiToolBuild
              ? withSuspense(<AppCoachToolsBuildPage />, 'Build a tool')
              : <Navigate to="/app/coach/tools" replace />,
          },
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
