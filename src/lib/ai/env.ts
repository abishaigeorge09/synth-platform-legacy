// AI configuration. Two paths:
//   1. Supabase Edge Function (production) — key is server-side, JWT required.
//   2. Direct browser call (local demo) — VITE_ANTHROPIC_API_KEY in .env.local.
// "Configured" = either path is available.

import { isSupabaseConfigured } from '../supabaseClient'

export const AI_ENABLED = true

function hasDirectKey(): boolean {
  const k = (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined) ?? ''
  return k.length > 10
}

export function isClaudeConfigured(): boolean {
  return isSupabaseConfigured() || hasDirectKey()
}

export function useDirectPath(): boolean {
  return hasDirectKey()
}
