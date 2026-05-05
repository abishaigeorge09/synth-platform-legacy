import { Send } from 'lucide-react'
import { SYNTH } from '../lib/theme'

/**
 * Sprint 5.9 — shared chat input used by both the Build workspace and
 * the Custom Tools catalog page. Pinned to the bottom of its parent
 * (which must be `position: relative`). Floats above any sibling
 * content via z-10. Pointer-events-none on the wrapper so the page
 * scrolls behind the input padding; pointer-events-auto on the inner
 * pill captures clicks.
 *
 * `bottomOffsetPx` lets callers raise the input above a floating tab
 * bar (64 px + safe area on Custom Tools) — the Build page leaves it
 * at 0 since the tab bar is hidden there.
 */
type BuildChatInputProps = {
  inputRef?: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
  /**
   * `absolute` (default): pinned to the bottom of the nearest positioned
   * ancestor — used by the Build workspace's chat section.
   * `fixed`: pinned to the viewport bottom — used by full-page surfaces
   * like the Custom Tools catalog where the input must clear a floating
   * tab bar at the same z-layer.
   */
  position?: 'absolute' | 'fixed'
  bottomOffsetPx?: number
}

export function BuildChatInput({
  inputRef,
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Describe a tool you need…',
  position = 'absolute',
  bottomOffsetPx = 0,
}: BuildChatInputProps) {
  const canSend = !disabled && value.trim().length > 0

  return (
    <div
      className={`pointer-events-none ${position} inset-x-0 bottom-0 z-10 flex justify-center px-4`}
      style={{
        paddingBottom: `calc(max(env(safe-area-inset-bottom), 16px) + ${bottomOffsetPx}px)`,
      }}
    >
      <div
        className="pointer-events-auto flex w-full max-w-[640px] items-end gap-2 rounded-3xl px-3 py-2.5"
        style={{
          background: 'rgba(15, 18, 42, 0.62)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow:
            '0 14px 36px rgba(8,8,40,0.35), 0 2px 6px rgba(8,8,40,0.18), inset 0 1px 0 rgba(255,255,255,0.16)',
        }}
      >
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (canSend) onSend()
            }
          }}
          rows={1}
          disabled={disabled}
          placeholder={disabled ? 'Generating…' : placeholder}
          className="max-h-32 flex-1 resize-none bg-transparent py-2 text-[14px] leading-[1.4] outline-none placeholder:opacity-50 disabled:opacity-50"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
          style={{
            background: canSend ? SYNTH.accentEmerald : 'rgba(255,255,255,0.10)',
            color: SYNTH.inkOnBrand,
            transition: 'background 120ms ease',
          }}
        >
          <Send size={15} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}
