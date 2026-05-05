// supabase/functions/claude-chat/index.ts
//
// Server-side proxy to Anthropic's /v1/messages so the real API key never
// ships in client binaries. The iOS app and the web app both POST here
// with the signed-in user's Supabase JWT (verify_jwt is on at the function
// level); this function holds the Anthropic key as a Deno env var.
//
// Required secret (set via Supabase dashboard → Edge Functions → Secrets,
// or `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`):
//   ANTHROPIC_API_KEY
//
// Body shape mirrors Anthropic's /v1/messages so callers can pass through
// whatever they'd send directly. We restrict `model` to an allowlist so a
// compromised JWT can't run arbitrary Anthropic models on our billing.
//
// Sprint 9.1 — added claude-opus-4-7 to the allowlist for tool generation
// (the build chat uses Opus 4.7 because its declines / capability gating
// are tighter than Sonnet's). Also forwards `tools` and `tool_choice` for
// Anthropic's function-calling feature, used by tool-generate.
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const ANTHROPIC_BASE = "https://api.anthropic.com/v1/messages"
const ANTHROPIC_VERSION = "2023-06-01"

const ALLOWED_MODELS = new Set([
  "claude-sonnet-4-20250514",
  "claude-haiku-4-5-20251001",
  "claude-opus-4-20250514",
  "claude-opus-4-6",
  "claude-opus-4-7",
])

// Hard ceilings — clients can ask for less but not more.
const MAX_TOKENS_CEILING = 4096
const DEFAULT_MAX_TOKENS = 1024

const corsHeaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type, apikey, x-client-info",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method !== "POST") {
    return jsonError(405, "Method not allowed")
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
  if (!apiKey) {
    return jsonError(500, "Server is missing ANTHROPIC_API_KEY secret")
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return jsonError(400, "Body must be valid JSON")
  }

  const messages = body.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError(400, "messages must be a non-empty array")
  }

  const model = typeof body.model === "string" ? body.model : "claude-sonnet-4-20250514"
  if (!ALLOWED_MODELS.has(model)) {
    return jsonError(400, `model not in allowlist: ${model}`)
  }

  const requestedMax = typeof body.max_tokens === "number" ? body.max_tokens : DEFAULT_MAX_TOKENS
  const max_tokens = Math.min(Math.max(requestedMax, 1), MAX_TOKENS_CEILING)

  const stream = body.stream === true

  const upstreamBody: Record<string, unknown> = {
    model,
    max_tokens,
    messages,
    stream,
  }
  if (typeof body.system === "string" || Array.isArray(body.system)) {
    upstreamBody.system = body.system
  }
  if (typeof body.temperature === "number") {
    upstreamBody.temperature = body.temperature
  }
  // Sprint 9.1 — pass through Anthropic tool use parameters when callers
  // provide them. tool-generate relies on this for emit_spec /
  // request_clarification / decline_request function calling.
  if (Array.isArray(body.tools)) {
    upstreamBody.tools = body.tools
  }
  if (body.tool_choice && typeof body.tool_choice === "object") {
    upstreamBody.tool_choice = body.tool_choice
  }

  const upstream = await fetch(ANTHROPIC_BASE, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "anthropic-version": ANTHROPIC_VERSION,
      "x-api-key": apiKey,
    },
    body: JSON.stringify(upstreamBody),
  })

  if (stream) {
    // SSE pass-through.
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      },
    })
  }

  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  })
})

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  })
}
