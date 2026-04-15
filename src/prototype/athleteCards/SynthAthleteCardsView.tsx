import { useEffect, useState } from 'react'
import { ROWIQ_CARD_ATHLETES } from './buildRowiqAthletes'
import { SynthAthleteProfile } from './SynthAthleteProfile'
import { SynthAthleteRoster } from './SynthAthleteRoster'

/** v2-athlete-cards flow: roster grid → card opens profile with tabs (RowIQ-backed). */
export function SynthAthleteCardsView() {
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    if (!profileId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [profileId])

  const athlete = profileId ? ROWIQ_CARD_ATHLETES.find((a) => a.id === profileId) : undefined

  if (profileId && athlete) {
    return (
      <div className="mx-auto h-full min-h-0 w-full max-w-5xl overflow-y-auto">
        <SynthAthleteProfile athlete={athlete} onBack={() => setProfileId(null)} />
      </div>
    )
  }

  if (profileId && !athlete) {
    return (
      <div className="p-8 text-center text-sm text-zinc-600">
        Athlete not found.{' '}
        <button type="button" className="font-semibold text-emerald-700 underline" onClick={() => setProfileId(null)}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <SynthAthleteRoster onSelectAthlete={setProfileId} />
    </div>
  )
}
