import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUiStore } from '../store/useUiStore'
import { THEME } from '../../lib/theme'
import { useSources, useScanLogs, useAiImportJobs } from '../data/queries'
import { connectConnector } from '../data/connectors/connectorService'
import type { ConnectorProvider, Source, SourceType } from '../data/types'
import { featureFlags } from '../../lib/featureFlags'
import { useWritebackStore } from '../store/useWritebackStore'

type Tab = 'sources' | 'scans' | 'add'

const TAB_LABELS: Record<Tab, string> = {
  sources: 'Connected sources',
  scans: 'Scan history',
  add: 'Add connector',
}

const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  google_sheets: 'Google Sheets',
  google_drive: 'Google Drive',
  slack: 'Slack',
  teamworks: 'TeamWorks',
  wearable: 'Wearable hub',
  email_digest: 'Email digest',
  extension: 'Browser extension',
  manual_upload: 'Manual upload',
}

const STATUS_COLOR: Record<Source['status'], string> = {
  healthy: THEME.primary,
  stale: THEME.amber,
  failed: THEME.red,
  pending: THEME.textSecondary,
  disconnected: THEME.textMuted,
}

export function AgentModalPortal() {
  const open = useUiStore((s) => s.agentModalOpen)
  const close = useUiStore((s) => s.closeAgentModal)
  const [tab, setTab] = useState<Tab>('sources')

  return (
    <AnimatePresence>
      {open && (
        <AgentModalInner close={close} tab={tab} setTab={setTab} />
      )}
    </AnimatePresence>
  )
}

function AgentModalInner({
  close,
  tab,
  setTab,
}: {
  close: () => void
  tab: Tab
  setTab: (t: Tab) => void
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null)

  // Phase 19 — focus trap + focus restore. Captures the previously-focused
  // element on mount, auto-focuses the close button, and restores focus on
  // unmount. Tab/Shift+Tab cycle is trapped inside the dialog.
  useEffect(() => {
    const prev =
      typeof document !== 'undefined'
        ? (document.activeElement as HTMLElement | null)
        : null

    // Auto-focus the close button (first focusable inside the dialog)
    const timer = window.setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      first?.focus()
    }, 30)

    return () => {
      window.clearTimeout(timer)
      try {
        prev?.focus?.()
      } catch {
        /* element may have been removed */
      }
    }
  }, [])

  // Trap Tab inside the dialog
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const focusable = dialog!.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    dialog.addEventListener('keydown', onKeyDown)
    return () => dialog.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
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
        aria-label="synth Agent — connectors, AI import, sync"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative flex max-h-[86dvh] w-full max-w-[1080px] flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{ background: THEME.white, border: `1px solid ${THEME.border}` }}
      >
            <header
              className="flex items-start justify-between border-b px-6 py-4"
              style={{ borderColor: THEME.border }}
            >
              <div>
                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                >
                  synth. Agent
                </div>
                <h2 className="mt-0.5 text-[22px] font-semibold" style={{ color: THEME.textPrimary }}>
                  Connectors · import · sync
                </h2>
                <div
                  className="mt-1 text-[11px]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
                >
                  <AgentSubtitle />
                </div>
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

            <nav
              aria-label="Agent tabs"
              className="flex gap-1 border-b px-5 pt-3"
              style={{ borderColor: THEME.border }}
            >
              {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="relative px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors"
                  style={{
                    color: tab === t ? THEME.primary : THEME.textSecondary,
                    fontFamily: THEME.fontMono,
                  }}
                >
                  {TAB_LABELS[t]}
                  {tab === t && (
                    <motion.span
                      layoutId="agent-tab-bar"
                      className="absolute inset-x-3 bottom-0 h-0.5 rounded-full"
                      style={{ background: THEME.primary }}
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            <div className="synth-scroll flex-1 overflow-y-auto px-6 py-5">
              {tab === 'sources' && <SourcesTab />}
              {tab === 'scans' && <ScansTab />}
              {tab === 'add' && <AddSourceTab />}
            </div>
          </motion.div>
        </motion.div>
  )
}

function AgentSubtitle() {
  const { data: sources, isLoading: l1, isError: e1 } = useSources()
  const { data: scanLogs, isLoading: l2, isError: e2 } = useScanLogs()
  if (l1 || l2 || e1 || e2) return <>loading…</>
  return (
    <>
      {sources.length} connectors · {scanLogs.length} scans in history
    </>
  )
}

function SourcesTab() {
  const { data: sources, isLoading, isError } = useSources()
  if (isLoading || isError) return <div className="py-8 text-center text-[12px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>{isError ? 'Failed to load sources.' : 'Loading…'}</div>
  return (
    <div className="flex flex-col gap-2">
      {sources.map((s) => (
        <div
          key={s.id}
          className="flex items-center justify-between rounded-lg border px-4 py-3"
          style={{
            borderColor: THEME.border,
            background: THEME.light,
            borderLeft: `3px solid ${STATUS_COLOR[s.status]}`,
          }}
        >
          <div>
            <div
              className="text-[9px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              {SOURCE_TYPE_LABEL[s.type]}
            </div>
            <div
              className="mt-0.5 text-[14px] font-semibold"
              style={{ color: THEME.textPrimary }}
            >
              {s.name}
            </div>
            <div
              className="mt-0.5 text-[11px]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
            >
              {s.scheduleCron ?? 'real-time'} · last scan {relativeFromNow(s.lastScanAt)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                border: `1px solid ${THEME.border}`,
                background: THEME.white,
                color: THEME.textPrimary,
                fontFamily: THEME.fontMono,
              }}
            >
              Scan now
            </button>
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: `${STATUS_COLOR[s.status]}22`,
                color: STATUS_COLOR[s.status],
                fontFamily: THEME.fontMono,
              }}
            >
              {s.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ScansTab() {
  const { data: scanLogs, isLoading: l1, isError: e1 } = useScanLogs()
  const { data: sources, isLoading: l2, isError: e2 } = useSources()
  if (l1 || l2 || e1 || e2) return <div className="py-8 text-center text-[12px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>{e1 || e2 ? 'Failed to load scan history.' : 'Loading…'}</div>
  const chronological = [...scanLogs].sort(
    (a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime(),
  )
  return (
    <div className="flex flex-col gap-2">
      {chronological.map((log) => {
        const src = sources.find((s) => s.id === log.sourceId)
        const color = log.status === 'success' ? THEME.primary : log.status === 'partial' ? THEME.amber : THEME.red
        return (
          <div
            key={log.id}
            className="rounded-lg border p-4"
            style={{ borderColor: THEME.border, background: THEME.white }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                <div
                  className="text-[12px] font-semibold"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textPrimary }}
                >
                  {src?.name ?? log.sourceId}
                </div>
                <div
                  className="text-[10px]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
                >
                  {new Date(log.scannedAt).toUTCString().replace(' GMT', '')}
                </div>
              </div>
              <div
                className="flex gap-1 text-[10px] font-semibold"
                style={{ fontFamily: THEME.fontMono }}
              >
                <span style={{ color: THEME.primary }}>+{log.itemsAdded}</span>
                {log.itemsUpdated > 0 && <span style={{ color: THEME.cyan }}>~{log.itemsUpdated}</span>}
                {log.itemsRemoved > 0 && <span style={{ color: THEME.red }}>-{log.itemsRemoved}</span>}
              </div>
            </div>
            <details className="group mt-2">
              <summary
                className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: THEME.primary, fontFamily: THEME.fontMono }}
              >
                View report
              </summary>
              <pre
                className="mt-3 whitespace-pre-wrap rounded-lg border p-3 text-[11px] leading-relaxed"
                style={{
                  background: THEME.light,
                  borderColor: THEME.border,
                  color: THEME.textSecondary,
                  fontFamily: THEME.fontMono,
                }}
              >
                {log.reportMd}
              </pre>
            </details>
          </div>
        )
      })}
    </div>
  )
}

function AddSourceTab() {
  const [sub, setSub] = useState<'official' | 'aiImport' | 'manual'>('official')

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-1 flex flex-wrap gap-2">
        {(['official', 'aiImport', 'manual'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSub(key)}
            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors"
            style={{
              border: `1px solid ${sub === key ? THEME.primary : THEME.border}`,
              background: sub === key ? THEME.primary : THEME.white,
              color: sub === key ? THEME.white : THEME.textPrimary,
              fontFamily: THEME.fontMono,
            }}
          >
            {key === 'official' ? 'Official connectors' : key === 'aiImport' ? 'AI import' : 'Manual import'}
          </button>
        ))}
      </div>

      {sub === 'official' && <OfficialConnectorsFlow />}
      {sub === 'aiImport' && <AiImportFlow />}
      {sub === 'manual' && <ManualFlow />}

      <ExtensionWaitlistBanner />
    </div>
  )
}

function OfficialConnectorsFlow() {
  const [msg, setMsg] = useState<string | null>(null)
  const catalog: { provider: ConnectorProvider; name: string; detail: string }[] = [
    { provider: 'google_sheets', name: 'Google Sheets', detail: 'Two-way roster & erg workbooks' },
    { provider: 'google_calendar', name: 'Google Calendar', detail: 'Practice & academic load' },
    { provider: 'concept2_logbook', name: 'Concept2 Logbook', detail: 'Official erg history' },
    { provider: 'strava', name: 'Strava', detail: 'Activities + webhooks' },
    { provider: 'apple_health', name: 'Apple Health', detail: 'Sleep, HRV (via HealthKit)' },
    { provider: 'slack', name: 'Slack', detail: 'Parse channel posts' },
  ]

  async function onConnect(provider: ConnectorProvider) {
    setMsg(null)
    const r = await connectConnector(provider)
    setMsg(r.message)
  }

  return (
    <div>
      {msg && (
        <div className="mb-3 rounded-lg border px-3 py-2 text-[11px]" style={{ borderColor: THEME.border, fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
          {msg}
        </div>
      )}
      <div className="grid gap-2 md:grid-cols-2">
        {catalog.map((c) => (
          <div
            key={c.provider}
            className="flex items-start justify-between rounded-lg border p-4"
            style={{ background: THEME.light, borderColor: THEME.border }}
          >
            <div className="min-w-0 flex-1 pr-2">
              <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
                {c.name}
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary }}>
                {c.detail}
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                border: `1px solid ${THEME.primary}`,
                background: THEME.primary,
                color: THEME.white,
                fontFamily: THEME.fontMono,
              }}
              onClick={() => onConnect(c.provider)}
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function AiImportFlow() {
  const enqueue = useWritebackStore((s) => s.enqueue)
  const { data: jobs } = useAiImportJobs()

  function run(kind: 'photo' | 'voice' | 'paste') {
    if (!featureFlags.aiImport) return
    enqueue({
      label: `AI import (${kind})`,
      destination: 'timeline',
      payloadSummary: 'Preview → confirm pipeline (server-side models)',
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 sm:grid-cols-3">
        {(
          [
            ['photo', 'Photo / screenshot', 'Claude Vision extracts tables, splits, names.'],
            ['voice', 'Voice note', 'Whisper → structure → review.'],
            ['paste', 'Paste text', 'Parse raw text from email or chat.'],
          ] as const
        ).map(([k, title, detail]) => (
          <button
            key={k}
            type="button"
            className="rounded-xl border p-4 text-left transition-colors hover:bg-zinc-50"
            style={{ borderColor: THEME.border, background: THEME.white }}
            onClick={() => run(k)}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
              {title}
            </div>
            <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
              {detail}
            </div>
          </button>
        ))}
      </div>
      {jobs.length > 0 && (
        <div className="rounded-lg border p-3 text-[11px]" style={{ borderColor: THEME.border, fontFamily: THEME.fontMono, color: THEME.textSecondary }}>
          Recent jobs: {jobs.map((j) => j.previewSummary ?? j.kind).join(' · ')}
        </div>
      )}
    </div>
  )
}

function ExtensionWaitlistBanner() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div
      className="rounded-xl border border-dashed p-4 opacity-90"
      style={{ borderColor: THEME.border, background: THEME.light }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
        Browser extension — coming soon
      </div>
      <p className="mt-2 text-[12px]" style={{ color: THEME.textSecondary }}>
        Connect any web app on a schedule. Until then, use AI import for screenshots and voice — same intelligence, no
        install.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="coach@school.edu"
          className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-[13px] outline-none"
          style={{ borderColor: THEME.border, fontFamily: THEME.fontMono, color: THEME.textPrimary }}
          aria-label="Email for extension waitlist"
        />
        <button
          type="button"
          disabled={sent || !email.includes('@')}
          className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider disabled:opacity-40"
          style={{
            background: sent ? THEME.border : THEME.primary,
            color: THEME.white,
            fontFamily: THEME.fontMono,
          }}
          onClick={() => setSent(true)}
        >
          {sent ? 'On the list' : 'Join waitlist'}
        </button>
      </div>
    </div>
  )
}

function ManualFlow() {
  return (
    <div>
      <div
        className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed text-center"
        style={{ borderColor: THEME.border, background: THEME.light }}
      >
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
        >
          Drag &amp; drop
        </div>
        <div className="mt-2 max-w-[380px] text-[13px]" style={{ color: THEME.textSecondary }}>
          Drop CSVs, Excel workbooks, or screenshots here. synth. parses and previews before committing anything to the
          roster.
        </div>
        <button
          type="button"
          className="mt-4 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider"
          style={{
            background: THEME.white,
            color: THEME.primary,
            border: `1px solid ${THEME.primary}`,
            fontFamily: THEME.fontMono,
          }}
        >
          Browse files
        </button>
      </div>
    </div>
  )
}

function relativeFromNow(iso?: string) {
  if (!iso) return '—'
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 60) return `${mins}m ago`
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`
  return `${Math.round(mins / 60 / 24)}d ago`
}
