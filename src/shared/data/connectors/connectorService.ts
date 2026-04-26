import type { ConnectorProvider } from '../types'
import { log } from '../../../lib/observability'

export type ConnectResult = { ok: boolean; message: string }

/**
 * Stub OAuth / connect flows. Replace with Edge Functions that hold client secrets.
 */
export async function connectConnector(provider: ConnectorProvider): Promise<ConnectResult> {
  log.info('connector.connect (stub)', provider)
  await new Promise((r) => setTimeout(r, 400))
  return { ok: true, message: `${provider} connected (demo — wire OAuth on the server).` }
}

export async function syncConnector(provider: ConnectorProvider): Promise<ConnectResult> {
  log.info('connector.sync (stub)', provider)
  await new Promise((r) => setTimeout(r, 300))
  return { ok: true, message: `Sync queued for ${provider}.` }
}
