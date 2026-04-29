import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { PillRows, type PillRowOption } from '../primitives/PillRows'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { SYNTH } from '../lib/theme'

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
            className="mb-2 block text-center text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ fontFamily: SYNTH.font, color: SYNTH.inkOnBrandMuted }}
          >
            Team name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Cal Women's Rowing"
            className="w-full rounded-2xl border px-4 py-4 text-center text-[16px] outline-none transition-colors placeholder:text-white/40 focus:border-[var(--app-emerald)]"
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

        <div>
          <label
            className="mb-2 block text-center text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ fontFamily: SYNTH.font, color: SYNTH.inkOnBrandMuted }}
          >
            Roster size
          </label>
          <PillRows options={ATHLETE_COUNT_BANDS} selectedValue={band} onSelect={setBand} />
        </div>
      </div>
    </SingleQuestionScreen>
  )
}
