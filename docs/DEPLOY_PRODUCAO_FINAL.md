# 🚀 Deploy e Configuração de Produção - MercadoPago

## 🎯 Requisitos de Produção

### Arquitetura de Produção
```
Frontend (Vite) → Porta 3000 → https://mestresdocafe.com.br
Backend/API/DB  → Porta 5001 → https://api.mestresdocafe.com.br
```

### Domínios Necessários
- **Frontend**: `https://mestresdocafe.com.br` (ou seu domínio)
- **API/Backend**: `https://api.mestresdocafe.com.br` (subdomínio para API)

## 📋 Checklist de Deploy

### 1. Configurar Servidor de Produção

#### Opção A: Railway (Recomendado)
```bash
# 1. Frontend (Vite - Porta 3000)
railway login
cd apps/web
railway up

# 2. Backend (Flask - Porta 5001)  
cd ../api
railway up
```

#### Opção B: Vercel + Railway
```bash
# Frontend no Vercel
cd apps/web
vercel --prod

# Backend no Railway
cd ../api  
railway up
```

#### Opção C: DigitalOcean/AWS
- Frontend: Build estático + CDN
- Backend: Container Docker na porta 5001

### 2. Configurar Domínios

#### DNS Records necessários:
```dns
A     mestresdocafe.com.br        → IP_DO_SERVIDOR_FRONTEND
CNAME api.mestresdocafe.com.br    → URL_DO_BACKEND
```

### 3. Configurar SSL/HTTPS
- Certificado SSL obrigatório para webhooks MercadoPago
- Usar Let's Encrypt, Cloudflare SSL, ou certificado do provedor

### 4. Variáveis de Ambiente de Produção

#### Backend (.env)
```env
# MercadoPago Produção
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-[production-token]
MERCADO_PAGO_PUBLIC_KEY=APP_USR-[production-public-key]
MERCADO_PAGO_ENVIRONMENT=production
MERCADO_PAGO_WEBHOOK_SECRET=[webhook-secret]

# URLs
API_URL=https://api.mestresdocafe.com.br
FRONTEND_URL=https://mestresdocafe.com.br
CORS_ORIGINS=https://mestresdocafe.com.br,https://www.mestresdocafe.com.br

# Servidor
PORT=5001
HOST=0.0.0.0
FLASK_ENV=production

# Banco de Dados
DATABASE_URL=[production-database-url]
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.mestresdocafe.com.br
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-[production-public-key]
VITE_ENVIRONMENT=production
```

### 5. Configurar Webhooks no MercadoPago

#### URLs para configurar no painel:
```
Webhook Principal:
https://api.mestresdocafe.com.br/api/payments/mercadopago/webhook

Webhook Transparente (opcional):
https://api.mestresdocafe.com.br/api/payments/mercadopago/transparent/webhook
```

#### Eventos a configurar:
- ✅ payment
- ✅ plan  
- ✅ subscription
- ✅ invoice
- ✅ point_integration_wh

### 6. Testes de Validação de Produção

#### Teste de conectividade:
```bash
# Testar API
curl -I https://api.mestresdocafe.com.br/api/health

# Testar webhook
curl -X POST -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"test"}}' \
  https://api.mestresdocafe.com.br/api/payments/mercadopago/webhook
```

#### Teste de pagamento real:
1. Acessar `https://mestresdocafe.com.br`
2. Fazer pedido de teste
3. Processar pagamento com cartão real
4. Verificar notificação webhook nos logs

## 🔧 Configurações Específicas por Provedor

### Railway
```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "startCommand": "python app.py"
  }
}
```

### Vercel (Frontend)
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Docker (Backend)
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5001

CMD ["python", "app.py"]
```

## 🚨 Checklist de Segurança

### Produção obrigatório:
- [x] HTTPS habilitado
- [x] Certificado SSL válido
- [x] Headers de segurança configurados
- [x] CORS restrito aos domínios corretos
- [x] Credenciais de produção MercadoPago
- [x] Webhook signature validation
- [x] Rate limiting ativo
- [x] Logs de monitoramento
- [x] Backup automático do banco

## 📊 Monitoramento de Produção

### Logs importantes:
```bash
# Webhook logs
tail -f /var/log/webhook.log

# Pagamentos
tail -f /var/log/payments.log

# Erros gerais
tail -f /var/log/error.log
```

### Alertas configurar:
- Webhooks falhos consecutivos
- Taxa de erro > 5%
- Tempo de resposta > 2s
- Problemas de conectividade com MP

## 🎯 URLs Finais de Produção

### Para configurar no MercadoPago:
```
Webhook URL: https://api.mestresdocafe.com.br/api/payments/mercadopago/webhook
```

### Para testar:
```
Frontend: https://mestresdocafe.com.br
API Health: https://api.mestresdocafe.com.br/api/health
API Info: https://api.mestresdocafe.com.br/api/info
```

## ✅ Status Final

**Implementação**: ✅ 100% COMPLETA  
**Ambiente Local**: ✅ FUNCIONANDO (front:3000, back:5001)  
**Webhooks Locais**: ✅ TESTADOS E APROVADOS  
**Documentação**: ✅ COMPLETA  

**Próximo passo**: Deploy com domínio próprio para ativação completa dos webhooks MercadoPago.

---

**IMPORTANTE**: Este deploy ativará os webhooks públicos e completará a integração MercadoPago em produção.