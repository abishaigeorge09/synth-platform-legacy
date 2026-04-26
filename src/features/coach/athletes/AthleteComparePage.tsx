import { useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { THEME } from '../../../lib/theme'
import { TRANSITIONS } from '../../../lib/motion'
import {
  useAthletes,
  useErgScores,
  useAthleteWellness,
  useAthleteYoy,
} from '../../../shared/data/queries'
import { PageHeader } from '../dashboard/components/PageHeader'

function fmtSplit(sec?: number) {
  if (sec === undefined || !Number.isFinite(sec)) return '—'
  const m = Math.floor(sec / 60)
  const s = (sec - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

function fmtTime(sec?: number) {
  if (sec === undefined || !Number.isFinite(sec)) return '—'
  const m = Math.floor(sec / 60)
  const s = (sec - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SavedNote = {
  id: string
  text: string
  timestamp: string
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AthleteComparePage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const aId = params.get('a') ?? ''
  const bId = params.get('b') ?? ''

  const { data: athletes } = useAthletes()
  const { data: ergScores } = useErgScores()

  const athleteA = useMemo(() => athletes.find((a) => a.id === aId) ?? null, [athletes, aId])
  const athleteB = useMemo(() => athletes.find((a) => a.id === bId) ?? null, [athletes, bId])
  const ergA = useMemo(() => ergScores.find((e) => e.athleteId === aId) ?? null, [ergScores, aId])
  const ergB = useMemo(() => ergScores.find((e) => e.athleteId === bId) ?? null, [ergScores, bId])

  const setAthlete = (slot: 'a' | 'b', id: string) => {
    const next = new URLSearchParams(params)
    next.set(slot, id)
    setParams(next, { replace: true })
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="Compare"
        title="Two athletes"
        subtitle="Erg, wellness, and profile"
      />

      {/* Selectors */}
      <div className="flex flex-wrap items-center gap-4 px-5 pb-6 sm:px-10">
        <AthleteSelector
          label="Athlete A"
          value={aId}
          athletes={athletes}
          excludeId={bId}
          onChange={(id) => setAthlete('a', id)}
        />
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full border text-[14px] font-bold"
          style={{ borderColor: THEME.border, color: THEME.textMuted, fontFamily: THEME.fontMono }}
        >
          vs
        </div>
        <AthleteSelector
          label="Athlete B"
          value={bId}
          athletes={athletes}
          excludeId={aId}
          onChange={(id) => setAthlete('b', id)}
        />
        <button
          type="button"
          onClick={() => navigate('/coach/athletes')}
          className="ml-auto rounded-md border px-3 py-2 text-[11px] uppercase tracking-wider transition-colors hover:bg-zinc-50"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary, borderColor: THEME.border }}
        >
          ← Back to roster
        </button>
      </div>

      {(!athleteA || !athleteB) && (
        <div className="mx-5 sm:mx-10 rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: THEME.border, background: THEME.light }}>
          <div className="text-[13px]" style={{ color: THEME.textSecondary }}>
            Select two athletes above to see a side-by-side comparison.
          </div>
        </div>
      )}

      {athleteA && athleteB && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={TRANSITIONS.springSnappy}
          className="grid gap-5 px-5 sm:px-10"
        >
          {/* Profile row */}
          <div className="grid gap-4 md:grid-cols-2">
            <ProfileCard athlete={athleteA} color={THEME.primary} />
            <ProfileCard athlete={athleteB} color={THEME.blue} />
          </div>

          {/* Erg comparison */}
          <CompareSection title="2K Erg Scores">
            {/* Bar chart */}
            {ergA && ergB && (
              <ErgBarChart
                ergA={ergA}
                ergB={ergB}
                nameA={athleteA.name}
                nameB={athleteB.name}
              />
            )}

            {/* Head-to-head dots row */}
            {ergA && ergB && (
              <HeadToHeadDots
                ergA={ergA}
                ergB={ergB}
                nameA={athleteA.name}
                nameB={athleteB.name}
              />
            )}

            {/* Per-athlete cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <ErgCard erg={ergA} color={THEME.primary} name={athleteA.name} />
              <ErgCard erg={ergB} color={THEME.blue} name={athleteB.name} />
            </div>
            {ergA && ergB && <ErgDelta ergA={ergA} ergB={ergB} nameA={athleteA.name} nameB={athleteB.name} />}
          </CompareSection>

          {/* Wellness comparison */}
          <WellnessCompare aId={aId} bId={bId} nameA={athleteA.name} nameB={athleteB.name} />

          {/* YoY comparison */}
          <YoyCompare aId={aId} bId={bId} nameA={athleteA.name} nameB={athleteB.name} />

          {/* Coach Note */}
          <CoachNoteSection nameA={athleteA.name} nameB={athleteB.name} />
        </motion.div>
      )}
    </div>
  )
}

// ─── Erg bar chart ────────────────────────────────────────────────────────────

type ErgData = {
  timeSeconds: number
  splitSeconds?: number
  watts?: number
  spm?: number
  date: string
}

function ErgBarChart({
  ergA,
  ergB,
  nameA,
  nameB,
}: {
  ergA: ErgData
  ergB: ErgData
  nameA: string
  nameB: string
}) {
  // Build chart data — 3 grouped sets
  const chartData = [
    {
      metric: '2K Time (s)',
      A: ergA.timeSeconds,
      B: ergB.timeSeconds,
    },
    {
      metric: 'Split /500 (s)',
      A: ergA.splitSeconds ?? 0,
      B: ergB.splitSeconds ?? 0,
    },
    {
      metric: 'Watts',
      A: ergA.watts ?? 0,
      B: ergB.watts ?? 0,
    },
  ]

  // For the time/split groups lower is better, so reversed axis applies only when
  // we're showing a single metric. Since we group three different units in one
  // chart we disable reversed and let Recharts auto-scale per value.
  const formatTick = (v: number) => {
    if (v === 0) return '0'
    return v >= 100 ? `${Math.round(v)}` : fmtSplit(v)
  }

  return (
    <div
      className="mb-4 rounded-2xl border p-5"
      style={{ borderColor: THEME.border, background: THEME.white }}
    >
      <div
        className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Erg metrics — side by side
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
          barCategoryGap="30%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} vertical={false} />
          <XAxis
            dataKey="metric"
            tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textSecondary }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatTick}
            tick={{ fontSize: 10, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
            axisLine={false}
            tickLine={false}
            width={46}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const label = name === 'A' ? nameA : nameB
              // watts group has values >= 100; others are seconds
              return value >= 100 ? [`${value}`, label] : [fmtSplit(value), label]
            }}
            contentStyle={{
              background: THEME.white,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              fontSize: 11,
              fontFamily: THEME.fontMono,
            }}
          />
          <Legend
            formatter={(value) => (value === 'A' ? nameA : nameB)}
            wrapperStyle={{ fontSize: 11, fontFamily: THEME.fontMono }}
          />
          <Bar dataKey="A" name="A" fill={THEME.primary} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="B" name="B" fill={THEME.blue} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Head-to-head dots ────────────────────────────────────────────────────────

function HeadToHeadDots({
  ergA,
  ergB,
  nameA,
  nameB,
}: {
  ergA: ErgData
  ergB: ErgData
  nameA: string
  nameB: string
}) {
  // Lower time/split is better; higher watts is better
  const timeWinner: 'A' | 'B' | null =
    ergA.timeSeconds < ergB.timeSeconds ? 'A' : ergA.timeSeconds > ergB.timeSeconds ? 'B' : null
  const splitWinner: 'A' | 'B' | null =
    (ergA.splitSeconds ?? 0) < (ergB.splitSeconds ?? 0)
      ? 'A'
      : (ergA.splitSeconds ?? 0) > (ergB.splitSeconds ?? 0)
        ? 'B'
        : null
  const wattsWinner: 'A' | 'B' | null =
    (ergA.watts ?? 0) > (ergB.watts ?? 0)
      ? 'A'
      : (ergA.watts ?? 0) < (ergB.watts ?? 0)
        ? 'B'
        : null

  const metrics: { label: string; winner: 'A' | 'B' | null }[] = [
    { label: '2K', winner: timeWinner },
    { label: 'Split', winner: splitWinner },
    { label: 'Watts', winner: wattsWinner },
  ]

  return (
    <div
      className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border px-4 py-3"
      style={{ borderColor: THEME.border, background: THEME.light }}
    >
      <span
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Head-to-head
      </span>
      {metrics.map(({ label, winner }) => (
        <span
          key={label}
          className="flex items-center gap-1.5 text-[11px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          <span>{label}</span>
          {winner !== null ? (
            <>
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: THEME.primary }}
              />
              <span style={{ color: winner === 'A' ? THEME.primary : THEME.blue }}>
                {winner === 'A' ? nameA : nameB} wins
              </span>
            </>
          ) : (
            <span style={{ color: THEME.textMuted }}>tied</span>
          )}
        </span>
      ))}
    </div>
  )
}

// ─── Coach note section ───────────────────────────────────────────────────────

function CoachNoteSection({ nameA, nameB }: { nameA: string; nameB: string }) {
  const [draft, setDraft] = useState('')
  const [notes, setNotes] = useState<SavedNote[]>([])

  const handleSave = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    const note: SavedNote = {
      id: `note-${Date.now()}`,
      text: trimmed,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    }
    setNotes((prev) => [note, ...prev])
    setDraft('')
  }

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <CompareSection title="Coach Note">
      <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: THEME.white }}>
        <div
          className="mb-2 text-[11px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          {nameA} vs {nameB}
        </div>

        {/* Textarea */}
        <textarea
          rows={5}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note about this comparison..."
          className="w-full resize-none rounded-xl border px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-emerald-400"
          style={{
            borderColor: THEME.border,
            background: THEME.light,
            color: THEME.textPrimary,
            fontFamily: THEME.fontSans,
          }}
        />

        {/* Save button */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={!draft.trim()}
            className="rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-opacity disabled:opacity-40"
            style={{
              background: THEME.primary,
              fontFamily: THEME.fontMono,
            }}
          >
            Save note
          </button>
        </div>

        {/* Saved notes list */}
        {notes.length > 0 && (
          <div className="mt-5">
            <div
              className="mb-3 text-[9px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              Saved notes
            </div>
            <div className="grid gap-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border p-4"
                  style={{ borderColor: THEME.border, background: THEME.light }}
                >
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: THEME.textPrimary, fontFamily: THEME.fontSans }}
                  >
                    {note.text}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className="text-[10px]"
                      style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                    >
                      {note.timestamp}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="text-[10px] transition-colors hover:text-red-500"
                      style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CompareSection>
  )
}

// ─── Existing sub-components (unchanged) ─────────────────────────────────────

function AthleteSelector({
  label,
  value,
  athletes,
  excludeId,
  onChange,
}: {
  label: string
  value: string
  athletes: { id: string; name: string; year?: string; side?: string }[]
  excludeId: string
  onChange: (id: string) => void
}) {
  return (
    <div>
      <div
        className="mb-1 text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border px-3 py-2.5 text-[12px] outline-none"
        style={{
          borderColor: THEME.border,
          background: THEME.white,
          color: THEME.textPrimary,
          fontFamily: THEME.fontMono,
          minWidth: 200,
        }}
      >
        <option value="">Pick an athlete…</option>
        {athletes
          .filter((a) => a.id !== excludeId)
          .map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.year ?? '—'} · {a.side ?? '—'}
            </option>
          ))}
      </select>
    </div>
  )
}

function ProfileCard({
  athlete,
  color,
}: {
  athlete: { name: string; year?: string; side?: string; status: string; weightLbs?: number }
  color: string
}) {
  const statusColor =
    athlete.status === 'active' ? THEME.primary : athlete.status === 'injured' ? THEME.red : THEME.textMuted
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: THEME.white }}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold"
          style={{ background: `${color}15`, color, fontFamily: THEME.fontMono }}
        >
          {athlete.name.charAt(0)}
        </div>
        <div>
          <div className="text-[15px] font-semibold" style={{ color: THEME.textPrimary }}>
            {athlete.name}
          </div>
          <div className="flex items-center gap-2 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
            <span>{athlete.year ?? '—'}</span>
            <span>·</span>
            <span>{athlete.side ?? '—'}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
              {athlete.status}
            </span>
            {athlete.weightLbs && (
              <>
                <span>·</span>
                <span>{athlete.weightLbs} lbs</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CompareSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function ErgCard({
  erg,
  color,
  name,
}: {
  erg: { timeSeconds: number; splitSeconds?: number; spm?: number; watts?: number; date: string } | null
  color: string
  name: string
}) {
  if (!erg) {
    return (
      <div className="rounded-2xl border border-dashed p-5" style={{ borderColor: THEME.border, background: THEME.light }}>
        <div className="text-[12px]" style={{ color: THEME.textSecondary }}>
          No erg data for {name}.
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: THEME.white }}>
      <div className="mb-3 text-[12px] font-semibold" style={{ color }}>
        {name}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="2K Time" value={fmtTime(erg.timeSeconds)} />
        <Metric label="Split /500" value={fmtSplit(erg.splitSeconds)} />
        <Metric label="SPM" value={erg.spm ? `${erg.spm}` : '—'} />
        <Metric label="Watts" value={erg.watts ? `${erg.watts}` : '—'} />
      </div>
      <div className="mt-3 text-[10px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
        Tested {erg.date}
      </div>
    </div>
  )
}

function ErgDelta({
  ergA,
  ergB,
  nameA,
  nameB,
}: {
  ergA: { timeSeconds: number; splitSeconds?: number; watts?: number }
  ergB: { timeSeconds: number; splitSeconds?: number; watts?: number }
  nameA: string
  nameB: string
}) {
  const timeDelta = ergA.timeSeconds - ergB.timeSeconds
  const splitDelta = (ergA.splitSeconds ?? 0) - (ergB.splitSeconds ?? 0)
  const wattsDelta = (ergA.watts ?? 0) - (ergB.watts ?? 0)

  const faster = timeDelta < 0 ? nameA : timeDelta > 0 ? nameB : null

  return (
    <div
      className="mt-3 rounded-xl border p-4"
      style={{ borderColor: THEME.border, background: THEME.light }}
    >
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Head-to-head
      </div>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <DeltaCell label="2K Gap" value={`${Math.abs(timeDelta).toFixed(1)}s`} favors={faster} />
        <DeltaCell
          label="Split Gap"
          value={`${Math.abs(splitDelta).toFixed(1)}s`}
          favors={splitDelta < 0 ? nameA : splitDelta > 0 ? nameB : null}
        />
        <DeltaCell
          label="Watts Gap"
          value={`${Math.abs(wattsDelta)}W`}
          favors={wattsDelta > 0 ? nameA : wattsDelta < 0 ? nameB : null}
        />
      </div>
    </div>
  )
}

function DeltaCell({ label, value, favors }: { label: string; value: string; favors: string | null }) {
  return (
    <div className="rounded-xl border px-3 py-2.5" style={{ borderColor: THEME.border, background: THEME.white }}>
      <div
        className="text-[8px] font-semibold uppercase tracking-[0.16em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </div>
      <div className="mt-1 text-[14px] font-semibold" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
        {value}
      </div>
      {favors && (
        <div className="mt-0.5 text-[9px]" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
          {favors} leads
        </div>
      )}
    </div>
  )
}

function WellnessCompare({
  aId,
  bId,
  nameA,
  nameB,
}: {
  aId: string
  bId: string
  nameA: string
  nameB: string
}) {
  const { data: wellnessA } = useAthleteWellness(aId)
  const { data: wellnessB } = useAthleteWellness(bId)

  const avgA = useMemo(() => avgWellness(wellnessA), [wellnessA])
  const avgB = useMemo(() => avgWellness(wellnessB), [wellnessB])

  return (
    <CompareSection title="Wellness (14-day avg)">
      <div className="grid gap-4 md:grid-cols-2">
        <WellnessCard name={nameA} color={THEME.primary} avg={avgA} />
        <WellnessCard name={nameB} color={THEME.blue} avg={avgB} />
      </div>
    </CompareSection>
  )
}

type WellnessAvg = {
  sleep: number
  energy: number
  soreness: number
  mood: number
  hrv: number
  recovery: number
}

function avgWellness(
  items: { sleepHours?: number; energy?: number; soreness?: number; mood?: number; hrv?: number; recovery?: number }[],
): WellnessAvg {
  const n = items.length || 1
  return {
    sleep: items.reduce((s, w) => s + (w.sleepHours ?? 0), 0) / n,
    energy: items.reduce((s, w) => s + (w.energy ?? 0), 0) / n,
    soreness: items.reduce((s, w) => s + (w.soreness ?? 0), 0) / n,
    mood: items.reduce((s, w) => s + (w.mood ?? 0), 0) / n,
    hrv: items.reduce((s, w) => s + (w.hrv ?? 0), 0) / n,
    recovery: items.reduce((s, w) => s + (w.recovery ?? 0), 0) / n,
  }
}

function WellnessCard({ name, color, avg }: { name: string; color: string; avg: WellnessAvg }) {
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: THEME.white }}>
      <div className="mb-3 text-[12px] font-semibold" style={{ color }}>
        {name}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Sleep" value={`${avg.sleep.toFixed(1)}h`} />
        <Metric label="Energy" value={`${avg.energy.toFixed(1)}/10`} />
        <Metric label="Soreness" value={`${avg.soreness.toFixed(1)}/10`} />
        <Metric label="Mood" value={`${avg.mood.toFixed(1)}/10`} />
        <Metric label="HRV" value={`${Math.round(avg.hrv)}`} />
        <Metric label="Recovery" value={`${Math.round(avg.recovery)}%`} />
      </div>
    </div>
  )
}

function YoyCompare({
  aId,
  bId,
  nameA,
  nameB,
}: {
  aId: string
  bId: string
  nameA: string
  nameB: string
}) {
  const { data: yoyA } = useAthleteYoy(aId)
  const { data: yoyB } = useAthleteYoy(bId)

  if (!yoyA && !yoyB) return null

  return (
    <CompareSection title="Year-over-Year Progress">
      <div className="grid gap-4 md:grid-cols-2">
        <YoyCard name={nameA} color={THEME.primary} yoy={yoyA} />
        <YoyCard name={nameB} color={THEME.blue} yoy={yoyB} />
      </div>
    </CompareSection>
  )
}

function YoyCard({
  name,
  color,
  yoy,
}: {
  name: string
  color: string
  yoy: { sec2025: number; sec2026: number; deltaSec: number } | null
}) {
  if (!yoy) {
    return (
      <div className="rounded-2xl border border-dashed p-5" style={{ borderColor: THEME.border, background: THEME.light }}>
        <div className="text-[12px]" style={{ color: THEME.textSecondary }}>
          No YoY data for {name}.
        </div>
      </div>
    )
  }
  const improved = yoy.deltaSec < 0
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: THEME.white }}>
      <div className="mb-3 text-[12px] font-semibold" style={{ color }}>
        {name}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Metric label="2025 2K" value={fmtTime(yoy.sec2025)} />
        <Metric label="2026 2K" value={fmtTime(yoy.sec2026)} />
        <Metric
          label="Delta"
          value={`${improved ? '↓' : '↑'} ${Math.abs(yoy.deltaSec).toFixed(1)}s`}
          valueColor={improved ? THEME.primary : THEME.red}
        />
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div className="rounded-xl border px-3 py-2.5" style={{ borderColor: THEME.border, background: THEME.light }}>
      <div
        className="text-[8px] font-semibold uppercase tracking-[0.16em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-[14px] font-semibold"
        style={{ fontFamily: THEME.fontMono, color: valueColor ?? THEME.textPrimary }}
      >
        {value}
      </div>
    </div>
  )
}
