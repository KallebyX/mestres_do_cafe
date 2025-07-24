# 🚀 Mestres do Café Enterprise - Technical Documentation

## 📋 Resumo Executivo
Sistema e-commerce B2B/B2C especializado em cafés especiais, com gestão completa de torrefação, vendas e relacionamento. Arquitetura monolítica otimizada com Flask + SQLAlchemy + PostgreSQL.

## 🏗️ Arquitetura do Sistema
```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Next.js   │────▶│  Flask API  │────▶│  PostgreSQL  │
│   (React)   │     │  Port 5001  │     │   Database   │
└─────────────┘     └─────────────┘     └──────────────┘
```

## 💻 Stack Tecnológica
- **Backend**: Flask 3.0.3 + SQLAlchemy + Flask-JWT-Extended
- **Frontend**: Next.js 14 + React 18 + TailwindCSS
- **Database**: PostgreSQL (UUID primary keys)
- **Payments**: Mercado Pago API
- **Auth**: JWT com refresh tokens

## 🔄 Fluxo de Dados Crítico
1. **Autenticação**: `/api/auth/login` → JWT token → Authorization header
2. **Carrinho**: Session-based → `/api/cart/*` → Persiste em `cart_items`
3. **Checkout**: Cart → Order → Payment → Stock update → Notification
4. **Admin**: Role-based access → Dashboard analytics → Real-time metrics

## ⚙️ Configuração de Ambiente
```bash
# apps/api/.env
DATABASE_URL=postgresql://user:pass@localhost/mestres_cafe
JWT_SECRET_KEY=your-secret-key
MERCADO_PAGO_ACCESS_TOKEN=TEST-token
FLASK_ENV=development
```

## 🔌 APIs Principais
- `POST /api/auth/register` - Cadastro de usuários
- `POST /api/auth/login` - Login com JWT
- `GET /api/products` - Listagem de produtos
- `POST /api/cart/add` - Adicionar ao carrinho
- `POST /api/checkout/process` - Processar pedido
- `GET /api/admin/dashboard` - Métricas do admin

## 📊 Modelos de Dados Essenciais
```python
User(id: UUID, email, password_hash, is_admin)
Product(id: UUID, name, price, stock_quantity)
Order(id: UUID, user_id, status, total_amount)
Payment(id: UUID, order_id, gateway, status)
```

## 🔐 Segurança e Autenticação
- **JWT**: Access token (15min) + Refresh token (30d)
- **CORS**: Configurado para frontend local
- **Bcrypt**: Hash de senhas com salt
- **Rate Limiting**: 100 req/min por IP
- **SQL Injection**: Queries parametrizadas

## 🌐 Integrações Externas
- **Mercado Pago**: Checkout transparente + Webhooks
- **Melhor Envio**: Cálculo de frete (desabilitado temporariamente)
- **Email**: SMTP para notificações (em implementação)

## 📈 Monitoramento e Logs
```python
# Logs estruturados em api/src/utils/logger.py
logger.info("✅ Pedido processado", extra={"order_id": order.id})
logger.error("❌ Pagamento falhou", extra={"error": str(e)})
```

## 🔧 Troubleshooting Comum

### Flask travando no startup
```bash
# Verificar webhook processor desabilitado
# app.py linha 157: webhook_processor.start_processor() comentada
```

### Erro de UUID vs INTEGER
```sql
-- Database deve usar UUID como primary key
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
```

### Import errors
```bash
# Verificar PYTHONPATH
export PYTHONPATH=$PYTHONPATH:/path/to/apps/api/src
```

## 🗺️ Roadmap Técnico
1. **Q1 2025**: Implementar cache Redis + Queue Celery
2. **Q2 2025**: Microserviços para pagamentos e shipping
3. **Q3 2025**: Analytics em tempo real com Kafka
4. **Q4 2025**: Mobile app React Native

---
**🔥 Sistema drasticamente simplificado**: De 150+ arquivos para estrutura essencial
**✅ Status**: API rodando na porta 5001, frontend na 3000
**📦 Última limpeza**: Removidos services/, duplicatas e 50+ arquivos desnecessários