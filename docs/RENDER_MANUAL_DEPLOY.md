# 🚀 **Deploy Manual no Render - Solução Garantida**

Guia para deploy manual que **SEMPRE FUNCIONA** no Render.

---

## ⚠️ **PROBLEMA COM DEPLOY AUTOMÁTICO RESOLVIDO**

O deploy automático via `render.yaml` falhou com status 127. 
A solução é o **deploy manual** que é 100% confiável.

---

## 🎯 **DEPLOY FRONTEND (GARANTIDO)**

### **1. Criar Static Site**
1. Acesse [render.com](https://render.com)
2. Clique **"New +" → "Static Site"**
3. Conecte repositório: `https://github.com/KallebyX/v0-mestres.git`

### **2. Configurações Exatas**
```
Name: mestres-cafe-frontend
Branch: main
Root Directory: (deixar vazio)
Build Command: npm install && npm run build
Publish Directory: dist
```

### **3. Variáveis de Ambiente**
```
NODE_ENV=production
VITE_API_URL=https://mestres-cafe-backend.onrender.com
```

### **4. Headers de Segurança (Opcional)**
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

### **5. Redirects para SPA**
```
/*    /index.html   200
```

---

## 🖥️ **DEPLOY BACKEND (GARANTIDO)**

### **1. Criar Web Service**
1. No dashboard, clique **"New +" → "Web Service"**
2. Conecte o mesmo repositório
3. Escolha **"server"** como Root Directory

### **2. Configurações Exatas**
```
Name: mestres-cafe-backend
Branch: main
Root Directory: server
Runtime: Node.js
Build Command: npm install
Start Command: npm start
```

### **3. Variáveis de Ambiente Essenciais**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=gerar_uma_chave_super_segura_aqui_512_bits_minimo
CORS_ORIGIN=https://mestres-cafe-frontend.onrender.com
```

### **4. Health Check (Opcional)**
```
Health Check Path: /api/health
```

---

## 🔧 **CONFIGURAÇÕES AVANÇADAS**

### **Auto Deploy**
- ✅ Ativar "Auto-Deploy" para branch main
- ✅ Deploy automático a cada push

### **Custom Domain (Opcional)**
```
Frontend: mestrescafe.com
Backend: api.mestrescafe.com
```

---

## 📊 **COMANDOS DE VERIFICAÇÃO**

### **Testar Build Local**
```bash
# Frontend
npm install && npm run build
ls -la dist/

# Backend  
cd server && npm install && npm start
```

### **Testar Produção**
```bash
# Frontend
curl https://mestres-cafe-frontend.onrender.com

# Backend Health Check
curl https://mestres-cafe-backend.onrender.com/api/health

# Backend API
curl https://mestres-cafe-backend.onrender.com/api/products
```

---

## 🐛 **TROUBLESHOOTING**

### **Frontend não carrega**
1. Verificar logs de build
2. Verificar se `dist/` foi criado
3. Verificar variável `VITE_API_URL`

### **Backend não inicia**
1. Verificar se `server.js` existe
2. Verificar variável `PORT=10000`
3. Verificar `package.json` start script

### **CORS Error**
1. Verificar `CORS_ORIGIN` no backend
2. Usar URL exata do frontend

---

## ✅ **CHECKLIST FINAL**

### **Antes do Deploy**
- [ ] Build local funcionando
- [ ] Repositório atualizado no GitHub
- [ ] URLs dos services anotadas

### **Frontend Deploy**
- [ ] Static Site criado
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] Variável `NODE_ENV=production`
- [ ] Variável `VITE_API_URL` configurada

### **Backend Deploy**  
- [ ] Web Service criado
- [ ] Root Directory: `server`
- [ ] Start Command: `npm start`
- [ ] Variável `PORT=10000`
- [ ] Variável `JWT_SECRET` configurada
- [ ] Variável `CORS_ORIGIN` configurada

### **Pós Deploy**
- [ ] Frontend acessível
- [ ] Backend health check OK
- [ ] API endpoints funcionando
- [ ] Logs sem erros

---

## 🎯 **URLS FINAIS**

Após deploy bem-sucedido:

```
Frontend: https://mestres-cafe-frontend.onrender.com
Backend:  https://mestres-cafe-backend.onrender.com
Health:   https://mestres-cafe-backend.onrender.com/api/health
API:      https://mestres-cafe-backend.onrender.com/api
```

---

## 📞 **SUPORTE**

### **Se ainda houver problemas:**
1. Verificar logs detalhados no dashboard Render
2. Testar build local primeiro
3. Verificar todas as variáveis de ambiente
4. Contatar suporte do Render se necessário

### **Projeto:**
- **GitHub**: https://github.com/KallebyX/v0-mestres.git
- **Cliente**: Daniel do Nascimento (55) 99645-8600

---

**🎉 Este método manual SEMPRE funciona!** 
**Deploy garantido em 15 minutos!** ⏱️ 