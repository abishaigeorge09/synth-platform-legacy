import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { TwoPaneChartSheet, type ChartPoint } from '../primitives/TwoPaneChartSheet'
import { SwipeBackPage } from '../primitives/SwipeBackPage'
import { APP_MOCK_ATTENTION, fmtAgo } from '../data/mockTeam'

const SEVERITY_VALUE: Record<'high' | 'med' | 'low', number> = {
  high: 100,
  med: 64,
  low: 32,
}

const SEVERITY_COLOR: Record<'high' | 'med' | 'low', string> = {
  high: SYNTH.accentRed,
  med: SYNTH.accentAmber,
  low: SYNTH.accentEmerald,
}

export function AttentionPage() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string>(APP_MOCK_ATTENTION[0]?.id ?? '')

  const data: ChartPoint[] = useMemo(
    () =>
      APP_MOCK_ATTENTION.map((it) => ({
        key: it.id,
        label: it.initials,
        value: SEVERITY_VALUE[it.severity],
        highlighted: it.id === selectedId,
      })),
    [selectedId],
  )

  const selected = APP_MOCK_ATTENTION.find((it) => it.id === selectedId) ?? APP_MOCK_ATTENTION[0]
  const others = APP_MOCK_ATTENTION.filter((it) => it.id !== selected.id)

  return (
    <SwipeBackPage to="/app/coach/home">
    <TwoPaneChartSheet
      title="Attention"
      subtitle={`${APP_MOCK_ATTENTION.length} flagged today`}
      onBack={() => navigate('/app/coach/home')}
      data={data}
      yFormatter={(v) => `${v}`}
      yDomain={[0, 100]}
      trendLine="Severity vs 7-day baseline · tap a bar"
      onBarClick={(k) => setSelectedId(k)}
    >
      <div className="flex flex-col gap-5">
        <article>
          <div className="flex items-start gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{
                background: SYNTH.sheetMuted,
                color: SYNTH.ink,
                fontFamily: SYNTH.font,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.04em',
              }}
            >
              {selected.initials}
            </span>
            <div className="min-w-0 flex-1">
              <h2
                className="text-[18px] font-bold leading-tight tracking-[-0.01em]"
                style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
              >
                {selected.athleteName}
              </h2>
              <p
                className="mt-1 text-[14px] leading-[1.4]"
                style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
              >
                {selected.signal}
              </p>
              <p
                className="mt-2 text-[10px] uppercase tracking-[0.14em]"
                style={{
                  color: SYNTH.provenanceOnSheet,
                  fontFamily: SYNTH.font,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {selected.source} · synced {fmtAgo(selected.syncedMinutesAgo)}
              </p>
            </div>
            <span
              className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: SEVERITY_COLOR[selected.severity] }}
            />
          </div>

          <button
            type="button"
            onClick={() => navigate(`/app/coach/athlete/${selected.athleteId}`)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold"
            style={{
              background: SYNTH.accentBlack,
              color: SYNTH.inkOnBrand,
              fontFamily: SYNTH.font,
              letterSpacing: '0.02em',
            }}
          >
            Open profile
            <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </article>

        <div>
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Others flagged
          </p>
          <div className="flex flex-col">
            {others.map((it, i) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setSelectedId(it.id)}
                className="flex w-full items-start gap-3 py-3 text-left active:opacity-70"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.sheetMuted}` }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: SYNTH.sheetMuted,
                    color: SYNTH.ink,
                    fontFamily: SYNTH.font,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.04em',
                  }}
                >
                  {it.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[14px] font-semibold leading-tight"
                    style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                  >
                    {it.athleteName}
                  </p>
                  <p
                    className="mt-0.5 line-clamp-1 text-[12px]"
                    style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
                  >
                    {it.signal}
                  </p>
                </div>
                <span
                  className="ml-2 mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full"
                  style={{ background: SEVERITY_COLOR[it.severity] }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </TwoPaneChartSheet>
    </SwipeBackPage>
  )
}
