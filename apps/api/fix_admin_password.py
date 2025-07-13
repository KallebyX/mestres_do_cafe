#!/usr/bin/env python3
"""
Script para corrigir a senha do administrador
"""
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from app import create_app
from src.models.base import db
from src.models.user import User
from werkzeug.security import generate_password_hash


def fix_admin_password(email, password):
    """Corrige a senha do administrador"""
    app = create_app()

    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"Usuário com email {email} não encontrado")
            return False

        # Gera o hash da senha corretamente usando pbkdf2:sha256
        user.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
        user.is_admin = True  # Garante que é admin
        db.session.commit()

        print(f"Senha do usuário {user.username} ({user.email}) corrigida com sucesso!")
        print(f"Admin status: {user.is_admin}")
        return True


if __name__ == "__main__":
    # Define as credenciais padrão do admin
    admin_email = "admin@mestrescafe.com"
    admin_password = "admin123"

    print(f"Corrigindo senha do administrador...")
    fix_admin_password(admin_email, admin_password)
