/**
 * Client-readable feature flags. Server-side flags belong in Edge Functions / env, not here.
 */
export const featureFlags = {
  sheetsWriteback: import.meta.env.VITE_FEATURE_SHEETS_WRITEBACK !== 'false',
  aiImport: import.meta.env.VITE_FEATURE_AI_IMPORT !== 'false',
  logLevel: (import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') ?? 'info',
  // When true, the entire public site collapses to a single waitlist page
  // (routes.tsx swaps its route table). The full marketing site + app still
  // live in the bundle untouched — flip VITE_WAITLIST_MODE back to 'false'
  // (or unset) in Vercel and redeploy to restore the original site. Opt-in:
  // only 'true' enables it, so the default deploy is unaffected.
  waitlistMode: import.meta.env.VITE_WAITLIST_MODE === 'true',
} as const
