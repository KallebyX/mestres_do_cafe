"""
Schemas de validação para autenticação - Mestres do Café Enterprise
"""

from marshmallow import Schema, fields, validate, ValidationError, post_load
from typing import Dict, Any, Tuple, Optional, Union

class LoginSchema(Schema):
    """Schema para validação de login"""
    email = fields.Email(required = True, error_messages={
        'required': 'Email é obrigatório',
        'invalid': 'Email deve ter formato válido'
    })
    password = fields.Str(required = True, validate = validate.Length(min = 6), error_messages={
        'required': 'Senha é obrigatória',
        'invalid': 'Senha deve ter pelo menos 6 caracteres'
    })

class RegisterSchema(Schema):
    """Schema para validação de registro"""
    name = fields.Str(required = True, validate = validate.Length(min = 2, max = 200), error_messages={
        'required': 'Nome é obrigatório',
        'invalid': 'Nome deve ter entre 2 e 200 caracteres'
    })
    email = fields.Email(required = True, error_messages={
        'required': 'Email é obrigatório',
        'invalid': 'Email deve ter formato válido'
    })
    password = fields.Str(required = True, validate = validate.Length(min = 6), error_messages={
        'required': 'Senha é obrigatória',
        'invalid': 'Senha deve ter pelo menos 6 caracteres'
    })
    confirm_password = fields.Str(required = True, error_messages={
        'required': 'Confirmação de senha é obrigatória'
    })

    @post_load
    def validate_passwords_match(self, data, **kwargs):
        """Valida se as senhas coincidem"""
        if data.get('password') != data.get('confirm_password'):
            raise ValidationError('Senhas não coincidem', field_name='confirm_password')
        return data

def validate_request_data(schema_class: Schema, data: Dict[str, Any]) -> Union[Dict[str, Any], Tuple[Optional[Dict[str, Any]], Dict[str, Any]]]:
    """
    Valida dados de requisição usando schema Marshmallow

    Args:
        schema_class: Classe do schema a ser usado
        data: Dados para validação

    Returns:
        Dados validados ou tupla (dados, erros)
    """
    try:
        schema = schema_class()
        validated_data = schema.load(data)
        return validated_data
    except ValidationError as e:
        return None, format_validation_errors(e.messages)

def format_validation_errors(errors: Dict[str, Any]) -> Dict[str, Any]:
    """
    Formata erros de validação para resposta padronizada

    Args:
        errors: Erros do Marshmallow

    Returns:
        Erros formatados
    """
    formatted_errors = {}

    for field, messages in errors.items():
        if isinstance(messages, list):
            formatted_errors[field] = messages[0] if messages else 'Erro de validação'
        elif isinstance(messages, dict):
            formatted_errors[field] = format_validation_errors(messages)
        else:
            formatted_errors[field] = str(messages)

    return formatted_errors
