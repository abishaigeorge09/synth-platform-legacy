/**
 * Phase 27 — route prefetch map.
 *
 * Maps coach/athlete route paths to their dynamic `import()` loaders.
 * When a sidebar NavLink is hovered or focused, calling `prefetchRoute(path)`
 * fires the import — the browser caches the module so the subsequent
 * React.lazy load resolves instantly. Calling `import()` for an already-
 * cached module is a no-op, so multiple hovers are safe.
 *
 * The map intentionally duplicates the import paths from `routes.tsx`.
 * Keeping them here (a pure data module) avoids coupling the sidebar to
 * the route config and keeps the prefetch calls out of the hot render path.
 */

const loaders: Record<string, () => Promise<unknown>> = {
  // Coach routes
  '/coach/dashboard': () => import('../features/coach/dashboard/DashboardPage'),
  '/coach/athletes': () => import('../features/coach/athletes/AthletesPage'),
  '/coach/sources': () => import('../features/coach/sources/SourcesPage'),
  '/coach/tools/lineups': () => import('../features/coach/tools/lineups/LineupsPage'),
  '/coach/tools/session-timer': () => import('../features/coach/tools/sessionTimer/SessionTimerPage'),
  '/coach/ai': () => import('../features/coach/ai/TeamChatPage'),
  '/coach/settings': () => import('../features/coach/settings/SettingsPage'),

  // Athlete routes
  '/athlete/home': () => import('../features/athlete/athleteAppPages'),
  '/athlete/stats': () => import('../features/athlete/athleteAppPages'),
  '/athlete/today': () => import('../features/athlete/athleteAppPages'),
  '/athlete/progress': () => import('../features/athlete/athleteAppPages'),
  '/athlete/record': () => import('../features/athlete/athleteAppPages'),
  '/athlete/workbook': () => import('../features/athlete/athleteAppPages'),
  '/athlete/sessions': () => import('../features/athlete/athleteAppPages'),
  '/athlete/lineups': () => import('../features/athlete/athleteAppPages'),
  '/athlete/sources': () => import('../features/athlete/athleteAppPages'),
  '/athlete/sources/connectors': () => import('../features/athlete/athleteAppPages'),
  '/athlete/sources/data-view': () => import('../features/athlete/athleteAppPages'),
  '/athlete/ai': () => import('../features/athlete/athleteAppPages'),
  '/athlete/chat': () => import('../features/athlete/athleteAppPages'),
  '/athlete/settings': () => import('../features/athlete/athleteAppPages'),
}

/**
 * Start loading a route's chunk ahead of navigation. Safe to call multiple
 * times — the browser deduplicates the request. Silently ignores unknown
 * paths or fetch failures (the actual navigation will handle errors via
 * the ErrorBoundary).
 */
export function prefetchRoute(path: string): void {
  const loader = loaders[path]
  if (loader) loader().catch(() => {})
}
