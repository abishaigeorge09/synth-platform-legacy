import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { THEME } from '../../lib/theme'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('coach@synth.app')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim() === 'star@synth.app') {
      navigate('/athlete/today')
    } else {
      navigate('/coach/dashboard')
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6" style={{ background: THEME.light }}>
      <div
        className="w-full max-w-[440px] rounded-2xl border p-8 shadow-sm"
        style={{ background: THEME.white, borderColor: THEME.border }}
      >
        {/* Logo */}
        <div className="mb-6 flex items-center gap-1.5">
          <span className="text-[20px] font-semibold leading-none" style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}>
            synth<span style={{ color: THEME.accent }}>.</span>
          </span>
        </div>
        <div className="mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Sign in
        </div>
        <h1 className="mb-6 text-[28px] font-semibold leading-tight" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
          Welcome back.
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              Work email
            </span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
              style={{ borderColor: THEME.border, color: THEME.textPrimary }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              Password
            </span>
            <input
              type="password"
              defaultValue="demo"
              className="rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-emerald-600"
              style={{ borderColor: THEME.border, color: THEME.textPrimary }}
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-full py-3 text-[13px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.01]"
            style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
          >
            Sign in
          </button>
        </form>

        {/* Demo hint */}
        <div className="mt-4 rounded-xl border border-dashed p-3 text-[11px] leading-relaxed" style={{ borderColor: THEME.border, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
          Demo: <strong>coach@synth.app</strong> → coach view · <strong>star@synth.app</strong> → athlete view
        </div>

        <div className="mt-5 flex flex-col gap-2 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
          <div className="flex items-center justify-between">
            <Link to="/signup" className="hover:underline">
              Create an account →
            </Link>
            <Link to="/join/CAL-WR-2026" className="hover:underline">
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
