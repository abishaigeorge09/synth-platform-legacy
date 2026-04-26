export type AthleteDataViewTabId =
  | 'workflow'
  | 'concept2'
  | 'strava'
  | 'apple-health'
  | 'whoop'
  | 'workbook'

export type AthleteDataSource = {
  id: Exclude<AthleteDataViewTabId, 'workflow'>
  label: string
  color: string
  syncLabel: string
  status: 'Healthy' | 'Stale'
  records: string
  quality: string
  openUrl: string
}

export type AthleteConceptRow = {
  id: string
  dateIso: string
  testType: '2K' | '6K' | '30min' | 'Piece'
  split: string
  watts: number
  strokeRate: number
  distanceM: number
  isPr?: boolean
}

export type AthleteStravaRow = {
  id: string
  atIso: string
  type: 'Run' | 'Ride' | 'Row' | 'Walk'
  distanceKm: number
  durationMin: number
  avgHr?: number
  effort: number
}

export type AthleteBioPoint = {
  dateIso: string
  day: string
  sleep: number
  hrv: number
  rhr: number
  recovery: number
  strain: number
}

export type AthleteInferenceRow = {
  id: string
  at: string
  title: string
  detail: string
}

export type WorkflowNode = {
  id: string
  label: string
  kind: 'source' | 'process' | 'output'
  x: number
  y: number
  color?: string
  detail: string
}

export type WorkflowEdge = {
  id: string
  from: string
  to: string
  label: string
  color: string
}

export const ATHLETE_DATA_SOURCES: AthleteDataSource[] = [
  { id: 'concept2', label: 'Concept2', color: '#1A1A2E', syncLabel: 'synced 3h ago', status: 'Healthy', records: '847 rows', quality: '9.2/10', openUrl: 'https://log.concept2.com' },
  { id: 'strava', label: 'Strava', color: '#FC4C02', syncLabel: 'synced 30m ago', status: 'Healthy', records: '42 activities', quality: '9.0/10', openUrl: 'https://www.strava.com' },
  { id: 'apple-health', label: 'Apple Health', color: '#FF2D55', syncLabel: 'synced 6h ago', status: 'Healthy', records: '1,204 records', quality: '8.8/10', openUrl: 'https://support.apple.com/health' },
  { id: 'whoop', label: 'Whoop', color: '#00C2A8', syncLabel: 'synced 12m ago', status: 'Healthy', records: '96 recoveries', quality: '9.1/10', openUrl: 'https://www.whoop.com' },
  { id: 'workbook', label: 'Erg Workbook', color: '#4285F4', syncLabel: 'synced 1h ago', status: 'Healthy', records: 'Team sheet', quality: '8.6/10', openUrl: 'https://docs.google.com/spreadsheets' },
]

export const ATHLETE_DATA_TABS: Array<{ id: AthleteDataViewTabId; label: string; color: string }> = [
  { id: 'workflow', label: 'Workflow', color: '#10B981' },
  ...ATHLETE_DATA_SOURCES.map((s) => ({ id: s.id, label: s.label, color: s.color })),
]

export const ATHLETE_CONCEPT2_ROWS: AthleteConceptRow[] = [
  { id: 'c1', dateIso: '2026-04-24T10:00:00Z', testType: '2K', split: '1:41.2', watts: 337, strokeRate: 35, distanceM: 2000, isPr: true },
  { id: 'c2', dateIso: '2026-04-18T08:00:00Z', testType: 'Piece', split: '1:42.0', watts: 331, strokeRate: 34, distanceM: 2000 },
  { id: 'c3', dateIso: '2026-04-12T09:00:00Z', testType: '6K', split: '1:50.1', watts: 284, strokeRate: 28, distanceM: 6000 },
  { id: 'c4', dateIso: '2026-04-06T07:00:00Z', testType: '30min', split: '1:51.2', watts: 276, strokeRate: 26, distanceM: 8300 },
  { id: 'c5', dateIso: '2026-03-28T08:00:00Z', testType: '2K', split: '1:41.4', watts: 334, strokeRate: 35, distanceM: 2000 },
]

export const ATHLETE_STRAVA_ROWS: AthleteStravaRow[] = [
  { id: 's1', type: 'Run', atIso: '2026-04-23T18:30:00Z', distanceKm: 5.2, durationMin: 26.7, avgHr: 143, effort: 6 },
  { id: 's2', type: 'Ride', atIso: '2026-04-20T16:20:00Z', distanceKm: 18.4, durationMin: 43.2, avgHr: 136, effort: 5 },
  { id: 's3', type: 'Row', atIso: '2026-04-17T12:00:00Z', distanceKm: 8.1, durationMin: 35.1, avgHr: 148, effort: 7 },
  { id: 's4', type: 'Walk', atIso: '2026-04-14T19:10:00Z', distanceKm: 3.3, durationMin: 34.4, effort: 3 },
]

export const ATHLETE_BIOMETRICS: AthleteBioPoint[] = [
  { dateIso: '2026-04-20T00:00:00Z', day: 'Mon', sleep: 7.4, hrv: 56, rhr: 49, recovery: 78, strain: 12.4 },
  { dateIso: '2026-04-21T00:00:00Z', day: 'Tue', sleep: 7.1, hrv: 54, rhr: 50, recovery: 71, strain: 14.1 },
  { dateIso: '2026-04-22T00:00:00Z', day: 'Wed', sleep: 7.6, hrv: 58, rhr: 48, recovery: 84, strain: 11.2 },
  { dateIso: '2026-04-23T00:00:00Z', day: 'Thu', sleep: 6.9, hrv: 52, rhr: 51, recovery: 66, strain: 15.0 },
  { dateIso: '2026-04-24T00:00:00Z', day: 'Fri', sleep: 7.3, hrv: 55, rhr: 49, recovery: 81, strain: 12.0 },
]

export const ATHLETE_INFERENCE_LOG: AthleteInferenceRow[] = [
  { id: 'inf-1', at: 'Apr 24, 6:12 AM', title: 'Recovery score refreshed', detail: 'Sleep + HRV + resting HR merged from Apple Health.' },
  { id: 'inf-2', at: 'Apr 24, 5:48 AM', title: 'Strava activity parsed', detail: 'Run and ride intensity mapped into training load.' },
  { id: 'inf-3', at: 'Apr 23, 8:05 PM', title: 'Concept2 PR detected', detail: '2K 6:44.9 flagged as season best.' },
]

export const ATHLETE_WORKFLOW_CANVAS = {
  nodeW: 210,
  nodeH: 72,
  w: 1080,
  h: 620,
} as const

export const ATHLETE_WORKFLOW_NODES: WorkflowNode[] = [
  { id: 'concept2', label: 'Concept2', kind: 'source', x: 24, y: 24, color: '#1A1A2E', detail: 'erg scores · 847 rows' },
  { id: 'strava', label: 'Strava', kind: 'source', x: 24, y: 122, color: '#FC4C02', detail: 'activities · 42 events' },
  { id: 'apple-health', label: 'Apple Health', kind: 'source', x: 24, y: 220, color: '#FF2D55', detail: 'sleep + HRV · 1,204 rows' },
  { id: 'workbook', label: 'Erg Workbook', kind: 'source', x: 24, y: 318, color: '#4285F4', detail: 'team scores feed' },
  { id: 'name-match', label: 'Name Matching', kind: 'process', x: 430, y: 80, detail: 'athlete identity map' },
  { id: 'normalize', label: 'Normalization', kind: 'process', x: 430, y: 198, detail: 'units + dedupe' },
  { id: 'synthesis', label: 'Synthesis', kind: 'process', x: 430, y: 316, detail: 'composite model' },
  { id: 'profile', label: 'Athlete Profile', kind: 'output', x: 820, y: 72, detail: 'timeline + trends' },
  { id: 'training-load', label: 'Training Load', kind: 'output', x: 820, y: 170, detail: 'effort scoring' },
  { id: 'recovery', label: 'Recovery Score', kind: 'output', x: 820, y: 268, detail: 'readiness index' },
  { id: 'synth-ai', label: 'synth. AI', kind: 'output', x: 820, y: 366, detail: 'context answers' },
]

export const ATHLETE_WORKFLOW_EDGES: WorkflowEdge[] = [
  { id: 'e1', from: 'concept2', to: 'name-match', label: 'erg scores', color: '#1A1A2E' },
  { id: 'e2', from: 'strava', to: 'normalize', label: 'activities', color: '#FC4C02' },
  { id: 'e3', from: 'apple-health', to: 'synthesis', label: 'sleep + HRV', color: '#FF2D55' },
  { id: 'e4', from: 'workbook', to: 'synthesis', label: 'team scores', color: '#4285F4' },
  { id: 'e5', from: 'name-match', to: 'profile', label: 'identity', color: '#10B981' },
  { id: 'e6', from: 'normalize', to: 'training-load', label: 'normalized load', color: '#10B981' },
  { id: 'e7', from: 'synthesis', to: 'recovery', label: 'readiness', color: '#10B981' },
  { id: 'e8', from: 'synthesis', to: 'synth-ai', label: 'context graph', color: '#10B981' },
]

