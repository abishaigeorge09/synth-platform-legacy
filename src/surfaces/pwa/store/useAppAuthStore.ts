import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { getSupabase, signOutFromSupabase } from '../lib/supabase'
import { clearGuidedTour } from '@shared/tutorial/useGuidedTourStore'

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
    // (Earlier debug `console.log('[hydrate] ...')` traces were removed
    // after we confirmed the splash unblocks correctly with this flow.)

    // Wire the auth listener FIRST. Supabase calls it with an
    // INITIAL_SESSION event right after registration, which delivers
    // whatever session was hydrated from storage — without us having
    // to await getSession(). That getSession() call has been observed
    // to hang in @supabase/supabase-js v2 when there's a stale refresh
    // token in localStorage (auto-refresh blocks on a hung internal
    // lock). Sidestepping it entirely.
    //
    // isDemo stays true whenever the demo flow stamped localStorage,
    // even after signInAnonymously gives them a real session. The flag
    // means "came in via Continue with Demo", not "has no session".
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? readDemoUser(),
        isDemo: readDemoUser() !== null,
      })
    })

    // Splash clears synchronously based on whatever localStorage
    // already had. The listener above will replace `user` with the
    // real Supabase user object once the SDK fires INITIAL_SESSION.
    set({
      user: readDemoUser(),
      isReady: true,
      isDemo: readDemoUser() !== null,
    })

    // Demo recovery: localStorage has the demo flag but no Supabase
    // session yet. Fire signInAnonymously in the background — the
    // listener above catches the session whenever the call lands.
    // Wrapped in a try so failures don't crash the app.
    if (readDemoUser() !== null) {
      void (async () => {
        // Best-effort check — if there's already a session, skip.
        // Wrapped in Promise.race so a hung getSession can't take
        // down the recovery flow either.
        const sessionCheck = Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 1500),
          ),
        ])
        const { data } = await sessionCheck
        if (data.session) return
        try {
          await supabase.auth.signInAnonymously()
        } catch (err) {
          if (typeof console !== 'undefined') {
            console.warn('[demo] anon recovery failed', err)
          }
        }
      })()
    }
  },
  signOut: async () => {
    // Order matters. Three race conditions to avoid:
    //
    //  1) supabase.auth.signOut hangs. We've seen the v2 SDK's
    //     internal lock occasionally block this call indefinitely.
    //     If we await it FIRST, the user stays stuck on the
    //     settings page with no feedback and the navigate() in the
    //     button handler never fires. Solved by clearing local
    //     state synchronously up front, then firing supabase signOut
    //     with a timeout race in the helper.
    //
    //  2) Auth listener race. The onAuthStateChange listener
    //     installed in hydrate() resets `user` to readDemoUser() on
    //     every event. When supabase.auth.signOut fires its
    //     SIGNED_OUT event, the listener runs synchronously and
    //     reads localStorage. If localStorage still has the demo
    //     flag at that point, the listener undoes our sign-out by
    //     reinstating the demo user. By clearing localStorage
    //     BEFORE the supabase call begins, the listener sees an
    //     empty localStorage and behaves correctly.
    //
    //  3) signInAnonymously side effects. setDemoUser fires
    //     anonymous sign-in in the background. If we sign out while
    //     that promise is still in flight, it could land AFTER our
    //     sign-out, putting a fresh anonymous session back on the
    //     client. Clearing the demo flag first means setDemoUser is
    //     no longer the active intent, so we don't trigger another
    //     anon sign-in. Any in-flight one lands as a stale event
    //     the cleared listener will route to user=null.
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ROLE_STORAGE_KEY)
      window.localStorage.removeItem(DEMO_USER_STORAGE_KEY)
      window.localStorage.removeItem(ONBOARDING_DONE_KEY)
    }
    clearGuidedTour()
    set({ user: null, role: null, isDemo: false, hasCompletedOnboarding: false })

    // Fire the supabase signOut last. Helper uses scope: 'local' +
    // a 1.5s timeout so this never blocks the UI.
    await signOutFromSupabase()
  },
}))
