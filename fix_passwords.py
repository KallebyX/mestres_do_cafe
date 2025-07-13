#!/usr/bin/env python3
"""
Corrigir hashes de senha no banco de dados
"""

import sqlite3
from werkzeug.security import generate_password_hash

def main():
    conn = sqlite3.connect('mestres_cafe.db')
    cursor = conn.cursor()
    
    # Corrigir senhas usando werkzeug
    users_passwords = [
        ('admin@mestres.cafe', 'admin123'),
        ('cliente@mestres.cafe', 'cliente123'),
        ('maria.silva@email.com', 'senha123')
    ]
    
    for email, password in users_passwords:
        hash_password = generate_password_hash(password, method='pbkdf2:sha256')
        cursor.execute(
            "UPDATE users SET password_hash = ? WHERE email = ?",
            (hash_password, email)
        )
        print(f"✅ Senha atualizada para {email}")
    
    conn.commit()
    conn.close()
    print("🔐 Todas as senhas foram corrigidas!")

if __name__ == "__main__":
    main()