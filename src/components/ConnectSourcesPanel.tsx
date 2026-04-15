import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { THEME } from '../lib/theme'

const PRESETS = [
  { id: 'sheets', label: 'Google Sheets (erg log)' },
  { id: 'tw', label: 'TeamWorks · calendar + compliance' },
  { id: 'bridge', label: 'Bridge · S&C loads' },
] as const

type Phase = 'idle' | 'toList' | 'picked' | 'toButton' | 'loading'

/** Connect UI with staged cursor: preset list → first row → Connect → loading. */
export function ConnectSourcesPanel() {
  const rootRef = useRef<HTMLDivElement>(null)
  const listBoxRef = useRef<HTMLDivElement>(null)
  const firstOptionRef = useRef<HTMLButtonElement>(null)
  const connectButtonRef = useRef<HTMLButtonElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [selected, setSelected] = useState<(typeof PRESETS)[number]['id'] | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: 10, y: 15 })

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('toList'), 400)
    const t2 = window.setTimeout(() => setPhase('picked'), 1600)
    const t3 = window.setTimeout(() => {
      setSelected('sheets')
      setPhase('toButton')
    }, 2400)
    const t4 = window.setTimeout(() => setPhase('loading'), 3400)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(t4)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const m = (el: HTMLElement | null) => {
      if (!el) return { x: 50, y: 45 }
      const rr = root.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      return {
        x: ((er.left + er.width / 2 - rr.left) / rr.width) * 100,
        y: ((er.top + er.height / 2 - rr.top) / rr.height) * 100,
      }
    }
    if (phase === 'idle' || phase === 'toList') setCursorPos(m(listBoxRef.current))
    else if (phase === 'picked') setCursorPos(m(firstOptionRef.current))
    else setCursorPos(m(connectButtonRef.current))
  }, [phase, rootRef, listBoxRef, firstOptionRef, connectButtonRef])

  return (
    <div ref={rootRef} className="relative w-full max-w-[380px]" data-no-advance>
      <motion.div
        className="pointer-events-none absolute z-50"
        initial={false}
        animate={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
        transition={{ duration: 0.75, ease: 'easeInOut' }}
        style={{ marginLeft: -5, marginTop: -5 }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M5 3v14l4.5-4.5L13 20l2-1-3.2-7.2L17 11.5 5 3z"
            fill="#18181B"
            stroke="#fff"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
        {phase === 'loading' ? null : (
          <motion.span
            className="absolute left-3 top-4 block h-2 w-2 rounded-full border border-white"
            style={{ background: THEME.primary }}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
      </motion.div>

      <div className="rounded-2xl border bg-white p-4 shadow-[0_24px_60px_rgba(0,0,0,0.2)]" style={{ borderColor: THEME.border }}>
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: THEME.fontMono }}>
          Connect tools
        </p>
        <label className="mt-3 block text-[10px] font-semibold text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
          Paste URLs (one per line)
        </label>
        <textarea
          readOnly
          className="mt-1 w-full resize-none rounded-lg border px-2 py-2 text-[10px] text-zinc-700"
          style={{ borderColor: THEME.border, fontFamily: THEME.fontMono, minHeight: 72 }}
          value={'https://docs.google.com/spreadsheets/d/...\nhttps://teamworks.example.com/cal/...'}
        />
        <label className="mt-3 block text-[10px] font-semibold text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
          Or choose a preset (top → down)
        </label>
        <div ref={listBoxRef} className="mt-1 overflow-hidden rounded-lg border" style={{ borderColor: THEME.border }}>
          {PRESETS.map((p, i) => (
            <button
              key={p.id}
              ref={i === 0 ? firstOptionRef : undefined}
              type="button"
              className="flex w-full border-b px-2 py-2 text-left text-[10px] last:border-b-0"
              style={{
                fontFamily: THEME.fontMono,
                borderColor: THEME.border,
                background:
                  selected === p.id ? `${THEME.primary}18` : i === 0 && (phase === 'picked' || phase === 'toButton') ? `${THEME.cyan}14` : '#fff',
                color: THEME.textPrimary,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          ref={connectButtonRef}
          type="button"
          disabled={phase === 'loading'}
          className="mt-4 w-full rounded-lg py-2 text-[11px] font-bold uppercase tracking-wide text-white disabled:opacity-90"
          style={{ fontFamily: THEME.fontMono, background: phase === 'loading' ? THEME.textMuted : THEME.primary }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {phase === 'loading' ? 'Connecting…' : 'Connect & process'}
        </button>
        {phase === 'loading' ? (
          <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-zinc-500" style={{ fontFamily: THEME.fontSans }}>
            <motion.span
              className="inline-block h-3.5 w-3.5 rounded-full border-2 border-zinc-200"
              style={{ borderTopColor: THEME.primary }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
            Running ingest on selected source…
          </div>
        ) : null}
      </div>
    </div>
  )
}
