import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { THEME } from '@lib/theme'
import { useAthleteOnboardingStore } from '@shared/store/useAthleteOnboardingStore'
import { OnboardingShell } from '@shared/components/OnboardingShell'

export function AthleteOnboardingProfilePage() {
  const navigate = useNavigate()
  const confirmed = useAthleteOnboardingStore((s) => s.confirmed)
  const inviteCode = useAthleteOnboardingStore((s) => s.inviteCode)
  const setProfileName = useAthleteOnboardingStore((s) => s.setProfileName)
  const [name, setName] = useState('Star Miller')
  const [target2k, setTarget2k] = useState('')
  const canContinue = useMemo(() => name.trim().length >= 3, [name])

  if (!confirmed) {
    return <Navigate to={inviteCode ? `/join/${encodeURIComponent(inviteCode)}` : '/'} replace />
  }

  return (
    <OnboardingShell
      kicker="Athlete setup"
      title="Set up your profile"
      subtitle="Display name and optional 2K target."
      illustration="athlete"
      stepIndex={2}
      totalSteps={4}
      backTo={`/athlete/onboarding/confirm/${encodeURIComponent(inviteCode ?? 'PAC-WR-2026')}`}
    >
      <label className="grid gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          Display name
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border px-4 py-3 text-[14px] outline-none"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary }}
        />
      </label>
      <label className="mt-4 grid gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
          2K target (optional)
        </span>
        <input
          value={target2k}
          onChange={(e) => setTarget2k(e.target.value)}
          placeholder="6:44.0"
          className="rounded-xl border px-4 py-3 text-[14px] outline-none"
          style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary, fontFamily: THEME.fontMono }}
        />
      </label>

      <div className="mt-6 flex items-center justify-end gap-2 border-t pt-4" style={{ borderColor: THEME.border }}>
        <button
          type="button"
          disabled={!canContinue}
          className="rounded-full px-5 py-3 text-[12px] font-semibold uppercase tracking-wider disabled:opacity-50"
          style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
          onClick={() => {
            if (!canContinue) return
            setProfileName(name.trim())
            navigate('/athlete/onboarding/sources')
          }}
        >
          Continue →
        </button>
      </div>
    </OnboardingShell>
  )
}

