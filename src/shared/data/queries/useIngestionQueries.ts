/**
 * Ingestion query hooks — surface confirmed events and upload history
 * back into the UI.
 *
 * Demo mode (no Supabase env): both hooks return `{data: [], ...}`
 * synchronously. The seed-based timeline + sources keep working
 * untouched. When Supabase is configured, the hooks fetch the
 * coach's own uploads (RLS scopes by uploaded_by = auth.uid()) and
 * any confirmed ingestion_events.
 *
 * Shape mirrors `useStaticQuery` so consumers can destructure
 * `{ data, isLoading, isError }` exactly like seed-based hooks.
 */

import { useEffect, useState } from 'react'
import { supabase } from '@lib/supabaseClient'
import type { IngestionEvent, SourceUpload, UUID } from '@shared/data/types'

type Result<T> = {
  data: T
  isLoading: boolean
  isError: boolean
  error: Error | null
}

function rowToUpload(row: Record<string, unknown>): SourceUpload {
  return {
    id: row.id as string,
    teamId: row.team_id as string,
    uploadedBy: row.uploaded_by as string,
    storagePath: row.storage_path as string,
    filename: row.filename as string,
    mimeType: row.mime_type as string,
    sizeBytes: Number(row.size_bytes ?? 0),
    kind: row.kind as SourceUpload['kind'],
    status: row.status as SourceUpload['status'],
    parseError: row.parse_error as string | undefined,
    eventsExtracted: Number(row.events_extracted ?? 0),
    eventsConfirmed: Number(row.events_confirmed ?? 0),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function rowToEvent(row: Record<string, unknown>): IngestionEvent {
  return {
    id: row.id as string,
    teamId: row.team_id as string,
    athleteId: (row.athlete_id as string | null) ?? null,
    sourceUploadId: row.source_upload_id as string,
    occurredAt: row.occurred_at as string,
    category: row.category as IngestionEvent['category'],
    metric: row.metric as string,
    value: row.value === null ? undefined : Number(row.value),
    valueText: (row.value_text as string | undefined) ?? undefined,
    unit: (row.unit as string | undefined) ?? undefined,
    athleteNameRaw: (row.athlete_name_raw as string | undefined) ?? undefined,
    extractionConfidence:
      row.extraction_confidence === null
        ? undefined
        : Number(row.extraction_confidence),
    matchConfidence:
      row.match_confidence === null
        ? undefined
        : Number(row.match_confidence),
    raw: (row.raw as Record<string, unknown>) ?? undefined,
    status: row.status as IngestionEvent['status'],
    createdAt: row.created_at as string,
  }
}

/** Recent uploads for the signed-in coach. Empty in demo mode. */
export function useSourceUploads(limit = 25): Result<SourceUpload[]> {
  const [state, setState] = useState<Result<SourceUpload[]>>({
    data: [],
    isLoading: !!supabase,
    isError: false,
    error: null,
  })

  useEffect(() => {
    if (!supabase) {
      // Functional update bails out when state is already the empty
      // "demo mode" baseline — React skips the re-render, so this
      // doesn't actually cascade (the lint rule is over-strict here).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((prev) =>
        prev.data.length === 0 && !prev.isLoading && !prev.isError
          ? prev
          : { data: [], isLoading: false, isError: false, error: null },
      )
      return
    }
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase!
        .from('source_uploads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (cancelled) return
      if (error) {
        setState({
          data: [],
          isLoading: false,
          isError: true,
          error: new Error(error.message),
        })
        return
      }
      setState({
        data: (data ?? []).map((r) =>
          rowToUpload(r as Record<string, unknown>),
        ),
        isLoading: false,
        isError: false,
        error: null,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [limit])

  return state
}

/** Confirmed ingestion events for one athlete. Empty in demo mode. */
export function useIngestedEventsForAthlete(
  athleteId: UUID | undefined,
): Result<IngestionEvent[]> {
  const [state, setState] = useState<Result<IngestionEvent[]>>({
    data: [],
    isLoading: !!supabase && !!athleteId,
    isError: false,
    error: null,
  })

  useEffect(() => {
    if (!supabase || !athleteId) {
      // See note above on functional-update bailout.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((prev) =>
        prev.data.length === 0 && !prev.isLoading && !prev.isError
          ? prev
          : { data: [], isLoading: false, isError: false, error: null },
      )
      return
    }
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase!
        .from('ingestion_events')
        .select('*')
        .eq('athlete_id', athleteId)
        .eq('status', 'confirmed')
        .order('occurred_at', { ascending: false })
      if (cancelled) return
      if (error) {
        setState({
          data: [],
          isLoading: false,
          isError: true,
          error: new Error(error.message),
        })
        return
      }
      setState({
        data: (data ?? []).map((r) => rowToEvent(r as Record<string, unknown>)),
        isLoading: false,
        isError: false,
        error: null,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [athleteId])

  return state
}

/** Confirmed ingestion events for the whole team. Empty in demo mode. */
export function useIngestedEventsForTeam(
  teamId: UUID | undefined,
  limit = 50,
): Result<IngestionEvent[]> {
  const [state, setState] = useState<Result<IngestionEvent[]>>({
    data: [],
    isLoading: !!supabase && !!teamId,
    isError: false,
    error: null,
  })

  useEffect(() => {
    if (!supabase || !teamId) {
      // See note above on functional-update bailout.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((prev) =>
        prev.data.length === 0 && !prev.isLoading && !prev.isError
          ? prev
          : { data: [], isLoading: false, isError: false, error: null },
      )
      return
    }
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase!
        .from('ingestion_events')
        .select('*')
        .eq('team_id', teamId)
        .eq('status', 'confirmed')
        .order('occurred_at', { ascending: false })
        .limit(limit)
      if (cancelled) return
      if (error) {
        setState({
          data: [],
          isLoading: false,
          isError: true,
          error: new Error(error.message),
        })
        return
      }
      setState({
        data: (data ?? []).map((r) => rowToEvent(r as Record<string, unknown>)),
        isLoading: false,
        isError: false,
        error: null,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [teamId, limit])

  return state
}
