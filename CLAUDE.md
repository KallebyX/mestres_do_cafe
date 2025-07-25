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

## Architecture Overview

### Monorepo Structure
- **apps/api/**: Flask backend with PostgreSQL database
- **apps/web/**: React frontend with Vite build system

### Backend (Flask API)
- **Entry Point**: `apps/api/src/app.py` - Main Flask application with modular blueprint registration
- **Database**: PostgreSQL database with native UUID support and auto-initialization
- **Routes**: Organized in `src/controllers/routes/` by feature:
  - `auth.py` - JWT authentication, login/logout, registration
  - `products.py` - Product catalog, search, filtering
  - `orders.py` - Order management, status tracking
  - `payments.py` - Payment processing integration
  - `admin.py` - Admin dashboard and management
  - `cart.py` - Shopping cart operations
  - `checkout.py` - Checkout process
  - `mercado_pago.py` - MercadoPago payment integration
- **Models**: SQLAlchemy models in `src/models/` with comprehensive relationships
- **Services**: Business logic in `src/services/` (MercadoPago, event system, webhooks, notifications)
- **Middleware**: Security headers, error handling, MercadoPago validation
- **Configuration**: Multi-environment config in `src/config.py` with JWT settings

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
- **Payment Processing**: MercadoPago integration for Brazilian market
- **Authentication**: JWT-based auth with refresh tokens
- **Database**: PostgreSQL with SQLAlchemy ORM and native UUIDs
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Context + TanStack Query

### Testing Strategy
- **Backend**: pytest with fixtures in `conftest.py`, creates test Flask app with PostgreSQL test database
- **Frontend**: Vitest for unit/integration tests with React Testing Library integration
- **Test Data**: Automated test user creation and database seeding with UUIDs
- **Test Environment**: Isolated PostgreSQL test database per test session

### Build & Deployment
- **Frontend**: Vite bundler with code splitting and optimization
- **Docker**: Dockerfiles available for both apps
- **Environment**: Uses `.env` files for configuration
- **Linting**: ESLint for frontend, Python standards for backend

### Development Notes
- **Default test user**: `teste@pato.com` / `123456`
- **API runs on port 5001**, frontend on port 3000
- **PostgreSQL database** auto-initializes with sample products and test users
- **CORS configured** for cross-origin development
- **JWT tokens expire in 1 hour** (configurable in `src/config.py`)
- **Proxy configuration**: Frontend proxies `/api` requests to backend
- **ESLint configured** with React hooks and best practices (max 50 warnings allowed)
- **Path aliases**: Use `@/` imports for cleaner imports in frontend code
- **Environment files**: Use `.env` files for local configuration
- **UUIDs**: Native PostgreSQL UUIDs for all primary keys for security

### Code Conventions
- **Backend**: Follow Python PEP 8 standards, use SQLAlchemy models with PostgreSQL for database operations
- **Frontend**: Use functional components with hooks, Tailwind CSS for styling
- **API Design**: RESTful endpoints with consistent JSON responses and error handling
- **State Management**: Use React Context for global state, TanStack Query for server state
- **Component Structure**: Feature-based organization, reusable UI components in `components/ui/`
- **Form Handling**: React Hook Form with Zod validation for type safety
- **Database**: PostgreSQL with native UUIDs, optimized indexes, and proper constraints