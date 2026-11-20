# syntax=docker/dockerfile:1

# Stages: base → deps → dev → builder → app, plus gate (NGINX basic-auth sidecar).
#   docker build --target app  -t buzzvel-fe-app  .
#   docker build --target gate -t buzzvel-fe-gate .

ARG NODE_IMAGE=node:26.13.1-alpine3.24
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.30.6-alpine3.24

# ──────────────────────────────────────────────
# Stage 1 — shared Node.js base
# ──────────────────────────────────────────────
FROM ${NODE_IMAGE} AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# ──────────────────────────────────────────────
# Stage 2 — install dependencies
# ──────────────────────────────────────────────
FROM base AS deps

COPY package.json package-lock.json .npmrc ./
# --ignore-scripts skips `prepare` (Husky has no .git here) and any third-party install scripts.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

# ──────────────────────────────────────────────
# Stage 3 — local development (docker compose, bind mounts, hot reload)
# ──────────────────────────────────────────────
FROM deps AS dev

ENV NODE_ENV=development

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

# ──────────────────────────────────────────────
# Stage 4 — build the application
# ──────────────────────────────────────────────
FROM base AS builder

# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
ARG APP_ENV=local
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV APP_ENV=${APP_ENV} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ──────────────────────────────────────────────
# Stage 5 — minimal production runtime
# ──────────────────────────────────────────────
FROM ${NODE_IMAGE} AS app

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Dedicated non-root user for security
RUN apk upgrade --no-cache \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

# standalone output contains a self-contained server.js with only required deps
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Used by Docker only; Cloud Run ignores HEALTHCHECK and uses its own probes.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- "http://127.0.0.1:${PORT}/health" || exit 1

CMD ["node", "server.js"]

# ──────────────────────────────────────────────
# Stage 6 — NGINX basic-auth gate (preview, develop, staging)
# ──────────────────────────────────────────────
FROM ${NGINX_IMAGE} AS gate

# The upstream defaults to the app sidecar in the same Cloud Run service. The entrypoint builds the
# htpasswd file from BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD, which are injected at run time
# (never baked into the image). NGINX_ENVSUBST_FILTER limits template substitution to the two
# variables below so NGINX runtime variables such as $host are never touched.
ENV UPSTREAM=127.0.0.1:3000 \
    BASIC_AUTH_HTPASSWD_FILE=/etc/nginx/auth/htpasswd \
    NGINX_ENVSUBST_FILTER="^(UPSTREAM|BASIC_AUTH_HTPASSWD_FILE)$"

USER root
# apache2-utils provides `htpasswd`, used by the entrypoint to bcrypt-hash the password.
RUN apk upgrade --no-cache \
    && apk add --no-cache apache2-utils \
    && mkdir -p /etc/nginx/auth \
    && chown nginx:nginx /etc/nginx/auth \
    && chmod 0700 /etc/nginx/auth
USER nginx

# The official entrypoint runs /docker-entrypoint.d/* in order, then renders /etc/nginx/templates/*.template.
COPY --chown=nginx:nginx --chmod=0555 docker/nginx/entrypoint.sh /docker-entrypoint.d/10-write-htpasswd.sh
COPY --chown=nginx:nginx docker/nginx/nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/health || exit 1
