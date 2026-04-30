import { useParams, useNavigate, Link } from 'react-router-dom'
import { THEME } from '../../lib/theme'
import { posthog } from '../../shared/analytics/posthog'

export function JoinWithInvitePage() {
  const { code } = useParams()
  const navigate = useNavigate()
  return (
    <div className="flex min-h-dvh items-center justify-center p-6" style={{ background: THEME.light }}>
      <div
        className="w-full max-w-[440px] rounded-2xl border p-8 shadow-sm"
        style={{ background: THEME.white, borderColor: THEME.border }}
      >
        <div className="mb-6 text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Join your team
        </div>
        <h1 className="mb-3 text-[26px] font-semibold leading-tight" style={{ fontFamily: THEME.fontSerif, color: THEME.textPrimary }}>
          Join with an invite code.
        </h1>
        <p className="mb-5 text-[14px]" style={{ color: THEME.textSecondary }}>
          Your coach sent you a code by email. Enter it below and we'll drop you into your team's athlete view.
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            const inviteCode = (e.currentTarget.querySelector('input') as HTMLInputElement)?.value ?? code ?? ''
            posthog.capture('athlete_joined_via_invite', { invite_code: inviteCode })
            navigate('/athlete/home')
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              Invite code
            </span>
            <input
              defaultValue={code ?? ''}
              className="rounded-lg border px-3 py-2.5 text-[14px] uppercase tracking-widest outline-none transition-colors focus:border-emerald-600"
              style={{ borderColor: THEME.border, color: THEME.textPrimary, fontFamily: THEME.fontMono }}
              autoFocus
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-full py-3 text-[13px] font-semibold uppercase tracking-wider"
            style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
          >
            Join team (demo)
          </button>
        </form>
        <Link
          to="/"
          className="mt-6 inline-block text-[11px] hover:underline"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          ← Back
        </Link>
      </div>
    </div>
  )
}
