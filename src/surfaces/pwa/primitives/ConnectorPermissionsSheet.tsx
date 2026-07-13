import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { ConnectorLogo } from './ConnectorLogo'
import { SYNTH } from '../lib/theme'
import { COACH_CONNECTORS } from '../data/mockConnectors'
import { useSourcesStore } from '../data/useSourcesStore'

type Props = {
  open: boolean
  onClose: () => void
  /** Connector id (matches `ConnectorMock.id`). */
  sourceId: string | null
}

/**
 * Tools-permissions sheet. Bottom sheet ~78dvh, dark cobalt — intentionally
 * departs from synth's normal white sheet because the user wants this
 * (and only this) sheet to feel like the iOS-native connector permissions
 * screens (Airtable / Notion / Figma in Claude's app). All other sheets
 * stay white.
 *
 * Behaviour:
 *  - "All tools" master toggle flips every tool on/off in lockstep.
 *  - Each per-tool row toggles independently.
 *  - Disconnect link at the bottom (small, faded) — keeps the action
 *    reachable without making it the headline.
 */
export function ConnectorPermissionsSheet({ open, onClose, sourceId }: Props) {
  const meta = sourceId ? COACH_CONNECTORS.find((c) => c.id === sourceId) ?? null : null
  const src = useSourcesStore((s) => (sourceId ? s.sources[sourceId] : undefined))
  const toggleTool = useSourcesStore((s) => s.toggleTool)
  const setAllTools = useSourcesStore((s) => s.setAllTools)
  const disconnect = useSourcesStore((s) => s.disconnect)

  const allOn = src ? Object.values(src.enabledTools).every(Boolean) : false

  return (
    <AnimatePresence>
      {open && meta && src ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
          />
          <motion.div
            initial={{ y: 800 }}
            animate={{ y: 0 }}
            exit={{ y: 800 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-[70] flex flex-col overflow-hidden"
            style={{
              background: '#1A1F3A',
              borderRadius: '28px 28px 0 0',
              height: '82dvh',
              color: '#FFFFFF',
              fontFamily: SYNTH.font,
              boxShadow: '0 -16px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drag affordance + sticky header */}
            <header className="relative flex shrink-0 items-center justify-center px-5 pt-5 pb-3">
              <div
                className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF' }}
              >
                <ChevronLeft size={18} strokeWidth={2.4} />
              </button>
              <span
                className="text-[18px] font-bold"
                style={{ color: '#FFFFFF', fontFamily: SYNTH.font }}
              >
                {meta.name}
              </span>
            </header>

            {/* Scrollable body */}
            <div className="synth-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-2">
              {/* All tools — master row */}
              <button
                type="button"
                onClick={() => setAllTools(meta.id, !allOn)}
                className="flex w-full items-center justify-between py-4 text-left"
              >
                <span
                  className="text-[16px] font-semibold"
                  style={{ color: '#FFFFFF', fontFamily: SYNTH.font }}
                >
                  All tools
                </span>
                <Toggle on={allOn} />
              </button>

              <div
                className="my-1 h-px"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />

              {/* Per-tool rows */}
              <div className="flex flex-col">
                {meta.tools.map((tool) => {
                  const on = src.enabledTools[tool.id] ?? false
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => toggleTool(meta.id, tool.id)}
                      className="flex w-full items-center gap-3 py-3 text-left"
                    >
                      <ConnectorLogo id={meta.id} size={28} />
                      <span
                        className="flex-1 text-[15px] font-medium"
                        style={{ color: '#FFFFFF', fontFamily: SYNTH.font }}
                      >
                        {tool.label}
                      </span>
                      <Toggle on={on} />
                    </button>
                  )
                })}
              </div>

              {/* Disconnect — faded text link, keeps the action reachable
                  without making it the headline. */}
              <div className="mt-6 flex items-center justify-center pb-2">
                <button
                  type="button"
                  onClick={() => {
                    disconnect(meta.id)
                    onClose()
                  }}
                  className="text-[13px] font-medium"
                  style={{ color: 'rgba(255,255,255,0.45)', fontFamily: SYNTH.font }}
                >
                  Disconnect {meta.name}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className="relative inline-flex h-[30px] w-[50px] shrink-0 items-center rounded-full transition-colors"
      style={{ background: on ? '#3B82F6' : 'rgba(255,255,255,0.18)' }}
    >
      <motion.span
        className="absolute h-[26px] w-[26px] rounded-full"
        animate={{ left: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 700, damping: 40 }}
        style={{
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }}
      />
    </span>
  )
}
