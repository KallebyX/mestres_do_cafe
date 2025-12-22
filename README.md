# Mestres do Cafe - Sistema E-commerce & ERP

Sistema completo de e-commerce e ERP para torrefacao artesanal de cafe, com integracao de pagamentos (Mercado Pago), frete (Melhor Envio) e armazenamento de imagens (AWS S3).

## Stack Tecnologica

### Frontend
- React 18 + Vite 5
- Tailwind CSS + Radix UI
- React Router DOM 6
- TanStack Query
- Axios

### Backend
- Python 3.9+ / Flask 2.3
- SQLAlchemy + PostgreSQL (Neon)
- JWT Extended
- Mercado Pago SDK
- Boto3 (AWS S3)

### Infraestrutura
- **Deploy**: Vercel (Serverless)
- **Database**: Neon PostgreSQL (Serverless)
- **Storage**: AWS S3 (Imagens)
- **Pagamentos**: Mercado Pago
- **Frete**: Melhor Envio

## Deploy no Vercel

### 1. Preparacao

```bash
# Clone o repositorio
git clone https://github.com/KallebyX/mestres_do_cafe.git
cd mestres_do_cafe

# Copie o arquivo de ambiente
cp .env.example .env
```

### 2. Configure o Neon Database

1. Acesse [Neon Console](https://console.neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Adicione ao Vercel como `DATABASE_URL`

### 3. Configure o AWS S3

1. Crie um bucket no [AWS S3](https://console.aws.amazon.com/s3)
2. Configure CORS no bucket:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```
3. Crie credenciais IAM com permissoes S3
4. Adicione as variaveis ao Vercel

### 4. Deploy no Vercel

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure variaveis de ambiente no dashboard
```

Ou conecte o repositorio diretamente no [Vercel Dashboard](https://vercel.com/new).

### Variaveis de Ambiente (Vercel)

```env
# Obrigatorias
SECRET_KEY=your-secret-key-min-32-chars
JWT_SECRET_KEY=your-jwt-secret-key-min-32-chars
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=mestres-do-cafe-images
AWS_REGION=sa-east-1

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=your-token
MERCADO_PAGO_PUBLIC_KEY=your-public-key

# Melhor Envio
MELHOR_ENVIO_API_KEY=your-api-key
```

## Desenvolvimento Local

### Backend

```bash
cd apps/api
pip install -r requirements.txt
python src/app.py
```

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

### URLs Locais
- Frontend: http://localhost:3000
- API: http://localhost:5001/api/health

## Estrutura do Projeto

```
mestres_do_cafe/
├── api/                    # Vercel Serverless entry point
│   └── index.py
├── apps/
│   ├── api/                # Backend Flask
│   │   └── src/
│   │       ├── app.py
│   │       ├── config.py
│   │       ├── database.py
│   │       ├── controllers/
│   │       ├── models/
│   │       └── services/
│   └── web/                # Frontend React
│       └── src/
│           ├── components/
│           ├── pages/
│           └── services/
├── vercel.json
├── requirements.txt
└── .env.example
```

## APIs Integradas

### Mercado Pago
- PIX, Cartao de Credito, Boleto
- Webhooks para atualizacao de status
- Checkout Pro integrado

### Melhor Envio
- Calculo de frete multi-transportadoras
- Geracao de etiquetas
- Rastreamento de envios

### AWS S3
- Upload de imagens de produtos
- Armazenamento seguro
- CDN integrado

## Endpoints Principais

```
GET    /api/health          # Health check
GET    /api/products        # Lista produtos
POST   /api/auth/login      # Login
POST   /api/cart/add        # Adicionar ao carrinho
POST   /api/checkout        # Finalizar compra
POST   /api/media/upload    # Upload de imagem (S3)
```

## Testes

```bash
# Backend
cd apps/api && pytest

# Frontend
cd apps/web && npm test
```

## Licenca

MIT License

---

Desenvolvido para Mestres do Cafe
