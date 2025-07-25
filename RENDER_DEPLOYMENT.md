# Mestres do Café - Deployment no Render

Este guia detalha como fazer deploy da aplicação Mestres do Café no Render em 2025.

## 📋 Pré-requisitos

- Conta no [Render](https://render.com)
- Repositório GitHub com o código
- Credenciais do MercadoPago (sandbox/produção)
- Credenciais do Melhor Envio (opcional)

## 🚀 Processo de Deployment

### 1. Preparação do Repositório

Certifique-se de que o repositório contém:
- ✅ `render.yaml` (blueprint de configuração)
- ✅ `apps/api/requirements.txt` (com dependências de produção)
- ✅ `apps/api/build.sh` e `apps/api/start.sh` (scripts executáveis)
- ✅ `.env.production` (template de variáveis)

### 2. Conectar Repositório ao Render

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em "New" → "Blueprint"
3. Conecte seu repositório GitHub
4. Selecione o arquivo `render.yaml`
5. Clique em "Apply"

### 3. Configurar Variáveis de Ambiente

Após o deployment automático, configure as seguintes variáveis no dashboard:

#### MercadoPago (Obrigatório)
```bash
MERCADO_PAGO_ACCESS_TOKEN=TEST-ou-APP_USR-xxxxx
MERCADO_PAGO_PUBLIC_KEY=TEST-ou-APP_USR-xxxxx
MERCADO_PAGO_WEBHOOK_SECRET=seu-webhook-secret
```

#### Melhor Envio (Opcional)
```bash
MELHOR_ENVIO_API_KEY=seu-api-key
MELHOR_ENVIO_CLIENT_ID=seu-client-id
MELHOR_ENVIO_CLIENT_SECRET=seu-client-secret
```

#### Frontend
```bash
VITE_MERCADO_PAGO_PUBLIC_KEY=seu-public-key
```

### 4. Verificar Deployment

Após o deployment, verifique:

1. **API Health Check**: `https://seu-api.onrender.com/api/health`
2. **Frontend**: `https://seu-frontend.onrender.com`
3. **Database**: Conectado automaticamente
4. **Redis**: Conectado automaticamente

## 🔧 Estrutura de Serviços

### Serviços Criados Automaticamente

1. **mestres-cafe-db** (PostgreSQL)
   - Plan: Free (90 dias)
   - Extensions: uuid-ossp, pgcrypto
   - Region: Oregon

2. **mestres-cafe-redis** (Redis)
   - Plan: Free
   - Policy: allkeys-lru
   - Region: Oregon

3. **mestres-cafe-api** (Flask Backend)
   - Plan: Free (750h/mês)
   - Runtime: Python 3.11
   - Workers: 2, Threads: 4
   - Region: Oregon

4. **mestres-cafe-web** (React Frontend)
   - Plan: Free
   - CDN Global
   - Static site with SPA routing

## 🔍 Monitoramento e Debugging

### Logs em Tempo Real
```bash
# Via Dashboard
Render Dashboard → Service → Logs

# Via CLI (se instalado)
render services logs mestres-cafe-api
render services logs mestres-cafe-web
```

### Health Checks
```bash
# API
curl https://mestres-cafe-api.onrender.com/api/health

# Database Check
curl https://mestres-cafe-api.onrender.com/api/health/db
```

### Troubleshooting Comum

#### 1. Build Failed
- Verificar `requirements.txt` 
- Conferir scripts `build.sh` executáveis
- Revisar logs de build

#### 2. Database Connection Error
- Verificar `DATABASE_URL` configurada
- Confirmar extensões PostgreSQL
- Testar migração manual

#### 3. CORS Errors
- Verificar `CORS_ORIGINS` no backend
- Atualizar URLs após deployment
- Conferir HTTPS/HTTP mismatch

## 🔄 Webhook Configuration

Após deployment, configure webhooks:

### MercadoPago
```bash
# URL de Webhook
https://mestres-cafe-api.onrender.com/api/payments/mercadopago/webhook

# Eventos
- payment
- plan
- subscription
- invoice
```

### Melhor Envio
```bash
# URL de Callback
https://mestres-cafe-api.onrender.com/api/melhor-envio/callback

# Eventos
- shipment.tracking
- shipment.delivered
```

## 🚀 Deployment Automático

### GitHub Integration

O Render pode ser configurado para deploy automático:

1. **Branch Principal**: `main`
2. **Auto-Deploy**: Habilitado
3. **Build Filters**: Configurados no `render.yaml`

### Build Triggers

- API: Mudanças em `apps/api/**`
- Web: Mudanças em `apps/web/**`
- Config: Mudanças em `render.yaml`

## 📊 Performance e Scaling

### Free Tier Limits

- **API**: 750 horas/mês
- **Database**: 90 dias (free)
- **Redis**: 25MB storage
- **Bandwidth**: 100GB/mês

### Scaling Options

Para produção, considere:

1. **API**: Upgrade para Starter ($7/mês)
2. **Database**: Upgrade para Paid ($7/mês)
3. **Redis**: Upgrade para Paid ($5/mês)

## 🔒 Segurança

### Certificados SSL
- Automático para domínios `.onrender.com`
- Suporte a domínios customizados

### Headers de Segurança
- HSTS, X-Frame-Options, CSP
- Configurados automaticamente

### Rate Limiting
- Implementado na aplicação
- Redis para storage distribuído

## 🌐 Domínio Customizado

### Configuração

1. **Render Dashboard** → Service → Settings
2. **Custom Domains** → Add Domain
3. Configurar DNS records:
   ```
   Type: CNAME
   Name: www (ou @)
   Value: seu-app.onrender.com
   ```

### Atualizar Configurações

Após domínio customizado:
1. Atualizar `CORS_ORIGINS`
2. Atualizar URLs de webhook
3. Atualizar `VITE_API_URL`

## 📋 Checklist Pós-Deployment

- [ ] API respondendo no health check
- [ ] Frontend carregando corretamente
- [ ] Database conectado e migrações aplicadas
- [ ] Redis funcionando para cache
- [ ] Login/registro de usuários funcionando
- [ ] Carrinho de compras operacional
- [ ] Checkout com MercadoPago testado
- [ ] Cálculo de frete com Melhor Envio testado
- [ ] Webhooks configurados e testados
- [ ] SSL certificado ativo
- [ ] Monitoring e logs configurados

## 🆘 Suporte

### Recursos Úteis

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Status Page](https://status.render.com)

### Contatos de Emergência

Para problemas críticos:
1. Verificar [Render Status](https://status.render.com)
2. Consultar logs de aplicação
3. Abrir ticket no Render Dashboard
4. Contatar suporte via email

---

**Última atualização**: Janeiro 2025  
**Versão do Render**: 2025.1  
**Compatibilidade**: Python 3.11, Node.js 18+