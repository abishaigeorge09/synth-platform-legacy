export const AI_PROVIDER = 'mock'
export const AI_ENABLED = false

/**
 * Claude via Vite key (may hit CORS in browser) or dev proxy (see vite.config + `src/lib/ai/claude.ts`).
 */
export function isClaudeConfigured(): boolean {
  if (import.meta.env.DEV && import.meta.env.VITE_ANTHROPIC_USE_DEV_PROXY === 'true') {
    return true
  }
  return !!import.meta.env.VITE_ANTHROPIC_API_KEY
}
