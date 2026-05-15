import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useUiStore } from '../store/useUiStore'
import { THEME } from '../../lib/theme'
import { useSources, useScanLogs, useAiImportJobs } from '../data/queries'
import { connectConnector } from '../data/connectors/connectorService'
import type {
  ConnectorProvider,
  IngestionPreview,
  Source,
  SourceType,
} from '../data/types'
import { toast } from '../store/useToastStore'
import { useTeamStore } from '../store/useTeamStore'
import { useConnectorConnectionsStore } from '../store/useConnectorConnectionsStore'
import { useCoachOnboardingStore } from '../store/useCoachOnboardingStore'
import { useAthleteOnboardingStore } from '../store/useAthleteOnboardingStore'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import {
  classifyFile,
  requestParse,
  uploadAndParse,
} from '../../lib/ingest/uploadClient'
import {
  fetchSheetAsUpload,
  initiateSheetsConnect,
  SHEETS_CONNECT_PARAM,
  SHEETS_CONNECT_VALUE,
} from '../../lib/ingest/sheetsClient'
import {
  disableHealthWebhook,
  enableHealthWebhook,
  getHealthConnector,
  SAMPLE_SHORTCUT_BODY,
  type HealthConnectorSummary,
} from '../../lib/ingest/healthWebhookClient'
import { IngestionPreviewPanel } from '../../features/coach/agent/IngestionPreviewPanel'

type Tab = 'sources' | 'scans' | 'add'

const TAB_LABELS: Record<Tab, string> = {
  add: 'Add connector',
  sources: 'Connected sources',
  scans: 'Scan history',
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

  return (
    <AnimatePresence>
      {open && (
        <AgentModalInner close={close} />
      )}
    </AnimatePresence>
  )
}

function AgentModalInner({ close }: { close: () => void }) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  // Select primitives to avoid unstable object snapshots (can cause infinite loops).
  const coachTeam = useCoachOnboardingStore((s) => s.team)
  const coachCsvUploaded = useCoachOnboardingStore((s) => s.csvUploaded)
  const coachSourcesConnected = useCoachOnboardingStore((s) => s.sourcesConnected)
  const athleteConfirmed = useAthleteOnboardingStore((s) => s.confirmed)
  const athleteProfileName = useAthleteOnboardingStore((s) => s.profileName)
  const [tab, setTab] = useState<Tab>('add')

  const hideHistory = useMemo(() => {
    const p = location.pathname
    // During onboarding/auth flows: hide history + connected sources.
    if (p.startsWith('/coach/onboarding')) return true
    if (p.startsWith('/athlete/onboarding')) return true
    if (p.startsWith('/signup')) return true
    if (p.startsWith('/join')) return true

    // After coach onboarding, only show history once roster CSV is uploaded and sources step has been reached.
    if (coachTeam && (!coachCsvUploaded || !coachSourcesConnected)) return true

    // After athlete onboarding starts, keep history hidden until profile is set.
    if (athleteConfirmed && !athleteProfileName.trim()) return true

    return false
  }, [location.pathname, coachTeam, coachCsvUploaded, coachSourcesConnected, athleteConfirmed, athleteProfileName])

  const tabs = useMemo(() => (hideHistory ? (['add'] as Tab[]) : (Object.keys(TAB_LABELS) as Tab[])), [hideHistory])
  const effectiveTab: Tab = hideHistory ? 'add' : tab

  // Lifted ingestion preview state. When non-null, the modal body
  // swaps the tab grid for the preview-and-confirm UI. Owned here
  // (rather than inside AddSourceTab) so the user can close the modal
  // mid-review and the preview disappears cleanly.
  const [ingestionPreview, setIngestionPreview] = useState<IngestionPreview | null>(null)

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
        style={{ background: 'var(--bg-primary)', border: `1px solid ${THEME.border}` }}
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
                  Connectors & sync
                </h2>
                <div
                  className="mt-1 text-[11px]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
                >
                  {!hideHistory ? <AgentSubtitle /> : <>Connect sources first — history appears after onboarding.</>}
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[var(--bg-surface)]"
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
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="relative px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors"
                  style={{
                    color: effectiveTab === t ? THEME.primary : THEME.textSecondary,
                    fontFamily: THEME.fontMono,
                  }}
                >
                  {TAB_LABELS[t]}
                  {effectiveTab === t && (
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
              {ingestionPreview ? (
                <IngestionPreviewPanel
                  preview={ingestionPreview}
                  onDone={() => setIngestionPreview(null)}
                  onCancel={() => setIngestionPreview(null)}
                />
              ) : (
                <>
                  {effectiveTab === 'add' && (
                    <AddSourceTab onUploaded={setIngestionPreview} />
                  )}
                  {!hideHistory && effectiveTab === 'sources' && <SourcesTab />}
                  {!hideHistory && effectiveTab === 'scans' && <ScansTab />}
                </>
              )}
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
      {sources.length} connectors, {scanLogs.length} scans
    </>
  )
}

function SourcesTab() {
  const { data: sources, isLoading, isError } = useSources()
  const [scanning, setScanning] = useState<Record<string, 'scanning' | 'done'>>({})

  const triggerScan = useCallback((sourceId: string, sourceName: string) => {
    if (scanning[sourceId]) return
    setScanning((p) => ({ ...p, [sourceId]: 'scanning' }))
    const dur = 1200 + Math.random() * 800
    window.setTimeout(() => {
      setScanning((p) => ({ ...p, [sourceId]: 'done' }))
      toast(`${sourceName} — scan complete`, 'success')
      window.setTimeout(() => {
        setScanning((p) => {
          const next = { ...p }
          delete next[sourceId]
          return next
        })
      }, 2000)
    }, dur)
  }, [scanning])

  if (isLoading || isError) return <div className="py-8 text-center text-[12px]" style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>{isError ? 'Failed to load sources.' : 'Loading…'}</div>
  return (
    <div className="flex flex-col gap-2">
      {sources.map((s) => {
        const state = scanning[s.id]
        return (
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
                disabled={!!state}
                onClick={() => triggerScan(s.id, s.name)}
                className="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all disabled:opacity-70"
                style={{
                  border: `1px solid ${state === 'done' ? THEME.primary : THEME.border}`,
                  background: state === 'done' ? THEME.primary : 'var(--bg-primary)',
                  color: state === 'done' ? THEME.white : THEME.textPrimary,
                  fontFamily: THEME.fontMono,
                }}
              >
                {state === 'scanning' && (
                  <motion.span
                    className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-2 border-t-transparent"
                    style={{ borderColor: `${THEME.primary}`, borderTopColor: 'transparent' }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
                  />
                )}
                {state === 'scanning' ? 'Scanning…' : state === 'done' ? 'Done ✓' : 'Scan now'}
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
        )
      })}
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
            style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}
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

function AddSourceTab({
  onUploaded,
}: {
  onUploaded: (preview: IngestionPreview) => void
}) {
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
              background: sub === key ? THEME.primary : 'var(--bg-primary)',
              color: sub === key ? THEME.white : THEME.textPrimary,
              fontFamily: THEME.fontMono,
            }}
          >
            {key === 'official' ? 'Official connectors' : key === 'aiImport' ? 'AI import' : 'Manual import'}
          </button>
        ))}
      </div>

      {sub === 'official' && <OfficialConnectorsFlow onUploaded={onUploaded} />}
      {sub === 'aiImport' && <AiImportFlow onUploaded={onUploaded} />}
      {sub === 'manual' && <ManualFlow onUploaded={onUploaded} />}

      <ExtensionWaitlistBanner />
    </div>
  )
}

function OfficialConnectorsFlow({
  onUploaded,
}: {
  onUploaded: (preview: IngestionPreview) => void
}) {
  const teamId = useTeamStore((s) => s.activeTeam.id)
  const isRealTeam = useTeamStore((s) => s.isRealTeam)
  const isConnected = useConnectorConnectionsStore((s) => s.isConnected)
  const connect = useConnectorConnectionsStore((s) => s.connect)
  const markCoachSourcesConnected = useCoachOnboardingStore((s) => s.setSourcesConnected)
  const catalog: { provider: ConnectorProvider; name: string; detail: string }[] = [
    { provider: 'google_sheets', name: 'Google Sheets', detail: 'Two-way roster & erg workbooks' },
    { provider: 'google_calendar', name: 'Google Calendar', detail: 'Practice & academic load' },
    { provider: 'concept2_logbook', name: 'Concept2 Logbook', detail: 'Official erg history' },
    { provider: 'strava', name: 'Strava', detail: 'Activities + webhooks' },
    { provider: 'apple_health', name: 'Apple Health', detail: 'Sleep, HRV (via HealthKit)' },
    { provider: 'slack', name: 'Slack', detail: 'Parse channel posts' },
  ]

  async function onConnect(provider: ConnectorProvider) {
    if (isConnected(teamId, provider)) return
    if (provider === 'google_sheets' || provider === 'apple_health') {
      // Real backed-by-Supabase flows. Each row owns its own connect UI.
      return
    }
    const r = await connectConnector(provider)
    if (r.ok) {
      connect(teamId, provider)
      markCoachSourcesConnected(true)
    }
    toast(r.message, r.ok ? 'success' : 'error')
  }

  return (
    <div>
      <div className="grid gap-2 md:grid-cols-2">
        {catalog.map((c) => {
          if (c.provider === 'google_sheets') {
            return (
              <SheetsConnectorRow
                key={c.provider}
                detail={c.detail}
                onUploaded={onUploaded}
                disabled={!isRealTeam}
              />
            )
          }
          if (c.provider === 'apple_health') {
            return (
              <AppleHealthConnectorRow
                key={c.provider}
                detail={c.detail}
                disabled={!isRealTeam}
              />
            )
          }
          const connected = isConnected(teamId, c.provider)
          return (
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
                disabled={connected}
                className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider disabled:opacity-60"
                style={{
                  border: `1px solid ${connected ? THEME.border : THEME.primary}`,
                  background: connected ? 'var(--bg-primary)' : THEME.primary,
                  color: connected ? THEME.textSecondary : THEME.white,
                  fontFamily: THEME.fontMono,
                }}
                onClick={() => onConnect(c.provider)}
              >
                {connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Real Google Sheets connector row. Three visible states:
 *   - Disconnected: a single "Connect" button kicks off OAuth.
 *   - Connected, no sheet picked yet: a URL input + "Sync sheet" button.
 *   - Syncing: spinner.
 * The URL is parsed server-side, so any standard sheets URL works.
 *
 * Connection state is detected by reading a query param the OAuth
 * redirect-back left behind (?connect=google_sheets). On first render
 * after a redirect we capture the provider tokens out of the session and
 * post them to sheets-sync, then strip the param from the URL.
 */
function SheetsConnectorRow({
  detail,
  onUploaded,
  disabled,
}: {
  detail: string
  onUploaded: (preview: IngestionPreview) => void
  disabled: boolean
}) {
  const teamId = useTeamStore((s) => s.activeTeam.id)
  const isConnectedLocally = useConnectorConnectionsStore((s) => s.isConnected)
  const connectLocally = useConnectorConnectionsStore((s) => s.connect)
  const markCoachSourcesConnected = useCoachOnboardingStore((s) => s.setSourcesConnected)
  const [busy, setBusy] = useState<false | 'connecting' | 'completing' | 'syncing'>(false)
  const [sheetUrl, setSheetUrl] = useState('')
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null)
  // We treat the local in-memory connection store as a hint: it persists
  // across modal opens but not across full reloads. The authoritative
  // state lives in connector_accounts on the server; for slice 1 we
  // optimistically trust the local flag once the OAuth round-trip succeeds.
  const isConnected = connectedEmail !== null || isConnectedLocally(teamId, 'google_sheets')

  // Detect post-OAuth landing.
  useEffect(() => {
    let cancelled = false
    async function maybeComplete() {
      if (typeof window === 'undefined') return
      const url = new URL(window.location.href)
      if (url.searchParams.get(SHEETS_CONNECT_PARAM) !== SHEETS_CONNECT_VALUE) return
      // Strip the param so a refresh doesn't try to re-complete.
      url.searchParams.delete(SHEETS_CONNECT_PARAM)
      const cleanHref = url.pathname + (url.search ? `?${url.searchParams}` : '') + url.hash
      window.history.replaceState({}, '', cleanHref)
      setBusy('completing')
      try {
        const { completeSheetsConnect } = await import('../../lib/ingest/sheetsClient')
        const result = await completeSheetsConnect()
        if (cancelled) return
        if (result?.ok) {
          connectLocally(teamId, 'google_sheets')
          markCoachSourcesConnected(true)
          setConnectedEmail(result.email)
          toast(
            result.email
              ? `Google Sheets connected as ${result.email}`
              : 'Google Sheets connected',
            'success',
          )
        } else {
          toast('OAuth round-trip incomplete — try Connect again', 'error')
        }
      } catch (err) {
        toast(err instanceof Error ? err.message : String(err), 'error')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }
    void maybeComplete()
    return () => {
      cancelled = true
    }
  }, [teamId, connectLocally, markCoachSourcesConnected])

  async function onClickConnect() {
    setBusy('connecting')
    try {
      const back = window.location.origin + window.location.pathname +
        `?${SHEETS_CONNECT_PARAM}=${SHEETS_CONNECT_VALUE}`
      await initiateSheetsConnect({ redirectTo: back })
      // Browser navigates away here.
    } catch (err) {
      toast(err instanceof Error ? err.message : String(err), 'error')
      setBusy(false)
    }
  }

  async function onSync() {
    const url = sheetUrl.trim()
    if (!url) {
      toast('Paste a Google Sheets URL first', 'error')
      return
    }
    setBusy('syncing')
    try {
      const fetched = await fetchSheetAsUpload(url)
      const preview = await requestParse(fetched, teamId)
      onUploaded(preview)
      setSheetUrl('')
    } catch (err) {
      toast(err instanceof Error ? err.message : String(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-lg border p-4 md:col-span-2"
      style={{ background: THEME.light, borderColor: THEME.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
            Google Sheets
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary }}>
            {isConnected && connectedEmail
              ? `Connected as ${connectedEmail}`
              : detail}
          </div>
        </div>
        {!isConnected && (
          <button
            type="button"
            disabled={disabled || busy !== false}
            onClick={onClickConnect}
            className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider disabled:opacity-60"
            style={{
              border: `1px solid ${THEME.primary}`,
              background: THEME.primary,
              color: THEME.white,
              fontFamily: THEME.fontMono,
            }}
          >
            {busy === 'connecting' ? 'Opening…'
              : busy === 'completing' ? 'Finishing…'
              : 'Connect'}
          </button>
        )}
      </div>

      {isConnected && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="url"
            placeholder="https://docs.google.com/spreadsheets/d/…"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            disabled={busy !== false}
            className="flex-1 rounded-lg border px-3 py-2 text-[12px]"
            style={{
              borderColor: THEME.border,
              background: 'var(--bg-primary)',
              color: THEME.textPrimary,
              fontFamily: THEME.fontMono,
            }}
          />
          <button
            type="button"
            disabled={busy !== false || sheetUrl.trim().length === 0}
            onClick={onSync}
            className="shrink-0 rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-wider disabled:opacity-60"
            style={{
              border: `1px solid ${THEME.primary}`,
              background: THEME.primary,
              color: THEME.white,
              fontFamily: THEME.fontMono,
            }}
          >
            {busy === 'syncing' ? 'Syncing…' : 'Sync sheet'}
          </button>
        </div>
      )}

      {disabled && (
        <div
          className="text-[10px] italic"
          style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}
        >
          Sign in with a real account to connect Google Sheets. (Demo data
          stays read-only.)
        </div>
      )}
    </div>
  )
}

/**
 * Apple Health connector row. Generates a per-team webhook secret and
 * shows the URL the coach should paste into an Apple Shortcut. The
 * webhook itself runs without JWT (see supabase/functions/health-webhook)
 * — the secret is what authenticates a POST and resolves it to a team.
 */
function AppleHealthConnectorRow({
  detail,
  disabled,
}: {
  detail: string
  disabled: boolean
}) {
  const teamId = useTeamStore((s) => s.activeTeam.id)
  const isRealTeam = useTeamStore((s) => s.isRealTeam)
  const [summary, setSummary] = useState<HealthConnectorSummary | null>(null)
  const [busy, setBusy] = useState<false | 'loading' | 'enabling' | 'disabling' | 'rotating'>(
    'loading',
  )
  const [revealed, setRevealed] = useState(false)
  const [showSample, setShowSample] = useState(false)
  const [copied, setCopied] = useState<'url' | 'sample' | null>(null)

  // Load existing connector state on mount (or when team changes).
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isRealTeam) {
        if (!cancelled) {
          setBusy(false)
          setSummary({ status: 'absent', secret: null, webhookUrl: null, lastSyncAt: null })
        }
        return
      }
      setBusy('loading')
      try {
        const s = await getHealthConnector(teamId)
        if (!cancelled) setSummary(s)
      } catch (err) {
        if (!cancelled) toast(err instanceof Error ? err.message : String(err), 'error')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [teamId, isRealTeam])

  async function onEnable(rotate: boolean) {
    setBusy(rotate ? 'rotating' : 'enabling')
    try {
      const s = await enableHealthWebhook(teamId)
      setSummary(s)
      setRevealed(true)
      toast(rotate ? 'Webhook secret rotated' : 'Apple Health webhook enabled', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : String(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  async function onDisable() {
    setBusy('disabling')
    try {
      await disableHealthWebhook(teamId)
      setSummary({ status: 'revoked', secret: null, webhookUrl: null, lastSyncAt: null })
      setRevealed(false)
      toast('Apple Health webhook disabled', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : String(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  async function copy(text: string, which: 'url' | 'sample') {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      window.setTimeout(() => setCopied((c) => (c === which ? null : c)), 1400)
    } catch {
      toast('Clipboard copy failed', 'error')
    }
  }

  const isActive = summary?.status === 'connected' && summary.webhookUrl

  return (
    <div
      className="flex flex-col gap-3 rounded-lg border p-4 md:col-span-2"
      style={{ background: THEME.light, borderColor: THEME.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold" style={{ color: THEME.textPrimary }}>
            Apple Health
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary }}>
            {isActive
              ? 'Webhook live — point an Apple Shortcut at the URL below.'
              : detail}
          </div>
        </div>
        {!isActive && (
          <button
            type="button"
            disabled={disabled || busy !== false}
            onClick={() => onEnable(false)}
            className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider disabled:opacity-60"
            style={{
              border: `1px solid ${THEME.primary}`,
              background: THEME.primary,
              color: THEME.white,
              fontFamily: THEME.fontMono,
            }}
          >
            {busy === 'loading' ? '…' : busy === 'enabling' ? 'Enabling…' : 'Enable webhook'}
          </button>
        )}
      </div>

      {isActive && summary?.webhookUrl && (
        <div className="flex flex-col gap-2">
          {/* URL row */}
          <div className="flex items-stretch gap-2">
            <code
              className="flex-1 truncate rounded-md border px-3 py-2 text-[11px]"
              style={{
                borderColor: THEME.border,
                background: 'var(--bg-primary)',
                color: revealed ? THEME.textPrimary : THEME.textMuted,
                fontFamily: THEME.fontMono,
                letterSpacing: revealed ? 0 : '0.1em',
              }}
              title={revealed ? summary.webhookUrl : 'Hidden — click reveal'}
            >
              {revealed ? summary.webhookUrl : maskUrl(summary.webhookUrl)}
            </code>
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              className="shrink-0 rounded-md border px-3 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                borderColor: THEME.border,
                color: THEME.textPrimary,
                fontFamily: THEME.fontMono,
              }}
            >
              {revealed ? 'Hide' : 'Reveal'}
            </button>
            <button
              type="button"
              onClick={() => copy(summary.webhookUrl!, 'url')}
              className="shrink-0 rounded-md border px-3 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                borderColor: THEME.primary,
                color: THEME.primary,
                fontFamily: THEME.fontMono,
              }}
            >
              {copied === 'url' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSample((s) => !s)}
              className="rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                borderColor: THEME.border,
                color: THEME.textPrimary,
                fontFamily: THEME.fontMono,
              }}
            >
              {showSample ? 'Hide example payload' : 'Show example payload'}
            </button>
            <button
              type="button"
              disabled={busy !== false}
              onClick={() => onEnable(true)}
              className="rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider disabled:opacity-60"
              style={{
                borderColor: THEME.amber,
                color: THEME.amber,
                fontFamily: THEME.fontMono,
              }}
            >
              {busy === 'rotating' ? 'Rotating…' : 'Rotate secret'}
            </button>
            <button
              type="button"
              disabled={busy !== false}
              onClick={onDisable}
              className="rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider disabled:opacity-60"
              style={{
                borderColor: THEME.red,
                color: THEME.red,
                fontFamily: THEME.fontMono,
              }}
            >
              {busy === 'disabling' ? 'Disabling…' : 'Disable'}
            </button>
            {summary.lastSyncAt && (
              <span
                className="text-[10px]"
                style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}
              >
                Last delivery {new Date(summary.lastSyncAt).toLocaleString()}
              </span>
            )}
          </div>

          {showSample && (
            <div className="relative">
              <pre
                className="overflow-x-auto rounded-md border p-3 text-[10px] leading-relaxed"
                style={{
                  borderColor: THEME.border,
                  background: 'var(--bg-primary)',
                  color: THEME.textPrimary,
                  fontFamily: THEME.fontMono,
                }}
              >
                {SAMPLE_SHORTCUT_BODY}
              </pre>
              <button
                type="button"
                onClick={() => copy(SAMPLE_SHORTCUT_BODY, 'sample')}
                className="absolute right-2 top-2 rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-wider"
                style={{
                  borderColor: THEME.primary,
                  color: THEME.primary,
                  background: 'var(--bg-primary)',
                  fontFamily: THEME.fontMono,
                }}
              >
                {copied === 'sample' ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      )}

      {disabled && (
        <div
          className="text-[10px] italic"
          style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}
        >
          Sign in with a real account to enable the Apple Health webhook.
        </div>
      )}
    </div>
  )
}

/** Reveal helper — replaces the secret query value with bullets. */
function maskUrl(url: string): string {
  return url.replace(/secret=[^&]+/, 'secret=••••••••••••••••')
}

function AiImportFlow({
  onUploaded,
}: {
  onUploaded: (preview: IngestionPreview) => void
}) {
  const { data: jobs } = useAiImportJobs()
  const teamId = useTeamStore((s) => s.activeTeam.id)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [photoName, setPhotoName] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [recording, setRecording] = useState(false)
  const [voiceInfo, setVoiceInfo] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const markCoachSourcesConnected = useCoachOnboardingStore((s) => s.setSourcesConnected)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  async function startVoice() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mr.mimeType })
        setVoiceInfo(`Recorded ${Math.round(blob.size / 1024)} KB`)
        markCoachSourcesConnected(true)
        toast('Voice note captured (demo)', 'success')
      }
      mr.start()
      recorderRef.current = mr
      setRecording(true)
      setVoiceInfo(null)
    } catch {
      toast('Microphone permission denied', 'error')
    }
  }

  function stopVoice() {
    const mr = recorderRef.current
    if (!mr) return
    mr.stop()
    recorderRef.current = null
    setRecording(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border p-4" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
            Upload screenshot
          </div>
          <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
            Pick an image file — we’ll parse it later.
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setPhotoName(file.name)
              if (!isSupabaseConfigured()) {
                toast(
                  'Sign in to ingest — connect a Supabase project to enable real uploads.',
                  'info',
                )
                return
              }
              setParsing(true)
              try {
                toast(`Parsing ${file.name}…`, 'info')
                const preview = await uploadAndParse(file, teamId)
                markCoachSourcesConnected(true)
                onUploaded(preview)
              } catch (err) {
                const msg = err instanceof Error ? err.message : String(err)
                toast(`Upload failed: ${msg}`, 'error')
              } finally {
                setParsing(false)
              }
            }}
          />
          <button
            type="button"
            disabled={parsing}
            onClick={() => fileRef.current?.click()}
            className="mt-3 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-emerald-50 disabled:opacity-60"
            style={{ background: 'var(--bg-primary)', color: THEME.primary, border: `1px solid ${THEME.primary}`, fontFamily: THEME.fontMono }}
          >
            {parsing ? 'Parsing…' : 'Choose file'}
          </button>
          {photoName && (
            <div className="mt-2 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              {photoName}
            </div>
          )}
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
            Voice note
          </div>
          <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
            Record audio — stored locally for now.
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={recording}
              onClick={startVoice}
              className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
              style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
            >
              Record
            </button>
            <button
              type="button"
              disabled={!recording}
              onClick={stopVoice}
              className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
              style={{ borderColor: THEME.border, background: 'var(--bg-primary)', color: THEME.textPrimary, fontFamily: THEME.fontMono }}
            >
              Stop
            </button>
          </div>
          {voiceInfo && (
            <div className="mt-2 text-[11px]" style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}>
              {voiceInfo}
            </div>
          )}
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: THEME.border, background: 'var(--bg-primary)' }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
            Paste text
          </div>
          <div className="mt-1 text-[12px]" style={{ color: THEME.textSecondary }}>
            Paste raw text from email, Slack, or notes.
          </div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste here…"
            className="mt-3 min-h-[92px] w-full resize-none rounded-lg border bg-[var(--bg-primary)] px-3 py-2 text-[12px] outline-none"
            style={{ borderColor: THEME.border, fontFamily: THEME.fontMono, color: THEME.textPrimary }}
          />
          <button
            type="button"
            disabled={pasteText.trim().length < 5}
            onClick={() => {
              markCoachSourcesConnected(true)
              toast('Paste captured (demo)', 'success')
            }}
            className="mt-3 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
            style={{ background: THEME.primary, color: THEME.white, fontFamily: THEME.fontMono }}
          >
            Save paste
          </button>
        </div>
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
          className="min-w-0 flex-1 rounded-lg border bg-[var(--bg-primary)] px-3 py-2 text-[13px] outline-none"
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

function ManualFlow({
  onUploaded,
}: {
  onUploaded: (preview: IngestionPreview) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const [parsingName, setParsingName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const teamId = useTeamStore((s) => s.activeTeam.id)
  const markCoachSourcesConnected = useCoachOnboardingStore((s) => s.setSourcesConnected)

  async function handleFile(file: File) {
    if (!isSupabaseConfigured()) {
      toast(
        'Sign in to ingest — connect a Supabase project to enable real uploads.',
        'info',
      )
      return
    }
    const kind = classifyFile(file)
    if (!kind) {
      toast(
        `Unsupported file type: ${file.type || 'unknown'}. Try CSV, XLSX, PDF, or image.`,
        'error',
      )
      return
    }
    setParsingName(file.name)
    toast(`Parsing ${file.name}…`, 'info')
    try {
      const preview = await uploadAndParse(file, teamId)
      markCoachSourcesConnected(true)
      onUploaded(preview)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast(`Upload failed: ${msg}`, 'error')
    } finally {
      setParsingName(null)
    }
  }

  return (
    <div>
      <div
        className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed text-center transition-colors"
        style={{
          borderColor: dragOver ? THEME.primary : THEME.border,
          background: dragOver ? `${THEME.primary}08` : THEME.light,
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files[0]
          if (file) void handleFile(file)
        }}
      >
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
        >
          {parsingName
            ? `Parsing ${parsingName}…`
            : dragOver
            ? 'Drop to upload'
            : 'Drag & drop'}
        </div>
        <div className="mt-2 max-w-[380px] text-[13px]" style={{ color: THEME.textSecondary }}>
          Drop a CSV, XLSX, PDF, or screenshot. Claude reads the file, extracts
          structured events, and matches each to an athlete — you review before
          anything lands.
        </div>
        <button
          type="button"
          disabled={!!parsingName}
          className="mt-4 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-emerald-50 disabled:opacity-60"
          style={{
            background: 'var(--bg-primary)',
            color: THEME.primary,
            border: `1px solid ${THEME.primary}`,
            fontFamily: THEME.fontMono,
          }}
          onClick={() => fileRef.current?.click()}
        >
          {parsingName ? 'Parsing…' : 'Browse files'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls,.pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />
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
