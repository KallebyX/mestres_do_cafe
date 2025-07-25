from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from database import db
from models.products import Product, ProductPrice

admin_products_bp = Blueprint("admin_products", __name__, url_prefix="/api/admin/products")

@admin_products_bp.route("/populate-weight-prices", methods=["POST"])
@jwt_required()
def populate_weight_prices():
    """Popular preços por peso para produtos existentes"""
    try:
        # Buscar todos os produtos de café ativos
        products = Product.query.filter(Product.is_active == True).all()
        
        if not products:
            return jsonify({
                "success": False,
                "message": "Nenhum produto encontrado!"
            }), 404
            
        # Definir os pesos padrão com multiplicadores baseados no preço base
        weight_options = [
            {"weight": "250g", "multiplier": 0.25, "stock_multiplier": 0.8},  # 25% do preço base, mais estoque
            {"weight": "500g", "multiplier": 0.50, "stock_multiplier": 0.6},  # 50% do preço base
            {"weight": "1kg", "multiplier": 1.0, "stock_multiplier": 0.4},    # Preço base, menos estoque
        ]
        
        total_created = 0
        processed_products = []
        
        for product in products:
            # Verificar se já tem preços por peso
            existing_prices = ProductPrice.query.filter_by(
                product_id=product.id,
                is_active=True
            ).count()
            
            if existing_prices > 0:
                processed_products.append({
                    "product_name": product.name,
                    "status": f"Já tem {existing_prices} preços configurados - pulado"
                })
                continue
            
            base_price = float(product.price)
            base_stock = product.stock_quantity or 100  # Fallback se não tiver estoque
            
            product_prices = []
            for weight_option in weight_options:
                weight = weight_option["weight"]
                multiplier = weight_option["multiplier"]
                stock_multiplier = weight_option["stock_multiplier"]
                
                # Calcular preço proporcional
                calculated_price = base_price * multiplier
                
                # Calcular estoque proporcional
                calculated_stock = max(1, int(base_stock * stock_multiplier))
                
                # Criar ProductPrice
                product_price = ProductPrice(
                    product_id=product.id,
                    weight=weight,
                    price=calculated_price,
                    stock_quantity=calculated_stock,
                    is_active=True
                )
                
                db.session.add(product_price)
                total_created += 1
                
                product_prices.append({
                    "weight": weight,
                    "price": calculated_price,
                    "stock": calculated_stock
                })
            
            processed_products.append({
                "product_name": product.name,
                "status": "Criado com sucesso",
                "prices": product_prices
            })
        
        # Commit das alterações
        db.session.commit()
        
        # Mostrar resumo final
        all_prices = ProductPrice.query.filter_by(is_active=True).all()
        summary = {}
        for weight in ["250g", "500g", "1kg"]:
            count = len([p for p in all_prices if p.weight == weight])
            summary[weight] = count
        
        return jsonify({
            "success": True,
            "message": "População concluída com sucesso!",
            "data": {
                "total_prices_created": total_created,
                "products_processed": len(processed_products),
                "summary": summary,
                "details": processed_products
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Erro durante população: {str(e)}"
        }), 500


@admin_products_bp.route("/<int:product_id>/prices", methods=["GET"])
@jwt_required()
def get_product_prices(product_id):
    """Obter preços por peso de um produto específico"""
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({
                "success": False,
                "message": "Produto não encontrado"
            }), 404
        
        prices = ProductPrice.query.filter_by(
            product_id=product_id,
            is_active=True
        ).order_by(ProductPrice.weight).all()
        
        prices_data = []
        for price in prices:
            prices_data.append({
                "id": price.id,
                "weight": price.weight,
                "price": float(price.price),
                "stock_quantity": price.stock_quantity,
                "is_active": price.is_active
            })
        
        return jsonify({
            "success": True,
            "data": {
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "base_price": float(product.price)
                },
                "prices": prices_data
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500


@admin_products_bp.route("/<int:product_id>/prices", methods=["POST"])
@jwt_required()
def create_product_price(product_id):
    """Criar novo preço por peso para um produto"""
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({
                "success": False,
                "message": "Produto não encontrado"
            }), 404
        
        data = request.get_json()
        weight = data.get("weight")
        price = data.get("price")
        stock_quantity = data.get("stock_quantity")
        
        if not weight or not price:
            return jsonify({
                "success": False,
                "message": "Weight e price são obrigatórios"
            }), 400
        
        # Verificar se já existe preço para esse peso
        existing = ProductPrice.query.filter_by(
            product_id=product_id,
            weight=weight,
            is_active=True
        ).first()
        
        if existing:
            return jsonify({
                "success": False,
                "message": f"Já existe preço para {weight}"
            }), 409
        
        # Criar novo ProductPrice
        product_price = ProductPrice(
            product_id=product_id,
            weight=weight,
            price=float(price),
            stock_quantity=stock_quantity or 0,
            is_active=True
        )
        
        db.session.add(product_price)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Preço por peso criado com sucesso",
            "data": {
                "id": product_price.id,
                "weight": product_price.weight,
                "price": float(product_price.price),
                "stock_quantity": product_price.stock_quantity
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500


@admin_products_bp.route("/prices/<int:price_id>", methods=["PUT"])
@jwt_required()
def update_product_price(price_id):
    """Atualizar preço por peso"""
    try:
        product_price = ProductPrice.query.get(price_id)
        if not product_price:
            return jsonify({
                "success": False,
                "message": "Preço não encontrado"
            }), 404
        
        data = request.get_json()
        
        # Atualizar campos se fornecidos
        if "price" in data:
            product_price.price = float(data["price"])
        if "stock_quantity" in data:
            product_price.stock_quantity = data["stock_quantity"]
        if "is_active" in data:
            product_price.is_active = data["is_active"]
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Preço atualizado com sucesso",
            "data": {
                "id": product_price.id,
                "weight": product_price.weight,
                "price": float(product_price.price),
                "stock_quantity": product_price.stock_quantity,
                "is_active": product_price.is_active
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500


@admin_products_bp.route("/prices/<int:price_id>", methods=["DELETE"])
@jwt_required()
def delete_product_price(price_id):
    """Deletar/desativar preço por peso"""
    try:
        product_price = ProductPrice.query.get(price_id)
        if not product_price:
            return jsonify({
                "success": False,
                "message": "Preço não encontrado"
            }), 404
        
        # Soft delete - marcar como inativo
        product_price.is_active = False
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Preço desativado com sucesso"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500