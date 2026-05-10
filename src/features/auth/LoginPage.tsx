import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { THEME } from '../../lib/theme'
import { posthog } from '../../shared/analytics/posthog'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'

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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabaseReady = isSupabaseConfigured()

  // If a Supabase session already exists (e.g. user hit /login while
  // signed in), bounce straight to the dashboard.
  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      if (data.session && !data.session.user.is_anonymous) {
        navigate('/coach/dashboard', { replace: true })
      }
    })
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!supabase) {
      // Demo build (no env vars) — fall back to the legacy email shortcut.
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
      if (signInError) {
        setError(signInError.message)
        return
      }
      if (!data.session) {
        setError('Sign-in succeeded but no session returned. Try again.')
        return
      }
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
      // On success the page redirects; nothing more to do here.
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6" style={{ background: THEME.light }}>
      <div
        className="w-full max-w-[440px] rounded-2xl border p-8 shadow-sm"
        style={{ background: THEME.white, borderColor: THEME.border }}
      >
        <div className="mb-6 flex items-center gap-1.5">
          <span
            className="text-[20px] font-semibold leading-none"
            style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
          >
            synth<span style={{ color: THEME.accent }}>.</span>
          </span>
        </div>
        <div
          className="mb-2 text-[10px] uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Sign in
        </div>
        <h1
          className="mb-6 text-[28px] font-semibold leading-tight"
          style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
        >
          Welcome back.
        </h1>

        {/* Google OAuth — only when Supabase is configured */}
        {supabaseReady && (
          <>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-colors hover:bg-zinc-50 disabled:opacity-60"
              style={{
                borderColor: THEME.border,
                color: THEME.textPrimary,
                background: THEME.white,
              }}
            >
              <GoogleGlyph />
              Continue with Google
            </button>
            <div
              className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              <div className="h-px flex-1" style={{ background: THEME.border }} />
              or email
              <div className="h-px flex-1" style={{ background: THEME.border }} />
            </div>
          </>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleEmailLogin}>
          <label className="flex flex-col gap-1">
            <span
              className="text-[10px] uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              Email
            </span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
              style={{ borderColor: THEME.border, color: THEME.textPrimary }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span
              className="text-[10px] uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
              style={{ borderColor: THEME.border, color: THEME.textPrimary }}
            />
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-lg border px-3 py-2 text-[12px]"
              style={{
                borderColor: THEME.red,
                background: `${THEME.red}10`,
                color: THEME.red,
                fontFamily: THEME.fontMono,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full py-3 text-[13px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.01] disabled:opacity-60"
            style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {!supabaseReady && (
          <div
            className="mt-4 rounded-xl border border-dashed p-3 text-[11px] leading-relaxed"
            style={{ borderColor: THEME.border, color: THEME.textMuted, fontFamily: THEME.fontMono }}
          >
            Demo mode. Type any email to enter the coach view ·{' '}
            <strong>star@synth.app</strong> drops into the athlete view.
          </div>
        )}

        <div
          className="mt-5 flex flex-col gap-2 text-[11px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          <div className="flex items-center justify-between">
            <Link to="/signup" className="hover:underline">
              Create an account →
            </Link>
            <Link to="/join/PAC-WR-2026" className="hover:underline">
              Join with invite code
            </Link>
          </div>
          <Link to="/" className="hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.638-.057-1.252-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.703-1.567 2.684-3.875 2.684-6.616z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.258c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.331A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71a5.41 5.41 0 0 1-.282-1.71c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}
