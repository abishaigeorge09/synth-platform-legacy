# synth. — Vibe-Code Custom Tools Master Plan

**For:** Claude Code
**From:** AG (Founder, CEO & CTO)
**Last updated:** May 4, 2026 (rev 2)
**Goal:** Ship a vibe-code Custom Tools experience inside synth. — coaches describe what they need, get a working tool. Demo-ready in 3 weeks. Production-grade in 12 weeks.

---

## HOW YOU (CLAUDE CODE) SHOULD USE THIS DOCUMENT

This is your master plan for the next 12 weeks. It is broken into **13 sprints** across 4 phases. Each sprint represents one self-contained chunk of work.

### Your workflow

You operate in a strict approval loop:

1. I (AG) say "**Generate Sprint N prompt**"
2. You generate ONE prompt for Sprint N. Format it as a complete, paste-ready prompt with: context, deliverables, file paths, acceptance criteria, and any clarifying questions you have for me.
3. **STOP. Do not execute. Wait for my approval.**
4. I review the prompt. I either:
   - Say "**Approved, execute**" — you execute the sprint
   - Ask clarifying questions or request edits — you revise the prompt and present again
   - Say "**Skip**" — you wait for my next instruction
5. If approved: you execute the sprint, applying changes via the Supabase MCP server where database work is involved
6. When complete, you report back with: what was done, what files changed, what tests pass, what's blocked, and any decisions I need to make
7. I say "**Generate Sprint N+1 prompt**" and we repeat

### Rules you must follow

1. **Never execute work without explicit approval.** Always generate the prompt, stop, and wait.
2. **One sprint at a time.** Do not generate multiple sprint prompts in a single response.
3. **Always show me the prompt as if I were going to paste it back to you.** Treat the prompt as a deliverable.
4. **If you find blockers in the codebase that change the plan, flag them BEFORE generating the sprint prompt.** Do not silently work around them.
5. **Use the Supabase MCP server for all database work.** Never write SQL into a file expecting me to run it manually unless I explicitly ask.
6. **Reference real file paths from the codebase, not invented ones.** Read the codebase first if uncertain.
7. **Keep prompts under 800 words.** If a sprint is too big, split it and tell me — don't compress.

---

## PROJECT CONTEXT

### What synth. is

synth. is a B2B vertical SaaS for collegiate sports coaching. It connects every coaching tool a coach uses (Concept2, Strava, Whoop, Garmin, Google Sheets, etc.) into one platform, normalizes the data, and synthesizes it into training load, recovery readiness, and injury risk per athlete.

### What we're building in this 12-week plan

A "vibe-code" Custom Tools experience inside synth. Coaches type natural-language descriptions of tools they need ("stroke rate logger that pulls from Concept2") and get back a working tool that runs natively inside synth.

### Architectural decisions (locked)

- **Renderer:** JSON spec, NOT arbitrary TSX. Generated tools are JSON specs that compose against a frozen library of synth primitives. This avoids needing a code sandbox or wasm TypeScript compiler.
- **Shell:** Mobile-first (`/app/coach/tools`). Desktop `/coach/tools/*` is Phase 2.
- **Generation engine:** v0 Platform API by Vercel for Phase 1. Migrate to Anthropic Claude Agent SDK in Phase 2 if economics demand it.
- **Backend:** Supabase Edge Function (Deno) — extends the existing `claude-chat` pattern with a new function called `tool-generate`.
- **Database:** Supabase Postgres with RLS. Schema lives in `docs/SCHEMA.md`. New tables (`tool_requests`, `tool_versions`, `tool_runs`) added in Sprint 6.
- **Auth roles:** `head_coach` (can publish), `assistant_coach` (can request and run), `athlete` (can run installed tools).

### What's locked NOT to change

- The existing `/app/coach` and `/app/athlete` mobile shells stay. Don't merge with `/coach`/`/athlete` desktop.
- The 49 mobile primitives in `src/features/app/primitives/` are the design system. Don't rebuild them.
- The existing `claude-chat` Edge Function pattern is the deploy story. Don't migrate to Next.js or Vercel Functions.
- React 18, TypeScript, Vite, Tailwind, Zustand. No framework changes.

---

## THE 13-SPRINT PLAN

### PHASE A — UI SHELL (Weeks 1-3) — DEMO-READY GOAL

**Why first:** Build the user-facing experience first with mocked AI. Lets us demo to Mike Chandler, Peter Mansfeld, and YC partners in week 3 instead of week 9. The mocked UI is the real production UI — only the generation function gets swapped later.

#### Sprint 1: Three-Tab Homepage + Build Workspace Shell

- **What:** Restructure `src/features/app/coach/CustomToolsPage.tsx` from `Installed / Coming Soon / Request` to `01 INSTALLED / 02 BUILD / 03 CATALOG`. Add a NEW Build workspace at `/app/coach/tools/build` (Lovable-style: back button + sidebar + main canvas + chat input).
- **Deliverables:**
  1. Three-tab homepage with new content model:
     - **01 Installed** — tools the coach has actually installed (today: Lineup Builder)
     - **02 Build** — tapping this routes to `/app/coach/tools/build` (separate route, not a tab panel)
     - **03 Catalog** — App Store of curated tools (Lineup Builder + 7 Coming Soon entries) with per-card state of `Installed` / `Install` / `Coming Soon`
  2. New route `/app/coach/tools/build` rendered by NEW `src/features/app/coach/BuildWorkspacePage.tsx`:
     - Back button (top-left, returns to `/app/coach/tools`)
     - Collapsible sidebar with `+ New chat` and a list of recent chats (empty for Sprint 1)
     - Main canvas with empty state and 3-4 suggested-idea chips
     - Chat input fixed at bottom of main canvas (UI only, no AI wired)
  3. Zustand store `useInstalledToolsStore` tracking which tool IDs are installed for the current coach
  4. Page header kicker changes from `CUSTOM TOOLS CATALOG` to `CUSTOM TOOLS`
- **Stack touched:** Frontend only. Files under `src/features/app/coach/` and `src/features/app/primitives/` only. No backend, no Supabase.
- **Output:** A coach can navigate the 3 tabs, install Lineup Builder from Catalog into Installed, and open the Build workspace shell. Chat input is non-functional (Sprint 4 wires it).
- **Acceptance:** Visually polished, mobile-first, matches existing synth. design language. Bottom nav and footer untouched. Tapping `02 BUILD` routes away from the homepage. Back button in Build returns to homepage.
- **Hard scope rule:** Only edit files under `src/features/app/`. Do not touch `src/features/coach/`, `src/features/coach/tools/`, `src/shared/layout/RequestToolModal.tsx`, or `src/lib/theme.ts`. Use `SYNTH` tokens from `src/features/app/lib/theme.ts` only.

#### Sprint 2: JSON Spec Schema + 5 Example Specs

- **What:** Define the canonical tool spec shape using zod. Build 5 hand-crafted example specs.
- **Deliverables:** `src/lib/tools/schema.ts` (zod schema), `src/lib/tools/examples/` (5 specs: stroke rate logger, lineup compare, wellness summary, lap counter, race plan)
- **Stack touched:** New module under `src/lib/tools/`.
- **Output:** A frozen contract for what a "tool" is. Validated by zod.
- **Acceptance:** Schema is type-safe end-to-end. Examples render valid JSON.

#### Sprint 3: ToolRenderer Component

- **What:** Build `<ToolRenderer spec={...} data={...} />` that turns a JSON spec into native React using existing primitives.
- **Deliverables:** `src/lib/tools/ToolRenderer.tsx`, primitive registry with 12 components (stat, line_chart, bar_chart, table, athlete_card, boat_lineup, timer, badge, button, input, select, text)
- **Stack touched:** New module. Wraps existing `src/features/app/primitives/` components with stable prop schemas.
- **Output:** Hand-written specs render correctly using mock data.
- **Acceptance:** All 5 example specs render without errors. No crashes on malformed specs (graceful errors).

#### Sprint 4: Mocked Generation Loop

- **What:** Wire the chat input to a keyword-matching function that returns one of the 5 example specs.
- **Deliverables:** `src/lib/tools/mockGenerator.ts` (keyword matcher), wire into `ToolsBuildPage.tsx`, 2-second fake loading delay with progress messages
- **Stack touched:** Frontend only. No backend.
- **Output:** Type "stroke rate" → see stroke rate logger render. Type "lap counter" → see lap counter render.
- **Acceptance:** End-to-end demo loop works. Looks indistinguishable from real AI in a 60-second demo.

#### Sprint 5: Generation Experience (formerly "Polish + Demo Prep")

- **What:** Three named animation moments + error states + empty states + install workflow (mocked, local state only) + screenshot prep.
- **Three named animation moments** (NOT optional polish — this is how the product feels like AI vs feels like a form submission):
  1. **AI thinking state** — Pulsing dots + progressive copy: "Understanding your request..." → "Composing components..." → "Wiring data..." (~2 seconds total, even when mocked)
  2. **Spec materializing** — Each component fades in one at a time as the spec is parsed (stat first, then chart, then table). Use Framer Motion stagger.
  3. **Tool installing** — "Installing..." with a progress bar → "Tool added to your collection" toast + tool appears in Installed tab with a brief highlight animation
- **Other deliverables:** Smooth transitions between Build workspace and homepage, empty states for sidebar (no chats yet) and main canvas (no tool selected), error states (failed generation, malformed spec), install confirmation, fresh chat creation.
- **Stack touched:** Frontend only. Framer Motion presets in `src/lib/motion.ts`.
- **Output:** Demo-ready end-to-end experience with three distinct animation moments that make it feel like real AI.
- **Acceptance:** Mike Chandler or Peter Mansfeld can use it without coaching. The three animation moments are visually distinct and timed correctly.

> **CHECKPOINT:** End of Sprint 5 = demo to Mike, Peter, and use as YC application demo video.

---

### PHASE B — BACKEND FOUNDATION (Weeks 4-6)

**Why now:** UI is validated. Now we add the real backend underneath. The UI doesn't change — only the generation function does.

#### Sprint 6: Supabase Project + MCP Setup + Foundation Migrations

- **What:** Provision new Supabase project for synth. Apply foundation migrations from `docs/SCHEMA.md` §1, §2, §5, §9 via Supabase MCP.
- **Deliverables:** All 30 tables exist in Supabase. Indexes applied. Foreign keys validated.
- **Stack touched:** Supabase database via MCP.
- **Output:** Provisioned database matching `docs/SCHEMA.md`.
- **Acceptance:** MCP query confirms all tables exist with correct columns.
- **Manual prerequisites (AG does these BEFORE this sprint):**
  - Create Supabase project, save URL + anon key + service role key
  - Generate Personal Access Token, configure Supabase MCP in Claude Code
  - Confirm MCP connection works ("list my Supabase projects")

#### Sprint 7: RLS Policies + Real Auth

- **What:** Apply RLS policies per `docs/SCHEMA.md` §6 matrix. Replace `authBridge.ts` hardcoded mapper with real `users` table lookup. Add three roles: `head_coach`, `assistant_coach`, `athlete`.
- **Deliverables:** All RLS policies active. `users` table populated with test users for all three roles. `authBridge.ts` rewritten.
- **Stack touched:** Supabase RLS via MCP. Auth code in `src/lib/authBridge.ts`, `src/shared/store/useAuthStore.ts`, `src/features/app/store/useAppAuthStore.ts`.
- **Output:** Different roles see different data per RLS.
- **Acceptance:** Login as head_coach, assistant_coach, athlete — each sees correct scoped data.

#### Sprint 8: Vibe-Code Schema + Edge Function Scaffold

- **What:** Add `tool_requests`, `tool_versions`, `tool_runs` tables with RLS. Scaffold the `tool-generate` Edge Function (no engine yet).
- **Deliverables:** New schema applied via MCP. RLS policies on all 3 new tables. Edge Function deployed with JWT verification, accepts `{ description, role, team_id }`, returns `{ request_id, status: 'pending' }`.
- **Stack touched:** Supabase database + Edge Functions.
- **Output:** Schema ready. Edge Function callable via curl. No real generation yet.
- **Acceptance:** Submit a test request, see row appear in `tool_requests` with correct RLS scope.

---

### PHASE C — WIRE UI TO REAL BACKEND (Weeks 7-9)

**Why now:** UI works (Phase A) and backend exists (Phase B). Now connect them and add real AI generation.

#### Sprint 9: v0 Platform API Integration + Multi-Turn Refinement

- **What:** Update `tool-generate` Edge Function to call v0 Platform API with system prompt embedding the spec schema and 3 example tools. Stream response to client. Support multi-turn refinement so coaches can iterate on the spec via chat.
- **Deliverables:**
  1. Edge Function calls v0, parses the response into a valid spec, validates with zod, stores in `tool_versions`
  2. Frontend `mockGenerator.ts` swapped for real Edge Function call
  3. **Multi-turn refinement loop** — each chat turn produces a new `tool_versions` row. Coach can say "swap the line chart for a bar chart" or "add a column for personal best" and v0 produces a revised spec. Coach picks which version to install.
  4. Chat history persists per chat session (sidebar shows all turns)
  5. Each chat turn shows: coach prompt → AI response (with the spec change explained in plain language) → live preview update
- **Stack touched:** Edge Function + frontend hooks + chat persistence in Supabase.
- **Output:** Type a description in synth., get a real v0-generated spec back. Refine via chat. Pick a version to install.
- **Acceptance:** 5 different test descriptions all return valid specs that render correctly. Multi-turn test: generate, refine 3x, install final version, all 4 versions visible in chat history.
- **Manual prerequisites (AG does BEFORE this sprint):**
  - Sign up for v0 Platform API access at `enterprise@v0.dev`
  - Add v0 API key to Supabase project secrets

#### Sprint 10: Persistence + Publish Workflow + Fullscreen Tool View

- **What:** Generated tools persist in Supabase. Head coaches can publish. Other coaches see published tools in catalog. Installing mounts a route at `/app/coach/tools/{slug}` that renders the tool fullscreen as a native app surface.
- **Deliverables:**
  1. Publish/install UI in `CustomToolsPage.tsx`
  2. Dynamic route mounter via React Router 7 `useRoutes()` reading from a fetched list
  3. Tool versioning — each publish = new `tool_versions` row, tools are version-pinned at install time
  4. **Fullscreen tool view** at `/app/coach/tools/{slug}` — tool name + back button + edit/settings gear at top, rendered tool full-bleed below using `<ToolRenderer>`, bottom nav stays. Feels like a native app, not a card.
  5. Settings gear opens a sheet to: rename, configure inputs, view binding sources, uninstall
- **Stack touched:** Frontend + Supabase queries via TanStack Query (install if not yet installed) + dynamic routing.
- **Output:** Generate → publish → other coaches install → use as a fullscreen tool in their team.
- **Acceptance:** Two-account test: head coach publishes, assistant coach installs and uses fullscreen.

---

### PHASE D — PRODUCTION HARDENING (Weeks 10-12)

#### Sprint 11: TanStack Query Migration (Critical Pages)

- **What:** Install TanStack Query. Migrate 6 critical pages off `useStaticQuery` shim to real Supabase queries.
- **Deliverables:** `useTeamData`, `useAthletes`, `useSources`, `useLineups`, `useTimelineEvents`, `useConnectorAccounts` all hit real Supabase via TanStack Query.
- **Stack touched:** Frontend data layer.
- **Output:** 6 pages reading real data. Other 44 pages still on seeds (Phase 3 problem).
- **Acceptance:** Pages load real data. Seed data only used as fallback.

#### Sprint 12: Concept2 OAuth (First Real Connector)

- **What:** Wire real Concept2 OAuth via `connector_accounts` table. Implement token refresh. Update `connectorService.ts` to fetch live data.
- **Deliverables:** OAuth callback handler in Edge Function. Token storage in `connector_accounts` (encrypted at rest). Live Concept2 data flowing into athlete profiles.
- **Stack touched:** Edge Function + OAuth handler + frontend connector UI.
- **Output:** Coach connects Concept2 → real erg scores appear in athlete profiles → can generate tools that bind to Concept2 data.
- **Acceptance:** End-to-end test: connect Concept2, see real erg scores, generate a stroke rate logger that uses real data.
- **Manual prerequisites (AG does BEFORE this sprint):**
  - Register Concept2 developer app, set OAuth redirect URLs
  - Save Concept2 client ID + secret to Supabase secrets

#### Sprint 13: Telemetry, Error Tracking, Hardening

- **What:** PostHog event tracking for tool generation/install/run. Sentry for error tracking. Rate limiting on the Edge Function. CSP tightening.
- **Deliverables:** PostHog events: `tool_request_submitted`, `tool_generated`, `tool_published`, `tool_installed`, `tool_run`. Sentry SDK installed. Edge Function rate limited per `team_id`. CSP narrowed beyond `*.supabase.co` and PostHog.
- **Stack touched:** Frontend + Edge Function + Vercel CSP headers.
- **Output:** Production-grade observability and abuse protection.
- **Acceptance:** Errors visible in Sentry. Rate limit triggers on burst. PostHog dashboard shows funnel.

---

## DATA LAYER ARCHITECTURE

How a generated tool gets data — traced through Sprints 3 → 9 → 12.

**The binding resolver layer is the bridge between specs and real data.**

### How it works at runtime

```
Coach builds a stroke rate logger
        ↓
Spec contains: binding: { source: "concept2", params: { metric: "stroke_rate" } }
        ↓
<ToolRenderer> loads
        ↓
Resolver layer (src/lib/tools/resolver.ts) executes:
   1. Read team's connector_accounts table (does Concept2 OAuth exist?)
   2. If yes → call connectorService → fetch live Concept2 data
   3. If no → return fallback ("Connect Concept2 to see this data")
        ↓
Resolved data passed as `data` prop to primitives in registry
        ↓
Primitives render real numbers, real charts, real tables
```

### Where this work lives across sprints

| Sprint | What lands |
|---|---|
| **Sprint 3** | Resolver shipped against MOCK data (so we can demo end-to-end). Hand-crafted snapshots for each of the 5 example specs. |
| **Sprint 7** | RLS ensures the resolver can only read data the requesting role is allowed to see. |
| **Sprint 9** | Resolver wired to real Supabase queries. Generated tools pull from real `connector_accounts` and `source_data` tables. Still shows fallback when no connector. |
| **Sprint 11** | TanStack Query caches resolver results. Tools feel instant on subsequent loads. |
| **Sprint 12** | Real Concept2 OAuth wired. Resolver pulls live API data, not seeds. First end-to-end "real data" tool. |

### Critical invariant

The resolver is the ONLY place generated tools touch the data layer. A spec never directly imports from `useStaticQuery` or `supabase.from(...)`. This keeps generated tools type-safe, RLS-scoped, and swappable from mock to real data without rewriting tools.

---

## ROUTES MAP

All routes the project introduces under `/app/coach/tools`:

| Route | Sprint | What it renders |
|---|---|---|
| `/app/coach/tools` | Sprint 1 | Three-tab homepage (`01 INSTALLED / 02 BUILD / 03 CATALOG`) |
| `/app/coach/tools/build` | Sprint 1 | Build workspace shell (sidebar + main canvas + chat input). Empty state. |
| `/app/coach/tools/build/:chatId` | Sprint 4 | Build workspace with active chat session loaded |
| `/app/coach/tools/{slug}` | Sprint 10 | Fullscreen view of an installed tool. NOT a tab. Real native-feel route. |
| `/app/coach/tools/{slug}/settings` | Sprint 10 | Per-tool settings sheet (rename, configure inputs, uninstall) |

### What stays unchanged

- The existing `/app/coach/home` and other shell routes
- The bottom nav bar
- The `/coach/tools/*` desktop routes (Phase 2 problem, do not touch)
- All `/athlete/*` routes (separate scope)

### Naming convention

Tool slugs are kebab-case, generated from the tool spec's `id` field (which is regex-locked to kebab-case in the schema). Examples: `stroke-rate-logger`, `wellness-summary`, `lap-counter`.

---

## CUSTOMIZATION ROADMAP

How much can a coach customize a generated tool's appearance? Locked progression:

| Phase | Sprints | What's customizable |
|---|---|---|
| **Phase A** | 1-5 | Nothing. Every tool uses synth. tokens. Predictable design system. |
| **Phase B** | 6-8 | Nothing. Backend foundation work, no surface changes. |
| **Phase C** | 9-10 | Tool name, configurable inputs (athlete picker, date range, etc.). No styling. |
| **Phase D** | 11-13 | Possibly: 3-4 preset theme variants ("Standard / High contrast / Compact / Wide"). Spec gets an optional `theme` field. |
| **Phase 3+ (post-12-week plan)** | TBD | Per-tool theming if real coach demand exists. Currently NOT planned. |

### Why this progression

- Phases A-C need the design system frozen so the renderer is predictable. Adding theme variants while we're still iterating on the renderer = drift hell.
- Phase D theme presets are constrained options the coach picks from, not free-form CSS. Keeps design coherent.
- Free-form theming is a feature only added if coaches actually ask for it after 6+ months of usage. Don't preemptively build it.

---

## DECISIONS YOU MAY NEED TO MAKE DURING EXECUTION

When you (Claude Code) hit one of these, ASK ME — don't decide unilaterally:

1. **Supabase migrations conflict with existing seed data shape:** Ask whether to update seeds or migrate-around.
2. **A primitive's existing prop API doesn't fit the renderer's needs:** Ask whether to evolve the primitive or wrap it.
3. **v0 returns a spec that can't render:** Ask whether to add a validation retry loop or fail and show an error.
4. **Concept2 OAuth scope requirements differ from what we expected:** Ask before submitting the developer app.
5. **A migration would lose data in dev Supabase:** STOP. Ask before applying.

---

## DEFINITIONS OF DONE

For every sprint, the work isn't complete until:

- All deliverables listed in the sprint exist in code or in Supabase
- All acceptance criteria pass
- No new TypeScript errors introduced
- No new ESLint errors introduced (assuming `.eslintrc` is followed)
- Existing tests still pass (`npm run test`)
- A 1-paragraph status update is posted back to me with: what was done, what files changed, any decisions made, any blockers

---

## CURRENT SPRINT STATUS

| Sprint | Status | Notes |
|---|---|---|
| Sprint 1 | ✅ Complete | Three-tab homepage + Build workspace shell shipped |
| Sprint 2 | ✅ Complete | JSON spec schema + 5 examples shipped (commit 2f8fd24). zod v3.25.76. |
| Sprint 3 | 🔜 Next | ToolRenderer + binding resolver + primitive registry |

When I say "**Generate Sprint N prompt**", you will:

1. Read the codebase context relevant to Sprint N (per-sprint hints below)
2. Generate a self-contained prompt for Sprint N — including: exact file paths to edit, component structure, mocked data shape, acceptance criteria
3. Reference any new architectural sections in this doc (Data Layer Architecture, Routes Map, Customization Roadmap) where relevant
4. Stop. Wait for me to approve, edit, or reject the prompt.

That's the loop.

---

## WHEN IN DOUBT

- Read the codebase first
- Ask clarifying questions before generating the prompt, not after
- Smaller scope per sprint > larger scope
- Match existing patterns over inventing new ones
- Do not silently change architectural decisions
- Match the synth. tone in any user-facing copy: clean, confident, no jargon, no emojis, no em dashes
