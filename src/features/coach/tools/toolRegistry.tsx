import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import {
  LineupsIllustration,
  SessionTimerIllustration,
} from '../../../shared/illustrations/sidebarIllustrations'

/**
 * Phase 16 — Custom Tool registry.
 *
 * CLAUDE.md §Architecture calls out Custom Tools as one of synth's five
 * systems and specifically notes "the ToolRegistry pattern keeps the sidebar
 * extensible". Before this file, the Lineups + Session Timer tools were
 * hard-coded in three separate places (Sidebar nav list, route children,
 * lazy-import wiring) — adding a new tool meant touching all three. Now a
 * tool is one entry here plus one illustration in `sidebarIllustrations.tsx`,
 * and the sidebar + routes derive themselves from this list.
 *
 * The lazy component is bundled into the registry entry (not the route file)
 * so each tool owns its own code-split boundary alongside its nav metadata.
 */

export type CoachTool = {
  /** Stable machine id, used for React keys and debug logging. */
  id: string
  /** Label shown in the sidebar. */
  label: string
  /** Short blurb — surfaced later in a tool picker / command palette. */
  description: string
  /** Route path relative to `/coach` (no leading slash). */
  path: string
  /** Absolute path for NavLink usage. */
  absolutePath: string
  /** Sidebar glyph. One of the custom SVG illustrations. */
  Glyph: ComponentType<{ size?: number; muted?: boolean }>
  /**
   * Human-readable label for the route's ErrorBoundary — surfaces in the
   * fallback kicker and in `[synth] route error` console logs.
   */
  routeLabel: string
  /** The lazy-loaded page component mounted at `absolutePath`. */
  Component: LazyExoticComponent<ComponentType<unknown>>
}

// Same lazy-default-from-named-export shim routes.tsx uses. Duplicated here
// instead of imported so the registry file has zero dependencies on the app
// routing layer — tools should be describable without touching the router.
function lazyNamed<T extends string>(
  loader: () => Promise<Record<T, ComponentType<unknown>>>,
  name: T,
): LazyExoticComponent<ComponentType<unknown>> {
  return lazy(async () => {
    const mod = await loader()
    return { default: mod[name] }
  })
}

export const COACH_TOOLS: CoachTool[] = [
  {
    id: 'lineups',
    label: 'Lineups',
    description: 'Drag/drop boat builder with port/starboard seats and history.',
    path: 'tools/lineups',
    absolutePath: '/coach/tools/lineups',
    Glyph: LineupsIllustration,
    routeLabel: 'Lineups',
    Component: lazyNamed(() => import('./lineups/LineupsPage'), 'LineupsPage'),
  },
  {
    id: 'session-timer',
    label: 'Session Timer',
    description: 'RAF stopwatch with multi-boat splits and video-recording stub.',
    path: 'tools/session-timer',
    absolutePath: '/coach/tools/session-timer',
    Glyph: SessionTimerIllustration,
    routeLabel: 'Session timer',
    Component: lazyNamed(
      () => import('./sessionTimer/SessionTimerPage'),
      'SessionTimerPage',
    ),
  },
]
