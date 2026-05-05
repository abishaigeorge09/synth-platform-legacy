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
    // Mint a real Supabase anonymous session so demo users can call Edge
    // Functions (claude-chat, tool-generate). The handle_new_auth_user
    // trigger auto-provisions a public.users row pointing at the shared
    // demo team, which lets the live tool-generate path activate without
    // a real signup. Without this call demo users have no JWT and the
    // build chat falls through to the keyword-matcher mock.
    //
    // Failures are silent: if anonymous sign-in is disabled on the
    // Supabase project, or the network is offline, the localStorage
    // demo flag still works for the rest of the app — only the live
    // AI paths degrade to mock mode.
    void (async () => {
      const supabase = getSupabase()
      if (!supabase) return
      const { data: existing } = await supabase.auth.getSession()
      if (existing.session) return
      try {
        await supabase.auth.signInAnonymously()
        // onAuthStateChange (wired in hydrate) picks up the new session
        // and replaces `user` with the real Supabase user object.
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.warn('[demo] anonymous sign-in failed', err)
        }
      }
    })()
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
    const hasDemoFlag = readDemoUser() !== null

    // Demo recovery: localStorage carries the "came in via Continue with
    // Demo" flag from a prior visit, but the user has no Supabase session
    // (e.g. their first visit predated the signInAnonymously fix in
    // setDemoUser, or their session expired). Mint one now so Edge
    // Functions are reachable. Failure stays silent — the app degrades
    // to mock mode rather than crashing.
    if (!data.session && hasDemoFlag) {
      try {
        await supabase.auth.signInAnonymously()
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.warn('[demo] anon recovery failed', err)
        }
      }
    }

    // Re-fetch in case the recovery sign-in just landed.
    const { data: fresh } = await supabase.auth.getSession()
    // isDemo stays true whenever the demo flow stamped localStorage,
    // even after signInAnonymously gives them a real session. The flag
    // means "came in via Continue with Demo", not "has no session".
    // Without this, the auth listener flips isDemo → false the moment
    // anon sign-in lands, breaking demo-only UI affordances.
    set({
      user: fresh.session?.user ?? readDemoUser(),
      isReady: true,
      isDemo: readDemoUser() !== null,
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? readDemoUser(),
        isDemo: readDemoUser() !== null,
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
