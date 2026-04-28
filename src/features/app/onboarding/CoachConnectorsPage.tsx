import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { MultiSelectChips, type MultiSelectOption } from '../primitives/MultiSelectChips'
import { COACH_CONNECTORS } from '../data/mockConnectors'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { APP_THEME } from '../lib/theme'

export function CoachConnectorsPage() {
  const navigate = useNavigate()
  const selected = useOnboardingStore((s) => s.coachConnectors)
  const toggle = useOnboardingStore((s) => s.toggleCoachConnector)

  const options: MultiSelectOption[] = COACH_CONNECTORS.map((c) => ({
    value: c.id,
    label: c.name,
    description: c.description,
    iconBackground: `${c.brandColor}1A`,
    icon: <BrandDot color={c.brandColor} initial={c.name.charAt(0)} />,
  }))

  return (
    <SingleQuestionScreen
      step={5}
      totalSteps={5}
      onBack={() => navigate(-1)}
      title="Connect your sources"
      helper="Pick everything your athletes already use. synth Agent will scan and synthesize on demand."
      ctaLabel={selected.length > 0 ? `Connect ${selected.length}` : 'Skip for now'}
      onCta={() => navigate('/app/onboarding/trust')}
    >
      <MultiSelectChips options={options} selectedValues={selected} onToggle={toggle} />
    </SingleQuestionScreen>
  )
}

function BrandDot({ color, initial }: { color: string; initial: string }) {
  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold"
      style={{
        background: color,
        color: '#FFFFFF',
        fontFamily: APP_THEME.fontMono,
      }}
    >
      {initial.toUpperCase()}
    </span>
  )
}
