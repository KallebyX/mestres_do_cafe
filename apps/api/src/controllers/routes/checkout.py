"""
Controlador de Checkout Otimizado - Mestres do Café Enterprise
"""

import json

# Setup logger
import logging
import secrets
import uuid
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request

from database import db
from models.auth import User
from models.customers import Customer
from models.orders import Cart, CartItem, Order, OrderItem, OrderStatus
from models.products import Product

logger = logging.getLogger(__name__)

checkout_bp = Blueprint("checkout", __name__, url_prefix="/api/checkout")


@checkout_bp.route("/", methods=["GET"])
def checkout_home():
    """Informações sobre o sistema de checkout"""
    return jsonify(
        {
            "message": "Sistema de Checkout - Mestres do Café",
            "features": {
                "session": "Criação de sessão de checkout",
                "payment": "Processamento de pagamentos",
                "order": "Criação de pedidos",
                "validation": "Validação de dados",
            },
            "endpoints": {
                "session": "/session",
                "validate": "/validate",
                "process": "/process",
                "success": "/success",
                "cancel": "/cancel",
            },
        }
    )


@checkout_bp.route("/session", methods=["POST"])
def create_checkout_session():
    """Criar sessão de checkout"""
    try:
        data = request.get_json()

        # Campos obrigatórios
        required_fields = ["user_id", "items"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400

        user_id = data["user_id"]
        items = data["items"]

        # Validar itens
        if not items or not isinstance(items, list):
            return jsonify({"error": "Lista de itens inválida"}), 400

        # Validar cada item
        total_amount = 0
        validated_items = []

        for item in items:
            if not all(k in item for k in ["product_id", "quantity"]):
                return jsonify({"error": "Item inválido"}), 400

            # Buscar produto
            product = Product.query.get(item["product_id"])
            if not product:
                return (
                    jsonify({"error": f"Produto {item['product_id']} não encontrado"}),
                    404,
                )

            # Validar estoque
            if product.stock_quantity < item["quantity"]:
                return (
                    jsonify({"error": f"Estoque insuficiente para {product.name}"}),
                    400,
                )

            item_total = float(product.price) * item["quantity"]
            total_amount += item_total

            validated_items.append(
                {
                    "product_id": item["product_id"],
                    "product_name": product.name,
                    "quantity": item["quantity"],
                    "unit_price": float(product.price),
                    "total_price": item_total,
                }
            )

        # Gerar token de sessão
        session_token = generate_session_token()

        # Criar sessão (aqui você pode salvar no banco se necessário)
        session_data = {
            "token": session_token,
            "user_id": user_id,
            "items": validated_items,
            "total_amount": total_amount,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(minutes = 30)).isoformat(),
            "status": "active",
        }

        return (
            jsonify(
                {
                    "session": session_data,
                    "message": "Sessão de checkout criada com sucesso",
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@checkout_bp.route("/validate", methods=["POST"])
def validate_checkout():
    """Validar dados de checkout"""
    try:
        data = request.get_json()

        # Campos obrigatórios
        required_fields = ["session_token", "payment_method", "shipping_address"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400

        # Validar endereço de entrega
        shipping_address = data["shipping_address"]
        address_fields = ["street", "city", "state", "zip_code", "country"]
        for field in address_fields:
            if field not in shipping_address:
                return jsonify({"error": f"Campo {field} obrigatório no endereço"}), 400

        # Validar método de pagamento
        payment_method = data["payment_method"]
        valid_methods = ["credit_card", "pix", "boleto"]
        if payment_method not in valid_methods:
            return jsonify({"error": "Método de pagamento inválido"}), 400

        # Validar dados do cartão se necessário
        if payment_method == "credit_card":
            card_data = data.get("card_data")
            if not card_data:
                return jsonify({"error": "Dados do cartão obrigatórios"}), 400

            card_fields = [
                "number",
                "expiry_month",
                "expiry_year",
                "cvv",
                "holder_name",
            ]
            for field in card_fields:
                if field not in card_data:
                    return (
                        jsonify({"error": f"Campo {field} obrigatório no cartão"}),
                        400,
                    )

        return jsonify({"valid": True, "message": "Dados de checkout válidos"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@checkout_bp.route("/process", methods=["POST"])
def process_checkout():
    """Processar checkout e criar pedido"""
    try:
        data = request.get_json()

        # Campos obrigatórios
        required_fields = ["session_token", "payment_method", "shipping_address"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400

        session_token = data["session_token"]
        payment_method = data["payment_method"]
        shipping_address = data["shipping_address"]

        # Aqui você recuperaria a sessão do banco/cache
        # Por enquanto, vamos simular

        # Criar pedido
        order_id = str(uuid.uuid4())
        order_data = {
            "id": order_id,
            "user_id": data.get("user_id"),
            "status": "pending",
            "payment_status": "pending",
            "payment_method": payment_method,
            "shipping_address": shipping_address,
            "total_amount": 0,  # Calculado dos itens
            "created_at": datetime.utcnow().isoformat(),
            "estimated_delivery": (datetime.utcnow() + timedelta(days = 7)).isoformat(),
        }

        # Simular processamento de pagamento
        if payment_method == "credit_card":
            # Simular resposta do gateway
            payment_result = {
                "success": True,
                "transaction_id": f"txn_{uuid.uuid4().hex[:16]}",
                "status": "approved",
            }
        elif payment_method == "pix":
            payment_result = {
                "success": True,
                "pix_code": f"pix_{uuid.uuid4().hex[:32]}",
                "status": "pending",
            }
        else:  # boleto
            payment_result = {
                "success": True,
                "boleto_url": f"https://boleto.example.com/{uuid.uuid4().hex}",
                "status": "pending",
            }

        if payment_result["success"]:
            order_data["payment_status"] = payment_result["status"]
            if payment_result["status"] == "approved":
                order_data["status"] = "confirmed"

        return (
            jsonify(
                {
                    "order": order_data,
                    "payment_result": payment_result,
                    "message": "Checkout processado com sucesso",
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@checkout_bp.route("/success", methods=["GET"])
def checkout_success():
    """Página de sucesso do checkout"""
    try:
        order_id = request.args.get("order_id")
        if not order_id:
            return jsonify({"error": "order_id obrigatório"}), 400

        # Aqui você buscaria o pedido no banco
        # Por enquanto, vamos simular

        return jsonify(
            {
                "message": "Pedido realizado com sucesso!",
                "order_id": order_id,
                "status": "confirmed",
                "next_steps": [
                    "Você receberá um email de confirmação",
                    "Acompanhe o status do pedido em sua conta",
                    "Produto será enviado em até 2 dias úteis",
                ],
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@checkout_bp.route("/cancel", methods=["POST"])
def cancel_checkout():
    """Cancelar checkout"""
    try:
        data = request.get_json()
        session_token = data.get("session_token")

        if not session_token:
            return jsonify({"error": "session_token obrigatório"}), 400

        # Aqui você invalidaria a sessão

        return jsonify({"message": "Checkout cancelado com sucesso"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========== UTILITÁRIOS ========== #


def generate_session_token():
    """Gera token único para a sessão"""
    return secrets.token_urlsafe(32)


def validate_cep(cep):
    """Valida formato do CEP"""
    import re

    clean_cep = re.sub(r"\D", "", cep)
    return len(clean_cep) == 8


def get_address_by_cep(cep):
    """Busca endereço pelo CEP usando ViaCEP"""
    import requests

    try:
        clean_cep = cep.replace("-", "").replace(" ", "")
        if not validate_cep(clean_cep):
            return None

        response = requests.get(
            f"https://viacep.com.br/ws/{clean_cep}/json/", timeout = 5
        )
        if response.status_code == 200:
            data = response.json()
            if not data.get("erro"):
                return {
                    "cep": data.get("cep"),
                    "street": data.get("logradouro"),
                    "neighborhood": data.get("bairro"),
                    "city": data.get("localidade"),
                    "state": data.get("uf"),
                    "ibge": data.get("ibge"),
                }
    except Exception as e:
        logger.error(f"Erro ao buscar CEP: {str(e)}")

    return None


def calculate_shipping_mock(origin_cep, destination_cep, products):
    """Calcula frete de forma simulada"""
    try:
        # Determinar região de destino
        dest_state = get_state_from_cep(destination_cep)

        # Calcular peso total
        total_weight = sum(
            p.get("weight", 0.5) * p.get("quantity", 1) for p in products
        )
        total_weight = max(total_weight, 0.3)  # Peso mínimo

        # Preços base por estado
        state_prices = {
            "SP": 15.00,
            "RJ": 18.00,
            "MG": 20.00,
            "PR": 22.00,
            "SC": 25.00,
            "RS": 28.00,
            "ES": 20.00,
            "BA": 25.00,
            "PE": 30.00,
            "CE": 32.00,
            "DF": 25.00,
        }

        base_price = state_prices.get(dest_state, 30.00)
        weight_multiplier = max(1.0, total_weight / 1.0)

        options = [
            {
                "id": str(uuid.uuid4()),
                "carrier_name": "Correios",
                "service_name": "PAC",
                "service_code": "04510",
                "price": round(base_price * 0.8 * weight_multiplier, 2),
                "delivery_time": 7,
                "description": "Entrega padrão dos Correios",
            },
            {
                "id": str(uuid.uuid4()),
                "carrier_name": "Correios",
                "service_name": "SEDEX",
                "service_code": "04014",
                "price": round(base_price * 1.5 * weight_multiplier, 2),
                "delivery_time": 3,
                "description": "Entrega expressa dos Correios",
            },
        ]

        return options

    except Exception as e:
        logger.error(f"Erro ao calcular frete: {str(e)}")
        return []


def get_state_from_cep(cep):
    """Determina o estado baseado no CEP"""
    clean_cep = cep.replace("-", "").replace(" ", "")
    if len(clean_cep) < 2:
        return "SP"

    prefix = clean_cep[:2]
    states = {
        "01": "SP",
        "02": "SP",
        "03": "SP",
        "04": "SP",
        "05": "SP",
        "20": "RJ",
        "21": "RJ",
        "22": "RJ",
        "23": "RJ",
        "24": "RJ",
        "30": "MG",
        "31": "MG",
        "32": "MG",
        "33": "MG",
        "34": "MG",
        "70": "DF",
        "71": "DF",
        "72": "DF",
        "73": "DF",
    }

    return states.get(prefix, "SP")


# ========== ROTAS PRINCIPAIS ========== #


@checkout_bp.route("/start", methods=["POST"])
def start_checkout():
    """Inicia o processo de checkout"""
    try:
        data = request.get_json()
        user_id = data.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id é obrigatório"}), 400

        # Verificar se usuário existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Buscar carrinho do usuário
        user_cart = Cart.query.filter_by(user_id = user_id).first()
        if not user_cart:
            return jsonify({"error": "Carrinho não encontrado"}), 404

        # Buscar itens do carrinho com detalhes do produto
        cart_items = (
            db.session.query(CartItem).filter(CartItem.cart_id == user_cart.id).all()
        )

        if not cart_items:
            return jsonify({"error": "Carrinho vazio"}), 400

        # Calcular total do carrinho
        cart_total = 0
        cart_data = []

        for cart_item in cart_items:
            try:
                product = cart_item.product
                item_total = float(product.price) * cart_item.quantity
                cart_total += item_total

                # Obter URL da imagem de forma segura
                image_url = product.image_url

                cart_data.append(
                    {
                        "cart_item_id": cart_item.id,
                        "product_id": product.id,
                        "name": product.name,
                        "price": float(product.price),
                        "quantity": cart_item.quantity,
                        "subtotal": item_total,
                        "image_url": image_url,
                        "weight": getattr(product, "weight", 0.5),
                    }
                )
            except Exception as item_error:
                logger.error(
                    f"Erro ao processar item do carrinho {cart_item.id}: {str(item_error)}"
                )
                logger.error(
                    f"Detalhes do produto: id={getattr(product, 'id', 'N/A')}, nome={getattr(product, 'name', 'N/A')}"
                )
                raise

        # Criar sessão de checkout (simulada em memória por agora)
        session_token = generate_session_token()

        checkout_session = {
            "session_token": session_token,
            "user_id": user_id,
            "status": "cart_review",
            "current_step": 1,
            "total_steps": 6,
            "cart_data": cart_data,
            "cart_total": cart_total,
            "subtotal": cart_total,
            "shipping_total": 0.0,
            "tax_total": 0.0,
            "discount_total": 0.0,
            "final_total": cart_total,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        return (
            jsonify(
                {
                    "message": "Checkout iniciado com sucesso",
                    "session_token": session_token,
                    "checkout_session": checkout_session,
                }
            ),
            201,
        )

    except Exception as e:
        logger.error(f"Erro ao iniciar checkout: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500


@checkout_bp.route("/validate-cep", methods=["POST"])
def validate_cep_route():
    """Valida CEP e retorna dados do endereço"""
    try:
        data = request.get_json()
        cep = data.get("cep", "")

        if not validate_cep(cep):
            return jsonify({"error": "CEP inválido"}), 400

        address_data = get_address_by_cep(cep)

        if not address_data:
            return jsonify({"error": "CEP não encontrado"}), 404

        return jsonify({"valid": True, "address": address_data})

    except Exception as e:
        logger.error(f"Erro ao validar CEP: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500


@checkout_bp.route("/shipping-options", methods=["POST"])
def calculate_shipping_options():
    """Calcula opções de frete"""
    try:
        data = request.get_json()
        session_token = data.get("session_token")
        user_id = data.get("user_id")
        destination_cep = data.get("destination_cep")
        products = data.get("products", [])

        if not all([session_token, user_id, destination_cep]):
            return jsonify({"error": "Dados obrigatórios faltando"}), 400

        # Validar CEP
        if not validate_cep(destination_cep):
            return jsonify({"error": "CEP de destino inválido"}), 400

        # Calcular opções de frete
        shipping_options = calculate_shipping_mock(
            "01310-100", destination_cep, products  # CEP origem da loja
        )

        if not shipping_options:
            return jsonify({"error": "Não foi possível calcular o frete"}), 500

        return jsonify(
            {
                "message": "Opções de frete calculadas com sucesso",
                "shipping_options": shipping_options,
            }
        )

    except Exception as e:
        logger.error(f"Erro ao calcular frete: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500


@checkout_bp.route("/apply-coupon", methods=["POST"])
def apply_coupon():
    """Aplica cupom de desconto"""
    try:
        data = request.get_json()
        session_token = data.get("session_token")
        user_id = data.get("user_id")
        coupon_code = data.get("coupon_code", "").strip().upper()
        subtotal = data.get("subtotal", 0)

        if not all([session_token, user_id, coupon_code]):
            return jsonify({"error": "Dados obrigatórios faltando"}), 400

        # Cupons de exemplo
        valid_coupons = {
            "DESCONTO10": {"type": "percentage", "value": 10, "min_value": 50},
            "FRETE_GRATIS": {"type": "free_shipping", "value": 0, "min_value": 100},
            "PRIMEIRACOMPRA": {"type": "fixed", "value": 20, "min_value": 80},
        }

        coupon = valid_coupons.get(coupon_code)

        if not coupon:
            return jsonify({"error": "Cupom não encontrado"}), 404

        if subtotal < coupon["min_value"]:
            return (
                jsonify(
                    {
                        "error": f'Pedido mínimo de R$ {coupon["min_value"]:.2f} para usar este cupom'
                    }
                ),
                400,
            )

        # Calcular desconto
        discount_amount = 0
        if coupon["type"] == "percentage":
            discount_amount = subtotal * (coupon["value"] / 100)
        elif coupon["type"] == "fixed":
            discount_amount = min(coupon["value"], subtotal)

        return jsonify(
            {
                "message": "Cupom aplicado com sucesso",
                "coupon_code": coupon_code,
                "coupon_type": coupon["type"],
                "discount_amount": round(discount_amount, 2),
                "free_shipping": coupon["type"] == "free_shipping",
            }
        )

    except Exception as e:
        logger.error(f"Erro ao aplicar cupom: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500


@checkout_bp.route("/complete", methods=["POST"])
def complete_checkout():
    """Finaliza o checkout criando o pedido"""
    try:
        data = request.get_json()
        session_token = data.get("session_token")
        user_id = data.get("user_id")

        # Dados do checkout
        shipping_data = data.get("shipping_data", {})
        payment_data = data.get("payment_data", {})
        cart_data = data.get("cart_data", [])
        totals = data.get("totals", {})

        if not all([session_token, user_id, shipping_data, payment_data, cart_data]):
            return jsonify({"error": "Dados obrigatórios faltando"}), 400

        # Verificar se usuário existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Gerar número do pedido
        order_number = f"MC{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:8].upper()}"

        # Criar pedido usando dicionário para inicialização
        shipping_address_json = json.dumps(
            {
                "street": shipping_data.get("street", ""),
                "number": shipping_data.get("number", ""),
                "neighborhood": shipping_data.get("neighborhood", ""),
                "city": shipping_data.get("city", ""),
                "state": shipping_data.get("state", ""),
                "cep": shipping_data.get("cep", ""),
                "country": shipping_data.get("country", "Brasil"),
                "delivery_instructions": shipping_data.get("delivery_instructions", ""),
            }
        )

        # Criar ou atualizar customer no CRM
        customer = Customer.query.filter_by(user_id = user_id).first()
        if not customer:
            customer = Customer(
                user_id = user_id,
                name = user.name,
                email = user.email,
                phone = shipping_data.get("phone", ""),
                address_street = shipping_data.get("street", ""),
                address_number = shipping_data.get("number", ""),
                address_neighborhood = shipping_data.get("neighborhood", ""),
                address_city = shipping_data.get("city", ""),
                address_state = shipping_data.get("state", ""),
                address_cep = shipping_data.get("cep", ""),
                address_country = shipping_data.get("country", "BR"),
                customer_type="individual",
                status="active"
            )
            db.session.add(customer)
            db.session.flush()
        else:
            # Atualizar dados do customer existente
            customer.phone = shipping_data.get("phone", customer.phone)
            customer.address_street = shipping_data.get("street", customer.address_street)
            customer.address_number = shipping_data.get("number", customer.address_number)
            customer.address_neighborhood = shipping_data.get("neighborhood", customer.address_neighborhood)
            customer.address_city = shipping_data.get("city", customer.address_city)
            customer.address_state = shipping_data.get("state", customer.address_state)
            customer.address_cep = shipping_data.get("cep", customer.address_cep)
            customer.address_country = shipping_data.get("country", customer.address_country)
            customer.status = "active"

        order_data = {
            "user_id": user_id,
            "order_number": order_number,
            "status": OrderStatus.PENDING.value,
            "subtotal": totals.get("subtotal", 0),
            "shipping_cost": totals.get("shipping_total", 0),
            "tax_amount": totals.get("tax_total", 0),
            "total_amount": totals.get("final_total", 0),
            "shipping_address": shipping_address_json,
            "notes": shipping_data.get("delivery_instructions", ""),
        }

        order = Order(**order_data)

        db.session.add(order)
        db.session.flush()  # Para obter o ID do pedido

        # Criar itens do pedido e atualizar estoque
        for item_data in cart_data:
            product = Product.query.get(item_data["product_id"])
            if not product:
                continue

            # Verificar estoque disponível
            if product.stock_quantity < item_data["quantity"]:
                db.session.rollback()
                return (
                    jsonify(
                        {
                            "error": f"Estoque insuficiente para {product.name}. Disponível: {product.stock_quantity}"
                        }
                    ),
                    400,
                )

            # Atualizar estoque do produto
            product.stock_quantity -= item_data["quantity"]

            order_item_data = {
                "order_id": order.id,
                "product_id": product.id,
                "product_name": product.name,
                "quantity": item_data["quantity"],
                "unit_price": item_data["price"],
                "total_price": item_data["subtotal"],
            }
            order_item = OrderItem(**order_item_data)
            db.session.add(order_item)

        # Limpar carrinho
        user_cart = Cart.query.filter_by(user_id = user_id).first()
        if user_cart:
            CartItem.query.filter_by(cart_id = user_cart.id).delete()

        db.session.commit()

        return jsonify(
            {
                "message": "Checkout finalizado com sucesso",
                "order": {
                    "id": order.id,
                    "order_number": order.order_number,
                    "total_amount": order.total_amount,
                    "status": order.status,
                },
            }
        )

    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao finalizar checkout: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500


@checkout_bp.route("/payment-methods", methods=["GET"])
def get_payment_methods():
    """Retorna métodos de pagamento disponíveis"""
    try:
        methods = [
            {
                "id": "pix",
                "name": "PIX",
                "description": "Pagamento instantâneo",
                "icon": "pix",
                "fees": 0,
                "installments": 1,
            },
            {
                "id": "credit_card",
                "name": "Cartão de Crédito",
                "description": "Parcelamento em até 12x",
                "icon": "credit-card",
                "fees": 2.99,
                "installments": 12,
            },
            {
                "id": "debit_card",
                "name": "Cartão de Débito",
                "description": "Débito à vista",
                "icon": "credit-card",
                "fees": 1.99,
                "installments": 1,
            },
            {
                "id": "boleto",
                "name": "Boleto Bancário",
                "description": "Vencimento em 3 dias úteis",
                "icon": "file-text",
                "fees": 0,
                "installments": 1,
            },
        ]

        return jsonify({"payment_methods": methods})

    except Exception as e:
        logger.error(f"Erro ao buscar métodos de pagamento: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500


# ========== ROTAS DE RECUPERAÇÃO ========== #


@checkout_bp.route("/abandoned-carts", methods=["GET"])
def get_abandoned_carts():
    """Lista carrinhos abandonados para recuperação"""
    try:
        # Implementação futura - por agora retorna dados mock
        abandoned_carts = []

        return jsonify(
            {"abandoned_carts": abandoned_carts, "total": len(abandoned_carts)}
        )

    except Exception as e:
        logger.error(f"Erro ao buscar carrinhos abandonados: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500
