from marshmallow import Schema, fields, validate, ValidationError, validates_schema
import re

class LoginSchema(Schema):
    """Schema for login validation"""
    email = fields.Email(
        required=True,
        validate=validate.Length(max=255),
        error_messages={'required': 'Email é obrigatório', 'invalid': 'Email inválido'}
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=6, max=128),
        error_messages={
            'required': 'Senha é obrigatória',
            'invalid': 'Senha deve ter entre 6 e 128 caracteres'
        }
    )

class RegisterSchema(Schema):
    """Schema for registration validation"""
    email = fields.Email(
        required=True,
        validate=validate.Length(max=255),
        error_messages={'required': 'Email é obrigatório', 'invalid': 'Email inválido'}
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=128),
        error_messages={
            'required': 'Senha é obrigatória',
            'invalid': 'Senha deve ter entre 8 e 128 caracteres'
        }
    )
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100),
        error_messages={
            'required': 'Nome é obrigatório',
            'invalid': 'Nome deve ter entre 2 e 100 caracteres'
        }
    )
    confirm_password = fields.Str(
        required=True,
        error_messages={'required': 'Confirmação de senha é obrigatória'}
    )

    @validates_schema
    def validate_password_match(self, data, **kwargs):
        """Validate that password and confirm_password match"""
        if data.get('password') != data.get('confirm_password'):
            raise ValidationError('Senhas não coincidem', 'confirm_password')

    @validates_schema
    def validate_password_strength(self, data, **kwargs):
        """Validate password strength"""
        password = data.get('password')
        if not password:
            return
        
        errors = []
        
        # Check for at least one uppercase letter
        if not re.search(r'[A-Z]', password):
            errors.append('Senha deve conter pelo menos uma letra maiúscula')
        
        # Check for at least one lowercase letter
        if not re.search(r'[a-z]', password):
            errors.append('Senha deve conter pelo menos uma letra minúscula')
        
        # Check for at least one digit
        if not re.search(r'\d', password):
            errors.append('Senha deve conter pelo menos um número')
        
        # Check for at least one special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append('Senha deve conter pelo menos um caractere especial')
        
        if errors:
            raise ValidationError(errors, 'password')

class PasswordChangeSchema(Schema):
    """Schema for password change validation"""
    current_password = fields.Str(
        required=True,
        error_messages={'required': 'Senha atual é obrigatória'}
    )
    new_password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=128),
        error_messages={
            'required': 'Nova senha é obrigatória',
            'invalid': 'Nova senha deve ter entre 8 e 128 caracteres'
        }
    )
    confirm_new_password = fields.Str(
        required=True,
        error_messages={'required': 'Confirmação da nova senha é obrigatória'}
    )

    @validates_schema
    def validate_password_match(self, data, **kwargs):
        """Validate that new_password and confirm_new_password match"""
        if data.get('new_password') != data.get('confirm_new_password'):
            raise ValidationError('Nova senha e confirmação não coincidem', 'confirm_new_password')

class PasswordResetRequestSchema(Schema):
    """Schema for password reset request validation"""
    email = fields.Email(
        required=True,
        validate=validate.Length(max=255),
        error_messages={'required': 'Email é obrigatório', 'invalid': 'Email inválido'}
    )

class PasswordResetSchema(Schema):
    """Schema for password reset validation"""
    token = fields.Str(
        required=True,
        error_messages={'required': 'Token é obrigatório'}
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=128),
        error_messages={
            'required': 'Senha é obrigatória',
            'invalid': 'Senha deve ter entre 8 e 128 caracteres'
        }
    )
    confirm_password = fields.Str(
        required=True,
        error_messages={'required': 'Confirmação de senha é obrigatória'}
    )

    @validates_schema
    def validate_password_match(self, data, **kwargs):
        """Validate that password and confirm_password match"""
        if data.get('password') != data.get('confirm_password'):
            raise ValidationError('Senhas não coincidem', 'confirm_password')

class UserProfileSchema(Schema):
    """Schema for user profile validation"""
    name = fields.Str(
        validate=validate.Length(min=2, max=100),
        error_messages={'invalid': 'Nome deve ter entre 2 e 100 caracteres'}
    )
    phone = fields.Str(
        validate=validate.Length(max=20),
        error_messages={'invalid': 'Telefone deve ter no máximo 20 caracteres'}
    )
    bio = fields.Str(
        validate=validate.Length(max=500),
        error_messages={'invalid': 'Bio deve ter no máximo 500 caracteres'}
    )

def validate_request_data(schema_class, data):
    """Helper function to validate request data"""
    schema = schema_class()
    try:
        return schema.load(data)
    except ValidationError as err:
        return None, err.messages

def format_validation_errors(errors):
    """Format validation errors for consistent API response"""
    formatted_errors = []
    for field, messages in errors.items():
        if isinstance(messages, list):
            formatted_errors.extend([f"{field}: {msg}" for msg in messages])
        else:
            formatted_errors.append(f"{field}: {messages}")
    return formatted_errors