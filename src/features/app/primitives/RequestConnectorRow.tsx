import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Send } from 'lucide-react'
import { SYNTH } from '../lib/theme'

/**
 * Sits at the bottom of the connectors list. Tap to expand into a small
 * inline form: name + optional context, Submit. Settles into a "Thanks,
 * we'll add it" success state with a check.
 */
export function RequestConnectorRow() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [context, setContext] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    if (!name.trim()) return
    // Stub: in real flow this would POST to /api/connector-requests.
    setSubmitted(true)
    setName('')
    setContext('')
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="flex w-full items-center gap-3 rounded-2xl border px-4 py-4"
        style={{
          background: 'rgba(16,185,129,0.18)',
          border: `1px solid ${SYNTH.accentEmerald}55`,
        }}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: SYNTH.accentEmerald }}
        >
          <Check size={18} color={SYNTH.inkOnBrand} strokeWidth={3} />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-[14px] font-semibold"
            style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
          >
            Got it — we'll add it.
          </p>
          <p
            className="mt-0.5 text-[12px]"
            style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
          >
            We'll email you when it's ready.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="rounded-2xl border-2 border-dashed"
      style={{
        background: SYNTH.glass,
        backdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        WebkitBackdropFilter: `blur(${SYNTH.glassBlur}px) saturate(${SYNTH.glassSaturate}%)`,
        borderColor: 'rgba(255,255,255,0.32)',
      }}
    >
      {!open ? (
        <motion.button
          type="button"
          whileTap={{ scale: 0.99 }}
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-4 text-left"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.22)',
            }}
          >
            <Plus size={18} color={SYNTH.inkOnBrand} strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="text-[14px] font-semibold"
              style={{ color: SYNTH.inkOnBrand, fontFamily: SYNTH.font }}
            >
              Don't see your tool?
            </p>
            <p
              className="mt-0.5 text-[12px]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              Request a connector — we'll wire it up.
            </p>
          </div>
        </motion.button>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2.5 px-4 py-4"
          >
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
            >
              Request a connector
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tool name (e.g. Trainerize)"
              className="w-full rounded-xl border px-3 py-3 text-[14px] outline-none placeholder:text-white/35 focus:border-[var(--app-emerald)]"
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderColor: SYNTH.glassBorder,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                ['--app-emerald' as never]: SYNTH.accentEmerald,
              }}
            />
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="What does it track? (optional)"
              className="w-full rounded-xl border px-3 py-3 text-[13px] outline-none placeholder:text-white/35 focus:border-[var(--app-emerald)]"
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderColor: SYNTH.glassBorder,
                color: SYNTH.inkOnBrand,
                fontFamily: SYNTH.font,
                ['--app-emerald' as never]: SYNTH.accentEmerald,
              }}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setName('')
                  setContext('')
                }}
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
                style={{ color: SYNTH.inkOnBrandMuted, fontFamily: SYNTH.font }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!name.trim()}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold disabled:opacity-40"
                style={{
                  background: SYNTH.accentEmerald,
                  color: SYNTH.inkOnBrand,
                  fontFamily: SYNTH.font,
                }}
              >
                <Send size={12} strokeWidth={2.4} />
                Send
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}
