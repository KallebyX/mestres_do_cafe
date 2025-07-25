# 🔄 Migração SQLite → PostgreSQL

## 📋 **Guia Completo de Migração**

### **Objetivo: Migração Limpa sem Quebrar o Sistema**

---

## **1. 🛠️ Preparação do Ambiente**

### **Instalar PostgreSQL**

#### **macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

#### **Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### **Windows:**
- Baixar PostgreSQL Installer do site oficial
- Executar instalação padrão

### **Configurar PostgreSQL**
```bash
# Conectar como superuser
sudo -u postgres psql

# Criar usuário para a aplicação
CREATE USER mestres_cafe WITH PASSWORD 'senha_segura_aqui';

# Criar database
CREATE DATABASE mestres_cafe_production OWNER mestres_cafe;

# Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE mestres_cafe_production TO mestres_cafe;

# Habilitar extensão UUID
\c mestres_cafe_production
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Sair
\q
```

---

## **2. 📦 Atualizar Dependências**

### **Backend - requirements.txt**
```bash
cd apps/api
# Adicionar ao requirements.txt:
echo "psycopg2-binary==2.9.7" >> requirements.txt

# Instalar
pip install psycopg2-binary
```

### **Configurar DATABASE_URL**
```bash
# apps/api/.env
DATABASE_URL=postgresql://mestres_cafe:senha_segura_aqui@localhost:5432/mestres_cafe_production
```

---

## **3. 🔧 Atualizar Configurações**

### **apps/api/src/database.py**
```python
"""
Database configuration for PostgreSQL ÚNICO
"""

import logging
import os
from typing import Optional

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

# Configurar logging
logger = logging.getLogger(__name__)

# Instância global
db = SQLAlchemy()


def init_db(app) -> None:
    """
    Inicializa o banco PostgreSQL com a aplicação Flask
    """
    
    # Configurar URL do banco PostgreSQL
    database_url = get_database_url()
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 30,
    }

    # Inicializar SQLAlchemy
    db.init_app(app)

    # Registrar contexto de aplicação
    with app.app_context():
        try:
            # Testar conexão
            db.engine.connect()
            logger.info("✅ Conexão com PostgreSQL estabelecida com sucesso")
        except SQLAlchemyError as e:
            logger.error(f"❌ Erro ao conectar com PostgreSQL: {e}")
            raise


def get_database_url() -> str:
    """
    Obtém a URL de conexão do PostgreSQL
    """
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url
    
    # URL padrão para desenvolvimento
    return "postgresql://mestres_cafe:senha_segura_aqui@localhost:5432/mestres_cafe_production"


def create_tables() -> None:
    """
    Cria todas as tabelas do PostgreSQL
    """
    try:
        db.create_all()
        logger.info("✅ Tabelas PostgreSQL criadas com sucesso")
    except SQLAlchemyError as e:
        logger.error(f"❌ Erro ao criar tabelas: {e}")
        raise


def health_check() -> dict:
    """
    Verifica a saúde da conexão PostgreSQL
    """
    try:
        result = db.session.execute(text("SELECT 1"))
        result.fetchone()
        
        return {"status": "healthy", "database": "PostgreSQL", "connection": "active"}
    except SQLAlchemyError as e:
        logger.error(f"❌ Health check falhou: {e}")
        return {
            "status": "unhealthy",
            "database": "PostgreSQL", 
            "connection": "failed",
            "error": str(e),
        }
```

---

## **4. 📊 Script de Migração de Dados**

### **Criar migrate_to_postgresql.py**
```python
#!/usr/bin/env python3
"""
Script de migração SQLite → PostgreSQL
Migra todos os dados mantendo UUIDs e relacionamentos
"""

import sqlite3
import psycopg2
import json
import uuid
from datetime import datetime

def migrate_data():
    """
    Executa migração completa de dados
    """
    
    # Conexões
    sqlite_conn = sqlite3.connect('mestres_cafe.db')
    sqlite_conn.row_factory = sqlite3.Row
    
    pg_conn = psycopg2.connect(
        host='localhost',
        database='mestres_cafe_production',
        user='mestres_cafe',
        password='senha_segura_aqui'
    )
    
    try:
        print("🚀 Iniciando migração SQLite → PostgreSQL")
        
        # Migrar cada tabela
        migrate_users(sqlite_conn, pg_conn)
        migrate_products(sqlite_conn, pg_conn)
        migrate_orders(sqlite_conn, pg_conn)
        migrate_cart_items(sqlite_conn, pg_conn)
        # ... outras tabelas
        
        pg_conn.commit()
        print("✅ Migração concluída com sucesso!")
        
    except Exception as e:
        pg_conn.rollback()
        print(f"❌ Erro na migração: {e}")
        raise
    finally:
        sqlite_conn.close()
        pg_conn.close()


def migrate_users(sqlite_conn, pg_conn):
    """Migra tabela users"""
    print("📋 Migrando usuários...")
    
    cursor_sqlite = sqlite_conn.cursor()
    cursor_pg = pg_conn.cursor()
    
    # Buscar dados SQLite
    cursor_sqlite.execute("SELECT * FROM users")
    users = cursor_sqlite.fetchall()
    
    for user in users:
        # Converter UUID string para UUID PostgreSQL se necessário
        user_id = str(uuid.uuid4()) if not user['id'] else user['id']
        
        cursor_pg.execute("""
            INSERT INTO users (
                id, email, name, password_hash, role, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (
            user_id,
            user['email'],
            user['name'], 
            user['password_hash'],
            user['role'],
            user['created_at'],
            user['updated_at']
        ))
    
    print(f"✅ {len(users)} usuários migrados")


# Implementar migrate_products(), migrate_orders(), etc.

if __name__ == "__main__":
    migrate_data()
```

---

## **5. ✅ Validação da Migração**

### **Script de Validação**
```python
#!/usr/bin/env python3
"""
Validação de integridade pós-migração
"""

def validate_migration():
    """
    Valida se migração foi bem-sucedida
    """
    
    import psycopg2
    
    conn = psycopg2.connect(
        host='localhost',
        database='mestres_cafe_production', 
        user='mestres_cafe',
        password='senha_segura_aqui'
    )
    
    cursor = conn.cursor()
    
    # Validar contagem de registros
    tables = ['users', 'products', 'orders', 'cart_items']
    
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"📊 {table}: {count} registros")
    
    # Validar UUIDs
    cursor.execute("SELECT id FROM users LIMIT 5")
    uuids = cursor.fetchall()
    print(f"🔑 UUIDs example: {uuids}")
    
    # Validar relacionamentos
    cursor.execute("""
        SELECT COUNT(*) FROM orders o 
        JOIN users u ON o.user_id = u.id
    """)
    orders_with_users = cursor.fetchone()[0]
    print(f"🔗 Orders com usuários válidos: {orders_with_users}")
    
    conn.close()
    print("✅ Validação concluída!")

if __name__ == "__main__":
    validate_migration()
```

---

## **6. 🔄 Procedimento de Migração**

### **Passo a Passo Seguro:**

1. **Backup SQLite:**
   ```bash
   cp mestres_cafe.db mestres_cafe_backup_$(date +%Y%m%d).db
   ```

2. **Preparar PostgreSQL:**
   ```bash
   python apps/api/src/app.py  # Criar tabelas
   ```

3. **Executar Migração:**
   ```bash
   python migrate_to_postgresql.py
   ```

4. **Validar Dados:**
   ```bash
   python validate_migration.py
   ```

5. **Testar Sistema:**
   ```bash
   cd apps/api && python src/app.py
   cd apps/web && npm run dev
   ```

6. **Rollback se Necessário:**
   ```bash
   # Restaurar DATABASE_URL para SQLite
   DATABASE_URL=sqlite:///mestres_cafe.db
   ```

---

## **7. 🚀 Deploy Production Ready**

### **Environment Variables para Render:**
```bash
DATABASE_URL=postgresql://user:password@host:port/database
FLASK_ENV=production
JWT_SECRET_KEY=production_secret_key
MERCADO_PAGO_ACCESS_TOKEN=production_token
```

### **Performance Tuning:**
```sql
-- Criar índices otimizados
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
```

---

## **8. ⚠️ Troubleshooting**

### **Problemas Comuns:**

1. **Conexão Recusada:**
   - Verificar se PostgreSQL está rodando
   - Validar credenciais e URL

2. **UUIDs não Funcionam:**
   - Verificar extensão uuid-ossp
   - Confirmar imports nos models

3. **Performance Lenta:**
   - Criar índices necessários
   - Configurar pool de conexões

4. **Dados Corrompidos:**
   - Executar validate_migration.py
   - Verificar encoding UTF-8

---

## **9. ✅ Checklist Final**

- [ ] PostgreSQL instalado e configurado
- [ ] Extensão uuid-ossp habilitada
- [ ] DATABASE_URL atualizada
- [ ] Backup SQLite criado
- [ ] Migração executada com sucesso
- [ ] Validação de integridade realizada
- [ ] Sistema testado completamente
- [ ] Performance verificada
- [ ] Deploy pronto para produção

---

**🎯 Resultado:** Sistema 100% funcional com PostgreSQL, UUIDs nativos, sem referências ao SQLite.