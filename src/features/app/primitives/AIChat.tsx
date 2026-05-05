/* eslint-disable react-refresh/only-export-components */
// Primitive module: exports the AI chat components plus type unions
// (ChatPart, ChatMessage, ChatCustomization), default constants, and
// the getActiveSuggestions helper used by AIPage. Splitting these into
// separate files would scatter cohesive UI logic; trade-off is a full
// HMR reload on edits to this file.
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Mic,
  AudioLines,
  X,
  Camera,
  Image as ImageIcon,
  FileText,
  Star,
  Pencil,
  Trash2,
  Info,
  AlertTriangle,
  Check,
  Trophy,
  Heart,
  Timer,
  FileUp,
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import { SheetShell } from './SheetShell'
import { SYNTH } from '../lib/theme'

// — Message model —

export type ChartPoint = { label: string; value: number }

export type ChatPart =
  | { kind: 'text'; text: string }
  | { kind: 'chip'; source: string; subject: string; date: string }
  | {
      kind: 'chart'
      title: string
      data: ChartPoint[]
      yFormatter?: (v: number) => string
      accent?: string
      provenance?: string
    }
  | {
      kind: 'callout'
      tone: 'info' | 'warn' | 'success'
      title?: string
      text: string
    }
  | {
      kind: 'bulletList'
      items: { label: string; sub?: string; severity?: 'high' | 'med' | 'low' }[]
    }
  | {
      kind: 'illustration'
      glyph: 'boat' | 'erg' | 'trophy' | 'heart' | 'stopwatch'
      caption?: string
    }
  | {
      kind: 'table'
      title: string
      columns: string[]
      rows: string[][]
      provenance?: string
    }
  | {
      kind: 'suggestions'
      items: string[]
    }

export type ChatMessage =
  | { id: string; role: 'user'; text: string; ts: number; attachment?: { name: string; ext: string } }
  | { id: string; role: 'ai'; parts: ChatPart[]; ts: number }
  | { id: string; role: 'thinking' }

// — Customization —

export type TonePreset = 'normal' | 'coach' | 'raceday' | 'recovery'

export type ChatCustomization = {
  instructions: string
  tone: TonePreset
  references: { id: string; name: string; ext: string }[]
  alwaysPlans: boolean
  alwaysWellness: boolean
  neverPrivateNotes: boolean
}

// — Synth thinking glyph (concentric dots) —

export function SynthGlyph({
  size = 28,
  rotating = false,
  color = SYNTH.accentEmerald,
}: {
  size?: number
  rotating?: boolean
  color?: string
}) {
  const rings = [
    { r: 0, count: 1, dot: 3 },
    { r: 8, count: 8, dot: 1.4 },
    { r: 14, count: 12, dot: 1.4 },
  ]
  const half = size / 2
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`-${half} -${half} ${size} ${size}`}
      animate={rotating ? { rotate: 360 } : { rotate: 0 }}
      transition={
        rotating ? { duration: 1.6, repeat: Infinity, ease: 'linear' } : { duration: 0 }
      }
      aria-hidden
    >
      {rings.map((ring) =>
        Array.from({ length: ring.count }).map((_, i) => {
          const angle = (i / ring.count) * Math.PI * 2
          const x = Math.cos(angle) * ring.r
          const y = Math.sin(angle) * ring.r
          return (
            <circle
              key={`${ring.r}-${i}`}
              cx={x}
              cy={y}
              r={ring.dot}
              fill={color}
              opacity={ring.r === 0 ? 1 : 0.7}
            />
          )
        }),
      )}
    </motion.svg>
  )
}

// — Citation chip —

export function CitationChip({ source, subject, date }: { source: string; subject: string; date: string }) {
  return (
    <span
      className="mx-0.5 inline-flex items-baseline gap-1 rounded-full border px-2 py-0.5 text-[11px]"
      style={{
        background: SYNTH.aiCard,
        borderColor: SYNTH.aiBorder,
        color: SYNTH.aiTextMuted,
        fontFamily: SYNTH.font,
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 500,
        verticalAlign: 'baseline',
      }}
    >
      <span className="font-semibold" style={{ color: SYNTH.ink }}>
        {source}
      </span>
      <span aria-hidden>·</span>
      <span>{subject}</span>
      <span aria-hidden>·</span>
      <span>{date}</span>
    </span>
  )
}

// — Block parts —

function ChartBlock({
  part,
}: {
  part: Extract<ChatPart, { kind: 'chart' }>
}) {
  const accent = part.accent ?? SYNTH.accentEmerald
  return (
    <div
      className="my-2 rounded-2xl border p-3"
      style={{ background: SYNTH.aiCard, borderColor: SYNTH.aiBorder, fontFamily: SYNTH.font }}
    >
      <p
        className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.aiTextMuted }}
      >
        {part.title}
      </p>
      <div className="mt-2 h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={part.data} margin={{ top: 8, right: 8, bottom: 8, left: -8 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: SYNTH.aiTextMuted, fontSize: 10, fontFamily: SYNTH.font }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: SYNTH.aiTextMuted, fontSize: 10, fontFamily: SYNTH.font }}
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v) => (part.yFormatter ? part.yFormatter(v as number) : String(v))}
            />
            <Tooltip
              contentStyle={{
                background: SYNTH.sheet,
                border: `1px solid ${SYNTH.aiBorder}`,
                borderRadius: 12,
                color: SYNTH.ink,
                fontFamily: SYNTH.font,
                fontSize: 12,
              }}
              formatter={(v: number) => (part.yFormatter ? part.yFormatter(v) : v)}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={accent}
              strokeWidth={2.4}
              dot={{ r: 2.5, fill: accent }}
              activeDot={{ r: 4, fill: accent }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {part.provenance ? (
        <p
          className="mt-2 px-1 text-[10px] uppercase tracking-[0.12em]"
          style={{ color: SYNTH.aiTextMuted, fontVariantNumeric: 'tabular-nums' }}
        >
          {part.provenance}
        </p>
      ) : null}
    </div>
  )
}

function CalloutBlock({
  part,
}: {
  part: Extract<ChatPart, { kind: 'callout' }>
}) {
  const tone = {
    info: { color: SYNTH.canvasTop, icon: <Info size={14} strokeWidth={2.4} /> },
    warn: { color: SYNTH.accentAmber, icon: <AlertTriangle size={14} strokeWidth={2.4} /> },
    success: { color: SYNTH.accentEmerald, icon: <Check size={14} strokeWidth={2.6} /> },
  }[part.tone]

  return (
    <div
      className="my-2 rounded-2xl border p-3"
      style={{
        background: SYNTH.aiCard,
        borderColor: SYNTH.aiBorder,
        borderLeft: `3px solid ${tone.color}`,
        fontFamily: SYNTH.font,
      }}
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
          style={{ background: `${tone.color}22`, color: tone.color }}
        >
          {tone.icon}
        </span>
        <div className="min-w-0 flex-1">
          {part.title ? (
            <p
              className="text-[12px] font-semibold leading-tight"
              style={{ color: SYNTH.ink }}
            >
              {part.title}
            </p>
          ) : null}
          <p
            className={`text-[13px] leading-snug ${part.title ? 'mt-0.5' : ''}`}
            style={{ color: SYNTH.ink }}
          >
            {part.text}
          </p>
        </div>
      </div>
    </div>
  )
}

function BulletListBlock({
  part,
}: {
  part: Extract<ChatPart, { kind: 'bulletList' }>
}) {
  const sevColor = {
    high: SYNTH.accentRed,
    med: SYNTH.accentAmber,
    low: SYNTH.accentEmerald,
  }
  return (
    <ul className="my-2 flex flex-col gap-1.5" style={{ fontFamily: SYNTH.font }}>
      {part.items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span
            className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              background: item.severity ? sevColor[item.severity] : SYNTH.aiTextMuted,
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-snug" style={{ color: SYNTH.ink }}>
              {item.label}
            </p>
            {item.sub ? (
              <p className="mt-0.5 text-[11px]" style={{ color: SYNTH.aiTextMuted }}>
                {item.sub}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

function TableBlock({
  part,
}: {
  part: Extract<ChatPart, { kind: 'table' }>
}) {
  return (
    <div
      className="my-2 overflow-hidden rounded-2xl border"
      style={{
        background: SYNTH.aiCard,
        borderColor: SYNTH.aiBorder,
        fontFamily: SYNTH.font,
      }}
    >
      <p
        className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.aiTextMuted, borderBottom: `1px solid ${SYNTH.aiBorder}` }}
      >
        {part.title}
      </p>
      <div className="overflow-x-auto">
        <table
          className="w-full text-[12px]"
          style={{ color: SYNTH.ink, fontVariantNumeric: 'tabular-nums' }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${SYNTH.aiBorder}` }}>
              {part.columns.map((col, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-semibold"
                  style={{ color: SYNTH.aiTextMuted }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {part.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={part.columns.length}
                  className="px-3 py-3 text-center"
                  style={{ color: SYNTH.aiTextMuted }}
                >
                  No rows
                </td>
              </tr>
            ) : (
              part.rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background: ri % 2 === 0 ? 'transparent' : SYNTH.aiBubble,
                  }}
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {part.provenance ? (
        <p
          className="px-4 py-2 text-[10px]"
          style={{
            color: SYNTH.aiTextMuted,
            borderTop: `1px solid ${SYNTH.aiBorder}`,
          }}
        >
          {part.provenance}
        </p>
      ) : null}
    </div>
  )
}

function IllustrationBlock({
  part,
}: {
  part: Extract<ChatPart, { kind: 'illustration' }>
}) {
  const icon = {
    boat: <BoatGlyph />,
    erg: <ErgGlyph />,
    trophy: <Trophy size={36} strokeWidth={1.8} />,
    heart: <Heart size={36} strokeWidth={1.8} />,
    stopwatch: <Timer size={36} strokeWidth={1.8} />,
  }[part.glyph]

  return (
    <div
      className="my-2 flex flex-col items-center gap-2 rounded-2xl border px-4 py-5"
      style={{
        background: SYNTH.aiCard,
        borderColor: SYNTH.aiBorder,
        color: SYNTH.ink,
        fontFamily: SYNTH.font,
      }}
    >
      <span style={{ color: SYNTH.accentEmerald }}>{icon}</span>
      {part.caption ? (
        <p
          className="text-center text-[11px] uppercase tracking-[0.14em]"
          style={{ color: SYNTH.aiTextMuted }}
        >
          {part.caption}
        </p>
      ) : null}
    </div>
  )
}

function BoatGlyph() {
  return (
    <svg width={120} height={36} viewBox="0 0 120 36" fill="none" aria-hidden>
      <path
        d="M 4,18 Q 0,8 12,6 L 100,6 Q 115,8 116,18 Q 115,28 100,30 L 12,30 Q 0,28 4,18 Z"
        stroke={SYNTH.accentEmerald}
        strokeWidth={1.6}
      />
      {[20, 36, 52, 68, 84, 100].map((x) => (
        <circle key={x} cx={x} cy={18} r={2.4} fill={SYNTH.accentEmerald} />
      ))}
      <line x1={20} y1={4} x2={20} y2={32} stroke={SYNTH.accentEmerald} strokeWidth={1} opacity={0.4} />
    </svg>
  )
}

function ErgGlyph() {
  return (
    <svg width={48} height={36} viewBox="0 0 48 36" fill="none" aria-hidden>
      <circle cx={12} cy={18} r={9} stroke={SYNTH.accentEmerald} strokeWidth={1.6} />
      <circle cx={12} cy={18} r={3} fill={SYNTH.accentEmerald} />
      <path
        d="M21 18 H40 L36 26"
        stroke={SYNTH.accentEmerald}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 9 l4 4" stroke={SYNTH.accentEmerald} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  )
}

// — Thread —

export function AIThread({
  messages,
  emptyHeadline,
}: {
  messages: ChatMessage[]
  emptyHeadline: string
}) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 pb-16 pt-12">
        <SynthGlyph size={36} />
        <h2
          className="max-w-[300px] text-center text-[24px] font-semibold leading-[1.25] tracking-[-0.01em]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          {emptyHeadline}
        </h2>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-5 px-5 py-4">
      {messages.map((m) => (
        <MessageRow key={m.id} message={m} />
      ))}
      <div ref={endRef} />
    </div>
  )
}

function MessageRow({ message }: { message: ChatMessage }) {
  if (message.role === 'thinking') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex"
      >
        <SynthGlyph size={24} rotating />
      </motion.div>
    )
  }

  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="flex justify-end"
      >
        <div className="flex max-w-[80%] flex-col items-end gap-2">
          {message.attachment ? (
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2"
              style={{
                background: SYNTH.aiCard,
                border: `1px solid ${SYNTH.aiBorder}`,
                fontFamily: SYNTH.font,
              }}
            >
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                style={{ background: SYNTH.ink, color: SYNTH.inkOnBrand }}
              >
                {message.attachment.ext}
              </span>
              <span className="text-[12px] font-medium" style={{ color: SYNTH.ink }}>
                {message.attachment.name}
              </span>
            </div>
          ) : null}
          {message.text ? (
            <div
              className="rounded-[18px] px-4 py-2.5 text-[15px] leading-[1.4]"
              style={{
                background: SYNTH.aiBubble,
                color: SYNTH.ink,
                fontFamily: SYNTH.font,
                borderRadius: '18px 18px 4px 18px',
              }}
            >
              {message.text}
            </div>
          ) : null}
        </div>
      </motion.div>
    )
  }

  // ai response — group inline parts (text + chip) into paragraphs;
  // block parts (chart / callout / bulletList / illustration) render standalone
  const groups = groupParts(message.parts)
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="flex flex-col gap-2"
    >
      <SynthGlyph size={20} />
      {groups.map((g, i) => {
        if (g.kind === 'inline') {
          return (
            <p
              key={i}
              className="max-w-full text-[15px] leading-[1.55]"
              style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
            >
              {g.parts.map((p, pi) =>
                p.kind === 'text' ? (
                  <span key={pi}>{p.text}</span>
                ) : (
                  <CitationChip key={pi} source={p.source} subject={p.subject} date={p.date} />
                ),
              )}
            </p>
          )
        }
        if (g.part.kind === 'chart') return <ChartBlock key={i} part={g.part} />
        if (g.part.kind === 'callout') return <CalloutBlock key={i} part={g.part} />
        if (g.part.kind === 'bulletList') return <BulletListBlock key={i} part={g.part} />
        if (g.part.kind === 'illustration') return <IllustrationBlock key={i} part={g.part} />
        if (g.part.kind === 'table') return <TableBlock key={i} part={g.part} />
        return null
      })}
    </motion.div>
  )
}

type Group =
  | { kind: 'inline'; parts: Extract<ChatPart, { kind: 'text' | 'chip' }>[] }
  | {
      kind: 'block'
      part: Extract<
        ChatPart,
        { kind: 'chart' | 'callout' | 'bulletList' | 'illustration' | 'table' }
      >
    }

function groupParts(parts: ChatPart[]): Group[] {
  const out: Group[] = []
  let inline: Extract<ChatPart, { kind: 'text' | 'chip' }>[] = []
  for (const p of parts) {
    // Suggestions are extracted by the AIPage and rendered above the
    // composer. Skip them from the bubble's inline + block flow.
    if (p.kind === 'suggestions') continue
    if (p.kind === 'text' || p.kind === 'chip') {
      inline.push(p)
    } else {
      if (inline.length) {
        out.push({ kind: 'inline', parts: inline })
        inline = []
      }
      out.push({ kind: 'block', part: p })
    }
  }
  if (inline.length) out.push({ kind: 'inline', parts: inline })
  return out
}

/**
 * Pull the latest suggestion list from a message thread. AIPage uses
 * this to decide whether to render the suggestion row between the
 * scrolling thread and the composer.
 *
 * Rules:
 * - Only the most recent AI message contributes suggestions (older ones
 *   are stale once the conversation has moved on).
 * - The thinking placeholder doesn't count.
 * - If the latest AI message has no suggestion part, returns [].
 */
export function getActiveSuggestions(messages: ChatMessage[]): string[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role === 'thinking') continue
    if (m.role === 'user') return []
    // m.role === 'ai'
    const suggestions = m.parts.find((p) => p.kind === 'suggestions')
    if (suggestions && suggestions.kind === 'suggestions') {
      return suggestions.items
    }
    return []
  }
  return []
}

// — Suggestion row —
//
// Renders the active follow-up chips above the composer. Tapping a
// chip is identical to typing the question and pressing send: AIPage
// passes onSelect, which fills the composer + auto-submits.

export function SuggestionRow({
  items,
  onSelect,
  disabled = false,
}: {
  items: string[]
  onSelect: (text: string) => void
  disabled?: boolean
}) {
  if (items.length === 0) return null
  return (
    <div
      className="synth-scroll flex shrink-0 gap-2 overflow-x-auto px-3 pb-2 pt-1"
      style={{ fontFamily: SYNTH.font }}
    >
      {items.map((q, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="shrink-0 rounded-full border px-3 py-1.5 text-[12px] disabled:opacity-50"
          style={{
            background: SYNTH.sheet,
            borderColor: SYNTH.aiBorder,
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
            // Cap the chip so very long suggestions don't blow out
            // the row. Long ones truncate gracefully.
            maxWidth: 320,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {q}
        </button>
      ))}
    </div>
  )
}

// — Composer —

type ComposerProps = {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onStop: () => void
  onAttach: () => void
  attachment?: { name: string; ext: string } | null
  onClearAttachment?: () => void
  isStreaming: boolean
  placeholder: string
}

export function AIComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  onAttach,
  attachment,
  onClearAttachment,
  isStreaming,
  placeholder,
}: ComposerProps) {
  const hasContent = value.trim().length > 0 || !!attachment

  return (
    <div
      className="rounded-3xl px-3 pb-3 pt-3"
      style={{
        background: SYNTH.sheet,
        border: `1px solid ${SYNTH.aiBorder}`,
        boxShadow: '0 4px 16px rgba(46,55,242,0.08)',
        fontFamily: SYNTH.font,
      }}
    >
      {attachment ? (
        <div
          className="mb-2 inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5"
          style={{
            background: SYNTH.aiCard,
            border: `1px solid ${SYNTH.aiBorder}`,
          }}
        >
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ background: SYNTH.ink, color: SYNTH.inkOnBrand }}
          >
            {attachment.ext}
          </span>
          <span className="text-[12px] font-medium" style={{ color: SYNTH.ink }}>
            {attachment.name}
          </span>
          <button
            type="button"
            onClick={onClearAttachment}
            aria-label="Remove attachment"
            className="ml-1 flex h-5 w-5 items-center justify-center rounded-full"
            style={{ background: SYNTH.sheetMuted, color: SYNTH.aiTextMuted }}
          >
            <X size={11} strokeWidth={2.6} />
          </button>
        </div>
      ) : null}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!isStreaming && hasContent) onSubmit()
          }
        }}
        rows={1}
        placeholder={placeholder}
        disabled={isStreaming}
        className="block w-full resize-none bg-transparent px-2 text-[15px] outline-none placeholder:opacity-60 disabled:opacity-60"
        style={{ color: SYNTH.ink, fontFamily: SYNTH.font, minHeight: 28 }}
      />

      <div className="mt-2 flex items-center gap-1 px-1">
        <button
          type="button"
          onClick={onAttach}
          aria-label="Attach"
          disabled={isStreaming}
          className="flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-50"
          style={{ color: SYNTH.aiTextMuted }}
        >
          <Plus size={18} strokeWidth={2.2} />
        </button>
        <span className="flex-1" />
        {/* Phase 3 — the previous decorative mic button used to live
            here. It did nothing (no onClick). Voice now opens through
            AddToChatSheet's Voice tile, which routes through the
            existing AuroraVoiceOverlay (synth whisper). One entry
            point keeps the composer simple. */}
        <AnimatePresence mode="wait" initial={false}>
          {isStreaming ? (
            <motion.button
              key="stop"
              type="button"
              onClick={onStop}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.12 }}
              aria-label="Stop"
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
            >
              <span className="block h-3 w-3 rounded-[3px]" style={{ background: SYNTH.ink }} />
            </motion.button>
          ) : hasContent ? (
            <motion.button
              key="send"
              type="button"
              onClick={onSubmit}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.12 }}
              whileTap={{ scale: 0.94 }}
              aria-label="Send"
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: SYNTH.accentEmerald, color: SYNTH.inkOnBrand }}
            >
              <UpArrowGlyph />
            </motion.button>
          ) : (
            <motion.button
              key="voice"
              type="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.12 }}
              aria-label="Voice mode"
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: SYNTH.ink, color: SYNTH.inkOnBrand }}
            >
              <AudioLines size={16} strokeWidth={2.2} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function UpArrowGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 19V5M5 12l7-7 7 7"
        stroke="#FFFFFF"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// — Add to Chat sheet —

export type ScopeOption = {
  id: string
  label: string
}

export type StyleKey = 'synthesized' | 'raw'

export function AddToChatSheet({
  open,
  onClose,
  onPickFiles,
  onOpenVoice,
  scopeOptions,
  scopeId,
  onScopeChange,
  style,
  onStyleChange,
}: {
  open: boolean
  onClose: () => void
  onPickFiles: (files: FileList | null) => void
  /** Phase 3 — opens the AuroraVoiceOverlay (synth whisper) at the page
   *  level. The sheet closes itself first so the overlay isn't stacked
   *  over a half-shut sheet. Optional so older callers stay valid. */
  onOpenVoice?: () => void
  scopeOptions: ScopeOption[]
  scopeId: string
  onScopeChange: (id: string) => void
  style: StyleKey
  onStyleChange: (s: StyleKey) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerFile = (accept: string) => {
    const el = fileInputRef.current
    if (!el) return
    el.accept = accept
    el.click()
  }

  const triggerVoice = () => {
    if (!onOpenVoice) return
    // Close the sheet first; the overlay then mounts cleanly above the
    // page. Without the close, the sheet's backdrop stacks under the
    // overlay and you see two scrim layers.
    onClose()
    onOpenVoice()
  }

  return (
    <SheetShell open={open} onClose={onClose} title="Add to chat">
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Tile icon={<Camera size={20} strokeWidth={2.2} />} label="Camera" onClick={() => triggerFile('image/*')} />
        <Tile icon={<ImageIcon size={20} strokeWidth={2.2} />} label="Photos" onClick={() => triggerFile('image/*')} />
        <Tile icon={<FileText size={20} strokeWidth={2.2} />} label="Files" onClick={() => triggerFile('*/*')} />
        {onOpenVoice ? (
          <Tile icon={<Mic size={20} strokeWidth={2.2} />} label="Voice" onClick={triggerVoice} />
        ) : null}
      </div>

      <Group label="Scope">
        <div className="flex flex-wrap gap-2">
          {scopeOptions.map((s) => (
            <Pill key={s.id} active={s.id === scopeId} onClick={() => onScopeChange(s.id)}>
              {s.label}
            </Pill>
          ))}
        </div>
      </Group>

      <Group label="Response style">
        <div className="flex flex-wrap gap-2">
          <Pill active={style === 'synthesized'} onClick={() => onStyleChange('synthesized')}>
            Synthesized
          </Pill>
          <Pill active={style === 'raw'} onClick={() => onStyleChange('raw')}>
            Raw provenance
          </Pill>
        </div>
        <p
          className="text-[11px]"
          style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}
        >
          {style === 'synthesized'
            ? 'Narrative, with inline citations and visualizations.'
            : 'Numbers and tables, minimal prose.'}
        </p>
      </Group>

      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        onChange={(e) => {
          onPickFiles(e.target.files)
          if (fileInputRef.current) fileInputRef.current.value = ''
          onClose()
        }}
        className="hidden"
      />
    </SheetShell>
  )
}

// — Customize chat sheet —

const TONE_PRESETS: { key: TonePreset; label: string; hint: string }[] = [
  { key: 'normal', label: 'Normal', hint: 'Balanced narrative + citations' },
  { key: 'coach', label: 'Coach mode', hint: 'Practical, action-first' },
  { key: 'raceday', label: 'Race-day', hint: 'Tight, high-signal' },
  { key: 'recovery', label: 'Recovery focus', hint: 'Sleep + load + readiness' },
]

export function CustomizeChatSheet({
  open,
  onClose,
  value,
  onChange,
  scopeLabel,
}: {
  open: boolean
  onClose: () => void
  value: ChatCustomization
  onChange: (next: ChatCustomization) => void
  /** Active scope shown as a subtitle in the sheet header. Phase 2 of
   *  the AI deep upgrade keys customizations per scope, so coaches need
   *  a clear hint about which scope they're editing (team-wide vs. a
   *  specific athlete drill-in). Passing it as a prop keeps the sheet
   *  agnostic about scope id format. */
  scopeLabel?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const onPickRefs = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const additions = Array.from(files).map((f, i) => {
      const dot = f.name.lastIndexOf('.')
      const ext = dot >= 0 ? f.name.slice(dot + 1).toUpperCase() : 'FILE'
      const name = dot >= 0 ? f.name.slice(0, dot) : f.name
      return {
        id: `r-${Date.now()}-${i}`,
        name: name.length > 24 ? `${name.slice(0, 24)}…` : name,
        ext,
      }
    })
    onChange({ ...value, references: [...value.references, ...additions] })
  }

  const removeRef = (id: string) => {
    onChange({ ...value, references: value.references.filter((r) => r.id !== id) })
  }

  return (
    <SheetShell open={open} onClose={onClose} title="Customize chat">
      {scopeLabel ? (
        <p
          className="-mt-1 mb-1 text-[12px]"
          style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}
        >
          Editing for{' '}
          <span style={{ color: SYNTH.ink, fontWeight: 600 }}>{scopeLabel}</span>
          {'. '}Other scopes keep their own settings.
        </p>
      ) : null}
      <Group label="Custom instructions">
        <textarea
          value={value.instructions}
          onChange={(e) => onChange({ ...value, instructions: e.target.value })}
          rows={4}
          placeholder="How should synth respond? e.g. lead with the metric, keep responses under 5 lines, always suggest a follow-up question."
          className="block w-full resize-none rounded-2xl border px-3 py-3 text-[14px] outline-none"
          style={{
            background: SYNTH.sheet,
            borderColor: SYNTH.aiBorder,
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
            minHeight: 96,
          }}
        />
      </Group>

      <Group label="Tone preset">
        <div className="flex flex-wrap gap-2">
          {TONE_PRESETS.map((t) => (
            <Pill
              key={t.key}
              active={value.tone === t.key}
              onClick={() => onChange({ ...value, tone: t.key })}
            >
              {t.label}
            </Pill>
          ))}
        </div>
        <p className="text-[11px]" style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}>
          {TONE_PRESETS.find((t) => t.key === value.tone)?.hint}
        </p>
      </Group>

      <Group label="Reference materials">
        <div className="flex flex-col gap-2">
          {value.references.length === 0 ? (
            <p
              className="rounded-2xl px-4 py-3 text-[12px]"
              style={{
                background: SYNTH.aiCard,
                border: `1px solid ${SYNTH.aiBorder}`,
                color: SYNTH.aiTextMuted,
                fontFamily: SYNTH.font,
              }}
            >
              No programs or docs uploaded yet. synth will only use connected sources.
            </p>
          ) : (
            value.references.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-2xl border px-3 py-2.5"
                style={{
                  background: SYNTH.aiCard,
                  borderColor: SYNTH.aiBorder,
                  fontFamily: SYNTH.font,
                }}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ background: SYNTH.ink, color: SYNTH.inkOnBrand }}
                  >
                    {r.ext}
                  </span>
                  <span className="truncate text-[13px] font-medium" style={{ color: SYNTH.ink }}>
                    {r.name}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeRef(r.id)}
                  aria-label="Remove reference"
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: SYNTH.sheetMuted, color: SYNTH.aiTextMuted }}
                >
                  <X size={13} strokeWidth={2.4} />
                </button>
              </div>
            ))
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-full border py-2.5 text-[13px] font-semibold"
            style={{
              background: SYNTH.sheet,
              borderColor: SYNTH.aiBorder,
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
            }}
          >
            <FileUp size={14} strokeWidth={2.2} />
            Upload program or doc
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,image/*"
            multiple
            onChange={(e) => {
              onPickRefs(e.target.files)
              if (inputRef.current) inputRef.current.value = ''
            }}
            className="hidden"
          />
        </div>
      </Group>

      <Group label="Always reference">
        <Toggle
          label="Race plans + lineups"
          hint="synth will pull current lineups and weekly plan into every answer"
          value={value.alwaysPlans}
          onChange={(v) => onChange({ ...value, alwaysPlans: v })}
        />
        <Toggle
          label="Wellness check-ins"
          hint="Sleep, soreness, stress signals"
          value={value.alwaysWellness}
          onChange={(v) => onChange({ ...value, alwaysWellness: v })}
        />
      </Group>

      <Group label="Never reference">
        <Toggle
          label="Private coach notes"
          hint="Notes flagged Private stay out of every chat"
          value={value.neverPrivateNotes}
          onChange={(v) => onChange({ ...value, neverPrivateNotes: v })}
        />
      </Group>
    </SheetShell>
  )
}

// — Chat history sheet —

export type ChatHistoryEntry = {
  id: string
  title: string
  updatedAgo: string
  pinned?: boolean
}

export function ChatHistorySheet({
  open,
  onClose,
  entries,
  activeId,
  onPick,
  onPin,
  onRename,
  onDelete,
  onNew,
}: {
  open: boolean
  onClose: () => void
  entries: ChatHistoryEntry[]
  activeId: string | null
  onPick: (id: string) => void
  onPin: (id: string) => void
  onRename: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}) {
  const pinned = entries.filter((e) => e.pinned)
  const others = entries.filter((e) => !e.pinned)

  return (
    <SheetShell open={open} onClose={onClose} title="Chat history">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onNew}
          className="flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold"
          style={{
            background: SYNTH.accentBlack,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            letterSpacing: '0.02em',
          }}
        >
          + Start a new chat
        </button>
      </div>

      {pinned.length > 0 ? (
        <Group label="Starred">
          <HistoryList
            entries={pinned}
            activeId={activeId}
            onPick={onPick}
            onPin={onPin}
            onRename={onRename}
            onDelete={onDelete}
          />
        </Group>
      ) : null}

      <Group label="Recents">
        {others.length === 0 ? (
          <p
            className="rounded-2xl px-4 py-6 text-center text-[12px]"
            style={{ background: SYNTH.aiCard, color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}
          >
            No prior chats yet.
          </p>
        ) : (
          <HistoryList
            entries={others}
            activeId={activeId}
            onPick={onPick}
            onPin={onPin}
            onRename={onRename}
            onDelete={onDelete}
          />
        )}
      </Group>
    </SheetShell>
  )
}

function HistoryList({
  entries,
  activeId,
  onPick,
  onPin,
  onRename,
  onDelete,
}: {
  entries: ChatHistoryEntry[]
  activeId: string | null
  onPick: (id: string) => void
  onPin: (id: string) => void
  onRename: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [menuFor, setMenuFor] = useState<string | null>(null)
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: SYNTH.aiCard, border: `1px solid ${SYNTH.aiBorder}` }}
    >
      {entries.map((e, i) => {
        const active = e.id === activeId
        return (
          <div key={e.id} className="relative">
            <button
              type="button"
              onClick={() => onPick(e.id)}
              onContextMenu={(ev) => {
                ev.preventDefault()
                setMenuFor(e.id)
              }}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left active:opacity-80"
              style={{
                borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.aiBorder}`,
                background: active ? SYNTH.aiBubble : 'transparent',
                fontFamily: SYNTH.font,
              }}
            >
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[14px] font-semibold"
                  style={{ color: SYNTH.ink }}
                >
                  {e.title}
                </p>
                <p
                  className="mt-0.5 text-[10px] uppercase tracking-[0.12em]"
                  style={{
                    color: SYNTH.aiTextMuted,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {e.updatedAgo}
                </p>
              </div>
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation()
                  setMenuFor((m) => (m === e.id ? null : e.id))
                }}
                aria-label="Chat options"
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ background: SYNTH.sheetMuted, color: SYNTH.aiTextMuted }}
              >
                ⋯
              </button>
            </button>

            <AnimatePresence>
              {menuFor === e.id ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-3 top-2 z-10 flex flex-col overflow-hidden rounded-xl"
                  style={{
                    background: SYNTH.sheet,
                    border: `1px solid ${SYNTH.aiBorder}`,
                    boxShadow: '0 14px 36px rgba(8,8,40,0.18)',
                    fontFamily: SYNTH.font,
                  }}
                >
                  <MenuItem
                    icon={<Star size={14} strokeWidth={2.2} />}
                    label={e.pinned ? 'Unstar' : 'Star'}
                    onClick={() => {
                      onPin(e.id)
                      setMenuFor(null)
                    }}
                  />
                  <MenuItem
                    icon={<Pencil size={14} strokeWidth={2.2} />}
                    label="Rename"
                    onClick={() => {
                      onRename(e.id)
                      setMenuFor(null)
                    }}
                  />
                  <MenuItem
                    icon={<Trash2 size={14} strokeWidth={2.2} />}
                    label="Delete"
                    danger
                    onClick={() => {
                      onDelete(e.id)
                      setMenuFor(null)
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: ReactNode
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold active:opacity-70"
      style={{ color: danger ? SYNTH.accentRed : SYNTH.ink }}
    >
      {icon}
      {label}
    </button>
  )
}

// — Shared bits —

function Tile({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl px-3 py-5"
      style={{
        background: SYNTH.aiCard,
        border: `1px solid ${SYNTH.aiBorder}`,
        color: SYNTH.ink,
        fontFamily: SYNTH.font,
      }}
    >
      {icon}
      <span className="text-[12px] font-semibold">{label}</span>
    </motion.button>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-[12px] font-semibold"
      style={{
        background: active ? SYNTH.accentBlack : SYNTH.sheet,
        borderColor: active ? SYNTH.accentBlack : SYNTH.aiBorder,
        color: active ? SYNTH.inkOnBrand : SYNTH.ink,
        fontFamily: SYNTH.font,
      }}
    >
      {children}
    </button>
  )
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left"
      style={{
        background: SYNTH.aiCard,
        borderColor: SYNTH.aiBorder,
        color: SYNTH.ink,
        fontFamily: SYNTH.font,
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold">{label}</p>
        {hint ? (
          <p
            className="mt-0.5 text-[11px]"
            style={{ color: SYNTH.aiTextMuted }}
          >
            {hint}
          </p>
        ) : null}
      </div>
      <span
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{ background: value ? SYNTH.accentEmerald : '#D4D4D8' }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full transition-transform"
          style={{
            background: '#FFFFFF',
            transform: value ? 'translateX(22px)' : 'translateX(2px)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />
      </span>
    </button>
  )
}
