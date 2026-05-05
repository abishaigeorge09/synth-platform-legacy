/**
 * Resolve the current coach's team_id + role from the live `users` table.
 *
 * Sprint 9.2 — gates the tool-generate live path. When team_id is null,
 * the Build workspace falls back to the mock keyword matcher (demo
 * profiles without a real users row stay in mock mode). When both
 * fields are populated, the workspace dispatches to the Anthropic-
 * powered Edge Function.
 *
 * Hydration is one-shot per session: we read the row when the user
 * signs in and cache it. The table doesn't change while the user is
 * active — Sprint 11 will replace this with a TanStack Query hook
 * that handles cache invalidation properly.
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
  hydrate: () => Promise<void>
  reset: () => void
}

export const useCoachContextStore = create<CoachContextState>((set, get) => ({
  context: null,
  hydrated: false,
  hydrating: false,
  hydrate: async () => {
    if (get().hydrating || get().hydrated) return
    set({ hydrating: true })
    if (!supabase) {
      set({ hydrating: false, hydrated: true })
      return
    }
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user.id
    if (!userId) {
      set({ hydrating: false, hydrated: true })
      return
    }
    const { data: row, error } = await supabase
      .from('users')
      .select('team_id, role')
      .eq('id', userId)
      .single()
    if (error || !row) {
      set({ hydrating: false, hydrated: true })
      return
    }
    if (
      typeof row.team_id === 'string' &&
      row.team_id.length > 0 &&
      (row.role === 'head_coach' || row.role === 'assistant_coach' || row.role === 'athlete')
    ) {
      set({
        context: { team_id: row.team_id, role: row.role },
        hydrating: false,
        hydrated: true,
      })
      return
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
