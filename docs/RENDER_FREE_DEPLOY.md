# 🆓 **Deploy Unificado Render (Plano Free) - SOLUÇÃO FINAL**

Deploy do frontend + backend em **um único serviço** no plano free do Render.

---

## 🎯 **SOLUÇÃO PARA O ERRO "vite: not found"**

### ✅ **PROBLEMAS RESOLVIDOS:**
- ❌ `sh: 1: vite: not found` → ✅ Vite movido para dependencies
- ❌ Deploy separado (caro) → ✅ Servidor unificado (free)
- ❌ Configuração complexa → ✅ Um serviço só

---

## 🚀 **DEPLOY UNIFICADO (GARANTIDO)**

### **1. Configuração Única no Render**
```
Service Type: Web Service
Name: mestres-cafe-unified
Repository: https://github.com/KallebyX/v0-mestres.git
Branch: main

Build Command: npm install && npm run build
Start Command: npm start

Environment Variables:
NODE_ENV=production
PORT=10000
JWT_SECRET=sua_chave_jwt_super_segura_512_bits
```

### **2. Como Funciona**
```
🔄 Build Process:
1. npm install (instala TODAS as dependências)
2. npm run build (Vite gera /dist)
3. npm start (unified-server.js inicia)

🌐 Servidor Unificado:
- Frontend React: / (SPA)
- Backend API: /api/*
- Health Check: /health
- Tudo em uma porta: 10000
```

---

## 📋 **PASSO A PASSO DETALHADO**

### **1. Acesse render.com**
1. Fazer login no Render
2. Clique "New +" → "Web Service"

### **2. Conecte o Repositório**
```
GitHub Repository: https://github.com/KallebyX/v0-mestres.git
Branch: main
Root Directory: (deixar vazio)
```

### **3. Configurações Exatas**
```
Name: mestres-cafe-unified
Runtime: Node.js
Region: Oregon (ou mais próximo)

Build Command: npm install && npm run build
Start Command: npm start

Auto-Deploy: Yes (para deploy automático)
```

### **4. Variáveis de Ambiente**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=gerar_chave_segura_aqui_minimo_32_caracteres
```

### **5. Deploy e Teste**
```
Deploy iniciará automaticamente
URLs geradas:
- Frontend: https://mestres-cafe-unified.onrender.com
- API: https://mestres-cafe-unified.onrender.com/api
- Health: https://mestres-cafe-unified.onrender.com/health
```

---

## 🔧 **ARQUITETURA DO SERVIDOR UNIFICADO**

```
unified-server.js
├── 📁 Frontend (/) 
│   ├── Serve arquivos estáticos de /dist
│   ├── React SPA routes (*, /sobre, /produtos)
│   └── index.html para todas as rotas SPA
│
├── 🔌 Backend API (/api)
│   ├── GET  /api/health
│   ├── GET  /api/products
│   ├── GET  /api/products/featured
│   ├── POST /api/auth/login
│   └── Outras rotas da API
│
└── ❤️ Health Checks
    ├── GET  /health (unificado)
    └── GET  /api/health (API)
```

---

## 📊 **ENDPOINTS DISPONÍVEIS**

### **Frontend**
```
https://mestres-cafe-unified.onrender.com/
https://mestres-cafe-unified.onrender.com/marketplace
https://mestres-cafe-unified.onrender.com/sobre
https://mestres-cafe-unified.onrender.com/login
```

### **Backend API**
```
GET  /api/health
GET  /api/products
GET  /api/products/featured
GET  /api/products/:id
POST /api/auth/login
```

### **Health Checks**
```
GET  /health (status unificado)
GET  /api/health (status da API)
```

---

## ✅ **ARQUIVOS CONFIGURADOS**

### **package.json**
```json
{
  "scripts": {
    "build": "vite build",
    "start": "node unified-server.js"
  },
  "dependencies": {
    "vite": "^6.0.1",
    "express": "^4.19.2",
    "cors": "^2.8.5"
  }
}
```

### **unified-server.js**
```javascript
// Servidor que serve frontend + backend
// Frontend: arquivos estáticos de /dist
// Backend: rotas /api/*
// SPA: todas as rotas → index.html
```

### **render.yaml**
```yaml
services:
  - type: web
    name: mestres-cafe-unified
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

---

## 🐛 **TROUBLESHOOTING**

### **Build Falha**
```bash
# Verificar se vite está em dependencies
npm list vite

# Se não estiver, reinstalar
npm install
```

### **Servidor Não Inicia**
```bash
# Verificar se dist/ foi criado
ls -la dist/

# Verificar PORT
echo $PORT
```

### **Frontend Não Carrega**
```bash
# Verificar se index.html existe
ls -la dist/index.html

# Verificar logs no Render
```

### **API Não Funciona**
```bash
# Testar health check
curl https://mestres-cafe-unified.onrender.com/health

# Testar API
curl https://mestres-cafe-unified.onrender.com/api/products
```

---

## 💰 **CUSTOS (PLANO FREE)**

### **Limites Free Tier**
```
✅ 1 Web Service: Grátis
✅ 750 horas/mês: Suficiente
✅ SSL automático: Incluído
✅ Deploy automático: Incluído

⚠️ Limitações:
- Dorme após 15min inatividade
- 512MB RAM máximo
- 1 GB storage
```

### **Estimativa de Uso**
```
Servidor unificado: 1 serviço
CPU: Baixo (frontend estático + API simples)
RAM: ~100-200MB
Storage: ~50MB (build + node_modules essenciais)
```

---

## 🧪 **COMANDOS DE TESTE**

### **Local**
```bash
npm run build
npm start
# Testar: http://localhost:5000
```

### **Produção**
```bash
# Frontend
curl https://mestres-cafe-unified.onrender.com

# API Health
curl https://mestres-cafe-unified.onrender.com/api/health

# API Produtos  
curl https://mestres-cafe-unified.onrender.com/api/products

# Login Demo
curl -X POST https://mestres-cafe-unified.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mestrescafe.com.br","password":"admin123"}'
```

---

## 🎉 **RESULTADO FINAL**

### ✅ **Deploy Unificado Funcionando**
- **URL Única**: `https://mestres-cafe-unified.onrender.com`
- **Frontend**: Totalmente funcional
- **Backend**: API completa
- **Custo**: R$ 0,00 (plano free)
- **Deploy**: Automático a cada push

### 📞 **Informações do Projeto**
- **Cliente**: Daniel do Nascimento (55) 99645-8600
- **GitHub**: https://github.com/KallebyX/v0-mestres.git
- **Status**: ✅ Pronto para produção

---

**🚀 DEPLOY GARANTIDO NO PLANO FREE!**  
**Uma URL, zero custo, máxima funcionalidade!** ⚡ 