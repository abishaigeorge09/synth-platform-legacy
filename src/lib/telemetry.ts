/**
 * Sprint 13 — telemetry harness for the vibe-code Custom Tools flow.
 *
 * Thin wrapper over the existing PostHog client at
 * `src/shared/analytics/posthog.ts`. The PostHog SDK is already
 * initialized when VITE_POSTHOG_KEY is set; this module gives the
 * tools surface a typed `track(event, props)` so call-sites can't
 * misspell event names. When no key is configured the SDK silently
 * no-ops, so guarding here is unnecessary — every track() call is
 * safe regardless of environment.
 *
 * Events instrumented for vibe-code (per master plan §Sprint 13):
 *   tool_request_submitted — coach hits Send / first description
 *   tool_generated         — Anthropic emit_spec returned + persisted
 *   tool_declined          — Anthropic decline_request returned
 *   tool_published         — head coach publishes a tool_versions row
 *   tool_installed         — coach installs from catalog
 */
import { posthog } from '../shared/analytics/posthog'

export type ToolEvent =
  | 'tool_request_submitted'
  | 'tool_generated'
  | 'tool_declined'
  | 'tool_published'
  | 'tool_installed'

export type ToolEventProps = {
  tool_request_submitted: {
    prompt_length: number
    is_refinement: boolean
    mode: 'live' | 'mock'
  }
  tool_generated: {
    spec_id: string
    schema_version: number
    element_count: number
    page_count: number
    unmet_connectors: string[]
    turn_number: number
    mode: 'live' | 'mock'
  }
  tool_declined: {
    reason: string
    suggested_alternative: string
    turn_number: number
  }
  tool_published: {
    spec_id: string
    version_id: string
  }
  tool_installed: {
    spec_id: string
    source: 'catalog' | 'published_team' | 'build'
  }
}

/**
 * Type-safe event tracker. Compiles only when `event` matches a key in
 * ToolEventProps and `props` matches its shape.
 */
export function trackToolEvent<E extends ToolEvent>(
  event: E,
  props: ToolEventProps[E],
): void {
  try {
    posthog.capture(event, props as Record<string, unknown>)
  } catch (err) {
    // Telemetry never breaks the app.
    if (typeof console !== 'undefined') {
      console.warn('[telemetry] capture failed', { event, err })
    }
  }
}
