/**
 * Re-exports of the single shared Supabase client, plus the auth helpers
 * the onboarding flow uses. The actual client instance lives in
 * `src/lib/supabaseClient.ts` — keeping it singular avoids the session
 * desync that plagued earlier builds (two `createClient` calls meant
 * `signInAnonymously()` on one instance was invisible to the other).
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../lib/supabaseClient'

export function isSupabaseConfigured(): boolean {
  return supabase !== null
}

export function getSupabase(): SupabaseClient | null {
  return supabase
}

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
    )
  }
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/app`,
      scopes: 'openid email profile',
    },
  })
}

export async function signOutFromSupabase(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}
