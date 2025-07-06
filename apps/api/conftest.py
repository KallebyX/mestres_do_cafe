import pytest
import tempfile
import os
from flask import Flask
from src.app import create_app
from src.models.base import db
from src.models.user import User
from werkzeug.security import generate_password_hash
import jwt
from datetime import datetime, timedelta, timezone
import logging

@pytest.fixture(scope='session')
def app():
    """Cria uma instância da aplicação Flask para testes"""
    # Criar um banco de dados temporário
    db_fd, db_path = tempfile.mkstemp()
    
    # Configurar variáveis de ambiente para testes
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
    os.environ['SECRET_KEY'] = 'test-secret-key'
    os.environ['JWT_SECRET_KEY'] = 'test-jwt-secret-key'
    
    # Criar aplicação para testes
    app = create_app('testing')
    
    # Configurar contexto da aplicação
    with app.app_context():
        # Criar todas as tabelas
        db.create_all()
        
        # Criar dados de teste
        create_test_data()
        
        yield app
        
        # Cleanup
        db.drop_all()
    
    # Fechar e remover arquivo temporário
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture(scope='function')
def client(app):
    """Cria um cliente de teste para fazer requisições"""
    return app.test_client()

@pytest.fixture(scope='function')
def runner(app):
    """Cria um runner de comandos CLI para testes"""
    return app.test_cli_runner()

@pytest.fixture(scope='function')
def db_session(app):
    """Cria uma sessão de banco de dados para testes"""
    with app.app_context():
        yield db.session
        db.session.rollback()

def create_test_data():
    """Cria dados de teste no banco"""
    try:
        # Criar usuário administrador
        admin_user = User(
            email='admin@test.com',
            password_hash=generate_password_hash('admin123'),
            username='admin',
            first_name='Admin',
            last_name='User',
            is_admin=True,
            is_active=True,
            email_verified=True
        )
        db.session.add(admin_user)
        
        # Criar usuário comum
        regular_user = User(
            email='user@test.com',
            password_hash=generate_password_hash('user123'),
            username='user',
            first_name='Regular',
            last_name='User',
            is_admin=False,
            is_active=True,
            email_verified=True
        )
        db.session.add(regular_user)
        
        # Criar usuário inativo
        inactive_user = User(
            email='inactive@test.com',
            password_hash=generate_password_hash('inactive123'),
            username='inactive',
            first_name='Inactive',
            last_name='User',
            is_admin=False,
            is_active=False,
            email_verified=False
        )
        db.session.add(inactive_user)
        
        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao criar dados de teste: {e}")

@pytest.fixture
def admin_user(app):
    """Retorna o usuário administrador de teste"""
    with app.app_context():
        return User.query.filter_by(email='admin@test.com').first()

@pytest.fixture
def regular_user(app):
    """Retorna o usuário comum de teste"""
    with app.app_context():
        return User.query.filter_by(email='user@test.com').first()

@pytest.fixture
def inactive_user(app):
    """Retorna o usuário inativo de teste"""
    with app.app_context():
        return User.query.filter_by(email='inactive@test.com').first()

@pytest.fixture
def admin_token(app, admin_user):
    """Gera token JWT para o usuário administrador"""
    with app.app_context():
        token_payload = {
            'user_id': admin_user.id,
            'email': admin_user.email,
            'username': admin_user.username,
            'is_admin': admin_user.is_admin,
            'exp': datetime.now(timezone.utc) + timedelta(hours=1)
        }
        return jwt.encode(token_payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

@pytest.fixture
def user_token(app, regular_user):
    """Gera token JWT para o usuário comum"""
    with app.app_context():
        token_payload = {
            'user_id': regular_user.id,
            'email': regular_user.email,
            'username': regular_user.username,
            'is_admin': regular_user.is_admin,
            'exp': datetime.now(timezone.utc) + timedelta(hours=1)
        }
        return jwt.encode(token_payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

@pytest.fixture
def expired_token(app, regular_user):
    """Gera token JWT expirado"""
    with app.app_context():
        token_payload = {
            'user_id': regular_user.id,
            'email': regular_user.email,
            'username': regular_user.username,
            'is_admin': regular_user.is_admin,
            'exp': datetime.now(timezone.utc) - timedelta(hours=1)  # Expirado
        }
        return jwt.encode(token_payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

@pytest.fixture
def admin_headers(admin_token):
    """Headers HTTP com token de administrador"""
    return {
        'Authorization': f'Bearer {admin_token}',
        'Content-Type': 'application/json'
    }

@pytest.fixture
def user_headers(user_token):
    """Headers HTTP com token de usuário comum"""
    return {
        'Authorization': f'Bearer {user_token}',
        'Content-Type': 'application/json'
    }

@pytest.fixture
def expired_headers(expired_token):
    """Headers HTTP com token expirado"""
    return {
        'Authorization': f'Bearer {expired_token}',
        'Content-Type': 'application/json'
    }

@pytest.fixture
def invalid_headers():
    """Headers HTTP com token inválido"""
    return {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
    }

@pytest.fixture
def no_auth_headers():
    """Headers HTTP sem autenticação"""
    return {
        'Content-Type': 'application/json'
    }

class TestHelpers:
    """Classe com métodos auxiliares para testes"""
    
    @staticmethod
    def login_user(client, email, password):
        """Faz login de um usuário e retorna o token"""
        response = client.post('/api/auth/login', json={
            'email': email,
            'password': password
        })
        if response.status_code == 200:
            return response.json['token']
        return None
    
    @staticmethod
    def create_auth_headers(token):
        """Cria headers de autenticação"""
        return {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    @staticmethod
    def assert_error_response(response, expected_status=400):
        """Verifica se a resposta é um erro esperado"""
        assert response.status_code == expected_status
        assert 'error' in response.json
        assert response.json['error'] is not None
    
    @staticmethod
    def assert_success_response(response, expected_status=200):
        """Verifica se a resposta é um sucesso esperado"""
        assert response.status_code == expected_status
        assert 'success' in response.json
        assert response.json['success'] is True
    
    @staticmethod
    def assert_validation_error(response, field=None):
        """Verifica se a resposta é um erro de validação"""
        assert response.status_code == 400
        assert 'error' in response.json
        if field:
            assert field in str(response.json)

@pytest.fixture
def helpers():
    """Instância da classe de helpers"""
    return TestHelpers()

# Configuração para capturar logs durante os testes
@pytest.fixture(autouse=True)
def configure_logging(caplog):
    """Configura logging para testes"""
    caplog.set_level(logging.INFO)

# Fixtures para dados de teste específicos
@pytest.fixture
def sample_product_data():
    """Dados de exemplo para criação de produto"""
    return {
        'name': 'Café Especial Teste',
        'description': 'Café especial para testes',
        'price': 29.99,
        'category': 'Especiais',
        'stock_quantity': 100,
        'is_active': True
    }

@pytest.fixture
def sample_user_data():
    """Dados de exemplo para criação de usuário"""
    return {
        'email': 'newuser@test.com',
        'password': 'NewUser123!',
        'confirm_password': 'NewUser123!',
        'name': 'New User'
    }

@pytest.fixture
def sample_invalid_user_data():
    """Dados inválidos para teste de validação"""
    return {
        'email': 'invalid-email',
        'password': '123',  # Muito curta
        'name': 'A'  # Muito curto
    }

# Configuração para limpeza entre testes
@pytest.fixture(autouse=True)
def reset_database(db_session):
    """Limpa o banco de dados entre testes"""
    yield
    # Rollback para garantir que não há transações pendentes
    db_session.rollback()

# Configuração para testes de integração
@pytest.fixture
def integration_app():
    """Aplicação configurada para testes de integração"""
    app = create_app('testing')
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    return app