/**
 * Google Sheets connector — client wrapper.
 *
 * Three-step flow:
 *   1. initiateSheetsConnect()      kicks off Supabase Google OAuth with
 *                                    the extra spreadsheets.readonly scope
 *                                    and offline access so we get a
 *                                    refresh_token. Page redirects out;
 *                                    on return the session carries
 *                                    provider_token + provider_refresh_token.
 *
 *   2. completeSheetsConnect()      called on the post-OAuth page (we look
 *                                    for `?connect=google_sheets` in the URL).
 *                                    Reads the provider tokens from the
 *                                    session and posts them to the
 *                                    `sheets-sync` Edge Function so the
 *                                    server stores them on the team's
 *                                    connector_accounts row.
 *
 *   3. fetchSheetAsUpload(url)      tells sheets-sync to pull the sheet's
 *                                    values, write them as a CSV into the
 *                                    `uploads` bucket, and return the same
 *                                    StorageUploadResult shape the manual
 *                                    upload flow uses. The caller then
 *                                    calls requestParse() from uploadClient,
 *                                    which goes through the standard
 *                                    /ingest/parse → preview pipeline.
 *
 * This means a Google Sheet ingestion looks identical to a manual CSV
 * upload from the moment values are on disk — single preview UI, single
 * confirm path, single Claude extraction.
 */

import { supabase } from '@lib/supabaseClient'
import type { StorageUploadResult } from '@lib/ingest/uploadClient'

const SCOPE_READONLY = 'https://www.googleapis.com/auth/spreadsheets.readonly'

export const SHEETS_CONNECT_PARAM = 'connect'
export const SHEETS_CONNECT_VALUE = 'google_sheets'

/**
 * Begins the OAuth handshake. Browser will redirect to Google, then back
 * to `redirectTo`. The post-redirect page should call completeSheetsConnect
 * to capture the new provider tokens into Supabase + our server.
 */
export async function initiateSheetsConnect(opts: {
  /** Where Google should send the user back. Must be allow-listed in
   *  Supabase Authentication → URL Configuration. */
  redirectTo: string
}): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')

  // We always re-prompt with `prompt=consent` so the user re-grants
  // offline access — Google only returns a refresh_token on the first
  // consent for a given (user, client, scope) tuple, and we want one
  // every time someone clicks Connect.
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: opts.redirectTo,
      scopes: SCOPE_READONLY,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        // Hand Google the URL it should redirect back to once it's done.
        // (Supabase echoes redirectTo here too — this is belt + suspenders.)
        include_granted_scopes: 'true',
      },
    },
  })
  if (error) throw error
}

/**
 * Reads provider tokens out of the current Supabase session and stores
 * them server-side. Should be called when a post-OAuth landing page
 * detects `?connect=google_sheets` in the URL.
 *
 * Returns the connector account summary on success, or null when no
 * provider tokens are present (e.g. user navigated here directly).
 */
export async function completeSheetsConnect(): Promise<{
  ok: boolean
  email: string | null
  hasRefreshToken: boolean
} | null> {
  if (!supabase) throw new Error('Supabase is not configured')

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not signed in')

  // Supabase exposes the Google access token on the session immediately
  // after the OAuth roundtrip. It's only there once — refreshing the
  // page or re-getting the session via auth.refreshSession() drops it.
  // So we must consume it now.
  const providerToken = session.provider_token
  const providerRefreshToken = session.provider_refresh_token
  if (!providerToken) return null

  // Email (so the UI can show "connected as alice@example.com") is on
  // the user's identity row.
  const googleIdentity = session.user.identities?.find((i) => i.provider === 'google')
  const email =
    (googleIdentity?.identity_data?.email as string | undefined) ??
    session.user.email ??
    null

  const result = await callSheetsSync({
    action: 'connect',
    provider_token: providerToken,
    provider_refresh_token: providerRefreshToken ?? undefined,
    email: email ?? undefined,
    // Supabase doesn't expose expires_in cleanly; Google access tokens
    // are 1h by default. We pass 3600 as a hint — the server stamps an
    // absolute expires_at off this, then refreshes proactively.
    expires_in: 3600,
    scopes: SCOPE_READONLY,
  }) as {
    ok: boolean
    email?: string | null
    has_refresh_token?: boolean
  }

  return {
    ok: Boolean(result.ok),
    email: result.email ?? email,
    hasRefreshToken: Boolean(result.has_refresh_token),
  }
}

/**
 * Asks the server to fetch the sheet at `url`, write it to storage as
 * CSV, and hand us back the same shape a manual CSV upload produces.
 * The caller then hands this directly to `requestParse()`.
 */
export async function fetchSheetAsUpload(
  url: string,
): Promise<StorageUploadResult> {
  const result = (await callSheetsSync({
    action: 'fetch',
    sheet_url: url,
  })) as {
    storage_path: string
    filename: string
    mime_type: string
    kind: 'csv'
    rows_fetched: number
  }
  return {
    storagePath: result.storage_path,
    filename: result.filename,
    mimeType: result.mime_type,
    size: 0,  // unknown without HEAD; not needed downstream
    kind: result.kind,
  }
}

export async function disconnectSheets(): Promise<void> {
  await callSheetsSync({ action: 'disconnect' })
}

// ─── Internal ─────────────────────────────────────────────────────────────

async function callSheetsSync(
  body: Record<string, unknown>,
): Promise<unknown> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not signed in')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const url = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/sheets-sync`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let msg = `sheets-sync ${res.status}`
    try {
      const j = (await res.json()) as { error?: unknown }
      if (j && typeof j.error === 'string') msg = j.error
    } catch {
      /* fall through */
    }
    throw new Error(msg)
  }
  return await res.json()
}
