# Build de Produção - Mestres do Café Frontend

Este documento detalha o processo de build e deploy do frontend React + Vite para produção.

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

## 🚀 Build para Produção

### Comando Rápido
```bash
cd apps/web
npm run build:production
```

### Script Automatizado
```bash
cd apps/web
./scripts/build.sh
```

### Build Manual (passo a passo)
```bash
# 1. Navegar para o diretório
cd apps/web

# 2. Instalar dependências
npm install

# 3. Limpar build anterior
npm run clean

# 4. Verificar lint
npm run lint

# 5. Verificar tipos
npm run type-check

# 6. Build de produção
npm run build:production
```

## 📁 Estrutura do Build

Após o build, a estrutura do diretório `dist/` será:

```
dist/
├── index.html              # HTML principal otimizado
├── _redirects              # Configuração de redirects para SPA
├── robots.txt              # SEO - Instruções para crawlers
├── sitemap.xml             # SEO - Mapa do site
├── health.json             # Health check endpoint
├── logo-para-fundo-branco.png
├── logo-para-fundo-escuro.png
└── assets/
    ├── css/
    │   └── index-[hash].css    # Estilos compilados e minificados
    ├── js/
    │   ├── vendor-[hash].js    # Bibliotecas principais (React, etc.)
    │   ├── router-[hash].js    # React Router
    │   ├── ui-[hash].js        # Componentes UI
    │   ├── forms-[hash].js     # Formulários
    │   ├── utils-[hash].js     # Utilitários
    │   ├── charts-[hash].js    # Gráficos e PDF
    │   ├── query-[hash].js     # React Query
    │   └── index-[hash].js     # Código principal da aplicação
    ├── images/
    │   └── [otimizadas]        # Imagens otimizadas
    └── fonts/
        └── [fonte-files]       # Fontes
```

## ⚙️ Configurações de Build

### Variáveis de Ambiente

O build usa as seguintes variáveis de ambiente (`.env.production`):

```env
NODE_ENV=production
VITE_API_URL=https://api.mestresdocafe.com.br/api
VITE_APP_NAME=Mestres do Café
VITE_APP_VERSION=1.0.0
# ... outras variáveis
```

### Otimizações Implementadas

1. **Code Splitting**: Divisão inteligente em chunks
2. **Minificação**: JavaScript e CSS minificados
3. **Tree Shaking**: Remoção de código morto
4. **Asset Optimization**: Imagens e fontes otimizadas
5. **Caching**: Headers de cache configurados
6. **Compression**: Gzip habilitado
7. **Security Headers**: Headers de segurança configurados

### Chunks Gerados

- `vendor.js`: React, React DOM
- `router.js`: React Router DOM
- `ui.js`: Componentes Radix UI, Lucide React
- `forms.js`: React Hook Form, Zod
- `utils.js`: Axios, date-fns, utilitários
- `charts.js`: Recharts, jsPDF
- `query.js`: TanStack React Query

## 🧪 Testes do Build

### Teste Local
```bash
# Após o build
cd apps/web
npm run serve:production

# Ou usando serve diretamente
serve dist -s -l 3000
```

### Verificações Automáticas

O script de build verifica automaticamente:
- ✅ Estrutura de arquivos
- ✅ Tamanho dos bundles
- ✅ Integridade dos assets
- ✅ Referências quebradas
- ✅ Headers de segurança

## 📊 Performance

### Métricas Alvo

- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Time to Interactive**: < 4s
- **Bundle Size**: < 2MB total

### Análise de Bundle

```bash
npm run build:analyze
```

## 🚀 Deploy

### Deploy Manual

1. Build de produção:
```bash
npm run build:production
```

2. Upload dos arquivos `dist/` para o servidor

3. Configurar servidor web para SPA (ver nginx.conf)

### Deploy Automático (CI/CD)

O projeto possui workflows configurados em `.github/workflows/` para deploy automático.

### Serviços de Deploy Suportados

- **Vercel**: Deploy direto via Git
- **Netlify**: Suporte nativo a SPA
- **AWS S3 + CloudFront**: Para alta escala
- **Render**: Deploy contínuo
- **Nginx/Apache**: Deploy tradicional

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de memória durante build**
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build:production
```

2. **Assets não carregam**
- Verificar configuração de `base` no vite.config.js
- Verificar paths absolutos vs relativos

3. **Rotas 404 em produção**
- Verificar configuração de fallback no servidor web
- Verificar arquivo `_redirects`

4. **Variáveis de ambiente não funcionam**
- Verificar prefixo `VITE_` nas variáveis
- Verificar arquivo `.env.production`

### Logs e Debug

```bash
# Build com logs verbosos
DEBUG=vite:* npm run build:production

# Análise detalhada
npm run build:analyze
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                    # Servidor de desenvolvimento
npm run preview               # Preview do build local

# Build
npm run build                 # Build padrão
npm run build:production      # Build otimizado para produção
npm run build:staging         # Build para staging
npm run build:analyze         # Build com análise de bundle

# Serve
npm run serve                 # Serve simples
npm run serve:production      # Serve com configurações de produção

# Limpeza
npm run clean                 # Limpar dist/
npm run clean:cache          # Limpar cache do Vite
npm run clean:all            # Limpar tudo

# Verificações
npm run lint                  # ESLint
npm run type-check           # TypeScript
npm run test                 # Testes
npm run check               # Todas as verificações
```

## 🔒 Segurança

### Headers Configurados

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy`: Configurado para o domínio

### Validações

- Todas as entradas são validadas com Zod
- HTTPS obrigatório em produção
- Headers CORS configurados
- Rate limiting no backend

## 📚 Recursos Adicionais

- [Documentação do Vite](https://vitejs.dev/guide/)
- [Guia de Deploy](../docs/deployment.md)
- [Arquitetura do Sistema](../docs/architecture.md)
- [FAQ](../docs/faq.md)

---

Para suporte técnico: dev@mestresdocafe.com.br