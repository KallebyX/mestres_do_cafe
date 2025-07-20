import re
import unicodedata
import uuid

from flask import Blueprint, jsonify, request

from database import db
from models import Product, ProductCategory
from .products_create import add_product_crud_routes

products_bp = Blueprint("products", __name__)


def convert_to_uuid(id_string):
    """Convert string ID to UUID object safely"""
    try:
        return uuid.UUID(id_string)
    except (ValueError, TypeError):
        return None


def normalize_search_text(text):
    """Normaliza texto para busca, removendo acentos e caracteres especiais"""
    if not text:
        return ""

    # Normalizar caracteres Unicode (remover acentos)
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")

    # Converter para minúscula e remover caracteres especiais
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text.lower())

    return text.strip()


def generate_search_variations(text):
    """Gera variações do texto de busca para incluir acentos comuns"""
    if not text:
        return [text]

    variations = [text.lower()]

    # Mapeamento de caracteres sem acento para versões com acento
    accent_map = {
        "a": ["á", "à", "ã", "â"],
        "e": ["é", "ê", "è"],
        "i": ["í", "î", "ì"],
        "o": ["ó", "ô", "õ", "ò"],
        "u": ["ú", "û", "ù"],
        "c": ["ç"],
        "n": ["ñ"],
    }

    # Para cada caractere no texto, gerar variações com acentos
    words = text.lower().split()
    for word in words:
        for char, accents in accent_map.items():
            if char in word:
                for accent in accents:
                    new_word = word.replace(char, accent)
                    if new_word not in variations:
                        variations.append(new_word)
                        # Adicionar também a palavra completa com o acento
                        full_text = text.lower().replace(word, new_word)
                        if full_text not in variations:
                            variations.append(full_text)

    return variations


@products_bp.route("/", methods=["GET"])
def get_products():
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 12, type=int)
        category = request.args.get("category")
        search = request.args.get("search")

        query = Product.query.filter_by(is_active=True)

        if category:
            query = query.filter_by(category=category)

        if search:
            # Gerar variações do termo de busca para incluir acentos
            search_variations = generate_search_variations(search)
            normalized_search = normalize_search_text(search)

            # Criar condições OR para todas as variações
            search_conditions = []
            for variation in search_variations:
                search_conditions.extend(
                    [
                        Product.name.ilike(f"%{variation}%"),
                        Product.description.ilike(f"%{variation}%"),
                        Product.origin.ilike(f"%{variation}%"),
                    ]
                )

            # Adicionar busca com termo normalizado
            search_conditions.extend(
                [
                    Product.name.ilike(f"%{normalized_search}%"),
                    Product.description.ilike(f"%{normalized_search}%"),
                    Product.origin.ilike(f"%{normalized_search}%"),
                ]
            )

            query = query.filter(db.or_(*search_conditions))

        products = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify(
            {
                "products": [
                    {
                        "id": product.id,
                        "name": product.name,
                        "description": product.description,
                        "price": float(product.price),
                        "image_url": product.image_url,
                        "category": (
                            product.category.name if hasattr(product.category, 'name') else product.category
                        ),
                        "origin": product.origin,
                        "flavor_notes": (
                            product.flavor_notes.split(", ")
                            if product.flavor_notes
                            else []
                        ),
                        "sca_score": product.sca_score,
                        "weight": product.weight,
                        "stock_quantity": product.stock_quantity,
                        "is_featured": product.is_featured,
                    }
                    for product in products.items
                ],
                "pagination": {
                    "page": products.page,
                    "pages": products.pages,
                    "per_page": products.per_page,
                    "total": products.total,
                    "has_next": products.has_next,
                    "has_prev": products.has_prev,
                },
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@products_bp.route("/debug-uuid/<product_id>", methods=["GET"])
def debug_uuid_product(product_id):
    """Endpoint de debug para testar UUID"""
    try:
        # Tentar buscar produto sem validações complexas
        from sqlalchemy import text

        result = db.session.execute(
            text("SELECT id, name, price FROM products WHERE id = :id"),
            {"id": product_id},
        ).fetchone()

        if result:
            return jsonify(
                {
                    "found": True,
                    "id": result[0],
                    "name": result[1],
                    "price": float(result[2]) if result[2] else 0.0,
                }
            )
        else:
            return jsonify({"found": False, "product_id": product_id})

    except Exception as e:
        return jsonify({"error": str(e)})


@products_bp.route("/debug-search", methods=["GET"])
def debug_products():
    """Endpoint de debug para testar busca"""
    try:
        query = request.args.get("q", "cafe")

        # Testar diferentes tipos de busca
        results = {
            "query": query,
            "variations": generate_search_variations(query),
            "normalized": normalize_search_text(query),
            "total_products": Product.query.filter_by(is_active=True).count(),
            "products_with_cafe": [],
            "simple_search": [],
        }

        # Buscar produtos que contenham "café" no nome
        cafe_products = (
            Product.query.filter_by(is_active=True)
            .filter(Product.name.ilike("%café%"))
            .all()
        )

        results["products_with_cafe"] = [
            {"id": p.id, "name": p.name, "description": p.description}
            for p in cafe_products
        ]

        # Busca simples usando uma das variações
        simple_search = (
            Product.query.filter_by(is_active=True)
            .filter(Product.name.ilike(f"%{query}%"))
            .all()
        )

        results["simple_search"] = [
            {"id": p.id, "name": p.name, "description": p.description}
            for p in simple_search
        ]

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@products_bp.route("/by-id/<product_id>", methods=["GET"])
def get_product_by_id(product_id):
    """Endpoint alternativo para buscar produto por ID"""
    try:
        product_uuid = convert_to_uuid(product_id)
        if not product_uuid:
            return jsonify({"error": "ID de produto inválido"}), 400
            
        product = Product.query.filter_by(id=product_uuid, is_active=True).first()
        
        if not product:
            return jsonify({"error": "Produto não encontrado"}), 404

        return jsonify(
            {
                "product": {
                    "id": str(product.id),
                    "name": product.name,
                    "slug": product.slug,
                    "description": product.description,
                    "short_description": product.short_description,
                    "sku": product.sku,
                    "price": float(product.price) if product.price and product.price != '' else 0.0,
                    "cost_price": (
                        float(product.cost_price) if product.cost_price and product.cost_price != '' else 0.0
                    ),
                    "compare_price": (
                        float(product.compare_price) if product.compare_price and product.compare_price != '' else 0.0
                    ),
                    "image_url": product.image_url,
                    "gallery_images": product.gallery_images,
                    "category": product.category,
                    "category_id": (
                        str(product.category_id) if product.category_id else None
                    ),
                    "origin": product.origin,
                    "process": product.process,
                    "roast_level": product.roast_level,
                    "flavor_notes": (
                        product.flavor_notes.split(", ") if product.flavor_notes else []
                    ),
                    "sca_score": product.sca_score if product.sca_score is not None else 80,
                    "acidity": product.acidity if product.acidity is not None else 5,
                    "sweetness": product.sweetness if product.sweetness is not None else 5,
                    "body": product.body if product.body is not None else 5,
                    "weight": float(product.weight) if product.weight and product.weight != '' else 250.0,
                    "dimensions": product.dimensions,
                    "stock_quantity": product.stock_quantity if product.stock_quantity is not None else 0,
                    "min_stock_level": product.min_stock_level if product.min_stock_level is not None else 0,
                    "max_stock_level": product.max_stock_level if product.max_stock_level is not None else 100,
                    "track_inventory": product.track_inventory,
                    "is_active": product.is_active,
                    "is_featured": product.is_featured,
                    "is_digital": product.is_digital,
                    "requires_shipping": product.requires_shipping,
                    "meta_title": product.meta_title,
                    "meta_description": product.meta_description,
                    "created_at": (
                        product.created_at.isoformat() if product.created_at else None
                    ),
                    "updated_at": (
                        product.updated_at.isoformat() if product.updated_at else None
                    ),
                }
            }
        )

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar produto: {str(e)}"}), 500


@products_bp.route("/<product_id>", methods=["GET"])
def get_product(product_id):
    try:
        product_uuid = convert_to_uuid(product_id)
        if not product_uuid:
            return jsonify({"error": "ID de produto inválido"}), 400
            
        product = Product.query.filter_by(id=product_uuid, is_active=True).first()
        
        if not product:
            return jsonify({"error": "Produto não encontrado"}), 404

        return jsonify(
            {
                "product": {
                    "id": str(product.id),
                    "name": product.name,
                    "slug": product.slug,
                    "description": product.description,
                    "short_description": product.short_description,
                    "sku": product.sku,
                    "price": float(product.price) if product.price and product.price != '' else 0.0,
                    "cost_price": (
                        float(product.cost_price) if product.cost_price and product.cost_price != '' else 0.0
                    ),
                    "compare_price": (
                        float(product.compare_price) if product.compare_price and product.compare_price != '' else 0.0
                    ),
                    "image_url": product.image_url,
                    "gallery_images": product.gallery_images,
                    "category": product.category,
                    "category_id": (
                        str(product.category_id) if product.category_id else None
                    ),
                    "origin": product.origin,
                    "process": product.process,
                    "roast_level": product.roast_level,
                    "flavor_notes": (
                        product.flavor_notes.split(", ") if product.flavor_notes else []
                    ),
                    "sca_score": product.sca_score if product.sca_score is not None else 80,
                    "acidity": product.acidity if product.acidity is not None else 5,
                    "sweetness": product.sweetness if product.sweetness is not None else 5,
                    "body": product.body if product.body is not None else 5,
                    "weight": float(product.weight) if product.weight and product.weight != '' else 250.0,
                    "dimensions": product.dimensions,
                    "stock_quantity": product.stock_quantity if product.stock_quantity is not None else 0,
                    "min_stock_level": product.min_stock_level if product.min_stock_level is not None else 0,
                    "max_stock_level": product.max_stock_level if product.max_stock_level is not None else 100,
                    "track_inventory": product.track_inventory,
                    "is_active": product.is_active,
                    "is_featured": product.is_featured,
                    "is_digital": product.is_digital,
                    "requires_shipping": product.requires_shipping,
                    "meta_title": product.meta_title,
                    "meta_description": product.meta_description,
                    "created_at": (
                        product.created_at.isoformat() if product.created_at else None
                    ),
                    "updated_at": (
                        product.updated_at.isoformat() if product.updated_at else None
                    ),
                }
            }
        )

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar produto: {str(e)}"}), 500


@products_bp.route("/categories", methods=["GET"])
def get_categories():
    try:
        categories = ProductCategory.query.filter_by(is_active=True).all()

        return jsonify(
            {
                "categories": [
                    {
                        "id": category.id,
                        "name": category.name,
                        "description": category.description,
                        "image_url": category.image_url,
                    }
                    for category in categories
                ]
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@products_bp.route("/featured", methods=["GET"])
def get_featured_products():
    try:
        # Produtos em destaque (com maior pontuação SCA)
        products = (
            Product.query.filter_by(is_active=True)
            .filter(Product.sca_score >= 85)
            .order_by(Product.sca_score.desc())
            .limit(6)
            .all()
        )

        return jsonify(
            {
                "products": [
                    {
                        "id": product.id,
                        "name": product.name,
                        "description": product.description,
                        "price": float(product.price),
                        "image_url": product.image_url,
                        "category": (
                            product.category.name if hasattr(product.category, 'name') else product.category
                        ),
                        "origin": product.origin,
                        "sca_score": product.sca_score,
                        "weight": product.weight,
                    }
                    for product in products
                ]
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@products_bp.route("/search", methods=["GET"])
def search_products():
    try:
        query = request.args.get("q", "")
        if not query:
            return jsonify({"products": []})

        # Gerar variações do termo de busca para incluir acentos
        search_variations = generate_search_variations(query)
        normalized_query = normalize_search_text(query)

        # Criar condições OR para todas as variações
        search_conditions = []
        for variation in search_variations:
            search_conditions.extend(
                [
                    Product.name.ilike(f"%{variation}%"),
                    Product.description.ilike(f"%{variation}%"),
                    Product.origin.ilike(f"%{variation}%"),
                ]
            )

        # Adicionar busca com termo normalizado
        search_conditions.extend(
            [
                Product.name.ilike(f"%{normalized_query}%"),
                Product.description.ilike(f"%{normalized_query}%"),
                Product.origin.ilike(f"%{normalized_query}%"),
            ]
        )

        # Busca melhorada com normalização UTF-8
        products = (
            Product.query.filter_by(is_active=True)
            .filter(db.or_(*search_conditions))
            .limit(10)
            .all()
        )

        return jsonify(
            {
                "products": [
                    {
                        "id": product.id,
                        "name": product.name,
                        "price": float(product.price),
                        "image_url": product.image_url,
                        "category": (
                            product.category.name if hasattr(product.category, 'name') else product.category
                        ),
                    }
                    for product in products
                ]
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Adicionar rotas CRUD
products_bp = add_product_crud_routes(products_bp)
