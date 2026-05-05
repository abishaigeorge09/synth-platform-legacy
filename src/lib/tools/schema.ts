/**
 * Canonical JSON shape for a vibe-code tool.
 *
 * Frozen contract (Sprint 2 of the vibe-code Custom Tools plan). Consumed
 * by every downstream sprint:
 *   - Sprint 3: ToolRenderer maps element types -> primitives
 *   - Sprint 4: mockGenerator returns ToolSpec
 *   - Sprint 6-8: tool_versions.spec_json column stores ToolSpec rows
 *   - Sprint 9: tool-generate Edge Function (Deno) re-imports this module
 *               via npm: specifier, validating v0 output before persistence
 *
 * Naming: schemas suffixed `Schema` so the value (zod parser) and the type
 * (z.infer<>) can coexist without clashing. Consumers that only need the
 * type should `import type { ToolSpec } from '...'`; consumers that need
 * runtime validation `import { ToolSpecSchema, parseToolSpec } from '...'`.
 */
import { z } from 'zod'

/**
 * Default schema_version emitted by new specs (v0 generator, mockGenerator).
 * Specs that opt in to v2-only primitives (boat_race, ...) declare
 * `schema_version: 2` literally — see `pacificBoatRace.ts`.
 */
export const SCHEMA_VERSION = 1 as const

/**
 * Sprint 5.7 — schema bump to v2 with backwards compat (AG-approved
 * 2026-05-04). v1 specs continue to parse and render unchanged; v2 adds the
 * `boat_race` element type. Any future bumps land here as a new literal.
 */
export const SUPPORTED_SCHEMA_VERSIONS = [1, 2] as const

// ─── Inputs (top-level user-supplied parameters) ──────────────────────────

const ToolInputBase = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  required: z.boolean().optional(),
})

const AthleteIdInputSchema = ToolInputBase.extend({
  kind: z.literal('athlete_id'),
  default: z.string().optional(),
})

const TeamIdInputSchema = ToolInputBase.extend({
  kind: z.literal('team_id'),
  default: z.string().optional(),
})

const TextInputSchema = ToolInputBase.extend({
  kind: z.literal('text'),
  default: z.string().optional(),
})

const NumberInputSchema = ToolInputBase.extend({
  kind: z.literal('number'),
  default: z.number().optional(),
})

const DateRangeInputSchema = ToolInputBase.extend({
  kind: z.literal('date_range'),
  default: z.tuple([z.string(), z.string()]).optional(),
})

const SelectInputSchema = ToolInputBase.extend({
  kind: z.literal('select'),
  default: z.string().optional(),
  options: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1),
})

export const ToolInputSchema = z.discriminatedUnion('kind', [
  AthleteIdInputSchema,
  TeamIdInputSchema,
  TextInputSchema,
  NumberInputSchema,
  DateRangeInputSchema,
  SelectInputSchema,
])

// ─── Bindings (named data sources) ────────────────────────────────────────

export const ToolBindingSchema = z.object({
  source: z.enum([
    'concept2',
    'strava',
    'whoop',
    'sheets',
    'manual',
    'computed',
    'static',
  ]),
  // Opaque for v1. Sprint 9 tightens to fully-typed per-source unions.
  // Convention: `computed` bindings declare their inputs via
  // `params.dependsOn: string[]` referencing other binding names.
  params: z.record(z.unknown()),
})

// ─── Element shared shape ─────────────────────────────────────────────────

const ElementShared = z.object({
  id: z.string().optional(),
  width: z.enum(['full', 'half', 'third']).optional(),
})

const StatValueSchema = z.union([
  z.number(),
  z.string(),
  z.object({ binding: z.string() }),
])

// ─── Elements (discriminated on `type`) ───────────────────────────────────

const StatElementSchema = ElementShared.extend({
  type: z.literal('stat'),
  label: z.string(),
  value: StatValueSchema,
  unit: z.string().optional(),
  trend: z.enum(['up', 'down', 'flat']).optional(),
})

const LineChartElementSchema = ElementShared.extend({
  type: z.literal('line_chart'),
  title: z.string(),
  xKey: z.string(),
  yKeys: z.array(z.string()).min(1),
  dataKey: z.string(),
})

const BarChartElementSchema = ElementShared.extend({
  type: z.literal('bar_chart'),
  title: z.string(),
  xKey: z.string(),
  yKeys: z.array(z.string()).min(1),
  dataKey: z.string(),
})

const TableElementSchema = ElementShared.extend({
  type: z.literal('table'),
  title: z.string().optional(),
  columns: z
    .array(z.object({ key: z.string(), label: z.string() }))
    .min(1),
  dataKey: z.string(),
})

const AthleteCardElementSchema = ElementShared.extend({
  type: z.literal('athlete_card'),
  dataKey: z.string(),
})

const BoatLineupElementSchema = ElementShared.extend({
  type: z.literal('boat_lineup'),
  dataKey: z.string(),
})

const TimerElementSchema = ElementShared.extend({
  type: z.literal('timer'),
  label: z.string(),
  mode: z.enum(['stopwatch', 'countdown']),
  durationMs: z.number().positive().optional(),
})

const BadgeElementSchema = ElementShared.extend({
  type: z.literal('badge'),
  label: z.string(),
  tone: z.enum(['info', 'success', 'warning', 'danger']),
})

const ButtonElementSchema = ElementShared.extend({
  type: z.literal('button'),
  label: z.string(),
  action: z.object({
    kind: z.enum(['noop', 'submit', 'reset']),
    payload: z.record(z.unknown()).optional(),
  }),
})

const InputElementSchema = ElementShared.extend({
  type: z.literal('input'),
  name: z.string().min(1),
  label: z.string(),
  kind: z.enum(['text', 'number', 'date']),
  placeholder: z.string().optional(),
})

const SelectElementSchema = ElementShared.extend({
  type: z.literal('select'),
  name: z.string().min(1),
  label: z.string(),
  options: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1),
})

const TextElementSchema = ElementShared.extend({
  type: z.literal('text'),
  content: z.string(),
  tone: z.enum(['body', 'kicker', 'caption']).optional(),
})

// Sprint 5.7 — animated lane racer. `dataKey` resolves to
// `{ boats: { name: string; finishMs: number; color?: string }[] }`.
// Renderer animates each boat from 0 -> (finishMs / max) over `durationMs`.
const BoatRaceElementSchema = ElementShared.extend({
  type: z.literal('boat_race'),
  dataKey: z.string(),
  durationMs: z.number().int().positive().optional(),
})

export const ToolElementSchema = z.discriminatedUnion('type', [
  StatElementSchema,
  LineChartElementSchema,
  BarChartElementSchema,
  TableElementSchema,
  AthleteCardElementSchema,
  BoatLineupElementSchema,
  TimerElementSchema,
  BadgeElementSchema,
  ButtonElementSchema,
  InputElementSchema,
  SelectElementSchema,
  TextElementSchema,
  BoatRaceElementSchema,
])

// ─── Tool spec (top-level) ────────────────────────────────────────────────

export const ToolSpecSchema = z.object({
  schema_version: z.union([z.literal(1), z.literal(2)]),
  // Slug — kebab-case, lowercase. Used as React key and as the URL segment
  // when a generated tool mounts at /app/coach/tools/<id>.
  id: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9-]*$/, 'id must be kebab-case'),
  name: z.string().min(1),
  description: z.string(),
  category: z.enum([
    'lineups',
    'timing',
    'analysis',
    'coaching',
    'data',
    'wellness',
  ]),
  // Resolved by renderIcon() in CustomToolsPage. New tools should reuse
  // existing iconKeys; unknown keys fall back to the Sparkles glyph.
  icon_key: z.string().min(1),
  // Strict semver — matches `<major>.<minor>.<patch>`.
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be semver'),
  scope: z.enum(['team', 'athlete', 'self']),
  inputs: z.array(ToolInputSchema),
  bindings: z.record(ToolBindingSchema),
  elements: z.array(ToolElementSchema),
})

// ─── Inferred TS types ────────────────────────────────────────────────────

export type ToolSpec = z.infer<typeof ToolSpecSchema>
export type ToolElement = z.infer<typeof ToolElementSchema>
export type ToolInput = z.infer<typeof ToolInputSchema>
export type ToolBinding = z.infer<typeof ToolBindingSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Strict parser. Throws `z.ZodError` on invalid input. Use when the caller
 * wants to bubble validation failures (e.g. example-spec round-trip tests,
 * Edge Function request handlers).
 */
export function parseToolSpec(input: unknown): ToolSpec {
  return ToolSpecSchema.parse(input)
}

/**
 * Result-shape parser. Use in UI code where a failed parse should produce
 * an error state rather than a thrown exception.
 */
export function safeParseToolSpec(
  input: unknown,
):
  | { success: true; data: ToolSpec }
  | { success: false; error: z.ZodError } {
  const r = ToolSpecSchema.safeParse(input)
  if (r.success) return { success: true, data: r.data }
  return { success: false, error: r.error }
}
