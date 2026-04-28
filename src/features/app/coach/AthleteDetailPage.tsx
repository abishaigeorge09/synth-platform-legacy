import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Sparkles, MessageSquare } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { TwoPaneChartSheet, type RangeKey, type ChartPoint } from '../primitives/TwoPaneChartSheet'
import { SwipeBackPage } from '../primitives/SwipeBackPage'
import {
  APP_MOCK_ATHLETES,
  buildErgHistory,
  fmtErgTime,
  fmtAgo,
} from '../data/mockTeam'

export function AthleteDetailPage() {
  const navigate = useNavigate()
  const { athleteId } = useParams<{ athleteId: string }>()
  const [range, setRange] = useState<RangeKey>('W')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const athlete = useMemo(
    () => APP_MOCK_ATHLETES.find((a) => a.id === athleteId) ?? APP_MOCK_ATHLETES[0],
    [athleteId],
  )
  const history = useMemo(() => buildErgHistory(athlete.id), [athlete.id])
  const sliced = useMemo(() => {
    if (range === 'D') return history.slice(-3)
    if (range === 'W') return history.slice(-7)
    return history
  }, [history, range])

  const data: ChartPoint[] = useMemo(() => {
    const last = sliced[sliced.length - 1]
    return sliced.map((p) => ({
      key: p.date,
      label: p.date,
      value: p.seconds,
      highlighted: selectedKey ? p.date === selectedKey : p.date === last.date,
    }))
  }, [sliced, selectedKey])

  const selectedPoint = useMemo(() => {
    const lookupKey = selectedKey ?? sliced[sliced.length - 1].date
    return sliced.find((p) => p.date === lookupKey) ?? sliced[sliced.length - 1]
  }, [sliced, selectedKey])

  const lastSeconds = sliced[sliced.length - 1].seconds
  const prev = sliced[sliced.length - 2]?.seconds ?? lastSeconds
  const delta = lastSeconds - prev
  const deltaText = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}s vs prev`

  return (
    <SwipeBackPage>
    <TwoPaneChartSheet
      title={athlete.name}
      subtitle={athlete.position}
      onBack={() => navigate(-1)}
      range={range}
      onRangeChange={setRange}
      data={data}
      yFormatter={(v) => fmtErgTime(v)}
      yDomain={['dataMin', 'dataMax']}
      trendLine={`2K ERG · ${deltaText} · ${athlete.primarySource}, ${fmtAgo(athlete.lastSyncMinutes)}`}
      onBarClick={(k) => setSelectedKey(k)}
    >
      <div className="flex flex-col">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkMuted }}
        >
          {selectedPoint.date} · selected
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span
            className="text-[44px] font-bold leading-none tracking-[-0.02em]"
            style={{ color: SYNTH.ink, fontVariantNumeric: 'tabular-nums' }}
          >
            {fmtErgTime(selectedPoint.seconds)}
          </span>
          <span
            className="text-[12px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: SYNTH.inkMuted }}
          >
            2K
          </span>
        </div>
        <p
          className="mt-2 text-[11px] uppercase tracking-[0.14em]"
          style={{ color: SYNTH.provenanceOnSheet, fontVariantNumeric: 'tabular-nums' }}
        >
          {athlete.primarySource} PM5 · synced {fmtAgo(athlete.lastSyncMinutes)} · raw
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <SheetStat label="Best 2K" value={fmtErgTime(athlete.twoKBestSeconds)} />
          <SheetStat label="Recovery" value={`${athlete.recoveryScore}`} />
          <SheetStat label="Streak" value={`${athlete.streakDays}d`} />
        </div>

        <div
          className="mt-5 rounded-2xl px-4 py-3"
          style={{ background: SYNTH.sheetMuted, color: SYNTH.inkMuted }}
        >
          <p className="text-[12px] leading-[1.5]" style={{ fontFamily: SYNTH.font }}>
            <span style={{ color: SYNTH.ink, fontWeight: 600 }}>synth.</span> notes — split slipped 4.3s
            in the last 4-week block. Likely cause: 3 nights of poor sleep (WHOOP).
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/app/coach/ai?athlete=${athlete.id}`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold"
            style={{
              background: SYNTH.accentBlack,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              letterSpacing: '0.02em',
            }}
          >
            <Sparkles size={14} strokeWidth={2.4} />
            Ask synth.
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/coach/notes')}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border py-3 text-[13px] font-semibold"
            style={{
              background: SYNTH.sheet,
              borderColor: SYNTH.sheetMuted,
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
              letterSpacing: '0.02em',
            }}
          >
            <MessageSquare size={14} strokeWidth={2.2} />
            Note
          </button>
        </div>
      </div>
    </TwoPaneChartSheet>
    </SwipeBackPage>
  )
}

function SheetStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-2xl px-3 py-3"
      style={{ background: SYNTH.sheetMuted }}
    >
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        {label}
      </span>
      <span
        className="text-[18px] font-bold tracking-[-0.01em]"
        style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </span>
    </div>
  )
}
