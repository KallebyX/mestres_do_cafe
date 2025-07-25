# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Backend API (Flask)
```bash
cd apps/api
python src/app.py                    # Start development server (port 5001)
pip install -r requirements.txt     # Install dependencies
pytest                               # Run tests (uses conftest.py fixtures)
pytest tests/test_specific.py       # Run specific test file
pytest -v                           # Verbose test output
```

### Frontend Web (React + Vite)
```bash
cd apps/web
npm run dev                          # Start development server (port 3000)
npm install                          # Install dependencies
npm run build:production             # Production build (optimized)
npm run build:staging                # Staging build
npm run lint                         # ESLint check (max 50 warnings allowed)
npm run lint:fix                     # Auto-fix ESLint issues
npm run type-check                   # TypeScript check
npm run test                         # Run Vitest tests
npm run test:coverage                # Run tests with coverage
npm run test:components              # Run component-specific tests
npm run check                        # Run all checks (lint + type-check + test)
npm run serve:production             # Serve production build locally
npm run clean                        # Clean dist directory
npm run build:analyze                # Analyze bundle size
```

### Docker Development
```bash
docker-compose up -d                 # Start all services (PostgreSQL, Redis, API, Web)
docker-compose up db redis           # Start only database services
docker-compose logs -f api           # View API logs
docker-compose exec api python src/app.py # Run commands in API container
docker-compose down                  # Stop all services
docker-compose build --no-cache      # Rebuild containers
```

## Architecture Overview

### Monorepo Structure
- **apps/api/**: Flask backend with PostgreSQL database
- **apps/web/**: React frontend with Vite build system

### Backend (Flask API)
- **Entry Point**: `apps/api/src/app.py` - Main Flask application with modular blueprint registration
- **Database**: PostgreSQL production (Docker), SQLite development/testing with auto-initialization
- **Routes**: Organized in `src/controllers/routes/` by feature:
  - `auth.py` - JWT authentication, login/logout, registration
  - `products.py` - Product catalog, search, filtering
  - `orders.py` - Order management, status tracking
  - `payments.py` - Payment processing integration
  - `admin.py` - Admin dashboard and management
  - `cart.py` - Shopping cart operations
  - `checkout.py` - Checkout process
  - `mercado_pago.py` - MercadoPago payment integration
  - `melhor_envio.py` - Shipping integration service
  - `notifications.py` - Notification management system
  - `health.py` - Health check endpoints
- **Models**: SQLAlchemy models in `src/models/` with comprehensive relationships and UUID support
- **Services**: Business logic in `src/services/` (MercadoPago, Melhor Envio, event system, webhooks, notifications)
- **Middleware**: Security headers, error handling, MercadoPago validation
- **Configuration**: Multi-environment config in `src/config.py` with JWT and database settings
- **Testing**: pytest with test fixtures in `conftest.py` creating isolated test database

### Frontend (React)
- **Entry Point**: `apps/web/src/main.jsx` - React 18 app with router setup
- **Components**: Feature-based organization:
  - `src/components/ui/` - Radix UI components (Button, Dialog, Form, etc.)
  - `src/components/admin/` - Admin dashboard components
  - `src/components/checkout/` - Multi-step checkout process
  - `src/components/reviews/` - Product review system
  - `src/components/analytics/` - Dashboard analytics
- **Pages**: Route components in `src/pages/` with lazy loading
- **Services**: API clients in `src/services/` with axios and error handling
- **Contexts**: React contexts for auth, cart, theme, notifications state management
- **Hooks**: Custom hooks in `src/hooks/` for data fetching and business logic
- **Utilities**: Helper functions in `src/utils/` for formatting, validation, constants
- **Build System**: Vite with optimized production builds, code splitting, and asset optimization

### Key Integrations
- **Payment Processing**: MercadoPago integration for Brazilian market with webhook support
- **Shipping**: Melhor Envio integration for shipping calculations and tracking
- **Authentication**: JWT-based auth with refresh tokens and secure session management
- **Database**: PostgreSQL production, SQLite development, with SQLAlchemy ORM and native UUIDs
- **Caching**: Redis for sessions and caching (production)
- **Styling**: Tailwind CSS with custom theme and Radix UI components
- **State Management**: React Context + TanStack Query for server state
- **Build System**: Vite with advanced optimization, code splitting, and tree shaking

### Testing Strategy
- **Backend**: pytest with fixtures in `conftest.py`, creates test Flask app with isolated SQLite test database
- **Frontend**: Vitest for unit/integration tests with React Testing Library integration
- **Test Data**: Automated test user creation and database seeding with UUIDs
- **Test Environment**: Isolated test database per test session with clean state

### Build & Deployment
- **Frontend**: Vite bundler with advanced optimization, manual chunk splitting, tree shaking
- **Docker**: Full Docker Compose setup with PostgreSQL, Redis, API, and Web services
- **Environment**: Multi-environment configuration with `.env` files and Docker environment variables
- **Linting**: ESLint for frontend (max 50 warnings), Python PEP 8 standards for backend
- **Production**: Optimized builds with Terser minification, asset compression, and CDN-ready structure

### Development Notes
- **Default test user**: `teste@pato.com` / `123456`
- **Ports**: API (5001), Frontend (3000), PostgreSQL (5432), Redis (6379)
- **Database**: Auto-initializes with sample products and test users (SQLite dev, PostgreSQL prod)
- **CORS configured** for cross-origin development with multiple allowed origins
- **JWT tokens expire in 1 hour** (configurable in `src/config.py`)
- **Proxy configuration**: Frontend proxies `/api` requests to backend automatically
- **Path aliases**: Use `@/` imports for cleaner imports in frontend code (`@/components`, `@/services`, etc.)
- **Environment files**: Copy `.env.example` to `.env` for local configuration
- **UUIDs**: Native database UUIDs for all primary keys for enhanced security
- **Hot reload**: Both frontend (Vite HMR) and backend (Flask debug mode) support hot reloading

### Code Conventions
- **Backend**: Follow Python PEP 8 standards, use SQLAlchemy models with database operations
- **Frontend**: Use functional components with hooks, Tailwind CSS for styling, TypeScript for type safety
- **API Design**: RESTful endpoints with consistent JSON responses and comprehensive error handling
- **State Management**: Use React Context for global state, TanStack Query for server state caching
- **Component Structure**: Feature-based organization, reusable UI components in `components/ui/` using Radix UI
- **Form Handling**: React Hook Form with Zod validation for runtime type safety and validation
- **Database**: Native UUIDs for primary keys, optimized indexes, and proper foreign key constraints
- **Import Organization**: Use path aliases (`@/`) and group imports by type (external, internal, relative)
- **Error Handling**: Comprehensive error boundaries in React and structured error responses from Flask
- **Security**: Never expose sensitive data, use environment variables, validate all inputs