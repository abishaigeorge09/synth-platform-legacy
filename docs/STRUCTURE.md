# src/ structure — surfaces map

The `src/` tree is organized by **product surface**. Each of the three surfaces —
landing pages, the desktop webapp, and the installable PWA — lives under its own
folder, with cross-cutting code split into `shared`, `lib`, `auth`, and `pages`.

## Surface map

| Surface | Location | What it is |
|---|---|---|
| Landing | `src/surfaces/landing/` | Public marketing site + PWA install |
| Webapp (coach) | `src/surfaces/webapp/coach/` | Desktop coach dashboard: dashboard, athletes, sources, tools, AI, settings, synth. Agent |
| Webapp (athlete) | `src/surfaces/webapp/athlete/` | Desktop `/athlete` view |
| PWA | `src/surfaces/pwa/` | Installable app (coach + athlete mobile experiences, onboarding, desktop-intercept) |

## Cross-cutting trees

| Tree | Location | What it is |
|---|---|---|
| Shared | `src/shared/` | Layout, stores, analytics, illustrations, intelligence, tutorial, shared components, and `data/` (types, seeds, `prototype/`) |
| Lib | `src/lib/` | Framework-agnostic helpers: theme, motion, supabase client, ai, tools, ingest, stream, telemetry |
| Auth | `src/auth/` | `LoginPage`, `JoinWithInvitePage` |
| Pages | `src/pages/` | Standalone public pages: `legal/`, `productDemo/`, `notFound/`, `gate/` |
| App | `src/app/` | Route config (`routes.tsx`) + route prefetch |

## Path aliases

Cross-folder imports use aliases instead of deep relative paths. Defined in
`tsconfig.app.json` (`compilerOptions.paths`) and mirrored in `vite.config.ts` and
`vitest.config.ts` (`resolve.alias`).

| Alias | Target |
|---|---|
| `@shared/*` | `src/shared/*` |
| `@lib/*` | `src/lib/*` |
| `@app/*` | `src/app/*` |
| `@auth/*` | `src/auth/*` |
| `@surfaces/*` | `src/surfaces/*` |
| `@pages/*` | `src/pages/*` |
| `@/*` | `src/*` |

**Convention:** use an alias whenever an import reaches out of its feature into the
shared/lib/app trees or across surfaces (e.g. the PWA importing webapp data). Imports
between siblings *inside* the same feature stay relative — they move together, so their
relative paths survive refactors.

## Where the old folders went

| Old | New |
|---|---|
| `src/features/landing` | `src/surfaces/landing` |
| `src/features/coach` | `src/surfaces/webapp/coach` |
| `src/features/athlete` | `src/surfaces/webapp/athlete` |
| `src/features/app` | `src/surfaces/pwa` |
| `src/features/auth` | `src/auth` |
| `src/features/{legal,productDemo,notFound,gate}` | `src/pages/{legal,productDemo,notFound,gate}` |
| `src/prototype` | `src/shared/data/prototype` |
| `src/components` | `src/shared/components` |
