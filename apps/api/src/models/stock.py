from models.database import db
from enum import Enum
from datetime import datetime
import uuid

class MovementType(Enum):
    ENTRY = "entry"
    EXIT = "exit"
    RETURN = "return"
    LOSS = "loss"
    ADJUSTMENT = "adjustment"
    TRANSFER = "transfer"

class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    movement_type = db.Column(db.Enum(MovementType), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit_cost = db.Column(db.Float)
    total_cost = db.Column(db.Float)
    batch_number = db.Column(db.String(50))
    expiration_date = db.Column(db.DateTime)
    location_from = db.Column(db.String(100))
    location_to = db.Column(db.String(100))
    supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.id'))
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    
    # Relationships
    product = db.relationship('Product', backref='stock_movements')
    supplier = db.relationship('Supplier', backref='stock_movements')
    user = db.relationship('User', backref='stock_movements')

class StockAlert(db.Model):
    __tablename__ = 'stock_alerts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    alert_type = db.Column(db.String(50), nullable=False)  # low_stock, expiring, etc.
    threshold = db.Column(db.Float, nullable=False)
    current_value = db.Column(db.Float, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    
    # Relationships
    product = db.relationship('Product', backref='stock_alerts')

class ProductBatch(db.Model):
    __tablename__ = 'product_batches'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    batch_number = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    remaining_quantity = db.Column(db.Float, nullable=False)
    unit_cost = db.Column(db.Float, nullable=False)
    supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.id'))
    production_date = db.Column(db.DateTime)
    expiration_date = db.Column(db.DateTime)
    location = db.Column(db.String(100))
    status = db.Column(db.String(20), default='active')  # active, expired, consumed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    product = db.relationship('Product', backref='batches')
    supplier = db.relationship('Supplier', backref='product_batches')

class InventoryCount(db.Model):
    __tablename__ = 'inventory_counts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    expected_quantity = db.Column(db.Float, nullable=False)
    actual_quantity = db.Column(db.Float, nullable=False)
    difference = db.Column(db.Float, nullable=False)
    unit_cost = db.Column(db.Float)
    total_difference_value = db.Column(db.Float)
    count_date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    
    # Relationships
    product = db.relationship('Product', backref='inventory_counts')
    user = db.relationship('User', backref='inventory_counts')

class StockLocation(db.Model):
    __tablename__ = 'stock_locations'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    address = db.Column(db.Text)
    contact_person = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 