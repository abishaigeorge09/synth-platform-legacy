import { supabase } from './supabaseClient'

/**
 * Waitlist signup submit. Inserts one row into `public.waitlist`
 * (see supabase/migrations/20260704_waitlist.sql) using the public
 * anon client. The table's RLS allows anonymous INSERT only, so no
 * auth/session is required — a fresh visitor can join.
 *
 * Returns a discriminated result the page can render directly. We never
 * throw for expected cases (duplicate email, not-configured) so the form
 * stays a simple `await` with no try/catch at the call site.
 */
export type WaitlistResult =
  | { status: 'joined' }
  | { status: 'already' } // email was already on the list — treat as success
  | { status: 'error'; message: string }

// Deliberately loose — catches the obvious typos ("foo", "foo@bar") without
// pretending to fully validate email (RFC 5322 is a rabbit hole; the
// confirmation email is the real check when we add one).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

export async function joinWaitlist(
  emailRaw: string,
  opts: { note?: string; source?: string } = {},
): Promise<WaitlistResult> {
  const email = emailRaw.trim().toLowerCase()

  if (!isValidEmail(email)) {
    return { status: 'error', message: 'Enter a valid email address.' }
  }

  if (!supabase) {
    // Env vars missing at build time — supabaseClient.ts already logged a
    // loud warning. Fail explicitly instead of silently dropping the signup.
    return {
      status: 'error',
      message: 'Signups are temporarily unavailable. Please try again later.',
    }
  }

  const { error } = await supabase.from('waitlist').insert({
    email,
    note: opts.note?.trim() || null,
    source: opts.source ?? 'waitlist',
  })

  if (error) {
    // Postgres unique_violation → they're already on the list. That's a
    // success from the user's point of view, not an error.
    if (error.code === '23505') return { status: 'already' }
    return {
      status: 'error',
      message: 'Something went wrong. Please try again.',
    }
  }

  return { status: 'joined' }
}
