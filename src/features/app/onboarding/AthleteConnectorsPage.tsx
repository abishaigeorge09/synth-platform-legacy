import { useNavigate } from 'react-router-dom'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import {
  ConnectorSwitchRow,
  useConnectorSwitchStates,
} from '../primitives/ConnectorSwitchRow'
import { ATHLETE_CONNECTORS } from '../data/mockConnectors'
import { useOnboardingStore } from '../store/useOnboardingStore'

export function AthleteConnectorsPage() {
  const navigate = useNavigate()
  const selected = useOnboardingStore((s) => s.athleteConnectors)
  const toggleStore = useOnboardingStore((s) => s.toggleAthleteConnector)

  const switches = useConnectorSwitchStates(selected)

  const handleToggle = (id: string) => {
    switches.toggle(id)
    toggleStore(id)
  }

  return (
    <SingleQuestionScreen
      step={2}
      totalSteps={3}
      onBack={() => navigate(-1)}
      title="Connect your sources"
      helper="Tap a switch to authenticate. Anything you wear, log, or train on."
      ctaLabel={
        switches.connectedIds.length > 0
          ? `Continue · ${switches.connectedIds.length} connected`
          : 'Skip for now'
      }
      onCta={() => navigate('/app/onboarding/trust')}
      bgVariant="connectors"
    >
      <div className="flex flex-col gap-2">
        {ATHLETE_CONNECTORS.map((c) => (
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
      </div>
    </SingleQuestionScreen>
  )
}
