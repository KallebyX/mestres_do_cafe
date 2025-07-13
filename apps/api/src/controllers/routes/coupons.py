from datetime import datetime

from flask import Blueprint, jsonify, request

from ...database import db
from ...models.coupons import Coupon, CouponUsage

coupons_bp = Blueprint("coupons", __name__, url_prefix="/api/coupons")


@coupons_bp.route("/", methods=["GET"])
def get_coupons():
    """Lista todos os cupons"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        status = request.args.get("status")
        coupon_type = request.args.get("type")

        query = Coupon.query

        if status:
            query = query.filter_by(status=status)
        if coupon_type:
            query = query.filter_by(coupon_type=coupon_type)

        coupons = query.order_by(Coupon.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify(
            {
                "coupons": [coupon.to_dict() for coupon in coupons.items],
                "pagination": {
                    "page": coupons.page,
                    "pages": coupons.pages,
                    "total": coupons.total,
                    "has_next": coupons.has_next,
                    "has_prev": coupons.has_prev,
                },
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@coupons_bp.route("/", methods=["POST"])
def create_coupon():
    """Cria um novo cupom"""
    try:
        data = request.get_json()

        required_fields = ["code", "coupon_type", "discount_value"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório: {field}"}), 400

        # Verificar se código já existe
        existing_coupon = Coupon.query.filter_by(code=data["code"]).first()
        if existing_coupon:
            return jsonify({"error": "Código do cupom já existe"}), 400

        coupon = Coupon(
            code=data["code"],
            coupon_type=data["coupon_type"],
            discount_value=data["discount_value"],
            minimum_order=data.get("minimum_order", 0),
            usage_limit=data.get("usage_limit"),
            valid_from=(
                datetime.strptime(data["valid_from"], "%Y-%m-%d").date()
                if data.get("valid_from")
                else None
            ),
            valid_until=(
                datetime.strptime(data["valid_until"], "%Y-%m-%d").date()
                if data.get("valid_until")
                else None
            ),
            description=data.get("description"),
            first_purchase_only=data.get("first_purchase_only", False),
            customer_usage_limit=data.get("customer_usage_limit", 1),
        )

        db.session.add(coupon)
        db.session.commit()

        return (
            jsonify(
                {"message": "Cupom criado com sucesso", "coupon": coupon.to_dict()}
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@coupons_bp.route("/<coupon_id>", methods=["GET"])
def get_coupon(coupon_id):
    """Obtém detalhes de um cupom"""
    try:
        coupon = Coupon.query.get(coupon_id)
        if not coupon:
            return jsonify({"error": "Cupom não encontrado"}), 404

        return jsonify({"coupon": coupon.to_dict()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@coupons_bp.route("/<coupon_id>", methods=["PUT"])
def update_coupon(coupon_id):
    """Atualiza um cupom"""
    try:
        coupon = Coupon.query.get(coupon_id)
        if not coupon:
            return jsonify({"error": "Cupom não encontrado"}), 404

        data = request.get_json()

        # Atualizar campos
        for field in [
            "code",
            "coupon_type",
            "discount_value",
            "minimum_order",
            "usage_limit",
            "description",
            "first_purchase_only",
            "customer_usage_limit",
            "status",
        ]:
            if field in data:
                setattr(coupon, field, data[field])

        # Atualizar datas
        if "valid_from" in data:
            coupon.valid_from = (
                datetime.strptime(data["valid_from"], "%Y-%m-%d").date()
                if data["valid_from"]
                else None
            )

        if "valid_until" in data:
            coupon.valid_until = (
                datetime.strptime(data["valid_until"], "%Y-%m-%d").date()
                if data["valid_until"]
                else None
            )

        coupon.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(
            {"message": "Cupom atualizado com sucesso", "coupon": coupon.to_dict()}
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@coupons_bp.route("/validate/<code>", methods=["POST"])
def validate_coupon(code):
    """Valida um cupom para uso"""
    try:
        data = request.get_json()
        customer_id = data.get("customer_id")
        order_value = data.get("order_value", 0)

        coupon = Coupon.query.filter_by(code=code).first()
        if not coupon:
            return jsonify({"error": "Cupom não encontrado"}), 404

        # Verificar se cupom está ativo
        if coupon.status != "active":
            return jsonify({"error": "Cupom não está ativo"}), 400

        # Verificar datas de validade
        today = datetime.now().date()
        if coupon.valid_from and today < coupon.valid_from:
            return jsonify({"error": "Cupom ainda não é válido"}), 400

        if coupon.valid_until and today > coupon.valid_until:
            return jsonify({"error": "Cupom expirado"}), 400

        # Verificar valor mínimo do pedido
        if order_value < coupon.minimum_order:
            return (
                jsonify(
                    {"error": f"Valor mínimo do pedido: R$ {coupon.minimum_order}"}
                ),
                400,
            )

        # Verificar limite de uso geral
        if coupon.usage_limit:
            usage_count = CouponUsage.query.filter_by(coupon_id=coupon.id).count()
            if usage_count >= coupon.usage_limit:
                return jsonify({"error": "Limite de uso do cupom atingido"}), 400

        # Verificar limite de uso por cliente
        if customer_id and coupon.customer_usage_limit:
            customer_usage = CouponUsage.query.filter_by(
                coupon_id=coupon.id, customer_id=customer_id
            ).count()
            if customer_usage >= coupon.customer_usage_limit:
                return (
                    jsonify({"error": "Limite de uso do cupom por cliente atingido"}),
                    400,
                )

        # Calcular desconto
        if coupon.coupon_type == "percentage":
            discount_amount = order_value * (coupon.discount_value / 100)
        else:  # fixed
            discount_amount = coupon.discount_value

        # Garantir que desconto não seja maior que o valor do pedido
        discount_amount = min(discount_amount, order_value)

        return jsonify(
            {
                "valid": True,
                "coupon": coupon.to_dict(),
                "discount_amount": float(discount_amount),
                "final_amount": float(order_value - discount_amount),
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@coupons_bp.route("/apply", methods=["POST"])
def apply_coupon():
    """Aplica um cupom a um pedido"""
    try:
        data = request.get_json()

        required_fields = ["code", "customer_id", "order_id", "order_value"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório: {field}"}), 400

        coupon = Coupon.query.filter_by(code=data["code"]).first()
        if not coupon:
            return jsonify({"error": "Cupom não encontrado"}), 404

        # Validar cupom primeiro
        validation_response = validate_coupon(data["code"])
        if validation_response[1] != 200:
            return validation_response

        # Criar registro de uso
        usage = CouponUsage(
            coupon_id=coupon.id,
            customer_id=data["customer_id"],
            order_id=data["order_id"],
            discount_amount=validation_response[0].json["discount_amount"],
        )

        db.session.add(usage)

        # Atualizar contador de uso
        coupon.usage_count += 1
        coupon.updated_at = datetime.utcnow()

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Cupom aplicado com sucesso",
                    "usage": usage.to_dict(),
                    "discount_amount": float(usage.discount_amount),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@coupons_bp.route("/analytics", methods=["GET"])
def get_coupons_analytics():
    """Estatísticas dos cupons"""
    try:
        total_coupons = Coupon.query.count()
        active_coupons = Coupon.query.filter_by(status="active").count()
        total_usage = CouponUsage.query.count()

        # Total de desconto dado
        total_discount = (
            db.session.query(db.func.sum(CouponUsage.discount_amount)).scalar() or 0
        )

        # Cupons mais utilizados
        top_coupons = (
            db.session.query(
                Coupon.code,
                Coupon.coupon_type,
                db.func.count(CouponUsage.id).label("usage_count"),
                db.func.sum(CouponUsage.discount_amount).label("total_discount"),
            )
            .join(CouponUsage, Coupon.id == CouponUsage.coupon_id)
            .group_by(Coupon.id, Coupon.code, Coupon.coupon_type)
            .order_by(db.func.count(CouponUsage.id).desc())
            .limit(10)
            .all()
        )

        return jsonify(
            {
                "total_coupons": total_coupons,
                "active_coupons": active_coupons,
                "total_usage": total_usage,
                "total_discount": float(total_discount),
                "top_coupons": [
                    {
                        "code": coupon.code,
                        "type": coupon.coupon_type,
                        "usage_count": coupon.usage_count,
                        "total_discount": float(coupon.total_discount or 0),
                    }
                    for coupon in top_coupons
                ],
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@coupons_bp.route("/<coupon_id>/usage", methods=["GET"])
def get_coupon_usage(coupon_id):
    """Lista uso de um cupom específico"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        usage = (
            CouponUsage.query.filter_by(coupon_id=coupon_id)
            .order_by(CouponUsage.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        return jsonify(
            {
                "usage": [u.to_dict() for u in usage.items],
                "pagination": {
                    "page": usage.page,
                    "pages": usage.pages,
                    "total": usage.total,
                    "has_next": usage.has_next,
                    "has_prev": usage.has_prev,
                },
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
