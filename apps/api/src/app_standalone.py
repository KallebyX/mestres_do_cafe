"""
App Flask para uso em scripts standalone
"""
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Criar instâncias
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    """Criar e configurar app Flask"""
    app = Flask(__name__)
    
    # Configurações básicas
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL', 
        'sqlite:///mestres_cafe.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    
    # Inicializar extensões
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Importar modelos
    with app.app_context():
        from models import user, products, orders, stock, checkout, wishlist, melhor_envio
    
    return app

# Criar app
app = create_app()