"""
Serviço de integração com Mercado Pago
Implementação básica funcional para sistema de pagamentos
"""

import os
import json
import uuid
from typing import Dict, Any, List
from decimal import Decimal
from datetime import datetime
from utils.logger import logger


class MercadoPagoService:
    """
    Serviço de integração com Mercado Pago
    Versão simplificada funcional para desenvolvimento
    """

    def __init__(self):
        # Configurações básicas (sandbox)
        self.access_token = os.environ.get('MP_ACCESS_TOKEN', 'demo_token')
        self.public_key = os.environ.get('MP_PUBLIC_KEY', 'demo_public_key')
        self.environment = os.environ.get('MP_ENVIRONMENT', 'sandbox')
        self.base_url = 'https://api.mercadopago.com' if self.environment == 'production' else 'https://api.mercadopago.com/sandbox'
        
        logger.info(f"MercadoPagoService inicializado - Ambiente: {self.environment}")

    def create_preference(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria uma preferência de pagamento para Checkout Pro
        Versão simplificada para demonstração
        """
        try:
            # Gerar IDs únicos para demonstração
            preference_id = f"demo_pref_{uuid.uuid4().hex[:16]}"
            init_point = f"https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id={preference_id}"
            
            logger.info(f"Preferência criada para pedido {order_data.get('order_id')}: {preference_id}")
            
            return {
                'success': True,
                'preference_id': preference_id,
                'init_point': init_point,
                'sandbox_init_point': init_point,
                'public_key': self.public_key,
                'environment': self.environment
            }
            
        except Exception as e:
            logger.error(f"Erro ao criar preferência: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def process_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa um pagamento direto
        Versão simplificada com respostas simuladas
        """
        try:
            payment_method_id = payment_data.get('payment_method_id')
            amount = payment_data.get('amount', 0)
            
            # Gerar ID único para demonstração
            payment_id = f"demo_payment_{uuid.uuid4().hex[:12]}"
            
            # Simular diferentes cenários baseados no método de pagamento
            if payment_method_id == 'pix':
                result = {
                    'success': True,
                    'payment_id': payment_id,
                    'status': 'pending',
                    'status_detail': 'pending_waiting_payment',
                    'amount': float(amount),
                    'payment_method': 'pix',
                    'qr_code': self._generate_dummy_pix_code()
                }
            elif payment_method_id in ['visa', 'master', 'elo', 'amex']:
                # Simular aprovação para cartões
                result = {
                    'success': True,
                    'payment_id': payment_id,
                    'status': 'approved',
                    'status_detail': 'accredited',
                    'amount': float(amount),
                    'payment_method': 'credit_card'
                }
            elif 'boleto' in payment_method_id or 'ticket' in payment_method_id:
                result = {
                    'success': True,
                    'payment_id': payment_id,
                    'status': 'pending',
                    'status_detail': 'pending_waiting_payment',
                    'amount': float(amount),
                    'payment_method': 'ticket',
                    'ticket_url': f'https://sandbox.mercadopago.com/boleto/{payment_id}.pdf'
                }
            else:
                result = {
                    'success': False,
                    'error': f'Método de pagamento {payment_method_id} não suportado'
                }
            
            if result['success']:
                logger.info(f"Pagamento processado: {payment_id} - Status: {result['status']}")
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao processar pagamento: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Busca informações de um pagamento
        """
        try:
            # Para demonstração, retornar dados simulados
            return {
                'success': True,
                'payment': {
                    'id': payment_id,
                    'status': 'approved',
                    'status_detail': 'accredited',
                    'transaction_amount': 99.70,
                    'payment_method_id': 'visa',
                    'payment_type_id': 'credit_card',
                    'date_created': datetime.now().isoformat(),
                    'date_approved': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Erro ao buscar pagamento {payment_id}: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def get_payment_methods(self) -> Dict[str, Any]:
        """
        Retorna métodos de pagamento disponíveis
        """
        try:
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
                },
                {
                    'id': 'master',
                    'name': 'Mastercard',
                    'payment_type_id': 'credit_card',
                    'status': 'active',
                    'secure_thumbnail': 'https://img.icons8.com/color/48/mastercard.png'
                },
                {
                    'id': 'bolbradesco',
                    'name': 'Boleto Bancário',
                    'payment_type_id': 'ticket',
                    'status': 'active',
                    'secure_thumbnail': 'https://img.icons8.com/color/48/brazil.png'
                }
            ]
            
            return {
                'success': True,
                'payment_methods': methods
            }
            
        except Exception as e:
            logger.error(f"Erro ao buscar métodos de pagamento: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def refund_payment(self, payment_id: str, amount: float = None) -> Dict[str, Any]:
        """
        Realiza estorno de um pagamento
        """
        try:
            refund_id = f"demo_refund_{uuid.uuid4().hex[:12]}"
            
            return {
                'success': True,
                'refund_id': refund_id,
                'amount': amount or 0,
                'status': 'approved'
            }
            
        except Exception as e:
            logger.error(f"Erro ao estornar pagamento {payment_id}: {str(e)}")
            return {
                'success': False,
                'error': f"Erro interno: {str(e)}"
            }

    def create_card_token(self, card_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria token de cartão para Checkout Transparente
        """
        try:
            token = f"demo_token_{uuid.uuid4().hex[:16]}"
            
            return {
                'success': True,
                'token': token,
                'first_six_digits': card_data.get('card_number', '000000')[:6],
                'last_four_digits': card_data.get('card_number', '0000')[-4:],
                'cardholder_name': card_data.get('cardholder_name', 'DEMO')
            }
            
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
        Busca opções de parcelamento
        """
        try:
            if payment_method_id not in ['visa', 'master', 'elo', 'amex']:
                return {
                    'success': False,
                    'error': 'Parcelamento disponível apenas para cartões'
                }
            
            installments = []
            for i in range(1, 13):  # até 12x
                installment_amount = amount / i
                installments.append({
                    'installments': i,
                    'installment_amount': round(installment_amount, 2),
                    'total_amount': amount,
                    'installment_rate': 0 if i <= 6 else 2.99,  # sem juros até 6x
                    'recommended_message': f'{i}x de R$ {installment_amount:.2f}'
                })
            
            return {
                'success': True,
                'installments': installments
            }
            
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

    def _generate_dummy_pix_code(self) -> str:
        """
        Gera código PIX simulado para demonstração
        """
        return "00020126580014br.gov.bcb.pix01366a7b8c9d-e4f2-1g3h-4i5j-6k7l8m9n0o1p520400005303986540599.705802BR5925MESTRES_DO_CAFE_LTDA6009SAO_PAULO62070503***6304ABCD"