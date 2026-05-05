/**
 * Published-tool catalog helpers.
 *
 * Sprint 10 — head coaches publish a tool_versions row to their team
 * by flipping `published` to true. Assistant coaches + athletes see
 * published rows in the Custom Tools Catalog tab.
 *
 * Stays separate from `toolGenerateClient.ts` so the Build flow doesn't
 * import unrelated catalog code.
 */
import { supabase } from '../supabaseClient'
import { ToolSpecSchema, type ToolSpec } from '../tools/schema'

export type PublishedTool = {
  versionId: string
  toolRequestId: string
  publishedAt: string
  publishedBy: string | null
  spec: ToolSpec
}

export class PublishToolsError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.name = 'PublishToolsError'
    this.status = status
  }
}

/**
 * Mark a tool_versions row published. RLS already restricts writes to
 * coaches on the same team — head_coach role is enforced in the UI
 * (assistant coaches don't see the publish button).
 */
export async function publishToolVersion(versionId: string): Promise<void> {
  if (!supabase) throw new PublishToolsError('Supabase not configured', 500)
  const { error } = await supabase
    .from('tool_versions')
    .update({
      published: true,
      published_at: new Date().toISOString(),
      published_by: (await supabase.auth.getUser()).data.user?.id ?? null,
    })
    .eq('id', versionId)
  if (error) throw new PublishToolsError(error.message, 500)
}

/**
 * Unpublish — used by the head coach to retract a tool. Newer published
 * versions of the same tool spec id stay visible.
 */
export async function unpublishToolVersion(versionId: string): Promise<void> {
  if (!supabase) throw new PublishToolsError('Supabase not configured', 500)
  const { error } = await supabase
    .from('tool_versions')
    .update({ published: false })
    .eq('id', versionId)
  if (error) throw new PublishToolsError(error.message, 500)
}

/**
 * Fetch every published tool_versions row for the team, newest first.
 * The caller deduplicates by spec.id so old versions of the same tool
 * don't crowd the catalog (catalog shows the latest published spec per id).
 */
export async function fetchPublishedTeamTools(
  teamId: string,
): Promise<PublishedTool[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('tool_versions')
    .select('id, tool_request_id, spec_json, published_at, published_by')
    .eq('team_id', teamId)
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (error) {
    console.error('fetchPublishedTeamTools failed', error)
    return []
  }

  const out: PublishedTool[] = []
  const seen = new Set<string>()
  for (const row of (data ?? []) as Array<{
    id: string
    tool_request_id: string
    spec_json: unknown
    published_at: string | null
    published_by: string | null
  }>) {
    const parsed = ToolSpecSchema.safeParse(row.spec_json)
    if (!parsed.success) continue
    if (seen.has(parsed.data.id)) continue
    seen.add(parsed.data.id)
    out.push({
      versionId: row.id,
      toolRequestId: row.tool_request_id,
      publishedAt: row.published_at ?? '',
      publishedBy: row.published_by,
      spec: parsed.data,
    })
  }
  return out
}
