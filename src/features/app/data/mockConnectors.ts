export type ConnectorMock = {
  id: string
  name: string
  description: string
  brandColor: string
  category: 'Erg' | 'Wearable' | 'Outdoor' | 'Recovery' | 'Planning' | 'Comms' | 'Spreadsheet'
}

export const COACH_CONNECTORS: ConnectorMock[] = [
  { id: 'concept2', name: 'Concept2 Logbook', description: 'Erg history, splits, watt curves', brandColor: '#FF4B33', category: 'Erg' },
  { id: 'strava', name: 'Strava', description: 'On-water + outdoor sessions', brandColor: '#FC4C02', category: 'Outdoor' },
  { id: 'trainingpeaks', name: 'TrainingPeaks', description: 'Coach-authored plans + sync', brandColor: '#1E5BAA', category: 'Planning' },
  { id: 'garmin', name: 'Garmin', description: 'Watch + HR + sleep', brandColor: '#000000', category: 'Wearable' },
  { id: 'whoop', name: 'WHOOP', description: 'Recovery + strain', brandColor: '#000000', category: 'Recovery' },
  { id: 'apple-health', name: 'Apple Health', description: 'Phone + watch wellness', brandColor: '#FF2D55', category: 'Wearable' },
  { id: 'gmail', name: 'Gmail', description: 'Forwarded emails synth ingests', brandColor: '#EA4335', category: 'Comms' },
  { id: 'sheets', name: 'Google Sheets', description: 'Roster + erg tracker spreadsheets', brandColor: '#0F9D58', category: 'Spreadsheet' },
]

export const ATHLETE_CONNECTORS: ConnectorMock[] = [
  { id: 'concept2', name: 'Concept2 Logbook', description: 'Your erg history', brandColor: '#FF4B33', category: 'Erg' },
  { id: 'strava', name: 'Strava', description: 'On-water + run + bike', brandColor: '#FC4C02', category: 'Outdoor' },
  { id: 'whoop', name: 'WHOOP', description: 'Recovery + strain', brandColor: '#000000', category: 'Recovery' },
  { id: 'apple-health', name: 'Apple Health', description: 'Watch + phone wellness', brandColor: '#FF2D55', category: 'Wearable' },
  { id: 'garmin', name: 'Garmin', description: 'Watch + HR + sleep', brandColor: '#000000', category: 'Wearable' },
  { id: 'oura', name: 'Oura', description: 'Sleep + readiness', brandColor: '#000000', category: 'Recovery' },
]
