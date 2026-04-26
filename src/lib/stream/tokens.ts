import { StreamChat } from 'stream-chat'

/**
 * Browser-safe auth: GetStream **development tokens** (enable in Stream dashboard).
 * Production must issue JWTs from a backend / Edge Function — never ship API secret to clients.
 */
export function getStreamUserToken(apiKey: string, userId: string): string {
  const inst = StreamChat.getInstance(apiKey)
  return inst.devToken(userId)
}
