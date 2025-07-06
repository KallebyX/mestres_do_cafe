#!/usr/bin/env python3
"""
Script para promover um usuário a admin
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.models.base import db
from src.models.user import User
from app import create_app

def promote_user_to_admin(email):
    """Promove um usuário a admin pelo email"""
    app = create_app()
    
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"Usuário com email {email} não encontrado")
            return False
        
        user.is_admin = True
        db.session.commit()
        print(f"Usuário {user.username} ({user.email}) promovido a admin com sucesso!")
        return True

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python promote_admin.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    promote_user_to_admin(email)