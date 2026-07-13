/**
 * Apple Health webhook — coach-side helpers.
 *
 * The webhook itself is a server endpoint that doesn't require JWT
 * (an Apple Shortcut POSTs to it from the athlete's phone). What we
 * manage from the coach client is the *secret* — generate one, store
 * it on the team's apple_health connector_accounts row, then read it
 * back so the coach can copy/paste the URL into a Shortcut.
 *
 * All writes happen via the regular RLS-protected supabase client so
 * a coach can only touch their own team's secret. The webhook itself
 * looks the secret up via the service-role key (see the Edge Function).
 */

import { supabase } from '@lib/supabaseClient'
import type { UUID } from '@shared/data/types'

const PROVIDER = 'apple_health'
const SECRET_BYTES = 32  // 256 bits of entropy — overkill for a URL secret, fine.

export const HEALTH_WEBHOOK_FUNCTION = 'health-webhook'

type Row = {
  id: string
  team_id: string
  status: 'connected' | 'expired' | 'revoked' | 'error'
  config_json: { secret?: string } | null
  last_sync_at: string | null
}

/** Returns the webhook URL the user should paste into the Shortcut. */
export function buildWebhookUrl(secret: string): string {
  const base = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, '')
  return `${base}/functions/v1/${HEALTH_WEBHOOK_FUNCTION}?secret=${encodeURIComponent(secret)}`
}

/** URL-safe base64 over the given byte count. ~43 chars at 32 bytes. */
function randomSecret(): string {
  const bytes = new Uint8Array(SECRET_BYTES)
  crypto.getRandomValues(bytes)
  // base64url — no padding, web-safe alphabet
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export type HealthConnectorSummary = {
  status: 'connected' | 'revoked' | 'absent'
  secret: string | null
  webhookUrl: string | null
  lastSyncAt: string | null
}

export async function getHealthConnector(
  teamId: UUID,
): Promise<HealthConnectorSummary> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('connector_accounts')
    .select('id, team_id, status, config_json, last_sync_at')
    .eq('team_id', teamId)
    .eq('provider', PROVIDER)
    .maybeSingle<Row>()
  if (error) throw error
  if (!data) {
    return { status: 'absent', secret: null, webhookUrl: null, lastSyncAt: null }
  }
  const secret = data.config_json?.secret ?? null
  return {
    status: data.status === 'connected' ? 'connected' : 'revoked',
    secret,
    webhookUrl: secret ? buildWebhookUrl(secret) : null,
    lastSyncAt: data.last_sync_at,
  }
}

/**
 * Generates a new secret and either inserts the connector row or
 * updates it in place. Returns the freshly built webhook URL.
 *
 * Rotating the secret is the same operation — call this again to
 * invalidate the previous webhook URL.
 */
export async function enableHealthWebhook(
  teamId: UUID,
): Promise<HealthConnectorSummary> {
  if (!supabase) throw new Error('Supabase is not configured')
  const secret = randomSecret()

  const { data: existing } = await supabase
    .from('connector_accounts')
    .select('id')
    .eq('team_id', teamId)
    .eq('provider', PROVIDER)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from('connector_accounts')
      .update({
        status: 'connected',
        display_name: 'Apple Health',
        config_json: { secret },
        last_sync_at: null,
      })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('connector_accounts').insert({
      team_id: teamId,
      provider: PROVIDER,
      display_name: 'Apple Health',
      status: 'connected',
      config_json: { secret },
    })
    if (error) throw error
  }

  return {
    status: 'connected',
    secret,
    webhookUrl: buildWebhookUrl(secret),
    lastSyncAt: null,
  }
}

/** Marks the row as revoked. The webhook will start rejecting requests. */
export async function disableHealthWebhook(teamId: UUID): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase
    .from('connector_accounts')
    .update({ status: 'revoked', config_json: {} })
    .eq('team_id', teamId)
    .eq('provider', PROVIDER)
  if (error) throw error
}

/**
 * Sample Shortcut JSON spec — paste into a "Get Contents of URL"
 * action's body. Coaches can hand this to athletes verbatim.
 */
export const SAMPLE_SHORTCUT_BODY = `{
  "athlete_email": "ella@example.com",
  "samples": [
    {
      "type": "HKQuantityTypeIdentifierHeartRateVariabilitySDNN",
      "value": "[Latest HRV reading]",
      "unit": "ms",
      "start_date": "[Today's date · ISO 8601]",
      "end_date": "[Today's date · ISO 8601]"
    }
  ]
}`
