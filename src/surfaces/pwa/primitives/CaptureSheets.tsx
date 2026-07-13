/* eslint-disable react-refresh/only-export-components */
// Primitive module: exports several capture-flow sheets plus shared types
// and helpers consumed by sibling files. Keeping them co-located preserves
// cohesion at the cost of full HMR reloads when this file is edited.
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Camera, Video, Copy, Mail, FileUp, Play, Send } from 'lucide-react'
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

// — Journal —

type JournalEntry = { id: string; date: string; body: string }

const SEED_JOURNAL: JournalEntry[] = [
  { id: '1', date: '2026-04-29', body: 'Felt tight in the catch today. Legs were heavy from Monday\'s weights session but pushed through the last 500.' },
  { id: '2', date: '2026-04-28', body: 'Good water session. Coach had us do pause drills and my sequencing finally clicked. 18/20 at rate felt smooth.' },
  { id: '3', date: '2026-04-26', body: 'Race pieces today. Nervous energy but channelled it well. First 500 was aggressive, held on for a 7:02 predicted 2K.' },
  { id: '4', date: '2026-04-25', body: 'Recovery day. Stretching and some light erg. Mind is busy thinking about the upcoming regatta.' },
  { id: '5', date: '2026-04-23', body: 'Team talk after practice — really connected with the crew today. Feeling confident about the season.' },
]

function fmtEntryDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

type JournalSheetProps = {
  open: boolean
  onClose: () => void
  onSave: (text: string) => void
}

export function JournalSheet({ open, onClose, onSave }: JournalSheetProps) {
  const [text, setText] = useState('')
  const [entries, setEntries] = useState<JournalEntry[]>(SEED_JOURNAL)

  const close = () => {
    setText('')
    onClose()
  }

  const save = () => {
    if (!text.trim()) return
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      body: text.trim(),
    }
    setEntries((e) => [entry, ...e])
    onSave(text.trim())
    setText('')
  }

  return (
    <SheetShell open={open} onClose={close} title="Journal">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        rows={5}
        placeholder="How did today feel? Anything to remember…"
        className="block w-full resize-none rounded-2xl px-4 py-3 text-[15px] outline-none"
        style={{
          background: SYNTH.sheetMuted,
          color: SYNTH.ink,
          fontFamily: SYNTH.font,
          minHeight: 120,
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
        Save entry
      </button>

      {entries.length > 0 ? (
        <div>
          <p
            className="pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Past entries
          </p>
          <div
            className="overflow-hidden rounded-2xl"
            style={{ background: SYNTH.sheetMuted, border: `1px solid ${SYNTH.glassBorder}` }}
          >
            {entries.map((e, i) => (
              <div
                key={e.id}
                className="px-4 py-3"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.glassBorder}` }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ background: SYNTH.glass, color: SYNTH.inkMuted, border: `1px solid ${SYNTH.glassBorder}` }}
                  >
                    {fmtEntryDate(e.date)}
                  </span>
                </div>
                <p
                  className="line-clamp-2 text-[13px] leading-[1.5]"
                  style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}
                >
                  {e.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </SheetShell>
  )
}

// — File upload + analysis —

type UploadState = 'idle' | 'uploading' | 'mapped'

type MappedField = { label: string; value: string }

function detectFileType(name: string): { kind: string; fields: MappedField[] } {
  const lower = name.toLowerCase()
  if (lower.includes('erg') || lower.includes('piece') || lower.includes('session')) {
    return {
      kind: 'Erg session log',
      fields: [
        { label: 'Sessions detected', value: '4' },
        { label: 'Avg split', value: '1:47.2 /500m' },
        { label: 'Avg rate', value: '22 spm' },
        { label: 'Date range', value: 'Apr 22 – Apr 29' },
      ],
    }
  }
  if (lower.includes('wellness') || lower.includes('hrv') || lower.includes('sleep')) {
    return {
      kind: 'Wellness export',
      fields: [
        { label: 'Days logged', value: '7' },
        { label: 'Avg HRV', value: '54 ms' },
        { label: 'Avg sleep', value: '7h 22m' },
        { label: 'Avg readiness', value: '73 / 100' },
      ],
    }
  }
  return {
    kind: 'Data file',
    fields: [
      { label: 'Records found', value: '12' },
      { label: 'Date range', value: 'Apr 2026' },
      { label: 'Columns mapped', value: '6 of 8' },
    ],
  }
}

type FileUploadSheetProps = {
  open: boolean
  onClose: () => void
  onSave: (filename: string, kind: string) => void
}

export function FileUploadSheet({ open, onClose, onSave }: FileUploadSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [filename, setFilename] = useState('')
  const [detected, setDetected] = useState<{ kind: string; fields: MappedField[] } | null>(null)
  const [visibleFields, setVisibleFields] = useState(0)

  const reset = () => {
    setUploadState('idle')
    setFilename('')
    setDetected(null)
    setVisibleFields(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  const close = () => {
    reset()
    onClose()
  }

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFilename(f.name)
    setUploadState('uploading')
    const result = detectFileType(f.name)
    setDetected(result)
  }

  useEffect(() => {
    if (uploadState !== 'uploading') return
    const t = setTimeout(() => {
      setUploadState('mapped')
      setVisibleFields(0)
    }, 1500)
    return () => clearTimeout(t)
  }, [uploadState])

  useEffect(() => {
    if (uploadState !== 'mapped' || !detected) return
    if (visibleFields >= detected.fields.length) return
    const t = setTimeout(() => setVisibleFields((v) => v + 1), 200)
    return () => clearTimeout(t)
  }, [uploadState, visibleFields, detected])

  const addToSynth = () => {
    if (detected) onSave(filename, detected.kind)
    reset()
    onClose()
  }

  return (
    <SheetShell open={open} onClose={close} title="Upload data">
      {uploadState === 'idle' ? (
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
            <FileUp size={20} strokeWidth={2.4} />
          </span>
          <p className="text-[15px] font-semibold" style={{ fontFamily: SYNTH.font }}>
            Select a file
          </p>
          <p className="text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
            CSV, PDF, XLS — erg logs, wellness data, race results
          </p>
        </button>
      ) : uploadState === 'uploading' ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <div
            className="h-12 w-12 animate-spin rounded-full"
            style={{
              border: `3px solid ${SYNTH.sheetMuted}`,
              borderTopColor: SYNTH.accentEmerald,
            }}
          />
          <p className="text-[14px] font-medium" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
            synth is reading your file…
          </p>
          <p className="text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font, opacity: 0.6 }}>
            {filename}
          </p>
        </div>
      ) : detected ? (
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center gap-3 rounded-2xl p-4"
            style={{ background: SYNTH.sheetMuted, border: `1px solid ${SYNTH.glassBorder}` }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}
            >
              <FileUp size={16} strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>
                {filename}
              </p>
              <p className="text-[11px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
                {detected.kind}
              </p>
            </div>
            <Check size={16} strokeWidth={2.6} style={{ color: SYNTH.accentEmerald }} />
          </div>

          <div
            className="overflow-hidden rounded-2xl"
            style={{ border: `1px solid ${SYNTH.glassBorder}` }}
          >
            {detected.fields.slice(0, visibleFields).map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.glassBorder}`,
                  background: SYNTH.sheetMuted,
                }}
              >
                <span className="text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
                  {f.label}
                </span>
                <span className="text-[13px] font-semibold" style={{ color: SYNTH.ink, fontFamily: SYNTH.font }}>
                  {f.value}
                </span>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={addToSynth}
            disabled={visibleFields < detected.fields.length}
            className="flex items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-semibold disabled:opacity-40"
            style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            <Check size={14} strokeWidth={2.6} />
            Add to synth
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full py-2.5 text-[13px] font-medium"
            style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
          >
            Upload another
          </button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.pdf,.xls,.xlsx"
        onChange={onSelect}
        className="hidden"
      />
    </SheetShell>
  )
}

// — Recording detail sheet —

type Comment = { id: string; author: 'coach' | 'athlete'; text: string; time: string }

type Recording = {
  id: string
  title: string
  phase: string
  date: string
  annotation: string
  comments: Comment[]
}

export type { Recording }

export const SEED_RECORDINGS: Recording[] = [
  {
    id: 'r1',
    title: 'Drive phase analysis',
    phase: 'Drive',
    date: 'Apr 29',
    annotation: 'Feeling rushed at the catch — want coach feedback on sequencing.',
    comments: [
      { id: 'c1', author: 'coach', text: 'Great catch timing on rep 3. Your leg drive is initiating well before the arms open.', time: 'Apr 29' },
      { id: 'c2', author: 'coach', text: 'Work on the finish — blade is still in the water a beat too long. Try releasing at 90°.', time: 'Apr 29' },
    ],
  },
  {
    id: 'r2',
    title: 'Finish position check',
    phase: 'Finish',
    date: 'Apr 26',
    annotation: 'Coach asked to see my finish after last session.',
    comments: [
      { id: 'c3', author: 'coach', text: 'Good body angle at the finish. Hands need to be faster away from the body on the recovery.', time: 'Apr 26' },
    ],
  },
  {
    id: 'r3',
    title: 'Catch drill — paused rowing',
    phase: 'Catch',
    date: 'Apr 22',
    annotation: 'Drill work — pause at catch. Want to see if I\'m over-reaching.',
    comments: [
      { id: 'c4', author: 'coach', text: 'Over-compression at the catch. Aim for shins vertical, not past vertical.', time: 'Apr 22' },
    ],
  },
]

type RecordingDetailSheetProps = {
  open: boolean
  onClose: () => void
  recording: Recording | null
}

export function RecordingDetailSheet({ open, onClose, recording }: RecordingDetailSheetProps) {
  const [reply, setReply] = useState('')
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    // Reseed comments when the sheet opens against a new recording.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (recording) setComments(recording.comments)
  }, [recording])

  const sendReply = () => {
    if (!reply.trim()) return
    setComments((c) => [
      ...c,
      { id: Date.now().toString(), author: 'athlete', text: reply.trim(), time: 'just now' },
    ])
    setReply('')
  }

  if (!recording) return null

  return (
    <SheetShell open={open} onClose={onClose} title="Recording">
      {/* Thumbnail */}
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-2xl"
        style={{ background: '#0a0d1a', aspectRatio: '16/9' }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)' }}
        >
          <Play size={22} strokeWidth={2.4} style={{ color: '#fff' }} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ background: SYNTH.cardSky, color: SYNTH.ink }}
        >
          {recording.phase}
        </span>
        <span className="text-[12px]" style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}>
          {recording.date} · {recording.annotation}
        </span>
      </div>

      {/* Comment thread */}
      <div>
        <p
          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkMuted, fontFamily: SYNTH.font }}
        >
          Coach feedback
        </p>
        <div className="flex flex-col gap-2">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`flex gap-2 ${c.author === 'athlete' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className="max-w-[82%] rounded-2xl px-3 py-2.5"
                style={{
                  background: c.author === 'coach' ? SYNTH.sheetMuted : SYNTH.accentBlack,
                  border: c.author === 'coach' ? `1px solid ${SYNTH.glassBorder}` : 'none',
                }}
              >
                <p
                  className="text-[13px] leading-[1.5]"
                  style={{
                    color: c.author === 'coach' ? SYNTH.ink : SYNTH.inkOnBrand,
                    fontFamily: SYNTH.font,
                  }}
                >
                  {c.text}
                </p>
                <p
                  className="mt-0.5 text-[10px]"
                  style={{ color: c.author === 'coach' ? SYNTH.inkMuted : 'rgba(255,255,255,0.5)', fontFamily: SYNTH.font }}
                >
                  {c.author === 'coach' ? 'Coach Geri' : 'You'} · {c.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply input */}
      <div className="flex items-center gap-2">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendReply()}
          placeholder="Reply…"
          className="flex-1 rounded-full px-4 py-2.5 text-[14px] outline-none"
          style={{
            background: SYNTH.sheetMuted,
            color: SYNTH.ink,
            fontFamily: SYNTH.font,
            border: `1px solid ${SYNTH.glassBorder}`,
          }}
        />
        <button
          type="button"
          onClick={sendReply}
          disabled={!reply.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
          style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}
        >
          <Send size={14} strokeWidth={2.4} />
        </button>
      </div>
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
