# Restructure notes — player-first data model

> Captured 2026-05-19. Working notes ahead of a structural plan. Do not treat as a spec yet.

## What's changing

We're restructuring the app away from coach-team-roster as the primary axis and toward **player (athlete) profile as the primary unit**. Coaches are out of scope for this pass.

### Core requirements (in the user's words)

1. **Player profiles are the unit of the app.** Each player has a profile; the app is organized around that profile. No coach context required right now.
2. **Each player has connections to apps.** A profile owns its own set of source connections (Strava, Apple Health, etc.) rather than the team owning them.
3. **Historical spreadsheets are first-class data.** The client has 2–3 years of tracking spreadsheets — sprints, weight, and other arbitrary metrics. We need to:
   - Categorize that spreadsheet data **sparsely per client/player** (different players have different columns; not every metric exists for every row).
   - Persist it against the right player.
4. **One player = one unified data view across sources.** Spreadsheet data + Strava activities + Apple Health metrics all need to roll up under a single player record, not sit in separate silos.

### Implications to think through in the plan

- Schema needs a sparse, per-athlete, per-metric event store — not a fixed column-per-metric table. (The existing `ingestion_events` table in `supabase/migrations/20260507_ingestion.sql` is already shaped this way: `metric`, `value`, `unit`, `category`, `occurred_at` — worth reusing.)
- Connector accounts move from `team_id` scoped to `athlete_id` scoped.
- The current demo seed of "Pacific Women's Rowing + 46 athletes" stops being the anchor. We need a single-player onboarding flow.
- The coach surface (`/coach/*`) can stay running but isn't the target — `/athlete/*` and `/app/athlete/*` become the focus.

### Out of scope for this pass

- Coach dashboard, team analytics, lineups, session timer, AI chat with team scope.
- Multi-team / multi-player coach workflows.

### Not yet decided

- Whether we treat the historical spreadsheet as a one-shot import or an ongoing source.
- Whether connectors live on the player record directly or on a per-player "connections" sub-entity.
- Auth model for a single-player app (today's auth assumes coach + invite codes).
