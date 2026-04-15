import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../dashboard/components/PageHeader'
import { SourceCard } from './components/SourceCard'
import { ScanLogRow } from './components/ScanLogRow'
import { ScanReportViewer } from './components/ScanReportViewer'
import { THEME } from '../../../lib/theme'
import { SEED_SOURCES } from '../../../shared/data/seeds'
import {
  SEED_SCAN_LOGS,
  scanLogsForSource,
  latestScanForSource,
} from '../../../shared/data/seeds/scanLogs'
import { useUiStore } from '../../../shared/store/useUiStore'

export function SourcesPage() {
  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    SEED_SOURCES[0]?.id ?? '',
  )
  const selectedSource = useMemo(
    () => SEED_SOURCES.find((s) => s.id === selectedSourceId) ?? null,
    [selectedSourceId],
  )

  const logsForSelected = useMemo(
    () => scanLogsForSource(selectedSourceId),
    [selectedSourceId],
  )

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

  const totalScans = SEED_SCAN_LOGS.length
  const healthyCount = SEED_SOURCES.filter((s) => s.status === 'healthy').length

  const openAgent = useUiStore((s) => s.openAgentModal)

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      <PageHeader
        kicker="Coach · Sources"
        title="Connectors · sync status · reports"
        subtitle={`${SEED_SOURCES.length} connectors · ${healthyCount} healthy · ${totalScans} scans logged (72h)`}
      />

      <div className="flex items-center justify-between px-10 pb-4">
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
        className="grid gap-3 px-10 md:grid-cols-2 xl:grid-cols-4"
      >
        {SEED_SOURCES.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            latestScan={latestScanForSource(source.id)}
            scanCount={scanLogsForSource(source.id).length}
            selected={source.id === selectedSourceId}
            onSelect={() => {
              setSelectedSourceId(source.id)
              // Reset to latest scan for the newly selected source.
              setSelectedLogId(latestScanForSource(source.id)?.id ?? null)
            }}
          />
        ))}
      </motion.div>

      <div className="mt-8 grid gap-4 px-10 xl:grid-cols-[320px_1fr]">
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
