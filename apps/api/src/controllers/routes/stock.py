"""
Controlador para gerenciamento de estoque
"""

from flask import Blueprint, jsonify, request
from sqlalchemy import func
from datetime import datetime

from database import db
from models import Product, StockMovement, ProductVariant
from middleware.error_handler import ValidationAPIError, ResourceAPIError

stock_bp = Blueprint("stock", __name__)


@stock_bp.route("", methods=["GET"])
def get_stock():
    """Listar status do estoque"""
    try:
        page = request.args.get('page', 1, type = int)
        per_page = request.args.get('per_page', 20, type = int)
        search = request.args.get('search', '')
        low_stock = request.args.get('low_stock', type = bool)

        query = Product.query

        # Filtro por busca
        if search:
            # Sanitizar parâmetro de busca para prevenir SQL injection
            safe_search = search.replace('%', '\\%').replace('_', '\\_')
            query = query.filter(
                Product.name.ilike(f'%{safe_search}%') |
                Product.sku.ilike(f'%{safe_search}%')
            )

        # Filtro por estoque baixo
        if low_stock:
            query = query.filter(Product.stock_quantity <= Product.min_stock_level)

        products = query.order_by(Product.name).paginate(
            page = page, per_page = per_page, error_out = False
        )

        # Calcular métricas de estoque
        total_products = Product.query.count()
        low_stock_count = Product.query.filter(
            Product.stock_quantity <= Product.min_stock_level
        ).count()
        out_of_stock_count = Product.query.filter(
            Product.stock_quantity <= 0
        ).count()

        # Valor total do estoque
        total_stock_value = db.session.query(
            func.sum(Product.price * Product.stock_quantity)
        ).scalar() or 0

        return jsonify({
            'success': True,
            'data': {
                'products': [
                    {
                        **product.to_dict(),
                        'stock_status': get_stock_status(product),
                        'stock_value': float(product.price * product.stock_quantity) if product.price else 0
                    }
                    for product in products.items
                ],
                'pagination': {
                    'page': products.page,
                    'pages': products.pages,
                    'per_page': products.per_page,
                    'total': products.total
                },
                'summary': {
                    'total_products': total_products,
                    'low_stock_count': low_stock_count,
                    'out_of_stock_count': out_of_stock_count,
                    'total_stock_value': float(total_stock_value)
                }
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar estoque: {str(e)}'
        }), 500


@stock_bp.route("/<product_id>", methods=["GET"])
def get_product_stock(product_id):
    """Obter detalhes do estoque de um produto"""
    try:
        product = Product.query.get(product_id)

        if not product:
            raise ResourceAPIError(
                "Produto não encontrado",
                error_code = 4040,
                status_code = 404
            )

        # Histórico de movimentações
        movements = StockMovement.query.filter_by(
            product_id = product_id
        ).order_by(StockMovement.created_at.desc()).limit(20).all()

        # Variantes do produto
        variants = ProductVariant.query.filter_by(
            product_id = product_id
        ).all()

        return jsonify({
            'success': True,
            'data': {
                'product': {
                    **product.to_dict(),
                    'stock_status': get_stock_status(product),
                    'stock_value': float(product.price * product.stock_quantity) if product.price else 0
                },
                'movements': [movement.to_dict() for movement in movements],
                'variants': [variant.to_dict() for variant in variants]
            }
        })

    except ResourceAPIError:
        raise
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao obter estoque do produto: {str(e)}'
        }), 500


@stock_bp.route("/<product_id>/adjust", methods=["POST"])
def adjust_stock(product_id):
    """Ajustar estoque de um produto"""
    try:
        product = Product.query.get(product_id)

        if not product:
            raise ResourceAPIError(
                "Produto não encontrado",
                error_code = 4040,
                status_code = 404
            )

        data = request.get_json()

        if not data:
            raise ValidationAPIError("Dados não fornecidos")

        # Validar campos obrigatórios
        required_fields = ['quantity', 'type', 'reason']
        for field in required_fields:
            if field not in data:
                raise ValidationAPIError(f"Campo '{field}' é obrigatório")

        quantity = data['quantity']
        movement_type = data['type']  # 'adjustment', 'sale', 'purchase', 'return'
        reason = data['reason']

        if not isinstance(quantity, (int, float)) or quantity == 0:
            raise ValidationAPIError("Quantidade deve ser um número diferente de zero")

        if movement_type not in ['adjustment', 'sale', 'purchase', 'return']:
            raise ValidationAPIError("Tipo de movimento inválido")

        # Calcular nova quantidade
        old_quantity = product.stock_quantity

        if movement_type in ['adjustment', 'purchase', 'return']:
            new_quantity = old_quantity + quantity
        else:  # sale
            new_quantity = old_quantity - quantity

        if new_quantity < 0:
            raise ValidationAPIError("Estoque não pode ficar negativo")

        # Atualizar produto
        product.stock_quantity = new_quantity
        product.updated_at = datetime.utcnow()

        # Registrar movimentação
        movement = StockMovement(
            product_id = product.id,
            movement_type = movement_type,
            quantity = quantity,
            old_quantity = old_quantity,
            new_quantity = new_quantity,
            reason = reason,
            notes = data.get('notes')
        )

        db.session.add(movement)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Estoque ajustado com sucesso',
            'data': {
                'product': {
                    **product.to_dict(),
                    'stock_status': get_stock_status(product)
                },
                'movement': movement.to_dict()
            }
        })

    except (ValidationAPIError, ResourceAPIError):
        raise
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao ajustar estoque: {str(e)}'
        }), 500


@stock_bp.route("/movements", methods=["GET"])
def get_stock_movements():
    """Listar movimentações de estoque"""
    try:
        page = request.args.get('page', 1, type = int)
        per_page = request.args.get('per_page', 20, type = int)
        product_id = request.args.get('product_id')
        movement_type = request.args.get('type')

        query = StockMovement.query

        # Filtros
        if product_id:
            query = query.filter(StockMovement.product_id == product_id)

        if movement_type:
            query = query.filter(StockMovement.movement_type == movement_type)

        movements = query.order_by(
            StockMovement.created_at.desc()
        ).paginate(
            page = page, per_page = per_page, error_out = False
        )

        return jsonify({
            'success': True,
            'data': {
                'movements': [movement.to_dict() for movement in movements.items],
                'pagination': {
                    'page': movements.page,
                    'pages': movements.pages,
                    'per_page': movements.per_page,
                    'total': movements.total
                }
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar movimentações: {str(e)}'
        }), 500


@stock_bp.route("/alerts", methods=["GET"])
def get_stock_alerts():
    """Obter alertas de estoque"""
    try:
        # Produtos com estoque baixo
        low_stock_products = Product.query.filter(
            Product.stock_quantity <= Product.min_stock_level,
            Product.stock_quantity > 0
        ).all()

        # Produtos sem estoque
        out_of_stock_products = Product.query.filter(
            Product.stock_quantity <= 0
        ).all()

        # Produtos com estoque alto (acima do máximo)
        high_stock_products = Product.query.filter(
            Product.stock_quantity >= Product.max_stock_level
        ).all()

        return jsonify({
            'success': True,
            'data': {
                'low_stock': [
                    {
                        **product.to_dict(),
                        'stock_status': get_stock_status(product)
                    }
                    for product in low_stock_products
                ],
                'out_of_stock': [
                    {
                        **product.to_dict(),
                        'stock_status': get_stock_status(product)
                    }
                    for product in out_of_stock_products
                ],
                'high_stock': [
                    {
                        **product.to_dict(),
                        'stock_status': get_stock_status(product)
                    }
                    for product in high_stock_products
                ],
                'summary': {
                    'low_stock_count': len(low_stock_products),
                    'out_of_stock_count': len(out_of_stock_products),
                    'high_stock_count': len(high_stock_products)
                }
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao obter alertas: {str(e)}'
        }), 500


def get_stock_status(product):
    """Determinar status do estoque do produto"""
    if product.stock_quantity <= 0:
        return 'out_of_stock'
    elif product.stock_quantity <= product.min_stock_level:
        return 'low_stock'
    elif product.stock_quantity >= product.max_stock_level:
        return 'high_stock'
    else:
        return 'normal'
