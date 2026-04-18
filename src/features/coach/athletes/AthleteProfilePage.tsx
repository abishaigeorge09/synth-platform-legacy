import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
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
import { useAthletes, useErgScores, useAthleteYoy } from '../../../shared/data/queries'
import type { ErgScore } from '../../../shared/data/types'
import type { AthleteYoyPair } from '../../../shared/data/seeds/athleteExtras'
import { SynthAiIllustration } from '../../../shared/illustrations/sidebarIllustrations'
import { SkeletonLine, SkeletonBlock, SkeletonStatTile, SkeletonChart } from '../../../shared/components/Skeleton'
import { QueryError } from '../../../shared/components/QueryError'

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

export function AthleteProfilePage() {
  const { athleteId } = useParams()
  const { data: athletes, isLoading: l1, isError: e1, error: err1 } = useAthletes()
  const { data: ergScores, isLoading: l2, isError: e2, error: err2 } = useErgScores()
  const { data: yoy, isLoading: l3, isError: e3, error: err3 } = useAthleteYoy(athleteId ?? '')

  if (e1 || e2 || e3) return <QueryError label="Athlete profile" error={err1 ?? err2 ?? err3} />

  if (l1 || l2 || l3) {
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

  const athlete = athletes.find((a) => a.id === athleteId)
  const erg = athlete ? ergScores.find((e) => e.athleteId === athlete.id) : null

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
        <div
          className="text-[11px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {rank ? `#${String(rank).padStart(2, '0')} on 2K · ${ergOrDefault(erg?.date)}` : '—'}
        </div>
      </div>

      <ProfileHeader
        name={athlete.name}
        subtitle={`${athlete.side ?? 'side tbd'} · ${athlete.status} · ${athlete.year ?? 'class tbd'}`}
        athleteId={athlete.id}
      />

      <StatRow erg={erg} yoy={yoy} />

      {yoy && (
        <div className="mt-6 px-5 sm:px-10">
          <YoyChart yoy={yoy} athleteName={athlete.name} />
        </div>
      )}

      <div className="mt-6 grid gap-4 px-5 sm:px-10 xl:grid-cols-2">
        <SessionsCard />
        <LineupHistoryCard />
      </div>

      <div className="mt-6 px-5 sm:px-10">
        <WellnessStub />
      </div>
    </div>
  )
}

function ergOrDefault(d?: string) {
  return d ?? '—'
}

function ProfileHeader({ name, subtitle, athleteId }: { name: string; subtitle: string; athleteId: string }) {
  return (
    <div className="flex flex-col gap-6 px-5 sm:px-10 pb-4 pt-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="flex items-center gap-5">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl border text-[26px] font-semibold"
          style={{
            background: THEME.white,
            borderColor: THEME.border,
            fontFamily: THEME.fontMono,
            color: THEME.primary,
          }}
        >
          {initials(name)}
        </div>
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Coach · Athlete profile
          </div>
          <h1
            className="mt-1 text-[36px] font-semibold leading-[1]"
            style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
          >
            {name}
          </h1>
          <div
            className="mt-1 text-[12px] capitalize"
            style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
          >
            {subtitle}
          </div>
        </div>
      </div>
      <AthleteAiButton name={name} athleteId={athleteId} />
    </div>
  )
}

function AthleteAiButton({ name, athleteId }: { name: string; athleteId: string }) {
  const navigate = useNavigate()
  return (
    <motion.button
      onClick={() => navigate(`/coach/athletes/${athleteId}/ai`)}
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
          synth. AI · scoped
        </div>
        <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
          Ask about {name.split(' ')[0]}
        </div>
      </div>
    </motion.button>
  )
}

function StatRow({
  erg,
  yoy,
}: {
  erg?: ErgScore | null
  yoy: AthleteYoyPair | null
}) {
  const tiles = [
    {
      kicker: '2K test',
      value: fmt2k(erg?.timeSeconds),
      detail: erg?.date ?? '—',
      color: THEME.primary,
    },
    {
      kicker: 'Avg split /500',
      value: fmt2k(erg?.splitSeconds),
      detail: 'from current 2K',
      color: THEME.cyan,
    },
    {
      kicker: 'Watts',
      value: erg?.watts ? String(erg.watts) : '—',
      detail: erg?.spm ? `${erg.spm} spm` : '—',
      color: THEME.purple,
    },
    {
      kicker: 'YoY delta',
      value: yoy ? `${yoy.deltaSec > 0 ? '+' : ''}${yoy.deltaSec.toFixed(1)}s` : '—',
      detail: yoy ? 'vs 2025-03-17' : 'no prior data',
      color: yoy && yoy.deltaSec < 0 ? THEME.primary : THEME.amber,
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 px-5 sm:px-10 lg:grid-cols-4">
      {tiles.map((t, i) => (
        <motion.div
          key={t.kicker}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
          className="rounded-xl border p-4"
          style={{
            background: THEME.white,
            borderColor: THEME.border,
            borderLeft: `3px solid ${t.color}`,
          }}
        >
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            {t.kicker}
          </div>
          <div
            className="mt-2 text-[28px] font-bold leading-none"
            style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
          >
            {t.value}
          </div>
          <div className="mt-1 text-[11px]" style={{ color: THEME.textSecondary }}>
            {t.detail}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function YoyChart({
  yoy,
  athleteName,
}: {
  yoy: AthleteYoyPair
  athleteName: string
}) {
  const data = [
    { label: 'Mar 2025', sec: yoy.sec2025 },
    { label: 'Mar 2026', sec: yoy.sec2026 },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border p-5"
      style={{ background: THEME.white, borderColor: THEME.border }}
    >
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Progression · 2K test
      </div>
      <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
        {athleteName.split(' ')[0]}'s year-over-year
      </div>
      <div className="mt-4 h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 24, bottom: 4, left: 12 }}>
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
    </motion.div>
  )
}

function SessionsCard() {
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
      <div className="mt-4 rounded-lg border border-dashed p-4 text-[12px]" style={{ borderColor: THEME.border, color: THEME.textSecondary }}>
        Phase 6 (Session Timer) feeds real splits + video markers here. Until then this block is a placeholder so the profile layout is already wired for the schema.
      </div>
    </div>
  )
}

function LineupHistoryCard() {
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
        Boats & seats this season
      </div>
      <div className="mt-4 rounded-lg border border-dashed p-4 text-[12px]" style={{ borderColor: THEME.border, color: THEME.textSecondary }}>
        Phase 5 (Lineups) writes published boat assignments into session_lineups — this card will render the per-athlete view.
      </div>
    </div>
  )
}

function WellnessStub() {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: THEME.white, borderColor: THEME.border }}
    >
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Wellness · rolling
      </div>
      <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
        Sleep · HRV · recovery
      </div>
      <div
        className="mt-4 rounded-lg border border-dashed p-4 text-[12px]"
        style={{ borderColor: THEME.border, color: THEME.textSecondary }}
      >
        Backed by wellness_checkins in the schema. The wearable hub connector pushes daily HRV and sleep on a live schedule; email digests fill in subjective energy/soreness/mood. P1 wires real data.
      </div>
    </div>
  )
}
