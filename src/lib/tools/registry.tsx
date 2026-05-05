/* eslint-disable react-refresh/only-export-components */
/**
 * Primitive registry — every ToolElement type maps to a renderer here.
 *
 * Sprint 3 ships minimal-but-functional renderers using SYNTH tokens.
 * Sprint 5 polishes (named animation moments, error/empty states).
 * Sprint 9+ never adds new element types without updating the spec schema
 * and the registry in lock-step.
 *
 * Each renderer takes the discriminated element + the full ResolvedBindings
 * dict and reads only what it needs. Renderers MUST NOT import from
 * useStaticQuery, supabase, or the seed data — the resolver is the seam.
 *
 * react-refresh disabled file-wide: a registry inherently mixes a non-
 * component export (ELEMENT_RENDERERS) with the component definitions
 * that populate it. Splitting them would break the "three concerns, three
 * files" structure agreed in the Sprint 3 prompt. Trade-off: HMR will
 * full-reload this file when edited; that's acceptable for a registry.
 */
import type { ReactNode, FC } from 'react'
import { Fragment, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ToolElement } from './schema'
import type { ResolvedBindings } from './resolver'
import { useToolState } from './instanceState'
import { SYNTH } from '../../features/app/lib/theme'

// ─── Renderer type ────────────────────────────────────────────────────────

/**
 * Every renderer takes the full ToolElement union and narrows internally
 * via `if (element.type !== '...')` guards. We don't use `Extract<>` per
 * variant because this project's tsconfig has strictNullChecks off — zod
 * `z.infer<>` produces optional discriminator fields under that mode and
 * `Extract<>` collapses to `never`. Internal narrowing works regardless.
 */
export type ElementRenderer = FC<{
  element: ToolElement
  data: ResolvedBindings
}>

// ─── Helpers ──────────────────────────────────────────────────────────────

function asArray(v: unknown): Record<string, unknown>[] {
  if (Array.isArray(v)) return v as Record<string, unknown>[]
  if (v && typeof v === 'object' && 'rows' in v && Array.isArray((v as { rows: unknown }).rows)) {
    return (v as { rows: Record<string, unknown>[] }).rows
  }
  return []
}

/**
 * Resolve a stat's `value` field into a display string.
 *
 * Heuristic for binding refs against array data: if the stat's label
 * contains a field name (e.g. "Avg sleep" → field "sleep"), take the mean
 * of that field. Otherwise fall back to the last entry's first numeric
 * field. Allows multiple stats to bind against the same array binding
 * without the schema needing a `field` selector — Sprint 9 may revisit.
 */
function resolveStatValue(
  rawValue: number | string | { binding?: string },
  label: string,
  data: ResolvedBindings,
): string {
  if (typeof rawValue === 'number') return String(rawValue)
  if (typeof rawValue === 'string') return rawValue
  if (!rawValue.binding) return '—'

  const v = data[rawValue.binding]
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return v

  if (Array.isArray(v) && v.length > 0) {
    const sample = v[0] as Record<string, unknown>
    if (sample && typeof sample === 'object') {
      const labelLow = label.toLowerCase()
      const keys = Object.keys(sample)
      const matchKey =
        keys.find((k) => labelLow.includes(k.toLowerCase())) ??
        keys.find((k) => typeof sample[k] === 'number')
      if (matchKey) {
        const nums = (v as Record<string, unknown>[])
          .map((row) => row[matchKey])
          .filter((n): n is number => typeof n === 'number')
        if (nums.length > 0) {
          const avg = nums.reduce((a, b) => a + b, 0) / nums.length
          return String(Math.round(avg * 10) / 10)
        }
      }
    }
  }

  if (v && typeof v === 'object' && 'value' in v) {
    const inner = (v as { value: unknown }).value
    if (typeof inner === 'number') return String(inner)
    if (typeof inner === 'string') return inner
  }

  return '—'
}

/**
 * Minimal markdown — splits on \n\n for paragraphs, replaces **bold** with
 * <strong>. Zero deps. Sprint 5+ may swap for react-markdown if needed.
 */
function renderMarkdown(content: string): ReactNode {
  const paragraphs = content.split(/\n{2,}/)
  return paragraphs.map((p, i) => (
    <p key={i} style={{ margin: i === 0 ? 0 : '0.6em 0 0' }}>
      {renderInline(p)}
    </p>
  ))
}

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = []
  const re = /\*\*([^*]+)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>)
    parts.push(<strong key={key++}>{m[1]}</strong>)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
  return parts
}

// ─── Element renderers ────────────────────────────────────────────────────

const StatRenderer: ElementRenderer = ({ element, data }) => {
  if (element.type !== 'stat') return null
  const value = resolveStatValue(element.value, element.label, data)
  const trendColor =
    element.trend === 'up'
      ? SYNTH.accentEmerald
      : element.trend === 'down'
        ? SYNTH.accentRed
        : SYNTH.inkOnBrandFaint
  return (
    <div
      className="flex flex-col gap-1.5 rounded-2xl p-3.5"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkOnBrandMuted }}
      >
        {element.label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className="text-[26px] font-bold leading-none tabular-nums"
          style={{ color: SYNTH.inkOnBrand }}
        >
          {value}
        </span>
        {element.unit ? (
          <span
            className="text-[12px] font-semibold"
            style={{ color: SYNTH.inkOnBrandMuted }}
          >
            {element.unit}
          </span>
        ) : null}
        {element.trend ? (
          <span
            className="ml-auto text-[11px] font-bold uppercase"
            style={{ color: trendColor }}
          >
            {element.trend === 'up' ? '↑' : element.trend === 'down' ? '↓' : '–'}
          </span>
        ) : null}
      </div>
    </div>
  )
}

const LineChartRenderer: ElementRenderer = ({ element, data }) => {
  if (element.type !== 'line_chart') return null
  const rows = asArray(data[element.dataKey])
  return (
    <ChartShell title={element.title}>
      <LineChart data={rows} width={320} height={200} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
        <XAxis dataKey={element.xKey} stroke={SYNTH.inkOnBrandMuted} fontSize={11} />
        <YAxis stroke={SYNTH.inkOnBrandMuted} fontSize={11} />
        <Tooltip
          contentStyle={{
            background: SYNTH.canvasInk,
            border: `1px solid ${SYNTH.glassBorder}`,
            borderRadius: 8,
            fontSize: 12,
            color: SYNTH.inkOnBrand,
          }}
        />
        {element.yKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={i === 0 ? SYNTH.accentEmerald : SYNTH.cardSky}
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ChartShell>
  )
}

const BarChartRenderer: ElementRenderer = ({ element, data }) => {
  if (element.type !== 'bar_chart') return null
  const rows = asArray(data[element.dataKey])
  return (
    <ChartShell title={element.title}>
      <BarChart data={rows} width={320} height={200} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />
        <XAxis dataKey={element.xKey} stroke={SYNTH.inkOnBrandMuted} fontSize={11} />
        <YAxis stroke={SYNTH.inkOnBrandMuted} fontSize={11} />
        <Tooltip
          contentStyle={{
            background: SYNTH.canvasInk,
            border: `1px solid ${SYNTH.glassBorder}`,
            borderRadius: 8,
            fontSize: 12,
            color: SYNTH.inkOnBrand,
          }}
        />
        {element.yKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={i === 0 ? SYNTH.accentEmerald : SYNTH.cardSky}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartShell>
  )
}

function ChartShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl p-3.5"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkOnBrandMuted }}
      >
        {title}
      </span>
      <div style={{ height: 200 }}>{children}</div>
    </div>
  )
}

const TableRenderer: ElementRenderer = ({ element, data }) => {
  if (element.type !== 'table') return null
  const rows = asArray(data[element.dataKey])
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl p-3.5"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      {element.title ? (
        <span
          className="text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: SYNTH.inkOnBrandMuted }}
        >
          {element.title}
        </span>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]" style={{ color: SYNTH.inkOnBrand }}>
          <thead>
            <tr>
              {element.columns.map((c) => (
                <th
                  key={c.key}
                  className="px-2 py-1.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: SYNTH.inkOnBrandMuted }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${SYNTH.glassBorder}` }}>
                {element.columns.map((c) => (
                  <td key={c.key} className="px-2 py-1.5 tabular-nums">
                    {String(row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p
            className="px-2 py-3 text-[11px]"
            style={{ color: SYNTH.inkOnBrandFaint }}
          >
            No rows.
          </p>
        ) : null}
      </div>
    </div>
  )
}

const AthleteCardRenderer: ElementRenderer = ({ element, data }) => {
  if (element.type !== 'athlete_card') return null
  const raw = data[element.dataKey]
  const athlete =
    raw && typeof raw === 'object' && 'athlete' in raw
      ? (raw as { athlete: Record<string, unknown> }).athlete
      : (raw as Record<string, unknown> | undefined)
  const name = (athlete?.name as string) ?? '—'
  const meta = [athlete?.year, athlete?.side, athlete?.weight].filter(Boolean).join(' · ')
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-3.5"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[14px] font-bold"
        style={{
          background: SYNTH.cardSky,
          color: SYNTH.ink,
        }}
      >
        {String(name).split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase() || '—'}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="truncate text-[14px] font-bold"
          style={{ color: SYNTH.inkOnBrand }}
        >
          {String(name)}
        </span>
        {meta ? (
          <span
            className="text-[11px]"
            style={{ color: SYNTH.inkOnBrandMuted }}
          >
            {meta}
          </span>
        ) : null}
      </div>
    </div>
  )
}

const BoatLineupRenderer: ElementRenderer = ({ element, data }) => {
  if (element.type !== 'boat_lineup') return null
  const raw = data[element.dataKey] as
    | { name?: string; seats?: Array<{ seat: number | string; athlete: string; side?: string }> }
    | undefined
  const seats = raw?.seats ?? []
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl p-3.5"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkOnBrandMuted }}
      >
        {raw?.name ?? 'Boat'}
      </span>
      <ol className="flex flex-col gap-1">
        {seats.map((s, i) => (
          <li
            key={i}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px]"
            style={{ background: 'rgba(255,255,255,0.04)', color: SYNTH.inkOnBrand }}
          >
            <span
              className="w-5 text-right font-mono tabular-nums text-[11px]"
              style={{ color: SYNTH.inkOnBrandMuted }}
            >
              {s.seat}
            </span>
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                background:
                  s.side === 'P'
                    ? SYNTH.sidePort
                    : s.side === 'S'
                      ? SYNTH.sideStarboard
                      : SYNTH.inkOnBrandFaint,
              }}
            />
            <span className="min-w-0 flex-1 truncate">{s.athlete}</span>
          </li>
        ))}
        {seats.length === 0 ? (
          <li className="px-2 py-1.5 text-[11px]" style={{ color: SYNTH.inkOnBrandFaint }}>
            No seats assigned.
          </li>
        ) : null}
      </ol>
    </div>
  )
}

const TimerRenderer: ElementRenderer = ({ element }) => {
  if (element.type !== 'timer') return null
  // Sprint 3: static display. Sprint 5+ wires real RAF stopwatch state.
  const initial = element.mode === 'countdown' && element.durationMs ? element.durationMs : 0
  const mm = String(Math.floor(initial / 60_000)).padStart(2, '0')
  const ss = String(Math.floor((initial % 60_000) / 1000)).padStart(2, '0')
  return (
    <div
      className="flex flex-col items-center gap-1.5 rounded-2xl p-4"
      style={{
        background: SYNTH.canvasInk,
        border: `1px solid ${SYNTH.glassBorder}`,
      }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted }}
      >
        {element.label}
      </span>
      <span
        className="text-[40px] font-bold leading-none tabular-nums"
        style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
      >
        {mm}:{ss}
      </span>
      <span
        className="text-[9px] uppercase tracking-[0.16em]"
        style={{ color: SYNTH.inkOnBrandFaint }}
      >
        {element.mode}
      </span>
    </div>
  )
}

const BadgeRenderer: ElementRenderer = ({ element }) => {
  if (element.type !== 'badge') return null
  const tone =
    element.tone === 'success'
      ? SYNTH.accentEmerald
      : element.tone === 'warning'
        ? SYNTH.accentAmber
        : element.tone === 'danger'
          ? SYNTH.accentRed
          : SYNTH.cardSky
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{
        background: `${tone}1F`,
        color: tone,
        border: `1px solid ${tone}55`,
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: tone }}
      />
      {element.label}
    </span>
  )
}

const ButtonRenderer: ElementRenderer = ({ element }) => {
  // Hooks must run on every render in the same order, so hoist them above
  // the type guard. They're cheap and the closure captures `element`.
  const { data, dispatch } = useToolState()
  // Held across renders so each button instance has its own clock.
  // useToolInstanceState sits above this component, so this ref lives
  // for the lifetime of one rendered tool — switching sessions remounts
  // the renderer and reinitializes the clock.
  const firstStampRef = useRef<number | null>(null)
  const lastStampRef = useRef<number | null>(null)

  if (element.type !== 'button') return null

  const onClick = () => {
    if (element.action.kind !== 'submit') return
    const payload = element.action.payload as Record<string, unknown> | undefined
    const target = typeof payload?.append_to === 'string' ? payload.append_to : null
    if (!target) return

    const now = Date.now()
    if (firstStampRef.current === null) firstStampRef.current = now
    const elapsedMs = now - firstStampRef.current
    const splitMs = lastStampRef.current === null ? 0 : now - lastStampRef.current
    lastStampRef.current = now

    const existing = Array.isArray(data[target]) ? (data[target] as unknown[]) : []
    const index = existing.length + 1

    let row: Record<string, unknown>
    if (payload?.kind === 'lap') {
      row = {
        lap: index,
        elapsed: formatMs(elapsedMs),
        split: formatMs(splitMs),
      }
    } else {
      row = { index, ts: now, ...((payload?.row as Record<string, unknown>) ?? {}) }
    }

    dispatch({ kind: 'append_row', target, row })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em]"
      style={{
        background: SYNTH.accentEmerald,
        color: SYNTH.inkOnBrand,
      }}
    >
      {element.label}
    </button>
  )
}

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  const cs = Math.floor((ms % 1000) / 10)
  const pad = (n: number, w = 2) => String(n).padStart(w, '0')
  return `${pad(m)}:${pad(s)}.${pad(cs)}`
}

const InputRenderer: ElementRenderer = ({ element }) => {
  // Hoist hooks above the type guard (rules-of-hooks).
  const { data, dispatch } = useToolState()

  if (element.type !== 'input') return null
  const inputs = (data.__inputs as Record<string, unknown> | undefined) ?? {}
  const value = (inputs[element.name] as string | number | undefined) ?? ''

  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkOnBrandMuted }}
      >
        {element.label}
      </span>
      <input
        type={element.kind === 'number' ? 'number' : element.kind === 'date' ? 'date' : 'text'}
        name={element.name}
        placeholder={element.placeholder}
        value={value as string}
        onChange={(e) =>
          dispatch({
            kind: 'set_input',
            name: element.name,
            value: element.kind === 'number' ? Number(e.target.value) : e.target.value,
          })
        }
        className="rounded-2xl px-3 py-2.5 text-[13px] outline-none"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrand,
        }}
      />
    </label>
  )
}

const SelectRenderer: ElementRenderer = ({ element }) => {
  if (element.type !== 'select') return null
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkOnBrandMuted }}
      >
        {element.label}
      </span>
      <select
        name={element.name}
        defaultValue={element.options[0]?.value}
        disabled
        className="rounded-2xl px-3 py-2.5 text-[13px] outline-none"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrand,
        }}
      >
        {element.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

const TextRenderer: ElementRenderer = ({ element }) => {
  if (element.type !== 'text') return null
  const tone = element.tone ?? 'body'
  if (tone === 'kicker') {
    return (
      <p
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
      >
        {element.content}
      </p>
    )
  }
  if (tone === 'caption') {
    return (
      <p
        className="text-[11px] leading-[1.4]"
        style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
      >
        {renderMarkdown(element.content)}
      </p>
    )
  }
  return (
    <div
      className="text-[13px] leading-[1.55]"
      style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
    >
      {renderMarkdown(element.content)}
    </div>
  )
}

// ─── boat_race (schema v2, Sprint 5.7) ────────────────────────────────────

type BoatRaceData = {
  boats: Array<{ name: string; finishMs: number; color?: string }>
}

const RACE_PALETTE = [
  SYNTH.accentEmerald,
  SYNTH.cardSky,
  SYNTH.cardLemon,
  SYNTH.cardPink,
  SYNTH.cardMint,
  SYNTH.cardLavender,
]

const BOAT_DIAMETER = 20

function formatRaceTime(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const BoatRaceRenderer: ElementRenderer = ({ element, data }) => {
  // Hooks must be called unconditionally — keep above the type guard.
  const [replayKey, setReplayKey] = useState(0)
  if (element.type !== 'boat_race') return null

  const raw = data[element.dataKey] as BoatRaceData | undefined
  const boats = raw?.boats ?? []
  const durationMs = element.durationMs ?? 8000

  if (boats.length === 0) {
    return (
      <div
        className="rounded-2xl px-4 py-6 text-center"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px dashed ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrandMuted,
          fontFamily: SYNTH.font,
        }}
      >
        <span className="text-[11px] uppercase tracking-[0.14em]">No race data</span>
      </div>
    )
  }

  // Race semantics: at the end of the animation, the fastest boat (lowest
  // finishMs) is at 100% (the finish line). Slower boats are proportionally
  // behind, holding the rank order visually. Linear easing — boats hold
  // constant speed across a 2K, no theatrical ease-in/out.
  const minFinishMs = Math.min(...boats.map((b) => b.finishMs))

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl px-4 py-4"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${SYNTH.glassBorder}`,
        fontFamily: SYNTH.font,
      }}
    >
      <div key={replayKey} className="flex flex-col gap-2.5">
        {boats.map((boat, i) => {
          const target = (minFinishMs / boat.finishMs) * 100
          const color = boat.color ?? RACE_PALETTE[i % RACE_PALETTE.length]
          return (
            <div key={i} className="flex h-7 items-center gap-2">
              <span
                className="w-12 shrink-0 text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: SYNTH.inkOnBrand }}
              >
                {boat.name}
              </span>
              <div className="relative h-full flex-1" style={{ minWidth: 0 }}>
                <div
                  className="absolute left-0 right-0 top-1/2 h-px"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 w-px"
                  style={{ background: 'rgba(255,255,255,0.45)' }}
                />
                <motion.div
                  initial={{ left: '0%' }}
                  animate={{ left: `${target}%` }}
                  transition={{ duration: durationMs / 1000, ease: 'linear' }}
                  className="absolute top-1/2 flex items-center justify-center rounded-full"
                  style={{
                    width: BOAT_DIAMETER,
                    height: BOAT_DIAMETER,
                    marginTop: -BOAT_DIAMETER / 2,
                    marginLeft: -BOAT_DIAMETER / 2,
                    background: color,
                    boxShadow: '0 0 0 2px rgba(8,8,40,0.35), 0 4px 10px rgba(8,8,40,0.35)',
                  }}
                >
                  <span className="text-[8px] font-bold" style={{ color: SYNTH.ink }}>
                    {i + 1}
                  </span>
                </motion.div>
              </div>
              <span
                className="w-10 shrink-0 text-right text-[10px] font-bold tabular-nums"
                style={{ color: SYNTH.inkOnBrand }}
              >
                {formatRaceTime(boat.finishMs)}
              </span>
            </div>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => setReplayKey((k) => k + 1)}
        className="self-end rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{
          background: SYNTH.glass,
          border: `1px solid ${SYNTH.glassBorder}`,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
        }}
      >
        Replay
      </button>
    </div>
  )
}

// ─── Registry map ─────────────────────────────────────────────────────────

/**
 * Map: every ToolElement type points at its renderer. The keys mirror the
 * spec discriminator. Renderers are uniform-typed (full union, internal
 * narrowing) per the note on ElementRenderer above.
 */
export const ELEMENT_RENDERERS: Record<ToolElement['type'], ElementRenderer> = {
  stat: StatRenderer,
  line_chart: LineChartRenderer,
  bar_chart: BarChartRenderer,
  table: TableRenderer,
  athlete_card: AthleteCardRenderer,
  boat_lineup: BoatLineupRenderer,
  timer: TimerRenderer,
  badge: BadgeRenderer,
  button: ButtonRenderer,
  input: InputRenderer,
  select: SelectRenderer,
  text: TextRenderer,
  boat_race: BoatRaceRenderer,
}
