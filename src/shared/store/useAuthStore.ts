import { create } from 'zustand'
import type { User, UserRole } from '../data/types'
import { SEED_COACH } from '../data/seeds'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export type AuthMode = 'demo' | 'supabase'

type AuthState = {
  user: User | null
  role: UserRole | null
  mode: AuthMode
  signIn: (user: User) => void
  signOut: () => void
  /** Dev convenience — log in as the seeded Cal Women's coach (demo mode). */
  signInAsDemoCoach: () => void
}

const demoUser = !isSupabaseConfigured() ? SEED_COACH : null
const demoRole = !isSupabaseConfigured() ? SEED_COACH.role : null

export const useAuthStore = create<AuthState>((set) => ({
  user: demoUser,
  role: demoRole,
  mode: isSupabaseConfigured() ? 'supabase' : 'demo',
  signIn: (user) => set({ user, role: user.role, mode: 'demo' }),
  signOut: () => set({ user: null, role: null }),
  signInAsDemoCoach: () => set({ user: SEED_COACH, role: SEED_COACH.role, mode: 'demo' }),
}))
