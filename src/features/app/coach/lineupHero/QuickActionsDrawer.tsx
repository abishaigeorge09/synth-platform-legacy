import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  Mic,
  Sparkles,
  Upload,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { SYNTH } from '../../lib/theme'
import { AuroraVoiceOverlay } from '../../primitives/AuroraVoiceOverlay'
import { PhotoCaptureSheet, QuickNoteSheet } from '../../primitives/CaptureSheets'
import { toast } from '../../../../shared/store/useToastStore'

/**
 * Quick-actions drawer — a slide-out tray on the right edge of the screen
 * that hides until the chevron tab is tapped. Replaces the always-visible
 * FAB column on the lineup hero so the boat illustration has the screen
 * to itself when the coach isn't reaching for an action.
 *
 * Layout:
 *   [chevron tab] ←  ←  ←  → drawer slides out left
 *
 * When closed, only a tiny chevron tab is visible on the right edge.
 * When open, the 5 action FABs slide out to its LEFT, and the chevron
 * flips to point right so a tap closes them.
 */
export function QuickActionsDrawer() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)

  const onUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const count = files.length
    toast(`${count} file${count === 1 ? '' : 's'} queued for sync`, 'success')
  }

  const close = () => setOpen(false)
  const after = (fn: () => void) => () => {
    fn()
    close()
  }

  return (
    <>
      {/* Backdrop — only when open. Tap anywhere to close. */}
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            aria-label="Close quick actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
            className="absolute inset-0 z-30 cursor-default"
            style={{ background: 'rgba(5,8,28,0.35)' }}
          />
        ) : null}
      </AnimatePresence>

      {/* Drawer — anchors to the right edge, vertically centered. */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-40 flex items-center justify-end"
      >
        <div className="pointer-events-auto flex items-center">
          {/* The FAB column — slides out to the LEFT of the chevron tab */}
          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                key="fabs"
                initial={{ x: 70, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 70, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                className="mr-2 flex flex-col gap-2.5 rounded-3xl px-2 py-3"
                style={{
                  background: 'rgba(5,8,28,0.5)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(14px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                }}
              >
                <Fab
                  ariaLabel="Photo capture"
                  icon={<Camera size={16} strokeWidth={2.4} />}
                  onClick={after(() => setPhotoOpen(true))}
                />
                <Fab
                  ariaLabel="Voice memo"
                  tone="dark"
                  accent={SYNTH.accentEmerald}
                  icon={<Mic size={16} strokeWidth={2.4} />}
                  onClick={after(() => setVoiceOpen(true))}
                />
                <Fab
                  ariaLabel="Quick note"
                  icon={<Pencil size={15} strokeWidth={2.4} />}
                  onClick={after(() => setNoteOpen(true))}
                />
                <Fab
                  ariaLabel="Upload files"
                  icon={<Upload size={15} strokeWidth={2.4} />}
                  // The ref is read inside the click handler, not at render
                  // time — the linter trips on the closure being created
                  // during render even though it's never invoked then.
                  // eslint-disable-next-line react-hooks/refs
                  onClick={after(() => uploadInputRef.current?.click())}
                />
                <Fab
                  ariaLabel="Ask synth AI"
                  icon={<Sparkles size={16} strokeWidth={2.4} />}
                  onClick={after(() => navigate('/app/coach/ai'))}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Chevron tab — always visible. Anchored to the right edge. */}
          <motion.button
            type="button"
            aria-label={open ? 'Close quick actions' : 'Open quick actions'}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen((v) => !v)}
            className="flex h-14 w-7 items-center justify-center rounded-l-2xl"
            style={{
              background: 'rgba(5,8,28,0.55)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRight: 'none',
              color: '#FFFFFF',
              backdropFilter: 'blur(10px) saturate(140%)',
              WebkitBackdropFilter: 'blur(10px) saturate(140%)',
            }}
          >
            {open ? (
              <ChevronRight size={14} strokeWidth={2.6} />
            ) : (
              <ChevronLeft size={14} strokeWidth={2.6} />
            )}
          </motion.button>
        </div>
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

      {/* Capture sheets */}
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

function Fab({
  ariaLabel,
  icon,
  onClick,
  accent = '#FFFFFF',
  tone = 'light',
}: {
  ariaLabel: string
  icon: React.ReactNode
  onClick: () => void
  accent?: string
  tone?: 'light' | 'dark'
}) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full"
      style={{
        background: tone === 'dark' ? accent : 'rgba(255,255,255,0.10)',
        color: tone === 'dark' ? '#FFFFFF' : accent,
        border: `1px solid ${tone === 'dark' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.18)'}`,
        boxShadow:
          tone === 'dark'
            ? `0 8px 18px -6px ${accent}80`
            : '0 1px 0 rgba(255,255,255,0.20) inset',
      }}
    >
      {icon}
    </motion.button>
  )
}
