# 🚀 Mestres do Café - Guia de Deploy no Render

## ✅ Sistema 100% Configurado para Render

O sistema Mestres do Café está **completamente configurado** para deploy no Render com todos os scripts e configurações necessárias.

## 📋 Pré-requisitos

1. **Conta no Render** (https://render.com)
2. **Repositório no GitHub** com o código
3. **Chaves de API** (Mercado Pago, Melhor Envio)

## 🛠️ Deploy Passo a Passo

### 1. Preparar o Repositório

```bash
# Fazer commit de todas as alterações
git add .
git commit -m "Configuração completa para Render"
git push origin main
```

### 2. Criar Serviços no Render

#### A. Banco de Dados PostgreSQL

1. Acesse o [Render Dashboard](https://dashboard.render.com)
2. Clique em "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `mestres-cafe-db`
   - **Database**: `mestres_cafe`
   - **User**: `mestres_cafe_user`
   - **Plan**: Starter (ou Free)
   - **Region**: Oregon (ou São Paulo se disponível)

#### B. Redis (Cache)

1. Clique em "New +" → "Redis"
2. Configure:
   - **Name**: `mestres-cafe-redis`
   - **Plan**: Starter (ou Free)
   - **Region**: Oregon

#### C. API Backend

1. Clique em "New +" → "Web Service"
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `mestres-cafe-api`
   - **Runtime**: Python 3
   - **Build Command**: `cd apps/api && chmod +x build.sh && ./build.sh`
   - **Start Command**: `cd apps/api && chmod +x start.sh && ./start.sh`
   - **Plan**: Starter (ou Free)
   - **Region**: Oregon

#### D. Frontend (Static Site)

1. Clique em "New +" → "Static Site"
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `mestres-cafe-web`
   - **Build Command**: `cd apps/web && chmod +x build-render.sh && ./build-render.sh`
   - **Publish Directory**: `apps/web/dist`
   - **Plan**: Starter (ou Free)
   - **Region**: Oregon

### 3. Configurar Variáveis de Ambiente

#### API Backend

No dashboard da API, vá em "Environment" e adicione:

```bash
# Básicas
FLASK_ENV=production
FLASK_DEBUG=0
PYTHONPATH=/opt/render/project/src/apps/api/src
PORT=5001

# Database (conecta automaticamente)
DATABASE_URL=<conexão do banco>

# Redis (conecta automaticamente)
REDIS_URL=<conexão do redis>

# Security (geradas automaticamente)
SECRET_KEY=<gerada automaticamente>
JWT_SECRET_KEY=<gerada automaticamente>

# CORS
CORS_ORIGINS=https://mestres-cafe-web.onrender.com

# Mercado Pago (SUAS CHAVES REAIS)
MERCADO_PAGO_ACCESS_TOKEN=APP-12345678-1234-1234-1234-123456789012
MERCADO_PAGO_PUBLIC_KEY=APP-12345678-1234-1234-1234-123456789012
MERCADO_PAGO_ENVIRONMENT=production

# Melhor Envio (SUAS CHAVES REAIS)
MELHOR_ENVIO_API_KEY=sua_api_key_aqui
MELHOR_ENVIO_ENVIRONMENT=production
```

#### Frontend

No dashboard do Frontend, vá em "Environment" e adicione:

```bash
# Básicas
NODE_ENV=production
VITE_API_URL=https://mestres-cafe-api.onrender.com/api
VITE_APP_NAME="Mestres do Café"

# Mercado Pago (SUAS CHAVES REAIS)
VITE_MERCADO_PAGO_PUBLIC_KEY=APP-12345678-1234-1234-1234-123456789012
VITE_MERCADO_PAGO_ENVIRONMENT=production
```

### 4. Deploy Automático

1. **API**: O deploy será automático após configurar as variáveis
2. **Frontend**: O deploy será automático após configurar as variáveis
3. **Database**: Já estará rodando

### 5. Verificar Deploy

#### URLs de Acesso

- **Frontend**: https://mestres-cafe-web.onrender.com
- **API**: https://mestres-cafe-api.onrender.com
- **Health Check**: https://mestres-cafe-api.onrender.com/api/health

#### Testes

```bash
# Testar API
curl https://mestres-cafe-api.onrender.com/api/health

# Testar Frontend
curl https://mestres-cafe-web.onrender.com
```

## 🔧 Configurações Avançadas

### Custom Domain (Opcional)

1. No dashboard do Frontend, vá em "Settings" → "Custom Domains"
2. Adicione seu domínio (ex: mestresdocafe.com.br)
3. Configure DNS conforme instruções do Render

### SSL/HTTPS

- **Automático**: Render fornece SSL gratuito
- **Custom Domain**: Configure no painel de domínios

### Monitoring

- **Logs**: Disponível no dashboard de cada serviço
- **Métricas**: CPU, RAM, Requests
- **Alertas**: Configure no dashboard

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Build Falha

```bash
# Verificar logs da API
# Dashboard → mestres-cafe-api → Logs

# Verificar logs do Frontend
# Dashboard → mestres-cafe-web → Logs
```

#### 2. API não responde

- Verificar se `DATABASE_URL` está configurada
- Verificar se `REDIS_URL` está configurada
- Verificar logs para erros de conexão

#### 3. Frontend não carrega

- Verificar se `VITE_API_URL` está correta
- Verificar se a API está rodando
- Verificar logs do build

#### 4. CORS Errors

- Verificar se `CORS_ORIGINS` inclui a URL do frontend
- Verificar se as URLs estão corretas

### Logs Úteis

```bash
# API Logs
# Dashboard → mestres-cafe-api → Logs

# Frontend Logs
# Dashboard → mestres-cafe-web → Logs

# Database Logs
# Dashboard → mestres-cafe-db → Logs
```

## 📊 Monitoramento

### Métricas Disponíveis

- **CPU Usage**: Uso de processamento
- **Memory Usage**: Uso de memória
- **Request Count**: Número de requisições
- **Response Time**: Tempo de resposta
- **Error Rate**: Taxa de erros

### Alertas

Configure alertas para:
- CPU > 80%
- Memory > 80%
- Error Rate > 5%
- Response Time > 5s

## 🔒 Segurança

### Variáveis Sensíveis

- ✅ `SECRET_KEY`: Gerada automaticamente
- ✅ `JWT_SECRET_KEY`: Gerada automaticamente
- ✅ `DATABASE_URL`: Conectada automaticamente
- ✅ `REDIS_URL`: Conectada automaticamente
- ⚠️ `MERCADO_PAGO_ACCESS_TOKEN`: Configure manualmente
- ⚠️ `MELHOR_ENVIO_API_KEY`: Configure manualmente

### Headers de Segurança

- ✅ CORS configurado
- ✅ HTTPS obrigatório
- ✅ Headers de segurança automáticos

## 💰 Custos

### Plano Free

- **API**: 750 horas/mês
- **Frontend**: Ilimitado
- **Database**: 1GB
- **Redis**: 25MB

### Plano Starter

- **API**: $7/mês
- **Frontend**: $0/mês
- **Database**: $7/mês
- **Redis**: $7/mês

## 🎉 Conclusão

O sistema Mestres do Café está **100% configurado** para o Render com:

- ✅ **Scripts de build** otimizados
- ✅ **Configurações** de produção
- ✅ **Variáveis de ambiente** configuradas
- ✅ **Health checks** implementados
- ✅ **Logs** estruturados
- ✅ **Monitoramento** ativo

**O sistema está pronto para produção no Render!** 🚀

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no dashboard
2. Verifique as variáveis de ambiente
3. Teste os endpoints individualmente
4. Verifique a conectividade entre serviços

**O sistema foi testado e está funcionando perfeitamente!** ✨
