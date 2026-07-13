/**
 * Client wrapper around Supabase Storage + the `ingest` Edge Function.
 *
 * Two-step flow per file:
 *   1. uploadToStorage()   →  PUT bytes into the `uploads` bucket at
 *                              `{userId}/{uuid}.{ext}`. RLS allows the
 *                              user to only write under their own prefix.
 *   2. requestParse()      →  POST to /ingest with action=parse. The
 *                              function creates the source_uploads row,
 *                              parses the file, calls Claude, writes
 *                              ingestion_events (status=preview), and
 *                              returns the preview payload.
 *
 * Then once the coach reviews:
 *   3. confirmIngestion()  →  POST to /ingest with action=confirm and
 *                              any per-row overrides (athlete remap or
 *                              reject).
 *
 * All three call sites assume `supabase` from src/lib/supabaseClient.ts
 * is non-null. When supabase is null (no env vars), the upload UI is
 * disabled — there is no demo-mode ingestion path in slice 1.
 */

import { supabase } from '@lib/supabaseClient'
import type {
  IngestionEvent,
  IngestionPreview,
  SourceUpload,
  SourceUploadKind,
  UUID,
} from '@shared/data/types'

// ─── Mime → kind dispatch ─────────────────────────────────────────────────

const CSV_MIMES = new Set(['text/csv', 'application/csv', 'text/x-csv'])
const XLSX_MIMES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
])

export function classifyFile(file: File): SourceUploadKind | null {
  const mt = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  if (CSV_MIMES.has(mt) || name.endsWith('.csv')) return 'csv'
  if (
    XLSX_MIMES.has(mt) ||
    name.endsWith('.xlsx') ||
    name.endsWith('.xls')
  ) {
    return 'xlsx'
  }
  if (mt === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (mt.startsWith('image/')) return 'image'
  return null
}

function fileExt(file: File): string {
  const i = file.name.lastIndexOf('.')
  if (i === -1 || i === file.name.length - 1) return ''
  return file.name.slice(i + 1).toLowerCase()
}

// ─── Storage upload ───────────────────────────────────────────────────────

export type StorageUploadResult = {
  storagePath: string
  filename: string
  mimeType: string
  size: number
  kind: SourceUploadKind
}

export async function uploadToStorage(
  file: File,
): Promise<StorageUploadResult> {
  if (!supabase) throw new Error('Supabase is not configured')

  const kind = classifyFile(file)
  if (!kind) {
    throw new Error(
      `Unsupported file type: ${file.type || 'unknown'} (${file.name})`,
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  // crypto.randomUUID is on every modern browser + Node.
  const id = crypto.randomUUID()
  const ext = fileExt(file)
  const storagePath = `${user.id}/${id}${ext ? `.${ext}` : ''}`

  const { error } = await supabase.storage
    .from('uploads')
    .upload(storagePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })
  if (error) throw new Error(`Upload failed: ${error.message}`)

  return {
    storagePath,
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    kind,
  }
}

// ─── Edge Function calls ──────────────────────────────────────────────────

async function callIngest(
  body: Record<string, unknown>,
): Promise<unknown> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not signed in')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const url = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/ingest`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let msg = `ingest ${res.status}`
    try {
      const j = await res.json()
      if (j && typeof j === 'object' && 'error' in j) msg = String((j as { error: unknown }).error)
    } catch {
      /* fall through */
    }
    throw new Error(msg)
  }
  return await res.json()
}

// Server returns rows in DB column-name (snake_case) shape. Normalize
// to the camelCase types the rest of the app uses.
function normalizeUpload(row: Record<string, unknown>): SourceUpload {
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

function normalizeEvent(row: Record<string, unknown>): IngestionEvent {
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
    athleteNameRaw:
      (row.athlete_name_raw as string | undefined) ?? undefined,
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

export async function requestParse(
  upload: StorageUploadResult,
  teamId?: UUID,
): Promise<IngestionPreview> {
  const result = (await callIngest({
    action: 'parse',
    storage_path: upload.storagePath,
    filename: upload.filename,
    mime_type: upload.mimeType,
    kind: upload.kind,
    team_id: teamId ?? null,
  })) as {
    upload: Record<string, unknown>
    events: Array<Record<string, unknown>>
    candidates: Record<
      string,
      Array<{ athleteId: string; name: string; score: number }>
    >
  }
  return {
    upload: normalizeUpload(result.upload),
    events: result.events.map(normalizeEvent),
    candidates: result.candidates,
  }
}

export type ConfirmOverride = {
  eventId: UUID
  athleteId?: UUID | null
  reject?: boolean
}

export async function confirmIngestion(
  sourceUploadId: UUID,
  overrides: ConfirmOverride[] = [],
): Promise<{ confirmedCount: number; rejectedCount: number }> {
  const result = (await callIngest({
    action: 'confirm',
    source_upload_id: sourceUploadId,
    overrides: overrides.map((o) => ({
      event_id: o.eventId,
      athlete_id: o.athleteId,
      reject: o.reject,
    })),
  })) as {
    confirmed_count: number
    rejected_count: number
  }
  return {
    confirmedCount: result.confirmed_count,
    rejectedCount: result.rejected_count,
  }
}

/** End-to-end convenience: storage upload + parse in one call. */
export async function uploadAndParse(
  file: File,
  teamId?: UUID,
): Promise<IngestionPreview> {
  const upload = await uploadToStorage(file)
  return await requestParse(upload, teamId)
}
