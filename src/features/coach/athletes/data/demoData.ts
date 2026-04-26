import { SOURCE_CONFIG, type SourceId } from './sourceConfig'

export type SyncSourceStatus = {
  sourceId: SourceId
  syncedLabel: string
  stale: boolean
  connected: boolean
}

export type ErgHistoryRow = {
  date: string
  testType: '2K' | '6K' | '10K' | '30min'
  split500: string
  watts: number
  strokeRate: number
  sourceId: SourceId
  isPr?: boolean
}

export type TimelinePoint = {
  date: string
  ergSplitSec: number
  trainingLoad: number
  recovery: number
  gymVolume: number
  sleepHours: number
  isPr?: boolean
  riskFlag?: 'amber' | 'red'
  coachNote?: boolean
}

type VoiceNote = {
  date: string
  transcript: string
  extracted: string
  tags: string[]
}

export type DemoAthleteOverview = {
  isDemo: true
  athlete: { id: string; name: string; meta: string }
  sourceStatus: SyncSourceStatus[]
  headline: {
    twoK: { value: string; date: string; sourceId: SourceId; trend: 'up' | 'down' | 'flat'; delta: string }
    avgSplit: { value: string; sourceId: SourceId; trend: 'up' | 'down' | 'flat'; delta: string }
    trainingLoad: { value: string; sourceId: SourceId; trend: 'up' | 'down' | 'flat'; delta: string; computedFrom: string[] }
    recovery: { value: string; sourceId: SourceId; trend: 'up' | 'down' | 'flat'; status: 'green' | 'amber' | 'red'; computedFrom: string[] }
    injuryRisk: { level: 'LOW' | 'MED' | 'HIGH'; score: number; factors: string[] }
    dataQuality: { value: string; connectedSources: number; freshness: string; completeness: string }
  }
  ergHistoryRows: ErgHistoryRow[]
  recovery: { concern: string }
  recoveryDetails: {
    recoveryScore: number
    strain: number
    sleepLastNightHours: number
    sleepQualityPct: number
    hrvMs: number
    hrvBaselineMs: number
    restingHrBpm: number
    restingHrBaselineBpm: number
    bodyBattery: number
    readiness: number
    tempDeviationC: number
    stages: { deepHrs: number; remHrs: number; lightHrs: number }
  }
  wellnessCheckins: Array<{ date: string; soreness: number; energy: number; mood: number; sleep: number }>
  trainingPeaks: { planned: string; completed: string; tss: number; plannedTss: number; ctl: number; atl: number; tsb: number }
  gym: {
    compliance: string
    sessions: Array<{ date: string; sourceId: SourceId; summary: string }>
    keyLifts: Array<{ lift: string; value: string; delta: string }>
  }
  strava: string[]
  schedule: Array<{ date: string; items: string; flagged: boolean }>
  scheduleConflict: string
  voiceNotes: VoiceNote[]
  anomaly: string
}

const BASE_OVERVIEW: DemoAthleteOverview = {
  isDemo: true,
  athlete: { id: 'ath-ella-wheeler', name: 'Ella Wheeler', meta: 'Port · Active · FR' },
  sourceStatus: [
    { sourceId: 'google_sheets', syncedLabel: 'synced 1h ago', stale: false, connected: true },
    { sourceId: 'concept2', syncedLabel: 'synced 3h ago', stale: false, connected: true },
    { sourceId: 'strava', syncedLabel: 'synced 30m ago', stale: false, connected: true },
    { sourceId: 'apple_health', syncedLabel: 'synced 6h ago', stale: false, connected: true },
    { sourceId: 'whoop', syncedLabel: 'synced 2h ago', stale: false, connected: true },
    { sourceId: 'bridge', syncedLabel: 'synced 1d ago', stale: false, connected: true },
    { sourceId: 'trainingpeaks', syncedLabel: 'synced 4h ago', stale: false, connected: true },
    { sourceId: 'google_calendar', syncedLabel: 'synced 12m ago', stale: false, connected: true },
    { sourceId: 'garmin', syncedLabel: 'synced 5h ago', stale: false, connected: true },
    { sourceId: 'oura', syncedLabel: 'synced 8h ago', stale: false, connected: true },
    { sourceId: 'synth_computed', syncedLabel: 'computed 2m ago', stale: false, connected: true },
    { sourceId: 'coach_voice', syncedLabel: 'processed 18m ago', stale: false, connected: true },
  ],
  headline: {
    twoK: { value: '6:35.6', date: 'Mar 16, 2026', sourceId: 'concept2', trend: 'up', delta: '-6.9s YoY' },
    avgSplit: { value: '1:38.9', sourceId: 'concept2', trend: 'up', delta: '-1.1s vs 30d' },
    trainingLoad: {
      value: '7.2/10',
      sourceId: 'synth_computed',
      trend: 'up',
      delta: '+0.7 WoW',
      computedFrom: ['Concept2 Logbook', 'Bridge Athletics', 'Strava', 'Google Sheets'],
    },
    recovery: {
      value: '78/100',
      sourceId: 'synth_computed',
      trend: 'flat',
      status: 'green',
      computedFrom: ['Whoop', 'Apple Health', 'Oura Ring', 'Wellness check-ins'],
    },
    injuryRisk: { level: 'LOW', score: 2, factors: ['HRV 10.3% below baseline', 'No acute load spike', 'No injury/illness signals'] },
    dataQuality: { value: '9.4/10', connectedSources: 10, freshness: '95%', completeness: '94%' },
  },
  ergHistoryRows: [
    { date: 'Apr 20, 2026', testType: '2K', split500: '1:39.5', watts: 305, strokeRate: 33, sourceId: 'google_sheets' },
    { date: 'Apr 14, 2026', testType: '2K', split500: '1:40.3', watts: 298, strokeRate: 32, sourceId: 'google_sheets' },
    { date: 'Apr 7, 2026', testType: '2K', split500: '1:39.4', watts: 307, strokeRate: 34, sourceId: 'google_sheets' },
    { date: 'Mar 16, 2026', testType: '2K', split500: '1:38.9', watts: 312, strokeRate: 35, sourceId: 'concept2', isPr: true },
    { date: 'Feb 9, 2026', testType: '6K', split500: '1:48.7', watts: 246, strokeRate: 29, sourceId: 'concept2' },
    { date: 'Jan 28, 2026', testType: '30min', split500: '1:49.1', watts: 244, strokeRate: 28, sourceId: 'concept2' },
  ],
  recovery: { concern: 'HRV is 10.3% below baseline for the past week' },
  recoveryDetails: {
    recoveryScore: 78,
    strain: 14.2,
    sleepLastNightHours: 7.4,
    sleepQualityPct: 92,
    hrvMs: 52,
    hrvBaselineMs: 58,
    restingHrBpm: 54,
    restingHrBaselineBpm: 52,
    bodyBattery: 65,
    readiness: 74,
    tempDeviationC: 0.2,
    stages: { deepHrs: 1.8, remHrs: 1.9, lightHrs: 3.2 },
  },
  wellnessCheckins: [
    { date: 'Apr 24', soreness: 3, energy: 8, mood: 8, sleep: 8 },
    { date: 'Apr 23', soreness: 4, energy: 7, mood: 8, sleep: 7 },
    { date: 'Apr 22', soreness: 6, energy: 5, mood: 6, sleep: 5 },
    { date: 'Apr 21', soreness: 5, energy: 6, mood: 7, sleep: 7 },
  ],
  trainingPeaks: { planned: '5 water, 2 erg, 3 gym, 1 rest', completed: '4 water, 2 erg, 3 gym, 0 rest', tss: 487, plannedTss: 520, ctl: 72, atl: 85, tsb: -13 },
  gym: {
    compliance: '3 of 4 planned sessions completed this week',
    sessions: [
      { date: 'Apr 21', sourceId: 'bridge', summary: 'Back Squat 4×6 @ 135lb · Romanian Deadlift 3×8 @ 115lb · Bent Row 3×10 @ 85lb' },
      { date: 'Apr 18', sourceId: 'bridge', summary: 'Power Clean 5×3 @ 95lb · Front Squat 4×5 @ 115lb · Pull-ups 4×8 BW' },
      { date: 'Apr 14', sourceId: 'google_sheets', summary: 'Back Squat 4×6 @ 130lb · Hip Thrust 3×10 @ 155lb · Plank Hold 3×45s' },
    ],
    keyLifts: [
      { lift: 'Squat', value: '140lb', delta: '+5lb this month' },
      { lift: 'Deadlift', value: '165lb', delta: 'plateau' },
      { lift: 'Clean', value: '100lb', delta: '+5lb this month' },
      { lift: 'Bench', value: '95lb', delta: '-2lb this month' },
    ],
  },
  strava: [
    'Apr 22: Run 5.2km · 26:14 · avg HR 152',
    'Apr 19: Run 4.8km · 25:01 · avg HR 148',
    'Apr 16: Cycle 18.3km · 42:30 · avg HR 138',
    'Apr 12: Run 5.0km · 25:45 · avg HR 150',
  ],
  schedule: [
    { date: 'Apr 24', items: 'AM practice 6:00-8:00 · Classes 10:00-3:00 · Gym 4:30-5:30', flagged: false },
    { date: 'Apr 25', items: 'AM practice 6:00-8:30 (race pace pieces) · Classes 11:00-2:00', flagged: false },
    { date: 'Apr 26', items: 'RACE DAY — Cal Invite Regatta · Report time 5:30 AM', flagged: false },
    { date: 'Apr 27', items: 'Rest day', flagged: false },
    { date: 'Apr 28', items: 'AM practice 6:00-8:00 · Midterm Exam 2:00-4:00', flagged: true },
  ],
  scheduleConflict: 'Apr 28 — heavy academic load + AM practice',
  voiceNotes: [
    {
      date: 'Apr 22',
      transcript:
        "Ella's catch timing has improved significantly since we adjusted her footplate. Still slightly late on the drive connection at high rates. Rate this improvement 7 out of 10.",
      extracted: 'Catch timing improved. Footplate adjustment helped. Drive connection still late at high rates.',
      tags: ['Technique', 'Positive'],
    },
    {
      date: 'Apr 15',
      transcript:
        'Ella moved to bow pair for the V8 today. Looked comfortable. Good blade work but needs to match rate changes faster. Keep her there for Cal Invite.',
      extracted: 'Moved to bow pair V8. Blade work strong. Needs quicker rate-change matching.',
      tags: ['Technique', 'Lineup'],
    },
    {
      date: 'Apr 8',
      transcript:
        "Ella's 2K retest is looking strong in training. Should target sub 6:35 at Cal Invite. Technically the cleanest rower in the bow four.",
      extracted: '2K target sub-6:35. Technical quality highest in bow four.',
      tags: ['Fitness', 'Positive'],
    },
  ],
  anomaly: 'Apr 3 — 7:02 2K split was a coach-confirmed pacing test (intentional).',
}

export function getDemoAthleteOverview(input: {
  id: string
  name: string
  side?: 'port' | 'starboard' | 'both'
  status: 'active' | 'inactive' | 'injured'
  year?: 'FR' | 'SO' | 'JR' | 'SR' | 'GR'
}): DemoAthleteOverview {
  const copy = structuredCloneCompat(BASE_OVERVIEW)
  const seed = hashCode(input.id)
  const deltaSec = ((seed % 11) - 5) * 0.2
  const twoKSec = 395.6 + deltaSec
  const split = twoKSec / 4

  copy.athlete.id = input.id
  copy.athlete.name = input.name
  copy.athlete.meta = `${titleCase(input.side ?? 'both')} · ${titleCase(input.status)} · ${input.year ?? 'SO'}`
  copy.headline.twoK.value = fmtTime(twoKSec)
  copy.headline.avgSplit.value = fmtTime(split)
  copy.headline.trainingLoad.value = `${(6.6 + (seed % 10) * 0.09).toFixed(1)}/10`
  copy.headline.recovery.value = `${72 + (seed % 12)}/100`
  copy.headline.dataQuality.value = `${(8.8 + (seed % 8) * 0.08).toFixed(1)}/10`

  copy.ergHistoryRows = copy.ergHistoryRows.map((row, i) => ({
    ...row,
    split500: fmtTime(split + i * 0.35 + ((seed % 5) - 2) * 0.15),
    watts: row.watts + ((seed + i) % 7) - 3,
    strokeRate: row.strokeRate + (((seed + i) % 3) - 1),
  }))

  return copy
}

export const DEMO_TIMELINE_90_DAY: TimelinePoint[] = buildTimeline90Day()

function buildTimeline90Day() {
  const points: TimelinePoint[] = []
  const start = new Date('2026-01-25T00:00:00.000Z')
  const dayMs = 24 * 60 * 60 * 1000
  for (let i = 0; i < 90; i += 1) {
    const date = new Date(start.getTime() + i * dayMs)
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()
    const dateLabel = `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`
    const weeklyRest = i % 7 === 0 || i % 13 === 0
    const seasonalBase =
      i < 25 ? 5.1 + (i / 25) * 2 : i < 65 ? 7.4 + ((i % 9) - 4) * 0.06 : 7.2 - ((i - 65) / 25) * 1.1
    const noise = (((i * 17) % 11) - 5) * 0.1
    const trainingLoad = weeklyRest ? 2.4 + (i % 3) * 0.25 : clamp(seasonalBase + noise, 2.1, 8.7)
    const recovery = clamp(92 - trainingLoad * 4.1 + (((i * 7) % 5) - 2) * 1.7, 55, 95)
    const ergSplitSec = clamp(100.8 - (i / 90) * 1.9 + (trainingLoad > 8 ? 0.6 : 0) + (((i * 5) % 7) - 3) * 0.08, 97.8, 103.8)
    points.push({
      date: dateLabel,
      trainingLoad: round1(trainingLoad),
      recovery: Math.round(recovery),
      ergSplitSec: round1(ergSplitSec),
      gymVolume: Math.max(0, Math.round(trainingLoad * 22 + (i % 5) * 5)),
      sleepHours: round1(clamp(8.6 - trainingLoad * 0.17 + (weeklyRest ? 0.6 : 0) + (((i * 3) % 5) - 2) * 0.08, 5.8, 9.2)),
      isPr: i === 50,
      riskFlag: i === 58 ? 'amber' : i === 61 ? 'red' : undefined,
      coachNote: i === 73 || i === 80 || i === 87,
    })
  }
  return points
}

export function sourceTooltip(sourceId: SourceId, syncedLabel?: string) {
  const source = SOURCE_CONFIG[sourceId]
  if (!source) return ''
  return `From ${source.label} · Last synced ${syncedLabel ?? 'recently'}`
}

function structuredCloneCompat<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value)) as T
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function round1(v: number) {
  return Math.round(v * 10) / 10
}

function hashCode(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function fmtTime(seconds: number) {
  const mm = Math.floor(seconds / 60)
  const ss = (seconds - mm * 60).toFixed(1).padStart(4, '0')
  return `${mm}:${ss}`
}

function titleCase(v: string) {
  return v.charAt(0).toUpperCase() + v.slice(1)
}

