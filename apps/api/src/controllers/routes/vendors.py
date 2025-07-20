"""
Controlador para sistema multi-vendor do marketplace
"""

from datetime import datetime
from decimal import Decimal
import uuid
import json

from flask import Blueprint, jsonify, request
from sqlalchemy import desc, func

from database import db
from models.vendors import Vendor, VendorProduct, VendorOrder, VendorCommission, VendorReview
from models import User, Product, Order, Customer
from middleware.error_handler import ValidationAPIError, ResourceAPIError

vendors_bp = Blueprint("vendors", __name__)


def convert_to_uuid(id_string):
    """Convert string ID to UUID object safely"""
    try:
        return uuid.UUID(id_string)
    except (ValueError, TypeError):
        return None


# =============================================
# VENDOR REGISTRATION & MANAGEMENT
# =============================================

@vendors_bp.route("/register", methods=["POST"])
def register_vendor():
    """Registrar novo vendedor"""
    try:
        data = request.get_json()
        
        required_fields = ["business_name", "email", "cnpj", "user_id"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "success": False,
                    "error": f"Campo '{field}' é obrigatório"
                }), 400
        
        # Verificar se CNPJ já existe
        existing_vendor = Vendor.query.filter_by(cnpj=data["cnpj"]).first()
        if existing_vendor:
            return jsonify({
                "success": False,
                "error": "CNPJ já cadastrado"
            }), 409
        
        # Verificar se usuário existe
        user = User.query.get(data["user_id"])
        if not user:
            return jsonify({
                "success": False,
                "error": "Usuário não encontrado"
            }), 404
        
        # Gerar slug da loja
        store_slug = data["business_name"].lower().replace(" ", "-").replace(".", "")
        existing_slug = Vendor.query.filter_by(store_slug=store_slug).first()
        if existing_slug:
            store_slug = f"{store_slug}-{str(uuid.uuid4())[:8]}"
        
        # Criar vendedor
        vendor = Vendor(
            user_id=data["user_id"],
            business_name=data["business_name"],
            legal_name=data.get("legal_name"),
            description=data.get("description"),
            cnpj=data["cnpj"],
            email=data["email"],
            phone=data.get("phone"),
            website=data.get("website"),
            address_street=data.get("address", {}).get("street"),
            address_number=data.get("address", {}).get("number"),
            address_city=data.get("address", {}).get("city"),
            address_state=data.get("address", {}).get("state"),
            address_cep=data.get("address", {}).get("cep"),
            store_slug=store_slug,
            status="pending",
            approval_status="pending"
        )
        
        db.session.add(vendor)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Vendedor registrado com sucesso. Aguardando aprovação.",
            "vendor": vendor.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": f"Erro ao registrar vendedor: {str(e)}"
        }), 500


@vendors_bp.route("", methods=["GET"])
def get_vendors():
    """Listar vendedores"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        status = request.args.get("status")
        search = request.args.get("search", "")
        
        query = Vendor.query
        
        if status:
            query = query.filter(Vendor.status == status)
        
        if search:
            query = query.filter(
                Vendor.business_name.ilike(f"%{search}%") |
                Vendor.email.ilike(f"%{search}%")
            )
        
        vendors = query.order_by(desc(Vendor.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            "success": True,
            "data": {
                "vendors": [vendor.to_dict() for vendor in vendors.items],
                "pagination": {
                    "page": vendors.page,
                    "pages": vendors.pages,
                    "per_page": vendors.per_page,
                    "total": vendors.total
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao listar vendedores: {str(e)}"
        }), 500


@vendors_bp.route("/<vendor_id>", methods=["GET"])
def get_vendor(vendor_id):
    """Obter vendedor específico"""
    try:
        vendor_uuid = convert_to_uuid(vendor_id)
        if not vendor_uuid:
            return jsonify({
                "success": False,
                "error": "ID de vendedor inválido"
            }), 400
        
        vendor = Vendor.query.get(vendor_uuid)
        if not vendor:
            return jsonify({
                "success": False,
                "error": "Vendedor não encontrado"
            }), 404
        
        return jsonify({
            "success": True,
            "data": vendor.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao obter vendedor: {str(e)}"
        }), 500


# =============================================
# VENDOR DASHBOARD
# =============================================

@vendors_bp.route("/<vendor_id>/dashboard", methods=["GET"])
def get_vendor_dashboard(vendor_id):
    """Dashboard do vendedor"""
    try:
        vendor_uuid = convert_to_uuid(vendor_id)
        if not vendor_uuid:
            return jsonify({
                "success": False,
                "error": "ID de vendedor inválido"
            }), 400
        
        vendor = Vendor.query.get(vendor_uuid)
        if not vendor:
            return jsonify({
                "success": False,
                "error": "Vendedor não encontrado"
            }), 404
        
        # Estatísticas básicas
        total_products = VendorProduct.query.filter_by(vendor_id=vendor_uuid).count()
        total_orders = VendorOrder.query.filter_by(vendor_id=vendor_uuid).count()
        total_sales = db.session.query(func.sum(VendorOrder.vendor_payout)).filter_by(
            vendor_id=vendor_uuid
        ).scalar() or 0
        
        # Pedidos recentes
        recent_orders = VendorOrder.query.filter_by(
            vendor_id=vendor_uuid
        ).order_by(desc(VendorOrder.created_at)).limit(5).all()
        
        # Produtos mais vendidos
        top_products = db.session.query(
            VendorProduct.id,
            VendorProduct.sales_count,
            Product.name
        ).join(Product).filter(
            VendorProduct.vendor_id == vendor_uuid
        ).order_by(desc(VendorProduct.sales_count)).limit(5).all()
        
        # Comissões pendentes
        pending_commissions = VendorCommission.query.filter_by(
            vendor_id=vendor_uuid,
            status="pending"
        ).count()
        
        pending_commission_amount = db.session.query(
            func.sum(VendorCommission.vendor_payout)
        ).filter_by(
            vendor_id=vendor_uuid,
            status="pending"
        ).scalar() or 0
        
        return jsonify({
            "success": True,
            "data": {
                "vendor": vendor.to_dict(),
                "metrics": {
                    "total_products": total_products,
                    "total_orders": total_orders,
                    "total_sales": float(total_sales),
                    "pending_commissions": pending_commissions,
                    "pending_commission_amount": float(pending_commission_amount)
                },
                "recent_orders": [order.to_dict() for order in recent_orders],
                "top_products": [
                    {
                        "id": str(product.id),
                        "name": product.name,
                        "sales_count": product.sales_count
                    }
                    for product in top_products
                ]
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao carregar dashboard: {str(e)}"
        }), 500


# =============================================
# VENDOR PRODUCT MANAGEMENT
# =============================================

@vendors_bp.route("/<vendor_id>/products", methods=["GET"])
def get_vendor_products(vendor_id):
    """Listar produtos do vendedor"""
    try:
        vendor_uuid = convert_to_uuid(vendor_id)
        if not vendor_uuid:
            return jsonify({
                "success": False,
                "error": "ID de vendedor inválido"
            }), 400
        
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        status = request.args.get("status")
        
        query = VendorProduct.query.filter_by(vendor_id=vendor_uuid)
        
        if status:
            query = query.filter(VendorProduct.status == status)
        
        products = query.order_by(desc(VendorProduct.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            "success": True,
            "data": {
                "products": [product.to_dict() for product in products.items],
                "pagination": {
                    "page": products.page,
                    "pages": products.pages,
                    "per_page": products.per_page,
                    "total": products.total
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao listar produtos: {str(e)}"
        }), 500


@vendors_bp.route("/<vendor_id>/products", methods=["POST"])
def create_vendor_product(vendor_id):
    """Adicionar produto ao catálogo do vendedor"""
    try:
        vendor_uuid = convert_to_uuid(vendor_id)
        if not vendor_uuid:
            return jsonify({
                "success": False,
                "error": "ID de vendedor inválido"
            }), 400
        
        data = request.get_json()
        required_fields = ["product_id", "vendor_price", "stock_quantity"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Campo '{field}' é obrigatório"
                }), 400
        
        # Verificar se produto já existe para este vendedor
        existing = VendorProduct.query.filter_by(
            vendor_id=vendor_uuid,
            product_id=data["product_id"]
        ).first()
        
        if existing:
            return jsonify({
                "success": False,
                "error": "Produto já cadastrado para este vendedor"
            }), 409
        
        vendor_product = VendorProduct(
            vendor_id=vendor_uuid,
            product_id=data["product_id"],
            vendor_price=Decimal(str(data["vendor_price"])),
            vendor_cost=Decimal(str(data.get("vendor_cost", 0))),
            stock_quantity=data["stock_quantity"],
            min_stock_alert=data.get("min_stock_alert", 5),
            shipping_weight=Decimal(str(data.get("shipping_weight", 0))) if data.get("shipping_weight") else None,
            shipping_dimensions=json.dumps(data.get("shipping_dimensions", {})),
            status="pending"
        )
        
        db.session.add(vendor_product)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Produto adicionado com sucesso. Aguardando aprovação.",
            "product": vendor_product.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": f"Erro ao adicionar produto: {str(e)}"
        }), 500


# =============================================
# VENDOR ORDERS
# =============================================

@vendors_bp.route("/<vendor_id>/orders", methods=["GET"])
def get_vendor_orders(vendor_id):
    """Listar pedidos do vendedor"""
    try:
        vendor_uuid = convert_to_uuid(vendor_id)
        if not vendor_uuid:
            return jsonify({
                "success": False,
                "error": "ID de vendedor inválido"
            }), 400
        
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        status = request.args.get("status")
        
        query = VendorOrder.query.filter_by(vendor_id=vendor_uuid)
        
        if status:
            query = query.filter(VendorOrder.fulfillment_status == status)
        
        orders = query.order_by(desc(VendorOrder.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            "success": True,
            "data": {
                "orders": [order.to_dict() for order in orders.items],
                "pagination": {
                    "page": orders.page,
                    "pages": orders.pages,
                    "per_page": orders.per_page,
                    "total": orders.total
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao listar pedidos: {str(e)}"
        }), 500


# =============================================
# VENDOR COMMISSIONS
# =============================================

@vendors_bp.route("/<vendor_id>/commissions", methods=["GET"])
def get_vendor_commissions(vendor_id):
    """Listar comissões do vendedor"""
    try:
        vendor_uuid = convert_to_uuid(vendor_id)
        if not vendor_uuid:
            return jsonify({
                "success": False,
                "error": "ID de vendedor inválido"
            }), 400
        
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        status = request.args.get("status")
        
        query = VendorCommission.query.filter_by(vendor_id=vendor_uuid)
        
        if status:
            query = query.filter(VendorCommission.status == status)
        
        commissions = query.order_by(desc(VendorCommission.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Resumo das comissões
        total_earned = db.session.query(func.sum(VendorCommission.vendor_payout)).filter_by(
            vendor_id=vendor_uuid, status="paid"
        ).scalar() or 0
        
        pending_amount = db.session.query(func.sum(VendorCommission.vendor_payout)).filter_by(
            vendor_id=vendor_uuid, status="pending"
        ).scalar() or 0
        
        return jsonify({
            "success": True,
            "data": {
                "commissions": [commission.to_dict() for commission in commissions.items],
                "summary": {
                    "total_earned": float(total_earned),
                    "pending_amount": float(pending_amount)
                },
                "pagination": {
                    "page": commissions.page,
                    "pages": commissions.pages,
                    "per_page": commissions.per_page,
                    "total": commissions.total
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao listar comissões: {str(e)}"
        }), 500


# =============================================
# VENDOR REVIEWS
# =============================================

@vendors_bp.route("/<vendor_id>/reviews", methods=["GET"])
def get_vendor_reviews(vendor_id):
    """Listar avaliações do vendedor"""
    try:
        vendor_uuid = convert_to_uuid(vendor_id)
        if not vendor_uuid:
            return jsonify({
                "success": False,
                "error": "ID de vendedor inválido"
            }), 400
        
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        
        reviews = VendorReview.query.filter_by(
            vendor_id=vendor_uuid,
            status="approved"
        ).order_by(desc(VendorReview.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Estatísticas das avaliações
        avg_rating = db.session.query(func.avg(VendorReview.rating)).filter_by(
            vendor_id=vendor_uuid, status="approved"
        ).scalar() or 0
        
        total_reviews = VendorReview.query.filter_by(
            vendor_id=vendor_uuid, status="approved"
        ).count()
        
        return jsonify({
            "success": True,
            "data": {
                "reviews": [review.to_dict() for review in reviews.items],
                "stats": {
                    "average_rating": float(avg_rating),
                    "total_reviews": total_reviews
                },
                "pagination": {
                    "page": reviews.page,
                    "pages": reviews.pages,
                    "per_page": reviews.per_page,
                    "total": reviews.total
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao listar avaliações: {str(e)}"
        }), 500


# =============================================
# ADMIN VENDOR MANAGEMENT
# =============================================

@vendors_bp.route("/<vendor_id>/approve", methods=["POST"])
def approve_vendor(vendor_id):
    """Aprovar vendedor (Admin)"""
    try:
        vendor_uuid = convert_to_uuid(vendor_id)
        if not vendor_uuid:
            return jsonify({
                "success": False,
                "error": "ID de vendedor inválido"
            }), 400
        
        vendor = Vendor.query.get(vendor_uuid)
        if not vendor:
            return jsonify({
                "success": False,
                "error": "Vendedor não encontrado"
            }), 404
        
        data = request.get_json() or {}
        
        vendor.status = "approved"
        vendor.approval_status = "approved"
        vendor.approved_at = datetime.utcnow()
        vendor.approved_by = data.get("approved_by")
        
        if "commission_rate" in data:
            vendor.commission_rate = Decimal(str(data["commission_rate"]))
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Vendedor aprovado com sucesso",
            "vendor": vendor.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": f"Erro ao aprovar vendedor: {str(e)}"
        }), 500


@vendors_bp.route("/<vendor_id>/reject", methods=["POST"])
def reject_vendor(vendor_id):
    """Rejeitar vendedor (Admin)"""
    try:
        vendor_uuid = convert_to_uuid(vendor_id)
        if not vendor_uuid:
            return jsonify({
                "success": False,
                "error": "ID de vendedor inválido"
            }), 400
        
        vendor = Vendor.query.get(vendor_uuid)
        if not vendor:
            return jsonify({
                "success": False,
                "error": "Vendedor não encontrado"
            }), 404
        
        data = request.get_json() or {}
        
        vendor.status = "rejected"
        vendor.approval_status = "rejected"
        vendor.rejection_reason = data.get("reason", "Não especificado")
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Vendedor rejeitado",
            "vendor": vendor.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": f"Erro ao rejeitar vendedor: {str(e)}"
        }), 500