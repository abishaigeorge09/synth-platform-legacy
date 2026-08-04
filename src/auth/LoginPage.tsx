import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { posthog } from '@shared/analytics/posthog'
import { supabase } from '@lib/supabaseClient'
import { AuthLayout } from './AuthLayout'
import { AUTH_LIGHT } from './authTokens'

const T = AUTH_LIGHT

// Real auth path. When Supabase is configured this page does:
//   - email+password form → supabase.auth.signInWithPassword
// On success the app navigates to /coach/dashboard. The legacy demo shortcut
// (typing star@synth.app to land on athlete) is preserved for the demo build
// (no env vars) — that path runs without ever calling Supabase.

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <AuthLayout tab="login">
      <div className="mb-6">
        <h2 className="text-[26px] leading-[1.15] tracking-[-0.01em]" style={{ color: T.INK, fontFamily: T.SERIF, fontWeight: 600 }}>
          Welcome back
        </h2>
        <p className="mt-2 text-[14px]" style={{ color: T.MUTED, fontFamily: T.BODY }}>
          Sign in to your synth account.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleEmailLogin}>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold" style={{ color: T.INK, fontFamily: T.BODY }}>Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-lg px-3.5 py-3 text-[15px] outline-none transition-shadow focus:[box-shadow:0_0_0_3px_rgba(16,185,129,0.14)] focus:[border-color:#059669]"
            style={{ background: '#FFFFFF', border: `1px solid ${T.HAIR}`, color: T.INK, fontFamily: T.BODY }}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="flex items-center justify-between">
            <span className="text-[12px] font-semibold" style={{ color: T.INK, fontFamily: T.BODY }}>Password</span>
            <a
              href="mailto:supportsynth@gmail.com?subject=Password%20reset%20request"
              className="text-[12px] font-medium transition-colors hover:opacity-70"
              style={{ color: T.GREEN_DEEP, fontFamily: T.BODY }}
            >
              Forgot?
            </a>
          </span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              className="w-full rounded-lg px-3.5 py-3 pr-16 text-[15px] outline-none"
              style={{ background: T.SUNK, border: `1px solid ${T.HAIR}`, color: T.INK, fontFamily: T.BODY }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium transition-colors hover:opacity-70"
              style={{ color: T.MUTED, fontFamily: T.BODY }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        {error && (
          <div
            role="alert"
            className="rounded-lg px-3.5 py-2.5 text-[13px]"
            style={{ background: T.DANGER_WASH, border: `1px solid ${T.DANGER}`, color: T.DANGER, fontFamily: T.BODY }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center rounded-lg py-3.5 text-[15px] font-semibold transition-opacity disabled:opacity-40"
          style={{ background: T.INK, color: '#fff', fontFamily: T.BODY }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-center gap-2 text-[13px]" style={{ fontFamily: T.BODY, color: T.MUTED }}>
        <span style={{ color: T.DIM }}>No account?</span>
        <Link to="/coach/dashboard" className="font-semibold transition-colors hover:opacity-70" style={{ color: T.GREEN_DEEP }}>
          View the demo →
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.24em]" style={{ color: T.DIM, fontFamily: T.MONO }}>
        <a href="/legal/terms" className="transition-colors hover:opacity-70">Terms</a>
        <span style={{ color: T.HAIR }}>·</span>
        <a href="/legal/privacy" className="transition-colors hover:opacity-70">Privacy</a>
      </div>
    </AuthLayout>
  )
}
