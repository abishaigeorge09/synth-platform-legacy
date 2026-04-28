import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, ChevronDown, Plus, Mic, AudioLines } from 'lucide-react'
import { SYNTH } from '../lib/theme'
import { APP_MOCK_ATHLETES } from '../data/mockTeam'

export function AIPage() {
  const navigate = useNavigate()
  const me = APP_MOCK_ATHLETES[0]
  const [text, setText] = useState('')

  return (
    <div className="flex flex-1 flex-col" style={{ fontFamily: SYNTH.font }}>
      <header className="flex items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        <button
          type="button"
          onClick={() => navigate('/app/athlete/home')}
          aria-label="Open menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            color: SYNTH.inkOnBrand,
          }}
        >
          <Menu size={16} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
          }}
        >
          <span
            className="text-[13px] font-semibold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            Just me
          </span>
          <ChevronDown size={14} color={SYNTH.inkOnBrandMuted} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          aria-label="Profile"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `linear-gradient(135deg, ${SYNTH.accentEmerald}, #047857)`,
            color: '#FFFFFF',
            fontFamily: SYNTH.font,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.04em',
          }}
        >
          {me.initials}
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <DotMark />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-[320px] text-center text-[28px] font-bold leading-[1.15] tracking-[-0.01em]"
          style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
        >
          synth ai ·
          <br />
          <span style={{ color: SYNTH.accentEmerald }}>ask anything about your training.</span>
        </motion.h1>
        <p
          className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: SYNTH.inkOnBrandFaint, fontFamily: SYNTH.font }}
        >
          Scoped · {me.position}
        </p>
      </div>

      <div className="px-4 pb-[120px] pt-2">
        <div
          className="rounded-3xl px-4 pb-3 pt-3"
          style={{
            background: SYNTH.glass,
            backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
            border: `1px solid ${SYNTH.glassBorder}`,
            boxShadow: `inset 0 1px 0 ${SYNTH.glassInset}`,
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            placeholder="Ask synth. about your training"
            className="block w-full resize-none bg-transparent text-[15px] outline-none placeholder:opacity-60"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font, minHeight: 24 }}
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              aria-label="Attach"
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ color: SYNTH.inkOnBrandMuted }}
            >
              <Plus size={18} strokeWidth={2.2} />
            </button>
            <span className="flex-1" />
            <button
              type="button"
              aria-label="Transcribe"
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ color: SYNTH.inkOnBrandMuted }}
            >
              <Mic size={18} strokeWidth={2} />
            </button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              aria-label={text.trim() ? 'Send' : 'Voice mode'}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: SYNTH.accentBlack,
                color: SYNTH.inkOnBrand,
                boxShadow: SYNTH.shadow.actionCircle,
              }}
            >
              {text.trim() ? <SendArrow /> : <AudioLines size={18} strokeWidth={2.2} />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DotMark() {
  const rings = [
    { r: 6, count: 1 },
    { r: 18, count: 8 },
    { r: 30, count: 12 },
    { r: 42, count: 18 },
  ]
  return (
    <svg width={108} height={108} viewBox="-54 -54 108 108" aria-hidden>
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
              r={ring.r === 6 ? 2.6 : 1.6}
              fill={ring.r === 6 ? SYNTH.accentEmerald : 'rgba(255,255,255,0.55)'}
            />
          )
        }),
      )}
    </svg>
  )
}

function SendArrow() {
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
