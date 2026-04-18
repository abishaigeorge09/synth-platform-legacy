import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../dashboard/components/PageHeader'
import { SourceCard } from './components/SourceCard'
import { ScanLogRow } from './components/ScanLogRow'
import { ScanReportViewer } from './components/ScanReportViewer'
import { THEME } from '../../../lib/theme'
import {
  useSources,
  useScanLogs,
  useScanLogsForSource,
  useLatestScanForSource,
} from '../../../shared/data/queries'
import { useUiStore } from '../../../shared/store/useUiStore'
import { SkeletonCard, SkeletonLine } from '../../../shared/components/Skeleton'
import { QueryError } from '../../../shared/components/QueryError'

export function SourcesPage() {
  const { data: sources, isLoading: l1, isError: e1, error: err1 } = useSources()
  const { data: allScanLogs, isLoading: l2, isError: e2, error: err2 } = useScanLogs()
  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    sources[0]?.id ?? '',
  )
  const selectedSource = useMemo(
    () => sources.find((s) => s.id === selectedSourceId) ?? null,
    [selectedSourceId, sources],
  )

  const { data: logsForSelected } = useScanLogsForSource(selectedSourceId)

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

  const totalScans = allScanLogs.length
  const healthyCount = sources.filter((s) => s.status === 'healthy').length

  const openAgent = useUiStore((s) => s.openAgentModal)

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
        kicker="Coach · Sources"
        title="Connectors · sync status · reports"
        subtitle={`${sources.length} connectors · ${healthyCount} healthy · ${totalScans} scans logged (72h)`}
      />

      <div className="flex items-center justify-between px-5 sm:px-10 pb-4">
        <div
          className="text-[11px]"
          style={{ fontFamily: THEME.fontMono, color: THEME.textSecondary }}
        >
          Every displayed number on the dashboard traces back to one of the scans below.
        </div>
        <button
          type="button"
          onClick={openAgent}
          className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]"
          style={{
            background: THEME.primary,
            color: THEME.white,
            fontFamily: THEME.fontMono,
            boxShadow: '0 12px 30px -14px rgba(5,150,105,0.5)',
          }}
        >
          + Add source · synth. Agent
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
            selected={source.id === selectedSourceId}
            onSelect={(latestLogId) => {
              setSelectedSourceId(source.id)
              setSelectedLogId(latestLogId)
            }}
          />
        ))}
      </motion.div>

      <div className="mt-8 grid gap-4 px-5 sm:px-10 xl:grid-cols-[320px_1fr]">
        <section
          className="rounded-2xl border p-4"
          style={{ background: THEME.white, borderColor: THEME.border }}
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
    </div>
  )
}

/** Wrapper so we can call hooks per-source inside the .map() */
function SourceCardWithHooks({
  source,
  selected,
  onSelect,
}: {
  source: ReturnType<typeof useSources>['data'][number]
  selected: boolean
  onSelect: (latestLogId: string | null) => void
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
    />
  )
}
