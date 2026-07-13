import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { posthog } from '@shared/analytics/posthog'
import { supabase } from '@lib/supabaseClient'
import { AuthLayout } from './AuthLayout'
import {
  FieldLabel, TextInput,
  PrimaryAuthButton,
} from './authShared'
import { AUTH_TOKENS } from './authTokens'

const { GREEN, MONO, MUTED, DIM, HAIR, FAINT, FG } = AUTH_TOKENS

// Real auth path. When Supabase is configured this page does:
//   - "Continue with Google" → supabase.auth.signInWithOAuth (redirect)
//   - email+password form     → supabase.auth.signInWithPassword
// On success the app navigates to /coach/dashboard. The legacy demo
// shortcut (typing star@synth.app to land on athlete) is preserved for
// the demo build (no env vars) — that path runs without ever calling
// Supabase.

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // If a Supabase session already exists, bounce straight to the dashboard.
  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      if (data.session && !data.session.user.is_anonymous) {
        navigate('/coach/dashboard', { replace: true })
      }
    })
    return () => { cancelled = true }
  }, [navigate])

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!supabase) {
      // Demo build (no env vars) — legacy email shortcut.
      const role = email.trim() === 'star@synth.app' ? 'athlete' : 'coach'
      posthog.identify(email.trim(), { email: email.trim(), role })
      posthog.capture('signed_in', { email: email.trim(), role, mode: 'demo' })
      navigate(role === 'athlete' ? '/athlete/today' : '/coach/dashboard')
      return
    }
    const trimmed = email.trim()
    if (!trimmed || !password) {
      setError('Email and password required.')
      return
    }
    setSubmitting(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      })
      if (signInError) { setError(signInError.message); return }
      if (!data.session) { setError('Sign-in succeeded but no session returned. Try again.'); return }
      posthog.identify(trimmed, { email: trimmed, role: 'coach' })
      posthog.capture('signed_in', { email: trimmed, role: 'coach', mode: 'supabase' })
      navigate('/coach/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  // Google OAuth is intentionally disabled until the provider is
  // configured in the Supabase dashboard (Auth → Providers → Google).
  // When ready, restore the handler + the Continue-with-Google button.

  return (
    <AuthLayout tab="login">

      <form className="flex flex-col gap-4" onSubmit={handleEmailLogin}>
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput
            type="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <FieldLabel
            hint={
              <a
                href="mailto:supportsynth@gmail.com?subject=Password%20reset%20request"
                className="text-[10px] uppercase tracking-[0.28em] transition-colors hover:text-white"
                style={{ color: GREEN, fontFamily: MONO }}
              >
                Forgot?
              </a>
            }
          >
            Password
          </FieldLabel>
          <div className="relative">
            <TextInput
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 text-[10px] uppercase tracking-[0.22em] transition-colors hover:text-white"
              style={{ fontFamily: MONO, color: DIM }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md px-3 py-2.5 text-[12px]"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              fontFamily: MONO,
            }}
          >
            {error}
          </div>
        )}

        <PrimaryAuthButton type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in →'}
        </PrimaryAuthButton>
      </form>

      {/* Subtle demo entry — for stakeholders / press / first-look users
       *  who don't have credentials yet. Routes into the seeded demo. */}
      <div className="mt-5 flex items-center justify-center gap-2 text-[11px]" style={{ fontFamily: MONO, color: MUTED }}>
        <span style={{ color: DIM }}>No account?</span>
        <Link
          to="/coach/dashboard"
          className="inline-flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: GREEN }}
        >
          View the demo
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.32em]" style={{ color: DIM, fontFamily: MONO }}>
        <a href="/legal/terms" className="transition-colors hover:text-white">Terms</a>
        <span style={{ color: HAIR }}>·</span>
        <a href="/legal/privacy" className="transition-colors hover:text-white">Privacy</a>
      </div>

      {/* unused token guard */}
      <span aria-hidden style={{ display: 'none', color: FG, borderColor: FAINT }} />
    </AuthLayout>
  )
}

