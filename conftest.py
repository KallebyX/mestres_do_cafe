"""
Global test configuration and fixtures for Mestres do Café
"""

import os
import sys
import pytest
import jwt
from datetime import datetime, timedelta, timezone
from unittest.mock import Mock, patch

# Set required environment variables for testing
os.environ.setdefault('JWT_SECRET_KEY', 'test-jwt-secret-key')
os.environ.setdefault('SECRET_KEY', 'test-secret-key')
os.environ.setdefault('FLASK_ENV', 'testing')

# Add the API source directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'apps', 'api', 'src'))

# Import after path setup
from apps.api.src.app import create_app
from apps.api.src.models.base import db
from apps.api.src.models.user import User


@pytest.fixture(scope='session')
def app():
    """Create application for the tests."""
    app = create_app('testing')
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    """Create a test client for the app."""
    return app.test_client()


@pytest.fixture(scope='function')
def runner(app):
    """Create a test runner for the app's Click commands."""
    return app.test_cli_runner()


@pytest.fixture(scope='function')
def admin_user(app):
    """Create an admin user for testing."""
    with app.app_context():
        user = User(
            email='admin@test.com',
            username='admin',
            name='Admin User',
            is_admin=True,
            is_active=True
        )
        user.set_password('admin123')
        db.session.add(user)
        db.session.commit()
        yield user
        db.session.delete(user)
        db.session.commit()


@pytest.fixture(scope='function')
def regular_user(app):
    """Create a regular user for testing."""
    with app.app_context():
        user = User(
            email='user@example.com',
            username='user',
            name='Regular User',
            is_admin=False,
            is_active=True
        )
        user.set_password('UserPass123!')
        db.session.add(user)
        db.session.commit()
        yield user
        db.session.delete(user)
        db.session.commit()


@pytest.fixture(scope='function')
def inactive_user(app):
    """Create an inactive user for testing."""
    with app.app_context():
        user = User(
            email='inactive@example.com',
            username='inactive',
            name='Inactive User',
            is_admin=False,
            is_active=False
        )
        user.set_password('InactivePass123!')
        db.session.add(user)
        db.session.commit()
        yield user
        db.session.delete(user)
        db.session.commit()


@pytest.fixture(scope='function')
def admin_headers(app, admin_user):
    """Create authorization headers for admin user."""
    with app.app_context():
        token_payload = {
            'user_id': admin_user.id,
            'email': admin_user.email,
            'username': admin_user.username,
            'is_admin': admin_user.is_admin,
            'exp': datetime.now(timezone.utc) + timedelta(hours=1)
        }
        token = jwt.encode(token_payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')
        return {'Authorization': f'Bearer {token}'}


@pytest.fixture(scope='function')
def user_headers(app, regular_user):
    """Create authorization headers for regular user."""
    with app.app_context():
        token_payload = {
            'user_id': regular_user.id,
            'email': regular_user.email,
            'username': regular_user.username,
            'is_admin': regular_user.is_admin,
            'exp': datetime.now(timezone.utc) + timedelta(hours=1)
        }
        token = jwt.encode(token_payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')
        return {'Authorization': f'Bearer {token}'}


@pytest.fixture(scope='function')
def invalid_headers():
    """Create invalid authorization headers."""
    return {'Authorization': 'Bearer invalid_token_here'}


@pytest.fixture(scope='function')
def expired_headers(app):
    """Create expired authorization headers."""
    with app.app_context():
        token_payload = {
            'user_id': 1,
            'email': 'test@example.com',
            'username': 'test',
            'is_admin': False,
            'exp': datetime.now(timezone.utc) - timedelta(hours=1)  # Expired
        }
        token = jwt.encode(token_payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')
        return {'Authorization': f'Bearer {token}'}


@pytest.fixture(scope='function')
def sample_user_data():
    """Sample user data for testing."""
    return {
        'email': 'newuser@example.com',
        'name': 'New User',
        'password': 'NewUserPass123!',
        'confirm_password': 'NewUserPass123!'
    }


@pytest.fixture(scope='function')
def helpers():
    """Helper functions for tests."""
    class TestHelpers:
        @staticmethod
        def create_user_data(email=None, username=None, name=None, password=None):
            return {
                'email': email or 'test@example.com',
                'username': username or 'testuser',
                'name': name or 'Test User',
                'password': password or 'TestPass123!',
                'confirm_password': password or 'TestPass123!'
            }
    
    return TestHelpers()


@pytest.fixture(scope='function')
def mock_email_service():
    """Mock email service for testing."""
    with patch('apps.api.src.utils.email.send_email') as mock:
        mock.return_value = True
        yield mock


@pytest.fixture(scope='function')
def auth_client(client, admin_headers):
    """Authenticated client with admin headers."""
    client.headers = admin_headers
    return client


@pytest.fixture(scope='function')
def cache():
    """Mock cache for testing."""
    with patch('apps.api.src.utils.cache.cache') as mock_cache:
        mock_cache.get.return_value = None
        mock_cache.set.return_value = True
        mock_cache.delete.return_value = True
        yield mock_cache