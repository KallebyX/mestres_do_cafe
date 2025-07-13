"""
Validadores e utilitários para a API
"""
import re
import uuid
from flask import jsonify


def validate_uuid(uuid_string):
    """
    Valida se uma string é um UUID válido
    
    Args:
        uuid_string: String a ser validada
        
    Returns:
        bool: True se for um UUID válido, False caso contrário
    """
    try:
        uuid.UUID(uuid_string)
        return True
    except (ValueError, TypeError):
        return False


def validate_email(email):
    """
    Valida se uma string é um email válido
    
    Args:
        email: String a ser validada
        
    Returns:
        bool: True se for um email válido, False caso contrário
    """
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_required_fields(data, required_fields):
    """
    Valida se todos os campos obrigatórios estão presentes
    
    Args:
        data: Dicionário com os dados
        required_fields: Lista de campos obrigatórios
        
    Returns:
        tuple: (is_valid, missing_fields)
    """
    if not data:
        return False, required_fields
    
    missing_fields = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
    
    return len(missing_fields) == 0, missing_fields


def create_error_response(message, status_code=400, error_code=None, details=None):
    """
    Cria uma resposta de erro padronizada
    
    Args:
        message: Mensagem de erro
        status_code: Código HTTP
        error_code: Código de erro customizado
        details: Detalhes adicionais do erro
        
    Returns:
        tuple: (response, status_code)
    """
    error_data = {
        'success': False,
        'error': message
    }
    
    if error_code:
        error_data['error_code'] = error_code
    
    if details:
        error_data['details'] = details
    
    return jsonify(error_data), status_code


def create_success_response(data=None, message=None):
    """
    Cria uma resposta de sucesso padronizada
    
    Args:
        data: Dados a serem retornados
        message: Mensagem de sucesso
        
    Returns:
        dict: Resposta padronizada
    """
    response = {
        'success': True
    }
    
    if data is not None:
        response.update(data)
    
    if message:
        response['message'] = message
    
    return jsonify(response)


def validate_pagination_params(page, per_page, max_per_page=100):
    """
    Valida parâmetros de paginação
    
    Args:
        page: Número da página
        per_page: Itens por página
        max_per_page: Máximo de itens por página
        
    Returns:
        tuple: (page, per_page, is_valid, error_message)
    """
    try:
        page = int(page) if page else 1
        per_page = int(per_page) if per_page else 20
        
        if page < 1:
            return 1, per_page, False, "Página deve ser maior que 0"
        
        if per_page < 1:
            return page, 20, False, "Itens por página deve ser maior que 0"
        
        if per_page > max_per_page:
            return page, max_per_page, False, f"Máximo de {max_per_page} itens por página"
        
        return page, per_page, True, None
        
    except (ValueError, TypeError):
        return 1, 20, False, "Parâmetros de paginação inválidos"