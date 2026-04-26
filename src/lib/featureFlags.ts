/**
 * Client-readable feature flags. Server-side flags belong in Edge Functions / env, not here.
 */
export const featureFlags = {
  sheetsWriteback: import.meta.env.VITE_FEATURE_SHEETS_WRITEBACK !== 'false',
  aiImport: import.meta.env.VITE_FEATURE_AI_IMPORT !== 'false',
  logLevel: (import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') ?? 'info',
} as const
