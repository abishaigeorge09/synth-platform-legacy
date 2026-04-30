import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  MessageSquare,
  Mic,
  Plus,
  Activity,
  Zap,
  Heart,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts'
import { SYNTH } from '../lib/theme'
import { toast } from '../../../shared/store/useToastStore'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SwipeBackPage } from '../primitives/SwipeBackPage'
import {
  useAthletes,
  useErgScores,
  useAthleteProfileSessions,
  useAthleteProfileLineups,
  useAthleteWellness,
  useAthleteCoachNotes,
} from '../../../shared/data/queries'
import type { Athlete, ErgScore } from '../../../shared/data/types'
import {
  DEMO_TIMELINE_90_DAY,
  getDemoAthleteOverview,
} from '../../../features/coach/athletes/data/demoData'

type TabKey = 'overview' | 'sessions' | 'lineups' | 'wellness' | 'telemetry' | 'compare' | 'notes' | 'settings'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview',   label: 'Overview'   },
  { key: 'sessions',   label: 'Sessions'   },
  { key: 'lineups',    label: 'Lineups'    },
  { key: 'wellness',   label: 'Wellness'   },
  { key: 'telemetry',  label: 'Telemetry'  },
  { key: 'compare',    label: 'Compare'    },
  { key: 'notes',      label: 'Notes'      },
  { key: 'settings',   label: 'Settings'   },
]

type RangeKey = '7d' | '14d' | '30d' | '90d'

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

function fmt2k(seconds?: number) {
  if (seconds === undefined) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

export function AthleteDetailPage() {
  const navigate = useNavigate()
  const { athleteId } = useParams<{ athleteId: string }>()
  const [tab, setTab] = useState<TabKey>('overview')
  const { data: athletes } = useAthletes()
  const { data: ergScores } = useErgScores()

  const athlete = useMemo(
    () => athletes.find((a) => a.id === athleteId) ?? athletes[0],
    [athletes, athleteId],
  )

  if (!athlete) {
    return (
      <div
        className="flex flex-1 items-center justify-center px-5"
        style={{
          background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        Loading roster…
      </div>
    )
  }

  return (
    <SwipeBackPage to="/app/coach/roster">
      <div
        className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab"
        style={{
          background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
          fontFamily: SYNTH.font,
        }}
      >
        <CoachPageHeader
          title={athlete.name}
          back="/app/coach/roster"
          rightSlot={
            <button
              type="button"
              aria-label="Ask synth about this athlete"
              onClick={() => navigate(`/app/coach/ai?athlete=${athlete.id}`)}
              className="mt-1 flex h-10 items-center gap-1.5 rounded-full px-3"
              style={{
                background: SYNTH.glass,
                backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
                border: `1px solid ${SYNTH.glassBorder}`,
                color: SYNTH.inkOnBrand,
              }}
            >
              <Sparkles size={14} strokeWidth={2.4} />
              <span className="text-[12px] font-semibold">Ask synth.</span>
            </button>
          }
        />

        {/* Tab strip */}
        <div className="mt-2 px-5">
          <div
            data-tour="coach-athlete-tabs"
            className="synth-scroll flex gap-1.5 overflow-x-auto rounded-full p-1"
            style={{
              background: SYNTH.glass,
              backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
              border: `1px solid ${SYNTH.glassBorder}`,
              scrollbarWidth: 'none',
            }}
          >
            {TABS.map((t) => {
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  data-tour={t.key === 'notes' ? 'coach-athlete-notes' : undefined}
                  onClick={() => setTab(t.key)}
                  className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
                  style={{
                    background: active ? SYNTH.inkOnBrand : 'transparent',
                    color: active ? SYNTH.ink : SYNTH.inkOnBrandMuted,
                    fontFamily: SYNTH.font,
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-4"
          >
            {tab === 'overview'  && <OverviewTab  athleteId={athlete.id} athleteName={athlete.name} />}
            {tab === 'sessions'  && <SessionsTab  athleteId={athlete.id} />}
            {tab === 'lineups'   && <LineupsTab   athleteId={athlete.id} />}
            {tab === 'wellness'  && <WellnessTab  athleteId={athlete.id} />}
            {tab === 'telemetry' && <TelemetryTab />}
            {tab === 'compare'   && <CompareTab   athlete={athlete} athletes={athletes} ergScores={ergScores} />}
            {tab === 'notes'     && <NotesTab     athleteId={athlete.id} />}
            {tab === 'settings'  && <SettingsTab  athleteName={athlete.name} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </SwipeBackPage>
  )
}

// ─── Overview ────────────────────────────────────────────────────────────────

function OverviewTab({ athleteId, athleteName }: { athleteId: string; athleteName: string }) {
  const demo = useMemo(
    () => getDemoAthleteOverview({ id: athleteId, name: athleteName, side: 'both', status: 'active', year: 'SO' }),
    [athleteId, athleteName],
  )
  const [range, setRange] = useState<RangeKey>('30d')
  const [seriesOn, setSeriesOn] = useState({
    erg: true,
    trainingLoad: true,
    recovery: true,
    sleep: false,
  })

  const timeline = useMemo(() => {
    const n = range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : 90
    return DEMO_TIMELINE_90_DAY.slice(-n)
  }, [range])

  return (
    <div className="flex flex-col gap-4 px-5">
      {/* Headline tiles — 6 across two rows */}
      <div className="grid grid-cols-2 gap-2">
        <HeadlineTile label="2K test" value={demo.headline.twoK.value} sub={demo.headline.twoK.delta} accent={SYNTH.cardSky} />
        <HeadlineTile label="Avg split /500" value={demo.headline.avgSplit.value} sub={demo.headline.avgSplit.delta} accent={SYNTH.accentEmerald} />
        <HeadlineTile label="Training load" value={demo.headline.trainingLoad.value} sub={demo.headline.trainingLoad.delta} accent={SYNTH.cardLemon} />
        <HeadlineTile label="Recovery" value={demo.headline.recovery.value} sub={demo.recovery.concern} accent={SYNTH.accentEmerald} />
        <HeadlineTile label="Injury risk" value={demo.headline.injuryRisk.level} sub={demo.headline.injuryRisk.factors[0] ?? ''} accent={demo.headline.injuryRisk.level === 'LOW' ? SYNTH.accentEmerald : SYNTH.accentAmber} pill />
        <HeadlineTile label="Data quality" value={demo.headline.dataQuality.value} sub={`${demo.headline.dataQuality.connectedSources} sources · freshness ${demo.headline.dataQuality.freshness}`} accent={SYNTH.cardMint} />
      </div>

      {/* Performance timeline */}
      <Card kicker="Performance synthesis" title="90-day timeline" subtitle="Toggle series to understand what changed">
        <div className="flex flex-wrap items-center gap-1.5 pb-3">
          {(['7d', '14d', '30d', '90d'] as RangeKey[]).map((k) => {
            const active = range === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setRange(k)}
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: active ? SYNTH.inkOnBrand : 'transparent',
                  border: `1px solid ${active ? SYNTH.inkOnBrand : SYNTH.glassBorder}`,
                  color: active ? SYNTH.ink : SYNTH.inkOnBrandMuted,
                  fontFamily: SYNTH.font,
                }}
              >
                {k}
              </button>
            )
          })}
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="left"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }}
                tickLine={false}
                axisLine={false}
                domain={[96, 106]}
              />
              <Tooltip
                contentStyle={{
                  background: SYNTH.canvasInk,
                  border: `1px solid ${SYNTH.glassBorder}`,
                  borderRadius: 12,
                  fontSize: 11,
                  color: SYNTH.inkOnBrand,
                }}
                labelStyle={{ color: SYNTH.inkOnBrandMuted }}
              />
              {seriesOn.erg && <Line yAxisId="right" type="monotone" dataKey="ergSplitSec" stroke={SYNTH.cardSky} strokeWidth={2} dot={false} name="Erg split" />}
              {seriesOn.trainingLoad && <Line yAxisId="left" type="monotone" dataKey="trainingLoad" stroke={SYNTH.cardLemon} strokeWidth={2} dot={false} name="Load" />}
              {seriesOn.recovery && <Line yAxisId="left" type="monotone" dataKey="recovery" stroke={SYNTH.accentEmerald} strokeWidth={2} dot={false} name="Recovery" />}
              {seriesOn.sleep && <Line yAxisId="left" type="monotone" dataKey="sleepHours" stroke={SYNTH.cardPink} strokeWidth={2} dot={false} name="Sleep" />}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <LegendPill label="Erg" color={SYNTH.cardSky} on={seriesOn.erg} onToggle={() => setSeriesOn((s) => ({ ...s, erg: !s.erg }))} />
          <LegendPill label="Load" color={SYNTH.cardLemon} on={seriesOn.trainingLoad} onToggle={() => setSeriesOn((s) => ({ ...s, trainingLoad: !s.trainingLoad }))} />
          <LegendPill label="Recovery" color={SYNTH.accentEmerald} on={seriesOn.recovery} onToggle={() => setSeriesOn((s) => ({ ...s, recovery: !s.recovery }))} />
          <LegendPill label="Sleep" color={SYNTH.cardPink} on={seriesOn.sleep} onToggle={() => setSeriesOn((s) => ({ ...s, sleep: !s.sleep }))} />
        </div>
      </Card>

      {/* Recovery details */}
      <Card kicker="Recovery" title="Sleep · HRV · resting HR">
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Recovery" value={`${demo.recoveryDetails.recoveryScore}/100`} sub={`Strain ${demo.recoveryDetails.strain.toFixed(1)}`} />
          <MiniStat label="Sleep" value={`${demo.recoveryDetails.sleepLastNightHours.toFixed(1)}h`} sub={`${demo.recoveryDetails.sleepQualityPct}% quality`} />
          <MiniStat label="HRV" value={`${demo.recoveryDetails.hrvMs}ms`} sub={`Baseline ${demo.recoveryDetails.hrvBaselineMs}ms`} />
          <MiniStat label="Resting HR" value={`${demo.recoveryDetails.restingHrBpm} bpm`} sub={`Baseline ${demo.recoveryDetails.restingHrBaselineBpm}`} />
        </div>
        <div
          className="mt-3 rounded-2xl px-3 py-2.5 text-[12px]"
          style={{
            background: `${SYNTH.accentAmber}26`,
            border: `1px solid ${SYNTH.accentAmber}55`,
            color: SYNTH.inkOnBrand,
          }}
        >
          {demo.recovery.concern}
        </div>
      </Card>

      {/* Training load + gym */}
      <Card kicker="Training load" title="Gym + plan adherence" subtitle={demo.gym.compliance}>
        <div className="grid grid-cols-2 gap-2">
          {demo.gym.keyLifts.map((k) => (
            <div
              key={k.lift}
              className="rounded-2xl px-3 py-2.5"
              style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                {k.lift}
              </p>
              <p className="mt-0.5 text-[15px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                {k.value}
              </p>
              <p className="text-[10px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                {k.delta}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
          <div>TSS {demo.trainingPeaks.tss}/{demo.trainingPeaks.plannedTss} · CTL {demo.trainingPeaks.ctl} · ATL {demo.trainingPeaks.atl} · TSB {demo.trainingPeaks.tsb}</div>
          <div>Planned: {demo.trainingPeaks.planned}</div>
          <div>Completed: {demo.trainingPeaks.completed}</div>
        </div>
      </Card>

      {/* Coach voice notes */}
      <Card kicker="Coach voice notes" title="Reverse-chrono observations">
        <div className="space-y-2">
          {demo.voiceNotes.map((n) => (
            <div
              key={n.date}
              className="rounded-2xl px-3 py-2.5"
              style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                {n.date}
              </p>
              <p className="mt-0.5 text-[12px]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                {n.extracted}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Schedule */}
      <Card kicker="Schedule" title="Next 5 days" subtitle={demo.scheduleConflict}>
        <div className="space-y-2">
          {demo.schedule.map((d) => (
            <div
              key={d.date}
              className="rounded-2xl px-3 py-2.5"
              style={{
                background: d.flagged ? `${SYNTH.accentAmber}1F` : SYNTH.glass,
                border: `1px solid ${d.flagged ? `${SYNTH.accentAmber}55` : SYNTH.glassBorder}`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                  {d.date}
                </p>
                {d.flagged ? (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: SYNTH.accentAmber, color: SYNTH.ink, fontFamily: SYNTH.font }}
                  >
                    Flag
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[12px]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                {d.items}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Sessions ────────────────────────────────────────────────────────────────

function SessionsTab({ athleteId }: { athleteId: string }) {
  const { data: sessions } = useAthleteProfileSessions(athleteId)

  const splitSeries = useMemo(() => {
    return [...sessions]
      .reverse()
      .map((s) => {
        const secs = s.splits.map(splitToSeconds).filter((v) => Number.isFinite(v))
        const avg = secs.length ? secs.reduce((a, b) => a + b, 0) / secs.length : Number.NaN
        return {
          date: s.date.slice(5),
          avgSplit: avg,
          bestSplit: secs.length ? Math.min(...secs) : Number.NaN,
        }
      })
  }, [sessions])

  const spmSeries = useMemo(() => {
    return [...sessions].reverse().map((s) => {
      const rates = s.strokeRates ?? []
      const avg = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : Number.NaN
      return { date: s.date.slice(5), spm: avg }
    })
  }, [sessions])

  return (
    <div className="flex flex-col gap-4 px-5">
      <Card kicker="Split trend" title="Avg + best /500 over time">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={splitSeries} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => fmtSplit(v as number)}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }}
                labelStyle={{ color: SYNTH.inkOnBrandMuted }}
                formatter={(v, k) => [fmtSplit(v as number), k === 'avgSplit' ? 'Avg' : 'Best']}
              />
              <Line type="monotone" dataKey="avgSplit" stroke={SYNTH.cardSky} strokeWidth={2.2} dot={false} />
              <Line type="monotone" dataKey="bestSplit" stroke={SYNTH.accentEmerald} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card kicker="Stroke rate" title="Avg SPM over time">
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spmSeries} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} formatter={(v) => [`${Math.round(v as number)} spm`, 'Avg']} />
              <Line type="monotone" dataKey="spm" stroke={SYNTH.cardPink} strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card kicker="Sessions" title={`${sessions.length} workouts logged`}>
        <div className="space-y-2">
          {sessions.slice(0, 12).map((s) => (
            <div
              key={s.id}
              className="rounded-2xl px-3 py-2.5"
              style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                  {s.title}
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                  {s.date}
                </p>
              </div>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                {s.boat} · seat {s.seat}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {s.splits.map((split, i) => (
                  <span
                    key={i}
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: SYNTH.glassActive,
                      color: SYNTH.inkOnBrand,
                      fontFamily: SYNTH.font,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {split}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Lineups ─────────────────────────────────────────────────────────────────

function LineupsTab({ athleteId }: { athleteId: string }) {
  const { data: lineups } = useAthleteProfileLineups(athleteId)
  return (
    <div className="px-5">
      <Card kicker="Lineup history" title={`${lineups.length} assignments this season`}>
        <div className="space-y-2">
          {lineups.slice(0, 24).map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between rounded-2xl px-3 py-2.5"
              style={{
                background: SYNTH.glass,
                border: `1px solid ${SYNTH.glassBorder}`,
                borderLeft: `3px solid ${l.side === 'port' ? SYNTH.cardSky : SYNTH.cardPink}`,
              }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                  {l.boat} · seat {l.seat}
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                  {l.date} · {l.session}
                </p>
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: l.side === 'port' ? `${SYNTH.cardSky}40` : `${SYNTH.cardPink}40`,
                  color: SYNTH.inkOnBrand,
                  fontFamily: SYNTH.font,
                }}
              >
                {l.side}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Wellness ────────────────────────────────────────────────────────────────

function WellnessTab({ athleteId }: { athleteId: string }) {
  const { data: checkins } = useAthleteWellness(athleteId)
  const latest = checkins[checkins.length - 1]
  const chartData = checkins.slice(-14).map((c) => ({
    date: c.date.slice(5),
    sleep: c.sleepHours,
    hr: c.restingHr,
    hrv: c.hrv,
    recovery: c.recovery,
  }))

  return (
    <div className="flex flex-col gap-4 px-5">
      {latest ? (
        <div className="grid grid-cols-3 gap-2">
          <WellnessPill label="Sleep" value={`${latest.sleepHours.toFixed(1)}h`} accent={SYNTH.cardSky} />
          <WellnessPill label="HR" value={`${latest.restingHr}`} accent={SYNTH.cardPink} />
          <WellnessPill label="Recovery" value={`${latest.recovery}%`} accent={SYNTH.accentEmerald} />
        </div>
      ) : null}

      <Card kicker="14-day rolling" title="Recovery · HR · sleep">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} />
              <Line type="monotone" dataKey="recovery" stroke={SYNTH.accentEmerald} strokeWidth={2.2} dot={false} name="Recovery" />
              <Line type="monotone" dataKey="hr" stroke={SYNTH.cardPink} strokeWidth={2} dot={false} name="HR" />
              <Line type="monotone" dataKey="hrv" stroke={SYNTH.cardSky} strokeWidth={2} dot={false} name="HRV" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card kicker="Recent check-ins" title="Soreness · energy · mood · sleep">
        <div className="space-y-2">
          {checkins.slice(-5).reverse().map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-5 gap-2 rounded-2xl px-3 py-2.5 text-[11px]"
              style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
            >
              <span className="font-semibold">{c.date.slice(5)}</span>
              <span style={{ color: SYNTH.inkOnBrandMuted }}>S {c.soreness}</span>
              <span style={{ color: SYNTH.inkOnBrandMuted }}>E {c.energy}</span>
              <span style={{ color: SYNTH.inkOnBrandMuted }}>M {Math.round((c.energy + (c.recovery / 20)) / 2)}</span>
              <span style={{ color: SYNTH.inkOnBrandMuted }}>Sl {c.sleepHours.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Compare ─────────────────────────────────────────────────────────────────

function CompareTab({
  athlete,
  athletes,
  ergScores,
}: {
  athlete: Athlete
  athletes: Athlete[]
  ergScores: ErgScore[]
}) {
  const others = athletes.filter((a) => a.id !== athlete.id)
  const [otherId, setOtherId] = useState<string>('')
  const them = others.find((a) => a.id === otherId)
  const myErg = ergScores.find((e) => e.athleteId === athlete.id)
  const theirErg = them ? ergScores.find((e) => e.athleteId === them.id) : null

  return (
    <div className="flex flex-col gap-4 px-5">
      <Card kicker="Compare" title={`${athlete.name.split(' ')[0]} vs teammate`}>
        <select
          value={otherId}
          onChange={(e) => setOtherId(e.target.value)}
          className="w-full rounded-2xl px-3 py-2.5 text-[13px] outline-none"
          style={{
            background: SYNTH.glass,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          <option value="" style={{ color: SYNTH.ink }}>Choose teammate…</option>
          {others.map((a) => (
            <option key={a.id} value={a.id} style={{ color: SYNTH.ink }}>
              {a.name}
            </option>
          ))}
        </select>

        {them && myErg && theirErg ? (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <CompareCard label="2K time" a={fmt2k(myErg.timeSeconds)} b={fmt2k(theirErg.timeSeconds)} aName={athlete.name.split(' ')[0]} bName={them.name.split(' ')[0]} delta={`${(theirErg.timeSeconds - myErg.timeSeconds).toFixed(1)}s`} />
              <CompareCard label="Avg split" a={fmt2k(myErg.splitSeconds)} b={fmt2k(theirErg.splitSeconds)} aName={athlete.name.split(' ')[0]} bName={them.name.split(' ')[0]} delta={`${((theirErg.splitSeconds ?? 0) - (myErg.splitSeconds ?? 0)).toFixed(1)}s`} />
              <CompareCard label="Watts" a={`${myErg.watts ?? '—'}`} b={`${theirErg.watts ?? '—'}`} aName={athlete.name.split(' ')[0]} bName={them.name.split(' ')[0]} delta={`${(myErg.watts ?? 0) - (theirErg.watts ?? 0)}W`} />
              <CompareCard label="SPM" a={`${myErg.spm ?? '—'}`} b={`${theirErg.spm ?? '—'}`} aName={athlete.name.split(' ')[0]} bName={them.name.split(' ')[0]} delta={`${(myErg.spm ?? 0) - (theirErg.spm ?? 0)}`} />
            </div>
            <div
              className="mt-3 rounded-2xl px-3 py-2.5 text-[12px]"
              style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {Math.abs(myErg.timeSeconds - theirErg.timeSeconds) < 5
                ? 'Strong pairing — within 5s on 2K. Well-matched for a pair or 4+.'
                : Math.abs(myErg.timeSeconds - theirErg.timeSeconds) < 15
                  ? 'Moderate compatibility. Could work in the same boat with complementary roles.'
                  : 'Large gap on 2K — consider different boats or asymmetric seating.'}
            </div>
          </>
        ) : null}
      </Card>
    </div>
  )
}

function CompareCard({ label, a, b, aName, bName, delta }: { label: string; a: string; b: string; aName: string; bName: string; delta: string }) {
  return (
    <div className="rounded-2xl px-3 py-3" style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>{aName}</p>
          <p className="text-[16px] font-bold" style={{ color: SYNTH.cardSky, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{a}</p>
        </div>
        <p className="pb-1 text-[10px] font-semibold" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
          {delta}
        </p>
        <div className="text-right">
          <p className="text-[10px]" style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}>{bName}</p>
          <p className="text-[16px] font-bold" style={{ color: SYNTH.cardPink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{b}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Notes ───────────────────────────────────────────────────────────────────

function NotesTab({ athleteId }: { athleteId: string }) {
  const { data: notes } = useAthleteCoachNotes(athleteId)
  const [draft, setDraft] = useState('')

  return (
    <div className="flex flex-col gap-4 px-5">
      <Card kicker="New note" title="Add observation">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type or hold mic…"
            className="h-10 flex-1 rounded-full px-4 text-[13px] outline-none"
            style={{
              background: SYNTH.glass,
              border: `1px solid ${SYNTH.glassBorder}`,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
            }}
          />
          <button
            type="button"
            aria-label="Voice"
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand }}
          >
            <Mic size={14} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            aria-label="Add"
            disabled={!draft.trim()}
            onClick={() => setDraft('')}
            className="flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-50"
            style={{ background: SYNTH.inkOnBrand, color: SYNTH.ink }}
          >
            <Plus size={16} strokeWidth={2.6} />
          </button>
        </div>
      </Card>

      <Card kicker="Coach notes" title={`${notes.length} observations`}>
        <div className="space-y-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl px-3 py-2.5"
              style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                  {n.date}
                </span>
                {n.isTranscription ? (
                  <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ background: `${SYNTH.cardPink}40`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                    Voice
                  </span>
                ) : null}
                <div className="ml-auto flex gap-1">
                  {n.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{
                        background: t === 'Positive' ? `${SYNTH.accentEmerald}33` : t === 'Flag' || t === 'Concern' ? `${SYNTH.accentRed}33` : `${SYNTH.cardSky}33`,
                        color: SYNTH.inkOnBrand,
                        fontFamily: SYNTH.font,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                {n.text}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Settings ────────────────────────────────────────────────────────────────

const VISIBILITY_TOGGLES = [
  { key: 'showTeamStats', label: 'Can see team-wide stats', on: true },
  { key: 'showOtherBoats', label: 'Can see other boats', on: false },
  { key: 'showCoachNotes', label: 'Can see coach notes', on: false },
  { key: 'shareVideos', label: 'Share video clips', on: true },
  { key: 'allowPersonalSources', label: 'Can connect own sources', on: true },
  { key: 'receiveNotifications', label: 'Receives push notifications', on: true },
]

function SettingsTab({ athleteName }: { athleteName: string }) {
  const [toggles, setToggles] = useState(VISIBILITY_TOGGLES)
  const [privateNotes, setPrivateNotes] = useState('')

  return (
    <div className="flex flex-col gap-4 px-5">
      <Card kicker="Access" title={`${athleteName.split(' ')[0]} — visibility`}>
        <div className="flex flex-col">
          {toggles.map((t, i) => (
            <div
              key={t.key}
              className="flex items-center justify-between py-3"
              style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.glassBorder}` }}
            >
              <p className="flex-1 pr-3 text-[13px]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                {t.label}
              </p>
              <button
                type="button"
                onClick={() => setToggles(toggles.map((x) => (x.key === t.key ? { ...x, on: !x.on } : x)))}
                className="flex h-6 w-11 items-center rounded-full p-0.5"
                style={{ background: t.on ? SYNTH.accentEmerald : SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}
                aria-pressed={t.on}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="block h-5 w-5 rounded-full"
                  style={{ background: SYNTH.inkOnBrand, marginLeft: t.on ? 18 : 0 }}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card kicker="Status" title="Athlete account">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: SYNTH.accentEmerald }} />
          <p className="text-[13px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
            Active
          </p>
          <p className="text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
            · Joined via invite code
          </p>
        </div>
      </Card>

      <Card kicker="Private" title="Coach-only notes">
        <textarea
          value={privateNotes}
          onChange={(e) => setPrivateNotes(e.target.value)}
          placeholder="Notes visible only to you…"
          rows={4}
          className="w-full rounded-2xl px-3 py-2.5 text-[12px] outline-none resize-none"
          style={{
            background: SYNTH.glass,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        />
      </Card>

      <button
        type="button"
        onClick={() => {/* handled by parent navigate via Ask synth chip */}}
        className="flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold"
        style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        <MessageSquare size={14} strokeWidth={2.4} />
        Send a message
      </button>
    </div>
  )
}

// ─── Telemetry ───────────────────────────────────────────────────────────────

const TELEM_STROKE: { date: string; spm: number; target: number }[] = [
  { date: '4/01', spm: 18, target: 20 }, { date: '4/05', spm: 19, target: 20 },
  { date: '4/08', spm: 22, target: 22 }, { date: '4/12', spm: 23, target: 22 },
  { date: '4/15', spm: 24, target: 24 }, { date: '4/19', spm: 25, target: 24 },
  { date: '4/22', spm: 26, target: 26 }, { date: '4/26', spm: 27, target: 26 },
  { date: '4/29', spm: 28, target: 28 },
]
const TELEM_POWER: { date: string; watts: number }[] = [
  { date: '4/01', watts: 180 }, { date: '4/05', watts: 185 },
  { date: '4/08', watts: 204 }, { date: '4/12', watts: 211 },
  { date: '4/15', watts: 220 }, { date: '4/19', watts: 228 },
  { date: '4/22', watts: 235 }, { date: '4/26', watts: 241 },
  { date: '4/29', watts: 248 },
]
const TELEM_HR_ZONES: { zone: string; minutes: number; color: string }[] = [
  { zone: 'Z1', minutes: 22, color: '#6366F1' },
  { zone: 'Z2', minutes: 48, color: '#10B981' },
  { zone: 'Z3', minutes: 31, color: '#F59E0B' },
  { zone: 'Z4', minutes: 18, color: '#F97316' },
  { zone: 'Z5', minutes: 9,  color: '#EF4444' },
]
const TELEM_SPLITS: { piece: string; split: number; target: number }[] = [
  { piece: 'P1', split: 101.4, target: 101 }, { piece: 'P2', split: 101.2, target: 101 },
  { piece: 'P3', split: 100.9, target: 101 }, { piece: 'P4', split: 100.6, target: 101 },
  { piece: 'P5', split: 101.1, target: 101 }, { piece: 'P6', split: 100.8, target: 101 },
]

function fmtTelemSplit(v: number) {
  const m = Math.floor(v / 60)
  const s = (v - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

function TelemetryTab() {
  const [range, setRange] = useState<'2w' | '4w' | 'all'>('4w')
  const spmSlice = range === '2w' ? TELEM_STROKE.slice(-4) : range === '4w' ? TELEM_STROKE.slice(-6) : TELEM_STROKE
  const pwrSlice = range === '2w' ? TELEM_POWER.slice(-4) : range === '4w' ? TELEM_POWER.slice(-6) : TELEM_POWER

  return (
    <div className="flex flex-col gap-4 px-5">
      {/* Range toggle */}
      <div className="flex items-center gap-1.5">
        {(['2w', '4w', 'all'] as const).map((k) => (
          <button key={k} type="button" onClick={() => setRange(k)}
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              background: range === k ? SYNTH.inkOnBrand : 'transparent',
              border: `1px solid ${range === k ? SYNTH.inkOnBrand : SYNTH.glassBorder}`,
              color: range === k ? SYNTH.ink : SYNTH.inkOnBrandMuted,
              fontFamily: SYNTH.font,
            }}
          >{k}</button>
        ))}
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <Activity size={13} strokeWidth={2.2} />, label: 'Avg SPM', value: '24.2', sub: '↑ 1.8 vs prev', accent: SYNTH.cardSky },
          { icon: <Zap size={13} strokeWidth={2.2} />, label: 'Peak watts', value: '248W', sub: '↑ 12W month', accent: SYNTH.cardLemon },
          { icon: <Heart size={13} strokeWidth={2.2} />, label: 'Avg HR', value: '162', sub: 'bpm · 84% max', accent: SYNTH.cardPink },
        ].map((t) => (
          <div key={t.label} className="rounded-3xl p-3" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
            <div className="flex items-center gap-1" style={{ color: t.accent }}>{t.icon}</div>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{t.label}</p>
            <p className="mt-0.5 text-[16px] font-bold" style={{ color: t.accent, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{t.value}</p>
            <p className="text-[9px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{t.sub}</p>
          </div>
        ))}
      </div>

      {/* Stroke rate */}
      <Card kicker="Stroke rate" title="SPM vs target">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spmSlice} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={[16, 30]} />
              <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} formatter={(v, k) => [`${v} spm`, k === 'spm' ? 'Actual' : 'Target']} />
              <Line type="monotone" dataKey="target" stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="target" />
              <Line type="monotone" dataKey="spm" stroke={SYNTH.cardSky} strokeWidth={2.2} dot={{ r: 3, fill: SYNTH.cardSky }} name="spm" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Power output */}
      <Card kicker="Power output" title="Watts per session">
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pwrSlice} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
              <defs>
                <linearGradient id="coachPwrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SYNTH.cardLemon} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={SYNTH.cardLemon} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={[160, 260]} />
              <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} formatter={(v) => [`${v}W`, 'Power']} />
              <Area type="monotone" dataKey="watts" stroke={SYNTH.cardLemon} strokeWidth={2.2} fill="url(#coachPwrGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* HR zones */}
      <Card kicker="Heart rate zones" title="Time in zone · last session">
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TELEM_HR_ZONES} margin={{ top: 8, right: 8, bottom: 4, left: -20 }} barSize={24} barCategoryGap="30%">
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="zone" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} unit="m" />
              <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} formatter={(v) => [`${v} min`, 'Time']} />
              <Bar dataKey="minutes" radius={[5, 5, 0, 0]}>
                {TELEM_HR_ZONES.map((z, i) => <Cell key={i} fill={z.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Split consistency */}
      <Card kicker="Split consistency" title="Piece-by-piece /500m · last session">
        <div className="space-y-2">
          {TELEM_SPLITS.map((p) => {
            const diff = p.split - p.target
            const fast = diff < 0
            return (
              <div key={p.piece} className="flex items-center justify-between rounded-2xl px-3 py-2.5"
                style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{p.piece}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{fmtTelemSplit(p.split)}</p>
                  <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ background: fast ? `${SYNTH.accentEmerald}33` : `${SYNTH.accentAmber}33`, color: fast ? SYNTH.accentEmerald : SYNTH.accentAmber, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
                  >{fast ? `${Math.abs(diff).toFixed(1)}s fast` : `+${diff.toFixed(1)}s`}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Generate AI Report */}
      <div
        className="rounded-3xl p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(59,130,246,0.12) 100%)',
          border: `1px solid rgba(16,185,129,0.30)`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.accentEmerald, fontFamily: SYNTH.font }}>AI analysis</p>
            <h3 className="mt-1 text-[15px] font-bold leading-tight" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>Generate telemetry report</h3>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
              synth. will synthesise stroke rate, power, and HR data into a personalised performance breakdown for this athlete.
            </p>
          </div>
          <span className="shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider"
            style={{ background: `${SYNTH.accentAmber}33`, color: SYNTH.accentAmber, fontFamily: SYNTH.font }}>Soon</span>
        </div>
        <button
          type="button"
          onClick={() => toast('AI report generation coming soon — stay tuned!', 'info')}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold"
          style={{ background: SYNTH.accentEmerald, color: '#FFFFFF', fontFamily: SYNTH.font }}
        >
          <Sparkles size={14} strokeWidth={2.4} />
          Generate AI Report
        </button>
      </div>
    </div>
  )
}

// ─── Shared primitives (local) ───────────────────────────────────────────────

function Card({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-3xl p-4"
      style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        {kicker}
      </p>
      <h3 className="mt-0.5 text-[15px] font-bold leading-tight" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
        {title}
      </h3>
      {subtitle ? (
        <p className="mt-0.5 text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          {subtitle}
        </p>
      ) : null}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function HeadlineTile({
  label,
  value,
  sub,
  accent,
  pill,
}: {
  label: string
  value: string
  sub: string
  accent: string
  pill?: boolean
}) {
  return (
    <div
      className="rounded-3xl p-3"
      style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        {label}
      </p>
      {pill ? (
        <span
          className="mt-1 inline-block rounded-full px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider"
          style={{ background: accent, color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          {value}
        </span>
      ) : (
        <p
          className="mt-0.5 text-[18px] font-bold"
          style={{ color: accent, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </p>
      )}
      <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        {sub}
      </p>
    </div>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl px-3 py-2.5" style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        {label}
      </p>
      <p className="mt-0.5 text-[14px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
      <p className="text-[10px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        {sub}
      </p>
    </div>
  )
}

function LegendPill({
  label,
  color,
  on,
  onToggle,
}: {
  label: string
  color: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        background: on ? `${color}26` : 'transparent',
        border: `1px solid ${on ? color : SYNTH.glassBorder}`,
        color: on ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted,
        fontFamily: SYNTH.font,
      }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: on ? color : SYNTH.glassBorder }} />
      {label}
    </button>
  )
}

function WellnessPill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="rounded-3xl p-3 text-center"
      style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        {label}
      </p>
      <p className="mt-0.5 text-[18px] font-bold" style={{ color: accent, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  )
}
