# 🚀 GUIA DE CONFIGURAÇÃO COMPLETO - MESTRES DO CAFÉ ENTERPRISE

## 📋 **PRÉ-REQUISITOS**

### **Obrigatórios:**
- ✅ **Docker** e **Docker Compose** instalados
- ✅ **Node.js** 18+ (para desenvolvimento)
- ✅ **Python** 3.11+ (para desenvolvimento)
- ✅ **Git** para versionamento

### **Contas Necessárias:**
- 🏦 **Mercado Pago** - Para pagamentos
- 📦 **Melhor Envio** - Para fretes  
- 📧 **SMTP** - Para emails (Gmail, SendGrid, etc.)
- ☁️ **PostgreSQL** - Banco de dados (local ou cloud)
- 🔴 **Redis** - Cache (opcional, tem fallback)

---

## ⚙️ **CONFIGURAÇÃO PASSO A PASSO**

### **1. CONFIGURAÇÃO DAS APIS EXTERNAS**

#### 🏦 **Mercado Pago**
1. Acesse: https://www.mercadopago.com.br/developers
2. Crie uma aplicação
3. Anote suas credenciais:
   - `ACCESS_TOKEN` (começa com APP_USR)
   - `PUBLIC_KEY` (começa com APP_USR)

#### 📦 **Melhor Envio**
1. Acesse: https://melhorenvio.com.br/painel/gerenciar/tokens
2. Gere um token de API
3. Anote o token (formato: Bearer token)

#### 📧 **SMTP (Gmail exemplo)**
1. Ative autenticação em 2 fatores no Gmail
2. Gere uma senha de app específica
3. Use suas credenciais:
   - SMTP: smtp.gmail.com
   - Porta: 587
   - Usuário: seu_email@gmail.com
   - Senha: senha_de_app_gerada

### **2. CONFIGURAÇÃO DO BANCO DE DADOS**

#### **Opção A: PostgreSQL Local (Docker)**
```bash
# Usar docker-compose.yml (já configurado)
docker-compose up postgres
```

#### **Opção B: PostgreSQL Cloud**
- **Supabase**: https://supabase.com (gratuito)
- **Railway**: https://railway.app
- **Heroku Postgres**: https://heroku.com
- **Amazon RDS**: https://aws.amazon.com/rds

### **3. CONFIGURAÇÃO DO ARQUIVO .env**

Copie e configure o arquivo de ambiente:

```bash
cp .env.production .env
```

Edite o `.env` com suas credenciais:

```bash
# ===========================================
# MESTRES DO CAFÉ ENTERPRISE - CONFIGURAÇÃO
# ===========================================

# FLASK CORE
FLASK_ENV=production
SECRET_KEY=cole_aqui_uma_chave_super_secreta_de_pelo_menos_32_caracteres
JWT_SECRET_KEY=cole_aqui_outra_chave_diferente_para_jwt

# DATABASE
# Local: postgresql://postgres:postgres@localhost:5432/mestres_cafe
# Cloud: postgresql://user:pass@host:5432/database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mestres_cafe

# REDIS (OPCIONAL - tem fallback)
REDIS_URL=redis://redis:6379/0

# MERCADO PAGO (OBRIGATÓRIO)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-seu-access-token-aqui
MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua-public-key-aqui
MERCADO_PAGO_WEBHOOK_SECRET=sua-webhook-secret-key

# MELHOR ENVIO (OBRIGATÓRIO)
MELHOR_ENVIO_TOKEN=Bearer-seu-token-aqui
MELHOR_ENVIO_SANDBOX=false

# EMAIL/SMTP
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha_de_app

# CORS (domínios permitidos)
CORS_ORIGINS=http://localhost:3000,https://seudominio.com

# CONFIGURAÇÕES DE PRODUÇÃO
GUNICORN_WORKERS=4
GUNICORN_TIMEOUT=120

# MONITORAMENTO
GRAFANA_PASSWORD=senha_forte_grafana

# BACKUP
BACKUP_RETENTION_DAYS=30
```

### **4. CONFIGURAÇÃO DE DOMÍNIO (OPCIONAL)**

Para usar domínio personalizado:

```bash
# No DNS do seu domínio, crie um registro A:
# seudominio.com -> IP_DO_SERVIDOR

# No .env, configure:
CORS_ORIGINS=https://seudominio.com,https://www.seudominio.com
```

### **5. CONFIGURAÇÃO SSL (PRODUÇÃO)**

Para HTTPS em produção:

```bash
# Coloque seus certificados em:
mkdir -p nginx/ssl
# Copie para: nginx/ssl/cert.pem e nginx/ssl/private.key

# Ou use Let's Encrypt:
# certbot certonly --standalone -d seudominio.com
```

---

## 🚀 **EXECUTANDO O SISTEMA**

### **Desenvolvimento**
```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd mestres_cafe_enterprise

# 2. Configure o .env
cp .env.production .env
# Edite o .env com suas credenciais

# 3. Execute com Docker
docker-compose up

# Acesse:
# Frontend: http://localhost:3000
# API: http://localhost:5001
```

### **Produção**
```bash
# 1. Configure o .env de produção
cp .env.production .env
# Edite com credenciais reais

# 2. Execute deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 3. Com monitoramento (opcional)
./scripts/deploy.sh --skip-backup --with-monitoring

# Acesse:
# Frontend: https://seudominio.com
# API: https://seudominio.com/api
# Grafana: https://seudominio.com:3001
```

---

## 🔧 **COMANDOS ÚTEIS**

### **Desenvolvimento**
```bash
# Ver logs
docker-compose logs -f api
docker-compose logs -f web

# Executar apenas backend
docker-compose up api postgres redis

# Executar apenas frontend
cd apps/web && npm run dev

# Backup do banco
docker-compose --profile backup up backup

# Limpar cache
curl -X POST http://localhost:5001/api/monitoring/cache/clear
```

### **Produção**
```bash
# Status dos serviços
docker-compose -f docker-compose.prod.yml ps

# Backup manual
docker-compose -f docker-compose.prod.yml --profile backup up backup

# Ver métricas
curl https://seudominio.com/api/monitoring/health

# Atualizar sistema
git pull
./scripts/deploy.sh
```

---

## 🏪 **CONFIGURAÇÃO DE FRANQUIAS**

### **Criando a Primeira Franquia**
```bash
# Via API
curl -X POST http://localhost:5001/api/tenants/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Café Central",
    "slug": "cafe-central",
    "owner_name": "João Silva",
    "owner_email": "joao@cafecentral.com",
    "plan_type": "premium"
  }'
```

### **Acessando por Subdomínio**
```bash
# Configure DNS:
# cafe-central.seudominio.com -> IP_DO_SERVIDOR

# Acesse:
http://cafe-central.seudominio.com
```

### **Acessando por Header**
```bash
# Via header HTTP:
curl -H "X-Tenant-Slug: cafe-central" http://seudominio.com/api/products
```

---

## 📊 **ACESSANDO FUNCIONALIDADES**

### **Analytics e BI**
```bash
# Dashboard em tempo real
GET /api/analytics/dashboard?days=30

# Relatório executivo
GET /api/analytics/executive-report

# Métricas em tempo real
GET /api/analytics/realtime
```

### **Recomendações ML**
```bash
# Recomendações para usuário
GET /api/recommendations/user/123

# Produtos similares
GET /api/recommendations/similar-products/456

# Homepage personalizada
GET /api/recommendations/personalized-homepage/123
```

### **Monitoramento**
```bash
# Health check detalhado
GET /api/monitoring/health

# Métricas do sistema
GET /api/monitoring/metrics/system

# Alertas ativos
GET /api/monitoring/alerts
```

---

## 🛡️ **SEGURANÇA E MANUTENÇÃO**

### **Backups Automáticos**
- ✅ Backup diário às 2h da manhã
- ✅ Retenção de 30 dias
- ✅ Compressão automática

### **Monitoramento**
- ✅ Health checks a cada 30s
- ✅ Alertas automáticos por thresholds
- ✅ Logs estruturados em JSON

### **Segurança**
- ✅ Rate limiting por IP/usuário
- ✅ Proteção CSRF
- ✅ Validação de entrada
- ✅ Headers de segurança

### **Performance**
- ✅ Cache Redis com fallback
- ✅ Compressão gzip
- ✅ CDN ready
- ✅ Otimização de queries

---

## 🚨 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **1. API não conecta ao banco**
```bash
# Verifique a DATABASE_URL
echo $DATABASE_URL

# Teste a conexão
docker-compose exec api python -c "
from src.database import db
print('Conexão OK!' if db else 'Erro de conexão')
"
```

#### **2. Frontend não carrega**
```bash
# Verifique se API está rodando
curl http://localhost:5001/api/health

# Verifique CORS
# Adicione seu domínio em CORS_ORIGINS
```

#### **3. Pagamentos não funcionam**
```bash
# Verifique credenciais do Mercado Pago
curl -X GET "https://api.mercadopago.com/v1/payment_methods" \
  -H "Authorization: Bearer $MERCADO_PAGO_ACCESS_TOKEN"
```

#### **4. Fretes não calculam**
```bash
# Verifique token do Melhor Envio
curl -X GET "https://melhorenvio.com.br/api/v2/me" \
  -H "Authorization: $MELHOR_ENVIO_TOKEN"
```

#### **5. Performance lenta**
```bash
# Verifique cache
curl http://localhost:5001/api/monitoring/cache/stats

# Verifique alertas
curl http://localhost:5001/api/monitoring/alerts
```

---

## 📞 **SUPORTE**

### **Logs Importantes**
```bash
# Logs da aplicação
docker-compose logs api

# Logs do sistema
tail -f /var/log/syslog

# Logs estruturados
curl http://localhost:5001/api/monitoring/health
```

### **Métricas de Debug**
```bash
# Status geral
curl http://localhost:5001/api/monitoring/status

# Performance
curl http://localhost:5001/api/analytics/realtime

# Uso por tenant
curl http://localhost:5001/api/tenants/current/usage
```

---

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ **Configure .env** com suas credenciais
2. ✅ **Execute docker-compose up**
3. ✅ **Crie sua primeira franquia**
4. ✅ **Configure domínio** (opcional)
5. ✅ **Teste pagamentos** e fretes
6. ✅ **Monitore métricas** em /api/monitoring
7. ✅ **Explore analytics** em /api/analytics

**🚀 Seu sistema enterprise está pronto para conquistar o mercado de café especial!** ☕