import { useState } from 'react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { RaceRecorder, type Split } from '../primitives/RaceRecorder'
import { SaveRaceSheet, type SaveRaceResult } from '../primitives/SaveRaceSheet'
import { SYNTH } from '../lib/theme'

const STOPWATCH_BOAT = {
  id: 'stopwatch',
  name: 'Stopwatch',
  color: SYNTH.cardLemon,
}

/**
 * Stopwatch — uses the same RaceRecorder primitive as the Lineup Builder
 * Race Timer, but runs in single-boat lap mode. On finish, the save
 * sheet asks "what was this for?" + which athletes ran it, so the
 * timing attaches to a session log.
 */
export function StopwatchPage() {
  const [saveOpen, setSaveOpen] = useState(false)
  const [result, setResult] = useState<{ elapsedMs: number; splits: Split[] } | null>(null)

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Stopwatch" back="/app/coach/tools" />

      <section className="mx-5 mt-2">
        <RaceRecorder
          boats={[STOPWATCH_BOAT]}
          totalSplits={10}
          lapMode
          onFinish={(r) => {
            setResult(r)
            setSaveOpen(true)
          }}
        />
      </section>

      {result ? (
        <SaveRaceSheet
          open={saveOpen}
          onClose={() => setSaveOpen(false)}
          boats={[STOPWATCH_BOAT]}
          elapsedMs={result.elapsedMs}
          splits={result.splits}
          lapMode
          onSave={(saved: SaveRaceResult) => {
            // Stub: would write to session log in real flow
            console.log('Stopwatch saved', saved, result)
          }}
        />
      ) : null}
    </div>
  )
}
