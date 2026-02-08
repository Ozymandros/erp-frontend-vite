# Dev Container Setup

Configuration for VS Code Dev Containers and GitHub Codespaces.

## Contents

- **Dockerfile** – Node 20 with pnpm 9 and Playwright browser dependencies
- **devcontainer.json** – VS Code/Codespaces settings and lifecycle hooks

## Quick Start

### VS Code (local)

1. Open the project in VS Code
2. `F1` → **Dev Containers: Reopen in Container**
3. Wait for the container to build (first time: a few minutes)
4. Run `pnpm dev` to start the development server

### GitHub Codespaces

1. Push the repository to GitHub
2. **Code** → **Codespaces** → **Create codespace on main**
3. Codespaces will detect `.devcontainer` and build it
4. Run `pnpm dev` to start the development server

## Included

| Component     | Version |
|--------------|---------|
| Node.js      | 20 LTS  |
| pnpm         | 9       |
| Playwright   | Browsers and system deps |
| Git          | ✓       |
| GitHub CLI   | ✓       |

## VS Code extensions (auto-installed)

- Prettier
- ESLint
- Tailwind CSS IntelliSense
- Playwright Test for VS Code
- Vitest Explorer
- Error Lens

## Port forwarding

| Port | Purpose           |
|------|-------------------|
| 3000 | Vite dev server   |
| 4173 | Vite preview      |

## Troubleshooting

### Container won't build

- Ensure Docker is running
- Check disk space
- Rebuild: `F1` → **Dev Containers: Rebuild Container**

### Playwright browsers missing

```bash
pnpm exec playwright install
```

### pnpm not found

```bash
corepack enable && corepack prepare pnpm@9 --activate
```
