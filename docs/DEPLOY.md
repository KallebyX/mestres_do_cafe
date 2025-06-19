# 🚀 Guia de Deploy - Mestres do Café

## 📋 Pré-requisitos

- Node.js 18+ 
- npm 9+
- Git
- Conta em plataforma de deploy (Vercel, Netlify, Railway)

## 🏗️ Build de Produção

### 1. Preparação Local
```bash
# Instalar dependências
npm run setup

# Validar projeto completo
npm run validate

# Build otimizado para produção
npm run build:prod
```

### 2. Verificação Local
```bash
# Testar build localmente
npm run deploy:check

# Acessar: http://localhost:4173
```

## ☁️ Deploy Frontend (Vercel/Netlify)

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurações automáticas:
# - Build Command: npm run build
# - Output Directory: dist
# - Install Command: npm install
```

### Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Ou via interface web conectando ao GitHub
```

### Configurações de Build
```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

## 🔧 Deploy Backend (Railway/Heroku)

### Railway
```bash
# Conectar ao Railway
railway login
railway link

# Deploy backend
cd server
railway up
```

### Variáveis de Ambiente
```env
# Frontend (.env)
VITE_API_BASE_URL=https://sua-api.railway.app

# Backend (Railway/Heroku)
NODE_ENV=production
PORT=5000
JWT_SECRET=sua-chave-super-secreta-aqui
JWT_EXPIRES_IN=15m
CORS_ORIGIN=https://seu-frontend.vercel.app
```

## 📁 Estrutura de Deploy

```
mestres-do-cafe-frontend/
├── 📦 Frontend (Vite/React)
│   ├── dist/                 # Build artifacts
│   ├── src/                  # Source code
│   └── package.json          # Frontend deps
│
├── 🔧 Backend (Node.js/Express)
│   ├── server/
│   │   ├── server.js         # Main server
│   │   ├── routes/           # API routes
│   │   └── package.json      # Backend deps
│   
└── 📚 Documentation
    ├── docs/
    └── README.md
```

## 🔄 Pipeline CI/CD

### GitHub Actions (.github/workflows/deploy.yml)
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm run setup
      - run: npm run validate

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🛠️ Scripts de Deploy

```bash
# Build completo com validação
npm run build:prod

# Deploy apenas frontend
npm run deploy:frontend

# Verificar build antes do deploy
npm run deploy:check

# Limpar cache de build
npm run clean

# Reset completo do projeto
npm run reset
```

## 🔍 Verificações Pós-Deploy

### Frontend
- [ ] Página inicial carrega corretamente
- [ ] Rotas funcionam (SPA routing)
- [ ] Autenticação funciona
- [ ] API calls conectam ao backend
- [ ] Responsividade mobile
- [ ] Performance (Lighthouse > 90)

### Backend
- [ ] Health check: `/api/health`
- [ ] CORS configurado para frontend
- [ ] Variáveis de ambiente corretas
- [ ] Database/storage funcional
- [ ] Rate limiting ativo

## 🐛 Troubleshooting

### Erro 404 em rotas SPA
```bash
# Vercel - vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}

# Netlify - _redirects
/*    /index.html   200
```

### CORS Issues
```javascript
// server/server.js
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}
```

### Environment Variables
```bash
# Verificar variáveis no build
echo $VITE_API_BASE_URL

# Runtime check
console.log(import.meta.env.VITE_API_BASE_URL)
```

## 📊 Monitoramento

### Performance
- Vercel Analytics
- Google Lighthouse
- Web Vitals

### Logs
```bash
# Vercel
vercel logs

# Railway
railway logs

# Netlify
netlify logs
```

## 🔐 Segurança

### Headers de Segurança
```javascript
// server/server.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}))
```

### SSL/HTTPS
- Vercel/Netlify: SSL automático
- Railway: SSL incluído
- Custom domain: Certificado Let's Encrypt

## 📈 Otimizações

### Bundle Size
```bash
# Analisar bundle
npm run build -- --analyze

# Lazy loading de rotas
const LazyComponent = lazy(() => import('./Component'))
```

### Caching
```javascript
// Service Worker (opcional)
// Cache API calls e assets estáticos
```

---

## 🎯 Checklist de Deploy

- [ ] Testes passando (frontend + backend)
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado
- [ ] SSL ativo
- [ ] Domínio personalizado (opcional)
- [ ] Monitoramento ativo
- [ ] Backup de dados

**🎉 Deploy Concluído!**

Acesse sua aplicação em: https://seu-dominio.com 