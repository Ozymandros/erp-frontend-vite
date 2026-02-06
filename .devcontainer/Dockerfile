# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

# Pin pnpm version to match CI and lockfile (pnpm 10.28.1)
ARG PNPM_VERSION=10.28.1
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Install Playwright system dependencies (for E2E tests)
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    xvfb \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

USER node
