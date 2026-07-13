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
  '/coach/dashboard': () => import('@surfaces/webapp/coach/dashboard/DashboardPage'),
  '/coach/athletes': () => import('@surfaces/webapp/coach/athletes/AthletesPage'),
  '/coach/sources': () => import('@surfaces/webapp/coach/sources/SourcesPage'),
  '/coach/tools/lineups': () => import('@surfaces/webapp/coach/tools/lineups/LineupsPage'),
  '/coach/tools/session-timer': () => import('@surfaces/webapp/coach/tools/sessionTimer/SessionTimerPage'),
  '/coach/ai': () => import('@surfaces/webapp/coach/ai/TeamChatPage'),
  '/coach/settings': () => import('@surfaces/webapp/coach/settings/SettingsPage'),

  // Athlete routes
  '/athlete/home': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/stats': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/today': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/progress': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/record': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/workbook': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/sessions': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/lineups': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/sources': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/sources/connectors': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/sources/data-view': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/ai': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/chat': () => import('@surfaces/webapp/athlete/athleteAppPages'),
  '/athlete/settings': () => import('@surfaces/webapp/athlete/athleteAppPages'),
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
