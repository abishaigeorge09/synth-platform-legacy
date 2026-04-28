import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { PillRows, type PillRowOption } from '../primitives/PillRows'
import { SPORTS } from '../data/onboardingOptions'
import { useOnboardingStore } from '../store/useOnboardingStore'

export function SportPickPage() {
  const navigate = useNavigate()
  const sport = useOnboardingStore((s) => s.sport)
  const setSport = useOnboardingStore((s) => s.setSport)

  const options: PillRowOption[] = SPORTS.map((s) => ({
    value: s.value,
    label: s.label,
    description: s.description,
    disabled: !s.available,
    badge: s.available ? undefined : 'Soon',
  }))

  return (
    <SingleQuestionScreen
      step={2}
      totalSteps={5}
      onBack={() => navigate(-1)}
      title="Which sport?"
      helper="synth tunes for rowing today. More sports come online next."
      ctaLabel="Continue"
      ctaDisabled={!sport}
      onCta={() => navigate('/app/onboarding/team')}
    >
      <PillRows options={options} selectedValue={sport} onSelect={setSport} />
    </SingleQuestionScreen>
  )
}
