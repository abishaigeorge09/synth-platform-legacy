import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Check, Play } from 'lucide-react'
import { CoachPageHeader } from '../primitives/CoachPageHeader'
import { RecordingDetailSheet, SEED_RECORDINGS } from '../primitives/CaptureSheets'
import type { Recording } from '../primitives/CaptureSheets'
import { SYNTH } from '../lib/theme'
import { toast } from '../../../shared/store/useToastStore'

type Tab = 'record' | 'past'
type Phase = 'Catch' | 'Drive' | 'Finish' | 'Recovery'

const PHASES: Phase[] = ['Catch', 'Drive', 'Finish', 'Recovery']

export function FormVideoPage() {
  const [tab, setTab] = useState<Tab>('record')
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)

  return (
    <div className="synth-scroll flex flex-1 flex-col overflow-y-auto" style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 16px) + 88px)' }}>
      <CoachPageHeader title="Form Video" subtitle="Record, annotate, and share with your coach" back="/app/athlete/tools" />

      {/* Tab strip */}
      <div className="mx-5 mt-1 flex gap-2">
        {(['record', 'past'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="rounded-full px-4 py-1.5 text-[12px] font-semibold tracking-[0.08em]"
            style={{
              background: tab === t ? SYNTH.accentBlack : SYNTH.glass,
              color: tab === t ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted,
              border: tab === t ? 'none' : `1px solid ${SYNTH.glassBorder}`,
              fontFamily: SYNTH.font,
            }}
          >
            {t === 'record' ? 'Record' : 'Past recordings'}
          </button>
        ))}
      </div>

      {tab === 'record' ? (
        <RecordTab />
      ) : (
        <PastTab onSelect={setSelectedRecording} />
      )}

      <RecordingDetailSheet
        open={selectedRecording !== null}
        onClose={() => setSelectedRecording(null)}
        recording={selectedRecording}
      />
    </div>
  )
}

function RecordTab() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<Phase | null>(null)
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setDataUrl(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(f)
  }

  const reset = () => {
    setDataUrl(null)
    setFile(null)
    setPhase(null)
    setNote('')
    setSent(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const send = () => {
    setSent(true)
    toast('Video sent to Coach Geri')
    setTimeout(reset, 1200)
  }

  return (
    <section className="mx-5 mt-4 flex flex-col gap-4">
      {!dataUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-14 text-center"
          style={{
            background: SYNTH.inlineCard,
            border: `1px dashed ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: SYNTH.accentBlack, color: SYNTH.inkOnBrand }}
          >
            <Video size={24} strokeWidth={2.4} />
          </span>
          <p className="text-[16px] font-semibold" style={{ fontFamily: SYNTH.font }}>
            Open camera
          </p>
          <p className="max-w-[220px] text-[12px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
            Record your stroke or upload from your library
          </p>
        </button>
      ) : (
        <>
          {/* Preview */}
          <div className="overflow-hidden rounded-2xl" style={{ background: '#000', aspectRatio: '16/9' }}>
            <video src={dataUrl} controls className="h-full w-full object-cover" />
          </div>

          {/* Annotation */}
          <div
            className="rounded-3xl p-4"
            style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
              Stroke phase
            </p>
            <div className="flex flex-wrap gap-2">
              {PHASES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPhase(p)}
                  className="rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
                  style={{
                    background: phase === p ? SYNTH.accentBlack : SYNTH.glass,
                    color: phase === p ? SYNTH.inkOnBrand : SYNTH.inkOnBrandMuted,
                    border: phase === p ? 'none' : `1px solid ${SYNTH.glassBorder}`,
                    fontFamily: SYNTH.font,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
              Note for your coach
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. Drive phase — feeling rushed at the catch…"
              className="block w-full resize-none rounded-2xl px-4 py-3 text-[14px] outline-none"
              style={{
                background: SYNTH.glass,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                border: `1px solid ${SYNTH.glassBorder}`,
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex flex-1 items-center justify-center rounded-full border py-3 text-[13px] font-semibold"
              style={{
                background: SYNTH.inlineCard,
                borderColor: SYNTH.glassBorder,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
              }}
            >
              Retake
            </button>
            <motion.button
              type="button"
              onClick={send}
              disabled={sent}
              whileTap={{ scale: 0.97 }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold disabled:opacity-60"
              style={{
                background: SYNTH.accentBlack,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
              }}
            >
              {sent ? <Check size={14} strokeWidth={2.6} /> : null}
              {sent ? 'Sent!' : 'Send to Coach Geri →'}
            </motion.button>
          </div>
        </>
      )}

      <input ref={inputRef} type="file" accept="video/*" capture="environment" onChange={onSelect} className="hidden" />
    </section>
  )
}

function PastTab({ onSelect }: { onSelect: (r: Recording) => void }) {
  return (
    <section className="mx-5 mt-4">
      <div
        className="overflow-hidden rounded-3xl"
        style={{ background: SYNTH.inlineCard, border: `1px solid ${SYNTH.inlineCardBorder}` }}
      >
        {SEED_RECORDINGS.map((r, i) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            style={{ borderTop: i === 0 ? 'none' : `1px solid ${SYNTH.inlineCardBorder}` }}
          >
            {/* Thumbnail */}
            <div
              className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl"
              style={{ background: '#0a0d1a' }}
            >
              <Play size={16} strokeWidth={2.4} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-1.5">
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                  style={{ background: SYNTH.cardSky, color: SYNTH.ink }}
                >
                  {r.phase}
                </span>
              </div>
              <p className="truncate text-[13px] font-semibold" style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}>
                {r.title}
              </p>
              <p className="truncate text-[11px]" style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}>
                {r.date} · {r.comments.length} comment{r.comments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
