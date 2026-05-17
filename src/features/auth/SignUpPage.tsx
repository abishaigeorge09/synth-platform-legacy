import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { THEME } from '../../lib/theme'
import { posthog } from '../../shared/analytics/posthog'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'

// Real signup. Two steps so team_name + sport land in user_metadata
// when supabase.auth.signUp fires — the public.handle_new_auth_user
// trigger reads them and provisions the coach's team automatically.
//
//   Step 1 "account" → name + email + password, no network call.
//                      "Continue" advances to step 2.
//   Step 2 "team"    → team name + sport. Submission calls signUp
//                      with everything in user_metadata.
//   Step 3 "check_email" → only if email confirmation is on.
//
// "Continue with Google" is a single-step OAuth redirect; the trigger
// still provisions a team for them using their Google display name as
// "<Name>'s team" since user_metadata.team_name isn't set.

type SignUpStep = 'account' | 'team' | 'check_email'

export function SignUpPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<SignUpStep>('account')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamName, setTeamName] = useState('')
  const [sport, setSport] = useState('rowing')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabaseReady = isSupabaseConfigured()

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

  // Step 1 → just validates the account form and advances. The actual
  // supabase.auth.signUp call happens at step 2 (handleTeamSubmit) so
  // team_name + sport make it into user_metadata.
  function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = email.trim()
    if (!supabaseReady) {
      // Demo build — preserve the legacy flow (no Supabase call).
      setStep('team')
      return
    }
    if (!trimmed || !password) {
      setError('Email and password required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setStep('team')
  }

  async function handleTeamSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!supabase) {
      // Demo build — just go to dashboard, nothing to persist.
      navigate('/coach/dashboard')
      return
    }

    const trimmed = email.trim()
    const fullName = [firstName, lastName].map((s) => s.trim()).filter(Boolean).join(' ')

    setSubmitting(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmed,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/coach/dashboard`,
          data: {
            first_name: firstName.trim() || null,
            last_name: lastName.trim() || null,
            full_name: fullName || null,
            name: fullName || trimmed.split('@')[0],
            role: 'head_coach',
            team_name: teamName.trim() || null,
            sport,
          },
        },
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      posthog.identify(trimmed, { email: trimmed, role: 'head_coach' })
      posthog.capture('signed_up', { email: trimmed, role: 'head_coach', mode: 'supabase' })
      if (data.session) {
        navigate('/coach/dashboard', { replace: true })
      } else {
        setStep('check_email')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleSignUp() {
    setError(null)
    if (!supabase) {
      setError('Google sign-up requires a configured Supabase project.')
      return
    }
    setSubmitting(true)
    try {
      // Google OAuth can't inject user_metadata before the redirect, so
      // Google signups land with role='athlete' (the trigger's default).
      // A follow-up will surface a team-setup screen when the dashboard
      // detects no team_id. For now Google signups end up team-less and
      // need to be promoted manually (next slice).
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
    <div className="flex min-h-dvh items-center justify-center p-6" style={{ background: THEME.light }}>
      <div
        className="w-full max-w-[480px] rounded-2xl border p-8 shadow-sm"
        style={{ background: THEME.white, borderColor: THEME.border }}
      >
        {step !== 'check_email' && (
          <div className="mb-6 flex items-center gap-3">
            <StepDot active={step === 'account'} done={step === 'team'} label="1" />
            <div
              className="h-px flex-1"
              style={{ background: step === 'team' ? THEME.primary : THEME.border }}
            />
            <StepDot active={step === 'team'} done={false} label="2" />
          </div>
        )}

        {step === 'account' && (
          <>
            <div
              className="mb-1 text-[10px] uppercase tracking-[0.2em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              Step 1 of 2
            </div>
            <h1
              className="mb-2 text-[26px] font-semibold leading-tight"
              style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
            >
              Create your account.
            </h1>
            <p className="mb-6 text-[14px]" style={{ color: THEME.textSecondary }}>
              Sign up as a coach to set up your team and start connecting data sources.
            </p>

            {supabaseReady && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={submitting}
                  className="mb-4 flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-colors hover:bg-zinc-50 disabled:opacity-60"
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

            <form className="flex flex-col gap-4" onSubmit={handleAccountSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span
                    className="text-[10px] uppercase tracking-[0.18em]"
                    style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                  >
                    First name
                  </span>
                  <input
                    type="text"
                    placeholder="Alex"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
                    style={{ borderColor: THEME.border, color: THEME.textPrimary }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span
                    className="text-[10px] uppercase tracking-[0.18em]"
                    style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                  >
                    Last name
                  </span>
                  <input
                    type="text"
                    placeholder="Martinez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
                    style={{ borderColor: THEME.border, color: THEME.textPrimary }}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                >
                  Work email
                </span>
                <input
                  type="email"
                  placeholder="coach@university.edu"
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
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
                Continue
              </button>
            </form>
          </>
        )}

        {step === 'check_email' && (
          <>
            <div
              className="mb-1 text-[10px] uppercase tracking-[0.2em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
            >
              Almost there
            </div>
            <h1
              className="mb-2 text-[26px] font-semibold leading-tight"
              style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
            >
              Check your email.
            </h1>
            <p className="mb-6 text-[14px]" style={{ color: THEME.textSecondary }}>
              We sent a confirmation link to <strong>{email}</strong>. Click it to
              activate your account, then come back and sign in.
            </p>
            <div className="flex gap-2">
              <Link
                to="/login"
                className="rounded-full px-5 py-3 text-[12px] font-semibold uppercase tracking-wider"
                style={{
                  background: THEME.primary,
                  color: THEME.white,
                  fontFamily: THEME.fontMono,
                }}
              >
                Go to sign in
              </Link>
              <button
                type="button"
                onClick={() => setStep('account')}
                className="rounded-full border px-5 py-3 text-[12px] font-semibold uppercase tracking-wider"
                style={{
                  borderColor: THEME.border,
                  color: THEME.textSecondary,
                  fontFamily: THEME.fontMono,
                  background: THEME.white,
                }}
              >
                Use a different email
              </button>
            </div>
          </>
        )}

        {step === 'team' && (
          <>
            <div
              className="mb-1 text-[10px] uppercase tracking-[0.2em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              Step 2 of 2
            </div>
            <h1
              className="mb-2 text-[26px] font-semibold leading-tight"
              style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}
            >
              Set up your team.
            </h1>
            <p className="mb-6 text-[14px]" style={{ color: THEME.textSecondary }}>
              Tell us about your program so we can configure your dashboard.
            </p>
            <form className="flex flex-col gap-4" onSubmit={handleTeamSubmit}>
              <label className="flex flex-col gap-1">
                <span
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                >
                  Team name
                </span>
                <input
                  type="text"
                  placeholder="Pacific Women's Rowing"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
                  style={{ borderColor: THEME.border, color: THEME.textPrimary }}
                  autoFocus
                />
              </label>
              <label className="flex flex-col gap-1">
                <span
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                >
                  Sport
                </span>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
                  style={{
                    borderColor: THEME.border,
                    color: THEME.textPrimary,
                    background: THEME.white,
                  }}
                >
                  <option value="rowing">Rowing</option>
                  <option value="track">Track & Field</option>
                  <option value="swimming">Swimming</option>
                  <option value="baseball">Baseball / Softball</option>
                  <option value="basketball">Basketball</option>
                  <option value="soccer">Soccer</option>
                  <option value="tennis">Tennis</option>
                  <option value="other">Other</option>
                </select>
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

              <div className="mt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('account')}
                  disabled={submitting}
                  className="rounded-full border px-5 py-3 text-[12px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.01] disabled:opacity-60"
                  style={{
                    borderColor: THEME.border,
                    color: THEME.textSecondary,
                    fontFamily: THEME.fontMono,
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-full py-3 text-[13px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.01] disabled:opacity-60"
                  style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
                >
                  {submitting ? 'Creating account…' : supabaseReady ? 'Create account & team' : 'Go to dashboard'}
                </button>
              </div>
            </form>
          </>
        )}

        <div
          className="mt-6 flex items-center justify-between text-[11px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          <Link to="/login" className="hover:underline">
            Already have an account? Sign in →
          </Link>
          <Link to="/" className="hover:underline">
            ← Home
          </Link>
        </div>
      </div>
    </div>
  )
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean
  done: boolean
  label: string
}) {
  return (
    <div
      className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold"
      style={{
        background: active || done ? THEME.primary : THEME.white,
        color: active || done ? THEME.white : THEME.textMuted,
        border: `1.5px solid ${active || done ? THEME.primary : THEME.border}`,
        fontFamily: THEME.fontMono,
      }}
    >
      {done ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 6.5 L5 9 L9.5 3.5" />
        </svg>
      ) : (
        label
      )}
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
