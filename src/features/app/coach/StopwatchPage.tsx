import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
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
 * Stopwatch — single-boat session timer matching Strava's recording
 * screen exactly: white canvas, huge bold TIME and SPLIT AVG PACE,
 * lap bar + DISTANCE row, big orange STOP, white pin button for laps.
 *
 * On finish, the SaveRaceSheet captures purpose + athletes so the
 * timing attaches to a session log.
 */
export function StopwatchPage() {
  const [running, setRunning] = useState(false)
  const [savedResult, setSavedResult] = useState<{ elapsedMs: number; splits: Split[] } | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto pb-[140px]">
      <CoachPageHeader title="Stopwatch" back="/app/coach/tools" />

      {/* Landing hero */}
      <section className="mx-5 mt-2 flex flex-col items-center gap-5 rounded-3xl px-6 py-10"
        style={{
          background: SYNTH.glass,
          backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
          border: `1px solid ${SYNTH.glassBorder}`,
        }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
        >
          Stopwatch
        </p>
        <p
          className="text-center text-[20px] font-bold leading-[1.15] tracking-[-0.01em]"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          Tap to start the clock
        </p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => setRunning(true)}
          aria-label="Start stopwatch"
          className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            background: '#FC4C02',
            boxShadow: `0 18px 40px rgba(252,76,2,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        >
          <Play size={38} strokeWidth={2.6} color="#FFFFFF" fill="#FFFFFF" />
        </motion.button>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          On stop · pick a session and athletes to log it
        </p>
      </section>

      {running ? (
        <RaceRecorder
          boats={[STOPWATCH_BOAT]}
          totalSplits={20}
          expectedRaceMs={600_000}
          splitUnitLabel="/lap"
          splitUnit="s"
          label="Stopwatch"
          onFinish={(r) => {
            setSavedResult(r)
            setRunning(false)
            setSaveOpen(true)
          }}
          onDismiss={() => setRunning(false)}
        />
      ) : null}

      {savedResult ? (
        <SaveRaceSheet
          open={saveOpen}
          onClose={() => {
            setSaveOpen(false)
            setSavedResult(null)
          }}
          boats={[STOPWATCH_BOAT]}
          elapsedMs={savedResult.elapsedMs}
          splits={savedResult.splits}
          lapMode
          onSave={(saved: SaveRaceResult) => {
            console.log('Stopwatch saved', saved, savedResult)
          }}
        />
      ) : null}
    </div>
  )
}
