// supabase/functions/sheets-sync/index.ts
//
// Google Sheets connector. Three actions:
//
//   action: 'connect'  →  body: { provider_token, provider_refresh_token?,
//                                  expires_in?, email?, scopes? }
//                          Stores Google OAuth tokens on the team's
//                          connector_accounts row (one per team). Tokens
//                          live inside config_json so no schema migration
//                          is required. Tokens are JWT-scoped to the
//                          team's head_coach/assistant_coach via RLS.
//
//   action: 'fetch'    →  body: { sheet_url, range? }
//                          Pulls the sheet via Google Sheets API (using
//                          the stored access token, refreshed on demand),
//                          formats the values as CSV text, uploads the
//                          CSV to the `uploads` bucket under the user's
//                          prefix, and returns the storage path so the
//                          client can call the existing /ingest endpoint
//                          to parse + preview. We deliberately reuse the
//                          uploads pipeline so the Claude extraction + RLS
//                          + preview UI are identical to a manual CSV.
//
//   action: 'disconnect' → clears the tokens (status=revoked).
//
// Required Supabase secrets:
//   GOOGLE_CLIENT_ID
//   GOOGLE_CLIENT_SECRET
// Both come from the existing Google OAuth app used for /login. They're
// only needed for refresh-token rotation; the initial access_token comes
// from Supabase's OAuth flow on the client.
//
// Auth: verify_jwt = true. RLS on connector_accounts pins reads/writes
// to the caller's team and coach role.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

// ─── Constants ────────────────────────────────────────────────────────────

const PROVIDER = "google_sheets"
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets"
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
// `Sheet1` is Google's default first-tab name. We pull A:Z by default —
// 26 cols is plenty for an athlete spreadsheet and keeps the response
// small. Callers can override `range` if they want a specific tab.
const DEFAULT_RANGE = "A:Z"

const corsHeaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers":
    "authorization, content-type, apikey, x-client-info",
}

// ─── Helpers ──────────────────────────────────────────────────────────────

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

// Sheet URLs look like
//   https://docs.google.com/spreadsheets/d/{sheetId}/edit#gid=0
//   https://docs.google.com/spreadsheets/d/{sheetId}/
function extractSheetId(url: string): string | null {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return m ? m[1] : null
}

function extractGid(url: string): string | null {
  const m = url.match(/[?#&]gid=([0-9]+)/)
  return m ? m[1] : null
}

// Format an array-of-arrays values payload as CSV. Cells are quoted iff
// they contain a comma, quote, or newline, with internal quotes doubled
// per RFC 4180. Empty trailing cells inside a row are dropped because
// Sheets API returns ragged rows — keeping them just inflates the file.
function valuesToCsv(values: unknown[][]): string {
  const lines: string[] = []
  for (const row of values) {
    const cells: string[] = []
    for (const cell of row) {
      const s = cell == null ? "" : String(cell)
      if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
        cells.push('"' + s.replace(/"/g, '""') + '"')
      } else {
        cells.push(s)
      }
    }
    lines.push(cells.join(","))
  }
  return lines.join("\n") + (lines.length ? "\n" : "")
}

// ─── Token management ─────────────────────────────────────────────────────

type StoredTokens = {
  access_token: string
  refresh_token?: string
  expires_at?: string  // ISO timestamp
  email?: string
  scopes?: string[]
}

async function loadTokens(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  teamId: string,
): Promise<StoredTokens | null> {
  const { data, error } = await supabase
    .from("connector_accounts")
    .select("config_json, status")
    .eq("team_id", teamId)
    .eq("provider", PROVIDER)
    .maybeSingle()
  if (error || !data) return null
  if (data.status !== "connected") return null
  const c = data.config_json as Record<string, unknown> | null
  if (!c || typeof c !== "object") return null
  const access = c.access_token
  if (typeof access !== "string" || !access) return null
  return {
    access_token: access,
    refresh_token: typeof c.refresh_token === "string" ? c.refresh_token : undefined,
    expires_at: typeof c.expires_at === "string" ? c.expires_at : undefined,
    email: typeof c.email === "string" ? c.email : undefined,
    scopes: Array.isArray(c.scopes) ? (c.scopes as string[]) : undefined,
  }
}

async function saveTokens(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  teamId: string,
  tokens: StoredTokens,
): Promise<void> {
  // Upsert by (team_id, provider). We hand-craft the conflict logic because
  // connector_accounts may or may not have a unique index on that pair —
  // safe to fall back to select-then-update.
  const { data: existing } = await supabase
    .from("connector_accounts")
    .select("id")
    .eq("team_id", teamId)
    .eq("provider", PROVIDER)
    .maybeSingle()
  const config_json = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expires_at,
    email: tokens.email,
    scopes: tokens.scopes,
  }
  if (existing?.id) {
    await supabase
      .from("connector_accounts")
      .update({
        status: "connected",
        display_name: tokens.email ?? "Google Sheets",
        scopes_granted: tokens.scopes ?? null,
        config_json,
        last_sync_at: null,
      })
      .eq("id", existing.id)
  } else {
    await supabase.from("connector_accounts").insert({
      team_id: teamId,
      provider: PROVIDER,
      external_account_id: tokens.email ?? null,
      display_name: tokens.email ?? "Google Sheets",
      scopes_granted: tokens.scopes ?? null,
      status: "connected",
      config_json,
    })
  }
}

// Google access tokens last 1h. We refresh proactively when there's
// less than 60s of headroom, so a long sync doesn't 401 mid-flight.
function isExpired(tokens: StoredTokens): boolean {
  if (!tokens.expires_at) return false
  const expMs = Date.parse(tokens.expires_at)
  if (Number.isNaN(expMs)) return false
  return expMs - Date.now() < 60_000
}

async function refreshAccessToken(
  tokens: StoredTokens,
): Promise<StoredTokens> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID")
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")
  if (!clientId || !clientSecret) {
    throw new Error(
      "Server misconfigured: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing",
    )
  }
  if (!tokens.refresh_token) {
    throw new Error(
      "Google Sheets session expired and no refresh token was stored. " +
        "Reconnect with offline access (prompt=consent) to re-grant.",
    )
  }
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: tokens.refresh_token,
    grant_type: "refresh_token",
  })
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Google token refresh failed (${res.status}): ${text || "no body"}`)
  }
  const body = await res.json() as {
    access_token: string
    expires_in?: number
    scope?: string
    token_type?: string
  }
  const expiresAt = body.expires_in
    ? new Date(Date.now() + body.expires_in * 1000).toISOString()
    : undefined
  return {
    ...tokens,
    access_token: body.access_token,
    expires_at: expiresAt,
    scopes: body.scope ? body.scope.split(" ") : tokens.scopes,
  }
}

// ─── Sheets fetch ─────────────────────────────────────────────────────────

async function fetchSheetTab(
  accessToken: string,
  sheetId: string,
  range: string,
): Promise<{ values: unknown[][]; tabName: string }> {
  // First call: get spreadsheet metadata so we can pick the right tab if
  // the caller didn't specify one. This also catches "you don't have
  // access to this sheet" early with a clearer error than the values call.
  const metaUrl =
    `${SHEETS_API}/${encodeURIComponent(sheetId)}` +
    `?fields=properties.title,sheets.properties(title,sheetId)`
  const metaRes = await fetch(metaUrl, {
    headers: { authorization: `Bearer ${accessToken}` },
  })
  if (metaRes.status === 401 || metaRes.status === 403) {
    throw new Error(
      `Google denied access (${metaRes.status}). The signed-in account may not have ` +
        "permission to view this sheet, or the spreadsheets.readonly scope wasn't granted.",
    )
  }
  if (!metaRes.ok) {
    throw new Error(`Google Sheets metadata failed (${metaRes.status})`)
  }
  const meta = (await metaRes.json()) as {
    properties?: { title?: string }
    sheets?: Array<{ properties?: { title?: string; sheetId?: number } }>
  }

  // Caller's range can be either a bare cell range ("A:Z") or already
  // qualified ("Sheet1!A:Z"). If bare, prepend the first tab's title.
  let effectiveRange = range
  let tabName = "Sheet1"
  const firstTab = meta.sheets?.[0]?.properties?.title
  if (firstTab) tabName = firstTab
  if (!effectiveRange.includes("!")) {
    effectiveRange = `${tabName}!${effectiveRange}`
  } else {
    tabName = effectiveRange.split("!")[0]
  }

  const valUrl =
    `${SHEETS_API}/${encodeURIComponent(sheetId)}/values/` +
    `${encodeURIComponent(effectiveRange)}?valueRenderOption=FORMATTED_VALUE`
  const valRes = await fetch(valUrl, {
    headers: { authorization: `Bearer ${accessToken}` },
  })
  if (!valRes.ok) {
    const text = await valRes.text().catch(() => "")
    throw new Error(`Google Sheets values failed (${valRes.status}): ${text || "no body"}`)
  }
  const valBody = (await valRes.json()) as { values?: unknown[][] }
  return {
    values: valBody.values ?? [],
    tabName,
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────

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
  if (action !== "connect" && action !== "fetch" && action !== "disconnect") {
    return jsonError(400, "action must be 'connect', 'fetch', or 'disconnect'")
  }

  const authHeader = req.headers.get("authorization") ?? ""
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonError(500, "Server misconfigured: Supabase env missing")
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { authorization: authHeader } },
  })

  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return jsonError(401, "Not authenticated")

  // Resolve the caller's team. The RLS on connector_accounts/sources is
  // expressed in terms of users.team_id, so we mirror that lookup here.
  const { data: userRow, error: userRowErr } = await supabase
    .from("users")
    .select("team_id, role")
    .eq("id", user.id)
    .maybeSingle()
  if (userRowErr || !userRow?.team_id) {
    return jsonError(
      400,
      "No team is associated with this user yet. Finish signup before connecting sources.",
    )
  }
  if (userRow.role !== "head_coach" && userRow.role !== "assistant_coach") {
    return jsonError(403, "Only coaches can manage team connectors")
  }
  const teamId = userRow.team_id as string

  if (action === "connect") return await handleConnect(supabase, teamId, body)
  if (action === "disconnect") return await handleDisconnect(supabase, teamId)
  return await handleFetch(supabase, teamId, user.id, body)
})

// ─── /connect ─────────────────────────────────────────────────────────────

async function handleConnect(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  teamId: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const providerToken = typeof body.provider_token === "string" ? body.provider_token : ""
  const refreshToken =
    typeof body.provider_refresh_token === "string" && body.provider_refresh_token.length > 0
      ? (body.provider_refresh_token as string)
      : undefined
  const expiresIn = typeof body.expires_in === "number" ? body.expires_in : undefined
  const email = typeof body.email === "string" ? body.email : undefined
  const scopesRaw = body.scopes
  const scopes = Array.isArray(scopesRaw)
    ? (scopesRaw as unknown[]).filter((s): s is string => typeof s === "string")
    : typeof scopesRaw === "string"
    ? scopesRaw.split(/\s+/).filter(Boolean)
    : undefined

  if (!providerToken) {
    return jsonError(400, "provider_token is required (Google access token)")
  }

  const expiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 1000).toISOString()
    : undefined

  await saveTokens(supabase, teamId, {
    access_token: providerToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    email,
    scopes,
  })

  return jsonOk({
    ok: true,
    provider: PROVIDER,
    email: email ?? null,
    has_refresh_token: Boolean(refreshToken),
  })
}

// ─── /disconnect ──────────────────────────────────────────────────────────

async function handleDisconnect(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  teamId: string,
): Promise<Response> {
  await supabase
    .from("connector_accounts")
    .update({
      status: "revoked",
      config_json: {},
    })
    .eq("team_id", teamId)
    .eq("provider", PROVIDER)
  return jsonOk({ ok: true })
}

// ─── /fetch ───────────────────────────────────────────────────────────────

async function handleFetch(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  teamId: string,
  userId: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const sheetUrl = typeof body.sheet_url === "string" ? body.sheet_url : ""
  const rangeOverride = typeof body.range === "string" ? body.range : ""
  if (!sheetUrl) return jsonError(400, "sheet_url is required")

  const sheetId = extractSheetId(sheetUrl)
  if (!sheetId) {
    return jsonError(400, "Could not extract a spreadsheet ID from sheet_url")
  }
  const gid = extractGid(sheetUrl)

  let tokens = await loadTokens(supabase, teamId)
  if (!tokens) {
    return jsonError(
      400,
      "Google Sheets is not connected for this team. Run the 'connect' action first.",
    )
  }
  if (isExpired(tokens)) {
    try {
      tokens = await refreshAccessToken(tokens)
      await saveTokens(supabase, teamId, tokens)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return jsonError(401, msg)
    }
  }

  // Pull the sheet. If the URL specified a gid we use that tab's name;
  // otherwise default to the first tab and DEFAULT_RANGE.
  let range = rangeOverride || DEFAULT_RANGE
  if (gid && !range.includes("!")) {
    // We have to fetch metadata anyway in fetchSheetTab to pick the right
    // tab when no explicit tab is given. The gid → title resolution is
    // done inline below.
    try {
      const metaUrl =
        `${SHEETS_API}/${encodeURIComponent(sheetId)}?fields=sheets.properties(title,sheetId)`
      const metaRes = await fetch(metaUrl, {
        headers: { authorization: `Bearer ${tokens.access_token}` },
      })
      if (metaRes.ok) {
        const meta = (await metaRes.json()) as {
          sheets?: Array<{ properties?: { title?: string; sheetId?: number } }>
        }
        const wanted = meta.sheets?.find(
          (s) => String(s.properties?.sheetId ?? "") === gid,
        )
        if (wanted?.properties?.title) {
          range = `${wanted.properties.title}!${range}`
        }
      }
    } catch {
      // Non-fatal: fetchSheetTab will pick the first tab.
    }
  }

  let fetched: { values: unknown[][]; tabName: string }
  try {
    fetched = await fetchSheetTab(tokens.access_token, sheetId, range)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // If the token failed unexpectedly mid-flight, try one refresh and retry.
    if (/401|403/.test(msg) && tokens.refresh_token) {
      try {
        tokens = await refreshAccessToken(tokens)
        await saveTokens(supabase, teamId, tokens)
        fetched = await fetchSheetTab(tokens.access_token, sheetId, range)
      } catch (err2) {
        return jsonError(401, err2 instanceof Error ? err2.message : String(err2))
      }
    } else {
      return jsonError(502, msg)
    }
  }

  if (fetched.values.length === 0) {
    return jsonError(422, "Sheet returned no values in the requested range")
  }

  const csv = valuesToCsv(fetched.values)
  const csvBytes = new TextEncoder().encode(csv)

  // Upload to the shared `uploads` bucket under the caller's prefix —
  // exactly the layout the /ingest function expects. The file name is
  // synthetic but human-readable so the recent-uploads list reads well.
  const filename = `${fetched.tabName.replace(/[^\w-]+/g, "_")}-${sheetId.slice(0, 8)}.csv`
  const uploadId = crypto.randomUUID()
  const storagePath = `${userId}/${uploadId}.csv`

  const { error: storageErr } = await supabase.storage
    .from("uploads")
    .upload(storagePath, csvBytes, {
      contentType: "text/csv",
      upsert: false,
    })
  if (storageErr) {
    return jsonError(502, `Storage upload failed: ${storageErr.message}`)
  }

  // Stamp connector_accounts.last_sync_at so the UI can show "synced 2m ago".
  await supabase
    .from("connector_accounts")
    .update({ last_sync_at: new Date().toISOString() })
    .eq("team_id", teamId)
    .eq("provider", PROVIDER)

  return jsonOk({
    ok: true,
    storage_path: storagePath,
    filename,
    mime_type: "text/csv",
    kind: "csv",
    sheet_id: sheetId,
    tab_name: fetched.tabName,
    rows_fetched: fetched.values.length,
  })
}
