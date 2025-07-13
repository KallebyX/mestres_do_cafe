#!/usr/bin/env python3
"""
Script para criar usuário admin específico
"""

import os
import sys
import bcrypt
from datetime import datetime

# Configurar ambiente
os.environ["FLASK_ENV"] = "development"

# Adicionar o diretório apps/api ao Python path
sys.path.insert(0, os.path.join(os.getcwd(), "apps/api"))

try:
    from src.app import create_app
    from src.database import db
    from src.models.auth import User

    def hash_password(password):
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def create_admin_user():
        """Criar usuário admin específico"""
        app = create_app()

        with app.app_context():
            print("🔐 Criando usuário admin...")

            # Verificar se admin já existe
            existing_admin = User.query.filter_by(email="admin@mestres.cafe").first()
            if existing_admin:
                print("✅ Usuário admin já existe, atualizando senha...")
                existing_admin.password_hash = hash_password("admin123")
                existing_admin.is_admin = True
                existing_admin.role = "admin"
                existing_admin.is_active = True
                existing_admin.email_verified = True
                existing_admin.updated_at = datetime.now()
                db.session.commit()
                print("✅ Senha do admin atualizada com sucesso!")
            else:
                # Criar novo usuário admin
                admin_user = User(
                    email="admin@mestres.cafe",
                    username="admin",
                    name="Admin Mestres Café",
                    first_name="Admin",
                    last_name="Mestres Café",
                    password_hash=hash_password("admin123"),
                    is_admin=True,
                    is_active=True,
                    email_verified=True,
                    role="admin",
                    points=0,
                    level="platinum",
                    account_type="admin"
                )

                db.session.add(admin_user)
                db.session.commit()
                print("✅ Usuário admin criado com sucesso!")

            print("\n📊 Credenciais do Admin:")
            print("   Email: admin@mestres.cafe")
            print("   Senha: admin123")
            print("   Role: admin")
            print("   Status: ativo")

    if __name__ == "__main__":
        create_admin_user()

except Exception as e:
    print(f"❌ Erro ao criar usuário admin: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)