# Dev Container Setup

This directory contains the configuration for VS Code Dev Containers and GitHub Codespaces.

## What's Included

- **Dockerfile**: Node 20 with pnpm and Playwright dependencies
- **devcontainer.json**: VS Code/Codespaces configuration

## Quick Start

### VS Code (Local)

1. Open the project in VS Code
2. Press `F1` → "Dev Containers: Reopen in Container"
3. Wait for the container to build (first time takes a few minutes)
4. Run `pnpm dev` to start the development server

### GitHub Codespaces

1. Push this repository to GitHub
2. Go to your repository
3. Click **Code** → **Codespaces** → **Create codespace on main**
4. GitHub will automatically detect `.devcontainer` and build it
5. Run `pnpm dev` to start the development server

## What Gets Installed

- **Node.js 20** (LTS)
- **pnpm 9.x** (via Corepack)
- **Playwright** with all browser dependencies
- **Git** and **GitHub CLI**

## VS Code Extensions (Auto-installed)

- Prettier (code formatting)
- ESLint (linting)
- Tailwind CSS IntelliSense
- Playwright Test for VS Code
- Vitest Explorer
- Error Lens

## Port Forwarding

Port `3000` is automatically forwarded for the Vite dev server.

## Troubleshooting

### Container won't build
- Ensure Docker is running (for local VS Code)
- Check that you have sufficient disk space
- Try rebuilding: `F1` → "Dev Containers: Rebuild Container"

### Playwright browsers not installed
- Run: `pnpm exec playwright install --with-deps`

### pnpm not found
- The container should have pnpm enabled via Corepack
- If issues persist, run: `corepack enable && corepack prepare pnpm@latest --activate`
