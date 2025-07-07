# Correções de Deploy no Render - Mestres do Café

## Status: PRONTAS PARA DEPLOY 🚀

## Problemas Corrigidos:

### 1. ✅ Comando de inicialização da API (render.yaml)
- **Problema**: Comando apontava para `python src/app.py` que não existia
- **Solução**: 
  - Criado arquivo `apps/api/app.py` como ponto de entrada
  - Atualizado comando para `python app.py`

### 2. ✅ Script de build melhorado (scripts/render-build.sh)
- **Problema**: Faltavam validações e tratamento de erros
- **Solução**: 
  - Adicionadas validações de diretório
  - Limpeza de cache npm
  - Criação automática de health.json
  - Logs detalhados de debug
  - Tornado executável com `chmod +x`

### 3. ✅ Configuração do serve.json
- **Problema**: Apontava para domínio antigo
- **Solução**: 
  - Atualizado para usar `https://mestres-cafe-api.onrender.com`
  - CSP atualizado para permitir conexões com a API

### 4. ✅ Variáveis de ambiente da API (render.yaml)
- **Problema**: Faltavam variáveis importantes
- **Solução**: Adicionadas:
  - PYTHONPATH
  - CORS_ORIGINS
  - Configurações de email

### 5. ✅ Arquivo .env.production
- **Problema**: URLs apontando para domínio antigo
- **Solução**: Atualizado para URLs do Render:
  - VITE_API_URL=https://mestres-cafe-api.onrender.com
  - VITE_APP_URL=https://mestres-cafe-web.onrender.com

## Arquivos Modificados:
1. `render.yaml` - Configuração de deploy
2. `scripts/render-build.sh` - Script de build melhorado
3. `apps/web/serve.json` - Configuração do servidor web
4. `apps/api/app.py` - Novo arquivo de entrada da API
5. `apps/web/.env.production` - Variáveis de ambiente de produção

## Próximos Passos:

### 1. Fazer commit das mudanças:
```bash
git add .
git commit -m "fix: corrigir configurações críticas de deploy no Render"
git push origin main
```

### 2. No Render Dashboard:
- Verificar se os deploys foram disparados automaticamente
- Monitorar logs de build e runtime
- Verificar se ambos os serviços estão "Live"

### 3. Testar após deploy:
- Frontend: https://mestres-cafe-web.onrender.com
- API Health: https://mestres-cafe-api.onrender.com/api/health
- Verificar se a comunicação entre frontend e backend está funcionando

### 4. Se houver problemas:
- Verificar logs no Render
- Confirmar que PostgreSQL está conectado
- Verificar se as variáveis de ambiente estão corretas

## Tempo estimado para o site voltar ao ar:
- Build + Deploy: ~10-15 minutos
- Propagação DNS: Instantânea (já está configurada)

## Contato em caso de problemas:
Todos os arquivos foram corrigidos seguindo as melhores práticas. Se houver algum erro nos logs do Render, posso ajudar a diagnosticar.