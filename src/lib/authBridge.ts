import type { User } from '../shared/data/types'
import { supabase } from './supabaseClient'
import { SEED_COACH } from '../shared/data/seeds'

/**
 * Map Supabase auth user to the app's `User` shape. Extend when `users` table is wired.
 */
export function mapSupabaseUserToUser(sbUser: { id: string; email?: string }): User {
  return {
    id: sbUser.id,
    email: sbUser.email ?? 'unknown@local',
    name: sbUser.email?.split('@')[0] ?? 'Coach',
    role: 'coach',
    teamId: SEED_COACH.teamId,
  }
}

export type AuthListener = (user: User | null) => void

/**
 * Subscribe to Supabase session changes. Returns unsubscribe.
 */
export function subscribeSupabaseAuth(onChange: AuthListener): () => void {
  if (!supabase) {
    return () => {}
  }

  void supabase.auth.getSession().then(({ data: { session } }) => {
    onChange(session?.user ? mapSupabaseUserToUser(session.user) : null)
  })

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session?.user ? mapSupabaseUserToUser(session.user) : null)
  })

  return () => {
    data.subscription.unsubscribe()
  }
}
