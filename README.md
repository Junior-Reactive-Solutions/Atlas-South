# Atlas South Technical Services — Website

Full rebuild of [atlassouthes.com](https://www.atlassouthes.com), moving from a
hand-maintained static site to a React/Node application, informed by a full technical
audit and an ABM (abm.co.uk) comparative analysis.

## Stack

React + Vite + TypeScript (frontend, Vercel) · Node.js + Express + Prisma (backend,
Render) · Neon (Postgres) · Cloudinary (imagery) · Resend (email) · anime.js v4
(animation). Full rationale in
[`docs/build/05-ARCHITECTURE-AND-STACK.md`](docs/build/05-ARCHITECTURE-AND-STACK.md).

## Getting started

Prerequisites: Node.js ≥20, npm ≥10.

```bash
npm install
cp .env.example .env   # fill in values — see docs/build/05-ARCHITECTURE-AND-STACK.md
npm run dev:web         # http://localhost:9000
npm run dev:api          # http://localhost:9001
```

Local dev always uses the 9000-series ports fixed in
[`docs/build/05-ARCHITECTURE-AND-STACK.md`](docs/build/05-ARCHITECTURE-AND-STACK.md#3-local-development-port-map-9000-series-verified-free) —
this is deliberate so it never collides with other projects on the same machine.

## Project structure

```
apps/
  web/       — React frontend
  api/        — Express backend
packages/
  shared/     — zod schemas & types shared between web and api
docs/
  agile/       — vision, product backlog, user stories
  audit/        — original website audit + ABM comparative analysis (PDF)
  build/         — full technical build specification (14 documents — start at 00-MASTER-PLAN.md)
assets/
  brand/        — logo and brand source files
```

## Documentation

Start at [`docs/build/00-MASTER-PLAN.md`](docs/build/00-MASTER-PLAN.md) — it indexes
every other document in this repo (brand system, animation system, hero/footer specs,
page-by-page specification, security, admin panel, SEO checklist, legal content plan,
git workflow, hosting/deployment).

## Scripts

| Script | Runs |
|---|---|
| `npm run dev:web` | Frontend dev server (port 9000) |
| `npm run dev:api` | Backend dev server (port 9001) |
| `npm run build` | Builds `shared`, then `web`, then `api` |
| `npm run lint` | Lints both apps |
| `npm run typecheck` | Type-checks both apps |
| `npm run test` | Runs test suites |

## Deployment

See [`docs/build/12-HOSTING-DEPLOYMENT.md`](docs/build/12-HOSTING-DEPLOYMENT.md).

## License

Proprietary — see [`LICENSE`](LICENSE). Not open source.
