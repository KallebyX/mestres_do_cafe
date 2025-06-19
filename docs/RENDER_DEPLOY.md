# 🚀 **Deploy no Render - Mestres do Café**

Guia completo para fazer deploy da plataforma Mestres do Café no Render.

---

## 🎯 **Visão Geral**

O projeto será deployado no Render com:
- **Frontend**: Site estático (React)
- **Backend**: Web service (Node.js)
- **Banco**: PostgreSQL gerenciado pelo Render

---

## ⚡ **Deploy Automático**

### 1. **Conectar Repositório**
1. Acesse [render.com](https://render.com)
2. Clique em "New +" → "Blueprint"
3. Conecte o repositório: `https://github.com/KallebyX/v0-mestres.git`
4. O Render detectará automaticamente o arquivo `render.yaml`

### 2. **Configuração Automática**
O arquivo `render.yaml` configurará automaticamente:
- ✅ Frontend estático na URL: `https://mestres-cafe-frontend.onrender.com`
- ✅ Backend API na URL: `https://mestres-cafe-backend.onrender.com`
- ✅ Banco PostgreSQL gerenciado

---

## 🔧 **Deploy Manual (Alternativo)**

### **Frontend (Site Estático)**

1. **Criar Novo Site Estático**
   - New → Static Site
   - Conectar repositório
   - Branch: `main`

2. **Configurações de Build**
   ```bash
   # Build Command
   npm install && npm run build
   
   # Publish Directory
   dist
   ```

3. **Variáveis de Ambiente**
   ```env
   NODE_ENV=production
   VITE_API_URL=https://mestres-cafe-backend.onrender.com
   ```

### **Backend (Web Service)**

1. **Criar Novo Web Service**
   - New → Web Service  
   - Conectar repositório
   - Branch: `main`

2. **Configurações**
   ```bash
   # Root Directory
   server
   
   # Build Command
   npm install
   
   # Start Command
   npm start
   
   # Health Check Path
   /api/health
   ```

3. **Variáveis de Ambiente**
   ```env
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=seu_jwt_secret_super_seguro_gerado
   CORS_ORIGIN=https://mestres-cafe-frontend.onrender.com
   DATABASE_URL=postgresql://... (gerado automaticamente)
   ```

---

## 🗄️ **Banco de Dados**

### **PostgreSQL Gerenciado**

1. **Criar Banco**
   - New → PostgreSQL
   - Nome: `mestres-cafe-database`
   - Plano: Free (256MB)

2. **Configuração Automática**
   O Render fornecerá automaticamente:
   - `DATABASE_URL`
   - Credenciais de acesso
   - SSL configurado

3. **Inicialização**
   ```sql
   -- Tabelas criadas automaticamente pelo backend
   -- Dados seed inseridos na primeira execução
   ```

---

## 🌍 **URLs de Produção**

### **Frontend**
```
https://mestres-cafe-frontend.onrender.com
```

### **Backend API**
```
https://mestres-cafe-backend.onrender.com/api
```

### **Endpoints Principais**
- `GET /api/health` - Health check
- `POST /api/auth/login` - Login
- `GET /api/products` - Produtos
- `GET /api/gamification/profile` - Perfil gamificação

---

## ⚙️ **Configurações Avançadas**

### **Headers de Segurança**
```yaml
headers:
  - path: /*
    name: X-Frame-Options
    value: DENY
  - path: /*
    name: X-Content-Type-Options
    value: nosniff
  - path: /*
    name: Referrer-Policy
    value: strict-origin-when-cross-origin
```

### **Redirects SPA**
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

### **Health Check**
```yaml
healthCheckPath: /api/health
```

---

## 🔐 **Variáveis de Ambiente Necessárias**

### **Frontend (.env)**
```env
# Produção
NODE_ENV=production
VITE_API_URL=https://mestres-cafe-backend.onrender.com

# Desenvolvimento local
VITE_API_URL=http://localhost:5000
```

### **Backend (.env)**
```env
# Essenciais
NODE_ENV=production
PORT=10000
JWT_SECRET=sua_chave_jwt_super_segura

# Banco (gerado pelo Render)
DATABASE_URL=postgresql://user:pass@host:port/db

# CORS
CORS_ORIGIN=https://mestres-cafe-frontend.onrender.com

# WhatsApp (opcional)
WHATSAPP_SESSION_NAME=mestres-cafe-bot
WHATSAPP_TIMEOUT=60000
```

---

## 🚀 **Processo de Deploy**

### **1. Preparação**
```bash
# Testar localmente
npm test
npm run test:backend
npm run build

# Verificar se tudo funciona
npm run preview
```

### **2. Push para GitHub**
```bash
git add .
git commit -m "feat: configuração deploy Render"
git push origin main
```

### **3. Deploy Automático**
- Render detecta mudanças no GitHub
- Build automático acionado
- Deploy realizado em ~5-10 minutos

### **4. Verificação**
```bash
# Testar endpoints
curl https://mestres-cafe-backend.onrender.com/api/health

# Testar frontend
curl https://mestres-cafe-frontend.onrender.com
```

---

## 📊 **Monitoramento**

### **Logs**
- Dashboard Render → Service → Logs
- Logs em tempo real
- Histórico de deploys

### **Métricas**
- CPU e memória usage
- Requests por minuto
- Response times
- Uptime

### **Alertas**
- Deploy failures
- Service down
- High error rates

---

## 🐛 **Troubleshooting**

### **Problemas Comuns**

#### **Build Falha**
```bash
# Verificar logs do build
# Comum: dependências faltando

# Solução: Ajustar package.json
npm install
npm run build
```

#### **Backend Não Inicia**
```bash
# Verificar variáveis de ambiente
# Verificar PORT=10000
# Verificar start command
```

#### **Frontend Não Carrega**
```bash
# Verificar VITE_API_URL
# Verificar build output em /dist
# Verificar redirects SPA
```

#### **Banco Não Conecta**
```bash
# Verificar DATABASE_URL
# Verificar SSL config
# Verificar network policies
```

---

## 💰 **Custos (Free Tier)**

### **Incluído Gratuitamente**
- ✅ Frontend estático: Ilimitado
- ✅ Backend: 750 horas/mês
- ✅ PostgreSQL: 256MB storage
- ✅ SSL certificates
- ✅ CDN global
- ✅ Monitoring básico

### **Limites Free Tier**
- Backend dorme após 15min inatividade
- 256MB RAM para backend
- 256MB storage database
- 100GB bandwidth/mês

---

## 🔄 **CI/CD Automático**

### **Configuração Atual**
```yaml
# Trigger: Push para main
# Build: Automático
# Deploy: Automático
# Rollback: Manual no dashboard
```

### **Workflow**
1. ✅ Push para GitHub
2. ✅ Webhook para Render
3. ✅ Build frontend + backend
4. ✅ Deploy automático
5. ✅ Health check
6. ✅ Notificação status

---

## 📞 **Suporte**

### **Recursos Render**
- 📚 [Documentação](https://render.com/docs)
- 💬 [Community](https://community.render.com)
- 📧 [Support](https://render.com/support)

### **Projeto**
- **Cliente**: Daniel do Nascimento
- **WhatsApp**: (55) 99645-8600
- **GitHub**: https://github.com/KallebyX/v0-mestres.git

---

## ✅ **Checklist de Deploy**

### **Pré-Deploy**
- [ ] Todos os testes passando (200/200)
- [ ] Build local funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Repositório GitHub atualizado

### **Deploy**
- [ ] Render.yaml configurado
- [ ] Frontend deployado
- [ ] Backend deployado
- [ ] Banco conectado
- [ ] URLs funcionando

### **Pós-Deploy**
- [ ] Health checks OK
- [ ] Endpoints testados
- [ ] Frontend carregando
- [ ] WhatsApp bot funcionando
- [ ] Monitoramento ativo

---

**🎉 Deploy realizado com sucesso!**  
**Mestres do Café online e funcionando!** ☕🚀 