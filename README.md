# ERP Frontend Application

## 🔍 Project Quality Status

### 🧪 Tests & CI/CD

![CI Pipeline](https://github.com/Ozymandros/erp-frontend-vite/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/Ozymandros/erp-frontend-vite/branch/main/graph/badge.svg)](https://codecov.io/gh/Ozymandros/erp-frontend-vite)

> **Note:** The CI badge includes unit tests (Vitest), E2E tests (Playwright), CodeQL security analysis, linting, and build verification.

### 🔐 Security

![CodeQL](https://github.com/Ozymandros/erp-frontend-vite/actions/workflows/ci.yml/badge.svg?event=push&label=CodeQL)

### 📊 Code Quality (SonarCloud)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Ozymandros_erp-frontend-vite&metric=alert_status)](...)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Ozymandros_erp-frontend-vite&metric=coverage)](https://sonarcloud.io/summary/overall?id=Ozymandros_erp-frontend-vite)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Ozymandros_erp-frontend-vite&metric=bugs)](https://sonarcloud.io/summary/overall?id=Ozymandros_erp-frontend-vite)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Ozymandros_erp-frontend-vite&metric=code_smells)](https://sonarcloud.io/summary/overall?id=Ozymandros_erp-frontend-vite)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Ozymandros_erp-frontend-vite&metric=security_rating)](https://sonarcloud.io/summary/overall?id=Ozymandros_erp-frontend-vite)

### 🔄 Dependencies

![Dependabot](https://img.shields.io/badge/Dependabot-enabled-brightgreen?logo=dependabot)

### 🛠️ Tech Stack

![Node](https://img.shields.io/badge/node-20.x-green)
![pnpm](https://img.shields.io/badge/pnpm-9.x-blue)

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.3-blue?logo=vite)

![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue?logo=tailwindcss)
![Radix UI](https://img.shields.io/badge/Radix%20UI-1.1-blue?logo=radix-ui)

![Vitest](https://img.shields.io/badge/Vitest-4.0-blue?logo=vitest)
![Playwright](https://img.shields.io/badge/Playwright-1.57-blue?logo=playwright)

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

A modern, type-safe ERP admin portal built with React, TypeScript, and Vite. Features comprehensive authentication, user management, inventory tracking, sales, and purchasing modules.

## ✨ Features

- **🔐 Authentication & Authorization**: JWT-based auth with refresh tokens and granular permission-based routing
- **👥 User Management**: Complete CRUD operations with role assignment and permission management
- **📦 Inventory Management**: Products, warehouses, stock operations, and transaction tracking
- **💰 Sales & Purchasing**: Order management, customer and supplier management
- **🎨 Modern UI**: Responsive design with TailwindCSS and Radix UI components
- **🔒 Type Safety**: Full TypeScript coverage with strict mode
- **🧪 Testing**: Comprehensive test suite with Vitest (unit) and Playwright (E2E)
- **🚀 CI/CD**: Automated testing, code quality checks, and dependency updates

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript 5.9, Vite 7
- **Styling**: TailwindCSS 3.4
- **Routing**: React Router 6
- **HTTP Client**: Axios / Dapr HTTP Proxy (switchable)
- **State Management**: React Context API
- **Validation**: Zod schemas
- **UI Components**: Radix UI primitives
- **Testing**: Vitest, Testing Library, Playwright
- **Package Manager**: pnpm

## 📋 Prerequisites

- **Node.js**: 20.x or higher
- **pnpm**: 9.x or higher ([Install pnpm](https://pnpm.io/installation))

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Ozymandros/erp-frontend-vite.git
cd erp-frontend-vite

# Install dependencies
pnpm install

# Copy environment variables template
cp .env.example .env

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
# ⚠️ IMPORTANT: Do NOT include /api suffix in base URL!
# All endpoints already include full gateway paths (e.g., /auth/api/auth/login)
VITE_API_BASE_URL=http://localhost:5000

# API Client Selection (true = Dapr, false = Axios)
VITE_USE_DAPR=false

# Dapr Configuration (only used if VITE_USE_DAPR=true)
VITE_DAPR_APP_ID=auth-service
VITE_DAPR_PORT=3500
```

**Common Mistake:** If you see URLs like `http://localhost:5000/api/auth/api/auth/login` (double `/api`), your `VITE_API_BASE_URL` likely includes `/api`. Remove it!

## 📜 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm start        # Alias for dev

# Building
pnpm build        # Build for production (includes type checking)
pnpm preview      # Preview production build locally

# Code Quality
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking

# Testing
pnpm test         # Run unit tests (Vitest)
pnpm test:ui      # Run tests with UI
pnpm test:e2e     # Run E2E tests (Playwright)
```

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Run in watch mode
pnpm test --watch

# Run with UI
pnpm test:ui

# Generate coverage report
pnpm vitest run --coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm exec playwright test --ui
```

**Note**: E2E tests use mocked API endpoints and don't require a running backend. See [E2E Testing docs](docs/E2E_TESTING.md) for details.

## 🏗️ Project Structure

```
src/
├── api/
│   ├── clients/          # HTTP client implementations (Axios, Dapr)
│   ├── constants/        # API endpoints and constants
│   └── services/         # API service layers (auth, users, inventory, etc.)
├── components/
│   ├── auth/            # Authentication components
│   ├── inventory/       # Inventory management components
│   ├── layout/          # Layout components (header, sidebar)
│   ├── sales/           # Sales components
│   ├── ui/              # Reusable UI components (Radix UI based)
│   └── users/           # User management components
├── contexts/            # React contexts (auth, toast)
├── lib/
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   └── validation/      # Zod validation schemas
├── pages/               # Page components (routes)
├── test/                # Test utilities, mocks, and E2E tests
└── types/               # TypeScript type definitions
```

## 🔌 API Client Architecture

The application supports two interchangeable HTTP client implementations:

- **Axios Client**: Standard HTTP client using Axios (default)
- **Dapr HTTP Proxy**: Uses Dapr's service invocation for microservices architecture

Switch between clients using the `VITE_USE_DAPR` environment variable. Both clients share the same interface and handle authentication, error handling, and request/response transformation consistently.

## 🔄 CI/CD Pipeline

The project includes automated CI/CD with GitHub Actions:

- **Linting & Type Checking**: ESLint and TypeScript validation
- **Build Verification**: Production build checks
- **Security Audit**: Dependency vulnerability scanning
- **CodeQL Analysis**: Security code analysis
- **SonarQube**: Code quality and coverage analysis
- **Unit Tests**: Vitest with coverage reporting
- **E2E Tests**: Playwright browser testing
- **Dependabot**: Automated dependency updates

See [CI workflow](.github/workflows/ci.yml) for details.

## 📚 Documentation

- [API Endpoints Refactoring](docs/API_ENDPOINTS_REFACTORING.md)
- [API Gateway Routing](docs/API_GATEWAY_ROUTING.md)
- [E2E Testing Guide](docs/E2E_TESTING.md)
- [Test Coverage](docs/TEST_COVERAGE.md)
- [SonarQube Setup](docs/SONARQUBE_SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Ensure all tests pass (`pnpm test` and `pnpm test:e2e`)
6. Run linting (`pnpm lint`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Code Quality Standards

- All code must pass TypeScript strict mode
- ESLint must pass with zero warnings
- New features require unit tests
- Complex user flows require E2E tests
- Follow existing code style and patterns

## 📝 License

MIT
