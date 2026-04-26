import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { PageHeader } from '../dashboard/components/PageHeader'
import { THEME } from '../../../lib/theme'
import { useAthletes } from '../../../shared/data/queries'
import { QueryError } from '../../../shared/components/QueryError'
import { toast } from '../../../shared/store/useToastStore'
import { WorkflowFlowBoard } from './components/WorkflowFlowBoard'
import { GoogleSheetsEmbed } from './components/GoogleSheetsEmbed'
import { SEED_GYM_SESSIONS } from '../../../shared/data/seeds'
import {
  CONCEPT2_ROWS,
  INFERENCE_LOG,
  SOURCE_HEALTH,
  STRAVA_ACTIVITIES,
  TEAM_ROSTER,
  VOICE_NOTES,
} from './data/demoConnectorsData'

// ── Tab definitions ──────────────────────────────────────────────────────────

type DataViewTabId =
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

const SOURCE_TABS: { id: DataViewTabId; label: string; color: string }[] = [
  { id: 'workflow',        label: 'Workflow',       color: '#059669' },
  { id: 'google-sheets',  label: 'Google Sheets',  color: '#34A853' },
  { id: 'concept2',       label: 'Concept2',       color: '#1A1A2E' },
  { id: 'strava',         label: 'Strava',         color: '#FC4C02' },
  { id: 'apple-health',   label: 'Apple Health',   color: '#FF2D55' },
  { id: 'whoop',          label: 'Whoop',          color: '#00F19F' },
  { id: 'bridge',         label: 'Bridge',         color: '#4A90D9' },
  { id: 'trainingpeaks',  label: 'TrainingPeaks',  color: '#FFD700' },
  { id: 'google-calendar',label: 'Calendar',       color: '#4285F4' },
  { id: 'garmin',         label: 'Garmin',         color: '#007CC3' },
  { id: 'oura',           label: 'Oura',           color: '#C0C0C0' },
  { id: 'coach-notes',    label: 'Coach Notes',    color: '#8B5CF6' },
  { id: 'ai-import',      label: 'AI Import',      color: '#8B5CF6' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtShort(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

function statusPill(status: string): React.CSSProperties {
  if (status === 'healthy') return { background: 'rgba(16,185,129,0.14)', color: THEME.primary, fontFamily: THEME.fontMono }
  if (status === 'stale')   return { background: 'rgba(245,158,11,0.14)', color: THEME.amber, fontFamily: THEME.fontMono }
  if (status === 'failed')  return { background: 'rgba(239,68,68,0.14)', color: THEME.red, fontFamily: THEME.fontMono }
  return { background: 'rgba(161,161,170,0.14)', color: THEME.textSecondary, fontFamily: THEME.fontMono }
}

// ── Strava helpers ────────────────────────────────────────────────────────────

function ActivityBadge({ type }: { type: string }) {
  const t = type.toLowerCase()
  let label = 'ACT', bg = 'rgba(161,161,170,0.14)', color: string = THEME.textSecondary
  if (t === 'run')                       { label = 'RUN'; bg = 'rgba(5,150,105,0.12)';   color = THEME.primary }
  else if (t === 'row' || t === 'rowing'){ label = 'ROW'; bg = 'rgba(59,130,246,0.12)';  color = THEME.blue }
  else if (t === 'cycle'|| t==='cycling'){ label = 'CYC'; bg = 'rgba(6,182,212,0.12)';   color = THEME.cyan }
  else if (t === 'walk')                 { label = 'WLK'; bg = 'rgba(245,158,11,0.12)';  color = THEME.amber }
  return (
    <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wider"
      style={{ background: bg, color, fontFamily: THEME.fontMono }}>
      {label}
    </span>
  )
}

function HrIndicator({ hr }: { hr?: number }) {
  if (!hr) return null
  const color = hr > 165 ? THEME.red : hr > 155 ? THEME.amber : THEME.primary
  return <span className="text-[11px] font-semibold" style={{ fontFamily: THEME.fontMono, color }}>♥ {hr}</span>
}

function HrZoneBar({ avgHr }: { avgHr?: number }) {
  if (!avgHr) return null
  const zones =
    avgHr < 130 ? [60, 25, 10, 4, 1] :
    avgHr < 145 ? [20, 45, 25, 8, 2] :
    avgHr < 160 ? [5, 15, 45, 25, 10] :
    [2, 8, 20, 40, 30]
  const colors = ['#3B82F6', '#22C55E', '#EAB308', '#F97316', '#EF4444']
  return (
    <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
      {zones.map((pct, i) => (
        <div key={i} style={{ width: `${pct}%`, background: colors[i] }} />
      ))}
    </div>
  )
}

// ── Concept2 split sparkline ──────────────────────────────────────────────────

function SplitSparkline({ avgSplitStr }: { avgSplitStr: string }) {
  const parts = avgSplitStr.split(':')
  const mm = parseInt(parts[0] ?? '1', 10)
  const ss = parseFloat(parts[1] ?? '40')
  const base = mm * 60 + ss
  const splits = [base - 1.2, base + 0.3, base + 0.8, base + 0.1]
  const max = Math.max(...splits) + 1
  const min = Math.min(...splits) - 1
  return (
    <div style={{ display: 'flex', gap: 2, height: 24, alignItems: 'flex-end' }}>
      {splits.map((s, i) => (
        <div key={i} style={{
          width: 12,
          borderRadius: 2,
          height: `${Math.round(((max - s) / (max - min)) * 100)}%`,
          background: i === 0 ? THEME.primary : THEME.border,
          minHeight: 4,
        }} />
      ))}
    </div>
  )
}

// ── Apple Health data ────────────────────────────────────────────────────────

const DAYS_14 = ['Mo','Tu','We','Th','Fr','Sa','Su','Mo','Tu','We','Th','Fr','Sa','Su'] as const

const sleepData = Array.from({ length: 14 }, (_, i) => ({
  day: DAYS_14[i],
  hours: [7.2, 6.8, 7.4, 7.1, 5.8, 7.5, 7.3, 6.9, 7.2, 7.0, 7.4, 6.5, 8.1, 7.3][i],
}))

const hrvData = Array.from({ length: 14 }, (_, i) => ({
  day: DAYS_14[i],
  hrv: [52, 48, 51, 47, 44, 55, 53, 49, 48, 50, 46, 44, 52, 48][i],
  baseline: 52,
}))

const restingHrData = Array.from({ length: 14 }, (_, i) => ({
  day: DAYS_14[i],
  hr: [53, 54, 52, 55, 57, 51, 52, 54, 55, 53, 56, 58, 51, 52][i],
}))

function sleepBarColor(h: number) {
  if (h >= 7.5) return THEME.primary
  if (h >= 6.5) return THEME.amber
  return THEME.red
}

// ── Week calendar events ──────────────────────────────────────────────────────

const CAL_WEEK_EVENTS: { day: number; time: string; title: string; color: string }[] = [
  { day: 0, time: '6:00 AM',  title: 'Practice — Race Pace',    color: '#059669' },
  { day: 0, time: '4:00 PM',  title: 'Gym S&C',                 color: '#4A90D9' },
  { day: 1, time: '6:00 AM',  title: 'Practice — Steady State', color: '#059669' },
  { day: 2, time: '',         title: 'Rest Day',                 color: '#6B7280' },
  { day: 3, time: '6:00 AM',  title: 'Race Prep Pieces',         color: '#059669' },
  { day: 3, time: '4:00 PM',  title: 'Gym S&C',                 color: '#4A90D9' },
  { day: 4, time: '6:00 AM',  title: 'Shakeout Row',            color: '#059669' },
]

const WEEK_DAYS = ['Mon Apr 21', 'Tue Apr 22', 'Wed Apr 23', 'Thu Apr 24', 'Fri Apr 25']

// ── TrainingPeaks weekly plan ────────────────────────────────────────────────

const WEEK_PLAN = [
  { day: 'Mon', planned: '60m SS',   actual: '62m',     done: true },
  { day: 'Tue', planned: '45m AT',   actual: '44m',     done: true },
  { day: 'Wed', planned: 'Rest',     actual: 'Rest',    done: true },
  { day: 'Thu', planned: '5×500m',   actual: '5×500m',  done: true },
  { day: 'Fri', planned: 'Shakeout', actual: null,      done: false },
  { day: 'Sat', planned: 'RACE DAY', actual: null,      done: false },
]

// ── AI Import mock data ──────────────────────────────────────────────────────

const AI_IMPORTS = [
  {
    id: 'aim-1',
    sourceType: 'Email attachment',
    extracted: 'Erg scores for 8 athletes from Apr 19 test',
    athlete: 'Team-wide',
    status: 'imported',
  },
  {
    id: 'aim-2',
    sourceType: 'PDF race program',
    extracted: 'Cal Invite start list · 1V draw at lane 3',
    athlete: 'Team-wide',
    status: 'imported',
  },
  {
    id: 'aim-3',
    sourceType: 'Image (whiteboard photo)',
    extracted: 'Workout intervals: 4×8min at 2:02 w/ 4min rest',
    athlete: 'All',
    status: 'pending',
  },
]

// ── AI button suggestions by tab ──────────────────────────────────────────────

const TAB_SUGGESTIONS: Partial<Record<DataViewTabId, string[]>> = {
  'workflow':        ['What changed since last sync?', 'Summarize source health', 'Flag any anomalies'],
  'google-sheets':   ['Summarize the erg workbook', 'Who improved the most YoY?', 'Filter to Wheeler'],
  'concept2':        ['Who hit a 2K PR today?', 'Compare Phelps vs Wheeler', 'Show 6K leaders'],
  'strava':          ['Weekly mileage trend?', 'Who is training most cross-sport?', 'Flag overtraining risk'],
  'apple-health':    ['Summarize recovery trends', 'Who has lowest HRV?', 'Sleep compliance this week'],
  'whoop':           ['Why did Whoop disconnect?', 'Last recovery snapshot', 'Reconnect steps'],
  'bridge':          ['Summarize gym load this week', 'Who needs deload?', 'Squat PRs this month'],
  'trainingpeaks':   ['TSS compliance today?', 'Who is behind plan?', 'Weekly load summary'],
  'google-calendar': ['What is next on the schedule?', 'Distance to Cal Invite', 'Show travel days'],
  'coach-notes':     ['Summarize notes for Wheeler', "What's the recovery watchlist?", 'Technique themes'],
  'ai-import':       ['What was imported today?', 'Review pending items', 'Import status summary'],
}

// ── Tab content components ────────────────────────────────────────────────────

function StravaTab() {
  const health = SOURCE_HEALTH.find((s) => s.id === 'strava')
  const chartData = STRAVA_ACTIVITIES.map((a) => ({
    name: a.athlete.split(' ')[1] ?? a.athlete,
    km: a.distanceKm,
  }))
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4"
        style={{ borderColor: THEME.border, background: THEME.white }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>Strava</span>
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={statusPill('stale')}>stale</span>
          </div>
          <div className="mt-0.5 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            416 activities · last sync {health ? fmtShort(health.lastSyncAt) : '—'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>Weekly mileage</div>
          <div className="text-[22px] font-semibold leading-none" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
            40.3 <span className="text-[13px]" style={{ color: THEME.textMuted }}>km</span>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border px-5 pb-3 pt-4" style={{ borderColor: THEME.border, background: THEME.white }}>
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Recent activity distances (km)
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData} barSize={24} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontFamily: THEME.fontMono, fontSize: 11, borderRadius: 8, border: `1px solid ${THEME.border}` }} formatter={(v: number) => [`${v} km`, 'Distance']} />
            <Bar dataKey="km" fill={THEME.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {STRAVA_ACTIVITIES.map((a) => (
          <div key={a.id} className="rounded-2xl border px-4 py-3" style={{ borderColor: THEME.border, background: THEME.white, borderLeft: `3px solid #FC4C02` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <ActivityBadge type={a.type} />
                <div>
                  <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>{a.athlete}</div>
                  <div className="mt-0.5 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{a.at}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[16px] font-semibold leading-tight" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
                  {a.distanceKm} <span className="text-[11px]" style={{ color: THEME.textMuted }}>km</span>
                </div>
                <div className="mt-0.5 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{a.duration} · {a.pace}</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
              <HrIndicator hr={a.avgHr} />
              <span style={{ color: THEME.textMuted }}>Effort <span style={{ color: THEME.textPrimary, fontWeight: 600 }}>{a.effort}/10</span></span>
            </div>
            <HrZoneBar avgHr={a.avgHr} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AppleHealthTab() {
  const health = SOURCE_HEALTH.find((s) => s.id === 'apple-health')
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4"
        style={{ borderColor: THEME.border, background: THEME.white }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>Apple Health</span>
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={statusPill('healthy')}>healthy</span>
          </div>
          <div className="mt-0.5 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            2,201 records · synced {health ? fmtShort(health.lastSyncAt) : '12m ago'}
          </div>
        </div>
        <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>Star Miller · Apr 24, 2026</div>
      </div>

      {/* Sleep chart */}
      <div className="rounded-2xl border px-5 pb-3 pt-4" style={{ borderColor: THEME.border, background: THEME.white }}>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Sleep (hrs) — 14 days
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={sleepData} barSize={16} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
            <YAxis domain={[4, 10]} tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontFamily: THEME.fontMono, fontSize: 11, borderRadius: 8, border: `1px solid ${THEME.border}` }} formatter={(v: number) => [`${v}h`, 'Sleep']} />
            <ReferenceLine y={7} stroke={THEME.amber} strokeDasharray="4 2" />
            {sleepData.map((d, i) => (
              <Bar key={i} dataKey="hours" fill={sleepBarColor(d.hours)} radius={[3, 3, 0, 0]} hide={false} />
            ))}
            <Bar dataKey="hours" fill={THEME.primary} radius={[3, 3, 0, 0]}
              // Custom fill per bar via Cell would need extra import; use single fill as fallback
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* HRV chart */}
      <div className="rounded-2xl border px-5 pb-3 pt-4" style={{ borderColor: THEME.border, background: THEME.white }}>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          HRV (ms) — 14 days
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={hrvData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
            <YAxis domain={[35, 65]} tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontFamily: THEME.fontMono, fontSize: 11, borderRadius: 8, border: `1px solid ${THEME.border}` }} />
            <ReferenceLine y={52} stroke={THEME.textMuted} strokeDasharray="4 2" label={{ value: 'baseline', fontSize: 9, fill: THEME.textMuted }} />
            <Line type="monotone" dataKey="hrv" stroke={THEME.primary} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Resting HR chart */}
      <div className="rounded-2xl border px-5 pb-3 pt-4" style={{ borderColor: THEME.border, background: THEME.white }}>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Resting HR (bpm) — 14 days
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={restingHrData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
            <YAxis domain={[46, 64]} tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontFamily: THEME.fontMono, fontSize: 11, borderRadius: 8, border: `1px solid ${THEME.border}` }} />
            <Line type="monotone" dataKey="hr" stroke={THEME.cyan} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function WhoopTab() {
  const WHOOP_PREVIEW = [
    { label: 'Recovery Score', value: '72%' },
    { label: 'HRV',            value: '48ms' },
    { label: 'Resting HR',     value: '52bpm' },
    { label: 'Sleep',          value: '7.1h' },
  ]
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border px-5 py-4" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>Whoop</span>
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={statusPill('failed')}>Failed</span>
            </div>
            <div className="mt-2 text-[12px]" style={{ color: THEME.textSecondary }}>
              Token expired Apr 24 at 3:11 AM — re-authenticate to resume sync
            </div>
          </div>
          <button type="button"
            className="shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold tracking-wide"
            style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
            onClick={() => toast('Reconnect demo', 'info')}>
            Reconnect Whoop →
          </button>
        </div>
      </div>
      <div className="rounded-2xl border px-5 py-4" style={{ borderColor: THEME.border, background: THEME.white }}>
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Last synced snapshot (reconnect to view live data)
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WHOOP_PREVIEW.map((m) => (
            <div key={m.label} className="rounded-xl border px-4 py-3"
              style={{ borderColor: THEME.border, background: THEME.light }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                {m.label}
              </div>
              <div className="mt-2 text-[24px] font-semibold leading-none select-none"
                style={{ fontFamily: THEME.fontMono, color: THEME.textMuted, filter: 'blur(5px)' }}>
                {m.value}
              </div>
              <div className="mt-2 text-[10px]" style={{ color: THEME.textMuted }}>reconnect to view</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GoogleCalendarTab() {
  const health = SOURCE_HEALTH.find((s) => s.id === 'google-calendar')
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4"
        style={{ borderColor: THEME.border, background: THEME.white }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>Practice Calendar</span>
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={statusPill('healthy')}>synced</span>
          </div>
          <div className="mt-0.5 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            {health ? `Last sync ${fmtShort(health.lastSyncAt)}` : "Google Calendar · Cal Women's Rowing"}
          </div>
        </div>
        <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>Week of Apr 21–25, 2026</div>
      </div>

      {/* Week grid */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: THEME.border, background: THEME.white }}>
        <div className="grid" style={{ gridTemplateColumns: `repeat(5, 1fr)`, borderBottom: `1px solid ${THEME.border}` }}>
          {WEEK_DAYS.map((d) => (
            <div key={d} className="px-3 py-2 text-[11px] font-semibold text-center"
              style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary, borderRight: `1px solid ${THEME.border}` }}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: `repeat(5, 1fr)`, minHeight: 120 }}>
          {WEEK_DAYS.map((_, dayIdx) => {
            const events = CAL_WEEK_EVENTS.filter((e) => e.day === dayIdx)
            return (
              <div key={dayIdx} className="p-2 space-y-1"
                style={{ borderRight: dayIdx < 4 ? `1px solid ${THEME.border}` : 'none', minHeight: 100 }}>
                {events.length === 0 ? (
                  <div className="text-[10px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>—</div>
                ) : events.map((ev, i) => (
                  <div key={i} className="rounded px-2 py-1 text-[11px] font-medium"
                    style={{ background: `${ev.color}18`, color: ev.color, borderLeft: `2px solid ${ev.color}` }}>
                    {ev.time && <div className="text-[9px] opacity-70">{ev.time}</div>}
                    {ev.title}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Next week regatta */}
      <div className="rounded-2xl border px-5 py-4" style={{ borderColor: 'rgba(5,150,105,0.3)', background: 'rgba(5,150,105,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-14 shrink-0 flex-col items-center justify-center rounded-lg"
            style={{ background: 'rgba(5,150,105,0.1)', border: `1px solid ${THEME.primary}` }}>
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>Apr</div>
            <div className="text-[16px] font-semibold leading-tight" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>26</div>
          </div>
          <div>
            <div className="text-[14px] font-bold" style={{ color: THEME.primary }}>CAL INVITE REGATTA</div>
            <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>5:45 AM call time · Briones Reservoir, Orinda CA</div>
          </div>
          <span className="ml-auto rounded-full px-3 py-1 text-[10px] font-semibold"
            style={{ background: 'rgba(5,150,105,0.12)', color: THEME.primary, fontFamily: THEME.fontMono }}>
            NEXT
          </span>
        </div>
      </div>
    </div>
  )
}

function BridgeTab() {
  const health = SOURCE_HEALTH.find((s) => s.id === 'bridge')
  const sessions = SEED_GYM_SESSIONS.slice(0, 3)
  const PREV_WEIGHTS: Record<string, number> = {
    'Back Squat': 180, 'Romanian Deadlift': 145, 'Bent-Over Row': 90, 'Hanging Leg Raise': 0,
    'Trap Bar Deadlift': 215, 'Single-Leg Press': 130, 'Pull-Ups': 0, 'Pallof Press': 25,
    'Front Squat': 145, 'Barbell Hip Thrust': 175, 'Dumbbell Bench Row': 40, 'Ab Wheel Rollout': 0,
  }
  function trendArrow(name: string, weight: number) {
    const prev = PREV_WEIGHTS[name] ?? weight
    if (weight > prev) return <span style={{ color: THEME.primary }}>↑</span>
    if (weight < prev) return <span style={{ color: THEME.red }}>↓</span>
    return <span style={{ color: THEME.textMuted }}>→</span>
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4"
        style={{ borderColor: THEME.border, background: THEME.white }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>Bridge Athletics</span>
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={statusPill('healthy')}>healthy</span>
          </div>
          <div className="mt-0.5 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            {health?.records ?? 188} sessions synced · last sync {health ? fmtShort(health.lastSyncAt) : '—'}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className="rounded-2xl border px-5 py-4"
            style={{ borderColor: THEME.border, background: THEME.white, borderLeft: '3px solid #4A90D9' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                {s.athleteId.replace('athlete-', '').split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')}
              </div>
              <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                {s.sessionDate} · {s.durationMin}min
              </div>
            </div>
            <div className="space-y-1">
              {s.exercises.map((ex) => (
                <div key={ex.name} className="flex items-center justify-between text-[12px]"
                  style={{ color: THEME.textSecondary }}>
                  <span style={{ color: THEME.textPrimary }}>{ex.name}</span>
                  <span style={{ fontFamily: THEME.fontMono }}>
                    {ex.sets}×{ex.reps}{ex.weight > 0 ? ` @ ${ex.weight}lbs` : ''}&nbsp;
                    {trendArrow(ex.name, ex.weight)}
                  </span>
                </div>
              ))}
            </div>
            {s.notes && (
              <div className="mt-2 text-[11px] italic" style={{ color: THEME.textMuted }}>
                {s.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TrainingPeaksTab() {
  const donePct = WEEK_PLAN.filter((d) => d.done).length / WEEK_PLAN.length * 100
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border px-5 py-4" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>TrainingPeaks</span>
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={statusPill('pending')}>Connecting…</span>
            </div>
            <div className="mt-2 text-[12px]" style={{ color: THEME.textSecondary }}>
              TrainingPeaks integration pending — check back after configuration
            </div>
          </div>
          <Link to="/coach/sources/connectors"
            className="shrink-0 rounded-full border px-4 py-2 text-[12px] font-semibold tracking-wide"
            style={{ borderColor: THEME.primary, color: THEME.primary, fontFamily: THEME.fontMono, background: 'transparent' }}>
            Configure in Connectors →
          </Link>
        </div>
      </div>

      {/* Weekly compliance bar */}
      <div className="rounded-2xl border px-5 py-4" style={{ borderColor: THEME.border, background: THEME.white }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Weekly plan compliance
          </div>
          <div className="text-[12px] font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
            {Math.round(donePct)}%
          </div>
        </div>
        <div className="overflow-hidden rounded-full h-2 mb-4" style={{ background: THEME.border }}>
          <div style={{ width: `${donePct}%`, height: '100%', background: THEME.primary, borderRadius: 9999, transition: 'width 0.5s' }} />
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
          {WEEK_PLAN.map((d) => (
            <div key={d.day} className="rounded-xl border px-2 py-2 text-center"
              style={{ borderColor: d.done ? 'rgba(5,150,105,0.3)' : THEME.border, background: d.done ? 'rgba(5,150,105,0.06)' : THEME.light }}>
              <div className="text-[10px] font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{d.day}</div>
              <div className="text-[10px] mt-1" style={{ color: THEME.textSecondary }}>{d.planned}</div>
              {d.actual && <div className="text-[10px] font-semibold mt-0.5" style={{ color: THEME.primary }}>{d.actual}</div>}
              <div className="mt-1 text-[12px]">{d.done ? '✓' : '○'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border px-5 py-4" style={{ borderColor: THEME.border, background: THEME.white }}>
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Once connected, you'll see
        </div>
        <div className="space-y-2">
          {['TSS / CTL / ATL load metrics', 'Planned vs actual workout comparison', 'HR zone distribution per session', 'Power-based training zones'].map((item) => (
            <div key={item} className="flex items-center gap-3 text-[12px]" style={{ color: THEME.textSecondary }}>
              <span style={{ color: THEME.textMuted }}>○</span>{item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CoachNotesTab() {
  return (
    <div className="space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
        Coach Notes
      </div>
      {VOICE_NOTES.map((n) => (
        <div key={n.id} className="rounded-2xl border p-4"
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)', borderLeft: '3px solid #8B5CF6' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{n.athlete}</div>
              <div className="mt-1 text-[11px]" style={{ fontFamily: THEME.fontMono, color: 'var(--text-tertiary)' }}>{n.at}</div>
            </div>
            <div className="flex flex-wrap gap-1">
              {n.tags.map((t) => (
                <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', fontFamily: THEME.fontMono }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded-xl border p-3" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface-raised)' }}>
            <div className="text-[12px]" style={{ color: 'var(--text-primary)' }}>{n.transcript}</div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button"
              className="rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontFamily: THEME.fontMono, border: 'none', cursor: 'pointer' }}
              onClick={() => toast('Audio playback demo', 'info')}>
              ▶ Play recording
            </button>
            {n.extracted.map((e) => (
              <span key={e} className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: 'var(--green-subtle)', color: 'var(--green-primary)' }}>{e}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AiImportTab() {
  return (
    <div className="space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
        AI Import — Extracted records
      </div>
      {AI_IMPORTS.map((item) => (
        <div key={item.id} className="rounded-2xl border p-4"
          style={{ borderColor: THEME.border, background: THEME.white, borderLeft: '3px solid #8B5CF6' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                {item.sourceType}
              </div>
              <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>{item.extracted}</div>
              <div className="mt-1 text-[11px]" style={{ color: THEME.textSecondary }}>Matched: {item.athlete}</div>
            </div>
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={item.status === 'imported' ? { background: 'rgba(16,185,129,0.14)', color: THEME.primary, fontFamily: THEME.fontMono } : { background: 'rgba(245,158,11,0.14)', color: THEME.amber, fontFamily: THEME.fontMono }}>
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function GarminOuraTab({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: THEME.white }}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
        {label}
      </div>
      <div className="mt-3 text-[12px]" style={{ color: THEME.textSecondary }}>
        Connect {label} in Connectors to view data here.
      </div>
      <Link to="/coach/sources/connectors"
        className="mt-3 inline-block rounded-full border px-4 py-2 text-[12px] font-semibold"
        style={{ borderColor: THEME.primary, color: THEME.primary, fontFamily: THEME.fontMono }}>
        Configure →
      </Link>
    </div>
  )
}

// ── Floating AI button ────────────────────────────────────────────────────────

function FloatingAiButton({ tab }: { tab: DataViewTabId }) {
  const [open, setOpen] = useState(false)
  const suggestions = TAB_SUGGESTIONS[tab] ?? ['Ask about this data source', 'Summarize recent activity']
  const tabLabel = SOURCE_TABS.find((t) => t.id === tab)?.label ?? tab
  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-5 z-30 grid h-12 w-12 place-items-center rounded-full"
        style={{ background: 'var(--purple-primary)', color: 'white' }}
        aria-label="Open synth. AI">
        s.
      </button>
      {open && (
        <motion.div
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed bottom-6 right-20 z-30 w-[360px] rounded-2xl border p-4 shadow-lg"
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: 'var(--text-tertiary)' }}>
              synth. AI · {tabLabel}
            </div>
            <button type="button" onClick={() => setOpen(false)} style={{ color: 'var(--text-tertiary)' }}>✕</button>
          </div>
          <div className="mt-3 space-y-2">
            {suggestions.map((s) => (
              <button key={s} type="button"
                className="w-full rounded-xl border px-3 py-2 text-left text-[12px]"
                style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface-raised)', color: 'var(--text-primary)', fontFamily: THEME.fontSans, cursor: 'pointer' }}
                onClick={() => toast(`Demo: "${s}"`, 'info')}>
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </>
  )
}

// ── Concept2 rich cards ───────────────────────────────────────────────────────

function Concept2Tab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Concept2 Logbook · 982 records
        </div>
        <button type="button"
          className="text-[11px] font-semibold"
          style={{ color: THEME.primary, fontFamily: THEME.fontMono, background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => toast('Open Concept2 Logbook (demo)', 'info')}>
          Open logbook →
        </button>
      </div>
      {CONCEPT2_ROWS.map((r) => (
        <div key={r.athlete + r.date} className="rounded-2xl border p-4"
          style={{ borderColor: THEME.border, background: THEME.white, borderLeft: '3px solid #1A1A2E' }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-[15px] font-bold" style={{ color: THEME.textPrimary }}>{r.athlete}</div>
              {r.isPr && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold ml-0"
                  style={{ background: 'rgba(5,150,105,0.12)', color: THEME.primary, fontFamily: THEME.fontMono }}>
                  PR
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{r.date} · {r.testType}</div>
              <div className="text-[10px] mt-0.5" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{r.daysSince}d ago</div>
            </div>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { label: 'Time', value: r.split.replace('1:', '6:' /* placeholder, show split as time approx */), actualVal: r.split },
              { label: 'Split', value: r.split },
              { label: 'Watts', value: String(r.watts) },
              { label: 'SPM', value: String(r.strokeRate) },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border px-3 py-2"
                style={{ borderColor: THEME.border, background: THEME.light }}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{m.label}</div>
                <div className="mt-1 text-[18px] font-bold leading-none"
                  style={{ fontFamily: THEME.fontMono, color: m.label === 'Split' ? '#1A1A2E' : THEME.textPrimary }}>
                  {m.label === 'Time' ? m.actualVal : m.value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>Splits</div>
            <SplitSparkline avgSplitStr={r.split} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page component ───────────────────────────────────────────────────────

export function ConnectorsDataViewPage() {
  const { data: athletes, isLoading, isError, error } = useAthletes()
  const [params, setParams] = useSearchParams()
  const tabParam = params.get('tab')
  const athleteParam = params.get('athlete')
  const [athleteQuery, setAthleteQuery] = useState('')

  const tab = useMemo<DataViewTabId>(() => {
    const valid = SOURCE_TABS.some((t) => t.id === tabParam)
    return (valid ? tabParam : 'workflow') as DataViewTabId
  }, [tabParam])

  const selectedAthlete = athleteParam && athleteParam !== 'all' ? athleteParam : 'all'

  const athleteOptions = useMemo(() => {
    const base = athletes.length
      ? athletes.map((a) => ({ id: a.id, name: a.name }))
      : TEAM_ROSTER.map((a) => ({ id: a.id, name: a.name }))
    const q = athleteQuery.trim().toLowerCase()
    const filtered = q ? base.filter((a) => a.name.toLowerCase().includes(q)) : base
    return filtered.slice(0, 30)
  }, [athletes, athleteQuery])

  const highlightAthleteName = useMemo(() => {
    if (selectedAthlete === 'all') return null
    return athletes.find((a) => a.id === selectedAthlete)?.name ??
      TEAM_ROSTER.find((a) => a.id === selectedAthlete)?.name ?? null
  }, [selectedAthlete, athletes])

  if (isError) return <QueryError label="Data view" error={error} />
  if (isLoading) return null

  return (
    <div className="flex min-h-full w-full flex-col pb-16">
      <PageHeader kicker="Sources" title="CONNECTORS DATA VIEW" subtitle="Team-wide raw data workspace with athlete filtering." />

      {/* Athlete filter row */}
      <div className="flex flex-wrap items-center gap-3 px-5 sm:px-10 pb-3 pt-1">
        <div className="rounded-xl border px-3 py-2" style={{ borderColor: THEME.border, background: THEME.white }}>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>Athlete filter</div>
          <div className="mt-2 flex items-center gap-2">
            <select
              value={selectedAthlete}
              onChange={(e) => { params.set('athlete', e.target.value); setParams(params) }}
              className="rounded-lg border px-2 py-1 text-[12px] outline-none"
              style={{ borderColor: THEME.border, background: THEME.light, color: THEME.textPrimary }}>
              <option value="all">All athletes</option>
              {athleteOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input
              value={athleteQuery}
              onChange={(e) => setAthleteQuery(e.target.value)}
              placeholder="Search…"
              className="w-[160px] rounded-lg border px-2 py-1 text-[12px] outline-none"
              style={{ borderColor: THEME.border, background: THEME.light, color: THEME.textPrimary }} />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/coach/sources/connectors"
            className="rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{ borderColor: THEME.border, background: THEME.white, color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
            Connectors
          </Link>
          <span className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>|</span>
          <span className="rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{ background: 'var(--green-subtle)', color: 'var(--green-primary)', fontFamily: THEME.fontMono }}>
            Data View
          </span>
        </div>
      </div>

      {/* Tab bar — top, horizontal scrollable, underline indicator */}
      <div style={{ overflowX: 'auto', borderBottom: '1px solid var(--border-default)', display: 'flex', scrollbarWidth: 'none' }}
        className="px-5 sm:px-10">
        {SOURCE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { params.set('tab', t.id); setParams(params) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
              fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
              borderBottom: tab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: 'transparent', fontFamily: THEME.fontSans,
            }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Athlete filter banner */}
      {selectedAthlete !== 'all' && (
        <div style={{
          background: 'var(--green-subtle)', borderBottom: '1px solid var(--green-primary)',
          padding: '8px 24px', fontSize: 12, color: 'var(--green-primary)',
          fontFamily: THEME.fontMono, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-primary)' }} />
          Filtered to: {highlightAthleteName ?? selectedAthlete}
          <button
            type="button"
            onClick={() => { params.delete('athlete'); setParams(params) }}
            style={{ marginLeft: 8, opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none', color: 'var(--green-primary)' }}>
            ✕ clear
          </button>
        </div>
      )}

      {/* Tab content */}
      <div className="px-5 sm:px-10 pt-5">

        {tab === 'workflow' && (
          <div>
            <WorkflowFlowBoard />
            <details open style={{ marginTop: 24 }}>
              <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: 1, fontFamily: THEME.fontMono, padding: '8px 0', userSelect: 'none' }}>
                SOURCE HEALTH &amp; ACTIVITY LOG
              </summary>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                {/* Source Health */}
                <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: THEME.white }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4"
                    style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>Source health summary</div>
                  <div className="grid gap-2">
                    {SOURCE_HEALTH.map((s) => (
                      <button key={s.id} type="button"
                        className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left"
                        style={{ borderColor: THEME.border, background: THEME.light }}
                        onClick={() => { params.set('tab', s.id); setParams(params) }}>
                        <div>
                          <div className="text-[12px] font-semibold" style={{ color: THEME.textPrimary }}>{s.name}</div>
                          <div className="text-[10px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                            last sync · {fmtShort(s.lastSyncAt)} · {s.records} records
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider"
                            style={statusPill(s.status)}>{s.status}</span>
                          {s.status === 'failed' && (
                            <button type="button"
                              className="text-[11px] font-semibold"
                              style={{ color: THEME.red, fontFamily: THEME.fontMono, background: 'none', border: 'none', cursor: 'pointer' }}
                              onClick={(e) => { e.stopPropagation(); toast(`Reconnecting ${s.name}…`, 'info') }}>
                              Reconnect →
                            </button>
                          )}
                          {s.status === 'stale' && (
                            <button type="button"
                              className="text-[11px] font-semibold"
                              style={{ color: THEME.amber, fontFamily: THEME.fontMono, background: 'none', border: 'none', cursor: 'pointer' }}
                              onClick={(e) => { e.stopPropagation(); toast(`Sync requested for ${s.name}`, 'info') }}>
                              Sync now
                            </button>
                          )}
                          {s.status === 'pending' && (
                            <Link to="/coach/sources/connectors"
                              className="text-[11px] font-semibold"
                              style={{ color: THEME.primary, fontFamily: THEME.fontMono }}
                              onClick={(e) => e.stopPropagation()}>
                              Configure →
                            </Link>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inference Log */}
                <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: THEME.white }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                      style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>Inference log</div>
                    <div className="text-[10px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>demo</div>
                  </div>
                  <div className="grid gap-2">
                    {INFERENCE_LOG.map((l) => (
                      <div key={l.id} className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[12px] font-semibold" style={{ color: THEME.textPrimary }}>{l.title}</div>
                          <span className="text-[10px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{fmtShort(l.at)}</span>
                        </div>
                        <div className="mt-1 text-[11px]" style={{ color: THEME.textSecondary }}>{l.detail}</div>
                        {l.sourceId && (
                          <button type="button"
                            className="mt-2 text-[11px] font-semibold"
                            style={{ color: THEME.primary, fontFamily: THEME.fontMono, background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => { params.set('tab', l.sourceId!); setParams(params) }}>
                            View source →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

        {tab === 'google-sheets' && (
          <GoogleSheetsEmbed highlightAthleteName={highlightAthleteName} />
        )}

        {tab === 'concept2' && <Concept2Tab />}
        {tab === 'strava' && <StravaTab />}
        {tab === 'apple-health' && <AppleHealthTab />}
        {tab === 'whoop' && <WhoopTab />}
        {tab === 'google-calendar' && <GoogleCalendarTab />}
        {tab === 'bridge' && <BridgeTab />}
        {tab === 'trainingpeaks' && <TrainingPeaksTab />}
        {tab === 'coach-notes' && <CoachNotesTab />}
        {tab === 'ai-import' && <AiImportTab />}
        {tab === 'garmin' && <GarminOuraTab label="Garmin" />}
        {tab === 'oura' && <GarminOuraTab label="Oura" />}
      </div>

      <FloatingAiButton tab={tab} />
    </div>
  )
}
