"""
Rotas para integração com Mercado Pago
"""

import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError

from services.mercado_pago_service import MercadoPagoService
from services.escrow_service import EscrowService
from models.auth import User
from models.orders import Order
from models.payments import Payment, PaymentStatus
from models.customers import Customer
from models.vendors import Vendor
from database import db
from utils.validators import validate_uuid
from utils.logger import logger
from middleware.mercado_pago_validation import (
    validate_mercado_pago_payment,
    validate_mercado_pago_webhook,
    MercadoPagoValidator
)

mercado_pago_bp = Blueprint('mercado_pago', __name__)


class CreatePreferenceSchema(Schema):
    order_id = fields.Str(required=True, validate=validate_uuid)
    title = fields.Str(missing="Pedido Mestres do Café")
    description = fields.Str(missing="Compra de produtos de café")
    payer_name = fields.Str(required=True)
    payer_email = fields.Email(required=True)
    payer_phone = fields.Str(missing="")
    payer_phone_area = fields.Str(missing="11")
    payer_doc_type = fields.Str(missing="CPF")
    payer_doc_number = fields.Str(required=True)
    payer_address_street = fields.Str(missing="")
    payer_address_number = fields.Str(missing="")
    payer_address_zip = fields.Str(missing="")


class ProcessPaymentSchema(Schema):
    order_id = fields.Str(required=True, validate=validate_uuid)
    payment_method_id = fields.Str(required=True)
    token = fields.Str(required=False)
    installments = fields.Int(missing=1)
    payer_email = fields.Email(required=True)
    payer_doc_type = fields.Str(missing="CPF")
    payer_doc_number = fields.Str(required=True)
    description = fields.Str(missing="Compra Mestres do Café")


@mercado_pago_bp.route('/create-preference', methods=['POST'])
@jwt_required()
def create_preference():
    """
    Cria uma preferência de pagamento para Checkout Pro
    """
    try:
        # Validação do schema
        schema = CreatePreferenceSchema()
        data = schema.load(request.get_json())
        
        # Verificar se o usuário existe
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Buscar o pedido
        order = db.session.query(Order).filter(
            Order.id == data['order_id']
        ).first()
        
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        # Verificar se o usuário tem acesso ao pedido
        if order.user_id != user.id:
            customer = db.session.query(Customer).filter(Customer.user_id == user.id).first()
            if not customer or order.customer_id != customer.id:
                return jsonify({"error": "Access denied"}), 403
        
        # Verificar se já existe um pagamento pendente
        existing_payment = db.session.query(Payment).filter(
            Payment.order_id == order.id,
            Payment.status.in_(['pending', 'processing'])
        ).first()
        
        if existing_payment:
            return jsonify({"error": "Payment already in progress for this order"}), 400
        
        # Preparar dados para o Mercado Pago
        mp_service = MercadoPagoService()
        
        # Buscar dados do vendedor se existir item com vendedor
        vendor_data = {}
        marketplace_fee = 0
        
        if order.items:
            for item in order.items:
                if item.product and hasattr(item.product, 'vendor_id') and item.product.vendor_id:
                    vendor = db.session.query(Vendor).filter(
                        Vendor.id == item.product.vendor_id
                    ).first()
                    
                    if vendor:
                        marketplace_fee = float(mp_service.calculate_marketplace_fee(
                            order.total_amount, 
                            str(vendor.id)
                        ))
                        vendor_data = {
                            "marketplace": "MESTRES_DO_CAFE",
                            "collector_id": vendor.mercado_pago_user_id if hasattr(vendor, 'mercado_pago_user_id') else None
                        }
                    break
        
        order_data = {
            'order_id': str(order.id),
            'amount': float(order.total_amount),
            'title': data.get('title'),
            'description': data.get('description'),
            'payer_name': data.get('payer_name'),
            'payer_email': data.get('payer_email'),
            'payer_phone': data.get('payer_phone'),
            'payer_phone_area': data.get('payer_phone_area'),
            'payer_doc_type': data.get('payer_doc_type'),
            'payer_doc_number': data.get('payer_doc_number'),
            'payer_address_street': data.get('payer_address_street'),
            'payer_address_number': data.get('payer_address_number'),
            'payer_address_zip': data.get('payer_address_zip'),
            'marketplace_data': vendor_data,
            'marketplace_fee': marketplace_fee,
            'vendor_id': vendor.id if 'vendor' in locals() else None
        }
        
        # Criar preferência
        result = mp_service.create_preference(order_data)
        
        if result['success']:
            # Criar registro de pagamento pendente
            payment = Payment(
                order_id=order.id,
                vendor_id=vendor.id if 'vendor' in locals() else None,
                amount=order.total_amount,
                currency='BRL',
                status=PaymentStatus.PENDING.value,
                payment_method='mercado_pago',
                provider='mercado_pago',
                provider_transaction_id=result['preference_id']
            )
            
            db.session.add(payment)
            order.payment_status = 'pending'
            db.session.commit()
            
            logger.info(f"Preference created for order {order.id}: {result['preference_id']}")
            
            return jsonify({
                "success": True,
                "preference_id": result['preference_id'],
                "init_point": result['init_point'],
                "sandbox_init_point": result['sandbox_init_point'],
                "public_key": result['public_key'],
                "environment": result['environment'],
                "payment_id": str(payment.id)
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except ValidationError as e:
        return jsonify({"error": e.messages}), 400
    except Exception as e:
        logger.error(f"Error creating preference: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@mercado_pago_bp.route('/process-payment', methods=['POST'])
@jwt_required()
@validate_mercado_pago_payment
def process_payment():
    """
    Processa um pagamento direto (sem Checkout Pro)
    """
    try:
        # Validação do schema
        schema = ProcessPaymentSchema()
        data = schema.load(request.get_json())
        
        # Verificar se o usuário existe
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Buscar o pedido
        order = db.session.query(Order).filter(
            Order.id == data['order_id']
        ).first()
        
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        # Verificar acesso ao pedido
        if order.user_id != user.id:
            customer = db.session.query(Customer).filter(Customer.user_id == user.id).first()
            if not customer or order.customer_id != customer.id:
                return jsonify({"error": "Access denied"}), 403
        
        # Preparar dados do pagamento
        mp_service = MercadoPagoService()
        
        # Buscar dados do vendedor
        vendor_id = None
        marketplace_fee = 0
        
        if order.items:
            for item in order.items:
                if item.product and hasattr(item.product, 'vendor_id') and item.product.vendor_id:
                    vendor_id = item.product.vendor_id
                    marketplace_fee = float(mp_service.calculate_marketplace_fee(
                        order.total_amount, 
                        str(vendor_id)
                    ))
                    break
        
        payment_data = {
            'order_id': str(order.id),
            'amount': float(order.total_amount),
            'payment_method_id': data['payment_method_id'],
            'token': data.get('token'),
            'installments': data.get('installments', 1),
            'payer_email': data['payer_email'],
            'payer_doc_type': data['payer_doc_type'],
            'payer_doc_number': data['payer_doc_number'],
            'description': data['description'],
            'vendor_id': vendor_id,
            'marketplace_fee': marketplace_fee if vendor_id else 0
        }
        
        # Processar pagamento
        result = mp_service.process_payment(payment_data)
        
        if result['success']:
            # Criar registro de pagamento
            payment = Payment(
                order_id=order.id,
                vendor_id=vendor_id,
                amount=order.total_amount,
                currency='BRL',
                status=mp_service._map_mercado_pago_status(result['status']),
                payment_method=result['payment_method'],
                provider='mercado_pago',
                provider_transaction_id=str(result['payment_id']),
                provider_response=json.dumps(result)
            )
            
            # Se pagamento aprovado e há vendedor, colocar em escrow
            if (result['status'] == 'approved' and vendor_id):
                payment.hold_payment("Marketplace escrow - payment approved")
            
            db.session.add(payment)
            order.payment_status = payment.status
            db.session.commit()
            
            logger.info(f"Payment processed for order {order.id}: {result['payment_id']}")
            
            return jsonify({
                "success": True,
                "payment_id": str(payment.id),
                "mp_payment_id": result['payment_id'],
                "status": result['status'],
                "status_detail": result['status_detail'],
                "amount": result['amount']
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except ValidationError as e:
        return jsonify({"error": e.messages}), 400
    except Exception as e:
        logger.error(f"Error processing payment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@mercado_pago_bp.route('/webhook', methods=['POST'])
@validate_mercado_pago_webhook
def webhook():
    """
    Webhook para receber notificações do Mercado Pago
    """
    try:
        # Verificar assinatura do webhook
        mp_service = MercadoPagoService()
        signature = request.headers.get('X-Signature')
        
        if signature and not mp_service.verify_webhook_signature(request.get_data(), signature):
            logger.warning("Invalid webhook signature")
            return jsonify({"error": "Invalid signature"}), 401
        
        # Processar notificação
        notification_data = request.get_json()
        
        if not notification_data:
            return jsonify({"error": "No data received"}), 400
        
        result = mp_service.process_webhook_notification(notification_data)
        
        if result['success']:
            logger.info(f"Webhook processed successfully: {notification_data}")
            return jsonify({"status": "ok"}), 200
        else:
            logger.error(f"Error processing webhook: {result['error']}")
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error in webhook: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@mercado_pago_bp.route('/payment/<payment_id>', methods=['GET'])
@jwt_required()
def get_payment_status(payment_id):
    """
    Obtém status de um pagamento
    """
    try:
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Buscar pagamento
        payment = db.session.query(Payment).filter(Payment.id == payment_id).first()
        
        if not payment:
            return jsonify({"error": "Payment not found"}), 404
        
        # Verificar acesso
        if payment.order.user_id != user.id:
            customer = db.session.query(Customer).filter(Customer.user_id == user.id).first()
            if not customer or payment.order.customer_id != customer.id:
                return jsonify({"error": "Access denied"}), 403
        
        # Buscar status atualizado no Mercado Pago
        if payment.provider_transaction_id:
            mp_service = MercadoPagoService()
            mp_result = mp_service.get_payment(payment.provider_transaction_id)
            
            if mp_result['success']:
                mp_payment = mp_result['payment']
                
                # Atualizar status se necessário
                new_status = mp_service._map_mercado_pago_status(mp_payment['status'])
                if new_status != payment.status:
                    old_status = payment.status
                    payment.status = new_status
                    payment.provider_response = json.dumps(mp_payment)
                    
                    # Se pagamento aprovado e há vendedor, colocar em escrow
                    if (old_status != 'paid' and new_status == 'paid' and payment.vendor_id):
                        payment.hold_payment("Marketplace escrow - payment approved")
                    
                    db.session.commit()
                    
                    logger.info(f"Payment {payment_id} status updated from {old_status} to {new_status}")
        
        return jsonify({
            "success": True,
            "payment": payment.to_dict(),
            "order": payment.order.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting payment status: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@mercado_pago_bp.route('/payment-methods', methods=['GET'])
def get_payment_methods():
    """
    Obtém métodos de pagamento disponíveis
    """
    try:
        mp_service = MercadoPagoService()
        result = mp_service.get_payment_methods()
        
        if result['success']:
            return jsonify({
                "success": True,
                "payment_methods": result['payment_methods']
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error getting payment methods: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@mercado_pago_bp.route('/refund', methods=['POST'])
@jwt_required()
def refund_payment():
    """
    Realiza estorno de um pagamento (apenas admins)
    """
    try:
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        
        data = request.get_json()
        payment_id = data.get('payment_id')
        amount = data.get('amount')  # Opcional para estorno parcial
        
        if not payment_id:
            return jsonify({"error": "Payment ID required"}), 400
        
        # Buscar pagamento
        payment = db.session.query(Payment).filter(Payment.id == payment_id).first()
        
        if not payment:
            return jsonify({"error": "Payment not found"}), 404
        
        if not payment.provider_transaction_id:
            return jsonify({"error": "No external payment ID found"}), 400
        
        # Realizar estorno no Mercado Pago
        mp_service = MercadoPagoService()
        result = mp_service.refund_payment(payment.provider_transaction_id, amount)
        
        if result['success']:
            # Atualizar status do pagamento
            if amount and float(amount) < float(payment.amount):
                payment.status = PaymentStatus.PARTIALLY_REFUNDED.value
            else:
                payment.status = PaymentStatus.REFUNDED.value
            
            db.session.commit()
            
            logger.info(f"Payment {payment_id} refunded: {result['refund_id']}")
            
            return jsonify({
                "success": True,
                "refund_id": result['refund_id'],
                "amount": result['amount'],
                "status": result['status']
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error refunding payment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


# ========== CHECKOUT TRANSPARENTE ENDPOINTS ========== #

@mercado_pago_bp.route('/transparent/create-card-token', methods=['POST'])
def create_card_token():
    """
    Cria token de cartão para Checkout Transparente
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data received"}), 400
        
        # Validar campos obrigatórios
        required_fields = [
            'card_number', 'expiry_month', 'expiry_year', 'cvv', 'cardholder_name'
        ]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Campo {field} é obrigatório"}), 400
        
        mp_service = MercadoPagoService()
        result = mp_service.create_card_token(data)
        
        if result['success']:
            return jsonify({
                "success": True,
                "token": result['token'],
                "first_six_digits": result['first_six_digits'],
                "last_four_digits": result['last_four_digits'],
                "cardholder_name": result['cardholder_name']
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error creating card token: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@mercado_pago_bp.route('/transparent/process-payment', methods=['POST'])
@jwt_required()
@validate_mercado_pago_payment
def process_transparent_payment():
    """
    Processa pagamento através do Checkout Transparente
    """
    try:
        data = request.get_json()
        
        # Verificar usuário
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Buscar pedido
        order_id = data.get('order_id')
        if not order_id:
            return jsonify({"error": "Order ID required"}), 400
        
        order = db.session.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        # Verificar acesso ao pedido
        if order.user_id != user.id:
            customer = db.session.query(Customer).filter(Customer.user_id == user.id).first()
            if not customer or order.customer_id != customer.id:
                return jsonify({"error": "Access denied"}), 403
        
        # Preparar dados do pagamento
        mp_service = MercadoPagoService()
        
        # Validar dados antes de processar
        validation_result = mp_service.validate_payment_data(data)
        if not validation_result['success']:
            return jsonify({
                "error": "Validation failed",
                "details": validation_result.get('errors', [validation_result.get('error')])
            }), 400
        
        # Buscar dados do vendedor para split payment
        vendor_id = None
        marketplace_fee = 0
        
        if order.items:
            for item in order.items:
                if item.product and hasattr(item.product, 'vendor_id') and item.product.vendor_id:
                    vendor_id = item.product.vendor_id
                    marketplace_fee = float(mp_service.calculate_marketplace_fee(
                        order.total_amount,
                        str(vendor_id)
                    ))
                    break
        
        payment_data = {
            'order_id': str(order.id),
            'amount': float(order.total_amount),
            'payment_method_id': data.get('payment_method_id'),
            'token': data.get('token'),
            'installments': data.get('installments', 1),
            'payer_email': data.get('payer_email'),
            'payer_first_name': data.get('payer_first_name', ''),
            'payer_last_name': data.get('payer_last_name', ''),
            'payer_doc_type': data.get('payer_doc_type', 'CPF'),
            'payer_doc_number': data.get('payer_doc_number'),
            'payer_address_zip': data.get('payer_address_zip', ''),
            'payer_address_street': data.get('payer_address_street', ''),
            'payer_address_number': data.get('payer_address_number', ''),
            'description': data.get('description', 'Compra Mestres do Café'),
            'vendor_id': vendor_id,
            'marketplace_fee': marketplace_fee if vendor_id else 0,
            'enable_3ds': data.get('enable_3ds', True),
            'pix_expiration': data.get('pix_expiration')
        }
        
        # Processar pagamento
        result = mp_service.process_transparent_payment(payment_data)
        
        if result['success']:
            # Criar registro de pagamento
            payment = Payment(
                order_id=order.id,
                vendor_id=vendor_id,
                amount=order.total_amount,
                currency='BRL',
                status=mp_service._map_mercado_pago_status(result['status']),
                payment_method=result['payment_method'],
                provider='mercado_pago',
                provider_transaction_id=str(result['payment_id']),
                provider_response=json.dumps(result)
            )
            
            # Se pagamento aprovado e há vendedor, colocar em escrow
            if (result['status'] == 'approved' and vendor_id):
                payment.hold_payment("Marketplace escrow - payment approved")
            
            db.session.add(payment)
            order.payment_status = payment.status
            db.session.commit()
            
            logger.info(f"Transparent payment processed for order {order.id}: {result['payment_id']}")
            
            response = {
                "success": True,
                "payment_id": str(payment.id),
                "mp_payment_id": result['payment_id'],
                "status": result['status'],
                "status_detail": result['status_detail'],
                "amount": result['amount']
            }
            
            # Adicionar dados específicos baseados no método de pagamento
            if result.get('qr_code'):
                response['pix_data'] = {
                    'qr_code': result['qr_code'],
                    'qr_code_base64': result.get('qr_code_base64'),
                    'pix_key': result.get('pix_key')
                }
            elif result.get('ticket_url'):
                response['boleto_data'] = {
                    'ticket_url': result['ticket_url'],
                    'barcode': result.get('barcode')
                }
            elif result.get('requires_3ds'):
                response['three_d_secure'] = {
                    'requires_action': True,
                    'redirect_url': result['three_d_secure_url']
                }
            
            return jsonify(response), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except ValidationError as e:
        return jsonify({"error": e.messages}), 400
    except Exception as e:
        logger.error(f"Error processing transparent payment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@mercado_pago_bp.route('/transparent/validate-payment', methods=['POST'])
def validate_payment_data():
    """
    Valida dados de pagamento antes do processamento
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data received"}), 400
        
        mp_service = MercadoPagoService()
        result = mp_service.validate_payment_data(data)
        
        if result['success']:
            return jsonify({
                "success": True,
                "message": "Dados válidos"
            }), 200
        else:
            return jsonify({
                "success": False,
                "errors": result.get('errors', [result.get('error')])
            }), 400
            
    except Exception as e:
        logger.error(f"Error validating payment data: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@mercado_pago_bp.route('/transparent/installments', methods=['GET'])
def get_installments():
    """
    Obtém opções de parcelamento para um método de pagamento
    """
    try:
        amount = request.args.get('amount')
        payment_method_id = request.args.get('payment_method_id')
        
        if not amount or not payment_method_id:
            return jsonify({"error": "Amount and payment_method_id required"}), 400
        
        try:
            amount_float = float(amount)
        except ValueError:
            return jsonify({"error": "Invalid amount format"}), 400
        
        mp_service = MercadoPagoService()
        result = mp_service.get_installments(amount_float, payment_method_id)
        
        if result['success']:
            return jsonify({
                "success": True,
                "installments": result['installments']
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error getting installments: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@mercado_pago_bp.route('/transparent/payment-methods', methods=['GET'])
def get_transparent_payment_methods():
    """
    Obtém métodos de pagamento disponíveis para Checkout Transparente
    """
    try:
        mp_service = MercadoPagoService()
        result = mp_service.get_payment_methods()
        
        if result['success']:
            # Filtrar apenas métodos suportados pelo checkout transparente
            supported_methods = []
            for method in result['payment_methods']:
                if method['id'] in ['visa', 'master', 'elo', 'amex', 'pix', 'bolbradesco']:
                    supported_methods.append({
                        'id': method['id'],
                        'name': method['name'],
                        'payment_type_id': method['payment_type_id'],
                        'secure_thumbnail': method.get('secure_thumbnail'),
                        'thumbnail': method.get('thumbnail'),
                        'min_allowed_amount': method.get('min_allowed_amount'),
                        'max_allowed_amount': method.get('max_allowed_amount'),
                        'settings': method.get('settings', [])
                    })
            
            return jsonify({
                "success": True,
                "payment_methods": supported_methods
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error getting transparent payment methods: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500