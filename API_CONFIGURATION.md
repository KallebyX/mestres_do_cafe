# 🔧 Configuração Completa da API - Mestres do Café

## 📋 Sumário Executivo

Este documento fornece instruções detalhadas para configurar todas as variáveis de ambiente e integrações externas necessárias para o funcionamento completo do sistema Mestres do Café.

---

## 🌍 Variáveis de Ambiente Obrigatórias

### 1. **Segurança e Autenticação**

```bash
# Secrets - OBRIGATÓRIOS em produção
SECRET_KEY=seu-secret-key-super-seguro-min-32-chars
JWT_SECRET_KEY=seu-jwt-secret-key-super-seguro-min-32-chars

# Gerar secrets seguros:
# python -c "import secrets; print(secrets.token_urlsafe(32))"
```

⚠️ **IMPORTANTE**: Nunca use secrets temporários em produção!

### 2. **Banco de Dados**

```bash
# PostgreSQL (Produção)
DATABASE_URL=postgresql://usuario:senha@host:5432/nome_do_banco

# Exemplo Neon Database:
DATABASE_URL=postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# Exemplo Render:
DATABASE_URL=postgres://user:pass@dpg-xxx.render.com/database_name
```

### 3. **Redis (Cache - Opcional em dev, recomendado em prod)**

```bash
REDIS_URL=redis://localhost:6379

# Render/Heroku:
REDIS_URL=redis://:password@hostname:port
```

---

## 💳 Integração Mercado Pago

### Configuração Sandbox (Teste)

```bash
MERCADO_PAGO_ENVIRONMENT=sandbox
MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-123456-abcdef1234567890
MERCADO_PAGO_PUBLIC_KEY=TEST-abcdef12-3456-7890-abcd-ef1234567890
```

### Configuração Produção

```bash
MERCADO_PAGO_ENVIRONMENT=production
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-1234567890-123456-abcdef1234567890
MERCADO_PAGO_PUBLIC_KEY=APP_USR-abcdef12-3456-7890-abcd-ef1234567890
```

### Como Obter as Credenciais

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login na sua conta Mercado Pago
3. Vá em "Suas integrações" > "Credenciais"
4. Escolha "Modo de Produção" ou "Modo de Teste"
5. Copie o `Access Token` e a `Public Key`

### Funcionalidades Suportadas

- ✅ Checkout Pro (redirect)
- ✅ Checkout Transparente (cartão, PIX, boleto)
- ✅ Webhooks automáticos
- ✅ Parcelamento
- ✅ Reembolsos
- ✅ Consulta de pagamentos

### Configurar Webhooks

1. Acesse: https://www.mercadopago.com.br/developers/panel/webhooks
2. Adicione URL: `https://seu-dominio.com/api/mercado-pago/webhook`
3. Selecione eventos: `payment`, `merchant_order`

---

## 🚚 Integração Melhor Envio

### Configuração Sandbox (Teste)

```bash
MELHOR_ENVIO_ENVIRONMENT=sandbox
MELHOR_ENVIO_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
MELHOR_ENVIO_CLIENT_ID=1234
MELHOR_ENVIO_CLIENT_SECRET=abcdef123456
MELHOR_ENVIO_REDIRECT_URI=https://seu-dominio.com/api/melhor-envio/callback
```

### Configuração Produção

```bash
MELHOR_ENVIO_ENVIRONMENT=production
MELHOR_ENVIO_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
MELHOR_ENVIO_CLIENT_ID=5678
MELHOR_ENVIO_CLIENT_SECRET=ghijkl789012
MELHOR_ENVIO_REDIRECT_URI=https://seu-dominio.com/api/melhor-envio/callback
```

### Como Obter as Credenciais

1. Acesse: https://melhorenvio.com.br/developers
2. Crie uma conta de desenvolvedor
3. Crie uma nova aplicação
4. Copie o `Client ID`, `Client Secret`
5. Gere um token de API no painel
6. Configure a URL de callback

### Funcionalidades Suportadas

- ✅ Cálculo de frete (PAC, SEDEX, JadLog, etc.)
- ✅ Rastreamento de encomendas
- ✅ Criação de etiquetas
- ✅ Cancelamento de envios
- ✅ Consulta de agências
- ✅ Sistema de fallback (valores fixos quando API indisponível)

---

## 📧 Configuração de Email (Opcional)

### SMTP para Newsletter e Notificações

```bash
# Gmail (exemplo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
SMTP_USE_TLS=True
EMAIL_FROM_NAME=Mestres do Café
EMAIL_FROM_ADDRESS=noreply@mestresdocafe.com.br

# SendGrid (recomendado)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxx
```

---

## 🔔 Notificações SMS e Push (Opcional)

### Twilio (SMS)

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+5511999999999
```

### Firebase Cloud Messaging (Push)

```bash
FIREBASE_SERVER_KEY=AAAAxxxxxxx:APAxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_PROJECT_ID=seu-projeto-firebase
```

---

## 🌐 Configuração de Ambiente

### Development (Local)

```bash
FLASK_ENV=development
FLASK_DEBUG=1
DEBUG=True
```

### Production (Render/Heroku/Cloud)

```bash
FLASK_ENV=production
FLASK_DEBUG=0
DEBUG=False
```

---

## 🛠️ CORS - Origens Permitidas

```bash
# Development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Production
CORS_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
```

---

## 📁 Arquivo .env Completo (Exemplo)

Crie um arquivo `.env` na raiz do projeto `apps/api/`:

```bash
# ========== SECRETS ==========
SECRET_KEY=dev-seu-secret-key-super-seguro-min-32-chars-aqui
JWT_SECRET_KEY=dev-seu-jwt-secret-super-seguro-min-32-chars-aqui

# ========== AMBIENTE ==========
FLASK_ENV=development
FLASK_DEBUG=1
DEBUG=True

# ========== BANCO DE DADOS ==========
DATABASE_URL=postgresql://usuario:senha@localhost:5432/mestres_cafe

# ========== REDIS ==========
REDIS_URL=redis://localhost:6379

# ========== MERCADO PAGO ==========
MERCADO_PAGO_ENVIRONMENT=sandbox
MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-access-token-aqui
MERCADO_PAGO_PUBLIC_KEY=TEST-sua-public-key-aqui

# ========== MELHOR ENVIO ==========
MELHOR_ENVIO_ENVIRONMENT=sandbox
MELHOR_ENVIO_API_KEY=seu-api-key-aqui
MELHOR_ENVIO_CLIENT_ID=seu-client-id
MELHOR_ENVIO_CLIENT_SECRET=seu-client-secret
MELHOR_ENVIO_REDIRECT_URI=http://localhost:5001/api/melhor-envio/callback

# ========== EMAIL (OPCIONAL) ==========
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
SMTP_USE_TLS=True
EMAIL_FROM_NAME=Mestres do Café
EMAIL_FROM_ADDRESS=noreply@mestresdocafe.com.br

# ========== CORS ==========
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 🚀 Deploy em Produção

### Render.com

1. **Criar Web Service**:
   - Conecte seu repositório GitHub
   - Build Command: `cd apps/api && pip install -r requirements.txt`
   - Start Command: `cd apps/api && python src/app.py`

2. **Adicionar Variáveis de Ambiente**:
   - Acesse "Environment" no dashboard
   - Adicione todas as variáveis listadas acima
   - ⚠️ Use credenciais de PRODUÇÃO

3. **Banco de Dados PostgreSQL**:
   - Render cria automaticamente `DATABASE_URL`
   - Não precisa adicionar manualmente

### Heroku

```bash
# Configurar variáveis
heroku config:set SECRET_KEY=seu-secret
heroku config:set JWT_SECRET_KEY=seu-jwt-secret
heroku config:set MERCADO_PAGO_ACCESS_TOKEN=seu-token
# ... outras variáveis
```

---

## ✅ Checklist de Configuração

### Desenvolvimento

- [ ] Criar arquivo `.env` em `apps/api/`
- [ ] Configurar `SECRET_KEY` e `JWT_SECRET_KEY`
- [ ] Configurar banco de dados PostgreSQL local OU usar SQLite
- [ ] (Opcional) Configurar Redis local
- [ ] Configurar credenciais SANDBOX do Mercado Pago
- [ ] Configurar credenciais SANDBOX do Melhor Envio
- [ ] Testar `curl http://localhost:5001/api/health`

### Produção

- [ ] Configurar secrets fortes (32+ caracteres)
- [ ] Configurar `DATABASE_URL` do PostgreSQL
- [ ] Configurar `REDIS_URL` (recomendado)
- [ ] Configurar credenciais PRODUÇÃO do Mercado Pago
- [ ] Configurar credenciais PRODUÇÃO do Melhor Envio
- [ ] Configurar webhooks do Mercado Pago
- [ ] Configurar SMTP para emails
- [ ] Configurar `CORS_ORIGINS` com domínios reais
- [ ] Definir `FLASK_ENV=production` e `DEBUG=False`
- [ ] Testar integrações em ambiente de homologação

---

## 🐛 Troubleshooting

### Erro: "Access token não configurado"

**Solução**: Verifique se `MERCADO_PAGO_ACCESS_TOKEN` está definido no `.env`

### Erro: "API key não configurada" (Melhor Envio)

**Solução**: O sistema usa fallback automático. Verifique se `MELHOR_ENVIO_API_KEY` está correto

### Erro: "Database connection failed"

**Solução**: Verifique `DATABASE_URL` e se o PostgreSQL está rodando

### Mercado Pago retorna erro 401

**Solução**: Token expirado ou inválido. Gere um novo no painel de desenvolvedores

### Melhor Envio não calcula frete

**Solução**: Sistema usa valores fixos (fallback). Verifique logs para detalhes do erro

---

## 📚 Recursos Adicionais

- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs)
- [Documentação Melhor Envio](https://docs.melhorenvio.com.br/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique os logs da aplicação
2. Consulte este documento
3. Revise a documentação oficial das APIs
4. Verifique os arquivos de exemplo no repositório

---

**Última atualização**: 2025-01-13
**Versão do Sistema**: 2.0.0 (Completo)
