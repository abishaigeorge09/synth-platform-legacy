import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { APP_THEME } from '../lib/theme'

export function AthleteInviteCodePage() {
  const navigate = useNavigate()
  const code = useOnboardingStore((s) => s.inviteCode)
  const setCode = useOnboardingStore((s) => s.setInviteCode)

  const canContinue = code.trim().length >= 4

  return (
    <SingleQuestionScreen
      step={1}
      totalSteps={3}
      onBack={() => navigate(-1)}
      title="Enter your invite code"
      helper="Your coach should have shared a 6-character code with you."
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCta={() => navigate('/app/onboarding/sources/athlete')}
      secondary={{ label: "I don't have a code", onClick: () => navigate('/app/onboarding/sources/athlete') }}
    >
      <div className="flex flex-col gap-3">
        <label
          className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textMuted }}
        >
          Invite code
        </label>
        <input
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="—  —  —  —  —  —"
          maxLength={8}
          className="w-full rounded-2xl border px-4 py-5 text-center text-[24px] font-bold tracking-[0.32em] outline-none transition-colors focus:border-[var(--app-brand)]"
          style={{
            background: APP_THEME.surface,
            borderColor: APP_THEME.divider,
            color: APP_THEME.text,
            fontFamily: APP_THEME.fontMono,
            ['--app-brand' as never]: APP_THEME.brand,
          }}
        />
      </div>
    </SingleQuestionScreen>
  )
}
