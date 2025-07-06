"""
Testes unitários rigorosos para o sistema de tratamento de erros
Testa TODOS os cenários possíveis sem mascarar erros
"""

import pytest
import json
import jwt
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock
from flask import Flask
from sqlalchemy.exc import IntegrityError, DataError, SQLAlchemyError
from marshmallow import ValidationError

from apps.api.src.middleware.error_handler import (
    ErrorCode,
    APIError,
    ValidationAPIError,
    AuthenticationAPIError,
    AuthorizationAPIError,
    ResourceAPIError,
    BusinessAPIError,
    handle_validation_error,
    handle_sqlalchemy_error,
    handle_jwt_error,
    handle_http_exception,
    handle_api_error,
    handle_generic_error,
    register_error_handlers,
    error_handler_decorator,
    validate_required_fields,
    validate_field_types,
    validate_business_rules,
    log_error,
    get_request_data
)

class TestErrorCodes:
    """Testa códigos de erro padronizados"""
    
    def test_validation_error_codes(self):
        """Testa códigos de erro de validação"""
        assert ErrorCode.VALIDATION_ERROR == 4000
        assert ErrorCode.MISSING_FIELD == 4001
        assert ErrorCode.INVALID_FORMAT == 4002
        assert ErrorCode.INVALID_VALUE == 4003
    
    def test_authentication_error_codes(self):
        """Testa códigos de erro de autenticação"""
        assert ErrorCode.UNAUTHORIZED == 4100
        assert ErrorCode.INVALID_TOKEN == 4101
        assert ErrorCode.EXPIRED_TOKEN == 4102
        assert ErrorCode.MISSING_TOKEN == 4103
        assert ErrorCode.INVALID_CREDENTIALS == 4104
    
    def test_authorization_error_codes(self):
        """Testa códigos de erro de autorização"""
        assert ErrorCode.FORBIDDEN == 4200
        assert ErrorCode.INSUFFICIENT_PERMISSIONS == 4201
        assert ErrorCode.RESOURCE_ACCESS_DENIED == 4202
    
    def test_resource_error_codes(self):
        """Testa códigos de erro de recursos"""
        assert ErrorCode.RESOURCE_NOT_FOUND == 4300
        assert ErrorCode.RESOURCE_ALREADY_EXISTS == 4301
        assert ErrorCode.RESOURCE_CONFLICT == 4302
    
    def test_database_error_codes(self):
        """Testa códigos de erro de banco de dados"""
        assert ErrorCode.DATABASE_ERROR == 5000
        assert ErrorCode.CONNECTION_ERROR == 5001
        assert ErrorCode.INTEGRITY_ERROR == 5002
        assert ErrorCode.DATA_ERROR == 5003
    
    def test_system_error_codes(self):
        """Testa códigos de erro de sistema"""
        assert ErrorCode.INTERNAL_ERROR == 5100
        assert ErrorCode.SERVICE_UNAVAILABLE == 5101
        assert ErrorCode.TIMEOUT_ERROR == 5102
        assert ErrorCode.CONFIGURATION_ERROR == 5103
    
    def test_business_error_codes(self):
        """Testa códigos de erro de negócio"""
        assert ErrorCode.BUSINESS_RULE_VIOLATION == 6000
        assert ErrorCode.INSUFFICIENT_STOCK == 6001
        assert ErrorCode.INVALID_OPERATION == 6002
        assert ErrorCode.PAYMENT_FAILED == 6003

class TestAPIErrorClasses:
    """Testa classes de erro customizadas"""
    
    def test_api_error_basic(self):
        """Testa APIError básico"""
        error = APIError(
            message="Erro de teste",
            error_code=ErrorCode.INTERNAL_ERROR,
            status_code=500
        )
        
        assert error.message == "Erro de teste"
        assert error.error_code == ErrorCode.INTERNAL_ERROR
        assert error.status_code == 500
        assert error.details == {}
        assert error.cause is None
        assert isinstance(error.timestamp, str)
    
    def test_api_error_with_details_and_cause(self):
        """Testa APIError com detalhes e causa"""
        cause = ValueError("Erro original")
        details = {"field": "value", "extra": "info"}
        
        error = APIError(
            message="Erro com detalhes",
            error_code=ErrorCode.VALIDATION_ERROR,
            status_code=400,
            details=details,
            cause=cause
        )
        
        assert error.details == details
        assert error.cause == cause
    
    def test_validation_api_error(self):
        """Testa ValidationAPIError"""
        details = {"email": ["Campo obrigatório"]}
        error = ValidationAPIError("Dados inválidos", details)
        
        assert error.message == "Dados inválidos"
        assert error.error_code == ErrorCode.VALIDATION_ERROR
        assert error.status_code == 400
        assert error.details == details
    
    def test_authentication_api_error(self):
        """Testa AuthenticationAPIError"""
        error = AuthenticationAPIError("Token inválido", ErrorCode.INVALID_TOKEN)
        
        assert error.message == "Token inválido"
        assert error.error_code == ErrorCode.INVALID_TOKEN
        assert error.status_code == 401
    
    def test_authorization_api_error(self):
        """Testa AuthorizationAPIError"""
        error = AuthorizationAPIError("Acesso negado", ErrorCode.INSUFFICIENT_PERMISSIONS)
        
        assert error.message == "Acesso negado"
        assert error.error_code == ErrorCode.INSUFFICIENT_PERMISSIONS
        assert error.status_code == 403
    
    def test_resource_api_error(self):
        """Testa ResourceAPIError"""
        error = ResourceAPIError("Recurso não encontrado", ErrorCode.RESOURCE_NOT_FOUND, 404)
        
        assert error.message == "Recurso não encontrado"
        assert error.error_code == ErrorCode.RESOURCE_NOT_FOUND
        assert error.status_code == 404
    
    def test_business_api_error(self):
        """Testa BusinessAPIError"""
        error = BusinessAPIError("Estoque insuficiente", ErrorCode.INSUFFICIENT_STOCK)
        
        assert error.message == "Estoque insuficiente"
        assert error.error_code == ErrorCode.INSUFFICIENT_STOCK
        assert error.status_code == 422

class TestErrorLogging:
    """Testa sistema de logging de erros"""
    
    @patch('apps.api.src.middleware.error_handler.logger')
    def test_log_error_api_error_warning(self, mock_logger):
        """Testa log de APIError com status 4xx (warning)"""
        error = ValidationAPIError("Erro de validação")
        request_data = {
            'method': 'POST',
            'url': 'http://test.com/api/test',
            'headers': {'Content-Type': 'application/json'},
            'data': {'field': 'value'},
            'user_agent': 'test-agent',
            'remote_addr': '127.0.0.1'
        }
        
        error_id = log_error(error, request_data)
        
        assert error_id.startswith('ERR_')
        mock_logger.warning.assert_called_once()
        
        # Verifica se o contexto foi logado corretamente
        call_args = mock_logger.warning.call_args[0][0]
        assert 'API Warning:' in call_args
        assert error_id in call_args
    
    @patch('apps.api.src.middleware.error_handler.logger')
    def test_log_error_api_error_error(self, mock_logger):
        """Testa log de APIError com status 5xx (error)"""
        error = APIError("Erro interno", ErrorCode.INTERNAL_ERROR, 500)
        request_data = {'method': 'GET', 'url': 'http://test.com'}
        
        error_id = log_error(error, request_data)
        
        mock_logger.error.assert_called_once()
        call_args = mock_logger.error.call_args[0][0]
        assert 'API Error:' in call_args
    
    @patch('apps.api.src.middleware.error_handler.logger')
    def test_log_error_generic_exception(self, mock_logger):
        """Testa log de exceção genérica"""
        error = ValueError("Erro genérico")
        request_data = {'method': 'POST'}
        
        error_id = log_error(error, request_data)
        
        mock_logger.error.assert_called_once()
        call_args = mock_logger.error.call_args[0][0]
        assert 'Unexpected Error:' in call_args
        assert 'traceback' in call_args.lower()
    
    @patch('apps.api.src.middleware.error_handler.request')
    def test_get_request_data_success(self, mock_request):
        """Testa extração bem-sucedida de dados da requisição"""
        mock_request.method = 'POST'
        mock_request.url = 'http://test.com/api/test'
        mock_request.headers = {'Content-Type': 'application/json'}
        mock_request.get_json.return_value = {'field': 'value'}
        mock_request.user_agent.string = 'test-agent'
        mock_request.remote_addr = '127.0.0.1'
        
        data = get_request_data()
        
        assert data['method'] == 'POST'
        assert data['url'] == 'http://test.com/api/test'
        assert data['data'] == {'field': 'value'}
        assert data['user_agent'] == 'test-agent'
        assert data['remote_addr'] == '127.0.0.1'
    
    @patch('apps.api.src.middleware.error_handler.request')
    def test_get_request_data_exception(self, mock_request):
        """Testa tratamento de exceção na extração de dados"""
        mock_request.method.side_effect = Exception("Erro na requisição")
        
        data = get_request_data()
        
        assert data == {}

class TestErrorHandlers:
    """Testa handlers específicos de erro"""
    
    def test_handle_validation_error(self):
        """Testa handler de erro de validação"""
        validation_error = ValidationError({'email': ['Campo obrigatório']})
        
        with patch('apps.api.src.middleware.error_handler.get_request_data', return_value={}):
            with patch('apps.api.src.middleware.error_handler.log_error', return_value='ERR_123'):
                response_data, status_code = handle_validation_error(validation_error)
        
        assert status_code == 400
        assert response_data['error']['code'] == ErrorCode.VALIDATION_ERROR
        assert response_data['error']['message'] == 'Dados de entrada inválidos'
        assert response_data['error']['details'] == {'email': ['Campo obrigatório']}
        assert response_data['error']['error_id'] == 'ERR_123'
    
    def test_handle_sqlalchemy_integrity_error(self):
        """Testa handler de erro de integridade do SQLAlchemy"""
        orig_error = Mock()
        orig_error.__str__ = Mock(return_value="UNIQUE constraint failed")
        integrity_error = IntegrityError("statement", "params", orig_error)
        
        with patch('apps.api.src.middleware.error_handler.get_request_data', return_value={}):
            with patch('apps.api.src.middleware.error_handler.log_error', return_value='ERR_123'):
                response_data, status_code = handle_sqlalchemy_error(integrity_error)
        
        assert status_code == 409
        assert response_data['error']['code'] == ErrorCode.INTEGRITY_ERROR
        assert response_data['error']['message'] == 'Violação de integridade dos dados'
    
    def test_handle_sqlalchemy_data_error(self):
        """Testa handler de erro de dados do SQLAlchemy"""
        orig_error = Mock()
        orig_error.__str__ = Mock(return_value="Invalid data format")
        data_error = DataError("statement", "params", orig_error)
        
        with patch('apps.api.src.middleware.error_handler.get_request_data', return_value={}):
            with patch('apps.api.src.middleware.error_handler.log_error', return_value='ERR_123'):
                response_data, status_code = handle_sqlalchemy_error(data_error)
        
        assert status_code == 400
        assert response_data['error']['code'] == ErrorCode.DATA_ERROR
        assert response_data['error']['message'] == 'Erro nos dados fornecidos'
    
    def test_handle_sqlalchemy_generic_error(self):
        """Testa handler de erro genérico do SQLAlchemy"""
        generic_error = SQLAlchemyError("Erro genérico do banco")
        
        with patch('apps.api.src.middleware.error_handler.get_request_data', return_value={}):
            with patch('apps.api.src.middleware.error_handler.log_error', return_value='ERR_123'):
                response_data, status_code = handle_sqlalchemy_error(generic_error)
        
        assert status_code == 500
        assert response_data['error']['code'] == ErrorCode.DATABASE_ERROR
        assert response_data['error']['message'] == 'Erro interno do banco de dados'
    
    def test_handle_jwt_expired_error(self):
        """Testa handler de token JWT expirado"""
        jwt_error = jwt.ExpiredSignatureError("Token expirado")
        
        with patch('apps.api.src.middleware.error_handler.get_request_data', return_value={}):
            with patch('apps.api.src.middleware.error_handler.log_error', return_value='ERR_123'):
                response_data, status_code = handle_jwt_error(jwt_error)
        
        assert status_code == 401
        assert response_data['error']['code'] == ErrorCode.EXPIRED_TOKEN
        assert response_data['error']['message'] == 'Token expirado'
    
    def test_handle_jwt_invalid_error(self):
        """Testa handler de token JWT inválido"""
        jwt_error = jwt.InvalidTokenError("Token inválido")
        
        with patch('apps.api.src.middleware.error_handler.get_request_data', return_value={}):
            with patch('apps.api.src.middleware.error_handler.log_error', return_value='ERR_123'):
                response_data, status_code = handle_jwt_error(jwt_error)
        
        assert status_code == 401
        assert response_data['error']['code'] == ErrorCode.INVALID_TOKEN
        assert response_data['error']['message'] == 'Token inválido'
    
    def test_handle_api_error_with_details(self):
        """Testa handler de APIError com detalhes"""
        api_error = APIError(
            message="Erro customizado",
            error_code=ErrorCode.BUSINESS_RULE_VIOLATION,
            status_code=422,
            details={"field": "value"}
        )
        
        with patch('apps.api.src.middleware.error_handler.get_request_data', return_value={}):
            with patch('apps.api.src.middleware.error_handler.log_error', return_value='ERR_123'):
                response_data, status_code = handle_api_error(api_error)
        
        assert status_code == 422
        assert response_data['error']['code'] == ErrorCode.BUSINESS_RULE_VIOLATION
        assert response_data['error']['message'] == "Erro customizado"
        assert response_data['error']['details'] == {"field": "value"}
    
    def test_handle_api_error_with_cause_debug_mode(self):
        """Testa handler de APIError com causa em modo debug"""
        cause = ValueError("Erro original")
        api_error = APIError(
            message="Erro com causa",
            error_code=ErrorCode.INTERNAL_ERROR,
            cause=cause
        )
        
        with patch('apps.api.src.middleware.error_handler.get_request_data', return_value={}):
            with patch('apps.api.src.middleware.error_handler.log_error', return_value='ERR_123'):
                with patch('apps.api.src.middleware.error_handler.current_app') as mock_app:
                    mock_app.debug = True
                    response_data, status_code = handle_api_error(api_error)
        
        assert 'cause' in response_data['error']
        assert response_data['error']['cause'] == str(cause)
    
    def test_handle_generic_error_debug_mode(self):
        """Testa handler de erro genérico em modo debug"""
        generic_error = ValueError("Erro genérico")
        
        with patch('apps.api.src.middleware.error_handler.get_request_data', return_value={}):
            with patch('apps.api.src.middleware.error_handler.log_error', return_value='ERR_123'):
                with patch('apps.api.src.middleware.error_handler.current_app') as mock_app:
                    mock_app.debug = True
                    response_data, status_code = handle_generic_error(generic_error)
        
        assert status_code == 500
        assert response_data['error']['code'] == ErrorCode.INTERNAL_ERROR
        assert response_data['error']['message'] == str(generic_error)
        assert 'details' in response_data['error']
        assert 'traceback' in response_data['error']['details']
    
    def test_handle_generic_error_production_mode(self):
        """Testa handler de erro genérico em modo produção"""
        generic_error = ValueError("Erro genérico")
        
        with patch('apps.api.src.middleware.error_handler.get_request_data', return_value={}):
            with patch('apps.api.src.middleware.error_handler.log_error', return_value='ERR_123'):
                with patch('apps.api.src.middleware.error_handler.current_app') as mock_app:
                    mock_app.debug = False
                    response_data, status_code = handle_generic_error(generic_error)
        
        assert status_code == 500
        assert response_data['error']['message'] == 'Erro interno do servidor'
        assert 'details' not in response_data['error']

class TestErrorHandlerDecorator:
    """Testa decorator de tratamento de erros"""
    
    def test_decorator_success(self):
        """Testa decorator com função bem-sucedida"""
        @error_handler_decorator
        def test_function(x, y):
            return x + y
        
        result = test_function(2, 3)
        assert result == 5
    
    def test_decorator_api_error_passthrough(self):
        """Testa decorator com APIError (deve passar adiante)"""
        @error_handler_decorator
        def test_function():
            raise ValidationAPIError("Erro de validação")
        
        with pytest.raises(ValidationAPIError):
            test_function()
    
    def test_decorator_validation_error_passthrough(self):
        """Testa decorator com ValidationError (deve passar adiante)"""
        @error_handler_decorator
        def test_function():
            raise ValidationError("Erro de validação")
        
        with pytest.raises(ValidationError):
            test_function()
    
    def test_decorator_sqlalchemy_error_passthrough(self):
        """Testa decorator com SQLAlchemyError (deve passar adiante)"""
        @error_handler_decorator
        def test_function():
            raise SQLAlchemyError("Erro de banco")
        
        with pytest.raises(SQLAlchemyError):
            test_function()
    
    def test_decorator_generic_error_conversion(self):
        """Testa decorator convertendo erro genérico em APIError"""
        @error_handler_decorator
        def test_function():
            raise ValueError("Erro genérico")
        
        with pytest.raises(APIError) as exc_info:
            test_function()
        
        assert exc_info.value.error_code == ErrorCode.INTERNAL_ERROR
        assert "Erro inesperado em test_function" in exc_info.value.message
        assert isinstance(exc_info.value.cause, ValueError)

class TestValidationUtilities:
    """Testa utilitários de validação"""
    
    def test_validate_required_fields_success(self):
        """Testa validação bem-sucedida de campos obrigatórios"""
        data = {'name': 'João', 'email': 'joao@test.com', 'age': 30}
        required_fields = ['name', 'email']
        
        # Não deve levantar exceção
        validate_required_fields(data, required_fields)
    
    def test_validate_required_fields_missing(self):
        """Testa validação com campos obrigatórios ausentes"""
        data = {'name': 'João'}
        required_fields = ['name', 'email', 'age']
        
        with pytest.raises(ValidationAPIError) as exc_info:
            validate_required_fields(data, required_fields)
        
        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert 'missing_fields' in exc_info.value.details
        assert set(exc_info.value.details['missing_fields']) == {'email', 'age'}
    
    def test_validate_required_fields_none_values(self):
        """Testa validação com valores None"""
        data = {'name': 'João', 'email': None, 'age': 30}
        required_fields = ['name', 'email']
        
        with pytest.raises(ValidationAPIError) as exc_info:
            validate_required_fields(data, required_fields)
        
        assert 'email' in exc_info.value.details['missing_fields']
    
    def test_validate_field_types_success(self):
        """Testa validação bem-sucedida de tipos"""
        data = {'name': 'João', 'age': 30, 'active': True}
        field_types = {'name': str, 'age': int, 'active': bool}
        
        # Não deve levantar exceção
        validate_field_types(data, field_types)
    
    def test_validate_field_types_invalid(self):
        """Testa validação com tipos inválidos"""
        data = {'name': 'João', 'age': '30', 'active': 'true'}
        field_types = {'name': str, 'age': int, 'active': bool}
        
        with pytest.raises(ValidationAPIError) as exc_info:
            validate_field_types(data, field_types)
        
        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert 'type_errors' in exc_info.value.details
        assert 'age' in exc_info.value.details['type_errors']
        assert 'active' in exc_info.value.details['type_errors']
    
    def test_validate_field_types_none_values(self):
        """Testa validação de tipos com valores None (deve ignorar)"""
        data = {'name': 'João', 'age': None}
        field_types = {'name': str, 'age': int}
        
        # Não deve levantar exceção para valores None
        validate_field_types(data, field_types)
    
    def test_validate_field_types_missing_fields(self):
        """Testa validação de tipos com campos ausentes (deve ignorar)"""
        data = {'name': 'João'}
        field_types = {'name': str, 'age': int}
        
        # Não deve levantar exceção para campos ausentes
        validate_field_types(data, field_types)
    
    def test_validate_business_rules_success(self):
        """Testa validação bem-sucedida de regra de negócio"""
        # Não deve levantar exceção
        validate_business_rules(True, "Regra válida")
    
    def test_validate_business_rules_failure(self):
        """Testa validação com falha de regra de negócio"""
        with pytest.raises(BusinessAPIError) as exc_info:
            validate_business_rules(False, "Estoque insuficiente", ErrorCode.INSUFFICIENT_STOCK)
        
        assert exc_info.value.message == "Estoque insuficiente"
        assert exc_info.value.error_code == ErrorCode.INSUFFICIENT_STOCK
        assert exc_info.value.status_code == 422
    
    def test_validate_business_rules_default_error_code(self):
        """Testa validação de regra de negócio com código padrão"""
        with pytest.raises(BusinessAPIError) as exc_info:
            validate_business_rules(False, "Regra violada")
        
        assert exc_info.value.error_code == ErrorCode.BUSINESS_RULE_VIOLATION

class TestFlaskErrorHandlerRegistration:
    """Testa registro de handlers no Flask"""
    
    def test_register_error_handlers(self):
        """Testa registro de todos os handlers de erro"""
        app = Flask(__name__)
        
        # Registra os handlers
        register_error_handlers(app)
        
        # Verifica se os handlers foram registrados
        assert ValidationError in app.error_handler_spec[None]
        assert SQLAlchemyError in app.error_handler_spec[None]
        assert jwt.PyJWTError in app.error_handler_spec[None]
        assert APIError in app.error_handler_spec[None]
        assert Exception in app.error_handler_spec[None]

class TestEdgeCases:
    """Testa casos extremos e edge cases"""
    
    def test_error_with_circular_reference(self):
        """Testa erro com referência circular nos detalhes"""
        circular_dict = {}
        circular_dict['self'] = circular_dict
        
        # Deve tratar referência circular sem quebrar
        error = APIError(
            message="Erro com referência circular",
            error_code=ErrorCode.INTERNAL_ERROR,
            details=circular_dict
        )
        
        assert error.message == "Erro com referência circular"
        assert error.details == circular_dict
    
    def test_error_with_very_long_message(self):
        """Testa erro com mensagem muito longa"""
        long_message = "A" * 10000  # 10KB de texto
        
        error = APIError(
            message=long_message,
            error_code=ErrorCode.INTERNAL_ERROR
        )
        
        assert error.message == long_message
    
    def test_error_with_unicode_characters(self):
        """Testa erro com caracteres unicode"""
        unicode_message = "Erro com caracteres especiais: 🚀 ñ ç ü 中文"
        
        error = APIError(
            message=unicode_message,
            error_code=ErrorCode.INTERNAL_ERROR
        )
        
        assert error.message == unicode_message
    
    def test_nested_exception_handling(self):
        """Testa tratamento de exceções aninhadas"""
        def level_3():
            raise ValueError("Erro no nível 3")
        
        def level_2():
            try:
                level_3()
            except ValueError as e:
                raise APIError(
                    message="Erro no nível 2",
                    error_code=ErrorCode.INTERNAL_ERROR,
                    cause=e
                )
        
        def level_1():
            try:
                level_2()
            except APIError as e:
                raise APIError(
                    message="Erro no nível 1",
                    error_code=ErrorCode.INTERNAL_ERROR,
                    cause=e
                )
        
        with pytest.raises(APIError) as exc_info:
            level_1()
        
        assert exc_info.value.message == "Erro no nível 1"
        assert isinstance(exc_info.value.cause, APIError)
        assert exc_info.value.cause.message == "Erro no nível 2"
        assert isinstance(exc_info.value.cause.cause, ValueError)

# Fixtures para testes
@pytest.fixture
def app():
    """Fixture para aplicação Flask de teste"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['DEBUG'] = True
    register_error_handlers(app)
    return app

@pytest.fixture
def client(app):
    """Fixture para cliente de teste"""
    return app.test_client()

# Testes de integração com Flask
class TestFlaskIntegration:
    """Testa integração com Flask"""
    
    def test_validation_error_response(self, client):
        """Testa resposta de erro de validação via Flask"""
        @client.application.route('/test-validation')
        def test_validation():
            raise ValidationAPIError("Dados inválidos", {"field": ["erro"]})
        
        response = client.get('/test-validation')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert data['error']['code'] == ErrorCode.VALIDATION_ERROR
        assert data['error']['message'] == "Dados inválidos"
        assert data['error']['details'] == {"field": ["erro"]}
    
    def test_authentication_error_response(self, client):
        """Testa resposta de erro de autenticação via Flask"""
        @client.application.route('/test-auth')
        def test_auth():
            raise AuthenticationAPIError("Token inválido")
        
        response = client.get('/test-auth')
        data = json.loads(response.data)
        
        assert response.status_code == 401
        assert data['error']['code'] == ErrorCode.UNAUTHORIZED
    
    def test_generic_error_response_debug(self, client):
        """Testa resposta de erro genérico em modo debug"""
        @client.application.route('/test-generic')
        def test_generic():
            raise ValueError("Erro genérico")
        
        response = client.get('/test-generic')
        data = json.loads(response.data)
        
        assert response.status_code == 500
        assert data['error']['code'] == ErrorCode.INTERNAL_ERROR
        assert 'details' in data['error']  # Debug mode mostra detalhes

