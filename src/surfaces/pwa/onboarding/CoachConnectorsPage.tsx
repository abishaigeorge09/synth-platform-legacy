import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import {
  ConnectorSwitchRow,
  useConnectorSwitchStates,
} from '../primitives/ConnectorSwitchRow'
import { RequestConnectorRow } from '../primitives/RequestConnectorRow'
import { COACH_CONNECTORS } from '../data/mockConnectors'
import { useOnboardingStore } from '../store/useOnboardingStore'

export function CoachConnectorsPage() {
  const navigate = useNavigate()
  const selected = useOnboardingStore((s) => s.coachConnectors)
  const toggleStore = useOnboardingStore((s) => s.toggleCoachConnector)

  const switches = useConnectorSwitchStates(selected)

  const handleToggle = (id: string) => {
    switches.toggle(id)
    toggleStore(id)
  }

  return (
    <SingleQuestionScreen
      step={5}
      totalSteps={5}
      onBack={() => navigate(-1)}
      title="Connect your sources"
      helper="Tap a switch to authenticate. synth Agent will scan and synthesize on demand."
      ctaLabel={
        switches.connectedIds.length > 0
          ? `Continue · ${switches.connectedIds.length} connected`
          : 'Skip for now'
      }
      onCta={() => navigate('/app/onboarding/trust')}
      bgVariant="connectors"
      pinTitle
    >
      <div className="flex flex-col gap-2">
        {COACH_CONNECTORS.map((c) => (
          <ConnectorSwitchRow
            key={c.id}
            option={{
              id: c.id,
              name: c.name,
              description: c.description,
              brandColor: c.brandColor,
            }}
            state={switches.get(c.id)}
            onToggle={() => handleToggle(c.id)}
            onAuthComplete={() => switches.markConnected(c.id)}
          />
        ))}
        <RequestConnectorRow />
      </div>
    </SingleQuestionScreen>
  )
}
