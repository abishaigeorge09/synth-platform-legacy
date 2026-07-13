/**
 * Build a context block of recently-ingested events to inject into the
 * synth. AI system prompt. This is the round-trip that closes the loop
 * after slice 1: a coach uploads a CSV, the AI then "knows" about it.
 *
 * Lightweight RAG — recency-ordered structured rows, no embeddings.
 * Adequate for the small per-athlete dataset (≤200 rows/season). Layer
 * pgvector later if and when the catalog grows.
 *
 * Returns an empty string in demo mode (no Supabase) or when the user
 * hasn't ingested anything; callers concat directly into the system
 * prompt without conditionals.
 */

import { supabase } from '@lib/supabaseClient'
import type { IngestionEvent, UUID } from '@shared/data/types'

const MAX_EVENTS_FOR_ATHLETE = 60
const MAX_EVENTS_FOR_TEAM = 80

type EventRow = {
  id: string
  athlete_id: string | null
  occurred_at: string
  category: string
  metric: string
  value: number | null
  value_text: string | null
  unit: string | null
  athlete_name_raw: string | null
  source_upload_id: string
}

type UploadRow = {
  id: string
  filename: string
  kind: string
  created_at: string
}

function rowToShape(r: EventRow): Pick<
  IngestionEvent,
  | 'id'
  | 'athleteId'
  | 'occurredAt'
  | 'category'
  | 'metric'
  | 'value'
  | 'valueText'
  | 'unit'
  | 'athleteNameRaw'
  | 'sourceUploadId'
> {
  return {
    id: r.id,
    athleteId: r.athlete_id ?? null,
    occurredAt: r.occurred_at,
    category: r.category as IngestionEvent['category'],
    metric: r.metric,
    value: r.value === null ? undefined : Number(r.value),
    valueText: r.value_text ?? undefined,
    unit: r.unit ?? undefined,
    athleteNameRaw: r.athlete_name_raw ?? undefined,
    sourceUploadId: r.source_upload_id,
  }
}

export type IngestionContextArgs = {
  athleteId?: UUID
  teamId?: UUID
  athleteName?: string
}

/**
 * Fetch confirmed ingestion events + the originating uploads, format
 * as a `<ingested_events>` system-prompt block, and return as a string.
 * Empty string when there's nothing to inject.
 */
export async function buildIngestionContext(
  args: IngestionContextArgs,
): Promise<string> {
  if (!supabase) return ''

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return ''

  let q = supabase
    .from('ingestion_events')
    .select(
      'id, athlete_id, occurred_at, category, metric, value, value_text, unit, athlete_name_raw, source_upload_id',
    )
    .eq('status', 'confirmed')
    .order('occurred_at', { ascending: false })

  if (args.athleteId) {
    q = q.eq('athlete_id', args.athleteId).limit(MAX_EVENTS_FOR_ATHLETE)
  } else if (args.teamId) {
    q = q.eq('team_id', args.teamId).limit(MAX_EVENTS_FOR_TEAM)
  } else {
    q = q.limit(MAX_EVENTS_FOR_TEAM)
  }

  const { data: rows, error } = await q
  if (error || !rows || rows.length === 0) return ''

  const events = (rows as EventRow[]).map(rowToShape)

  // Pull upload filenames so the model can cite "from rowing-erg.csv".
  const uploadIds = [...new Set(events.map((e) => e.sourceUploadId))]
  let uploadById = new Map<string, UploadRow>()
  if (uploadIds.length > 0) {
    const { data: uploads } = await supabase
      .from('source_uploads')
      .select('id, filename, kind, created_at')
      .in('id', uploadIds)
    if (uploads) {
      uploadById = new Map(
        (uploads as UploadRow[]).map((u) => [u.id, u]),
      )
    }
  }

  const lines: string[] = []
  lines.push('<ingested_events>')
  if (args.athleteName) {
    lines.push(`Recent events for ${args.athleteName} (most recent first):`)
  } else {
    lines.push('Recent team-wide events (most recent first):')
  }
  for (const evt of events) {
    const upload = uploadById.get(evt.sourceUploadId)
    const valueLabel =
      evt.value !== undefined && evt.value !== null
        ? `${evt.value}${evt.unit ? ` ${evt.unit}` : ''}`
        : evt.valueText ?? '-'
    const date = evt.occurredAt.slice(0, 10)
    const fileTag = upload ? ` [from ${upload.filename}]` : ''
    lines.push(
      `- ${date} | ${evt.category} | ${evt.metric}: ${valueLabel}${fileTag}`,
    )
  }
  lines.push('</ingested_events>')
  lines.push('')
  lines.push(
    'When you cite a number from <ingested_events>, mention the source ' +
      "filename (e.g. 'from rowing-erg.csv') so the coach can trace it.",
  )
  return lines.join('\n')
}
