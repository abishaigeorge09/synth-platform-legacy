import { create } from 'zustand'
import type { User, UserRole } from '@shared/data/types'
import { SEED_COACH, SEED_TEAM_CAL_WOMENS } from '@shared/data/seeds'
import { supabase, isSupabaseConfigured } from '@lib/supabaseClient'

export type AuthMode = 'demo' | 'supabase'

type AuthState = {
  user: User | null
  role: UserRole | null
  mode: AuthMode
  /** True only after the initial Supabase session check has resolved. */
  hydrated: boolean
  /** True if the current Supabase user is anonymous (Continue with Demo). */
  isAnonymous: boolean
  signIn: (user: User) => void
  signOut: () => Promise<void>
  /** Dev convenience — log in as the seeded Pacific Women's coach (demo mode). */
  signInAsDemoCoach: () => void
}

// Initial state. In demo mode we pre-seed SEED_COACH so the legacy /coach
// surfaces work without any auth call. In Supabase mode we start with
// `user=null` and let onAuthStateChange (subscribed below) populate the
// store as soon as the session resolves.
const supabaseConfigured = isSupabaseConfigured()
const initialUser = supabaseConfigured ? null : SEED_COACH
const initialRole = supabaseConfigured ? null : SEED_COACH.role

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  role: initialRole,
  mode: supabaseConfigured ? 'supabase' : 'demo',
  hydrated: !supabaseConfigured, // demo mode is "hydrated" instantly
  isAnonymous: false,
  signIn: (user) => set({ user, role: user.role, mode: 'demo' }),
  signOut: async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut({ scope: 'local' })
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.warn('[auth] supabase signOut failed', err)
        }
      }
    }
    set({ user: null, role: null, isAnonymous: false })
  },
  signInAsDemoCoach: () =>
    set({ user: SEED_COACH, role: SEED_COACH.role, mode: 'demo' }),
}))

// ─── Supabase session bridge ──────────────────────────────────────────────
// Only runs when Supabase is configured. Maps supabase.auth.User → the
// app's User type and pushes session changes into the store. The local
// User shape is preserved so every component that reads useAuthStore
// keeps working — same fields whether the user came from a seed or
// signed in for real.

if (supabase) {
  type SupabaseAuthUser = {
    id: string
    email?: string | null
    user_metadata?: Record<string, unknown> | null
    is_anonymous?: boolean | null
  }

  // Map a Supabase user to our local User shape. Falls back to email or
  // empty string if metadata is missing. team_id stays pinned to the
  // Pacific Women's seed for now — per-coach team scoping lands when
  // team_members is built out.
  const toLocalUser = (supabaseUser: SupabaseAuthUser): User => {
    const meta = (supabaseUser.user_metadata ?? {}) as Record<string, unknown>
    const fullName =
      typeof meta.full_name === 'string' && meta.full_name
        ? (meta.full_name as string)
        : typeof meta.name === 'string' && meta.name
        ? (meta.name as string)
        : (supabaseUser.email ?? '').split('@')[0] || 'Coach'
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      name: fullName,
      role: 'head_coach',
      teamId: SEED_TEAM_CAL_WOMENS.id,
    }
  }

  // Wire the listener first. Supabase emits an INITIAL_SESSION event
  // shortly after subscription, which delivers the persisted session
  // without us awaiting getSession() (the v2 SDK has been observed to
  // hang on stale refresh tokens).
  supabase.auth.onAuthStateChange((event, session) => {
    if (!session) {
      useAuthStore.setState({
        user: null,
        role: null,
        isAnonymous: false,
        hydrated: true,
      })
      return
    }
    if (session.user.is_anonymous) {
      // Anonymous Supabase session (the demo flow). Don't replace the
      // SEED_COACH-style stub; just record that we have a JWT so AI
      // calls can authenticate. The /coach surface keeps using the
      // seed data until the user upgrades to a real account.
      useAuthStore.setState({
        isAnonymous: true,
        hydrated: true,
      })
      return
    }
    const localUser = toLocalUser(session.user)
    useAuthStore.setState({
      user: localUser,
      role: localUser.role,
      mode: 'supabase',
      isAnonymous: false,
      hydrated: true,
    })
    if (event === 'SIGNED_IN' && typeof console !== 'undefined') {
      console.info('[auth] signed in as', localUser.email)
    }
  })

  // Belt-and-suspenders one-shot fetch in case the listener missed the
  // initial event. Race against a 1.5s timeout so a hung getSession
  // (rare but observed) doesn't block hydration forever.
  void Promise.race([
    supabase.auth.getSession(),
    new Promise<{ data: { session: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { session: null } }), 1500),
    ),
  ]).then(({ data }) => {
    if (!data.session) {
      useAuthStore.setState((s) => (s.hydrated ? s : { ...s, hydrated: true }))
      return
    }
    if (data.session.user.is_anonymous) {
      useAuthStore.setState({ isAnonymous: true, hydrated: true })
      return
    }
    const localUser = toLocalUser(data.session.user)
    useAuthStore.setState({
      user: localUser,
      role: localUser.role,
      mode: 'supabase',
      isAnonymous: false,
      hydrated: true,
    })
  })
}
