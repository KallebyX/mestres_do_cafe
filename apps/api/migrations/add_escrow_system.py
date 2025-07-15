"""
Migração para adicionar sistema de escrow
"""

import sys
import os
from datetime import datetime

# Adiciona o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from database import db
from sqlalchemy import text


def upgrade():
    """Adiciona colunas e tabelas para o sistema de escrow"""
    
    print("🚀 Iniciando migração do sistema de escrow...")
    
    try:
        # Adicionar colunas ao modelo Payment
        print("📝 Adicionando colunas ao modelo Payment...")
        
        # Verificar se as colunas já existem
        result = db.session.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'vendor_id'
        """)).fetchone()
        
        if not result:
            db.session.execute(text("""
                ALTER TABLE payments 
                ADD COLUMN vendor_id UUID REFERENCES vendors(id),
                ADD COLUMN held_at TIMESTAMP,
                ADD COLUMN released_at TIMESTAMP,
                ADD COLUMN release_eligible_at TIMESTAMP,
                ADD COLUMN escrow_reason VARCHAR(255)
            """))
            print("✅ Colunas adicionadas ao modelo Payment")
        else:
            print("ℹ️  Colunas já existem no modelo Payment")
        
        # Criar tabela payment_disputes
        print("📝 Criando tabela payment_disputes...")
        db.session.execute(text("""
            CREATE TABLE IF NOT EXISTS payment_disputes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                payment_id UUID REFERENCES payments(id),
                order_id UUID REFERENCES orders(id),
                customer_id UUID REFERENCES customers(id),
                vendor_id UUID REFERENCES vendors(id),
                reason VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'open',
                resolution VARCHAR(100),
                resolution_notes TEXT,
                resolved_by UUID REFERENCES users(id),
                resolved_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✅ Tabela payment_disputes criada")
        
        # Criar tabela escrow_transactions
        print("📝 Criando tabela escrow_transactions...")
        db.session.execute(text("""
            CREATE TABLE IF NOT EXISTS escrow_transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                payment_id UUID REFERENCES payments(id),
                order_id UUID REFERENCES orders(id),
                vendor_id UUID REFERENCES vendors(id),
                amount DECIMAL(10, 2) NOT NULL,
                platform_fee DECIMAL(10, 2) DEFAULT 0.00,
                vendor_amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'held',
                held_reason VARCHAR(255),
                release_eligible_at TIMESTAMP,
                held_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                released_at TIMESTAMP
            )
        """))
        print("✅ Tabela escrow_transactions criada")
        
        # Criar índices para performance
        print("📝 Criando índices...")
        db.session.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_payments_vendor_id ON payments(vendor_id);
            CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
            CREATE INDEX IF NOT EXISTS idx_payments_release_eligible ON payments(release_eligible_at);
            CREATE INDEX IF NOT EXISTS idx_payment_disputes_status ON payment_disputes(status);
            CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status ON escrow_transactions(status);
        """))
        print("✅ Índices criados")
        
        # Commit das alterações
        db.session.commit()
        print("✅ Migração do sistema de escrow concluída com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro na migração: {str(e)}")
        db.session.rollback()
        raise


def downgrade():
    """Remove as alterações do sistema de escrow"""
    
    print("🔄 Iniciando rollback da migração do sistema de escrow...")
    
    try:
        # Remover tabelas
        print("📝 Removendo tabelas...")
        db.session.execute(text("DROP TABLE IF EXISTS escrow_transactions"))
        db.session.execute(text("DROP TABLE IF EXISTS payment_disputes"))
        print("✅ Tabelas removidas")
        
        # Remover colunas do modelo Payment
        print("📝 Removendo colunas do modelo Payment...")
        db.session.execute(text("""
            ALTER TABLE payments 
            DROP COLUMN IF EXISTS vendor_id,
            DROP COLUMN IF EXISTS held_at,
            DROP COLUMN IF EXISTS released_at,
            DROP COLUMN IF EXISTS release_eligible_at,
            DROP COLUMN IF EXISTS escrow_reason
        """))
        print("✅ Colunas removidas do modelo Payment")
        
        # Commit das alterações
        db.session.commit()
        print("✅ Rollback da migração concluído com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro no rollback: {str(e)}")
        db.session.rollback()
        raise


if __name__ == "__main__":
    import sys
    import os
    
    # Configurar o ambiente
    os.environ.setdefault('FLASK_ENV', 'development')
    
    # Importar a app
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
    
    from flask import Flask
    from database import init_db
    from config import config
    
    app = Flask(__name__)
    app.config.from_object(config['development'])
    
    # Inicializar database
    init_db(app)
    
    with app.app_context():
        if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
            downgrade()
        else:
            upgrade()