import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { getSupabase, signOutFromSupabase } from '../lib/supabase'
import { clearGuidedTour } from '../../../shared/tutorial/useGuidedTourStore'

export type AppRole = 'coach' | 'athlete'

const ROLE_STORAGE_KEY = 'synth:app:role'
const DEMO_USER_STORAGE_KEY = 'synth:app:demoUser'
const ONBOARDING_DONE_KEY = 'synth:onboarding:done'

type DemoUser = { id: string; email: string }

function readOnboardingDone(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(ONBOARDING_DONE_KEY) === '1'
}

function readRole(): AppRole | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(ROLE_STORAGE_KEY)
  return raw === 'coach' || raw === 'athlete' ? raw : null
}

function readDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(DEMO_USER_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as DemoUser
    return parsed.id && parsed.email ? parsed : null
  } catch {
    return null
  }
}

type AppAuthState = {
  user: User | DemoUser | null
  role: AppRole | null
  isReady: boolean
  isDemo: boolean
  hasCompletedOnboarding: boolean
  setRole: (role: AppRole) => void
  setDemoUser: (user: DemoUser) => void
  markOnboardingDone: () => void
  hydrate: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAppAuthStore = create<AppAuthState>((set) => ({
  user: readDemoUser(),
  role: readRole(),
  isReady: false,
  isDemo: readDemoUser() !== null,
  hasCompletedOnboarding: readOnboardingDone(),
  setRole: (role) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ROLE_STORAGE_KEY, role)
    }
    set({ role })
  },
  setDemoUser: (user) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user))
    }
    set({ user, isDemo: true })
  },
  markOnboardingDone: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ONBOARDING_DONE_KEY, '1')
    }
    set({ hasCompletedOnboarding: true })
  },
  hydrate: async () => {
    const supabase = getSupabase()
    if (!supabase) {
      set({ isReady: true })
      return
    }
    const { data } = await supabase.auth.getSession()
    set({
      user: data.session?.user ?? readDemoUser(),
      isReady: true,
      isDemo: !data.session?.user && readDemoUser() !== null,
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? readDemoUser(),
        isDemo: !session?.user && readDemoUser() !== null,
      })
    })
  },
  signOut: async () => {
    await signOutFromSupabase()
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ROLE_STORAGE_KEY)
      window.localStorage.removeItem(DEMO_USER_STORAGE_KEY)
      window.localStorage.removeItem(ONBOARDING_DONE_KEY)
    }
    clearGuidedTour()
    set({ user: null, role: null, isDemo: false, hasCompletedOnboarding: false })
  },
}))
