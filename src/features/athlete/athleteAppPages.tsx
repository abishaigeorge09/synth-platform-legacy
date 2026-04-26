import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { THEME } from '../../lib/theme'
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
  DEMO_ATHLETE_PROFILE,
  ERG_CHART_SUMMARY,
  ERG_PROGRESSION_POINTS,
  GOALS,
  LATEST_COACH_FEEDBACK,
  LINEUP_ENTRIES,
  MONTH_SUMMARY,
  COACH_FEEDBACK_HISTORY,
  SESSION_ENTRIES,
  TODAY_META,
  TODAY_SCHEDULE,
  TODAY_STATUS_SENTENCE,
  WORKBOOK_COLUMNS,
  WORKBOOK_SHEETS,
  WORKBOOK_TABS,
  CONNECTED_APPS,
} from './data/demoAthleteData'
import { useAthleteMediaStore } from '../../shared/store/useAthleteMediaStore'
import { toast } from '../../shared/store/useToastStore'
import { useThemeStore, type AppTheme } from '../../shared/store/useThemeStore'
import { useLineupsStore } from '../../shared/store/useLineupsStore'
import { useSessionTimerStore } from '../../shared/store/useSessionTimerStore'
import { useVisibilitySettings } from '../../shared/store/useVisibilitySettings'
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

function SectionTitle({ kicker, title, right }: { kicker?: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {kicker && (
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            {kicker}
          </div>
        )}
        <div className="mt-1 text-[20px] font-bold" style={{ color: THEME.textPrimary }}>
          {title}
        </div>
      </div>
      {right}
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

  return (
    <motion.div
      className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-10"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {/* Page header */}
      <motion.div variants={cardVariant}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          {TODAY_META.dateLabel}
        </div>
        <div className="mt-0.5 text-[22px] font-bold" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
          Today
        </div>
      </motion.div>

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        {/* ── Hero status card ── */}
        <motion.div
          variants={cardVariant}
          className="lg:col-span-12 rounded-2xl border p-5"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}
        >
          {/* Avatar + identity */}
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[20px] font-bold"
              style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
            >
              SM
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[20px] font-bold leading-tight" style={{ color: THEME.textPrimary }}>
                {DEMO_ATHLETE_PROFILE.name}
              </div>
              <div className="mt-0.5 text-[13px]" style={{ color: THEME.textSecondary }}>
                {DEMO_ATHLETE_PROFILE.team} · {DEMO_ATHLETE_PROFILE.side} · {DEMO_ATHLETE_PROFILE.year}
              </div>
            </div>
            <Pill tone="good">Race in {TODAY_META.raceCountdown.daysAway} days</Pill>
          </div>

          {/* Stat pods */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {/* 2K BEST */}
            <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: 'var(--bg-surface)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                2K Best
              </div>
              <div className="mt-2 text-[28px] font-bold leading-none" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
                6:44.9
              </div>
              <div className="mt-1 text-[12px] font-semibold" style={{ color: 'var(--green-primary)' }}>
                -1.7s YOY
              </div>
            </div>

            {/* RECOVERY */}
            <div className="flex flex-col rounded-xl border p-3" style={{ borderColor: THEME.border, background: 'var(--bg-surface)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                Recovery
              </div>
              <div className="mt-2 flex items-center justify-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-[22px] font-bold"
                  style={{
                    fontFamily: THEME.fontMono,
                    color: 'var(--amber-primary)',
                    background: 'var(--amber-subtle)',
                    border: '3px solid var(--amber-primary)',
                  }}
                >
                  72
                </div>
              </div>
            </div>

            {/* STREAK */}
            <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: 'var(--bg-surface)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                Streak
              </div>
              <div className="mt-2 text-[28px] font-bold leading-none" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
                13 days
              </div>
              <div className="mt-1 text-[12px]" style={{ color: THEME.textMuted }}>
                wellness
              </div>
            </div>
          </div>

          {/* Contextual sentence */}
          <div className="mt-4 text-[14px]" style={{ color: THEME.textSecondary }}>
            {TODAY_STATUS_SENTENCE}
          </div>

          {/* Quick actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50"
              style={{ borderColor: THEME.border, color: THEME.textPrimary }}
              onClick={() => nav('/athlete/record?tab=score')}
            >
              Log erg score
            </button>
            <button
              type="button"
              className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50"
              style={{ borderColor: THEME.border, color: THEME.textPrimary }}
              onClick={() => nav('/athlete/record?tab=form')}
            >
              Record form
            </button>
            <button
              type="button"
              className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50"
              style={{ borderColor: THEME.border, color: THEME.textPrimary }}
              onClick={() => nav('/athlete/chat')}
            >
              Ask synth.
            </button>
          </div>
        </motion.div>

        {/* ── Schedule ── */}
        <motion.div
          variants={cardVariant}
          className="lg:col-span-7 rounded-2xl border p-5"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Today's schedule
          </div>
          <div className="mt-4 space-y-3">
            {TODAY_SCHEDULE.map((e) => (
              <div key={e.time} className="flex items-start gap-3">
                <div className="mt-0.5 w-[68px] shrink-0 text-[12px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  {e.time}
                </div>
                <div
                  className="mt-[6px] h-2 w-2 shrink-0 rounded-full"
                  style={{ background: SCHEDULE_DOT_COLOR[e.type] ?? THEME.textMuted }}
                />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                    {e.title}
                  </div>
                  <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary }}>
                    {e.type}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Race countdown */}
          <div
            className="mt-5 rounded-xl border-l-4 p-3"
            style={{ borderLeftColor: 'var(--green-primary)', background: 'var(--green-subtle)' }}
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ fontFamily: THEME.fontMono, color: 'var(--green-primary)' }}>
              Cal Invite Regatta — Saturday
            </div>
            <div className="mt-0.5 text-[12px]" style={{ color: THEME.textSecondary }}>
              V8 Seat 3 (Port) · {TODAY_META.raceCountdown.daysAway} days away
            </div>
          </div>
        </motion.div>

        {/* ── Coach feedback ── */}
        <motion.div
          variants={cardVariant}
          className="lg:col-span-5 rounded-2xl border p-5"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Latest from coach
          </div>
          <div
            className="mt-3 rounded-xl border-l-4 p-4"
            style={{ borderLeftColor: 'var(--purple-primary)', background: 'var(--bg-surface)' }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: 'var(--purple-primary)' }}>
              Coach note · {LATEST_COACH_FEEDBACK.date}
            </div>
            <div className="mt-2 text-[13px] leading-relaxed" style={{ color: THEME.textPrimary }}>
              {LATEST_COACH_FEEDBACK.quote}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {LATEST_COACH_FEEDBACK.focusPoints.map((f) => (
                <span
                  key={f.label}
                  className="rounded-full border px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    borderColor: f.status === 'improved' ? 'var(--green-primary)' : 'var(--amber-primary)',
                    color: f.status === 'improved' ? 'var(--green-primary)' : 'var(--amber-primary)',
                    background: f.status === 'improved' ? 'var(--green-subtle)' : 'var(--amber-subtle)',
                  }}
                >
                  {f.label}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="mt-3 text-[12px] font-semibold hover:underline"
            style={{ color: THEME.textSecondary }}
            onClick={() => nav('/athlete/progress')}
          >
            View feedback history →
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function MyStatsPage() {
  const { videos } = useAthleteMediaStore()

  const fmtSplit = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec - m * 60
    return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-10">
      <SectionTitle kicker="My Progress" title="What's moving" right={<Link className="text-[12px] font-semibold underline" to="/athlete/record?tab=form">Record form</Link>} />

      {/* Goals */}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {GOALS.map((g) => (
          <Card key={g.name}>
            <div className="flex items-start justify-between gap-2">
              <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>{g.name}</div>
              <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>Target: {g.target}</div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: THEME.border }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${g.progress}%`, background: THEME.accent }} />
            </div>
            <div className="mt-2 text-[12px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>{g.progressLabel}</div>
            <div className="mt-2 text-[12px]" style={{ color: THEME.textMuted }}>{g.insight}</div>
          </Card>
        ))}
      </div>

      {/* Erg progression chart */}
      <Card className="mt-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          2K Erg Progression
        </div>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ERG_PROGRESSION_POINTS}>
              <CartesianGrid stroke={THEME.border} strokeDasharray="4 6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: THEME.textMuted }} />
              <YAxis
                domain={[400, 414]}
                tick={{ fontSize: 11, fill: THEME.textMuted }}
                tickFormatter={(v: number) => fmtSplit(v)}
              />
              <Tooltip formatter={(v: number) => [fmtSplit(v), 'Split']} />
              <Line type="monotone" dataKey="seconds" stroke={THEME.accent} strokeWidth={2} dot={{ r: 4, fill: THEME.accent }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-[12px]" style={{ color: THEME.textSecondary }}>{ERG_CHART_SUMMARY}</div>
      </Card>

      {/* Monthly stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {MONTH_SUMMARY.map((s) => (
          <div key={s.label} className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
            <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>{s.label}</div>
            <div className="mt-1 text-[18px] font-bold" style={{ color: THEME.textPrimary }}>{s.value}</div>
            <div className="mt-0.5 text-[11px]" style={{ color: THEME.textMuted }}>{s.detail}</div>
          </div>
        ))}
      </div>

      {/* Coach feedback history */}
      <Card className="mt-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Coach feedback
        </div>
        <div className="mt-4 space-y-3">
          {COACH_FEEDBACK_HISTORY.map((f, i) => (
            <div key={i} className="rounded-xl border-l-4 p-3" style={{ borderColor: THEME.purple, background: THEME.light }}>
              <div className="flex items-center gap-2">
                <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{f.date}</div>
                {f.tags.map((t) => (
                  <span key={t} className="rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: THEME.border, color: THEME.textSecondary }}>{t}</span>
                ))}
              </div>
              <div className="mt-2 text-[13px]" style={{ color: THEME.textPrimary }}>{f.takeaway}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Form videos */}
      <Card className="mt-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          My form videos
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {videos.length === 0 ? (
            <div className="rounded-xl border border-dashed p-5 text-[13px]" style={{ borderColor: THEME.border, color: THEME.textSecondary }}>
              No saved videos yet. Record a clip and save it locally.
            </div>
          ) : (
            videos.slice(0, 6).map((v) => (
              <div key={v.id} className="overflow-hidden rounded-xl border" style={{ borderColor: THEME.border, background: THEME.light }}>
                <div className="aspect-video w-full bg-black/10" />
                <div className="p-3">
                  <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>{v.title}</div>
                  <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
                    {v.date} • {Math.round(v.duration)}s • {v.sentToCoach ? 'sent' : 'local'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
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
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-10">
      <SectionTitle kicker="Record" title="Capture what matters" />
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('form')}
          className="rounded-xl border px-3 py-2 text-[12px] font-semibold"
          style={{ borderColor: THEME.border, background: tab === 'form' ? THEME.light : 'var(--bg-primary)' }}
        >
          Record form
        </button>
        <button
          type="button"
          onClick={() => setTab('score')}
          className="rounded-xl border px-3 py-2 text-[12px] font-semibold"
          style={{ borderColor: THEME.border, background: tab === 'score' ? THEME.light : 'var(--bg-primary)' }}
        >
          Log score
        </button>
      </div>
      <div className="mt-5">{tab === 'form' ? <RecordFormPanel /> : <LogScorePanel />}</div>
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
  const [split, setSplit] = useState('1:41.8')
  const [distance, setDistance] = useState('2000')
  const [notes, setNotes] = useState('')
  const save = () => toast('Saved (demo)', 'success')
  return (
    <Card>
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
        Log score
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-[12px]" style={{ color: THEME.textSecondary }}>
          Split
          <input value={split} onChange={(e) => setSplit(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-[13px] outline-none" style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary, fontFamily: THEME.fontMono }} />
        </label>
        <label className="text-[12px]" style={{ color: THEME.textSecondary }}>
          Distance (m)
          <input value={distance} onChange={(e) => setDistance(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-[13px] outline-none" style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary, fontFamily: THEME.fontMono }} />
        </label>
        <label className="text-[12px]" style={{ color: THEME.textSecondary }}>
          Photo
          <div className="mt-1 rounded-xl border border-dashed p-3 text-[12px]" style={{ borderColor: THEME.border, color: THEME.textMuted }}>
            OCR preview (demo)
          </div>
        </label>
      </div>
      <label className="mt-3 block text-[12px]" style={{ color: THEME.textSecondary }}>
        Notes
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-[13px] outline-none" rows={3} style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary }} />
      </label>
      <div className="mt-4 flex justify-end">
        <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={save}>
          Save
        </button>
      </div>
    </Card>
  )
}

export function MyWorkbookPage() {
  const vis = useVisibilitySettings()
  const [activeSheet, setActiveSheet] = useState<keyof typeof WORKBOOK_SHEETS>(WORKBOOK_TABS[0])
  const rows = WORKBOOK_SHEETS[activeSheet]
  const cols = activeSheet === 'Erg Log' ? WORKBOOK_COLUMNS : activeSheet === "8.25 30'" ? ['Side', 'Athlete', 'Meters', 'Split', 'Watts', 'SPM'] : ['Side', 'Athlete', 'P1', 'P2', 'P3', 'SPM']

  if (!vis.showErgRankings) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-10">
        <SectionTitle kicker="Erg workbook" title="Team sheet" />
        <div className="mt-5 rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: THEME.border }}>
          <div className="text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>Team workbook not enabled</div>
          <div className="mt-2 text-[13px]" style={{ color: THEME.textSecondary }}>Your coach hasn't enabled team erg rankings. Ask them to turn it on in Settings.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-10">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle kicker="Erg workbook" title="Team sheet" />
        <div className="flex items-center gap-2">
          <Pill tone="good">Synced 5 min ago</Pill>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: 'Arial, sans-serif', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                {cols.map((c) => (
                  <th key={c} className="px-3 py-2 font-semibold" style={{ color: '#202124', fontSize: 12 }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isStarRow = row[1] === 'Star Miller'
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid #e8eaed',
                      background: isStarRow ? '#e6f4ea' : i % 2 === 0 ? '#fff' : '#fafbfc',
                    }}
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="px-3 py-1.5"
                        style={{
                          color: '#202124',
                          fontFamily: j >= 2 ? 'JetBrains Mono, monospace' : 'Arial, sans-serif',
                          fontWeight: isStarRow && j === 1 ? 600 : 400,
                          fontSize: 13,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-1 border-t px-2 py-1.5" style={{ borderColor: '#e8eaed', background: '#f8f9fa' }}>
          {WORKBOOK_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSheet(tab)}
              className="rounded-t px-3 py-1.5 text-[12px] font-medium transition-colors"
              style={{
                background: activeSheet === tab ? '#fff' : 'transparent',
                color: activeSheet === tab ? '#1a73e8' : '#5f6368',
                borderBottom: activeSheet === tab ? '2px solid #1a73e8' : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 text-[12px]" style={{ color: THEME.textMuted }}>
        Read-only view. Your rows are highlighted in green.
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

export function MySessionsPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'race' | 'steady' | 'drill'>('all')

  const timerHistory = useSessionTimerStore((s) => s.history)

  /** Convert timer history entries to the same shape as SESSION_ENTRIES */
  const timerSessions = timerHistory.map((entry) => ({
    id: entry.id,
    date: fmtDateShort(entry.createdAt),
    title: `${entry.boatName} · timer session`,
    detail: `${entry.splits.length} split${entry.splits.length !== 1 ? 's' : ''}`,
    splits: entry.splits.map((sp) => fmtMs(sp.intervalMs)),
    notes: `Recorded via Session Timer · ${entry.boatName}`,
    isTimer: true,
  }))

  const allSessions = [
    ...timerSessions,
    ...SESSION_ENTRIES.map((s) => ({ ...s, isTimer: false })),
  ]

  const filtered = allSessions.filter((s) => {
    if (filter === 'all') return true
    if (s.isTimer) return false // timer sessions only show in 'all' filter
    if (filter === 'race') return s.title.toLowerCase().includes('race') || s.title.toLowerCase().includes('power') || s.title.toLowerCase().includes('2k')
    if (filter === 'steady') return s.title.toLowerCase().includes('steady') || s.title.toLowerCase().includes('ut2')
    return s.title.toLowerCase().includes('drill') || s.title.toLowerCase().includes('technical') || s.title.toLowerCase().includes('rate')
  })

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-10">
      <SectionTitle kicker="Sessions" title="Your recent sessions" />

      <div className="mt-4 grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: String(allSessions.length) },
          { label: 'On-water', value: '5' },
          { label: 'Erg', value: '2' },
          { label: 'Drills', value: '1' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
            <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>{s.label}</div>
            <div className="mt-1 text-[18px] font-bold" style={{ color: THEME.textPrimary }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        {(['all', 'race', 'steady', 'drill'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className="rounded-xl border px-3 py-2 text-[12px] font-semibold"
            style={{ borderColor: THEME.border, background: filter === f ? THEME.light : 'var(--bg-primary)' }}
          >
            {f === 'all' ? 'All' : f === 'race' ? 'Race pieces' : f === 'steady' ? 'Steady state' : 'Drills'}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {filtered.map((s) => {
          const isOpen = expanded === s.id
          return (
            <Card key={s.id} className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : s.id)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{s.date}</div>
                    {s.isTimer && (
                      <span
                        className="rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                        style={{ borderColor: 'rgba(16,185,129,0.35)', color: THEME.accent, background: 'rgba(16,185,129,0.08)', fontFamily: THEME.fontMono }}
                      >
                        Timer
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>{s.title}</div>
                  <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>{s.detail}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.splits.slice(0, 3).map((sp, i) => (
                    <span key={i} className="rounded-full border px-2 py-0.5 text-[11px]" style={{ borderColor: THEME.border, fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
                      {sp}
                    </span>
                  ))}
                  {s.splits.length > 3 && (
                    <span className="rounded-full border px-2 py-0.5 text-[11px]" style={{ borderColor: THEME.border, color: THEME.textMuted }}>
                      +{s.splits.length - 3}
                    </span>
                  )}
                </div>
              </div>
              {isOpen && (
                <div className="mt-4 border-t pt-4" style={{ borderColor: THEME.border }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                    Splits
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {s.splits.map((sp, i) => (
                      <div key={i} className="rounded-xl border px-3 py-2" style={{ borderColor: THEME.border, background: THEME.light }}>
                        <div className="text-[10px]" style={{ color: THEME.textMuted }}>P{i + 1}</div>
                        <div className="text-[14px] font-bold" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>{sp}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-[13px]" style={{ color: THEME.textSecondary }}>{s.notes}</div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

const STAR_MILLER_ID = 'a-miller'
const STAR_MILLER_NAME = 'Star Miller'

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

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-10">
      <SectionTitle kicker="Lineups" title="Your boats" />

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
          <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>Current seat</div>
          <div className="mt-1 text-[18px] font-bold" style={{ color: THEME.textPrimary }}>Seat 3</div>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
          <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>Boat</div>
          <div className="mt-1 text-[18px] font-bold" style={{ color: THEME.textPrimary }}>V8</div>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: THEME.border, background: THEME.light }}>
          <div className="text-[11px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>Total lineups</div>
          <div className="mt-1 text-[18px] font-bold" style={{ color: THEME.textPrimary }}>{totalLineups}</div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Published lineups from coach (store), newest first — only when Star Miller is seated */}
        {storeCards.map((pl) => {
          const isOpen = expanded === pl.id
          const starSeat = pl.boats
            .flatMap((b) => b.seats.filter((s) => s.athleteId === STAR_MILLER_ID).map((s) => ({ ...s, boatName: b.name })))
            [0]
          const seatSummary = starSeat
            ? `Seat ${starSeat.seatNumber} · ${starSeat.side} · ${starSeat.boatName}`
            : 'Seat assigned'
          const dateLabel = new Date(pl.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

          return (
            <Card key={pl.id} className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : pl.id)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{dateLabel}</div>
                  <div className="mt-1 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>{pl.sessionTitle}</div>
                  <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>{seatSummary}</div>
                  {pl.note && <div className="mt-0.5 text-[11px]" style={{ color: THEME.textMuted }}>{pl.note}</div>}
                </div>
                <Pill tone="good">Published</Pill>
              </div>
              {isOpen && pl.boats.length > 0 && (
                <div className="mt-4 border-t pt-4" style={{ borderColor: THEME.border }}>
                  {pl.boats.map((boat) => (
                    <div key={boat.id} className="mb-4 last:mb-0">
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                        {boat.name}
                      </div>
                      <div className="overflow-hidden rounded-xl border" style={{ borderColor: THEME.border }}>
                        <table className="w-full text-left text-[12px]">
                          <thead style={{ background: THEME.light }}>
                            <tr>
                              <th className="px-3 py-2 w-16">Seat</th>
                              <th className="px-3 py-2 w-16">Side</th>
                              <th className="px-3 py-2">Athlete</th>
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
                                  style={{ borderColor: THEME.border, background: isStarMiller ? '#e6f4ea' : 'transparent' }}
                                >
                                  <td className="px-3 py-1.5" style={{ fontFamily: THEME.fontMono, fontWeight: 600 }}>{seatLabel}</td>
                                  <td className="px-3 py-1.5" style={{ color: THEME.textSecondary }}>{s.side}</td>
                                  <td className="px-3 py-1.5" style={{ fontWeight: isStarMiller ? 600 : 400, color: THEME.textPrimary }}>
                                    {isStarMiller ? `★ ${STAR_MILLER_NAME}` : (s.athleteId ?? '—')}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}

        {/* Seed lineup entries (always shown) */}
        {LINEUP_ENTRIES.map((l) => {
          const isOpen = expanded === l.id
          return (
            <Card key={l.id} className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : l.id)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>{l.date}</div>
                  <div className="mt-1 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>{l.title}</div>
                  <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>{l.athleteSummary}</div>
                </div>
                <Pill tone="good">Published</Pill>
              </div>
              {isOpen && (
                <div className="mt-4 border-t pt-4" style={{ borderColor: THEME.border }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                    Boat
                  </div>
                  <div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: THEME.border }}>
                    <table className="w-full text-left text-[12px]">
                      <thead style={{ background: THEME.light }}>
                        <tr>
                          <th className="px-3 py-2 w-16">Seat</th>
                          <th className="px-3 py-2 w-16">Side</th>
                          <th className="px-3 py-2">Athlete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {l.seats.map((s) => (
                          <tr
                            key={s.seat}
                            className="border-t"
                            style={{
                              borderColor: THEME.border,
                              background: s.highlight ? '#e6f4ea' : 'transparent',
                            }}
                          >
                            <td className="px-3 py-1.5" style={{ fontFamily: THEME.fontMono, fontWeight: 600 }}>{s.seat}</td>
                            <td className="px-3 py-1.5" style={{ color: THEME.textSecondary }}>{s.side}</td>
                            <td className="px-3 py-1.5" style={{ fontWeight: s.highlight ? 600 : 400, color: THEME.textPrimary }}>{s.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
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
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-10">
      <SectionTitle kicker="Chat" title="Messages" />

      {/* Tab switcher */}
      <div className="mt-4 flex gap-2">
        {(['ai', 'messages'] as const).map((tab) => {
          const active = chatTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setChatTab(tab)}
              className="rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors"
              style={{
                fontFamily: THEME.fontMono,
                borderColor: active ? THEME.primary : THEME.border,
                background: active ? `${THEME.primary}14` : 'var(--bg-primary)',
                color: active ? THEME.primary : THEME.textSecondary,
              }}
            >
              {tab === 'ai' ? 'synth. AI' : 'Team Messages'}
            </button>
          )
        })}
      </div>

      {/* AI Tab */}
      {chatTab === 'ai' && (
        <Card className="mt-4">
          {messages.length === 0 ? (
            <div className="py-3">
              <div className="text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>
                What do you want to know right now?
              </div>
              <div className="mt-2 text-[13px]" style={{ color: THEME.textSecondary }}>
                Tap a prompt to start.
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {['Race plan for tomorrow', 'What should I focus on today?', 'How is my recovery?', 'How do I improve my 2K?'].map((p) => (
                  <button key={p} type="button" className="rounded-xl border px-3 py-3 text-left text-[13px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={() => send(p)}>
                    {p}
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
        <Card className="mt-4">
          {/* Search */}
          <input
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            placeholder="Search messages…"
            className="w-full rounded-xl border px-3 py-2 text-[13px] outline-none"
            style={{ borderColor: THEME.border, background: THEME.light, color: THEME.textPrimary }}
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
  )
}

export function MySettingsPage() {
  const { theme, setTheme } = useThemeStore()
  const [notifs, setNotifs] = useState({ coachNotes: true, lineupChanges: true, sessionResults: true, prAlerts: true })

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-10">
      <SectionTitle kicker="Settings" title="Your account" />
      <div className="mt-5 grid gap-5">
        {/* Profile */}
        <Card>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Profile
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-[12px]" style={{ color: THEME.textSecondary }}>Name</div>
              <div className="mt-1 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>{DEMO_ATHLETE_PROFILE.name}</div>
            </div>
            <div>
              <div className="text-[12px]" style={{ color: THEME.textSecondary }}>Team</div>
              <div className="mt-1 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>{DEMO_ATHLETE_PROFILE.team}</div>
            </div>
            <div>
              <div className="text-[12px]" style={{ color: THEME.textSecondary }}>Side</div>
              <div className="mt-1 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>{DEMO_ATHLETE_PROFILE.side}</div>
            </div>
            <div>
              <div className="text-[12px]" style={{ color: THEME.textSecondary }}>Year</div>
              <div className="mt-1 text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>{DEMO_ATHLETE_PROFILE.year}</div>
            </div>
          </div>
        </Card>

        {/* Theme */}
        <Card>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Theme
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTheme(t as AppTheme)} className="rounded-xl border px-3 py-2 text-[12px] font-semibold" style={{ borderColor: THEME.border, background: theme === t ? THEME.light : 'var(--bg-primary)' }}>
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </Card>

        {/* Connected apps */}
        <Card>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Connected apps
          </div>
          <div className="mt-3 space-y-2">
            {CONNECTED_APPS.map((a) => (
              <div key={a.name} className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: THEME.border }}>
                <div>
                  <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>{a.name}</div>
                  <div className="text-[11px]" style={{ color: THEME.textMuted }}>{a.detail}</div>
                </div>
                <Pill tone={a.status === 'connected' ? 'good' : 'neutral'}>{a.status}</Pill>
              </div>
            ))}
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Notifications
          </div>
          <div className="mt-3 space-y-3">
            {Object.entries(notifs).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="text-[13px]" style={{ color: THEME.textPrimary }}>
                  {key === 'coachNotes' ? 'Coach notes' : key === 'lineupChanges' ? 'Lineup changes' : key === 'sessionResults' ? 'Session results' : 'PR alerts'}
                </div>
                <button
                  type="button"
                  onClick={() => setNotifs((n) => ({ ...n, [key]: !val }))}
                  className="h-6 w-10 rounded-full transition-colors"
                  style={{ background: val ? THEME.accent : THEME.border }}
                >
                  <div className="h-5 w-5 rounded-full bg-white transition-transform" style={{ transform: val ? 'translateX(18px)' : 'translateX(2px)' }} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy */}
        <Card>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Privacy
          </div>
          <div className="mt-3 text-[13px]" style={{ color: THEME.textSecondary }}>
            Your wellness data is only visible to you and your coach. Erg scores are shared with the team by default. You can adjust visibility with your coach in team settings.
          </div>
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
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-10">
        <SectionTitle kicker="Sources" title="Connectors" />
        <div className="mt-5 rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: THEME.border }}>
          <div className="text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>Personal sources not enabled</div>
          <div className="mt-2 text-[13px]" style={{ color: THEME.textSecondary }}>Your coach hasn't enabled personal source connections for this team.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:px-10">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle kicker="Sources" title="Connectors" />
        <button type="button" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }} onClick={() => nav('/athlete/sources/data-view')}>
          View data →
        </button>
      </div>

      <div className="mt-5 grid gap-5">
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

          <div className="relative overflow-hidden rounded-xl border" style={{ borderColor: THEME.border, background: THEME.light, height: 560 }}>
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
                  className="absolute cursor-grab select-none rounded-2xl border bg-white p-3 active:cursor-grabbing"
                  style={{ left: n.x, top: n.y, width: ATHLETE_WORKFLOW_CANVAS.nodeW, height: ATHLETE_WORKFLOW_CANVAS.nodeH, borderColor: border }}
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
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-6 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Sources
          </div>
          <div className="mt-1 text-[20px] font-bold" style={{ color: THEME.textPrimary }}>
            Data View
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/athlete/sources/connectors" className="rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-zinc-50" style={{ borderColor: THEME.border, color: THEME.textPrimary }}>
            Connectors
          </NavLink>
          <NavLink to="/athlete/sources/data-view" className="rounded-xl border px-3 py-2 text-[12px] font-semibold" style={{ borderColor: THEME.border, background: THEME.light, color: THEME.textPrimary }}>
            Data View
          </NavLink>
        </div>
      </div>

      <div className="mt-4">
        <AthleteInfoBanner activeTab={activeTab} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
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
                <div className="mt-4 h-56 rounded-xl border p-3" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ATHLETE_BIOMETRICS}>
                      <CartesianGrid stroke={THEME.border} strokeDasharray="4 6" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: THEME.textMuted }} />
                      <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="sleep" stroke="#FF2D55" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="hrv" stroke="#10B981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="rhr" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
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
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  Erg Workbook
                </div>
                <div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: '#e8eaed' }}>
                  <table className="w-full text-left" style={{ fontFamily: 'Arial, sans-serif', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                        {WORKBOOK_COLUMNS.map((c) => (
                          <th key={c} className="px-3 py-2 font-semibold" style={{ color: '#202124', fontSize: 12 }}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {WORKBOOK_SHEETS['Erg Log'].map((row, i) => {
                        const isStarRow = row[1] === 'Star Miller'
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #e8eaed', background: isStarRow ? '#e6f4ea' : i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-1.5" style={{ color: '#202124', fontFamily: j >= 2 ? 'JetBrains Mono, monospace' : 'Arial, sans-serif', fontWeight: isStarRow && j === 1 ? 600 : 400, fontSize: 13 }}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </AthleteSourceShell>
          )}
        </div>

        <div className="lg:col-span-3">
          <AthleteDataViewAiPanel tab={activeTab} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/80 backdrop-blur" style={{ borderColor: THEME.border }}>
        <div className="mx-auto flex max-w-6xl gap-1 px-3 py-2 sm:px-10">
          {visibleTabs.map((t) => {
            const active = t.id === activeTab
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} className="flex-1 rounded-xl border px-2 py-2 text-[12px] font-semibold" style={{ borderColor: THEME.border, background: active ? THEME.light : 'transparent' }}>
                <div className="flex items-center justify-center gap-2">
                  <SourceDot color={t.color} />
                  <span>{t.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

