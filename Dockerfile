# syntax=docker/dockerfile:1

# =============================================================================
# ERP Admin Portal — production image (Vite SPA + nginx)
#
# Build:
#   docker build -t erp-frontend-vite \
#     --build-arg VITE_API_BASE_URL=https://api.example.com \
#     .
#
# Run:
#   docker run --rm -p 8080:8080 erp-frontend-vite
# =============================================================================

ARG NODE_VERSION=20

# -----------------------------------------------------------------------------
# Stage 1: Build static assets
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS build

ARG PNPM_VERSION=10.28.2

# Vite embeds VITE_* at build time (browser-visible; never put secrets here).
ARG VITE_API_BASE_URL=http://localhost:5000
ARG VITE_USE_DAPR=false
ARG VITE_DAPR_APP_ID=auth-service
ARG VITE_DAPR_PORT=3500

ENV NODE_ENV=production \
    CI=true \
    VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_USE_DAPR=${VITE_USE_DAPR} \
    VITE_DAPR_APP_ID=${VITE_DAPR_APP_ID} \
    VITE_DAPR_PORT=${VITE_DAPR_PORT}

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# Install dependencies (layer cache)
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm ci

# Application source (.dockerignore trims dev-only files from context)
COPY . .

RUN pnpm run build

# -----------------------------------------------------------------------------
# Stage 2: Serve with nginx (non-root, port 8080)
# -----------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:stable-alpine AS production

LABEL org.opencontainers.image.title="ERP Admin Portal" \
      org.opencontainers.image.description="Vite + React ERP frontend (static SPA)"

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/health || exit 1
