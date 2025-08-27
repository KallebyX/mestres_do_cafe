# 🔧 Correção: Erro de Conexão com PostgreSQL no Render

## ❌ Erro Encontrado:
```
sqlalchemy.exc.OperationalError: connection to server at "dpg-d21nj8ngi27c73e5acg0-a" failed: Connection refused
```

## ✅ SOLUÇÕES:

### 1️⃣ Verificar Status do Banco de Dados

1. Acesse o [Dashboard do Render](https://dashboard.render.com)
2. Clique no seu banco de dados PostgreSQL
3. Verifique o status:
   - **🟢 Green/Available**: Banco está funcionando
   - **🟡 Yellow/Creating**: Ainda está sendo criado (aguarde 3-5 min)
   - **🔴 Red/Failed**: Houve erro na criação

### 2️⃣ Use a URL Correta do Banco

**IMPORTANTE**: No Render, você DEVE usar a **Internal Database URL** para conexão entre serviços!

1. No dashboard do Render, clique no seu PostgreSQL
2. Vá na aba **"Connect"**
3. Copie a **Internal Database URL** (NÃO a External!)
   ```
   postgresql://mestres_cafe_user:SENHA@dpg-xxxxx:5432/mestres_cafe
   ```

4. No seu Web Service (backend), vá em **Settings** → **Environment**
5. Atualize a variável `DATABASE_URL` com a Internal URL copiada

### 3️⃣ Verificar a Região

**CRÍTICO**: Todos os serviços DEVEM estar na MESMA região!

1. Verifique a região do banco:
   - PostgreSQL → Info → Region: `Oregon (US West)`

2. Verifique a região do backend:
   - Web Service → Info → Region: `Oregon (US West)`

3. Se estiverem em regiões diferentes:
   - Delete o serviço que está na região errada
   - Recrie na mesma região do banco

### 4️⃣ Configuração Correta do Backend

No seu Web Service, certifique-se que as variáveis estão assim:

```env
# Use SEMPRE a Internal Database URL!
DATABASE_URL=postgresql://user:password@dpg-xxxxx:5432/dbname

# NÃO use a External URL (com .render.com)
# ❌ ERRADO: postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/db
# ✅ CERTO:  postgresql://user:pass@dpg-xxx:5432/db
```

### 5️⃣ Modificar o Código para Aceitar DATABASE_URL

Verifique se [`apps/api/src/config.py`](apps/api/src/config.py) está configurado corretamente:

```python
class ProductionConfig(Config):
    # O Render fornece DATABASE_URL automaticamente
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    
    # Fix para SQLAlchemy com PostgreSQL
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
```

### 6️⃣ Reiniciar o Serviço

Após corrigir:
1. No Web Service, clique em **"Manual Deploy"** → **"Deploy latest commit"**
2. Aguarde o novo deploy (3-5 minutos)
3. Verifique os logs para confirmar conexão

### 7️⃣ Testar a Conexão

No dashboard do Render:
1. Vá no Web Service
2. Clique na aba **"Shell"**
3. Execute:
```bash
cd apps/api
python3 -c "
from src.config import get_config
from src.database import db, init_db
from flask import Flask
app = Flask(__name__)
app.config.from_object(get_config())
init_db(app)
with app.app_context():
    result = db.session.execute(db.text('SELECT 1')).fetchone()
    print('✅ Conexão com banco OK!' if result else '❌ Falha na conexão')
"
```

---

## 🎯 Checklist de Verificação

- [ ] PostgreSQL está com status **Available** (verde)
- [ ] Usando **Internal Database URL** (sem .render.com)
- [ ] Backend e Banco na **mesma região**
- [ ] Variável `DATABASE_URL` configurada corretamente
- [ ] Deploy realizado após mudanças

---

## 📝 Exemplo de Configuração Correta

### No PostgreSQL (aba Connect):
```
Internal Database URL:
postgresql://mestres_cafe_user:AbC123XyZ@dpg-d21nj8ngi27c73e5acg0:5432/mestres_cafe
```

### No Web Service (Environment Variables):
```env
DATABASE_URL=postgresql://mestres_cafe_user:AbC123XyZ@dpg-d21nj8ngi27c73e5acg0:5432/mestres_cafe
```

### NO CÓDIGO NÃO É NECESSÁRIO MUDAR NADA!
O [`apps/api/src/database.py`](apps/api/src/database.py) já está configurado para usar `DATABASE_URL`:

```python
def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url
    # Fallback para desenvolvimento local
    return "postgresql://kalleby@localhost:5432/mestres_cafe"
```

---

## 🆘 Se Ainda Não Funcionar:

### Opção A: Recriar o Banco
1. Delete o PostgreSQL atual
2. Crie um novo PostgreSQL
3. Use a nova Internal URL
4. Faça novo deploy do backend

### Opção B: Usar Connection String Manual
Se a DATABASE_URL não funcionar, configure manualmente:

```env
# Ao invés de DATABASE_URL, use variáveis separadas:
DB_HOST=dpg-d21nj8ngi27c73e5acg0
DB_PORT=5432
DB_NAME=mestres_cafe
DB_USER=mestres_cafe_user
DB_PASSWORD=sua_senha_aqui
```

E modifique [`apps/api/src/database.py`](apps/api/src/database.py):
```python
def get_database_url() -> str:
    # Tentar DATABASE_URL primeiro
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url
    
    # Montar URL a partir de variáveis separadas
    host = os.getenv("DB_HOST")
    if host:
        user = os.getenv("DB_USER")
        password = os.getenv("DB_PASSWORD")
        db_name = os.getenv("DB_NAME")
        port = os.getenv("DB_PORT", "5432")
        return f"postgresql://{user}:{password}@{host}:{port}/{db_name}"
    
    # Fallback desenvolvimento
    return "postgresql://kalleby@localhost:5432/mestres_cafe"
```

### Opção C: Suporte Render
Se nada funcionar, contate o suporte:
- Email: support@render.com
- Chat: No dashboard, ícone de chat no canto inferior direito

---

## ✅ Sucesso Esperado

Quando funcionar, você verá nos logs:
```
2025-08-27 - database - INFO - ✅ Conexão com PostgreSQL estabelecida com sucesso
2025-08-27 - src.app - INFO - ✅ SQLAlchemy inicializado com sucesso
 * Running on http://0.0.0.0:10000
```

E o health check retornará:
```json
{
  "status": "healthy",
  "database": "PostgreSQL",
  "connection": "active"
}