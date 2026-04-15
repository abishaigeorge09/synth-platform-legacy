# synth. — Web app (deck + product prototype)

Standalone Vite + React app: **full-screen pitch deck** and **`#prototype` product shell** (dashboard, athletes, sources, RowIQ-backed demo data). This copy lives outside the `presentations/` monorepo so you can point CI, Vercel, and collaborators at one root.

## What’s in the box

| Area | Path |
|------|------|
| Design tokens (colors, fonts) | `src/lib/theme.ts`, `src/lib/motion.ts` |
| Pitch deck + slides | `src/slides/`, `src/App.tsx`, `src/components/SlideShell.tsx` |
| Product prototype (auth, nav, dashboard, roster) | `src/prototype/` |
| Women’s RowIQ demo “database” (static TS) | `src/prototype/rowiqWomensData.ts`, `womensDemoData.ts`, `athleteCards/` |
| Dashboard mockup (embedded + slide modes) | `src/components/SynthLayerDashboardMockup.tsx` |
| Design / deck rules (reference) | `docs/DESIGN-FOUNDATION.md` |
| SRS (platform) | `docs/SRS-Synth-Platform.md` |
| Prototype data notes | `docs/Design-Prototype-Womens-Team-Demo-Data.md` |

There is **no server database** yet: erg roster, sessions, and charts are **typed constants** derived from `WOMENS_DATA.md` / workbook semantics, matching the prototype spec.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173 — deck is default
npm run build
npm run preview
```

- **Deck:** open `/` (keyboard/click through slides).
- **Prototype:** `http://localhost:5173/#prototype` — sign-in (demo), Dashboard, Athletes (card grid + profiles), Sources, Lineups placeholder.

## Git / new remote

This folder was exported from `presentations/synth-deck` with history. The old `origin` remote was removed so you can attach a **new** GitHub repo:

```bash
cd /path/to/synth-platform
git remote add origin https://github.com/<you>/<new-repo>.git
git push -u origin main
```

## Deploy

Same as any Vite SPA: `npm run build`, publish `dist/`. Configure `vercel.json` if you use Vercel (see repo root).
