import { Link, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { THEME } from '../../../lib/theme'
import {
  useAthletes,
  useErgScores,
  useAthleteProfileSessions,
  useAthleteProfileLineups,
  useAthleteWellness,
  useAthleteCoachNotes,
} from '../../../shared/data/queries'
import { SynthAiIllustration } from '../../../shared/illustrations/sidebarIllustrations'
import { SkeletonLine, SkeletonBlock, SkeletonStatTile, SkeletonChart } from '../../../shared/components/Skeleton'
import { QueryError } from '../../../shared/components/QueryError'
import { useRightPanelStore } from '../../../shared/store/useRightPanelStore'
import { Avatar } from '../../../shared/components/Avatar'
import { useAvatarStore } from '../../../shared/store/useAvatarStore'
import { AthleteOverview } from './components/athlete/AthleteOverview'

export function AthleteProfilePage() {
  const { athleteId } = useParams()
  const { data: athletes, isLoading: l1, isError: e1, error: err1 } = useAthletes()
  const { data: ergScores, isLoading: l2, isError: e2, error: err2 } = useErgScores()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const athlete = useMemo(() => athletes.find((a) => a.id === athleteId), [athletes, athleteId])
  const erg = useMemo(() => (athlete ? ergScores.find((e) => e.athleteId === athlete.id) : null), [athlete, ergScores])

  if (e1 || e2) return <QueryError label="Athlete profile" error={err1 ?? err2} />

  if (l1 || l2) {
    return (
      <div className="flex min-h-full w-full flex-col gap-6 pb-12 pt-8 px-5 sm:px-10">
        <div className="flex items-center gap-5">
          <SkeletonBlock className="h-20 w-20 !rounded-2xl" />
          <div className="flex flex-col gap-2">
            <SkeletonLine width={100} height={8} />
            <SkeletonLine width={200} height={32} />
            <SkeletonLine width={160} height={12} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatTile key={i} />
          ))}
        </div>
        <SkeletonChart height={200} />
      </div>
    )
  }

  const rankByErg = [...ergScores]
    .sort((a, b) => a.timeSeconds - b.timeSeconds)
    .findIndex((e) => e.athleteId === athleteId)
  const rank = rankByErg >= 0 ? rankByErg + 1 : null

  if (!athlete) {
    return (
      <div className="flex min-h-full w-full items-center justify-center p-10">
        <div className="rounded-2xl border p-6" style={{ borderColor: THEME.border, background: THEME.white }}>
          <div
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Not found
          </div>
          <div className="mt-1 text-[18px] font-semibold" style={{ color: THEME.textPrimary }}>
            Athlete {athleteId} isn't in this roster.
          </div>
          <Link
            to="/coach/athletes"
            className="mt-4 inline-block text-[12px] font-semibold uppercase tracking-wider"
            style={{ color: THEME.primary, fontFamily: THEME.fontMono }}
          >
            ← Back to athletes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <div className="flex items-center justify-between px-5 sm:px-10 pt-8">
        <Link
          to="/coach/athletes"
          className="text-[11px] font-semibold uppercase tracking-wider transition-colors hover:underline"
          style={{ color: THEME.textSecondary, fontFamily: THEME.fontMono }}
        >
          ← Athletes
        </Link>
        <div className="text-[11px]" style={{ fontFamily: THEME.fontSans, color: THEME.textMuted }}>
          {rank ? `2K #${rank} · ${ergOrDefault(erg?.date)}` : '—'}
        </div>
      </div>

      <ProfileHeader
        name={athlete.name}
        subtitle={[athlete.year, athlete.side, athlete.status].filter(Boolean).join(' · ') || 'Roster'}
        athleteId={athlete.id}
      />

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <AthleteOverview athleteId={athlete.id} />
          </motion.div>
        )}

        {activeTab === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4 px-5 sm:px-10"
          >
            <SessionsCard athleteId={athlete.id} />
            <div className="grid gap-4 xl:grid-cols-2">
              <SessionComparisonCard athleteId={athlete.id} />
              <StrokeRateCard athleteId={athlete.id} />
            </div>
          </motion.div>
        )}

        {activeTab === 'lineups' && (
          <motion.div
            key="lineups"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="px-5 sm:px-10"
          >
            <LineupHistoryCard athleteId={athlete.id} />
          </motion.div>
        )}

        {activeTab === 'wellness' && (
          <motion.div
            key="wellness"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="px-5 sm:px-10"
          >
            <WellnessCard athleteId={athlete.id} />
          </motion.div>
        )}

        {activeTab === 'compare' && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="px-5 sm:px-10"
          >
            <CompareTab athleteId={athlete.id} athleteName={athlete.name} athletes={athletes} ergScores={ergScores} />
          </motion.div>
        )}

        {activeTab === 'notes' && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="px-5 sm:px-10"
          >
            <NotesTab athleteId={athlete.id} />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="px-5 sm:px-10"
          >
            <AthleteSettingsTab athleteId={athlete.id} athleteName={athlete.name} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Men-only report UI removed — parity requires identical athlete profiles for both squads.

function ergOrDefault(d?: string) {
  return d ?? '—'
}

function splitToSeconds(split: string): number {
  const [mm, ss] = split.split(':')
  const m = parseInt(mm ?? '', 10)
  const s = parseFloat(ss ?? '')
  if (!Number.isFinite(m) || !Number.isFinite(s)) return Number.NaN
  return m * 60 + s
}

function fmtSplit(seconds?: number) {
  if (seconds === undefined || !Number.isFinite(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

function ProfileHeader({ name, subtitle, athleteId }: { name: string; subtitle: string; athleteId: string }) {
  const setOverride = useAvatarStore((s) => s.setOverride)
  return (
    <div className="flex flex-col gap-6 px-5 sm:px-10 pb-4 pt-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <Avatar id={athleteId} name={name} size={80} fallbackColor={THEME.primary} />
          <label
            className="rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
            style={{ borderColor: THEME.border, color: THEME.textSecondary, fontFamily: THEME.fontMono, background: THEME.white }}
          >
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const reader = new FileReader()
                reader.onload = () => {
                  const url = String(reader.result ?? '')
                  if (url) setOverride(athleteId, url)
                }
                reader.readAsDataURL(f)
              }}
            />
          </label>
        </div>
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Profile
          </div>
          <h1
            className="mt-1 text-[36px] font-semibold leading-[1]"
            style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
          >
            {name}
          </h1>
          <div className="mt-1 text-[13px] capitalize" style={{ fontFamily: THEME.fontSans, color: THEME.textSecondary }}>
            {subtitle}
          </div>
        </div>
      </div>
      <AthleteAiButton name={name} athleteId={athleteId} />
    </div>
  )
}

type TabKey = 'overview' | 'sessions' | 'lineups' | 'wellness' | 'compare' | 'notes' | 'settings'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'lineups', label: 'Lineups' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'compare', label: 'Compare' },
  { key: 'notes', label: 'Notes' },
  { key: 'settings', label: 'Settings' },
]

function ProfileTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}) {
  return (
    <div
      className="mb-6 flex gap-1 border-b px-5 sm:px-10"
      style={{ borderColor: THEME.border }}
    >
      {TABS.map((tab) => {
        const active = tab.key === activeTab
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className="relative px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors"
            style={{
              fontFamily: THEME.fontMono,
              color: active ? THEME.primary : THEME.textMuted,
            }}
          >
            {tab.label}
            {active && (
              <motion.span
                layoutId="profile-tab-underline"
                className="absolute inset-x-0 -bottom-px h-[2px]"
                style={{ background: THEME.primary }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

function CardShell({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: THEME.white,
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
      }}
    >
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {kicker}
      </div>
      <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function SessionComparisonCard({ athleteId }: { athleteId: string }) {
  const { data: sessions } = useAthleteProfileSessions(athleteId)
  const openCompare = useRightPanelStore((s) => s.openCompare)
  const series = useMemo(() => {
    const rows = sessions
      .map((s) => {
        const secs = s.splits.map(splitToSeconds).filter((v) => Number.isFinite(v))
        const avg = secs.length ? secs.reduce((a, b) => a + b, 0) / secs.length : Number.NaN
        return {
          sessionId: s.id,
          date: s.date.slice(5),
          avgSplit: avg,
          bestSplit: secs.length ? Math.min(...secs) : Number.NaN,
        }
      })
      .reverse()
    return rows
  }, [sessions])

  return (
    <CardShell kicker="Sessions" title="Split trend">
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={series}
            margin={{ top: 10, right: 16, bottom: 4, left: 10 }}
            onClick={(state) => {
              const payload = (state as { activePayload?: Array<{ payload?: { sessionId?: string } }> }).activePayload?.[0]?.payload
              const sessionId = payload?.sessionId
              if (sessionId) openCompare({ athleteId, leftSessionId: sessionId })
            }}
          >
            <CartesianGrid stroke={THEME.border} vertical={false} strokeDasharray="2 4" />
            <XAxis
              dataKey="date"
              stroke={THEME.textMuted}
              tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={THEME.textMuted}
              tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtSplit(v as number)}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip
              contentStyle={{
                background: THEME.white,
                border: `1px solid ${THEME.border}`,
                borderRadius: 8,
                fontFamily: THEME.fontMono,
                fontSize: 11,
              }}
              formatter={(v, k) => [fmtSplit(v as number), k === 'avgSplit' ? 'Avg /500' : 'Best /500']}
            />
            <Line type="monotone" dataKey="avgSplit" stroke={THEME.primary} strokeWidth={2.6} dot={false} />
            <Line type="monotone" dataKey="bestSplit" stroke={THEME.cyan} strokeWidth={2.0} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 text-[11px]" style={{ color: THEME.textSecondary }}>
        Click-to-compare will open the right-side analysis drawer (coming next).
      </div>
    </CardShell>
  )
}

function StrokeRateCard({ athleteId }: { athleteId: string }) {
  const { data: sessions } = useAthleteProfileSessions(athleteId)
  const openCompare = useRightPanelStore((s) => s.openCompare)
  const series = useMemo(() => {
    return sessions
      .map((s) => {
        const rates = s.strokeRates ?? []
        const avg = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : Number.NaN
        return { sessionId: s.id, date: s.date.slice(5), spm: avg }
      })
      .reverse()
  }, [sessions])

  return (
    <CardShell kicker="Rate" title="SPM over time">
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={series}
            margin={{ top: 10, right: 16, bottom: 4, left: 10 }}
            onClick={(state) => {
              const payload = (state as { activePayload?: Array<{ payload?: { sessionId?: string } }> }).activePayload?.[0]?.payload
              const sessionId = payload?.sessionId
              if (sessionId) openCompare({ athleteId, leftSessionId: sessionId })
            }}
          >
            <CartesianGrid stroke={THEME.border} vertical={false} strokeDasharray="2 4" />
            <XAxis
              dataKey="date"
              stroke={THEME.textMuted}
              tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={THEME.textMuted}
              tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip
              contentStyle={{
                background: THEME.white,
                border: `1px solid ${THEME.border}`,
                borderRadius: 8,
                fontFamily: THEME.fontMono,
                fontSize: 11,
              }}
              formatter={(v) => [`${Math.round(v as number)} spm`, 'Avg SPM']}
            />
            <Line type="monotone" dataKey="spm" stroke={THEME.purple} strokeWidth={2.6} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 text-[11px]" style={{ color: THEME.textSecondary }}>
        Rate distributions per piece will be part of the session compare drawer.
      </div>
    </CardShell>
  )
}

function AthleteAiButton({ name, athleteId }: { name: string; athleteId: string }) {
  const openChat = useRightPanelStore((s) => s.openChat)
  return (
    <motion.button
      onClick={() => openChat({ athleteId })}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      className="flex items-center gap-3 rounded-full border px-4 py-2.5 transition-colors hover:bg-zinc-50"
      style={{
        background: THEME.white,
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 12px 28px -22px rgba(5,150,105,0.45)',
      }}
    >
      <SynthAiIllustration size={20} />
      <div className="text-left leading-tight">
        <div
          className="text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
        >
          Athlete AI
        </div>
        <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
          Ask about {name.split(' ')[0]}
        </div>
      </div>
    </motion.button>
  )
}

function SessionsCard({ athleteId }: { athleteId: string }) {
  const { data: sessions } = useAthleteProfileSessions(athleteId)
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: THEME.white, borderColor: THEME.border }}
    >
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Sessions · last 30 days
      </div>
      <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
        Workout + piece history
      </div>
      <div className="synth-scroll mt-4 flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border px-4 py-3"
            style={{ borderColor: THEME.border, background: THEME.light }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
                >
                  {s.date}
                </span>
                <span className="mx-2 text-[10px]" style={{ color: THEME.textMuted }}>·</span>
                <span className="text-[12px] font-semibold" style={{ color: THEME.textPrimary }}>
                  {s.title}
                </span>
              </div>
              <span
                className="text-[10px]"
                style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
              >
                {s.boat} · seat {s.seat}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {s.splits.map((split, i) => (
                <span
                  key={i}
                  className="rounded-md border px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    borderColor: THEME.border,
                    background: THEME.white,
                    fontFamily: THEME.fontMono,
                    color: THEME.textPrimary,
                  }}
                >
                  <span style={{ color: THEME.textMuted }}>#{i + 1}</span> {split}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-3 flex items-center gap-1.5 border-t pt-2.5"
        style={{ borderColor: THEME.border }}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: THEME.primary }} />
        <span
          className="text-[9px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Session Timer + TeamWorks
        </span>
      </div>
    </div>
  )
}

function LineupHistoryCard({ athleteId }: { athleteId: string }) {
  const { data: lineups } = useAthleteProfileLineups(athleteId)
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: THEME.white, borderColor: THEME.border }}
    >
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Lineup history
      </div>
      <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
        Boats &amp; seats this season
      </div>
      <div className="synth-scroll mt-4 flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
        {lineups.map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between rounded-lg border px-4 py-3"
            style={{
              borderColor: THEME.border,
              background: THEME.light,
              borderLeft: `3px solid ${l.side === 'port' ? THEME.cyan : THEME.purple}`,
            }}
          >
            <div>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
              >
                {l.date}
              </span>
              <span className="mx-2 text-[10px]" style={{ color: THEME.textMuted }}>·</span>
              <span className="text-[12px] font-semibold" style={{ color: THEME.textPrimary }}>
                {l.session}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px]"
                style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
              >
                {l.boat} · seat {l.seat}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                style={{
                  background: `${l.side === 'port' ? THEME.cyan : THEME.purple}18`,
                  color: l.side === 'port' ? THEME.cyan : THEME.purple,
                  fontFamily: THEME.fontMono,
                }}
              >
                {l.side}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-3 flex items-center gap-1.5 border-t pt-2.5"
        style={{ borderColor: THEME.border }}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: THEME.purple }} />
        <span
          className="text-[9px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Lineups tool · published assignments
        </span>
      </div>
    </div>
  )
}

function WellnessCard({ athleteId }: { athleteId: string }) {
  const { data: checkins } = useAthleteWellness(athleteId)
  const chartData = [...checkins].reverse().map((c) => ({
    date: c.date.slice(5),
    sleep: c.sleepHours,
    hr: c.restingHr,
    hrv: c.hrv,
    recovery: c.recovery,
    energy: c.energy,
  }))
  const latest = checkins[0]
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: THEME.white, borderColor: THEME.border }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Wellness · rolling 14 days
          </div>
          <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
            Sleep · HRV · recovery
          </div>
        </div>
        {latest && (
          <div className="flex gap-3">
            <WellnessPill label="Sleep" value={`${latest.sleepHours}h`} color={THEME.blue} />
            <WellnessPill label="HR" value={`${latest.restingHr}`} color={THEME.purple} />
            <WellnessPill label="Recovery" value={`${latest.recovery}%`} color={THEME.primary} />
          </div>
        )}
      </div>
      <div className="mt-4 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid stroke={THEME.border} vertical={false} strokeDasharray="2 4" />
            <XAxis
              dataKey="date"
              stroke={THEME.textMuted}
              tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={THEME.textMuted}
              tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: THEME.white,
                border: `1px solid ${THEME.border}`,
                borderRadius: 8,
                fontFamily: THEME.fontMono,
                fontSize: 11,
              }}
            />
            <Line type="monotone" dataKey="hr" stroke={THEME.purple} strokeWidth={2} dot={false} name="HR (resting)" />
            <Line type="monotone" dataKey="recovery" stroke={THEME.primary} strokeWidth={2} dot={false} name="Recovery %" />
            <Line type="monotone" dataKey="energy" stroke={THEME.amber} strokeWidth={2} dot={false} name="Energy" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div
        className="mt-3 flex items-center gap-1.5 border-t pt-2.5"
        style={{ borderColor: THEME.border }}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: THEME.cyan }} />
        <span
          className="text-[9px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Wearable hub + Email digests
        </span>
      </div>
    </div>
  )
}

function WellnessPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-lg border px-3 py-1.5 text-center"
      style={{ borderColor: THEME.border, background: THEME.light }}
    >
      <div className="text-[8px] font-semibold uppercase tracking-wider" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
        {label}
      </div>
      <div className="mt-0.5 text-[16px] font-bold" style={{ fontFamily: THEME.fontMono, color }}>
        {value}
      </div>
    </div>
  )
}

// ─── Compare Tab ────────────────────────────────────────────────────────────

function CompareTab({
  athleteId,
  athleteName,
  athletes,
  ergScores,
}: {
  athleteId: string
  athleteName: string
  athletes: ReturnType<typeof useAthletes>['data']
  ergScores: ReturnType<typeof useErgScores>['data']
}) {
  const [compareId, setCompareId] = useState<string>('')
  const myErg = ergScores.find((e) => e.athleteId === athleteId)
  const theirErg = compareId ? ergScores.find((e) => e.athleteId === compareId) : null
  const them = athletes.find((a) => a.id === compareId)
  const others = athletes.filter((a) => a.id !== athleteId)

  return (
    <div className="space-y-4">
      <CardShell kicker="Compare" title={`${athleteName.split(' ')[0]} vs teammate`}>
        <label className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
            Select athlete to compare
          </span>
          <select
            value={compareId}
            onChange={(e) => setCompareId(e.target.value)}
            className="rounded-lg border px-3 py-2 text-[13px] outline-none"
            style={{ background: THEME.light, borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
          >
            <option value="">Choose...</option>
            {others.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>

        {them && myErg && theirErg && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <CompareMetricCard label="2K Time" a={fmtSplit(myErg.timeSeconds)} b={fmtSplit(theirErg.timeSeconds)} aName={athleteName.split(' ')[0]} bName={them.name.split(' ')[0]} delta={(theirErg.timeSeconds - myErg.timeSeconds).toFixed(1) + 's'} />
              <CompareMetricCard label="Avg Split" a={fmtSplit(myErg.splitSeconds)} b={fmtSplit(theirErg.splitSeconds)} aName={athleteName.split(' ')[0]} bName={them.name.split(' ')[0]} delta={((theirErg.splitSeconds ?? 0) - (myErg.splitSeconds ?? 0)).toFixed(1) + 's'} />
              <CompareMetricCard label="Watts" a={String(myErg.watts ?? '—')} b={String(theirErg.watts ?? '—')} aName={athleteName.split(' ')[0]} bName={them.name.split(' ')[0]} delta={String((myErg.watts ?? 0) - (theirErg.watts ?? 0)) + 'W'} />
              <CompareMetricCard label="SPM" a={String(myErg.spm ?? '—')} b={String(theirErg.spm ?? '—')} aName={athleteName.split(' ')[0]} bName={them.name.split(' ')[0]} delta={String((myErg.spm ?? 0) - (theirErg.spm ?? 0))} />
            </div>

            <div className="mt-4 rounded-xl border p-4" style={{ borderColor: THEME.border, background: THEME.light }}>
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                Pair compatibility
              </div>
              <div className="mt-2 text-[13px]" style={{ color: THEME.textPrimary }}>
                {Math.abs(myErg.timeSeconds - theirErg.timeSeconds) < 5
                  ? 'Strong pairing — within 5s on 2K. Similar power output makes them well-matched for a pair or 4+.'
                  : Math.abs(myErg.timeSeconds - theirErg.timeSeconds) < 15
                  ? 'Moderate compatibility. Could work in the same boat with complementary roles.'
                  : 'Large gap on 2K — consider different boats or asymmetric seating.'}
              </div>
            </div>
          </>
        )}
      </CardShell>
    </div>
  )
}

function CompareMetricCard({
  label, a, b, aName, bName, delta,
}: {
  label: string; a: string; b: string; aName: string; bName: string; delta: string
}) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: THEME.border, background: THEME.white }}>
      <div className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
        {label}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="text-[10px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>{aName}</div>
          <div className="text-[20px] font-bold" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>{a}</div>
        </div>
        <div className="text-[10px] font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          {delta}
        </div>
        <div className="text-right">
          <div className="text-[10px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>{bName}</div>
          <div className="text-[20px] font-bold" style={{ fontFamily: THEME.fontMono, color: THEME.cyan }}>{b}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Notes Tab ──────────────────────────────────────────────────────────────

function NotesTab({ athleteId }: { athleteId: string }) {
  const { data: notes } = useAthleteCoachNotes(athleteId)
  const [searchQ, setSearchQ] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [newNote, setNewNote] = useState('')

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    notes.forEach((n) => n.tags.forEach((t) => tags.add(t)))
    return ['all', ...Array.from(tags)]
  }, [notes])

  const filtered = useMemo(() => {
    let list = notes
    if (tagFilter !== 'all') list = list.filter((n) => n.tags.includes(tagFilter))
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase()
      list = list.filter((n) => n.text.toLowerCase().includes(q))
    }
    return list
  }, [notes, tagFilter, searchQ])

  return (
    <div className="space-y-4">
      <CardShell kicker="Coach notes" title={`${filtered.length} notes`}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search notes..."
            className="rounded-lg border px-3 py-2 text-[12px] outline-none flex-1 min-w-[200px]"
            style={{ background: THEME.light, borderColor: THEME.border, color: THEME.textPrimary }}
          />
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-[11px] outline-none"
            style={{ background: THEME.light, borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
          >
            {allTags.map((t) => (
              <option key={t} value={t}>{t === 'all' ? 'All tags' : t}</option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a quick note..."
            className="flex-1 rounded-lg border px-3 py-2 text-[12px] outline-none"
            style={{ background: THEME.white, borderColor: THEME.border, color: THEME.textPrimary }}
          />
          <button
            type="button"
            onClick={() => setNewNote('')}
            disabled={!newNote.trim()}
            className="rounded-lg px-4 py-2 text-[10px] font-semibold uppercase tracking-wider disabled:opacity-40"
            style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
          >
            Add note
          </button>
        </div>

        <div className="synth-scroll flex max-h-[400px] flex-col gap-2 overflow-y-auto pr-1">
          {filtered.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border px-4 py-3"
              style={{ borderColor: THEME.border, background: THEME.light }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
                    {note.date}
                  </span>
                  {note.isTranscription && (
                    <span className="rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider" style={{ borderColor: THEME.purple, color: THEME.purple, fontFamily: THEME.fontMono }}>
                      Transcription
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
                      style={{
                        background: tag.includes('Positive') ? `${THEME.primary}14` : tag.includes('Flag') ? `${THEME.red}14` : `${THEME.blue}14`,
                        color: tag.includes('Positive') ? THEME.primary : tag.includes('Flag') ? THEME.red : THEME.blue,
                        fontFamily: THEME.fontMono,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-[12px] leading-relaxed" style={{ color: THEME.textPrimary }}>
                {note.text}
              </div>
            </div>
          ))}
        </div>
      </CardShell>
    </div>
  )
}

// ─── Settings Tab ───────────────────────────────────────────────────────────

function AthleteSettingsTab({ athleteId, athleteName }: { athleteId: string; athleteName: string }) {
  const [toggles, setToggles] = useState([
    { key: 'showTeamStats', label: 'Can see team-wide stats', on: true },
    { key: 'showOtherBoats', label: 'Can see other boats', on: false },
    { key: 'showCoachNotes', label: 'Can see coach notes', on: false },
    { key: 'shareVideos', label: 'Share video clips', on: true },
    { key: 'allowPersonalSources', label: 'Can connect own sources', on: true },
    { key: 'receiveNotifications', label: 'Receives push notifications', on: true },
  ])
  const [privateNotes, setPrivateNotes] = useState('')

  return (
    <div className="space-y-4" data-athlete-id={athleteId}>
      <CardShell kicker="Access" title={`${athleteName.split(' ')[0]} — visibility`}>
        <div className="flex flex-col divide-y" style={{ borderColor: THEME.border }}>
          {toggles.map((t, i) => (
            <div
              key={t.key}
              className="flex items-center justify-between py-3"
              style={{ borderTop: i === 0 ? 'none' : `1px solid ${THEME.border}`, paddingTop: i === 0 ? 0 : 12 }}
            >
              <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                {t.label}
              </div>
              <button
                type="button"
                onClick={() => setToggles(toggles.map((x) => x.key === t.key ? { ...x, on: !x.on } : x))}
                className="flex h-6 w-11 items-center rounded-full p-0.5 transition-colors"
                style={{ background: t.on ? THEME.primary : THEME.border }}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="block h-5 w-5 rounded-full bg-white shadow-sm"
                  style={{ marginLeft: t.on ? 18 : 0 }}
                />
              </button>
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell kicker="Status" title="Athlete account status">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: THEME.primary }} />
          <span className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>Active</span>
          <span className="text-[11px]" style={{ color: THEME.textSecondary }}>Joined via invite code</span>
        </div>
      </CardShell>

      <CardShell kicker="Private" title="Private coach notes">
        <textarea
          value={privateNotes}
          onChange={(e) => setPrivateNotes(e.target.value)}
          placeholder="Notes visible only to you..."
          rows={4}
          className="w-full rounded-lg border px-3 py-2 text-[12px] outline-none resize-none"
          style={{ background: THEME.light, borderColor: THEME.border, color: THEME.textPrimary }}
        />
      </CardShell>
    </div>
  )
}
