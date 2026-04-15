/**
 * Prototype dashboard — data from WOMENS_DATA.md (see rowiqWomensData.ts).
 */
import type { DashboardAthleteRow } from '../components/SynthLayerDashboardMockup'
import {
  ROWIQ_AI_INSIGHT,
  ROWIQ_ATHLETE_ROWS,
  ROWIQ_SIGNAL_BLOCK_LABELS,
  ROWIQ_SIGNAL_BLOCK_VALUES,
  ROWIQ_SIGNAL_MONTH_LABELS,
  ROWIQ_SIGNAL_MONTH_VALUES,
  ROWIQ_SOURCES_INGEST,
  ROWIQ_TABLE_HEADERS,
  ROWIQ_TEAM_SUBTITLE,
} from './rowiqWomensData'

/** Fake login — no API. Use one-click “Enter demo” or these values + Sign in (password is not validated). */
export const DEMO_LOGIN = {
  email: 'coach@berkeley.edu',
  password: 'demo',
  teamId: 'cal-womens-rowing-demo',
  orgId: 'demo-org-berkeley-athletics',
} as const

export const WOMENS_TEAM_SUBTITLE = ROWIQ_TEAM_SUBTITLE

export const WOMENS_ATHLETE_ROWS: DashboardAthleteRow[] = ROWIQ_ATHLETE_ROWS

/** @deprecated Use WOMENS_ATHLETE_ROWS — kept for any import of WOMENS_ATHLETES */
export const WOMENS_ATHLETES = WOMENS_ATHLETE_ROWS

export const WOMENS_TABLE_HEADERS: string[] = [...ROWIQ_TABLE_HEADERS]

export const WOMENS_SIGNAL_MONTH_VALUES = ROWIQ_SIGNAL_MONTH_VALUES

export const WOMENS_SIGNAL_MONTH_LABELS = ROWIQ_SIGNAL_MONTH_LABELS

export const WOMENS_SIGNAL_BLOCK_VALUES = ROWIQ_SIGNAL_BLOCK_VALUES

export const WOMENS_SIGNAL_BLOCK_LABELS = ROWIQ_SIGNAL_BLOCK_LABELS

export const WOMENS_AI_INSIGHT = ROWIQ_AI_INSIGHT

export const WOMENS_SOURCES_INGEST = ROWIQ_SOURCES_INGEST

export const WOMENS_CONNECTORS: { name: string; status: string; detail: string; colorKey: 'primary' | 'cyan' | 'purple' | 'amber' }[] = [
  { name: 'Erg workbooks', status: 'synced', detail: 'rowing_women_* ERGS-2.xlsx (24–25 + 25–26)', colorKey: 'primary' },
  { name: 'TeamWorks', status: '2m ago', detail: 'Compliance + calendar', colorKey: 'cyan' },
  { name: 'Wearable hub', status: 'live', detail: 'Whoop team rollup', colorKey: 'purple' },
  { name: 'Email digests', status: 'digests', detail: 'Daily roster alerts', colorKey: 'amber' },
]

export const PROTO_SESSION_KEY = 'synth_proto_session_v1'
