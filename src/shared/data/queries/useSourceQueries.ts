/**
 * Source + scan-log queries. Swap internals for Supabase hooks later.
 */
import { useMemo } from 'react'
import { useStaticQuery } from './useStaticQuery'
import { SEED_SOURCES } from '../seeds'
import { SEED_SCAN_LOGS, scanLogsForSource, latestScanForSource } from '../seeds/scanLogs'

export function useSources() {
  return useStaticQuery(SEED_SOURCES)
}

export function useScanLogs() {
  return useStaticQuery(SEED_SCAN_LOGS)
}

export function useScanLogsForSource(sourceId: string) {
  const logs = useMemo(() => scanLogsForSource(sourceId), [sourceId])
  return useStaticQuery(logs)
}

export function useLatestScanForSource(sourceId: string) {
  const scan = useMemo(() => latestScanForSource(sourceId), [sourceId])
  return useStaticQuery(scan)
}
