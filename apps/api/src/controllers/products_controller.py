"""
Products controller using base controller to eliminate duplication
"""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from controllers.base import BaseController, require_auth, require_admin, handle_exceptions
from models.products import Product
from database import db
import logging

logger = logging.getLogger(__name__)

# Create blueprint
products_bp = Blueprint('products', __name__)


class ProductsController(BaseController):
    """Products controller with specific business logic"""

    def __init__(self):
        super().__init__(Product, db.session)
        self.required_fields = ['name', 'price', 'category']
        self.allowed_update_fields = ['name', 'description', 'price', 'category', 'stock_quantity', 'is_active']
        self.search_fields = ['name', 'description', 'category']

    def get_featured_products(self):
        """Get featured products"""
        try:
            query = self.db.query(self.model).filter(
                self.model.is_featured,
                self.model.is_active
            ).limit(10)

            products = query.all()
            result = [self._serialize_model(product) for product in products]

            return self._success_response(result, "Featured products retrieved successfully")

        except Exception as e:
            logger.error(f"Error retrieving featured products: {e}")
            return self._error_response("Error retrieving featured products", 500, str(e))

    def get_products_by_category(self, category):
        """Get products by category"""
        try:
            query = self.db.query(self.model).filter(
                self.model.category == category,
                self.model.is_active
            )

            # Apply pagination
            query_params = self._get_query_params()
            page = int(query_params.get('page', 1))
            per_page = int(query_params.get('per_page', self.per_page))
            paginated = self._paginate_query(query, page, per_page)

            # Serialize results
            items = [self._serialize_model(item) for item in paginated.items]

            result = {
                'items': items,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': paginated.total,
                    'pages': paginated.pages,
                    'has_next': paginated.has_next,
                    'has_prev': paginated.has_prev
                },
                'category': category
            }

            return self._success_response(result, f"Products in category '{category}' retrieved successfully")

        except Exception as e:
            logger.error(f"Error retrieving products by category: {e}")
            return self._error_response("Error retrieving products", 500, str(e))

    def get_low_stock_products(self):
        """Get products with low stock"""
        try:
            query = self.db.query(self.model).filter(
                self.model.stock_quantity <= self.model.min_stock_level,
                self.model.is_active
            )

            products = query.all()
            result = [self._serialize_model(product) for product in products]

            return self._success_response(result, "Low stock products retrieved successfully")

        except Exception as e:
            logger.error(f"Error retrieving low stock products: {e}")
            return self._error_response("Error retrieving low stock products", 500, str(e))

    def toggle_product_status(self, product_id):
        """Toggle product active status"""
        try:
            product = self.db.query(self.model).filter(self.model.id == product_id).first()

            if not product:
                return self._error_response("Product not found", 404)

            product.is_active = not product.is_active
            self.db.commit()
            self.db.refresh(product)

            status = "activated" if product.is_active else "deactivated"
            return self._success_response(
                self._serialize_model(product),
                f"Product {status} successfully"
            )

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error toggling product status: {e}")
            return self._error_response("Error updating product status", 500, str(e))

    def update_stock(self, product_id):
        """Update product stock quantity"""
        try:
            product = self.db.query(self.model).filter(self.model.id == product_id).first()

            if not product:
                return self._error_response("Product not found", 404)

            data = self._get_request_data()
            stock_change = data.get('stock_change')
            new_quantity = data.get('new_quantity')

            if stock_change is not None:
                product.stock_quantity += stock_change
            elif new_quantity is not None:
                product.stock_quantity = new_quantity
            else:
                return self._error_response("Either stock_change or new_quantity is required", 400)

            if product.stock_quantity < 0:
                return self._error_response("Stock quantity cannot be negative", 400)

            self.db.commit()
            self.db.refresh(product)

            return self._success_response(
                self._serialize_model(product),
                "Stock updated successfully"
            )

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating stock: {e}")
            return self._error_response("Error updating stock", 500, str(e))

    def get_product_categories(self):
        """Get all product categories"""
        try:
            categories = self.db.query(self.model.category).distinct().all()
            result = [category[0] for category in categories if category[0]]

            return self._success_response(result, "Categories retrieved successfully")

        except Exception as e:
            logger.error(f"Error retrieving categories: {e}")
            return self._error_response("Error retrieving categories", 500, str(e))


# Initialize controller
products_controller = ProductsController()


# Routes
@products_bp.route('/', methods=['GET'])
@jwt_required()
@handle_exceptions
def get_products():
    """Get all products with filtering and pagination"""
    return products_controller.get_all()


@products_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
@handle_exceptions
def get_product(product_id):
    """Get single product by ID"""
    return products_controller.get_by_id(product_id)


@products_bp.route('/', methods=['POST'])
@require_admin
@handle_exceptions
def create_product():
    """Create new product"""
    return products_controller.create(products_controller.required_fields)


@products_bp.route('/<int:product_id>', methods=['PUT'])
@require_admin
@handle_exceptions
def update_product(product_id):
    """Update existing product"""
    return products_controller.update(product_id, products_controller.allowed_update_fields)


@products_bp.route('/<int:product_id>', methods=['DELETE'])
@require_admin
@handle_exceptions
def delete_product(product_id):
    """Delete product"""
    return products_controller.delete(product_id)


@products_bp.route('/search', methods=['GET'])
@jwt_required()
@handle_exceptions
def search_products():
    """Search products"""
    return products_controller.search(products_controller.search_fields)


@products_bp.route('/featured', methods=['GET'])
@jwt_required()
@handle_exceptions
def get_featured_products():
    """Get featured products"""
    return products_controller.get_featured_products()


@products_bp.route('/category/<category>', methods=['GET'])
@jwt_required()
@handle_exceptions
def get_products_by_category(category):
    """Get products by category"""
    return products_controller.get_products_by_category(category)


@products_bp.route('/low-stock', methods=['GET'])
@require_admin
@handle_exceptions
def get_low_stock_products():
    """Get products with low stock"""
    return products_controller.get_low_stock_products()


@products_bp.route('/<int:product_id>/toggle-status', methods=['POST'])
@require_admin
@handle_exceptions
def toggle_product_status(product_id):
    """Toggle product active status"""
    return products_controller.toggle_product_status(product_id)


@products_bp.route('/<int:product_id>/stock', methods=['PUT'])
@require_admin
@handle_exceptions
def update_stock(product_id):
    """Update product stock"""
    return products_controller.update_stock(product_id)


@products_bp.route('/categories', methods=['GET'])
@jwt_required()
@handle_exceptions
def get_product_categories():
    """Get all product categories"""
    return products_controller.get_product_categories()


@products_bp.route('/bulk', methods=['POST'])
@require_admin
@handle_exceptions
def bulk_create_products():
    """Create multiple products"""
    return products_controller.bulk_create(
        request.json.get('products', []),
        products_controller.required_fields
    )


@products_bp.route('/bulk', methods=['PUT'])
@require_admin
@handle_exceptions
def bulk_update_products():
    """Update multiple products"""
    return products_controller.bulk_update(
        request.json.get('products', []),
        products_controller.allowed_update_fields
    )


@products_bp.route('/bulk', methods=['DELETE'])
@require_admin
@handle_exceptions
def bulk_delete_products():
    """Delete multiple products"""
    return products_controller.bulk_delete(request.json.get('ids', []))
