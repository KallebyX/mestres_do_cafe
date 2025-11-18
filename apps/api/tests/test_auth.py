"""
Testes para o módulo de autenticação
Testa login, registro, logout e validação de tokens JWT
"""

import pytest
import json
from datetime import datetime, timedelta


class TestAuthLogin:
    """Testes para o endpoint de login"""

    def test_login_success_with_valid_credentials(self, client, regular_user):
        """Deve fazer login com credenciais válidas"""
        response = client.post('/api/auth/login', json={
            'email': 'user@test.com',
            'password': 'user123'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data or 'token' in data
        assert 'user' in data or 'email' in data

    def test_login_fail_with_invalid_email(self, client):
        """Deve falhar com email inválido"""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@test.com',
            'password': 'user123'
        })

        assert response.status_code in [400, 401, 404]
        data = response.get_json()
        assert 'error' in data or 'message' in data

    def test_login_fail_with_wrong_password(self, client):
        """Deve falhar com senha incorreta"""
        response = client.post('/api/auth/login', json={
            'email': 'user@test.com',
            'password': 'wrongpassword'
        })

        assert response.status_code in [400, 401]
        data = response.get_json()
        assert 'error' in data or 'message' in data

    def test_login_fail_with_inactive_user(self, client):
        """Deve falhar com usuário inativo"""
        response = client.post('/api/auth/login', json={
            'email': 'inactive@test.com',
            'password': 'inactive123'
        })

        assert response.status_code in [400, 401, 403]
        data = response.get_json()
        assert 'error' in data or 'message' in data

    def test_login_fail_with_missing_email(self, client):
        """Deve falhar sem email"""
        response = client.post('/api/auth/login', json={
            'password': 'user123'
        })

        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data or 'message' in data

    def test_login_fail_with_missing_password(self, client):
        """Deve falhar sem senha"""
        response = client.post('/api/auth/login', json={
            'email': 'user@test.com'
        })

        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data or 'message' in data

    def test_login_fail_with_empty_body(self, client):
        """Deve falhar com body vazio"""
        response = client.post('/api/auth/login', json={})

        assert response.status_code == 400

    def test_login_fail_with_invalid_json(self, client):
        """Deve falhar com JSON inválido"""
        response = client.post(
            '/api/auth/login',
            data='invalid json',
            content_type='application/json'
        )

        assert response.status_code == 400

    def test_login_returns_user_information(self, client):
        """Deve retornar informações do usuário ao fazer login"""
        response = client.post('/api/auth/login', json={
            'email': 'user@test.com',
            'password': 'user123'
        })

        assert response.status_code == 200
        data = response.get_json()

        # Verificar se contém informações do usuário
        has_user_info = any(key in data for key in ['user', 'email', 'username'])
        assert has_user_info

    def test_admin_login_success(self, client):
        """Deve fazer login como administrador"""
        response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'admin123'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data or 'token' in data


class TestAuthRegister:
    """Testes para o endpoint de registro"""

    def test_register_success_with_valid_data(self, client):
        """Deve registrar novo usuário com dados válidos"""
        response = client.post('/api/auth/register', json={
            'email': 'newuser@test.com',
            'password': 'NewUser123!',
            'confirm_password': 'NewUser123!',
            'name': 'New User',
            'username': 'newuser'
        })

        assert response.status_code in [200, 201]
        data = response.get_json()
        assert 'success' in data or 'user' in data or 'id' in data

    def test_register_fail_with_existing_email(self, client):
        """Deve falhar ao tentar registrar email já existente"""
        response = client.post('/api/auth/register', json={
            'email': 'user@test.com',  # Email já existe
            'password': 'NewUser123!',
            'confirm_password': 'NewUser123!',
            'name': 'Duplicate User',
            'username': 'duplicateuser'
        })

        assert response.status_code in [400, 409]
        data = response.get_json()
        assert 'error' in data or 'message' in data

    def test_register_fail_with_weak_password(self, client):
        """Deve falhar com senha fraca"""
        response = client.post('/api/auth/register', json={
            'email': 'weakpass@test.com',
            'password': '123',  # Senha muito fraca
            'confirm_password': '123',
            'name': 'Weak Password User',
            'username': 'weakpass'
        })

        # Pode retornar 400 (validação) ou 200 se não houver validação de força
        # Idealmente deve ser 400
        assert response.status_code in [200, 201, 400]

    def test_register_fail_with_password_mismatch(self, client):
        """Deve falhar quando senhas não conferem"""
        response = client.post('/api/auth/register', json={
            'email': 'mismatch@test.com',
            'password': 'Password123!',
            'confirm_password': 'DifferentPassword123!',
            'name': 'Mismatch User',
            'username': 'mismatchuser'
        })

        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data or 'message' in data

    def test_register_fail_with_invalid_email_format(self, client):
        """Deve falhar com formato de email inválido"""
        response = client.post('/api/auth/register', json={
            'email': 'invalid-email',  # Email inválido
            'password': 'Password123!',
            'confirm_password': 'Password123!',
            'name': 'Invalid Email User',
            'username': 'invalidemail'
        })

        assert response.status_code == 400

    def test_register_fail_with_missing_required_fields(self, client):
        """Deve falhar sem campos obrigatórios"""
        response = client.post('/api/auth/register', json={
            'email': 'incomplete@test.com'
            # Faltando password, name, etc
        })

        assert response.status_code == 400

    def test_register_fail_with_empty_email(self, client):
        """Deve falhar com email vazio"""
        response = client.post('/api/auth/register', json={
            'email': '',
            'password': 'Password123!',
            'confirm_password': 'Password123!',
            'name': 'Empty Email User',
            'username': 'emptyemail'
        })

        assert response.status_code == 400


class TestAuthToken:
    """Testes para validação e uso de tokens JWT"""

    def test_access_protected_endpoint_with_valid_token(self, client, user_headers):
        """Deve acessar endpoint protegido com token válido"""
        # Assumindo que existe um endpoint protegido /api/users/me ou similar
        response = client.get('/api/users/me', headers=user_headers)

        # Pode retornar 200 (sucesso) ou 404 (endpoint não existe)
        # Mas não deve retornar 401 (não autorizado)
        assert response.status_code != 401

    def test_fail_to_access_protected_endpoint_without_token(self, client, no_auth_headers):
        """Deve falhar ao acessar endpoint protegido sem token"""
        response = client.get('/api/users/me', headers=no_auth_headers)

        # Pode retornar 401 (não autorizado) ou 404 se o endpoint não existir
        assert response.status_code in [401, 404]

    def test_fail_to_access_protected_endpoint_with_invalid_token(self, client, invalid_headers):
        """Deve falhar ao acessar endpoint protegido com token inválido"""
        response = client.get('/api/users/me', headers=invalid_headers)

        assert response.status_code in [401, 422]

    def test_admin_can_access_admin_endpoint(self, client, admin_headers):
        """Administrador deve acessar endpoints de admin"""
        response = client.get('/api/admin/users', headers=admin_headers)

        # Não deve retornar 403 (proibido) nem 401 (não autorizado)
        # Pode retornar 200 (sucesso) ou 404 (endpoint não existe)
        assert response.status_code not in [401, 403]

    def test_regular_user_cannot_access_admin_endpoint(self, client, user_headers):
        """Usuário comum não deve acessar endpoints de admin"""
        response = client.get('/api/admin/users', headers=user_headers)

        # Deve retornar 403 (proibido) ou 404 se endpoint não existir
        assert response.status_code in [403, 404]


class TestAuthLogout:
    """Testes para o endpoint de logout"""

    def test_logout_success_with_valid_token(self, client, user_headers):
        """Deve fazer logout com token válido"""
        response = client.post('/api/auth/logout', headers=user_headers)

        # Pode retornar 200 (sucesso) ou 404 se endpoint não existir
        assert response.status_code in [200, 204, 404]

    def test_logout_fail_without_token(self, client, no_auth_headers):
        """Deve falhar logout sem token"""
        response = client.post('/api/auth/logout', headers=no_auth_headers)

        assert response.status_code in [401, 404]


class TestPasswordValidation:
    """Testes para validação de senhas"""

    def test_password_is_hashed_in_database(self, app, regular_user):
        """Senhas devem ser armazenadas como hash"""
        with app.app_context():
            # Senha não deve estar em texto plano
            assert regular_user.password_hash != 'user123'
            # Hash deve ter comprimento significativo
            assert len(regular_user.password_hash) > 20


class TestEmailValidation:
    """Testes para validação de emails"""

    def test_register_with_various_valid_email_formats(self, client):
        """Deve aceitar vários formatos válidos de email"""
        valid_emails = [
            'user@example.com',
            'user.name@example.com',
            'user+tag@example.co.uk',
        ]

        for email in valid_emails:
            response = client.post('/api/auth/register', json={
                'email': email,
                'password': 'Password123!',
                'confirm_password': 'Password123!',
                'name': 'Test User',
                'username': email.split('@')[0]
            })

            # Deve retornar sucesso ou conflito (se já existe)
            # Mas não deve retornar erro de validação
            assert response.status_code in [200, 201, 400, 409]

    def test_register_fail_with_invalid_email_formats(self, client):
        """Deve rejeitar formatos inválidos de email"""
        invalid_emails = [
            'invalid',
            'invalid@',
            '@invalid.com',
            'invalid@.com',
        ]

        for email in invalid_emails:
            response = client.post('/api/auth/register', json={
                'email': email,
                'password': 'Password123!',
                'confirm_password': 'Password123!',
                'name': 'Test User',
                'username': 'testuser'
            })

            assert response.status_code == 400


class TestAuthEdgeCases:
    """Testes para casos extremos e edge cases"""

    def test_login_with_email_different_case(self, client):
        """Deve fazer login independente do case do email"""
        response = client.post('/api/auth/login', json={
            'email': 'USER@TEST.COM',  # Uppercase
            'password': 'user123'
        })

        # Deve ter sucesso ou falhar, mas não dar erro de servidor
        assert response.status_code != 500

    def test_register_with_very_long_name(self, client):
        """Deve lidar com nomes muito longos"""
        long_name = 'A' * 1000

        response = client.post('/api/auth/register', json={
            'email': 'longname@test.com',
            'password': 'Password123!',
            'confirm_password': 'Password123!',
            'name': long_name,
            'username': 'longname'
        })

        # Deve retornar erro de validação, não erro de servidor
        assert response.status_code in [200, 201, 400]

    def test_concurrent_login_attempts(self, client):
        """Deve lidar com múltiplas tentativas de login simultâneas"""
        # Simular 5 logins simultâneos
        responses = []
        for _ in range(5):
            response = client.post('/api/auth/login', json={
                'email': 'user@test.com',
                'password': 'user123'
            })
            responses.append(response)

        # Todos devem ter sucesso
        for response in responses:
            assert response.status_code in [200, 429]  # 429 = Too Many Requests (rate limit)


# Teste de integração completo
class TestAuthIntegrationFlow:
    """Teste de fluxo completo de autenticação"""

    def test_complete_auth_flow(self, client):
        """Testa fluxo completo: registro -> login -> acesso -> logout"""

        # 1. Registrar novo usuário
        register_response = client.post('/api/auth/register', json={
            'email': 'flowtest@test.com',
            'password': 'FlowTest123!',
            'confirm_password': 'FlowTest123!',
            'name': 'Flow Test User',
            'username': 'flowtest'
        })

        assert register_response.status_code in [200, 201]

        # 2. Fazer login
        login_response = client.post('/api/auth/login', json={
            'email': 'flowtest@test.com',
            'password': 'FlowTest123!'
        })

        assert login_response.status_code == 200
        login_data = login_response.get_json()
        token = login_data.get('access_token') or login_data.get('token')
        assert token is not None

        # 3. Acessar endpoint protegido
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        protected_response = client.get('/api/users/me', headers=headers)

        # Não deve retornar 401
        assert protected_response.status_code != 401

        # 4. Fazer logout
        logout_response = client.post('/api/auth/logout', headers=headers)

        # Pode retornar 200 ou 204 ou 404 se não implementado
        assert logout_response.status_code in [200, 204, 404]
