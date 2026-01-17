FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

# Enable Corepack for pnpm support (works for all users)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install Playwright system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    # Playwright dependencies
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
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*
