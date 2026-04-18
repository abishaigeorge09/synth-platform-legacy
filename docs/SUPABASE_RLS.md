# Supabase RLS checklist (production)

When the Supabase project is created from [`SCHEMA.md`](SCHEMA.md):

1. Enable RLS on every table listed in §1–6 and §9.
2. Policies follow the matrix in SCHEMA §6 and §9 (team boundary: `team_id` matches `auth.uid()`'s team via `users.team_id`).
3. **Never** expose `service_role` in the browser; connector OAuth tokens stay in Edge Functions or vault tables readable only by service role.
4. `raw_ingest_payloads`, `connector_accounts`, `connector_write_back_queue`: coach/staff only.
5. Athletes: `athlete_timeline_events` read where `athlete_id` is self or coach on same team per product rules.

Review policies after each migration; use Supabase dashboard “Policy” tests before shipping.
