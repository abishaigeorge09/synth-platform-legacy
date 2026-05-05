// supabase/functions/tool-generate/index.ts
//
// Sprint 8 scaffold — accepts a vibe-code tool generation request, validates
// it, inserts a row into public.tool_requests, returns { request_id, status }.
//
// NO real generation engine yet. Sprint 9 wires v0 Platform API and writes
// the resulting spec to public.tool_versions, updating the request's status.
//
// JWT verification is enforced by Supabase platform (verify_jwt: true on
// deploy). The function builds a user-scoped Supabase client from the
// caller's Authorization header so RLS on tool_requests still applies on
// every insert (defense in depth — the platform JWT check confirms the
// token's signature; RLS confirms the user_id matches auth.uid()).

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers":
    "authorization, content-type, apikey, x-client-info",
}

const ALLOWED_ROLES = new Set(["head_coach", "assistant_coach", "athlete"])
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MIN_DESCRIPTION_LEN = 3
const MAX_DESCRIPTION_LEN = 2000

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method !== "POST") {
    return jsonError(405, "Method not allowed")
  }

  // ── Body parse + validation ──
  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return jsonError(400, "Body must be valid JSON")
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : ""
  if (description.length < MIN_DESCRIPTION_LEN) {
    return jsonError(
      400,
      `description must be at least ${MIN_DESCRIPTION_LEN} characters`,
    )
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    return jsonError(
      400,
      `description must be at most ${MAX_DESCRIPTION_LEN} characters`,
    )
  }

  const role = typeof body.role === "string" ? body.role : ""
  if (!ALLOWED_ROLES.has(role)) {
    return jsonError(
      400,
      "role must be one of: head_coach, assistant_coach, athlete",
    )
  }

  const team_id = typeof body.team_id === "string" ? body.team_id : ""
  if (!UUID_REGEX.test(team_id)) {
    return jsonError(400, "team_id must be a valid UUID")
  }

  // ── Build a user-scoped Supabase client and confirm the caller ──
  const authHeader = req.headers.get("authorization") ?? ""
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonError(500, "Server misconfigured: missing Supabase env")
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { authorization: authHeader } },
  })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return jsonError(401, "Not authenticated")
  }

  // ── Insert. RLS enforces user_id = auth.uid() on tool_requests. ──
  const { data: inserted, error: insertError } = await supabase
    .from("tool_requests")
    .insert({
      user_id: user.id,
      team_id,
      description,
      role,
      status: "pending",
    })
    .select("id, status")
    .single()

  if (insertError || !inserted) {
    // Don't echo arbitrary error text — could leak schema details.
    console.error("tool_requests insert failed", insertError)
    return jsonError(500, "Failed to create tool request")
  }

  return new Response(
    JSON.stringify({ request_id: inserted.id, status: inserted.status }),
    {
      status: 200,
      headers: { ...corsHeaders, "content-type": "application/json" },
    },
  )
})

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  })
}
