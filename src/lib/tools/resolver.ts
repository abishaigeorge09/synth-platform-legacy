/**
 * Binding resolver — the single seam between tool specs and platform data.
 *
 * Per master plan §"Data Layer Architecture — Critical invariant", the
 * resolver is the ONLY place generated tools touch the data layer. A spec
 * never directly imports from useStaticQuery or supabase.from(...). This
 * keeps generated tools type-safe, RLS-scoped, and swappable without
 * rewriting tools.
 *
 * Sprint-by-sprint evolution (do NOT skip ahead):
 *   - Sprint 3 (this file): synchronous lookup against MOCK_SNAPSHOTS.
 *     Hand-crafted snapshots per example spec. No network. No Supabase.
 *   - Sprint 7: RLS scopes the data the resolver can read.
 *   - Sprint 9: internals swap to TanStack Query + Supabase reads against
 *     connector_accounts + source_data. Generated tools fall back when no
 *     connector exists.
 *   - Sprint 11: TanStack Query caches resolver results across renders.
 *   - Sprint 12: live Concept2 OAuth pulls real API data, not seeds.
 *
 * The PUBLIC CONTRACT is the ResolverState shape and the useResolvedBindings
 * hook signature. Sprint 9 must NOT change either — only the internals.
 */
import type { ToolSpec } from '@lib/tools/schema'
import { MOCK_SNAPSHOTS } from '@lib/tools/snapshots'

export type ResolvedBindings = Record<string, unknown>

export type BindingStatus = 'connected' | 'fallback' | 'error'

export type ResolverState = {
  data: ResolvedBindings
  isLoading: boolean
  error: Error | null
  bindingStatus: Record<string, BindingStatus>
}

/**
 * Pure function — testable without React. The hook below is a thin wrapper
 * so Sprint 9 can swap to async TanStack Query without consumers changing.
 */
export function resolveBindings(spec: ToolSpec): ResolverState {
  const snapshot = MOCK_SNAPSHOTS[spec.id]
  const bindingStatus: Record<string, BindingStatus> = {}

  if (snapshot) {
    const data: ResolvedBindings = {}
    for (const name of Object.keys(spec.bindings)) {
      if (name in snapshot) {
        data[name] = snapshot[name]
        bindingStatus[name] = 'connected'
      } else {
        // The spec declares a binding the snapshot doesn't satisfy. Surface
        // it as a fallback so the renderer can show "data unavailable" UI
        // instead of silently rendering empty.
        bindingStatus[name] = 'fallback'
      }
    }
    return { data, isLoading: false, error: null, bindingStatus }
  }

  // Unknown spec id — every binding falls back. Sprint 9 will use this same
  // path when no connector is connected for the team.
  for (const name of Object.keys(spec.bindings)) {
    bindingStatus[name] = 'fallback'
  }
  return { data: {}, isLoading: false, error: null, bindingStatus }
}

/**
 * React hook. Sprint 3 = thin pass-through. Sprint 9 swaps internals for
 * a TanStack Query call — return shape stays identical.
 */
export function useResolvedBindings(spec: ToolSpec): ResolverState {
  return resolveBindings(spec)
}
