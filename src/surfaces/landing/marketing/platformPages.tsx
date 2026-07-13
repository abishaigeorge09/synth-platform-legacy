import { ModulePage } from '../templates/ModulePage'
import { MODULE_CONFIGS } from './moduleConfigs'

export function SynthCorePage() {
  return <ModulePage config={MODULE_CONFIGS['synth-core']} />
}
export function RecoveryHealthPage() {
  return <ModulePage config={MODULE_CONFIGS['recovery-health']} />
}
export function TrainingLoadPage() {
  return <ModulePage config={MODULE_CONFIGS['training-load']} />
}
export function ProgressDevelopmentPage() {
  return <ModulePage config={MODULE_CONFIGS['progress-development']} />
}
export function TeamOperationsPage() {
  return <ModulePage config={MODULE_CONFIGS['team-operations']} />
}
export function CustomAnalyticsPage() {
  return <ModulePage config={MODULE_CONFIGS['custom-analytics']} />
}
export function IntegrationsPage() {
  return <ModulePage config={MODULE_CONFIGS['integrations']} />
}
export function ApiPage() {
  return <ModulePage config={MODULE_CONFIGS['api']} />
}
