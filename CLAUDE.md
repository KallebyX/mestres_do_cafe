# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment Architecture

This project is configured for **Vercel Serverless** deployment with:
- **Frontend**: React + Vite (static build)
- **Backend**: Flask as Vercel Serverless Functions
- **Database**: Neon PostgreSQL (serverless)
- **Storage**: AWS S3 (images)
- **Payments**: Mercado Pago
- **Shipping**: Melhor Envio

## Common Development Commands

### Backend API (Flask)
```bash
cd apps/api
pip install -r requirements.txt     # Install dependencies
python src/app.py                   # Start development server (port 5001)
pytest                              # Run tests
pytest -v                           # Verbose test output
```

### Frontend Web (React + Vite)
```bash
cd apps/web
npm install                         # Install dependencies
npm run dev                         # Start development server (port 3000)
npm run build:production            # Production build
npm run lint                        # ESLint check
npm run test                        # Run Vitest tests
```

### Vercel Deployment
```bash
vercel                              # Deploy to Vercel
vercel --prod                       # Deploy to production
```

## Architecture Overview

### Project Structure
```
mestres_do_cafe/
├── api/                    # Vercel Serverless entry point
│   └── index.py           # Flask app wrapper for Vercel
├── apps/
│   ├── api/               # Flask Backend
│   │   └── src/
│   │       ├── app.py
│   │       ├── config.py
│   │       ├── database.py
│   │       ├── controllers/routes/
│   │       ├── models/
│   │       └── services/
│   └── web/               # React Frontend
│       └── src/
├── vercel.json            # Vercel configuration
├── requirements.txt       # Python dependencies for Vercel
└── .env.example          # Environment variables template
```

### Backend (Flask API)
- **Entry Point**: `api/index.py` (Vercel) / `apps/api/src/app.py` (local)
- **Database**: Neon PostgreSQL (serverless) / SQLite (development)
- **Routes** in `src/controllers/routes/`:
  - `auth.py` - JWT authentication
  - `products.py` - Product catalog
  - `orders.py` - Order management
  - `payments.py` - Payment processing
  - `cart.py` - Shopping cart
  - `checkout.py` - Checkout process
  - `mercado_pago.py` - MercadoPago integration
  - `melhor_envio.py` - Shipping integration
  - `media.py` - S3 image uploads
  - `admin.py` - Admin dashboard
- **Services** in `src/services/`:
  - `mercado_pago_service.py` - Payment processing
  - `melhor_envio_service.py` - Shipping calculations
  - `s3_service.py` - Image storage (AWS S3)

### Frontend (React)
- **Entry Point**: `apps/web/src/main.jsx`
- **Components**: Feature-based in `src/components/`
- **Pages**: Route components in `src/pages/`
- **Services**: API clients in `src/services/api.js`
- **Contexts**: Auth, Cart, Theme state management

### Key Integrations
- **Mercado Pago**: Brazilian payments (PIX, card, boleto)
- **Melhor Envio**: Multi-carrier shipping
- **AWS S3**: Image storage with presigned URLs
- **Neon**: Serverless PostgreSQL

## Environment Variables

Required for production (set in Vercel dashboard):
```env
SECRET_KEY=...
JWT_SECRET_KEY=...
DATABASE_URL=postgresql://...@neon.tech/...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
MERCADO_PAGO_ACCESS_TOKEN=...
MELHOR_ENVIO_API_KEY=...
```

## Development Notes

- **Ports**: API (5001), Frontend (3000)
- **Default test user**: `teste@pato.com` / `123456`
- **JWT tokens expire in 1 hour**
- **Path aliases**: Use `@/` imports in frontend

## Code Conventions

- **Backend**: Python PEP 8, SQLAlchemy models
- **Frontend**: Functional components, Tailwind CSS
- **API Design**: RESTful with consistent JSON responses
- **State Management**: React Context + TanStack Query
- **Security**: Environment variables, input validation

## Important Guidelines

- Always prefer editing existing files over creating new ones
- Never create documentation files unless explicitly requested
- Follow existing code patterns and conventions
- Use established testing patterns with pytest (backend) and Vitest (frontend)
