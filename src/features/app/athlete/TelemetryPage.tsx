import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Activity, Zap, Heart, Settings } from 'lucide-react'
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
import { motion } from 'framer-motion'
import { SYNTH } from '../lib/theme'
import { toast } from '../../../shared/store/useToastStore'

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

export function TelemetryPage() {
  const navigate = useNavigate()
  const [range, setRange] = useState<'2w' | '4w' | 'all'>('4w')
  const spmSlice = range === '2w' ? TELEM_STROKE.slice(-4) : range === '4w' ? TELEM_STROKE.slice(-6) : TELEM_STROKE
  const pwrSlice = range === '2w' ? TELEM_POWER.slice(-4) : range === '4w' ? TELEM_POWER.slice(-6) : TELEM_POWER

  return (
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
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            synth · athlete
          </p>
          <h1 className="mt-0.5 text-[20px] font-bold leading-tight">Telemetry</h1>
        </div>
        <button
          type="button"
          aria-label="Settings"
          onClick={() => navigate('/app/athlete/settings')}
          className="flex h-9 items-center gap-1.5 rounded-full px-3"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <Settings size={14} strokeWidth={2.2} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="mt-4 flex flex-col gap-4 px-5"
      >
        {/* Range selector */}
        <div className="flex items-center gap-1.5">
          {(['2w', '4w', 'all'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setRange(k)}
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: range === k ? SYNTH.inkOnBrand : 'transparent',
                border: `1px solid ${range === k ? SYNTH.inkOnBrand : SYNTH.glassBorder}`,
                color: range === k ? SYNTH.ink : SYNTH.inkOnBrandMuted,
                fontFamily: SYNTH.font,
              }}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Activity size={13} strokeWidth={2.2} />, label: 'Avg SPM', value: '24.2', sub: '↑ 1.8 vs prev', accent: SYNTH.cardSky },
            { icon: <Zap size={13} strokeWidth={2.2} />, label: 'Peak watts', value: '248W', sub: '↑ 12W month', accent: SYNTH.cardLemon },
            { icon: <Heart size={13} strokeWidth={2.2} />, label: 'Avg HR', value: '162', sub: 'bpm · 84% max', accent: SYNTH.cardPink },
          ].map((t) => (
            <div
              key={t.label}
              className="rounded-3xl p-3"
              style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
            >
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
                  <linearGradient id="telPagePwrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SYNTH.cardLemon} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={SYNTH.cardLemon} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.55)' }} tickLine={false} axisLine={false} domain={[160, 260]} />
                <Tooltip contentStyle={{ background: SYNTH.canvasInk, border: `1px solid ${SYNTH.glassBorder}`, borderRadius: 12, fontSize: 11, color: SYNTH.inkOnBrand }} labelStyle={{ color: SYNTH.inkOnBrandMuted }} formatter={(v) => [`${v}W`, 'Power']} />
                <Area type="monotone" dataKey="watts" stroke={SYNTH.cardLemon} strokeWidth={2.2} fill="url(#telPagePwrGrad)" dot={false} />
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
                    <p className="text-[13px] font-bold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}>
                      {fmtTelemSplit(p.split)}
                    </p>
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ background: fast ? `${SYNTH.accentEmerald}33` : `${SYNTH.accentAmber}33`, color: fast ? SYNTH.accentEmerald : SYNTH.accentAmber, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
                    >{fast ? `${Math.abs(diff).toFixed(1)}s fast` : `+${diff.toFixed(1)}s`}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* AI report CTA */}
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
                synth. will synthesise your stroke rate, power, and HR data into a personalised performance breakdown.
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
      </motion.div>
    </div>
  )
}

function Card({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl p-4" style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>{kicker}</p>
      <h3 className="mt-0.5 text-[15px] font-bold leading-tight" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}
