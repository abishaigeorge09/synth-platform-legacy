// supabase/functions/tool-generate/index.ts
//
// Sprint 9.1 — Anthropic-powered vibe-code tool generator.
//
// Coach POSTs a description plus optional refinement context. The function:
//   1. Authenticates the caller via JWT (verify_jwt is on at deploy).
//   2. Inserts (or reuses) a row in public.tool_requests.
//   3. Pre-flights the team's connector_accounts so Claude knows which
//      sources are wired (Concept2, Strava, WHOOP, Sheets) and can warn
//      the coach when a generated spec depends on a missing connector.
//   4. Loads prior tool_versions for the request → assistant chat history.
//   5. Calls Anthropic /v1/messages with three tools (function calling):
//        emit_spec, request_clarification, decline_request.
//      The model is forced to choose exactly one via tool_choice = any.
//   6. Validates the spec (schema_version, kebab-case id, scope/category
//      enums, elements array). Retries once with the validation error if
//      Claude's first emit_spec is malformed.
//   7. Persists the result as a tool_versions row with kind = 'spec' |
//      'clarification' | 'declined'. Returns the full payload to the caller.
//
// Required Supabase secret:
//   ANTHROPIC_API_KEY   — sk-ant-... key with /v1/messages access.
//
// JWT verification + RLS are the security boundary: every insert lands
// through a user-scoped client so only members of the team can write to
// these tables. The Anthropic key never leaves the function.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

// ─── Constants ────────────────────────────────────────────────────────────

const ANTHROPIC_BASE = "https://api.anthropic.com/v1/messages"
const ANTHROPIC_VERSION = "2023-06-01"
const ANTHROPIC_MODEL = "claude-opus-4-7"
const ANTHROPIC_MAX_TOKENS = 3072

const ALLOWED_ROLES = new Set(["head_coach", "assistant_coach", "athlete"])
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const KEBAB_REGEX = /^[a-z][a-z0-9-]*$/
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/
const MIN_DESCRIPTION_LEN = 3
const MAX_DESCRIPTION_LEN = 2000

const corsHeaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers":
    "authorization, content-type, apikey, x-client-info",
}

// Mirrors src/lib/tools/capabilities.ts. Keep in lock-step.
const SUPPORTED_ELEMENTS = [
  "stat", "line_chart", "bar_chart", "table", "athlete_card", "boat_lineup",
  "timer", "badge", "button", "input", "select", "text", "boat_race",
  "lineup_picker",
] as const
const SUPPORTED_SOURCES = [
  "concept2", "strava", "whoop", "sheets", "manual", "computed", "static",
] as const
const SUPPORTED_INPUTS = [
  "athlete_id", "team_id", "text", "number", "date_range", "select",
] as const
const SUPPORTED_SCOPES = ["team", "athlete", "self"] as const
const SUPPORTED_CATEGORIES = [
  "lineups", "timing", "analysis", "coaching", "data", "wellness",
] as const
const SUPPORTED_SCHEMA_VERSIONS = [1, 2] as const
const CONNECTOR_SOURCES = ["concept2", "strava", "whoop", "sheets"] as const

// Compact unsupported list — Claude reads this as the decline rule book.
const UNSUPPORTED_CAPABILITIES = [
  { id: "computer_vision", reason: "synth's renderer is charts and tables, no CV/video pipeline.", alternative: "A self-rated form score over time as a sparkline." },
  { id: "video_form_analysis", reason: "No biomechanics or pose estimation in the MVP.", alternative: "A coach-rated form journal with 1-5 score plotted over sessions." },
  { id: "realtime_gps", reason: "Live GPS streaming isn't a synth capability; Strava lands post-workout.", alternative: "Post-practice piece-by-piece breakdown from Strava." },
  { id: "voice_audio", reason: "Audio capture and transcription aren't supported.", alternative: "Typed quick-notes per session." },
  { id: "ml_predictions", reason: "synth surfaces data, doesn't run ML inference.", alternative: "A load dashboard flagging athletes >15% above 28-day baseline." },
  { id: "native_camera", reason: "Direct camera access from a generated tool isn't supported.", alternative: "Photo upload through the standard session-detail screen." },
  { id: "biomechanics_sensor", reason: "No IMU/accelerometer ingest; WHOOP and Concept2 are the supported wearables.", alternative: "Dashboard built from WHOOP recovery + Concept2 erg data." },
  { id: "free_form_chatbot", reason: "Generated tools render dashboards and forms, not chat surfaces.", alternative: "A 3-question wellness pulse with rolling charts." },
]

// ─── Anthropic tool schemas (function calling) ────────────────────────────

const ANTHROPIC_TOOLS = [
  {
    name: "emit_spec",
    description:
      "Generate the final JSON tool spec when you have enough information " +
      "to build. The spec must conform to the synth tool schema (see system " +
      "prompt). Use this for any supported request — including ones that " +
      "need a connector the team hasn't wired yet (mention the missing " +
      "connector in your summary).",
    input_schema: {
      type: "object",
      properties: {
        spec: {
          type: "object",
          description:
            "The complete ToolSpec object. Required fields: schema_version " +
            "(1 or 2), id (kebab-case), name, description, category, " +
            "icon_key, version (semver), scope, inputs (array), bindings " +
            "(object), elements (array). Optional: pages (array of pages, " +
            "v2 only).",
          additionalProperties: true,
        },
        summary: {
          type: "string",
          description:
            "1-3 sentence chat reply describing what you built and any " +
            "missing connectors the coach should know about.",
        },
      },
      required: ["spec", "summary"],
    },
  },
  {
    name: "request_clarification",
    description:
      "Ask 1-3 specific questions when the coach's request is ambiguous. " +
      "Don't use this for trivial details you can pick yourself — only " +
      "when the answer materially changes the spec.",
    input_schema: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 3,
          description: "Short, direct questions. No yes/no chains.",
        },
        summary: {
          type: "string",
          description:
            "A brief intro for the chat, e.g. 'Got it — a few quick " +
            "questions before I scaffold this.'",
        },
      },
      required: ["questions", "summary"],
    },
  },
  {
    name: "decline_request",
    description:
      "Decline when the ask requires a capability the MVP doesn't have " +
      "(see the unsupported list in the system prompt). MUST suggest a " +
      "concrete alternative the coach can build today.",
    input_schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description:
            "Plain-English explanation of which capability is missing.",
        },
        suggested_alternative: {
          type: "string",
          description:
            "A specific, buildable alternative using supported elements " +
            "and sources.",
        },
      },
      required: ["reason", "suggested_alternative"],
    },
  },
]

// ─── System prompt builder ────────────────────────────────────────────────

function buildSystemPrompt(args: {
  connectedSources: string[]
  unconnectedSources: string[]
}): string {
  const elementsLine = SUPPORTED_ELEMENTS.join(", ")
  const sourcesLine = SUPPORTED_SOURCES.join(", ")
  const inputsLine = SUPPORTED_INPUTS.join(", ")
  const scopesLine = SUPPORTED_SCOPES.join(", ")
  const categoriesLine = SUPPORTED_CATEGORIES.join(", ")
  const versionsLine = SUPPORTED_SCHEMA_VERSIONS.join(", ")

  const unsupportedBlock = UNSUPPORTED_CAPABILITIES
    .map((c) => `- ${c.id}: ${c.reason} Alternative angle: ${c.alternative}`)
    .join("\n")

  const connectorBlock = [
    `Connected sources for this team: ${
      args.connectedSources.length > 0
        ? args.connectedSources.join(", ")
        : "none"
    }`,
    `Unconnected (must mention if used): ${
      args.unconnectedSources.length > 0
        ? args.unconnectedSources.join(", ")
        : "none"
    }`,
  ].join("\n")

  return [
    "You are synth's vibe-code tool builder. A coach describes a tool they want; you respond by calling exactly one of three tools: emit_spec, request_clarification, or decline_request.",
    "",
    "## What you can build",
    `Element types: ${elementsLine}.`,
    `Binding sources: ${sourcesLine}.`,
    `Input kinds: ${inputsLine}.`,
    `Scopes: ${scopesLine}.`,
    `Categories: ${categoriesLine}.`,
    `Schema versions: ${versionsLine}. Use schema_version 2 only when the spec includes boat_race or lineup_picker elements; otherwise use 1.`,
    "",
    "## Spec shape",
    "Required top-level fields: schema_version, id (kebab-case lowercase only, regex /^[a-z][a-z0-9-]*$/), name, description, category, icon_key, version (semver, e.g. 1.0.0), scope, inputs (array, can be empty), bindings (object, source must be one of the listed sources, params is freeform), elements (array). Optional: pages (array of {id, title, elements} — only with schema_version 2; when present, top-level elements should be empty).",
    "",
    "Each element has type + type-specific fields. Examples:",
    "- {type: 'stat', label, value: number|string|{binding: 'name'}, unit?, trend?}",
    "- {type: 'line_chart' | 'bar_chart', title, xKey, yKeys: string[], dataKey}",
    "- {type: 'table', title?, columns: [{key, label}], dataKey}",
    "- {type: 'athlete_card', dataKey} | {type: 'boat_lineup', dataKey}",
    "- {type: 'timer', label, mode: 'stopwatch'|'countdown', durationMs?}",
    "- {type: 'badge', label, tone: 'info'|'success'|'warning'|'danger'}",
    "- {type: 'button', label, action: {kind: 'noop'|'submit'|'reset', payload?}}",
    "- {type: 'input', name, label, kind: 'text'|'number'|'date', placeholder?}",
    "- {type: 'select', name, label, options: [{value, label}]}",
    "- {type: 'text', content, tone?: 'body'|'kicker'|'caption'}",
    "- {type: 'boat_race', dataKey, durationMs?, filterStateKey?} (v2)",
    "- {type: 'lineup_picker', dataKey, stateKey, title?} (v2)",
    "",
    "## Capabilities the MVP does NOT have",
    "If the coach's request maps to one of these, call decline_request with the reason + suggested_alternative.",
    unsupportedBlock,
    "",
    "## Connector status",
    connectorBlock,
    "When a generated spec uses an unconnected source, the resolver falls back to seeded demo data. Mention this in your summary so the coach knows: e.g., 'Using demo data — connect Concept2 in Sources to see real numbers.'",
    "",
    "## Examples",
    "Coach: 'Stroke rate logger from Concept2'",
    "→ emit_spec with a single-page spec: stat (current rate, binding rate_history), line_chart (rate over 7 days, dataKey rate_history), text input (note). schema_version 1.",
    "",
    "Coach: 'Boat lineup racer with animations'",
    "→ emit_spec with a multi-page schema_version 2 spec: pages = [{id:'lineups', elements:[lineup_picker]}, {id:'race', elements:[boat_race with filterStateKey]}, {id:'results', elements:[table]}]. Bindings include available_boats (static), selected_boats (static array of names), race_results (static).",
    "",
    "Coach: 'Tool that grades rower form from a video'",
    "→ decline_request: reason references the video_form_analysis entry, suggested_alternative is a coach-rated form journal.",
    "",
    "Coach: 'Show me athlete stats'",
    "→ request_clarification: questions = ['Which athlete or team-wide?', 'What metrics — erg, wellness, or both?', 'Last 7 or 30 days?'].",
    "",
    "## Rules",
    "1. ALWAYS call exactly one tool. Never reply with plain text.",
    "2. ids must be kebab-case and unique per session.",
    "3. version must be semver (e.g. 1.0.0).",
    "4. category must be one of: lineups, timing, analysis, coaching, data, wellness.",
    "5. scope must be one of: team, athlete, self.",
    "6. Only use binding sources from the supported list. NEVER invent new sources.",
    "7. Only use element types from the supported list. NEVER invent new types.",
    "8. Keep the summary tight and direct. The coach is busy.",
    "9. When refining (multi-turn), preserve the spec id unless the coach asks to rename. Just bump the version's patch number.",
  ].join("\n")
}

// ─── Spec validation (basic — frontend re-validates with zod) ─────────────

type ValidationError = string | null

function validateSpec(spec: unknown): ValidationError {
  if (!spec || typeof spec !== "object") return "spec must be an object"
  const s = spec as Record<string, unknown>

  if (typeof s.schema_version !== "number" ||
    !SUPPORTED_SCHEMA_VERSIONS.includes(s.schema_version as 1 | 2)) {
    return `schema_version must be one of ${SUPPORTED_SCHEMA_VERSIONS.join(", ")}`
  }
  if (typeof s.id !== "string" || !KEBAB_REGEX.test(s.id)) {
    return "id must be kebab-case (e.g. 'stroke-rate-logger')"
  }
  if (typeof s.name !== "string" || s.name.length === 0) return "name is required"
  if (typeof s.description !== "string") return "description is required"
  if (typeof s.icon_key !== "string" || s.icon_key.length === 0) return "icon_key is required"
  if (typeof s.version !== "string" || !SEMVER_REGEX.test(s.version)) {
    return "version must be semver (e.g. '1.0.0')"
  }
  if (typeof s.category !== "string" ||
    !(SUPPORTED_CATEGORIES as readonly string[]).includes(s.category)) {
    return `category must be one of: ${SUPPORTED_CATEGORIES.join(", ")}`
  }
  if (typeof s.scope !== "string" ||
    !(SUPPORTED_SCOPES as readonly string[]).includes(s.scope)) {
    return `scope must be one of: ${SUPPORTED_SCOPES.join(", ")}`
  }

  if (!Array.isArray(s.inputs)) return "inputs must be an array"
  if (!s.bindings || typeof s.bindings !== "object" || Array.isArray(s.bindings)) {
    return "bindings must be an object"
  }
  for (const [bname, b] of Object.entries(s.bindings as Record<string, unknown>)) {
    const bb = b as Record<string, unknown>
    if (!bb || typeof bb !== "object") return `bindings.${bname} must be an object`
    if (typeof bb.source !== "string" ||
      !(SUPPORTED_SOURCES as readonly string[]).includes(bb.source)) {
      return `bindings.${bname}.source must be one of: ${SUPPORTED_SOURCES.join(", ")}`
    }
  }

  if (!Array.isArray(s.elements)) return "elements must be an array"
  const allElements: unknown[] = [...(s.elements as unknown[])]
  if (Array.isArray(s.pages)) {
    if (s.schema_version !== 2) return "pages requires schema_version: 2"
    for (const p of s.pages as Array<Record<string, unknown>>) {
      if (typeof p.id !== "string" || !KEBAB_REGEX.test(p.id)) return "page id must be kebab-case"
      if (typeof p.title !== "string") return "page title required"
      if (!Array.isArray(p.elements)) return "page elements must be array"
      allElements.push(...(p.elements as unknown[]))
    }
  }

  for (const el of allElements) {
    const e = el as Record<string, unknown>
    if (!e || typeof e !== "object") return "every element must be an object"
    if (typeof e.type !== "string" ||
      !(SUPPORTED_ELEMENTS as readonly string[]).includes(e.type)) {
      return `element type "${String(e.type)}" not supported. Use: ${SUPPORTED_ELEMENTS.join(", ")}`
    }
  }

  for (const inp of s.inputs as Array<Record<string, unknown>>) {
    if (typeof inp.kind !== "string" ||
      !(SUPPORTED_INPUTS as readonly string[]).includes(inp.kind)) {
      return `input kind "${String(inp.kind)}" not supported. Use: ${SUPPORTED_INPUTS.join(", ")}`
    }
  }

  return null
}

// ─── Connector pre-flight ─────────────────────────────────────────────────

async function getConnectedSources(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  team_id: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("connector_accounts")
    .select("source")
    .eq("team_id", team_id)
    .eq("status", "connected")
  if (error) {
    console.error("connector_accounts query failed", error)
    return []
  }
  const set = new Set<string>()
  for (const row of (data ?? []) as Array<{ source?: string }>) {
    if (row.source) set.add(row.source)
  }
  return [...set]
}

function findUnmetConnectors(
  spec: Record<string, unknown>,
  connectedSources: string[],
): string[] {
  const bindings = spec.bindings as Record<string, { source?: string }> | undefined
  if (!bindings) return []
  const used = new Set<string>()
  for (const b of Object.values(bindings)) {
    if (b?.source && (CONNECTOR_SOURCES as readonly string[]).includes(b.source)) {
      used.add(b.source)
    }
  }
  return [...used].filter((s) => !connectedSources.includes(s))
}

// ─── Anthropic call ───────────────────────────────────────────────────────

type AnthropicMessage = {
  role: "user" | "assistant"
  content: string | Array<Record<string, unknown>>
}

type ToolUseResult =
  | { kind: "spec"; input: { spec: Record<string, unknown>; summary: string } }
  | { kind: "clarification"; input: { questions: string[]; summary: string } }
  | { kind: "decline"; input: { reason: string; suggested_alternative: string } }
  | { kind: "error"; message: string }

async function callAnthropic(
  apiKey: string,
  system: string,
  messages: AnthropicMessage[],
): Promise<ToolUseResult> {
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
      system,
      messages,
      tools: ANTHROPIC_TOOLS,
      tool_choice: { type: "any" },
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
  if (!block) return { kind: "error", message: "No tool_use block in Anthropic response" }

  const name = block.name as string
  const input = block.input as Record<string, unknown>

  if (name === "emit_spec") {
    return {
      kind: "spec",
      input: {
        spec: input.spec as Record<string, unknown>,
        summary: typeof input.summary === "string" ? input.summary : "",
      },
    }
  }
  if (name === "request_clarification") {
    return {
      kind: "clarification",
      input: {
        questions: Array.isArray(input.questions) ? (input.questions as string[]) : [],
        summary: typeof input.summary === "string" ? input.summary : "",
      },
    }
  }
  if (name === "decline_request") {
    return {
      kind: "decline",
      input: {
        reason: typeof input.reason === "string" ? input.reason : "",
        suggested_alternative:
          typeof input.suggested_alternative === "string"
            ? input.suggested_alternative
            : "",
      },
    }
  }

  return { kind: "error", message: `Unexpected tool name: ${name}` }
}

// ─── Chat history loader ──────────────────────────────────────────────────

async function loadChatHistory(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  tool_request_id: string,
): Promise<{ messages: AnthropicMessage[]; nextTurnNumber: number }> {
  const { data, error } = await supabase
    .from("tool_versions")
    .select("turn_number, prompt, summary, kind, spec_json")
    .eq("tool_request_id", tool_request_id)
    .order("turn_number", { ascending: true })

  if (error) {
    console.error("tool_versions history query failed", error)
    return { messages: [], nextTurnNumber: 1 }
  }

  const rows = (data ?? []) as Array<{
    turn_number: number
    prompt: string | null
    summary: string | null
    kind: string
    spec_json: Record<string, unknown> | null
  }>

  const messages: AnthropicMessage[] = []
  for (const row of rows) {
    if (row.prompt) {
      messages.push({ role: "user", content: row.prompt })
    }
    const assistantText = row.summary ?? ""
    if (assistantText) {
      messages.push({ role: "assistant", content: assistantText })
    }
  }

  const lastTurn = rows[rows.length - 1]?.turn_number ?? 0
  return { messages, nextTurnNumber: lastTurn + 1 }
}

// ─── Edge Function handler ────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method !== "POST") {
    return jsonError(405, "Method not allowed")
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return jsonError(400, "Body must be valid JSON")
  }

  // ── Body validation ──
  const description =
    typeof body.description === "string" ? body.description.trim() : ""
  if (description.length < MIN_DESCRIPTION_LEN) {
    return jsonError(400, `description must be at least ${MIN_DESCRIPTION_LEN} characters`)
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    return jsonError(400, `description must be at most ${MAX_DESCRIPTION_LEN} characters`)
  }

  const role = typeof body.role === "string" ? body.role : ""
  if (!ALLOWED_ROLES.has(role)) {
    return jsonError(400, "role must be one of: head_coach, assistant_coach, athlete")
  }

  const team_id = typeof body.team_id === "string" ? body.team_id : ""
  if (!UUID_REGEX.test(team_id)) {
    return jsonError(400, "team_id must be a valid UUID")
  }

  // Optional: refine an existing tool_request via tool_request_id.
  const tool_request_id_in =
    typeof body.tool_request_id === "string" && UUID_REGEX.test(body.tool_request_id)
      ? body.tool_request_id
      : null

  // ── Auth + scoped client ──
  const authHeader = req.headers.get("authorization") ?? ""
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonError(500, "Server misconfigured: missing Supabase env")
  }
  if (!apiKey) {
    return jsonError(500, "Server misconfigured: missing ANTHROPIC_API_KEY secret")
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { authorization: authHeader } },
  })

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return jsonError(401, "Not authenticated")

  // ── Reuse or create tool_request ──
  let tool_request_id = tool_request_id_in
  if (!tool_request_id) {
    const { data: inserted, error: insertError } = await supabase
      .from("tool_requests")
      .insert({
        user_id: user.id,
        team_id,
        description,
        role,
        status: "pending",
      })
      .select("id")
      .single()

    if (insertError || !inserted) {
      console.error("tool_requests insert failed", insertError)
      return jsonError(500, "Failed to create tool request")
    }
    tool_request_id = inserted.id as string
  }

  // ── Connector pre-flight ──
  const connectedSources = await getConnectedSources(supabase, team_id)
  const unconnectedSources = (CONNECTOR_SOURCES as readonly string[]).filter(
    (s) => !connectedSources.includes(s),
  )

  // ── Build messages from history + this turn ──
  const { messages: historyMessages, nextTurnNumber } = await loadChatHistory(
    supabase,
    tool_request_id,
  )
  const allMessages: AnthropicMessage[] = [
    ...historyMessages,
    { role: "user", content: description },
  ]

  const systemPrompt = buildSystemPrompt({ connectedSources, unconnectedSources })

  // ── Call Anthropic ──
  let result = await callAnthropic(apiKey, systemPrompt, allMessages)

  // ── On spec emission, validate and retry once on failure ──
  if (result.kind === "spec") {
    const error = validateSpec(result.input.spec)
    if (error) {
      const retryMessages: AnthropicMessage[] = [
        ...allMessages,
        {
          role: "assistant",
          content: [
            {
              type: "tool_use",
              id: "retry-pending",
              name: "emit_spec",
              input: result.input,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: "retry-pending",
              is_error: true,
              content: `Validation failed: ${error}. Re-emit the spec with this corrected.`,
            },
          ],
        },
      ]
      result = await callAnthropic(apiKey, systemPrompt, retryMessages)
      if (result.kind === "spec") {
        const retryError = validateSpec(result.input.spec)
        if (retryError) {
          // Persist as a declined turn so the coach sees the failure and we keep history coherent.
          result = {
            kind: "decline",
            input: {
              reason: `I couldn't generate a valid spec after a retry: ${retryError}`,
              suggested_alternative:
                "Try rephrasing your request, or pick one of the seeded examples to start from.",
            },
          }
        }
      }
    }
  }

  if (result.kind === "error") {
    return jsonError(502, result.message)
  }

  // ── Persist tool_versions row ──
  const turn_number = nextTurnNumber

  if (result.kind === "spec") {
    const spec = result.input.spec
    const unmet = findUnmetConnectors(spec, connectedSources)
    const { data: version, error: versionError } = await supabase
      .from("tool_versions")
      .insert({
        tool_request_id,
        team_id,
        spec_json: spec,
        schema_version: typeof spec.schema_version === "number" ? spec.schema_version : 1,
        turn_number,
        prompt: description,
        summary: result.input.summary,
        unmet_connectors: unmet,
        kind: "spec",
        created_by: user.id,
      })
      .select("id")
      .single()
    if (versionError || !version) {
      console.error("tool_versions spec insert failed", versionError)
      return jsonError(500, "Failed to persist tool version")
    }
    return ok({
      tool_request_id,
      version_id: version.id,
      turn_number,
      kind: "spec",
      spec,
      summary: result.input.summary,
      unmet_connectors: unmet,
    })
  }

  if (result.kind === "clarification") {
    const summary = result.input.summary || result.input.questions.join("\n")
    const { data: version, error: versionError } = await supabase
      .from("tool_versions")
      .insert({
        tool_request_id,
        team_id,
        spec_json: null,
        schema_version: 1,
        turn_number,
        prompt: description,
        summary,
        unmet_connectors: [],
        kind: "clarification",
        created_by: user.id,
      })
      .select("id")
      .single()
    if (versionError || !version) {
      console.error("tool_versions clarification insert failed", versionError)
      return jsonError(500, "Failed to persist clarification turn")
    }
    return ok({
      tool_request_id,
      version_id: version.id,
      turn_number,
      kind: "clarification",
      questions: result.input.questions,
      summary,
    })
  }

  // result.kind === "decline"
  const summary =
    `${result.input.reason}\n\nAlternative: ${result.input.suggested_alternative}`
  const { data: version, error: versionError } = await supabase
    .from("tool_versions")
    .insert({
      tool_request_id,
      team_id,
      spec_json: null,
      schema_version: 1,
      turn_number,
      prompt: description,
      summary,
      unmet_connectors: [],
      kind: "declined",
      created_by: user.id,
    })
    .select("id")
    .single()
  if (versionError || !version) {
    console.error("tool_versions decline insert failed", versionError)
    return jsonError(500, "Failed to persist decline turn")
  }
  return ok({
    tool_request_id,
    version_id: version.id,
    turn_number,
    kind: "declined",
    reason: result.input.reason,
    suggested_alternative: result.input.suggested_alternative,
    summary,
  })
})

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
