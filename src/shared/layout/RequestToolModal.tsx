import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { THEME } from '../../lib/theme'
import { useUiStore } from '../store/useUiStore'

export function RequestToolModal() {
  const open = useUiStore((s) => s.requestToolOpen)
  const close = useUiStore((s) => s.closeRequestTool)

  return <AnimatePresence>{open && <RequestToolInner close={close} />}</AnimatePresence>
}

function RequestToolInner({ close }: { close: () => void }) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [name, setName] = useState('')
  const [useCase, setUseCase] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  useEffect(() => {
    const prev =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null
    const t = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    }, 30)
    return () => {
      window.clearTimeout(t)
      try {
        prev?.focus?.()
      } catch {
        /* no-op */
      }
    }
  }, [])

  const canSubmit = name.trim().length > 0 && useCase.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitted(true)
    window.setTimeout(() => {
      close()
      setSubmitted(false)
      setName('')
      setUseCase('')
    }, 1400)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Request a custom tool"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative flex w-full max-w-[480px] flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{ background: 'var(--bg-primary)', border: `1px solid ${THEME.border}` }}
      >
        <header
          className="flex items-start justify-between border-b px-5 py-4"
          style={{ borderColor: THEME.border }}
        >
          <div>
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              Custom tools
            </div>
            <h2 className="mt-0.5 text-[18px] font-semibold" style={{ color: THEME.textPrimary }}>
              Request a tool
            </h2>
            <p
              className="mt-1 text-[11px]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
            >
              Describe a tool your program needs — we'll evaluate for the registry.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-[var(--bg-surface)]"
            style={{ borderColor: THEME.border, color: THEME.textPrimary }}
          >
            ✕
          </button>
        </header>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'rgba(5,150,105,0.12)', color: THEME.primary }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12l4 4L19 7" />
              </svg>
            </div>
            <div className="text-[14px] font-semibold" style={{ color: THEME.textPrimary }}>
              Request received
            </div>
            <div
              className="text-[11px]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
            >
              We'll be in touch about "{name.trim()}".
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
            <label className="flex flex-col gap-1.5">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
              >
                Tool name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Race plan builder"
                className="rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors focus:border-[var(--color-primary,#059669)]"
                style={{
                  borderColor: THEME.border,
                  background: 'var(--bg-primary)',
                  color: THEME.textPrimary,
                  fontFamily: THEME.fontSans,
                }}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
              >
                What would you use it for?
              </span>
              <textarea
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                rows={4}
                placeholder="One paragraph on the workflow this would replace or unlock."
                className="resize-y rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors focus:border-[var(--color-primary,#059669)]"
                style={{
                  borderColor: THEME.border,
                  background: 'var(--bg-primary)',
                  color: THEME.textPrimary,
                  fontFamily: THEME.fontSans,
                }}
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={close}
                className="rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-[var(--bg-surface)]"
                style={{
                  borderColor: THEME.border,
                  color: THEME.textSecondary,
                  fontFamily: THEME.fontMono,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-opacity"
                style={{
                  background: THEME.primaryDarker,
                  color: THEME.white,
                  fontFamily: THEME.fontMono,
                  opacity: canSubmit ? 1 : 0.45,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                Send request
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}
