import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { THEME } from '@lib/theme'
import { PageHeader } from '../coach/dashboard/components/PageHeader'
import {
  ATHLETE_BIOMETRICS,
  ATHLETE_CONCEPT2_ROWS,
  ATHLETE_DATA_SOURCES,
  ATHLETE_DATA_TABS,
  ATHLETE_INFERENCE_LOG,
  ATHLETE_STRAVA_ROWS,
  ATHLETE_WORKFLOW_CANVAS,
  ATHLETE_WORKFLOW_EDGES,
  ATHLETE_WORKFLOW_NODES,
  type AthleteDataViewTabId,
} from './data/demoAthleteDataView'
import {
  CHAT_PROMPT_CARDS,
  DEMO_ATHLETE_PROFILE,
  ERG_CHART_SUMMARY,
  ERG_PROGRESSION_POINTS,
  GOALS,
  LATEST_COACH_FEEDBACK,
  LINEUP_ENTRIES,
  MONTH_SUMMARY,
  COACH_FEEDBACK_HISTORY,
  SCORE_CAPTURE_PREVIEW,
  SESSION_ENTRIES,
  TODAY_META,
  TODAY_SCHEDULE,
  TODAY_STATUS_SENTENCE,
  WORKBOOK_COLUMNS,
  WORKBOOK_SHEETS,
  WORKBOOK_TABS,
  CONNECTED_APPS,
} from './data/demoAthleteData'
import { AthleteCard } from './behavioral/AthleteCard'
import { NudgeBanner } from './behavioral/NudgeBanner'
import { TodayLineupCard } from './dashboard/TodayLineupCard'
import { useAthleteMediaStore } from '@shared/store/useAthleteMediaStore'
import { toast } from '@shared/store/useToastStore'
import { useThemeStore, type AppTheme } from '@shared/store/useThemeStore'
import { useLineupsStore } from '@shared/store/useLineupsStore'
import { useSessionTimerStore } from '@shared/store/useSessionTimerStore'
import { useVisibilitySettings } from '@shared/store/useVisibilitySettings'
import { create } from 'zustand'

// ─── Team Messages Store ─────────────────────────────────────────────────────

type TeamMsg = { id: string; from: 'coach' | 'athlete'; text: string; at: number }
const useTeamMsgStore = create<{
  messages: TeamMsg[]
  send: (from: 'coach' | 'athlete', text: string) => void
}>((set) => ({
  messages: [
    { id: 'm0', from: 'coach', text: "Great work in practice today, Star. Your catch timing is really clicking. Keep it going into the race.", at: Date.now() - 2 * 3600000 },
    { id: 'm1', from: 'athlete', text: "Thanks Coach! Felt good today. Should I focus on anything specific for Saturday?", at: Date.now() - 1.5 * 3600000 },
    { id: 'm2', from: 'coach', text: "Stay relaxed in the first 500. Don't chase the other crews. Trust your base.", at: Date.now() - 3600000 },
  ],
  send: (from, text) =>
    set((s) => ({
      messages: [...s.messages, { id: `m-${Date.now()}`, from, text, at: Date.now() }],
    })),
}))

function fmtRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor(diff / 60000)
  if (hours >= 24) return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  if (hours >= 1) return `${hours}h ago`
  if (minutes >= 1) return `${minutes}m ago`
  return 'just now'
}

type ChatRole = 'user' | 'assistant'
type ChatMessage = { id: number; role: ChatRole; text: string; at: number }
type RecordMode = 'idle' | 'recording' | 'review'

const WHOOP_STORAGE_KEY = 'synth:athlete:whoopConnected'

function readWhoopConnected(): boolean {
  try {
    return localStorage.getItem(WHOOP_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function writeWhoopConnected(v: boolean) {
  try {
    localStorage.setItem(WHOOP_STORAGE_KEY, v ? 'true' : 'false')
  } catch {
    // ignore
  }
}

function formatClock(s: number) {
  const m = Math.floor(s / 60)
  const r = Math.max(0, Math.floor(s - m * 60))
  return `${m}:${String(r).padStart(2, '0')}`
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

function fmtDateShort(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function avg(xs: number[]) {
  if (!xs.length) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function median(xs: number[]) {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

function fuzzyIncludes(haystack: string, needle: string) {
  const h = haystack.toLowerCase()
  const n = needle.toLowerCase().trim()
  if (!n) return false
  if (h.includes(n)) return true
  const toks = n.split(/\s+/).filter(Boolean)
  return toks.every((t) => h.includes(t))
}

const NOTIF_PREFS_KEY = 'synth:athlete:notifPrefs'
type NotifPrefs = {
  coachNotes: boolean
  lineupChanges: boolean
  sessionResults: boolean
  prAlerts: boolean
}
const NOTIF_DEFAULTS: NotifPrefs = {
  coachNotes: true,
  lineupChanges: true,
  sessionResults: true,
  prAlerts: true,
}
function readNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_PREFS_KEY)
    if (!raw) return NOTIF_DEFAULTS
    return { ...NOTIF_DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return NOTIF_DEFAULTS
  }
}
function writeNotifPrefs(p: NotifPrefs) {
  try {
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(p))
  } catch {
    // ignore
  }
}

/** Tiny inline sparkline. Numbers with no time axis — pass an array, get a 60×18 SVG. */
function Sparkline({
  values,
  color = THEME.accent,
  width = 64,
  height = 18,
  strokeWidth = 1.5,
  invert = false,
}: {
  values: number[]
  color?: string
  width?: number
  height?: number
  strokeWidth?: number
  /** When true, lower values render as higher peaks (e.g. erg splits where smaller = better). */
  invert?: boolean
}) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = width / (values.length - 1)
  const points = values
    .map((v, i) => {
      const norm = invert ? (max - v) / range : (v - min) / range
      const y = height - norm * height
      return `${i * stepX},${y}`
    })
    .join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const DEMO_RESPONSES: Array<{ match: string[]; reply: string }> = [
  {
    match: ['race', 'cal invite', 'what should i focus', 'focus'],
    reply:
      "Two things today: **clean catches** on rate changes, and **staying relaxed** when it hurts.\n\n• Warm up like it's race day\n• First 500: long + calm\n• Last 500: keep the rhythm, don't chase\n",
  },
  {
    match: ['2k', 'erg', 'split', 'pr'],
    reply:
      "You're trending the right way. Your last 2K was **1:41.2 avg split** and that's a season best.\n\nIf you want one lever: hit **high-quality sleep** the next 48h and keep legs fresh.",
  },
  {
    match: ['sleep', 'hrv', 'recovery', 'resting'],
    reply:
      "Quick read: sleep has been steady, HRV is stable, and your recovery looks **good enough to push**.\n\nIf you feel heavy, we can dial intensity down — but keep the **technical intent** high.",
  },
]

const FALLBACK_RESPONSE =
  "I've got you. Tell me what you need right now:\n\n• race plan\n• what coach wants this week\n• how your recovery looks\n• how to improve your 2K\n"

function findResponse(text: string) {
  const hit = DEMO_RESPONSES.find((r) => r.match.some((m) => fuzzyIncludes(text, m)))
  return hit?.reply ?? FALLBACK_RESPONSE
}

function SourceDot({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
}

function Pill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'good' | 'warn'
}) {
  const bg =
    tone === 'good'
      ? 'bg-[var(--green-subtle)] text-[var(--green-primary)] border-[var(--green-primary)]'
      : tone === 'warn'
        ? 'bg-[var(--amber-subtle)] text-[var(--amber-primary)] border-[var(--amber-primary)]'
        : 'bg-[var(--card)] text-[var(--text-secondary)] border-[var(--border)]'
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${bg}`}>
      {children}
    </span>
  )
}

function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`rounded-2xl border p-5 ${className ?? ''}`} style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }} onClick={onClick}>
      {children}
    </div>
  )
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-2 text-[13px] leading-relaxed" style={{ color: THEME.textPrimary }}>
      {lines.map((l, i) => {
        const trimmed = l.trim()
        if (!trimmed) return <div key={i} />
        const isBullet = trimmed.startsWith('•')
        const content = isBullet ? trimmed.replace(/^•\s*/, '') : trimmed
        const parts = content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
        return (
          <div key={i} className={isBullet ? 'flex gap-2' : ''}>
            {isBullet && <div className="mt-[7px] h-1.5 w-1.5 rounded-full" style={{ background: THEME.textMuted }} />}
            <div>
              {parts.map((p, idx) => {
                const m = p.match(/^\*\*([^*]+)\*\*$/)
                if (m) return <strong key={idx}>{m[1]}</strong>
                return <span key={idx}>{p}</span>
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="typing-dot" />
      <span className="typing-dot" style={{ animationDelay: '120ms' }} />
      <span className="typing-dot" style={{ animationDelay: '240ms' }} />
    </div>
  )
}

function ChatBubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl border px-4 py-3 ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}
        style={{
          borderColor: THEME.border,
          background: isUser ? 'var(--blue-subtle)' : 'var(--bg-primary)',
        }}
      >
        <FormattedMessage text={m.text} />
      </div>
    </div>
  )
}

const SCHEDULE_DOT_COLOR: Record<string, string> = {
  Team: 'var(--green-primary)',
  Exam: 'var(--amber-primary)',
  Classes: 'var(--text-tertiary)',
}

const cardVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
}

export function MyDashboardPage() {
  const nav = useNavigate()
  const race = TODAY_META.raceCountdown

  const dayChip = (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase"
      style={{
        background: 'var(--green-subtle)',
        borderColor: THEME.primary + '55',
        color: THEME.primary,
        fontFamily: THEME.fontMono,
        letterSpacing: '0.16em',
      }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: THEME.primary }} />
      {race.daysAway}d to race
    </span>
  )

  return (
    <div className="flex min-h-full w-full flex-col pb-14">
      <PageHeader
        kicker={`TODAY · ${TODAY_META.dateLabel.toUpperCase()}`}
        title={`Good morning, ${DEMO_ATHLETE_PROFILE.name.split(' ')[0]}`}
        subtitle={`${DEMO_ATHLETE_PROFILE.team} · ${DEMO_ATHLETE_PROFILE.side} · ${DEMO_ATHLETE_PROFILE.year}`}
        actions={
          <div className="flex items-center gap-2">
            {dayChip}
            <button
              type="button"
              onClick={() => nav('/athlete/chat')}
              className="rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-zinc-50"
              style={{ borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
            >
              Ask synth.
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-5 px-5 sm:px-10">
        <NudgeBanner />

        {/* Lineup hero — interactive boat illustration */}
        <TodayLineupCard />

        {/* You + race row */}
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <AthleteCard
              name={DEMO_ATHLETE_PROFILE.name}
              handle={DEMO_ATHLETE_PROFILE.name.toLowerCase().replace(/\s+/g, '')}
              team={DEMO_ATHLETE_PROFILE.team}
            />
          </div>

          {/* Race spotlight (compact) */}
          <motion.div
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            className="relative overflow-hidden rounded-3xl border lg:col-span-5"
            style={{
              background: `linear-gradient(155deg, ${THEME.primaryDarker} 0%, ${THEME.primary} 70%, ${THEME.accent} 100%)`,
              borderColor: 'transparent',
              color: '#FFFFFF',
              boxShadow: '0 30px 60px -34px rgba(5,150,105,0.6)',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 65%)' }}
            />
            <div className="relative flex h-full flex-col p-5 sm:p-6">
              <div
                className="text-[10px] font-bold uppercase"
                style={{ fontFamily: THEME.fontMono, letterSpacing: '0.18em', opacity: 0.85 }}
              >
                Race day · {race.daysAway} {race.daysAway === 1 ? 'day' : 'days'} away
              </div>
              <div className="mt-1 text-[22px] font-semibold leading-tight sm:text-[24px]" style={{ fontFamily: THEME.fontSerif }}>
                {race.title}
              </div>
              <div className="mt-1 text-[12px]" style={{ opacity: 0.85 }}>
                {race.date} · Report {race.reportTime} · {race.location}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Boat', value: race.boat },
                  { label: 'Seat', value: race.seat },
                  { label: 'Side', value: race.side },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.14)' }}
                  >
                    <div
                      className="text-[9px] font-bold uppercase"
                      style={{ fontFamily: THEME.fontMono, letterSpacing: '0.18em', opacity: 0.8 }}
                    >
                      {m.label}
                    </div>
                    <div
                      className="mt-0.5 text-[16px] font-bold leading-none"
                      style={{ fontFamily: THEME.fontMono }}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              <p
                className="mt-4 text-[12.5px] leading-relaxed"
                style={{ opacity: 0.92 }}
              >
                {TODAY_STATUS_SENTENCE}
              </p>

              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase"
                  style={{
                    background: '#FFFFFF',
                    color: THEME.primaryDarker,
                    fontFamily: THEME.fontMono,
                    letterSpacing: '0.06em',
                  }}
                  onClick={() => nav('/athlete/chat')}
                >
                  Race plan →
                </button>
                <button
                  type="button"
                  className="rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase"
                  style={{
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: '#FFFFFF',
                    fontFamily: THEME.fontMono,
                    letterSpacing: '0.06em',
                    background: 'transparent',
                  }}
                  onClick={() => nav('/athlete/record?tab=score')}
                >
                  Log erg
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stat strip — refined */}
        <motion.div
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {[
            {
              label: '2K Best',
              value: '6:44.9',
              detail: '−1.7s YOY',
              accent: 'var(--green-primary)',
              trend: 'up' as 'up' | 'down' | 'flat',
            },
            {
              label: 'Recovery',
              value: '72',
              detail: 'Light day suggested',
              accent: 'var(--amber-primary)',
              trend: 'flat' as 'up' | 'down' | 'flat',
            },
            {
              label: 'Streak',
              value: '13',
              detail: 'days check-in',
              accent: THEME.primary,
              trend: 'up' as 'up' | 'down' | 'flat',
            },
            {
              label: 'Volume',
              value: '142.8k',
              detail: 'meters this month',
              accent: 'var(--purple-primary)',
              trend: 'up' as 'up' | 'down' | 'flat',
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={cardVariant}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl border p-4"
              style={{
                background: 'var(--bg-primary)',
                borderColor: THEME.border,
                boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 18px 36px -26px rgba(24,24,27,0.22)',
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="text-[9px] font-semibold uppercase"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted, letterSpacing: '0.18em' }}
                >
                  {s.label}
                </div>
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: s.accent }}
                />
              </div>
              <div
                className="mt-2 text-[26px] font-bold leading-none sm:text-[28px]"
                style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
              >
                {s.value}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: THEME.textSecondary }}>
                {s.trend === 'up' ? (
                  <span style={{ color: 'var(--green-primary)' }}>↑</span>
                ) : s.trend === 'down' ? (
                  <span style={{ color: 'var(--red-primary)' }}>↓</span>
                ) : (
                  <span style={{ color: THEME.textMuted }}>·</span>
                )}
                {s.detail}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Goals + Schedule */}
        <div className="grid gap-5 lg:grid-cols-12">
          <motion.div variants={cardVariant} initial="hidden" animate="visible" className="lg:col-span-7">
            <div
              className="rounded-2xl border p-5"
              style={{
                background: 'var(--bg-primary)',
                borderColor: THEME.border,
                boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 18px 36px -26px rgba(24,24,27,0.22)',
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="text-[10px] font-semibold uppercase"
                  style={{
                    fontFamily: THEME.fontMono,
                    color: THEME.textMuted,
                    letterSpacing: '0.18em',
                  }}
                >
                  Goals · this week
                </div>
                <Link
                  to="/athlete/progress"
                  className="text-[11px] font-semibold hover:underline"
                  style={{ color: THEME.primary, fontFamily: THEME.fontMono }}
                >
                  View progress →
                </Link>
              </div>
              <div className="mt-4 space-y-4">
                {GOALS.map((g) => (
                  <div key={g.name}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary, fontFamily: THEME.fontSerif }}>
                        {g.name}
                      </div>
                      <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                        {g.progressLabel} · target {g.target}
                      </div>
                    </div>
                    <div
                      className="mt-2 h-1.5 w-full overflow-hidden rounded-full"
                      style={{ background: 'var(--bg-surface-raised)' }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${g.progress}%` }}
                        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{
                          background:
                            g.progress >= 90
                              ? `linear-gradient(90deg, ${THEME.primary}, ${THEME.accent})`
                              : g.progress >= 60
                                ? 'var(--green-primary)'
                                : 'var(--amber-primary)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardVariant} initial="hidden" animate="visible" className="lg:col-span-5">
            <div
              className="rounded-2xl border p-5"
              style={{
                background: 'var(--bg-primary)',
                borderColor: THEME.border,
                boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 18px 36px -26px rgba(24,24,27,0.22)',
              }}
            >
              <div
                className="text-[10px] font-semibold uppercase"
                style={{
                  fontFamily: THEME.fontMono,
                  color: THEME.textMuted,
                  letterSpacing: '0.18em',
                }}
              >
                Today's schedule
              </div>
              <ol className="mt-4 space-y-3">
                {TODAY_SCHEDULE.map((e) => (
                  <li key={e.time} className="flex items-start gap-3">
                    <div
                      className="mt-0.5 w-[60px] shrink-0 text-[11px]"
                      style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                    >
                      {e.time}
                    </div>
                    <span
                      className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: SCHEDULE_DOT_COLOR[e.type] ?? THEME.textMuted }}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-[13px] font-semibold"
                        style={{ color: THEME.textPrimary }}
                      >
                        {e.title}
                      </div>
                      <div className="text-[11px]" style={{ color: THEME.textSecondary }}>
                        {e.type}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>

        {/* Coach feedback */}
        <motion.div variants={cardVariant} initial="hidden" animate="visible">
          <div
            className="rounded-2xl border p-5"
            style={{
              background: 'var(--bg-primary)',
              borderColor: THEME.border,
              boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 18px 36px -26px rgba(24,24,27,0.22)',
            }}
          >
            <div className="flex items-center justify-between">
              <div
                className="text-[10px] font-semibold uppercase"
                style={{
                  fontFamily: THEME.fontMono,
                  color: THEME.textMuted,
                  letterSpacing: '0.18em',
                }}
              >
                Latest from coach
              </div>
              <Link
                to="/athlete/progress"
                className="text-[11px] font-semibold hover:underline"
                style={{ color: THEME.primary, fontFamily: THEME.fontMono }}
              >
                Full history →
              </Link>
            </div>
            <div
              className="mt-3 rounded-2xl border-l-[3px] p-4"
              style={{
                borderLeftColor: 'var(--purple-primary)',
                background: 'var(--bg-surface)',
              }}
            >
              <div
                className="text-[10px] font-semibold uppercase"
                style={{
                  fontFamily: THEME.fontMono,
                  color: 'var(--purple-primary)',
                  letterSpacing: '0.16em',
                }}
              >
                {LATEST_COACH_FEEDBACK.date}
              </div>
              <p
                className="mt-2 text-[14px] leading-relaxed"
                style={{ color: THEME.textPrimary, fontFamily: THEME.fontSerif }}
              >
                "{LATEST_COACH_FEEDBACK.quote}"
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {LATEST_COACH_FEEDBACK.focusPoints.map((f) => (
                  <span
                    key={f.label}
                    className="rounded-full border px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      borderColor:
                        f.status === 'improved' ? 'var(--green-primary)' : 'var(--amber-primary)',
                      color:
                        f.status === 'improved' ? 'var(--green-primary)' : 'var(--amber-primary)',
                      background:
                        f.status === 'improved' ? 'var(--green-subtle)' : 'var(--amber-subtle)',
                    }}
                  >
                    {f.status === 'improved' ? '✓' : '◯'} {f.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {COACH_FEEDBACK_HISTORY.slice(1, 3).map((f) => (
                <div
                  key={f.date}
                  className="rounded-2xl border p-3"
                  style={{ borderColor: THEME.border, background: 'var(--bg-surface)' }}
                >
                  <div
                    className="text-[10px] font-semibold uppercase"
                    style={{
                      fontFamily: THEME.fontMono,
                      color: THEME.textMuted,
                      letterSpacing: '0.16em',
                    }}
                  >
                    {f.date}
                  </div>
                  <div
                    className="mt-1 text-[12px] leading-relaxed"
                    style={{ color: THEME.textSecondary }}
                  >
                    {f.takeaway}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export function MyStatsPage() {
  const { videos } = useAthleteMediaStore()
  const nav = useNavigate()

  const fmtSplit = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec - m * 60
    return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`
  }

  // Compute live monthly stats from session data so they aren't lying.
  const liveStats = useMemo(() => {
    const sessionCount = SESSION_ENTRIES.length
    const baseline = MONTH_SUMMARY.find((m) => m.label === 'Erg meters')?.value ?? '—'
    const gym = MONTH_SUMMARY.find((m) => m.label === 'Gym sessions')?.value ?? '—'
    const sleep = MONTH_SUMMARY.find((m) => m.label === 'Sleep avg')?.value ?? '—'
    return [
      { label: 'Sessions', value: String(sessionCount), detail: 'this month', mono: true },
      { label: 'Erg meters', value: baseline, detail: 'this month', mono: true },
      { label: 'Gym sessions', value: gym, detail: 'completed', mono: true },
      { label: 'Sleep avg', value: sleep, detail: 'this week', mono: true },
    ]
  }, [])

  // Pre-compute PR coordinates for chart annotation
  const prPoint = ERG_PROGRESSION_POINTS.find((p) => p.pr)

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="MY PROGRESS"
        title="What's moving"
        subtitle="Goals, erg trend, coach notes — all in one place."
        actions={
          <Link
            to="/athlete/record?tab=form"
            className="rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-zinc-50"
            style={{ borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
          >
            Record form
          </Link>
        }
      />

      {/* Monthly stats strip — KPI tiles, coach style */}
      <div className="grid grid-cols-2 gap-3 px-5 sm:px-10 lg:grid-cols-4">
        {liveStats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-4"
            style={{
              background: 'var(--bg-primary)',
              borderColor: THEME.border,
              borderLeft: `3px solid ${THEME.primary}`,
              boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 10px 30px -20px rgba(24,24,27,0.18)',
            }}
          >
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              {s.label}
            </div>
            <div className="mt-2 text-[24px] font-bold leading-none sm:text-[28px]" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
              {s.value}
            </div>
            <div className="mt-1.5 text-[11px]" style={{ color: THEME.textSecondary }}>
              {s.detail}
            </div>
          </div>
        ))}
      </div>

      {/* Goals */}
      <div className="mt-6 grid gap-4 px-5 sm:px-10 md:grid-cols-3">
        {GOALS.map((g) => (
          <div
            key={g.name}
            className="rounded-2xl border p-5"
            style={{
              background: 'var(--bg-primary)',
              borderColor: THEME.border,
              boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>{g.name}</div>
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  borderColor: g.progress >= 90 ? 'var(--green-primary)' : 'var(--amber-primary)',
                  color: g.progress >= 90 ? 'var(--green-primary)' : 'var(--amber-primary)',
                  background: g.progress >= 90 ? 'var(--green-subtle)' : 'var(--amber-subtle)',
                  fontFamily: THEME.fontMono,
                }}
              >
                {g.progress}%
              </span>
            </div>
            <div className="mt-1 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              Target {g.target}
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-surface-raised)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${g.progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ background: g.progress >= 90 ? THEME.primary : g.progress >= 60 ? 'var(--green-primary)' : 'var(--amber-primary)' }}
              />
            </div>
            <div className="mt-3 text-[12px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>{g.progressLabel}</div>
            <p className="mt-2 text-[12px] leading-relaxed" style={{ color: THEME.textMuted }}>{g.insight}</p>
          </div>
        ))}
      </div>

      {/* Erg progression chart */}
      <div
        className="mx-5 mt-6 rounded-2xl border p-5 sm:mx-10"
        style={{
          background: 'var(--bg-primary)',
          borderColor: THEME.border,
          boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
        }}
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              2K Erg Progression
            </div>
            <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
              Year-over-year trend
            </div>
          </div>
          {prPoint?.milestone && (
            <span
              className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
              style={{
                borderColor: 'var(--green-primary)',
                background: 'var(--green-subtle)',
                color: 'var(--green-primary)',
                fontFamily: THEME.fontMono,
              }}
            >
              ★ {prPoint.milestone}
            </span>
          )}
        </div>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ERG_PROGRESSION_POINTS} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={THEME.border} strokeDasharray="4 6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[400, 414]}
                tick={{ fontSize: 11, fill: THEME.textMuted }}
                tickFormatter={(v: number) => fmtSplit(v)}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [fmtSplit(v), 'Split']}
                contentStyle={{ borderRadius: 12, border: `1px solid var(--border-default)`, background: 'var(--bg-primary)', fontFamily: THEME.fontMono, fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="seconds"
                stroke={THEME.primary}
                strokeWidth={2.5}
                dot={(props) => {
                  const isPr = ERG_PROGRESSION_POINTS[props.index]?.pr
                  return (
                    <circle
                      key={`dot-${props.index}`}
                      cx={props.cx}
                      cy={props.cy}
                      r={isPr ? 6 : 3.5}
                      fill={isPr ? THEME.accent : THEME.primary}
                      stroke="var(--bg-primary)"
                      strokeWidth={isPr ? 2 : 1}
                    />
                  )
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-[12px]" style={{ color: THEME.textSecondary }}>{ERG_CHART_SUMMARY}</p>
      </div>

      {/* Coach feedback history */}
      <div
        className="mx-5 mt-6 rounded-2xl border p-5 sm:mx-10"
        style={{
          background: 'var(--bg-primary)',
          borderColor: THEME.border,
          boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Coach feedback · history
          </div>
          <span className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
            {COACH_FEEDBACK_HISTORY.length} notes
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {COACH_FEEDBACK_HISTORY.map((f) => (
            <details key={f.date} className="rounded-xl border-l-4 p-4" style={{ borderColor: 'var(--border-default)', borderLeftColor: 'var(--purple-primary)', background: 'var(--bg-surface)' }}>
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: 'var(--purple-primary)' }}>
                    {f.date}
                  </span>
                  {f.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        borderColor: t === 'Positive' ? 'var(--green-primary)' : THEME.border,
                        color: t === 'Positive' ? 'var(--green-primary)' : THEME.textSecondary,
                        background: t === 'Positive' ? 'var(--green-subtle)' : 'transparent',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-[13px] font-medium" style={{ color: THEME.textPrimary }}>{f.takeaway}</div>
              </summary>
              <p className="mt-3 border-t pt-3 text-[12px] leading-relaxed" style={{ borderColor: THEME.border, color: THEME.textSecondary }}>
                {f.transcription}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Form videos */}
      <div
        className="mx-5 mt-6 rounded-2xl border p-5 sm:mx-10"
        style={{
          background: 'var(--bg-primary)',
          borderColor: THEME.border,
          boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            My form videos
          </div>
          <button
            type="button"
            onClick={() => nav('/athlete/record?tab=form')}
            className="text-[11px] font-semibold hover:underline"
            style={{ color: THEME.primary, fontFamily: THEME.fontMono }}
          >
            Record new →
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {videos.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-[13px] sm:col-span-2 lg:col-span-3" style={{ borderColor: THEME.border, color: THEME.textSecondary }}>
              <div className="font-semibold" style={{ color: THEME.textPrimary }}>No saved videos yet.</div>
              <div className="mt-1">Record a 10–20 second clip from the side. Save it locally or send to coach.</div>
            </div>
          ) : (
            videos.slice(0, 6).map((v) => (
              <div key={v.id} className="overflow-hidden rounded-xl border" style={{ borderColor: THEME.border, background: 'var(--bg-surface)' }}>
                <div className="aspect-video w-full bg-black/10" />
                <div className="p-3">
                  <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>{v.title}</div>
                  <div className="mt-1 text-[11px]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
                    {v.date} · {Math.round(v.duration)}s · {v.sentToCoach ? 'sent to coach' : 'local'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export function MyRecordPage() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') ?? 'form') as 'form' | 'score'
  const setTab = (t: 'form' | 'score') => {
    const next = new URLSearchParams(params)
    next.set('tab', t)
    setParams(next, { replace: true })
  }
  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="RECORD"
        title="Capture what matters"
        subtitle="Film a 10–20s side-on clip, or log a score in seconds."
      />
      <div className="px-5 sm:px-10">
        <div
          className="inline-flex rounded-full border p-1"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}
        >
          {(['form', 'score'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all"
              style={{
                fontFamily: THEME.fontMono,
                background: tab === t ? THEME.primary : 'transparent',
                color: tab === t ? '#fff' : THEME.textSecondary,
                letterSpacing: '0.04em',
              }}
            >
              {t === 'form' ? 'RECORD FORM' : 'LOG SCORE'}
            </button>
          ))}
        </div>
        <div className="mt-5">{tab === 'form' ? <RecordFormPanel /> : <LogScorePanel />}</div>
      </div>
    </div>
  )
}

function RecordFormPanel() {
  const { addVideo } = useAthleteMediaStore()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const [mode, setMode] = useState<RecordMode>('idle')
  const [url, setUrl] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [err, setErr] = useState<string | null>(null)
  const startedAtRef = useRef<number>(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: true,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch {
        setErr('Camera permission denied or unavailable.')
      }
    }
    start()
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  const startRec = () => {
    setErr(null)
    const stream = streamRef.current
    if (!stream) {
      setErr('Camera not ready yet.')
      return
    }
    chunksRef.current = []
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' })
    recRef.current = rec
    rec.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data)
    }
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const nextUrl = URL.createObjectURL(blob)
      setUrl(nextUrl)
      setMode('review')
    }
    rec.start()
    startedAtRef.current = Date.now()
    setElapsed(0)
    setMode('recording')
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)), 250)
  }

  const stopRec = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop()
  }

  const discard = () => {
    if (url) URL.revokeObjectURL(url)
    setUrl(null)
    setMode('idle')
  }

  const save = (sentToCoach: boolean) => {
    if (!url) return
    const id = Date.now()
    addVideo({
      id,
      url,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      duration: elapsed,
      annotations: [],
      sentToCoach,
      title: sentToCoach ? 'Form clip (sent)' : 'Form clip',
    })
    toast(sentToCoach ? 'Sent to coach (demo)' : 'Saved locally', 'success')
    setMode('idle')
    setUrl(null)
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Record form
          </div>
          <div className="mt-1 text-[13px]" style={{ color: THEME.textSecondary }}>
            Keep it short: 10–20 seconds from the side. Add what you're working on.
          </div>
        </div>
        {mode === 'recording' && <Pill tone="warn">REC • {formatClock(elapsed)}</Pill>}
      </div>

      {err && (
        <div className="mt-4 rounded-xl border border-dashed p-4 text-[13px]" style={{ borderColor: THEME.border, color: THEME.textSecondary }}>
          {err}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: THEME.border }}>
        {mode === 'review' && url ? <video className="w-full" controls src={url} /> : <video ref={videoRef} className="w-full" muted playsInline />}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {mode !== 'recording' && mode !== 'review' && (
          <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={startRec}>
            Start recording
          </button>
        )}
        {mode === 'recording' && (
          <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={stopRec}>
            Stop
          </button>
        )}
        {mode === 'review' && (
          <>
            <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={discard}>
              Discard
            </button>
            <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={() => save(false)}>
              Save locally
            </button>
            <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={() => save(true)}>
              Send to coach
            </button>
          </>
        )}
        <button
          type="button"
          className="ml-auto rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50"
          style={{ borderColor: THEME.border, color: THEME.textSecondary }}
          onClick={() => { window.location.href = '/athlete/chat' }}
        >
          Analyze with AI →
        </button>
      </div>
    </Card>
  )
}

function LogScorePanel() {
  const [split, setSplit] = useState(SCORE_CAPTURE_PREVIEW.split)
  const [distance, setDistance] = useState('2000')
  const [notes, setNotes] = useState('')
  const save = () => toast('Score saved (demo)', 'success')
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Log score
        </div>
        <span className="text-[10px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
          Last: {SCORE_CAPTURE_PREVIEW.testType} · {SCORE_CAPTURE_PREVIEW.time} · {SCORE_CAPTURE_PREVIEW.date}
        </span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
          Split
          <input value={split} onChange={(e) => setSplit(e.target.value)} className="mt-1.5 w-full rounded-xl border px-3 py-2 text-[14px] outline-none" style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary, fontFamily: THEME.fontMono }} />
        </label>
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
          Distance (m)
          <input value={distance} onChange={(e) => setDistance(e.target.value)} className="mt-1.5 w-full rounded-xl border px-3 py-2 text-[14px] outline-none" style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary, fontFamily: THEME.fontMono }} />
        </label>
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
          Photo (OCR)
          <div className="mt-1.5 flex items-center justify-center rounded-xl border border-dashed px-3 py-3 text-[12px]" style={{ borderColor: THEME.border, color: THEME.textMuted }}>
            tap to attach
          </div>
        </label>
      </div>
      <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
        Notes
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5 w-full rounded-xl border px-3 py-2 text-[13px] outline-none" rows={3} placeholder="Any context — pace, conditions, focus area…" style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary, fontFamily: THEME.fontSans }} />
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textSecondary, fontFamily: THEME.fontMono }} onClick={() => { setSplit(SCORE_CAPTURE_PREVIEW.split); setNotes(''); }}>
          Reset
        </button>
        <button type="button" className="rounded-lg px-4 py-1.5 text-[11px] font-semibold text-white transition-colors" style={{ background: THEME.primary, fontFamily: THEME.fontMono, letterSpacing: '0.04em' }} onClick={save}>
          SAVE SCORE →
        </button>
      </div>
    </Card>
  )
}

const WORKBOOK_SHEET_DESCRIPTIONS: Record<string, string> = {
  'Erg Log': "All-time team 2K rankings — newest scores at top.",
  "8.25 30'": "30-minute steady state, Aug 25 — meters covered + avg split.",
  "8.28 3x15'": "3 × 15-minute pieces, Aug 28 — split per piece.",
}

export function MyWorkbookPage() {
  const vis = useVisibilitySettings()
  const [activeSheet, setActiveSheet] = useState<keyof typeof WORKBOOK_SHEETS>(WORKBOOK_TABS[0])
  const [search, setSearch] = useState('')
  const rows = WORKBOOK_SHEETS[activeSheet]
  const cols = activeSheet === 'Erg Log' ? WORKBOOK_COLUMNS : activeSheet === "8.25 30'" ? ['Side', 'Athlete', 'Meters', 'Split', 'Watts', 'SPM'] : ['Side', 'Athlete', 'P1', 'P2', 'P3', 'SPM']

  // Compute Star Miller's row + rank for the personal hero card
  const starRowIndex = rows.findIndex((r) => r[1] === 'Star Miller')
  const starRow = starRowIndex >= 0 ? rows[starRowIndex] : null
  const starRank = starRowIndex >= 0 ? starRowIndex + 1 : null

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows.map((r, i) => ({ row: r, rank: i + 1 }))
    return rows
      .map((r, i) => ({ row: r, rank: i + 1 }))
      .filter(({ row }) => row.some((cell) => String(cell).toLowerCase().includes(q)))
  }, [rows, search])

  if (!vis.showErgRankings) {
    return (
      <div className="flex min-h-full w-full flex-col pb-12">
        <PageHeader kicker="ERG WORKBOOK" title="Team sheet" subtitle="Coach-managed rankings" />
        <div className="mx-5 rounded-2xl border border-dashed p-10 text-center sm:mx-10" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
          <div className="text-[16px] font-semibold" style={{ color: THEME.textPrimary, fontFamily: THEME.fontSerif }}>Team workbook not enabled</div>
          <div className="mt-2 text-[13px]" style={{ color: THEME.textSecondary }}>Your coach hasn't enabled team erg rankings yet. Ask them to flip it on in their Settings.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="ERG WORKBOOK"
        title="Team sheet"
        subtitle="Read-only mirror of the team's coach-managed sheet."
        actions={
          <span
            className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
            style={{ borderColor: 'var(--green-primary)', background: 'var(--green-subtle)', color: 'var(--green-primary)', fontFamily: THEME.fontMono }}
          >
            ● Synced 5 min ago
          </span>
        }
      />

      {/* Personal hero card — your rank, your row, at-a-glance */}
      {starRow && starRank && (
        <div
          className="mx-5 mb-5 rounded-2xl border p-5 sm:mx-10"
          style={{
            background: 'linear-gradient(135deg, var(--green-subtle), transparent 70%)',
            borderColor: THEME.border,
            borderLeft: `3px solid ${THEME.primary}`,
            boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
          }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: 'var(--green-primary)' }}>
                Your row · {activeSheet}
              </div>
              <div className="mt-1 text-[22px] font-semibold sm:text-[26px]" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
                ★ {starRow[1]}
              </div>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-4">
              <div className="text-center">
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>Rank</div>
                <div className="mt-0.5 text-[22px] font-bold" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>#{starRank}<span className="text-[12px]" style={{ color: THEME.textMuted }}> / {rows.length}</span></div>
              </div>
              <div className="text-center">
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>Side</div>
                <div className="mt-0.5 text-[18px] font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>{starRow[0]}</div>
              </div>
              {cols.slice(2).map((c, i) => (
                <div key={c} className="text-center">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{c}</div>
                  <div className="mt-0.5 text-[18px] font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>{starRow[i + 2]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sheet picker pills */}
      <div className="mx-5 mb-3 flex flex-wrap gap-2 sm:mx-10">
        {WORKBOOK_TABS.map((tab) => {
          const active = activeSheet === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSheet(tab)}
              className="rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all"
              style={{
                fontFamily: THEME.fontMono,
                borderColor: active ? THEME.primary : THEME.border,
                background: active ? 'var(--green-subtle)' : 'var(--bg-primary)',
                color: active ? 'var(--green-primary)' : THEME.textSecondary,
              }}
            >
              {tab}
            </button>
          )
        })}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name or split…"
          className="ml-auto min-w-[180px] flex-1 rounded-lg border px-3 py-1.5 text-[12px] outline-none sm:max-w-[240px]"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary }}
        />
      </div>

      {/* Sheet description */}
      <div className="mx-5 mb-3 text-[11px] sm:mx-10" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
        {WORKBOOK_SHEET_DESCRIPTIONS[activeSheet]}
      </div>

      {/* Table */}
      <div
        className="mx-5 overflow-hidden rounded-2xl border sm:mx-10"
        style={{
          background: 'var(--bg-primary)',
          borderColor: THEME.border,
          boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
        }}
      >
        <div className="synth-scroll overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[13px]">
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: `1px solid ${THEME.border}` }}>
                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>#</th>
                {cols.map((c) => (
                  <th key={c} className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(({ row, rank }) => {
                const isStarRow = row[1] === 'Star Miller'
                return (
                  <tr
                    key={`${activeSheet}-${rank}`}
                    style={{
                      borderTop: `1px solid ${THEME.border}`,
                      background: isStarRow ? 'var(--green-subtle)' : 'transparent',
                    }}
                  >
                    <td className="px-3 py-2 text-[11px]" style={{ color: rank <= 3 ? 'var(--green-primary)' : THEME.textMuted, fontFamily: THEME.fontMono, fontWeight: rank <= 3 ? 700 : 500 }}>
                      {rank}
                    </td>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="px-3 py-2"
                        style={{
                          color: THEME.textPrimary,
                          fontFamily: j >= 2 ? THEME.fontMono : THEME.fontSans,
                          fontWeight: isStarRow && j === 1 ? 700 : j >= 2 ? 500 : 400,
                          fontSize: 13,
                        }}
                      >
                        {isStarRow && j === 1 ? `★ ${cell}` : cell}
                      </td>
                    ))}
                  </tr>
                )
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={cols.length + 1} className="px-3 py-6 text-center text-[12px]" style={{ color: THEME.textMuted }}>
                    No matches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/** Format milliseconds as M:SS.d (e.g. 1:23.4) */
function fmtMs(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = ((ms % 60000) / 1000).toFixed(1)
  const sPadded = String(Math.floor(Number(s))).padStart(2, '0')
  const tenths = (ms % 1000 / 100).toFixed(0)
  return `${m}:${sPadded}.${tenths}`
}

// Session classification — single source of truth so counts and filters agree.
type SessionCategory = 'race' | 'steady' | 'drill' | 'erg'
function classifySession(title: string, detail: string): SessionCategory {
  const t = `${title} ${detail}`.toLowerCase()
  if (t.includes('race') || t.includes('power') || t.includes('2k') || t.includes('start')) return 'race'
  if (t.includes('steady') || t.includes('ut2') || t.includes('aerobic')) return 'steady'
  if (t.includes('drill') || t.includes('technical') || t.includes('rate')) return 'drill'
  return 'erg'
}

/** Parse "1:41.2" to seconds, fall-back to 0. */
function parseSplit(label: string): number {
  const m = label.match(/^(\d+):(\d+\.?\d*)$/)
  if (!m) return 0
  return Number(m[1]) * 60 + Number(m[2])
}

export function MySessionsPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | SessionCategory>('all')

  const timerHistory = useSessionTimerStore((s) => s.history)

  const timerSessions = timerHistory.map((entry) => ({
    id: entry.id,
    date: fmtDateShort(entry.createdAt),
    title: `${entry.boatName} · timer session`,
    detail: `${entry.splits.length} split${entry.splits.length !== 1 ? 's' : ''}`,
    splits: entry.splits.map((sp) => fmtMs(sp.intervalMs)),
    notes: `Recorded via Session Timer · ${entry.boatName}`,
    isTimer: true,
  }))

  const allSessions = useMemo(
    () => [
      ...timerSessions,
      ...SESSION_ENTRIES.map((s) => ({ ...s, isTimer: false })),
    ],
    [timerSessions],
  )

  // Live counts per category — replaces hardcoded "On-water: 5"
  const counts = useMemo(() => {
    const c = { race: 0, steady: 0, drill: 0, erg: 0 }
    allSessions.forEach((s) => {
      if ('isTimer' in s && s.isTimer) return
      const cat = classifySession(s.title, s.detail)
      c[cat]++
    })
    return c
  }, [allSessions])

  const filtered = filter === 'all'
    ? allSessions
    : allSessions.filter((s) => !s.isTimer && classifySession(s.title, s.detail) === filter)

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="SESSIONS"
        title="Your recent sessions"
        subtitle={`${allSessions.length} sessions logged · ${SESSION_ENTRIES.length} synced from coach`}
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 px-5 sm:grid-cols-4 sm:px-10">
        {[
          { label: 'Total', value: String(allSessions.length), accent: THEME.primary },
          { label: 'Race pieces', value: String(counts.race), accent: 'var(--green-primary)' },
          { label: 'Steady state', value: String(counts.steady), accent: THEME.blue },
          { label: 'Drills', value: String(counts.drill), accent: 'var(--amber-primary)' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-4"
            style={{
              background: 'var(--bg-primary)',
              borderColor: THEME.border,
              borderLeft: `3px solid ${s.accent}`,
              boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 10px 30px -20px rgba(24,24,27,0.18)',
            }}
          >
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              {s.label}
            </div>
            <div className="mt-2 text-[24px] font-bold leading-none" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="mt-5 flex flex-wrap gap-2 px-5 sm:px-10">
        {(['all', 'race', 'steady', 'drill'] as const).map((f) => {
          const active = filter === f
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors"
              style={{
                fontFamily: THEME.fontMono,
                borderColor: active ? THEME.primary : THEME.border,
                background: active ? 'var(--green-subtle)' : 'var(--bg-primary)',
                color: active ? 'var(--green-primary)' : THEME.textSecondary,
              }}
            >
              {f === 'all' ? 'ALL' : f === 'race' ? 'RACE PIECES' : f === 'steady' ? 'STEADY STATE' : 'DRILLS'}
            </button>
          )
        })}
      </div>

      {/* Session list */}
      <div className="mt-5 space-y-3 px-5 sm:px-10">
        {filtered.map((s) => {
          const isOpen = expanded === s.id
          const splitSeconds = s.splits.map(parseSplit)
          const isNegativeSplit = splitSeconds.length >= 2 && splitSeconds[splitSeconds.length - 1] < splitSeconds[0]
          return (
            <div
              key={s.id}
              className="cursor-pointer rounded-2xl border p-5 transition-colors hover:bg-zinc-50/50"
              style={{
                background: 'var(--bg-primary)',
                borderColor: THEME.border,
                boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
              }}
              onClick={() => setExpanded(isOpen ? null : s.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{s.date}</div>
                    {s.isTimer && (
                      <span
                        className="rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                        style={{ borderColor: 'rgba(16,185,129,0.35)', color: THEME.accent, background: 'rgba(16,185,129,0.08)', fontFamily: THEME.fontMono }}
                      >
                        Timer
                      </span>
                    )}
                    {isNegativeSplit && (
                      <span
                        className="rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                        style={{ borderColor: 'var(--green-primary)', color: 'var(--green-primary)', background: 'var(--green-subtle)', fontFamily: THEME.fontMono }}
                      >
                        ↓ Negative split
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[15px] font-semibold" style={{ color: THEME.textPrimary, fontFamily: THEME.fontSerif }}>{s.title}</div>
                  <div className="mt-0.5 text-[12px]" style={{ color: THEME.textSecondary }}>{s.detail}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {splitSeconds.length >= 2 && (
                    <Sparkline values={splitSeconds} invert color={isNegativeSplit ? 'var(--green-primary)' : THEME.primary} width={72} height={22} />
                  )}
                  <div className="flex flex-wrap justify-end gap-1">
                    {s.splits.slice(0, 3).map((sp, i) => (
                      <span key={i} className="rounded-md border px-1.5 py-0.5 text-[11px]" style={{ borderColor: THEME.border, fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
                        {sp}
                      </span>
                    ))}
                    {s.splits.length > 3 && (
                      <span className="rounded-md border px-1.5 py-0.5 text-[11px]" style={{ borderColor: THEME.border, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        +{s.splits.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {isOpen && (
                <div className="mt-4 border-t pt-4" style={{ borderColor: THEME.border }}>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                    All splits
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {s.splits.map((sp, i) => (
                      <div key={i} className="rounded-lg border p-2 text-center" style={{ borderColor: THEME.border, background: 'var(--bg-surface)' }}>
                        <div className="text-[9px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>P{i + 1}</div>
                        <div className="mt-0.5 text-[14px] font-bold" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>{sp}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed" style={{ color: THEME.textSecondary }}>{s.notes}</p>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed p-8 text-center text-[13px]" style={{ borderColor: THEME.border, color: THEME.textSecondary }}>
            No sessions match this filter.
          </div>
        )}
      </div>
    </div>
  )
}

const STAR_MILLER_ID = 'a-miller'
const STAR_MILLER_NAME = 'Star Miller'

/** Tiny boat-diagram primitive — a vertical column of seats with cox at top.
 *  Highlights the seat where Star Miller sits. Used in MyLineupsPage. */
function BoatDiagram({
  seats,
  highlightName,
}: {
  seats: Array<{ seat: string | number; side: string; name: string }>
  highlightName: string
}) {
  // Order seats from cox down to bow
  const ordered = [...seats].sort((a, b) => {
    const ord = (s: string | number) => {
      const v = String(s).toLowerCase()
      if (v.startsWith('cox')) return 0
      if (v.startsWith('str') || v === '8') return 1
      if (v.startsWith('bow') || v === '1') return 100
      const n = Number(v)
      return Number.isFinite(n) ? 10 - n : 50
    }
    return ord(a.seat) - ord(b.seat)
  })
  return (
    <div className="mx-auto w-full max-w-[180px]">
      {/* Hull outline */}
      <div className="relative rounded-[40px] border-2 p-2" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
        <div className="space-y-1.5">
          {ordered.map((s) => {
            const isCox = String(s.seat).toLowerCase().startsWith('cox')
            const isHighlight = s.name === highlightName || String(s.name).includes(highlightName.split(' ')[0])
            const isPort = s.side === 'Port'
            const isStbd = s.side === 'Stbd' || s.side === 'Starboard'
            return (
              <div key={String(s.seat)} className="flex items-center gap-1.5">
                {/* Port oar */}
                <div
                  className="h-[3px] flex-1 rounded-full"
                  style={{ background: isPort ? 'var(--red-primary)' : 'transparent' }}
                />
                {/* Seat cell */}
                <div
                  className="flex h-9 w-12 shrink-0 flex-col items-center justify-center rounded-md text-[10px] font-semibold"
                  style={{
                    background: isHighlight ? 'var(--green-primary)' : isCox ? 'var(--bg-surface-raised)' : 'var(--bg-primary)',
                    color: isHighlight ? '#fff' : THEME.textPrimary,
                    border: `1px solid ${isHighlight ? 'var(--green-primary)' : THEME.border}`,
                    fontFamily: THEME.fontMono,
                  }}
                >
                  <span className="text-[9px] leading-none" style={{ opacity: 0.8 }}>{String(s.seat)}</span>
                  <span className="mt-0.5 text-[9px] leading-none">{isHighlight ? 'YOU' : s.name.split(' ').slice(-1)[0].slice(0, 4)}</span>
                </div>
                {/* Starboard oar */}
                <div
                  className="h-[3px] flex-1 rounded-full"
                  style={{ background: isStbd ? 'var(--green-primary)' : 'transparent' }}
                />
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-3 text-[9px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
        <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-full" style={{ background: 'var(--red-primary)' }} /> Port</span>
        <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-full" style={{ background: 'var(--green-primary)' }} /> Stbd</span>
      </div>
    </div>
  )
}

export function MyLineupsPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const publishedFromStore = useLineupsStore((s) => s.published)

  /** Filter store lineups to those containing Star Miller by athleteId */
  const storeCards = [...publishedFromStore]
    .filter((pl) =>
      pl.boats.some((b) => b.seats.some((s) => s.athleteId === STAR_MILLER_ID)),
    )
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const totalLineups = storeCards.length + LINEUP_ENTRIES.length

  // Detect seat change between newest and previous LINEUP_ENTRIES
  const newestEntry = LINEUP_ENTRIES[0]
  const prevEntry = LINEUP_ENTRIES[1]
  const newestSeat = newestEntry?.seats.find((s) => s.highlight)?.seat
  const prevSeat = prevEntry?.seats.find((s) => s.highlight)?.seat
  const seatChanged = newestSeat && prevSeat && newestSeat !== prevSeat

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="LINEUPS"
        title="Your boats"
        subtitle={seatChanged ? `Seat changed: ${prevSeat} → ${newestSeat}` : `Seat ${newestSeat ?? 3} · ${totalLineups} lineups this season`}
      />

      <div className="grid grid-cols-2 gap-3 px-5 sm:grid-cols-3 sm:px-10">
        {[
          { label: 'Current seat', value: `Seat ${newestSeat ?? 3}`, accent: THEME.primary },
          { label: 'Boat', value: 'V8', accent: 'var(--green-primary)' },
          { label: 'Total lineups', value: String(totalLineups), accent: THEME.blue },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-4"
            style={{
              background: 'var(--bg-primary)',
              borderColor: THEME.border,
              borderLeft: `3px solid ${s.accent}`,
              boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 10px 30px -20px rgba(24,24,27,0.18)',
            }}
          >
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              {s.label}
            </div>
            <div className="mt-2 text-[22px] font-bold leading-none" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-4 px-5 sm:px-10">
        {/* Coach-published lineups from store, newest first */}
        {storeCards.map((pl) => {
          const isOpen = expanded === pl.id
          const starSeat = pl.boats.flatMap((b) =>
            b.seats
              .filter((s) => s.athleteId === STAR_MILLER_ID)
              .map((s) => ({ ...s, boatName: b.name })),
          )[0]
          const seatSummary = starSeat
            ? `Seat ${starSeat.seatNumber} · ${starSeat.side} · ${starSeat.boatName}`
            : 'Seat assigned'
          const dateLabel = new Date(pl.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

          return (
            <div
              key={pl.id}
              className="cursor-pointer rounded-2xl border p-5"
              style={{
                background: 'var(--bg-primary)',
                borderColor: THEME.border,
                boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
              }}
              onClick={() => setExpanded(isOpen ? null : pl.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{dateLabel}</div>
                    <span
                      className="rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                      style={{ borderColor: 'var(--green-primary)', color: 'var(--green-primary)', background: 'var(--green-subtle)', fontFamily: THEME.fontMono }}
                    >
                      Published by coach
                    </span>
                  </div>
                  <div className="mt-1 text-[15px] font-semibold" style={{ color: THEME.textPrimary, fontFamily: THEME.fontSerif }}>{pl.sessionTitle}</div>
                  <div className="mt-0.5 text-[12px]" style={{ color: THEME.textSecondary }}>{seatSummary}</div>
                  {pl.note && <div className="mt-0.5 text-[11px]" style={{ color: THEME.textMuted }}>{pl.note}</div>}
                </div>
                <span className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>{isOpen ? '▾' : '▸'}</span>
              </div>
              {isOpen && pl.boats.length > 0 && (
                <div className="mt-4 border-t pt-4" style={{ borderColor: THEME.border }}>
                  {pl.boats.map((boat) => (
                    <div key={boat.id} className="mb-4 last:mb-0">
                      <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                        {boat.name}
                      </div>
                      <div className="overflow-hidden rounded-xl border" style={{ borderColor: THEME.border }}>
                        <div className="synth-scroll overflow-x-auto">
                          <table className="w-full min-w-[320px] table-fixed text-left text-[12px]">
                            <colgroup>
                              <col style={{ width: '20%' }} />
                              <col style={{ width: '24%' }} />
                              <col />
                            </colgroup>
                            <thead style={{ background: 'var(--bg-surface)' }}>
                              <tr>
                                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>Seat</th>
                                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>Side</th>
                                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>Athlete</th>
                              </tr>
                            </thead>
                            <tbody>
                              {boat.seats.map((s) => {
                                const isStarMiller = s.athleteId === STAR_MILLER_ID
                                const seatLabel = s.isCox ? 'Cox' : String(s.seatNumber)
                                return (
                                  <tr
                                    key={`${s.seatNumber}-${s.side}`}
                                    className="border-t"
                                    style={{ borderColor: THEME.border, background: isStarMiller ? 'var(--green-subtle)' : 'transparent' }}
                                  >
                                    <td className="px-3 py-2" style={{ fontFamily: THEME.fontMono, fontWeight: 600, color: THEME.textPrimary }}>{seatLabel}</td>
                                    <td className="px-3 py-2" style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono }}>{s.side}</td>
                                    <td className="px-3 py-2" style={{ fontWeight: isStarMiller ? 700 : 400, color: THEME.textPrimary }}>
                                      {isStarMiller ? `★ ${STAR_MILLER_NAME}` : (s.athleteId ?? '—')}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Seed lineup entries — these get the boat diagram visual */}
        {LINEUP_ENTRIES.map((l, idx) => {
          const isOpen = expanded === l.id
          const isMostRecent = idx === 0
          const seatChangedHere = isMostRecent && seatChanged
          return (
            <div
              key={l.id}
              className="cursor-pointer rounded-2xl border p-5"
              style={{
                background: 'var(--bg-primary)',
                borderColor: THEME.border,
                boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
              }}
              onClick={() => setExpanded(isOpen ? null : l.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{l.date}</div>
                    {seatChangedHere && (
                      <span
                        className="rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                        style={{ borderColor: 'var(--amber-primary)', color: 'var(--amber-primary)', background: 'var(--amber-subtle)', fontFamily: THEME.fontMono }}
                      >
                        Seat change
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[15px] font-semibold" style={{ color: THEME.textPrimary, fontFamily: THEME.fontSerif }}>{l.title}</div>
                  <div className="mt-0.5 text-[12px]" style={{ color: THEME.textSecondary }}>{l.athleteSummary}</div>
                </div>
                <span className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>{isOpen ? '▾' : '▸'}</span>
              </div>
              {isOpen && (
                <div className="mt-4 grid gap-5 border-t pt-4 lg:grid-cols-[180px_1fr]" style={{ borderColor: THEME.border }}>
                  <div>
                    <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                      Boat layout
                    </div>
                    <BoatDiagram seats={l.seats} highlightName={STAR_MILLER_NAME} />
                  </div>
                  <div>
                    <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                      Roster
                    </div>
                    <div className="overflow-hidden rounded-xl border" style={{ borderColor: THEME.border }}>
                      <div className="synth-scroll overflow-x-auto">
                        <table className="w-full min-w-[320px] table-fixed text-left text-[12px]">
                          <colgroup>
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '24%' }} />
                            <col />
                          </colgroup>
                          <thead style={{ background: 'var(--bg-surface)' }}>
                            <tr>
                              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>Seat</th>
                              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>Side</th>
                              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>Athlete</th>
                            </tr>
                          </thead>
                          <tbody>
                            {l.seats.map((s) => (
                              <tr
                                key={s.seat}
                                className="border-t"
                                style={{
                                  borderColor: THEME.border,
                                  background: s.highlight ? 'var(--green-subtle)' : 'transparent',
                                }}
                              >
                                <td className="px-3 py-2" style={{ fontFamily: THEME.fontMono, fontWeight: 600, color: THEME.textPrimary }}>{s.seat}</td>
                                <td className="px-3 py-2" style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono }}>{s.side}</td>
                                <td className="px-3 py-2" style={{ fontWeight: s.highlight ? 700 : 400, color: THEME.textPrimary }}>{s.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MyChatPage() {
  const [chatTab, setChatTab] = useState<'ai' | 'messages'>('ai')

  // AI chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const msgIdRef = useRef(1)

  // Team messages state
  const teamMessages = useTeamMsgStore((s) => s.messages)
  const sendTeamMsg = useTeamMsgStore((s) => s.send)
  const [teamInput, setTeamInput] = useState('')
  const [teamSearch, setTeamSearch] = useState('')
  const teamBottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isTyping])

  useEffect(() => {
    if (chatTab === 'messages') {
      teamBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [teamMessages.length, chatTab])

  const send = (text: string) => {
    const t = text.trim()
    if (!t) return
    setInput('')
    const id = msgIdRef.current++
    setMessages((m) => [...m, { id, role: 'user', text: t, at: id }])
    setIsTyping(true)
    window.setTimeout(() => {
      const reply = findResponse(t)
      const at = msgIdRef.current++
      setMessages((m) => [...m, { id: at, role: 'assistant', text: reply, at }])
      setIsTyping(false)
    }, 650)
  }

  const handleSendTeam = () => {
    const t = teamInput.trim()
    if (!t) return
    sendTeamMsg('athlete', t)
    setTeamInput('')
  }

  const filteredTeamMessages = teamSearch.trim()
    ? teamMessages.filter((m) => m.text.toLowerCase().includes(teamSearch.toLowerCase()))
    : teamMessages

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="CHAT"
        title="Messages"
        subtitle="Ask synth. AI for race plans + insights, or message your coach."
      />

      <div className="px-5 sm:px-10">
        {/* Tab switcher */}
        <div className="inline-flex rounded-full border p-1" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
          {(['ai', 'messages'] as const).map((tab) => {
            const active = chatTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setChatTab(tab)}
                className="rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all"
                style={{
                  fontFamily: THEME.fontMono,
                  background: active ? THEME.primary : 'transparent',
                  color: active ? '#fff' : THEME.textSecondary,
                  letterSpacing: '0.04em',
                }}
              >
                {tab === 'ai' ? 'SYNTH. AI' : 'TEAM MESSAGES'}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 px-5 sm:px-10">
      {/* AI Tab */}
      {chatTab === 'ai' && (
        <Card>
          {messages.length === 0 ? (
            <div className="py-3">
              <div className="text-[18px] font-semibold" style={{ color: THEME.textPrimary, fontFamily: THEME.fontSerif }}>
                What do you want to know right now?
              </div>
              <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
                Tap a prompt to get a context-aware reply.
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {CHAT_PROMPT_CARDS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="group rounded-xl border p-3 text-left text-[13px] font-medium transition-all hover:border-[var(--green-primary)]"
                    style={{ borderColor: THEME.border, color: THEME.textPrimary, background: 'var(--bg-surface)' }}
                    onClick={() => send(p)}
                  >
                    <span>{p}</span>
                    <span className="ml-2 text-[11px] transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--green-primary)', fontFamily: THEME.fontMono }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <ChatBubble key={m.id} m={m} />
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border px-4 py-3" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(input) }} className="flex-1 rounded-xl border px-3 py-2 text-[13px] outline-none" style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary }} placeholder="Ask synth…" />
            <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={() => send(input)}>
              Send
            </button>
          </div>
        </Card>
      )}

      {/* Team Messages Tab */}
      {chatTab === 'messages' && (
        <Card>
          {/* Search */}
          <input
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            placeholder="Search messages…"
            className="w-full rounded-xl border px-3 py-2 text-[13px] outline-none"
            style={{ borderColor: THEME.border, background: 'var(--bg-surface)', color: THEME.textPrimary }}
          />

          {/* Messages */}
          <div className="synth-scroll mt-4 flex max-h-[400px] flex-col gap-3 overflow-y-auto pr-1">
            {filteredTeamMessages.map((m) => {
              const isMe = m.from === 'athlete'
              return (
                <div key={m.id} className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                  >
                    {isMe ? 'Me' : 'Coach'} · {fmtRelativeTime(m.at)}
                  </div>
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px]"
                    style={{
                      background: isMe ? `${THEME.primary}18` : 'var(--bg-primary)',
                      border: `1px solid ${isMe ? THEME.primary + '40' : THEME.border}`,
                      color: THEME.textPrimary,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              )
            })}
            <div ref={teamBottomRef} />
          </div>

          {/* Input bar */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="rounded-xl border px-3 py-2 text-[12px] transition-colors hover:bg-zinc-50"
              style={{ borderColor: THEME.border, color: THEME.textMuted }}
              onClick={() => toast('Image upload coming soon', 'info')}
              aria-label="Upload image"
            >
              📎
            </button>
            <input
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendTeam() }}
              className="flex-1 rounded-xl border px-3 py-2 text-[13px] outline-none"
              style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary }}
              placeholder="Message your coach…"
            />
            <button
              type="button"
              className="rounded-xl px-4 py-2 text-[12px] font-semibold transition-colors"
              style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
              onClick={handleSendTeam}
            >
              Send
            </button>
          </div>
        </Card>
      )}
      </div>
    </div>
  )
}

const NOTIF_LABELS: Record<keyof NotifPrefs, { label: string; detail: string }> = {
  coachNotes: { label: 'Coach notes', detail: "Get notified when your coach posts a new note." },
  lineupChanges: { label: 'Lineup changes', detail: 'Push when your seat or boat changes.' },
  sessionResults: { label: 'Session results', detail: 'Daily summary after each practice.' },
  prAlerts: { label: 'PR alerts', detail: 'Celebrate when you set a new personal record.' },
}

export function MySettingsPage() {
  const { theme, setTheme } = useThemeStore()
  const nav = useNavigate()
  const [notifs, setNotifs] = useState<NotifPrefs>(() => readNotifPrefs())

  const flipNotif = (key: keyof NotifPrefs) => {
    setNotifs((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      writeNotifPrefs(next)
      return next
    })
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="SETTINGS"
        title="Your account"
        subtitle="Profile, theme, connected apps, notifications, privacy."
      />

      <div className="grid gap-5 px-5 sm:px-10">
        {/* Profile */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              Profile
            </div>
            <span
              className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
              style={{ borderColor: 'var(--green-primary)', color: 'var(--green-primary)', background: 'var(--green-subtle)', fontFamily: THEME.fontMono }}
            >
              {DEMO_ATHLETE_PROFILE.status}
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Name', value: DEMO_ATHLETE_PROFILE.name },
              { label: 'Team', value: DEMO_ATHLETE_PROFILE.team },
              { label: 'Side', value: DEMO_ATHLETE_PROFILE.side },
              { label: 'Year', value: DEMO_ATHLETE_PROFILE.year },
            ].map((f) => (
              <div key={f.label}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{f.label}</div>
                <div className="mt-1 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>{f.value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Theme */}
        <Card>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Theme
          </div>
          <div className="mt-3 inline-flex rounded-full border p-1" style={{ borderColor: THEME.border, background: 'var(--bg-surface)' }}>
            {(['system', 'light', 'dark'] as const).map((t) => {
              const active = theme === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t as AppTheme)}
                  className="rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all"
                  style={{
                    fontFamily: THEME.fontMono,
                    background: active ? THEME.primary : 'transparent',
                    color: active ? '#fff' : THEME.textSecondary,
                    letterSpacing: '0.04em',
                  }}
                >
                  {t.toUpperCase()}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Connected apps */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              Connected apps
            </div>
            <button
              type="button"
              onClick={() => nav('/athlete/sources/connectors')}
              className="text-[11px] font-semibold hover:underline"
              style={{ color: THEME.primary, fontFamily: THEME.fontMono }}
            >
              Manage all →
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CONNECTED_APPS.map((a) => {
              const isConnected = a.status === 'connected'
              return (
                <div
                  key={a.name}
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: THEME.border,
                    background: 'var(--bg-surface)',
                    borderLeft: `3px solid ${isConnected ? 'var(--green-primary)' : THEME.border}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>{a.name}</div>
                      <div className="mt-0.5 text-[11px]" style={{ color: THEME.textMuted }}>{a.detail}</div>
                    </div>
                    <span
                      className="shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                      style={{
                        borderColor: isConnected ? 'var(--green-primary)' : THEME.border,
                        color: isConnected ? 'var(--green-primary)' : THEME.textMuted,
                        background: isConnected ? 'var(--green-subtle)' : 'transparent',
                        fontFamily: THEME.fontMono,
                      }}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {isConnected ? (
                      <>
                        <button
                          type="button"
                          onClick={() => toast(`${a.name} sync started`, 'success')}
                          className="rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors hover:bg-zinc-50"
                          style={{ borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
                        >
                          Sync now
                        </button>
                        <button
                          type="button"
                          onClick={() => nav('/athlete/sources/data-view')}
                          className="rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors hover:bg-zinc-50"
                          style={{ borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
                        >
                          View data
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => nav('/athlete/sources/connectors')}
                        className="rounded-md px-2.5 py-1 text-[10px] font-semibold text-white transition-colors"
                        style={{ background: THEME.primary, fontFamily: THEME.fontMono, letterSpacing: '0.04em' }}
                      >
                        Connect →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Notifications
          </div>
          <div className="mt-4 space-y-4">
            {(Object.keys(NOTIF_LABELS) as Array<keyof NotifPrefs>).map((key) => {
              const val = notifs[key]
              const meta = NOTIF_LABELS[key]
              return (
                <div key={key} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>{meta.label}</div>
                    <div className="mt-0.5 text-[11px]" style={{ color: THEME.textMuted }}>{meta.detail}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => flipNotif(key)}
                    className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                    style={{ background: val ? THEME.primary : 'var(--bg-surface-raised)' }}
                    aria-pressed={val}
                  >
                    <span
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                      style={{ transform: val ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Privacy */}
        <Card>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Privacy
          </div>
          <p className="mt-3 text-[13px] leading-relaxed" style={{ color: THEME.textSecondary }}>
            Your wellness data is only visible to you and your coach. Erg scores are shared with the team by default. You can adjust visibility with your coach in team settings.
          </p>
        </Card>
      </div>
    </div>
  )
}

export function AthleteSourcesConnectorsPage() {
  const nav = useNavigate()
  const vis = useVisibilitySettings()
  const [whoopConnected, setWhoopConnected] = useState(readWhoopConnected())

  const toggleWhoop = () => {
    const next = !whoopConnected
    setWhoopConnected(next)
    writeWhoopConnected(next)
    toast(next ? 'Whoop connected (demo)' : 'Whoop disconnected (demo)', 'success')
  }

  if (!vis.allowPersonalSources) {
    return (
      <div className="flex min-h-full w-full flex-col pb-12">
        <PageHeader kicker="SOURCES · CONNECTORS" title="Personal data sources" />
        <div className="mx-5 rounded-2xl border border-dashed p-10 text-center sm:mx-10" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
          <div className="text-[16px] font-semibold" style={{ color: THEME.textPrimary, fontFamily: THEME.fontSerif }}>Personal sources not enabled</div>
          <div className="mt-2 text-[13px]" style={{ color: THEME.textSecondary }}>Your coach hasn't enabled personal source connections for this team.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="SOURCES · CONNECTORS"
        title="Personal data sources"
        subtitle="Connect Concept2, Strava, Apple Health and more — synth. pulls them automatically."
        actions={
          <button
            type="button"
            className="rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-zinc-50"
            style={{ borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
            onClick={() => nav('/athlete/sources/data-view')}
          >
            View data →
          </button>
        }
      />

      <div className="grid gap-5 px-5 sm:px-10">
        <Card>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Connected
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {ATHLETE_DATA_SOURCES.filter((s) => s.id !== 'whoop').map((s) => (
              <div key={s.id} className="rounded-2xl border p-4" style={{ borderColor: THEME.border, background: THEME.light }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>
                      <SourceDot color={s.color} />
                      {s.label}
                    </div>
                    <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
                      {s.syncLabel} • {s.records}
                    </div>
                  </div>
                  <Pill tone="good">{s.status}</Pill>
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={() => toast('Sync started (demo)', 'success')}>
                    Sync now
                  </button>
                  <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={() => nav(`/athlete/sources/data-view?tab=${s.id}`)}>
                    View data →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Available to connect
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border p-4" style={{ borderColor: THEME.border, background: THEME.light }}>
              <div className="text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>
                Whoop
              </div>
              <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
                Recovery + sleep + strain
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={toggleWhoop}>
                  {whoopConnected ? 'Disconnect' : 'Connect'}
                </button>
                <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={() => nav('/athlete/sources/data-view?tab=whoop')}>
                  Preview →
                </button>
              </div>
            </div>
            {['Garmin', 'Oura Ring'].map((n) => (
              <div key={n} className="rounded-2xl border p-4" style={{ borderColor: THEME.border, background: THEME.light }}>
                <div className="text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>
                  {n}
                </div>
                <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
                  Available via synth. Agent
                </div>
                <div className="mt-3">
                  <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textSecondary }} disabled>
                    Connect — via coach
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function AthleteInfoBanner({ activeTab }: { activeTab: AthleteDataViewTabId }) {
  const healthy = ATHLETE_DATA_SOURCES.filter((s) => s.status === 'Healthy').length
  const total = ATHLETE_DATA_SOURCES.length
  const label = ATHLETE_DATA_TABS.find((t) => t.id === activeTab)?.label ?? 'Data View'
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: THEME.border, background: THEME.light }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[12px] font-semibold" style={{ color: THEME.textPrimary }}>
            {label} • scoped to {DEMO_ATHLETE_PROFILE.name}
          </div>
          <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
            {healthy}/{total} sources healthy • last inference {ATHLETE_INFERENCE_LOG[0]?.at ?? '—'}
          </div>
        </div>
        <Pill tone="good">Demo mode</Pill>
      </div>
    </div>
  )
}

function AthleteSourceShell({
  tab,
  children,
  actions,
}: {
  tab: Exclude<AthleteDataViewTabId, 'workflow'>
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  const s = ATHLETE_DATA_SOURCES.find((x) => x.id === tab)
  if (!s) return <>{children}</>
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
        <div>
          <div className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>
            <SourceDot color={s.color} />
            {s.label}
          </div>
          <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
            {s.syncLabel} • {s.records} • quality {s.quality}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={() => toast('Sync started (demo)', 'success')}>
            Sync now
          </button>
          <a className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} href={s.openUrl} target="_blank" rel="noreferrer">
            Open source
          </a>
          {actions}
        </div>
      </div>
      {children}
    </div>
  )
}

function AthleteWorkflowBoard({ onSelectTab }: { onSelectTab: (t: AthleteDataViewTabId) => void }) {
  const [nodes, setNodes] = useState(ATHLETE_WORKFLOW_NODES)
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const onDown = (id: string, e: React.PointerEvent) => {
    const n = nodes.find((x) => x.id === id)
    if (!n) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { id, dx: e.clientX - n.x, dy: e.clientY - n.y }
  }
  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const { id, dx, dy } = dragRef.current
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              x: clamp(e.clientX - dx, 0, ATHLETE_WORKFLOW_CANVAS.w - ATHLETE_WORKFLOW_CANVAS.nodeW),
              y: clamp(e.clientY - dy, 0, ATHLETE_WORKFLOW_CANVAS.h - ATHLETE_WORKFLOW_CANVAS.nodeH),
            }
          : n,
      ),
    )
  }
  const onUp = () => {
    dragRef.current = null
  }

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="rounded-2xl border p-4" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                Workflow
              </div>
              <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
                Drag nodes. Double-click a source to open its tab.
              </div>
            </div>
            <Pill tone="neutral">{ATHLETE_DATA_SOURCES.length} sources</Pill>
          </div>

          {/* Desktop: draggable SVG canvas. Mobile: vertical card list (canvas needs >=lg width) */}
          <div className="relative hidden overflow-hidden rounded-xl border lg:block" style={{ borderColor: THEME.border, background: 'var(--bg-surface)', height: 560 }}>
            <svg className="absolute inset-0 h-full w-full">
              {ATHLETE_WORKFLOW_EDGES.map((e) => {
                const a = byId.get(e.from)
                const b = byId.get(e.to)
                if (!a || !b) return null
                const x1 = a.x + ATHLETE_WORKFLOW_CANVAS.nodeW
                const y1 = a.y + ATHLETE_WORKFLOW_CANVAS.nodeH / 2
                const x2 = b.x
                const y2 = b.y + ATHLETE_WORKFLOW_CANVAS.nodeH / 2
                const mx = (x1 + x2) / 2
                return (
                  <g key={e.id}>
                    <path d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} fill="none" stroke={e.color} strokeWidth={2} opacity={0.55} />
                    <text x={mx} y={(y1 + y2) / 2 - 6} fontSize="11" fill={THEME.textMuted} textAnchor="middle">
                      {e.label}
                    </text>
                  </g>
                )
              })}
            </svg>

            {nodes.map((n) => {
              const border = n.kind === 'source' ? n.color ?? THEME.border : n.kind === 'output' ? 'var(--green-primary)' : THEME.border
              return (
                <div
                  key={n.id}
                  onPointerDown={(e) => onDown(n.id, e)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onDoubleClick={() => {
                    const t = n.id as AthleteDataViewTabId
                    if (ATHLETE_DATA_TABS.some((x) => x.id === t)) onSelectTab(t)
                  }}
                  className="absolute cursor-grab select-none rounded-2xl border p-3 active:cursor-grabbing"
                  style={{ left: n.x, top: n.y, width: ATHLETE_WORKFLOW_CANVAS.nodeW, height: ATHLETE_WORKFLOW_CANVAS.nodeH, borderColor: border, background: 'var(--bg-primary)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                      {n.label}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                      {n.kind}
                    </div>
                  </div>
                  <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
                    {n.detail}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile fallback: linear node list grouped by kind */}
          <div className="space-y-3 lg:hidden">
            {(['source', 'process', 'output'] as const).map((kind) => {
              const groupNodes = nodes.filter((n) => n.kind === kind)
              if (groupNodes.length === 0) return null
              return (
                <div key={kind}>
                  <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                    {kind}s
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {groupNodes.map((n) => {
                      const accent = n.kind === 'source' ? n.color ?? THEME.border : n.kind === 'output' ? 'var(--green-primary)' : THEME.primary
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            const t = n.id as AthleteDataViewTabId
                            if (ATHLETE_DATA_TABS.some((x) => x.id === t)) onSelectTab(t)
                          }}
                          className="rounded-xl border p-3 text-left"
                          style={{ borderColor: THEME.border, borderLeft: `3px solid ${accent}`, background: 'var(--bg-primary)' }}
                        >
                          <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>{n.label}</div>
                          <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary }}>{n.detail}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-5">
        <div className="rounded-2xl border p-4" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Source health
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: THEME.border }}>
            <table className="w-full text-left text-[12px]">
              <thead style={{ background: THEME.light }}>
                <tr>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Last</th>
                </tr>
              </thead>
              <tbody>
                {ATHLETE_DATA_SOURCES.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-zinc-50" style={{ borderColor: THEME.border, cursor: 'pointer' }} onClick={() => onSelectTab(s.id)}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <SourceDot color={s.color} />
                        <span style={{ fontFamily: THEME.fontMono }}>{s.label}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Pill tone={s.status === 'Healthy' ? 'good' : 'warn'}>{s.status}</Pill>
                    </td>
                    <td className="px-3 py-2" style={{ color: THEME.textSecondary }}>
                      {s.syncLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border p-4" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Inference log
          </div>
          <div className="mt-3 space-y-3">
            {ATHLETE_INFERENCE_LOG.map((r) => (
              <div key={r.id} className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  {r.at}
                </div>
                <div className="mt-1 text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                  {r.title}
                </div>
                <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
                  {r.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AthleteDataViewAiPanel({ tab }: { tab: AthleteDataViewTabId }) {
  const [pending, setPending] = useState(false)
  const [last, setLast] = useState<string | null>(null)
  const suggestions: Record<AthleteDataViewTabId, string[]> = {
    workflow: ["What's missing?", 'Any data quality issues?', 'What changed this week?'],
    concept2: ["What's my trend?", 'What should I focus on?', 'How close am I to my goal?'],
    strava: ['Weekly volume?', 'How hard is my cross training?', 'Any red flags?'],
    'apple-health': ['Sleep trend?', 'Is my HRV stable?', 'What should I do tonight?'],
    whoop: ['Recovery today?', 'How strained am I?', 'Is this race-ready?'],
    workbook: ["What's my next test?", 'Any missing entries?', 'What should I log today?'],
  }

  const replyFor = (q: string) => {
    if (tab === 'strava') return `You have **${ATHLETE_STRAVA_ROWS.length}** recent activities.\n\nIf you want the best ROI: keep cross-training easy when intensity is high on the water.`
    if (tab === 'workflow') return `Everything is flowing.\n\nOne check: make sure workbook naming matches your athlete ID (that's where merges usually break).`
    return `Good question: "${q}".\n\nFor demo, I'm returning a scripted response per tab - when we wire real data, this becomes tab-aware analysis.`
  }

  const ask = (q: string) => {
    setPending(true)
    window.setTimeout(() => {
      setLast(replyFor(q))
      setPending(false)
    }, 650)
  }

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          synth. AI
        </div>
        {pending && <Pill tone="neutral">thinking…</Pill>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions[tab].map((s) => (
          <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
            {s}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
        {pending ? <TypingIndicator /> : last ? <FormattedMessage text={last} /> : <div className="text-[13px]" style={{ color: THEME.textSecondary }}>Ask a chip to get a tab-aware answer.</div>}
      </div>
    </div>
  )
}

export function AthleteSourcesDataViewPage() {
  const [params, setParams] = useSearchParams()
  const [whoopConnected, setWhoopConnected] = useState(() => readWhoopConnected())

  const raw = (params.get('tab') ?? 'workflow') as AthleteDataViewTabId
  const activeTab: AthleteDataViewTabId = ATHLETE_DATA_TABS.some((t) => t.id === raw) ? raw : 'workflow'

  const visibleTabs = useMemo(() => {
    if (whoopConnected) return ATHLETE_DATA_TABS
    return ATHLETE_DATA_TABS.filter((t) => t.id !== 'whoop')
  }, [whoopConnected])

  const setTab = (t: AthleteDataViewTabId) => {
    const next = new URLSearchParams(params)
    next.set('tab', t)
    setParams(next, { replace: true })
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-24">
      <PageHeader
        kicker="SOURCES · DATA VIEW"
        title="Your data flow"
        subtitle="Where your data comes from, how it's processed, and what's powering each insight."
        actions={
          <div className="inline-flex rounded-full border p-1" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
            <NavLink
              to="/athlete/sources/connectors"
              className="rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary, letterSpacing: '0.04em' }}
            >
              CONNECTORS
            </NavLink>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{ fontFamily: THEME.fontMono, background: THEME.primary, color: '#fff', letterSpacing: '0.04em' }}
            >
              DATA VIEW
            </span>
          </div>
        }
      />

      <div className="px-5 sm:px-10">
        <AthleteInfoBanner activeTab={activeTab} />
      </div>

      <div className="mt-5 grid gap-5 px-5 sm:px-10 lg:grid-cols-12">
        <div className="lg:col-span-9 space-y-5">
          {activeTab === 'workflow' && <AthleteWorkflowBoard onSelectTab={setTab} />}

          {activeTab === 'concept2' && (
            <AthleteSourceShell tab="concept2">
              <Card>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  Erg history
                </div>
                <div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: THEME.border }}>
                  <table className="w-full text-left text-[12px]">
                    <thead style={{ background: THEME.light }}>
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Test</th>
                        <th className="px-3 py-2">Split</th>
                        <th className="px-3 py-2">Watts</th>
                        <th className="px-3 py-2">SR</th>
                        <th className="px-3 py-2">Dist</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ATHLETE_CONCEPT2_ROWS.map((r) => (
                        <tr key={r.id} className="border-t" style={{ borderColor: THEME.border }}>
                          <td className="px-3 py-2">{fmtDateShort(r.dateIso)}</td>
                          <td className="px-3 py-2">{r.testType}</td>
                          <td className="px-3 py-2" style={{ fontFamily: THEME.fontMono }}>
                            {r.split}
                          </td>
                          <td className="px-3 py-2" style={{ fontFamily: THEME.fontMono }}>
                            {r.watts}
                          </td>
                          <td className="px-3 py-2" style={{ fontFamily: THEME.fontMono }}>
                            {r.strokeRate}
                          </td>
                          <td className="px-3 py-2" style={{ fontFamily: THEME.fontMono }}>
                            {r.distanceM}m
                          </td>
                          <td className="px-3 py-2">{r.isPr ? <Pill tone="good">PR</Pill> : <Pill tone="neutral">ok</Pill>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </AthleteSourceShell>
          )}

          {activeTab === 'strava' && (
            <AthleteSourceShell tab="strava">
              <Card>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  Activities
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                    <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                      Count
                    </div>
                    <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary }}>
                      {ATHLETE_STRAVA_ROWS.length}
                    </div>
                  </div>
                  <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                    <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                      Distance
                    </div>
                    <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary }}>
                      {ATHLETE_STRAVA_ROWS.reduce((a, b) => a + b.distanceKm, 0).toFixed(1)} km
                    </div>
                  </div>
                  <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                    <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                      Median effort
                    </div>
                    <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary }}>
                      {median(ATHLETE_STRAVA_ROWS.map((r) => r.effort)).toFixed(0)}/10
                    </div>
                  </div>
                  <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                    <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                      Avg duration
                    </div>
                    <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary }}>
                      {avg(ATHLETE_STRAVA_ROWS.map((r) => r.durationMin)).toFixed(0)} min
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: THEME.border }}>
                  <table className="w-full text-left text-[12px]">
                    <thead style={{ background: THEME.light }}>
                      <tr>
                        <th className="px-3 py-2">When</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Dist</th>
                        <th className="px-3 py-2">Dur</th>
                        <th className="px-3 py-2">Effort</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ATHLETE_STRAVA_ROWS.map((r) => (
                        <tr key={r.id} className="border-t" style={{ borderColor: THEME.border }}>
                          <td className="px-3 py-2">{fmtDateTime(r.atIso)}</td>
                          <td className="px-3 py-2">{r.type}</td>
                          <td className="px-3 py-2" style={{ fontFamily: THEME.fontMono }}>
                            {r.distanceKm.toFixed(1)} km
                          </td>
                          <td className="px-3 py-2" style={{ fontFamily: THEME.fontMono }}>
                            {r.durationMin.toFixed(0)} min
                          </td>
                          <td className="px-3 py-2">
                            <Pill tone={r.effort >= 7 ? 'warn' : 'neutral'}>{r.effort}/10</Pill>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </AthleteSourceShell>
          )}

          {activeTab === 'apple-health' && (
            <AthleteSourceShell tab="apple-health">
              <Card>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  Biometrics
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                    <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                      Avg sleep
                    </div>
                    <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary }}>
                      {avg(ATHLETE_BIOMETRICS.map((p) => p.sleep)).toFixed(1)}h
                    </div>
                  </div>
                  <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                    <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                      Avg HRV
                    </div>
                    <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary }}>
                      {avg(ATHLETE_BIOMETRICS.map((p) => p.hrv)).toFixed(0)}
                    </div>
                  </div>
                  <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                    <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                      Avg RHR
                    </div>
                    <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary }}>
                      {avg(ATHLETE_BIOMETRICS.map((p) => p.rhr)).toFixed(0)}
                    </div>
                  </div>
                </div>
                {/* Each metric gets its own scale so the lines mean something. */}
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {[
                    { key: 'sleep', label: 'Sleep (h)', color: '#FF2D55', fmt: (v: number) => v.toFixed(1) },
                    { key: 'hrv', label: 'HRV (ms)', color: 'var(--green-primary)', fmt: (v: number) => v.toFixed(0) },
                    { key: 'rhr', label: 'RHR (bpm)', color: THEME.blue, fmt: (v: number) => v.toFixed(0) },
                  ].map((m) => (
                    <div key={m.key} className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                        {m.label}
                      </div>
                      <div className="mt-2 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={ATHLETE_BIOMETRICS} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                            <CartesianGrid stroke={THEME.border} strokeDasharray="4 6" />
                            <XAxis dataKey="day" tick={{ fontSize: 9, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 9, fill: THEME.textMuted }} axisLine={false} tickLine={false} tickFormatter={m.fmt} />
                            <Tooltip
                              formatter={(v: number) => [m.fmt(v), m.label]}
                              contentStyle={{ borderRadius: 8, border: `1px solid var(--border-default)`, background: 'var(--bg-primary)', fontSize: 11 }}
                            />
                            <Line type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </AthleteSourceShell>
          )}

          {activeTab === 'whoop' && (
            <AthleteSourceShell
              tab="whoop"
              actions={
                <button
                  type="button"
                  className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50"
                  style={{ borderColor: THEME.border, color: THEME.textPrimary }}
                  onClick={() => {
                    const next = !whoopConnected
                    setWhoopConnected(next)
                    writeWhoopConnected(next)
                    toast(next ? 'Whoop connected (demo)' : 'Whoop disconnected (demo)', 'success')
                  }}
                >
                  {whoopConnected ? 'Disconnect' : 'Connect'}
                </button>
              }
            >
              {!whoopConnected ? (
                <div className="rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: THEME.border, background: THEME.light }}>
                  <div className="text-[13px]" style={{ color: THEME.textSecondary }}>
                    Whoop isn't connected for this athlete yet. Connect it on the Connectors page.
                  </div>
                </div>
              ) : (
                <Card>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                    Recovery
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                      <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        Avg recovery
                      </div>
                      <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary }}>
                        {avg(ATHLETE_BIOMETRICS.map((p) => p.recovery)).toFixed(0)}%
                      </div>
                    </div>
                    <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                      <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        Avg strain
                      </div>
                      <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary }}>
                        {avg(ATHLETE_BIOMETRICS.map((p) => p.strain)).toFixed(1)}
                      </div>
                    </div>
                    <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                      <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        Best recovery
                      </div>
                      <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary }}>
                        {Math.max(...ATHLETE_BIOMETRICS.map((p) => p.recovery))}%
                      </div>
                    </div>
                    <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
                      <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        Latest sleep
                      </div>
                      <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary }}>
                        {ATHLETE_BIOMETRICS.at(-1)?.sleep.toFixed(1)}h
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-56 rounded-xl border p-3" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ATHLETE_BIOMETRICS}>
                        <CartesianGrid stroke={THEME.border} strokeDasharray="4 6" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: THEME.textMuted }} />
                        <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="recovery" stroke="#00C2A8" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="strain" stroke="#111827" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </AthleteSourceShell>
          )}

          {activeTab === 'workbook' && (
            <AthleteSourceShell tab="workbook">
              <Card>
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  Erg Workbook
                </div>
                <div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: THEME.border }}>
                  <div className="synth-scroll overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-[13px]">
                      <thead>
                        <tr style={{ background: 'var(--bg-surface)', borderBottom: `1px solid ${THEME.border}` }}>
                          {WORKBOOK_COLUMNS.map((c) => (
                            <th key={c} className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {WORKBOOK_SHEETS['Erg Log'].map((row, i) => {
                          const isStarRow = row[1] === 'Star Miller'
                          return (
                            <tr
                              key={i}
                              style={{
                                borderTop: `1px solid ${THEME.border}`,
                                background: isStarRow ? 'var(--green-subtle)' : 'transparent',
                              }}
                            >
                              {row.map((cell, j) => (
                                <td
                                  key={j}
                                  className="px-3 py-2"
                                  style={{
                                    color: THEME.textPrimary,
                                    fontFamily: j >= 2 ? THEME.fontMono : THEME.fontSans,
                                    fontWeight: isStarRow && j === 1 ? 700 : 400,
                                  }}
                                >
                                  {isStarRow && j === 1 ? `★ ${cell}` : cell}
                                </td>
                              ))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </AthleteSourceShell>
          )}
        </div>

        <div className="lg:col-span-3">
          <AthleteDataViewAiPanel tab={activeTab} />
        </div>
      </div>

      {/* In-flow source picker (mono pills, scrollable on mobile) */}
      <div className="mt-6 px-5 sm:px-10">
        <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Switch source
        </div>
        <div className="synth-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
          {visibleTabs.map((t) => {
            const active = t.id === activeTab
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all"
                style={{
                  fontFamily: THEME.fontMono,
                  borderColor: active ? THEME.primary : THEME.border,
                  background: active ? 'var(--green-subtle)' : 'var(--bg-primary)',
                  color: active ? 'var(--green-primary)' : THEME.textSecondary,
                  whiteSpace: 'nowrap',
                }}
              >
                <SourceDot color={t.color} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

