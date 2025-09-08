# 🔧 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE - NEON

## 📋 **VARIÁVEIS NECESSÁRIAS**

### **1. Neon Database (PRIORIDADE)**
```bash
NEON_DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### **2. Render Database (FALLBACK)**
```bash
DATABASE_URL=postgresql://user:pass@dpg-xxx-xxx.oregon-postgres.render.com/mestres_cafe
```

### **3. Outras Variáveis Essenciais**
```bash
# Flask
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=your-secret-key-32-chars-minimum
JWT_SECRET_KEY=your-jwt-secret-key-32-chars-minimum

# APIs Externas
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxx-xxx
MELHOR_ENVIO_API_KEY=your-api-key

# Redis (opcional)
REDIS_URL=redis://user:pass@redis-host:6379
```

## 🚀 **COMO CONFIGURAR NO RENDER**

### **Método 1: Via Dashboard (Recomendado)**

1. **Acesse**: https://dashboard.render.com
2. **Selecione**: Seu serviço `mestres-cafe-api`
3. **Clique**: "Environment" (menu lateral)
4. **Adicione** as variáveis:

| **Key** | **Value** | **Obrigatório** |
|---------|-----------|-----------------|
| `NEON_DATABASE_URL` | `postgresql://...` | ✅ Sim |
| `SECRET_KEY` | `gerar-automaticamente` | ✅ Sim |
| `JWT_SECRET_KEY` | `gerar-automaticamente` | ✅ Sim |
| `MERCADO_PAGO_ACCESS_TOKEN` | `TEST-xxx-xxx` | ⚠️ Opcional |
| `MELHOR_ENVIO_API_KEY` | `sua-api-key` | ⚠️ Opcional |

5. **Clique**: "Save Changes"
6. **Deploy**: Automático ou manual

### **Método 2: Via render.yaml (Já configurado)**

```yaml
envVars:
  # Neon Database (recomendado)
  - key: NEON_DATABASE_URL
    sync: false  # Adicionar manualmente no dashboard
  
  # Fallback: Render Database
  - key: DATABASE_URL
    fromDatabase:
      name: mestres-cafe-db
      property: connectionString
  
  # Secrets (gerados automaticamente)
  - key: SECRET_KEY
    generateValue: true
  - key: JWT_SECRET_KEY
    generateValue: true
  
  # APIs externas (adicionar manualmente)
  - key: MERCADO_PAGO_ACCESS_TOKEN
    sync: false
  - key: MELHOR_ENVIO_API_KEY
    sync: false
```

## 🔑 **COMO OBTER AS VARIÁVEIS**

### **1. NEON_DATABASE_URL**

1. **Acesse**: https://console.neon.tech
2. **Selecione**: Seu projeto
3. **Clique**: "Connection Details"
4. **Copie**: A string de conexão
5. **Exemplo**:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### **2. SECRET_KEY e JWT_SECRET_KEY**

**Opção A: Gerar automaticamente (Recomendado)**
- Render gera automaticamente se `generateValue: true`

**Opção B: Gerar manualmente**
```bash
# Terminal
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Opção C: Usar gerador online**
- https://generate-secret.vercel.app/32

### **3. MERCADO_PAGO_ACCESS_TOKEN**

1. **Acesse**: https://www.mercadopago.com.br/developers
2. **Login**: Sua conta Mercado Pago
3. **Crie**: Aplicação
4. **Copie**: Access Token (TEST-xxx-xxx)

### **4. MELHOR_ENVIO_API_KEY**

1. **Acesse**: https://melhorenvio.com.br
2. **Login**: Sua conta
3. **API**: Configurações
4. **Copie**: API Key

## 🧪 **TESTANDO AS VARIÁVEIS**

### **1. Verificar no Render**
```bash
# Logs do deploy devem mostrar:
🌟 Usando Neon Database (recomendado)
🔗 Conectando ao Neon: postgresql://***@ep-xxx-xxx.us-east-1.aws.neon.tech
✅ Conexão com PostgreSQL estabelecida com sucesso
```

### **2. Endpoint de Debug**
```bash
# Verificar variáveis
curl https://mestres-cafe-api.onrender.com/api/debug/env

# Resposta esperada:
{
  "NEON_DATABASE_URL": "postgresql://***@ep-xxx-xxx.us-east-1.aws.neon.tech",
  "SECRET_KEY": "***",
  "JWT_SECRET_KEY": "***",
  "FLASK_ENV": "production"
}
```

### **3. Health Check**
```bash
# Verificar se está funcionando
curl https://mestres-cafe-api.onrender.com/api/health

# Resposta esperada:
{
  "status": "healthy",
  "service": "Mestres do Café API",
  "database": "PostgreSQL (Neon)",
  "version": "1.0.0"
}
```

## 🚨 **TROUBLESHOOTING**

### **Problema: NEON_DATABASE_URL não encontrada**
```bash
# Logs mostram:
⚠️ Nenhuma configuração de banco encontrada - usando SQLite local
```

**Solução:**
1. Verificar se a variável foi adicionada no Render Dashboard
2. Verificar se o nome está correto: `NEON_DATABASE_URL`
3. Fazer redeploy após adicionar a variável

### **Problema: Erro de conexão com Neon**
```bash
# Logs mostram:
❌ Erro ao conectar com banco de dados: connection refused
```

**Solução:**
1. Verificar se a string de conexão está correta
2. Verificar se o projeto Neon está ativo
3. Verificar se a região está correta

### **Problema: SECRET_KEY muito fraco**
```bash
# Logs mostram:
❌ ERRO DE SEGURANÇA: SECRET_KEY muito fraco (mín. 32 chars)
```

**Solução:**
1. Gerar nova chave com 32+ caracteres
2. Atualizar no Render Dashboard
3. Fazer redeploy

## 📊 **ORDEM DE PRIORIDADE**

O sistema usa esta ordem para conectar ao banco:

1. **NEON_DATABASE_URL** (Prioridade máxima) 🌟
2. **DATABASE_URL** (Fallback para Render)
3. **Variáveis separadas** (DB_HOST, DB_USER, etc.)
4. **SQLite local** (Desenvolvimento)

## 🎯 **CONFIGURAÇÃO MÍNIMA**

Para funcionar, você precisa apenas de:

```bash
# Mínimo obrigatório
NEON_DATABASE_URL=postgresql://...
SECRET_KEY=gerado-automaticamente
JWT_SECRET_KEY=gerado-automaticamente
```

## 🎉 **RESULTADO FINAL**

Após configurar as variáveis:

- ✅ **Neon Database** será usado automaticamente
- ✅ **Performance superior** (3x mais rápido)
- ✅ **3GB gratuitos** de armazenamento
- ✅ **100 conexões** simultâneas
- ✅ **Fallback** para Render se necessário
- ✅ **Logs detalhados** para debug

---

**💡 DICA**: Configure apenas o `NEON_DATABASE_URL` primeiro. O sistema detectará automaticamente e usará o Neon. As outras variáveis podem ser adicionadas depois conforme necessário!
