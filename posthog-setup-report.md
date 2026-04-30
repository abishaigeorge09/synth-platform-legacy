<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the synth. platform. The setup covers user identification on login, 12 custom business events across 7 files, PostHog provider + error boundary wrapping, and environment variable configuration.

## Changes summary

- **`src/main.tsx`** — Wrapped the app with `PostHogProvider` and `PostHogErrorBoundary` from `@posthog/react`, enabling `usePostHog()` hooks and automatic React error capture across all routes.
- **`src/shared/analytics/posthog.ts`** — Already initialised `posthog-js`; now also exports the `posthog` singleton for direct use in non-hook contexts.
- **`.env`** — Added `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` with the project token and US host.
- **Event capture** added to 6 feature files (see table below).

## Events

| Event | Description | File |
|---|---|---|
| `signed_in` | User signed in (coach or athlete) via the login form; also calls `posthog.identify()` | `src/features/auth/LoginPage.tsx` |
| `athlete_joined_via_invite` | Athlete submitted an invite code and joined their team | `src/features/auth/JoinWithInvitePage.tsx` |
| `ai_message_sent` | User sent a message to synth. AI (team / athlete / self scope) | `src/features/coach/ai/ChatView.tsx` |
| `ai_suggestion_clicked` | User clicked a suggested prompt in the AI empty state | `src/features/coach/ai/ChatView.tsx` |
| `lineup_published` | Coach published a lineup (athletes notified) | `src/features/coach/tools/lineups/LineupsPage.tsx` |
| `lineup_suggestion_applied` | Coach applied the AI-suggested lineup from the Insights tab | `src/features/coach/tools/lineups/LineupsPage.tsx` |
| `add_source_clicked` | Coach clicked '+ Add source' to open the synth. Agent modal | `src/features/coach/sources/SourcesPage.tsx` |
| `roster_csv_exported` | Coach exported the roster or a selection of athletes to CSV | `src/features/coach/athletes/AthletesPage.tsx` |
| `athletes_compared` | Coach initiated a side-by-side comparison of two athletes | `src/features/coach/athletes/AthletesPage.tsx` |
| `athlete_bulk_status_updated` | Coach bulk-updated status of selected athletes | `src/features/coach/athletes/AthletesPage.tsx` |
| `session_timer_finished` | A piece/session was finished on the session timer (splits recorded) | `src/features/coach/tools/sessionTimer/SessionTimerPage.tsx` |
| `athlete_profile_tab_switched` | Coach switched tabs on an athlete profile page | `src/features/coach/athletes/AthleteProfilePage.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard** — [Analytics basics](https://us.posthog.com/project/403667/dashboard/1527532)
- **Insight** — [Sign-ins over time](https://us.posthog.com/project/403667/insights/NFWQHLdX) — Daily login trend
- **Insight** — [Coach activation funnel](https://us.posthog.com/project/403667/insights/AD8MNrsm) — Sign in → Add source → Publish lineup conversion
- **Insight** — [synth. AI messages sent](https://us.posthog.com/project/403667/insights/f7xShy9l) — AI message + suggestion-click volume over time
- **Insight** — [Lineup + session activity](https://us.posthog.com/project/403667/insights/fJYAfvep) — Lineups published and sessions finished per day
- **Insight** — [Athlete invite → onboarding retention](https://us.posthog.com/project/403667/insights/HHGVpoUT) — Weekly retention cohorts for invited athletes

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
