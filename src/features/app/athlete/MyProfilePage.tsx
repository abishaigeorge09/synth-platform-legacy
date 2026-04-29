/**
 * Athlete-facing profile — mirrors AthleteDetailPage but omits Compare
 * (coach-only) and Settings (handled by the athlete's own settings page).
 * Tabs: Overview · Sessions · Lineups · Wellness · Notes
 */
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mic, Plus } from 'lucide-react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { SYNTH } from '../lib/theme'
import { SwipeBackPage } from '../primitives/SwipeBackPage'
import {
  useAthletes,
  useAthleteProfileSessions,
  useAthleteProfileLineups,
  useAthleteWellness,
  useAthleteCoachNotes,
} from '../../../shared/data/queries'
import {
  DEMO_TIMELINE_90_DAY,
  getDemoAthleteOverview,
} from '../../../features/coach/athletes/data/demoData'
import { APP_MOCK_ATHLETES } from '../data/mockTeam'

type TabKey = 'overview' | 'sessions' | 'lineups' | 'wellness' | 'notes'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview',  label: 'Overview'  },
  { key: 'sessions',  label: 'Sessions'  },
  { key: 'lineups',   label: 'Lineups'   },
  { key: 'wellness',  label: 'Wellness'  },
  { key: 'notes',     label: 'Notes'     },
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

export function MyProfilePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('overview')
  const { data: athletes } = useAthletes()

  // Use the demo athlete (Star Miller) as self
  const me = APP_MOCK_ATHLETES[0]
  const athlete = useMemo(
    () => athletes.find((a) => a.id === me.id) ?? athletes[0],
    [athletes, me.id],
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
        Loading…
      </div>
    )
  }

  return (
    <SwipeBackPage to="/app/athlete/home">
      <div
        className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]"
        style={{
          background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`,
          fontFamily: SYNTH.font,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2"
          style={{ color: SYNTH.inkOnBrand }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: SYNTH.inkOnBrandMuted }}>
              synth · athlete
            </p>
            <h1 className="mt-0.5 text-[20px] font-bold leading-tight">{athlete.name}</h1>
          </div>
          <button
            type="button"
            aria-label="Ask synth AI"
            onClick={() => navigate('/app/athlete/ai')}
            className="flex h-10 items-center gap-1.5 rounded-full px-3"
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
        </div>

        {/* Tab strip */}
        <div className="mt-2 px-5">
          <div
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

        {/* Tab content */}
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
            {tab === 'notes'     && <NotesTab     athleteId={athlete.id} />}
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
  const [seriesOn, setSeriesOn] = useState({ erg: true, trainingLoad: true, recovery: true, sleep: false })

  const timeline = useMemo(() => {
    const n = range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : 90
    return DEMO_TIMELINE_90_DAY.slice(-n)
  }, [range])

  return (
    <div className="flex flex-col gap-4 px-5">
      <div className="grid grid-cols-2 gap-2">
        <HeadlineTile label="2K test" value={demo.headline.twoK.value} sub={demo.headline.twoK.delta} accent={SYNTH.cardSky} />
        <HeadlineTile label="Avg split /500" value={demo.headline.avgSplit.value} sub={demo.headline.avgSplit.delta} accent={SYNTH.accentEmerald} />
        <HeadlineTile label="Training load" value={demo.headline.trainingLoad.value} sub={demo.headline.trainingLoad.delta} accent={SYNTH.cardLemon} />
        <HeadlineTile label="Recovery" value={demo.headline.recovery.value} sub={demo.recovery.concern} accent={SYNTH.accentEmerald} />
        <HeadlineTile label="Injury risk" value={demo.headline.injuryRisk.level} sub={demo.headline.injuryRisk.factors[0] ?? ''} accent={demo.headline.injuryRisk.level === 'LOW' ? SYNTH.accentEmerald : SYNTH.accentAmber} pill />
        <HeadlineTile label="Data quality" value={demo.headline.dataQuality.value} sub={`${demo.headline.dataQuality.connectedSources} sources`} accent={SYNTH.cardMint} />
      </div>

      <Card kicker="Performance synthesis" title="90-day timeline">
        <div className="flex flex-wrap items-center gap-1.5 pb-3">
          {(['7d', '14d', '30d', '90d'] as RangeKey[]).map((k) => {
            const active = range === k
            return (
              <button key={k} type="button" onClick={() => setRange(k)}
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: active ? SYNTH.inkOnBrand : 'transparent',
                  border: `1px solid ${active ? SYNTH.inkOnBrand : SYNTH.glassBorder}`,
                  color: active ? SYNTH.ink : SYNTH.inkOnBrandMuted,
                  fontFamily: SYNTH.font,
                }}
              >{k}</button>
            )
          })}
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={[96, 106]} />
              <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} />
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

      <Card kicker="Recovery" title="Sleep · HRV · resting HR">
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Recovery" value={`${demo.recoveryDetails.recoveryScore}/100`} sub={`Strain ${demo.recoveryDetails.strain.toFixed(1)}`} />
          <MiniStat label="Sleep" value={`${demo.recoveryDetails.sleepLastNightHours.toFixed(1)}h`} sub={`${demo.recoveryDetails.sleepQualityPct}% quality`} />
          <MiniStat label="HRV" value={`${demo.recoveryDetails.hrvMs}ms`} sub={`Baseline ${demo.recoveryDetails.hrvBaselineMs}ms`} />
          <MiniStat label="Resting HR" value={`${demo.recoveryDetails.restingHrBpm} bpm`} sub={`Baseline ${demo.recoveryDetails.restingHrBaselineBpm}`} />
        </div>
      </Card>

      <Card kicker="Schedule" title="Next 5 days" subtitle={demo.scheduleConflict}>
        <div className="space-y-2">
          {demo.schedule.map((d) => (
            <div key={d.date} className="rounded-2xl px-3 py-2.5"
              style={{ background: d.flagged ? `${SYNTH.accentAmber}1F` : SYNTH.glass, border: `1px solid ${d.flagged ? `${SYNTH.accentAmber}55` : SYNTH.glassBorder}` }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{d.date}</p>
              <p className="mt-1 text-[12px]" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{d.items}</p>
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

  const splitSeries = useMemo(() =>
    [...sessions].reverse().map((s) => {
      const secs = s.splits.map(splitToSeconds).filter((v) => Number.isFinite(v))
      const avg = secs.length ? secs.reduce((a, b) => a + b, 0) / secs.length : Number.NaN
      return { date: s.date.slice(5), avgSplit: avg, bestSplit: secs.length ? Math.min(...secs) : Number.NaN }
    }), [sessions])

  return (
    <div className="flex flex-col gap-4 px-5">
      <Card kicker="Split trend" title="Avg + best /500 over time">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={splitSeries} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} tickFormatter={(v) => fmtSplit(v as number)} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} formatter={(v, k) => [fmtSplit(v as number), k === 'avgSplit' ? 'Avg' : 'Best']} />
              <Line type="monotone" dataKey="avgSplit" stroke={SYNTH.cardSky} strokeWidth={2.2} dot={false} />
              <Line type="monotone" dataKey="bestSplit" stroke={SYNTH.accentEmerald} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card kicker="Sessions" title={`${sessions.length} workouts logged`}>
        <div className="space-y-2">
          {sessions.slice(0, 12).map((s) => (
            <div key={s.id} className="rounded-2xl px-3 py-2.5" style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{s.title}</p>
                <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{s.date}</p>
              </div>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{s.boat} · seat {s.seat}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {s.splits.map((split, i) => (
                  <span key={i} className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: SYNTH.glassActive, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{split}</span>
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
            <div key={l.id} className="flex items-center justify-between rounded-2xl px-3 py-2.5"
              style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, borderLeft: `3px solid ${l.side === 'port' ? SYNTH.cardSky : SYNTH.cardPink}` }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{l.boat} · seat {l.seat}</p>
                <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{l.date} · {l.session}</p>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ background: l.side === 'port' ? `${SYNTH.cardSky}40` : `${SYNTH.cardPink}40`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >{l.side}</span>
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
  const chartData = checkins.slice(-14).map((c) => ({ date: c.date.slice(5), sleep: c.sleepHours, hr: c.restingHr, hrv: c.hrv, recovery: c.recovery }))

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
            style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          />
          <button type="button" aria-label="Voice" className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}`, color: SYNTH.inkOnBrand }}
          ><Mic size={14} strokeWidth={2.4} /></button>
          <button type="button" aria-label="Add" disabled={!draft.trim()} onClick={() => setDraft('')}
            className="flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-50"
            style={{ background: SYNTH.inkOnBrand, color: SYNTH.ink }}
          ><Plus size={16} strokeWidth={2.6} /></button>
        </div>
      </Card>

      <Card kicker="Coach notes" title={`${notes.length} observations`}>
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="rounded-2xl px-3 py-2.5" style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{n.date}</span>
                {n.isTranscription ? (
                  <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ background: `${SYNTH.cardPink}40`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>Voice</span>
                ) : null}
                <div className="ml-auto flex gap-1">
                  {n.tags.map((t) => (
                    <span key={t} className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{ background: t === 'Positive' ? `${SYNTH.accentEmerald}33` : t === 'Flag' || t === 'Concern' ? `${SYNTH.accentRed}33` : `${SYNTH.cardSky}33`, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                    >{t}</span>
                  ))}
                </div>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{n.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Shared primitives ───────────────────────────────────────────────────────

function Card({ kicker, title, subtitle, children }: { kicker: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl p-4" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{kicker}</p>
      <h3 className="mt-0.5 text-[15px] font-bold leading-tight" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{title}</h3>
      {subtitle ? <p className="mt-0.5 text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{subtitle}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function HeadlineTile({ label, value, sub, accent, pill }: { label: string; value: string; sub: string; accent: string; pill?: boolean }) {
  return (
    <div className="rounded-3xl p-3" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{label}</p>
      {pill
        ? <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider" style={{ background: accent, color: SYNTH.ink, fontFamily: SYNTH.font }}>{value}</span>
        : <p className="mt-0.5 text-[18px] font-bold" style={{ color: accent, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      }
      <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{sub}</p>
    </div>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl px-3 py-2.5" style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{label}</p>
      <p className="mt-0.5 text-[14px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      <p className="text-[10px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{sub}</p>
    </div>
  )
}

function LegendPill({ label, color, on, onToggle }: { label: string; color: string; on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: on ? `${color}26` : 'transparent', border: `1px solid ${on ? color : SYNTH.glassBorder}`, color: on ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: on ? color : SYNTH.glassBorder }} />
      {label}
    </button>
  )
}

function WellnessPill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-3xl p-3 text-center" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{label}</p>
      <p className="mt-0.5 text-[18px] font-bold" style={{ color: accent, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
    </div>
  )
}
