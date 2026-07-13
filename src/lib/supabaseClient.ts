import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * **The single Supabase browser client for the entire app.**
 *
 * Two instances used to live in this codebase (this file + a separate
 * `src/surfaces/pwa/lib/supabase.ts`). That setup silently broke auth:
 * `useAppAuthStore.signInAnonymously()` would mint a session on the second
 * client, but the AI calls (`claude-chat`, `tool-generate`) reached for
 * the JWT off the first client and got null. The 401s in Edge Function
 * logs while anonymous users existed in `auth.users` came from this
 * desync.
 *
 * Now everything imports from here. The `auth` config matches what the
 * old onboarding client expected: persisted session, auto-refresh, and
 * `detectSessionInUrl` so the Google-OAuth callback path still works.
 */
export const supabase: SupabaseClient | null =
  url && anonKey && url.length > 0 && anonKey.length > 0
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

// One-shot diagnostic — fires at module load when the client couldn't
// be created. Visible in the production console so a missing-env-var
// situation (which silently degrades AI to mock mode) is loud and
// debuggable instead of mysterious. Never logs in dev when both vars
// are present in .env.local; only fires when the build environment
// itself is missing them.
if (!supabase && typeof console !== 'undefined') {
  const missing: string[] = []
  if (!url || url.length === 0) missing.push('VITE_SUPABASE_URL')
  if (!anonKey || anonKey.length === 0) missing.push('VITE_SUPABASE_ANON_KEY')
  console.warn(
    `[supabase] client is null at module load. Missing build-time env: ${missing.join(', ')}. ` +
      `AI calls will fall back to mock mode and Edge Functions are unreachable. ` +
      `Set these in Vercel → Settings → Environment Variables for the Production environment.`,
  )
}

export function isSupabaseConfigured(): boolean {
  return supabase !== null
}
