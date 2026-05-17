// supabase/functions/health-webhook/index.ts
//
// Apple Health (and any "structured push" source) ingestion webhook.
//
// Deploy with `verify_jwt = false` so an Apple Shortcut can POST without
// needing a Supabase session. Auth is via a per-team secret in the
// `secret` query param. The coach generates the secret from the Sources
// UI, which writes it into connector_accounts.config_json.secret for
// the team's apple_health row; the same row's existence + status acts
// as the on/off switch.
//
// Inbound payload (one POST = one batch):
//
//   POST /functions/v1/health-webhook?secret=...
//   {
//     "athlete_email": "ella@example.com",  // optional, used to tag rows
//     "device": "iPhone of Ella",           // optional, free-form
//     "samples": [
//       {
//         "type": "HKQuantityTypeIdentifierHeartRateVariabilitySDNN",
//         "value": 62,
//         "unit": "ms",
//         "start_date": "2026-05-15T07:12:00Z",
//         "end_date":   "2026-05-15T07:12:00Z"
//       },
//       ...
//     ]
//   }
//
// Each sample is mapped to ingestion_events (status='preview' so the
// coach reviews before they show in dashboards). The full inbound body
// is also archived as a raw_ingest_payloads row for debugging.
//
// We deliberately use the service-role client for the secret lookup and
// inserts: the caller isn't a Supabase user, so RLS would reject them.
// The secret + team-scoping is what makes that safe.
//
// Required Supabase secrets:
//   SUPABASE_SERVICE_ROLE_KEY   (Supabase injects this automatically)
//
// Future:
//   - Per-secret rate limit (right now we trust the device).
//   - Athlete matching via fuzzy name fallback when email is absent.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const PROVIDER = "apple_health"
const SOURCE_NAME = "Apple Health"

const corsHeaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type, apikey, x-client-info",
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  })
}

function jsonOk(payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, "content-type": "application/json" },
  })
}

// Map a HealthKit identifier to the synth. category enum. We collapse
// every wearable signal into one of nine buckets so dashboards can
// chart them without per-type special-casing.
function categoryFromHkType(type: string): {
  category: string
  metric: string
} {
  const t = type.toLowerCase()
  if (t.includes("heartratevariability")) return { category: "hrv", metric: "hrv_sdnn" }
  if (t.includes("restingheartrate")) return { category: "wellness", metric: "resting_hr" }
  if (t.includes("heartrate")) return { category: "wellness", metric: "heart_rate" }
  if (t.includes("sleepanalysis")) return { category: "sleep", metric: "sleep_duration" }
  if (t.includes("sleep")) return { category: "sleep", metric: "sleep" }
  if (t.includes("stepcount")) return { category: "cross_training", metric: "steps" }
  if (t.includes("activeenergy") || t.includes("basalenergy")) {
    return { category: "cross_training", metric: "active_energy" }
  }
  if (t.includes("vo2max")) return { category: "wellness", metric: "vo2_max" }
  if (t.includes("respiratoryrate")) return { category: "wellness", metric: "respiratory_rate" }
  if (t.includes("bodymass") || t.includes("bodyweight")) {
    return { category: "wellness", metric: "body_mass" }
  }
  if (t.includes("oxygensaturation")) return { category: "wellness", metric: "spo2" }
  if (t.includes("mindfulsession")) return { category: "wellness", metric: "mindful_minutes" }
  return { category: "other", metric: type }
}

type InboundSample = {
  type?: unknown
  value?: unknown
  unit?: unknown
  start_date?: unknown
  end_date?: unknown
  source?: unknown
}

function normalizeSample(raw: InboundSample): null | {
  type: string
  value: number | null
  unit: string | null
  occurredAt: string
} {
  if (!raw || typeof raw !== "object") return null
  const type = typeof raw.type === "string" ? raw.type : ""
  if (!type) return null

  const valueRaw = raw.value
  let value: number | null = null
  if (typeof valueRaw === "number" && Number.isFinite(valueRaw)) {
    value = valueRaw
  } else if (typeof valueRaw === "string") {
    const n = Number(valueRaw)
    if (Number.isFinite(n)) value = n
  }

  const unit = typeof raw.unit === "string" ? raw.unit : null
  // Prefer end_date because that's when the sample completed; fall back
  // to start_date for instantaneous quantities like a single HR reading.
  const occurredRaw =
    (typeof raw.end_date === "string" && raw.end_date) ||
    (typeof raw.start_date === "string" && raw.start_date) ||
    new Date().toISOString()
  const occurredMs = Date.parse(occurredRaw as string)
  const occurredAt = Number.isNaN(occurredMs)
    ? new Date().toISOString()
    : new Date(occurredMs).toISOString()

  return { type, value, unit, occurredAt }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method !== "POST") return jsonError(405, "Method not allowed")

  const url = new URL(req.url)
  const secret = url.searchParams.get("secret") ?? ""
  if (!secret || secret.length < 16) {
    return jsonError(401, "Missing or short ?secret= query param")
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return jsonError(400, "Body must be valid JSON")
  }

  const samplesRaw = body.samples
  if (!Array.isArray(samplesRaw)) {
    return jsonError(400, "Body must include `samples: [...]`")
  }
  const athleteEmail = typeof body.athlete_email === "string" ? body.athlete_email : null

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!supabaseUrl || !serviceKey) {
    return jsonError(500, "Server misconfigured: service-role key missing")
  }

  // Service-role client. RLS does not apply, so every query/insert must
  // be explicitly scoped by team_id/secret.
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Resolve secret → team_id. We could also store a hashed secret for
  // defense-in-depth; for slice 1 the secret is generated as a 256-bit
  // random string and stored at rest in config_json.
  const { data: connector, error: connErr } = await admin
    .from("connector_accounts")
    .select("id, team_id, status, config_json")
    .eq("provider", PROVIDER)
    .eq("status", "connected")
    // Filter on the JSON path. PostgREST supports ->> for jsonb lookup.
    .filter("config_json->>secret", "eq", secret)
    .maybeSingle()

  if (connErr || !connector) {
    return jsonError(401, "Invalid or revoked webhook secret")
  }
  const teamId = connector.team_id as string

  // Optional athlete lookup by email. We only match within the team, so
  // a coach can't accidentally tag an athlete from a different program.
  let athleteId: string | null = null
  if (athleteEmail) {
    const { data: userRow } = await admin
      .from("users")
      .select("id")
      .eq("email", athleteEmail)
      .eq("team_id", teamId)
      .maybeSingle()
    if (userRow?.id) {
      const { data: athleteRow } = await admin
        .from("athletes")
        .select("id")
        .eq("user_id", userRow.id)
        .eq("team_id", teamId)
        .maybeSingle()
      if (athleteRow?.id) athleteId = athleteRow.id as string
    }
  }

  // Archive the raw payload first so we have a forensic record even if
  // event insertion fails. We don't store the secret on this row.
  const sanitized = { ...body } as Record<string, unknown>
  delete sanitized.secret
  const bodyText = JSON.stringify(sanitized)
  const bodyHashBuf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(bodyText),
  )
  const bodyHash = [...new Uint8Array(bodyHashBuf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  const { data: rawRow } = await admin
    .from("raw_ingest_payloads")
    .insert({
      team_id: teamId,
      kind: "connector_pull",
      body_preview: bodyText.slice(0, 2000),
      body_hash: bodyHash,
      status: "pending",
    })
    .select("id")
    .maybeSingle()

  // Build a synthetic source_uploads row so events have somewhere to
  // hang. The ingestion_events table requires source_upload_id FK so
  // we can't skip this — but we tag the upload as kind='paste' which
  // is the existing slot for non-file structured data.
  const userIdForUpload = (await admin
    .from("users")
    .select("id")
    .eq("team_id", teamId)
    .eq("role", "head_coach")
    .maybeSingle()).data?.id as string | undefined

  if (!userIdForUpload) {
    return jsonError(500, "Team has no head_coach user — cannot anchor uploads")
  }

  const sampleCount = (samplesRaw as unknown[]).length
  const { data: uploadRow, error: upErr } = await admin
    .from("source_uploads")
    .insert({
      team_id: teamId,
      uploaded_by: userIdForUpload,
      storage_path: `__synthetic__/health-webhook/${rawRow?.id ?? crypto.randomUUID()}`,
      filename: `Apple Health · ${new Date().toISOString().slice(0, 19).replace("T", " ")}Z`,
      mime_type: "application/json",
      size_bytes: bodyText.length,
      kind: "paste",
      status: "preview",
      events_extracted: sampleCount,
    })
    .select("id")
    .maybeSingle()

  if (upErr || !uploadRow) {
    return jsonError(500, `Could not record source upload: ${upErr?.message ?? "unknown"}`)
  }
  const sourceUploadId = uploadRow.id as string

  // Translate each sample into an ingestion_events row. status='preview'
  // because the coach should glance at the first webhook delivery to
  // confirm the categorization; subsequent ones can be auto-confirmed
  // once a "Trust this device" toggle is added (future).
  const rows = (samplesRaw as InboundSample[])
    .map(normalizeSample)
    .filter((s): s is NonNullable<ReturnType<typeof normalizeSample>> => s !== null)
    .map((s) => {
      const cat = categoryFromHkType(s.type)
      return {
        team_id: teamId,
        athlete_id: athleteId,
        source_upload_id: sourceUploadId,
        occurred_at: s.occurredAt,
        category: cat.category,
        metric: cat.metric,
        value: s.value,
        unit: s.unit,
        athlete_name_raw: athleteEmail ?? null,
        extraction_confidence: 1.0,
        match_confidence: athleteId ? 1.0 : null,
        raw: { source: SOURCE_NAME, hk_type: s.type },
        status: "preview",
      }
    })

  if (rows.length === 0) {
    return jsonError(422, "No usable samples in payload (missing `type` or values)")
  }

  const { error: evErr, count: evCount } = await admin
    .from("ingestion_events")
    .insert(rows, { count: "exact" })

  if (evErr) {
    return jsonError(500, `Insert failed: ${evErr.message}`)
  }

  // Stamp the connector's last_sync_at so the Sources UI shows recency.
  await admin
    .from("connector_accounts")
    .update({ last_sync_at: new Date().toISOString() })
    .eq("id", connector.id as string)

  // Flip raw payload status to parsed.
  if (rawRow?.id) {
    await admin
      .from("raw_ingest_payloads")
      .update({ status: "parsed" })
      .eq("id", rawRow.id as string)
  }

  return jsonOk({
    ok: true,
    accepted: evCount ?? rows.length,
    skipped: (samplesRaw as unknown[]).length - rows.length,
    upload_id: sourceUploadId,
    athlete_matched: Boolean(athleteId),
  })
})
