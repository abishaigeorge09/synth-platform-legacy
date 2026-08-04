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

/** The full survey payload written alongside the email. Every field optional
 *  so a bare email still joins; keys map 1:1 to public.waitlist columns. */
export type WaitlistInput = {
  email: string
  name?: string
  sport?: string
  role?: string
  university?: string
  wearable?: string
  tools?: string[]
  trackWants?: string[]
  dimensionality?: string
  userAgent?: string
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
export async function joinWaitlist(input: WaitlistInput): Promise<JoinResult> {
  const email = input.email.trim().toLowerCase()
  const name = (input.name ?? '').trim()
  const sport = (input.sport ?? '').trim()

  if (!supabase) {
    // In production a null client means the build is missing
    // VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Fail LOUDLY rather than
    // faking success and silently dropping the signup (the historic bug).
    if (import.meta.env.PROD) {
      console.error(
        '[waitlist] Supabase client is null in production. VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing from the build — the signup was NOT recorded. Set them in the Vercel project env.',
      )
      return { ok: false, error: 'Waitlist is temporarily unavailable. Please try again shortly.' }
    }
    // Dev only: local-only entry so env-less previews still demo the flow.
    const position = WAITLIST_BASE + 1
    const entry: WaitlistEntry = { email, name, sport, position, joinedAt: Date.now() }
    persistEntry(entry)
    return { ok: true, entry, alreadyOnList: false }
  }

  const tools = (input.tools ?? []).filter(Boolean)
  const trackWants = (input.trackWants ?? []).filter(Boolean)

  const { error } = await supabase.from('waitlist').insert({
    email,
    name: name || null,
    sport: sport || null,
    role: input.role || null,
    university: input.university || null,
    wearable: input.wearable || null,
    tools: tools.length ? tools : null,
    track_wants: trackWants.length ? trackWants : null,
    dimensionality: input.dimensionality || null,
    user_agent: input.userAgent || null,
  })

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
