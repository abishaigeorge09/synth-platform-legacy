/**
 * Client-readable feature flags. Server-side flags belong in Edge Functions / env, not here.
 */
export const featureFlags = {
  sheetsWriteback: import.meta.env.VITE_FEATURE_SHEETS_WRITEBACK !== 'false',
  aiImport: import.meta.env.VITE_FEATURE_AI_IMPORT !== 'false',
  // Default OFF (opt-in), unlike the flags above — the AI "build a custom
  // tool" (vibe-coding) flow is deferred to a future phase. Code stays in
  // place; this just hides the entry points and routes.
  aiToolBuild: import.meta.env.VITE_FEATURE_AI_TOOL_BUILD === 'true',
  logLevel: (import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') ?? 'info',
} as const
