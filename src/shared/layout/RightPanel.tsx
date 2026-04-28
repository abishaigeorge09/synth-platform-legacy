import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEME } from '../../lib/theme'
import { useRightPanelStore } from '../store/useRightPanelStore'
import { useAthletes } from '../data/queries'
import { useAthleteProfileSessions } from '../data/queries'
import { ChatView } from '../../features/coach/ai/ChatView'

// ─── helpers ──────────────────────────────────────────────────────────────────

function splitToSeconds(split: string): number {
  const parts = split.split(':')
  if (parts.length !== 2) return NaN
  const m = parseFloat(parts[0])
  const s = parseFloat(parts[1])
  return m * 60 + s
}

function fmtSplit(totalSecs: number): string {
  if (!Number.isFinite(totalSecs)) return '—'
  const m = Math.floor(totalSecs / 60)
  const s = (totalSecs - m * 60).toFixed(1).padStart(4, '0')
  return `${m}:${s}`
}

// ─── Session compare panel ─────────────────────────────────────────────────

function SessionDetail({
  athleteId,
  sessionId,
}: {
  athleteId: string
  sessionId?: string
}) {
  const { data: sessions } = useAthleteProfileSessions(athleteId)
  const session = useMemo(
    () => sessions.find((s) => s.id === sessionId),
    [sessions, sessionId],
  )

  if (!sessionId || !session) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center rounded-xl border p-6 text-center"
        style={{
          borderColor: THEME.border,
          background: 'var(--bg-primary)',
          borderStyle: 'dashed',
        }}
      >
        <div
          className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          No session selected
        </div>
        <div
          className="text-[12px]"
          style={{ color: THEME.textSecondary }}
        >
          Click a data point on the split trend chart to load a session here.
        </div>
      </div>
    )
  }

  const splitSecs = session.splits.map(splitToSeconds).filter(Number.isFinite)
  const avgSplit = splitSecs.length
    ? splitSecs.reduce((a, b) => a + b, 0) / splitSecs.length
    : NaN
  const bestSplit = splitSecs.length ? Math.min(...splitSecs) : NaN

  return (
    <div
      className="flex flex-1 flex-col gap-3 rounded-xl border p-4"
      style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}
    >
      {/* Date + session label */}
      <div>
        <div
          className="text-[9px] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {session.date}
        </div>
        <div
          className="mt-0.5 text-[14px] font-semibold"
          style={{ color: THEME.textPrimary }}
        >
          {session.title}
        </div>
      </div>

      {/* Boat + seat chips */}
      <div className="flex flex-wrap gap-1.5">
        <Chip label="Boat" value={session.boat} />
        <Chip label="Seat" value={`#${session.seat}`} />
      </div>

      {/* Splits */}
      <div>
        <div
          className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          Splits /500m
        </div>
        <div className="flex flex-wrap gap-1">
          {session.splits.map((sp, i) => (
            <span
              key={i}
              className="rounded-full border px-2.5 py-1 text-[11px]"
              style={{
                fontFamily: THEME.fontMono,
                borderColor: THEME.border,
                background: 'var(--bg-surface)',
                color: THEME.textPrimary,
              }}
            >
              {sp}
            </span>
          ))}
        </div>
      </div>

      {/* Avg / best */}
      <div className="mt-auto flex gap-3 border-t pt-3" style={{ borderColor: THEME.border }}>
        <Stat label="Avg /500" value={fmtSplit(avgSplit)} color={THEME.primary} />
        <Stat label="Best /500" value={fmtSplit(bestSplit)} color={THEME.cyan} />
      </div>
    </div>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]"
      style={{
        fontFamily: THEME.fontMono,
        borderColor: THEME.border,
        background: 'var(--bg-surface)',
        color: THEME.textSecondary,
      }}
    >
      <span style={{ color: THEME.textMuted }}>{label}</span>
      <span style={{ color: THEME.textPrimary }}>{value}</span>
    </span>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {label}
      </div>
      <div
        className="text-[16px] font-semibold"
        style={{ fontFamily: THEME.fontMono, color }}
      >
        {value}
      </div>
    </div>
  )
}

function CompareMode({
  athleteId,
  leftSessionId,
  rightSessionId,
}: {
  athleteId: string
  leftSessionId?: string
  rightSessionId?: string
}) {
  // Compute split delta between left and right sessions
  const { data: sessions } = useAthleteProfileSessions(athleteId)
  const leftSession = useMemo(
    () => sessions.find((s) => s.id === leftSessionId),
    [sessions, leftSessionId],
  )
  const rightSession = useMemo(
    () => sessions.find((s) => s.id === rightSessionId),
    [sessions, rightSessionId],
  )

  const delta = useMemo(() => {
    if (!leftSession || !rightSession) return null
    const leftAvg = (() => {
      const secs = leftSession.splits.map(splitToSeconds).filter(Number.isFinite)
      return secs.length ? secs.reduce((a, b) => a + b, 0) / secs.length : NaN
    })()
    const rightAvg = (() => {
      const secs = rightSession.splits.map(splitToSeconds).filter(Number.isFinite)
      return secs.length ? secs.reduce((a, b) => a + b, 0) / secs.length : NaN
    })()
    if (!Number.isFinite(leftAvg) || !Number.isFinite(rightAvg)) return null
    return rightAvg - leftAvg // positive = right is slower
  }, [leftSession, rightSession])

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      {/* Delta banner */}
      {delta !== null && (
        <div
          className="flex items-center justify-between rounded-xl border px-4 py-3"
          style={{
            borderColor: delta <= 0 ? THEME.primary : THEME.red,
            background: delta <= 0 ? `${THEME.primary}0A` : `${THEME.red}0A`,
          }}
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
          >
            Avg split delta
          </span>
          <span
            className="text-[18px] font-semibold"
            style={{
              fontFamily: THEME.fontMono,
              color: delta <= 0 ? THEME.primary : THEME.red,
            }}
          >
            {delta <= 0 ? '▲' : '▼'} {fmtSplit(Math.abs(delta))}
          </span>
        </div>
      )}

      {/* Two column sessions */}
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
          >
            Session A
          </div>
          <SessionDetail athleteId={athleteId} sessionId={leftSessionId} />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: THEME.fontMono, color: THEME.cyan }}
          >
            Session B
          </div>
          <SessionDetail athleteId={athleteId} sessionId={rightSessionId} />
        </div>
      </div>

      {!rightSessionId && (
        <div
          className="rounded-xl border px-4 py-3 text-[12px]"
          style={{
            borderColor: THEME.border,
            background: 'var(--bg-primary)',
            color: THEME.textSecondary,
          }}
        >
          Click a second data point on the chart to select Session B and compare splits side by side.
        </div>
      )}
    </div>
  )
}

// ─── Main RightPanel ──────────────────────────────────────────────────────────

export function RightPanel() {
  const open = useRightPanelStore((s) => s.open)
  const mode = useRightPanelStore((s) => s.mode)
  const athleteId = useRightPanelStore((s) => s.athleteId)
  const leftSessionId = useRightPanelStore((s) => s.leftSessionId)
  const rightSessionId = useRightPanelStore((s) => s.rightSessionId)
  const close = useRightPanelStore((s) => s.close)

  const { data: athletes } = useAthletes()
  const athlete = useMemo(
    () => athletes.find((a) => a.id === athleteId),
    [athletes, athleteId],
  )
  const athleteName = athlete?.name ?? ''
  const firstName = athleteName.split(' ')[0]

  const panelTitle = mode === 'compare' ? 'Session Compare' : 'Athlete AI'

  const suggestions = useMemo(
    () =>
      firstName
        ? [
            `How is ${firstName} trending?`,
            `What's their recovery score?`,
            `Lineup recommendation for ${firstName}?`,
            `Flag any concerns with ${firstName}?`,
          ]
        : [
            "How is this athlete trending?",
            "What's their recovery score?",
            "Any lineup recommendations?",
            "Flag any concerns?",
          ],
    [firstName],
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="rp-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={close}
            aria-hidden
          />

          {/* Drawer */}
          <motion.div
            key="rp-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32, mass: 0.9 }}
            className="fixed bottom-0 right-0 top-0 z-[61] flex flex-col"
            style={{
              width: 'min(420px, 100vw)',
              background: 'var(--bg-surface)',
              borderLeft: `1px solid ${THEME.border}`,
              boxShadow: '-8px 0 40px rgba(0,0,0,0.10)',
            }}
          >
            {/* Header */}
            <div
              className="flex shrink-0 items-center justify-between border-b px-4 py-3"
              style={{ borderColor: THEME.border }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: THEME.primary }}
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
                >
                  {panelTitle}
                </span>
                {athleteName && (
                  <span
                    className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      fontFamily: THEME.fontMono,
                      borderColor: THEME.primary,
                      color: THEME.primary,
                      background: `${THEME.primary}0A`,
                    }}
                  >
                    {firstName}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close panel"
                className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-zinc-100"
                style={{ color: THEME.textSecondary }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {mode === 'chat' && athleteId && (
                <div className="synth-scroll flex-1 overflow-y-auto">
                  <ChatView
                    scope="athlete"
                    scopedAthleteId={athleteId}
                    scopedAthleteName={athleteName}
                    kicker="Athlete AI"
                    title={`Ask about ${firstName || 'Athlete'}`}
                    subtitle="Scoped to this athlete's data"
                    suggestions={suggestions}
                  />
                </div>
              )}

              {mode === 'compare' && athleteId && (
                <CompareMode
                  athleteId={athleteId}
                  leftSessionId={leftSessionId}
                  rightSessionId={rightSessionId}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
