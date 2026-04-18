import { THEME } from '../../lib/theme'
import { useWritebackStore } from '../store/useWritebackStore'

/** Surfaces pending write-back intents (Sheets + timeline) for coach confirmation. */
export function WritebackConfirmBar() {
  const queue = useWritebackStore((s) => s.queue)
  const confirmAll = useWritebackStore((s) => s.confirmAll)
  const dismiss = useWritebackStore((s) => s.dismiss)

  if (queue.length === 0) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t px-4 py-3 shadow-lg md:left-[260px]"
      style={{
        background: THEME.white,
        borderColor: THEME.border,
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
      role="region"
      aria-label="Pending write-back actions"
    >
      <div className="mx-auto flex max-w-[960px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[12px]" style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
          <span style={{ color: THEME.primary }}>{queue.length}</span> pending write-back
          {queue.map((q) => (
            <div key={q.id} className="mt-1 flex items-center justify-between gap-2">
              <span style={{ color: THEME.textPrimary }}>{q.label}</span>
              <button
                type="button"
                className="text-[10px] uppercase tracking-wider"
                style={{ color: THEME.textMuted }}
                onClick={() => dismiss(q.id)}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{
              border: `1px solid ${THEME.border}`,
              color: THEME.textPrimary,
              fontFamily: THEME.fontMono,
            }}
            onClick={() => queue.forEach((q) => dismiss(q.id))}
          >
            Clear
          </button>
          <button
            type="button"
            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
            onClick={confirmAll}
          >
            Confirm all
          </button>
        </div>
      </div>
    </div>
  )
}
