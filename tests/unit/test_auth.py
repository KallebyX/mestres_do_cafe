import pytest
import json
from unittest.mock import patch
from apps.api.src.models.user import User
from apps.api.src.models.base import db

class TestAuthLogin:
    """Testes para o endpoint de login"""
    
    def test_login_success(self, client, helpers):
        """Testa login com credenciais válidas"""
        response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'admin123'
        })
        
        assert response.status_code == 200
        assert response.json['success'] is True
        assert 'token' in response.json
        assert 'user' in response.json
        assert response.json['user']['email'] == 'admin@test.com'
        assert response.json['user']['is_admin'] is True
    
    def test_login_invalid_credentials(self, client):
        """Testa login com credenciais inválidas"""
        response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        assert 'error' in response.json
    
    def test_login_nonexistent_user(self, client):
        """Testa login com usuário inexistente"""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@test.com',
            'password': 'password123'
        })
        
        assert response.status_code == 401
        assert 'error' in response.json
    
    def test_login_inactive_user(self, client):
        """Testa login com usuário inativo"""
        response = client.post('/api/auth/login', json={
            'email': 'inactive@test.com',
            'password': 'inactive123'
        })
        
        assert response.status_code == 401
        assert 'error' in response.json
    
    def test_login_missing_email(self, client):
        """Testa login sem email"""
        response = client.post('/api/auth/login', json={
            'password': 'password123'
        })
        
        assert response.status_code == 400
        assert 'error' in response.json
    
    def test_login_missing_password(self, client):
        """Testa login sem senha"""
        response = client.post('/api/auth/login', json={
            'email': 'admin@test.com'
        })
        
        assert response.status_code == 400
        assert 'error' in response.json
    
    def test_login_invalid_email_format(self, client):
        """Testa login com formato de email inválido"""
        response = client.post('/api/auth/login', json={
            'email': 'invalid-email',
            'password': 'password123'
        })
        
        assert response.status_code == 400
        assert 'error' in response.json
    
    def test_login_empty_credentials(self, client):
        """Testa login com credenciais vazias"""
        response = client.post('/api/auth/login', json={
            'email': '',
            'password': ''
        })
        
        assert response.status_code == 400
        assert 'error' in response.json
    
    def test_login_no_json_data(self, client):
        """Testa login sem dados JSON"""
        response = client.post('/api/auth/login')
        
        assert response.status_code == 400
        assert 'error' in response.json

class TestAuthRegister:
    """Testes para o endpoint de registro"""
    
    def test_register_success(self, client, sample_user_data):
        """Testa registro com dados válidos"""
        response = client.post('/api/auth/register', json=sample_user_data)
        
        assert response.status_code == 201
        assert response.json['success'] is True
        assert 'user' in response.json
        assert response.json['user']['email'] == sample_user_data['email']
        assert response.json['user']['is_admin'] is False
    
    def test_register_duplicate_email(self, client, sample_user_data):
        """Testa registro com email já existente"""
        # Primeiro registro
        client.post('/api/auth/register', json=sample_user_data)
        
        # Segundo registro com mesmo email
        response = client.post('/api/auth/register', json=sample_user_data)
        
        assert response.status_code == 409
        assert 'error' in response.json
    
    def test_register_missing_fields(self, client):
        """Testa registro com campos obrigatórios ausentes"""
        response = client.post('/api/auth/register', json={
            'email': 'test@test.com'
            # Faltam password e name
        })
        
        assert response.status_code == 400
        assert 'error' in response.json
    
    def test_register_invalid_email(self, client):
        """Testa registro com email inválido"""
        response = client.post('/api/auth/register', json={
            'email': 'invalid-email',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!',
            'name': 'Test User'
        })
        
        assert response.status_code == 400
        assert 'error' in response.json
    
    def test_register_weak_password(self, client):
        """Testa registro com senha fraca"""
        response = client.post('/api/auth/register', json={
            'email': 'test@test.com',
            'password': '123',
            'confirm_password': '123',
            'name': 'Test User'
        })
        
        assert response.status_code == 400
        assert 'error' in response.json
    
    def test_register_password_mismatch(self, client):
        """Testa registro com senhas diferentes"""
        response = client.post('/api/auth/register', json={
            'email': 'test@test.com',
            'password': 'ValidPass123!',
            'confirm_password': 'DifferentPass123!',
            'name': 'Test User'
        })
        
        assert response.status_code == 400
        assert 'error' in response.json
    
    def test_register_short_name(self, client):
        """Testa registro com nome muito curto"""
        response = client.post('/api/auth/register', json={
            'email': 'test@test.com',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!',
            'name': 'A'
        })
        
        assert response.status_code == 400
        assert 'error' in response.json

class TestAuthMe:
    """Testes para o endpoint /me"""
    
    def test_me_success(self, client, admin_headers):
        """Testa obtenção de dados do usuário autenticado"""
        response = client.get('/api/auth/me', headers=admin_headers)
        
        assert response.status_code == 200
        assert response.json['success'] is True
        assert 'user' in response.json
        assert response.json['user']['email'] == 'admin@test.com'
    
    def test_me_no_token(self, client):
        """Testa endpoint /me sem token"""
        response = client.get('/api/auth/me')
        
        assert response.status_code == 401
        assert 'error' in response.json
    
    def test_me_invalid_token(self, client, invalid_headers):
        """Testa endpoint /me com token inválido"""
        response = client.get('/api/auth/me', headers=invalid_headers)
        
        assert response.status_code == 401
        assert 'error' in response.json
    
    def test_me_expired_token(self, client, expired_headers):
        """Testa endpoint /me com token expirado"""
        response = client.get('/api/auth/me', headers=expired_headers)
        
        assert response.status_code == 401
        assert 'error' in response.json
    
    def test_me_malformed_token(self, client):
        """Testa endpoint /me com token malformado"""
        headers = {'Authorization': 'InvalidFormat token'}
        response = client.get('/api/auth/me', headers=headers)
        
        assert response.status_code == 401
        assert 'error' in response.json
    
    def test_me_inactive_user(self, client, app):
        """Testa endpoint /me com usuário inativo"""
        # Desativar usuário
        with app.app_context():
            user = User.query.filter_by(email='admin@test.com').first()
            user.is_active = False
            db.session.commit()
            
            # Tentar acessar endpoint
            response = client.get('/api/auth/me', headers={'Authorization': 'Bearer valid-token'})
            
            # Reativar usuário para outros testes
            user.is_active = True
            db.session.commit()
        
        assert response.status_code == 401
        assert 'error' in response.json

class TestAuthLogout:
    """Testes para o endpoint de logout"""
    
    def test_logout_success(self, client):
        """Testa logout"""
        response = client.post('/api/auth/logout')
        
        assert response.status_code == 200
        assert response.json['success'] is True
        assert 'message' in response.json

class TestAuthValidation:
    """Testes específicos para validação de dados"""
    
    def test_email_validation(self, client):
        """Testa validação de email"""
        invalid_emails = [
            'invalid-email',
            'user@',
            '@domain.com',
            'user.domain.com',
            'user@.com',
            'user@domain',
            ''
        ]
        
        for email in invalid_emails:
            response = client.post('/api/auth/login', json={
                'email': email,
                'password': 'password123'
            })
            assert response.status_code == 400
    
    def test_password_validation(self, client):
        """Testa validação de senha"""
        weak_passwords = [
            '123',
            'password',
            'PASSWORD',
            '12345678',
            'Weak123'  # Sem caracteres especiais
        ]
        
        for password in weak_passwords:
            response = client.post('/api/auth/register', json={
                'email': 'test@test.com',
                'password': password,
                'confirm_password': password,
                'name': 'Test User'
            })
            assert response.status_code == 400

class TestAuthSecurity:
    """Testes de segurança"""
    
    def test_sql_injection_attempt(self, client):
        """Testa tentativa de SQL injection"""
        response = client.post('/api/auth/login', json={
            'email': "admin@test.com'; DROP TABLE users; --",
            'password': 'password123'
        })
        
        # Deve ser tratado como email inválido
        assert response.status_code == 400
    
    def test_xss_attempt(self, client):
        """Testa tentativa de XSS"""
        response = client.post('/api/auth/register', json={
            'email': 'test@test.com',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!',
            'name': '<script>alert("xss")</script>'
        })
        
        # Deve ser aceito mas escapado
        assert response.status_code == 201
    
    def test_long_input_handling(self, client):
        """Testa tratamento de entradas muito longas"""
        long_string = 'a' * 1000
        
        response = client.post('/api/auth/login', json={
            'email': long_string + '@test.com',
            'password': 'password123'
        })
        
        assert response.status_code == 400

class TestAuthIntegration:
    """Testes de integração para fluxos completos"""
    
    def test_complete_registration_login_flow(self, client, sample_user_data):
        """Testa fluxo completo de registro e login"""
        # Registrar usuário
        register_response = client.post('/api/auth/register', json=sample_user_data)
        assert register_response.status_code == 201
        
        # Fazer login
        login_response = client.post('/api/auth/login', json={
            'email': sample_user_data['email'],
            'password': sample_user_data['password']
        })
        assert login_response.status_code == 200
        
        # Verificar dados do usuário
        token = login_response.json['token']
        me_response = client.get('/api/auth/me', headers={
            'Authorization': f'Bearer {token}'
        })
        assert me_response.status_code == 200
        assert me_response.json['user']['email'] == sample_user_data['email']
    
    def test_user_permissions(self, client, admin_headers, user_headers):
        """Testa diferentes níveis de permissão"""
        # Admin pode acessar
        admin_response = client.get('/api/auth/me', headers=admin_headers)
        assert admin_response.status_code == 200
        assert admin_response.json['user']['is_admin'] is True
        
        # Usuário comum também pode acessar seus próprios dados
        user_response = client.get('/api/auth/me', headers=user_headers)
        assert user_response.status_code == 200
        assert user_response.json['user']['is_admin'] is False

# Fixtures específicas para testes de auth
@pytest.fixture
def auth_client(client):
    """Cliente autenticado para testes"""
    # Fazer login e retornar cliente com token
    response = client.post('/api/auth/login', json={
        'email': 'admin@test.com',
        'password': 'admin123'
    })
    
    if response.status_code == 200:
        token = response.json['token']
        client.token = token
        return client
    
    return None

@pytest.fixture
def mock_email_service():
    """Mock do serviço de email para testes"""
    with patch('src.services.email_service.send_email') as mock:
        mock.return_value = True
        yield mock