# synth. Vibe-Code MVP — Manual Setup Checklist

**Last updated:** 2026-05-05
**Audience:** AG (founder)
**Why this exists:** Sprints 1–10 + 13 shipped autonomously. Some pieces of the platform require credentials or row-level data that only AG can provide. This is the punch list to flip on.

The MVP is **already fully working in demo mode** — the seeded examples (Stroke rate logger, Lineup compare, Wellness summary, Lap counter, Race plan, Pacific Boat Race) render against `MOCK_SNAPSHOTS` and the build chat falls back to the keyword matcher. Nothing below is required to demo.

The items below activate the **live Anthropic-powered build chat**, the **publish-to-team flow**, and **production observability**. Status of each: hard-blocker / nice-to-have / observability.

---

## Hard blockers — required to flip the live build chat on

### 1. Anthropic API key in Supabase Edge Function secrets

**Status:** Suspected already done (chat works in dev with `VITE_ANTHROPIC_API_KEY` in `.env.local`, but the prod Edge Function path needs the un-prefixed version).

**How to verify:**

Supabase dashboard → Project `synth_platform` → Settings → Edge Functions → Manage Secrets. Confirm a secret named `ANTHROPIC_API_KEY` exists.

**If missing, set it:**

```bash
# Either via dashboard:
#   Edge Functions → Secrets → Add new secret
#     Name:  ANTHROPIC_API_KEY
#     Value: sk-ant-...
# Or via CLI:
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref xdxyqhqlaiwucvlfzsfa
```

The key needs `/v1/messages` access with the `claude-opus-4-7` model in its allowlist.

### 2. Coach row in `public.users` for testing

**Why:** the live build chat activates when the signed-in user has a `users` row with `team_id` and `role` populated. Anonymous demo users (no `users` row) keep using the mock generator. Real coaches need their row.

**How to set up a test coach for yourself:**

1. Sign up via the app at `https://synthplatform.vercel.app/app/welcome` (this creates an `auth.users` row).
2. Find your `auth.users.id` (Supabase dashboard → Authentication → Users).
3. Find or create a team in `public.teams`. Existing demo team: query `select id, name from teams;`.
4. Insert your `users` row via MCP or dashboard SQL Editor:

   ```sql
   insert into public.users (id, email, name, role, team_id)
   values (
     '<your-auth-uid>',
     '<your-email>',
     'AG',
     'head_coach',
     '<team-uuid>'
   );
   ```

5. Sign out and back in. The Build workspace's `useCoachContext` hook will hydrate, `getAIClientMode()` returns `'live'`, and tool-generate Edge Function calls will succeed.

**Test the live path end-to-end:**

- `/app/coach/tools/build` → type "stroke rate logger from Concept2" → Send.
- Expected: brief loading, real Claude Opus 4.7 response, generated spec rendered in preview, amber banner "Concept2 not connected — showing demo data" because Concept2 isn't wired yet.
- Then: type "build me a tool that uses computer vision to grade rower form from video" → Send.
- Expected: emerald decline bubble with the MVP-scope reason and a clickable "Try instead" alternative chip.
- Then: as a head_coach, click "Publish to team" on the preview. Toast confirms. Reopen `/app/coach/tools` Catalog tab — the published tool appears under "Published by your team".

---

## Nice-to-have — observability that ships dark today

### 3. PostHog project key

**Status:** Optional. The harness ships now and emits zero events when `VITE_POSTHOG_KEY` is missing.

**Why:** the 5 vibe-code funnel events (`tool_request_submitted`, `tool_generated`, `tool_declined`, `tool_published`, `tool_installed`) are wired in `src/features/app/coach/ToolsBuildPage.tsx` + `CustomToolsPage.tsx`. Once a key is set, events flow with zero code change.

**How:**

1. Create a PostHog project (or use an existing one).
2. Vercel dashboard → Project `synth-platform-alt` → Settings → Environment Variables → Add:
   - Name: `VITE_POSTHOG_KEY`
   - Value: `phc_...` (your project API key)
3. Optional: `VITE_POSTHOG_HOST` (defaults to `https://us.i.posthog.com`).
4. Trigger a redeploy (any git push to main, or `vercel deploy --prod`).

CSP already allows `https://us.i.posthog.com` and `https://us-assets.i.posthog.com`.

### 4. Sentry DSN + SDK install

**Status:** Optional. The harness ships as a structured `console.error` today. Swapping to real Sentry is a one-import change.

**How:**

1. Create a Sentry project (React platform).
2. Vercel env var: `VITE_SENTRY_DSN=https://....ingest.us.sentry.io/...`
3. Install the SDK locally: `npm i @sentry/react`
4. Edit `src/lib/sentry.ts` — see the comment block at the bottom for the one-line swap (replace `console.error` block with `Sentry.captureException(...)`).
5. Initialize Sentry in `src/main.tsx` using `Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })`.

CSP already allows `https://browser.sentry-cdn.com` and `https://*.ingest.sentry.io`.

---

## Deferred — explicitly NOT shipping in MVP

These were originally in the master plan but were dropped during execution. Documented here so they don't get lost.

### Sprint 11 — TanStack Query migration

**Why deferred:** pure plumbing, no demo-visible value. Resolver fallback already covers the demo case. When a real coach connects a real connector and we want production-grade caching, this lands.

### Sprint 12 — Concept2 OAuth

**Why deferred:** the bot's connector-awareness flow already handles the missing-connector case gracefully. Real OAuth is a multi-day integration that gates only one production scenario (real coach connecting Concept2 to see real numbers). When that scenario surfaces, the existing resolver swap path makes the integration straightforward.

**To unblock when needed:**

- Register a developer app at https://log.concept2.com/developers
- Set OAuth redirect URLs (Vercel preview + production domains)
- Save Concept2 client ID + secret in Supabase Edge Function secrets:
  - `CONCEPT2_CLIENT_ID`
  - `CONCEPT2_CLIENT_SECRET`

### Edge Function rate limiting

**Why deferred:** Deno Edge Function instances are short-lived; per-instance in-memory token buckets are ineffective. Real rate limiting needs Redis or a Postgres-backed counter. For MVP, Anthropic's per-key limits + Supabase's connection caps are the bound. When traffic warrants explicit limits, add `pg_net` + a `request_log` table with a periodic cleanup job.

---

## Hosts and IDs

- **Production URL:** https://synthplatform.vercel.app
- **Backup alias:** https://synth-platform-alt.vercel.app
- **Supabase project:** `synth_platform` (id `xdxyqhqlaiwucvlfzsfa`, region `us-east-2`)
- **Edge Functions deployed:**
  - `claude-chat` v4 ACTIVE — proxy for general AI chat
  - `tool-generate` v2 ACTIVE — Anthropic-powered tool generator
- **GitHub repo:** https://github.com/abishaigeorge09/synth-platform

---

## Verification matrix

| Check | How | Expected |
|---|---|---|
| Build chat (mock) | `/app/coach/tools/build` as demo user, type any prompt | Keyword matcher returns one of 6 examples |
| Build chat (live) | Sign in with a real users-row coach, type "stroke rate logger" | Real Claude response, spec renders, amber connector banner |
| Capability decline | "Form analysis from video upload" | Emerald decline bubble + clickable alternative chip |
| Multi-turn refinement | After a spec, type "swap line chart for bar chart" | Second tool_versions row in DB with same tool_request_id, preview updates |
| Publish flow | As head_coach, click "Publish to team" in preview | Success toast, tool_versions.published flips true |
| Catalog hydration | Open `/app/coach/tools` Catalog tab as same-team user | "Published by your team" section shows the tool |
| Edge Function auth | `curl POST /functions/v1/tool-generate` no JWT | 401 UNAUTHORIZED_NO_AUTH_HEADER |
| Telemetry (post-key) | Open browser dev tools Network tab on Build, type a prompt | POST to `us.i.posthog.com/capture` with `tool_request_submitted` event |
| Lint / build / tests | `npm run lint && npm run build && npx vitest run` | 0/0 lint, build clean, 73/73 tests |
