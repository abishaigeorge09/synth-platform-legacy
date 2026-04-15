import { motion, AnimatePresence } from 'framer-motion'
import { THEME } from '../../../../../lib/theme'
import { useStopwatch, fmtElapsed, fmtInterval } from './useStopwatch'

export function BoatTimerCard({ boatName, athletes }: { boatName: string; athletes: string[] }) {
  const { state, elapsed, splits, start, pause, split, finish, reset } = useStopwatch()

  const isRunning = state === 'running'
  const isIdle = state === 'idle'
  const isPaused = state === 'paused'
  const isFinished = state === 'finished'

  const statusColor =
    state === 'running'
      ? THEME.primary
      : state === 'paused'
      ? THEME.amber
      : state === 'finished'
      ? THEME.blue
      : THEME.textMuted

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border"
      style={{
        background: THEME.white,
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 30px 60px -36px rgba(24,24,27,0.25)',
      }}
    >
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: THEME.border }}
      >
        <div>
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
          >
            Boat
          </div>
          <div className="mt-0.5 text-[22px] font-semibold" style={{ color: THEME.textPrimary }}>
            {boatName}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            animate={{
              scale: isRunning ? [1, 1.3, 1] : 1,
              opacity: isRunning ? [0.7, 1, 0.7] : 1,
            }}
            transition={{ duration: 1.4, repeat: isRunning ? Infinity : 0 }}
            className="h-2 w-2 rounded-full"
            style={{ background: statusColor }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: statusColor }}
          >
            {state}
          </span>
        </div>
      </header>

      {/* Big clock */}
      <div className="flex flex-col items-center gap-2 px-6 py-8" style={{ background: THEME.light }}>
        <div
          className="text-[72px] font-bold leading-none tabular-nums"
          style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
        >
          {fmtElapsed(elapsed)}
        </div>
        <div
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {splits.length} split{splits.length === 1 ? '' : 's'} · {athletes.length} athletes
        </div>
      </div>

      {/* Controls */}
      <div
        className="grid grid-cols-3 gap-2 border-t px-6 py-4"
        style={{ borderColor: THEME.border }}
      >
        {isIdle || isPaused ? (
          <ActionButton label={isIdle ? 'Start' : 'Resume'} onClick={start} primary />
        ) : isRunning ? (
          <ActionButton label="Pause" onClick={pause} />
        ) : (
          <ActionButton label="Reset" onClick={reset} />
        )}
        <ActionButton
          label="Split"
          onClick={split}
          disabled={!isRunning}
          accent={THEME.accent}
          primary={isRunning}
        />
        <ActionButton
          label={isFinished ? '↻ New' : 'Finish'}
          onClick={isFinished ? reset : finish}
          disabled={isIdle}
        />
      </div>

      {/* Splits list */}
      <div
        className="synth-scroll max-h-[280px] overflow-y-auto border-t px-2 py-2"
        style={{ borderColor: THEME.border }}
      >
        <AnimatePresence initial={false}>
          {splits.length === 0 ? (
            <div
              className="px-4 py-6 text-center text-[11px]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              No splits yet. Tap Split to record piece times.
            </div>
          ) : (
            [...splits].reverse().map((sp) => (
              <motion.div
                key={sp.index}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mx-2 flex items-center justify-between rounded-md px-3 py-2 hover:bg-zinc-50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-semibold"
                    style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                  >
                    #{String(sp.index).padStart(2, '0')}
                  </span>
                  <span
                    className="text-[13px] font-semibold tabular-nums"
                    style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
                  >
                    {fmtElapsed(sp.totalMs)}
                  </span>
                </div>
                <span
                  className="text-[11px] tabular-nums"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
                >
                  +{fmtInterval(sp.intervalMs)}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  primary,
  accent,
  disabled,
}: {
  label: string
  onClick: () => void
  primary?: boolean
  accent?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all disabled:opacity-40"
      style={{
        background: primary ? accent ?? THEME.primary : THEME.white,
        color: primary ? THEME.white : THEME.textPrimary,
        border: `1px solid ${primary ? accent ?? THEME.primary : THEME.border}`,
        fontFamily: THEME.fontMono,
        boxShadow: primary ? '0 10px 24px -14px rgba(5,150,105,0.55)' : 'none',
      }}
    >
      {label}
    </button>
  )
}
