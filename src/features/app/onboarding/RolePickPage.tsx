import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Users } from 'lucide-react'
import { SingleQuestionScreen } from '../primitives/SingleQuestionScreen'
import { PillRows, type PillRowOption } from '../primitives/PillRows'
import { useAppAuthStore, type AppRole } from '../store/useAppAuthStore'
import { APP_THEME } from '../lib/theme'

export function RolePickPage() {
  const navigate = useNavigate()
  const setRole = useAppAuthStore((s) => s.setRole)
  const [selected, setSelected] = useState<AppRole | null>(null)

  const options: PillRowOption[] = [
    {
      value: 'coach',
      label: 'Coach',
      description: 'See your whole team, leave notes, plan lineups',
      icon: <Users size={18} color={selected === 'coach' ? '#FFFFFF' : APP_THEME.brand} />,
    },
    {
      value: 'athlete',
      label: 'Athlete',
      description: 'Track your own data, log sessions, get coach notes',
      icon: <ClipboardList size={18} color={selected === 'athlete' ? '#FFFFFF' : APP_THEME.brand} />,
    },
  ]

  const onContinue = () => {
    if (!selected) return
    setRole(selected)
    if (selected === 'coach') {
      navigate('/app/onboarding/sport')
    } else {
      navigate('/app/onboarding/invite-code')
    }
  }

  return (
    <SingleQuestionScreen
      step={1}
      totalSteps={5}
      onBack={() => navigate('/app/welcome')}
      title="Who are you?"
      helper="synth tailors what you see based on how you use it."
      ctaLabel="Continue"
      ctaDisabled={!selected}
      onCta={onContinue}
    >
      <PillRows
        options={options}
        selectedValue={selected}
        onSelect={(v) => setSelected(v as AppRole)}
      />
    </SingleQuestionScreen>
  )
}
