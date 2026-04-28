# Production hardening (checklist)

Aligned with roadmap Phase 7.

## Reliability

- Idempotent connector sync (cursor per source in `sync_runs` / connector metadata).
- Dedupe keys on `raw_ingest_payloads.body_hash` before reprocessing.
- Dead-letter or `failed` status with retry backoff for write-back queue.

## Observability

- Client: `src/lib/observability.ts` — gate logs with `VITE_LOG_LEVEL`.
- Server: structured JSON logs for sync jobs, AI import job IDs, write-back outcomes.

## Security

- Branch protection + CI (see `CONTRIBUTING.md` and `.github/workflows/ci.yml`).
- Secrets only in GitHub Actions / Supabase secrets — not in Vite env except anon key.

## Compliance

- Document athlete consent for health data before enabling wearables at scale.
- Export/delete path when backend stores PII.

## Release

- Staging Vercel project + production; feature flags via `src/lib/featureFlags.ts` and env.