# 🔧 CORREÇÃO DE PROBLEMAS NO RENDER - Mestres do Café

## ❌ Problemas Identificados

1. **PYTHONPATH incorreto** - Estava apontando para `/opt/render/project/src/src` em vez de `/opt/render/project/src/apps/api/src`
2. **Comando Gunicorn incorreto** - Estava tentando usar `src.app:app` em vez de `app:app`
3. **Permissões de scripts** - Os scripts `build.sh` e `start.sh` não tinham permissão de execução
4. **Configuração do banco de dados** - Faltavam configurações específicas para PostgreSQL no Render

## ✅ Correções Aplicadas

### 1. Scripts de Build e Start

**Arquivos modificados:**
- `/apps/api/build.sh` - Corrigido PYTHONPATH
- `/apps/api/start.sh` - Corrigido PYTHONPATH e comando Gunicorn
- `/apps/api/render-boot.sh` - Script alternativo criado

**Mudanças principais:**
```bash
# ANTES
export PYTHONPATH="/opt/render/project/src/src"
exec gunicorn src.app:app

# DEPOIS  
export PYTHONPATH="/opt/render/project/src/apps/api/src"
exec gunicorn app:app
```

### 2. Configuração do Render

**Arquivo:** `render.yaml`

**Mudanças:**
```yaml
buildCommand: cd apps/api && chmod +x build.sh && ./build.sh
startCommand: cd apps/api && chmod +x start.sh && ./start.sh
```

### 3. Configuração do Banco de Dados

**Arquivo:** `/apps/api/src/config.py`

**Adicionado:**
```python
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_size": 10,
    "max_overflow": 20,
    "pool_timeout": 30,
    "echo": False
}
```

### 4. Ponto de Entrada da Aplicação

**Arquivo:** `/apps/api/app.py`

**Verificado que está correto:**
```python
from src.app import create_app
app = create_app()
```

## 🚀 Instruções para Deploy no Render

### Opção 1: Usar render.yaml (Recomendado)

1. **Commitar as mudanças:**
```bash
git add .
git commit -m "🔧 Fix: Corrige configuração do Render - PYTHONPATH e Gunicorn"
git push origin main
```

2. **No Dashboard do Render:**
   - Vá para seu serviço `mestres-cafe-api`
   - Clique em "Settings"
   - Na seção "Build & Deploy", certifique-se que:
     - **Build Command:** `cd apps/api && chmod +x build.sh && ./build.sh`
     - **Start Command:** `cd apps/api && chmod +x start.sh && ./start.sh`

3. **Forçar novo deploy:**
   - Clique em "Manual Deploy" → "Deploy Latest Commit"

### Opção 2: Configuração Manual (Se render.yaml falhar)

Se o render.yaml não funcionar, configure manualmente:

**Build Command:**
```bash
cd apps/api && pip install -r requirements.txt
```

**Start Command:**
```bash
cd apps/api && python app.py
```

**ou (alternativo):**
```bash
cd apps/api && ./render-boot.sh
```

### Opção 3: Usar Script de Boot Alternativo

Se continuar com problemas, use o script de boot criado:

**Start Command:**
```bash
cd apps/api && chmod +x render-boot.sh && ./render-boot.sh
```

## 🔍 Verificação de Funcionamento

### 1. Verificar Logs no Render

No dashboard, vá para:
- **Logs** → Procure por:
  - ✅ `Flask app created successfully`
  - ✅ `Database connection successful`
  - ✅ `Health check endpoint working`

### 2. Testar Endpoints

**Health Check:**
```
GET https://mestres-cafe-api.onrender.com/api/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "service": "Mestres do Café API",
  "version": "1.0.0",
  "environment": "production",
  "database": "PostgreSQL + SQLAlchemy"
}
```

### 3. Verificar Banco de Dados

**Endpoint de info:**
```
GET https://mestres-cafe-api.onrender.com/api/info
```

## 🛠️ Troubleshooting

### Se ainda não funcionar:

1. **Verificar variáveis de ambiente no Render:**
   - `DATABASE_URL` - Deve estar preenchida automaticamente
   - `SECRET_KEY` - Deve estar gerada automaticamente
   - `JWT_SECRET_KEY` - Deve estar gerada automaticamente

2. **Verificar logs de erro:**
   - Procure por mensagens de erro específicas
   - Verifique se o banco de dados está sendo criado

3. **Testar localmente:**
```bash
cd apps/api
export FLASK_ENV=development
python app.py
```

4. **Verificar conectividade do banco:**
   - No dashboard do Render, vá para o database
   - Verifique se está "Available"
   - Teste a connection string

## 📝 Próximos Passos

1. **Deploy e teste** - Fazer o deploy com as correções
2. **Verificar frontend** - Garantir que o frontend está conectando na API
3. **Configurar Redis** - Se necessário para cache
4. **Configurar APIs externas** - MercadoPago e MelhorEnvio

## 🆘 Se Continuar com Problemas

1. **Logs detalhados:** Compartilhe os logs completos do Render
2. **Variáveis de ambiente:** Verifique se todas estão configuradas
3. **Script alternativo:** Use o `render-boot.sh` como fallback
4. **Deploy manual:** Tente deployment manual via Dashboard

---

**Status:** ✅ Correções aplicadas - Pronto para deploy
**Próxima ação:** Commit + Push + Deploy no Render
