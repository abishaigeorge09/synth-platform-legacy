import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Camera, Video, Copy, Mail } from 'lucide-react'
import type { ReactNode } from 'react'
import { SYNTH } from '../lib/theme'

type SheetShellProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

function SheetShell({ open, onClose, title, children }: SheetShellProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(8,8,40,0.55)', backdropFilter: 'blur(6px)' }}
          />
          <motion.div
            initial={{ y: 600 }}
            animate={{ y: 0 }}
            exit={{ y: 600 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
            style={{
              background: SYNTH.sheet,
              borderRadius: `${SYNTH.radius.sheet}px ${SYNTH.radius.sheet}px 0 0`,
              maxHeight: '88dvh',
              color: SYNTH.ink,
              fontFamily: SYNTH.font,
            }}
          >
            <header className="relative flex items-center justify-between px-5 pt-5 pb-2">
              <div
                className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full"
                style={{ background: SYNTH.sheetMuted }}
              />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
              >
                {title}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </header>
            <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-2">
              {children}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

// — Photo capture —

type MediaCaptureProps = {
  open: boolean
  onClose: () => void
  onSave: (file: File, dataUrl: string) => void
}

export function PhotoCaptureSheet({ open, onClose, onSave }: MediaCaptureProps) {
  return (
    <MediaCaptureSheetInner
      open={open}
      onClose={onClose}
      onSave={onSave}
      title="Form photo"
      kind="image"
      icon={<Camera size={18} strokeWidth={2.4} />}
      ctaLabel="Send to coach"
    />
  )
}

export function VideoCaptureSheet({ open, onClose, onSave }: MediaCaptureProps) {
  return (
    <MediaCaptureSheetInner
      open={open}
      onClose={onClose}
      onSave={onSave}
      title="Form video"
      kind="video"
      icon={<Video size={18} strokeWidth={2.4} />}
      ctaLabel="Send to coach"
    />
  )
}

function MediaCaptureSheetInner({
  open,
  onClose,
  onSave,
  title,
  kind,
  icon,
  ctaLabel,
}: {
  open: boolean
  onClose: () => void
  onSave: (file: File, dataUrl: string) => void
  title: string
  kind: 'image' | 'video'
  icon: ReactNode
  ctaLabel: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setDataUrl(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(f)
  }

  const reset = () => {
    setFile(null)
    setDataUrl(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const close = () => {
    reset()
    onClose()
  }

  const save = () => {
    if (file && dataUrl) {
      onSave(file, dataUrl)
      reset()
      onClose()
    }
  }

  return (
    <SheetShell open={open} onClose={close} title={title}>
      {!dataUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-12 text-center"
          style={{
            background: SYNTH.sheetMuted,
            border: `1px dashed ${SYNTH.inkMuted}55`,
            color: SYNTH.ink,
          }}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}
          >
            {icon}
          </span>
          <p className="text-[15px] font-semibold" style={{ fontFamily: SYNTH.font }}>
            Open camera
          </p>
          <p className="text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
            Tap to capture {kind === 'image' ? 'a photo' : 'a clip'}
          </p>
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className="overflow-hidden rounded-2xl"
            style={{ background: '#000', aspectRatio: kind === 'video' ? '16/9' : '4/5' }}
          >
            {kind === 'image' ? (
              <img src={dataUrl} alt="capture" className="h-full w-full object-cover" />
            ) : (
              <video src={dataUrl} controls className="h-full w-full object-cover" />
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex flex-1 items-center justify-center rounded-full border py-3 text-[13px] font-semibold"
              style={{
                background: SYNTH.sheet,
                borderColor: SYNTH.sheetMuted,
                color: SYNTH.ink,
                fontFamily: SYNTH.font,
              }}
            >
              Retake
            </button>
            <button
              type="button"
              onClick={save}
              className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold"
              style={{
                background: SYNTH.accentBlack,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                letterSpacing: '0.02em',
              }}
            >
              <Check size={14} strokeWidth={2.6} />
              {ctaLabel}
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={kind === 'image' ? 'image/*' : 'video/*'}
        capture="environment"
        onChange={onSelect}
        className="hidden"
      />
    </SheetShell>
  )
}

// — Quick text note —

type QuickNoteProps = {
  open: boolean
  onClose: () => void
  onSave: (text: string) => void
  placeholder?: string
}

export function QuickNoteSheet({ open, onClose, onSave, placeholder }: QuickNoteProps) {
  const [text, setText] = useState('')

  const close = () => {
    setText('')
    onClose()
  }

  const save = () => {
    if (!text.trim()) return
    onSave(text.trim())
    setText('')
    onClose()
  }

  return (
    <SheetShell open={open} onClose={close} title="Quick note">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        rows={6}
        placeholder={placeholder ?? "Anything you want synth to remember…"}
        className="block w-full resize-none rounded-2xl px-4 py-3 text-[15px] outline-none"
        style={{
          background: SYNTH.sheetMuted,
          color: SYNTH.ink,
          fontFamily: SYNTH.font,
          minHeight: 160,
        }}
      />
      <button
        type="button"
        onClick={save}
        disabled={!text.trim()}
        className="rounded-full py-3.5 text-[14px] font-semibold disabled:opacity-40"
        style={{
          background: SYNTH.accentBlack,
          color: SYNTH.inkOnBrand,
          fontFamily: SYNTH.font,
          letterSpacing: '0.02em',
        }}
      >
        Save note
      </button>
    </SheetShell>
  )
}

// — Email forward —

type EmailSheetProps = {
  open: boolean
  onClose: () => void
  forwardTo: string
}

export function EmailForwardSheet({ open, onClose, forwardTo }: EmailSheetProps) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(forwardTo)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore — clipboard unavailable */
    }
  }

  return (
    <SheetShell open={open} onClose={onClose} title="Email forward">
      <div className="flex flex-col items-center gap-2 py-4">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}
        >
          <Mail size={20} strokeWidth={2.4} />
        </span>
        <p
          className="text-center text-[18px] font-bold leading-tight tracking-[-0.01em]"
          style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
        >
          Forward anything to your synth.
        </p>
        <p
          className="max-w-[280px] text-center text-[13px]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          synth ingests emails forwarded here, attaches them to the right athlete, and surfaces
          them on the dashboard.
        </p>
      </div>

      <button
        type="button"
        onClick={copy}
        className="flex items-center justify-between gap-3 rounded-2xl px-4 py-4 text-left active:opacity-80"
        style={{ background: SYNTH.sheetMuted, color: SYNTH.ink }}
      >
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Forward to
          </p>
          <p
            className="mt-1 truncate text-[15px] font-semibold"
            style={{ color: SYNTH.ink, fontFamily: SYNTH.font, fontVariantNumeric: 'tabular-nums' }}
          >
            {forwardTo}
          </p>
        </div>
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{
            background: copied ? SYNTH.accentEmerald : SYNTH.accentBlack,
            color: SYNTH.inkOnBrand,
            fontFamily: SYNTH.font,
          }}
        >
          {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} strokeWidth={2.4} />}
          {copied ? 'Copied' : 'Copy'}
        </span>
      </button>

      <p
        className="text-center text-[11px] uppercase tracking-[0.14em]"
        style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
      >
        Tip: add it to your contacts.
      </p>
    </SheetShell>
  )
}
