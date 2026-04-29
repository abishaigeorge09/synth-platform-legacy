import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { SYNTH } from '../lib/theme'

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
          className="text-center text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ fontFamily: SYNTH.font, color: SYNTH.inkOnBrandMuted }}
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
          className="w-full rounded-2xl border px-4 py-5 text-center text-[24px] font-bold tracking-[0.32em] outline-none transition-colors placeholder:text-white/35 focus:border-[var(--app-emerald)]"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            borderColor: SYNTH.glassBorder,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
            ['--app-emerald' as never]: SYNTH.accentEmerald,
          }}
        />
      </div>
    </SingleQuestionScreen>
  )
}
