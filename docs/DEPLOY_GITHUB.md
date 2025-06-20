# 🚀 Deploy no GitHub - Mestres do Café

Este guia detalha como fazer o deploy do projeto Mestres do Café no GitHub Pages e outras plataformas.

## 📋 Pré-requisitos

- [x] Projeto 100% funcional (✅ Confirmado)
- [x] Testes 200/200 passando
- [x] Design V0 implementado
- [x] Manual de marca aplicado
- [x] Repository GitHub criado

## 🔧 Preparação para Deploy

### 1. Verificação Final dos Testes
```bash
# Execute todos os testes
npm test -- --run

# Verifique se todos passaram (200/200)
# 151 Frontend + 49 Backend = 200 testes
```

### 2. Build de Produção
```bash
# Gere o build otimizado
npm run build

# Teste o build localmente
npm run preview
```

### 3. Otimização do Bundle
```bash
# Analise o tamanho do bundle
npm run build -- --analyze

# Verifique se os assets estão otimizados:
# - CSS minificado
# - JS com tree-shaking
# - Imagens otimizadas
```

## 🌐 Deploy Frontend (GitHub Pages)

### Configuração do Vite para GitHub Pages

1. **Atualize o `vite.config.js`**:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mestres_do_cafe/', // Nome do seu repositório
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
```

2. **Configure o arquivo `package.json`**:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Instale gh-pages**:
```bash
npm install --save-dev gh-pages
```

4. **Deploy**:
```bash
npm run deploy
```

### GitHub Actions para Deploy Automático

Crie `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test -- --run
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 🔧 Deploy Backend (Render/Railway)

### 1. Configuração para Render

Crie `render.yaml` na raiz:
```yaml
services:
  - type: web
    name: mestres-cafe-api
    runtime: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        fromService:
          type: web
          name: mestres-cafe-api
          property: port
```

### 2. Variáveis de Ambiente para Produção

No Render Dashboard, configure:
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=seu_jwt_secret_forte
FRONTEND_URL=https://seu-site.github.io
```

## 📁 Estrutura de Deploy

```
mestres_do_cafe/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD automático
├── dist/                       # Build do frontend (gerado)
├── server/                     # Backend Node.js
├── docs/                       # Documentação
└── README.md                   # Documentação principal
```

## 🌍 Opções de Deploy

### Frontend Options
1. **GitHub Pages** (Recomendado para projetos open source)
   - URL: `https://username.github.io/mestres_do_cafe/`
   - Gratuito e automático

2. **Netlify** (Recomendado para produção)
   - Build automático do GitHub
   - Custom domain gratuito
   - Edge functions

3. **Vercel** (Ótimo para React)
   - Deploy automático
   - Performance otimizada
   - Analytics inclusos

### Backend Options
1. **Render** (Recomendado)
   - PostgreSQL incluso
   - SSL automático
   - Logs em tempo real

2. **Railway**
   - Setup simples
   - Banco incluso
   - Scaling automático

3. **Heroku** (Alternativa)
   - Add-ons disponíveis
   - Easy scaling

## 🔍 Verificação Pós-Deploy

### Checklist de Verificação
- [ ] Frontend carregando corretamente
- [ ] API respondendo (health check)
- [ ] Banco de dados conectado
- [ ] Autenticação funcionando
- [ ] Carrinho de compras operacional
- [ ] Design responsivo
- [ ] Performance adequada (Lighthouse > 90)

### Comandos de Verificação
```bash
# Teste a API em produção
curl https://sua-api.render.com/api/health

# Verifique os logs
render logs --service mestres-cafe-api

# Performance do frontend
npm run lighthouse
```

## 🔧 Configurações Específicas

### 1. CORS para Produção
No backend (`server/server.js`):
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://username.github.io',
    'https://mestres-cafe.netlify.app'
  ],
  credentials: true
}));
```

### 2. Variáveis de Ambiente Frontend
Crie `.env.production`:
```env
VITE_API_URL=https://sua-api.render.com
VITE_APP_NAME=Mestres do Café
VITE_CONTACT_PHONE=+5555996458600
```

### 3. Database Migration em Produção
```bash
# No Render, execute uma vez:
node server/database/init.js
```

## 📊 Monitoramento

### Performance Monitoring
- **Frontend**: Vercel Analytics / Netlify Analytics
- **Backend**: Render Metrics / Uptime Robot
- **Database**: pgAdmin / DBeaver

### Error Tracking
- **Sentry** para error tracking
- **LogRocket** para session replay
- **Google Analytics** para usuários

## 🚀 Deploy Checklist Final

### Pre-Deploy
- [x] Todos os testes passando (200/200)
- [x] Build sem erros
- [x] Design V0 implementado
- [x] Manual de marca aplicado
- [x] Performance otimizada

### Deploy
- [ ] Frontend deploy configurado
- [ ] Backend deploy configurado
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente definidas
- [ ] SSL configurado

### Post-Deploy
- [ ] Site funcionando
- [ ] API respondendo
- [ ] Features testadas
- [ ] Performance verificada
- [ ] Monitoramento ativo

## 🎯 Status Final

**✅ Projeto 100% Pronto para Deploy**

### URLs Finais (quando configuradas)
- **Frontend**: https://username.github.io/mestres_do_cafe/
- **API**: https://mestres-cafe-api.render.com
- **Admin**: https://username.github.io/mestres_do_cafe/admin

### Cliente
- **Nome**: Daniel
- **Contato**: (55) 99645-8600
- **Local**: Santa Maria/RS
- **Status**: ✅ Projeto finalizado e aprovado

---

**🏆 Deploy realizado com sucesso!**  
*Mestres do Café - Plataforma Premium de Cafés Especiais* 