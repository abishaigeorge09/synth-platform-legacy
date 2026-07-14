/* eslint-disable react-refresh/only-export-components */
// Primitive module: exports the AI chat components plus type unions
// (ChatPart, ChatMessage, ChatCustomization), default constants, and
// the getActiveSuggestions helper used by AIPage. Splitting these into
// separate files would scatter cohesive UI logic; trade-off is a full
// HMR reload on edits to this file.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Mic,
  X,
  Camera,
  Image as ImageIcon,
  FileText,
  Search,
  Star,
  Pencil,
  Trash2,
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

export type ChatAttachment = {
  name: string
  ext: string
  /** Image MIME type when the file is an image Anthropic can see. */
  mediaType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  /** Full `data:<mime>;base64,<payload>` URL. Only set for images. */
  dataUrl?: string
}

export type ChatMessage =
  | {
      id: string
      role: 'user'
      text: string
      ts: number
      // Phase 4 — attachments grow optional `mediaType` + `dataUrl`
      // fields when the picked file is an image. Plain files (PDFs,
      // CSVs) keep the original {name, ext} chip and don't trigger
      // vision. dataUrl is a `data:image/<mime>;base64,...` string
      // from FileReader; AIPage parses + repackages it into Anthropic
      // content blocks at send time.
      attachment?: ChatAttachment
    }
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
  // Quiet treatment — no tone-colored icon badge, no colored left rail.
  // A callout should read as an emphasized paragraph, not an "AI tool"
  // widget. Tone still nudges the title color a touch so warn/success
  // are still scannable at a glance, but there's no icon or accent bar.
  const titleColor = {
    info: SYNTH.ink,
    warn: SYNTH.ink,
    success: SYNTH.ink,
  }[part.tone]
  const links = useContext(AthleteLinksContext)

  return (
    <div
      className="my-2 rounded-2xl border p-3"
      style={{
        background: SYNTH.aiCard,
        borderColor: SYNTH.aiBorder,
        fontFamily: SYNTH.font,
      }}
    >
      {part.title ? (
        <p
          className="text-[12px] font-semibold leading-tight"
          style={{ color: titleColor }}
        >
          {renderRichText(part.title, links)}
        </p>
      ) : null}
      <p
        className={`text-[13px] leading-snug ${part.title ? 'mt-0.5' : ''}`}
        style={{ color: SYNTH.aiTextMuted }}
      >
        {renderRichText(part.text, links)}
      </p>
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
  const links = useContext(AthleteLinksContext)
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
              {renderRichText(item.label, links)}
            </p>
            {item.sub ? (
              <p className="mt-0.5 text-[11px]" style={{ color: SYNTH.aiTextMuted }}>
                {renderRichText(item.sub, links)}
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
  const links = useContext(AthleteLinksContext)
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
                      {renderRichText(cell, links)}
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
  athletes,
  onAthleteClick,
}: {
  messages: ChatMessage[]
  emptyHeadline: string
  /** Roster used to make athlete names clickable inline (headline prose
   *  and "Athlete" table columns). Omit to disable name-linking. */
  athletes?: { id: string; name: string }[]
  onAthleteClick?: (athleteId: string) => void
}) {
  const endRef = useRef<HTMLDivElement>(null)
  // Depend on `messages` itself, not messages.length — AIPage replaces
  // the array on every streaming delta (same length, new reference), so
  // scrolling only on length change meant the thread sat still while a
  // response grew and only jumped once the message count itself changed.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const links: AthleteLinks = useMemo(
    () => ({ matcher: buildNameMatcher(athletes ?? []), onAthleteClick }),
    [athletes, onAthleteClick],
  )

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
    <AthleteLinksContext.Provider value={links}>
      <div className="flex flex-1 flex-col gap-5 px-5 py-4">
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>
    </AthleteLinksContext.Provider>
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
            message.attachment.dataUrl ? (
              // Phase 4 — image attachments render inline so the
              // conversation transcript shows what was actually sent
              // to Anthropic. Cap at 240px to keep bubble width sane;
              // object-cover would crop, so use object-contain + a
              // height auto for full-image fidelity.
              <img
                src={message.attachment.dataUrl}
                alt={message.attachment.name}
                className="max-w-[240px] rounded-2xl"
                style={{
                  border: `1px solid ${SYNTH.aiBorder}`,
                  background: SYNTH.aiCard,
                }}
              />
            ) : (
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
            )
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
            <div
              key={i}
              className="flex max-w-full flex-col gap-1.5 text-[15px] leading-[1.55]"
              style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
            >
              <InlineGroup parts={g.parts} />
            </div>
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

/**
 * Roster + click handler for making athlete names tappable wherever they
 * appear in an AI response (headline prose, table cells). Provided by
 * AIThread; consumed by MessageRow/InlineGroup/TableBlock. Context (not
 * prop-drilling) because the render tree between AIThread and the leaf
 * text renderers is several components deep.
 */
type AthleteLinks = {
  /** Built once per `athletes` list change — see AIThread. */
  matcher: NameMatcher | null
  onAthleteClick?: (athleteId: string) => void
}
const AthleteLinksContext = createContext<AthleteLinks>({ matcher: null })

type NameMatcher = { regex: RegExp; idByName: Map<string, string> }

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Builds a single regex that matches either a full athlete name or their
 * first name (Claude's prose mostly uses first names after the initial
 * mention), longest-first so "Olivia Roth" wins over a bare "Olivia".
 * Word-boundaried to avoid matching inside unrelated words.
 */
function buildNameMatcher(athletes: { id: string; name: string }[]): NameMatcher | null {
  if (athletes.length === 0) return null
  const idByName = new Map<string, string>()
  const names = new Set<string>()
  for (const a of athletes) {
    names.add(a.name)
    idByName.set(a.name, a.id)
    const first = a.name.split(' ')[0]
    if (first && !idByName.has(first)) {
      names.add(first)
      idByName.set(first, a.id)
    }
  }
  const sorted = [...names].sort((a, b) => b.length - a.length).map(escapeRegExp)
  return { regex: new RegExp(`\\b(?:${sorted.join('|')})\\b`, 'g'), idByName }
}

/**
 * Renders `**bold**` markdown spans and, when a NameMatcher is supplied,
 * turns athlete-name mentions into tappable links to their profile. Single
 * pass over both patterns at once so a name inside a bold span (e.g.
 * "**Olivia's 2K**") doesn't get split in a way that orphans the `**`.
 */
function renderRichText(
  text: string,
  links: { matcher: NameMatcher | null; onAthleteClick?: (id: string) => void },
): ReactNode {
  const boldSrc = '\\*\\*[^*]+\\*\\*'
  const combined = links.matcher
    ? new RegExp(`(${boldSrc})|(${links.matcher.regex.source})`, 'g')
    : new RegExp(`(${boldSrc})`, 'g')

  const out: ReactNode[] = []
  let last = 0
  let key = 0
  let m: RegExpExecArray | null
  while ((m = combined.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1]) {
      out.push(<strong key={key++}>{m[1].slice(2, -2)}</strong>)
    } else if (m[2] && links.matcher) {
      const id = links.matcher.idByName.get(m[2])
      out.push(
        id && links.onAthleteClick ? (
          <button
            key={key++}
            type="button"
            onClick={() => links.onAthleteClick?.(id)}
            className="underline decoration-1 underline-offset-2"
            style={{ color: 'inherit', fontWeight: 500 }}
          >
            {m[2]}
          </button>
        ) : (
          m[2]
        ),
      )
    }
    last = combined.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

type InlinePart = Extract<ChatPart, { kind: 'text' | 'chip' }>
type LineToken = { kind: 'text'; text: string } | Extract<InlinePart, { kind: 'chip' }>

const LIST_MARKER_RE = /^\s*(?:[-*•]|\d+[.)])\s+/

/**
 * Splits a run of text/chip parts into lines on `\n`, keeping citation
 * chips attached to whichever line they fall on. Claude's prose often
 * contains multiple sentences and the occasional "- point" list; without
 * this the whole response rendered as one run-on paragraph with no line
 * breaks (newlines collapse in HTML by default).
 */
function toLines(parts: InlinePart[]): LineToken[][] {
  const lines: LineToken[][] = [[]]
  for (const p of parts) {
    if (p.kind === 'chip') {
      lines[lines.length - 1].push(p)
      continue
    }
    const segments = p.text.split('\n')
    segments.forEach((seg, i) => {
      if (i > 0) lines.push([])
      if (seg.length > 0) lines[lines.length - 1].push({ kind: 'text', text: seg })
    })
  }
  return lines
}

function renderLine(line: LineToken[], stripMarker: boolean, links: AthleteLinks): ReactNode {
  return line.map((t, i) => {
    if (t.kind === 'chip') {
      return <CitationChip key={i} source={t.source} subject={t.subject} date={t.date} />
    }
    const text = stripMarker && i === 0 ? t.text.replace(LIST_MARKER_RE, '') : t.text
    return <span key={i}>{renderRichText(text, links)}</span>
  })
}

/**
 * Renders a run of text/citation parts as proper paragraphs and bullet
 * lists instead of one flat blob. Consecutive "- " / "1. " lines become
 * a dotted list (matching BulletListBlock's visual language); everything
 * else becomes its own paragraph so line breaks in Claude's prose show up.
 */
function InlineGroup({ parts }: { parts: InlinePart[] }) {
  const links = useContext(AthleteLinksContext)
  const lines = toLines(parts)
  const blocks: ReactNode[] = []
  let listBuffer: LineToken[][] = []

  const flushList = () => {
    if (listBuffer.length === 0) return
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="flex flex-col gap-1">
        {listBuffer.map((line, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: SYNTH.aiTextMuted }}
            />
            <span>{renderLine(line, true, links)}</span>
          </li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  lines.forEach((line) => {
    const firstText = line.find((t): t is { kind: 'text'; text: string } => t.kind === 'text')
    const isListLine = !!firstText && LIST_MARKER_RE.test(firstText.text)
    if (isListLine) {
      listBuffer.push(line)
      return
    }
    flushList()
    if (line.length === 0) return
    blocks.push(<p key={`p-${blocks.length}`}>{renderLine(line, false, links)}</p>)
  })
  flushList()

  return <>{blocks}</>
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
  /** Opens the AuroraVoiceOverlay (synth whisper). The composer's idle
   *  button — shown when there is no text — fires this and acts as a
   *  functional mic. When the user starts typing, the same slot
   *  swaps to the send (up-arrow) button. */
  onOpenVoice?: () => void
  attachment?: ChatAttachment | null
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
  onOpenVoice,
  attachment,
  onClearAttachment,
  isStreaming,
  placeholder,
}: ComposerProps) {
  const hasContent = value.trim().length > 0 || !!attachment
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the composer as the coach types instead of clipping a long
  // message to one line. Caps at ~6 lines so a very long paste doesn't
  // swallow the whole screen; it scrolls internally past that.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxHeight = 168
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [value])

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
          {attachment.dataUrl ? (
            // Phase 4 — small inline thumbnail so the coach can see
            // the image they're about to send. Object-cover keeps the
            // aspect ratio sane regardless of source image dimensions.
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              className="h-8 w-8 rounded-md object-cover"
              style={{ border: `1px solid ${SYNTH.aiBorder}` }}
            />
          ) : (
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ background: SYNTH.ink, color: SYNTH.inkOnBrand }}
            >
              {attachment.ext}
            </span>
          )}
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

      {attachment?.dataUrl ? (
        // Image-staged hint. Sets expectations before send: synth
        // doesn't yet classify or tag images automatically; the coach
        // should phrase what they want analysed (catch, finish, etc.).
        // Keeping this UI-side AND in the system prompt is intentional
        // — the prompt makes Claude say it once in the response, but
        // the user still sees it before clicking send and before any
        // network round-trip.
        <p
          className="mb-2 px-1 text-[11px] leading-snug"
          style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}
        >
          synth can't auto-tag images yet. Describe what you want to know,
          or hit send and I'll ask follow-ups.
        </p>
      ) : null}

      <textarea
        ref={textareaRef}
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
        {/* Composer trailing button. Three states, swapped through
            AnimatePresence so the user sees the role flip cleanly:
              - streaming  -> stop (square)
              - has text   -> send (up arrow on emerald)
              - idle       -> mic (opens synth whisper)
            The mic only renders functional when onOpenVoice is wired;
            without the prop it falls back to a silent dark glyph. */}
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
              onClick={onOpenVoice}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.12 }}
              whileTap={{ scale: 0.94 }}
              aria-label="Voice transcribe"
              disabled={!onOpenVoice}
              className="flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-60"
              style={{ background: SYNTH.ink, color: SYNTH.inkOnBrand }}
            >
              <Mic size={16} strokeWidth={2.2} />
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
  /** True when the athlete is on today's attention list. Surfaces in
   *  the scope picker + AddToChatSheet as a "Flagged today" filter
   *  chip so coaches can drill straight to the people who need eyes
   *  without scrolling 46 names. */
  flagged?: boolean
  /** True for the team-wide / fallback scope option. Always pinned
   *  to the top of the picker and immune to the athlete-only filters
   *  (search by name + flagged toggle). */
  pinned?: boolean
}

export type StyleKey = 'synthesized' | 'raw'

/**
 * Phase 4 polish — shared filter logic used by ScopePickerSheet
 * (sheet-style list) and AddToChatSheet (pill-style chips). Both UIs
 * apply the SAME rules so coaches don't have to re-learn the picker
 * depending on which sheet they opened.
 *
 * Rules:
 *   - The pinned option (team scope) is ALWAYS shown at the top,
 *     regardless of search or flagged toggle. The filters are
 *     athlete-only.
 *   - Search is case-insensitive substring match against the
 *     option label.
 *   - flaggedOnly limits the athlete portion to those with
 *     option.flagged === true.
 *   - Order: pinned first (always), then athletes in their input
 *     order (the seed data order is already coach-curated).
 */
export function filterScopes(
  options: ScopeOption[],
  query: string,
  flaggedOnly: boolean,
): { pinned: ScopeOption[]; athletes: ScopeOption[] } {
  const q = query.trim().toLowerCase()
  const pinned: ScopeOption[] = []
  const athletes: ScopeOption[] = []
  for (const o of options) {
    if (o.pinned) {
      pinned.push(o)
      continue
    }
    if (flaggedOnly && !o.flagged) continue
    if (q && !o.label.toLowerCase().includes(q)) continue
    athletes.push(o)
  }
  return { pinned, athletes }
}

/**
 * Shared search input + "Flagged today" toggle. Used by both
 * ScopePickerSheet (list-style) and AddToChatSheet (chip-style) so
 * the filter controls feel identical regardless of which sheet the
 * coach opened. Compact: search row first, filter pill row right
 * underneath. flaggedCount drives the disabled state on the pill —
 * if there's nobody flagged we don't pretend the toggle is useful.
 */
export function ScopeSearchControls({
  query,
  onQueryChange,
  flaggedOnly,
  onToggleFlagged,
  flaggedCount,
  placeholder = 'Search athletes',
  simpleToggle = false,
}: {
  query: string
  onQueryChange: (next: string) => void
  flaggedOnly: boolean
  onToggleFlagged: () => void
  flaggedCount: number
  placeholder?: string
  /** When true, only the Flagged toggle pill renders (no "All athletes"
   *  companion pill). Used in AddToChatSheet where AG flagged the
   *  paired pills as visually redundant: a flagged-vs-not toggle is
   *  enough on that surface. */
  simpleToggle?: boolean
}) {
  const hasFlagged = flaggedCount > 0
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-center gap-2 rounded-2xl border px-3"
        style={{
          background: SYNTH.aiCard,
          borderColor: SYNTH.aiBorder,
          fontFamily: SYNTH.font,
        }}
      >
        <Search size={14} strokeWidth={2.2} color={SYNTH.aiTextMuted} />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full bg-transparent py-2.5 text-[14px] outline-none placeholder:opacity-60"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: SYNTH.sheetMuted, color: SYNTH.aiTextMuted }}
          >
            <X size={11} strokeWidth={2.6} />
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {simpleToggle ? null : (
          <Pill active={!flaggedOnly} onClick={() => flaggedOnly && onToggleFlagged()}>
            All athletes
          </Pill>
        )}
        <Pill
          active={flaggedOnly}
          disabled={!hasFlagged}
          onClick={() => hasFlagged && onToggleFlagged()}
        >
          Flagged today{hasFlagged ? ` · ${flaggedCount}` : ''}
        </Pill>
      </div>
    </div>
  )
}

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

  // Scope search + filter state. Reset on close (not via a useEffect
  // watching `open`) so the next reopen shows cleared controls
  // without tripping the set-state-in-effect lint. Mirrors
  // ScopePickerSheet.
  const [scopeQuery, setScopeQuery] = useState('')
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const handleClose = () => {
    setScopeQuery('')
    setFlaggedOnly(false)
    onClose()
  }

  const flaggedCount = scopeOptions.filter((o) => o.flagged).length
  // AddToChatSheet intentionally drops the team-pinned chip from the
  // results — AG flagged the duplicate "All athletes" / "Pacific
  // Women's Rowing" black pills as visually confusing, and the
  // dedicated ScopePickerSheet (header chip) already covers team
  // scoping. Athletes only here.
  const { athletes } = filterScopes(scopeOptions, scopeQuery, flaggedOnly)
  // Idle = no search, no Flagged toggle. Hide the chip wall in this
  // state. The Scope section then collapses to a search bar plus the
  // single Flagged toggle, which matches AG's "I don't want to see
  // all the other athletes' names" rule.
  const isScopeIdle = scopeQuery.trim() === '' && !flaggedOnly

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
    handleClose()
    onOpenVoice()
  }

  // Athlete view passes a single self-scoped option (their own id)
  // with no flagged metadata. There's nothing meaningful to switch
  // TO, so the entire Scope group is suppressed on that surface —
  // search controls + chip wall + idle hint all hidden together. We
  // only render Scope when there are 2+ athlete options to choose
  // among.
  const showScopeGroup = scopeOptions.filter((o) => !o.pinned).length > 1

  return (
    <SheetShell open={open} onClose={handleClose} title="Add to chat">
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Tile icon={<Camera size={20} strokeWidth={2.2} />} label="Camera" onClick={() => triggerFile('image/*')} />
        <Tile icon={<ImageIcon size={20} strokeWidth={2.2} />} label="Photos" onClick={() => triggerFile('image/*')} />
        <Tile icon={<FileText size={20} strokeWidth={2.2} />} label="Files" onClick={() => triggerFile('*/*')} />
        {onOpenVoice ? (
          <Tile icon={<Mic size={20} strokeWidth={2.2} />} label="Voice" onClick={triggerVoice} />
        ) : null}
      </div>

      {showScopeGroup ? (
      <Group label="Scope">
        <ScopeSearchControls
          query={scopeQuery}
          onQueryChange={setScopeQuery}
          flaggedOnly={flaggedOnly}
          onToggleFlagged={() => setFlaggedOnly((v) => !v)}
          flaggedCount={flaggedCount}
          simpleToggle
        />
        {isScopeIdle ? (
          <p
            className="text-[11px] leading-snug"
            style={{ color: SYNTH.aiTextMuted, fontFamily: SYNTH.font }}
          >
            Search a name or tap Flagged today to scope this chat to a specific athlete.
          </p>
        ) : athletes.length === 0 ? (
          <p
            className="rounded-2xl px-3 py-2 text-[12px]"
            style={{
              background: SYNTH.aiCard,
              border: `1px solid ${SYNTH.aiBorder}`,
              color: SYNTH.aiTextMuted,
              fontFamily: SYNTH.font,
            }}
          >
            No athletes match.
            {flaggedOnly ? ' Try clearing the Flagged filter.' : ''}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {athletes.map((s) => (
              <Pill key={s.id} active={s.id === scopeId} onClick={() => onScopeChange(s.id)}>
                {s.label}
                {s.flagged ? (
                  <span
                    className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
                    style={{ background: SYNTH.accentAmber }}
                    aria-label="Flagged"
                  />
                ) : null}
              </Pill>
            ))}
          </div>
        )}
      </Group>
      ) : null}

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
          handleClose()
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
  disabled,
  children,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border px-3 py-1.5 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
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
