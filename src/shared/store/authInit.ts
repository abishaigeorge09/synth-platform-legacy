import { isSupabaseConfigured } from '@lib/supabaseClient'
import { subscribeSupabaseAuth } from '@lib/authBridge'
import { useAuthStore } from '@shared/store/useAuthStore'

/** Call once from `main.tsx` to sync Supabase session into `useAuthStore`. */
export function initAuth(): void {
  if (!isSupabaseConfigured()) return
  subscribeSupabaseAuth((user) => {
    useAuthStore.setState({
      user: user ?? null,
      role: user?.role ?? null,
      mode: 'supabase',
    })
  })
}
