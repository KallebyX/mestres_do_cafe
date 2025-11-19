from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from database import db
from models.orders import Cart, CartItem
from models.products import Product, ProductPrice
from models.auth import User

cart_bp = Blueprint("cart", __name__, url_prefix="/api/cart")

# ========== ROTAS DO CARRINHO ========== #


@cart_bp.route("/", methods=["GET"])
@jwt_required()
def get_cart():
    """Obter carrinho do usuário autenticado via JWT"""
    try:
        # 🔍 DIAGNÓSTICO CARRINHO - Log de acesso
        from flask import request
        import logging
        logger = logging.getLogger('mestres_cafe')
        logger.warning(f"🔍 CART ACCESS - Headers: {dict(request.headers)}")
        logger.warning(f"🔍 CART ACCESS - User-Agent: {request.headers.get('User-Agent', 'Unknown')}")
        logger.warning(f"🔍 CART ACCESS - Authorization: {bool(request.headers.get('Authorization'))}")
        
        # 🔒 Obter user_id automaticamente via JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({
                "success": False,
                "message": "Token JWT inválido",
                "data": {"items": [], "total": 0, "items_count": 0}
            }), 401

        # Buscar ou criar carrinho do usuário
        cart = Cart.query.filter_by(user_id = user_id).first()
        if not cart:
            return jsonify({
                "success": True,
                "message": "Carrinho vazio",
                "data": {"items": [], "total": 0, "items_count": 0}
            }), 200

        # Buscar itens do carrinho com detalhes do produto
        cart_items = (
            db.session.query(CartItem, Product)
            .join(Product)
            .filter(CartItem.cart_id == cart.id)
            .all()
        )

        items = []
        total = 0

        for cart_item, product in cart_items:
            item_total = float(product.price) * cart_item.quantity
            total += item_total

            # Buscar imagem principal do produto
            primary_image = product.image_url

            items.append(
                {
                    "id": cart_item.id,
                    "product_id": cart_item.product_id,
                    "quantity": cart_item.quantity,
                    "added_at": (
                        cart_item.added_at.isoformat() if cart_item.added_at else None
                    ),
                    "product": {
                        "id": product.id,
                        "name": product.name,
                        "description": product.description,
                        "price": float(product.price),
                        "image_url": primary_image,
                        "category": product.category,
                        "stock_quantity": product.stock_quantity,
                        "is_active": product.is_active,
                    },
                    "subtotal": item_total,
                }
            )

        return jsonify({
            "success": True,
            "message": "Carrinho obtido com sucesso",
            "data": {"items": items, "total": total, "items_count": len(items)}
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Erro interno do servidor",
            "error": str(e)
        }), 500


@cart_bp.route("/items", methods=["GET"])
@jwt_required()
def get_cart_items():
    """Listar itens do carrinho do usuário"""
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id é obrigatório"}), 400

        # Buscar ou criar carrinho do usuário
        cart = Cart.query.filter_by(user_id = user_id).first()
        if not cart:
            return jsonify({"items": [], "total": 0, "items_count": 0})

        # Buscar itens do carrinho com detalhes do produto e preços específicos
        cart_items = (
            db.session.query(CartItem, Product, ProductPrice)
            .join(Product)
            .outerjoin(ProductPrice, CartItem.product_price_id == ProductPrice.id)
            .filter(CartItem.cart_id == cart.id)
            .all()
        )

        items = []
        total = 0

        for cart_item, product, product_price in cart_items:
            # Usar preço específico se disponível, senão usar preço padrão
            if cart_item.unit_price:
                unit_price = float(cart_item.unit_price)
            elif product_price:
                unit_price = float(product_price.price)
            else:
                unit_price = float(product.price)
            
            item_total = unit_price * cart_item.quantity
            total += item_total

            # Buscar imagem principal do produto
            primary_image = product.image_url

            items.append(
                {
                    "id": cart_item.id,
                    "product_id": cart_item.product_id,
                    "product_price_id": cart_item.product_price_id,
                    "weight": cart_item.weight,
                    "unit_price": unit_price,
                    "quantity": cart_item.quantity,
                    "added_at": (
                        cart_item.added_at.isoformat() if cart_item.added_at else None
                    ),
                    "product": {
                        "id": product.id,
                        "name": product.name,
                        "description": product.description,
                        "price": float(product.price),
                        "image_url": primary_image,
                        "category": product.category,
                        "stock_quantity": product.stock_quantity,
                        "is_active": product.is_active,
                    },
                    "subtotal": item_total,
                }
            )

        return jsonify({"items": items, "total": total, "items_count": len(items)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@cart_bp.route("/add", methods=["POST"])
@jwt_required()
def add_to_cart():
    """Adicionar produto ao carrinho (JWT automático)"""
    try:
        # 🔒 Obter user_id automaticamente via JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({
                "success": False,
                "message": "Token JWT inválido"
            }), 401

        data = request.get_json()
        product_id = data.get("product_id")
        product_price_id = data.get("product_price_id")  # 🔥 NOVO: ID do preço específico
        weight = data.get("weight")  # 🔥 NOVO: Peso como backup
        quantity = data.get("quantity", 1)

        if not product_id:
            return jsonify({
                "success": False,
                "message": "product_id é obrigatório"
            }), 400

        # 🔥 CORREÇÃO: Para produtos com preços por peso, precisa especificar o preço
        if not product_price_id and not weight:
            return jsonify({
                "success": False,
                "message": "product_price_id ou weight é obrigatório para produtos com preços variados"
            }), 400

        # Validar quantidade
        if quantity <= 0:
            return jsonify({
                "success": False,
                "message": "Quantidade deve ser maior que zero"
            }), 400

        # Verificar se o produto existe e está ativo
        product = Product.query.filter_by(id = product_id, is_active = True).first()
        if not product:
            return jsonify({
                "success": False,
                "message": "Produto não encontrado ou inativo"
            }), 404

        # 🔥 CORREÇÃO: Buscar preço específico se fornecido
        product_price = None
        unit_price = float(product.price)  # Preço padrão
        weight_selected = weight
        
        if product_price_id:
            product_price = ProductPrice.query.filter_by(
                id=product_price_id,
                product_id=product_id,
                is_active=True
            ).first()
            if not product_price:
                return jsonify({
                    "success": False,
                    "message": "Preço específico não encontrado"
                }), 404
            unit_price = float(product_price.price)
            weight_selected = product_price.weight
        elif weight:
            # Buscar por peso se não tiver product_price_id
            product_price = ProductPrice.query.filter_by(
                product_id=product_id,
                weight=weight,
                is_active=True
            ).first()
            if product_price:
                unit_price = float(product_price.price)
                weight_selected = product_price.weight

        # 🔒 CORREÇÃO DE RACE CONDITION - Usar transação atômica para carrinho
        import logging
        import time
        import threading
        
        race_logger = logging.getLogger('race_condition_monitor')
        thread_id = threading.get_ident()
        timestamp = time.time()
        
        try:
            race_logger.info(f"🔒 CART_ATOMIC_TRANSACTION_START [Thread:{thread_id}] Product:{product.name}")
            
            # 🔒 SELECT FOR UPDATE - Lock pessimista no produto para verificação de estoque
            product_locked = db.session.query(Product).filter(
                Product.id == product_id,
                Product.is_active == True
            ).with_for_update().first()
            
            if not product_locked:
                race_logger.error(f"❌ CART_PRODUCT_NOT_FOUND [Thread:{thread_id}] ProductID:{product_id}")
                return jsonify({
                    "success": False,
                    "message": "Produto não encontrado"
                }), 404
            
            race_logger.info(f"🔒 CART_PRODUCT_LOCKED [Thread:{thread_id}] Product:{product_locked.name} Stock:{product_locked.stock_quantity}")
            
            # Verificar estoque dentro da transação (dados atualizados)
            if product_locked.stock_quantity < quantity:
                race_logger.warning(f"❌ CART_STOCK_INSUFFICIENT_ATOMIC [Thread:{thread_id}] Product:{product_locked.name} Available:{product_locked.stock_quantity} Requested:{quantity}")
                return jsonify({
                    "success": False,
                    "message": f"Estoque insuficiente. Disponível: {product_locked.stock_quantity}"
                }), 400
            
            # Buscar ou criar carrinho do usuário
            cart = Cart.query.filter_by(user_id = user_id).first()
            if not cart:
                cart = Cart(user_id = user_id)
                db.session.add(cart)
                db.session.flush()
            
            # 🔥 CORREÇÃO CRÍTICA: Verificar se já existe considerando peso/preço específico
            existing_item = None
            if product_price_id:
                # Buscar por product_price_id específico
                existing_item = CartItem.query.filter_by(
                    cart_id=cart.id,
                    product_id=product_id,
                    product_price_id=product_price_id
                ).first()
            else:
                # Buscar por peso se não tiver product_price_id
                existing_item = CartItem.query.filter_by(
                    cart_id=cart.id,
                    product_id=product_id,
                    weight=weight_selected
                ).first()
            
            if existing_item:
                # Item já existe - verificar quantidade total dentro da transação
                current_in_cart = existing_item.quantity
                new_quantity = current_in_cart + quantity
                
                race_logger.info(f"🔄 CART_UPDATE_EXISTING_ATOMIC [Thread:{thread_id}] Product:{product_locked.name} CurrentInCart:{current_in_cart} Adding:{quantity} NewTotal:{new_quantity}")
                
                # Verificar se a nova quantidade não excede o estoque (dados atualizados)
                if new_quantity > product_locked.stock_quantity:
                    race_logger.warning(f"❌ CART_TOTAL_EXCEEDS_STOCK_ATOMIC [Thread:{thread_id}] Product:{product_locked.name} RequestedTotal:{new_quantity} Available:{product_locked.stock_quantity}")
                    return jsonify({
                        "success": False,
                        "message": f"Quantidade total excede estoque. Máximo: {product_locked.stock_quantity}, atual no carrinho: {existing_item.quantity}"
                    }), 400
                
                # Atualizar quantidade atomicamente
                existing_item.quantity = new_quantity
                existing_item.updated_at = datetime.utcnow()
                
                race_logger.info(f"✅ CART_UPDATE_SUCCESS_ATOMIC [Thread:{thread_id}] Product:{product_locked.name} FinalQuantity:{new_quantity}")
                
            else:
                # Criar novo item atomicamente
                race_logger.info(f"➕ CART_NEW_ITEM_ATOMIC [Thread:{thread_id}] Product:{product_locked.name} Quantity:{quantity}")
                
                cart_item = CartItem(
                    cart_id=cart.id,
                    product_id=product_id,
                    product_price_id=product_price_id,
                    weight=weight_selected,
                    unit_price=unit_price,
                    quantity=quantity,
                    added_at=datetime.utcnow()
                )
                db.session.add(cart_item)
                
            race_logger.info(f"🔒 CART_ATOMIC_TRANSACTION_SUCCESS [Thread:{thread_id}] - Cart operation completed successfully")
            
            # Commit das alterações
            db.session.commit()
                
        except Exception as e:
            race_logger.error(f"💥 CART_ATOMIC_TRANSACTION_FAILED [Thread:{thread_id}] Error:{str(e)}")
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": f"Erro interno: {str(e)}"
            }), 500

        return jsonify({
            "success": True,
            "message": "Produto adicionado ao carrinho com sucesso",
            "data": {
                "product_id": product_id,
                "quantity": quantity,
                "product_name": product.name
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Erro interno do servidor",
            "error": str(e)
        }), 500


@cart_bp.route("/<product_id>", methods=["PUT"])
@jwt_required()
def update_cart_item(product_id):
    """Atualizar quantidade de produto no carrinho via product_id"""
    try:
        # 🔒 Obter user_id automaticamente via JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({
                "success": False,
                "message": "Token JWT inválido"
            }), 401

        data = request.get_json()
        quantity = data.get("quantity")

        if quantity is None:
            return jsonify({
                "success": False,
                "message": "quantity é obrigatório"
            }), 400

        if quantity <= 0:
            return jsonify({
                "success": False,
                "message": "quantity deve ser maior que zero"
            }), 400

        # Buscar carrinho do usuário
        cart = Cart.query.filter_by(user_id = user_id).first()
        if not cart:
            return jsonify({
                "success": False,
                "message": "Carrinho não encontrado"
            }), 404

        # Buscar item do carrinho pelo product_id
        cart_item = CartItem.query.filter_by(
            cart_id = cart.id, product_id = product_id
        ).first()

        if not cart_item:
            return jsonify({
                "success": False,
                "message": "Item não encontrado no carrinho"
            }), 404

        # Verificar estoque disponível
        product = Product.query.get(product_id)
        if product and quantity > product.stock_quantity:
            return jsonify({
                "success": False,
                "message": f"Quantidade excede estoque disponível: {product.stock_quantity}"
            }), 400

        # Atualizar quantidade
        cart_item.quantity = quantity
        cart_item.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Quantidade atualizada com sucesso",
            "data": {
                "product_id": product_id,
                "new_quantity": quantity
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Erro interno do servidor",
            "error": str(e)
        }), 500


@cart_bp.route("/<product_id>", methods=["DELETE"])
@jwt_required()
def remove_from_cart(product_id):
    """Remover produto do carrinho via product_id"""
    try:
        # 🔒 Obter user_id automaticamente via JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({
                "success": False,
                "message": "Token JWT inválido"
            }), 401

        # Buscar carrinho do usuário
        cart = Cart.query.filter_by(user_id = user_id).first()
        if not cart:
            return jsonify({
                "success": False,
                "message": "Carrinho não encontrado"
            }), 404

        # Buscar item do carrinho pelo product_id
        cart_item = CartItem.query.filter_by(
            cart_id = cart.id, product_id = product_id
        ).first()

        if not cart_item:
            return jsonify({
                "success": False,
                "message": "Produto não encontrado no carrinho"
            }), 404

        # Obter nome do produto para resposta
        product = Product.query.get(product_id)
        product_name = product.name if product else "Produto desconhecido"

        db.session.delete(cart_item)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Produto removido do carrinho com sucesso",
            "data": {
                "product_id": product_id,
                "product_name": product_name
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Erro interno do servidor",
            "error": str(e)
        }), 500


@cart_bp.route("/clear", methods=["DELETE"])
@jwt_required()
def clear_cart():
    """Limpar todo o carrinho do usuário autenticado"""
    try:
        # 🔒 Obter user_id automaticamente via JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({
                "success": False,
                "message": "Token JWT inválido"
            }), 401

        # Buscar carrinho do usuário
        cart = Cart.query.filter_by(user_id = user_id).first()

        if not cart:
            return jsonify({
                "success": True,
                "message": "Carrinho já está vazio",
                "data": {"items_removed": 0}
            }), 200

        # Contar itens antes de deletar
        items_count = CartItem.query.filter_by(cart_id = cart.id).count()

        # Deletar todos os itens
        CartItem.query.filter_by(cart_id = cart.id).delete()
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Carrinho limpo com sucesso",
            "data": {"items_removed": items_count}
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Erro interno do servidor",
            "error": str(e)
        }), 500


@cart_bp.route("/count", methods=["GET"])
@jwt_required()
def get_cart_count():
    """Obter quantidade de itens no carrinho"""
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id é obrigatório"}), 400

        # Buscar carrinho do usuário
        cart = Cart.query.filter_by(user_id = user_id).first()
        if not cart:
            return jsonify({"count": 0})

        count = (
            db.session.query(db.func.sum(CartItem.quantity))
            .filter(CartItem.cart_id == cart.id)
            .scalar()
            or 0
        )

        return jsonify({"count": int(count)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========== ROTAS ADMIN ========== #


@cart_bp.route("/admin/all", methods=["GET"])
@jwt_required()
def get_all_carts():
    """Listar todos os carrinhos (admin)"""
    try:
        # Aqui você pode adicionar verificação de admin se necessário
        page = request.args.get("page", 1, type = int)
        per_page = request.args.get("per_page", 20, type = int)

        # Buscar carrinhos agrupados por usuário
        query = (
            db.session.query(
                Cart.user_id,
                User.name.label("user_name"),
                User.email.label("user_email"),
                db.func.count(CartItem.id).label("items_count"),
                db.func.sum(CartItem.quantity).label("total_quantity"),
            )
            .join(CartItem, Cart.id == CartItem.cart_id)
            .join(User, Cart.user_id == User.id)
            .group_by(Cart.user_id, User.name, User.email)
        )

        # Executar consulta com paginação manual
        total = query.count()
        items = query.limit(per_page).offset((page - 1) * per_page).all()

        carts = []
        for (
            user_id,
            user_name,
            user_email,
            items_count,
            total_quantity,
        ) in items:
            # Buscar carrinho do usuário
            cart = Cart.query.filter_by(user_id = user_id).first()
            if cart:
                # Calcular total do carrinho
                cart_total = (
                    db.session.query(db.func.sum(Product.price * CartItem.quantity))
                    .join(CartItem)
                    .filter(CartItem.cart_id == cart.id)
                    .scalar()
                    or 0
                )
            else:
                cart_total = 0

            carts.append(
                {
                    "user_id": user_id,
                    "user_name": user_name,
                    "user_email": user_email,
                    "items_count": items_count,
                    "total_quantity": int(total_quantity),
                    "total_value": float(cart_total),
                }
            )

        # Calcular páginas manualmente
        pages = (total + per_page - 1) // per_page

        return jsonify(
            {
                "carts": carts,
                "pagination": {
                    "page": page,
                    "pages": pages,
                    "total": total,
                },
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@cart_bp.route("/admin/user/<user_id>", methods=["GET"])
@jwt_required()
def get_user_cart(user_id):
    """Obter carrinho de um usuário específico (admin)"""
    try:
        # Verificar se o usuário existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Buscar carrinho do usuário
        cart = Cart.query.filter_by(user_id = user_id).first()
        if not cart:
            return jsonify(
                {
                    "user": {"id": user.id, "name": user.name, "email": user.email},
                    "items": [],
                    "total": 0,
                    "items_count": 0,
                }
            )

        # Buscar itens do carrinho
        cart_items = (
            db.session.query(CartItem, Product)
            .join(Product)
            .filter(CartItem.cart_id == cart.id)
            .all()
        )

        items = []
        total = 0

        for cart_item, product in cart_items:
            item_total = float(product.price) * cart_item.quantity
            total += item_total

            items.append(
                {
                    "id": cart_item.id,
                    "product_id": cart_item.product_id,
                    "quantity": cart_item.quantity,
                    "created_at": cart_item.created_at.isoformat(),
                    "product": {
                        "id": product.id,
                        "name": product.name,
                        "price": float(product.price),
                        "image_url": product.image_url,
                    },
                    "subtotal": item_total,
                }
            )

        return jsonify(
            {
                "user": {"id": user.id, "name": user.name, "email": user.email},
                "items": items,
                "total": total,
                "items_count": len(items),
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
