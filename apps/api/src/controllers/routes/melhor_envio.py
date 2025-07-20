"""
Rotas para integração com Melhor Envio
"""

import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError

from services.melhor_envio_service import MelhorEnvioService
from models.auth import User
from models.orders import Order
from models.vendors import Vendor
from models.customers import Customer
from database import db
from utils.validators import validate_uuid
from utils.logger import logger

melhor_envio_bp = Blueprint('melhor_envio', __name__)


class CalculateShippingSchema(Schema):
    origin_cep = fields.Str(required=True)
    destination_cep = fields.Str(required=True)
    products = fields.List(fields.Dict(), required=True)


class CreateShipmentSchema(Schema):
    order_id = fields.Str(required=True, validate=validate_uuid)
    service_id = fields.Int(missing=1)  # PAC por padrão
    agency_id = fields.Int(required=False)
    insurance = fields.Bool(missing=True)
    receipt = fields.Bool(missing=False)
    own_hand = fields.Bool(missing=False)


class TrackShipmentSchema(Schema):
    tracking_code = fields.Str(required=True)


@melhor_envio_bp.route('/calculate', methods=['POST'])
def calculate_shipping():
    """
    Calcula opções de frete
    """
    try:
        # Validação do schema
        schema = CalculateShippingSchema()
        data = schema.load(request.get_json())
        
        # Executar cálculo
        me_service = MelhorEnvioService()
        result = me_service.calculate_shipping(
            origin_cep=data['origin_cep'],
            destination_cep=data['destination_cep'],
            products=data['products']
        )
        
        if result['success']:
            return jsonify({
                "success": True,
                "quotes": result['quotes'],
                "fallback": result.get('fallback', False)
            }), 200
        else:
            return jsonify({"error": result.get('error', 'Failed to calculate shipping')}), 400
            
    except ValidationError as e:
        return jsonify({"error": e.messages}), 400
    except Exception as e:
        logger.error(f"Error calculating shipping: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@melhor_envio_bp.route('/order/<order_id>', methods=['GET'])
def get_order_shipping(order_id):
    """
    Obtém informações de frete de um pedido
    """
    try:
        # Buscar o pedido
        order = db.session.query(Order).filter(
            Order.id == order_id
        ).first()
        
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        # Simular dados de frete para demonstração
        shipping_data = {
            "order_id": order_id,
            "shipping_status": "pending",
            "tracking_code": None,
            "carrier": "Correios",
            "service": "PAC",
            "estimated_delivery": "2025-07-22T10:30:00Z",
            "shipping_cost": 12.00,
            "shipping_label": None,
            "created_at": order.created_at.isoformat() if order.created_at else None
        }
        
        return jsonify(shipping_data), 200
        
    except Exception as e:
        logger.error(f"Error getting order shipping: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@melhor_envio_bp.route('/create-shipment', methods=['POST'])
@jwt_required()
def create_shipment():
    """
    Cria uma etiqueta de envio
    Apenas admins e vendedores podem criar
    """
    try:
        # Validação do schema
        schema = CreateShipmentSchema()
        data = schema.load(request.get_json())
        
        # Verificar se o usuário existe
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Verificar permissões (admin ou vendedor)
        if not user.is_admin and user.role not in ['admin', 'vendor']:
            return jsonify({"error": "Access denied. Admin or vendor role required"}), 403
        
        # Buscar o pedido
        order = db.session.query(Order).filter(
            Order.id == data['order_id']
        ).first()
        
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        # Verificar se o usuário tem acesso ao pedido
        if user.role == 'vendor':
            vendor = db.session.query(Vendor).filter(Vendor.user_id == user.id).first()
            if not vendor:
                return jsonify({"error": "Vendor profile not found"}), 404
            
            # Verificar se o pedido contém produtos do vendedor
            has_vendor_products = any(
                item.product and hasattr(item.product, 'vendor_id') and 
                item.product.vendor_id == vendor.id 
                for item in order.items
            )
            
            if not has_vendor_products:
                return jsonify({"error": "Access denied. Order does not contain your products"}), 403
        
        # Verificar se já existe tracking code
        if order.tracking_code:
            return jsonify({"error": "Shipment already created for this order"}), 400
        
        # Preparar dados do pedido para envio
        order_data = _prepare_order_data_for_shipment(order, data)
        
        # Criar envio
        me_service = MelhorEnvioService()
        result = me_service.create_shipment(order_data)
        
        if result['success']:
            # Atualizar pedido com dados do envio
            order.tracking_code = result['tracking_code']
            order.status = 'shipped'
            order.shipping_method = result.get('service_name', 'Melhor Envio')
            
            db.session.commit()
            
            logger.info(f"Shipment created for order {order.id}: {result['tracking_code']}")
            
            return jsonify({
                "success": True,
                "shipment_id": result['shipment_id'],
                "tracking_code": result['tracking_code'],
                "label_url": result.get('label_url'),
                "service_name": result.get('service_name'),
                "price": result.get('price')
            }), 201
        else:
            return jsonify({"error": result['error']}), 400
            
    except ValidationError as e:
        return jsonify({"error": e.messages}), 400
    except Exception as e:
        logger.error(f"Error creating shipment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@melhor_envio_bp.route('/track/<tracking_code>', methods=['GET'])
def track_shipment(tracking_code):
    """
    Rastreia uma entrega
    """
    try:
        me_service = MelhorEnvioService()
        result = me_service.track_shipment(tracking_code)
        
        if result['success']:
            return jsonify({
                "success": True,
                "tracking_data": result
            }), 200
        else:
            return jsonify({"error": result.get('error', 'Failed to track shipment')}), 400
            
    except Exception as e:
        logger.error(f"Error tracking shipment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@melhor_envio_bp.route('/cancel-shipment/<shipment_id>', methods=['POST'])
@jwt_required()
def cancel_shipment(shipment_id):
    """
    Cancela um envio
    Apenas admins podem cancelar
    """
    try:
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        
        me_service = MelhorEnvioService()
        result = me_service.cancel_shipment(shipment_id)
        
        if result['success']:
            # Buscar e atualizar pedido
            order = db.session.query(Order).filter(
                Order.tracking_code.like(f'%{shipment_id}%')
            ).first()
            
            if order:
                order.status = 'cancelled'
                order.tracking_code = None
                db.session.commit()
            
            logger.info(f"Shipment {shipment_id} cancelled")
            
            return jsonify({
                "success": True,
                "message": "Shipment cancelled successfully"
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error cancelling shipment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@melhor_envio_bp.route('/agencies', methods=['GET'])
def get_agencies():
    """
    Obtém agências disponíveis
    """
    try:
        city = request.args.get('city')
        state = request.args.get('state')
        
        if not city or not state:
            return jsonify({"error": "City and state parameters required"}), 400
        
        me_service = MelhorEnvioService()
        result = me_service.get_agencies(city, state)
        
        if result['success']:
            return jsonify({
                "success": True,
                "agencies": result['agencies']
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error getting agencies: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@melhor_envio_bp.route('/webhook', methods=['POST'])
def webhook():
    """
    Webhook para receber notificações do Melhor Envio
    """
    try:
        webhook_data = request.get_json()
        
        if not webhook_data:
            return jsonify({"error": "No data received"}), 400
        
        me_service = MelhorEnvioService()
        result = me_service.process_webhook(webhook_data)
        
        if result['success']:
            logger.info(f"Webhook processed successfully: {webhook_data}")
            return jsonify({"status": "ok"}), 200
        else:
            logger.error(f"Error processing webhook: {result['error']}")
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error in webhook: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@melhor_envio_bp.route('/callback', methods=['GET'])
def oauth_callback():
    """
    Callback para autenticação OAuth2
    """
    try:
        code = request.args.get('code')
        
        if not code:
            return jsonify({"error": "Authorization code not provided"}), 400
        
        me_service = MelhorEnvioService()
        result = me_service.authenticate(code)
        
        if result['success']:
            logger.info("Melhor Envio OAuth authentication successful")
            
            # Em produção, você salvaria o token no banco de dados
            # Por enquanto, retornamos para o usuário configurar manualmente
            return jsonify({
                "success": True,
                "message": "Authentication successful",
                "access_token": result['access_token'],
                "instructions": "Save this token in your environment variables as MELHOR_ENVIO_TOKEN"
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error in OAuth callback: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@melhor_envio_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_shipments():
    """
    Lista envios realizados
    """
    try:
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Filtrar por role
        if user.role == 'admin':
            # Admin vê todos os pedidos com tracking
            orders = db.session.query(Order).filter(
                Order.tracking_code.isnot(None)
            ).order_by(Order.created_at.desc()).all()
        elif user.role == 'vendor':
            # Vendedor vê apenas seus pedidos
            vendor = db.session.query(Vendor).filter(Vendor.user_id == user.id).first()
            if not vendor:
                return jsonify({"error": "Vendor profile not found"}), 404
            
            # Buscar pedidos que contêm produtos do vendedor
            orders = []
            all_orders = db.session.query(Order).filter(
                Order.tracking_code.isnot(None)
            ).all()
            
            for order in all_orders:
                has_vendor_products = any(
                    item.product and hasattr(item.product, 'vendor_id') and 
                    item.product.vendor_id == vendor.id 
                    for item in order.items
                )
                if has_vendor_products:
                    orders.append(order)
        else:
            # Cliente vê apenas seus pedidos
            orders = db.session.query(Order).filter(
                Order.user_id == user.id,
                Order.tracking_code.isnot(None)
            ).order_by(Order.created_at.desc()).all()
        
        # Converter para dict
        shipments = []
        for order in orders:
            shipments.append({
                'order_id': str(order.id),
                'order_number': order.order_number,
                'tracking_code': order.tracking_code,
                'status': order.status,
                'shipping_method': order.shipping_method,
                'total_amount': float(order.total_amount),
                'created_at': order.created_at.isoformat(),
                'delivered_at': order.delivered_at.isoformat() if order.delivered_at else None
            })
        
        return jsonify({
            "success": True,
            "shipments": shipments,
            "total": len(shipments)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting shipments: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


def _prepare_order_data_for_shipment(order: Order, shipment_data: dict) -> dict:
    """Prepara dados do pedido para criação de envio"""
    
    # Dados do cliente
    customer_data = {}
    if order.customer:
        customer_data = {
            'customer_name': order.customer.name or 'Cliente',
            'customer_email': order.customer.email or '',
            'customer_phone': order.customer.phone or '',
            'customer_document': order.customer.document or ''
        }
    elif order.user:
        customer_data = {
            'customer_name': order.user.name or 'Cliente',
            'customer_email': order.user.email or '',
            'customer_phone': getattr(order.user, 'phone', '') or '',
            'customer_document': getattr(order.user, 'document', '') or ''
        }
    
    # Dados do endereço de entrega
    shipping_address = {}
    if order.shipping_address:
        try:
            if isinstance(order.shipping_address, str):
                import json
                shipping_address = json.loads(order.shipping_address)
            else:
                shipping_address = order.shipping_address
        except:
            # Endereço padrão se não conseguir parsear
            shipping_address = {
                'street': 'Endereço não informado',
                'number': 'S/N',
                'district': 'Centro',
                'city': 'Santa Maria',
                'state': 'RS',
                'postal_code': '97010-000'
            }
    
    # Dados dos produtos
    products = []
    total_weight = 0
    total_value = 0
    
    for item in order.items:
        product_data = {
            'name': item.product_name,
            'quantity': item.quantity,
            'price': float(item.unit_price),
            'weight': 0.5,  # Peso padrão
            'width': 10,    # Dimensões padrão
            'height': 10,
            'length': 15
        }
        
        # Se tiver dados do produto, usar valores reais
        if item.product:
            if hasattr(item.product, 'weight') and item.product.weight:
                product_data['weight'] = float(item.product.weight)
            if hasattr(item.product, 'width') and item.product.width:
                product_data['width'] = float(item.product.width)
            if hasattr(item.product, 'height') and item.product.height:
                product_data['height'] = float(item.product.height)
            if hasattr(item.product, 'length') and item.product.length:
                product_data['length'] = float(item.product.length)
        
        products.append(product_data)
        total_weight += product_data['weight'] * item.quantity
        total_value += product_data['price'] * item.quantity
    
    # Dados do pacote
    package_data = {
        'package_weight': max(total_weight, 0.3),
        'package_width': 15,
        'package_height': 10,
        'package_length': 20
    }
    
    return {
        'order_id': str(order.id),
        'order_number': order.order_number,
        'service_id': shipment_data.get('service_id', 1),
        'agency_id': shipment_data.get('agency_id'),
        'insurance': shipment_data.get('insurance', True),
        'receipt': shipment_data.get('receipt', False),
        'own_hand': shipment_data.get('own_hand', False),
        'shipping_address': shipping_address,
        'products': products,
        **customer_data,
        **package_data
    }