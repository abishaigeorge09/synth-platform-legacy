/**
 * Resolve the current coach's team_id + role from the live `users` table.
 *
 * Sprint 9.2 — gates the tool-generate live path. When team_id is null,
 * the Build workspace falls back to the mock keyword matcher (demo
 * profiles without a real users row stay in mock mode). When both
 * fields are populated, the workspace dispatches to the Anthropic-
 * powered Edge Function.
 *
 * Sprint 13 follow-up — reactive to auth state. The original one-shot
 * hydrate gave up if Supabase had no session at the moment Build
 * mounted. Demo users sign in anonymously in the background, so the
 * session frequently arrives AFTER hydrate has already returned. A
 * single auth listener now re-queries the users table every time the
 * session changes, so the live path activates as soon as the JWT
 * lands without the user having to refresh.
 */
import { create } from 'zustand'
import { supabase } from '../../../lib/supabaseClient'

export type CoachContext = {
  team_id: string
  role: 'head_coach' | 'assistant_coach' | 'athlete'
}

type CoachContextState = {
  context: CoachContext | null
  hydrated: boolean
  hydrating: boolean
  /** True once we've installed the auth state listener. One-shot. */
  listenerInstalled: boolean
  hydrate: () => Promise<void>
  reset: () => void
}

async function fetchContextFor(userId: string): Promise<CoachContext | null> {
  if (!supabase) return null
  const { data: row, error } = await supabase
    .from('users')
    .select('team_id, role')
    .eq('id', userId)
    .single()
  if (error || !row) return null
  if (
    typeof row.team_id !== 'string' ||
    row.team_id.length === 0 ||
    !(row.role === 'head_coach' || row.role === 'assistant_coach' || row.role === 'athlete')
  ) {
    return null
  }
  return { team_id: row.team_id, role: row.role }
}

export const useCoachContextStore = create<CoachContextState>((set, get) => ({
  context: null,
  hydrated: false,
  hydrating: false,
  listenerInstalled: false,
  hydrate: async () => {
    if (get().hydrating) return
    set({ hydrating: true })
    if (!supabase) {
      set({ hydrating: false, hydrated: true })
      return
    }

    // Initial fetch from whatever session exists right now.
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user.id
    if (userId) {
      const ctx = await fetchContextFor(userId)
      set({ context: ctx })
    }

    // One-shot listener: re-query the users table whenever the auth
    // session changes. Demo users typically arrive here BEFORE
    // signInAnonymously lands — without this listener, the context
    // never resolves and the Build workspace stays in mock mode.
    if (!get().listenerInstalled) {
      set({ listenerInstalled: true })
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const id = session?.user.id
        if (!id) {
          set({ context: null })
          return
        }
        const ctx = await fetchContextFor(id)
        set({ context: ctx })
      })
    }

    set({ hydrating: false, hydrated: true })
  },
  reset: () => set({ context: null, hydrated: false, hydrating: false }),
}))

export function useCoachContext(): {
  context: CoachContext | null
  hydrated: boolean
} {
  const context = useCoachContextStore((s) => s.context)
  const hydrated = useCoachContextStore((s) => s.hydrated)
  return { context, hydrated }
}
