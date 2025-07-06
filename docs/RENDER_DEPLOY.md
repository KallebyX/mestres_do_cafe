# 🚀 Deploy no Render - Mestres do Café

Este guia detalha como fazer o deploy do projeto **Mestres do Café Enterprise** no [Render](https://render.com).

## 📋 Pré-requisitos

- Conta no GitHub com o repositório: `https://github.com/KallebyX/mestres_do_cafe`
- Conta gratuita no Render: [render.com](https://render.com)
- Projeto commitado e enviado para o GitHub

## 🏗️ Arquitetura no Render

O projeto será deployado com 3 serviços:

1. **Backend API** (Flask Python) - `mestres-cafe-api`
2. **Frontend Web** (React Vite) - `mestres-cafe-web`
3. **Database** (PostgreSQL) - `mestres-cafe-db`

## 🔧 Configuração Automática

O projeto inclui um arquivo `render.yaml` que configura automaticamente todos os serviços:

```yaml
services:
  - type: web
    name: mestres-cafe-api
    runtime: python
    # ... configurações do backend

  - type: web
    name: mestres-cafe-web
    runtime: node
    # ... configurações do frontend

databases:
  - name: mestres-cafe-db
    # ... configurações do banco
```

## 🚀 Passos para Deploy

### 1. Preparação Local

Execute o script de preparação:

```bash
# Na raiz do projeto
./scripts/render-deploy.sh
```

### 2. Commit e Push

```bash
git add .
git commit -m "feat: configuração para deploy no Render"
git push origin main
```

### 3. Configuração no Render

1. **Acesse** [render.com](https://render.com) e faça login
2. **Conecte** sua conta GitHub
3. **Selecione** o repositório `mestres_do_cafe`
4. **Escolha** "Blueprint" quando perguntado sobre o tipo de deploy
5. O Render detectará automaticamente o `render.yaml`

### 4. Variáveis de Ambiente

Configure as seguintes variáveis no dashboard do Render:

#### Backend (mestres-cafe-api)

```
FLASK_ENV=production
SECRET_KEY=<gerar-chave-segura>
JWT_SECRET_KEY=<gerar-jwt-segura>
DATABASE_URL=<auto-conectado-pelo-render>
PORT=10000
```

#### Frontend (mestres-cafe-web)

```
NODE_ENV=production
VITE_API_URL=https://mestres-cafe-api.onrender.com
PORT=10000
```

## 🌐 URLs Resultantes

Após o deploy bem-sucedido:

- **API Backend**: `https://mestres-cafe-api.onrender.com`
- **Frontend**: `https://mestres-cafe-web.onrender.com`
- **Health Check**: `https://mestres-cafe-api.onrender.com/api/health`

## 🔍 Monitoramento

### Health Checks

O backend inclui endpoints para monitoramento:

```bash
# Status da API
curl https://mestres-cafe-api.onrender.com/api/health

# Informações da API
curl https://mestres-cafe-api.onrender.com/api/info
```

### Logs no Render

1. Acesse o dashboard do Render
2. Selecione o serviço desejado
3. Vá para a aba "Logs" para visualizar logs em tempo real

## ⚠️ Limitações do Plano Gratuito

- **Sleep após inatividade**: Apps dormem após 15 minutos sem uso
- **Cold Start**: Primeiro acesso pode ser lento (até 30 segundos)
- **Horas mensais**: 750 horas gratuitas por mês
- **Database**: 1GB de armazenamento PostgreSQL gratuito

## 🐛 Troubleshooting

### Erro de Build no Backend

```bash
# Verificar requirements.txt
cd apps/api
pip install -r requirements.txt
```

### Erro de Build no Frontend

```bash
# Verificar dependências
cd apps/web
npm ci
npm run build
```

### Erro "vite: not found"

Se você encontrar o erro `sh: 1: vite: not found`, isso significa que o Vite não está disponível durante o build. Para resolver:

1. **Verificar dependências**: O Vite deve estar em `dependencies`, não apenas em `devDependencies`
2. **Usar script personalizado**: O projeto inclui `scripts/render-build.sh` que resolve automaticamente
3. **Versão do Node.js**: Arquivo `.nvmrc` e `.node-version` especificam Node.js 18

### Build com Script Personalizado

O projeto usa `scripts/render-build.sh` que:

- Instala dependências com `--include=dev`
- Verifica se o Vite está disponível
- Instala Vite globalmente se necessário
- Executa o build com logs detalhados
- Verifica se o diretório `dist` foi criado

### Erro "Could not resolve '../lib/api.js'"

Se você encontrar erro de resolução de imports durante o build:

**Problema**: Vite/Rollup não consegue resolver imports com extensão `.js`
**Solução**: Use o script `scripts/fix-imports.sh` que remove extensões automaticamente

```bash
# Corrigir imports automaticamente
./scripts/fix-imports.sh

# O script converte:
# import { api } from "../lib/api.js"  ➜  import { api } from "../lib/api"
```

### Imports Corretos para Vite

**❌ Incorreto (com extensão)**:

```javascript
import { authAPI } from '../lib/api.js';
import { cartAPI } from '../services/cart.js';
```

**✅ Correto (sem extensão)**:

```javascript
import { authAPI } from '../lib/api';
import { cartAPI } from '../services/cart';
```

### Problemas de CORS

Verifique se a URL do frontend está configurada corretamente no backend:

```python
# apps/api/src/app.py
CORS(app, origins=[
    "https://mestres-cafe-web.onrender.com",
    "http://localhost:3000"  # para desenvolvimento
])
```

### Database Connection

O Render conecta automaticamente o database via `DATABASE_URL`. Verifique se:

1. O serviço de database está rodando
2. A variável `DATABASE_URL` está configurada
3. As migrations foram executadas

## 🔄 Deploy Automático

Configurado para deploy automático via GitHub:

- **Trigger**: Push para branch `main`
- **Backend**: Detecta mudanças em `apps/api/`
- **Frontend**: Detecta mudanças em `apps/web/`

## 📊 Estrutura de Arquivos

```
projeto/
├── render.yaml              # Configuração principal do Render
├── render.env.example       # Exemplo de variáveis
├── scripts/
│   └── render-deploy.sh     # Script de preparação
├── apps/
│   ├── api/                 # Backend Flask
│   │   ├── requirements.txt
│   │   └── src/app.py
│   └── web/                 # Frontend React
│       ├── package.json
│       └── src/
└── docs/
    └── RENDER_DEPLOY.md     # Este arquivo
```

## 🆘 Suporte

- **Documentação Render**: [render.com/docs](https://render.com/docs)
- **Status do Render**: [status.render.com](https://status.render.com)
- **Comunidade**: [community.render.com](https://community.render.com)

## ✅ Checklist de Deploy

- [ ] Código commitado no GitHub
- [ ] `render.yaml` configurado
- [ ] Variáveis de ambiente definidas
- [ ] Script de deploy executado
- [ ] Services criados no Render
- [ ] Health checks funcionando
- [ ] URLs acessíveis
- [ ] CORS configurado corretamente
- [ ] Database conectado

---

**🎉 Deploy concluído com sucesso!**

Acesse `https://mestres-cafe-web.onrender.com` para ver sua aplicação rodando!
