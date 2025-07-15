"""
Migração para adicionar suporte a multi-tenancy
Adiciona campo tenant_id aos modelos existentes
"""

# Script SQL para adicionar colunas tenant_id
MIGRATION_SQL = """
-- Adicionar tenant_id aos modelos principais
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS customers ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS carts ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS payments ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS coupons ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS blog_posts ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS newsletters ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS notifications ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS media_files ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS vendors ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE IF EXISTS suppliers ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- Atualizar dados existentes para tenant padrão (ID 1)
-- Apenas se não houver tenant_id definido
UPDATE products SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE orders SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE customers SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE users SET tenant_id = 1 WHERE tenant_id IS NULL;
"""

def run_migration():
    """Executa a migração de multi-tenancy"""
    try:
        from ..database import db
        
        # Executa as queries SQL
        for statement in MIGRATION_SQL.strip().split(';'):
            statement = statement.strip()
            if statement:
                db.session.execute(statement)
        
        db.session.commit()
        print("✅ Migração de multi-tenancy executada com sucesso")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Erro na migração: {e}")
        raise

if __name__ == "__main__":
    run_migration()