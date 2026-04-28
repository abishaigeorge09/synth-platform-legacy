export type SportOption = {
  value: string
  label: string
  description: string
  available: boolean
}

export const SPORTS: SportOption[] = [
  { value: 'rowing', label: 'Rowing', description: 'Erg + on-water, full coverage today', available: true },
  { value: 'running', label: 'Running', description: 'Coming soon', available: false },
  { value: 'cycling', label: 'Cycling', description: 'Coming soon', available: false },
  { value: 'swimming', label: 'Swimming', description: 'Coming soon', available: false },
]

export type CapabilityOption = {
  value: string
  label: string
  description: string
}

export const COACH_CAPABILITIES: CapabilityOption[] = [
  { value: 'training-load', label: 'Training load', description: 'Volume + intensity across the week' },
  { value: 'recovery', label: 'Recovery', description: 'HRV, sleep, soreness check-ins' },
  { value: 'lineup', label: 'Lineup planning', description: 'Boats, seats, sub strategies' },
  { value: 'form', label: 'Form video', description: 'Send notes on stroke video' },
  { value: 'wellness', label: 'Wellness signals', description: 'Mood, stress, life context' },
  { value: 'attendance', label: 'Attendance', description: 'Who showed up, who missed' },
]
