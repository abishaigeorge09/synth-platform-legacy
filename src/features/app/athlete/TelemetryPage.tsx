import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Activity, Zap, Heart } from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { SYNTH } from '../lib/theme'
import { toast } from '../../../shared/store/useToastStore'

// ─── Stub data ───────────────────────────────────────────────────────────────

const STROKE_RATE: { date: string; spm: number; target: number }[] = [
  { date: '4/01', spm: 18, target: 20 },
  { date: '4/03', spm: 20, target: 20 },
  { date: '4/05', spm: 19, target: 20 },
  { date: '4/08', spm: 22, target: 22 },
  { date: '4/10', spm: 21, target: 22 },
  { date: '4/12', spm: 23, target: 22 },
  { date: '4/15', spm: 24, target: 24 },
  { date: '4/17', spm: 22, target: 24 },
  { date: '4/19', spm: 25, target: 24 },
  { date: '4/22', spm: 26, target: 26 },
  { date: '4/24', spm: 24, target: 26 },
  { date: '4/26', spm: 27, target: 26 },
  { date: '4/29', spm: 28, target: 28 },
]

const POWER_OUTPUT: { date: string; watts: number }[] = [
  { date: '4/01', watts: 180 },
  { date: '4/03', watts: 192 },
  { date: '4/05', watts: 185 },
  { date: '4/08', watts: 204 },
  { date: '4/10', watts: 198 },
  { date: '4/12', watts: 211 },
  { date: '4/15', watts: 220 },
  { date: '4/17', watts: 215 },
  { date: '4/19', watts: 228 },
  { date: '4/22', watts: 235 },
  { date: '4/24', watts: 230 },
  { date: '4/26', watts: 241 },
  { date: '4/29', watts: 248 },
]

const HR_ZONES: { zone: string; minutes: number; color: string }[] = [
  { zone: 'Zone 1', minutes: 22, color: '#6366F1' },
  { zone: 'Zone 2', minutes: 48, color: '#10B981' },
  { zone: 'Zone 3', minutes: 31, color: '#F59E0B' },
  { zone: 'Zone 4', minutes: 18, color: '#F97316' },
  { zone: 'Zone 5', minutes: 9, color: '#EF4444' },
]

const SPLIT_CONSISTENCY: { piece: string; split: number; target: number }[] = [
  { piece: 'P1', split: 101.4, target: 101 },
  { piece: 'P2', split: 101.2, target: 101 },
  { piece: 'P3', split: 100.9, target: 101 },
  { piece: 'P4', split: 100.6, target: 101 },
  { piece: 'P5', split: 101.1, target: 101 },
  { piece: 'P6', split: 100.8, target: 101 },
]

function fmtSplit(v: number) {
  const m = Math.floor(v / 60)
  const s = (v - m * 60).toFixed(1)
  return `${m}:${s.padStart(4, '0')}`
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function TelemetryPage() {
  const [range, setRange] = useState<'2w' | '4w' | '8w'>('4w')

  const spmSlice = range === '2w' ? STROKE_RATE.slice(-5) : range === '4w' ? STROKE_RATE.slice(-9) : STROKE_RATE
  const pwrSlice = range === '2w' ? POWER_OUTPUT.slice(-5) : range === '4w' ? POWER_OUTPUT.slice(-9) : POWER_OUTPUT

  return (
    <div
      className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]"
      style={{ background: `linear-gradient(180deg, ${SYNTH.canvasTop} 0%, ${SYNTH.canvasBottom} 100%)`, fontFamily: SYNTH.font }}
    >
      <header
        className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2"
        style={{ color: SYNTH.inkOnBrand }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: SYNTH.inkOnBrandMuted }}>
            synth · athlete
          </p>
          <h1 className="mt-0.5 text-[20px] font-bold leading-tight" style={{ color: SYNTH.inkOnBrand }}>
            Telemetry
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          {(['2w', '4w', '8w'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setRange(k)}
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: range === k ? SYNTH.inkOnBrand : SYNTH.glass,
                border: `1px solid ${range === k ? SYNTH.inkOnBrand : SYNTH.glassBorder}`,
                color: range === k ? SYNTH.ink : SYNTH.inkOnBrandMuted,
                backdropFilter: `blur(${SYNTH.glassBlur}px)`,
                WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px)`,
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-4 px-5 mt-2">

        {/* Summary stat row */}
        <div className="grid grid-cols-3 gap-2">
          <StatTile icon={<Activity size={14} strokeWidth={2.2} />} label="Avg SPM" value="24.2" sub="↑ 1.8 vs last block" accent={SYNTH.cardSky} />
          <StatTile icon={<Zap size={14} strokeWidth={2.2} />} label="Peak watts" value="248W" sub="↑ 12W this month" accent={SYNTH.cardLemon} />
          <StatTile icon={<Heart size={14} strokeWidth={2.2} />} label="Avg HR" value="162" sub="bpm · 84% max" accent={SYNTH.cardPink} />
        </div>

        {/* Stroke rate chart */}
        <TCard kicker="Stroke rate" title="SPM vs target over time">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spmSlice} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.10)" vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.50)' }} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.50)' }} tickLine={false} axisLine={false} domain={[16, 30]} />
                <Tooltip
                  contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }}
                  labelStyle={{ color: SYNTH.inkOnBrandMuted }}
                  formatter={(v, k) => [`${v} spm`, k === 'spm' ? 'Actual' : 'Target']}
                />
                <Line type="monotone" dataKey="target" stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="target" />
                <Line type="monotone" dataKey="spm" stroke={SYNTH.cardSky} strokeWidth={2.2} dot={{ r: 3, fill: SYNTH.cardSky }} name="spm" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-3">
            <LegPill color={SYNTH.cardSky} label="Actual" />
            <LegPill color="rgba(255,255,255,0.35)" label="Target" dashed />
          </div>
        </TCard>

        {/* Power output */}
        <TCard kicker="Power output" title="Watts per session">
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pwrSlice} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
                <defs>
                  <linearGradient id="pwrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SYNTH.cardLemon} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={SYNTH.cardLemon} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.10)" vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.50)' }} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.50)' }} tickLine={false} axisLine={false} domain={[160, 260]} />
                <Tooltip
                  contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }}
                  labelStyle={{ color: SYNTH.inkOnBrandMuted }}
                  formatter={(v) => [`${v}W`, 'Power']}
                />
                <Area type="monotone" dataKey="watts" stroke={SYNTH.cardLemon} strokeWidth={2.2} fill="url(#pwrGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TCard>

        {/* HR zones */}
        <TCard kicker="Heart rate zones" title="Time in zone · last session">
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HR_ZONES} margin={{ top: 8, right: 8, bottom: 4, left: -20 }} barSize={28} barCategoryGap="30%">
                <CartesianGrid stroke="rgba(255,255,255,0.10)" vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="zone" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.50)' }} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.50)' }} tickLine={false} axisLine={false} unit="m" />
                <Tooltip
                  contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }}
                  labelStyle={{ color: SYNTH.inkOnBrandMuted }}
                  formatter={(v) => [`${v} min`, 'Time in zone']}
                />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {HR_ZONES.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {HR_ZONES.map((z) => (
              <LegPill key={z.zone} color={z.color} label={z.zone} />
            ))}
          </div>
        </TCard>

        {/* Split consistency */}
        <TCard kicker="Split consistency" title="Piece-by-piece /500m · last session">
          <div className="space-y-2">
            {SPLIT_CONSISTENCY.map((p) => {
              const diff = p.split - p.target
              const fast = diff < 0
              return (
                <div
                  key={p.piece}
                  className="flex items-center justify-between rounded-2xl px-3 py-2.5"
                  style={{ background: SYNTH.glass, border: `1px solid ${SYNTH.glassBorder}` }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                    {p.piece}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                      {fmtSplit(p.split)}
                    </p>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{
                        background: fast ? `${SYNTH.accentEmerald}33` : `${SYNTH.accentAmber}33`,
                        color: fast ? SYNTH.accentEmerald : SYNTH.accentAmber,
                        fontFamily: SYNTH.font,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {fast ? `${Math.abs(diff).toFixed(1)}s fast` : `+${diff.toFixed(1)}s`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </TCard>

        {/* Generate AI Report — Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl p-5"
          style={{
            background: `linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(59,130,246,0.12) 100%)`,
            border: `1px solid rgba(16,185,129,0.30)`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.accentEmerald, fontFamily: SYNTH.font }}>
                AI analysis
              </p>
              <h3 className="mt-1 text-[16px] font-bold leading-tight" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                Generate telemetry report
              </h3>
              <p className="mt-1 text-[12px] leading-relaxed" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                synth. will synthesise your stroke rate, power, and HR data into a personalised performance breakdown.
              </p>
            </div>
            <span
              className="shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider"
              style={{ background: `${SYNTH.accentAmber}33`, color: SYNTH.accentAmber, fontFamily: SYNTH.font }}
            >
              Soon
            </span>
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
        </motion.div>

      </div>
    </div>
  )
}

// ─── Local primitives ─────────────────────────────────────────────────────────

function TCard({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-3xl p-4"
      style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        {kicker}
      </p>
      <h3 className="mt-0.5 text-[14px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function StatTile({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="rounded-3xl p-3" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <div className="flex items-center gap-1" style={{ color: accent }}>
        {icon}
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
          {label}
        </p>
      </div>
      <p className="mt-1 text-[18px] font-bold" style={{ color: accent, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
      <p className="mt-0.5 text-[9px] leading-snug" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
        {sub}
      </p>
    </div>
  )
}

function LegPill({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-4 rounded-sm"
        style={{ background: dashed ? 'transparent' : color, border: dashed ? `1.5px dashed ${color}` : 'none' }}
      />
      <span className="text-[10px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{label}</span>
    </div>
  )
}
