// supabase/functions/waitlist-responses/index.ts
//
// Passcode-gated reader for the /responses admin page. public.waitlist denies
// anon SELECT (emails are private), so the dashboard cannot read rows with the
// browser anon client. This function validates a shared passcode and then reads
// with the service-role key, returning every signup as JSON.
//
// Required Supabase secrets:
//   DASH_PASS                  — the admin passcode checked below
//   SUPABASE_URL               — injected by the platform
//   SUPABASE_SERVICE_ROLE_KEY  — injected by the platform
//
// Deploy with verify_jwt = false (it is a public endpoint guarded by the
// passcode, mirroring the student-store `responses` function).

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  })
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  // Prefer the DASH_PASS secret if set; otherwise fall back to the shared
  // passcode. The function source is server-side only (never shipped to the
  // browser), so this is a low-risk admin gate for the prototype.
  const expected = Deno.env.get("DASH_PASS") ?? "synthresponses26"

  let pass = ""
  try {
    const body = await req.json()
    pass = typeof body?.pass === "string" ? body.pass : ""
  } catch {
    return json({ error: "Bad request" }, 400)
  }

  if (pass !== expected) return json({ error: "Unauthorized" }, 401)

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  )

  const { data, error } = await supabase
    .from("waitlist")
    .select("id, email, name, sport, role, university, wearable, tools, track_wants, dimensionality, created_at")
    .order("created_at", { ascending: false })

  if (error) return json({ error: error.message }, 500)
  return json({ rows: data ?? [] })
})
