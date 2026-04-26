import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import { THEME } from '../../../../../lib/theme'
import { useStopwatch, fmtElapsed, fmtInterval, type Split } from './useStopwatch'

export function BoatTimerCard({
  boatId,
  boatName,
  athletes,
  exerciseLabel,
  onRename,
  onFinished,
  onRemove,
}: {
  boatId: string
  boatName: string
  athletes: string[]
  exerciseLabel?: string
  onRename: (name: string) => void
  onFinished: (args: { boatId: string; boatName: string; elapsedMs: number; splits: Split[] }) => void
  onRemove?: () => void
}) {
  const { state, elapsed, splits, start, pause, split, finish, reset } = useStopwatch()

  const isRunning = state === 'running'
  const isIdle = state === 'idle'
  const isPaused = state === 'paused'
  const isFinished = state === 'finished'
  const canFinish = !isIdle

  const finishLabel = useMemo(() => (isFinished ? '↻ New' : 'Finish'), [isFinished])

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
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: THEME.border }}
      >
        <div className="min-w-0 flex-1">
          <input
            value={boatName}
            onChange={(e) => onRename(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-[15px] font-semibold outline-none"
            style={{
              borderColor: THEME.border,
              background: THEME.white,
              color: THEME.textPrimary,
              fontFamily: THEME.fontSans,
            }}
            aria-label="Boat name"
          />
          {exerciseLabel && (
            <div
              className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              {exerciseLabel}
            </div>
          )}
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
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="ml-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-zinc-50"
              style={{ borderColor: THEME.border, color: THEME.textSecondary, fontFamily: THEME.fontMono }}
              aria-label="Remove boat"
            >
              Remove
            </button>
          )}
        </div>
      </header>

      {/* Big clock */}
      <div
        className="flex flex-col items-center gap-3 px-4 py-8"
        style={{
          background: isRunning
            ? 'linear-gradient(160deg, #065F46 0%, #047857 100%)'
            : isFinished
            ? 'linear-gradient(160deg, #1e3a5f 0%, #1d4ed8 100%)'
            : THEME.dark,
        }}
      >
        <div
          className="text-[64px] font-bold leading-none tabular-nums tracking-tight"
          style={{
            fontFamily: THEME.fontMono,
            color: isRunning ? '#A7F3D0' : isFinished ? '#BFDBFE' : '#E4E4E7',
            textShadow: isRunning ? '0 0 40px rgba(167,243,208,0.3)' : 'none',
          }}
        >
          {fmtElapsed(elapsed)}
        </div>
        <div
          className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: isRunning ? '#6EE7B7' : '#71717A' }}
        >
          <span>{splits.length} split{splits.length === 1 ? '' : 's'}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{athletes.length} seats</span>
          {athletes.slice(0, 3).map((a) => (
            <span
              key={a}
              className="rounded-full px-1.5 py-0.5"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 9 }}
            >
              {a.split(' ').pop()}
            </span>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div
        className="grid grid-cols-3 gap-2 border-t px-4 py-3"
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
          label={finishLabel}
          onClick={() => {
            if (isFinished) {
              reset()
              return
            }
            if (!canFinish) return
            onFinished({ boatId, boatName, elapsedMs: elapsed, splits })
            finish()
          }}
          disabled={isIdle}
        />
      </div>

      {/* Splits list */}
      <div
        className="synth-scroll max-h-[220px] overflow-y-auto border-t px-2 py-2"
        style={{ borderColor: THEME.border }}
      >
        <AnimatePresence initial={false}>
          {splits.length === 0 ? (
            <div
              className="px-4 py-5 text-center text-[11px]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              No splits
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
