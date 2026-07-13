/**
 * Phase 0 seed data. The UI-first build reads exclusively from this module.
 * When backends land, swap these exports for query hooks — the component
 * layer should remain unchanged.
 *
 * Currently sourced from src/prototype/rowiqWomensData.ts (real Pacific Women's
 * Rowing erg test data parsed from the 2025-26 workbooks).
 */
import type {
  ActivityItem,
  AiImportJob,
  Alert,
  Athlete,
  AthleteTimelineEvent,
  ChatThread,
  ConnectorAccount,
  ErgScore,
  Session,
  Source,
  Team,
  User,
} from '@shared/data/types'
export { SEED_WELLNESS } from '@shared/data/seeds/wellness'
import {
  ERG_316_2K,
  ROWIQ_ROSTER_COUNT_2526,
  ROWIQ_SHEET_316_DATE,
} from '@shared/data/prototype/rowiqWomensData'
import { SEED_SESSIONS_EXPANDED, SEED_SESSION_BOATS, SEED_SESSION_SPLITS } from '@shared/data/seeds/sessions'

// ─── Team ──────────────────────────────────────────────────────────────────

export const SEED_TEAM_CAL_WOMENS: Team = {
  id: 'team-cal-womens-rowing',
  name: "Pacific Women's Rowing",
  sport: 'rowing',
  inviteCode: 'PAC-WR-2026',
  createdAt: '2025-08-01T00:00:00Z',
}

export const SEED_TEAM_CAL_MENS: Team = {
  id: 'team-cal-mens-rowing',
  name: "Pacific Men's Rowing",
  sport: 'rowing',
  inviteCode: 'PAC-MR-2026',
  createdAt: '2025-08-01T00:00:00Z',
}

// Used by the coach "switch squad" demo UI.
export const COACH_DEMO_SQUADS: Team[] = [SEED_TEAM_CAL_WOMENS, SEED_TEAM_CAL_MENS]

// ─── Coach user ────────────────────────────────────────────────────────────

export const SEED_COACH: User = {
  id: 'user-coach-cal-womens',
  email: 'coach@berkeley.edu',
  name: 'Demo Coach',
  role: 'head_coach',
  teamId: SEED_TEAM_CAL_WOMENS.id,
}

// ─── Athletes (derived from ERG_316_2K) ────────────────────────────────────

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function displayName(lastFirst: string) {
  // "Wheeler, Ella" → "Ella Wheeler"
  const [last, first] = lastFirst.split(',').map((p) => p.trim())
  return first ? `${first} ${last}` : lastFirst
}

export const SEED_ATHLETES: Athlete[] = ERG_316_2K.map((row, idx): Athlete => {
  const id = `athlete-${slugify(row.lastFirst)}`
  return {
    id,
    userId: `user-${id}`,
    teamId: SEED_TEAM_CAL_WOMENS.id,
    name: displayName(row.lastFirst),
    side: idx % 2 === 0 ? 'port' : 'starboard',
    status: 'active',
    avatarColorIndex: idx % 8,
  }
})

// ─── Erg scores (from the 316 2K sheet) ────────────────────────────────────

function parseErgTime(time: string): number {
  // "6:35.6" → 395.6 seconds
  const [mm, ss] = time.split(':')
  return parseInt(mm, 10) * 60 + parseFloat(ss)
}

function parseSplit(split: string): number {
  // "1:38.9" → 98.9 seconds per 500m
  const [mm, ss] = split.split(':')
  return parseInt(mm, 10) * 60 + parseFloat(ss)
}

export const SEED_ERG_SCORES: ErgScore[] = ERG_316_2K.map((row): ErgScore => {
  const athleteId = `athlete-${slugify(row.lastFirst)}`
  return {
    id: `erg-${athleteId}-${ROWIQ_SHEET_316_DATE}`,
    athleteId,
    testType: '2k',
    timeSeconds: parseErgTime(row.time),
    splitSeconds: parseSplit(row.avgSplit),
    spm: row.rate,
    watts: row.watts,
    distanceM: 2000,
    date: ROWIQ_SHEET_316_DATE,
  }
})

// ─── Sources (from the existing WOMENS_CONNECTORS shape) ───────────────────

export const SEED_SOURCES: Source[] = [
  {
    id: 'source-erg-workbooks',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    name: 'Erg workbooks',
    url: 'https://docs.google.com/spreadsheets/d/rowing_women_ergs',
    type: 'google_sheets',
    scheduleCron: '0 18 * * *',
    lastScanAt: '2026-04-14T18:00:00Z',
    status: 'healthy',
    colorKey: 'primary',
  },
  {
    id: 'source-teamworks',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    name: 'TeamWorks',
    url: 'https://app.teamworks.com/cal-womens-rowing',
    type: 'teamworks',
    scheduleCron: '*/15 * * * *',
    lastScanAt: '2026-04-14T21:58:00Z',
    status: 'healthy',
    colorKey: 'cyan',
  },
  {
    id: 'source-wearable-hub',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    name: 'Wearable hub',
    url: 'https://api.whoop.com/teams/cal-wr',
    type: 'wearable',
    scheduleCron: null, // real-time
    lastScanAt: '2026-04-14T22:00:00Z',
    status: 'healthy',
    colorKey: 'purple',
  },
  {
    id: 'source-email-digests',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    name: 'Email digests',
    url: 'mailto:digests@synth.sports',
    type: 'email_digest',
    scheduleCron: '0 9 * * *',
    lastScanAt: '2026-04-14T09:00:00Z',
    status: 'healthy',
    colorKey: 'amber',
  },
]

// ─── Alerts ────────────────────────────────────────────────────────────────

export const SEED_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    athleteId: SEED_ATHLETES[4]?.id,
    severity: 'warning',
    kind: 'wellness',
    title: 'Low recovery score',
    detail: '2 days below 50% HRV baseline',
    createdAt: '2026-04-14T07:15:00Z',
  },
  {
    id: 'alert-2',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    athleteId: SEED_ATHLETES[12]?.id,
    severity: 'danger',
    kind: 'compliance',
    title: 'Missed gym sessions',
    detail: '5-day gap on gym log — flagged by TeamWorks',
    createdAt: '2026-04-14T06:45:00Z',
  },
  {
    id: 'alert-3',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    severity: 'info',
    kind: 'sync',
    title: 'Email digest parsed',
    detail: 'Morning wellness — 47 / 52 athletes checked in',
    createdAt: '2026-04-14T09:02:00Z',
  },
]

// ─── Activity feed ─────────────────────────────────────────────────────────

export const SEED_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    kind: 'session',
    title: "Ella Wheeler PR'd 2K at 6:35.6",
    detail: 'New personal best — #1 on roster, 316 2K sheet',
    at: '2026-04-25T20:00:00Z',
  },
  {
    id: 'act-2',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    kind: 'lineup_published',
    title: 'Lineup published: V8 + 2V for Pacific Invite',
    detail: '16 seats confirmed · report time 5:30 AM Apr 26',
    at: '2026-04-25T18:00:00Z',
  },
  {
    id: 'act-3',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    kind: 'scan',
    title: '3 athletes missed wellness check-in',
    detail: 'Star Miller, Vivi Spitz, Madeline Cox — follow up',
    at: '2026-04-25T16:00:00Z',
  },
  {
    id: 'act-4',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    kind: 'session',
    title: 'Coach note added: Star Miller',
    detail: 'HRV 10% below baseline, light practice recommended',
    at: '2026-04-24T10:00:00Z',
  },
  {
    id: 'act-5',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    kind: 'scan',
    title: 'Madeline Cox flagged: recovery 42%',
    detail: 'Poor sleep 3 nights — wearable hub alert',
    at: '2026-04-24T08:30:00Z',
  },
  {
    id: 'act-6',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    kind: 'scan',
    title: 'Erg workbooks synced',
    detail: '46 scores updated from 316 2K sheet',
    at: '2026-04-14T18:00:00Z',
  },
]

// ─── Sessions (expanded in seeds/sessions.ts) ────────────────────────────────

export const SEED_SESSIONS: Session[] = SEED_SESSIONS_EXPANDED
export { SEED_SESSION_BOATS, SEED_SESSION_SPLITS }

// ─── Chat threads (empty) ──────────────────────────────────────────────────

export const SEED_CHAT_THREADS: ChatThread[] = []

// ─── Stats ─────────────────────────────────────────────────────────────────

export const SEED_TEAM_STATS = {
  rosterCount: ROWIQ_ROSTER_COUNT_2526,
  latestErgDate: ROWIQ_SHEET_316_DATE,
  activeSourcesCount: SEED_SOURCES.filter((s) => s.status === 'healthy').length,
  pendingSyncs: 0,
  activeAlerts: SEED_ALERTS.length,
}

// ─── Timeline & connectors (SCHEMA §9 — seed for UI) ─────────────────────

export const SEED_TIMELINE_EVENTS: AthleteTimelineEvent[] = [
  {
    id: 'tle-1',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    athleteId: SEED_ATHLETES[0]!.id,
    occurredAt: '2026-04-14T15:00:00Z',
    source: 'google_sheets',
    category: 'erg',
    data: { test_type: '2k', split_500m: 98.2, distance_m: 2000 },
    confidence: 0.95,
  },
  {
    id: 'tle-2',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    athleteId: SEED_ATHLETES[1]!.id,
    occurredAt: '2026-04-13T10:30:00Z',
    source: 'concept2_logbook',
    category: 'erg',
    data: { test_type: '6k', split_500m: 102.1 },
    confidence: 0.99,
  },
]

export const SEED_CONNECTOR_ACCOUNTS: ConnectorAccount[] = [
  {
    id: 'conn-gs',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    provider: 'google_sheets',
    displayName: 'Team erg folder',
    status: 'connected',
    lastSyncAt: '2026-04-14T18:00:00Z',
  },
  {
    id: 'conn-gcal',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    provider: 'google_calendar',
    displayName: 'Practice calendar',
    status: 'connected',
    lastSyncAt: '2026-04-14T06:00:00Z',
  },
  {
    id: 'conn-c2',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    provider: 'concept2_logbook',
    displayName: 'Logbook (team)',
    status: 'connected',
    lastSyncAt: '2026-04-14T05:00:00Z',
  },
  {
    id: 'conn-strava',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    provider: 'strava',
    displayName: 'Strava club',
    status: 'connected',
    lastSyncAt: '2026-04-14T04:30:00Z',
  },
]

export const SEED_AI_IMPORT_JOBS: AiImportJob[] = [
  {
    id: 'aij-1',
    teamId: SEED_TEAM_CAL_WOMENS.id,
    kind: 'photo',
    status: 'preview',
    previewSummary: '12 erg scores detected from screenshot',
    previewRows: [{ athlete: 'Miller', split: '1:38.2' }],
    createdAt: '2026-04-14T19:00:00Z',
  },
]

// ─── Strava activities ────────────────────────────────────────────────────

export { SEED_STRAVA_ACTIVITIES } from '@shared/data/seeds/stravaActivities'

// ─── Gym sessions ─────────────────────────────────────────────────────────

export { SEED_GYM_SESSIONS } from '@shared/data/seeds/gymSessions'

// ─── Sleep & HRV ──────────────────────────────────────────────────────────

export { SEED_SLEEP_HRV } from '@shared/data/seeds/sleepHrv'

// ─── Calendar events ─────────────────────────────────────────────────────

export { SEED_CALENDAR } from '@shared/data/seeds/calendar'
export type { CalendarEvent } from '@shared/data/seeds/calendar'

// ─── Coach notes ─────────────────────────────────────────────────────────

export { SEED_COACH_NOTES } from '@shared/data/seeds/coachNotes'
export type { CoachNote } from '@shared/data/seeds/coachNotes'

// Compatibility aliases for older query modules.
export const SEED_ATHLETES_ALL = SEED_ATHLETES
export const SEED_ERG_SCORES_ALL = SEED_ERG_SCORES
export const SEED_SOURCES_ALL = SEED_SOURCES
