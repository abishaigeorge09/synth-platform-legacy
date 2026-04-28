import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { SYNTH } from '../lib/theme'

export type RangeKey = 'D' | 'W' | 'M'

export type ChartPoint = {
  key: string
  label: string
  value: number
  highlighted?: boolean
}

type Props = {
  title: string
  subtitle?: string
  onBack?: () => void
  range?: RangeKey
  onRangeChange?: (range: RangeKey) => void
  data: ChartPoint[]
  yFormatter?: (v: number) => string
  yDomain?: [number | 'auto' | 'dataMin', number | 'auto' | 'dataMax']
  trendLine?: string
  onBarClick?: (key: string) => void
  children: ReactNode
}

export function TwoPaneChartSheet({
  title,
  subtitle,
  onBack,
  range,
  onRangeChange,
  data,
  yFormatter,
  yDomain,
  trendLine,
  onBarClick,
  children,
}: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-start gap-3 px-5 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        {onBack ? <BackButton onClick={onBack} /> : <div className="h-10 w-10 shrink-0" />}
        <div className="min-w-0 flex-1 pt-1">
          <h1
            className="truncate text-[22px] font-bold leading-tight tracking-[-0.01em]"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              className="text-[11px] uppercase tracking-[0.16em]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {range && onRangeChange ? <RangeToggle value={range} onChange={onRangeChange} /> : null}
      </header>

      {trendLine ? (
        <p
          className="px-5 pb-1 text-[11px] uppercase tracking-[0.14em]"
          style={{ color: SYNTH.provenanceOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
        >
          {trendLine}
        </p>
      ) : null}

      <div className="px-2 pt-2" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 12, bottom: 10, left: 0 }}>
            <XAxis
              dataKey="label"
              tick={{
                fill: 'rgba(255,255,255,0.55)',
                fontSize: 10,
                fontFamily: SYNTH.font,
              }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{
                fill: 'rgba(255,255,255,0.45)',
                fontSize: 10,
                fontFamily: SYNTH.font,
              }}
              tickLine={false}
              axisLine={false}
              width={42}
              domain={yDomain ?? ['auto', 'auto']}
              tickFormatter={(v) => (yFormatter ? yFormatter(v as number) : String(v))}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: SYNTH.canvasInk,
                border: `1px solid ${SYNTH.glassBorder}`,
                borderRadius: 12,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                fontSize: 12,
              }}
              formatter={(v: number) => (yFormatter ? yFormatter(v) : v)}
              labelStyle={{ color: SYNTH.inkOnBrandMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em' }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              onClick={(payload) => onBarClick?.(payload.key as string)}
            >
              {data.map((d) => (
                <Cell
                  key={d.key}
                  fill={d.highlighted ? SYNTH.inkOnBrand : 'rgba(255,255,255,0.32)'}
                  cursor={onBarClick ? 'pointer' : 'default'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <motion.section
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="synth-scroll relative mt-3 flex flex-1 flex-col overflow-y-auto"
        style={{
          background: SYNTH.sheet,
          borderRadius: `${SYNTH.radius.sheet}px ${SYNTH.radius.sheet}px 0 0`,
          padding: '8px 20px 140px',
          boxShadow: SYNTH.shadow.sheet,
          color: SYNTH.ink,
          fontFamily: SYNTH.font,
        }}
      >
        <div
          className="mx-auto mt-1 mb-4 h-1 w-10 rounded-full"
          style={{ background: SYNTH.sheetMuted }}
        />
        {children}
      </motion.section>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        border: `1px solid ${SYNTH.glassBorder}`,
        color: SYNTH.inkOnBrand,
      }}
    >
      <ChevronLeft size={18} strokeWidth={2.2} />
    </button>
  )
}

function RangeToggle({ value, onChange }: { value: RangeKey; onChange: (r: RangeKey) => void }) {
  const ranges: RangeKey[] = ['D', 'W', 'M']
  return (
    <div
      className="flex items-center gap-0.5 rounded-full p-1"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      {ranges.map((r) => {
        const active = value === r
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{
              background: active ? SYNTH.glassActive : 'transparent',
              color: active ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted,
              fontFamily: SYNTH.font,
              letterSpacing: '0.05em',
              border: active ? `1px solid ${SYNTH.glassBorder}` : '1px solid transparent',
            }}
          >
            {r}
          </button>
        )
      })}
    </div>
  )
}
