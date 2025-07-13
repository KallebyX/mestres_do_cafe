#!/usr/bin/env python3
"""
Script para verificar o status do administrador
"""
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from app import create_app
from src.models.base import db
from src.models.user import User


def check_admin_status():
    """Verifica o status do administrador"""
    app = create_app()

    with app.app_context():
        print("\n=== VERIFICANDO STATUS DO ADMINISTRADOR ===\n")

        # Busca o usuário admin
        admin_user = User.query.filter_by(email="admin@mestrescafe.com").first()

        if not admin_user:
            print("❌ Usuário admin@mestrescafe.com NÃO ENCONTRADO!")
            return

        print(f"✅ Usuário encontrado:")
        print(f"   - ID: {admin_user.id}")
        print(f"   - Username: {admin_user.username}")
        print(f"   - Email: {admin_user.email}")
        print(f"   - Is Admin: {admin_user.is_admin}")
        print(f"   - Role: {getattr(admin_user, 'role', 'N/A')}")
        print(f"   - Active: {getattr(admin_user, 'is_active', 'N/A')}")
        print(
            f"   - Password Hash: {'✅ Definido' if admin_user.password_hash else '❌ Não definido'}"
        )

        # Lista todos os usuários admin
        print("\n=== TODOS OS USUÁRIOS ADMIN ===\n")
        admins = User.query.filter_by(is_admin=True).all()

        if not admins:
            print("❌ Nenhum usuário admin encontrado!")
        else:
            for admin in admins:
                print(f"Admin: {admin.username} ({admin.email}) - ID: {admin.id}")


if __name__ == "__main__":
    check_admin_status()
