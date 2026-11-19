# Buzzvel FE

A responsive landing page for **Luma**, a fictional online-learning platform, built as my submission
for the **Buzzvel Front-End Engineer coding challenge (November 2026)**. It is one complete page for
mobile, tablet and desktop, implemented from the supplied Figma design with **Next.js (App Router),
TypeScript and Tailwind CSS**, with typed reusable components, accessible semantics,
reduced-motion-safe animation and local mock data.

Around the page I also built a production-style delivery setup: Docker, GitHub Actions, Terraform
and Google Cloud Run, with five environments. The challenge only asks for the page, so the
infrastructure is deliberately kept small and documented.

> **Status:** in development. Sections marked _"to be completed"_ are filled in before submission.
> The full execution plan (scope, architecture, phases and quality gates) is in
> [`MASTERPLAN.md`](./MASTERPLAN.md).

- **Production:** [https://buzzvel-fe.moliveda.dev](https://buzzvel-fe.moliveda.dev)
- **Repository:** `buzzvel-fe_web` (public)

## Table of contents

- [Buzzvel FE](#buzzvel-fe)
  - [Table of contents](#table-of-contents)
  - [Tools and technologies](#tools-and-technologies)
  - [Project structure](#project-structure)
  - [Getting started](#getting-started)
    - [Requirements](#requirements)
    - [Install, run and build](#install-run-and-build)
  - [Scripts](#scripts)
  - [Docker operations 🐳](#docker-operations-)
    - [1. Local development (hot reloading)](#1-local-development-hot-reloading)
      - [Commands](#commands)
    - [2. Executing commands inside a container](#2-executing-commands-inside-a-container)
    - [3. Image targets](#3-image-targets)
    - [4. Staging and production](#4-staging-and-production)
  - [Environments and deployment](#environments-and-deployment)
    - [CI/CD pipeline](#cicd-pipeline)
    - [Basic-auth gate and secrets](#basic-auth-gate-and-secrets)
    - [Health checks](#health-checks)
    - [Releasing](#releasing)
    - [Rollback](#rollback)
  - [Terraform](#terraform)
    - [What Terraform manages](#what-terraform-manages)
    - [Layout](#layout)
    - [Prerequisites](#prerequisites)
    - [Usage](#usage)
  - [Environment variables](#environment-variables)
  - [Testing and quality](#testing-and-quality)
  - [Security and observability](#security-and-observability)
  - [Key decisions](#key-decisions)
  - [Known gaps](#known-gaps)
  - [Time spent](#time-spent)
  - [How I use AI to build software](#how-i-use-ai-to-build-software)
    - [Tools used on this project](#tools-used-on-this-project)
    - [How I verify AI output](#how-i-verify-ai-output)
  - [Assets and credits](#assets-and-credits)
  - [License](#license)

## Tools and technologies

| Area          | Tools                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runtime       | Node.js 26 (Active LTS), npm with exact dependency versions                                                                                                        |
| Framework     | Next.js 16 (App Router, `src/app`, Cache Components, Turbopack), React 19, TypeScript (`strict`)                                                                   |
| Styling       | Tailwind CSS v4, shadcn/ui-style component pattern (`class-variance-authority`, `@radix-ui/react-slot`, `clsx` + `tailwind-merge`), design tokens in `globals.css` |
| Motion, icons | `framer-motion` (reduced-motion aware), `lucide-react`                                                                                                             |
| Forms         | React Hook Form + `@hookform/resolvers` + Zod, validated again on the server                                                                                       |
| Fonts, images | `next/font` (self-hosted, subset, `display: swap`), `next/image` (AVIF/WebP, explicit `sizes`)                                                                     |
| Logging       | `winston` (JSON to stdout, correlation id) in route handlers                                                                                                       |
| Quality       | ESLint 9, Prettier, Husky, lint-staged, Gitmoji commit-message hook                                                                                                |
| Tests         | Vitest, React Testing Library, MSW, Playwright, `@axe-core/playwright` (≥ 80 % coverage gate)                                                                      |
| Containers    | Docker (single multi-stage `Dockerfile`), Docker Compose (local only), unprivileged NGINX (basic-auth `gate` target)                                               |
| Cloud         | Google Cloud Run, Artifact Registry                                                                                                                                |
| IaC and CI/CD | Terraform (remote state in GCS), GitHub Actions (Workload Identity Federation, no stored keys)                                                                     |
| Secrets       | GitHub Secrets (environment-scoped), injected at deploy time. Google Secret Manager is not used                                                                    |

## Project structure

```text
buzzvel-fe_web/
├── .github/
│   ├── workflows/        # ci · deploy-preview · cleanup-preview · deploy-env · release
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── .husky/               # pre-commit · commit-msg · pre-push
├── docker/nginx/         # nginx.conf.template · entrypoint.sh (basic-auth gate)
├── infra/terraform/      # bootstrap · modules · envs
├── public/               # images (AVIF/WebP + fallbacks), favicon, og image
├── src/
│   ├── app/              # layout, page, globals.css, robots, sitemap, health, ready, api/v1/contact
│   ├── components/
│   │   ├── ui/           # shadcn-style global primitives (button, badge, card, input, ...)
│   │   ├── layout/       # site-header, mobile-menu, site-footer, skip-link
│   │   ├── sections/     # hero, categories, featured-course, how-it-works, ...
│   │   └── motion/       # motion-provider, reveal, count-up
│   ├── content/          # typed mock data (copy, categories, steps, stats, footer links)
│   ├── hooks/            # use-body-scroll-lock, use-focus-trap, use-media-query
│   ├── lib/              # cn, env (Zod-validated), logger, rate-limit, contact-client
│   ├── schemas/          # contact.schema.ts
│   └── types/
├── tests/e2e/            # Playwright specs (smoke, a11y, contact, menu)
├── scripts/              # compare-design.ts (overlay/diff helper, dev only)
├── Dockerfile · docker-compose.yaml
└── .env.example · AGENTS.md · CLAUDE.md · MASTERPLAN.md · README.md · LICENSE
```

Unit and integration tests live next to the code they cover (`*.test.ts(x)`). The Figma reference
frames are kept in a git-ignored `design/` folder and are never committed.

## Getting started

### Requirements

- Node.js 26 (the current LTS, pinned in `.nvmrc` and enforced through `engines`)
- npm (a lockfile is committed)
- Docker with Compose v2 (optional, for the containerised workflow)

### Install, run and build

```bash
git clone https://github.com/M-oliveda/buzzvel-fe_web.git
cd buzzvel-fe_web
nvm use                  # picks the version from .nvmrc
cp .env.example .env     # defaults work for local development
npm ci
npm run dev              # http://localhost:3000
```

Production build, the same way the container runs it:

```bash
npm run build
npm start                # http://localhost:3000
```

## Scripts

| Script                 | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start the dev server                             |
| `npm run build`        | Production build                                 |
| `npm start`            | Serve the production build                       |
| `npm run lint`         | ESLint                                           |
| `npm run format`       | Prettier (write)                                 |
| `npm run format:check` | Prettier (check only, used in CI)                |
| `npm run typecheck`    | `tsc --noEmit`                                   |
| `npm test`             | Unit and integration tests (Vitest)              |
| `npm run test:cov`     | Same, with the 80 % coverage gate                |
| `npm run test:e2e`     | Playwright end-to-end tests (desktop and mobile) |

Husky hooks:

| Hook         | Runs                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| `pre-commit` | `lint-staged` (ESLint `--fix`, Prettier `--write` on staged files), `tsc --noEmit` |
| `commit-msg` | Gitmoji format check                                                               |
| `pre-push`   | `vitest run --changed` against the upstream branch                                 |

## Docker operations 🐳

### 1. Local development (hot reloading)

This project uses a single `docker-compose.yaml` for **local development only**, which includes
**bind mounts** for hot reloading and **exposed ports** for easy access. Everything is built from
one multi-stage `Dockerfile`.

#### Commands

- **Run (foreground):** `docker compose up --build`
  - _Builds the image if necessary and starts all services at `http://localhost:3000`. Press
    `Ctrl+C` to stop._
- **Run (detached):** `docker compose up -d`
- **After changing dependencies:** `docker compose up --build -V`
  - _`-V` recreates the anonymous `node_modules` volume; without it the container keeps the old
    packages.
- **Restart a service:** `docker compose restart web`
- **Stop all:** `docker compose down`
- **View logs:** `docker compose logs -f web`
- **Try the NGINX basic-auth gate locally:** `docker compose --profile gate up --build`
  - _Starts the same gate container used in the `preview`, `develop` and `staging` environments on
    `http://localhost:8080` (change the host port with `GATE_PORT`). Requires `BASIC_AUTH_USERNAME`
    and `BASIC_AUTH_PASSWORD` in `.env`; Compose injects them into the NGINX container, which
    unlocks the site for that username and password. `/health` and `/ready` stay open without
    credentials. Use `GATE_PORT=8089` if port 8080 is already taken._

### 2. Executing commands inside a container

```bash
docker compose exec web npm run lint
docker compose exec web npm run test
docker compose exec web sh        # Alpine-based image: use sh, not bash
```

_The dev image leaves out `tests/`, `.github/`, `.husky/` and Markdown (`.dockerignore`), so
container checks cover `src/` and the config files only. Run `npm run test:e2e` and the full-tree
`format:check`, `lint` and `typecheck` on the host. Check the production build with
`docker build --target app`, not `npm run build` in the dev container (it runs with
`NODE_ENV=development`)._

### 3. Image targets

One `Dockerfile`, with the stages `base` → `deps` → `dev` → `builder` → `app`, plus `gate`:

| Target    | Purpose                                                                         |
| --------- | ------------------------------------------------------------------------------- |
| `dev`     | Local development with bind mounts and hot reload                               |
| `builder` | Installs dependencies and runs `next build` (standalone output)                 |
| `app`     | Minimal non-root runtime (standalone) with a `HEALTHCHECK` on `/health`         |
| `gate`    | Unprivileged NGINX that adds basic auth and `noindex` headers in front of `app` |

```bash
docker build --target app  -t buzzvel-fe-app  .
docker build --target gate -t buzzvel-fe-gate .
```

### 4. Staging and production

Staging and production run on **Google Cloud Run**, not Docker Compose. See
[Environments and deployment](#environments-and-deployment).

## Environments and deployment

| Environment  | Trigger                     | URL                                                                | Basic auth                  | Notes                                                                                                                                       |
| ------------ | --------------------------- | ------------------------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `local`      | `docker compose up --build` | `http://localhost:3000`                                            | Optional (`--profile gate`) | Bind mounts, hot reload                                                                                                                     |
| `preview`    | Pull request to `develop`   | `buzzvel-fe-pr-<n>` Cloud Run URL                                  | Yes                         | Created on PR open/sync, **deleted on PR close**. Same-repo PRs only                                                                        |
| `develop`    | Push to `develop`           | `buzzvel-fe-develop` Cloud Run URL                                 | Yes                         | Latest, unstable                                                                                                                            |
| `staging`    | Push to `release/*`         | `buzzvel-fe-staging` Cloud Run URL                                 | Yes                         | Candidate for the next stable release                                                                                                       |
| `production` | Tag `vX.Y.Z` (from `main`)  | [https://buzzvel-fe.moliveda.dev](https://buzzvel-fe.moliveda.dev) | **No**                      | Image of the tagged commit is promoted, not rebuilt. Min instances 1 during the evaluation window (Nov 20 to Dec 4), then reviewed for cost |

Each cloud environment lives in **its own Google Cloud project**, all in `us-central1`, and maps to
the GitHub Environment of the same name:

| GitHub Environment | GCP project                    | Deployer service account (WIF)                                            |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------- |
| `preview`          | `moliveda-gcloudprojects-prev` | `cicd-deployer-prev@moliveda-gcloudprojects-prev.iam.gserviceaccount.com` |
| `develop`          | `moliveda-gcloudprojects-dev`  | `cicd-deployer-dev@moliveda-gcloudprojects-dev.iam.gserviceaccount.com`   |
| `staging`          | `moliveda-gcloudprojects-stg`  | `cicd-deployer-stg@moliveda-gcloudprojects-stg.iam.gserviceaccount.com`   |
| `production`       | `moliveda-gcloudprojects-prod` | `cicd-deployer-prod@moliveda-gcloudprojects-prod.iam.gserviceaccount.com` |

Branching follows **GitFlow** (`main`, `develop`, `feature/<topic>`, `release/<n>`,
`hotfix/<topic>`), commits use **Gitmoji** (`:sparkles: Add hero section`, see
[gitmoji.dev](https://gitmoji.dev)), and versions follow **Semantic Versioning** (first production
release: `v1.0.0`). `main` and `develop` are protected: changes land only through a pull request
with a green `CI passed` check, and force pushes and deletions are blocked. Every non-production
environment sends `X-Robots-Tag: noindex`.

```text
PR open/sync  ─► CI ─► Artifact Registry ─► Cloud Run  buzzvel-fe-pr-<n>   (gate + app)
push develop  ─► CI ─► Artifact Registry ─► Cloud Run  buzzvel-fe-develop  (gate + app)
push release/*─► CI ─► Artifact Registry ─► Cloud Run  buzzvel-fe-staging  (gate + app)
tag vX.Y.Z    ─► CI ─► promote image    ─► Cloud Run  buzzvel-fe-prod     (app only)
```

### CI/CD pipeline

Implemented with GitHub Actions, authenticated to Google Cloud through **Workload Identity
Federation** (no service-account keys). Each project already has a shared pool (`github-pool`), a
provider (`github-provider`, which only accepts tokens from repositories owned by `M-oliveda`) and a
deployer service account. This repository is allowed to impersonate each deployer through
`roles/iam.workloadIdentityUser`, scoped to `M-oliveda/buzzvel-fe_web`. Deploy jobs declare
`environment: <name>` so they pick up that environment's project, provider and deployer.

1. **`ci.yml`** (every push and PR): `npm ci`, `format:check`, `lint`, `typecheck`, unit and
   integration tests with the 80 % coverage gate, `next build`, then Playwright e2e against the
   production build. Coverage and the Playwright report are uploaded as artifacts.
   `terraform fmt -check` and `terraform validate` run when `infra/` changes.
2. **Build and push:** `docker build --target app` and `--target gate` pushed to Artifact Registry,
   tagged with the commit SHA, with layer caching.
3. **Deploy:**
   - `deploy-preview.yml`: same-repo PRs only. Deploys `buzzvel-fe-pr-<n>` and comments the URL on
     the PR.
   - `cleanup-preview.yml`: deletes the preview service when the PR closes.
   - `deploy-env.yml`: `develop` and `release/*` deploy to their Cloud Run service.
   - `release.yml`: on a `v*.*.*` tag, verifies the tag is on `main`, promotes the image, deploys
     production, runs a smoke check and creates a GitHub Release.
4. **Post-deploy smoke:** `curl` `/health` and assert the home page returns 200 (using basic-auth
   credentials from secrets in protected environments).

### Basic-auth gate and secrets

Protected environments run **two containers in one Cloud Run service**: the NGINX gate on `:8080`
(public ingress, basic auth) proxying to the Next.js app on `:3000`. Production runs the app
container only.

```text
client ─► [ nginx gate :8080, basic auth ] ─► [ next app :3000 ]
```

The URLs of the protected environments are unlocked with a **username and password that are injected
into NGINX**. They are stored as **GitHub Secrets** (scoped to the GitHub Environments `develop`,
`staging` and `preview`), not in Google Secret Manager:

```text
GitHub Environment secrets BASIC_AUTH_USERNAME + BASIC_AUTH_PASSWORD
  ─► deploy workflow ─► env vars on the NGINX gate container in Cloud Run
  ─► gate entrypoint.sh hashes the password and writes the htpasswd file at start
     (mode 0400, never logged; the container refuses to start if either value is missing)
  ─► nginx auth_basic_user_file
```

Trade-off: the username and password end up as Cloud Run environment variables, visible to anyone
with `run.services.get` on the project. This is acceptable because they only protect non-production
previews that serve mock data, the password is unique to this project (never reuse one), and the
values are never stored in Terraform state or Git. Production has no gate and no such secrets.

Set the secrets once per protected environment:

```bash
gh secret set BASIC_AUTH_USERNAME --env <develop|staging|preview>
gh secret set BASIC_AUTH_PASSWORD --env <develop|staging|preview>   # prompts for the value
gh secret list --env <develop|staging|preview>                     # names only, never values
```

Use a different password in each environment. `production` has no gate secrets.

### Health checks

- `GET /health`: liveness, no dependencies.
- `GET /ready`: readiness (trivial here since there are no downstream dependencies; kept for
  contract consistency).

NGINX exempts both from basic auth so Cloud Run probes work.

### Releasing

```bash
git checkout -b release/1.0.0 develop            # push it: deploys to staging and is verified there
git push -u origin release/1.0.0
gh pr create --base main --head release/1.0.0    # merge (merge commit) once CI passes
git checkout main && git pull
git tag v1.0.0 && git push origin v1.0.0         # triggers the production deploy
```

`main` is protected, so the release reaches it through a pull request, not a direct push. Merge
`main` back into `develop` afterwards (also through a pull request).

### Rollback

Redeploy the previous Cloud Run revision (`gcloud run services update-traffic`) or tag a patch
release.

## Terraform

Persistent infrastructure is described as code in [`infra/terraform`](./infra/terraform). Ephemeral
**preview** services are created and removed by the pull-request workflows, not by Terraform.

### What Terraform manages

- Artifact Registry Docker repository (`buzzvel-fe`)
- The runtime service account
- Cloud Run services for `develop`, `staging` and `production` (production without the gate
  container)
- The custom domain for production (`buzzvel-fe.moliveda.dev`): Cloud Run domain mapping where
  available in the chosen region, otherwise a global external HTTPS load balancer with a serverless
  NEG and a managed certificate

The Workload Identity pool, provider and deployer service accounts are shared by the owner's other
repositories, so Terraform does not manage them. This repository's binding to them is set up once by
hand (see [Prerequisites](#prerequisites)).

CI deploys new image revisions. Terraform ignores `image` and environment-variable changes
(`lifecycle.ignore_changes`) to prevent drift and so that **secret values never reach Terraform
state**.

### Layout

```text
infra/terraform/
├── bootstrap/     # one-time: GCS state bucket, required APIs
├── modules/       # artifact-registry, cloud-run-service, runtime-sa, domain
└── envs/          # develop.tfvars, staging.tfvars, production.tfvars
```

### Prerequisites

- Terraform and the `gcloud` CLI, authenticated (`gcloud auth application-default login`)
- The four GCP projects listed in [Environments and deployment](#environments-and-deployment), with
  billing enabled, and the roles needed to create the resources above
- APIs enabled in each project: Cloud Run, Artifact Registry, IAM Credentials (Secret Manager and
  Cloud Build are not required)
- Ownership of the DNS zone for `moliveda.dev`
- GitHub Environments `preview`, `develop`, `staging` and `production` with the variables listed in
  [Environment variables](#environment-variables), and the `BASIC_AUTH_USERNAME` and
  `BASIC_AUTH_PASSWORD` secrets in the three gated ones
- This repository bound to each project's deployer (one-time, already done):

  ```bash
  gcloud iam service-accounts add-iam-policy-binding \
    cicd-deployer-<suffix>@moliveda-gcloudprojects-<suffix>.iam.gserviceaccount.com \
    --project moliveda-gcloudprojects-<suffix> \
    --role roles/iam.workloadIdentityUser \
    --member "principalSet://iam.googleapis.com/projects/<project-number>/locations/global/workloadIdentityPools/github-pool/attribute.repository/M-oliveda/buzzvel-fe_web"
  ```

### Usage

```bash
# 1. One-time bootstrap (creates the remote state bucket and enables APIs)
cd infra/terraform/bootstrap
terraform init
terraform apply -var="project_id=<GCP_PROJECT_ID>" -var="region=<GCP_REGION>"

# 2. Per environment (state is isolated per environment)
cd ../
terraform init \
  -backend-config="bucket=<STATE_BUCKET>" \
  -backend-config="prefix=buzzvel-fe/<env>"
terraform plan  -var-file=envs/<env>.tfvars
terraform apply -var-file=envs/<env>.tfvars
```

CI runs `terraform fmt -check` and `terraform validate` whenever `infra/` changes. Review every
`plan` before applying; `terraform destroy` on `production` is intentionally not wired into any
workflow.

_Exact variable names and outputs: to be completed once the infrastructure is applied._

## Environment variables

Copy `.env.example` to `.env` (git-ignored; `.env.example` lists names only). Never commit `.env`.
All variables are read through `src/lib/env.ts`, which validates them with Zod: the app fails fast
at start-up if a required value is missing.

| Variable                       | Required | Used by        | Description                                                              |
| ------------------------------ | -------- | -------------- | ------------------------------------------------------------------------ |
| `APP_ENV`                      | Yes      | app, CI        | `local`, `preview`, `develop`, `staging` or `production`                 |
| `NEXT_PUBLIC_SITE_URL`         | Yes      | app            | Canonical origin, e.g. `https://buzzvel-fe.moliveda.dev`                 |
| `PORT`                         | No       | app, Cloud Run | `3000` for the app (default), `8080` for the gate                        |
| `LOG_LEVEL`                    | No       | app            | `info` by default                                                        |
| `CONTACT_RATE_LIMIT_MAX`       | No       | app            | Contact requests allowed per window per IP (default `5`)                 |
| `CONTACT_RATE_LIMIT_WINDOW_MS` | No       | app            | Rate-limit window in milliseconds (default `600000`)                     |
| `BASIC_AUTH_HTPASSWD_FILE`     | Gate     | gate           | Path where the entrypoint writes the htpasswd file                       |
| `BASIC_AUTH_USERNAME`          | Gate     | GitHub Secrets | **Secret.** Gate username injected into NGINX, per protected environment |
| `BASIC_AUTH_PASSWORD`          | Gate     | GitHub Secrets | **Secret.** Gate password injected into NGINX, per protected environment |

CI and Terraform values are **GitHub Actions variables** (not secrets). Values that differ per
project are set on each GitHub Environment, so a job sees them only when it declares `environment:`:

| Variable                         | Scope       | Used by       | Value                                                                                                    |
| -------------------------------- | ----------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| `GCP_REGION`                     | Repository  | CI, Terraform | `us-central1`                                                                                            |
| `ARTIFACT_REGISTRY_REPO`         | Repository  | CI            | `buzzvel-fe`                                                                                             |
| `GCP_PROJECT_ID`                 | Environment | CI, Terraform | That environment's project, e.g. `moliveda-gcloudprojects-stg`                                           |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Environment | CI            | `projects/<project-number>/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `GCP_SERVICE_ACCOUNT`            | Environment | CI            | That project's deployer, e.g. `cicd-deployer-stg@moliveda-gcloudprojects-stg.iam.gserviceaccount.com`    |

## Testing and quality

| Level       | Tool                      | What it covers                                                                                                                                                                            |
| ----------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        | Vitest + RTL              | UI primitives (variants, `asChild`, ref forwarding, focus/disabled), `cn`, env parsing, rate limiter, Zod schema, content integrity, `Reveal`/`CountUp` under reduced motion, mobile menu |
| Integration | Vitest (+ MSW for client) | `POST /api/v1/contact` with real `Request` objects (201, 400, 429, honeypot), `ContactForm` with the client fetch layer, page render with all sections and landmarks                      |
| E2E         | Playwright (+ axe)        | Smoke on desktop and mobile projects, keyboard-only menu flow, contact submit success and failure, axe scan with zero violations, reduced-motion emulation                                |
| Coverage    | Vitest `v8`               | Thresholds of 80 % for lines, functions, branches and statements. Every exclusion is justified in `vitest.config.mts`                                                                     |

Tests assert behaviour the user sees (roles, labels, text), not implementation details.

**Accessibility checks** (`tests/e2e/a11y.spec.ts`, desktop and mobile): axe with the WCAG 2.0–2.2
A/AA and best-practice rules on the whole page, on the open mobile menu and on the fully revealed
page with motion allowed; one `h1` and no skipped heading levels; the skip link first; and a
keyboard walk over every tab stop that checks the focus ring is drawn, contrasts at least 3:1 with
the surface behind it, and is not hidden under the sticky header.

**Performance targets** (Lighthouse, mobile, production build): Performance ≥ 95, Accessibility 100,
Best Practices 100, SEO 100; LCP < 2.5 s, CLS < 0.05, TBT < 200 ms; route JavaScript aiming for ≤
130 kB gzip.

**Pixel-perfect workflow:** `scripts/compare-design.ts` takes Playwright screenshots at the design
widths and produces an overlay and diff image against the (git-ignored) design frames. Any accepted
differences are recorded in the pull-request description.

_Results (coverage percentage, Lighthouse scores and screenshot): to be completed before
submission._

## Security and observability

- **Headers:** built in `src/lib/security-headers.ts` and sent by `next.config.ts` on every
  response: a Content-Security-Policy (`default-src 'self'`, same-origin scripts, styles, images,
  fonts and fetches, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`,
  `frame-ancestors 'none'`; `'unsafe-eval'` only under `next dev`), `X-Content-Type-Options`,
  `Referrer-Policy`, `X-Frame-Options`, `Cross-Origin-Opener-Policy`, `Strict-Transport-Security`
  and `Permissions-Policy`. A Playwright test loads the page and submits the contact form with zero
  CSP violations. Zod runs `jitless`, because its `new Function` probe is otherwise reported as a
  violation.
- **Input:** validated on client and server; no HTML rendered from user input; honeypot field on the
  contact form.
- **Rate limiting:** per-IP, in-memory fixed window on the contact route (per instance, keyed on the
  first `X-Forwarded-For` entry; `CONTACT_RATE_LIMIT_MAX` per `CONTACT_RATE_LIMIT_WINDOW_MS`, 429
  with `Retry-After`); NGINX `limit_req` on gated environments.
- **Containers:** run as non-root.
- **Secrets:** only in GitHub Secrets (environment-scoped, masked in logs); never in Git, Terraform
  state or images. `npm audit` and Dependabot are enabled.
- **Logging:** `winston` JSON logs to stdout with `service`, `env` and `correlationId`
  (`X-Correlation-ID` accepted when it is 1–128 characters of `A–Z a–z 0–9 . _ -`, otherwise
  generated, and echoed on the response). Message bodies and emails are never logged, only lengths
  and ids. Cloud Run metrics and Cloud Logging act as the metrics and search layer.

## Key decisions

- **Server Components by default.** Only the mobile menu, contact form and animated pieces
  (count-up, motion wrappers) are Client Components, which keeps the JavaScript small.
- **shadcn-style component library.** Shared elements (`Button`, `Badge`, `Card`, `Input`, `Field`,
  ...) are copy-owned primitives in `src/components/ui`, built with `class-variance-authority`
  variants, `asChild` through `@radix-ui/react-slot`, and `className` merged with `cn`. Sections
  compose these primitives instead of restyling raw elements.
- **Reduced motion is handled in two layers.** framer-motion animation goes through
  `MotionConfig reducedMotion="user"` and small wrappers (`Reveal`, `CountUp`); CSS transitions and
  animations (hover lifts, colour fades, the hero float) are switched off by one unlayered
  `prefers-reduced-motion: reduce` rule in `globals.css`, which outranks Tailwind's utility layer
  without `!important`. With reduced motion, content is shown immediately and final stat values are
  always in the DOM.
- **Focus rings that work on every surface.** One global `:focus-visible` outline uses the `ring`
  token. On the blue featured-course band the blue ring was invisible (1:1), and on the navy footer
  it was only 3.1:1, so those surfaces set `focus-ring-inverse`, which turns every ring inside them
  white (5.5:1 and 17:1).
- **Motion.** Sections below the hero fade and rise in once as they scroll into view (`Reveal`,
  framer-motion `whileInView`, loaded through `LazyMotion` with `domAnimation` only). The hero is
  never hidden, so the LCP image and the `h1` paint straight away. Stats count up from zero the
  first time they are visible; screen readers always get the final value from visually hidden text.
  The hero chips float in pure CSS for two short cycles and then stop, so the motion ends within 5
  seconds and needs no pause control (WCAG 2.2.2). With reduced motion nothing moves and everything
  is visible on load.
- **Typed content.** All copy lives in typed constants under `src/content`, so components stay free
  of magic strings.
- **Design tokens once.** Colours, type and spacing are extracted from Figma into `globals.css`
  (Tailwind v4 `@theme inline`, shadcn semantic naming). Design pixels are converted to `rem`. Type
  sizes are fluid `clamp()` tokens between the mobile frame (402 px) and the desktop frame (1280
  px), for example `text-h1` goes from 40/44 to 64/70. Fonts are Plus Jakarta Sans (headings,
  600/700/800) and Inter (body and UI, 400/600/700). The Figma file has no error colour, so
  `destructive` (`#c4262e`) is my addition. `text-subtle-foreground` (`#6d7384`) is 4.45:1 on the
  cream surface, just under WCAG AA for body text; it is kept as designed and flagged for review.
- **Contact form via a versioned REST endpoint.** `POST /api/v1/contact` validates with the same Zod
  schema as the client, rate-limits and acknowledges. It is a mock and sends no email. Responses:
  `201 {status: "received", id}`; `400` for invalid JSON or `{error: "validation", fieldErrors}`;
  `413` over 16 KB; `415` for anything but JSON; `429` with `Retry-After`; `500` without details. A
  filled honeypot gets the same `201` so bots learn nothing, and is logged as `honeypot`.
- **Contact form behaviour.** React Hook Form with the shared schema validates each field when it
  loses focus and everything on submit, then focuses the first invalid field. Errors are linked to
  their fields through `aria-describedby`; server-side field errors are shown the same way. Success
  is announced in a `role="status"` region that is always mounted, failures (server, network, rate
  limit) in a `role="alert"` message, and what was typed is kept. While sending, the button reads
  "Sending…" and is `aria-disabled` rather than `disabled`, so keyboard focus stays on it; repeat
  submits are ignored.
- **Layouts the design did not show.** The designs have no tablet layout, mobile menu or interaction
  states. I designed them in the same visual language: a drop-down mobile menu under the header
  (full-width nav links, then Log in and Start learning), two-column category cards and a row of
  stats under the quote on tablet, steps in a row with their connecting line from 768 px, and hover
  and focus states for every interactive element (category cards lift and nudge their arrow on both
  hover and keyboard focus). Hero, featured course, people and contact switch to two columns at 1024
  px. The mobile menu moves focus to its first link, traps Tab inside the menu, locks page scroll,
  closes on `Esc` (returning focus to the menu button), on link click and when the window grows to
  desktop.
- **Search engines and status pages.** `robots.txt` reads `APP_ENV` on every request, so only
  production can ever be crawled (everything else answers `Disallow: /`, on top of the gate's
  `X-Robots-Tag: noindex`), even if an image was built with the wrong environment. `sitemap.xml`
  lists the single page at its canonical origin. Unknown URLs get a 404 page and rendering errors an
  error page, both in the site's style with one clear way back home; the error page offers "Try
  again" and shows the server's error reference, never the error message.
- **Header links.** The design does not say where the navigation goes, so the links scroll to the
  matching section: Courses and Start learning to the categories, For Teams and Log in to contact,
  Community to the people section and About to "How Luma works". Footer entries without a page
  (Careers, Journal, Terms, Privacy) point to the top of the page.
- **Contrast fixes against the design.** "Browse all courses" uses white instead of `#e7e7ec`, which
  is 4.46:1 on the blue band. Step labels and the response-time line use the secondary text colour
  instead of the tertiary one, which is 4.45:1 on the cream surface. Everything else is as designed.
- **People collage.** The photos are laid out in the design's pixel sizes and scaled with container
  query units, so the collage keeps its proportions from 320 px to desktop; on mobile it is 10 %
  shorter, as in the mobile frame.
- **Permissions-Policy.** `browsing-topics` was removed from the header: current Chromium no longer
  recognises it and logged a console error on every page load.
- **Design inconsistencies resolved.** The desktop design shows "STEP 01" on all three steps; I used
  01, 02 and 03. The mobile contact form was in Portuguese; the page is English on every breakpoint.
  The lorem-ipsum paragraph in the people section is kept as in the design.
- **NGINX gate as a sidecar.** Non-production environments run NGINX (basic auth) in front of the
  app inside the same Cloud Run service, built from the same `Dockerfile`. Production has no gate.
- **One GCP project per environment.** `preview`, `develop`, `staging` and `production` deploy to
  separate existing projects. This isolates IAM, quotas and billing, and the pipelines reuse the
  Workload Identity setup already shared across my repositories instead of creating new ones.
- **GitHub Secrets instead of Google Secret Manager.** Simpler than running Secret Manager in each
  project; the trade-off is described in
  [Basic-auth gate and secrets](#basic-auth-gate-and-secrets).
- **Artifact Registry.** Used instead of the retired Container Registry.
- **`winston` for logging.** Structured JSON on stdout, which Cloud Logging ingests natively. A
  Prometheus/OpenTelemetry stack is out of scope for a single page.

## Known gaps

_To be completed before submission. Current candidates:_

- The Content-Security-Policy keeps `'unsafe-inline'` for scripts and styles. The page is
  prerendered, and Next.js inlines its RSC payload in `<script>` tags; nonces would force every
  request to render dynamically (and the experimental SRI option only covers external files).
  framer-motion and the people collage also set inline styles. No user-supplied HTML is ever
  rendered, which limits the risk. `upgrade-insecure-requests` is left out because every asset is
  same-origin and Cloud Run is HTTPS-only, while the directive would break plain-HTTP localhost.
- Rate limiting on the contact endpoint is per instance (in memory); a shared store would be needed
  at scale. It is keyed on the first `X-Forwarded-For` entry, which a client can spoof; acceptable
  for a mock endpoint that sends nothing.
- The contact form is a mock: no email is sent and nothing is stored.
- Preview environments are limited to pull requests from the same repository (forks do not receive
  secrets).
- Staging and production are separate projects. Promoting the staging image to production needs the
  production deployer to have read access to the staging registry; this is not set up yet.
- Lighthouse scores are measured on the production build; automation against the live URL is
  optional.
- The route ships about 277 kB of gzipped JavaScript, over the 130 kB target. The Phase 1
  placeholder page, with no client components, already shipped 170 kB: that is the Next.js 16 and
  React 19 runtime. The page adds about 21 kB (mobile menu, `tailwind-merge`, motion provider), the
  animations about 41 kB (framer-motion's animation engine 27 kB, `Reveal` 6 kB, `CountUp` 8 kB) and
  the contact form about 45 kB (React Hook Form, Zod and the resolver). A CSS and
  `IntersectionObserver` version would save about 39 kB; framer-motion was kept for its
  reduced-motion handling and consistency with the rest of the motion code.
- With JavaScript disabled, the sections that reveal on scroll stay hidden (framer-motion writes
  their starting `opacity: 0` into the server HTML). Search engines still read the text.
- Mobile copy and colour differences kept at the desktop version: the mobile frame adds "actually"
  to the second step ("professionals who actually use these skills"), shows the people paragraph in
  the primary text colour and a paler step 2 tile. The desktop wording and colours are used on every
  breakpoint so the page reads the same everywhere.
- Input placeholders use the design's tertiary text colour (4.45:1 on the cream input background).
- `npm audit` reports a high-severity ReDoS advisory in `picomatch`, pulled in only by dev tooling
  (ESLint, Vitest, lint-staged) and with no patched release yet. The production dependency tree
  (`npm audit --omit=dev`) has no known vulnerabilities.

## Time spent

_To be completed before submission (approximate hours: setup and infrastructure / page build / tests
and polish)._

## How I use AI to build software

To develop a fresh project, I follow these simple but complete steps:

Before I start, I already have a 3,000-word AI instruction Markdown that tells the AI model how to
act, what tools to choose, its style, etc.

1. First, I go to Claude's website and paste that AI instruction.
2. Then, I ask any questions or clarifications the model needs.
3. When the model is ready, it will generate two important files: `README.md` and `MASTERPLAN.md`.
   The latter would be like a to-do plan to how to execute the project and how to help me build it;
   it is like the README file but more extensive, like a house plan.
4. After I have the files, I create a local folder on my computer to start working with those files,
   generating the `CLAUDE.md` and `AGENTS.md` AI instruction files to keep quality and use best
   practices.

### Tools used on this project

- **Claude** (claude.ai and Claude Code) for planning, the plan documents, code generation and
  review.

### How I verify AI output

- I read and understand every change before committing it, and I can explain any part of the code.
- Nothing is trusted until the automated gates pass: ESLint, Prettier, `tsc --noEmit`, unit and
  integration tests with the coverage gate, Playwright e2e and axe, all enforced by Husky locally
  and by CI on every push.
- Versions, commands and cloud configuration are checked against official documentation instead of
  relying on the model's memory.
- Visual accuracy is checked by me against the design with an overlay diff, and the page is tested
  by hand on mobile and desktop with keyboard-only navigation.
- Generated infrastructure is reviewed through `terraform plan` before every apply.

## Assets and credits

- **Photos and avatars** (`public/images/`): exported from the Figma file supplied by Buzzvel for
  this challenge and used only for this submission. Their original sources and licences were not
  given with the design.
- **Logo, icons and decorative shapes** (`public/icons/`): exported from the same Figma file. UI
  icons in the mobile menu come from [Lucide](https://lucide.dev) (ISC licence).
- **Fonts:** [Inter](https://rsms.me/inter/) and
  [Plus Jakarta Sans](https://github.com/tokotype/PlusJakartaSans), both under the SIL Open Font
  Licence 1.1, self-hosted through `next/font`.

The challenge brief and the design files belong to Buzzvel and are not included in this repository.

## License

See [`LICENSE`](./LICENSE).
