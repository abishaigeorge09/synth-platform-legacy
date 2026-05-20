import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { posthog } from '../../shared/analytics/posthog'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import { AuthLayout } from './AuthLayout'
import {
  FieldLabel, TextInput,
  PrimaryAuthButton, GhostAuthButton,
} from './authShared'
import { AUTH_TOKENS } from './authTokens'

const { GREEN, MONO, DIM, HAIR, FAINT, FG } = AUTH_TOKENS

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
  const supabaseReady = isSupabaseConfigured()

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

  async function handleGoogleLogin() {
    setError(null)
    if (!supabase) {
      setError('Google sign-in requires a configured Supabase project.')
      return
    }
    setSubmitting(true)
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/coach/dashboard`,
          scopes: 'openid email profile',
        },
      })
      if (oauthError) {
        setError(oauthError.message)
        setSubmitting(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout tab="login">
      {supabaseReady && (
        <>
          <GhostAuthButton onClick={handleGoogleLogin} disabled={submitting}>
            <GoogleGlyph />
            Continue with Google
          </GhostAuthButton>
          <div
            className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em]"
            style={{ fontFamily: MONO, color: DIM }}
          >
            <div className="h-px flex-1" style={{ background: HAIR }} />
            or
            <div className="h-px flex-1" style={{ background: HAIR }} />
          </div>
        </>
      )}

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
              <Link to="/login" className="text-[10px] uppercase tracking-[0.28em] transition-colors hover:text-white" style={{ color: GREEN, fontFamily: MONO }}>
                Forgot?
              </Link>
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

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.81-.066-1.402-.21-2.018H12v3.665h5.515c-.111.94-.713 2.36-2.05 3.314l-.018.124 2.977 2.307.206.02C20.523 18.027 21.6 15.34 21.6 12.227z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.965-.89 6.62-2.42l-3.155-2.45c-.84.59-1.97 1-3.465 1-2.64 0-4.88-1.74-5.685-4.13l-.117.01-3.097 2.4-.04.111C4.71 19.594 8.083 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.315 13.99A6.07 6.07 0 0 1 5.985 12c0-.7.12-1.37.318-1.99l-.006-.13-3.137-2.43-.103.05A10.07 10.07 0 0 0 2 12c0 1.61.385 3.13 1.057 4.5l3.258-2.51z"
      />
      <path
        fill="#EB4335"
        d="M12 5.88c1.875 0 3.14.81 3.86 1.49l2.823-2.76C16.95 2.99 14.7 2 12 2 8.083 2 4.71 4.4 3.063 7.93l3.247 2.51C7.117 8.05 9.36 5.88 12 5.88z"
      />
    </svg>
  )
}
