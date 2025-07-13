#!/usr/bin/env python3
"""
Script para migrar a tabela cart_items adicionando o campo cart_id
"""

import os
import sys

# Configurar ambiente
os.environ["FLASK_ENV"] = "development"

# Adicionar o diretório apps/api ao Python path
sys.path.insert(0, os.path.join(os.getcwd(), "apps/api"))

try:
    from sqlalchemy import text
    from src.app import create_app
    from src.database import db

    def migrate_cart_items():
        """Migrar tabela cart_items"""
        app = create_app()

        with app.app_context():
            print("🔄 Iniciando migração da tabela cart_items...")

            # Primeiro, vamos criar as tabelas se não existirem
            print("📋 Criando tabelas...")
            db.create_all()

            # Verificar se a coluna cart_id já existe
            result = db.session.execute(
                text(
                    """
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='cart_items' AND column_name='cart_id'
            """
                )
            ).fetchone()

            if result:
                print("✅ Campo cart_id já existe na tabela cart_items")
                return

            # Adicionar campo cart_id à tabela cart_items
            print("🔧 Adicionando campo cart_id à tabela cart_items...")

            # Primeiro, adicionar a coluna como nullable
            db.session.execute(
                text(
                    """
                ALTER TABLE cart_items 
                ADD COLUMN cart_id UUID
            """
                )
            )

            # Criar carrinhos para usuários que ainda não têm
            print("🛒 Criando carrinhos para usuários sem carrinho...")
            db.session.execute(
                text(
                    """
                INSERT INTO carts (id, user_id, created_at, updated_at)
                SELECT 
                    gen_random_uuid(),
                    ci.user_id,
                    NOW(),
                    NOW()
                FROM cart_items ci
                WHERE ci.user_id IS NOT NULL
                AND ci.user_id NOT IN (
                    SELECT user_id FROM carts WHERE user_id IS NOT NULL
                )
                GROUP BY ci.user_id
            """
                )
            )

            # Atualizar cart_items com cart_id baseado no user_id
            print("🔗 Vinculando itens do carrinho aos carrinhos...")
            db.session.execute(
                text(
                    """
                UPDATE cart_items 
                SET cart_id = (
                    SELECT c.id 
                    FROM carts c 
                    WHERE c.user_id = cart_items.user_id
                    LIMIT 1
                )
                WHERE cart_items.user_id IS NOT NULL
            """
                )
            )

            # Para itens sem user_id, criar carrinhos de sessão
            print("🔄 Criando carrinhos para sessões...")
            db.session.execute(
                text(
                    """
                INSERT INTO carts (id, session_id, created_at, updated_at)
                SELECT 
                    gen_random_uuid(),
                    ci.session_id,
                    NOW(),
                    NOW()
                FROM cart_items ci
                WHERE ci.session_id IS NOT NULL
                AND ci.cart_id IS NULL
                GROUP BY ci.session_id
            """
                )
            )

            # Atualizar cart_items restantes com cart_id baseado no session_id
            db.session.execute(
                text(
                    """
                UPDATE cart_items 
                SET cart_id = (
                    SELECT c.id 
                    FROM carts c 
                    WHERE c.session_id = cart_items.session_id
                    LIMIT 1
                )
                WHERE cart_items.session_id IS NOT NULL
                AND cart_items.cart_id IS NULL
            """
                )
            )

            # Remover itens órfãos (sem cart_id)
            db.session.execute(
                text(
                    """
                DELETE FROM cart_items 
                WHERE cart_id IS NULL
            """
                )
            )

            # Adicionar a constraint NOT NULL
            print("⚡ Adicionando constraint NOT NULL...")
            db.session.execute(
                text(
                    """
                ALTER TABLE cart_items 
                ALTER COLUMN cart_id SET NOT NULL
            """
                )
            )

            # Adicionar foreign key constraint
            print("🔗 Adicionando foreign key constraint...")
            db.session.execute(
                text(
                    """
                ALTER TABLE cart_items
                ADD CONSTRAINT fk_cart_items_cart_id
                FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
            """
                )
            )

            # Verificar se a coluna added_at já existe
            result = db.session.execute(
                text(
                    """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name='cart_items' AND column_name='added_at'
            """
                )
            ).fetchone()

            if not result:
                # Adicionar campo added_at se não existir
                print("⏰ Adicionando campo added_at à tabela cart_items...")
                db.session.execute(
                    text(
                        """
                    ALTER TABLE cart_items
                    ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                """
                    )
                )

                # Preencher added_at com created_at para registros existentes
                print("📅 Preenchendo campo added_at com created_at...")
                db.session.execute(
                    text(
                        """
                    UPDATE cart_items
                    SET added_at = created_at
                    WHERE added_at IS NULL
                """
                    )
                )

            # Adicionar campo supplier_id na tabela products se não existir
            print("🔧 Verificando campo supplier_id na tabela products...")
            result = db.session.execute(
                text(
                    """
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='products' AND column_name='supplier_id'
            """
                )
            ).fetchone()

            if not result:
                print("➕ Adicionando campo supplier_id à tabela products...")
                db.session.execute(
                    text(
                        """
                    ALTER TABLE products 
                    ADD COLUMN supplier_id UUID
                """
                    )
                )

                db.session.execute(
                    text(
                        """
                    ALTER TABLE products 
                    ADD CONSTRAINT fk_products_supplier_id 
                    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) 
                    ON DELETE SET NULL
                """
                    )
                )

            db.session.commit()
            print("✅ Migração concluída com sucesso!")

            # Verificar resultado
            result = db.session.execute(
                text("SELECT COUNT(*) FROM cart_items")
            ).fetchone()
            print(f"📊 Total de itens no carrinho: {result[0]}")

    if __name__ == "__main__":
        migrate_cart_items()

except Exception as e:
    print(f"❌ Erro durante migração: {e}")
    import traceback

    traceback.print_exc()
    sys.exit(1)
