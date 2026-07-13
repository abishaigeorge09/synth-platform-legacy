import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { SYNTH } from '../lib/theme'

type Phase = 'listening' | 'processing' | 'preview'

type Props = {
  open: boolean
  onClose: () => void
  onSave: (transcript: string) => void
  scopeLabel?: string
}

const BAR_COUNT = 12
const FALLBACK_BARS = Array.from({ length: BAR_COUNT }, () => 0.18)

// Web Speech API — types are not in the default DOM lib, so declare what we use.
type SRResult = { 0: { transcript: string } }
type SREvent = { results: ArrayLike<SRResult> }
type SRInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SREvent) => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}
type SRConstructor = new () => SRInstance

type WindowWithSR = Window & {
  SpeechRecognition?: SRConstructor
  webkitSpeechRecognition?: SRConstructor
}

export function AuroraVoiceOverlay({ open, onClose, onSave, scopeLabel = 'your team' }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <AuroraVoiceOverlayInner onClose={onClose} onSave={onSave} scopeLabel={scopeLabel} />
      ) : null}
    </AnimatePresence>
  )
}

function AuroraVoiceOverlayInner({
  onClose,
  onSave,
  scopeLabel,
}: {
  onClose: () => void
  onSave: (transcript: string) => void
  scopeLabel: string
}) {
  const [phase, setPhase] = useState<Phase>('listening')
  const [transcript, setTranscript] = useState('')
  const [bars, setBars] = useState<number[]>(FALLBACK_BARS)
  const recognitionRef = useRef<SRInstance | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const w = window as WindowWithSR
    const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (Recognition) {
      try {
        const rec = new Recognition()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = 'en-US'
        rec.onresult = (event) => {
          const text = Array.from(event.results)
            .map((r) => r[0]?.transcript ?? '')
            .join(' ')
            .trim()
          setTranscript(text)
        }
        rec.onerror = () => {
          /* mic denied / network — keep going with empty transcript */
        }
        rec.start()
        recognitionRef.current = rec
      } catch {
        /* ignore — Recognition unavailable in this context */
      }
    }

    let cancelled = false
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop())
            return
          }
          streamRef.current = stream
          const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          const ctx = new Ctx()
          audioCtxRef.current = ctx
          const source = ctx.createMediaStreamSource(stream)
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 64
          analyser.smoothingTimeConstant = 0.78
          source.connect(analyser)

          const data = new Uint8Array(analyser.frequencyBinCount)
          const tick = () => {
            analyser.getByteFrequencyData(data)
            const next = Array.from({ length: BAR_COUNT }).map((_, i) => {
              const start = Math.floor((i / BAR_COUNT) * data.length)
              const end = Math.floor(((i + 1) / BAR_COUNT) * data.length)
              let sum = 0
              for (let j = start; j < end; j++) sum += data[j]
              const avg = sum / Math.max(1, end - start) / 255
              return Math.max(0.12, Math.min(1, avg * 1.5))
            })
            setBars(next)
            rafRef.current = requestAnimationFrame(tick)
          }
          tick()
        })
        .catch(() => {
          /* mic denied — keep idle bars */
        })
    }

    return () => {
      cancelled = true
      try {
        recognitionRef.current?.stop()
      } catch {
        /* recognition may already be stopped */
      }
      recognitionRef.current = null
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      audioCtxRef.current?.close().catch(() => undefined)
      audioCtxRef.current = null
    }
  }, [])

  const handleStop = () => {
    setPhase('processing')
    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    cancelAnimationFrame(rafRef.current)
    setTimeout(() => setPhase('preview'), 600)
  }

  const handleSave = () => {
    onSave(transcript || '')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32 }}
      className="fixed inset-0 z-50"
      style={{ background: 'rgba(8,8,40,0.92)', backdropFilter: 'blur(8px)' }}
      aria-modal
      role="dialog"
    >
          <Aurora />

          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel"
            className="absolute right-5 top-[max(env(safe-area-inset-top),16px)] z-10 flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.28)',
              color: '#FFFFFF',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <X size={16} strokeWidth={2.4} />
          </button>

          <div className="relative flex h-full flex-col items-center justify-end pb-[max(env(safe-area-inset-bottom),24px)]">
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
              <DotMark color="#FFFFFF" />

              <motion.p
                key={transcript || phase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                className="max-w-[320px] text-center text-[26px] font-bold leading-[1.25] tracking-[-0.01em]"
                style={{ color: '#FFFFFF', fontFamily: SYNTH.font }}
              >
                {phase === 'preview'
                  ? (transcript || 'Nothing captured.')
                  : transcript || `Hi! Tell synth about ${scopeLabel}.`}
              </motion.p>

              {phase === 'preview' ? (
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: 'rgba(255,255,255,0.55)', fontFamily: SYNTH.font }}
                >
                  Save or cancel?
                </p>
              ) : (
                <Waveform bars={bars} active={phase === 'listening'} />
              )}
            </div>

            <div className="flex items-center gap-5 pb-2">
              {phase === 'preview' ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Discard"
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.28)',
                      color: '#FFFFFF',
                    }}
                  >
                    <X size={18} strokeWidth={2.4} />
                  </button>
                  <motion.button
                    type="button"
                    onClick={handleSave}
                    whileTap={{ scale: 0.94 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{
                      background: SYNTH.accentEmerald,
                      color: '#FFFFFF',
                      boxShadow: '0 10px 24px -8px rgba(16,185,129,0.7)',
                    }}
                    aria-label="Save"
                  >
                    <Check size={22} strokeWidth={3} />
                  </motion.button>
                  <div className="h-12 w-12" />
                </>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleStop}
                  whileTap={{ scale: 0.92 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full"
                  style={{
                    background: '#0A0A12',
                    color: '#FFFFFF',
                    boxShadow: '0 18px 32px -10px rgba(8,8,40,0.6)',
                  }}
                  aria-label="Stop recording"
                  disabled={phase !== 'listening'}
                >
                  <span
                    className="block h-5 w-5 rounded-sm"
                    style={{ background: '#FFFFFF' }}
                  />
                </motion.button>
              )}
        </div>
      </div>
    </motion.div>
  )
}

function Aurora() {
  return (
    <>
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.08, 1], rotate: [0, 12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 30% 75%, rgba(167,139,250,0.65), transparent 55%)',
          filter: 'blur(48px)',
        }}
      />
      <motion.div
        aria-hidden
        animate={{ scale: [1.05, 1, 1.05], rotate: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 70% 60%, rgba(96,165,250,0.55), transparent 55%)',
          filter: 'blur(56px)',
        }}
      />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.12, 1], rotate: [0, 6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 90%, rgba(244,114,182,0.45), transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
    </>
  )
}

function Waveform({ bars, active }: { bars: number[]; active: boolean }) {
  return (
    <div
      className="flex items-center gap-1 rounded-full px-4 py-3"
      style={{
        background: 'rgba(255,255,255,0.14)',
        border: '1px solid rgba(255,255,255,0.28)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {bars.map((level, i) => (
        <motion.span
          key={i}
          animate={{ height: active ? 6 + level * 26 : 6 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          style={{
            width: 3,
            background: '#FFFFFF',
            borderRadius: 2,
            opacity: active ? 0.9 : 0.4,
          }}
        />
      ))}
    </div>
  )
}

function DotMark({ color }: { color: string }) {
  const rings = [
    { r: 6, count: 1 },
    { r: 18, count: 8 },
    { r: 30, count: 12 },
  ]
  return (
    <motion.svg
      width={84}
      height={84}
      viewBox="-42 -42 84 84"
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      {rings.map((ring) =>
        Array.from({ length: ring.count }).map((_, i) => {
          const angle = (i / ring.count) * Math.PI * 2
          const x = Math.cos(angle) * ring.r
          const y = Math.sin(angle) * ring.r
          return (
            <circle
              key={`${ring.r}-${i}`}
              cx={x}
              cy={y}
              r={ring.r === 6 ? 2.4 : 1.4}
              fill={color}
              opacity={ring.r === 6 ? 1 : 0.7}
            />
          )
        }),
      )}
    </motion.svg>
  )
}
