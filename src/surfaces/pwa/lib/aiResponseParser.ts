/**
 * Streaming parser — turns Anthropic's text deltas into a typed
 * `ChatPart[]` for the AI chat surface.
 *
 * The system prompt instructs Claude to embed structured tokens inside
 * its prose:
 *
 *   [c:source|subject|date]                       → citation chip
 *   [chart:title|source|metric|window]            → time-series chart
 *   [table:title|col1,col2|cell,cell|cell,cell]   → data table
 *   [illustration:glyph|caption]                  → SVG glyph card
 *   [callout:tone|title|text]                     → boxed callout
 *   [suggest:Q1|Q2|Q3]                            → tap-to-send chips
 *
 * This parser walks the accumulated text on every delta and rebuilds
 * the `ChatPart[]` from scratch. It's pure and deterministic, so
 * repeated calls during streaming produce stable parts (same input
 * → same output, no animation flicker on re-parse).
 *
 * Streaming safety: when the input ends with an unclosed token (e.g.
 * Claude wrote `[chart:partial` and the next delta hasn't arrived),
 * the literal characters stay in the trailing text part. They get
 * re-parsed once the closing `]` lands.
 *
 * Em-dash policy: the AG-locked rule is "no em-dashes in responses".
 * Even though the system prompt forbids them, defensive sanitisation
 * here guarantees the rule even if Claude slips up.
 */
import type { ChartPoint, ChatPart } from '../primitives/AIChat'

// ─── Public API ────────────────────────────────────────────────────────

export function parseAIText(rawText: string): ChatPart[] {
  if (!rawText) return []
  const text = sanitizeEmDashes(rawText)

  const parts: ChatPart[] = []
  let cursor = 0
  let buffer = ''

  while (cursor < text.length) {
    const tokenStart = text.indexOf('[', cursor)
    if (tokenStart === -1) {
      buffer += text.slice(cursor)
      break
    }

    // Append everything before the `[` to the text buffer.
    buffer += text.slice(cursor, tokenStart)

    const tokenEnd = text.indexOf(']', tokenStart)
    if (tokenEnd === -1) {
      // Unclosed token at the tail. Behaviour depends on the prefix:
      //
      //  • If it looks like a known structured token (`[c:`, `[chart:`,
      //    `[table:`, `[illustration:`, `[suggest:`) we HIDE the
      //    partial. AG explicitly didn't want users seeing literal
      //    `[table:Top 10|Name,Boat...` text mid-stream that flips to
      //    a rendered table once the closing `]` lands. Truncating
      //    here keeps the prose smooth — the next delta will arrive
      //    with the closing `]` and the next parse pass renders the
      //    real block in one shot.
      //
      //  • If it's something else (a stray bracket from the model,
      //    a math expression, a literal markdown link) we keep the
      //    `[` literal in the buffer so the user sees the real text
      //    Claude wrote.
      const partialContent = text.slice(tokenStart + 1)
      if (
        partialContent.startsWith('c:') ||
        partialContent.startsWith('chart:') ||
        partialContent.startsWith('table:') ||
        partialContent.startsWith('illustration:') ||
        partialContent.startsWith('callout:') ||
        partialContent.startsWith('suggest:')
      ) {
        cursor = text.length
        break
      }
      buffer += text.slice(tokenStart)
      cursor = text.length
      break
    }

    const tokenContent = text.slice(tokenStart + 1, tokenEnd)
    const parsed = tryParseToken(tokenContent)

    if (parsed) {
      // Flush text buffer if non-empty.
      if (buffer.length > 0) {
        parts.push({ kind: 'text', text: buffer })
        buffer = ''
      }
      parts.push(parsed)
      cursor = tokenEnd + 1
    } else {
      // Not a known token kind. Keep the literal `[...]` in the text.
      buffer += text.slice(tokenStart, tokenEnd + 1)
      cursor = tokenEnd + 1
    }
  }

  if (buffer.length > 0) {
    parts.push({ kind: 'text', text: buffer })
  }

  return parts
}

// ─── Em-dash sanitiser ─────────────────────────────────────────────────

/**
 * Replace every em-dash (U+2014) and en-dash (U+2013) with a comma
 * plus space. Surrounding whitespace is collapsed in the same step.
 *
 * Rationale: AG explicitly banned em-dashes from synth AI responses.
 * The system prompt says so, but Claude occasionally still emits them.
 * This is the last guardrail before the user sees text.
 */
export function sanitizeEmDashes(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ', ')
}

// ─── Token dispatcher ──────────────────────────────────────────────────

function tryParseToken(content: string): ChatPart | null {
  if (content.startsWith('c:')) return parseChip(content.slice(2))
  if (content.startsWith('chart:')) return parseChart(content.slice(6))
  if (content.startsWith('table:')) return parseTable(content.slice(6))
  if (content.startsWith('illustration:')) return parseIllustration(content.slice(13))
  if (content.startsWith('callout:')) return parseCallout(content.slice(8))
  if (content.startsWith('suggest:')) return parseSuggestions(content.slice(8))
  return null
}

// ─── Per-token parsers ─────────────────────────────────────────────────

function parseChip(payload: string): ChatPart | null {
  const parts = payload.split('|').map((s) => s.trim())
  if (parts.length !== 3) return null
  const [source, subject, date] = parts
  if (!source || !subject || !date) return null
  return { kind: 'chip', source, subject, date }
}

function parseChart(payload: string): ChatPart | null {
  const parts = payload.split('|').map((s) => s.trim())
  if (parts.length !== 4) return null
  const [title, source, metric, window] = parts
  if (!title || !metric) return null
  return {
    kind: 'chart',
    title,
    data: synthChartData(metric, window),
    provenance: source ? `${source}, ${window}, demo data` : undefined,
  }
}

function parseTable(payload: string): ChatPart | null {
  // Format: title|header_csv|row1_csv|row2_csv|...
  const segments = payload.split('|').map((s) => s.trim())
  if (segments.length < 2) return null
  const [title, headerCsv, ...rowCsvs] = segments
  if (!headerCsv) return null
  const columns = splitCsv(headerCsv)
  if (columns.length === 0) return null
  const rows = rowCsvs
    .filter((r) => r.length > 0)
    .map((r) => splitCsv(r))
    // Pad short rows to match column count so the table doesn't render ragged.
    .map((row) => {
      if (row.length < columns.length) {
        return [...row, ...Array(columns.length - row.length).fill('')]
      }
      return row.slice(0, columns.length)
    })
  return { kind: 'table', title, columns, rows }
}

function parseSuggestions(payload: string): ChatPart | null {
  // Format: question1|question2|question3 — pipe-separated, 1-5 items.
  const items = payload
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 120)
    .slice(0, 5)
  if (items.length === 0) return null
  return { kind: 'suggestions', items }
}

function parseCallout(payload: string): ChatPart | null {
  // Format: tone|title|text. Tone must be info|warn|success.
  // Pipes inside the text segment are kept verbatim — we only split
  // on the first two delimiters so an explanatory sentence like
  // "Fast days follow 7+ hour sleep | tracked daily" survives intact.
  const firstPipe = payload.indexOf('|')
  if (firstPipe === -1) return null
  const tone = payload.slice(0, firstPipe).trim()
  if (tone !== 'info' && tone !== 'warn' && tone !== 'success') return null

  const rest = payload.slice(firstPipe + 1)
  const secondPipe = rest.indexOf('|')
  let title: string | undefined
  let text: string
  if (secondPipe === -1) {
    title = undefined
    text = rest.trim()
  } else {
    title = rest.slice(0, secondPipe).trim() || undefined
    text = rest.slice(secondPipe + 1).trim()
  }

  if (!text && !title) return null
  return { kind: 'callout', tone, title, text: text || (title ?? '') }
}

function parseIllustration(payload: string): ChatPart | null {
  const parts = payload.split('|').map((s) => s.trim())
  if (parts.length === 0) return null
  const glyph = parts[0]
  const caption = parts[1]
  if (
    glyph !== 'boat' &&
    glyph !== 'erg' &&
    glyph !== 'trophy' &&
    glyph !== 'heart' &&
    glyph !== 'stopwatch'
  ) {
    return null
  }
  return { kind: 'illustration', glyph, caption: caption || undefined }
}

// ─── Helpers ───────────────────────────────────────────────────────────

function splitCsv(s: string): string[] {
  // Simple comma split. Doesn't try to handle escaped commas — that
  // would require richer syntax than the system prompt instructs Claude
  // to emit. If a cell needs a comma, future versions can use \, escape.
  return s.split(',').map((cell) => cell.trim())
}

/**
 * Deterministic synthetic data for chart placeholders. Phase 5 will
 * replace this with live Supabase reads keyed on metric + window. For
 * now we render a sine-shaped trend with a sensible centre per metric
 * so the chart actually has a visible shape instead of a flat line.
 *
 * Determinism matters: the parser runs on every streaming delta. If
 * this used Math.random the chart would shimmer as new tokens arrive.
 */
function synthChartData(metric: string, window: string): ChartPoint[] {
  const days = parseDayCount(window)
  const centre = chartCentre(metric)
  const variance = chartVariance(metric)
  const points: ChartPoint[] = []
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const label = `${date.getMonth() + 1}/${date.getDate()}`
    const wave = Math.sin((i / Math.max(1, days - 1)) * Math.PI * 1.4)
    const value = centre + wave * variance
    points.push({ label, value: Math.round(value * 10) / 10 })
  }
  return points
}

function parseDayCount(window: string): number {
  const m = window.match(/^(\d+)\s*d/i)
  if (m) return Math.max(2, Math.min(30, parseInt(m[1], 10)))
  if (/week/i.test(window)) return 7
  if (/month/i.test(window)) return 30
  return 7
}

function chartCentre(metric: string): number {
  const m = metric.toLowerCase()
  if (m.includes('recovery')) return 70
  if (m.includes('stroke_rate') || m.includes('rate')) return 30
  if (m.includes('split') || m.includes('2k')) return 110
  if (m.includes('hrv')) return 65
  if (m.includes('sleep')) return 7.5
  if (m.includes('strain')) return 14
  if (m.includes('soreness') || m.includes('energy')) return 6
  return 50
}

function chartVariance(metric: string): number {
  const m = metric.toLowerCase()
  if (m.includes('recovery')) return 8
  if (m.includes('rate')) return 2
  if (m.includes('split')) return 3
  if (m.includes('hrv')) return 10
  if (m.includes('sleep')) return 0.8
  if (m.includes('strain')) return 3
  if (m.includes('soreness') || m.includes('energy')) return 2
  return 5
}
