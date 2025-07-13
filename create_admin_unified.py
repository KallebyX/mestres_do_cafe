#!/usr/bin/env python3
"""
Script para criar usuário admin no banco unificado
"""

import sqlite3
from datetime import datetime

import bcrypt


def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_admin_user():
    """Criar usuário admin no banco unificado"""
    try:
        # Conectar ao banco único na raiz
        db_path = "mestres_cafe.db"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("🔐 Criando usuário admin no banco unificado...")

        # Verificar se admin já existe
        cursor.execute("SELECT * FROM users WHERE email = ?", ("admin@mestres.cafe",))
        existing_admin = cursor.fetchone()

        if existing_admin:
            print("✅ Usuário admin já existe, atualizando...")
            cursor.execute(
                """
                UPDATE users SET 
                password_hash = ?, 
                is_admin = ?, 
                is_active = ?, 
                updated_at = ?
                WHERE email = ?
            """,
                (
                    hash_password("admin123"),
                    True,
                    True,
                    datetime.utcnow().isoformat(),
                    "admin@mestres.cafe",
                ),
            )
        else:
            print("➕ Criando novo usuário admin...")
            cursor.execute(
                """
                INSERT INTO users 
                (email, username, password_hash, name, first_name, last_name, 
                 is_admin, is_active, email_verified, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    "admin@mestres.cafe",
                    "admin",
                    hash_password("admin123"),
                    "Administrador",
                    "Admin",
                    "System",
                    True,
                    True,
                    True,
                    datetime.utcnow().isoformat(),
                    datetime.utcnow().isoformat(),
                ),
            )

        conn.commit()

        # Verificar criação
        cursor.execute(
            """
            SELECT email, username, name, is_admin, is_active 
            FROM users WHERE email = ?
        """,
            ("admin@mestres.cafe",),
        )

        result = cursor.fetchone()

        if result:
            print("✅ Usuário admin criado no banco unificado!")
            print(f"📧 Email: {result[0]}")
            print(f"🔑 Senha: admin123")
            print(f"👤 Nome: {result[2]}")
            print(f"🛡️  Admin: {result[3]}")
            print(f"✅ Ativo: {result[4]}")

        conn.close()

    except Exception as e:
        print(f"❌ Erro: {e}")
        raise


if __name__ == "__main__":
    create_admin_user()
