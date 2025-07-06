from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_
from src.models.stock import (
    StockMovement, StockAlert, ProductBatch, InventoryCount, StockLocation, MovementType
)
from src.models.database import Product, Supplier, User, db
import json

stock_bp = Blueprint('stock', __name__)

# ===== STOCK MOVEMENTS =====

@stock_bp.route('/api/stock/movements', methods=['GET'])
def get_stock_movements():
    """Get all stock movements with filters"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        product_id = request.args.get('product_id', type=int)
        movement_type = request.args.get('movement_type')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        query = db.session.query(StockMovement)
        
        if product_id is not None:
            query = query.filter(StockMovement.product_id == product_id)
        if movement_type:
            query = query.filter(StockMovement.movement_type == movement_type)
        if date_from:
            query = query.filter(StockMovement.created_at >= date_from)
        if date_to:
            query = query.filter(StockMovement.created_at <= date_to)
        
        total = query.count()
        movements = query.order_by(StockMovement.created_at.desc()).offset((page-1)*per_page).limit(per_page).all()
        pages = (total + per_page - 1) // per_page
        
        return jsonify({
            'movements': [{
                'id': m.id,
                'product_id': m.product_id,
                'product_name': m.product.name if m.product else None,
                'movement_type': m.movement_type.value,
                'quantity': m.quantity,
                'unit_cost': m.unit_cost,
                'total_cost': m.total_cost,
                'batch_number': m.batch_number,
                'expiration_date': m.expiration_date.isoformat() if m.expiration_date else None,
                'location_from': m.location_from,
                'location_to': m.location_to,
                'supplier_id': m.supplier_id,
                'supplier_name': m.supplier.name if m.supplier else None,
                'order_id': m.order_id,
                'notes': m.notes,
                'created_at': m.created_at.isoformat(),
                'created_by': m.created_by
            } for m in movements],
            'total': total,
            'pages': pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/api/stock/movements', methods=['POST'])
def create_stock_movement():
    """Create a new stock movement"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['product_id', 'movement_type', 'quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Field {field} is required'}), 400
        
        # Create movement
        movement = StockMovement(
            product_id=data['product_id'],
            movement_type=MovementType(data['movement_type']),
            quantity=data['quantity'],
            unit_cost=data.get('unit_cost'),
            total_cost=data.get('total_cost'),
            batch_number=data.get('batch_number'),
            expiration_date=datetime.fromisoformat(data['expiration_date']) if data.get('expiration_date') else None,
            location_from=data.get('location_from'),
            location_to=data.get('location_to'),
            supplier_id=data.get('supplier_id'),
            order_id=data.get('order_id'),
            notes=data.get('notes'),
            created_by=data.get('created_by')
        )
        
        # Calculate total cost if not provided
        if movement.unit_cost and not movement.total_cost:
            movement.total_cost = movement.unit_cost * movement.quantity
        
        db.session.add(movement)
        
        # Update product stock
        product = Product.query.get(data['product_id'])
        if product:
            if movement.movement_type in [MovementType.ENTRY, MovementType.RETURN]:
                product.stock_quantity += movement.quantity
            elif movement.movement_type in [MovementType.EXIT, MovementType.LOSS]:
                product.stock_quantity -= movement.quantity
            elif movement.movement_type == MovementType.ADJUSTMENT:
                product.stock_quantity = movement.quantity
        
        db.session.commit()
        
        return jsonify({
            'message': 'Stock movement created successfully',
            'movement_id': movement.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===== STOCK ALERTS =====

@stock_bp.route('/api/stock/alerts', methods=['GET'])
def get_stock_alerts():
    """Get all stock alerts"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        alert_type = request.args.get('alert_type')
        is_active = request.args.get('is_active', type=bool)
        
        query = db.session.query(StockAlert)
        
        if alert_type:
            query = query.filter(StockAlert.alert_type == alert_type)
        if is_active is not None:
            query = query.filter(StockAlert.is_active == is_active)
        
        total = query.count()
        alerts = query.order_by(StockAlert.created_at.desc()).offset((page-1)*per_page).limit(per_page).all()
        pages = (total + per_page - 1) // per_page
        
        return jsonify({
            'alerts': [{
                'id': a.id,
                'product_id': a.product_id,
                'product_name': a.product.name if a.product else None,
                'alert_type': a.alert_type,
                'threshold': a.threshold,
                'current_value': a.current_value,
                'is_active': a.is_active,
                'message': a.message,
                'created_at': a.created_at.isoformat(),
                'resolved_at': a.resolved_at.isoformat() if a.resolved_at else None
            } for a in alerts],
            'total': total,
            'pages': pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/api/stock/alerts', methods=['POST'])
def create_stock_alert():
    """Create a new stock alert"""
    try:
        data = request.get_json()
        
        alert = StockAlert(
            product_id=data['product_id'],
            alert_type=data['alert_type'],
            threshold=data['threshold'],
            current_value=data['current_value'],
            message=data.get('message')
        )
        
        db.session.add(alert)
        db.session.commit()
        
        return jsonify({
            'message': 'Stock alert created successfully',
            'alert_id': alert.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/api/stock/alerts/<int:alert_id>/resolve', methods=['PUT'])
def resolve_stock_alert(alert_id):
    """Resolve a stock alert"""
    try:
        alert = StockAlert.query.get_or_404(alert_id)
        alert.is_active = False
        alert.resolved_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Alert resolved successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===== PRODUCT BATCHES =====

@stock_bp.route('/api/stock/batches', methods=['GET'])
def get_product_batches():
    """Get all product batches"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        product_id = request.args.get('product_id', type=int)
        status = request.args.get('status')
        
        query = db.session.query(ProductBatch)
        
        if product_id is not None:
            query = query.filter(ProductBatch.product_id == product_id)
        if status:
            query = query.filter(ProductBatch.status == status)
        
        total = query.count()
        batches = query.order_by(ProductBatch.created_at.desc()).offset((page-1)*per_page).limit(per_page).all()
        pages = (total + per_page - 1) // per_page
        
        return jsonify({
            'batches': [{
                'id': b.id,
                'product_id': b.product_id,
                'product_name': b.product.name if b.product else None,
                'batch_number': b.batch_number,
                'quantity': b.quantity,
                'remaining_quantity': b.remaining_quantity,
                'unit_cost': b.unit_cost,
                'supplier_id': b.supplier_id,
                'supplier_name': b.supplier.name if b.supplier else None,
                'production_date': b.production_date.isoformat() if b.production_date else None,
                'expiration_date': b.expiration_date.isoformat() if b.expiration_date else None,
                'location': b.location,
                'status': b.status,
                'created_at': b.created_at.isoformat()
            } for b in batches],
            'total': total,
            'pages': pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/api/stock/batches', methods=['POST'])
def create_product_batch():
    """Create a new product batch"""
    try:
        data = request.get_json()
        
        batch = ProductBatch(
            product_id=data['product_id'],
            batch_number=data['batch_number'],
            quantity=data['quantity'],
            remaining_quantity=data['quantity'],
            unit_cost=data['unit_cost'],
            supplier_id=data.get('supplier_id'),
            production_date=datetime.fromisoformat(data['production_date']) if data.get('production_date') else None,
            expiration_date=datetime.fromisoformat(data['expiration_date']) if data.get('expiration_date') else None,
            location=data.get('location')
        )
        
        db.session.add(batch)
        db.session.commit()
        
        return jsonify({
            'message': 'Product batch created successfully',
            'batch_id': batch.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===== INVENTORY COUNTS =====

@stock_bp.route('/api/stock/inventory-counts', methods=['GET'])
def get_inventory_counts():
    """Get all inventory counts"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        product_id = request.args.get('product_id', type=int)
        
        query = db.session.query(InventoryCount)
        
        if product_id is not None:
            query = query.filter(InventoryCount.product_id == product_id)
        
        total = query.count()
        counts = query.order_by(InventoryCount.count_date.desc()).offset((page-1)*per_page).limit(per_page).all()
        pages = (total + per_page - 1) // per_page
        
        return jsonify({
            'counts': [{
                'id': c.id,
                'product_id': c.product_id,
                'product_name': c.product.name if c.product else None,
                'expected_quantity': c.expected_quantity,
                'actual_quantity': c.actual_quantity,
                'difference': c.difference,
                'unit_cost': c.unit_cost,
                'total_difference_value': c.total_difference_value,
                'count_date': c.count_date.isoformat(),
                'notes': c.notes,
                'created_by': c.created_by
            } for c in counts],
            'total': total,
            'pages': pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/api/stock/inventory-counts', methods=['POST'])
def create_inventory_count():
    """Create a new inventory count"""
    try:
        data = request.get_json()
        
        difference = data['actual_quantity'] - data['expected_quantity']
        total_difference_value = difference * data.get('unit_cost', 0) if data.get('unit_cost') else None
        
        count = InventoryCount(
            product_id=data['product_id'],
            expected_quantity=data['expected_quantity'],
            actual_quantity=data['actual_quantity'],
            difference=difference,
            unit_cost=data.get('unit_cost'),
            total_difference_value=total_difference_value,
            notes=data.get('notes'),
            created_by=data.get('created_by')
        )
        
        db.session.add(count)
        
        # Update product stock
        product = Product.query.get(data['product_id'])
        if product:
            product.stock_quantity = data['actual_quantity']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Inventory count created successfully',
            'count_id': count.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===== STOCK LOCATIONS =====

@stock_bp.route('/api/stock/locations', methods=['GET'])
def get_stock_locations():
    """Get all stock locations"""
    try:
        locations = StockLocation.query.filter_by(is_active=True).all()
        
        return jsonify({
            'locations': [{
                'id': l.id,
                'name': l.name,
                'code': l.code,
                'address': l.address,
                'contact_person': l.contact_person,
                'phone': l.phone,
                'email': l.email,
                'is_active': l.is_active,
                'created_at': l.created_at.isoformat()
            } for l in locations]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/api/stock/locations', methods=['POST'])
def create_stock_location():
    """Create a new stock location"""
    try:
        data = request.get_json()
        
        location = StockLocation(
            name=data['name'],
            code=data['code'],
            address=data.get('address'),
            contact_person=data.get('contact_person'),
            phone=data.get('phone'),
            email=data.get('email')
        )
        
        db.session.add(location)
        db.session.commit()
        
        return jsonify({
            'message': 'Stock location created successfully',
            'location_id': location.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===== STOCK REPORTS =====

@stock_bp.route('/api/stock/reports/low-stock', methods=['GET'])
def get_low_stock_report():
    """Get products with low stock"""
    try:
        products = Product.query.filter(
            Product.stock_quantity <= 10  # Assuming reorder point is 10
        ).all()
        
        return jsonify({
            'low_stock_products': [{
                'id': p.id,
                'name': p.name,
                'current_stock': p.stock_quantity,
                'reorder_point': 10,
                'min_stock': 0,
                'supplier_id': None,
                'supplier_name': None
            } for p in products]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/api/stock/reports/expiring', methods=['GET'])
def get_expiring_products():
    """Get products expiring soon"""
    try:
        days = request.args.get('days', 30, type=int)
        cutoff_date = datetime.utcnow() + timedelta(days=days)
        
        batches = ProductBatch.query.filter(
            and_(
                ProductBatch.expiration_date <= cutoff_date,
                ProductBatch.expiration_date >= datetime.utcnow(),
                ProductBatch.status == 'active'
            )
        ).all()
        
        return jsonify({
            'expiring_products': [{
                'id': b.id,
                'product_id': b.product_id,
                'product_name': b.product.name if b.product else None,
                'batch_number': b.batch_number,
                'remaining_quantity': b.remaining_quantity,
                'expiration_date': b.expiration_date.isoformat() if b.expiration_date else None,
                'days_until_expiry': (b.expiration_date - datetime.utcnow()).days if b.expiration_date else None
            } for b in batches]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/api/stock/reports/movements', methods=['GET'])
def get_movements_report():
    """Get stock movements report"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        query = db.session.query(
            StockMovement.movement_type,
            func.sum(StockMovement.quantity).label('total_quantity'),
            func.sum(StockMovement.total_cost).label('total_cost'),
            func.count(StockMovement.id).label('movement_count')
        ).group_by(StockMovement.movement_type)
        
        if date_from:
            query = query.filter(StockMovement.created_at >= date_from)
        if date_to:
            query = query.filter(StockMovement.created_at <= date_to)
            
        results = query.all()
        
        return jsonify({
            'movements_summary': [{
                'movement_type': r.movement_type.value,
                'total_quantity': float(r.total_quantity) if r.total_quantity else 0,
                'total_cost': float(r.total_cost) if r.total_cost else 0,
                'movement_count': r.movement_count
            } for r in results]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stock_bp.route('/api/stock/reports/stock-value', methods=['GET'])
def get_stock_value_report():
    """Get total stock value report"""
    try:
        products = Product.query.filter(Product.stock_quantity > 0).all()
        
        total_value = 0
        products_value = []
        
        for product in products:
            # Get average cost from recent movements
            recent_movements = StockMovement.query.filter(
                and_(
                    StockMovement.product_id == product.id,
                    StockMovement.movement_type == MovementType.ENTRY,
                    StockMovement.unit_cost.isnot(None)
                )
            ).order_by(StockMovement.created_at.desc()).limit(10).all()
            
            if recent_movements:
                avg_cost = sum(m.unit_cost for m in recent_movements) / len(recent_movements)
                product_value = product.stock_quantity * avg_cost
                total_value += product_value
                
                products_value.append({
                    'product_id': product.id,
                    'product_name': product.name,
                    'current_stock': product.stock_quantity,
                    'average_cost': avg_cost,
                    'total_value': product_value
                })
        
        return jsonify({
            'total_stock_value': total_value,
            'products_value': products_value
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 