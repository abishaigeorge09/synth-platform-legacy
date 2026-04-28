import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { MultiSelectChips, type MultiSelectOption } from '../primitives/MultiSelectChips'
import { COACH_CAPABILITIES } from '../data/onboardingOptions'
import { useOnboardingStore } from '../store/useOnboardingStore'

export function CoachCapabilitiesPage() {
  const navigate = useNavigate()
  const capabilities = useOnboardingStore((s) => s.capabilities)
  const toggle = useOnboardingStore((s) => s.toggleCapability)

  const options: MultiSelectOption[] = COACH_CAPABILITIES.map((c) => ({
    value: c.value,
    label: c.label,
    description: c.description,
  }))

  return (
    <SingleQuestionScreen
      step={4}
      totalSteps={5}
      onBack={() => navigate(-1)}
      title="What do you want to track?"
      helper="Pick anything synth should synthesize for your team. Change this anytime."
      ctaLabel="Continue"
      ctaDisabled={capabilities.length === 0}
      onCta={() => navigate('/app/onboarding/sources/coach')}
    >
      <MultiSelectChips options={options} selectedValues={capabilities} onToggle={toggle} />
    </SingleQuestionScreen>
  )
}
