import type { User, UserRole } from '../shared/data/types'
import { supabase } from './supabaseClient'

/**
 * Map a Supabase auth user to the app's `User` shape by looking up the
 * corresponding row in `public.users`. Returns null when:
 *   - Supabase isn't configured (demo mode)
 *   - The auth user has no row in public.users yet (e.g. mid-signup)
 *   - The lookup errors (network / RLS rejection)
 *
 * Sprint 7 — replaces the prior hardcoded `role: 'coach'` + SEED team.
 * The synth_platform Supabase project enforces the 3-role enum
 * (head_coach | assistant_coach | athlete) at the column level.
 */
export async function mapSupabaseUserToUser(
  sbUser: { id: string; email?: string },
): Promise<User | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, team_id, avatar_url')
    .eq('id', sbUser.id)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id as string,
    email: data.email as string,
    name: data.name as string,
    role: data.role as UserRole,
    teamId: (data.team_id as string | null) ?? null,
    avatarUrl: (data.avatar_url as string | undefined) ?? undefined,
  }
}

export type AuthListener = (user: User | null) => void

/**
 * Subscribe to Supabase session changes. Returns unsubscribe.
 *
 * Both the initial session check and onAuthStateChange callbacks are now
 * async because mapSupabaseUserToUser hits the database. Listeners receive
 * `null` while the lookup is in flight (no synchronous best-guess shape).
 */
export function subscribeSupabaseAuth(onChange: AuthListener): () => void {
  if (!supabase) {
    return () => {}
  }

  void supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user) {
      const user = await mapSupabaseUserToUser(session.user)
      onChange(user)
    } else {
      onChange(null)
    }
  })

  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const user = await mapSupabaseUserToUser(session.user)
      onChange(user)
    } else {
      onChange(null)
    }
  })

  return () => {
    data.subscription.unsubscribe()
  }
}
