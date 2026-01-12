![CI Pipeline](https://github.com/Ozymandros/erp-frontend-vite/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/Ozymandros/erp-frontend-vite/branch/main/graph/badge.svg)](https://codecov.io/gh/Ozymandros/erp-frontend-vite)

# ERP Frontend Application

A modern ERP admin portal built with React, TypeScript, Vite, and TailwindCSS.

## Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens and permission-based routing
- **User Management**: Full CRUD operations for users with role assignment
- **Role Management**: Create and manage roles with permission assignment
- **Permission Management**: Define and manage granular permissions
- **API Client Abstraction**: Switchable between Axios and Dapr HTTP proxy
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Type Safety**: Full TypeScript coverage
- **Testing**: Comprehensive test suite with Vitest

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS v4
- **Routing**: React Router v6
- **HTTP Client**: Axios / Dapr HTTP Proxy
- **State Management**: React Context
- **Testing**: Vitest, Testing Library, Testcontainers
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

\`\`\`bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
\`\`\`

### Environment Variables

\`\`\`env
# API Configuration
# ⚠️ IMPORTANT: Do NOT include /api suffix in base URL!
# All endpoints in src/api/constants/endpoints.ts already include full gateway paths
# The API client will automatically remove /api if accidentally included
VITE_API_BASE_URL=http://localhost:5000

# API Client Selection (true = Dapr, false = Axios)
VITE_USE_DAPR=false

# Dapr Configuration (only used if VITE_USE_DAPR=true)
VITE_DAPR_APP_ID=auth-service
VITE_DAPR_PORT=3500
\`\`\`

**Common Mistake:** If you see URLs like `http://localhost:5000/api/auth/api/auth/login` (double `/api`), 
your `VITE_API_BASE_URL` likely includes `/api`. Remove it!

## Project Structure

\`\`\`
src/
├── api/
│   ├── clients/          # API client implementations
│   └── services/         # API service layers
├── components/
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   ├── ui/              # Reusable UI components
│   ├── users/           # User management components
│   ├── roles/           # Role management components
│   └── permissions/     # Permission management components
├── contexts/            # React contexts
├── pages/               # Page components
├── types/               # TypeScript types
├── lib/                 # Utility functions
└── test/                # Test utilities and setup
\`\`\`

## Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
\`\`\`

## Building for Production

\`\`\`bash
# Build the application
npm run build

# Preview production build
npm run preview
\`\`\`

## API Client Architecture

The application supports two interchangeable HTTP client implementations:

### Axios Client
Standard HTTP client using Axios library.

### Dapr HTTP Proxy Client
Uses Dapr's service invocation for microservices architecture.

Switch between clients using the `VITE_USE_DAPR` environment variable.

## Authentication Flow

1. User logs in with username/password
2. Backend returns access token and refresh token
3. Access token stored in sessionStorage
4. Refresh token used to obtain new access tokens
5. Protected routes check permissions via `/permissions/check` endpoint
6. Automatic token refresh before expiry

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

MIT
