# Buzzvel FE

A responsive landing page for **Luma**, a fictional online-learning platform, built as my submission
for the **Buzzvel Front-End Engineer coding challenge (November 2026)**. It is one complete page for
mobile, tablet and desktop, implemented from the supplied Figma design with **Next.js (App Router),
TypeScript and Tailwind CSS**, with typed reusable components, accessible semantics,
reduced-motion-safe animation and local mock data.

Around the page I also built a production-style delivery setup: Docker, GitHub Actions and Google
Cloud Run, with five environments, set up with the `gcloud` CLI. The repository also contains a
Terraform description of the same infrastructure, written to demonstrate Terraform and never applied
(see [Terraform](#terraform)). The challenge only asks for the page, so the infrastructure is
deliberately kept small and documented.

> **Status:** released (`v1.0.0`). The full execution plan (scope, architecture, phases and quality
> gates) is in [`MASTERPLAN.md`](./MASTERPLAN.md).

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
  - [Cloud setup (gcloud)](#cloud-setup-gcloud)
    - [Prerequisites](#prerequisites)
    - [Usage](#usage)
  - [Terraform](#terraform)
    - [What the configuration describes](#what-the-configuration-describes)
    - [Layout](#layout)
    - [How it would be applied](#how-it-would-be-applied)
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
| IaC and CI/CD | `gcloud` setup script, GitHub Actions (Workload Identity Federation, no stored keys); Terraform as a reference only, never applied                                 |
| Secrets       | GitHub Secrets (environment-scoped), injected at deploy time. Google Secret Manager is not used                                                                    |

## Project structure

```text
buzzvel-fe_web/
├── .github/
│   └── workflows/        # ci · build-push-deploy · deploy-preview · cleanup-preview · deploy-env · deploy-prod
├── .husky/               # pre-commit · commit-msg · pre-push
├── docker/nginx/         # nginx.conf.template · entrypoint.sh (basic-auth gate)
├── docs/                 # Lighthouse screenshot
├── infra/terraform/      # bootstrap · modules · envs (reference only, never applied)
├── public/               # images (AVIF/WebP + fallbacks), favicon, og image
├── src/
│   ├── app/              # layout, page, globals.css, robots, sitemap, health, ready, api/v1/contact
│   ├── components/
│   │   ├── ui/           # shadcn-style global primitives (button, badge, card, input, ...)
│   │   ├── layout/       # site-header, mobile-menu, site-footer, skip-link
│   │   ├── sections/     # hero, categories, featured-course, how-it-works, ...
│   │   └── motion/       # motion-provider, reveal, count-up
│   ├── content/          # typed mock data (copy, categories, steps, stats, footer links)
│   ├── hooks/            # use-body-scroll-lock, use-focus-trap
│   ├── lib/              # cn, env (Zod-validated), logger, rate-limit, contact-client, security-headers
│   ├── schemas/          # contact.schema.ts
│   └── types/
├── tests/e2e/            # Playwright specs (smoke, a11y, contact, menu, motion)
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

| Script                   | What it does                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `npm run dev`            | Start the dev server                                                                                     |
| `npm run build`          | Production build                                                                                         |
| `npm start`              | Serve the production build                                                                               |
| `npm run lint`           | ESLint                                                                                                   |
| `npm run format`         | Prettier (write)                                                                                         |
| `npm run format:check`   | Prettier (check only, used in CI)                                                                        |
| `npm run typecheck`      | `tsc --noEmit`                                                                                           |
| `npm test`               | Unit and integration tests (Vitest)                                                                      |
| `npm run test:cov`       | Same, with the 80 % coverage gate                                                                        |
| `npm run test:e2e`       | Playwright end-to-end tests: Chromium desktop and mobile, plus Firefox, WebKit and mobile Safari locally |
| `npm run lighthouse`     | Lighthouse CI on the production build (mobile, 3 runs); run `npm run build` first                        |
| `npm run design:compare` | Pixel diff against the git-ignored design frames; needs a production server on :3100                     |

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

| Environment  | Trigger                     | URL                                                                | Basic auth                  | Notes                                                                                                                                                                   |
| ------------ | --------------------------- | ------------------------------------------------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `local`      | `docker compose up --build` | `http://localhost:3000`                                            | Optional (`--profile gate`) | Bind mounts, hot reload                                                                                                                                                 |
| `preview`    | Pull request to `develop`   | `buzzvel-fe-pr-<n>` Cloud Run URL                                  | Yes                         | Created on PR open/sync, **deleted on PR close**. Same-repo PRs only                                                                                                    |
| `develop`    | Push to `develop`           | `buzzvel-fe-develop` Cloud Run URL                                 | Yes                         | Latest, unstable                                                                                                                                                        |
| `staging`    | Push to `release/*`         | `buzzvel-fe-staging` Cloud Run URL                                 | Yes                         | Candidate for the next stable release                                                                                                                                   |
| `production` | Merge to `main`             | [https://buzzvel-fe.moliveda.dev](https://buzzvel-fe.moliveda.dev) | **No**                      | Rebuilt from the merged commit, then tagged `vX.Y.Z` once the smoke test passes. Min instances 1 during the evaluation window (Nov 20 to Dec 4), then reviewed for cost |

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
push main     ─► CI ─► rebuild in prod  ─► Cloud Run  buzzvel-fe-prod     (app only) ─► tag vX.Y.Z
```

### CI/CD pipeline

Implemented with GitHub Actions, authenticated to Google Cloud through **Workload Identity
Federation** (no service-account keys). Each project already has a shared pool (`github-pool`), a
provider (`github-provider`, which only accepts tokens from repositories owned by `M-oliveda`) and a
deployer service account. This repository is allowed to impersonate each deployer through
`roles/iam.workloadIdentityUser`, scoped to `M-oliveda/buzzvel-fe_web`. Deploy jobs declare
`environment: <name>` so they pick up that environment's project, provider and deployer.

1. **`ci.yml`** (every push and PR): `npm ci`, `format:check`, `lint`, `typecheck`, unit and
   integration tests with the 80 % coverage gate, a production dependency audit, `next build` with
   Playwright e2e against it, Lighthouse CI, both Docker images built and smoke-tested, and
   `terraform fmt -check` on every run (formatting only, see [Terraform](#terraform)). Coverage, the
   Playwright report and the Lighthouse reports are uploaded as artifacts. All of them feed one
   required check, `CI passed`.
2. **Deploy, only after `CI passed`:** `ci.yml` calls the deploy workflows as reusable workflows. (A
   `workflow_run` trigger would only fire for workflow files already on `main`.)
   - `deploy-preview.yml`: pull requests into `develop` from this repository (never forks). Deploys
     `buzzvel-fe-pr-<n>` and keeps one PR comment with its URL up to date.
   - `cleanup-preview.yml`: deletes the preview service when the PR closes, merged or not.
   - `deploy-env.yml`: a push to `develop` deploys `buzzvel-fe-develop`; a push to `release/**`
     deploys `buzzvel-fe-staging`.
   - `deploy-prod.yml`: a push to `main` (a merged release or hotfix PR) reads the version from
     `package.json` and stops if `v<version>` already exists, rebuilds the commit in the production
     project, deploys it without the gate, and only after the smoke test creates the `v<version>`
     tag and the GitHub Release. A tag therefore always marks a release that is live.
3. **`build-push-deploy.yml`** (reusable, used by all of the above): authenticates through WIF,
   builds `app` (with that environment's `APP_ENV` and `NEXT_PUBLIC_SITE_URL`) and, when gated,
   `gate`, pushes both to the project's Artifact Registry tagged with the commit SHA (BuildKit layer
   cache), and runs `gcloud run deploy`, which creates the service on its first run and sets its
   runtime service account, scaling, labels and public access on every run. Gated services get two
   containers: `gate` on `:8080` (ingress) depends on `app`, which must answer `/health` on `:3000`
   before the instance takes traffic.
4. **Post-deploy smoke:** `/health` and `/ready` return 200. On gated environments `/` returns 401
   without credentials and 200 with them, and carries `X-Robots-Tag`. In production `/` returns 200.

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
values are never stored in Git. Production has no gate and no such secrets.

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
git checkout -b release/1.0.0 develop
npm version 1.0.0 --no-git-tag-version           # the version deploy-prod tags; commit it
git push -u origin release/1.0.0                 # deploys to staging, verify it there
gh pr create --base main --head release/1.0.0    # merge (merge commit) once CI passes
```

The merge to `main` deploys production and creates the `v1.0.0` tag and GitHub Release. `main` is
protected, so releases reach it only through a pull request. Merge `main` back into `develop`
afterwards (also through a pull request). A hotfix works the same way from `hotfix/<topic>`, with a
patch version bump.

### Rollback

Send traffic back to the previous revision, which takes effect at once:

```bash
gcloud run revisions list --service buzzvel-fe-prod --project moliveda-gcloudprojects-prod --region us-central1
gcloud run services update-traffic buzzvel-fe-prod --to-revisions <previous-revision>=100 \
  --project moliveda-gcloudprojects-prod --region us-central1
```

Then ship the fix as a patch release and, once it is live, return traffic to the newest revision
with `gcloud run services update-traffic buzzvel-fe-prod --to-latest` (same project and region).

## Cloud setup (gcloud)

Deploys use the `gcloud` CLI from GitHub Actions. The few resources they need are created once per
project with [`scripts/gcp-setup.sh`](./scripts/gcp-setup.sh), which I run from my machine. It is
idempotent, so re-running it is safe:

- Enables the Cloud Run, Artifact Registry and IAM Credentials APIs (Secret Manager and Cloud Build
  are not required).
- Creates the `buzzvel-fe` Artifact Registry Docker repository and applies its cleanup policies
  ([`scripts/gcp/cleanup-policies.json`](./scripts/gcp/cleanup-policies.json)): keep the 10 most
  recent versions; delete untagged and `pr-*` images after 7 days and anything after 30 days.
- Creates the `buzzvel-fe-runtime` service account the revisions run as. It has no project roles:
  the app calls no Google APIs.
- Production only: maps `buzzvel-fe.moliveda.dev` to `buzzvel-fe-prod` (Cloud Run domain mapping,
  available in `us-central1`, so no load balancer is needed) and prints the DNS records to add at
  the registrar. Google issues and renews the certificate. The mapping needs the service, so run the
  script again after the first production deploy.

Cloud Run services are not created by the script: the first `gcloud run deploy` of each environment
creates its service, and every deploy sets the image, environment variables, the gate sidecar,
scaling (`develop` and `staging` 0–2, `production` 1–3, previews 0–1), labels and public access.

The Workload Identity pool, provider and deployer service accounts are shared by my other
repositories, so the script does not manage them. This repository's binding to them is set up once
by hand (see [Prerequisites](#prerequisites)).

### Prerequisites

- The `gcloud` CLI, authenticated (`gcloud auth login`), with the `beta` component for the domain
  mapping
- The four GCP projects listed in [Environments and deployment](#environments-and-deployment), with
  billing enabled, and the roles needed to create the resources above
- Ownership of the DNS zone for `moliveda.dev`, verified in Search Console by the account that runs
  the script (`gcloud domains verify moliveda.dev`); required by the domain mapping
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
for env in preview develop staging production; do
  scripts/gcp-setup.sh "$env"
done
# After the first production deploy: map the custom domain and print its DNS records
scripts/gcp-setup.sh production
```

`GCP_REGION` overrides the region (default `us-central1`).

## Terraform

[`infra/terraform`](./infra/terraform) describes the same infrastructure as code. **It was written
to demonstrate Terraform and has never been applied to Google Cloud**: the environments are set up
with [`scripts/gcp-setup.sh`](#cloud-setup-gcloud) and deployed with `gcloud`. CI only checks that
it is formatted (`terraform fmt -check -recursive`).

### What the configuration describes

- Artifact Registry Docker repository (`buzzvel-fe`) with cleanup policies
- The runtime service account
- Cloud Run services for `develop`, `staging` and `production` (production without the gate
  container), with public access and `deletion_protection` on production
- The custom domain mapping for production (`buzzvel-fe.moliveda.dev`)
- A bootstrap configuration for the remote state bucket (GCS) and the required APIs

It is designed to work alongside the deploy workflows: Terraform would ignore the containers
(images, environment variables, the gate sidecar) through `lifecycle.ignore_changes`, so image
rollouts would not show up as drift and **secret values would never reach Terraform state**. Each
service would start with a placeholder container named after its ingress container (`gate`, or `app`
in production), which the first deploy replaces.

### Layout

```text
infra/terraform/
├── bootstrap/     # one-time: GCS state bucket, required APIs
├── modules/       # artifact-registry, cloud-run-service, runtime-sa, domain
└── envs/          # preview.tfvars, develop.tfvars, staging.tfvars, production.tfvars
```

### How it would be applied

Not part of this project's delivery; shown for reference. Applying it to projects already set up
with the script would need the existing resources imported first.

```bash
# 1. One-time bootstrap per project (state bucket and APIs): see infra/terraform/bootstrap/README.md

# 2. Per environment (one state per project): <suffix> is prev, dev, stg or prod
cd infra/terraform
terraform init -reconfigure \
  -backend-config="bucket=moliveda-gcloudprojects-<suffix>-tfstate" \
  -backend-config="prefix=buzzvel-fe/<env>"
terraform plan  -var-file=envs/<env>.tfvars -out=<env>.tfplan
terraform apply <env>.tfplan
terraform output domain_dns_records    # production only: records to add at the registrar
```

**Variables** (`variables.tf`, set per environment in `envs/<env>.tfvars`):

| Variable              | Default              | Purpose                                                                     |
| --------------------- | -------------------- | --------------------------------------------------------------------------- |
| `project_id`          | (required)           | GCP project of the environment                                              |
| `env`                 | (required)           | `preview`, `develop`, `staging` or `production`                             |
| `region`              | `us-central1`        | Region of every resource                                                    |
| `repository_id`       | `buzzvel-fe`         | Artifact Registry repository (`ARTIFACT_REGISTRY_REPO`)                     |
| `runtime_sa_id`       | `buzzvel-fe-runtime` | Runtime service account id                                                  |
| `create_service`      | `true`               | `false` for preview, whose services the PR workflows own                    |
| `service_name`        | `null`               | Cloud Run service (required when `create_service` is true)                  |
| `min_instances`       | `0`                  | Minimum instances (production: 1 during the evaluation window)              |
| `max_instances`       | `2`                  | Cost ceiling (production: 3)                                                |
| `deletion_protection` | `true`               | Blocks destroying the service (off for develop and staging)                 |
| `domain_name`         | `null`               | Custom domain mapped to the service (production: `buzzvel-fe.moliveda.dev`) |

**Outputs:** `repository_url` (image path prefix), `runtime_service_account`, `service_name`,
`service_uri` (run.app URL; `null` for preview) and `domain_dns_records` (production only).

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

CI values are **GitHub Actions variables** (not secrets). Values that differ per project are set on
each GitHub Environment, so a job sees them only when it declares `environment:`:

| Variable                         | Scope       | Used by | Value                                                                                                    |
| -------------------------------- | ----------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `GCP_REGION`                     | Repository  | CI      | `us-central1`                                                                                            |
| `ARTIFACT_REGISTRY_REPO`         | Repository  | CI      | `buzzvel-fe`                                                                                             |
| `GCP_PROJECT_ID`                 | Environment | CI      | That environment's project, e.g. `moliveda-gcloudprojects-stg`                                           |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Environment | CI      | `projects/<project-number>/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `GCP_SERVICE_ACCOUNT`            | Environment | CI      | That project's deployer, e.g. `cicd-deployer-stg@moliveda-gcloudprojects-stg.iam.gserviceaccount.com`    |

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

**Cross-browser checks:** `npm run test:e2e` runs every spec on Chromium (desktop 1440 px and mobile
390 px), Firefox and WebKit (desktop) and mobile Safari (WebKit, 390 px). CI runs the two Chromium
projects only; the other three run locally (`npx playwright install firefox webkit` once). Three
keyboard-walk tests are skipped on WebKit, which, like Safari, leaves links and buttons out of the
Tab order unless macOS Full Keyboard Access is on. On Firefox, the contact form's scoped axe scans
are skipped: Playwright's Firefox crashes the page inside them (not reproducible outside the test
runner); the whole-page axe scan still runs on Firefox. Each skip states its reason in the spec.

**Pixel-perfect workflow:** `npm run design:compare` screenshots a running production build at the
two frame widths (402 and 1280 px, at 2×, reduced motion so everything is revealed) and writes page,
design, diff and 50 % overlay images, for the whole page and for each of the ten sections, to
`design/diff/`. Section offsets in the frames are read from `design/sections.json`; both stay in the
git-ignored `design/` folder. It prints the mismatch and the height difference per section, so the
largest deltas are fixed first.

### Results

Measured on 2026-11-19 on the production build.

| Check                          | Result                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Unit and integration (Vitest)  | 213 tests pass; coverage 99.7 % statements, 98.5 % branches, 100 % functions, 100 % lines                  |
| End to end (Playwright)        | 104 pass, 16 skipped by design (menu tests on desktop projects, the WebKit and Firefox skips above)        |
| Lighthouse, mobile (3 runs)    | Accessibility 100, Best Practices 100, SEO 100, Performance 92 (91–94 over 15 runs); CLS 0, TBT 10–20 ms   |
| Largest Contentful Paint       | 3.4 s simulated (target 2.5 s); about 0.1 s observed on the local run (see [Known gaps](#known-gaps))      |
| Design diff, desktop (1280 px) | 3.6 % of pixels differ; page 5701 px tall against 5691.5 px; every section within 4 px of its frame height |
| Design diff, mobile (402 px)   | 6.9 % of pixels differ; page 7811 px tall against 7799 px; every section within 9 px of its frame height   |

![Lighthouse mobile scores on the production build: Performance 92, Accessibility 100, Best Practices 100, SEO 100](./docs/lighthouse-mobile.png)

_Lighthouse 13, mobile profile, median of 3 runs on the production build (2026-11-19)._

Most of the remaining pixel difference is anti-aliasing and sub-pixel text positioning, which the
diff counts in full. Differences kept on purpose: the desktop copy and colours on mobile and the
contrast fixes (see [Key decisions](#key-decisions) and [Known gaps](#known-gaps)), the
featured-course image a few pixels shorter on mobile, and the people collage, whose photos sit up to
about 8 px from their place in the mobile frame because that frame is not a uniform scale of the
desktop one.

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
- **Secrets:** only in GitHub Secrets (environment-scoped, masked in logs); never in Git or images.
  `npm audit` and Dependabot are enabled.
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
- Production is rebuilt from the merged commit instead of promoting the staging image: the canonical
  URL is baked into the build and the projects share no registry. Same commit, base images and
  lockfile, but the production image itself is not the one verified on staging.
- The `vX.Y.Z` tags are created by the production workflow with `GITHUB_TOKEN`, so unlike the
  commits they are not GPG-signed.
- The production Cloud Run service has no deletion protection: it is created by `gcloud run deploy`,
  not by Terraform (whose configuration sets `deletion_protection`). No workflow deletes it; only
  preview services are deleted, by name, when their pull request closes.
- The custom domain uses Cloud Run domain mapping, which Google still lists as Preview ("not
  production-ready", with possible extra latency). A global external HTTPS load balancer with a
  serverless NEG is the GA alternative, at a fixed monthly cost not justified for this page.
- The NGINX gate has no `limit_req` rate limit and no scripted smoke test of its own
  (`scripts/test-gate.sh`); the post-deploy smoke test checks its behaviour on every gated deploy.
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
- Lighthouse mobile Performance is 91–94 (median 92) against the 95 target, and the simulated
  Largest Contentful Paint is about 3.4 s against 2.5 s; CI reports both as warnings. The hero image
  is 22 kB and arrives early (observed LCP is about 0.1 s locally), but Lighthouse's simulated 1.6
  Mbps connection also counts the JavaScript and fonts requested before that paint, so the cause is
  the route JavaScript above. Three ways of loading the hero image (`preload`,
  `fetchPriority="high"` with and without `preload`, `loading="eager"`) were measured over five runs
  each and scored the same, so the original `preload` was kept.
- `npm audit` reports high-severity advisories only in dev tooling, with no patched release yet: a
  ReDoS in `picomatch` (ESLint, Vitest, lint-staged) and denial-of-service issues in `basic-ftp`,
  reached through `@lhci/cli`'s proxy support, which this project never uses for FTP. The production
  dependency tree (`npm audit --omit=dev`) has no known vulnerabilities.
- A local `next build` can reuse stale CSS from Turbopack's persistent cache (`.next/cache`) after a
  `globals.css` edit; delete `.next/cache/turbopack` if a style change does not show. Docker images
  and the CI Lighthouse job always build without that cache.

## Time spent

About **32 hours over 4 days** for the whole project: planning, the local and cloud delivery setup,
the page build, interactions and accessibility, the pixel-perfect pass, tests and documentation.

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

- **Claude** (claude.ai) for the first plan documents, and **Claude Code** for planning each phase,
  code generation and review.
- **MCP servers** used from Claude Code: the **Figma MCP server** to read the design (tokens,
  layout, assets) and **Context7** for up-to-date library and cloud documentation (Next.js 16, Cloud
  Run, `gcloud`, GitHub Actions, Terraform providers) instead of relying on the model's memory.

### How I verify AI output

- I read and understand every change before committing it, and I can explain any part of the code.
- Nothing is trusted until the automated gates pass: ESLint, Prettier, `tsc --noEmit`, unit and
  integration tests with the coverage gate, Playwright e2e and axe, all enforced by Husky locally
  and by CI on every push.
- Versions, commands and cloud configuration are checked against official documentation instead of
  relying on the model's memory.
- Visual accuracy is checked by me against the design with an overlay diff, and the page is tested
  by hand on mobile and desktop with keyboard-only navigation.
- Cloud setup commands are read and run by me, never by CI (`scripts/gcp-setup.sh`).

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
