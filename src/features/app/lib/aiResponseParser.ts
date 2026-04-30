/**
 * Parses a completed AI response string into structured ChatPart[].
 *
 * The AI is instructed to emit:
 *   [c:Source|Subject|YYYY-MM-DD]  → chip (citation)
 *   [chart:Title|L1:v1,L2:v2,...] → line chart
 *
 * Everything else is kept as text (markdown rendered in the bubble).
 */
import type { ChatPart, ChartPoint } from '../primitives/AIChat'

const CHART_RE = /\[chart:([^\]]+)\]/g
const CHIP_RE = /\[c:([^|\]]+)\|([^|\]]+)\|([^\]]+)\]/g

function parseChips(text: string): ChatPart[] {
  const parts: ChatPart[] = []
  let last = 0
  let m: RegExpExecArray | null

  CHIP_RE.lastIndex = 0
  while ((m = CHIP_RE.exec(text)) !== null) {
    const before = text.slice(last, m.index)
    if (before) parts.push({ kind: 'text', text: before })
    parts.push({ kind: 'chip', source: m[1].trim(), subject: m[2].trim(), date: m[3].trim() })
    last = m.index + m[0].length
  }
  const tail = text.slice(last)
  if (tail) parts.push({ kind: 'text', text: tail })

  return parts
}

function parseChartMarker(inner: string): Extract<ChatPart, { kind: 'chart' }> | null {
  const pipeIdx = inner.indexOf('|')
  if (pipeIdx < 0) return null
  const title = inner.slice(0, pipeIdx).trim()
  const dataStr = inner.slice(pipeIdx + 1).trim()
  const data: ChartPoint[] = []
  for (const pair of dataStr.split(',')) {
    const colonIdx = pair.lastIndexOf(':')
    if (colonIdx < 0) continue
    const label = pair.slice(0, colonIdx).trim()
    const value = Number(pair.slice(colonIdx + 1).trim())
    if (label && !Number.isNaN(value)) data.push({ label, value })
  }
  if (data.length < 2) return null
  return { kind: 'chart', title, data }
}

export function parseAIResponse(text: string): ChatPart[] {
  const parts: ChatPart[] = []

  let last = 0
  let m: RegExpExecArray | null
  CHART_RE.lastIndex = 0

  while ((m = CHART_RE.exec(text)) !== null) {
    const before = text.slice(last, m.index).trim()
    if (before) {
      parts.push(...parseChips(before))
    }
    const chart = parseChartMarker(m[1])
    if (chart) parts.push(chart)
    last = m.index + m[0].length
  }

  const tail = text.slice(last).trim()
  if (tail) {
    parts.push(...parseChips(tail))
  }

  // Collapse adjacent empty text parts
  return parts.filter(
    (p): boolean => p.kind !== 'text' || (p as Extract<ChatPart, { kind: 'text' }>).text.trim().length > 0,
  )
}
