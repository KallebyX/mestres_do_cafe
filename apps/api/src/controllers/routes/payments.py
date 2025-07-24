import json
import uuid
from datetime import datetime

from flask import Blueprint, jsonify, request

from database import db
from models.orders import Order
from models.payments import Payment

payments_bp = Blueprint("payments", __name__)


@payments_bp.route("/", methods=["GET"])
def payments_home():
    """Informações sobre o sistema de pagamentos"""
    return jsonify({
        "message": "Sistema de Pagamentos - Mestres do Café",
        "available_methods": [
            "credit_card",
            "pix",
            "boleto",
            "transfer"
        ],
        "endpoints": {
            "process": "/process",
            "methods": "/methods",
            "webhook": "/webhook",
            "refund": "/refund/<payment_id>"
        }
    })


# Simulação de gateways de pagamento
class PaymentGateway:
    @staticmethod
    def process_payment(amount, payment_method, card_data = None):
        """Simula processamento de pagamento"""
        # Em produção, aqui seria integração real com gateway
        payment_id = str(uuid.uuid4())

        # Simular diferentes cenários
        if payment_method == "credit_card":
            if card_data and card_data.get("number", "").endswith("0000"):
                return {
                    "success": False,
                    "error": "Cartão recusado",
                    "payment_id": payment_id,
                }
            return {
                "success": True,
                "payment_id": payment_id,
                "transaction_id": f"txn_{uuid.uuid4().hex[:16]}",
                "amount": amount,
                "status": "approved",
            }
        elif payment_method == "pix":
            return {
                "success": True,
                "payment_id": payment_id,
                "pix_code": f"pix_{uuid.uuid4().hex[:32]}",
                "amount": amount,
                "status": "pending",
            }
        elif payment_method == "boleto":
            return {
                "success": True,
                "payment_id": payment_id,
                "boleto_code": ("34191.79001 01043.510047 91020.150008 4 84410026000"),
                "amount": amount,
                "status": "pending",
                "due_date": "2025-07-10",
            }
        else:
            return {
                "success": False,
                "error": "Método de pagamento não suportado",
                "payment_id": payment_id,
            }


@payments_bp.route("/process", methods=["POST"])
def process_payment():
    """Processa pagamento para um pedido"""
    try:
        data = request.get_json()
        order_id = data.get("order_id")
        payment_method = data.get("payment_method")
        card_data = data.get("card_data")

        if not order_id or not payment_method:
            return jsonify({"error": "order_id e payment_method são obrigatórios"}), 400

        # Buscar pedido
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": "Pedido não encontrado"}), 404

        if order.payment_status == "paid":
            return jsonify({"error": "Pedido já foi pago"}), 400

        # Processar pagamento
        gateway_response = PaymentGateway.process_payment(
            amount = float(order.total_amount),
            payment_method = payment_method,
            card_data = card_data,
        )

        if not gateway_response["success"]:
            return (
                jsonify(
                    {
                        "error": gateway_response["error"],
                        "payment_id": gateway_response["payment_id"],
                    }
                ),
                400,
            )

        # Criar registro de pagamento
        payment = Payment(
            order_id = order_id,
            amount = order.total_amount,
            payment_method = payment_method,
            gateway_response = json.dumps(gateway_response),
            status = gateway_response["status"],
        )

        db.session.add(payment)

        # Atualizar status do pedido
        if gateway_response["status"] == "approved":
            order.payment_status = "paid"
            order.status = "processing"
        else:
            order.payment_status = "pending"

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Pagamento processado com sucesso",
                    "payment_id": payment.id,
                    "status": payment.status,
                    "gateway_response": gateway_response,
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@payments_bp.route("/<payment_id>", methods=["GET"])
def get_payment(payment_id):
    """Busca detalhes de um pagamento"""
    try:
        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({"error": "Pagamento não encontrado"}), 404

        return jsonify(
            {
                "payment": {
                    "id": payment.id,
                    "order_id": payment.order_id,
                    "amount": float(payment.amount),
                    "payment_method": payment.payment_method,
                    "status": payment.status,
                    "created_at": payment.created_at.isoformat(),
                    "gateway_response": (
                        json.loads(payment.gateway_response)
                        if payment.gateway_response
                        else None
                    ),
                }
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@payments_bp.route("/order/<order_id>", methods=["GET"])
def get_order_payments(order_id):
    """Busca todos os pagamentos de um pedido"""
    try:
        payments = Payment.query.filter_by(order_id = order_id).all()

        return jsonify(
            {
                "payments": [
                    {
                        "id": payment.id,
                        "amount": float(payment.amount),
                        "payment_method": payment.payment_method,
                        "status": payment.status,
                        "created_at": payment.created_at.isoformat(),
                    }
                    for payment in payments
                ]
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@payments_bp.route("/methods", methods=["GET"])
def get_payment_methods():
    """Lista métodos de pagamento disponíveis"""
    return jsonify(
        {
            "payment_methods": [
                {
                    "id": "credit_card",
                    "name": "Cartão de Crédito",
                    "description": "Visa, Mastercard, Elo",
                    "icon": "credit-card",
                    "enabled": True,
                },
                {
                    "id": "pix",
                    "name": "PIX",
                    "description": "Pagamento instantâneo",
                    "icon": "qr-code",
                    "enabled": True,
                },
                {
                    "id": "boleto",
                    "name": "Boleto Bancário",
                    "description": "Vencimento em 3 dias úteis",
                    "icon": "file-text",
                    "enabled": True,
                },
                {
                    "id": "transfer",
                    "name": "Transferência Bancária",
                    "description": "PIX ou TED/DOC",
                    "icon": "bank",
                    "enabled": False,
                },
            ]
        }
    )


@payments_bp.route("/webhook", methods=["POST"])
def payment_webhook():
    """Webhook para receber notificações de pagamento"""
    try:
        data = request.get_json()

        # Em produção, validar assinatura do webhook
        payment_id = data.get("payment_id")
        status = data.get("status")

        if not payment_id or not status:
            return jsonify({"error": "Dados inválidos"}), 400

        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({"error": "Pagamento não encontrado"}), 404

        # Atualizar status
        payment.status = status
        payment.updated_at = datetime.utcnow()

        # Atualizar status do pedido
        if status == "approved":
            payment.order.payment_status = "paid"
            payment.order.status = "processing"
        elif status == "failed":
            payment.order.payment_status = "failed"

        db.session.commit()

        return jsonify({"message": "Webhook processado com sucesso"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@payments_bp.route("/refund/<payment_id>", methods=["POST"])
def refund_payment(payment_id):
    """Processa reembolso de um pagamento"""
    try:
        data = request.get_json()
        reason = data.get("reason", "Solicitação do cliente")

        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({"error": "Pagamento não encontrado"}), 404

        if payment.status != "approved":
            return (
                jsonify(
                    {"error": "Apenas pagamentos aprovados podem ser reembolsados"}
                ),
                400,
            )

        # Simular processamento de reembolso
        refund_id = str(uuid.uuid4())

        # Atualizar status
        payment.status = "refunded"
        payment.updated_at = datetime.utcnow()

        # Atualizar pedido
        payment.order.status = "cancelled"
        payment.order.payment_status = "refunded"

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Reembolso processado com sucesso",
                    "refund_id": refund_id,
                    "amount": float(payment.amount),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
