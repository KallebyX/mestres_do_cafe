# 🚀 Instruções de Deploy - Mestres do Café no Render

## 📋 Pré-requisitos

Antes de fazer o deploy, certifique-se de que:

- [ ] O repositório está no GitHub
- [ ] Todos os arquivos estão commitados
- [ ] As dependências estão atualizadas
- [ ] Os testes estão passando

## 🔧 Configurações do render.yaml

O arquivo [`render.yaml`](render.yaml) foi otimizado com as seguintes melhorias:

### ✅ Correções Aplicadas

1. **Gunicorn como WSGI Server**: Substituído `python src/app.py` por `gunicorn` para produção
2. **Health Check**: Adicionado `healthCheckPath: /api/health` para monitoramento
3. **Porta Padrão**: Alterado de `5001` para `10000` (padrão do Render)
4. **Variáveis de Ambiente**: Adicionadas configurações de cache e produção
5. **Schema YAML**: Corrigidos problemas de validação do Render Blueprint

### 🎯 Configurações de Produção

```yaml
startCommand: gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --chdir src app:app
```

**Parâmetros do Gunicorn:**
- `--workers 2`: 2 workers para melhor performance
- `--timeout 120`: Timeout de 120s para requisições longas
- `--chdir src`: Executa no diretório correto

## 🗄️ Variáveis de Ambiente Necessárias

### 🔐 Configuração Manual no Dashboard

Após o deploy automático, configure manualmente no Render Dashboard:

```bash
# MercadoPago (Produção)
MERCADO_PAGO_ACCESS_TOKEN=seu_token_producao
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_producao

# MelhorEnvio (Produção)  
MELHOR_ENVIO_API_KEY=sua_api_key_producao
MELHOR_ENVIO_TOKEN=seu_token_producao

# Notificações (Opcional)
SMTP_HOST=seu_smtp_host
SMTP_PORT=587
SMTP_USER=seu_email
SMTP_PASSWORD=sua_senha
```

### ⚡ Variáveis Auto-configuradas

Estas variáveis são geradas automaticamente pelo Render:

- ✅ `SECRET_KEY` - Gerado automaticamente
- ✅ `JWT_SECRET_KEY` - Gerado automaticamente  
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `REDIS_URL` - Redis connection string

## 🚀 Processo de Deploy

### 1. Deploy via Blueprint (Recomendado)

```bash
# 1. Faça push do código para GitHub
git add .
git commit -m "feat: configuração para deploy no Render"
git push origin main

# 2. No Render Dashboard:
# - New → Blueprint
# - Conecte seu repositório GitHub
# - O render.yaml será detectado automaticamente
# - Clique em "Apply"
```

### 2. Deploy Manual (Alternativo)

Se preferir deploy manual:

1. **Database**: PostgreSQL → Plano Free
2. **Redis**: Redis → Plano Free  
3. **API**: Web Service → Python
4. **Frontend**: Static Site → Node.js

## 🔍 Monitoramento Pós-Deploy

### Health Checks

- **API**: `https://mestres-cafe-api.onrender.com/api/health`
- **Frontend**: `https://mestres-cafe-web.onrender.com`

### Logs Importantes

```bash
# Verificar logs da API
tail -f logs/mestres_cafe.log

# Status dos workers Gunicorn
ps aux | grep gunicorn
```

## ⚠️ Possíveis Problemas e Soluções

### 1. Build Timeout
**Problema**: Frontend demora muito para buildar
**Solução**: 
```yaml
buildCommand: npm ci && npm run build:fast
```

### 2. Cold Start
**Problema**: API demora para responder após inatividade
**Solução**: Implementar health check ping automático

### 3. Memória Insuficiente
**Problema**: Aplicação crashando por falta de memória
**Solução**: Reduzir workers do Gunicorn para 1

### 4. CORS Issues
**Problema**: Frontend não consegue acessar API
**Solução**: Verificar `CORS_ORIGINS` na configuração

## 🎯 Otimizações Pós-Deploy

### Performance
- [ ] Configurar CDN para assets estáticos
- [ ] Implementar cache Redis adequadamente
- [ ] Otimizar queries do banco de dados

### Segurança
- [ ] Configurar rate limiting
- [ ] Implementar HTTPS redirect
- [ ] Validar todos os headers de segurança

### Monitoramento
- [ ] Configurar Sentry para error tracking
- [ ] Implementar métricas de performance
- [ ] Configurar alertas de downtime

## 📚 Links Úteis

- [Render Documentation](https://render.com/docs)
- [Flask Deployment Guide](https://flask.palletsprojects.com/en/2.3.x/deploying/)
- [Gunicorn Configuration](https://docs.gunicorn.org/en/stable/configure.html)

---

## ✅ Checklist Final

- [ ] Repositório commitado no GitHub
- [ ] render.yaml validado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy executado com sucesso
- [ ] Health checks funcionando
- [ ] API respondendo corretamente
- [ ] Frontend carregando
- [ ] CORS configurado
- [ ] SSL/HTTPS ativo
- [ ] Logs sem erros críticos

**🎉 Deploy concluído com sucesso!**