import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { PillRows, type PillRowOption } from '../primitives/PillRows'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { APP_THEME } from '../lib/theme'

const ATHLETE_COUNT_BANDS: PillRowOption[] = [
  { value: 'lt-10', label: 'Under 10' },
  { value: '10-25', label: '10–25' },
  { value: '25-50', label: '25–50' },
  { value: 'gt-50', label: '50+' },
]

export function CoachTeamSetupPage() {
  const navigate = useNavigate()
  const teamName = useOnboardingStore((s) => s.teamName)
  const setTeamName = useOnboardingStore((s) => s.setTeamName)
  const band = useOnboardingStore((s) => s.athleteCountBand)
  const setBand = useOnboardingStore((s) => s.setAthleteCountBand)

  const canContinue = teamName.trim().length >= 2 && Boolean(band)

  return (
    <SingleQuestionScreen
      step={3}
      totalSteps={5}
      onBack={() => navigate(-1)}
      title="Tell us about your team"
      helper="We use this to label everything synth surfaces for you."
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onCta={() => navigate('/app/onboarding/capabilities')}
    >
      <div className="flex flex-col gap-6">
        <div>
          <label
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textMuted }}
          >
            Team name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Cal Women's Rowing"
            className="w-full rounded-2xl border px-4 py-4 text-[15px] outline-none transition-colors focus:border-[var(--app-brand)]"
            style={{
              background: APP_THEME.surface,
              borderColor: APP_THEME.divider,
              color: APP_THEME.text,
              fontFamily: APP_THEME.fontSans,
              ['--app-brand' as never]: APP_THEME.brand,
            }}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ fontFamily: APP_THEME.fontMono, color: APP_THEME.textMuted }}
          >
            Roster size
          </label>
          <PillRows options={ATHLETE_COUNT_BANDS} selectedValue={band} onSelect={setBand} />
        </div>
      </div>
    </SingleQuestionScreen>
  )
}
