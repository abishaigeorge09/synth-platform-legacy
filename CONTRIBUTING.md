# Contributing to synth-platform

## Branching

- **`main`** is protected. Open a **pull request** for every change.
- Branch naming:
  - `feat/<issue>-short-slug` — new feature
  - `fix/<issue>-short-slug` — bugfix
  - `chore/<short-slug` — tooling, deps, non-product refactors
  - `docs/<short-slug` — documentation only

## Commits and PR titles

Prefer [Conventional Commits](https://www.conventionalcommits.org/) prefixes: `feat:`, `fix:`, `chore:`, `docs:`.

## Before you open a PR

```bash
npm ci
npm run lint
npm run build
npm run test
```

Default dev server: `npm run dev` (Vite; see `vite.config.ts` for port).

## Design constraints

- Read [`CLAUDE.md`](CLAUDE.md) for theme tokens (`THEME`), routing, and Agent modal rules.
- Data shapes must stay aligned with [`docs/SCHEMA.md`](docs/SCHEMA.md).

## AI-assisted review

GitHub does not include a built-in Claude UI. Teams typically use **required human review** plus **CI green**, and optionally GitHub Copilot or local tools. Automated LLM review via Actions is optional and should follow your data policy.

## Questions

Open a discussion or ping maintainers on your PR.
