# AGENTS.md

## Project Overview

**ClarityFlow** — personal productivity platform (journaling, tasks, idea capture, focus timer, knowledge notes, dashboard).

## Architecture

```
my.aryadwip.com/
├── frontend/          # React Router v8 (SSR), Vite, Tailwind v4, TypeScript
├── backend/           # Hono, Bun runtime (stub — not wired to frontend yet)
└── plans/PRD.md      # Full product spec (read before implementing features)
```

## Commands

**Frontend** (in `frontend/`):
```bash
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build
npm run typecheck # react-router typegen && tsc (must run before PRs)
npm run start      # Serve production build
```

**Backend** (in `backend/`):
```bash
bun run dev        # Hono dev server at http://localhost:3000
```

## Quirks

- **React Router type generation**: `npm run typecheck` runs `react-router typegen && tsc`. Run typegen before editing route files or types will be stale.
- **Tailwind v4**: Uses `@import "tailwindcss"` and `@theme` block in CSS — NOT the v3 `@tailwind` directives. Don't add v3-style config.
- **Routing**: Declarative via `app/routes.ts` — NOT file-system routing. Add new routes there.
- **SSR enabled**: `react-router.config.ts` has `ssr: true`. Server components work; don't assume client-only.
- **Backend is a stub**: `backend/src/index.ts` returns "Hello Hono!" at `/`. Not yet connected to frontend.

## Conventions

- Path alias: `~/` maps to `frontend/app/`
- `frontend/tsconfig.json` uses `moduleResolution: "bundler"` and `verbatimModuleSyntax: true`
- `backend/tsconfig.json` includes `jsxImportSource: "hono/jsx"` for JSX support

## React Router Skill

A skill reference exists at `frontend/.agents/skills/react-router/SKILL.md` with framework-mode and data-mode docs. Load it when working on React Router features.

## Agent Skills

### Issue tracker

Local markdown files in `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.
