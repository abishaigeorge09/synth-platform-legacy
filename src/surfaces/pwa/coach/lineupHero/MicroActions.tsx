import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Camera, Mic, Sparkles, Upload, Pencil } from 'lucide-react'
import { SYNTH } from '../../lib/theme'
import { AuroraVoiceOverlay } from '../../primitives/AuroraVoiceOverlay'
import { PhotoCaptureSheet, QuickNoteSheet } from '../../primitives/CaptureSheets'
import { toast } from '@shared/store/useToastStore'

/**
 * Right-edge column of small circular FABs that sit alongside the lineup
 * hero. Photo / Voice / Note / Upload / AI — the five jobs the coach
 * reaches for from anywhere.
 *
 * Each FAB opens its action in-place (sheet) where possible — only AI
 * leaves the page (it's a full chat surface, deserves its own canvas).
 */
export function MicroActions() {
  const navigate = useNavigate()
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)

  const onUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const count = files.length
    toast(`${count} file${count === 1 ? '' : 's'} queued for sync`, 'success')
  }

  return (
    <>
      <div className="flex flex-col items-center gap-2.5">
        <FabButton
          ariaLabel="Photo capture"
          accent="#FFFFFF"
          icon={<Camera size={16} strokeWidth={2.4} />}
          onClick={() => setPhotoOpen(true)}
        />
        <FabButton
          ariaLabel="Voice memo"
          accent={SYNTH.accentEmerald}
          tone="dark"
          icon={<Mic size={16} strokeWidth={2.4} />}
          onClick={() => setVoiceOpen(true)}
        />
        <FabButton
          ariaLabel="Quick note"
          accent="#FFFFFF"
          icon={<Pencil size={15} strokeWidth={2.4} />}
          onClick={() => setNoteOpen(true)}
        />
        <FabButton
          ariaLabel="Upload files"
          accent="#FFFFFF"
          icon={<Upload size={15} strokeWidth={2.4} />}
          onClick={() => uploadInputRef.current?.click()}
        />
        <FabButton
          ariaLabel="Ask synth AI"
          accent="#FFFFFF"
          icon={<Sparkles size={16} strokeWidth={2.4} />}
          onClick={() => navigate('/app/coach/ai')}
        />
      </div>

      {/* Hidden multi-file input for Upload */}
      <input
        ref={uploadInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.csv,.xlsx,.txt"
        className="hidden"
        onChange={(e) => onUpload(e.target.files)}
      />

      <AuroraVoiceOverlay
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSave={(transcript) => {
          if (transcript) toast('Voice memo saved', 'success')
        }}
        scopeLabel="your team"
      />

      <PhotoCaptureSheet
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onSave={() => toast('Photo saved', 'success')}
      />

      <QuickNoteSheet
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSave={(text) => {
          if (text.trim()) toast('Note saved', 'success')
        }}
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
