"""
Rotas para gerenciamento de escrow
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError

from ...services.escrow_service import EscrowService
from ...services.escrow_scheduler import escrow_scheduler
from ...models.auth import User
from ...models.vendors import Vendor
from ...models.customers import Customer
from ...database import db
from ...utils.validators import validate_uuid
from ...utils.logger import logger

escrow_bp = Blueprint('escrow', __name__)


class HoldPaymentSchema(Schema):
    payment_id = fields.Str(required=True, validate=validate_uuid)
    reason = fields.Str(missing="Marketplace escrow - awaiting delivery confirmation")


class ReleasePaymentSchema(Schema):
    payment_id = fields.Str(required=True, validate=validate_uuid)
    force = fields.Bool(missing=False)


class CreateDisputeSchema(Schema):
    payment_id = fields.Str(required=True, validate=validate_uuid)
    reason = fields.Str(required=True, validate=lambda x: x in [
        'not_delivered', 'damaged', 'not_as_described', 'other'
    ])
    description = fields.Str(required=True, validate=lambda x: len(x) >= 10)


@escrow_bp.route('/hold', methods=['POST'])
@jwt_required()
def hold_payment():
    """
    Coloca um pagamento em escrow
    Apenas admins podem fazer isso
    """
    try:
        # Validação do schema
        schema = HoldPaymentSchema()
        data = schema.load(request.get_json())
        
        # Verificar se é admin
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        
        # Executar operação
        escrow_service = EscrowService()
        result = escrow_service.hold_payment(
            payment_id=data['payment_id'],
            reason=data['reason']
        )
        
        if result['success']:
            return jsonify({
                "message": "Payment held in escrow successfully",
                "payment": result['payment'],
                "escrow_transaction": result['escrow_transaction']
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except ValidationError as e:
        return jsonify({"error": e.messages}), 400
    except Exception as e:
        logger.error(f"Error holding payment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@escrow_bp.route('/release', methods=['POST'])
@jwt_required()
def release_payment():
    """
    Libera um pagamento do escrow
    Admins podem forçar liberação
    """
    try:
        # Validação do schema
        schema = ReleasePaymentSchema()
        data = schema.load(request.get_json())
        
        # Verificar se é admin para força liberação
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Apenas admins podem forçar liberação
        if data['force'] and user.role != 'admin':
            return jsonify({"error": "Admin access required for forced release"}), 403
        
        # Executar operação
        escrow_service = EscrowService()
        result = escrow_service.release_payment(
            payment_id=data['payment_id'],
            force=data['force']
        )
        
        if result['success']:
            return jsonify({
                "message": "Payment released from escrow successfully",
                "payment": result['payment'],
                "escrow_transaction": result['escrow_transaction']
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except ValidationError as e:
        return jsonify({"error": e.messages}), 400
    except Exception as e:
        logger.error(f"Error releasing payment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@escrow_bp.route('/dispute', methods=['POST'])
@jwt_required()
def create_dispute():
    """
    Cria uma disputa para um pagamento
    Apenas o cliente que fez o pedido pode criar disputa
    """
    try:
        # Validação do schema
        schema = CreateDisputeSchema()
        data = schema.load(request.get_json())
        
        # Verificar se é cliente
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Encontrar cliente
        customer = db.session.query(Customer).filter(Customer.user_id == user.id).first()
        
        if not customer:
            return jsonify({"error": "Customer profile not found"}), 404
        
        # Executar operação
        escrow_service = EscrowService()
        result = escrow_service.create_dispute(
            payment_id=data['payment_id'],
            customer_id=str(customer.id),
            reason=data['reason'],
            description=data['description']
        )
        
        if result['success']:
            return jsonify({
                "message": "Dispute created successfully",
                "dispute": result['dispute'],
                "payment": result['payment']
            }), 201
        else:
            return jsonify({"error": result['error']}), 400
            
    except ValidationError as e:
        return jsonify({"error": e.messages}), 400
    except Exception as e:
        logger.error(f"Error creating dispute: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@escrow_bp.route('/held-payments', methods=['GET'])
@jwt_required()
def get_held_payments():
    """
    Obtém pagamentos em escrow
    Vendedores veem apenas seus pagamentos, admins veem todos
    """
    try:
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        escrow_service = EscrowService()
        
        # Se for vendedor, filtrar por vendor_id
        if user.role == 'vendor':
            vendor = db.session.query(Vendor).filter(Vendor.user_id == user.id).first()
            if not vendor:
                return jsonify({"error": "Vendor profile not found"}), 404
            
            payments = escrow_service.get_held_payments(vendor_id=str(vendor.id))
        else:
            # Admin ou outros roles veem todos
            payments = escrow_service.get_held_payments()
        
        return jsonify({
            "payments": payments,
            "total": len(payments)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting held payments: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@escrow_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_escrow_stats():
    """
    Obtém estatísticas do escrow
    """
    try:
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        escrow_service = EscrowService()
        
        # Se for vendedor, filtrar por vendor_id
        if user.role == 'vendor':
            vendor = db.session.query(Vendor).filter(Vendor.user_id == user.id).first()
            if not vendor:
                return jsonify({"error": "Vendor profile not found"}), 404
            
            stats = escrow_service.get_escrow_stats(vendor_id=str(vendor.id))
        else:
            # Admin vê estatísticas gerais
            stats = escrow_service.get_escrow_stats()
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error getting escrow stats: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@escrow_bp.route('/eligible-for-release', methods=['GET'])
@jwt_required()
def get_payments_eligible_for_release():
    """
    Obtém pagamentos elegíveis para liberação automática
    Apenas admins podem acessar
    """
    try:
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        
        escrow_service = EscrowService()
        payments = escrow_service.get_payments_eligible_for_release()
        
        return jsonify({
            "payments": payments,
            "total": len(payments)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting eligible payments: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@escrow_bp.route('/process-automatic-releases', methods=['POST'])
@jwt_required()
def process_automatic_releases():
    """
    Processa liberações automáticas
    Apenas admins podem executar
    """
    try:
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        
        escrow_service = EscrowService()
        result = escrow_service.process_automatic_releases()
        
        if result['success']:
            return jsonify({
                "message": "Automatic releases processed successfully",
                "released_count": result['released_count'],
                "errors": result['errors']
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error processing automatic releases: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@escrow_bp.route('/admin/check-stuck-payments', methods=['POST'])
@jwt_required()
def check_stuck_payments():
    """
    Verifica pagamentos presos no sistema
    Apenas admins podem executar
    """
    try:
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        
        result = escrow_scheduler.check_stuck_payments()
        
        if result['success']:
            return jsonify({
                "message": "Stuck payments check completed",
                "stuck_payments_count": result['stuck_payments_count'],
                "stuck_payments": result['stuck_payments']
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error checking stuck payments: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@escrow_bp.route('/admin/force-release', methods=['POST'])
@jwt_required()
def force_release_payment():
    """
    Força liberação manual de um pagamento
    Apenas admins podem executar
    """
    try:
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        
        data = request.get_json()
        payment_id = data.get('payment_id')
        reason = data.get('reason', 'Manual admin release')
        
        if not payment_id:
            return jsonify({"error": "payment_id is required"}), 400
        
        result = escrow_scheduler.force_release_payment(payment_id, reason)
        
        if result['success']:
            return jsonify({
                "message": "Payment forcefully released",
                "payment": result['payment']
            }), 200
        else:
            return jsonify({"error": result['error']}), 400
            
    except Exception as e:
        logger.error(f"Error forcing payment release: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@escrow_bp.route('/admin/scheduler/status', methods=['GET'])
@jwt_required()
def get_scheduler_status():
    """
    Obtém status do scheduler de escrow
    Apenas admins podem acessar
    """
    try:
        current_user_id = get_jwt_identity()
        user = db.session.query(User).filter(User.id == current_user_id).first()
        
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        
        return jsonify({
            "scheduler_running": escrow_scheduler.running,
            "thread_alive": escrow_scheduler.thread.is_alive() if escrow_scheduler.thread else False
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting scheduler status: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500