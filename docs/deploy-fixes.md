# 🚨 Deploy Fixes - Mestres do Café

## ✅ Correções Implementadas

### 1. **Especificação de Versão Node.js**
- **Arquivo**: `.nvmrc`
- **Correção**: Adicionado versão Node.js 18.19.0
- **Impacto**: Render agora sabe qual versão usar

### 2. **Configuração SPA Routing**
- **Arquivo**: `apps/web/serve.json`
- **Correção**: Configurado rewrites para SPA
- **Impacto**: Todas as rotas agora redirecionam para index.html

### 3. **Atualização do render.yaml**
- **Correções**:
  - Frontend usa `serve` com configuração correta
  - Adicionada variável NODE_VERSION
  - Comando atualizado para usar serve.json

### 4. **Script de Teste Local**
- **Arquivo**: `scripts/test_production_build.sh`
- **Função**: Testar build de produção localmente antes do deploy

## 📋 Checklist de Deploy

### Pré-deploy:
- [ ] Executar `./scripts/test_production_build.sh`
- [ ] Verificar se build completa sem erros
- [ ] Testar aplicação em http://localhost:4000
- [ ] Verificar rotas SPA funcionando
- [ ] Testar conexão com API

### Deploy:
1. **Commit das mudanças**:
   ```bash
   git add .
   git commit -m "fix: corrigir deploy de produção no Render"
   git push origin main
   ```

2. **No Dashboard do Render**:
   - Verificar logs de build do frontend
   - Verificar logs de build do backend
   - Aguardar deploy completo

3. **Pós-deploy**:
   - [ ] Acessar https://mestres-cafe-web.onrender.com
   - [ ] Verificar se homepage carrega
   - [ ] Testar navegação entre páginas
   - [ ] Verificar console do navegador por erros
   - [ ] Testar chamada à API em /api/health

## 🔧 Configurações de Ambiente

### Frontend (mestres-cafe-web):
```yaml
Variáveis de Ambiente:
- NODE_ENV: production
- VITE_API_URL: https://mestres-cafe-api.onrender.com
- PORT: 10000
- NODE_VERSION: 18.19.0
```

### Backend (mestres-cafe-api):
```yaml
Variáveis de Ambiente:
- FLASK_ENV: production
- SECRET_KEY: (gerado automaticamente)
- JWT_SECRET_KEY: (gerado automaticamente)
- DATABASE_URL: (do banco PostgreSQL)
- CORS_ORIGINS: https://mestres-cafe-web.onrender.com
```

## 🐛 Troubleshooting

### Problema: "Not Found" em todas as rotas
**Solução**: Verificar se serve.json está sendo usado corretamente

### Problema: Erro de CORS
**Solução**: Verificar CORS_ORIGINS no backend inclui URL do frontend

### Problema: Build falha
**Solução**: 
1. Verificar versão do Node.js
2. Limpar cache: `rm -rf node_modules package-lock.json`
3. Reinstalar: `npm install`

### Problema: API não responde
**Solução**:
1. Verificar health check: https://mestres-cafe-api.onrender.com/api/health
2. Verificar logs do backend no Render
3. Verificar DATABASE_URL está configurada

## 📊 Monitoramento

### URLs de Verificação:
- Frontend: https://mestres-cafe-web.onrender.com
- API Health: https://mestres-cafe-api.onrender.com/api/health
- API Info: https://mestres-cafe-api.onrender.com/api/info

### Logs:
- Frontend: Dashboard Render > mestres-cafe-web > Logs
- Backend: Dashboard Render > mestres-cafe-api > Logs

## 🚀 Próximos Passos

1. **Implementar CI/CD**: GitHub Actions para deploy automático
2. **Adicionar Testes**: E2E para verificar deploy
3. **Monitoramento**: Configurar alertas de uptime
4. **Performance**: Implementar CDN para assets
5. **Segurança**: Configurar rate limiting e WAF

## 📝 Notas Importantes

- Render Free Tier pode ter cold starts (demora inicial)
- Banco PostgreSQL free tem limite de 1GB
- Serviços free dormem após 15 minutos de inatividade
- Considerar upgrade para plano pago em produção real

---

**Última atualização**: 07/07/2025
**Status**: ✅ Correções aplicadas, aguardando deploy