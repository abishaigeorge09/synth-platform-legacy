/**
 * Core TS types matching docs/SCHEMA.md. Hand-rolled so the UI can consume
 * seed data today and live Supabase queries later without changing shape.
 */

export type UUID = string
export type ISODate = string // YYYY-MM-DD
export type ISODateTime = string // ISO 8601

// ─── Identity ──────────────────────────────────────────────────────────────

export type UserRole = 'head_coach' | 'assistant_coach' | 'athlete'

export type Team = {
  id: UUID
  name: string
  sport: string
  inviteCode: string
  createdAt: ISODateTime
}

export type User = {
  id: UUID
  email: string
  name: string
  role: UserRole
  teamId: UUID | null
  avatarUrl?: string
}

export type AthleteYear = 'FR' | 'SO' | 'JR' | 'SR' | 'GR'
export type RowingSide = 'port' | 'starboard' | 'both'

export type Athlete = {
  id: UUID
  userId: UUID
  teamId: UUID
  name: string
  email?: string
  side?: RowingSide
  weightLbs?: number
  year?: AthleteYear
  status: 'active' | 'inactive' | 'injured'
  avatarColorIndex?: number
}

// ─── Sources & syncing ─────────────────────────────────────────────────────

export type SourceType =
  | 'extension'
  | 'google_sheets'
  | 'google_drive'
  | 'slack'
  | 'teamworks'
  | 'wearable'
  | 'email_digest'
  | 'manual_upload'

export type SourceStatus = 'pending' | 'healthy' | 'stale' | 'failed' | 'disconnected'

export type Source = {
  id: UUID
  teamId: UUID
  name: string
  url?: string
  type: SourceType
  scheduleCron: string | null
  lastScanAt?: ISODateTime
  status: SourceStatus
  configJson?: Record<string, unknown>
  colorKey?: 'primary' | 'cyan' | 'purple' | 'amber' | 'blue'
}

export type ScanLog = {
  id: UUID
  sourceId: UUID
  scannedAt: ISODateTime
  status: 'success' | 'partial' | 'failed'
  durationMs: number
  reportMd: string
  itemsAdded: number
  itemsUpdated: number
  itemsRemoved: number
}

// ─── Sessions, lineups, timing ─────────────────────────────────────────────

export type SessionType = 'practice' | 'race' | 'erg_test' | 'other'

export type Session = {
  id: UUID
  teamId: UUID
  coachId: UUID
  date: ISODate
  type: SessionType
  title: string
  notes?: string
}

export type BoatSize = 1 | 2 | 4 | 8

export type SessionBoat = {
  id: UUID
  sessionId: UUID
  boatName: string
  boatSize: BoatSize
  label: string // '8+', '2x'
}

export type SessionLineup = {
  id: UUID
  sessionBoatId: UUID
  athleteId: UUID
  seatNumber: number
  side: RowingSide
  isCox: boolean
  isPublished: boolean
  publishedAt?: ISODateTime
}

export type SessionSplit = {
  id: UUID
  sessionBoatId: UUID
  splitNumber: number
  elapsedMs: number
  intervalMs: number
  hasVideoMarker: boolean
  notes?: string
}

// ─── Athlete metric projections ────────────────────────────────────────────

export type ErgTestType = '2k' | '6k' | '5k' | '30min' | '60min' | 'pieces' | 'other'

export type ErgScore = {
  id: UUID
  athleteId: UUID
  sessionId?: UUID
  testType: ErgTestType
  timeSeconds: number
  splitSeconds?: number
  spm?: number
  watts?: number
  distanceM?: number
  date: ISODate
}

export type GymExercise = {
  name: string
  sets: number
  reps: number
  weight: number // lbs
}

export type GymSession = {
  id: UUID
  athleteId: UUID
  sessionDate: ISODate
  exercises: GymExercise[]
  durationMin: number
  notes?: string
  totalSets?: number
  totalVolumeLbs?: number
  gymLoadScore?: number
}

export type SleepHrvEntry = {
  id: UUID
  athleteId: UUID
  date: ISODate
  sleepHours: number
  sleepQuality: number // 1-10
  hrvMs: number
  restingHR: number // bpm
}

export type WellnessCheckin = {
  id: UUID
  athleteId: UUID
  date: ISODate
  window: 'morning' | 'post_practice' | 'evening'
  sleepHours?: number
  energy?: number
  soreness?: number
  mood?: number
  hrv?: number
  recovery?: number
  notes?: string
}

// ─── Strava activities ────────────────────────────────────────────────────

export type StravaActivity = {
  id: UUID
  athleteId: UUID
  date: ISODate
  type: 'rowing' | 'run' | 'cycle' | 'walk' | 'yoga'
  title: string
  distanceMeters: number
  durationSeconds: number
  avgHR?: number
  maxHR?: number
  calories?: number
  elevationGain?: number
}

// ─── synth. AI ─────────────────────────────────────────────────────────────

export type ChatScope = 'team' | 'athlete' | 'self'

export type ChatThread = {
  id: UUID
  userId: UUID
  scope: ChatScope
  scopedAthleteId?: UUID
  title: string
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export type ChatMessage = {
  id: UUID
  threadId: UUID
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: ISODateTime
}

// ─── Settings ──────────────────────────────────────────────────────────────

export type AthleteVisibility = {
  showTeamStats: boolean
  showOtherBoats: boolean
  showCoachNotes: boolean
  shareVideos: boolean
  allowPersonalSources: boolean
}

export type TeamSettings = {
  teamId: UUID
  athleteVisibility: AthleteVisibility
  syncDefaults: {
    defaultScanCron: string
    notifyOnStale: boolean
    staleHours: number
  }
}

// ─── Alerts & activity ─────────────────────────────────────────────────────

export type AlertSeverity = 'info' | 'warning' | 'danger'
export type AlertKind = 'wellness' | 'compliance' | 'sync' | 'schedule'

export type Alert = {
  id: UUID
  teamId: UUID
  athleteId?: UUID
  severity: AlertSeverity
  kind: AlertKind
  title: string
  detail: string
  createdAt: ISODateTime
}

export type ActivityItem = {
  id: UUID
  teamId: UUID
  kind: 'scan' | 'session' | 'lineup_published' | 'source_added' | 'athlete_joined'
  title: string
  detail?: string
  at: ISODateTime
}

// ─── Timeline & ingestion (docs/SCHEMA.md §9, DATA_INTELLIGENCE) ─────────

export type TimelineCategory =
  | 'erg'
  | 'gym'
  | 'wellness'
  | 'session_note'
  | 'water'
  | 'cross_training'
  | 'other'

export type AthleteTimelineEvent = {
  id: UUID
  teamId: UUID
  athleteId: UUID
  occurredAt: ISODateTime
  source: string
  category: TimelineCategory
  data: Record<string, unknown>
  confidence: number
  raw?: Record<string, unknown>
}

export type RawIngestKind =
  | 'connector_pull'
  | 'ai_photo'
  | 'ai_voice'
  | 'ai_paste'
  | 'manual_csv'
  | 'email_forward'

export type ConnectorProvider =
  | 'google_sheets'
  | 'google_calendar'
  | 'concept2_logbook'
  | 'strava'
  | 'apple_health'
  | 'health_connect'
  | 'whoop'
  | 'garmin'
  | 'oura'
  | 'trainingpeaks'
  | 'slack'

export type ConnectorAccount = {
  id: UUID
  teamId: UUID
  provider: ConnectorProvider
  displayName: string
  status: 'connected' | 'expired' | 'revoked' | 'error'
  lastSyncAt?: ISODateTime
}

export type AiImportKind = 'photo' | 'voice' | 'paste'

export type AiImportJobStatus = 'pending' | 'preview' | 'confirmed' | 'failed' | 'cancelled'

export type AiImportJob = {
  id: UUID
  teamId: UUID
  kind: AiImportKind
  status: AiImportJobStatus
  previewSummary?: string
  previewRows?: Record<string, unknown>[]
  createdAt: ISODateTime
}

export type MetricKind = 'training_load' | 'recovery' | 'risk' | 'data_quality'

export type MetricSnapshot = {
  id: UUID
  teamId: UUID
  athleteId: UUID
  asOf: ISODateTime
  kind: MetricKind
  value: number
  detail?: Record<string, unknown>
}

export type WritebackDestination = 'google_sheet' | 'timeline' | 'athlete_note'

export type WritebackIntent = {
  id: UUID
  label: string
  destination: WritebackDestination
  payloadSummary: string
  confirmed: boolean
}
