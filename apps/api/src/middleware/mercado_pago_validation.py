"""
Middleware para validação de dados do MercadoPago
"""

import re
from typing import Dict, List, Tuple, Optional, Any
from functools import wraps
from datetime import datetime, timedelta
from flask import request, jsonify
from utils.logger import logger


class MercadoPagoValidator:
    """Classe com métodos de validação para dados do MercadoPago"""
    
    @staticmethod
    def validate_cpf(cpf: str) -> bool:
        """Valida CPF usando algoritmo oficial"""
        if not cpf or not isinstance(cpf, str):
            return False
        
        # Remove caracteres não numéricos
        cpf = re.sub(r'[^0-9]', '', cpf)
        
        # Verifica se tem 11 dígitos
        if len(cpf) != 11:
            return False
        
        # Verifica se todos os dígitos são iguais
        if len(set(cpf)) == 1:
            return False
        
        # Calcula primeiro dígito verificador
        soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
        resto = soma % 11
        primeiro_digito = 0 if resto < 2 else 11 - resto
        
        if int(cpf[9]) != primeiro_digito:
            return False
        
        # Calcula segundo dígito verificador
        soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
        resto = soma % 11
        segundo_digito = 0 if resto < 2 else 11 - resto
        
        return int(cpf[10]) == segundo_digito
    
    @staticmethod
    def validate_cnpj(cnpj: str) -> bool:
        """Valida CNPJ usando algoritmo oficial"""
        if not cnpj or not isinstance(cnpj, str):
            return False
        
        # Remove caracteres não numéricos
        cnpj = re.sub(r'[^0-9]', '', cnpj)
        
        # Verifica se tem 14 dígitos
        if len(cnpj) != 14:
            return False
        
        # Verifica se todos os dígitos são iguais
        if len(set(cnpj)) == 1:
            return False
        
        # Calcula primeiro dígito verificador
        cnpj_parcial = cnpj[:12]
        pesos = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        
        soma = sum(
            int(cnpj_parcial[i]) * pesos[i] for i in range(len(pesos))
        )
        resto = soma % 11
        primeiro_digito = 0 if resto < 2 else 11 - resto
        
        if int(cnpj[12]) != primeiro_digito:
            return False
        
        # Calcula segundo dígito verificador
        cnpj_parcial = cnpj[:13]
        pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        
        soma = sum(int(cnpj_parcial[i]) * pesos[i] for i in range(len(pesos)))
        resto = soma % 11
        segundo_digito = 0 if resto < 2 else 11 - resto
        
        return int(cnpj[13]) == segundo_digito
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Valida formato de email"""
        if not email or not isinstance(email, str):
            return False
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_card_number(card_number: str) -> Tuple[bool, Optional[str]]:
        """Valida número de cartão usando algoritmo de Luhn"""
        if not card_number or not isinstance(card_number, str):
            return False, "Número do cartão é obrigatório"
        
        # Remove espaços e hífens
        card_number = re.sub(r'[\s-]', '', card_number)
        
        # Verifica se contém apenas dígitos
        if not card_number.isdigit():
            return False, "Número do cartão deve conter apenas dígitos"
        
        # Verifica comprimento (13-19 dígitos)
        if len(card_number) < 13 or len(card_number) > 19:
            return False, "Número do cartão deve ter entre 13 e 19 dígitos"
        
        # Algoritmo de Luhn
        def luhn_checksum(card_num):
            def digits_of(n):
                return [int(d) for d in str(n)]
            
            digits = digits_of(card_num)
            odd_digits = digits[-1::-2]
            even_digits = digits[-2::-2]
            checksum = sum(odd_digits)
            for d in even_digits:
                checksum += sum(digits_of(d * 2))
            return checksum % 10
        
        if luhn_checksum(card_number) != 0:
            return False, "Número do cartão inválido"
        
        return True, None
    
    @staticmethod
    def validate_expiry_date(
        month: int, year: int
    ) -> Tuple[bool, Optional[str]]:
        """Valida data de expiração do cartão"""
        try:
            if not isinstance(month, int) or not isinstance(year, int):
                return False, "Mês e ano devem ser números inteiros"
            
            if month < 1 or month > 12:
                return False, "Mês deve estar entre 1 e 12"
            
            # Ajustar ano se fornecido em formato de 2 dígitos
            if year < 100:
                current_year = datetime.now().year
                if year < (current_year % 100):
                    year += 2100
                else:
                    year += 2000
            
            # Verificar se não expirou
            now = datetime.now()
            expiry = datetime(year, month, 1)
            
            if expiry < now.replace(day=1):
                return False, "Cartão expirado"
            
            return True, None
            
        except ValueError:
            return False, "Data de expiração inválida"
    
    @staticmethod
    def validate_cvv(
        cvv: str, card_brand: str = None
    ) -> Tuple[bool, Optional[str]]:
        """Valida código de segurança do cartão"""
        if not cvv or not isinstance(cvv, str):
            return False, "CVV é obrigatório"
        
        if not cvv.isdigit():
            return False, "CVV deve conter apenas dígitos"
        
        # American Express usa 4 dígitos, outros usam 3
        if card_brand and card_brand.lower() in ['amex', 'american express']:
            if len(cvv) != 4:
                return False, "CVV deve ter 4 dígitos para American Express"
        else:
            if len(cvv) != 3:
                return False, "CVV deve ter 3 dígitos"
        
        return True, None


def validate_mercado_pago_payment(f):
    """Decorator para validar dados de pagamento do MercadoPago"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "Dados não fornecidos"}), 400
            
            errors = []
            
            # Validações básicas
            if 'amount' in data:
                try:
                    amount = float(data['amount'])
                    if amount <= 0:
                        errors.append("Valor deve ser maior que zero")
                except (ValueError, TypeError):
                    errors.append("Valor inválido")
            
            # Validar email do pagador
            if 'payer_email' in data:
                email_valid = MercadoPagoValidator.validate_email(
                    data['payer_email']
                )
                if not email_valid:
                    errors.append("Email do pagador inválido")
            
            # Validar documento do pagador
            if 'payer_doc_number' in data:
                doc_type = data.get('payer_doc_type', 'CPF')
                doc_number = data['payer_doc_number']
                
                if doc_type.upper() == 'CPF':
                    if not MercadoPagoValidator.validate_cpf(doc_number):
                        errors.append("CPF inválido")
                elif doc_type.upper() == 'CNPJ':
                    if not MercadoPagoValidator.validate_cnpj(doc_number):
                        errors.append("CNPJ inválido")
            
            # Validações específicas para cartão
            payment_method_id = data.get('payment_method_id', '')
            if payment_method_id in ['visa', 'master', 'elo', 'amex']:
                # Campos obrigatórios para cartão
                card_fields = [
                    'card_number', 'expiry_month', 'expiry_year', 'cvv'
                ]
                for field in card_fields:
                    if field not in data or not data[field]:
                        if field == 'card_number' and data.get('token'):
                            continue  # Token pode substituir dados do cartão
                        else:
                            errors.append(
                                f"Campo '{field}' é obrigatório para cartão"
                            )
                
                # Validar dados do cartão se fornecidos
                if 'card_number' in data and data['card_number']:
                    card_valid, card_error = (
                        MercadoPagoValidator.validate_card_number(
                            data['card_number']
                        )
                    )
                    if not card_valid:
                        errors.append(card_error)
                
                if 'expiry_month' in data and 'expiry_year' in data:
                    expiry_valid, expiry_error = (
                        MercadoPagoValidator.validate_expiry_date(
                            int(data['expiry_month']),
                            int(data['expiry_year'])
                        )
                    )
                    if not expiry_valid:
                        errors.append(expiry_error)
                
                if 'cvv' in data and data['cvv']:
                    cvv_valid, cvv_error = (
                        MercadoPagoValidator.validate_cvv(
                            data['cvv']
                        )
                    )
                    if not cvv_valid:
                        errors.append(cvv_error)
                
                # Validar parcelas
                if 'installments' in data:
                    try:
                        installments = int(data['installments'])
                        if installments < 1 or installments > 12:
                            errors.append(
                                "Número de parcelas deve estar entre 1 e 12"
                            )
                    except (ValueError, TypeError):
                        errors.append("Número de parcelas inválido")
            
            if errors:
                logger.warning(
                    f"Validation errors in {f.__name__}: {errors}"
                )
                return jsonify({
                    "error": "Dados de pagamento inválidos",
                    "details": errors
                }), 400
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"Error in payment validation: {str(e)}")
            return jsonify({"error": "Erro interno do servidor"}), 500
    
    return decorated_function


def validate_mercado_pago_webhook(f):
    """Decorator para validar webhooks do MercadoPago"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "Dados não fornecidos"}), 400
            
            errors = []
            
            # Validações básicas do webhook
            if 'type' in data:
                # Verificar se é um tipo válido de notificação
                valid_types = ['payment', 'plan', 'subscription', 'invoice']
                if data['type'] not in valid_types:
                    errors.append(
                        f"Tipo de notificação inválido: {data['type']}"
                    )
            
            if 'action' in data:
                valid_actions = [
                    'payment.created', 'payment.updated', 'payment.cancelled'
                ]
                if data['action'] not in valid_actions:
                    errors.append(f"Ação inválida: {data['action']}")
            
            if 'data' in data and 'id' in data['data']:
                # Verificar se o ID é um número válido
                try:
                    int(data['data']['id'])
                except (ValueError, TypeError):
                    errors.append("ID do pagamento inválido")
            else:
                errors.append("ID do pagamento não fornecido")
            
            # Validação adicional baseada no tópico
            if 'topic' in data:
                valid_topics = [
                    'payment', 'merchant_order', 'preapproval',
                    'authorized_payment'
                ]
                if data['topic'] not in valid_topics:
                    errors.append(f"Tópico inválido: {data['topic']}")
            
            if errors:
                logger.warning(f"Webhook validation errors: {errors}")
                return jsonify({
                    "error": "Webhook inválido",
                    "details": errors
                }), 400
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"Error in webhook validation: {str(e)}")
            return jsonify({"error": "Erro interno do servidor"}), 500
    
    return decorated_function


def validate_pix_payment_data(
    pix_data: Dict[str, Any]
) -> Tuple[bool, List[str]]:
    """Valida dados específicos para pagamento PIX"""
    errors = []
    
    # Validar expiração do PIX (se fornecida)
    if 'expiration_date' in pix_data:
        try:
            expiry = datetime.fromisoformat(pix_data['expiration_date'])
            if expiry <= datetime.now():
                errors.append("Data de expiração do PIX deve ser futura")
        except (ValueError, TypeError):
            errors.append("Formato de data de expiração inválido")
    
    return len(errors) == 0, errors


def validate_boleto_payment_data(
    boleto_data: Dict[str, Any]
) -> Tuple[bool, List[str]]:
    """Valida dados específicos para pagamento com boleto"""
    errors = []
    
    # Validar data de vencimento do boleto (se fornecida)
    if 'due_date' in boleto_data:
        try:
            due_date = datetime.fromisoformat(boleto_data['due_date'])
            if due_date <= datetime.now():
                errors.append("Data de vencimento do boleto deve ser futura")
            
            # Máximo de 30 dias para vencimento
            max_date = datetime.now() + timedelta(days=30)
            if due_date > max_date:
                errors.append(
                    "Data de vencimento não pode ser superior a 30 dias"
                )
        except (ValueError, TypeError):
            errors.append("Formato de data de vencimento inválido")
    
    return len(errors) == 0, errors


def validate_card_token_data(
    card_data: Dict[str, Any]
) -> Tuple[bool, List[str]]:
    """Valida dados para criação de token de cartão"""
    errors = []
    
    required_fields = [
        'card_number', 'expiry_month', 'expiry_year', 'cvv', 'cardholder_name'
    ]
    
    for field in required_fields:
        if field not in card_data or not card_data[field]:
            errors.append(f"Campo '{field}' é obrigatório")
    
    if not errors:
        # Validar número do cartão
        card_valid, card_error = MercadoPagoValidator.validate_card_number(
            card_data['card_number']
        )
        if not card_valid:
            errors.append(card_error)
        
        # Validar data de expiração
        try:
            month = int(card_data['expiry_month'])
            year = int(card_data['expiry_year'])
            expiry_valid, expiry_error = (
                MercadoPagoValidator.validate_expiry_date(
                    month, year
                )
            )
            if not expiry_valid:
                errors.append(expiry_error)
        except (ValueError, TypeError):
            errors.append("Data de expiração inválida")
        
        # Validar CVV
        cvv_valid, cvv_error = MercadoPagoValidator.validate_cvv(
            card_data['cvv']
        )
        if not cvv_valid:
            errors.append(cvv_error)
        
        # Validar nome do portador
        if len(card_data['cardholder_name'].strip()) < 2:
            errors.append("Nome do portador deve ter pelo menos 2 caracteres")
    
    return len(errors) == 0, errors


def validate_marketplace_data(
    marketplace_data: Dict[str, Any]
) -> Tuple[bool, List[str]]:
    """Valida dados específicos para marketplace"""
    errors = []
    
    if 'collector_id' in marketplace_data:
        try:
            int(marketplace_data['collector_id'])
        except (ValueError, TypeError):
            errors.append("ID do coletor deve ser um número")
    
    if 'marketplace_fee' in marketplace_data:
        try:
            fee = float(marketplace_data['marketplace_fee'])
            if fee < 0 or fee > 100:
                errors.append("Taxa do marketplace deve estar entre 0 e 100%")
        except (ValueError, TypeError):
            errors.append("Taxa do marketplace inválida")
    
    return len(errors) == 0, errors