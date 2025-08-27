# 📘 Guia Passo a Passo - Deploy no Render

## 🔰 Preparação Inicial

### 1. Criar Conta no Render
1. Acesse https://render.com
2. Clique em **"Get Started for Free"**
3. Crie sua conta com GitHub (recomendado) ou email

### 2. Preparar o Código
```bash
# No seu terminal local
cd mestres_do_cafe

# Adicione todos os arquivos
git add .

# Commit das mudanças
git commit -m "Configuração para deploy no Render"

# Push para o GitHub
git push origin main
```

---

## 🚀 MÉTODO 1: Deploy Automatizado (Recomendado)

### Passo 1: Criar Blueprint
1. No dashboard do Render, clique no botão **"New +"**
2. Selecione **"Blueprint"**
3. Conecte sua conta GitHub se ainda não estiver conectada
4. Selecione o repositório `mestres_do_cafe`
5. Clique em **"Connect"**
6. O Render detectará automaticamente o arquivo `render.yaml`
7. Clique em **"Apply"**

### Passo 2: Aguardar Criação dos Serviços
O Render criará automaticamente:
- ✅ Database PostgreSQL
- ✅ Web Service (Backend API)
- ✅ Static Site (Frontend)

⏱️ Tempo estimado: 10-15 minutos

---

## 🛠️ MÉTODO 2: Configuração Manual (Controle Total)

### Etapa 1: Criar Database PostgreSQL

1. No dashboard, clique em **"New +"** → **"PostgreSQL"**

2. Configure:
   ```
   Name: mestres-cafe-db
   Database: mestres_cafe  
   User: mestres_cafe_user
   Region: Oregon (US West)
   Version: 15
   Plan: Free (ou Starter $7/mês)
   ```

3. Clique em **"Create Database"**

4. Aguarde a criação (2-3 minutos)

5. Na aba **"Connect"**, copie e guarde:
   - **Internal Database URL** (será usada pelo backend)
   ```
   postgresql://mestres_cafe_user:SENHA_GERADA@dpg-xxxxx:5432/mestres_cafe
   ```

### Etapa 2: Criar Redis (Cache)

1. Clique em **"New +"** → **"Redis"**

2. Configure:
   ```
   Name: mestres-cafe-redis
   Region: Oregon (US West) - MESMA do banco!
   Maxmemory Policy: allkeys-lru
   Plan: Free (ou Starter $7/mês)
   ```

3. Clique em **"Create Redis"**

4. Copie a **Internal Redis URL**:
   ```
   redis://red-xxxxx:6379
   ```

### Etapa 3: Deploy do Backend (API)

1. Clique em **"New +"** → **"Web Service"**

2. Conecte o repositório GitHub

3. Configure os campos:
   ```
   Name: mestres-cafe-api
   Region: Oregon (US West) - MESMA região!
   Branch: main
   Root Directory: . (ponto, significa raiz)
   Runtime: Python 3
   Build Command: cd apps/api && pip install -r requirements.txt
   Start Command: cd apps/api && gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 app:app
   Plan: Free (ou Starter $7/mês)
   ```

4. **IMPORTANTE**: Adicione as Environment Variables:

   Clique em **"Advanced"** → **"Add Environment Variable"**

   ```env
   # 🔐 SEGURANÇA (OBRIGATÓRIAS - Gere valores únicos!)
   SECRET_KEY = gerar-32-caracteres-aleatorios-aqui
   JWT_SECRET_KEY = gerar-outros-32-caracteres-aqui
   
   # 🌍 AMBIENTE
   FLASK_ENV = production
   PYTHONPATH = /opt/render/project/src/apps/api/src
   
   # 🗄️ DATABASE (copie da etapa 1)
   DATABASE_URL = postgresql://mestres_cafe_user:SENHA@dpg-xxxxx:5432/mestres_cafe
   
   # 💾 REDIS (copie da etapa 2)
   REDIS_URL = redis://red-xxxxx:6379
   
   # 🌐 CORS
   CORS_ORIGINS = https://mestres-cafe-web.onrender.com
   
   # 💳 MERCADO PAGO (obtenha em https://www.mercadopago.com.br/developers)
   MERCADO_PAGO_ACCESS_TOKEN = APP_USR-xxxxx
   MERCADO_PAGO_PUBLIC_KEY = APP_USR-xxxxx
   MERCADO_PAGO_WEBHOOK_SECRET = seu-webhook-secret
   
   # 📦 MELHOR ENVIO (obtenha em https://melhorenvio.com.br)
   MELHOR_ENVIO_API_KEY = sua-api-key-producao
   MELHOR_ENVIO_SANDBOX = false
   
   # 📧 EMAIL (exemplo Gmail)
   MAIL_SERVER = smtp.gmail.com
   MAIL_PORT = 587
   MAIL_USE_TLS = true
   MAIL_USERNAME = seu-email@gmail.com
   MAIL_PASSWORD = senha-de-app-especifica
   
   # ⚙️ WORKERS
   GUNICORN_WORKERS = 2
   GUNICORN_THREADS = 4
   ```

5. Clique em **"Create Web Service"**

6. Aguarde o deploy (5-10 minutos)

7. Quando concluído, copie a URL:
   ```
   https://mestres-cafe-api.onrender.com
   ```

### Etapa 4: Deploy do Frontend

1. Clique em **"New +"** → **"Static Site"**

2. Conecte o mesmo repositório

3. Configure:
   ```
   Name: mestres-cafe-web
   Branch: main
   Root Directory: apps/web
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. Adicione as Environment Variables:
   ```env
   NODE_ENV = production
   VITE_API_URL = https://mestres-cafe-api.onrender.com
   VITE_MERCADO_PAGO_PUBLIC_KEY = APP_USR-xxxxx (mesma do backend)
   ```

5. Clique em **"Create Static Site"**

6. Aguarde o build (3-5 minutos)

7. Sua URL será:
   ```
   https://mestres-cafe-web.onrender.com
   ```

---

## ✅ Verificação Pós-Deploy

### 1. Testar Backend
```bash
# No terminal ou browser
curl https://mestres-cafe-api.onrender.com/api/health

# Resposta esperada:
{
  "status": "healthy",
  "service": "Mestres do Café API",
  "version": "1.0.0"
}
```

### 2. Testar Frontend
1. Acesse: https://mestres-cafe-web.onrender.com
2. Verifique se a página inicial carrega
3. Teste a navegação

### 3. Verificar Logs
1. No dashboard do Render
2. Clique no serviço (api ou web)
3. Vá na aba **"Logs"**
4. Verifique por erros

---

## 🔧 Configurações Adicionais

### Configurar Webhooks do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Selecione sua aplicação
3. Vá em **"Webhooks"**
4. Configure a URL:
   ```
   https://mestres-cafe-api.onrender.com/api/mercado-pago/webhook
   ```
5. Selecione os eventos:
   - Payment
   - Merchant Order

### Configurar Melhor Envio

1. Acesse: https://melhorenvio.com.br
2. Vá em **Configurações** → **API**
3. Configure:
   ```
   Callback URL: https://mestres-cafe-api.onrender.com/api/melhor-envio/callback
   Webhook URL: https://mestres-cafe-api.onrender.com/api/melhor-envio/webhook
   ```

### Domínio Personalizado (Opcional)

1. No serviço do Frontend no Render
2. Vá em **"Settings"** → **"Custom Domains"**
3. Clique em **"Add Custom Domain"**
4. Digite: `www.mestresdocafe.com.br`
5. Configure no seu provedor DNS:
   ```
   Type: CNAME
   Name: www
   Value: mestres-cafe-web.onrender.com
   ```

---

## 🐛 Troubleshooting

### Erro: "Build failed"
- Verifique os logs de build
- Certifique-se que `requirements.txt` e `package.json` estão corretos

### Erro: "Database connection failed"
- Verifique se DATABASE_URL está correta
- Confirme que o banco está na mesma região

### Erro: "CORS blocked"
- Verifique CORS_ORIGINS no backend
- Deve incluir a URL completa do frontend com https://

### Frontend não carrega dados
- Verifique VITE_API_URL no frontend
- Deve apontar para o backend com https://

### "Service unavailable" após deploy
- Normal nos primeiros minutos
- Serviços Free hibernam após 15min de inatividade
- Primeira requisição demora ~30s para acordar

---

## 💡 Dicas Importantes

1. **Secrets Seguros**: Use https://randomkeygen.com para gerar SECRET_KEY e JWT_SECRET_KEY

2. **Mesma Região**: SEMPRE use a mesma região para todos os serviços

3. **Plano Free**: 
   - Hiberna após 15min sem uso
   - Limite de 750h/mês
   - Ideal para testes

4. **Plano Starter ($7/mês)**:
   - Sempre ativo
   - Melhor performance
   - Recomendado para produção

5. **Monitoramento**: Configure alertas no Render Dashboard

---

## 📞 Suporte

### Render
- Docs: https://render.com/docs
- Status: https://status.render.com
- Support: support@render.com

### Problemas Comuns
- Cold Start (30s no plano free): Normal, aguarde
- Build timeout: Otimize dependências
- Memory limit: Upgrade para plano maior

---

## 🎉 Parabéns!

Seu sistema está no ar! 🚀

**URLs de Produção:**
- Frontend: https://mestres-cafe-web.onrender.com
- Backend: https://mestres-cafe-api.onrender.com/api/health
- Admin: https://mestres-cafe-web.onrender.com/admin

**Próximos Passos:**
1. Teste todas as funcionalidades
2. Configure monitoramento (Sentry)
3. Faça backup do banco regularmente
4. Configure CI/CD com GitHub Actions