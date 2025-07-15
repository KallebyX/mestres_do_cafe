"""
Serviço do Mercado Pago para processamento de pagamentos
"""

import os
import json
import hmac
import hashlib
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any, List

import mercadopago
from flask import current_app

from ..database import db
from ..models.payments import Payment, PaymentStatus
from ..models.orders import Order
from ..models.vendors import Vendor
from ..models.customers import Customer
from ..utils.logger import logger


class MercadoPagoService:
    """Serviço para integração com Mercado Pago"""
    
    def __init__(self):
        access_token = os.getenv('MERCADO_PAGO_ACCESS_TOKEN')
        if not access_token or access_token == 'YOUR_ACCESS_TOKEN_HERE':
            logger.warning("Mercado Pago access token not configured properly")
            self.mp = None
        else:
            self.mp = mercadopago.SDK(access_token)
        
        self.public_key = os.getenv('MERCADO_PAGO_PUBLIC_KEY')
        self.webhook_secret = os.getenv('MERCADO_PAGO_WEBHOOK_SECRET')
        self.environment = os.getenv('MERCADO_PAGO_ENVIRONMENT', 'sandbox')
        self.notification_url = os.getenv('MERCADO_PAGO_NOTIFICATION_URL')
    
    def create_preference(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria uma preferência de pagamento no Mercado Pago
        
        Args:
            order_data: Dados do pedido
            
        Returns:
            Dict com dados da preferência criada
        """
        try:
            if not self.mp:
                return {"success": False, "error": "Mercado Pago not configured"}
            
            # Configurar dados da preferência
            preference_data = {
                "items": [
                    {
                        "id": order_data.get('order_id'),
                        "title": order_data.get('title', 'Pedido Mestres do Café'),
                        "description": order_data.get('description', 'Compra de produtos de café'),
                        "quantity": 1,
                        "currency_id": "BRL",
                        "unit_price": float(order_data.get('amount', 0))
                    }
                ],
                "payer": {
                    "name": order_data.get('payer_name', ''),
                    "email": order_data.get('payer_email', ''),
                    "phone": {
                        "area_code": order_data.get('payer_phone_area', '11'),
                        "number": order_data.get('payer_phone', '')
                    },
                    "identification": {
                        "type": order_data.get('payer_doc_type', 'CPF'),
                        "number": order_data.get('payer_doc_number', '')
                    },
                    "address": {
                        "street_name": order_data.get('payer_address_street', ''),
                        "street_number": order_data.get('payer_address_number', ''),
                        "zip_code": order_data.get('payer_address_zip', '')
                    }
                },
                "back_urls": {
                    "success": order_data.get('success_url', f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/payment/success"),
                    "failure": order_data.get('failure_url', f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/payment/failure"),
                    "pending": order_data.get('pending_url', f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/payment/pending")
                },
                "auto_return": "approved",
                "payment_methods": {
                    "excluded_payment_methods": [],
                    "excluded_payment_types": [],
                    "installments": 12
                },
                "notification_url": self.notification_url,
                "statement_descriptor": "MESTRES DO CAFE",
                "external_reference": order_data.get('order_id'),
                "marketplace": order_data.get('marketplace_data', {}),
                # Configurações de split payment para marketplace
                "marketplace_fee": float(order_data.get('marketplace_fee', 0))
            }
            
            # Adicionar split payment se houver vendedor
            if order_data.get('vendor_id'):
                preference_data["marketplace"] = order_data.get('marketplace_data', {
                    "marketplace": "MESTRES_DO_CAFE"
                })
            
            # Configurar expires
            if order_data.get('expires_at'):
                preference_data["expires"] = True
                preference_data["expiration_date_from"] = datetime.utcnow().isoformat()
                preference_data["expiration_date_to"] = order_data.get('expires_at')
            
            # Criar preferência
            preference_response = self.mp.preference().create(preference_data)
            
            if preference_response["status"] == 201:
                preference = preference_response["response"]
                
                logger.info(f"Preference created successfully: {preference['id']}")
                
                return {
                    "success": True,
                    "preference_id": preference["id"],
                    "init_point": preference["init_point"],
                    "sandbox_init_point": preference["sandbox_init_point"],
                    "public_key": self.public_key,
                    "environment": self.environment
                }
            else:
                logger.error(f"Error creating preference: {preference_response}")
                return {
                    "success": False,
                    "error": "Failed to create payment preference",
                    "details": preference_response
                }
                
        except Exception as e:
            logger.error(f"Error in create_preference: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def process_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa um pagamento direto (sem preference)
        
        Args:
            payment_data: Dados do pagamento
            
        Returns:
            Dict com resultado do processamento
        """
        try:
            if not self.mp:
                return {"success": False, "error": "Mercado Pago not configured"}
            
            payment_request = {
                "transaction_amount": float(payment_data.get('amount')),
                "payment_method_id": payment_data.get('payment_method_id'),
                "payer": {
                    "email": payment_data.get('payer_email'),
                    "identification": {
                        "type": payment_data.get('payer_doc_type', 'CPF'),
                        "number": payment_data.get('payer_doc_number')
                    }
                },
                "external_reference": payment_data.get('order_id'),
                "description": payment_data.get('description', 'Compra Mestres do Café'),
                "notification_url": self.notification_url
            }
            
            # Adicionar token se fornecido (para cartão)
            if payment_data.get('token'):
                payment_request["token"] = payment_data.get('token')
            
            # Adicionar installments se fornecido
            if payment_data.get('installments'):
                payment_request["installments"] = int(payment_data.get('installments'))
            
            # Adicionar split payment se houver vendedor
            if payment_data.get('vendor_id') and payment_data.get('marketplace_fee'):
                payment_request["marketplace_fee"] = float(payment_data.get('marketplace_fee'))
            
            # Processar pagamento
            payment_response = self.mp.payment().create(payment_request)
            
            if payment_response["status"] == 201:
                payment = payment_response["response"]
                
                logger.info(f"Payment processed successfully: {payment['id']}")
                
                return {
                    "success": True,
                    "payment_id": payment["id"],
                    "status": payment["status"],
                    "status_detail": payment["status_detail"],
                    "amount": payment["transaction_amount"],
                    "net_amount": payment.get("net_amount"),
                    "payment_method": payment["payment_method_id"],
                    "payment_type": payment["payment_type_id"]
                }
            else:
                logger.error(f"Error processing payment: {payment_response}")
                return {
                    "success": False,
                    "error": "Failed to process payment",
                    "details": payment_response
                }
                
        except Exception as e:
            logger.error(f"Error in process_payment: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Obtém informações de um pagamento
        
        Args:
            payment_id: ID do pagamento no Mercado Pago
            
        Returns:
            Dict com dados do pagamento
        """
        try:
            if not self.mp:
                return {"success": False, "error": "Mercado Pago not configured"}
            
            payment_response = self.mp.payment().get(payment_id)
            
            if payment_response["status"] == 200:
                payment = payment_response["response"]
                
                return {
                    "success": True,
                    "payment": payment
                }
            else:
                return {
                    "success": False,
                    "error": "Payment not found",
                    "details": payment_response
                }
                
        except Exception as e:
            logger.error(f"Error getting payment {payment_id}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """
        Realiza estorno de um pagamento
        
        Args:
            payment_id: ID do pagamento no Mercado Pago
            amount: Valor a ser estornado (opcional, total se não informado)
            
        Returns:
            Dict com resultado do estorno
        """
        try:
            if not self.mp:
                return {"success": False, "error": "Mercado Pago not configured"}
            
            refund_data = {}
            if amount:
                refund_data["amount"] = float(amount)
            
            refund_response = self.mp.refund().create(payment_id, refund_data)
            
            if refund_response["status"] == 201:
                refund = refund_response["response"]
                
                logger.info(f"Refund created successfully: {refund['id']}")
                
                return {
                    "success": True,
                    "refund_id": refund["id"],
                    "amount": refund["amount"],
                    "status": refund["status"]
                }
            else:
                logger.error(f"Error creating refund: {refund_response}")
                return {
                    "success": False,
                    "error": "Failed to create refund",
                    "details": refund_response
                }
                
        except Exception as e:
            logger.error(f"Error in refund_payment: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def verify_webhook_signature(self, raw_body: bytes, signature: str) -> bool:
        """
        Verifica a assinatura do webhook do Mercado Pago
        
        Args:
            raw_body: Corpo da requisição em bytes
            signature: Assinatura recebida no header
            
        Returns:
            True se a assinatura for válida
        """
        try:
            if not self.webhook_secret:
                logger.warning("Webhook secret not configured")
                return True  # Em desenvolvimento, aceitar sem verificação
            
            expected_signature = hmac.new(
                self.webhook_secret.encode('utf-8'),
                raw_body,
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
            
        except Exception as e:
            logger.error(f"Error verifying webhook signature: {str(e)}")
            return False
    
    def process_webhook_notification(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa notificação de webhook do Mercado Pago
        
        Args:
            notification_data: Dados da notificação
            
        Returns:
            Dict com resultado do processamento
        """
        try:
            topic = notification_data.get('topic')
            resource_id = notification_data.get('resource')
            
            if topic == 'payment':
                # Buscar informações do pagamento
                payment_result = self.get_payment(resource_id)
                
                if payment_result['success']:
                    mp_payment = payment_result['payment']
                    
                    # Buscar pagamento no banco local
                    external_reference = mp_payment.get('external_reference')
                    payment = db.session.query(Payment).filter(
                        Payment.provider_transaction_id == str(resource_id)
                    ).first()
                    
                    if not payment and external_reference:
                        # Buscar por external_reference (order_id)
                        order = db.session.query(Order).filter(
                            Order.id == external_reference
                        ).first()
                        
                        if order:
                            payment = db.session.query(Payment).filter(
                                Payment.order_id == order.id
                            ).first()
                    
                    if payment:
                        # Atualizar status do pagamento
                        old_status = payment.status
                        new_status = self._map_mercado_pago_status(mp_payment['status'])
                        
                        payment.status = new_status
                        payment.provider_transaction_id = str(resource_id)
                        payment.provider_response = json.dumps(mp_payment)
                        payment.processed_at = datetime.utcnow()
                        
                        # Se pagamento foi aprovado e estava pendente, colocar em escrow
                        if (old_status == 'pending' and new_status == 'paid' and 
                            payment.vendor_id):
                            payment.hold_payment("Marketplace escrow - payment approved")
                        
                        db.session.commit()
                        
                        logger.info(f"Payment {payment.id} updated from {old_status} to {new_status}")
                        
                        return {
                            "success": True,
                            "payment_id": str(payment.id),
                            "old_status": old_status,
                            "new_status": new_status
                        }
                    else:
                        logger.warning(f"Payment not found for MP payment {resource_id}")
                        return {"success": False, "error": "Payment not found in local database"}
                else:
                    return {"success": False, "error": "Failed to get payment from Mercado Pago"}
            
            return {"success": True, "message": "Notification processed"}
            
        except Exception as e:
            logger.error(f"Error processing webhook notification: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _map_mercado_pago_status(self, mp_status: str) -> str:
        """
        Mapeia status do Mercado Pago para status interno
        
        Args:
            mp_status: Status do Mercado Pago
            
        Returns:
            Status interno correspondente
        """
        status_mapping = {
            'approved': PaymentStatus.PAID.value,
            'pending': PaymentStatus.PENDING.value,
            'in_process': PaymentStatus.PENDING.value,
            'rejected': PaymentStatus.FAILED.value,
            'cancelled': PaymentStatus.FAILED.value,
            'refunded': PaymentStatus.REFUNDED.value,
            'partially_refunded': PaymentStatus.PARTIALLY_REFUNDED.value
        }
        
        return status_mapping.get(mp_status, PaymentStatus.PENDING.value)
    
    def get_payment_methods(self) -> Dict[str, Any]:
        """
        Obtém métodos de pagamento disponíveis
        
        Returns:
            Dict com métodos de pagamento
        """
        try:
            if not self.mp:
                return {"success": False, "error": "Mercado Pago not configured"}
            
            payment_methods_response = self.mp.payment_methods().list_all()
            
            if payment_methods_response["status"] == 200:
                return {
                    "success": True,
                    "payment_methods": payment_methods_response["response"]
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to get payment methods",
                    "details": payment_methods_response
                }
                
        except Exception as e:
            logger.error(f"Error getting payment methods: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def calculate_marketplace_fee(self, amount: Decimal, vendor_id: str = None) -> Decimal:
        """
        Calcula taxa do marketplace para split payment
        
        Args:
            amount: Valor total do pagamento
            vendor_id: ID do vendedor (opcional)
            
        Returns:
            Valor da taxa do marketplace
        """
        # Taxa padrão de 5% para o marketplace
        default_fee_percentage = Decimal('0.05')
        
        # Aqui você pode implementar lógica personalizada por vendedor
        if vendor_id:
            vendor = db.session.query(Vendor).filter(Vendor.id == vendor_id).first()
            if vendor and hasattr(vendor, 'marketplace_fee_percentage'):
                fee_percentage = Decimal(str(vendor.marketplace_fee_percentage / 100))
                return amount * fee_percentage
        
        return amount * default_fee_percentage