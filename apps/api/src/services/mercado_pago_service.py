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

from database import db
from models.payments import Payment, PaymentStatus
from models.orders import Order
from models.vendors import Vendor
from models.customers import Customer
from utils.logger import logger


class MercadoPagoService:
    """Serviço para integração com Mercado Pago - Checkout Transparente"""

    def __init__(self):
        access_token = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
        if not access_token or access_token == "YOUR_ACCESS_TOKEN_HERE":
            logger.warning("Mercado Pago access token not configured properly")
            self.mp = None
        else:
            self.mp = mercadopago.SDK(access_token)

        self.public_key = os.getenv("MERCADO_PAGO_PUBLIC_KEY")
        self.webhook_secret = os.getenv("MERCADO_PAGO_WEBHOOK_SECRET")
        self.environment = os.getenv("MERCADO_PAGO_ENVIRONMENT", "sandbox")
        self.notification_url = os.getenv("MERCADO_PAGO_NOTIFICATION_URL")
        self.user_id = os.getenv("MERCADO_PAGO_USER_ID")
        self.application_id = os.getenv("MERCADO_PAGO_APPLICATION_ID")

        # Configurações específicas para Checkout Transparente
        self.checkout_type = os.getenv("MERCADO_PAGO_CHECKOUT_TYPE", "transparent")
        self.enable_3ds = os.getenv("MERCADO_PAGO_ENABLE_3DS", "true").lower() == "true"
        self.enable_tokenization = (
            os.getenv("MERCADO_PAGO_ENABLE_TOKENIZATION", "true").lower() == "true"
        )

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
                        "id": order_data.get("order_id"),
                        "title": order_data.get("title", "Pedido Mestres do Café"),
                        "description": order_data.get(
                            "description", "Compra de produtos de café"
                        ),
                        "quantity": 1,
                        "currency_id": "BRL",
                        "unit_price": float(order_data.get("amount", 0)),
                    }
                ],
                "payer": {
                    "name": order_data.get("payer_name", ""),
                    "email": order_data.get("payer_email", ""),
                    "phone": {
                        "area_code": order_data.get("payer_phone_area", "11"),
                        "number": order_data.get("payer_phone", ""),
                    },
                    "identification": {
                        "type": order_data.get("payer_doc_type", "CPF"),
                        "number": order_data.get("payer_doc_number", ""),
                    },
                    "address": {
                        "street_name": order_data.get("payer_address_street", ""),
                        "street_number": order_data.get("payer_address_number", ""),
                        "zip_code": order_data.get("payer_address_zip", ""),
                    },
                },
                "back_urls": {
                    "success": order_data.get(
                        "success_url",
                        f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/payment/success",
                    ),
                    "failure": order_data.get(
                        "failure_url",
                        f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/payment/failure",
                    ),
                    "pending": order_data.get(
                        "pending_url",
                        f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/payment/pending",
                    ),
                },
                "auto_return": "approved",
                "payment_methods": {
                    "excluded_payment_methods": [],
                    "excluded_payment_types": [],
                    "installments": 12,
                },
                "notification_url": self.notification_url,
                "statement_descriptor": "MESTRES DO CAFE",
                "external_reference": order_data.get("order_id"),
                "marketplace": order_data.get("marketplace_data", {}),
                # Configurações de split payment para marketplace
                "marketplace_fee": float(order_data.get("marketplace_fee", 0)),
            }

            # Adicionar split payment se houver vendedor
            if order_data.get("vendor_id"):
                preference_data["marketplace"] = order_data.get(
                    "marketplace_data", {"marketplace": "MESTRES_DO_CAFE"}
                )

            # Configurar expires
            if order_data.get("expires_at"):
                preference_data["expires"] = True
                preference_data["expiration_date_from"] = datetime.utcnow().isoformat()
                preference_data["expiration_date_to"] = order_data.get("expires_at")

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
                    "environment": self.environment,
                }
            else:
                logger.error(f"Error creating preference: {preference_response}")
                return {
                    "success": False,
                    "error": "Failed to create payment preference",
                    "details": preference_response,
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
                "transaction_amount": float(payment_data.get("amount")),
                "payment_method_id": payment_data.get("payment_method_id"),
                "payer": {
                    "email": payment_data.get("payer_email"),
                    "identification": {
                        "type": payment_data.get("payer_doc_type", "CPF"),
                        "number": payment_data.get("payer_doc_number"),
                    },
                },
                "external_reference": payment_data.get("order_id"),
                "description": payment_data.get(
                    "description", "Compra Mestres do Café"
                ),
                "notification_url": self.notification_url,
            }

            # Adicionar token se fornecido (para cartão)
            if payment_data.get("token"):
                payment_request["token"] = payment_data.get("token")

            # Adicionar installments se fornecido
            if payment_data.get("installments"):
                payment_request["installments"] = int(payment_data.get("installments"))

            # Adicionar split payment se houver vendedor
            if payment_data.get("vendor_id") and payment_data.get("marketplace_fee"):
                payment_request["marketplace_fee"] = float(
                    payment_data.get("marketplace_fee")
                )

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
                    "payment_type": payment["payment_type_id"],
                }
            else:
                logger.error(f"Error processing payment: {payment_response}")
                return {
                    "success": False,
                    "error": "Failed to process payment",
                    "details": payment_response,
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

                return {"success": True, "payment": payment}
            else:
                return {
                    "success": False,
                    "error": "Payment not found",
                    "details": payment_response,
                }

        except Exception as e:
            logger.error(f"Error getting payment {payment_id}: {str(e)}")
            return {"success": False, "error": str(e)}

    def refund_payment(
        self, payment_id: str, amount: Optional[float] = None
    ) -> Dict[str, Any]:
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
                    "status": refund["status"],
                }
            else:
                logger.error(f"Error creating refund: {refund_response}")
                return {
                    "success": False,
                    "error": "Failed to create refund",
                    "details": refund_response,
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
                self.webhook_secret.encode("utf-8"), raw_body, hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(signature, expected_signature)

        except Exception as e:
            logger.error(f"Error verifying webhook signature: {str(e)}")
            return False

    def process_webhook_notification(
        self, notification_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Processa notificação de webhook do Mercado Pago

        Args:
            notification_data: Dados da notificação

        Returns:
            Dict com resultado do processamento
        """
        try:
            topic = notification_data.get("topic")
            resource_id = notification_data.get("resource")

            if topic == "payment":
                # Buscar informações do pagamento
                payment_result = self.get_payment(resource_id)

                if payment_result["success"]:
                    mp_payment = payment_result["payment"]

                    # Buscar pagamento no banco local
                    external_reference = mp_payment.get("external_reference")
                    payment = (
                        db.session.query(Payment)
                        .filter(Payment.provider_transaction_id == str(resource_id))
                        .first()
                    )

                    if not payment and external_reference:
                        # Buscar por external_reference (order_id)
                        order = (
                            db.session.query(Order)
                            .filter(Order.id == external_reference)
                            .first()
                        )

                        if order:
                            payment = (
                                db.session.query(Payment)
                                .filter(Payment.order_id == order.id)
                                .first()
                            )

                    if payment:
                        # Atualizar status do pagamento
                        old_status = payment.status
                        new_status = self._map_mercado_pago_status(mp_payment["status"])

                        payment.status = new_status
                        payment.provider_transaction_id = str(resource_id)
                        payment.provider_response = json.dumps(mp_payment)
                        payment.processed_at = datetime.utcnow()

                        # Se pagamento foi aprovado e estava pendente, colocar em escrow
                        if (
                            old_status == "pending"
                            and new_status == "paid"
                            and payment.vendor_id
                        ):
                            payment.hold_payment(
                                "Marketplace escrow - payment approved"
                            )

                        db.session.commit()

                        logger.info(
                            f"Payment {payment.id} updated from {old_status} to {new_status}"
                        )

                        return {
                            "success": True,
                            "payment_id": str(payment.id),
                            "old_status": old_status,
                            "new_status": new_status,
                        }
                    else:
                        logger.warning(
                            f"Payment not found for MP payment {resource_id}"
                        )
                        return {
                            "success": False,
                            "error": "Payment not found in local database",
                        }
                else:
                    return {
                        "success": False,
                        "error": "Failed to get payment from Mercado Pago",
                    }

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
            "approved": PaymentStatus.PAID.value,
            "pending": PaymentStatus.PENDING.value,
            "in_process": PaymentStatus.PENDING.value,
            "rejected": PaymentStatus.FAILED.value,
            "cancelled": PaymentStatus.FAILED.value,
            "refunded": PaymentStatus.REFUNDED.value,
            "partially_refunded": PaymentStatus.PARTIALLY_REFUNDED.value,
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
                    "payment_methods": payment_methods_response["response"],
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to get payment methods",
                    "details": payment_methods_response,
                }

        except Exception as e:
            logger.error(f"Error getting payment methods: {str(e)}")
            return {"success": False, "error": str(e)}

    def calculate_marketplace_fee(
        self, amount: Decimal, vendor_id: str = None
    ) -> Decimal:
        """
        Calcula taxa do marketplace para split payment

        Args:
            amount: Valor total do pagamento
            vendor_id: ID do vendedor (opcional)

        Returns:
            Valor da taxa do marketplace
        """
        # Taxa padrão de 5% para o marketplace
        default_fee_percentage = Decimal("0.05")

        # Aqui você pode implementar lógica personalizada por vendedor
        if vendor_id:
            vendor = db.session.query(Vendor).filter(Vendor.id == vendor_id).first()
            if vendor and hasattr(vendor, "marketplace_fee_percentage"):
                fee_percentage = Decimal(str(vendor.marketplace_fee_percentage / 100))
                return amount * fee_percentage

        return amount * default_fee_percentage

    def create_card_token(self, card_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria um token de cartão para processamento seguro

        Args:
            card_data: Dados do cartão

        Returns:
            Dict com token do cartão ou erro
        """
        try:
            if not self.mp:
                return {"success": False, "error": "Mercado Pago not configured"}

            # Validar dados obrigatórios do cartão
            required_fields = [
                "card_number",
                "expiry_month",
                "expiry_year",
                "cvv",
                "cardholder_name",
            ]

            for field in required_fields:
                if field not in card_data or not card_data[field]:
                    return {"success": False, "error": f"Campo {field} é obrigatório"}

            # Preparar dados para tokenização
            token_data = {
                "card_number": str(card_data.get("card_number")).replace(" ", ""),
                "security_code": str(card_data.get("cvv")),
                "expiration_month": int(card_data.get("expiry_month")),
                "expiration_year": int(card_data.get("expiry_year")),
                "cardholder": {
                    "name": card_data.get("cardholder_name"),
                    "identification": {
                        "type": card_data.get("doc_type", "CPF"),
                        "number": card_data.get("doc_number", ""),
                    },
                },
            }
            
            # Log especial para debug do MasterCard
            masked_number = token_data["card_number"][:4] + "****" + token_data["card_number"][-4:]
            logger.info(f"Creating card token - Number: {masked_number}, Month: {token_data['expiration_month']}, Year: {token_data['expiration_year']}")
            if card_data.get("brand") == "mastercard":
                logger.info(f"MasterCard BIN: {token_data['card_number'][:6]}")

            # Criar token
            token_response = self.mp.card_token().create(token_data)

            if token_response["status"] == 201:
                token = token_response["response"]

                logger.info(f"Card token created successfully: {token['id']}")

                return {
                    "success": True,
                    "token": token["id"],
                    "first_six_digits": token["first_six_digits"],
                    "last_four_digits": token["last_four_digits"],
                    "cardholder_name": token["cardholder"]["name"],
                    "expiration_month": token["expiration_month"],
                    "expiration_year": token["expiration_year"],
                }
            else:
                logger.error(f"Error creating card token: {token_response}")
                # Log adicional para erro de BIN no MasterCard
                if token_response.get("response", {}).get("message") == "bin_not_found":
                    logger.error(f"BIN not found error - Card number first 6 digits: {token_data['card_number'][:6]}")
                return {
                    "success": False,
                    "error": "Failed to create card token",
                    "details": token_response,
                }

        except Exception as e:
            logger.error(f"Error in create_card_token: {str(e)}")
            return {"success": False, "error": str(e)}

    def process_transparent_payment(
        self, payment_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Processa pagamento transparente com suporte a 3DS e tokenização

        Args:
            payment_data: Dados do pagamento transparente

        Returns:
            Dict com resultado do processamento
        """
        try:
            if not self.mp:
                return {"success": False, "error": "Mercado Pago not configured"}

            # Validar dados obrigatórios
            required_fields = ["amount", "payment_method_id", "payer_email"]
            for field in required_fields:
                if field not in payment_data:
                    return {"success": False, "error": f"Campo {field} é obrigatório"}

            # Preparar dados base do pagamento
            payment_request = {
                "transaction_amount": float(payment_data.get("amount")),
                "payment_method_id": payment_data.get("payment_method_id"),
                "payer": {
                    "email": payment_data.get("payer_email"),
                    "first_name": payment_data.get("payer_first_name", ""),
                    "last_name": payment_data.get("payer_last_name", ""),
                    "identification": {
                        "type": payment_data.get("payer_doc_type", "CPF"),
                        "number": payment_data.get("payer_doc_number", ""),
                    },
                    "address": {
                        "zip_code": payment_data.get("payer_address_zip", ""),
                        "street_name": payment_data.get("payer_address_street", ""),
                        "street_number": payment_data.get("payer_address_number", ""),
                        "neighborhood": payment_data.get(
                            "payer_address_neighborhood", ""
                        ),
                        "city": payment_data.get("payer_address_city", ""),
                        "federal_unit": payment_data.get("payer_address_state", ""),
                    },
                },
                "external_reference": payment_data.get("order_id"),
                "description": payment_data.get(
                    "description", "Compra Mestres do Café"
                ),
                "notification_url": self.notification_url,
                "statement_descriptor": "MESTRES DO CAFE",
            }

            # Adicionar token se for pagamento com cartão
            if payment_data.get("token"):
                payment_request["token"] = payment_data.get("token")

                # Adicionar parcelamento
                if payment_data.get("installments"):
                    payment_request["installments"] = int(
                        payment_data.get("installments")
                    )

                # Configurar 3DS se habilitado
                if self.enable_3ds and payment_data.get("enable_3ds", True):
                    payment_request["three_d_secure_mode"] = "optional"

            # Adicionar dados específicos para PIX
            elif payment_data.get("payment_method_id") == "pix":
                # PIX requer data de expiração no formato correto
                from datetime import datetime, timedelta
                
                # Adicionar 30 minutos de expiração por padrão
                expiration_minutes = payment_data.get("pix_expiration", 30)
                expiration_date = datetime.utcnow() + timedelta(minutes=expiration_minutes)
                
                # Formato exato esperado pela API do MercadoPago
                payment_request["date_of_expiration"] = expiration_date.strftime("%Y-%m-%dT%H:%M:%S.000-04:00")
                
                # PIX também pode precisar de notification_url
                if payment_data.get("notification_url"):
                    payment_request["notification_url"] = payment_data["notification_url"]
                
                logger.info(
                    f"PIX payment request: {json.dumps(payment_request, indent=2)}"
                )

            # Adicionar split payment para marketplace
            if payment_data.get("vendor_id") and payment_data.get("marketplace_fee"):
                payment_request["application_fee"] = float(
                    payment_data.get("marketplace_fee")
                )

                # Adicionar dados do vendedor
                payment_request["marketplace"] = "MESTRES_DO_CAFE"
                if payment_data.get("vendor_access_token"):
                    payment_request["additional_info"] = {
                        "items": [
                            {
                                "id": payment_data.get("order_id"),
                                "title": payment_data.get("description", "Produto"),
                                "quantity": 1,
                                "unit_price": float(payment_data.get("amount")),
                            }
                        ]
                    }

            # Log para debug de boleto
            if payment_data.get("payment_method_id") == "bolbradesco":
                logger.info(
                    f"Boleto payment request: {json.dumps(payment_request, indent=2)}"
                )

            # Processar pagamento
            try:
                # Log especial para PIX antes da requisição
                if payment_data.get("payment_method_id") == "pix":
                    logger.info("Creating PIX payment...")
                    logger.info(f"PIX request data: {json.dumps(payment_request, indent=2)}")
                
                payment_response = self.mp.payment().create(payment_request)
                
                # Log detalhado da resposta
                logger.info(f"Payment response type: {type(payment_response)}")
                logger.info(f"Payment response dir: {dir(payment_response)}")
                
                if hasattr(payment_response, '__dict__'):
                    logger.info(f"Payment response dict: {payment_response.__dict__}")
                
                # Log completo da resposta como dict
                if isinstance(payment_response, dict):
                    logger.info(f"Full payment response: {json.dumps(payment_response, indent=2)}")
                
                logger.info(
                    f"Payment response status: {payment_response.get('status') if payment_response else 'None'}"
                )

                if payment_data.get("payment_method_id") == "pix" and payment_response:
                    # Verificar se há mensagem de erro
                    if payment_response.get('status') != 201:
                        logger.error(f"PIX payment failed: {payment_response}")
                        if payment_response.get('message'):
                            logger.error(f"Error message: {payment_response.get('message')}")
                        if payment_response.get('cause'):
                            logger.error(f"Error cause: {payment_response.get('cause')}")
                    
                    logger.info(
                        f"PIX payment response: {json.dumps(payment_response.get('response', {}), indent=2) if payment_response.get('response') else 'Empty response'}"
                    )
            except Exception as e:
                logger.error(f"Exception creating payment: {str(e)}")
                logger.error(f"Exception type: {type(e).__name__}")
                
                # Log detalhado para PIX
                if payment_data.get("payment_method_id") == "pix":
                    logger.error("PIX payment failed with exception")
                    if hasattr(e, 'response'):
                        logger.error(f"Exception response: {e.response}")
                        if hasattr(e.response, 'text'):
                            logger.error(f"Response text: {e.response.text}")
                        if hasattr(e.response, 'status_code'):
                            logger.error(f"Response status: {e.response.status_code}")
                
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                return {"success": False, "error": f"Payment creation failed: {str(e)}"}

            if payment_response and payment_response.get("status") == 201:
                payment = payment_response["response"]

                result = {
                    "success": True,
                    "payment_id": payment["id"],
                    "status": payment["status"],
                    "status_detail": payment["status_detail"],
                    "amount": payment["transaction_amount"],
                    "net_amount": payment.get("net_amount"),
                    "payment_method": payment["payment_method_id"],
                    "payment_type": payment["payment_type_id"],
                }

                # Adicionar dados específicos por método de pagamento
                if payment["payment_method_id"] == "pix":
                    result.update(
                        {
                            "qr_code": payment.get("point_of_interaction", {})
                            .get("transaction_data", {})
                            .get("qr_code"),
                            "qr_code_base64": payment.get("point_of_interaction", {})
                            .get("transaction_data", {})
                            .get("qr_code_base64"),
                            "pix_key": payment.get("point_of_interaction", {})
                            .get("transaction_data", {})
                            .get("pix_key"),
                        }
                    )
                elif payment["payment_type_id"] == "ticket":  # Boleto
                    result.update(
                        {
                            "ticket_url": payment.get("transaction_details", {}).get(
                                "external_resource_url"
                            ),
                            "barcode": payment.get("transaction_details", {}).get(
                                "verification_code"
                            ),
                        }
                    )
                elif payment["payment_type_id"] == "credit_card":
                    # Verificar se houve 3DS challenge
                    if payment.get("three_d_secure_url"):
                        result.update(
                            {
                                "requires_3ds": True,
                                "three_d_secure_url": payment.get("three_d_secure_url"),
                            }
                        )

                logger.info(f"Transparent payment processed: {payment['id']}")
                return result

            else:
                logger.error(
                    f"Error processing transparent payment: {payment_response}"
                )
                return {
                    "success": False,
                    "error": "Failed to process payment",
                    "details": payment_response,
                }

        except Exception as e:
            logger.error(f"Error in process_transparent_payment: {str(e)}")
            return {"success": False, "error": str(e)}

    def validate_payment_data(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida dados de pagamento antes do processamento

        Args:
            payment_data: Dados do pagamento a serem validados

        Returns:
            Dict com resultado da validação
        """
        try:
            errors = []

            # Validações básicas
            if (
                not payment_data.get("amount")
                or float(payment_data.get("amount", 0)) <= 0
            ):
                errors.append("Valor do pagamento deve ser maior que zero")

            if not payment_data.get("payment_method_id"):
                errors.append("Método de pagamento é obrigatório")

            if not payment_data.get("payer_email"):
                errors.append("Email do pagador é obrigatório")

            # Validações específicas por método de pagamento
            payment_method = payment_data.get("payment_method_id")

            if payment_method in ["visa", "master", "elo", "amex"]:  # Cartões
                if not payment_data.get("token"):
                    errors.append(
                        "Token do cartão é obrigatório para pagamentos com cartão"
                    )

                if payment_data.get("installments"):
                    installments = int(payment_data.get("installments", 1))
                    if installments < 1 or installments > 12:
                        errors.append("Número de parcelas deve ser entre 1 e 12")

            elif payment_method == "pix":
                # PIX não precisa de validações específicas adicionais
                pass

            elif payment_method == "bolbradesco":  # Boleto
                # Boleto não precisa de validações específicas adicionais
                pass

            # Validar dados do pagador
            if payment_data.get("payer_doc_number"):
                doc_number = (
                    payment_data.get("payer_doc_number", "")
                    .replace(".", "")
                    .replace("-", "")
                )
                doc_type = payment_data.get("payer_doc_type", "CPF")

                if doc_type == "CPF" and len(doc_number) != 11:
                    errors.append("CPF deve ter 11 dígitos")
                elif doc_type == "CNPJ" and len(doc_number) != 14:
                    errors.append("CNPJ deve ter 14 dígitos")

            # Validar email
            import re

            email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            if not re.match(email_pattern, payment_data.get("payer_email", "")):
                errors.append("Email do pagador inválido")

            if errors:
                return {"success": False, "errors": errors}

            return {"success": True, "message": "Dados válidos"}

        except Exception as e:
            logger.error(f"Error validating payment data: {str(e)}")
            return {"success": False, "error": str(e)}

    def get_installments(self, amount: float, payment_method_id: str) -> Dict[str, Any]:
        """
        Obtém opções de parcelamento para um método de pagamento

        Args:
            amount: Valor do pagamento
            payment_method_id: ID do método de pagamento

        Returns:
            Dict com opções de parcelamento
        """
        try:
            if not self.mp:
                return {"success": False, "error": "Mercado Pago not configured"}

            installments_response = self.mp.payment_methods().list_all(
                {"payment_method_id": payment_method_id, "amount": amount}
            )

            if installments_response["status"] == 200:
                return {
                    "success": True,
                    "installments": installments_response["response"],
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to get installments",
                    "details": installments_response,
                }

        except Exception as e:
            logger.error(f"Error getting installments: {str(e)}")
            return {"success": False, "error": str(e)}

    def process_webhook_data(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Alias para process_webhook_notification para compatibilidade com testes

        Args:
            notification_data: Dados da notificação

        Returns:
            Dict com resultado do processamento
        """
        return self.process_webhook_notification(notification_data)
