import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Segmented numeric passcode input. Designed for the access gate, but
 * shape-agnostic for any 4-12 digit code.
 *
 * Typing behaviour the gate cares about:
 *   - Auto-focus the first empty cell on mount.
 *   - Type digit -> fills current cell + advances.
 *   - Backspace on empty cell -> retreats + clears previous.
 *   - Backspace on filled cell -> clears current.
 *   - Arrow keys -> nudge focus left/right without typing.
 *   - Paste -> fills as many cells as the pasted digits cover from
 *     the focused cell forward (or the whole code if pasted into
 *     cell 0). Non-digits in the paste are stripped.
 *   - Enter -> submits if every cell is filled.
 *   - Auto-submit when the last cell receives a digit.
 *
 * Visual:
 *   - Mono font + tabular-nums so digits never reflow.
 *   - Active cell glows with a subtle accent ring.
 *   - Wrong code triggers a 280ms shake (skipped under prefers-reduced-motion).
 *   - Filled cells get an inset bottom border so the digit feels seated.
 *
 * Mobile:
 *   - inputmode="numeric" + pattern="[0-9]*" pops the digit keypad.
 *   - autoComplete="one-time-code" cooperates with iOS SMS autofill if the
 *     OS ever decides this looks like an OTP. Harmless if it doesn't.
 *   - Each cell is its own input so iOS Safari's text-position cursor
 *     plays nicely; a single masked input would lose focus when we
 *     mutate value mid-stroke.
 */
type Props = {
  length?: number
  onSubmit: (code: string) => void
  /** Set true to flash the shake animation. The parent owns the
   *  reset lifecycle: bump the component's `key` after the shake
   *  finishes to remount with fresh state. Avoids in-component
   *  setState-in-effect patterns. */
  hasError?: boolean
  /** Disabled while we're verifying or transitioning out. */
  disabled?: boolean
  /** When false (the default), filled cells render `*` instead of
   *  the typed digit. The real digit stays in component state so
   *  submit + auto-submit + paste are unaffected. Toggling this
   *  from the parent re-renders with the actual numbers visible. */
  revealed?: boolean
  /** Optional aria-label for screen readers. */
  ariaLabel?: string
}

export function PasscodeInput({
  length = 8,
  onSubmit,
  hasError = false,
  disabled = false,
  revealed = false,
  ariaLabel = 'Passcode',
}: Props) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(''))
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const reducedMotion = useReducedMotion()

  // Autofocus the first cell on mount. Defer one frame so the overlay's
  // entrance animation doesn't fight the focus request. This effect
  // re-runs on every fresh mount, which is exactly what happens after
  // a wrong code (the parent bumps `key` to remount us — see the
  // `attemptId` pattern in AccessGate). Means autofocus on every
  // attempt without a stateful reset side-effect.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      inputs.current[0]?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const focusCell = (i: number) => {
    const target = inputs.current[Math.max(0, Math.min(length - 1, i))]
    target?.focus()
    target?.select()
  }

  const tryAutoSubmit = (next: string[]) => {
    if (next.every((d) => d !== '')) onSubmit(next.join(''))
  }

  const onCellChange = (i: number, raw: string) => {
    // Strip everything but digits — handles smart paste (which we
    // also catch in onPaste below for the multi-cell case).
    const cleaned = raw.replace(/\D+/g, '')
    if (cleaned.length === 0) return
    if (cleaned.length === 1) {
      setDigits((prev) => {
        const next = [...prev]
        next[i] = cleaned
        if (i < length - 1) focusCell(i + 1)
        tryAutoSubmit(next)
        return next
      })
      return
    }
    // Multi-digit drop into a single cell — likely autofill or paste
    // landing on this cell. Spread across this cell + remaining cells.
    setDigits((prev) => {
      const next = [...prev]
      const room = length - i
      const slice = cleaned.slice(0, room).split('')
      for (let k = 0; k < slice.length; k++) next[i + k] = slice[k]
      const lastFilled = i + slice.length - 1
      focusCell(Math.min(length - 1, lastFilled + 1))
      tryAutoSubmit(next)
      return next
    })
  }

  const onCellKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      setDigits((prev) => {
        const next = [...prev]
        if (next[i] !== '') {
          // Cell has a digit: clear it, stay put.
          next[i] = ''
          return next
        }
        // Cell already empty: retreat + clear previous.
        if (i > 0) {
          next[i - 1] = ''
          focusCell(i - 1)
        }
        return next
      })
      return
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusCell(i - 1)
      return
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusCell(i + 1)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (digits.every((d) => d !== '')) onSubmit(digits.join(''))
      return
    }
    // Don't intercept the actual digit press — let onChange handle it.
  }

  const onPaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const cleaned = e.clipboardData.getData('text').replace(/\D+/g, '')
    if (cleaned.length === 0) return
    e.preventDefault()
    setDigits((prev) => {
      const next = [...prev]
      const room = length - i
      const slice = cleaned.slice(0, room).split('')
      for (let k = 0; k < slice.length; k++) next[i + k] = slice[k]
      const lastFilled = i + slice.length - 1
      focusCell(Math.min(length - 1, lastFilled + 1))
      tryAutoSubmit(next)
      return next
    })
  }

  const shake = hasError && !reducedMotion
    ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
    : { x: 0 }

  return (
    <motion.div
      role="group"
      aria-label={ariaLabel}
      animate={shake}
      transition={{ duration: 0.32, ease: 'easeInOut' }}
      className="flex w-full items-center justify-center gap-2 sm:gap-2.5"
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          maxLength={length}
          // Render `*` for filled cells unless `revealed` is on.
          // The real digit lives in `digits[i]` and is what
          // gets submitted; we just swap the visible glyph.
          value={d ? (revealed ? d : '*') : ''}
          disabled={disabled}
          onChange={(e) => onCellChange(i, e.target.value)}
          onKeyDown={(e) => onCellKeyDown(i, e)}
          onPaste={(e) => onPaste(i, e)}
          onFocus={(e) => e.target.select()}
          className="h-10 w-7 border-0 border-b bg-transparent p-0 text-center text-[22px] font-semibold tabular-nums caret-transparent outline-none transition-[border-color,color] duration-150 sm:h-12 sm:w-8 sm:text-[24px]"
          style={{
            color: '#FFFFFF',
            // Underline only — no box, no fill, no shadow. Active /
            // filled cells thicken + brighten the line; error state
            // tints it red. Caret stays hidden because the digit
            // itself is the cursor cue.
            borderBottomWidth: d ? 2 : 1,
            borderBottomColor: hasError
              ? 'rgba(239, 68, 68, 0.7)'
              : d
                ? 'rgba(255, 255, 255, 0.85)'
                : 'rgba(255, 255, 255, 0.30)',
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          }}
        />
      ))}
    </motion.div>
  )
}
