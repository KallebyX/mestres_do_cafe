from flask import Blueprint, jsonify, request
from sqlalchemy import func
from sqlalchemy.orm import joinedload, selectinload

from ...database import db
from ...models.auth import User
from ...models.orders import Order, OrderItem
from ...models.products import Product

orders_bp = Blueprint("orders", __name__)


@orders_bp.route("/", methods=["GET"])
def get_orders():
    try:
        user_id = request.args.get("user_id")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        # Query otimizada com eager loading
        query = Order.query.options(selectinload(Order.items), joinedload(Order.user))

        if user_id:
            query = query.filter_by(user_id=user_id)

        orders = query.order_by(Order.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify(
            {
                "orders": [
                    {
                        "id": order.id,
                        "user_id": order.user_id,
                        "user_name": order.user.name if order.user else None,
                        "total_amount": float(order.total_amount),
                        "status": order.status,
                        "payment_status": order.payment_status,
                        "created_at": order.created_at.isoformat(),
                        "items_count": len(order.items),  # Sem N+1!
                    }
                    for order in orders.items
                ],
                "pagination": {
                    "page": orders.page,
                    "pages": orders.pages,
                    "total": orders.total,
                },
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@orders_bp.route("/<order_id>", methods=["GET"])
def get_order(order_id):
    try:
        # Query otimizada com eager loading de relações
        order = Order.query.options(
            selectinload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.user),
        ).get(order_id)

        if not order:
            return jsonify({"error": "Pedido não encontrado"}), 404

        return jsonify(
            {
                "order": {
                    "id": order.id,
                    "user_id": order.user_id,
                    "user_name": order.user.name if order.user else None,
                    "total_amount": float(order.total_amount),
                    "status": order.status,
                    "payment_status": order.payment_status,
                    "shipping_address": order.shipping_address,
                    "created_at": order.created_at.isoformat(),
                    "items": [
                        {
                            "id": item.id,
                            "product_id": item.product_id,
                            "product_name": item.product.name,  # Sem N+1!
                            "product_image": item.product.image_url,
                            "quantity": item.quantity,
                            "unit_price": float(item.unit_price),
                            "total_price": float(item.total_price),
                        }
                        for item in order.items
                    ],
                }
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@orders_bp.route("/", methods=["POST"])
def create_order():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        items = data.get("items", [])
        shipping_address = data.get("shipping_address")

        if not user_id or not items:
            return jsonify({"error": "user_id e items são obrigatórios"}), 400

        # Verificar usuário com eager loading
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Buscar todos os produtos de uma vez
        product_ids = [item["product_id"] for item in items]
        products = Product.query.filter(Product.id.in_(product_ids)).all()
        products_dict = {p.id: p for p in products}

        # Validar produtos e calcular total
        total_amount = 0
        order_items = []

        for item_data in items:
            product_id = item_data.get("product_id")
            quantity = item_data.get("quantity", 1)

            product = products_dict.get(product_id)
            if not product:
                return jsonify({"error": f"Produto {product_id} não encontrado"}), 404

            if product.stock_quantity < quantity:
                return (
                    jsonify({"error": f"Estoque insuficiente para {product.name}"}),
                    400,
                )

            item_total = float(product.price) * quantity
            total_amount += item_total

            order_items.append(
                {
                    "product": product,
                    "quantity": quantity,
                    "unit_price": product.price,
                    "total_price": item_total,
                }
            )

        # Criar pedido
        order = Order(
            user_id=user_id,
            total_amount=total_amount,
            shipping_address=shipping_address,
        )

        db.session.add(order)
        db.session.flush()  # Para obter o ID do pedido

        # Criar itens do pedido em batch
        for item_data in order_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data["product"].id,
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                total_price=item_data["total_price"],
            )
            db.session.add(order_item)

            # Atualizar estoque
            item_data["product"].stock_quantity -= item_data["quantity"]

        # Adicionar pontos ao usuário
        points_earned = int(total_amount)
        user.points += points_earned
        user.total_spent += total_amount

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Pedido criado com sucesso",
                    "order_id": order.id,
                    "total_amount": float(order.total_amount),
                    "points_earned": points_earned,
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@orders_bp.route("/<order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    try:
        data = request.get_json()
        new_status = data.get("status")

        if not new_status:
            return jsonify({"error": "Status é obrigatório"}), 400

        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": "Pedido não encontrado"}), 404

        order.status = new_status
        db.session.commit()

        return jsonify(
            {
                "message": "Status do pedido atualizado",
                "order_id": order.id,
                "new_status": order.status,
            }
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Endpoint adicional para análise de pedidos
@orders_bp.route("/analytics", methods=["GET"])
def orders_analytics():
    """Análise otimizada de pedidos sem N+1"""
    try:
        # Query otimizada com agregação
        stats = (
            db.session.query(
                func.count(Order.id).label("total_orders"),
                func.sum(Order.total_amount).label("total_revenue"),
                func.avg(Order.total_amount).label("avg_order_value"),
            )
            .filter(Order.status != "cancelled")
            .first()
        )

        # Top produtos vendidos (sem N+1)
        top_products = (
            db.session.query(
                Product.id,
                Product.name,
                func.sum(OrderItem.quantity).label("total_sold"),
                func.sum(OrderItem.total_price).label("revenue"),
            )
            .join(OrderItem, Product.id == OrderItem.product_id)
            .join(Order, OrderItem.order_id == Order.id)
            .filter(Order.status != "cancelled")
            .group_by(Product.id, Product.name)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(10)
            .all()
        )

        return jsonify(
            {
                "stats": {
                    "total_orders": stats.total_orders or 0,
                    "total_revenue": float(stats.total_revenue or 0),
                    "avg_order_value": float(stats.avg_order_value or 0),
                },
                "top_products": [
                    {
                        "id": p.id,
                        "name": p.name,
                        "total_sold": p.total_sold,
                        "revenue": float(p.revenue),
                    }
                    for p in top_products
                ],
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Endpoint para testar performance
@orders_bp.route("/performance-comparison", methods=["GET"])
def performance_comparison():
    """Comparar performance com e sem eager loading"""
    import time

    try:
        # Teste sem otimização
        start = time.time()
        orders_slow = Order.query.limit(10).all()
        # Simular acesso N+1
        for order in orders_slow:
            _ = len(order.items)  # Trigger N queries
        slow_time = time.time() - start

        # Teste com otimização
        start = time.time()
        orders_fast = Order.query.options(selectinload(Order.items)).limit(10).all()
        # Acesso sem N+1
        for order in orders_fast:
            _ = len(order.items)  # Sem queries extras!
        fast_time = time.time() - start

        improvement = (
            ((slow_time - fast_time) / slow_time * 100) if slow_time > 0 else 0
        )

        return jsonify(
            {
                "without_eager_loading": f"{slow_time:.3f}s",
                "with_eager_loading": f"{fast_time:.3f}s",
                "improvement": f"{improvement:.1f}%",
                "queries_saved": len(orders_slow) if orders_slow else 0,
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
