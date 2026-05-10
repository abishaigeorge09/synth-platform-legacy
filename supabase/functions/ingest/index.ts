// supabase/functions/ingest/index.ts
//
// Slice 1 of "make synth. work" — file ingestion pipeline.
//
// Two actions on one function:
//
//   action: 'parse'   →  body: { storage_path, filename, mime_type, kind, team_id }
//                        Reads bytes from storage.uploads, dispatches to a parser
//                        (CSV/XLSX/PDF/image/paste), calls Claude with the forced
//                        `emit_events` tool, fuzzy-matches each event to an
//                        athlete, writes ingestion_events rows (status=preview)
//                        and a source_uploads row, returns the preview to the
//                        client.
//
//   action: 'confirm' →  body: { source_upload_id, overrides? }
//                        Applies per-row overrides (athlete remap, reject) and
//                        flips status preview → confirmed for the remaining
//                        events. Bumps source_uploads.status to confirmed.
//
// Required Supabase secret:
//   ANTHROPIC_API_KEY
//
// Auth: verify_jwt is enabled at deploy. RLS on source_uploads +
// ingestion_events restricts to auth.uid() = uploaded_by, so the
// user-scoped client below cannot touch other coaches' data.
//
// The Anthropic key never leaves the function. Bytes never leave
// Supabase Storage except to upstream Anthropic for vision/PDF.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import * as XLSX from "npm:xlsx@0.18.5"

// ─── Constants ────────────────────────────────────────────────────────────

const ANTHROPIC_BASE = "https://api.anthropic.com/v1/messages"
const ANTHROPIC_VERSION = "2023-06-01"
// Sonnet 4.6 is the right size for structured-extraction work — cheaper
// than Opus, smarter than Haiku, and handles vision + PDF + tool use.
const ANTHROPIC_MODEL = "claude-sonnet-4-6"
const ANTHROPIC_MAX_TOKENS = 4096

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const ALLOWED_KINDS = new Set(["csv", "xlsx", "pdf", "image", "paste"])
const ALLOWED_CATEGORIES = [
  "erg",
  "gym",
  "wellness",
  "session_note",
  "water",
  "cross_training",
  "sleep",
  "hrv",
  "other",
] as const

// Athlete-match thresholds. ≥0.8 auto-tags; 0.6..0.8 surfaces as
// "low confidence" in the preview UI; below 0.6 leaves athlete_id
// null so the coach has to pick.
const MATCH_AUTO_THRESHOLD = 0.8
const MATCH_FLAG_THRESHOLD = 0.6

const corsHeaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers":
    "authorization, content-type, apikey, x-client-info",
}

// ─── Anthropic tool schema ────────────────────────────────────────────────

const ANTHROPIC_TOOLS = [
  {
    name: "emit_events",
    description:
      "Emit one row per athlete data point found in the file. " +
      "If the file contains a table where each row is one athlete's " +
      "measurement, emit one event per row. If the file is a single " +
      "narrative document about one athlete (e.g. a coach's note), " +
      "emit one event with category='session_note'. Leave athleteName " +
      "blank only if the file is unambiguously about one athlete and " +
      "their name is not in it.",
    input_schema: {
      type: "object",
      properties: {
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              athleteName: {
                type: "string",
                description:
                  "Name as it appears in the source. We'll fuzzy-match " +
                  "this against the team roster.",
              },
              category: {
                type: "string",
                enum: [...ALLOWED_CATEGORIES],
                description:
                  "Coarse bucket. 'erg' for any rowing-machine result. " +
                  "'gym' for strength/lift. 'wellness' for self-rated " +
                  "scores (mood, soreness, energy). 'session_note' for " +
                  "freeform coaching notes. 'water' for on-water rowing. " +
                  "'cross_training' for run/cycle/yoga. 'sleep' for " +
                  "sleep duration/quality. 'hrv' for HRV/RHR. 'other' " +
                  "for anything else.",
              },
              metric: {
                type: "string",
                description:
                  "Snake_case identifier for the specific measurement. " +
                  "Examples: '2k_split', '6k_time', 'rhr', 'hrv_ms', " +
                  "'sleep_hours', 'sleep_quality', 'mood', 'soreness', " +
                  "'note'. Pick a stable key per metric type.",
              },
              value: {
                type: "number",
                description:
                  "Numeric value when applicable. Convert times to " +
                  "seconds (e.g. 1:42.3 → 102.3). Use null for notes.",
              },
              valueText: {
                type: "string",
                description:
                  "Use for non-numeric content: a coaching note, an " +
                  "observation. For numeric metrics leave this blank.",
              },
              unit: {
                type: "string",
                description:
                  "Unit of value. e.g. 'sec', 'bpm', 'ms', 'hours', '/10'.",
              },
              occurredAt: {
                type: "string",
                description:
                  "ISO 8601 timestamp. Use the row's date if present, " +
                  "otherwise the file's date. If unknown, use today.",
              },
              confidence: {
                type: "number",
                description:
                  "Your confidence (0..1) that this row is a real, " +
                  "correctly-extracted event.",
              },
            },
            required: ["category", "metric", "occurredAt"],
          },
        },
        summary: {
          type: "string",
          description:
            "1-2 sentence chat reply describing what you extracted.",
        },
      },
      required: ["events"],
    },
  },
] as const

// ─── Levenshtein (athlete fuzzy-match) ───────────────────────────────────
// Small enough to inline. Returns a similarity score in [0,1] where 1
// is exact match. Normalized by max(len(a), len(b)) so longer typos
// score lower.

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

function nameSimilarity(a: string, b: string): number {
  const na = a.toLowerCase().trim().replace(/\s+/g, " ")
  const nb = b.toLowerCase().trim().replace(/\s+/g, " ")
  if (!na || !nb) return 0
  if (na === nb) return 1
  // First-name / last-name shortcut. If either party gives just one
  // token and it matches a token in the other, that's a strong match.
  const ta = na.split(" ")
  const tb = nb.split(" ")
  if (ta.length === 1 && tb.includes(ta[0])) return 0.9
  if (tb.length === 1 && ta.includes(tb[0])) return 0.9
  // Initials: "M. Smith" → match against "Maria Smith"
  if (
    ta.length === tb.length &&
    ta.every((t, i) => {
      const u = tb[i]
      if (t === u) return true
      if (t.endsWith(".") && u.startsWith(t.slice(0, -1))) return true
      if (u.endsWith(".") && t.startsWith(u.slice(0, -1))) return true
      return false
    })
  ) {
    return 0.85
  }
  const dist = levenshtein(na, nb)
  const max = Math.max(na.length, nb.length)
  return 1 - dist / max
}

type RosterEntry = { id: string; name: string }

function bestMatches(
  candidate: string,
  roster: RosterEntry[],
  topN = 3,
): Array<{ athleteId: string; name: string; score: number }> {
  const scored = roster.map((r) => ({
    athleteId: r.id,
    name: r.name,
    score: nameSimilarity(candidate, r.name),
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topN)
}

// ─── Parsers ─────────────────────────────────────────────────────────────
// Each returns either a structured table-as-text representation that we
// hand to Claude as plain text, OR a content block ready to drop into
// the messages array (for vision / PDF). The unified return is a
// "ParseResult" envelope.

type ParseResult =
  | { kind: "text"; text: string }
  | { kind: "image"; media_type: string; b64: string }
  | { kind: "document"; media_type: string; b64: string }

async function fileToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer())
  // Deno has btoa but it's binary-safe via this pattern:
  let binary = ""
  const chunk = 0x8000
  for (let i = 0; i < buf.length; i += chunk) {
    binary += String.fromCharCode(...buf.subarray(i, i + chunk))
  }
  return btoa(binary)
}

async function parseCsv(blob: Blob): Promise<ParseResult> {
  // Trust the input — we already validated the upload kind. Limit to
  // 200 rows for the extraction prompt; larger files get truncated
  // with a marker so Claude knows. (A future pass can chunk-and-merge.)
  const text = await blob.text()
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0)
  const head = lines.slice(0, 200)
  const truncated = lines.length > 200
  return {
    kind: "text",
    text:
      `CSV file (${lines.length} rows${truncated ? ", first 200 shown" : ""}):\n` +
      "```csv\n" + head.join("\n") + "\n```",
  }
}

async function parseXlsx(blob: Blob): Promise<ParseResult> {
  const buf = new Uint8Array(await blob.arrayBuffer())
  const wb = XLSX.read(buf, { type: "array" })
  const out: string[] = []
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    const lines = csv.split(/\r?\n/).filter((l) => l.length > 0)
    const head = lines.slice(0, 200)
    const truncated = lines.length > 200
    out.push(
      `Sheet "${sheetName}" (${lines.length} rows${truncated ? ", first 200 shown" : ""}):`,
    )
    out.push("```csv\n" + head.join("\n") + "\n```")
  }
  return { kind: "text", text: out.join("\n\n") }
}

async function parsePdf(blob: Blob): Promise<ParseResult> {
  // Anthropic accepts PDF natively via document content blocks.
  const b64 = await fileToBase64(blob)
  return { kind: "document", media_type: "application/pdf", b64 }
}

async function parseImage(
  blob: Blob,
  mimeType: string,
): Promise<ParseResult> {
  const b64 = await fileToBase64(blob)
  // Anthropic supports jpeg/png/gif/webp.
  const mt = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
    mimeType,
  )
    ? mimeType
    : "image/jpeg"
  return { kind: "image", media_type: mt, b64 }
}

// ─── Claude extraction ───────────────────────────────────────────────────

type ExtractedEvent = {
  athleteName?: string
  category: string
  metric: string
  value?: number
  valueText?: string
  unit?: string
  occurredAt: string
  confidence?: number
}

type ExtractionResult =
  | { kind: "events"; events: ExtractedEvent[]; summary: string }
  | { kind: "error"; message: string }

function buildSystemPrompt(roster: RosterEntry[]): string {
  const rosterBlock = roster.length === 0
    ? "(no athletes on the roster yet — leave athleteName as it appears in the file and the coach will tag manually)"
    : roster.map((a) => `- ${a.name}`).join("\n")

  return [
    "You extract structured athlete-performance events from coach-uploaded files.",
    "Always call the emit_events tool exactly once.",
    "",
    "## Team roster",
    "These are the athletes whose names should appear in athleteName when " +
      "you can identify them. Use the name as written in the file — we'll " +
      "fuzzy-match it server-side. If you can't identify a row's athlete, " +
      "still emit the event but leave athleteName blank.",
    rosterBlock,
    "",
    "## Rules",
    "1. Emit one event per (athlete, date, metric) tuple. A CSV row with " +
      "10 columns produces multiple events if the columns are different " +
      "metrics.",
    "2. For erg results, convert times to total seconds (e.g. 7:21.4 → 441.4).",
    "3. Pick a stable snake_case metric key per metric type. Examples: " +
      "'2k_split' (seconds per 500m, e.g. 102.3), '2k_time' (total " +
      "seconds), '6k_time', 'rhr' (bpm), 'hrv_ms', 'sleep_hours', " +
      "'sleep_quality' (out of 10), 'mood', 'soreness', 'energy', 'note'.",
    "4. For session_note category, use metric='note' and put the text in " +
      "valueText. Leave value/unit blank.",
    "5. Use ISO 8601 for occurredAt. If the row has only a date, use the " +
      "start of that day in UTC.",
    "6. Set confidence based on how unambiguous the row is. A clean tabular " +
      "row with all columns labeled is 0.9+; an OCR'd handwritten note is " +
      "0.4-0.6.",
    "7. Do not invent data. If a column is empty, omit that field.",
  ].join("\n")
}

async function extractEvents(
  apiKey: string,
  parseResult: ParseResult,
  roster: RosterEntry[],
): Promise<ExtractionResult> {
  const userContent: Array<Record<string, unknown>> = []

  // Lead with a description of what's coming.
  if (parseResult.kind === "text") {
    userContent.push({
      type: "text",
      text:
        "Extract structured athlete events from the following file " +
        "contents.\n\n" + parseResult.text,
    })
  } else if (parseResult.kind === "image") {
    userContent.push({
      type: "text",
      text:
        "Extract structured athlete events from this image (likely a " +
        "screenshot of a coaching dashboard, erg display, whiteboard, or " +
        "handwritten note).",
    })
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: parseResult.media_type,
        data: parseResult.b64,
      },
    })
  } else if (parseResult.kind === "document") {
    userContent.push({
      type: "text",
      text:
        "Extract structured athlete events from this PDF document.",
    })
    userContent.push({
      type: "document",
      source: {
        type: "base64",
        media_type: parseResult.media_type,
        data: parseResult.b64,
      },
    })
  }

  const res = await fetch(ANTHROPIC_BASE, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "anthropic-version": ANTHROPIC_VERSION,
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: ANTHROPIC_MAX_TOKENS,
      system: buildSystemPrompt(roster),
      messages: [{ role: "user", content: userContent }],
      tools: ANTHROPIC_TOOLS,
      tool_choice: { type: "tool", name: "emit_events" },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    return { kind: "error", message: `Anthropic ${res.status}: ${text}` }
  }

  const json = (await res.json()) as {
    content?: Array<Record<string, unknown>>
  }
  const block = (json.content ?? []).find((c) => c.type === "tool_use")
  if (!block) {
    return { kind: "error", message: "No tool_use block in response" }
  }
  const input = block.input as Record<string, unknown>
  const events = Array.isArray(input.events)
    ? (input.events as ExtractedEvent[])
    : []
  const summary =
    typeof input.summary === "string" ? input.summary : ""

  // Light validation — drop events with bad category.
  const cleaned = events.filter((e) => {
    if (!e || typeof e !== "object") return false
    if (typeof e.category !== "string") return false
    if (!(ALLOWED_CATEGORIES as readonly string[]).includes(e.category)) return false
    if (typeof e.metric !== "string" || e.metric.length === 0) return false
    if (typeof e.occurredAt !== "string" || e.occurredAt.length === 0) return false
    return true
  })

  return { kind: "events", events: cleaned, summary }
}

// ─── Roster loader ───────────────────────────────────────────────────────

async function loadRoster(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  team_id: string,
): Promise<RosterEntry[]> {
  // Pull active athletes for the team. We don't yet have a guaranteed
  // schema for `athletes` in production (this app is UI-first against
  // seeds), but if the table exists we use it; otherwise return [].
  try {
    const { data, error } = await supabase
      .from("athletes")
      .select("id, name")
      .eq("team_id", team_id)
      .eq("status", "active")
    if (error) {
      console.warn("[ingest] athletes table query failed, continuing without roster:", error.message)
      return []
    }
    return ((data ?? []) as Array<{ id: string; name: string }>).map((r) => ({
      id: r.id,
      name: r.name,
    }))
  } catch (err) {
    console.warn("[ingest] athletes table not available, no roster context:", err)
    return []
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method !== "POST") return jsonError(405, "Method not allowed")

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return jsonError(400, "Body must be valid JSON")
  }

  const action = typeof body.action === "string" ? body.action : ""
  if (action !== "parse" && action !== "confirm") {
    return jsonError(400, "action must be 'parse' or 'confirm'")
  }

  const authHeader = req.headers.get("authorization") ?? ""
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonError(500, "Server misconfigured: Supabase env missing")
  }
  if (!apiKey) {
    return jsonError(500, "Server misconfigured: ANTHROPIC_API_KEY missing")
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { authorization: authHeader } },
  })

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return jsonError(401, "Not authenticated")

  if (action === "parse") return await handleParse(supabase, user.id, apiKey, body)
  return await handleConfirm(supabase, user.id, body)
})

// ─── /parse ──────────────────────────────────────────────────────────────

async function handleParse(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string,
  apiKey: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const storage_path = typeof body.storage_path === "string" ? body.storage_path : ""
  const filename = typeof body.filename === "string" ? body.filename : ""
  const mime_type = typeof body.mime_type === "string" ? body.mime_type : ""
  const kind = typeof body.kind === "string" ? body.kind : ""
  const team_id = typeof body.team_id === "string" ? body.team_id : ""

  if (!storage_path || !filename || !mime_type) {
    return jsonError(400, "storage_path, filename, mime_type required")
  }
  if (!ALLOWED_KINDS.has(kind)) {
    return jsonError(400, `kind must be one of: ${[...ALLOWED_KINDS].join(", ")}`)
  }
  // team_id is text now (slice 1) so any non-empty string is acceptable.
  // We previously enforced UUID-only; that broke uploads from the seed
  // /coach surface where useTeamStore returns 'team-cal-womens-rowing'.

  // Path safety: enforce that the storage path lives under {userId}/.
  // The Storage RLS policy enforces this too, but a server-side check
  // gives better error messages and avoids a wasted Storage call.
  if (!storage_path.startsWith(`${userId}/`)) {
    return jsonError(403, "storage_path must live under your user prefix")
  }

  // Download bytes.
  const { data: blob, error: dlError } = await supabase.storage
    .from("uploads")
    .download(storage_path)
  if (dlError || !blob) {
    return jsonError(404, `Storage download failed: ${dlError?.message ?? "no blob"}`)
  }

  // Create source_uploads row in 'parsing' state.
  const { data: uploadRow, error: insertError } = await supabase
    .from("source_uploads")
    .insert({
      team_id: team_id || userId, // fallback: single-user team
      uploaded_by: userId,
      storage_path,
      filename,
      mime_type,
      size_bytes: blob.size,
      kind,
      status: "parsing",
    })
    .select("*")
    .single()
  if (insertError || !uploadRow) {
    console.error("[ingest] source_uploads insert failed", insertError)
    return jsonError(500, "Failed to record upload")
  }

  // Dispatch parser.
  let parsed: ParseResult
  try {
    if (kind === "csv") parsed = await parseCsv(blob)
    else if (kind === "xlsx") parsed = await parseXlsx(blob)
    else if (kind === "pdf") parsed = await parsePdf(blob)
    else if (kind === "image") parsed = await parseImage(blob, mime_type)
    else parsed = { kind: "text", text: await blob.text() }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await supabase
      .from("source_uploads")
      .update({ status: "failed", parse_error: `Parse error: ${msg}` })
      .eq("id", uploadRow.id)
    return jsonError(422, `Failed to parse ${kind}: ${msg}`)
  }

  // Extract events via Claude. loadRoster expects a UUID team_id since
  // public.athletes.team_id is uuid-typed; if the caller passed a seed
  // string ('team-cal-womens-rowing'), skip roster lookup so the coach
  // tags manually from the dropdown.
  const roster = team_id && UUID_REGEX.test(team_id)
    ? await loadRoster(supabase, team_id)
    : []
  const extraction = await extractEvents(apiKey, parsed, roster)
  if (extraction.kind === "error") {
    await supabase
      .from("source_uploads")
      .update({ status: "failed", parse_error: extraction.message })
      .eq("id", uploadRow.id)
    return jsonError(502, extraction.message)
  }

  // Match each event to an athlete. Track top-3 candidates so the
  // preview UI can show suggestions even on auto-tagged rows in case
  // the coach wants to override.
  const candidates: Record<
    number,
    Array<{ athleteId: string; name: string; score: number }>
  > = {}
  const eventRows = extraction.events.map((evt, idx) => {
    const matches = evt.athleteName
      ? bestMatches(evt.athleteName, roster, 3)
      : []
    const top = matches[0]
    candidates[idx] = matches
    const athleteId =
      top && top.score >= MATCH_AUTO_THRESHOLD ? top.athleteId : null
    return {
      team_id: uploadRow.team_id,
      athlete_id: athleteId,
      source_upload_id: uploadRow.id,
      occurred_at: evt.occurredAt,
      category: evt.category,
      metric: evt.metric,
      value: typeof evt.value === "number" ? evt.value : null,
      value_text: typeof evt.valueText === "string" ? evt.valueText : null,
      unit: typeof evt.unit === "string" ? evt.unit : null,
      athlete_name_raw: evt.athleteName ?? null,
      extraction_confidence:
        typeof evt.confidence === "number" ? evt.confidence : null,
      match_confidence: top ? top.score : null,
      raw: evt,
      status: "preview",
    }
  })

  let insertedEvents: Array<Record<string, unknown>> = []
  if (eventRows.length > 0) {
    const { data, error } = await supabase
      .from("ingestion_events")
      .insert(eventRows)
      .select("*")
    if (error) {
      console.error("[ingest] ingestion_events insert failed", error)
      await supabase
        .from("source_uploads")
        .update({
          status: "failed",
          parse_error: `Event persist failed: ${error.message}`,
        })
        .eq("id", uploadRow.id)
      return jsonError(500, "Failed to persist extracted events")
    }
    insertedEvents = data ?? []
  }

  // Bump source_uploads → preview.
  const { data: finalUpload } = await supabase
    .from("source_uploads")
    .update({
      status: "preview",
      events_extracted: insertedEvents.length,
    })
    .eq("id", uploadRow.id)
    .select("*")
    .single()

  // Return preview keyed by event id (more stable than index).
  const candidatesByEventId: Record<
    string,
    Array<{ athleteId: string; name: string; score: number }>
  > = {}
  insertedEvents.forEach((row, idx) => {
    const id = row.id as string
    candidatesByEventId[id] = candidates[idx] ?? []
  })

  return ok({
    upload: finalUpload ?? uploadRow,
    events: insertedEvents,
    candidates: candidatesByEventId,
    summary: extraction.summary,
  })
}

// ─── /confirm ────────────────────────────────────────────────────────────

type RowOverride = {
  event_id: string
  athlete_id?: string | null  // explicit retag
  reject?: boolean             // mark as rejected instead of confirmed
}

async function handleConfirm(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const source_upload_id =
    typeof body.source_upload_id === "string" ? body.source_upload_id : ""
  if (!UUID_REGEX.test(source_upload_id)) {
    return jsonError(400, "source_upload_id must be a UUID")
  }
  const overrides = Array.isArray(body.overrides)
    ? (body.overrides as RowOverride[])
    : []

  // Verify ownership (RLS will too, but a clean 403 beats a silent empty).
  const { data: upload, error: uploadError } = await supabase
    .from("source_uploads")
    .select("*")
    .eq("id", source_upload_id)
    .single()
  if (uploadError || !upload) return jsonError(404, "Upload not found")
  if (upload.uploaded_by !== userId) return jsonError(403, "Not your upload")

  // Apply overrides one at a time. Small N (a single upload, max
  // ~hundreds of events) so a per-row update is fine and lets RLS
  // do its job.
  for (const o of overrides) {
    if (!o || typeof o.event_id !== "string") continue
    if (o.reject) {
      await supabase
        .from("ingestion_events")
        .update({ status: "rejected" })
        .eq("id", o.event_id)
        .eq("source_upload_id", source_upload_id)
    } else if (o.athlete_id !== undefined) {
      await supabase
        .from("ingestion_events")
        .update({ athlete_id: o.athlete_id })
        .eq("id", o.event_id)
        .eq("source_upload_id", source_upload_id)
    }
  }

  // Flip remaining preview rows to confirmed.
  const { data: confirmed, error: confirmError } = await supabase
    .from("ingestion_events")
    .update({ status: "confirmed" })
    .eq("source_upload_id", source_upload_id)
    .eq("status", "preview")
    .select("id")
  if (confirmError) {
    console.error("[ingest] confirm failed", confirmError)
    return jsonError(500, "Failed to confirm events")
  }

  await supabase
    .from("source_uploads")
    .update({
      status: "confirmed",
      events_confirmed: (confirmed ?? []).length,
    })
    .eq("id", source_upload_id)

  return ok({
    source_upload_id,
    confirmed_count: (confirmed ?? []).length,
    rejected_count: overrides.filter((o) => o.reject).length,
  })
}

// ─── helpers ──────────────────────────────────────────────────────────────

function ok(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, "content-type": "application/json" },
  })
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  })
}
