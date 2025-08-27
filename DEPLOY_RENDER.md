# 🚀 Guia de Deploy - Mestres do Café no Render

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com)
2. Conta no [GitHub](https://github.com) com o repositório do projeto
3. Contas nas APIs externas:
   - Mercado Pago (pagamentos)
   - Melhor Envio (frete)
   - SendGrid ou Gmail (emails)

## 🏗️ Arquitetura no Render

O sistema será composto por:
- **1 Web Service** - Backend API (Flask/Python)
- **1 Static Site** - Frontend (React/Vite)
- **1 PostgreSQL Database** - Banco de dados
- **1 Redis Instance** - Cache e sessões

## 📦 Passo a Passo de Deploy

### 1️⃣ Preparar o Repositório

```bash
# Certifique-se que todos os arquivos estão commitados
git add .
git commit -m "Preparar para deploy no Render"
git push origin main
```

### 2️⃣ Criar Serviços no Render

#### A. Criar Database PostgreSQL

1. No dashboard do Render, clique em **New +** > **PostgreSQL**
2. Configure:
   - **Name**: `mestres-cafe-db`
   - **Database**: `mestres_cafe`
   - **User**: `mestres_cafe_user`
   - **Region**: Oregon (US West) ou Frankfurt (Europe)
   - **Plan**: Starter ($7/mês) ou Free (limitado)
3. Anote a **Internal Database URL** (será usada pelo backend)

#### B. Criar Redis

1. No dashboard, clique em **New +** > **Redis**
2. Configure:
   - **Name**: `mestres-cafe-redis`
   - **Region**: Mesma do PostgreSQL
   - **Plan**: Starter ($7/mês) ou Free
3. Anote a **Internal Redis URL**

#### C. Deploy Backend API

1. Clique em **New +** > **Web Service**
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `mestres-cafe-api`
   - **Region**: Mesma do banco de dados
   - **Branch**: `main`
   - **Root Directory**: `.` (raiz do projeto)
   - **Runtime**: Python 3
   - **Build Command**: `cd apps/api && chmod +x build.sh && ./build.sh`
   - **Start Command**: `cd apps/api && chmod +x start.sh && ./start.sh`
   - **Plan**: Starter ($7/mês) ou Free

4. **Variáveis de Ambiente** (Add Environment Variables):

```env
# Essenciais (OBRIGATÓRIAS)
FLASK_ENV=production
SECRET_KEY=gerar-uma-chave-segura-com-32-caracteres-minimo
JWT_SECRET_KEY=gerar-outra-chave-segura-com-32-caracteres

# Database (copiar do PostgreSQL criado)
DATABASE_URL=postgresql://... (Internal Database URL do passo A)

# Redis (copiar do Redis criado)
REDIS_URL=redis://... (Internal Redis URL do passo B)

# CORS
CORS_ORIGINS=https://mestres-cafe-web.onrender.com

# APIs Externas - Pagamentos
MERCADO_PAGO_ACCESS_TOKEN=seu-token-producao
MERCADO_PAGO_PUBLIC_KEY=sua-public-key
MERCADO_PAGO_WEBHOOK_SECRET=seu-webhook-secret

# APIs Externas - Frete
MELHOR_ENVIO_API_KEY=sua-api-key
MELHOR_ENVIO_SANDBOX=false

# Email (Gmail exemplo)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=senha-de-app-especifica

# Workers (otimização)
GUNICORN_WORKERS=2
GUNICORN_THREADS=4
```

5. Clique em **Create Web Service**

#### D. Deploy Frontend

1. Clique em **New +** > **Static Site**
2. Conecte o mesmo repositório
3. Configure:
   - **Name**: `mestres-cafe-web`
   - **Branch**: `main`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm install && npm run build:production`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. **Variáveis de Ambiente**:
```env
NODE_ENV=production
VITE_API_URL=https://mestres-cafe-api.onrender.com
VITE_MERCADO_PAGO_PUBLIC_KEY=sua-public-key
```

5. Clique em **Create Static Site**

### 3️⃣ Configurar Webhooks e Callbacks

#### Mercado Pago
1. Acesse o [painel do Mercado Pago](https://www.mercadopago.com.br/developers)
2. Configure a URL de webhook: `https://mestres-cafe-api.onrender.com/api/mercado-pago/webhook`
3. Configure as URLs de retorno no checkout

#### Melhor Envio
1. Acesse o [painel do Melhor Envio](https://melhorenvio.com.br)
2. Configure a URL de callback: `https://mestres-cafe-api.onrender.com/api/melhor-envio/callback`
3. Configure a URL de webhook: `https://mestres-cafe-api.onrender.com/api/melhor-envio/webhook`

### 4️⃣ Configurar Domínio Personalizado (Opcional)

1. No serviço do Frontend, vá em **Settings** > **Custom Domains**
2. Adicione seu domínio: `mestresdocafe.com.br`
3. Configure os DNS no seu provedor:
   - **CNAME**: `www` → `mestres-cafe-web.onrender.com`
   - **A**: `@` → IPs do Render (fornecidos na interface)

### 5️⃣ Deploy via render.yaml (Alternativa Automatizada)

Se preferir deploy automatizado:

1. Commit o arquivo `render.yaml` no repositório
2. No Render Dashboard, clique em **New +** > **Blueprint**
3. Conecte seu repositório e selecione o branch
4. O Render criará todos os serviços automaticamente

## 🔍 Verificação Pós-Deploy

### Testar Backend
```bash
# Health check
curl https://mestres-cafe-api.onrender.com/api/health

# Info da API
curl https://mestres-cafe-api.onrender.com/api/info
```

### Testar Frontend
1. Acesse: https://mestres-cafe-web.onrender.com
2. Verifique se a página carrega corretamente
3. Teste a navegação entre páginas
4. Verifique a comunicação com a API

### Verificar Logs
- No dashboard do Render, acesse cada serviço
- Clique na aba **Logs** para ver logs em tempo real
- Verifique por erros ou warnings

## 🐛 Troubleshooting

### Erro: "Database connection failed"
- Verifique se `DATABASE_URL` está configurada corretamente
- Certifique-se que o PostgreSQL está rodando
- Verifique os logs do banco de dados

### Erro: "CORS error"
- Verifique se `CORS_ORIGINS` inclui a URL do frontend
- Certifique-se que as URLs estão corretas (com https://)

### Erro: "Build failed"
- Verifique os logs de build no Render
- Certifique-se que `requirements.txt` e `package.json` estão corretos
- Verifique as versões do Python e Node.js

### Frontend não conecta com Backend
- Verifique se `VITE_API_URL` está correta
- Certifique-se que o backend está rodando
- Verifique os logs de ambos serviços

## 📊 Monitoramento

### Métricas no Render
- CPU e memória usage
- Request count e response time
- Error rate

### Logs Externos (Opcional)
Configure Sentry para monitoramento de erros:
1. Crie conta no [Sentry](https://sentry.io)
2. Adicione `SENTRY_DSN` nas variáveis de ambiente

## 💰 Custos Estimados (Render)

### Plano Free (Limitado)
- **Backend**: Free Web Service (spin down após 15min inatividade)
- **Frontend**: Free Static Site
- **Database**: Free PostgreSQL (90 dias, depois $7/mês)
- **Redis**: Free Redis (limitado)
- **Total**: $0-7/mês

### Plano Starter (Recomendado para Produção)
- **Backend**: $7/mês (sempre ativo)
- **Frontend**: Free
- **Database**: $7/mês
- **Redis**: $7/mês
- **Total**: ~$21/mês

### Plano Pro (Para escalar)
- **Backend**: $25/mês (mais recursos)
- **Frontend**: Free
- **Database**: $20/mês (mais storage)
- **Redis**: $20/mês
- **Total**: ~$65/mês

## 🔒 Segurança

### Checklist de Segurança
- [x] Secrets únicos e fortes para `SECRET_KEY` e `JWT_SECRET_KEY`
- [x] HTTPS habilitado automaticamente pelo Render
- [x] Database com acesso restrito (IP allowlist)
- [x] Variáveis sensíveis apenas nas environment variables
- [x] Rate limiting configurado
- [x] CORS configurado corretamente

### Backup do Banco de Dados
1. No dashboard do PostgreSQL no Render
2. Clique em **Backups**
3. Configure backups automáticos diários
4. Teste o restore periodicamente

## 📱 Comandos Úteis

### Acessar o Shell do Backend
```bash
# No dashboard do Render, aba "Shell" ou via CLI:
render shell mestres-cafe-api
```

### Executar Migrations
```bash
# No shell do backend
cd apps/api
python3 -c "from src.app import create_app; from src.database import db; app = create_app('production'); app.app_context().push(); db.create_all()"
```

### Limpar Cache Redis
```bash
# No shell do backend
python3 -c "import redis; r = redis.from_url('redis-url'); r.flushall()"
```

## 📝 Notas Finais

1. **Primeiro Deploy**: Pode levar 10-20 minutos
2. **Auto-deploy**: Habilitado por padrão (push para main = deploy)
3. **Rollback**: Possível via dashboard em caso de problemas
4. **Scaling**: Fácil upgrade de planos conforme necessidade
5. **Suporte**: Render oferece suporte via chat/email

## 🎉 Parabéns!

Seu sistema Mestres do Café está pronto para produção! 

### Links Importantes:
- Frontend: https://mestres-cafe-web.onrender.com
- Backend API: https://mestres-cafe-api.onrender.com/api/health
- Dashboard Render: https://dashboard.render.com

### Próximos Passos:
1. Configurar monitoramento (Sentry, LogRocket)
2. Implementar CI/CD com GitHub Actions
3. Configurar backups automáticos
4. Adicionar CDN para assets (Cloudflare)
5. Implementar testes automatizados

---

**Criado por:** Sistema Mestres do Café  
**Data:** 2025  
**Versão:** 1.0.0