"""
Serviço de integração com Mercado Pago
Implementação funcional usando SDK oficial
"""

import os
import json
import uuid
import requests
from typing import Dict, Any, List
from decimal import Decimal
from datetime import datetime
from utils.logger import logger


class MercadoPagoService:
    """
    Serviço de integração com Mercado Pago
    Versão funcional usando SDK oficial
    """

    def __init__(self):
        # Configurações do MercadoPago
        self.access_token = os.environ.get('MERCADO_PAGO_ACCESS_TOKEN', '')
        self.public_key = os.environ.get('MERCADO_PAGO_PUBLIC_KEY', '')
        self.environment = os.environ.get('MERCADO_PAGO_ENVIRONMENT', 'sandbox')
        
        # URLs da API
        if self.environment == 'production':
            self.base_url = 'https://api.mercadopago.com'
        else:
            self.base_url = 'https://api.mercadopago.com'
            
        # Headers padrão
        self.headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'X-Idempotency-Key': ''  # Será definido por requisição
        }
        
        logger.info(f"MercadoPagoService inicializado - Ambiente: {self.environment}")
        
        if not self.access_token:
            logger.warning("MERCADO_PAGO_ACCESS_TOKEN não configurado - funcionalidades limitadas")

    def create_preference(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria uma preferência de pagamento para Checkout Pro usando API real
        """
        try:
            if not self.access_token:
                logger.error("Access token não configurado")
                return {'success': False, 'error': 'Access token não configurado'}
            
            # Preparar dados da preferência
            preference_data = {
                "items": [
                    {
                        "title": item.get('title', 'Produto'),
                        "quantity": item.get('quantity', 1),
                        "unit_price": float(item.get('price', 0)),
                        "currency_id": "BRL"
                    }
                    for item in order_data.get('items', [])
                ],
                "payer": {
                    "email": order_data.get('payer_email', 'test@test.com')
                },
                "back_urls": {
                    "success": order_data.get('success_url', 'http://localhost:3000/success'),
                    "failure": order_data.get('failure_url', 'http://localhost:3000/failure'),
                    "pending": order_data.get('pending_url', 'http://localhost:3000/pending')
                },
                "auto_return": "approved",
                "external_reference": order_data.get('order_id', ''),
                "notification_url": order_data.get('notification_url', '')
            }
            
            # Fazer requisição para API
            response = requests.post(
                f"{self.base_url}/checkout/preferences",
                headers=self.headers,
                json=preference_data,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                
                logger.info(f"Preferência criada: {data.get('id')}")
                
                return {
                    'success': True,
                    'preference_id': data.get('id'),
                    'init_point': data.get('init_point'),
                    'sandbox_init_point': data.get('sandbox_init_point'),
                    'public_key': self.public_key,
                    'environment': self.environment
                }
            else:
                logger.error(f"Erro na API MercadoPago: {response.status_code} - {response.text}")
                return {'success': False, 'error': f'Erro da API: {response.status_code}'}
                
        except Exception as e:
            logger.error(f"Erro ao criar preferência: {str(e)}")
            return {'success': False, 'error': str(e)}

    def process_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa um pagamento direto usando API real
        """
        try:
            if not self.access_token:
                logger.error("Access token não configurado")
                return {'success': False, 'error': 'Access token não configurado'}
            
            # Preparar dados do pagamento
            payment_payload = {
                "transaction_amount": float(payment_data.get('amount', 0)),
                "payment_method_id": payment_data.get('payment_method_id'),
                "payer": {
                    "email": payment_data.get('payer_email', 'test@test.com'),
                    "identification": {
                        "type": payment_data.get('document_type', 'CPF'),
                        "number": payment_data.get('document_number', '12345678901')
                    }
                },
                "description": payment_data.get('description', 'Pagamento Mestres do Café'),
                "external_reference": payment_data.get('external_reference', ''),
                "notification_url": payment_data.get('notification_url', '')
            }
            
            # Adicionar dados específicos do método de pagamento
            if payment_data.get('token'):
                payment_payload['token'] = payment_data['token']
            
            if payment_data.get('installments'):
                payment_payload['installments'] = int(payment_data['installments'])
            
            # Fazer requisição para API
            response = requests.post(
                f"{self.base_url}/v1/payments",
                headers=self.headers,
                json=payment_payload,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                
                logger.info(f"Pagamento criado: {data.get('id')} - Status: {data.get('status')}")
                
                result = {
                    'success': True,
                    'payment_id': data.get('id'),
                    'status': data.get('status'),
                    'status_detail': data.get('status_detail'),
                    'amount': data.get('transaction_amount'),
                    'payment_method': data.get('payment_method_id'),
                    'date_created': data.get('date_created'),
                    'date_approved': data.get('date_approved')
                }
                
                # Adicionar dados específicos por tipo de pagamento
                if data.get('point_of_interaction', {}).get('transaction_data', {}).get('qr_code'):
                    result['qr_code'] = data['point_of_interaction']['transaction_data']['qr_code']
                
                if data.get('transaction_details', {}).get('external_resource_url'):
                    result['ticket_url'] = data['transaction_details']['external_resource_url']
                
                return result
            else:
                logger.error(f"Erro na API MercadoPago: {response.status_code} - {response.text}")
                return {'success': False, 'error': f'Erro da API: {response.status_code}'}
                
        except Exception as e:
            logger.error(f"Erro ao processar pagamento: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Busca informações de um pagamento usando API real
        """
        try:
            if not self.access_token:
                logger.error("Access token não configurado")
                return {'success': False, 'error': 'Access token não configurado'}
            
            # Fazer requisição para API
            response = requests.get(
                f"{self.base_url}/v1/payments/{payment_id}",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                logger.info(f"Pagamento consultado: {payment_id}")
                
                return {
                    'success': True,
                    'payment': {
                        'id': data.get('id'),
                        'status': data.get('status'),
                        'status_detail': data.get('status_detail'),
                        'transaction_amount': data.get('transaction_amount'),
                        'payment_method_id': data.get('payment_method_id'),
                        'payment_type_id': data.get('payment_type_id'),
                        'date_created': data.get('date_created'),
                        'date_approved': data.get('date_approved'),
                        'external_reference': data.get('external_reference')
                    }
                }
            else:
                logger.error(f"Erro ao consultar pagamento: {response.status_code}")
                return {'success': False, 'error': f'Pagamento não encontrado: {response.status_code}'}
            
        except Exception as e:
            logger.error(f"Erro ao buscar pagamento {payment_id}: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def get_payment_methods(self) -> Dict[str, Any]:
        """
        Retorna métodos de pagamento disponíveis usando API real
        """
        try:
            if not self.access_token:
                logger.warning("Access token não configurado - retornando métodos padrão")
                # Retornar métodos básicos quando não há token
                methods = [
                    {
                        'id': 'pix',
                        'name': 'PIX',
                        'payment_type_id': 'bank_transfer',
                        'status': 'active',
                        'secure_thumbnail': 'https://img.icons8.com/color/48/pix.png'
                    },
                    {
                        'id': 'visa',
                        'name': 'Visa',
                        'payment_type_id': 'credit_card',
                        'status': 'active',
                        'secure_thumbnail': 'https://img.icons8.com/color/48/visa.png'
                    }
                ]
                return {'success': True, 'payment_methods': methods, 'fallback': True}
            
            # Fazer requisição para API
            response = requests.get(
                f"{self.base_url}/v1/payment_methods",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                logger.info("Métodos de pagamento obtidos da API")
                
                return {
                    'success': True,
                    'payment_methods': data,
                    'fallback': False
                }
            else:
                logger.error(f"Erro ao consultar métodos: {response.status_code}")
                return {'success': False, 'error': f'Erro da API: {response.status_code}'}
            
        except Exception as e:
            logger.error(f"Erro ao buscar métodos de pagamento: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def refund_payment(self, payment_id: str, amount: float = None) -> Dict[str, Any]:
        """
        Realiza estorno de um pagamento usando API real
        """
        try:
            if not self.access_token:
                logger.error("Access token não configurado")
                return {'success': False, 'error': 'Access token não configurado'}
            
            # Preparar dados do estorno
            refund_payload = {}
            if amount:
                refund_payload['amount'] = float(amount)
            
            # Fazer requisição para API
            response = requests.post(
                f"{self.base_url}/v1/payments/{payment_id}/refunds",
                headers=self.headers,
                json=refund_payload,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                
                logger.info(f"Estorno criado: {data.get('id')} para pagamento {payment_id}")
                
                return {
                    'success': True,
                    'refund_id': data.get('id'),
                    'amount': data.get('amount'),
                    'status': data.get('status'),
                    'date_created': data.get('date_created')
                }
            else:
                logger.error(f"Erro ao criar estorno: {response.status_code}")
                return {'success': False, 'error': f'Erro da API: {response.status_code}'}
            
        except Exception as e:
            logger.error(f"Erro ao estornar pagamento {payment_id}: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def create_card_token(self, card_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria token de cartão para Checkout Transparente usando API real
        """
        try:
            if not self.public_key:
                logger.error("Public key não configurada")
                return {'success': False, 'error': 'Public key não configurada'}
            
            # Preparar dados do cartão
            token_payload = {
                "card_number": card_data.get('card_number'),
                "security_code": card_data.get('security_code'),
                "expiration_month": int(card_data.get('expiration_month')),
                "expiration_year": int(card_data.get('expiration_year')),
                "cardholder": {
                    "name": card_data.get('cardholder_name'),
                    "identification": {
                        "type": card_data.get('document_type', 'CPF'),
                        "number": card_data.get('document_number')
                    }
                }
            }
            
            # Headers específicos para criação de token
            token_headers = {
                'Authorization': f'Bearer {self.public_key}',
                'Content-Type': 'application/json'
            }
            
            # Fazer requisição para API
            response = requests.post(
                f"{self.base_url}/v1/card_tokens",
                headers=token_headers,
                json=token_payload,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                
                logger.info(f"Token de cartão criado: {data.get('id')}")
                
                return {
                    'success': True,
                    'token': data.get('id'),
                    'first_six_digits': data.get('first_six_digits'),
                    'last_four_digits': data.get('last_four_digits'),
                    'cardholder_name': data.get('cardholder', {}).get('name'),
                    'expiration_month': data.get('expiration_month'),
                    'expiration_year': data.get('expiration_year')
                }
            else:
                logger.error(f"Erro ao criar token: {response.status_code} - {response.text}")
                return {'success': False, 'error': f'Erro da API: {response.status_code}'}
            
        except Exception as e:
            logger.error(f"Erro ao criar token de cartão: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def validate_payment_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida dados de pagamento
        """
        try:
            errors = []
            
            # Validações básicas
            if not data.get('payment_method_id'):
                errors.append('Método de pagamento obrigatório')
            
            if not data.get('amount') or float(data.get('amount', 0)) <= 0:
                errors.append('Valor deve ser maior que zero')
            
            if errors:
                return {
                    'success': False,
                    'errors': errors
                }
            
            return {
                'success': True,
                'message': 'Dados válidos'
            }
            
        except Exception as e:
            logger.error(f"Erro ao validar dados de pagamento: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def get_installments(self, amount: float, payment_method_id: str) -> Dict[str, Any]:
        """
        Busca opções de parcelamento usando API real
        """
        try:
            if not self.access_token:
                logger.warning("Access token não configurado - retornando parcelamento padrão")
                # Parcelamento básico quando não há token
                installments = []
                for i in range(1, 13):
                    installment_amount = amount / i
                    installments.append({
                        'installments': i,
                        'installment_amount': round(installment_amount, 2),
                        'total_amount': amount,
                        'installment_rate': 0 if i <= 6 else 2.99,
                        'recommended_message': f'{i}x de R$ {installment_amount:.2f}'
                    })
                return {'success': True, 'installments': installments, 'fallback': True}
            
            # Fazer requisição para API
            response = requests.get(
                f"{self.base_url}/v1/payment_methods/installments",
                headers=self.headers,
                params={
                    'amount': amount,
                    'payment_method_id': payment_method_id
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                logger.info(f"Opções de parcelamento obtidas para {payment_method_id}")
                
                # Formatar dados da API
                installments = []
                for item in data:
                    for payer_cost in item.get('payer_costs', []):
                        installments.append({
                            'installments': payer_cost.get('installments'),
                            'installment_amount': payer_cost.get('installment_amount'),
                            'total_amount': payer_cost.get('total_amount'),
                            'installment_rate': payer_cost.get('installment_rate'),
                            'recommended_message': payer_cost.get('recommended_message')
                        })
                
                return {
                    'success': True,
                    'installments': installments,
                    'fallback': False
                }
            else:
                logger.error(f"Erro ao consultar parcelamento: {response.status_code}")
                return {'success': False, 'error': f'Erro da API: {response.status_code}'}
            
        except Exception as e:
            logger.error(f"Erro ao buscar parcelamento: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def calculate_marketplace_fee(self, amount: float, vendor_id: str) -> float:
        """
        Calcula taxa do marketplace
        """
        try:
            # Taxa padrão de 10% para demonstração
            fee_percentage = 10.0
            fee = (float(amount) * fee_percentage) / 100
            
            logger.info(f"Taxa calculada para vendedor {vendor_id}: {fee_percentage}% = R$ {fee:.2f}")
            return fee
            
        except Exception as e:
            logger.error(f"Erro ao calcular taxa do marketplace: {str(e)}")
            return 0.0

    def _map_mercado_pago_status(self, mp_status: str) -> str:
        """
        Mapeia status do Mercado Pago para status interno
        """
        status_map = {
            'approved': 'paid',
            'pending': 'pending',
            'in_process': 'processing',
            'rejected': 'failed',
            'cancelled': 'cancelled',
            'refunded': 'refunded',
            'charged_back': 'disputed'
        }
        
        return status_map.get(mp_status, 'pending')

    def get_merchant_orders(self, external_reference: str = None) -> Dict[str, Any]:
        """
        Busca pedidos do comerciante
        """
        try:
            if not self.access_token:
                logger.error("Access token não configurado")
                return {'success': False, 'error': 'Access token não configurado'}
            
            params = {}
            if external_reference:
                params['external_reference'] = external_reference
            
            response = requests.get(
                f"{self.base_url}/merchant_orders",
                headers=self.headers,
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Pedidos encontrados: {len(data.get('results', []))}")
                return {'success': True, 'orders': data.get('results', [])}
            else:
                logger.error(f"Erro ao buscar pedidos: {response.status_code}")
                return {'success': False, 'error': f'Erro da API: {response.status_code}'}
            
        except Exception as e:
            logger.error(f"Erro ao buscar pedidos: {str(e)}")
            return {'success': False, 'error': str(e)}