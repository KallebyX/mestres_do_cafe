# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Backend API (Flask)
```bash
cd apps/api
python src/app.py                    # Start development server (port 5001)
pip install -r requirements.txt     # Install dependencies
pytest                               # Run tests (uses conftest.py fixtures)
```

### Frontend Web (React + Vite)
```bash
cd apps/web
npm run dev                          # Start development server (port 3000)
npm install                          # Install dependencies
npm run build:production             # Production build
npm run lint                         # ESLint check
npm run type-check                   # TypeScript check
npm run test                         # Run Vitest tests
npm run check                        # Run all checks (lint + type-check + test)
npm run serve:production             # Serve production build locally
```

## Architecture Overview

### Monorepo Structure
- **apps/api/**: Flask backend with SQLite database
- **apps/web/**: React frontend with Vite build system

### Backend (Flask API)
- **Entry Point**: `apps/api/src/app.py` - Main Flask application
- **Database**: Single SQLite file at `apps/api/mestres_cafe.db`
- **Routes**: Organized in `src/controllers/routes/` by feature (auth, products, orders, payments, etc.)
- **Models**: SQLAlchemy models in `src/models/` 
- **Services**: Business logic in `src/services/` (MercadoPago, notifications, webhooks)
- **Middleware**: Security, error handling, validation in `src/middleware/`
- **Configuration**: Environment-based config in `src/config.py`

### Frontend (React)
- **Entry Point**: `apps/web/src/main.jsx`
- **Components**: Feature-based organization in `src/components/`
- **Pages**: Route components in `src/pages/`  
- **Services**: API clients in `src/services/`
- **Contexts**: React contexts for auth, cart, theme, notifications
- **UI Library**: Radix UI components in `src/components/ui/`

### Key Integrations
- **Payment Processing**: MercadoPago integration for Brazilian market
- **Authentication**: JWT-based auth with refresh tokens
- **Database**: SQLite with SQLAlchemy ORM
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Context + TanStack Query

### Testing Strategy
- **Backend**: pytest with fixtures in `conftest.py`
- **Frontend**: Vitest for unit/integration tests
- **Test Data**: Automated test user creation (admin@test.com, user@test.com)

### Build & Deployment
- **Frontend**: Vite bundler with code splitting and optimization
- **Docker**: Dockerfiles available for both apps
- **Environment**: Uses `.env` files for configuration
- **Linting**: ESLint for frontend, Python standards for backend

### Development Notes
- Default test user: `teste@pato.com` / `123456`
- API runs on port 5001, frontend on port 3000
- Database auto-initializes with sample products
- CORS configured for cross-origin development
- JWT tokens expire in 1 hour (configurable)