# Deployment Guide - Mestres do Café

Este guia contém instruções para deployment da aplicação Mestres do Café em diferentes ambientes.

## 🚀 Render Deployment (Recomendado)

### Configuração Automática

1. **Conecte o repositório no Render**:
   - Acesse [render.com](https://render.com)
   - Conecte sua conta GitHub
   - Selecione este repositório
   - O arquivo `render.yaml` será automaticamente detectado

2. **Configuração de Variáveis de Ambiente**:
   ```bash
   # Obrigatórias para produção
   JWT_SECRET_KEY=sua-chave-secreta-super-forte
   MERCADO_PAGO_ACCESS_TOKEN=seu-token-mercado-pago
   MERCADO_PAGO_CLIENT_ID=seu-client-id
   MERCADO_PAGO_CLIENT_SECRET=seu-client-secret
   ```

3. **Deploy Automático**:
   - O Render criará automaticamente:
     - Backend API (Python/Flask)
     - Frontend Web (Node.js/React)
     - Banco PostgreSQL
   - URLs geradas automaticamente

### Configuração Manual

Se preferir configurar manualmente:

```bash
# 1. Backend API
Service Type: Web Service
Build Command: cd apps/api && pip install -r requirements.txt
Start Command: cd apps/api && gunicorn --bind 0.0.0.0:$PORT src.app:app

# 2. Frontend Web  
Service Type: Static Site
Build Command: cd apps/web && npm ci && npm run build:production
Publish Directory: apps/web/dist
```

## 🐳 Docker Deployment

### Desenvolvimento Local

```bash
# Copiar configurações
cp .env.example .env
# Editar .env com suas configurações

# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### Produção

```bash
# Configurar variáveis de ambiente
export DATABASE_URL="postgresql://user:pass@host:port/db"
export JWT_SECRET_KEY="sua-chave-secreta"
export MERCADO_PAGO_ACCESS_TOKEN="seu-token"

# Deploy em produção
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ Outros Provedores Cloud

### Heroku

```bash
# 1. Instalar Heroku CLI
# 2. Login
heroku login

# 3. Criar apps
heroku create mestres-cafe-api
heroku create mestres-cafe-web

# 4. Configurar buildpacks
heroku buildpacks:set heroku/python -a mestres-cafe-api
heroku buildpacks:set heroku/nodejs -a mestres-cafe-web

# 5. Configurar variáveis
heroku config:set JWT_SECRET_KEY=sua-chave -a mestres-cafe-api
heroku config:set DATABASE_URL=postgres://... -a mestres-cafe-api

# 6. Deploy
git subtree push --prefix=apps/api heroku-api main
git subtree push --prefix=apps/web heroku-web main
```

### Vercel (Frontend apenas)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
cd apps/web
vercel --prod

# 3. Configurar variáveis de ambiente no dashboard
# VITE_API_URL=https://sua-api.onrender.com/api
```

### Railway

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login e deploy
railway login
railway new
railway up
```

## 🔒 Configurações de Segurança

### Variáveis de Ambiente Obrigatórias

```bash
# Segurança
JWT_SECRET_KEY=          # Chave de 32+ caracteres
SECRET_KEY=              # Chave Flask

# Banco de Dados
DATABASE_URL=            # URL completa do PostgreSQL

# Pagamentos
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_CLIENT_ID=
MERCADO_PAGO_CLIENT_SECRET=

# URLs
CORS_ORIGINS=            # URLs permitidas
FRONTEND_URL=            # URL do frontend
```

### Checklist de Segurança

- [ ] JWT_SECRET_KEY com 32+ caracteres aleatórios
- [ ] DATABASE_URL usando PostgreSQL (não SQLite)
- [ ] CORS_ORIGINS configurado com domínios específicos
- [ ] Variáveis sensíveis não commitadas no código
- [ ] HTTPS habilitado em produção
- [ ] Logs de segurança configurados

## 📊 Monitoramento

### Health Checks

```bash
# API Health
curl https://sua-api.onrender.com/api/health

# Frontend Health
curl https://seu-frontend.onrender.com/
```

### Logs

```bash
# Render
# Acessar dashboard > serviço > Logs

# Docker
docker-compose logs -f api
docker-compose logs -f web

# Heroku
heroku logs --tail -a mestres-cafe-api
```

### Métricas

- Response time
- Error rate
- Database connections
- Memory/CPU usage
- Request volume

## 🚨 Troubleshooting

### Problemas Comuns

1. **Build Error - Python Dependencies**
   ```bash
   # Verificar requirements.txt
   cd apps/api
   pip install -r requirements.txt
   ```

2. **Build Error - Node Dependencies**
   ```bash
   # Limpar cache
   cd apps/web
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Database Connection Error**
   ```bash
   # Verificar URL do banco
   echo $DATABASE_URL
   # Testar conexão
   psql $DATABASE_URL
   ```

4. **CORS Error**
   ```bash
   # Verificar configuração
   echo $CORS_ORIGINS
   # Deve incluir URL do frontend
   ```

### Suporte

- 📧 Email: suporte@mestresdocafe.com
- 📱 Issues: GitHub Issues
- 📖 Docs: /docs/deployment

---

**Nota**: Este deployment guide foi criado para facilitar a implantação segura e eficiente da aplicação Mestres do Café em ambiente de produção.