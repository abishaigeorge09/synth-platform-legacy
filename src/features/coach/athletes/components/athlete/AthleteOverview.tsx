import { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { THEME } from '../../../../../lib/theme'
import { useAthletes } from '../../../../../shared/data/queries'
import { SOURCE_CONFIG, type SourceId } from '../../data/sourceConfig'
import { DEMO_TIMELINE_90_DAY, getDemoAthleteOverview, sourceTooltip } from '../../data/demoData'
import { SessionTimingImprovementPanel } from './SessionTimingImprovementPanel'
import { WellnessHistoryPanel } from './WellnessHistoryPanel'
import { LineupsHistoryPanel } from './LineupsHistoryPanel'

type RangeKey = '7d' | '14d' | '30d' | '90d' | 'season' | 'all'

export function AthleteOverview({ athleteId }: { athleteId: string }) {
  const { data: athletes } = useAthletes()
  const athlete = useMemo(() => athletes.find((a) => a.id === athleteId), [athletes, athleteId])

  const demo = useMemo(() => {
    return getDemoAthleteOverview({
      id: athleteId,
      name: athlete?.name ?? 'Athlete',
      side: (athlete?.side as 'port' | 'starboard' | 'both' | undefined) ?? 'both',
      status: (athlete?.status as 'active' | 'inactive' | 'injured' | undefined) ?? 'active',
      year: (athlete?.year as 'FR' | 'SO' | 'JR' | 'SR' | 'GR' | undefined) ?? 'SO',
    })
  }, [athlete?.name, athlete?.side, athlete?.status, athlete?.year, athleteId])

  const [range, setRange] = useState<RangeKey>('90d')
  const [seriesOn, setSeriesOn] = useState({
    erg: true,
    trainingLoad: true,
    recovery: true,
    gym: false,
    sleep: false,
  })

  const timeline = useMemo(() => {
    const base = DEMO_TIMELINE_90_DAY
    if (range === 'all' || range === 'season') return base
    const n = range === '7d' ? 7 : range === '14d' ? 14 : range === '30d' ? 30 : 90
    return base.slice(Math.max(0, base.length - n))
  }, [range])

  return (
    <div className="px-5 sm:px-10">
      <div className="mx-auto max-w-[1320px] space-y-4">
        <section className="rounded-xl border border-zinc-200 bg-[var(--bg-primary)] p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
              Data quality at a glance
            </div>
            <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
              Where each number comes from + when it last synced.
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {demo.sourceStatus
            .filter((s) => s.sourceId !== 'synth_computed')
            .map((s) => (
              <SourceChip key={s.sourceId} sourceId={s.sourceId} syncedLabel={s.syncedLabel} connected={s.connected} stale={s.stale} />
            ))}
        </div>

        <div className="mt-3 grid gap-2 lg:grid-cols-6">
          <HeadlineTile
            label="2K test"
            value={demo.headline.twoK.value}
            sub={`${demo.headline.twoK.delta}`}
            accent={THEME.blue}
            sourceId={demo.headline.twoK.sourceId}
            syncedLabel={demo.sourceStatus.find((s) => s.sourceId === demo.headline.twoK.sourceId)?.syncedLabel}
          />
          <HeadlineTile
            label="Avg split /500"
            value={demo.headline.avgSplit.value}
            sub={demo.headline.avgSplit.delta}
            accent={THEME.primary}
            sourceId={demo.headline.avgSplit.sourceId}
            syncedLabel={demo.sourceStatus.find((s) => s.sourceId === demo.headline.avgSplit.sourceId)?.syncedLabel}
          />
          <HeadlineTile
            label="Training load"
            value={demo.headline.trainingLoad.value}
            sub={demo.headline.trainingLoad.delta}
            accent={THEME.purple}
            sourceId={demo.headline.trainingLoad.sourceId}
            syncedLabel={demo.sourceStatus.find((s) => s.sourceId === demo.headline.trainingLoad.sourceId)?.syncedLabel}
          />
          <HeadlineTile
            label="Recovery"
            value={demo.headline.recovery.value}
            sub={demo.recovery.concern}
            accent={THEME.cyan}
            sourceId={demo.headline.recovery.sourceId}
            syncedLabel={demo.sourceStatus.find((s) => s.sourceId === demo.headline.recovery.sourceId)?.syncedLabel}
          />
          <HeadlineTile
            label="Injury risk"
            value={demo.headline.injuryRisk.level}
            sub={demo.headline.injuryRisk.factors[0] ?? ''}
            accent={THEME.primary}
            pill
            sourceId="synth_computed"
            syncedLabel={demo.sourceStatus.find((s) => s.sourceId === 'synth_computed')?.syncedLabel}
          />
          <HeadlineTile
            label="Data quality"
            value={demo.headline.dataQuality.value}
            sub={`${demo.headline.dataQuality.connectedSources}/${demo.headline.dataQuality.connectedSources} sources · freshness ${demo.headline.dataQuality.freshness}`}
            accent={THEME.textPrimary}
            bar
            sourceId="synth_computed"
            syncedLabel={demo.sourceStatus.find((s) => s.sourceId === 'synth_computed')?.syncedLabel}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-[var(--bg-primary)] p-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                Performance synthesis
              </div>
              <div className="mt-1 text-[15px] font-semibold text-zinc-900">90-day performance timeline</div>
              <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
                Toggle series to understand what changed (fitness vs load vs recovery).
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['7d', '14d', '30d', '90d', 'season', 'all'] as RangeKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setRange(k)}
                  className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    borderColor: THEME.border,
                    background: range === k ? `${THEME.primary}14` : 'var(--bg-primary)',
                    color: range === k ? THEME.primary : THEME.textMuted,
                    fontFamily: THEME.fontMono,
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 12, right: 18, bottom: 8, left: 10 }}>
                <CartesianGrid stroke={THEME.border} vertical={false} strokeDasharray="2 4" />
                <XAxis
                  dataKey="date"
                  stroke={THEME.textMuted}
                  tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="left"
                  stroke={THEME.textMuted}
                  tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={THEME.textMuted}
                  tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
                  tickLine={false}
                  axisLine={false}
                  domain={[96, 106]}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-primary)',
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 10,
                    fontFamily: THEME.fontMono,
                    fontSize: 11,
                  }}
                />
                {seriesOn.erg && <Line yAxisId="right" type="monotone" dataKey="ergSplitSec" stroke={THEME.blue} strokeWidth={2.2} dot={false} name="Erg split" />}
                {seriesOn.trainingLoad && (
                  <Line yAxisId="left" type="monotone" dataKey="trainingLoad" stroke={THEME.primary} strokeWidth={2.2} dot={false} name="Training load" />
                )}
                {seriesOn.recovery && <Line yAxisId="left" type="monotone" dataKey="recovery" stroke={THEME.cyan} strokeWidth={2.2} dot={false} name="Recovery" />}
                {seriesOn.gym && <Line yAxisId="left" type="monotone" dataKey="gymVolume" stroke={THEME.purple} strokeWidth={2.0} dot={false} name="Gym volume" />}
                {seriesOn.sleep && <Line yAxisId="left" type="monotone" dataKey="sleepHours" stroke={THEME.amber} strokeWidth={2.0} dot={false} name="Sleep hours" />}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <LegendPill label="Erg splits" on={seriesOn.erg} color={THEME.blue} onToggle={() => setSeriesOn((s) => ({ ...s, erg: !s.erg }))} />
            <LegendPill label="Training load" on={seriesOn.trainingLoad} color={THEME.primary} onToggle={() => setSeriesOn((s) => ({ ...s, trainingLoad: !s.trainingLoad }))} />
            <LegendPill label="Recovery" on={seriesOn.recovery} color={THEME.cyan} onToggle={() => setSeriesOn((s) => ({ ...s, recovery: !s.recovery }))} />
            <LegendPill label="Gym volume" on={seriesOn.gym} color={THEME.purple} onToggle={() => setSeriesOn((s) => ({ ...s, gym: !s.gym }))} />
            <LegendPill label="Sleep hours" on={seriesOn.sleep} color={THEME.amber} onToggle={() => setSeriesOn((s) => ({ ...s, sleep: !s.sleep }))} />
          </div>
        </section>

        <RecoveryCard demo={demo} />
        <GymCard demo={demo} />
        <CoachNotesCard notes={demo.voiceNotes} athleteName={demo.athlete.name} />
        <ScheduleCard items={demo.schedule} conflict={demo.scheduleConflict} />

        <div className="lg:col-span-2">
          <SessionTimingImprovementPanel athleteId={athleteId} />
        </div>
        <WellnessHistoryPanel athleteId={athleteId} />
        <LineupsHistoryPanel athleteId={athleteId} />

        <div className="lg:col-span-2">
          <div className="sticky bottom-4 z-20">
            <AddDataBar athleteName={demo.athlete.name} />
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

function LegendPill({ label, color, on, onToggle }: { label: string; color: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        borderColor: THEME.border,
        background: on ? `${color}14` : 'var(--bg-primary)',
        color: on ? color : THEME.textMuted,
        fontFamily: THEME.fontMono,
      }}
    >
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: on ? color : THEME.border }} />
      {label}
    </button>
  )
}

function HeadlineTile({
  label,
  value,
  accent,
  sub,
  pill,
  bar,
  sourceId,
  syncedLabel,
}: {
  label: string
  value: string
  accent: string
  sub: string
  pill?: boolean
  bar?: boolean
  sourceId: SourceId
  syncedLabel?: string
}) {
  const src = SOURCE_CONFIG[sourceId]
  return (
    <div className="rounded-xl border bg-[var(--bg-primary)] p-3" style={{ borderColor: THEME.border }}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          {label}
        </div>
        <span
          title={sourceTooltip(sourceId, syncedLabel)}
          className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
          style={{ background: `${src.color}18`, color: src.color, fontFamily: THEME.fontMono }}
        >
          {src.label}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        {pill ? (
          <span className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ background: `${accent}14`, color: accent, fontFamily: THEME.fontMono }}>
            {value}
          </span>
        ) : (
          <div className="text-[18px] font-bold" style={{ fontFamily: THEME.fontMono, color: accent }}>
            {value}
          </div>
        )}
      </div>
      <div className="mt-1 text-[11px] leading-snug" style={{ color: THEME.textSecondary }}>
        {sub}
      </div>
      {bar ? (
        <div className="mt-2 h-1.5 w-full rounded-full" style={{ background: THEME.light }}>
          <div className="h-1.5 rounded-full" style={{ width: '92%', background: THEME.primary }} />
        </div>
      ) : null}
    </div>
  )
}

function SourceChip({
  sourceId,
  syncedLabel,
  connected,
  stale,
}: {
  sourceId: SourceId
  syncedLabel: string
  connected: boolean
  stale: boolean
}) {
  const s = SOURCE_CONFIG[sourceId]
  return (
    <span
      title={sourceTooltip(sourceId, syncedLabel)}
      className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px]"
      style={{
        borderColor: THEME.border,
        background: 'var(--bg-primary)',
        color: connected ? THEME.textPrimary : THEME.textMuted,
        fontFamily: THEME.fontSans,
      }}
    >
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: connected ? s.color : THEME.border }} />
      <span className="font-semibold">{s.label}</span>
      <span style={{ color: stale ? THEME.amber : THEME.textMuted, fontFamily: THEME.fontMono, fontSize: 10 }}>
        {syncedLabel}
      </span>
      {!connected && (
        <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider" style={{ background: `${THEME.textMuted}12`, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
          disconnected
        </span>
      )}
      {connected && stale && (
        <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider" style={{ background: `${THEME.amber}14`, color: THEME.amber, fontFamily: THEME.fontMono }}>
          stale
        </span>
      )}
    </span>
  )
}

function RecoveryCard({ demo }: { demo: ReturnType<typeof getDemoAthleteOverview> }) {
  const d = demo.recoveryDetails
  const hrvDeltaPct = ((d.hrvMs - d.hrvBaselineMs) / d.hrvBaselineMs) * 100
  const hrDeltaPct = ((d.restingHrBpm - d.restingHrBaselineBpm) / d.restingHrBaselineBpm) * 100
  return (
    <section className="rounded-xl border border-zinc-200 bg-[var(--bg-primary)] p-4">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
          Recovery
        </div>
        <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
          Sleep + HRV + resting HR rolled into one readiness view.
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniStat label="Recovery score" value={`${d.recoveryScore}/100`} sub={`Strain ${d.strain.toFixed(1)}`} />
        <MiniStat label="Sleep" value={`${d.sleepLastNightHours.toFixed(1)}h (${d.sleepQualityPct}%)`} sub="7-day avg TBD" />
        <MiniStat label="HRV" value={`${d.hrvMs}ms`} sub={`Baseline ${d.hrvBaselineMs}ms (${hrvDeltaPct.toFixed(1)}%)`} />
        <MiniStat label="Resting HR" value={`${d.restingHrBpm} bpm`} sub={`Baseline ${d.restingHrBaselineBpm} (${hrDeltaPct.toFixed(1)}%)`} />
      </div>

      <div className="mt-2 rounded-lg border px-3 py-2 text-[12px]" style={{ borderColor: THEME.border, background: `${THEME.amber}12`, color: THEME.textPrimary }}>
        {demo.recovery.concern}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <SmallPill label={`Body Battery: ${d.bodyBattery}/100`} />
        <SmallPill label={`Readiness: ${d.readiness}`} />
        <SmallPill label={`Temp dev: ${d.tempDeviationC >= 0 ? '+' : ''}${d.tempDeviationC.toFixed(1)}°C`} />
        <SmallPill label={`Stages: D ${d.stages.deepHrs.toFixed(1)}h, R ${d.stages.remHrs.toFixed(1)}h`} />
      </div>

      <div className="mt-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
          Wellness check-ins
        </div>
        <div className="mt-2 space-y-1">
          {demo.wellnessCheckins.map((c) => (
            <div key={c.date} className="flex items-center justify-between rounded-lg border px-3 py-2 text-[12px]" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
              <span className="font-semibold" style={{ color: THEME.textPrimary }}>
                {c.date}
              </span>
              <span style={{ color: THEME.textSecondary }}>Soreness {c.soreness}/10</span>
              <span style={{ color: THEME.textSecondary }}>Energy {c.energy}/10</span>
              <span style={{ color: THEME.textSecondary }}>Mood {c.mood}/10</span>
              <span style={{ color: THEME.textSecondary }}>Sleep {c.sleep}/10</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function GymCard({ demo }: { demo: ReturnType<typeof getDemoAthleteOverview> }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-[var(--bg-primary)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
            Training load breakdown
          </div>
          <div className="mt-1 text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
            Gym + plan adherence
          </div>
          <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
            Strength sessions, key lifts, and planned vs completed training load.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold" style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
            {demo.gym.compliance}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {demo.gym.sessions.map((s) => {
          const src = SOURCE_CONFIG[s.sourceId]
          return (
            <div key={s.date} className="rounded-lg border px-3 py-2" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold" style={{ color: THEME.textPrimary }}>
                  {s.date} · <span style={{ color: src.color }}>{src.label}</span>
                </div>
              </div>
              <div className="mt-1 text-[11px]" style={{ color: THEME.textSecondary }}>
                {s.summary}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {demo.gym.keyLifts.map((k) => (
          <div key={k.lift} className="rounded-lg border px-3 py-2" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
              {k.lift}
            </div>
            <div className="mt-1 text-[16px] font-bold" style={{ color: THEME.textPrimary, fontFamily: THEME.fontMono }}>
              {k.value}
            </div>
            <div className="text-[11px]" style={{ color: THEME.textSecondary }}>
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1 text-[11px]" style={{ color: THEME.textSecondary }}>
        <div>Planned: {demo.trainingPeaks.planned}</div>
        <div>Completed: {demo.trainingPeaks.completed}</div>
        <div style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          TSS {demo.trainingPeaks.tss}/{demo.trainingPeaks.plannedTss} · CTL {demo.trainingPeaks.ctl} · ATL {demo.trainingPeaks.atl} · TSB {demo.trainingPeaks.tsb}
        </div>
        {demo.strava.slice(0, 2).map((s) => (
          <div key={s} style={{ color: THEME.textMuted }}>
            {s}
          </div>
        ))}
      </div>
    </section>
  )
}

function CoachNotesCard({ notes, athleteName }: { notes: Array<{ date: string; transcript: string; extracted: string; tags: string[] }>; athleteName: string }) {
  const [draft, setDraft] = useState('')
  return (
    <section className="rounded-xl border border-zinc-200 bg-[var(--bg-primary)] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
        Coach notes & voice memos
      </div>
      <div className="mt-1 text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
        Reverse-chronological observations
      </div>
      <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
        Fast context that doesn’t show up in metrics (technique, selection, flags).
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Add note for ${athleteName.split(' ')[0]}…`}
          className="h-9 flex-1 rounded-lg border px-3 text-[12px] outline-none"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary }}
        />
        <button
          type="button"
          className="h-9 rounded-lg border px-3 text-[11px] font-semibold"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textSecondary, fontFamily: THEME.fontMono }}
        >
          Mic
        </button>
        <button
          type="button"
          onClick={() => setDraft('')}
          className="h-9 rounded-lg px-4 text-[11px] font-semibold"
          style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
        >
          Add
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {notes.map((n) => (
          <div key={n.date} className="flex items-start gap-2 rounded-lg border px-3 py-2" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
            <span className="mt-0.5 text-[12px]" style={{ color: THEME.textMuted }}>
              ▶
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold" style={{ color: THEME.textPrimary }}>
                {n.date} — <span style={{ color: THEME.textSecondary }}>{n.extracted}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function AddDataBar({ athleteName }: { athleteName: string }) {
  const [text, setText] = useState('')
  return (
    <section
      className="rounded-xl border border-zinc-200 bg-[var(--bg-primary)]/95 p-4 backdrop-blur"
      style={{ boxShadow: '0 18px 40px -30px rgba(24,24,27,0.45)' }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
        Erg / notes
      </div>
      <div className="mt-1 text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
        Add data for {athleteName.split(' ')[0]}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text for AI parsing…"
          className="h-9 flex-1 min-w-[260px] rounded-lg border px-3 text-[12px] outline-none"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary }}
        />
        <button type="button" className="h-9 rounded-lg border px-3 text-[11px] font-semibold" style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
          Mic note
        </button>
        <button type="button" className="h-9 rounded-lg border px-3 text-[11px] font-semibold" style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
          Photo upload
        </button>
        <button
          type="button"
          onClick={() => setText('')}
          className="h-9 rounded-lg px-4 text-[11px] font-semibold"
          style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
        >
          Parse
        </button>
      </div>
    </section>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
      <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
        {label}
      </div>
      <div className="mt-1 text-[14px] font-bold" style={{ color: THEME.textPrimary, fontFamily: THEME.fontMono }}>
        {value}
      </div>
      <div className="text-[11px]" style={{ color: THEME.textSecondary }}>
        {sub}
      </div>
    </div>
  )
}

function SmallPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border px-2.5 py-1 text-[10px]" style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textSecondary, fontFamily: THEME.fontMono }}>
      {label}
    </span>
  )
}

function ScheduleCard({ items, conflict }: { items: Array<{ date: string; items: string; flagged: boolean }>; conflict: string }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-[var(--bg-primary)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">Schedule</div>
          <div className="mt-1 text-[15px] font-semibold text-zinc-900">Next 5 days</div>
          <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary, fontFamily: THEME.fontSans }}>
            {conflict}
          </div>
          <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
            Upcoming practices, races, rest days, and conflicts.
          </div>
        </div>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${SOURCE_CONFIG.google_calendar.color}18`, color: SOURCE_CONFIG.google_calendar.color, fontFamily: THEME.fontMono }}>
          {SOURCE_CONFIG.google_calendar.label}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((d) => (
          <div
            key={d.date}
            className="rounded-lg border px-3 py-2"
            style={{
              borderColor: THEME.border,
              background: d.flagged ? `${THEME.amber}12` : THEME.light,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
                {d.date}
              </span>
              {d.flagged ? (
                <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider" style={{ background: `${THEME.amber}18`, color: THEME.amber, fontFamily: THEME.fontMono }}>
                  flagged
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-[12px]" style={{ color: THEME.textPrimary }}>
              {d.items}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
