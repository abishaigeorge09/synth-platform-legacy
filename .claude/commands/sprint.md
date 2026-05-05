---
description: Run the autonomous sprint loop. Generates prompt, invokes reviewer, executes if approved, reports back.
argument-hint: <sprint-number> [--auto] [--until=<sprint-number>]
---

# /sprint — Autonomous Sprint Loop

You are the **Builder agent** in a two-agent loop. Your role: generate Sprint $1 prompt, get it reviewed by the `reviewer` subagent, execute if approved, report back.

## Arguments

- `$1` — sprint number to run (e.g., `3`, `4`, `5`)
- `--auto` — run autonomously without stopping for AG approval after Builder generates and Reviewer approves. Default: stop and ask AG before executing.
- `--until=N` — after completing this sprint, automatically continue running sprints up to and including sprint N. Stop at the next phase boundary regardless.

## Phase boundaries — HARD STOPS

You MUST stop and require explicit AG re-engagement at these boundaries, even with `--auto` or `--until`:

- **End of Sprint 5** — End of Phase A. AG demos to Mike Chandler / Peter Mansfeld before Phase B.
- **End of Sprint 8** — End of Phase B. AG verifies Supabase state before Phase C.
- **End of Sprint 10** — End of Phase C. AG demos to Mike Chandler before Phase D.
- **End of Sprint 13** — End of project. Full handback.

Do not cross a phase boundary autonomously. Stop, write a phase summary, wait for AG.

## The loop

```
1. Read SYNTH_VIBECODE_MASTER_PLAN.md (relevant sprint section)
2. Read SYNTH_VIBECODE_REVIEW_RUBRIC.md
3. Read codebase context relevant to the sprint
4. Generate Sprint $1 prompt
5. Invoke @reviewer subagent with: { prompt, sprint_number, master_plan_section }
6. Branch on reviewer verdict:
   - APPROVED → proceed to step 7 (or wait for AG if --auto not set)
   - APPROVED WITH NOTES → log notes for AG, proceed to step 7
   - REVISE → return to step 4 with reviewer's required changes. Loop max 3 times.
   - ESCALATE → STOP. Surface to AG. Do not proceed.
7. If --auto not set: surface prompt + verdict to AG, wait for "Approved, execute"
8. If approved: execute the sprint per the prompt
9. After execution: write status report (what was done, files changed, decisions made, blockers, gates passing)
10. If --until specified and current sprint < until value AND not at phase boundary: invoke /sprint $next
11. Otherwise: stop, report
```

## REVISE loop limit

If the Reviewer rejects the same prompt 3 times in a row, **STOP and ESCALATE to AG**. Do not infinite-loop. Three rejections means the sprint scope itself is unclear and AG needs to refine the master plan.

## Status report format

After every executed sprint, write a status report with this exact structure:

```markdown
## Sprint $N — [Status: Complete | Blocked | Partial]

**Commit:** [hash + message]
**Reviewer verdict:** [APPROVED | APPROVED WITH NOTES]
**Reviewer notes for AG:** [if any]

### What was done
[bullet list of concrete deliverables]

### Files added / changed
[file list with line counts]

### Decisions made under defaults
[any decisions Builder made without AG explicit input, with rationale]

### Gates
- npm run test — [N/N pass]
- npm run build — [clean | errors]
- npm run lint — [zero new | N new errors]
- Reviewer rubric — [5/5 gates passed]

### Blockers / open
[anything blocking next sprint, or "none"]

### Next sprint ready
[Yes / No / Conditional on AG decision X]
```

## Communication with @reviewer

When invoking the reviewer, give it everything it needs — never a summarized version of the prompt. Reviewer must see the full prompt as the Builder generated it, with no edits.

```
@reviewer please review the following sprint prompt:

---SPRINT PROMPT START---
[exact text of generated prompt]
---SPRINT PROMPT END---

Sprint number: $1
Phase: [A | B | C | D]
Master plan section: [link or quoted]
Builder context: [any decisions Builder made or assumptions]
```

The Reviewer will return one of: APPROVED / APPROVED WITH NOTES / REVISE / ESCALATE.

## Safety rules — never violate

1. **Phase boundaries always stop you.** No exceptions, even if AG said `--auto`.
2. **REVISE loop has a max of 3 iterations** before escalating.
3. **ESCALATE always stops the autonomous flow.** AG must respond before any further sprints run.
4. **Database operations require Supabase MCP.** Never write SQL files for AG to run manually unless explicitly asked.
5. **New dependencies require explicit AG approval.** Even if the master plan permits the install, surface it: "About to run `npm install zod@^3.24` — approve?"
6. **Status reports are mandatory.** Even if a sprint is small, write the full report. AG audits these to catch drift.
7. **You are not the Reviewer.** Do not self-grade. Always invoke `@reviewer` even if you think the prompt is fine.
8. **Never modify SYNTH_VIBECODE_MASTER_PLAN.md or SYNTH_VIBECODE_REVIEW_RUBRIC.md autonomously.** Those are AG-controlled.

## Start

Begin Sprint $1 now. Read the master plan section for Sprint $1. Read the review rubric. Read codebase context. Generate the prompt. Invoke @reviewer. Loop until verdict. Then either wait for AG (default) or execute (if --auto and verdict is approved).
