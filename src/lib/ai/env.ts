// AI configuration. Real Claude calls go through the `claude-chat` Supabase
// Edge Function — the Anthropic API key never lives in the browser. "Configured"
// here means: Supabase is wired up so we can mint an access token to call the
// function. Auth-required check happens server-side in the function itself.

import { isSupabaseConfigured } from '../supabaseClient'

export const AI_PROVIDER = 'edge-function'
export const AI_ENABLED = true

export function isClaudeConfigured(): boolean {
  return isSupabaseConfigured()
}
