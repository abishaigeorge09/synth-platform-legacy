import { AnimatePresence, motion } from 'framer-motion'
import { useUiStore } from '../store/useUiStore'
import { THEME } from '../../lib/theme'
import { SEED_SOURCES } from '../data/seeds'

/**
 * Placeholder portal for the synth. Agent modal. Phase 4 will build the full
 * connected-sources list, scan history, and add-source flow inside this shell.
 */
export function AgentModalPortal() {
  const open = useUiStore((s) => s.agentModalOpen)
  const close = useUiStore((s) => s.closeAgentModal)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(12,10,9,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative flex max-h-[86dvh] w-full max-w-[1080px] flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: THEME.white, border: `1px solid ${THEME.border}` }}
          >
            <header className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: THEME.border }}>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
                  synth. Agent
                </div>
                <h2 className="mt-0.5 text-[22px] font-semibold" style={{ color: THEME.textPrimary }}>
                  Connectors · scans · reports
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-zinc-50"
                style={{ borderColor: THEME.border, color: THEME.textPrimary }}
                aria-label="Close"
              >
                ✕
              </button>
            </header>
            <div className="synth-scroll flex-1 overflow-y-auto px-6 py-6">
              <p className="mb-4 text-[13px] leading-relaxed" style={{ color: THEME.textSecondary }}>
                Phase 4 will flesh out the full agent portal: connected sources list, chronological scan history with MD
                reports, and the add-source flow (Extension / Connectors / Manual). For now, here's the seeded source list
                so the shell is usable.
              </p>
              <div className="flex flex-col gap-2">
                {SEED_SOURCES.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                    style={{ borderColor: THEME.border, background: THEME.light }}
                  >
                    <div>
                      <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                        {s.name}
                      </div>
                      <div className="text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
                        {s.type} · {s.scheduleCron ?? 'real-time'}
                      </div>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        background: s.status === 'healthy' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: s.status === 'healthy' ? THEME.primary : THEME.amber,
                      }}
                    >
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
