# synth. — Vibe-Code Review Rubric

**For:** The Reviewer agent
**Used by:** `.claude/agents/reviewer.md`
**Last updated:** May 4, 2026

This is the criteria the Reviewer agent grades every Builder-generated sprint prompt against. The Builder sees this document too — every prompt should be self-checked against this rubric before being sent for review.

---

## Universal gates — every prompt is graded against all 5

### Gate 1 — Scope Compliance

The prompt MUST:
- Only edit files within the sprint's allowed paths (per the master plan and phase rules)
- Not touch any "do not touch" surface
- Not introduce dependencies that aren't authorized
- Match the sprint's stated stack-touched scope

**Phase A scope rules:**
- ALLOWED: `src/features/app/coach/`, `src/features/app/athlete/`, `src/features/app/primitives/`, `src/features/app/lib/`, `src/features/app/store/`, `src/lib/tools/` (new), `src/app/routes.tsx`
- FORBIDDEN: `src/features/coach/`, `src/features/coach/tools/`, `src/features/athlete/`, `src/shared/layout/RequestToolModal.tsx`, `src/lib/theme.ts` (desktop tokens), any backend code

**Phase B scope rules:**
- ALLOWED: Supabase migrations via MCP, Edge Functions in Supabase, `src/lib/authBridge.ts`, `src/shared/store/useAuthStore.ts`, `src/features/app/store/useAppAuthStore.ts`
- FORBIDDEN: anything that ships service_role keys to the browser, any direct SQL files for manual execution

**Phase C scope rules:**
- ALLOWED: Edge Function code, frontend hooks for Supabase queries, `tool-generate` enhancements, dynamic routing in `src/app/routes.tsx`
- FORBIDDEN: v0 API key in `VITE_*` env vars, Edge Function calls without JWT verification, raw v0 output stored without zod validation

**Phase D scope rules:**
- ALLOWED: PostHog instrumentation, Sentry integration, rate limiting, CSP headers, OAuth handlers
- FORBIDDEN: any PII in logs/events, any rate-limit bypass paths, CSP changes that break existing functionality

If a prompt violates ANY scope rule for its phase: **REVISE.**

---

### Gate 2 — Deliverable Completeness

The prompt MUST:
- Address every deliverable listed in the master plan for that sprint
- Have acceptance criteria specific enough to verify after execution
- Reference real file paths (verifiable in the codebase) — not invented ones
- Define done explicitly (not vague "works correctly")

If the master plan says Sprint N delivers items A, B, C and the prompt only covers A and B: **REVISE.**

If the prompt says "edit `src/features/app/coach/SomeFile.tsx`" and that file doesn't exist: **REVISE.**

If acceptance criteria are vague ("looks good", "feels native"): **REVISE.**

---

### Gate 3 — Architectural Fit

The prompt MUST respect the following locked architectural decisions:

1. **JSON spec, not arbitrary TSX** — generated tools are JSON specs, not code
2. **Mobile shell only** — `/app/coach/*` not `/coach/*`
3. **Supabase Edge Functions** — not Vercel Functions or Next.js API routes
4. **Existing primitive library** — `src/features/app/primitives/` is the design system, don't rebuild
5. **React 18 + TypeScript + Vite + Tailwind + Zustand** — no framework changes
6. **`SYNTH` tokens only** in Phase A — `THEME` (desktop) is forbidden
7. **`useStaticQuery` shim is acceptable** for Phase A — TanStack Query is Sprint 11
8. **Three-tab homepage** (`01 INSTALLED / 02 BUILD / 03 CATALOG`) — locked
9. **Build is a separate route** at `/app/coach/tools/build`, not a tab panel
10. **Resolver hook returns `{ data, isLoading, error }` shape** — Sprint 9 swaps implementation, contract is fixed
11. **Tool spec schema is frozen at `schema_version: 1`** — bumps require AG approval

Plus: the prompt MUST reference relevant new sections in the master plan where applicable:
- Data Layer Architecture (for Sprints 3, 7, 9, 11, 12)
- Routes Map (for Sprints 1, 4, 10)
- Customization Roadmap (for Sprints 5, 13)

If the prompt violates a locked decision OR fails to reference a relevant architectural section: **REVISE.**

---

### Gate 4 — Decision Escalation

The prompt MUST:
- Flag any decision that should be made by AG, not the Builder
- Not silently choose between options when the choice has downstream impact
- Not assume defaults that contradict prior locks

Decisions Builder may NOT silently choose:
- New npm dependencies (even if scope permits — surface for explicit approval)
- Schema migrations that lose data
- New routes not in the Routes Map
- Architectural patterns that diverge from existing code
- New environment variables
- Anything that requires changes to `vercel.json`, `vite.config.ts`, or `package.json` beyond the obvious

Decisions Builder MAY choose with default rules:
- File naming within an established pattern
- Variable names
- Internal helper function shapes
- Test layout within an established test framework

If the prompt makes an under-the-radar decision that should have been escalated: **REVISE** (and include "ESCALATE THIS DECISION" in the required changes).

---

### Gate 5 — Prompt Quality

The prompt MUST:
- Be under 800 words (master plan rule)
- Be self-contained — Claude Code could execute it without re-reading the full master plan
- Include verification steps (how to confirm done)
- Use synth.'s tone in any user-facing copy: clean, confident, no jargon, no emojis, no em dashes
- Quote real file paths verbatim
- Pre-flag any expected blockers Builder anticipates

If a prompt is over 800 words, or requires the executor to re-read the master plan to understand it: **REVISE.**

---

## Phase-specific additional gates

### Phase A (Sprints 1-5) additional gates

- **A1: SYNTH tokens only.** Any usage of `THEME` (desktop) → REVISE.
- **A2: No backend code.** Any Edge Function reference, Supabase mutation, or RLS reference → REVISE.
- **A3: Existing primitives wrapped, not rebuilt.** New primitives only if existing ones genuinely don't fit.
- **A4: Mocked data only.** Real Supabase queries → REVISE.

### Phase B (Sprints 6-8) additional gates

- **B1: Supabase MCP only.** Any "run this SQL manually" instruction to AG → REVISE (use MCP).
- **B2: RLS on every new table.** Any new table without `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` → REVISE.
- **B3: service_role key never in browser.** Any frontend code referencing service_role → REVISE.
- **B4: Migrations are reversible.** Every up migration needs a documented rollback plan.

### Phase C (Sprints 9-10) additional gates

- **C1: v0 key server-side only.** Any `VITE_V0_*` env var → REVISE (must be Edge Function secret).
- **C2: JWT verification before external API calls.** Edge Function that calls v0 without first verifying the user JWT → REVISE.
- **C3: zod validation before storage.** Raw v0 output stored to `tool_versions` without parsing → REVISE.
- **C4: Multi-turn refinement state.** Sprint 9 must persist chat history per session, not lose context.

### Phase D (Sprints 11-13) additional gates

- **D1: No PII in observability.** PostHog events, Sentry breadcrumbs, console logs must scrub PII.
- **D2: Rate limits on all generation endpoints.** Edge Functions exposed without rate limits → REVISE.
- **D3: CSP changes documented.** Every CSP narrowing must list which existing functionality was tested.

---

## Decision matrix for ambiguous prompts

When you (Reviewer) are unsure between verdicts:

| Situation | Default verdict |
|---|---|
| Prompt is technically correct but misses a master plan deliverable | REVISE |
| Prompt is technically correct but architecturally suboptimal | APPROVED WITH NOTES |
| Prompt violates a locked decision but Builder argues it's small | REVISE — locked is locked |
| Prompt makes a default choice that's reasonable but not authorized | REVISE — escalate the decision |
| Prompt is over 800 words but content is all useful | REVISE — split the sprint |
| Prompt references a file that doesn't exist | REVISE — Builder must verify codebase |
| Prompt is fine but has a typo or small wording issue | APPROVED WITH NOTES |
| Prompt has scope creep into a future sprint | REVISE — defer to that sprint |

---

## What Builder cannot rationalize away

These are non-negotiable. Even if Builder argues the rule should bend "just this once":

1. **Scope rules per phase** — never expand mid-sprint
2. **JSON spec architecture** — never generate TSX
3. **Mobile shell first** — never silently extend to desktop
4. **`SYNTH` tokens in Phase A** — never reach for `THEME`
5. **All DB work via MCP** — never hand AG SQL files
6. **JWT verification in Edge Functions** — never call external APIs anonymously
7. **zod validation before storage** — never trust v0 output
8. **Phase boundaries** — never cross without explicit AG re-engagement
9. **Status report after every sprint** — never skip the audit trail
10. **Reviewer must approve before execute** — never skip review

If Builder's prompt violates any of these 10, the verdict is REVISE — full stop.

---

## Final note to the Reviewer

The Builder will sometimes write good, useful prompts that fail the rubric on a technicality. **Reject them anyway.** A small revision is cheap. The cost of letting one technicality slide is establishing a precedent that the rubric is bendable. It is not.

You exist to be the immovable check on Builder's velocity bias. Be the brake when needed. AG will thank you when, in week 8, sprint 7's work doesn't have to be unwound because you caught a scope issue in sprint 5.
