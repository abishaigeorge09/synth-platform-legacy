# Marketing surface — handoff

> Snapshot of everything shipped in PRs **#39 → #41**: the multi-page
> Kitman/Giga-inspired landing, the auth surface with photo slideshow,
> the DB-backed waitlist with realtime, and the team portraits.
>
> If something on the public site looks wrong or needs to change, start
> here — every file path, every database object, and every "where do I
> change X" question should be answered below.

## 1. What's live

- **Public site**: <https://synthsports.co>
- **Vercel project**: `synth-platform-alt` (team `team_gbBiqgTktOYto5eu84aDKCT3`, project `prj_Hok33AUiSwGHcDfTxPUcCUB7lDtA`)
- **Supabase project**: `xdxyqhqlaiwucvlfzsfa` ("synth_platform", us-east-2)
- **Auto-deploy**: every push to `main` triggers a Vercel production build (~2–3 min). See §13.

The marketing surface is **17 public pages + 2 auth pages**, all dark-mode, all reading from the same shell primitives. Auth + waitlist run against the live Supabase.

## 2. Repo map

```
src/features/landing/
├── LandingPage.tsx                   # / (home — hero, manifesto, pillars, tool wall, team, pricing, FAQ, closing)
├── Hero3D.tsx                        # LEGACY (older brutalist hero — unused on current /; left for git diff reference)
├── StepMockups.tsx                   # LEGACY (5-step mockups — unused)
├── useInstallPrompt.ts               # PWA install hook (still used by the nav Download link)
│
├── shell/
│   ├── tokens.ts                     # BG, FG, MUTED, DIM, HAIR, FAINT, GREEN, DRUK, MONO, BODY, SERIF
│   └── primitives.tsx                # KO, PrimaryButton, OutlineButton, Hairlines, Crosshairs,
│                                     # SectionLabel, Chevron, PlaceholderMedia, Nav (+ mobile menu),
│                                     # SideRail, Footer, StandardHero, ValueBridge, CapabilityList,
│                                     # FeaturedQuote, IntegrationsStrip, ClosingCta, PageShell
│
├── templates/
│   ├── ModulePage.tsx                # Generic platform module template (drives all 8 /platform/* pages)
│   └── SportPage.tsx                 # Generic sport template (drives all 6 /sports/* pages)
│
├── marketing/
│   ├── PlatformHubPage.tsx           # /platform
│   ├── SportsHubPage.tsx             # /sports
│   ├── WhyUsPage.tsx                 # /why-us
│   ├── ResourcesPage.tsx             # /resources
│   ├── PricingPage.tsx               # /pricing
│   ├── platformPages.tsx             # named-export wrappers for each /platform/<slug>
│   ├── sportPages.tsx                # same for /sports/<slug>
│   ├── moduleConfigs.tsx             # CONTENT — every platform module's copy
│   └── sportConfigs.tsx              # CONTENT — every sport's copy

src/features/auth/
├── AuthLayout.tsx                    # Split shell: left slideshow + right form + isolate stacking ctx
├── authShared.tsx                    # FieldLabel, TextInput, PrimaryAuthButton, GhostAuthButton, AuthHeader
├── authTokens.ts                     # AUTH_TOKENS constant (color + font tokens)
├── waitlist.ts                       # joinWaitlist / fetchWaitlistCount / subscribeToWaitlistCount + localStorage helpers
├── LoginPage.tsx                     # /login — Supabase email+password, Google OAuth, demo fallback
├── SignUpPage.tsx                    # /signup — waitlist form + queue confirmation + live count badge
└── JoinWithInvitePage.tsx            # /join/:code — unchanged from earlier work

src/app/routes.tsx                    # All routes, including the 17 lazy-loaded marketing pages
supabase/migrations/20260520_waitlist.sql   # waitlist table + count singleton + trigger + realtime publication

public/
├── hero-landscape.png                # Homepage hero photo (runners on a ridge)
├── auth-slides/
│   ├── slide-1.png                   # Trail runner — auth left panel slide 1
│   ├── slide-2.png                   # Cyclist — slide 2
│   ├── slide-3.png                   # Open-water swimmer — slide 3
│   └── slide-4.png                   # Football team — slide 4
└── team/
    ├── abishai.jpeg                  # Co-founder portraits (1:1 cards on home + /why-us)
    ├── matthew.png
    ├── star.png
    └── lily.png
```

## 3. Public page map

### Top-level / marketing
| URL | Component | Notes |
|---|---|---|
| `/` | `LandingPage` | Hero (Anton headline + serif lockup), trust marquee, manifesto, 3 billboard pillars (Connect / Synthesize / Act), 12-tool wall, **Built by champions** team grid, pricing tiers, FAQ, closing CTA |
| `/platform` | `PlatformHubPage` | 8-module grid + 6-sport grid + integrations strip + closing |
| `/sports` | `SportsHubPage` | 6-row sport directory with placeholder media |
| `/why-us` | `WhyUsPage` | Manifesto, timeline, team grid (same 4 co-founders) |
| `/resources` | `ResourcesPage` | Filterable resource grid (placeholder content) |
| `/pricing` | `PricingPage` | 3 tiers (Athlete $9 / Athlete Pro $19 / Team $199+) + included-in-every-tier strip + pricing FAQ |

### Platform module pages (template-driven)
All eight share `ModulePage` and read from `marketing/moduleConfigs.tsx`:

| URL | Module |
|---|---|
| `/platform/synth-core` | synth Core (foundational layer) |
| `/platform/recovery-health` | Recovery & Health |
| `/platform/training-load` | Training & Load |
| `/platform/progress-development` | Progress & Development |
| `/platform/team-operations` | Team Operations |
| `/platform/custom-analytics` | Custom Analytics |
| `/platform/integrations` | Integrations directory |
| `/platform/api` | API |

### Sport pages (template-driven)
All six share `SportPage` and read from `marketing/sportConfigs.tsx`:

| URL | Sport |
|---|---|
| `/sports/running` | Running |
| `/sports/cycling` | Cycling |
| `/sports/swimming` | Swimming |
| `/sports/rowing` | Rowing |
| `/sports/lifting` | Lifting |
| `/sports/teams` | For Teams (coach voice) |

### Auth
| URL | Component | What it does |
|---|---|---|
| `/login` | `LoginPage` | Supabase email+password sign-in + Google OAuth + demo fallback |
| `/signup` | `SignUpPage` | Waitlist form → queue confirmation (with realtime live count) |

## 4. Waitlist — database, schema, realtime

Migration file: [`supabase/migrations/20260520_waitlist.sql`](../supabase/migrations/20260520_waitlist.sql). Already applied to production.

### Tables

**`public.waitlist`** — append-only signup log. RLS on.
- `id uuid pk default gen_random_uuid()`
- `email text not null unique` ← duplicate emails are silently de-duped (23505 handled client-side)
- `name text`
- `sport text`
- `created_at timestamptz default now()`
- Policies: anon + authenticated can **INSERT**. Nobody can SELECT — emails stay private.

**`public.waitlist_count`** — singleton (one row, `id = true`) holding the running total.
- `id boolean pk default true` (singleton constraint enforces `id = true`)
- `total integer not null default 0`
- Policies: anon + authenticated can **SELECT**. No INSERT policy.

### Trigger

`trg_increment_waitlist_count` fires after every `waitlist` insert and bumps `waitlist_count.total` via the security-definer function `public.increment_waitlist_count()`.

### Realtime

`waitlist_count` is published to `supabase_realtime`. Front-end subscribes to UPDATE events; emails never go over the wire.

### Front-end contract

In `src/features/auth/waitlist.ts`:

```ts
WAITLIST_BASE = 205                    // baseline social-proof floor
fetchWaitlistCount()  → number         // returns 205 + waitlist_count.total
joinWaitlist({email,name,sport})       // INSERT + return position
subscribeToWaitlistCount(cb)           // realtime; cb(205 + newTotal) on every UPDATE
loadStoredEntry() / clearStoredEntry() // localStorage of the visitor's last entry
```

`SignUpPage` calls all four. Position displayed = `205 + <row count at moment of insert>`.

### Reading the data

There is no admin UI yet. To pull the signups:

```sql
-- raw waitlist (signups in order)
select email, name, sport, created_at
from public.waitlist
order by created_at desc;

-- total
select total from public.waitlist_count where id = true;
```

Use the Supabase Studio SQL editor or `mcp__claude_ai_Supabase__execute_sql`. RLS only allows SELECT through the service role, so dashboard SQL works; the anon front-end key cannot read raw rows.

## 5. Asset slots — where to drop new images

Every asset slot in the site has a fixed file path. Drop a new file with the same name and it picks up on next deploy (or hard-refresh locally for the dev server).

| Slot | File path | Recommended dimensions |
|---|---|---|
| Homepage hero photo | `/public/hero-landscape.png` | 1920×1080 minimum, 3840×2160 ideal; cool/desaturated, subject on the edges, quiet center for the headline |
| Auth slideshow (×4) | `/public/auth-slides/slide-{1..4}.{png,jpg}` | 1600×2400 portrait 2:3, < 500 KB each. List in `AuthLayout.tsx → SLIDES` |
| Co-founder portraits | `/public/team/{abishai,matthew,star,lily}.{jpeg,png}` | Square or close to it — they're cropped 1:1 with per-portrait `objectPosition` |
| Team-bio extra sport photos | None today — `PlaceholderMedia` shows a dashed-green slot wherever a future photo should go |
| Sport-page hero photos | None today — same `PlaceholderMedia` slots |

To audit what's still a placeholder vs a real image:

```bash
grep -rn "PlaceholderMedia" src/features/landing/
```

Each occurrence renders a dashed-green box labeled `// {kind} slot · {caption}`. Replace with `<img src="..." />` when the asset lands.

## 6. Brand & voice rules

Stored in memory at `~/.claude/projects/-Users-abishaigeorgegosula-synth-platform/memory/`. The hard rules:

1. **Brand mark**: write `synth` in prose. The period is reserved for the logo as a visual mark only. Never `synth.` in body copy.
2. **Voice default**: amateur athlete first person ("your training, your sleep, your morning"). Coach voice only on `/sports/teams` and `/platform/team-operations`.
3. **Banned words**: *revolutionary, game-changing, AI-powered, cutting-edge, next-gen, ecosystem (overused), holistic*.
4. **Preferred vocabulary**: *synthesize, signal, surface, layer, data, pattern, picture, morning, training, gains*.
5. **No emoji** in marketing copy.
6. **Promise positioning, not negation**: *"See what's working. Fix what's not."* — NEVER *"More than just analytics."*
7. **Never describe synth as connecting to "3-5 tools"**. Always full-ecosystem language.

See memory files `feedback-brand-voice`, `feedback-tool-ecosystem`, `project-gtm-positioning`.

## 7. Tool integrations — what's on the site, what was removed

### Currently named on the site (12)

| Wearables (6) | Activity & training (2) | Spreadsheets & docs (4) |
|---|---|---|
| WHOOP | Strava | Google Sheets |
| Garmin | Concept2 Logbook | Excel |
| Oura | | Google Calendar |
| Apple Health | | Notion |
| Google Health Connect | | |
| Fitbit | | |

Plus the **AI Import** universal fallback (photo / voice / pasted text / manual upload).

### Removed pending API or partner approval

If/when these approvals come through, add them back to:
- `LandingPage.tsx` → `MARQUEE_TOOLS` and `TOOLS`
- `marketing/moduleConfigs.tsx` → the `integrations` module's capability lists
- `marketing/sportConfigs.tsx` → the relevant sport's subhead + capabilities

| Tool | Reason it's not listed |
|---|---|
| Polar | Approval-based, multi-day |
| TrainingPeaks | 7–10 day partner review |
| TeamWorks, Catapult, Hudl, Bridge Athletics, Smartabase, Volt, TrueCoach, TrainHeroic | Enterprise-partnership only |
| Peloton, TrainerRoad, Wahoo | No public API |
| COROS, Suunto, Zwift, Hammerhead Karoo, Final Surge | No public API per latest audit |

Sweep grep before re-adding: `grep -rn "12\+" src/features/landing/` — the `12+ integrations` claim is repeated in ~8 places (marquee header, pricing tile, module sub, etc.) and needs to bump together.

## 8. Auth — what's live

### Login (`/login`)
- Uses real Supabase auth (`isSupabaseConfigured()` gate). When configured:
  - `Continue with Google` → `signInWithOAuth` (redirect)
  - email + password → `signInWithPassword`
- In env-less previews: falls back to the legacy demo email shortcut (`star@synth.app` → athlete, anything else → coach).
- On success → navigates to `/coach/dashboard`.
- PostHog: `signed_in` event with `{ email, role, mode }`.

### Signup (`/signup`) — waitlist
- No real account creation right now. Inserts into `public.waitlist`.
- On submit: insert → fetch count → render queue confirmation → PostHog `waitlist_joined` event.
- LocalStorage key `synth:waitlist:entry` — a returning visitor lands directly on their queue screen. `clearStoredEntry()` resets it.
- Fixed top-right `LIVE WAITLIST` badge: pulses + re-animates the count on every realtime tick + "Be #{N+1}." excitement line. Hidden on mobile (`hidden lg:flex`).

### Auth layout
- Split panel. Left = full-bleed photo slideshow (4 portrait images, 9s per slide, 1s crossfade). Right = form.
- `<aside className="isolate ...">` — **don't remove `isolate`**. Without it, the slideshow's absolute layer escapes its stacking context and renders behind the page-root black.
- Slideshow's `<img>` uses `z-0` (not `-z-10`) for the same reason.
- Mobile collapses to single column with a slim top bar.

## 9. Co-founder team — content + portraits

Same TEAM constant lives in two places (intentionally — they're styled differently per surface):
- `LandingPage.tsx` → renders inside the `Built by champions.` grid
- `marketing/WhyUsPage.tsx` → renders inside `/why-us`'s team section

Both pull from a literal array, so updating roles or credentials is two coordinated edits.

### Current roster

| Name | Role | File | Focus | Credentials |
|---|---|---|---|---|
| Abishai Gosula | founder & CEO | `abishai.jpeg` | `50% 30%` | CS · UC Berkeley · ex AITA tennis athlete |
| Matthew Waddell | co-founder & COO | `matthew.png` | `22% 35%` | 2025 U23 Worlds silver · NZ rowing · Cal Rowing · admitted Cambridge |
| Star Miller | co-founder & CCO | `star.png` | `50% 30%` | Cal Women's Rowing · AUS · U23 Worlds |
| Lily Pember | co-founder & CSO | `lily.png` | `50% 25%` | Cal Women's Rowing · USA · Junior World gold |

`focus` = `object-position` value applied to the 1:1 portrait crop. Lower X% pulls the photo right inside the card; lower Y% pulls it down.

## 10. Mobile / PWA navigation

`Nav` (in `shell/primitives.tsx`) renders two-pill glass nav on desktop (≥ `md`) and a single hamburger pill on mobile.

Tapping the hamburger opens a full-screen overlay (`MobileMenu`) with three groups:
- `// platform` — 8 modules
- `// sports` — 6 sports
- `// company` — Why us · Resources · Pricing · Contact

Plus a sticky-bottom CTA stack: Download (install prompt) · Sign in · Start free.

The body scroll is locked while open via `useEffect` cleanup.

## 11. Body canvas (overscroll color)

`PageShell` accepts a `canvas: 'green' | 'dark'` prop, default `'dark'`.

It mutates `document.body[data-app-canvas]`, which `src/index.css` maps to:
- `dark` → `#050505`
- `green` → `#059669`

| Page | Canvas |
|---|---|
| `/` and every other marketing page using `PageShell` | `dark` (default) |
| `/platform/*` and `/platform` | `dark` (explicit) |
| `/coach/*`, `/athlete/*`, `/app/*` | their own canvas (`cobalt`, `dark-water`, `cream`) |

Switch back to green by passing `<PageShell canvas="green">` on the relevant page.

## 12. Known limits & followups

- **Auth slideshow images are 1.7–3 MB PNGs.** Lazy-loaded so they don't block first paint, but a few hundred KB each is the target. Re-export as JPEG 85% quality or WebP to drop to ~250–500 KB each. Files: `public/auth-slides/slide-*.{png,jpg}`.
- **No actual brand logos for the marquee or tool wall** — they're rendered as text wordmarks. SVG logo glyphs would be a polish. When dropping in, swap the `{t}` text node inside each `<li>` in `LogoMarquee` for an `<img src="/logos/<tool>.svg" />`.
- **`PlaceholderMedia` still surfaces** on every sport page hero, every module page hero, the WhyUsPage timeline-adjacent illustration, and the Resources cards. Each placeholder includes a label and a caption so you know exactly what to produce.
- **Pricing page** lives but checkout isn't wired. Today every CTA goes to `/signup` (waitlist) or `mailto:supportsynth@gmail.com`. Connect Stripe / Paddle when the alpha closes.
- **Waitlist has no admin/export UI.** Pull rows via SQL (see §4). Add a daily CSV email if needed.
- **`/resources` is placeholder content.** 9 cards with stub copy + filter chips that don't filter yet. Wire to a CMS or Markdown source when you have real posts.
- **`/why-us` timeline** is hardcoded in `WhyUsPage.tsx → TIMELINE`. Update as milestones happen.
- **`docs/` is a single document folder** — this file lives at `docs/MARKETING_SURFACE_HANDOFF.md`. Companion files exist at `docs/PRODUCT.md` and `docs/SCHEMA.md` for the product app surface.

## 13. Deploy flow

Local → main → prod is a clean chain:

1. **Branch** off `main`: `git checkout -B feat/<thing>`
2. **Commit** locally. The Husky-like flow doesn't exist; you commit freely.
3. **Push**: `git push -u origin feat/<thing>`
4. **PR**: `gh pr create --base main --head feat/<thing> --title "..." --body "..."`
5. **Merge**: `gh pr merge <num> --merge`
6. **Cleanup**: `git push origin --delete feat/<thing>`
7. **Deploy fires automatically** — every merge to `main` triggers a Vercel production build, aliased to `synthsports.co`. Check status with `mcp__claude_ai_Vercel__list_deployments` or the Vercel dashboard.

**Memory rule**: `git push` and any deploy step require explicit human approval. The agent (Claude) won't push or merge unprompted.

The `main` branch is checked out in a worktree at `_worktrees/synth-platform-main`, which means `gh pr merge` will warn "fatal: 'main' is already used by worktree" — the GitHub-side merge still goes through; only the local main-branch update fails. Ignore the warning.

## 14. Common change recipes

### Update a co-founder's role or credentials
Two files, same edit shape:
- `src/features/landing/LandingPage.tsx` → `TEAM` array
- `src/features/landing/marketing/WhyUsPage.tsx` → `TEAM` array

### Swap a team photo
Drop the new image at the existing path (e.g. `public/team/matthew.png`). Adjust `focus` in both `TEAM` arrays if the face is off-center.

### Add a new platform module
1. Add a config to `marketing/moduleConfigs.tsx` (`MODULE_CONFIGS['<slug>']`).
2. Add a named export to `marketing/platformPages.tsx`.
3. Add a `lazyNamed` line + route entry to `src/app/routes.tsx`.
4. Add to the Product dropdown in `shell/primitives.tsx → PRODUCT_PLATFORM`.
5. Add to the `MODULES` array in `marketing/PlatformHubPage.tsx`.

### Add a new sport
Same shape as a module:
1. Add a config to `marketing/sportConfigs.tsx`.
2. Add a named export to `marketing/sportPages.tsx`.
3. Add a route entry to `src/app/routes.tsx`.
4. Add to `shell/primitives.tsx → PRODUCT_SPORTS`.
5. Add to the `SPORTS` array in `marketing/PlatformHubPage.tsx` and `marketing/SportsHubPage.tsx`.

### Change pricing
- Tier copy: `marketing/PricingPage.tsx → TIERS` (3 cards on `/pricing`).
- Homepage pricing teaser: `LandingPage.tsx → Pricing` function (same 3 tiers shown more compactly).
- Update any nav dropdown hint (`shell/primitives.tsx → COMPANY_ITEMS`).

### Change the marquee tool list
`LandingPage.tsx → MARQUEE_TOOLS` and `TOOLS` (kept separate; same content, just used in two places). Bump the `12+ integrations` count in any prose that names it explicitly: `grep -rn "12\+" src/features/landing/`.

### Re-add a tool that was removed for approval reasons
See §7 for the removed list. Re-add the name to `MARQUEE_TOOLS` + `TOOLS` + `moduleConfigs.tsx → integrations` capability list + any sport page subhead that previously named it. Bump the `12+` count to match.

### Update the waitlist baseline (currently 205)
`src/features/auth/waitlist.ts → WAITLIST_BASE`. Restart dev server. Existing localStorage entries persist their old assigned positions.

### Change the auth-page slideshow duration
`src/features/auth/AuthLayout.tsx → SLIDE_DURATION_MS` (currently 9000 = 9s per slide).

### Change the body overscroll color of a marketing page
Pass `<PageShell canvas="green">` to override the `dark` default. New canvas values need a corresponding CSS rule in `src/index.css` under `body[data-app-canvas='...']`.

## 15. PR history (for context)

| PR | Title |
|---|---|
| [#39](https://github.com/abishaigeorge09/synth-platform/pull/39) | `landing: full multi-page marketing surface (Kitman + Giga inspired)` — split brutalist landing into 17-page surface, hero photo, marquee, mobile nav |
| [#40](https://github.com/abishaigeorge09/synth-platform/pull/40) | `auth: photo slideshow + DB-backed waitlist + dark canvas default` — auth split-panel, waitlist + count + realtime, body canvas flip |
| [#41](https://github.com/abishaigeorge09/synth-platform/pull/41) | `team: real portraits + co-founder roles` — co-founder photos, role updates, per-portrait `focus` |

All three merged to `main` and live.

## 16. References

### Memory files (`~/.claude/projects/-Users-abishaigeorgegosula-synth-platform/memory/`)
- `MEMORY.md` — index
- `project-gtm-positioning.md` — the data-layer-for-sports framing, segment + pricing, team credibility
- `feedback-brand-voice.md` — voice rules (synth-without-period, banned words, mixed case, no emoji)
- `feedback-tool-ecosystem.md` — never "3–5 tools", AI Import as the closer
- `feedback-no-deploy-without-permission.md` — `git push` requires explicit OK
- `project-kitman-redesign-plan.md` — original plan doc (largely shipped)

### Related on-disk
- `CLAUDE.md` — top-level project guide for the agent
- `docs/PRODUCT.md` — product spec for the app surface (coach/athlete views, not marketing)
- `docs/SCHEMA.md` — DB contract for the app surface
- `supabase/migrations/` — every migration ever applied
