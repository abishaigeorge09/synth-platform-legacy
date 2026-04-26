import { StreamChat } from 'stream-chat'
import { isStreamConfigured } from './env'

let client: StreamChat | null = null

export function getStreamClient(): StreamChat | null {
  if (!isStreamConfigured()) return null
  const key = import.meta.env.VITE_STREAM_API_KEY as string
  if (!client) {
    client = StreamChat.getInstance(key)
  }
  return client
}

export async function disconnectStreamClient(): Promise<void> {
  if (!client) return
  try {
    await client.disconnectUser()
  } catch {
    // already disconnected
  }
}
