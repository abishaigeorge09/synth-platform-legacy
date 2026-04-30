import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { THEME } from '../../lib/theme'

export function SignUpPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'account' | 'team'>('account')

  return (
    <div className="flex min-h-dvh items-center justify-center p-6" style={{ background: THEME.light }}>
      <div
        className="w-full max-w-[480px] rounded-2xl border p-8 shadow-sm"
        style={{ background: THEME.white, borderColor: THEME.border }}
      >
        {/* Progress indicator */}
        <div className="mb-6 flex items-center gap-3">
          <StepDot active={step === 'account'} done={step === 'team'} label="1" />
          <div className="h-px flex-1" style={{ background: step === 'team' ? THEME.primary : THEME.border }} />
          <StepDot active={step === 'team'} done={false} label="2" />
        </div>

        {step === 'account' ? (
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

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                setStep('team')
              }}
            >
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
                  className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
                  style={{ borderColor: THEME.border, color: THEME.textPrimary }}
                />
              </label>
              <button
                type="submit"
                className="mt-2 rounded-full py-3 text-[13px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.01]"
                style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
              >
                Continue
              </button>
            </form>
          </>
        ) : (
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

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                navigate('/coach/dashboard')
              }}
            >
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
                  className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
                  style={{ borderColor: THEME.border, color: THEME.textPrimary, background: THEME.white }}
                  defaultValue="rowing"
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
              <label className="flex flex-col gap-1">
                <span
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                >
                  Organization
                </span>
                <input
                  type="text"
                  placeholder="UC Berkeley Athletics"
                  className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
                  style={{ borderColor: THEME.border, color: THEME.textPrimary }}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                >
                  Estimated roster size
                </span>
                <select
                  className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
                  style={{ borderColor: THEME.border, color: THEME.textPrimary, background: THEME.white }}
                  defaultValue="30-60"
                >
                  <option value="1-15">1 - 15 athletes</option>
                  <option value="15-30">15 - 30 athletes</option>
                  <option value="30-60">30 - 60 athletes</option>
                  <option value="60+">60+ athletes</option>
                </select>
              </label>

              <div className="mt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('account')}
                  className="rounded-full border px-5 py-3 text-[12px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.01]"
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
                  className="flex-1 rounded-full py-3 text-[13px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.01]"
                  style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
                >
                  Create team (demo)
                </button>
              </div>
            </form>
          </>
        )}

        {/* Footer links */}
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

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
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
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 6.5 L5 9 L9.5 3.5" />
        </svg>
      ) : (
        label
      )}
    </div>
  )
}
