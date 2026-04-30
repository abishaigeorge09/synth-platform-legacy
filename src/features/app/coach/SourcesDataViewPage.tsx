import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { SourcesSegmentedSwitch } from '../primitives/SourcesSegmentedSwitch'
import { ConnectorLogo } from '../primitives/ConnectorLogo'
import { SYNTH } from '../lib/theme'
import {
  CONCEPT2_ROWS,
  INFERENCE_LOG,
  SHEETS_ROWS,
  SOURCE_HEALTH,
  STRAVA_ACTIVITIES,
  TEAM_ROSTER,
  VOICE_NOTES,
  type DataViewTabId,
} from '../../coach/sources/data/demoConnectorsData'
import { SEED_GYM_SESSIONS } from '../../../shared/data/seeds'

// ─── Tabs ──────────────────────────────────────────────────────────────────

type Tab = { id: DataViewTabId; label: string; color: string; connectorId?: string }

const TABS: Tab[] = [
  { id: 'workflow', label: 'Workflow', color: '#A8DBF5' },
  { id: 'concept2', label: 'Concept2', color: '#1A1A2E', connectorId: 'concept2' },
  { id: 'strava', label: 'Strava', color: '#FC4C02', connectorId: 'strava' },
  { id: 'apple-health', label: 'Apple Health', color: '#FF2D55', connectorId: 'apple-health' },
  { id: 'whoop', label: 'WHOOP', color: '#000000', connectorId: 'whoop' },
  { id: 'bridge', label: 'Bridge', color: '#4A90D9', connectorId: 'bridge' },
  { id: 'trainingpeaks', label: 'TrainingPeaks', color: '#1E5BAA', connectorId: 'trainingpeaks' },
  { id: 'google-calendar', label: 'Calendar', color: '#4285F4', connectorId: 'google-calendar' },
  { id: 'garmin', label: 'Garmin', color: '#007CC3', connectorId: 'garmin' },
  { id: 'oura', label: 'Oura', color: '#1A1A1A', connectorId: 'oura' },
  { id: 'google-sheets', label: 'Sheets', color: '#0F9D58', connectorId: 'sheets' },
  { id: 'coach-notes', label: 'Notes', color: '#8B5CF6' },
  { id: 'ai-import', label: 'AI Import', color: '#8B5CF6' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtShort(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

export function SourcesDataViewPage() {
  const [tab, setTab] = useState<DataViewTabId>('workflow')
  const [athleteId, setAthleteId] = useState<string>('all')
  const tabStripRef = useRef<HTMLDivElement | null>(null)

  const highlightAthleteName = useMemo(() => {
    if (athleteId === 'all') return null
    return TEAM_ROSTER.find((a) => a.id === athleteId)?.name ?? null
  }, [athleteId])

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-safe-tab">
      <CoachPageHeader title="Sources" subtitle="Data view" back="/app/coach/home" />
      <SourcesSegmentedSwitch />

      {/* Athlete chip row — horizontal scroll */}
      <div className="mt-3">
        <div
          className="synth-scroll flex items-center gap-2 overflow-x-auto px-5 pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          <AthleteChip
            label="All athletes"
            active={athleteId === 'all'}
            onClick={() => setAthleteId('all')}
          />
          {TEAM_ROSTER.map((a) => (
            <AthleteChip
              key={a.id}
              label={a.name.split(' ')[0]}
              active={athleteId === a.id}
              onClick={() => setAthleteId(a.id)}
            />
          ))}
        </div>
      </div>

      {/* Tab strip — colored dot + label, underline indicator */}
      <div
        ref={tabStripRef}
        className="synth-scroll flex items-center overflow-x-auto px-5 pb-3"
        style={{
          scrollbarWidth: 'none',
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap py-2 pr-4 text-[13px] font-semibold transition-opacity"
              style={{
                color: active ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted,
                fontFamily: SYNTH.font,
                opacity: active ? 1 : 0.85,
                borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: t.color }}
              />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Filter banner */}
      {highlightAthleteName ? (
        <div
          className="mx-5 mt-3 flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{
            background: 'rgba(16,185,129,0.18)',
            border: `1px solid rgba(16,185,129,0.4)`,
          }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: SYNTH.accentEmerald }}
          />
          <span
            className="text-[12px] font-semibold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            Filtered to {highlightAthleteName}
          </span>
          <button
            type="button"
            onClick={() => setAthleteId('all')}
            className="ml-auto text-[11px] font-semibold"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Clear
          </button>
        </div>
      ) : null}

      {/* Content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="px-5 pt-4"
      >
        {tab === 'workflow' && <WorkflowTab />}
        {tab === 'concept2' && <Concept2Tab highlight={highlightAthleteName} />}
        {tab === 'strava' && <StravaTab highlight={highlightAthleteName} />}
        {tab === 'apple-health' && <AppleHealthTab />}
        {tab === 'whoop' && <WhoopTab />}
        {tab === 'bridge' && <BridgeTab />}
        {tab === 'trainingpeaks' && <TrainingPeaksTab />}
        {tab === 'google-calendar' && <CalendarTab />}
        {tab === 'garmin' && <EmptyTab name="Garmin" />}
        {tab === 'oura' && <EmptyTab name="Oura" />}
        {tab === 'google-sheets' && <SheetsTab highlight={highlightAthleteName} />}
        {tab === 'coach-notes' && <CoachNotesTab />}
        {tab === 'ai-import' && <AiImportTab />}
      </motion.div>
    </div>
  )
}

// ─── Athlete chip ──────────────────────────────────────────────────────────

function AthleteChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap"
      style={{
        background: active ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.08)',
        color: active ? SYNTH.ink : SYNTH.inkOnBrand,
        fontFamily: SYNTH.font,
        border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.16)'}`,
      }}
    >
      {label}
    </button>
  )
}

// ─── Shared row primitives ─────────────────────────────────────────────────

function StatusPill({ status }: { status: 'healthy' | 'stale' | 'failed' | 'pending' }) {
  const map: Record<typeof status, { bg: string; color: string; label: string }> = {
    healthy: { bg: 'rgba(16,185,129,0.18)', color: '#34D399', label: 'Healthy' },
    stale: { bg: 'rgba(243,158,92,0.18)', color: '#F59E0B', label: 'Stale' },
    failed: { bg: 'rgba(230,74,60,0.18)', color: '#FCA5A5', label: 'Failed' },
    pending: { bg: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)', label: 'Pending' },
  }
  const { bg, color, label } = map[status]
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
      style={{ background: bg, color, fontFamily: SYNTH.font }}
    >
      {label}
    </span>
  )
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: SYNTH.inlineCard,
        border: `1px solid ${SYNTH.inlineCardBorder}`,
        borderLeft: accent ? `3px solid ${accent}` : `1px solid ${SYNTH.inlineCardBorder}`,
      }}
    >
      {children}
    </div>
  )
}

function SourceHero({
  connectorId,
  status,
  records,
  lastSyncAt,
}: {
  connectorId: string
  status: 'healthy' | 'stale' | 'failed' | 'pending'
  records?: number
  lastSyncAt?: string
}) {
  const meta = TABS.find((t) => t.connectorId === connectorId)
  return (
    <div
      className="mb-3 flex items-center gap-3 rounded-2xl p-3"
      style={{
        background: SYNTH.inlineCard,
        border: `1px solid ${SYNTH.inlineCardBorder}`,
      }}
    >
      <ConnectorLogo id={connectorId} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="text-[14px] font-bold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {meta?.label}
          </span>
          <StatusPill status={status} />
        </div>
        {(records !== undefined || lastSyncAt) && (
          <p
            className="mt-0.5 text-[11px]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
          >
            {records !== undefined ? `${records.toLocaleString()} records` : ''}
            {records !== undefined && lastSyncAt ? ' · ' : ''}
            {lastSyncAt ? `last sync ${fmtShort(lastSyncAt)}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Workflow tab ──────────────────────────────────────────────────────────

function WorkflowTab() {
  return (
    <div className="space-y-4">
      <div>
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Source health
        </p>
        <div className="flex flex-col gap-2">
          {SOURCE_HEALTH.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-2xl p-3"
              style={{
                background: SYNTH.inlineCard,
                border: `1px solid ${SYNTH.inlineCardBorder}`,
              }}
            >
              <ConnectorLogo id={s.id} size={28} />
              <div className="min-w-0 flex-1">
                <p
                  className="text-[13px] font-semibold leading-tight"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {s.name}
                </p>
                <p
                  className="text-[10px] uppercase tracking-[0.12em]"
                  style={{
                    color: SYNTH.inkOnBrandMuted,
                    fontFamily: SYNTH.font,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {s.records} records · {fmtShort(s.lastSyncAt)}
                </p>
              </div>
              <StatusPill status={s.status} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p
          className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Inference log
        </p>
        <div className="flex flex-col gap-2">
          {INFERENCE_LOG.map((l) => (
            <Card
              key={l.id}
              accent={
                l.status === 'success'
                  ? SYNTH.accentEmerald
                  : l.status === 'warning'
                    ? SYNTH.accentAmber
                    : SYNTH.accentRed
              }
            >
              <div className="flex items-start justify-between gap-3">
                <p
                  className="text-[13px] font-semibold leading-snug"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {l.title}
                </p>
                <span
                  className="text-[10px]"
                  style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
                >
                  {fmtShort(l.at)}
                </span>
              </div>
              <p
                className="mt-1 text-[12px] leading-snug"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {l.detail}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Concept2 ──────────────────────────────────────────────────────────────

function Concept2Tab({ highlight }: { highlight: string | null }) {
  const rows = highlight ? CONCEPT2_ROWS.filter((r) => r.athlete === highlight) : CONCEPT2_ROWS
  return (
    <div className="space-y-3">
      <SourceHero
        connectorId="concept2"
        status="healthy"
        records={982}
        lastSyncAt="2026-04-24T12:08:00Z"
      />
      {rows.length === 0 ? (
        <EmptyState message="No Concept2 records for this athlete." />
      ) : (
        rows.map((r) => (
          <Card key={r.athlete + r.date} accent="#FF6A2F">
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-[15px] font-bold"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {r.athlete}
                </p>
                <p
                  className="mt-0.5 text-[11px] uppercase tracking-[0.12em]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  {r.testType} · {r.date}
                </p>
              </div>
              {r.isPr ? (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                  style={{
                    background: 'rgba(16,185,129,0.18)',
                    color: '#34D399',
                    fontFamily: SYNTH.font,
                  }}
                >
                  PR
                </span>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              <Stat label="Split" value={r.split} />
              <Stat label="Watts" value={String(r.watts)} />
              <Stat label="SPM" value={String(r.strokeRate)} />
              <Stat label="Distance" value={r.distance.replace(',000m', 'k')} />
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-2 py-2"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      <p
        className="text-[9px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        {label}
      </p>
      <p
        className="mt-0.5 text-[14px] font-bold leading-tight"
        style={{
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
    </div>
  )
}

// ─── Strava ────────────────────────────────────────────────────────────────

function StravaTab({ highlight }: { highlight: string | null }) {
  const rows = highlight
    ? STRAVA_ACTIVITIES.filter((a) => a.athlete === highlight)
    : STRAVA_ACTIVITIES
  return (
    <div className="space-y-3">
      <SourceHero
        connectorId="strava"
        status="stale"
        records={416}
        lastSyncAt="2026-04-23T19:21:00Z"
      />
      {rows.length === 0 ? (
        <EmptyState message="No Strava activity for this athlete." />
      ) : (
        rows.map((a) => (
          <Card key={a.id} accent="#FC4C02">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                >
                  {a.athlete}
                </p>
                <p
                  className="mt-0.5 text-[11px]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  {a.type} · {a.at}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-[16px] font-bold"
                  style={{
                    color: SYNTH.inkOnBrand,
                    fontFamily: SYNTH.font,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {a.distanceKm} <span className="text-[10px] font-medium">km</span>
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                >
                  {a.duration} · {a.pace}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[11px]">
              {a.avgHr ? (
                <span
                  style={{
                    color: a.avgHr > 165 ? '#FCA5A5' : a.avgHr > 155 ? SYNTH.accentAmber : '#34D399',
                    fontFamily: SYNTH.font,
                  }}
                >
                  ♥ {a.avgHr}
                </span>
              ) : null}
              <span style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                Effort {a.effort}/10
              </span>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

// ─── Apple Health ──────────────────────────────────────────────────────────

const APPLE_SLEEP = [7.2, 6.8, 7.4, 7.1, 5.8, 7.5, 7.3, 6.9, 7.2, 7.0, 7.4, 6.5, 8.1, 7.3]
const APPLE_HRV = [52, 48, 51, 47, 44, 55, 53, 49, 48, 50, 46, 44, 52, 48]
const APPLE_RHR = [53, 54, 52, 55, 57, 51, 52, 54, 55, 53, 56, 58, 51, 52]

function AppleHealthTab() {
  return (
    <div className="space-y-3">
      <SourceHero
        connectorId="apple-health"
        status="healthy"
        records={2201}
        lastSyncAt="2026-04-24T11:40:00Z"
      />
      <Card accent="#FF2D55">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Sleep · 14 days
        </p>
        <Sparkline data={APPLE_SLEEP} type="bars" min={4} max={9} accent="#FF2D55" />
      </Card>
      <Card accent="#FF2D55">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          HRV · 14 days
        </p>
        <Sparkline data={APPLE_HRV} type="line" min={40} max={60} accent="#FF2D55" />
      </Card>
      <Card accent="#FF2D55">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Resting HR · 14 days
        </p>
        <Sparkline data={APPLE_RHR} type="line" min={48} max={62} accent="#06B6D4" />
      </Card>
    </div>
  )
}

function Sparkline({
  data,
  type,
  min,
  max,
  accent,
}: {
  data: number[]
  type: 'line' | 'bars'
  min: number
  max: number
  accent: string
}) {
  const w = 320
  const h = 80
  const range = max - min || 1
  if (type === 'bars') {
    const bw = w / data.length - 2
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {data.map((v, i) => {
          const bh = ((v - min) / range) * (h - 4)
          return (
            <rect
              key={i}
              x={i * (w / data.length) + 1}
              y={h - bh}
              width={bw}
              height={bh}
              rx={2}
              fill={accent}
              opacity={0.9}
            />
          )
        })}
      </svg>
    )
  }
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ')
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── WHOOP ─────────────────────────────────────────────────────────────────

function WhoopTab() {
  return (
    <div className="space-y-3">
      <SourceHero connectorId="whoop" status="failed" lastSyncAt="2026-04-24T03:11:00Z" />
      <Card accent={SYNTH.accentRed}>
        <p
          className="text-[14px] font-semibold"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          Token expired Apr 24, 3:11 AM
        </p>
        <p
          className="mt-1 text-[12px]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Reconnect from the desktop dashboard to resume sync.
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Recovery', value: '72%' },
          { label: 'HRV', value: '48ms' },
          { label: 'Resting HR', value: '52bpm' },
          { label: 'Sleep', value: '7.1h' },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-2xl p-3"
            style={{
              background: SYNTH.inlineCard,
              border: `1px solid ${SYNTH.inlineCardBorder}`,
            }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              {m.label}
            </p>
            <p
              className="mt-1 text-[20px] font-bold"
              style={{
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                filter: 'blur(4px)',
                opacity: 0.7,
              }}
            >
              {m.value}
            </p>
            <p
              className="mt-0.5 text-[10px]"
              style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
            >
              reconnect to view
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bridge ────────────────────────────────────────────────────────────────

function BridgeTab() {
  const sessions = SEED_GYM_SESSIONS.slice(0, 3)
  return (
    <div className="space-y-3">
      <SourceHero
        connectorId="bridge"
        status="healthy"
        records={188}
        lastSyncAt="2026-04-24T10:03:00Z"
      />
      {sessions.map((s) => (
        <Card key={s.id} accent="#4A90D9">
          <div className="flex items-start justify-between">
            <p
              className="text-[14px] font-semibold capitalize"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {s.athleteId.replace('athlete-', '').replace(/-/g, ' ')}
            </p>
            <span
              className="text-[10px]"
              style={{
                color: SYNTH.inkOnBrandMuted,
                fontFamily: SYNTH.font,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.sessionDate} · {s.durationMin}m
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            {s.exercises.map((ex) => (
              <div key={ex.name} className="flex items-center justify-between text-[12px]">
                <span style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{ex.name}</span>
                <span
                  style={{
                    color: SYNTH.inkOnBrandMuted,
                    fontFamily: SYNTH.font,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {ex.sets}×{ex.reps}{ex.weight > 0 ? ` @ ${ex.weight}lb` : ''}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── TrainingPeaks ─────────────────────────────────────────────────────────

const TP_PLAN = [
  { day: 'Mon', planned: '60m SS', actual: '62m', done: true },
  { day: 'Tue', planned: '45m AT', actual: '44m', done: true },
  { day: 'Wed', planned: 'Rest', actual: 'Rest', done: true },
  { day: 'Thu', planned: '5×500m', actual: '5×500m', done: true },
  { day: 'Fri', planned: 'Shakeout', actual: null, done: false },
  { day: 'Sat', planned: 'RACE DAY', actual: null, done: false },
]

function TrainingPeaksTab() {
  const donePct = Math.round((TP_PLAN.filter((d) => d.done).length / TP_PLAN.length) * 100)
  return (
    <div className="space-y-3">
      <SourceHero connectorId="trainingpeaks" status="pending" />
      <Card accent={SYNTH.accentAmber}>
        <p
          className="text-[14px] font-semibold"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          Integration pending
        </p>
        <p
          className="mt-1 text-[12px]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Configure TrainingPeaks from the desktop dashboard. Once connected,
          you'll see TSS · CTL · ATL load metrics, planned vs actual workouts,
          and HR-zone distribution per session.
        </p>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            Weekly compliance
          </p>
          <p
            className="text-[12px] font-bold"
            style={{
              color: '#34D399',
              fontFamily: SYNTH.font,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {donePct}%
          </p>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full"
          style={{ background: 'rgba(255,255,255,0.10)' }}
        >
          <div
            style={{
              width: `${donePct}%`,
              height: '100%',
              background: SYNTH.accentEmerald,
              borderRadius: 9999,
            }}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {TP_PLAN.map((d) => (
            <div
              key={d.day}
              className="rounded-xl p-2 text-center"
              style={{
                background: d.done ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${d.done ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.10)'}`,
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.1em]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {d.day}
              </p>
              <p
                className="mt-1 text-[11px]"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {d.planned}
              </p>
              {d.actual ? (
                <p
                  className="text-[10px] font-bold"
                  style={{ color: '#34D399', fontFamily: SYNTH.font }}
                >
                  {d.actual}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Calendar ──────────────────────────────────────────────────────────────

const CAL_EVENTS = [
  { day: 'Mon Apr 21', items: [{ time: '6:00 AM', title: 'Practice — Race Pace', color: '#34D399' }, { time: '4:00 PM', title: 'Gym S&C', color: '#60A5FA' }] },
  { day: 'Tue Apr 22', items: [{ time: '6:00 AM', title: 'Practice — Steady State', color: '#34D399' }] },
  { day: 'Wed Apr 23', items: [{ time: '', title: 'Rest day', color: 'rgba(255,255,255,0.4)' }] },
  { day: 'Thu Apr 24', items: [{ time: '6:00 AM', title: 'Race Prep Pieces', color: '#34D399' }, { time: '4:00 PM', title: 'Gym S&C', color: '#60A5FA' }] },
  { day: 'Fri Apr 25', items: [{ time: '6:00 AM', title: 'Shakeout Row', color: '#34D399' }] },
]

function CalendarTab() {
  return (
    <div className="space-y-3">
      <SourceHero
        connectorId="google-calendar"
        status="healthy"
        lastSyncAt="2026-04-24T11:55:00Z"
      />
      <div className="flex flex-col gap-2">
        {CAL_EVENTS.map((d) => (
          <Card key={d.day}>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              {d.day}
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {d.items.map((ev, i) => (
                <div
                  key={i}
                  className="rounded-lg px-2.5 py-1.5"
                  style={{
                    background: `${ev.color}1F`,
                    borderLeft: `2px solid ${ev.color}`,
                  }}
                >
                  {ev.time ? (
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
                    >
                      {ev.time}
                    </span>
                  ) : null}
                  <p
                    className="text-[12px] font-semibold"
                    style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
                  >
                    {ev.title}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <div
        className="flex items-center gap-3 rounded-2xl p-4"
        style={{
          background: 'rgba(16,185,129,0.12)',
          border: `1px solid rgba(16,185,129,0.3)`,
        }}
      >
        <div
          className="flex h-12 w-14 flex-col items-center justify-center rounded-xl"
          style={{ background: 'rgba(16,185,129,0.18)', border: `1px solid ${SYNTH.accentEmerald}` }}
        >
          <p
            className="text-[9px] font-bold uppercase tracking-[0.12em]"
            style={{ color: '#34D399', fontFamily: SYNTH.font }}
          >
            Apr
          </p>
          <p
            className="text-[16px] font-bold"
            style={{ color: '#34D399', fontFamily: SYNTH.font, lineHeight: 1 }}
          >
            26
          </p>
        </div>
        <div>
          <p
            className="text-[14px] font-bold"
            style={{ color: '#34D399', fontFamily: SYNTH.font }}
          >
            PACIFIC INVITE REGATTA
          </p>
          <p
            className="text-[11px]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            5:45 AM call · Briones Reservoir, Orinda CA
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Coach notes ───────────────────────────────────────────────────────────

function CoachNotesTab() {
  return (
    <div className="space-y-3">
      {VOICE_NOTES.map((n) => (
        <Card key={n.id} accent="#8B5CF6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className="text-[14px] font-semibold"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {n.athlete}
              </p>
              <p
                className="text-[11px]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {n.at}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {n.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    background: 'rgba(139,92,246,0.18)',
                    color: '#C4B5FD',
                    fontFamily: SYNTH.font,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <p
            className="mt-2 text-[12px] leading-relaxed"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {n.transcript}
          </p>
          {n.extracted.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {n.extracted.map((e) => (
                <span
                  key={e}
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: 'rgba(16,185,129,0.18)',
                    color: '#6EE7B7',
                    fontFamily: SYNTH.font,
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  )
}

// ─── AI import ─────────────────────────────────────────────────────────────

const AI_IMPORTS = [
  { id: 'aim-1', sourceType: 'Email attachment', extracted: 'Erg scores for 8 athletes from Apr 19 test', athlete: 'Team-wide', status: 'imported' as const },
  { id: 'aim-2', sourceType: 'PDF race program', extracted: 'Pacific Invite start list · 1V draw at lane 3', athlete: 'Team-wide', status: 'imported' as const },
  { id: 'aim-3', sourceType: 'Image (whiteboard photo)', extracted: 'Workout intervals: 4×8min at 2:02 w/ 4min rest', athlete: 'All', status: 'pending' as const },
]

function AiImportTab() {
  return (
    <div className="space-y-3">
      {AI_IMPORTS.map((item) => (
        <Card key={item.id} accent="#8B5CF6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {item.sourceType}
              </p>
              <p
                className="mt-1 text-[13px] font-semibold leading-snug"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {item.extracted}
              </p>
              <p
                className="mt-1 text-[11px]"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                Matched: {item.athlete}
              </p>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
              style={
                item.status === 'imported'
                  ? { background: 'rgba(16,185,129,0.18)', color: '#34D399', fontFamily: SYNTH.font }
                  : { background: 'rgba(243,158,92,0.18)', color: SYNTH.accentAmber, fontFamily: SYNTH.font }
              }
            >
              {item.status}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── Sheets ────────────────────────────────────────────────────────────────

function SheetsTab({ highlight }: { highlight: string | null }) {
  const rows = highlight ? SHEETS_ROWS.filter((r) => r.athlete === highlight) : SHEETS_ROWS
  return (
    <div className="space-y-3">
      <SourceHero
        connectorId="sheets"
        status="healthy"
        records={1240}
        lastSyncAt="2026-04-24T12:12:00Z"
      />
      {rows.length === 0 ? (
        <EmptyState message="No sheet rows for this athlete." />
      ) : (
        rows.map((r) => (
          <Card key={r.id} accent="#0F9D58">
            <div className="flex items-start justify-between">
              <p
                className="text-[14px] font-semibold"
                style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
              >
                {r.athlete}
              </p>
              <span
                className="text-[10px] font-mono"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                {r.date} · {r.session}
              </span>
            </div>
            <p
              className="mt-1 text-[10px] uppercase tracking-[0.12em]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              {r.type}
            </p>
            <p
              className="mt-2 text-[12px]"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              {r.notes}
            </p>
          </Card>
        ))
      )}
    </div>
  )
}

// ─── Empty / placeholder ───────────────────────────────────────────────────

function EmptyTab({ name }: { name: string }) {
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl p-6 text-center"
      style={{
        background: SYNTH.inlineCard,
        border: `1px solid ${SYNTH.inlineCardBorder}`,
      }}
    >
      <p
        className="text-[14px] font-semibold"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {name} not connected
      </p>
      <p
        className="text-[12px]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        Connect {name} from the desktop dashboard to view data here.
      </p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl p-6 text-center"
      style={{
        background: SYNTH.inlineCard,
        border: `1px solid ${SYNTH.inlineCardBorder}`,
      }}
    >
      <p
        className="text-[12px]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        {message}
      </p>
    </div>
  )
}
