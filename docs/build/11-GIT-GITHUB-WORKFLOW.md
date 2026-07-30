# Git & GitHub Workflow

Repo: **https://github.com/Junior-Reactive-Solutions/Atlas-South** — confirmed to exist,
public, currently empty (checked 2026-07-30). This document is the workflow to follow
from first commit onward, using GitHub's full feature set as requested: branches, PRs,
merges, tags, issues, and Actions.

## 1. Branch strategy

```
main        — always deployable; protected; direct pushes blocked
develop     — integration branch for the current sprint
feature/*   — one branch per user story from docs/agile/user-stories.md
              e.g. feature/hero-section, feature/hard-services-electricals
fix/*       — bug fixes
chore/*     — tooling, config, dependency bumps
```

- `feature/*` branches off `develop`, PR back into `develop`.
- `develop` → `main` via a release PR at the end of each sprint (matches the sprint
  cadence in `docs/agile/sprint-0-plan.md`).
- Branch names reference the user story ID where one exists (e.g.
  `feature/b1-hero-photography` for Epic B, story 1) so a branch is traceable back to
  `docs/agile/user-stories.md` without extra bookkeeping.

## 2. Branch protection (set on `main` and `develop`)

- Require a pull request before merging — no direct pushes.
- Require status checks to pass before merging: `lint`, `typecheck`, `test`, `build`,
  `npm audit`, `gitleaks` secret scan (see §5 CI workflows).
- Require at least one approval on `main` (even if that's a self-review checklist pass
  when working solo — the PR template in §4 makes this concrete rather than a formality).
- Require branches to be up to date before merging.
- Include administrators in these restrictions (no bypass "just this once").

## 3. Commit convention

[Conventional Commits](https://www.conventionalcommits.org/), so the changelog and any
future release tooling can be generated rather than hand-written:

```
feat(hero): add photography background and single-CTA layout
fix(footer): correct dead area-page links
docs(build): add security specification
chore(deps): bump prisma to 6.x
```

## 4. Pull requests

`.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## What & why
<!-- Link the user story ID from docs/agile/user-stories.md -->

## Screenshots (if UI change)

## Checklist
- [ ] Matches the relevant spec in docs/build/
- [ ] Passes lint/typecheck/test/build locally
- [ ] No new console errors/warnings
- [ ] Accessibility checklist (docs/build/06-PAGE-SPECIFICATIONS.md §1) followed for any page/component touched
- [ ] No secrets committed
```

## 5. Issues

`.github/ISSUE_TEMPLATE/` with two templates:
- **Story** — mirrors the format in `docs/agile/user-stories.md` (As a/I want/So that +
  acceptance criteria), used to turn a backlog story into a trackable GitHub issue when
  it's pulled into a sprint.
- **Bug** — repro steps, expected vs actual, severity.

Labels (consistent set, applied from day one):

| Label | Use |
|---|---|
| `epic:hero`, `epic:footer`, `epic:hard-services`, `epic:soft-services`, `epic:industries`, `epic:company`, `epic:admin`, `epic:security`, `epic:seo` | Maps directly to the epics in `docs/agile/user-stories.md` |
| `priority:client` | Hero/Footer work specifically, since the client flagged both — makes that priority visible in the issue tracker, not just in a doc |
| `type:placeholder-content` | Tags every MVP-placeholder page (the 10 identified in `06-PAGE-SPECIFICATIONS.md`) so "which pages still need real client content" is one label-filtered view |
| `good-first-review`, `needs-design`, `blocked` | Standard workflow states |

**Milestones** — one per sprint, named to match `docs/agile/product-backlog.md` /
`sprint-0-plan.md` (`Sprint 1`, `Sprint 2`, …), so GitHub's milestone progress bar becomes
a live view of sprint completion.

## 6. GitHub Actions (`.github/workflows/`)

| Workflow | Trigger | Steps |
|---|---|---|
| `ci.yml` | every PR | install → lint → typecheck → unit tests → build (both `apps/web` and `apps/api`) → `npm audit` → `gitleaks` secret scan |
| `e2e.yml` | PR into `develop`/`main` | Playwright smoke test of the golden path (home → a service page → quote form submit → thank-you page) |
| `lighthouse.yml` | PR into `main` | Lighthouse CI against a preview deployment, fails the check if scores regress below the targets in `09-SEO-PERFORMANCE-CHECKLIST.md` |
| `deploy-preview.yml` | every PR | Vercel preview deployment comment on the PR (Vercel's own GitHub integration handles this natively once connected — documented here so it's not forgotten as a setup step) |
| `release.yml` | push to `main` | Builds a changelog from Conventional Commits since the last tag, cuts a semver tag (`v1.0.0`, `v1.1.0`, …) |

## 7. Tags & releases

Semantic versioning (`vMAJOR.MINOR.PATCH`):
- `v0.x.x` during pre-launch build (Sprints 1–9 per the roadmap in the audit's §10)
- `v1.0.0` at public launch
- Minor bumps for new pages/features post-launch (e.g. a placeholder page getting real
  client content is a `minor`, not a `patch`, since it's a real content change)
- Patch bumps for fixes

Each tag gets a GitHub Release with generated notes — this becomes the actual project
history log for anyone (including you) coming back to the repo later, alongside the
`docs/agile/` progress artefacts.

## 8. Repository hygiene — README, LICENSE, `.gitignore`

### `.gitignore` (top-level, monorepo-aware)

```gitignore
# dependencies
node_modules/
.pnpm-store/

# build output
dist/
build/
.vercel/
.next/

# env & secrets
.env
.env.*
!.env.example

# logs
*.log
npm-debug.log*

# OS/editor
.DS_Store
Thumbs.db
.vscode/
.idea/

# Prisma
apps/api/prisma/migrations/dev.db

# test/coverage
coverage/
playwright-report/
test-results/
```

### `LICENSE`

Given this is client work product for Atlas South (not an open-source library), the
repo should carry a **proprietary/all-rights-reserved** notice, not MIT/Apache/GPL —
those licenses grant reuse rights that make no sense for a commercial client's website
codebase, even though the repo itself is public. A short custom `LICENSE` file stating
copyright is held by [Junior Reactive Solutions / Atlas South Technical Services — confirm
which party per the actual engagement terms] and that the code may not be reused,
redistributed, or repurposed without written permission is the correct choice here.
Flag this explicitly: **confirm with the client/your own business arrangement who
actually holds copyright** before the LICENSE file is finalised — this is a business
question, not a technical one, and shouldn't be guessed.

### `README.md` — required sections

```markdown
# Atlas South Technical Services — Website

[Short project description]

## Stack
[Link to docs/build/05-ARCHITECTURE-AND-STACK.md]

## Getting started
- Prerequisites (Node version, package manager)
- `npm install`
- Copy `.env.example` → `.env`, fill in values
- `npm run dev` (starts web on :9000, api on :9001 — see docs/build/05-ARCHITECTURE-AND-STACK.md)

## Project structure
[Link to the monorepo layout in docs/build/05-ARCHITECTURE-AND-STACK.md]

## Documentation
- Agile process & backlog: docs/agile/
- Original audit: docs/audit/
- Build specifications: docs/build/

## Scripts
[table of npm scripts]

## Deployment
[Link to docs/build/12-HOSTING-DEPLOYMENT.md]

## License
Proprietary — see LICENSE
```

No unnecessary files reach the repo: build output, `node_modules`, `.env` files, editor
config, and any local Chrome/PowerShell scratch scripts used during the earlier audit
phase (those belong in the session scratchpad, not this repo) are all excluded by the
`.gitignore` above from day one.
