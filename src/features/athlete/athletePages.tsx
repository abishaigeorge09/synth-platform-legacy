import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { THEME } from '../../lib/theme'
import {
  DEMO_ATHLETE,
  DEMO_ATHLETE_ERG,
  DEMO_ATHLETE_YOY,
  DEMO_ATHLETE_TEAMMATES,
  DEMO_ATHLETE_SESSIONS,
  DEMO_ATHLETE_LINEUPS,
  DEMO_ATHLETE_PERSONAL_SOURCES,
  DEMO_TEAM,
  DEMO_COACH,
} from '../../shared/data/seeds/demoAthlete'
import { ChatView } from '../coach/ai/ChatView'

function fmt2k(seconds?: number) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

/** Shared page chrome for every athlete-side page. */
function AthletePageShell({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-full w-full flex-col pb-12"
    >
      <header className="px-10 pb-5 pt-8">
        <div
          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {kicker}
        </div>
        <h1
          className="text-[32px] font-semibold leading-[1.1]"
          style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
        >
          {title}
        </h1>
        <div className="mt-1 text-[12px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
          {subtitle}
        </div>
      </header>
      {children}
    </motion.div>
  )
}

// ─── My Team ──────────────────────────────────────────────────────────────

export function MyDashboardPage() {
  return (
    <AthletePageShell
      kicker="Athlete · My Team"
      title={`Welcome back, ${DEMO_ATHLETE.name.split(' ')[0]}`}
      subtitle={`${DEMO_TEAM.name} · ${DEMO_ATHLETE_TEAMMATES.length + 1} on roster · coach ${DEMO_COACH.name.split(' ')[0]}`}
    >
      <div className="grid gap-4 px-10 xl:grid-cols-[1fr_1fr]">
        <div
          className="rounded-2xl border p-6"
          style={{
            background: `linear-gradient(165deg, ${THEME.primaryDarker} 0%, ${THEME.primary} 55%, ${THEME.primaryLight} 180%)`,
            color: THEME.white,
          }}
        >
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: THEME.fontMono, color: 'rgba(255,255,255,0.7)' }}
          >
            My team
          </div>
          <div
            className="mt-1 text-[24px] font-semibold"
            style={{ fontFamily: THEME.fontSerif }}
          >
            {DEMO_TEAM.name}
          </div>
          <div className="mt-0.5 text-[12px] opacity-80" style={{ fontFamily: THEME.fontMono }}>
            {DEMO_TEAM.sport} · invite {DEMO_TEAM.inviteCode}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-[14px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.14)', fontFamily: THEME.fontMono }}
            >
              {initials(DEMO_COACH.name)}
            </div>
            <div>
              <div
                className="text-[8px] uppercase tracking-[0.18em] opacity-70"
                style={{ fontFamily: THEME.fontMono }}
              >
                Head coach
              </div>
              <div className="text-[15px] font-semibold">{DEMO_COACH.name}</div>
              <div className="text-[11px] opacity-80" style={{ fontFamily: THEME.fontMono }}>
                {DEMO_COACH.email}
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border p-5"
          style={{ background: THEME.white, borderColor: THEME.border }}
        >
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Teammates
          </div>
          <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
            Roster · {DEMO_ATHLETE_TEAMMATES.length}
          </div>
          <div className="synth-scroll mt-4 flex max-h-[280px] flex-wrap gap-2 overflow-y-auto pr-1">
            {DEMO_ATHLETE_TEAMMATES.slice(0, 18).map((a) => (
              <span
                key={a.id}
                className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                style={{
                  borderColor: THEME.border,
                  background: THEME.light,
                  color: THEME.textPrimary,
                }}
              >
                {a.name}
              </span>
            ))}
            {DEMO_ATHLETE_TEAMMATES.length > 18 && (
              <span
                className="rounded-full px-3 py-1 text-[11px]"
                style={{
                  background: THEME.primary,
                  color: THEME.white,
                  fontFamily: THEME.fontMono,
                }}
              >
                +{DEMO_ATHLETE_TEAMMATES.length - 18} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 px-10 xl:grid-cols-3">
        <QuickTile
          kicker="Latest 2K"
          value={fmt2k(DEMO_ATHLETE_ERG?.timeSeconds)}
          detail={DEMO_ATHLETE_ERG?.date ?? '—'}
          color={THEME.primary}
        />
        <QuickTile
          kicker="Avg split /500"
          value={fmt2k(DEMO_ATHLETE_ERG?.splitSeconds)}
          detail={DEMO_ATHLETE_ERG?.watts ? `${DEMO_ATHLETE_ERG.watts}W · ${DEMO_ATHLETE_ERG.spm} spm` : '—'}
          color={THEME.cyan}
        />
        <QuickTile
          kicker="YoY progress"
          value={DEMO_ATHLETE_YOY ? `${DEMO_ATHLETE_YOY.deltaSec.toFixed(1)}s` : '—'}
          detail={DEMO_ATHLETE_YOY ? 'vs. 2025 test' : 'no prior data'}
          color={DEMO_ATHLETE_YOY && DEMO_ATHLETE_YOY.deltaSec < 0 ? THEME.primary : THEME.amber}
        />
      </div>

      <div className="mt-6 px-10">
        <Link
          to="/athlete/stats"
          className="inline-block rounded-full border px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
          style={{
            borderColor: THEME.primary,
            color: THEME.primary,
            fontFamily: THEME.fontMono,
            background: THEME.white,
          }}
        >
          See my full stats →
        </Link>
      </div>
    </AthletePageShell>
  )
}

function QuickTile({
  kicker,
  value,
  detail,
  color,
}: {
  kicker: string
  value: string
  detail: string
  color: string
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: THEME.white,
        borderColor: THEME.border,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {kicker}
      </div>
      <div
        className="mt-2 text-[28px] font-bold leading-none"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px]" style={{ color: THEME.textSecondary }}>
        {detail}
      </div>
    </div>
  )
}

// ─── My Stats ─────────────────────────────────────────────────────────────

export function MyStatsPage() {
  return (
    <AthletePageShell
      kicker="Athlete · My Stats"
      title="Personal performance"
      subtitle={`Scoped to ${DEMO_ATHLETE.name}'s data only · ${DEMO_ATHLETE_YOY ? '1 YoY test pair' : 'no prior tests'}`}
    >
      <div className="grid gap-4 px-10 xl:grid-cols-[1.4fr_1fr]">
        {DEMO_ATHLETE_YOY ? (
          <div className="rounded-2xl border p-5" style={{ background: THEME.white, borderColor: THEME.border }}>
            <div
              className="text-[9px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              2K progression
            </div>
            <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
              Mar 2025 → Mar 2026
            </div>
            <div className="mt-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { label: 'Mar 2025', sec: DEMO_ATHLETE_YOY.sec2025 },
                    { label: 'Mar 2026', sec: DEMO_ATHLETE_YOY.sec2026 },
                  ]}
                  margin={{ top: 12, right: 24, bottom: 4, left: 16 }}
                >
                  <CartesianGrid stroke={THEME.border} vertical={false} strokeDasharray="2 4" />
                  <XAxis
                    dataKey="label"
                    stroke={THEME.textMuted}
                    tick={{ fontSize: 11, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={THEME.textMuted}
                    tick={{ fontSize: 11, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => fmt2k(v as number)}
                    domain={['dataMin - 4', 'dataMax + 4']}
                  />
                  <Tooltip
                    contentStyle={{
                      background: THEME.white,
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 8,
                      fontFamily: THEME.fontMono,
                      fontSize: 11,
                    }}
                    formatter={(v) => [fmt2k(v as number), '2K']}
                  />
                  <Line
                    type="monotone"
                    dataKey="sec"
                    stroke={THEME.primary}
                    strokeWidth={3}
                    dot={{ fill: THEME.primary, stroke: THEME.white, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div
            className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed p-5 text-center text-[12px]"
            style={{ borderColor: THEME.border, color: THEME.textMuted, background: THEME.white }}
          >
            No prior test data yet. Your first 2K will appear here.
          </div>
        )}

        <div className="flex flex-col gap-3">
          <StatCard
            label="Current 2K"
            value={fmt2k(DEMO_ATHLETE_ERG?.timeSeconds)}
            detail={DEMO_ATHLETE_ERG?.date ?? '—'}
          />
          <StatCard
            label="Avg split /500"
            value={fmt2k(DEMO_ATHLETE_ERG?.splitSeconds)}
            detail={DEMO_ATHLETE_ERG?.watts ? `${DEMO_ATHLETE_ERG.watts}W` : '—'}
          />
          <StatCard
            label="Stroke rate"
            value={DEMO_ATHLETE_ERG?.spm ? `${DEMO_ATHLETE_ERG.spm}` : '—'}
            detail="strokes per minute"
          />
        </div>
      </div>
    </AthletePageShell>
  )
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: THEME.white, borderColor: THEME.border }}
    >
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </div>
      <div
        className="mt-2 text-[28px] font-bold leading-none"
        style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px]" style={{ color: THEME.textSecondary }}>
        {detail}
      </div>
    </div>
  )
}

// ─── My Sessions ──────────────────────────────────────────────────────────

export function MySessionsPage() {
  return (
    <AthletePageShell
      kicker="Athlete · Sessions"
      title="My session history"
      subtitle={`${DEMO_ATHLETE_SESSIONS.length} recent sessions · splits and videos your coach shared`}
    >
      <div className="px-10">
        <ul className="flex flex-col gap-3">
          {DEMO_ATHLETE_SESSIONS.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border p-5"
              style={{ background: THEME.white, borderColor: THEME.border }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="text-[9px] font-semibold uppercase tracking-[0.18em]"
                    style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
                  >
                    {s.date}
                  </div>
                  <div className="mt-0.5 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
                    {s.title}
                  </div>
                  <div className="text-[11px]" style={{ color: THEME.textSecondary }}>
                    {s.boat} · seat {s.seat} · {s.note}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.splits.map((time, i) => (
                  <span
                    key={i}
                    className="rounded-md border px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      borderColor: THEME.border,
                      background: THEME.light,
                      fontFamily: THEME.fontMono,
                      color: THEME.textPrimary,
                    }}
                  >
                    <span style={{ color: THEME.textMuted }}>#{i + 1}</span> {time}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AthletePageShell>
  )
}

// ─── My Lineups ───────────────────────────────────────────────────────────

export function MyLineupsPage() {
  return (
    <AthletePageShell
      kicker="Athlete · Lineups"
      title="My boat history"
      subtitle={`${DEMO_ATHLETE_LINEUPS.length} published lineups · boats and seats across the season`}
    >
      <div className="px-10">
        <ul className="flex flex-col gap-2">
          {DEMO_ATHLETE_LINEUPS.map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
              style={{
                background: THEME.white,
                borderColor: THEME.border,
                borderLeft: `3px solid ${l.side === 'port' ? THEME.cyan : THEME.purple}`,
              }}
            >
              <div>
                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
                >
                  {l.date}
                </div>
                <div className="mt-0.5 text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                  {l.session}
                </div>
                <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
                  {l.boat} · seat {l.seat} · {l.side}
                </div>
              </div>
              <span
                className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: `${l.side === 'port' ? THEME.cyan : THEME.purple}18`,
                  color: l.side === 'port' ? THEME.cyan : THEME.purple,
                  fontFamily: THEME.fontMono,
                }}
              >
                {l.side}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AthletePageShell>
  )
}

// ─── My Sources ───────────────────────────────────────────────────────────

export function MySourcesPage() {
  return (
    <AthletePageShell
      kicker="Athlete · My Sources"
      title="Connect your own apps"
      subtitle="Personal data sources — separate from the team feed, only visible to you"
    >
      <div className="grid gap-3 px-10 md:grid-cols-2">
        {DEMO_ATHLETE_PERSONAL_SOURCES.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-2xl border p-5"
            style={{ background: THEME.white, borderColor: THEME.border }}
          >
            <div>
              <div
                className="text-[9px] font-semibold uppercase tracking-[0.18em]"
                style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
              >
                {s.type}
              </div>
              <div className="mt-1 text-[15px] font-semibold" style={{ color: THEME.textPrimary }}>
                {s.name}
              </div>
              <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
                last sync · {s.lastSync}
              </div>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: s.status === 'connected' ? 'rgba(16,185,129,0.15)' : 'rgba(161,161,170,0.12)',
                color: s.status === 'connected' ? THEME.primary : THEME.textMuted,
                fontFamily: THEME.fontMono,
              }}
            >
              {s.status}
            </span>
          </div>
        ))}

        <div
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-8 text-center"
          style={{ borderColor: THEME.border, background: THEME.white }}
        >
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
          >
            + Connect source
          </div>
          <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
            Screenshots, CSVs, personal Sheets, wearables
          </div>
        </div>
      </div>
    </AthletePageShell>
  )
}

// ─── My Chat ──────────────────────────────────────────────────────────────

export function MyChatPage() {
  return (
    <ChatView
      scope="self"
      kicker="synth. AI · personal"
      title="Chat with your own data"
      subtitle="Scoped to your stats only. No team-wide visibility, no teammate data."
      suggestions={[
        'How did my splits trend this month?',
        "What's my average gym load?",
        'What should I focus on before the 2K test?',
        'How do I compare to the team average?',
      ]}
    />
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────

export function AthleteSettingsPage() {
  const toggles = [
    { label: 'Share my splits with the team', on: true },
    { label: 'Show my wellness scores to the coach', on: true },
    { label: 'Let the team see my boat/seat history', on: false },
    { label: 'Get push notifications on lineup publish', on: true },
  ]
  return (
    <AthletePageShell
      kicker="Athlete · Settings"
      title="Visibility & notifications"
      subtitle="Control what the team and coach can see about you"
    >
      <div className="px-10">
        <div
          className="max-w-[640px] rounded-2xl border"
          style={{ background: THEME.white, borderColor: THEME.border }}
        >
          {toggles.map((t, i) => (
            <div
              key={t.label}
              className="flex items-center justify-between px-5 py-4"
              style={{
                borderTop: i === 0 ? 'none' : `1px solid ${THEME.border}`,
              }}
            >
              <span className="text-[13px]" style={{ color: THEME.textPrimary }}>
                {t.label}
              </span>
              <span
                className="flex h-6 w-10 items-center rounded-full px-1 transition-colors"
                style={{ background: t.on ? THEME.primary : THEME.border }}
              >
                <motion.span
                  layout
                  className="block h-4 w-4 rounded-full bg-white"
                  style={{ marginLeft: t.on ? 16 : 0 }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </AthletePageShell>
  )
}
