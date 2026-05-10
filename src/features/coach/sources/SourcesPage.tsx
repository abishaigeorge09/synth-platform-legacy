import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHeader } from '../dashboard/components/PageHeader'
import { SourceCard } from './components/SourceCard'
import { ScanLogRow } from './components/ScanLogRow'
import { ScanReportViewer } from './components/ScanReportViewer'
import { SourceDetailModal } from './components/SourceDetailModal'
import { THEME } from '../../../lib/theme'
import { posthog } from '../../../shared/analytics/posthog'
import {
  useSources,
  useScanLogs,
  useScanLogsForSource,
  useLatestScanForSource,
  useSourceUploads,
} from '../../../shared/data/queries'
import { useUiStore } from '../../../shared/store/useUiStore'
import { SkeletonCard, SkeletonLine } from '../../../shared/components/Skeleton'
import { QueryError } from '../../../shared/components/QueryError'
import type { SourceUpload } from '../../../shared/data/types'

export function SourcesPage() {
  const [params] = useSearchParams()
  const { data: sources, isLoading: l1, isError: e1, error: err1 } = useSources()
  const { isLoading: l2, isError: e2, error: err2 } = useScanLogs()
  const [selectedSourceId, setSelectedSourceId] = useState<string>(() => params.get('source') ?? '')
  const effectiveSourceId = selectedSourceId || sources[0]?.id || ''
  const selectedSource = useMemo(
    () => sources.find((s) => s.id === effectiveSourceId) ?? null,
    [effectiveSourceId, sources],
  )

  const { data: logsForSelected } = useScanLogsForSource(effectiveSourceId)

  const [detailSourceId, setDetailSourceId] = useState<string | null>(null)
  const detailSource = useMemo(
    () => sources.find((s) => s.id === detailSourceId) ?? null,
    [detailSourceId, sources],
  )
  const { data: detailLogs } = useScanLogsForSource(detailSourceId ?? '')

  const [selectedLogId, setSelectedLogId] = useState<string | null>(
    logsForSelected[0]?.id ?? null,
  )

  // Keep the selected log consistent when switching sources.
  const effectiveLogId = useMemo(() => {
    if (selectedLogId && logsForSelected.some((l) => l.id === selectedLogId)) {
      return selectedLogId
    }
    return logsForSelected[0]?.id ?? null
  }, [selectedLogId, logsForSelected])

  const selectedLog = useMemo(
    () => logsForSelected.find((l) => l.id === effectiveLogId) ?? null,
    [logsForSelected, effectiveLogId],
  )

  const healthyCount = sources.filter((s) => s.status === 'healthy').length

  const openAgent = useUiStore((s) => s.openAgentModal)

  useEffect(() => {
    const sourceId = params.get('source')
    if (!sourceId || !sources.find((s) => s.id === sourceId)) return
    const el = document.getElementById(sourceId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [params, sources])

  if (e1 || e2) return <QueryError label="Sources" error={err1 ?? err2} />

  if (l1 || l2) {
    return (
      <div className="flex min-h-full w-full flex-col pb-12">
        <header className="px-5 sm:px-10 pb-5 pt-8">
          <SkeletonLine width={100} height={8} />
          <SkeletonLine width={280} height={28} className="mt-2" />
          <SkeletonLine width={240} height={12} className="mt-2" />
        </header>
        <div className="grid gap-4 px-5 sm:px-10 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="Sources"
        title="Connectors"
        subtitle={`${healthyCount} healthy of ${sources.length}`}
      />

      <div className="flex items-center gap-3 px-5 pb-2 sm:px-10">
        <span className="rounded-md border px-2.5 py-1 text-[11px] font-semibold" style={{ borderColor: THEME.primary, color: THEME.primary, fontFamily: THEME.fontMono }}>
          Connectors
        </span>
        <span style={{ color: THEME.textMuted }}>|</span>
        <Link
          to="/coach/sources/data-view"
          className="rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors hover:opacity-90"
          style={{ borderColor: THEME.border, color: THEME.textSecondary, fontFamily: THEME.fontMono }}
        >
          Data View
        </Link>
      </div>

      <div className="flex items-center justify-between px-5 sm:px-10 pb-4">
        <div
          className="text-[11px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          Scan history for the selected connector.
        </div>
        <button
          type="button"
          onClick={() => { posthog.capture('add_source_clicked', { source_count: sources.length }); openAgent() }}
          className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
          style={{
            background: THEME.primary,
            color: THEME.white,
            fontFamily: THEME.fontMono,
            boxShadow: '0 12px 30px -14px rgba(5,150,105,0.5)',
          }}
        >
          + Add source
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-3 px-5 sm:px-10 md:grid-cols-2 xl:grid-cols-4"
      >
        {sources.map((source) => (
          <SourceCardWithHooks
            key={source.id}
            source={source}
            selected={source.id === effectiveSourceId}
            onSelect={(latestLogId) => {
              setSelectedSourceId(source.id)
              setSelectedLogId(latestLogId)
            }}
            onDetail={() => setDetailSourceId(source.id)}
          />
        ))}
      </motion.div>

      <RecentUploadsSection />

      <div className="mt-8 grid gap-4 px-5 sm:px-10 xl:grid-cols-[320px_1fr]">
        <section
          className="rounded-2xl border p-4"
          style={{ background: 'var(--bg-primary)', borderColor: THEME.border }}
        >
          <div className="mb-3 flex items-baseline justify-between">
            <div
              className="text-[9px] font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
            >
              Scan history
            </div>
            <div
              className="text-[10px]"
              style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
            >
              {selectedSource?.name ?? '—'}
            </div>
          </div>

          {logsForSelected.length === 0 ? (
            <div
              className="rounded-lg border border-dashed p-4 text-[12px]"
              style={{ borderColor: THEME.border, color: THEME.textSecondary }}
            >
              No scans recorded for this connector yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {logsForSelected.map((log) => (
                <ScanLogRow
                  key={log.id}
                  log={log}
                  selected={log.id === effectiveLogId}
                  onSelect={() => setSelectedLogId(log.id)}
                />
              ))}
            </div>
          )}
        </section>

        <ScanReportViewer log={selectedLog} sourceName={selectedSource?.name ?? '—'} />
      </div>

      <SourceDetailModal
        source={detailSource}
        scanLogs={detailLogs}
        open={detailSourceId !== null}
        onClose={() => setDetailSourceId(null)}
      />
    </div>
  )
}

function RecentUploadsSection() {
  const { data: uploads, isLoading } = useSourceUploads(15)
  if (isLoading || uploads.length === 0) return null
  return (
    <section className="mt-8 px-5 sm:px-10">
      <div
        className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        Recent uploads · {uploads.length}
      </div>
      <div className="grid gap-2">
        {uploads.map((u) => (
          <UploadRow key={u.id} upload={u} />
        ))}
      </div>
    </section>
  )
}

function UploadRow({ upload }: { upload: SourceUpload }) {
  const statusColor =
    upload.status === 'confirmed'
      ? THEME.primary
      : upload.status === 'failed'
      ? THEME.red
      : upload.status === 'preview'
      ? THEME.amber
      : THEME.textMuted
  return (
    <div
      className="flex items-center justify-between rounded-lg border px-4 py-3"
      style={{
        background: 'var(--bg-primary)',
        borderColor: THEME.border,
        borderLeft: `3px solid ${statusColor}`,
      }}
    >
      <div className="min-w-0">
        <div
          className="text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
        >
          {upload.kind} · {new Date(upload.createdAt).toLocaleString()}
        </div>
        <div
          className="mt-0.5 truncate text-[14px] font-semibold"
          style={{ color: THEME.textPrimary }}
        >
          {upload.filename}
        </div>
        {upload.parseError && (
          <div
            className="mt-1 text-[11px]"
            style={{ fontFamily: THEME.fontMono, color: THEME.red }}
          >
            {upload.parseError}
          </div>
        )}
      </div>
      <div className="ml-4 flex items-center gap-3">
        <div
          className="text-right text-[11px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          {upload.eventsConfirmed > 0
            ? `${upload.eventsConfirmed} confirmed`
            : upload.eventsExtracted > 0
            ? `${upload.eventsExtracted} pending`
            : '—'}
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            background: `${statusColor}22`,
            color: statusColor,
            fontFamily: THEME.fontMono,
          }}
        >
          {upload.status}
        </span>
      </div>
    </div>
  )
}

function SourceCardWithHooks({
  source,
  selected,
  onSelect,
  onDetail,
}: {
  source: ReturnType<typeof useSources>['data'][number]
  selected: boolean
  onSelect: (latestLogId: string | null) => void
  onDetail: () => void
}) {
  const { data: latestScan } = useLatestScanForSource(source.id)
  const { data: logs } = useScanLogsForSource(source.id)
  return (
    <SourceCard
      source={source}
      latestScan={latestScan}
      scanCount={logs.length}
      selected={selected}
      onSelect={() => onSelect(latestScan?.id ?? null)}
      onDetail={onDetail}
    />
  )
}
