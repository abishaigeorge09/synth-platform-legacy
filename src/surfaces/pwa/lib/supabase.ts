/**
 * Re-exports of the single shared Supabase client, plus the auth helpers
 * the onboarding flow uses. The actual client instance lives in
 * `src/lib/supabaseClient.ts` — keeping it singular avoids the session
 * desync that plagued earlier builds (two `createClient` calls meant
 * `signInAnonymously()` on one instance was invisible to the other).
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@lib/supabaseClient'

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

/**
 * Sign out of Supabase.
 *
 * Defaults to `scope: 'local'` — a client-side-only clear with no
 * network call. The default 'global' scope hits api/auth/v1/logout,
 * which has been observed to hang on stale tokens or under flaky
 * network conditions and would leave the user stuck on the settings
 * page indefinitely. 'local' is enough for the user-facing intent
 * ("sign me out of THIS device"); 'global' would invalidate the
 * session everywhere, which we don't currently need.
 *
 * Wrapped in a 1.5s timeout race as a belt-and-suspenders against
 * the SDK's internal lock occasionally blocking even on local
 * scope. If the call doesn't resolve in 1.5s we fall through; the
 * caller has already cleared localStorage + store state and the
 * user has navigated away.
 */
export async function signOutFromSupabase(): Promise<void> {
  if (!supabase) return
  const signOutCall = supabase.auth.signOut({ scope: 'local' }).catch((err) => {
    if (typeof console !== 'undefined') {
      console.warn('[auth] supabase signOut failed', err)
    }
  })
  await Promise.race([
    signOutCall,
    new Promise<void>((resolve) => setTimeout(resolve, 1500)),
  ])
}
