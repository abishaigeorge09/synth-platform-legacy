export type SourceId =
  | 'google_sheets'
  | 'concept2'
  | 'strava'
  | 'apple_health'
  | 'whoop'
  | 'bridge'
  | 'trainingpeaks'
  | 'google_calendar'
  | 'coach_voice'
  | 'garmin'
  | 'oura'
  | 'synth_computed'

export type SourceConfig = {
  id: SourceId
  label: string
  color: string
  detail: string
}

export const SOURCE_CONFIG: Record<SourceId, SourceConfig> = {
  google_sheets: {
    id: 'google_sheets',
    label: 'Google Sheets',
    color: '#34A853',
    detail: "Coach's manual data",
  },
  concept2: {
    id: 'concept2',
    label: 'Concept2 Logbook',
    color: '#3B82F6',
    detail: 'Official erg data',
  },
  strava: {
    id: 'strava',
    label: 'Strava',
    color: '#FC4C02',
    detail: 'Activities and cross-training',
  },
  apple_health: {
    id: 'apple_health',
    label: 'Apple Health',
    color: '#FF2D55',
    detail: 'Sleep, HRV, resting HR',
  },
  whoop: {
    id: 'whoop',
    label: 'Whoop',
    color: '#00F19F',
    detail: 'Recovery, strain, sleep',
  },
  bridge: {
    id: 'bridge',
    label: 'Bridge Athletics',
    color: '#4A90D9',
    detail: 'Gym/S&C workouts',
  },
  trainingpeaks: {
    id: 'trainingpeaks',
    label: 'TrainingPeaks',
    color: '#FFD700',
    detail: 'Planned vs actual training',
  },
  google_calendar: {
    id: 'google_calendar',
    label: 'Google Calendar',
    color: '#4285F4',
    detail: 'Schedule and conflicts',
  },
  coach_voice: {
    id: 'coach_voice',
    label: 'Coach Voice Note',
    color: '#8B5CF6',
    detail: 'Qualitative observations',
  },
  garmin: {
    id: 'garmin',
    label: 'Garmin Connect',
    color: '#3B82F6',
    detail: 'Body battery and resting HR',
  },
  oura: {
    id: 'oura',
    label: 'Oura Ring',
    color: '#FFD700',
    detail: 'Sleep stages and readiness',
  },
  synth_computed: {
    id: 'synth_computed',
    label: 'synth. (computed)',
    color: '#10B981',
    detail: 'Algorithm-generated scores',
  },
}

