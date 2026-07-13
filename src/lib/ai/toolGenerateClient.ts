/**
 * Frontend client for the `tool-generate` Supabase Edge Function.
 *
 * Sprint 9.2 — wires the Build workspace to the Anthropic-powered
 * generator that landed in PR 9.1. Three response kinds:
 *
 *   - 'spec' → Claude built a tool. Validate with zod, return spec.
 *   - 'clarification' → Claude needs more info. Return questions.
 *   - 'declined' → Out-of-scope ask. Return reason + alternative.
 *
 * The mock keyword matcher (`generateToolSpec` in mockGenerator.ts) is
 * the fallback when Supabase isn't configured (demo profiles without
 * a real session). The Build workspace dispatches between live + mock
 * via `getAIClientMode()`.
 */
import { supabase } from '@lib/supabaseClient'
import { isClaudeConfigured } from '@lib/ai/env'
import { ToolSpecSchema, type ToolSpec } from '@lib/tools/schema'

const FUNCTION_PATH = '/functions/v1/tool-generate'

export type GenerateRequest = {
  description: string
  role: 'head_coach' | 'assistant_coach' | 'athlete'
  team_id: string
  /** Pass to refine an existing request (multi-turn). Null = new request. */
  tool_request_id?: string | null
}

export type GenerateResult =
  | {
      kind: 'spec'
      tool_request_id: string
      version_id: string
      turn_number: number
      spec: ToolSpec
      summary: string
      unmet_connectors: string[]
    }
  | {
      kind: 'clarification'
      tool_request_id: string
      version_id: string
      turn_number: number
      questions: string[]
      summary: string
    }
  | {
      kind: 'declined'
      tool_request_id: string
      version_id: string
      turn_number: number
      reason: string
      suggested_alternative: string
      summary: string
    }

export class ToolGenerateError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.name = 'ToolGenerateError'
    this.status = status
  }
}

export function isToolGenerateConfigured(): boolean {
  return isClaudeConfigured()
}

/**
 * POST to /functions/v1/tool-generate. Authenticates via the live
 * Supabase session's access token. Throws ToolGenerateError on any
 * non-2xx response.
 */
export async function generateToolViaEdge(
  args: GenerateRequest,
): Promise<GenerateResult> {
  if (!supabase) {
    throw new ToolGenerateError('Supabase is not configured', 500)
  }

  // Race recovery — same pattern as claude.ts:authHeaders. The demo
  // flow's signInAnonymously fires in the background; if the user
  // hits send before it lands, getSession returns null. Wait briefly,
  // then attempt a recovery sign-in if still empty.
  let session = (await supabase.auth.getSession()).data.session
  if (!session) {
    await new Promise((r) => setTimeout(r, 600))
    session = (await supabase.auth.getSession()).data.session
    if (!session) {
      try {
        await supabase.auth.signInAnonymously()
      } catch (err) {
        console.warn('[auth] tool-generate recovery anon sign-in threw', err)
      }
      session = (await supabase.auth.getSession()).data.session
    }
  }
  const token = session?.access_token
  if (!token) {
    throw new ToolGenerateError(
      'Not signed in. Enable anonymous sign-ins in Supabase → Authentication → Providers if this persists.',
      401,
    )
  }

  const baseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || ''
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

  const res = await fetch(`${baseUrl}${FUNCTION_PATH}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
    body: JSON.stringify({
      description: args.description,
      role: args.role,
      team_id: args.team_id,
      ...(args.tool_request_id ? { tool_request_id: args.tool_request_id } : {}),
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ToolGenerateError(
      `tool-generate ${res.status}: ${text || res.statusText}`,
      res.status,
    )
  }

  const json = (await res.json()) as Record<string, unknown>
  return parseEdgeResponse(json)
}

function parseEdgeResponse(payload: Record<string, unknown>): GenerateResult {
  const kind = payload.kind
  const tool_request_id = String(payload.tool_request_id ?? '')
  const version_id = String(payload.version_id ?? '')
  const turn_number = typeof payload.turn_number === 'number' ? payload.turn_number : 1
  const summary = typeof payload.summary === 'string' ? payload.summary : ''

  if (kind === 'spec') {
    // Re-validate via zod so a malformed-but-server-accepted spec
    // can't reach the renderer. The Edge Function does basic shape
    // checks; zod is the strict gate.
    const parsed = ToolSpecSchema.safeParse(payload.spec)
    if (!parsed.success) {
      throw new ToolGenerateError(
        `Server returned a spec that fails strict validation: ${parsed.error.issues[0]?.message ?? 'unknown'}`,
      )
    }
    const unmet = Array.isArray(payload.unmet_connectors)
      ? (payload.unmet_connectors as unknown[]).filter(
          (v): v is string => typeof v === 'string',
        )
      : []
    return {
      kind: 'spec',
      tool_request_id,
      version_id,
      turn_number,
      spec: parsed.data,
      summary,
      unmet_connectors: unmet,
    }
  }

  if (kind === 'clarification') {
    const questions = Array.isArray(payload.questions)
      ? (payload.questions as unknown[]).filter(
          (v): v is string => typeof v === 'string',
        )
      : []
    return {
      kind: 'clarification',
      tool_request_id,
      version_id,
      turn_number,
      questions,
      summary,
    }
  }

  if (kind === 'declined') {
    return {
      kind: 'declined',
      tool_request_id,
      version_id,
      turn_number,
      reason: typeof payload.reason === 'string' ? payload.reason : '',
      suggested_alternative:
        typeof payload.suggested_alternative === 'string'
          ? payload.suggested_alternative
          : '',
      summary,
    }
  }

  throw new ToolGenerateError(`Unknown response kind: ${String(kind)}`)
}
