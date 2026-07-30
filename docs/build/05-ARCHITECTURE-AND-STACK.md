# Architecture & Stack

## 1. Stack decision

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React 18 + Vite + TypeScript** | Client-specified React. Vite over Next.js/CRA because the frontend is a decoupled SPA hosted separately on Vercel from a separate Render backend (client's explicit hosting split) — Vite gives the fastest dev/build loop for that shape without carrying a Node server runtime the frontend host doesn't need. |
| Frontend routing | React Router v6 | Standard, well-understood, supports the route-transition animation pattern in `02-ANIMATION-SYSTEM.md`. |
| Frontend styling | Tailwind CSS, theme extended with the tokens from `01-BRAND-SYSTEM.md` | Utility-first keeps the 60/30/10 discipline enforceable — a colour outside the token set is a visible outlier in the class list, not a buried hex value in a stylesheet. |
| Icons | `lucide-react` (+ `phosphor-react` for gaps) | Per `01-BRAND-SYSTEM.md`. |
| Animation | `animejs` v4 | Client-specified, per `02-ANIMATION-SYSTEM.md`. |
| Backend | **Node.js + TypeScript + Express** | "Most appropriate backend language that works with React" — Node/TS shares types with the frontend (a `shared/` package for DTOs), has first-class Prisma support for Neon Postgres, and Express is a small enough surface to reason about for the security hardening in `07-SECURITY.md` (vs. a heavier framework hiding behaviour). |
| ORM / DB access | **Prisma** → **Neon** (serverless Postgres) | Client-specified DB. Prisma gives typed queries (eliminates a whole class of injection risk by construction) and Neon's branching model pairs naturally with the git branch strategy in `11-GIT-GITHUB-WORKFLOW.md` (a DB branch per PR/environment). |
| Auth (admin) | `argon2` password hashing + JWT access token (short-lived) + httpOnly `Secure` refresh cookie | See `07-SECURITY.md` and `08-ADMIN-PANEL-SPEC.md` for the full flow. |
| Validation | `zod` — one schema per API route, shared between client and server via the `shared/` package | Every request body, query string, and route param is validated before it touches business logic — this is what "counting for all manner of website URL passes" becomes concretely: no unvalidated input reaches a handler. |
| Rate limiting | `express-rate-limit` + `rate-limiter-flexible` (Redis-backed once traffic justifies it; in-memory store acceptable pre-launch) | See `07-SECURITY.md`. |
| Email | **Resend** (client-specified) | Contact/quote form confirmations, admin notifications, password reset. |
| Image hosting | **Cloudinary** (client-specified) | Hero photography, future case-study images, logo asset delivery with automatic format/quality. |
| Error tracking | **Sentry** (frontend + backend) | Industry-standard, integrates with both React and Express with minimal setup; free tier covers this project's scale. |
| Analytics | Custom event pipeline (own Postgres tables, surfaced in the admin dashboard) **+ GA4** for public SEO-standard reporting | Satisfies both the admin-side "track interactions" requirement and the "top SEO/audit score" requirement, which expects a recognised analytics tag to be present. |
| Hosting — frontend | **Vercel** (client-specified) | |
| Hosting — backend | **Render** (client-specified) | Persistent Node process — needed for in-memory rate limiting and scheduled jobs, unlike a serverless-only function host. |
| Hosting — DB | **Neon** (client-specified) | |
| CI/CD | **GitHub Actions** | Lint, typecheck, test, build, and Lighthouse/axe CI checks on every PR — see `11-GIT-GITHUB-WORKFLOW.md`. |

## 2. Why one repo, two apps (monorepo)

```
Atlas-South/
├── apps/
│   ├── web/              # React + Vite frontend (deploys to Vercel)
│   └── api/               # Express + TS backend (deploys to Render)
├── packages/
│   └── shared/            # zod schemas, TypeScript types shared by web + api
├── docs/
│   ├── agile/              # existing: vision, backlog, user stories
│   ├── audit/               # existing: website audit + ABM comparison
│   └── build/                # this folder: brand, animation, page specs, security, admin, legal, git, hosting
├── .github/
│   ├── workflows/            # CI pipelines — see 11-GIT-GITHUB-WORKFLOW.md
│   └── ISSUE_TEMPLATE/
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

A monorepo (npm/pnpm workspaces) keeps the shared `zod` schemas and TypeScript types in
one place so a validation rule changed on the backend can't silently drift from what the
frontend form expects — directly supporting the "no loophole" security requirement by
removing an entire class of client/server contract mismatch.

## 3. Local development port map (9000 series, verified free)

Checked against this machine's actual listening ports before assigning — all of 9000–9010
were free at time of writing. Fixed for the life of the project so it never collides with
other work on this machine:

| Port | Service | Notes |
|---|---|---|
| **9000** | `apps/web` — Vite dev server | `npm run dev` in `apps/web` |
| **9001** | `apps/api` — Express API | `npm run dev` in `apps/api` |
| **9002** | Prisma Studio (DB GUI) | `npx prisma studio --port 9002` |
| **9003** | Reserved — Storybook (component/icon catalogue, if adopted) | Not committed to yet; reserved so it never gets grabbed by an unrelated process |
| **9004** | Reserved — admin panel, if ever split into its own dev process | Default plan is the admin panel is routed inside `apps/web` (`/admin/*`), so this stays reserved/unused unless that changes |

Defined once in `.env` / `.env.example` (`WEB_PORT=9000`, `API_PORT=9001`) rather than
hardcoded per script, so the whole map moves together if it ever needs to change.

## 4. Environment variables (`.env.example` — real values never committed)

```
# apps/web
VITE_API_BASE_URL=http://localhost:9001
VITE_CLOUDINARY_CLOUD_NAME=
VITE_SENTRY_DSN=
VITE_GA4_MEASUREMENT_ID=

# apps/api
NODE_ENV=development
PORT=9001
DATABASE_URL=            # Neon connection string
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
RESEND_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SENTRY_DSN=
ADMIN_SEED_EMAIL=        # used once by the seed script — see 08-ADMIN-PANEL-SPEC.md
CORS_ALLOWED_ORIGIN=http://localhost:9000
RATE_LIMIT_WINDOW_MS=
RATE_LIMIT_MAX=
```

Real secrets live in Vercel/Render's own environment-variable stores and in GitHub
Actions secrets for CI — never in a committed file. See `.gitignore` requirements in
`11-GIT-GITHUB-WORKFLOW.md`.

## 5. Data model (initial — refined during Sprint 1 build)

Core tables the admin panel and public site both depend on:

- `Enquiry` — every quote-form/contact-form submission (service requested, message,
  contact details, source page, status: new/contacted/quoted/won/lost)
- `PageView` — lightweight event row per page load (path, referrer, timestamp,
  anonymised session id — no PII beyond what's needed for aggregate analytics)
- `Event` — generic interaction event (cta_click, phone_click, whatsapp_click,
  form_start, form_submit) tied to a page and a session, feeding the admin analytics view
- `AdminUser` — argon2 password hash, role, last-login, lockout state
- `Subscription` (residential packages) — tier, status, linked to the relevant payment
  processor reference (Stripe/PayPal per the existing packages feature)

Full schema is written as Prisma models during Sprint 1 build, not finalised here — this
section fixes the concepts the admin panel spec and page specs both assume exist.
