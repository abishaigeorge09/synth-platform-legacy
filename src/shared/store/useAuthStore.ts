import { create } from 'zustand'
import type { User, UserRole } from '../data/types'
import { SEED_COACH } from '../data/seeds'

type AuthState = {
  user: User | null
  role: UserRole | null
  signIn: (user: User) => void
  signOut: () => void
  /** Dev convenience — log in as the seeded Cal Women's coach. */
  signInAsDemoCoach: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: SEED_COACH, // pre-seeded for UI-first development; replace with real auth later
  role: SEED_COACH.role,
  signIn: (user) => set({ user, role: user.role }),
  signOut: () => set({ user: null, role: null }),
  signInAsDemoCoach: () => set({ user: SEED_COACH, role: SEED_COACH.role }),
}))
