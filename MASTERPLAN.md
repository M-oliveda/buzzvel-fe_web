# MASTERPLAN — Buzzvel FE

> The "house plan" for this project. `README.md` tells a reader how to run the project; this file
> tells the team (and the AI agents) **what to build, in which order, and why**.

| Field          | Value                                                                      |
| -------------- | -------------------------------------------------------------------------- |
| Project        | Buzzvel FE — Front-End Engineer coding challenge                           |
| Repository     | `buzzvel-fe_web` (public GitHub repository, local folder of the same name) |
| Product type   | `web`                                                                      |
| Owner          | Mauricio Oliveda (`maurioliveda@gmail.com`)                                |
| Production URL | `https://buzzvel-fe.moliveda.dev`                                          |

---

## 1. Goal and success criteria

Build **one complete, responsive landing page** (desktop, tablet and mobile) from the supplied Figma
design with **Next.js App Router, TypeScript and Tailwind CSS**, and wrap it in a delivery pipeline
that shows senior-level engineering.

Buzzvel evaluates: design accuracy, responsiveness, code quality, working interactions,
accessibility and performance, plus clear decisions and attention to detail. Every goal below maps
to one of those.

| Evaluation area      | Measurable target                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design accuracy      | Pixel-perfect at the two design frames (mobile and desktop).                                                                                         |
| Responsiveness       | Clean layout from 320 px to 1920 px. Explicit tablet layout (design has none). No horizontal scroll.                                                 |
| Code quality         | Strict TypeScript, ESLint + Prettier clean, small typed components, Husky gates, **≥ 80 % coverage**.                                                |
| Working interactions | Mobile menu, anchor navigation, hover and focus states, scroll-reveal motion, animated stats, contact form with validation and success/error states. |
| Accessibility        | Semantic HTML, keyboard-operable controls, alt text, visible focus, WCAG 2.2 AA contrast, Lighthouse a11y 100, zero axe violations.                  |
| Performance          | Lighthouse mobile: Performance ≥ 95, SEO 100, Best Practices 100. LCP < 2.5 s, CLS < 0.05, TBT < 200 ms.                                             |
| Reduced motion       | Every animation respects `prefers-reduced-motion` (no motion, content still visible).                                                                |

## 2. Scope

- The single landing page with all sections visible in the desktop and mobile designs.
- Local/mock data only. A mock `POST /api/v1/contact` endpoint (validates and acknowledges; **sends
  no email**).
- Docker + Docker Compose for local development, a single multi-stage `Dockerfile`.
- Environments: `local`, `preview`, `develop`, `staging`, `production`, deployed to Google Cloud
  Run.
- Terraform for persistent infrastructure, GitHub Actions CI/CD, Husky pre-commit gates.
- Unit, integration and a small set of end-to-end tests.

## 4. Stack

| Layer          | Choice                                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime        | Node.js 26 (Active LTS), npm, exact dependency versions (`.npmrc` `save-exact`)                                                                                                                |
| Framework      | Next.js 16 (App Router, `src/app`, Cache Components, Turbopack), React 19, and TypeScript                                                                                                      |
| Styling        | Tailwind CSS v4, shadcn/ui-style component pattern (`class-variance-authority`, `@radix-ui/react-slot`, `clsx` + `tailwind-merge` as the `cn` helper), semantic design tokens in `globals.css` |
| Motion / icons | `framer-motion`, `lucide-react`                                                                                                                                                                |
| Forms          | React Hook Form + `@hookform/resolvers` + Zod                                                                                                                                                  |
| Fonts / images | `next/font` (self-hosted, subset, `display: swap`), `next/image` (AVIF/WebP, explicit `sizes`)                                                                                                 |
| Logging        | `winston` (JSON to stdout, correlation id) in route handlers                                                                                                                                   |
| Quality        | ESLint 9, Prettier, `lint-staged`, Husky, Gitmoji commit-message hook                                                                                                                          |
| Tests          | Vitest, React Testing Library, MSW, Playwright, `@axe-core/playwright`                                                                                                                         |
| Containers     | Docker (multi-stage), Docker Compose (local only), NGINX unprivileged (`gate` target)                                                                                                          |
| Cloud          | Google Cloud Run, Artifact Registry                                                                                                                                                            |
| IaC / CI       | Terraform (remote state in GCS), GitHub Actions                                                                                                                                                |
| Secrets        | GitHub Secrets (environment-scoped), injected at deploy time. No Google Secret Manager                                                                                                         |

## 6. Architecture

### 6.1 Page architecture

A single statically rendered route (`/`). Sections are Server Components by default. Client
Components are limited to the pieces that need state, effects or browser APIs: mobile menu, contact
form, count-up stats and motion wrappers.

```text
RootLayout (fonts, metadata, MotionProvider, skip link)
└── Page (/)
    ├── SiteHeader (+ MobileMenu)            client (menu state)
    ├── <main id="main">
    │   ├── Hero
    │   ├── Categories        (4 cards, data-driven)
    │   ├── FeaturedCourse    (blue band)
    │   ├── HowItWorks        (3 steps)
    │   ├── TestimonialStats  (quote + count-up stats)
    │   ├── People            (copy + image collage)
    │   ├── Contact           (info cards + ContactForm)
    │   └── CtaBand
    └── SiteFooter
```

### 6.2 Delivery topology

```text
                      GitHub (public)
   PR open/sync ──► CI ──► Artifact Registry ──► Cloud Run  buzzvel-fe-pr-<n>   (gate + app)  preview
   push develop ──► CI ──► Artifact Registry ──► Cloud Run  buzzvel-fe-develop  (gate + app)
   push release/* ► CI ──► Artifact Registry ──► Cloud Run  buzzvel-fe-staging  (gate + app)
   tag vX.Y.Z   ──► CI ──► promote image    ──► Cloud Run  buzzvel-fe-prod     (app only)
                                                     │
                              buzzvel-fe.moliveda.dev ┘  (production only)

Protected services:  client ─► [ nginx gate :8080, basic auth ] ─► [ next app :3000 ]  (same Cloud Run service, 2 containers)
Credentials:         GitHub Secrets (per GitHub Environment) ─► deploy workflow ─► Cloud Run env vars
                     `BASIC_AUTH_USERNAME` + `BASIC_AUTH_PASSWORD` ─► injected into the NGINX gate container
                     ─► gate `entrypoint.sh` builds the htpasswd file at start ─► nginx `auth_basic_user_file`
```

The username and password of each protected environment are **injected into NGINX** (the gate
container) as environment variables at deploy time. NGINX uses them to build its basic-auth user
file, so the website unlocks only for visitors who enter that username and password.

Trade-off: because secrets live in GitHub rather than Google Secret Manager, the username and
password are stored as Cloud Run environment variables and are visible to anyone with
`run.services.get` on the project. This is acceptable because they only protect non-production
previews that serve mock data, the password is unique to this project and rotated by re-running the
deploy, and the values are never stored in Terraform state or Git. Production has no gate and no
such secrets.

Health: `GET /health` (liveness, no dependencies) and `GET /ready` (readiness; trivial here because
there are no downstream dependencies, kept for contract consistency). NGINX exempts both from basic
auth so Cloud Run probes work.

## 7. Repository layout

```text
buzzvel-fe_web/
├── .github/
│   ├── workflows/            ci.yml · deploy-preview.yml · cleanup-preview.yml · deploy-env.yml · release.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── .husky/                   pre-commit · commit-msg · pre-push
├── design/                   (git-ignored) reference frames for pixel diffs
├── docker/
│   └── nginx/                nginx.conf.template · entrypoint.sh
├── infra/
│   └── terraform/
│       ├── bootstrap/        state bucket + WIF (run once, documented)
│       ├── modules/          artifact-registry · cloud-run-service · iam-wif · domain
│       └── envs/             develop.tfvars · staging.tfvars · production.tfvars
├── public/                   images (AVIF/WebP + fallbacks) · favicon · og image
├── src/
│   ├── instrumentation.ts · instrumentation.node.ts   (boot-time env validation, fail fast)
│   ├── app/
│   │   ├── layout.tsx · page.tsx · globals.css · robots.ts · sitemap.ts · not-found.tsx · error.tsx
│   │   ├── health/route.ts · ready/route.ts
│   │   └── api/v1/contact/route.ts
│   ├── components/
│   │   ├── ui/               shadcn-style global primitives: button · badge · card · label · input · textarea · field · eyebrow · container · section-heading
│   │   ├── layout/           site-header · mobile-menu · site-footer · skip-link
│   │   ├── sections/         hero · categories · featured-course · how-it-works · testimonial-stats · people · contact · cta-band
│   │   └── motion/           motion-provider · reveal · count-up
│   ├── content/              site.ts · categories.ts · steps.ts · stats.ts · footer-links.ts   (typed mock data)
│   ├── hooks/                use-body-scroll-lock · use-focus-trap · use-media-query
│   ├── lib/                  cn.ts · env.ts (Zod-validated env) · logger.ts · rate-limit.ts · contact-client.ts
│   ├── schemas/              contact.schema.ts
│   └── types/
├── tests/
│   └── e2e/                  smoke.spec.ts · a11y.spec.ts · contact.spec.ts · menu.spec.ts
├── scripts/                  compare-design.ts (overlay/diff helper, dev only)
├── .env.example · .nvmrc · .npmrc · .editorconfig · .prettierrc.json · .prettierignore · .dockerignore · .gitignore
├── AGENTS.md · CLAUDE.md (symlink to AGENTS.md)
├── Dockerfile · docker-compose.yaml
├── eslint.config.mjs · next.config.ts · tsconfig.json   (Tailwind runs through @tailwindcss/turbopack; no PostCSS config)
├── vitest.config.mts · vitest.setup.ts · playwright.config.ts
├── LICENSE · README.md · MASTERPLAN.md
```

Unit and integration tests are colocated (`*.test.ts(x)`) with the code they cover. `design/` and
any confidential material never enter Git.

## 8. Conventions

- **Components:** named function components, named exports (Next.js special files are the only
  default exports). Files in `kebab-case`, components in `PascalCase`. Props typed as `<Name>Props`,
  with explicit return types on exported functions.
- **Data:** all copy and lists live in `src/content/*` as typed constants. No magic strings in JSX.
- **UI primitives:** follow the shadcn/ui pattern (see §10.3.1). Shared, reusable elements
  (`Button`, `Badge`, `Card`, inputs…) live in `src/components/ui`, are styled with `cva` variants,
  accept `className` and merge it with `cn`, and are the **only** place where base element styling
  is defined. Sections compose these primitives and do not restyle raw `<button>`/`<a>`/`<input>`
  elements.
- **Styling:** Tailwind utilities, semantic colour tokens from `globals.css`, no custom colours
  inline, no `!important`, no inline `style` except for dynamic values. Mobile-first (`min-width`)
  breakpoints.
- **Units:** design pixels converted to `rem` (÷16). Exact pixel values are acceptable only for
  hairlines and image intrinsic sizes.
- **Errors:** typed custom errors (`ValidationError`, `RateLimitError`), no empty `catch`, no `any`.
- **Env:** variables read only through `src/lib/env.ts` (Zod-validated; the app fails fast at boot
  if required values are missing). Never hard-code secrets.
- **Git:** GitFlow. Branches: `main`, `develop`, `feature/<topic>`, `release/<n>`, `hotfix/<topic>`.
  **Gitmoji** commit messages (`:<shortcode>: <Capitalised message>`, no trailing period, first line
  ≤ 72 chars, e.g. `:sparkles: Add hero section`), enforced by the owner's `.husky/commit-msg` hook
  (see [https://gitmoji.dev](https://gitmoji.dev)).
- **Versioning:** Semantic Versioning. First production release is `v1.0.0`.
- **PRs:** one concern per PR, template with checklist (tests, a11y, reduced motion, screenshots at
  390 and 1440).

## 9. Environments and delivery pipeline

| Environment  | Trigger                     | URL                                | NGINX basic auth            | Notes                                                                                                                  |
| ------------ | --------------------------- | ---------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `local`      | `docker compose up --build` | `http://localhost:3000`            | Optional (`--profile gate`) | Bind mounts, hot reload                                                                                                |
| `preview`    | Pull request to `develop`   | `buzzvel-fe-pr-<n>` Cloud Run URL  | Yes                         | Created on PR open/sync, **deleted on PR close**. Same-repo PRs only                                                   |
| `develop`    | Push to `develop`           | `buzzvel-fe-develop` Cloud Run URL | Yes                         | Latest, unstable                                                                                                       |
| `staging`    | Push to `release/*`         | `buzzvel-fe-staging` Cloud Run URL | Yes                         | Candidate for the next stable release                                                                                  |
| `production` | Tag `vX.Y.Z` (from `main`)  | `https://buzzvel-fe.moliveda.dev`  | **No**                      | Image promoted from the tagged commit. Min instances 1 during the evaluation window (Nov 20 → Dec 4), then review cost |

### Pipeline stages (GitHub Actions)

1. **`ci.yml`** (every push and PR): install (`npm ci`), `format:check`, `lint`, `typecheck`, unit
   and integration tests with the 80 % coverage gate, `next build`, then Playwright e2e against the
   production build. Upload coverage and Playwright report as artifacts. `terraform fmt -check` and
   `terraform validate` run when `infra/` changes.
2. **Build and push:** `docker build --target app` and `--target gate` → Artifact Registry, tagged
   with the commit SHA. Layer caching via `cache-from/cache-to`.
3. **Deploy:**
   - `deploy-preview.yml`: same-repo PRs only. Deploys `buzzvel-fe-pr-<n>`, comments the URL on the
     PR.
   - `cleanup-preview.yml`: on PR close, deletes the service.
   - `deploy-env.yml`: `develop` and `release/*` deploy to their Cloud Run service.
   - `release.yml`: on `v*.*.*` tag, verifies the tag is on `main`, promotes the image, deploys
     production, runs a smoke check (`/health`, `/`), creates a GitHub Release.
4. **Post-deploy smoke:** `curl` `/health` and assert the home page returns 200 (with basic-auth
   credentials from secrets in protected environments).

Rollback = redeploy the previous revision (`gcloud run services update-traffic`) or tag a patch
release.

## 10. Design implementation spec

### 10.1 Section inventory (from the two supplied frames)

| #   | Section             | Contents (desktop)                                                                                                                                                                                               | Mobile differences                                      |
| --- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | Header              | Logo `luma.`, nav (Courses, For Teams, Community, About), "Log in", primary "Start learning"                                                                                                                     | Logo + menu button; full-screen/drawer menu (to design) |
| 2   | Hero                | Eyebrow, H1 "Build skills that actually move you forward.", paragraph, 2 CTAs, avatar stack "Trusted by 24,000+ learners", image with "120+ expert-led courses" chip and "4.9 avg rating" card, decorative blobs | Stacked: text first, image below, full-width CTAs       |
| 3   | Categories          | Eyebrow, H2, intro, 4 numbered cards (01 Product Design, 02 Technology, 03 Business, 04 Creative) with "Explore →"                                                                                               | Single column                                           |
| 4   | Featured course     | Blue band, "Featured course" tag on image, "Most popular this month", H2, text, instructor, 3 chips (8 lessons, 2h 40min, Intermediate), yellow "View course", "Browse all courses →"                            | Image above content, stacked                            |
| 5   | How Luma works      | H2 "Less browsing. More learning.", 3 steps with icon tiles and connecting line                                                                                                                                  | Steps stacked                                           |
| 6   | Testimonial + stats | Quote (Alex Morgan, Product Manager), stats 24K+, 120+, 92%                                                                                                                                                      | Stacked; stats as column                                |
| 7   | The people          | Eyebrow, H2 "Meet international students & teachers", paragraph, outline button, circular backdrop with photo collage                                                                                            | Collage below text                                      |
| 8   | Contact             | Info cards (Email, Response Time), form card (Full name, Email, Your question, Send message)                                                                                                                     | Form below info; **English copy** (see 10.3)            |
| 9   | CTA band            | Yellow band, avatars, H2 "What will you learn next?", text, 2 CTAs, decorative shapes                                                                                                                            | Stacked CTAs                                            |
| 10  | Footer              | Dark navy; brand + tagline; columns Explore, Company, Support; © 2026 Luma Learning                                                                                                                              | Two-column link grid                                    |

### 10.2 Design tokens

All tokens are extracted from Figma (input I3) and written once as CSS variables exposed to Tailwind
v4 through `@theme inline` in `globals.css`, using the **shadcn/ui semantic naming**
(`background`/`foreground`, `primary`/`primary-foreground`, `secondary`, `accent`,
`muted`/`muted-foreground`, `border`, `input`, `ring`, `destructive`, `radius`), mapped from the
design palette (primary blue, cream background, yellow, peach, navy, neutrals, plus tints for
chips). Design-specific extras (yellow CTA, peach, navy footer) get their own named tokens. Also
tokenised: font family and weights, type scale (fluid where the design implies it), spacing scale,
radii, shadows, container width. Until I3 arrives, no styling work starts beyond layout scaffolding.

### 10.3 Ambiguity decisions (approved by owner)

| Topic                                               | Decision                                                                                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| "STEP 01" shown on all three steps                  | Render **01, 02, 03**. Mention in the README.                                                                                             |
| Mobile contact form is Portuguese                   | Use **English** on every breakpoint (`Full name`, `Email`, `Your question`, `Send message`).                                              |
| Lorem ipsum in the people section                   | Keep the placeholder text as in the design.                                                                                               |
| No mobile menu, tablet layout or interaction states | Design them in the same visual language; document in the README.                                                                          |
| Contact form behaviour                              | Zod + React Hook Form validation, accessible errors, submit to mock `POST /api/v1/contact`, success and failure states. No email is sent. |

### 10.3.1 UI component library (shadcn-style)

The design layer imitates [shadcn/ui](https://ui.shadcn.com): a small set of **global, copy-owned
components** (not an installed component package) that every section reuses.

- **Location and naming:** `src/components/ui/<name>.tsx`, kebab-case files, named exports.
- **Variants:** `class-variance-authority` defines `variant` and `size` (e.g. `Button`: `default`
  blue, `secondary`, `accent` yellow "View course", `outline`, `ghost`, `link`; sizes `sm`,
  `default`, `lg`, `icon`). Variant types are exported through `VariantProps`.
- **Composition:** `asChild` via `@radix-ui/react-slot` so `Button` can render a Next.js
  `Link`/anchor without nesting interactive elements.
- **Extensibility:** every primitive spreads native element props, forwards `ref`, and merges
  `className` through `cn`. Includes `data-slot` attributes for targeted styling.
- **Accessibility built in:** visible `focus-visible` ring from the `ring` token, `disabled` and
  `aria-invalid` styles, minimum 44 px touch target for primary controls.
- **Initial set:** `Button`, `Badge`, `Card` (+ header/title/content parts), `Label`, `Input`,
  `Textarea`, `Field` (label + control + description + error wiring), plus project-specific
  `Eyebrow`, `Container`, `SectionHeading`.
- **Rule:** a new visual pattern used in two or more places becomes a `ui` primitive before it is
  repeated a third time.
- **Tests:** each primitive has a unit test for variants, `asChild`, ref forwarding and
  focus/disabled behaviour.

### 10.4 Responsive strategy

Mobile-first. Tailwind default breakpoints unless Figma frames imply others: `sm` 640, `md` 768
(tablet), `lg` 1024, `xl` 1280. Layout rules: content container max-width taken from the desktop
frame and centred; categories 1 → 2 → 4 columns; hero and featured course switch from stacked to two
columns at `lg`; fluid type with `clamp()` tokens between the two design sizes; images always carry
intrinsic `width`/`height` and `sizes` to prevent layout shift.

### 10.5 Interactions

| Interaction         | Behaviour and requirements                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile menu         | Button with `aria-expanded`/`aria-controls`; focus moves into the menu, is trapped, `Esc` closes and restores focus; body scroll locked; closes on link click and when resized to desktop.  |
| Anchor navigation   | Header links scroll to sections; smooth scroll only when motion is allowed; `scroll-margin-top` for the sticky header.                                                                      |
| Hover/focus states  | Buttons, links, category cards (lift + arrow nudge), chips. Every hover has a visible `:focus-visible` equivalent.                                                                          |
| Scroll reveal       | `Reveal` wrapper (opacity + small translate) via `whileInView`, `once: true`. Disabled under reduced motion.                                                                                |
| Count-up stats      | 24K+, 120+, 92% animate when visible; reduced motion renders final values immediately. Final values always in the DOM text for screen readers (`aria-label` or visually hidden text).       |
| Hero floating chips | Subtle float animation, disabled under reduced motion.                                                                                                                                      |
| Contact form        | Inline validation on blur and submit, `aria-invalid` + `aria-describedby`, `role="status"` success message, error summary on failure, submit button disabled while pending, honeypot field. |
| Skip link           | First focusable element, jumps to `#main`.                                                                                                                                                  |

### 10.6 Pixel-perfect workflow

1. Receive the high-resolution frames (I5) and store them in `design/` (git-ignored).
2. Build each section against the frame, in `rem`, with tokens only.
3. Run `scripts/compare-design.ts`: Playwright screenshots the page at the design widths and
   produces an overlay and diff image against `design/`. Review per section, fix the largest deltas
   first (type metrics, line height, spacing, image crops).
4. Repeat after each batch of hi-res images. Record any accepted differences in the PR description.

### 10.7 SEO, metadata and assets

`metadata` API: title, description, canonical, Open Graph and Twitter card, theme colour, icons.
`robots.ts` and `sitemap.ts`. Optional JSON-LD (`Organization`/`Course`) if time allows. Fonts via
`next/font` with only the used weights and subsets. Hero image gets `priority` and the correct
`sizes`; all other images lazy-load. All imagery has meaningful `alt`; decorative shapes use
`alt=""` or `aria-hidden`.

## 11. Quality gates

### 11.1 Local (Husky)

| Hook         | Runs                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| `pre-commit` | `lint-staged` (ESLint `--fix`, Prettier `--write` on staged files) → `tsc --noEmit` |
| `commit-msg` | Gitmoji format check (owner's script)                                               |
| `pre-push`   | `vitest run --changed <upstream>` (fast unit tests; full run when no upstream)      |

The owner's existing scripts (input I6) are merged into these hooks rather than replaced:
`commit-msg` is kept as is, `pre-commit` keeps its style but runs `lint-staged` instead of the full
suite, and tests moved to `pre-push`.

### 11.2 Testing plan

| Level       | Tool                      | What it covers                                                                                                                                                                     |
| ----------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        | Vitest + RTL              | UI primitives, `cn`, env parsing, rate limiter, Zod schema, content integrity, `Reveal`/`CountUp` under reduced motion, mobile menu behaviour                                      |
| Integration | Vitest (+ MSW for client) | `POST /api/v1/contact` handler called with real `Request` objects: 201, 400, 429, honeypot; `ContactForm` with the client fetch layer; page render with all sections and landmarks |
| E2E         | Playwright (+ axe)        | Smoke on desktop and mobile projects; keyboard-only menu flow; contact submit success and failure; axe scan with zero violations; reduced-motion emulation                         |
| Coverage    | Vitest `v8`               | Thresholds 80 % lines, functions, branches, statements. Excluded: config files, `layout.tsx` boilerplate, type-only files — each exclusion justified in `vitest.config.mts`        |

Tests assert behaviour the user sees (roles, labels, text), not implementation details.

### 11.3 Security

CSP and security headers via `next.config.ts` (`X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, `frame-ancestors`); strict CSP is attempted in Phase 4 and any residual
`'unsafe-inline'` is documented as a known gap. Input validated on client and server; no HTML
rendered from user input; per-IP in-memory rate limit on the contact route (documented as
per-instance); NGINX `limit_req` on gated environments; containers run as non-root; secrets only in
GitHub Secrets (environment-scoped, masked in logs) and never in Git, Terraform state or images;
`npm audit` and Dependabot enabled; no secrets or confidential files in Git history.

### 11.4 Performance budget

Lighthouse CI on the production build (and optionally on the live URL): Performance ≥ 95, A11y 100,
Best Practices 100, SEO 100 (mobile profile). JS budget for the route: aim ≤ 130 kB gzip total. No
layout shift from fonts or images. A Lighthouse screenshot is saved for the README (optional per the
brief, but cheap to include).

### 11.5 Observability

`winston` JSON logs (`format.json()` with a `Console` transport, i.e. stdout) with `service`, `env`,
`correlationId` (`X-Correlation-ID` accepted or generated, echoed on the response). Never log
message bodies or emails (log lengths and ids only). Health endpoints as in §6.2. Cloud Run request
metrics and Cloud Logging serve as the metrics/search layer. Dedicated Prometheus/OpenTelemetry
stack is out of scope for a single static page.

## 12. Phases, tasks and schedule

| Phase | Name                                   |
| ----- | -------------------------------------- |
| 0     | Plan and documentation                 |
| 1     | Repository, tooling and local Docker   |
| 2     | Cloud environment and CI/CD            |
| 3     | Design system and page build           |
| 4     | Interactions, accessibility, motion    |
| 5     | Pixel-perfect pass, tests, performance |
| 6     | Release, domain and submission         |

### Phase 0 — Plan and documentation

- [x] Read the challenge PDF, both design frames and the charter.
- [ ] Review and approve `MASTERPLAN.md` and `README.md`.

### Phase 1 — Repository, tooling and local Docker _(first phase requested by owner)_

- [ ] Create the GitHub repo `buzzvel-fe_web` (public); `main` holds `README.md`, `LICENSE`,
      `.gitignore`. Create `develop`. Protect `main` and `develop` (PR required, CI required).
- [ ] Scaffold Next.js 16 + TypeScript + Tailwind v4 in `src/` layout; set `.nvmrc`, `engines`,
      exact dependency versions.
- [ ] Add dependencies: `framer-motion`, `lucide-react`, `zod`, `react-hook-form`,
      `@hookform/resolvers`, `clsx`, `tailwind-merge`, `class-variance-authority`,
      `@radix-ui/react-slot`, `winston`; dev: Vitest, RTL, MSW, Playwright, axe, ESLint plugins,
      Prettier + Tailwind plugin, Husky, lint-staged.
- [ ] Configure ESLint (flat), Prettier (charter config), `tsconfig` `strict` + path alias `@/*`,
      `.editorconfig`.
- [ ] Husky hooks per §11.1, merged with the owner's scripts (I6).
- [ ] `package.json` scripts: `dev`, `build`, `start`, `lint`, `format`, `format:check`,
      `typecheck`, `test`, `test:cov`, `test:e2e`, `prepare`.
- [ ] `Dockerfile`: stages `base` → `deps` → `dev` → `builder` → `app` (standalone, non-root,
      `HEALTHCHECK /health`) and `gate` (nginx-unprivileged). Pinned base image tags, verified
      against current LTS.
- [ ] `docker-compose.yaml` (local only): `web` with bind mounts and hot reload, ports exposed;
      optional `gate` profile to exercise NGINX locally.
- [ ] `health` and `ready` route handlers with tests.
- [ ] `.env.example`, `src/lib/env.ts` with Zod validation.
- [ ] Generate `AGENTS.md` (project context, commands, conventions, security rules) and `CLAUDE.md`
      as a symlink to it.
- [ ] Write the first CI workflow (`ci.yml`) and make it green on an empty page. _(Workflow written
      and every step verified locally; green run pending the first push.)_
- **Exit criteria:** fresh clone → `docker compose up --build` serves the app; `git commit` runs
  hooks; CI green; `/health` returns 200.

### Phase 2 — Cloud environment and CI/CD

- [ ] Bootstrap (documented, run once): GCS bucket for Terraform state, enable APIs (Run, Artifact
      Registry, IAM Credentials; Secret Manager and Cloud Build not required).
- [ ] GitHub setup: create GitHub Environments (`develop`, `staging`, `preview`) and store
      `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` as environment secrets in each; repository
      variables for the `GCP_*` values.
- [ ] Terraform modules: Artifact Registry repo, service accounts (deployer, runtime), Workload
      Identity Federation for the GitHub repo, Cloud Run services for `develop`, `staging`,
      `production` (production without the gate container). Terraform ignores `image` and env var
      changes (`lifecycle.ignore_changes`) so secret values never reach state.
- [ ] NGINX gate: `nginx.conf.template` (basic auth, `/health` and `/ready` exempt, `X-Robots-Tag`,
      `limit_req`, proxy to `127.0.0.1:3000`); `entrypoint.sh` reads `BASIC_AUTH_USERNAME` and
      `BASIC_AUTH_PASSWORD` at container start, fails fast if either is missing, hashes the password
      and writes the htpasswd file (mode 0400, values never logged). The deploy workflow injects the
      two GitHub secrets into the gate container on Cloud Run.
- [ ] Workflows: build and push, `deploy-preview`, `cleanup-preview`, `deploy-env`, `release`.
      Same-repo guard on preview.
- [ ] Verify: PR → preview URL commented; merge to `develop` → develop service updates;
      unauthenticated request to a gated env returns 401; `/health` returns 200 without auth.
- [ ] Terraform `fmt`/`validate` in CI.
- **Exit criteria:** every non-production environment reachable behind basic auth; production path
  proven with a throwaway tag (`v0.0.1`) or dry run.

### Phase 3 — Design system and page build

- [ ] Ingest I3/I4: fonts, tokens, optimised images (AVIF/WebP, responsive widths).
- [ ] `globals.css` tokens (shadcn semantic naming); shadcn-style `ui` primitives per §10.3.1
      (`Button` with `cva` variants first, then `Badge`, `Card`, `Label`, `Input`, `Textarea`,
      `Field`, `Eyebrow`, `Container`, `SectionHeading`) with unit tests.
- [ ] `RootLayout` with `next/font`, metadata, skip link, `MotionProvider`.
- [ ] Content files (`src/content/*`) from the design copy.
- [ ] Build sections in order: Header/Footer shell → Hero → Categories → Featured course → How it
      works → Testimonial/Stats → People → Contact (static) → CTA band.
- [ ] Responsive pass at 320 / 390 / 768 / 1024 / 1440 / 1920.
- **Exit criteria:** all ten sections present at every breakpoint with correct content; no console
  errors; tests for each section's rendering.

### Phase 4 — Interactions, accessibility and motion

- [ ] Mobile menu (focus trap, `Esc`, scroll lock, restore focus).
- [ ] `Reveal`, `CountUp`, hero float; verify with `prefers-reduced-motion`.
- [ ] Contact form: schema, RHF, API route, rate limit, honeypot, states, logging.
- [ ] Hover/focus states everywhere; keyboard-only walkthrough.
- [ ] Headings hierarchy (one `h1`), landmarks, `alt` text, contrast audit, `lang`, link text
      quality.
- [ ] Security headers and CSP attempt.
- **Exit criteria:** axe reports zero violations; whole page operable by keyboard; reduced-motion
  shows static content.

### Phase 5 — Pixel-perfect pass, tests and performance

- [ ] Ingest I5 hi-res frames; run `compare-design.ts` per section; fix deltas.
- [ ] Reach and hold ≥ 80 % coverage; write remaining unit/integration tests; Playwright e2e suite
      (desktop + mobile projects).
- [ ] Lighthouse CI against the production build; tune LCP image, fonts, JS size.
- [ ] Cross-check in real browsers (Chrome, Safari/WebKit via Playwright, Firefox) and on a real
      phone.
- **Exit criteria:** budgets in §1 and §11.4 met, or each miss documented.

### Phase 6 — Release, domain and submission

- [ ] Cut `release/1.0.0` → staging verified → merge to `main` → tag `v1.0.0` → production deploy.
- [ ] Domain: verify `moliveda.dev`, map `buzzvel-fe.moliveda.dev` (Cloud Run domain mapping if
      available in the chosen region, otherwise a global external HTTPS load balancer with a
      serverless NEG and managed certificate, defined in Terraform). Add the DNS records (I2).
      Confirm HTTPS.
- [ ] Final `README.md`: install/run/build, key decisions, known gaps, approximate time spent, AI
      usage, Terraform docs, asset credits, Lighthouse screenshot.
- [ ] Production build locally (`npm run build && npm start`) and on mobile and desktop one last
      time.
- [ ] Submit the public repo URL through the Buzzvel submission form **before the cutoff (I7)**.
      Target: submitted by Thu 11-19 evening; Friday is buffer only.

## Appendix A — Environment variables

| Variable                         | Used by         | Example / purpose                                                   | Secret  |
| -------------------------------- | --------------- | ------------------------------------------------------------------- | ------- |
| `APP_ENV`                        | app, CI         | `local` · `preview` · `develop` · `staging` · `production`          | No      |
| `NEXT_PUBLIC_SITE_URL`           | app (build/run) | Canonical origin, e.g. `https://buzzvel-fe.moliveda.dev`            | No      |
| `PORT`                           | app, Cloud Run  | `3000` (app), `8080` (gate)                                         | No      |
| `LOG_LEVEL`                      | app             | `info`                                                              | No      |
| `CONTACT_RATE_LIMIT_MAX`         | app             | Requests per window per IP (default 5)                              | No      |
| `CONTACT_RATE_LIMIT_WINDOW_MS`   | app             | Window length (default 600000)                                      | No      |
| `BASIC_AUTH_HTPASSWD_FILE`       | gate            | Path where the entrypoint writes the htpasswd file                  | No      |
| `BASIC_AUTH_USERNAME`            | GitHub Secrets  | Gate username, injected into NGINX per protected GitHub Environment | **Yes** |
| `BASIC_AUTH_PASSWORD`            | GitHub Secrets  | Gate password, injected into NGINX per protected GitHub Environment | **Yes** |
| `GCP_PROJECT_ID`                 | CI, Terraform   | Provided by owner (I1)                                              | No      |
| `GCP_REGION`                     | CI, Terraform   | Provided by owner (I1)                                              | No      |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | CI              | WIF provider resource name                                          | No      |
| `GCP_SERVICE_ACCOUNT`            | CI              | Deployer service account email                                      | No      |
| `ARTIFACT_REGISTRY_REPO`         | CI              | Docker repository name                                              | No      |

`.env` is git-ignored; `.env.example` lists names only.
