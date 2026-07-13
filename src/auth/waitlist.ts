import { supabase } from '@lib/supabaseClient'

/** Baseline "social proof" floor — displayed count is BASE + real count. */
export const WAITLIST_BASE = 205

/** localStorage key for the locally-persisted entry so a returning visitor
 *  lands back on their queue confirmation instead of the empty form. */
const ENTRY_STORAGE_KEY = 'synth:waitlist:entry'

export type WaitlistEntry = {
  email: string
  name: string
  sport: string
  position: number   // total of BASE + real count at the moment of join
  joinedAt: number
}

export function loadStoredEntry(): WaitlistEntry | null {
  try {
    const raw = localStorage.getItem(ENTRY_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.email === 'string' && typeof parsed.position === 'number') {
      return parsed as WaitlistEntry
    }
  } catch { /* ignore */ }
  return null
}

export function clearStoredEntry(): void {
  try { localStorage.removeItem(ENTRY_STORAGE_KEY) } catch { /* ignore */ }
}

function persistEntry(entry: WaitlistEntry): void {
  try { localStorage.setItem(ENTRY_STORAGE_KEY, JSON.stringify(entry)) } catch { /* ignore */ }
}

/** Return the displayed total (BASE + real Supabase count). Falls back to
 *  BASE if Supabase isn't configured or the request errors. */
export async function fetchWaitlistCount(): Promise<number> {
  if (!supabase) return WAITLIST_BASE
  const { data, error } = await supabase
    .from('waitlist_count')
    .select('total')
    .eq('id', true)
    .single()
  if (error || !data) return WAITLIST_BASE
  return WAITLIST_BASE + (data.total as number)
}

export type JoinResult =
  | { ok: true; entry: WaitlistEntry; alreadyOnList: boolean }
  | { ok: false; error: string }

/** Insert the entry into public.waitlist. Returns the user's position
 *  (== current total after insert). Idempotent on the email: if the
 *  email already exists we surface that gracefully and look up the
 *  current count so they still get a confirmation screen. */
export async function joinWaitlist(input: {
  email: string
  name?: string
  sport?: string
}): Promise<JoinResult> {
  const email = input.email.trim().toLowerCase()
  const name = (input.name ?? '').trim()
  const sport = (input.sport ?? '').trim()

  if (!supabase) {
    // No DB — fall back to local-only entry so the UI still works in
    // env-less previews.
    const position = WAITLIST_BASE + 1
    const entry: WaitlistEntry = { email, name, sport, position, joinedAt: Date.now() }
    persistEntry(entry)
    return { ok: true, entry, alreadyOnList: false }
  }

  const { error } = await supabase
    .from('waitlist')
    .insert({ email, name: name || null, sport: sport || null })

  // 23505 = unique_violation — they're already on the list. Treat as success.
  let alreadyOnList = false
  if (error) {
    if (error.code === '23505') {
      alreadyOnList = true
    } else {
      return { ok: false, error: error.message }
    }
  }

  const position = await fetchWaitlistCount()
  const entry: WaitlistEntry = {
    email,
    name,
    sport,
    position,
    joinedAt: Date.now(),
  }
  persistEntry(entry)
  return { ok: true, entry, alreadyOnList }
}

/** Subscribe to live updates of the waitlist_count singleton. Returns
 *  an unsubscribe function. Callback fires with the new total (already
 *  including WAITLIST_BASE). */
export function subscribeToWaitlistCount(
  onUpdate: (total: number) => void,
): () => void {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('waitlist_count_live')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'waitlist_count' },
      payload => {
        const next = payload.new as { total: number } | null
        if (next && typeof next.total === 'number') {
          onUpdate(WAITLIST_BASE + next.total)
        }
      },
    )
    .subscribe()
  return () => {
    const client = supabase
    if (client) void client.removeChannel(channel)
  }
}
