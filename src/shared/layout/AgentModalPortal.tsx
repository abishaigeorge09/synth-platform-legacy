import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUiStore } from '../store/useUiStore'
import { THEME } from '../../lib/theme'
import { SEED_SOURCES } from '../data/seeds'
import { SEED_SCAN_LOGS } from '../data/seeds/scanLogs'
import type { Source, SourceType } from '../data/types'

type Tab = 'sources' | 'scans' | 'add'

const TAB_LABELS: Record<Tab, string> = {
  sources: 'Connected sources',
  scans: 'Scan history',
  add: '+ Connect source',
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
                  Connectors · scans · reports
                </h2>
                <div
                  className="mt-1 text-[11px]"
                  style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
                >
                  {SEED_SOURCES.length} connectors · {SEED_SCAN_LOGS.length} scans in history
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
      )}
    </AnimatePresence>
  )
}

function SourcesTab() {
  return (
    <div className="flex flex-col gap-2">
      {SEED_SOURCES.map((s) => (
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
  const chronological = [...SEED_SCAN_LOGS].sort(
    (a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime(),
  )
  return (
    <div className="flex flex-col gap-2">
      {chronological.map((log) => {
        const src = SEED_SOURCES.find((s) => s.id === log.sourceId)
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
  const [sub, setSub] = useState<'extension' | 'connectors' | 'manual'>('extension')

  return (
    <div>
      <div className="mb-5 flex gap-2">
        {(['extension', 'connectors', 'manual'] as const).map((key) => (
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
            {key === 'extension' ? 'Extension' : key === 'connectors' ? 'Connectors' : 'Manual import'}
          </button>
        ))}
      </div>

      {sub === 'extension' && <ExtensionFlow />}
      {sub === 'connectors' && <ConnectorsFlow />}
      {sub === 'manual' && <ManualFlow />}
    </div>
  )
}

function ExtensionFlow() {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-lg border p-4"
        style={{ background: THEME.light, borderColor: THEME.border }}
      >
        <div
          className="text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
        >
          Step 1 · URL to scan
        </div>
        <input
          defaultValue="https://app.bridgeathletics.com/team/dashboard"
          className="mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] outline-none"
          style={{ borderColor: THEME.border, fontFamily: THEME.fontMono, color: THEME.textPrimary }}
        />
      </div>
      <div
        className="rounded-lg border p-4"
        style={{ background: THEME.light, borderColor: THEME.border }}
      >
        <div
          className="text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
        >
          Step 2 · Install synth. extension
        </div>
        <div className="mt-2 text-[12px]" style={{ color: THEME.textSecondary }}>
          The browser extension runs in the coach's browser context to scrape data beside the existing workflow. A real
          Chrome Web Store install flow lands in P2.
        </div>
        <button
          type="button"
          className="mt-3 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider"
          style={{
            background: THEME.primary,
            color: THEME.white,
            fontFamily: THEME.fontMono,
          }}
        >
          Install extension →
        </button>
      </div>
      <div
        className="rounded-lg border p-4"
        style={{ background: THEME.light, borderColor: THEME.border }}
      >
        <div
          className="text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.primary }}
        >
          Step 3 · Schedule
        </div>
        <div className="mt-3 flex gap-2">
          {['Real-time', 'Hourly', 'Daily 18:00', 'Weekly Mon 18:00'].map((label, i) => (
            <button
              key={label}
              type="button"
              className="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                border: `1px solid ${i === 2 ? THEME.primary : THEME.border}`,
                background: i === 2 ? 'rgba(5,150,105,0.08)' : THEME.white,
                color: i === 2 ? THEME.primary : THEME.textSecondary,
                fontFamily: THEME.fontMono,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ConnectorsFlow() {
  const catalog = [
    { id: 'gs', name: 'Google Sheets', detail: 'Roster, erg workbooks, compliance sheets', connected: true },
    { id: 'gd', name: 'Google Drive', detail: 'Video, screenshots, shared files', connected: false },
    { id: 'sl', name: 'Slack', detail: 'Channel monitoring for coach threads', connected: false },
    { id: 'tw', name: 'TeamWorks', detail: 'Calendar, attendance, compliance', connected: true },
    { id: 'wh', name: 'Whoop (wearable hub)', detail: 'Team rollup — sleep, HRV, recovery', connected: true },
    { id: 'br', name: 'Bridge Athletics', detail: 'Strength & conditioning program feed', connected: false },
  ]
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {catalog.map((c) => (
        <div
          key={c.id}
          className="flex items-start justify-between rounded-lg border p-4"
          style={{ background: THEME.light, borderColor: THEME.border }}
        >
          <div className="flex-1">
            <div
              className="text-[13px] font-semibold"
              style={{ color: THEME.textPrimary }}
            >
              {c.name}
            </div>
            <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary }}>
              {c.detail}
            </div>
          </div>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              border: `1px solid ${c.connected ? THEME.border : THEME.primary}`,
              background: c.connected ? THEME.white : THEME.primary,
              color: c.connected ? THEME.textSecondary : THEME.white,
              fontFamily: THEME.fontMono,
            }}
          >
            {c.connected ? 'Connected' : 'Connect →'}
          </button>
        </div>
      ))}
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
