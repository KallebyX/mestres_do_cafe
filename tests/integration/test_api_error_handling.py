"""
Testes de integração para tratamento de erros da API
Testa cenários reais de erro em endpoints da API
"""

import pytest
import json
import jwt
from datetime import datetime, timedelta
from unittest.mock import patch, Mock
from flask import Flask
from sqlalchemy.exc import IntegrityError, DataError

from apps.api.src.app import create_app
from apps.api.src.models.base import db
from apps.api.src.models.user import User
from apps.api.src.models.products import Product, Category
from apps.api.src.middleware.error_handler import ErrorCode

class TestAuthenticationErrorIntegration:
    """Testa erros de autenticação em cenários reais"""
    
    @pytest.fixture
    def app(self):
        """Cria aplicação de teste"""
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def client(self, app):
        """Cliente de teste"""
        return app.test_client()
    
    def test_missing_authorization_header(self, client):
        """Testa endpoint protegido sem header de autorização"""
        response = client.get('/api/auth/profile')
        data = json.loads(response.data)
        
        assert response.status_code == 401
        assert data['error']['code'] == ErrorCode.MISSING_TOKEN
        assert 'error_id' in data['error']
        assert 'timestamp' in data['error']
    
    def test_invalid_token_format(self, client):
        """Testa token com formato inválido"""
        headers = {'Authorization': 'Bearer token-invalido'}
        response = client.get('/api/auth/profile', headers=headers)
        data = json.loads(response.data)
        
        assert response.status_code == 401
        assert data['error']['code'] == ErrorCode.INVALID_TOKEN
    
    def test_expired_token(self, client):
        """Testa token expirado"""
        # Cria token expirado
        expired_payload = {
            'user_id': 1,
            'exp': datetime.utcnow() - timedelta(hours=1)
        }
        # Use secure dynamic secret for testing
        import secrets
        test_secret = secrets.token_urlsafe(32)
        expired_token = jwt.encode(expired_payload, test_secret, algorithm='HS256')
        
        headers = {'Authorization': f'Bearer {expired_token}'}
        response = client.get('/api/auth/profile', headers=headers)
        data = json.loads(response.data)
        
        assert response.status_code == 401
        assert data['error']['code'] == ErrorCode.EXPIRED_TOKEN
        assert data['error']['message'] == 'Token expirado'
    
    def test_invalid_credentials_login(self, client):
        """Testa login com credenciais inválidas"""
        login_data = {
            'email': 'usuario@inexistente.com',
            'password': 'senha-errada'
        }
        
        response = client.post('/api/auth/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 401
        assert data['error']['code'] == ErrorCode.INVALID_CREDENTIALS

class TestValidationErrorIntegration:
    """Testa erros de validação em cenários reais"""
    
    @pytest.fixture
    def app(self):
        """Cria aplicação de teste"""
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def client(self, app):
        """Cliente de teste"""
        return app.test_client()
    
    def test_missing_required_fields_user_registration(self, client):
        """Testa registro de usuário com campos obrigatórios ausentes"""
        incomplete_data = {
            'email': 'usuario@test.com'
            # Faltando: name, password
        }
        
        response = client.post('/api/auth/register',
                             data=json.dumps(incomplete_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert data['error']['code'] == ErrorCode.VALIDATION_ERROR
        assert 'missing_fields' in data['error']['details']
        assert 'name' in data['error']['details']['missing_fields']
        assert 'password' in data['error']['details']['missing_fields']
    
    def test_invalid_email_format(self, client):
        """Testa registro com email inválido"""
        invalid_data = {
            'name': 'João Silva',
            'email': 'email-invalido',
            'password': 'senha123'
        }
        
        response = client.post('/api/auth/register',
                             data=json.dumps(invalid_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert data['error']['code'] == ErrorCode.VALIDATION_ERROR
        assert 'email' in data['error']['details']
    
    def test_weak_password(self, client):
        """Testa registro com senha fraca"""
        weak_password_data = {
            'name': 'João Silva',
            'email': 'joao@test.com',
            'password': '123'  # Senha muito fraca
        }
        
        response = client.post('/api/auth/register',
                             data=json.dumps(weak_password_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert data['error']['code'] == ErrorCode.VALIDATION_ERROR
        assert 'password' in data['error']['details']
    
    def test_invalid_product_data(self, client):
        """Testa criação de produto com dados inválidos"""
        invalid_product = {
            'name': '',  # Nome vazio
            'price': -10,  # Preço negativo
            'weight': 'abc',  # Peso não numérico
            'stock_quantity': -5  # Estoque negativo
        }
        
        # Simula usuário autenticado
        with patch('apps.api.src.middleware.auth.verify_token') as mock_verify:
            mock_verify.return_value = {'user_id': 1, 'role': 'admin'}
            
            response = client.post('/api/products',
                                 data=json.dumps(invalid_product),
                                 content_type='application/json',
                                 headers={'Authorization': 'Bearer valid-token'})
            data = json.loads(response.data)
        
        assert response.status_code == 400
        assert data['error']['code'] == ErrorCode.VALIDATION_ERROR
        assert 'type_errors' in data['error']['details']

class TestDatabaseErrorIntegration:
    """Testa erros de banco de dados em cenários reais"""
    
    @pytest.fixture
    def app(self):
        """Cria aplicação de teste"""
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def client(self, app):
        """Cliente de teste"""
        return app.test_client()
    
    def test_duplicate_email_registration(self, client):
        """Testa registro com email duplicado"""
        user_data = {
            'name': 'João Silva',
            'email': 'joao@test.com',
            'password': 'senha123456'
        }
        
        # Primeiro registro (deve funcionar)
        response1 = client.post('/api/auth/register',
                              data=json.dumps(user_data),
                              content_type='application/json')
        assert response1.status_code == 201
        
        # Segundo registro com mesmo email (deve falhar)
        response2 = client.post('/api/auth/register',
                              data=json.dumps(user_data),
                              content_type='application/json')
        data = json.loads(response2.data)
        
        assert response2.status_code == 409
        assert data['error']['code'] == ErrorCode.INTEGRITY_ERROR
        assert 'constraint' in data['error']['details']
    
    def test_foreign_key_violation(self, client):
        """Testa violação de chave estrangeira"""
        product_data = {
            'name': 'Café Especial',
            'price': 45.90,
            'weight': 500,
            'category_id': 999,  # Categoria inexistente
            'stock_quantity': 10
        }
        
        with patch('apps.api.src.middleware.auth.verify_token') as mock_verify:
            mock_verify.return_value = {'user_id': 1, 'role': 'admin'}
            
            response = client.post('/api/products',
                                 data=json.dumps(product_data),
                                 content_type='application/json',
                                 headers={'Authorization': 'Bearer valid-token'})
            data = json.loads(response.data)
        
        assert response.status_code == 409
        assert data['error']['code'] == ErrorCode.INTEGRITY_ERROR
    
    @patch('apps.api.src.models.base.db.session.commit')
    def test_database_connection_error(self, mock_commit, client):
        """Testa erro de conexão com banco de dados"""
        # Simula erro de conexão
        mock_commit.side_effect = Exception("Connection lost")
        
        user_data = {
            'name': 'João Silva',
            'email': 'joao@test.com',
            'password': 'senha123456'
        }
        
        response = client.post('/api/auth/register',
                             data=json.dumps(user_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 500
        assert data['error']['code'] == ErrorCode.INTERNAL_ERROR

class TestBusinessRuleErrorIntegration:
    """Testa erros de regras de negócio em cenários reais"""
    
    @pytest.fixture
    def app(self):
        """Cria aplicação de teste"""
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            
            # Cria dados de teste
            category = Category(name="Cafés Especiais", description="Cafés premium")
            db.session.add(category)
            db.session.flush()
            
            product = Product(
                name="Café Geisha",
                price=89.90,
                weight=250,
                category_id=category.id,
                stock_quantity=5  # Estoque baixo para teste
            )
            db.session.add(product)
            db.session.commit()
            
            yield app
            db.drop_all()
    
    @pytest.fixture
    def client(self, app):
        """Cliente de teste"""
        return app.test_client()
    
    def test_insufficient_stock_purchase(self, client):
        """Testa compra com estoque insuficiente"""
        cart_data = {
            'items': [
                {
                    'product_id': 1,
                    'quantity': 10  # Mais que o estoque disponível (5)
                }
            ]
        }
        
        with patch('apps.api.src.middleware.auth.verify_token') as mock_verify:
            mock_verify.return_value = {'user_id': 1}
            
            response = client.post('/api/cart/add',
                                 data=json.dumps(cart_data),
                                 content_type='application/json',
                                 headers={'Authorization': 'Bearer valid-token'})
            data = json.loads(response.data)
        
        assert response.status_code == 422
        assert data['error']['code'] == ErrorCode.INSUFFICIENT_STOCK
        assert 'Estoque insuficiente' in data['error']['message']
    
    def test_invalid_discount_code(self, client):
        """Testa aplicação de código de desconto inválido"""
        discount_data = {
            'code': 'DESCONTO_INEXISTENTE'
        }
        
        with patch('apps.api.src.middleware.auth.verify_token') as mock_verify:
            mock_verify.return_value = {'user_id': 1}
            
            response = client.post('/api/cart/apply-discount',
                                 data=json.dumps(discount_data),
                                 content_type='application/json',
                                 headers={'Authorization': 'Bearer valid-token'})
            data = json.loads(response.data)
        
        assert response.status_code == 422
        assert data['error']['code'] == ErrorCode.BUSINESS_RULE_VIOLATION
    
    def test_order_minimum_value_not_met(self, client):
        """Testa pedido que não atinge valor mínimo"""
        order_data = {
            'items': [
                {
                    'product_id': 1,
                    'quantity': 1  # Valor muito baixo
                }
            ],
            'payment_method': 'credit_card'
        }
        
        with patch('apps.api.src.middleware.auth.verify_token') as mock_verify:
            mock_verify.return_value = {'user_id': 1}
            
            response = client.post('/api/orders',
                                 data=json.dumps(order_data),
                                 content_type='application/json',
                                 headers={'Authorization': 'Bearer valid-token'})
            data = json.loads(response.data)
        
        assert response.status_code == 422
        assert data['error']['code'] == ErrorCode.BUSINESS_RULE_VIOLATION

class TestResourceErrorIntegration:
    """Testa erros de recursos em cenários reais"""
    
    @pytest.fixture
    def app(self):
        """Cria aplicação de teste"""
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def client(self, app):
        """Cliente de teste"""
        return app.test_client()
    
    def test_product_not_found(self, client):
        """Testa busca de produto inexistente"""
        response = client.get('/api/products/999')
        data = json.loads(response.data)
        
        assert response.status_code == 404
        assert data['error']['code'] == ErrorCode.RESOURCE_NOT_FOUND
        assert 'Produto não encontrado' in data['error']['message']
    
    def test_user_not_found(self, client):
        """Testa busca de usuário inexistente"""
        with patch('apps.api.src.middleware.auth.verify_token') as mock_verify:
            mock_verify.return_value = {'user_id': 1, 'role': 'admin'}
            
            response = client.get('/api/users/999',
                                headers={'Authorization': 'Bearer valid-token'})
            data = json.loads(response.data)
        
        assert response.status_code == 404
        assert data['error']['code'] == ErrorCode.RESOURCE_NOT_FOUND
    
    def test_order_not_found(self, client):
        """Testa busca de pedido inexistente"""
        with patch('apps.api.src.middleware.auth.verify_token') as mock_verify:
            mock_verify.return_value = {'user_id': 1}
            
            response = client.get('/api/orders/999',
                                headers={'Authorization': 'Bearer valid-token'})
            data = json.loads(response.data)
        
        assert response.status_code == 404
        assert data['error']['code'] == ErrorCode.RESOURCE_NOT_FOUND

class TestAuthorizationErrorIntegration:
    """Testa erros de autorização em cenários reais"""
    
    @pytest.fixture
    def app(self):
        """Cria aplicação de teste"""
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def client(self, app):
        """Cliente de teste"""
        return app.test_client()
    
    def test_insufficient_permissions_admin_endpoint(self, client):
        """Testa acesso a endpoint admin sem permissões"""
        with patch('apps.api.src.middleware.auth.verify_token') as mock_verify:
            mock_verify.return_value = {'user_id': 1, 'role': 'customer'}  # Não é admin
            
            response = client.get('/api/admin/users',
                                headers={'Authorization': 'Bearer valid-token'})
            data = json.loads(response.data)
        
        assert response.status_code == 403
        assert data['error']['code'] == ErrorCode.INSUFFICIENT_PERMISSIONS
    
    def test_access_other_user_data(self, client):
        """Testa acesso a dados de outro usuário"""
        with patch('apps.api.src.middleware.auth.verify_token') as mock_verify:
            mock_verify.return_value = {'user_id': 1}  # Usuário 1 tentando acessar dados do usuário 2
            
            response = client.get('/api/users/2/orders',
                                headers={'Authorization': 'Bearer valid-token'})
            data = json.loads(response.data)
        
        assert response.status_code == 403
        assert data['error']['code'] == ErrorCode.RESOURCE_ACCESS_DENIED

class TestErrorLoggingIntegration:
    """Testa logging de erros em cenários reais"""
    
    @pytest.fixture
    def app(self):
        """Cria aplicação de teste"""
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def client(self, app):
        """Cliente de teste"""
        return app.test_client()
    
    @patch('apps.api.src.middleware.error_handler.logger')
    def test_error_logging_with_context(self, mock_logger, client):
        """Testa se erros são logados com contexto completo"""
        # Força um erro de validação
        response = client.post('/api/auth/register',
                             data=json.dumps({}),  # Dados vazios
                             content_type='application/json')
        
        # Verifica se o logger foi chamado
        assert mock_logger.warning.called or mock_logger.error.called
        
        # Verifica se o contexto foi incluído no log
        call_args = (mock_logger.warning.call_args or mock_logger.error.call_args)[0][0]
        assert 'error_id' in call_args
        assert 'request_method' in call_args
        assert 'request_url' in call_args
    
    @patch('apps.api.src.middleware.error_handler.logger')
    def test_sensitive_data_not_logged(self, mock_logger, client):
        """Testa se dados sensíveis não são logados"""
        sensitive_data = {
            'email': 'test@test.com',
            'password': 'senha-super-secreta',
            'credit_card': '1234567890123456'
        }
        
        response = client.post('/api/auth/register',
                             data=json.dumps(sensitive_data),
                             content_type='application/json')
        
        # Verifica se dados sensíveis não aparecem nos logs
        if mock_logger.warning.called or mock_logger.error.called:
            call_args = (mock_logger.warning.call_args or mock_logger.error.call_args)[0][0]
            assert 'senha-super-secreta' not in call_args
            assert '1234567890123456' not in call_args

class TestErrorRecoveryIntegration:
    """Testa recuperação de erros em cenários reais"""
    
    @pytest.fixture
    def app(self):
        """Cria aplicação de teste"""
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def client(self, app):
        """Cliente de teste"""
        return app.test_client()
    
    def test_partial_failure_rollback(self, client):
        """Testa rollback em caso de falha parcial"""
        # Simula operação que falha no meio
        with patch('apps.api.src.models.base.db.session.commit') as mock_commit:
            mock_commit.side_effect = Exception("Database error")
            
            user_data = {
                'name': 'João Silva',
                'email': 'joao@test.com',
                'password': 'senha123456'
            }
            
            response = client.post('/api/auth/register',
                                 data=json.dumps(user_data),
                                 content_type='application/json')
            
            # Verifica se retornou erro
            assert response.status_code == 500
            
            # Verifica se não criou dados inconsistentes
            # (isso seria verificado consultando o banco)
    
    def test_retry_mechanism(self, client):
        """Testa mecanismo de retry para operações que falharam"""
        # Este teste verificaria se operações são retentadas automaticamente
        # em caso de falhas temporárias (implementação específica)
        pass

class TestConcurrencyErrorIntegration:
    """Testa erros de concorrência em cenários reais"""
    
    @pytest.fixture
    def app(self):
        """Cria aplicação de teste"""
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def client(self, app):
        """Cliente de teste"""
        return app.test_client()
    
    def test_optimistic_locking_conflict(self, client):
        """Testa conflito de locking otimista"""
        # Este teste verificaria conflitos quando múltiplos usuários
        # tentam modificar o mesmo recurso simultaneamente
        pass
    
    def test_deadlock_detection(self, client):
        """Testa detecção de deadlock"""
        # Este teste verificaria se deadlocks são detectados e tratados
        pass

# Utilitários para testes
def create_test_user(app, email="test@test.com", role="customer"):
    """Cria usuário de teste"""
    with app.app_context():
        user = User(
            name="Test User",
            email=email,
            password_hash="hashed_password",
            role=role
        )
        db.session.add(user)
        db.session.commit()
        return user

def create_test_product(app, name="Test Product", stock=10):
    """Cria produto de teste"""
    with app.app_context():
        category = Category(name="Test Category", description="Test")
        db.session.add(category)
        db.session.flush()
        
        product = Product(
            name=name,
            price=29.90,
            weight=500,
            category_id=category.id,
            stock_quantity=stock
        )
        db.session.add(product)
        db.session.commit()
        return product

def generate_test_token(user_id=1, role="customer", expired=False):
    """Gera token de teste"""
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + (timedelta(hours=-1) if expired else timedelta(hours=1))
    }
    # Use a secure dynamically generated test secret
    import secrets
    test_jwt_secret = secrets.token_urlsafe(32)
    return jwt.encode(payload, test_jwt_secret, algorithm='HS256')

