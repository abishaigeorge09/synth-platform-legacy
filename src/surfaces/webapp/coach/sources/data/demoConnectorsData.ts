export type DataViewTabId =
  | 'workflow'
  | 'google-sheets'
  | 'concept2'
  | 'strava'
  | 'apple-health'
  | 'whoop'
  | 'bridge'
  | 'trainingpeaks'
  | 'google-calendar'
  | 'garmin'
  | 'oura'
  | 'coach-notes'
  | 'ai-import'
  | 'team-chat'

export type DataViewTab = {
  id: DataViewTabId
  label: string
  shortLabel?: string
  kind: 'workflow' | 'sheet' | 'table' | 'feed' | 'metrics'
  icon?: string
}

export type DemoRosterAthlete = {
  id: string
  name: string
  side?: 'port' | 'starboard' | 'cox'
  year?: 'FR' | 'SO' | 'JR' | 'SR' | 'GR'
}

export type InferenceLogItem = {
  id: string
  at: string
  title: string
  detail: string
  sourceId?: DataViewTabId
  status: 'success' | 'warning' | 'error'
}

export type SourceHealthRow = {
  id: DataViewTabId
  name: string
  status: 'healthy' | 'stale' | 'failed' | 'pending'
  lastSyncAt: string
  records: number
}

export type SheetRow = {
  id: string
  athlete: string
  date: string
  session: string
  type: string
  notes: string
}

export const TEAM_ROSTER: DemoRosterAthlete[] = [
  { id: 'ew', name: 'Marnie Rothmore', side: 'port', year: 'SR' },
  { id: 'ji', name: 'Brielle Whitcombe', side: 'starboard', year: 'SR' },
  { id: 'la', name: 'Freya Birchwood', side: 'port', year: 'JR' },
  { id: 'sm', name: 'Sloane Carrow', side: 'starboard', year: 'JR' },
  { id: 'lv', name: 'Corin Wexford', side: 'starboard', year: 'SO' },
  { id: 'or', name: 'Larkin Tremaine', side: 'port', year: 'SO' },
  { id: 'mb', name: 'Odette Oakden', side: 'port', year: 'SR' },
  { id: 'lc', name: 'Marisol Ulverton', side: 'starboard', year: 'SR' },
  { id: 'cj', name: 'Odile Ashcombe', side: 'cox', year: 'SR' },
]

export const DATA_VIEW_TABS: DataViewTab[] = [
  { id: 'workflow', label: 'Workflow', kind: 'workflow', icon: 'WF' },
  { id: 'google-sheets', label: 'Google Sheets', shortLabel: 'Sheets', kind: 'sheet', icon: 'GS' },
  { id: 'concept2', label: 'Concept2', shortLabel: 'C2', kind: 'table', icon: 'C2' },
  { id: 'strava', label: 'Strava', kind: 'feed', icon: 'SV' },
  { id: 'apple-health', label: 'Apple Health', shortLabel: 'Apple', kind: 'metrics', icon: 'AH' },
  { id: 'whoop', label: 'Whoop', kind: 'metrics', icon: 'WH' },
  { id: 'bridge', label: 'Bridge Athletics', shortLabel: 'Bridge', kind: 'metrics', icon: 'BR' },
  { id: 'trainingpeaks', label: 'TrainingPeaks', shortLabel: 'TP', kind: 'metrics', icon: 'TP' },
  { id: 'google-calendar', label: 'Google Calendar', shortLabel: 'Cal', kind: 'metrics', icon: 'GC' },
  { id: 'garmin', label: 'Garmin', kind: 'metrics', icon: 'GM' },
  { id: 'oura', label: 'Oura', kind: 'metrics', icon: 'OR' },
  { id: 'coach-notes', label: 'Coach Notes', shortLabel: 'Notes', kind: 'feed', icon: 'CN' },
  { id: 'ai-import', label: 'AI Import', shortLabel: 'Import', kind: 'feed', icon: 'AI' },
  { id: 'team-chat', label: 'Slack / GroupMe', shortLabel: 'Chat', kind: 'feed', icon: 'CH' },
]

export const SOURCE_HEALTH: SourceHealthRow[] = [
  { id: 'google-sheets', name: 'Google Sheets', status: 'healthy', lastSyncAt: '2026-04-24T12:12:00Z', records: 1240 },
  { id: 'concept2', name: 'Concept2 Logbook', status: 'healthy', lastSyncAt: '2026-04-24T12:08:00Z', records: 982 },
  { id: 'strava', name: 'Strava', status: 'stale', lastSyncAt: '2026-04-23T19:21:00Z', records: 416 },
  { id: 'apple-health', name: 'Apple Health', status: 'healthy', lastSyncAt: '2026-04-24T11:40:00Z', records: 2201 },
  { id: 'whoop', name: 'Whoop', status: 'failed', lastSyncAt: '2026-04-24T03:11:00Z', records: 0 },
  { id: 'bridge', name: 'Bridge Athletics', status: 'healthy', lastSyncAt: '2026-04-24T10:03:00Z', records: 188 },
  { id: 'trainingpeaks', name: 'TrainingPeaks', status: 'pending', lastSyncAt: '2026-04-24T00:00:00Z', records: 0 },
]

export const INFERENCE_LOG: InferenceLogItem[] = [
  {
    id: 'inf-1',
    at: '2026-04-24T12:12:22Z',
    title: 'Normalized new workout rows from Sheets',
    detail: 'Detected 14 new rows across 9 athletes. Mapped "AM steady" → session template.',
    sourceId: 'google-sheets',
    status: 'success',
  },
  {
    id: 'inf-2',
    at: '2026-04-24T12:09:10Z',
    title: 'Updated Concept2 PR flags',
    detail: 'Marked 2K PR for Wheeler and 6K seasonal best for Roth.',
    sourceId: 'concept2',
    status: 'success',
  },
  {
    id: 'inf-3',
    at: '2026-04-24T03:11:44Z',
    title: 'Whoop sync failed',
    detail: 'Token expired. Needs reconnect in Connectors.',
    sourceId: 'whoop',
    status: 'error',
  },
  {
    id: 'inf-4',
    at: '2026-04-23T19:21:33Z',
    title: 'Strava activity classified as cross-training',
    detail: 'Labeled 6 activities as "cross-train" based on tags and HR zone distribution.',
    sourceId: 'strava',
    status: 'warning',
  },
]

export const SHEETS_ROWS: SheetRow[] = [
  { id: 'r1', athlete: 'Marnie Rothmore', date: 'Apr 24', session: 'AM steady', type: 'Row', notes: 'Rate cap 18. Focus catch.' },
  { id: 'r2', athlete: 'Brielle Whitcombe', date: 'Apr 24', session: 'AM steady', type: 'Row', notes: 'Clean finishes. 2×10 at 20.' },
  { id: 'r3', athlete: 'Sloane Carrow', date: 'Apr 24', session: 'PM lift', type: 'S&C', notes: 'Back-off volume due low recovery.' },
  { id: 'r4', athlete: 'Larkin Tremaine', date: 'Apr 23', session: 'Erg test', type: 'Erg', notes: '6K controlled. Negative split.' },
  { id: 'r5', athlete: 'Odette Oakden', date: 'Apr 23', session: 'AT piece', type: 'Row', notes: 'Seat racing focus. Strong mid-drive.' },
  { id: 'r6', athlete: 'Marisol Ulverton', date: 'Apr 22', session: 'Starts', type: 'Row', notes: 'Explosive first 10. Quick hands away.' },
]

export type Concept2Row = {
  athlete: string
  date: string
  testType: string
  split: string
  watts: number
  strokeRate: number
  distance: string
  isPr?: boolean
  daysSince: number
}

export type StravaActivityRow = {
  id: string
  athlete: string
  at: string
  type: string
  distanceKm: number
  duration: string
  pace: string
  avgHr?: number
  effort: number
}

export type VoiceNoteItem = {
  id: string
  at: string
  athlete: string
  tags: string[]
  transcript: string
  extracted: string[]
}

export const CONCEPT2_ROWS: Concept2Row[] = [
  { athlete: 'Phelps', date: 'Apr 20', testType: '2K', split: '1:38.2', watts: 412, strokeRate: 32, distance: '2,000m', isPr: true, daysSince: 4 },
  { athlete: 'Marnie Rothmore', date: 'Apr 20', testType: 'Piece', split: '1:38.9', watts: 362, strokeRate: 35, distance: '2,000m', daysSince: 4 },
  { athlete: 'Gold', date: 'Apr 18', testType: '6K', split: '1:42.1', watts: 348, strokeRate: 28, distance: '6,000m', daysSince: 6 },
  { athlete: 'Manton', date: 'Apr 16', testType: '2K', split: '1:39.0', watts: 398, strokeRate: 33, distance: '2,000m', daysSince: 8 },
  { athlete: 'Baroni', date: 'Apr 4', testType: '30min', split: '1:48.3', watts: 276, strokeRate: 26, distance: '8,300m', daysSince: 20 },
]

export const STRAVA_ACTIVITIES: StravaActivityRow[] = [
  { id: 'str-1', athlete: 'Marnie Rothmore', at: 'Apr 22, 7:15 PM', type: 'Run', distanceKm: 5.2, duration: '26:14', pace: '5:03/km', avgHr: 152, effort: 6 },
  { id: 'str-2', athlete: 'Manton', at: 'Apr 22, 6:02 PM', type: 'Cycle', distanceKm: 24.1, duration: '48:40', pace: '29.6kph', avgHr: 149, effort: 7 },
  { id: 'str-3', athlete: 'Gold', at: 'Apr 21, 5:33 PM', type: 'Run', distanceKm: 6.8, duration: '34:11', pace: '5:01/km', avgHr: 158, effort: 7 },
  { id: 'str-4', athlete: 'Holt', at: 'Apr 20, 9:20 AM', type: 'Walk', distanceKm: 4.2, duration: '38:08', pace: '9:04/km', effort: 3 },
]

export const VOICE_NOTES: VoiceNoteItem[] = [
  {
    id: 'note-1',
    at: 'Apr 22, 3:45 PM',
    athlete: 'Marnie Rothmore',
    tags: ['Technique', 'Positive'],
    transcript: "Ella's catch timing has improved since we adjusted her footplate. Still late on the drive at high rates.",
    extracted: ['Catch timing improved', 'Footplate adjusted', 'Drive connection needs work at high rate'],
  },
  {
    id: 'note-2',
    at: 'Apr 21, 1:25 PM',
    athlete: 'Gold',
    tags: ['Wellness', 'Watchlist'],
    transcript: 'Gold reported soreness 7/10 and poor sleep after the last two sessions.',
    extracted: ['Soreness elevated (7/10)', 'Sleep debt likely', 'Recovery intervention recommended'],
  },
]
