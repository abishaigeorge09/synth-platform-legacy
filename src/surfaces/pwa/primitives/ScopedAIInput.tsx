import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Plus, AudioLines } from 'lucide-react'
import { APP_THEME } from '../lib/theme'

type Props = {
  scopeLabel: string
  placeholder?: string
  onSubmit?: (text: string) => void
  onAttach?: () => void
  onTranscribe?: () => void
  onVoiceMode?: () => void
}

export function ScopedAIInput({
  scopeLabel,
  placeholder,
  onSubmit,
  onAttach,
  onTranscribe,
  onVoiceMode,
}: Props) {
  const [text, setText] = useState('')

  const submit = () => {
    if (!text.trim() || !onSubmit) return
    onSubmit(text.trim())
    setText('')
  }

  const ph = placeholder ?? `Ask synth. about ${scopeLabel}`

  return (
    <div
      className="rounded-3xl border px-4 pb-3 pt-3"
      style={{ background: APP_THEME.surface, borderColor: APP_THEME.divider }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        rows={1}
        placeholder={ph}
        className="block w-full resize-none bg-transparent text-[15px] outline-none"
        style={{ fontFamily: APP_THEME.fontSans, color: APP_THEME.text, minHeight: 24 }}
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onAttach}
          aria-label="Attach"
          className="flex h-9 w-9 items-center justify-center rounded-full"
        >
          <Plus size={18} color={APP_THEME.textMuted} strokeWidth={2.2} />
        </button>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onTranscribe}
          aria-label="Transcribe"
          className="flex h-9 w-9 items-center justify-center rounded-full"
        >
          <Mic size={18} color={APP_THEME.textMuted} strokeWidth={2} />
        </button>
        <motion.button
          type="button"
          onClick={text.trim() ? submit : onVoiceMode}
          whileTap={{ scale: 0.95 }}
          aria-label={text.trim() ? 'Send' : 'Voice mode'}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: APP_THEME.text }}
        >
          {text.trim() ? (
            <SendGlyph />
          ) : (
            <AudioLines size={18} color="#FFFFFF" strokeWidth={2.2} />
          )}
        </motion.button>
      </div>
    </div>
  )
}

function SendGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="#FFFFFF"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
