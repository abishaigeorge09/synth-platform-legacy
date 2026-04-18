import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Live Supabase browser client. Null when env vars are missing — the UI stays in demo mode.
 * Connector secrets and service-role operations must run on the server only.
 */
export const supabase: SupabaseClient | null =
  url && anonKey && url.length > 0 && anonKey.length > 0 ? createClient(url, anonKey) : null

export function isSupabaseConfigured(): boolean {
  return supabase !== null
}
