import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Camera, Mic, Sparkles } from 'lucide-react'
import { SYNTH } from '../../lib/theme'
import { AuroraVoiceOverlay } from '../../primitives/AuroraVoiceOverlay'
import { toast } from '../../../../shared/store/useToastStore'

/**
 * Right-edge column of small circular FABs that sit alongside the lineup
 * hero. Capture, voice memo, AI — same three jobs the launch sheet
 * surfaced, but always-on instead of pop-up.
 *
 * Stays tucked at the right of the viewport with a vertical stack.
 */
export function MicroActions() {
  const navigate = useNavigate()
  const [voiceOpen, setVoiceOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col items-center gap-2.5">
        <FabButton
          ariaLabel="Capture photo, screenshot, or upload"
          accent="#FFFFFF"
          icon={<Camera size={16} strokeWidth={2.4} />}
          onClick={() => navigate('/app/coach/capture')}
        />
        <FabButton
          ariaLabel="Voice memo"
          accent={SYNTH.accentEmerald}
          tone="dark"
          icon={<Mic size={16} strokeWidth={2.4} />}
          onClick={() => setVoiceOpen(true)}
        />
        <FabButton
          ariaLabel="Ask synth AI"
          accent="#FFFFFF"
          icon={<Sparkles size={16} strokeWidth={2.4} />}
          onClick={() => navigate('/app/coach/ai')}
        />
      </div>

      <AuroraVoiceOverlay
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSave={(transcript) => {
          if (transcript) toast('Voice memo saved', 'success')
        }}
        scopeLabel="your team"
      />
    </>
  )
}

function FabButton({
  ariaLabel,
  accent,
  tone = 'light',
  icon,
  onClick,
}: {
  ariaLabel: string
  accent: string
  tone?: 'light' | 'dark'
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full"
      style={{
        background: tone === 'dark' ? accent : SYNTH.glass,
        color: tone === 'dark' ? '#FFFFFF' : accent,
        backdropFilter:
          tone === 'dark'
            ? undefined
            : `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter:
          tone === 'dark'
            ? undefined
            : `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        border: `1px solid ${tone === 'dark' ? 'rgba(255,255,255,0.18)' : SYNTH.glassBorder}`,
        boxShadow:
          tone === 'dark'
            ? `0 8px 18px -6px ${accent}80`
            : '0 1px 0 rgba(255,255,255,0.20) inset, 0 8px 16px -8px rgba(8,8,40,0.5)',
      }}
    >
      {icon}
    </motion.button>
  )
}
