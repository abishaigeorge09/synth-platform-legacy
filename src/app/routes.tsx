import { Navigate, type RouteObject } from 'react-router-dom'
import { CoachLayout } from '../shared/layout/CoachLayout'
import { LandingPage } from '../features/landing/LandingPage'
import { LoginPage } from '../features/auth/LoginPage'
import { JoinWithInvitePage } from '../features/auth/JoinWithInvitePage'
import { DashboardPage } from '../features/coach/dashboard/DashboardPage'
import { AthletesPage } from '../features/coach/athletes/AthletesPage'
import { AthleteProfilePage } from '../features/coach/athletes/AthleteProfilePage'
import { SourcesPage } from '../features/coach/sources/SourcesPage'
import { LineupsPage } from '../features/coach/tools/lineups/LineupsPage'
import { SessionTimerPage } from '../features/coach/tools/sessionTimer/SessionTimerPage'
import { TeamChatPage } from '../features/coach/ai/TeamChatPage'
import { AthleteScopedChatPage } from '../features/coach/ai/AthleteScopedChatPage'
import { SettingsPage } from '../features/coach/settings/SettingsPage'
import { AthleteLayout } from '../features/athlete/AthleteLayout'
import {
  MyDashboardPage,
  MyStatsPage,
  MySessionsPage,
  MyLineupsPage,
  MySourcesPage,
  MyChatPage,
  AthleteSettingsPage,
} from '../features/athlete/athletePages'

export const routes: RouteObject[] = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/join/:code', element: <JoinWithInvitePage /> },
  {
    path: '/coach',
    element: <CoachLayout />,
    children: [
      { index: true, element: <Navigate to="/coach/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'athletes', element: <AthletesPage /> },
      { path: 'athletes/:athleteId', element: <AthleteProfilePage /> },
      { path: 'athletes/:athleteId/ai', element: <AthleteScopedChatPage /> },
      { path: 'sources', element: <SourcesPage /> },
      { path: 'tools/lineups', element: <LineupsPage /> },
      { path: 'tools/session-timer', element: <SessionTimerPage /> },
      { path: 'ai', element: <TeamChatPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/athlete',
    element: <AthleteLayout />,
    children: [
      { index: true, element: <Navigate to="/athlete/home" replace /> },
      { path: 'home', element: <MyDashboardPage /> },
      { path: 'stats', element: <MyStatsPage /> },
      { path: 'sessions', element: <MySessionsPage /> },
      { path: 'lineups', element: <MyLineupsPage /> },
      { path: 'sources', element: <MySourcesPage /> },
      { path: 'ai', element: <MyChatPage /> },
      { path: 'settings', element: <AthleteSettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
