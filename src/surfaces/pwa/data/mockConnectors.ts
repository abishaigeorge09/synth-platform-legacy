export type ConnectorTool = {
  id: string
  label: string
}

export type ConnectorMock = {
  id: string
  name: string
  description: string
  brandColor: string
  category: 'Erg' | 'Wearable' | 'Outdoor' | 'Recovery' | 'Planning' | 'Comms' | 'Spreadsheet' | 'S&C'
  /** Tools/permissions a coach can toggle when this source is connected. */
  tools: ConnectorTool[]
}

export const COACH_CONNECTORS: ConnectorMock[] = [
  {
    id: 'concept2',
    name: 'Concept2 Logbook',
    description: 'Erg history, splits, watt curves',
    brandColor: '#1A1A2E',
    category: 'Erg',
    tools: [
      { id: 'list-workouts', label: 'List workouts' },
      { id: 'get-workout-detail', label: 'Get workout detail' },
      { id: 'get-athlete-profile', label: 'Get athlete profile' },
      { id: 'sync-logbook', label: 'Sync logbook' },
      { id: 'read-prs', label: 'Read PRs' },
      { id: 'read-seasonal-bests', label: 'Read seasonal bests' },
    ],
  },
  {
    id: 'strava',
    name: 'Strava',
    description: 'On-water + outdoor sessions',
    brandColor: '#FC4C02',
    category: 'Outdoor',
    tools: [
      { id: 'list-activities', label: 'List activities' },
      { id: 'get-activity-detail', label: 'Get activity detail' },
      { id: 'read-athlete', label: 'Read athlete' },
      { id: 'read-clubs', label: 'Read clubs' },
      { id: 'read-segments', label: 'Read segments' },
      { id: 'read-kudos', label: 'Read kudos' },
    ],
  },
  {
    id: 'trainingpeaks',
    name: 'TrainingPeaks',
    description: 'Coach-authored plans + sync',
    brandColor: '#1E5BAA',
    category: 'Planning',
    tools: [
      { id: 'read-planned', label: 'Read planned workouts' },
      { id: 'read-completed', label: 'Read completed workouts' },
      { id: 'read-tss', label: 'Read TSS / CTL / ATL' },
      { id: 'read-zones', label: 'Read zones' },
      { id: 'read-calendar', label: 'Read calendar' },
    ],
  },
  {
    id: 'whoop',
    name: 'WHOOP',
    description: 'Recovery + strain',
    brandColor: '#000000',
    category: 'Recovery',
    tools: [
      { id: 'read-recovery', label: 'Read recovery score' },
      { id: 'read-strain', label: 'Read strain' },
      { id: 'read-sleep', label: 'Read sleep' },
      { id: 'read-hrv', label: 'Read HRV' },
      { id: 'read-resting-hr', label: 'Read resting HR' },
    ],
  },
  {
    id: 'apple-health',
    name: 'Apple Health',
    description: 'Phone + watch wellness',
    brandColor: '#FF2D55',
    category: 'Wearable',
    tools: [
      { id: 'read-sleep', label: 'Read sleep' },
      { id: 'read-hrv', label: 'Read HRV' },
      { id: 'read-resting-hr', label: 'Read resting HR' },
      { id: 'read-steps', label: 'Read steps' },
      { id: 'read-heart-rate', label: 'Read heart rate' },
      { id: 'read-workouts', label: 'Read workouts' },
    ],
  },
  {
    id: 'garmin',
    name: 'Garmin',
    description: 'Watch + HR + sleep',
    brandColor: '#007CC3',
    category: 'Wearable',
    tools: [
      { id: 'read-activities', label: 'Read activities' },
      { id: 'read-hr', label: 'Read heart rate' },
      { id: 'read-sleep', label: 'Read sleep' },
      { id: 'read-body-battery', label: 'Read body battery' },
      { id: 'read-training-load', label: 'Read training load' },
    ],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Forwarded emails synth ingests',
    brandColor: '#EA4335',
    category: 'Comms',
    tools: [
      { id: 'list-forwarded', label: 'List forwarded emails' },
      { id: 'read-attachments', label: 'Read attachments' },
      { id: 'extract-erg-results', label: 'Extract erg results' },
    ],
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    description: 'Roster + erg tracker spreadsheets',
    brandColor: '#0F9D58',
    category: 'Spreadsheet',
    tools: [
      { id: 'list-sheets', label: 'List sheets' },
      { id: 'read-rows', label: 'Read rows' },
      { id: 'watch-updates', label: 'Watch for updates' },
    ],
  },
  {
    id: 'oura',
    name: 'Oura',
    description: 'Sleep + readiness',
    brandColor: '#1A1A1A',
    category: 'Recovery',
    tools: [
      { id: 'read-sleep', label: 'Read sleep' },
      { id: 'read-readiness', label: 'Read readiness' },
      { id: 'read-temperature', label: 'Read body temperature' },
      { id: 'read-hrv', label: 'Read HRV' },
    ],
  },
  {
    id: 'bridge',
    name: 'Bridge Athletics',
    description: 'S&C program + lift tracking',
    brandColor: '#4A90D9',
    category: 'S&C',
    tools: [
      { id: 'read-program', label: 'Read program' },
      { id: 'read-sessions', label: 'Read sessions' },
      { id: 'read-prs', label: 'Read lift PRs' },
      { id: 'read-volume', label: 'Read training volume' },
    ],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Practice + race schedule',
    brandColor: '#4285F4',
    category: 'Planning',
    tools: [
      { id: 'list-events', label: 'List events' },
      { id: 'read-attendees', label: 'Read attendees' },
      { id: 'watch-changes', label: 'Watch for changes' },
    ],
  },
]

export const ATHLETE_CONNECTORS: ConnectorMock[] = COACH_CONNECTORS.filter((c) =>
  ['concept2', 'strava', 'whoop', 'apple-health', 'garmin', 'oura'].includes(c.id),
)
