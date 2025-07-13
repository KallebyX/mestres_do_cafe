#!/usr/bin/env python3
"""
Script para criar usuário admin usando SQL direto
"""

import os
import sys
import bcrypt
import sqlite3
from datetime import datetime

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_admin_user():
    """Criar usuário admin usando SQL direto"""
    try:
        # Conectar ao banco de dados
        db_path = "apps/api/instance/mestres_cafe.db"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔐 Criando usuário admin...")
        
        # Verificar se admin já existe
        cursor.execute("SELECT * FROM users WHERE email = ?", ("admin@mestres.cafe",))
        existing_admin = cursor.fetchone()
        
        if existing_admin:
            print("✅ Usuário admin já existe, atualizando senha...")
            # Atualizar usuário existente
            cursor.execute("""
                UPDATE users SET 
                password_hash = ?, 
                is_admin = ?, 
                is_active = ?, 
                updated_at = ?
                WHERE email = ?
            """, (
                hash_password("admin123"), 
                True, 
                True, 
                datetime.utcnow().isoformat(), 
                "admin@mestres.cafe"
            ))
        else:
            print("➕ Criando novo usuário admin...")
            # Criar novo usuário admin
            cursor.execute("""
                INSERT INTO users 
                (email, username, password_hash, name, first_name, last_name, 
                 is_admin, is_active, email_verified, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
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
                datetime.utcnow().isoformat()
            ))
        
        # Commit das alterações
        conn.commit()
        
        # Verificar se usuário foi criado/atualizado
        cursor.execute("""
            SELECT email, username, name, is_admin, is_active 
            FROM users WHERE email = ?
        """, ("admin@mestres.cafe",))
        
        result = cursor.fetchone()
        
        if result:
            print("✅ Usuário admin criado/atualizado com sucesso!")
            print(f"📧 Email: {result[0]}")
            print(f"🔑 Senha: admin123")
            print(f"👤 Nome: {result[2]}")
            print(f"🛡️  Admin: {result[3]}")
            print(f"✅ Ativo: {result[4]}")
        else:
            print("❌ Falha ao verificar criação do usuário")
        
        # Fechar conexão
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário admin: {e}")
        raise

if __name__ == "__main__":
    create_admin_user()