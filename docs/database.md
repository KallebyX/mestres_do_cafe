# 🗄️ Database - Guia do Desenvolvedor

Este documento fornece informações detalhadas sobre o banco de dados do Café Enterprise.

## 🏗️ Arquitetura do Banco

### Tecnologias Utilizadas
- **Produção**: PostgreSQL 15+
- **Desenvolvimento**: SQLite 3
- **Cache**: Redis 7+
- **ORM**: SQLAlchemy 2.0+
- **Migrações**: Alembic

### Configuração de Conexões

```python
# config/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configuração baseada no ambiente
if os.getenv('ENVIRONMENT') == 'production':
    DATABASE_URL = os.getenv('DATABASE_URL')
else:
    DATABASE_URL = 'sqlite:///./cafe.db'

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## 📊 Modelo de Dados

### Diagrama ER

```mermaid
erDiagram
    User {
        int id PK
        string name
        string email UK
        string password_hash
        string role
        datetime created_at
        datetime updated_at
        boolean is_active
    }
    
    Product {
        int id PK
        string name
        text description
        decimal price
        int weight
        string origin
        int sca_score
        json flavor_notes
        int stock_quantity
        int category_id FK
        datetime created_at
        datetime updated_at
    }
    
    Category {
        int id PK
        string name UK
        string slug UK
        text description
        datetime created_at
    }
    
    Cart {
        int id PK
        int user_id FK
        datetime created_at
        datetime updated_at
    }
    
    CartItem {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
        datetime created_at
    }
    
    Order {
        int id PK
        int user_id FK
        string status
        decimal total
        json shipping_address
        string payment_method
        string payment_status
        datetime created_at
        datetime updated_at
    }
    
    OrderItem {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
        datetime created_at
    }
    
    Review {
        int id PK
        int user_id FK
        int product_id FK
        int rating
        text comment
        datetime created_at
    }
    
    User ||--o{ Cart : has
    User ||--o{ Order : places
    User ||--o{ Review : writes
    Category ||--o{ Product : contains
    Product ||--o{ CartItem : "added to"
    Product ||--o{ OrderItem : "ordered as"
    Product ||--o{ Review : "reviewed in"
    Cart ||--o{ CartItem : contains
    Order ||--o{ OrderItem : contains
```

## 🔧 Modelos SQLAlchemy

### User Model
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

class UserRole(enum.Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cart = relationship("Cart", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")
```

### Product Model
```python
from sqlalchemy import Column, Integer, String, Text, DECIMAL, JSON, ForeignKey
from sqlalchemy.orm import relationship

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    price = Column(DECIMAL(10, 2), nullable=False)
    weight = Column(Integer, nullable=False)  # em gramas
    origin = Column(String(100))
    sca_score = Column(Integer)  # Score SCA (80-100)
    flavor_notes = Column(JSON)  # ["chocolate", "caramelo", "frutas"]
    stock_quantity = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("Category", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")
```

### Category Model
```python
class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    products = relationship("Product", back_populates="category")
```

### Cart & CartItem Models
```python
class Cart(Base):
    __tablename__ = "carts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")
```

### Order & OrderItem Models
```python
class OrderStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    total = Column(DECIMAL(10, 2), nullable=False)
    shipping_address = Column(JSON)
    payment_method = Column(String(50))
    payment_status = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)  # Preço no momento do pedido
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
```

### Review Model
```python
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
```

## 🔄 Migrações com Alembic

### Configuração Inicial

```bash
# Inicializar Alembic
alembic init alembic

# Configurar alembic.ini
sqlalchemy.url = sqlite:///./cafe.db
```

### Criando Migrações

```bash
# Criar nova migração
alembic revision --autogenerate -m "Create initial tables"

# Aplicar migrações
alembic upgrade head

# Reverter migração
alembic downgrade -1
```

### Exemplo de Migração

```python
# migrations/versions/001_create_initial_tables.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Criar tabela de usuários
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(100), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.Enum('admin', 'customer', name='userrole'), default='customer'),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now())
    )
    
    op.create_index('idx_users_email', 'users', ['email'], unique=True)

def downgrade():
    op.drop_index('idx_users_email')
    op.drop_table('users')
```

## 🚀 Queries Otimizadas

### Produtos com Paginação

```python
def get_products_paginated(db: Session, page: int = 1, per_page: int = 20):
    query = db.query(Product).options(joinedload(Product.category))
    
    total = query.count()
    products = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        'products': products,
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page
    }
```

### Carrinho com Itens

```python
def get_cart_with_items(db: Session, user_id: int):
    return db.query(Cart).options(
        joinedload(Cart.items).joinedload(CartItem.product)
    ).filter(Cart.user_id == user_id).first()
```

### Pedidos com Histórico

```python
def get_user_orders(db: Session, user_id: int):
    return db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
```

### Estatísticas do Dashboard

```python
def get_dashboard_stats(db: Session):
    total_users = db.query(User).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total)).scalar() or 0
    pending_orders = db.query(Order).filter(Order.status == OrderStatus.PENDING).count()
    
    return {
        'total_users': total_users,
        'total_orders': total_orders,
        'total_revenue': float(total_revenue),
        'pending_orders': pending_orders
    }
```

## 🔍 Índices e Performance

### Índices Importantes

```sql
-- Índices para otimização de queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### Queries Complexas

```python
# Produtos mais vendidos
def get_best_selling_products(db: Session, limit: int = 10):
    return db.query(
        Product.id,
        Product.name,
        func.sum(OrderItem.quantity).label('total_sold')
    ).join(OrderItem).group_by(Product.id).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(limit).all()

# Revenue por mês
def get_monthly_revenue(db: Session, year: int):
    return db.query(
        func.extract('month', Order.created_at).label('month'),
        func.sum(Order.total).label('revenue')
    ).filter(
        func.extract('year', Order.created_at) == year,
        Order.status == OrderStatus.DELIVERED
    ).group_by(func.extract('month', Order.created_at)).all()
```

## 📦 Seeders e Fixtures

### Dados Iniciais

```python
# scripts/seed_data.py
def seed_categories(db: Session):
    categories = [
        Category(name="Café Especial", slug="cafe-especial", description="Cafés de alta qualidade"),
        Category(name="Café Gourmet", slug="cafe-gourmet", description="Cafés premium"),
        Category(name="Equipamentos", slug="equipamentos", description="Equipamentos para café"),
        Category(name="Acessórios", slug="acessorios", description="Acessórios para café"),
    ]
    
    for category in categories:
        db.add(category)
    db.commit()

def seed_products(db: Session):
    products = [
        Product(
            name="Café Arábica Premium",
            description="Café especial de origem única",
            price=29.90,
            weight=250,
            origin="Minas Gerais",
            sca_score=85,
            flavor_notes=["chocolate", "caramelo", "frutas"],
            stock_quantity=50,
            category_id=1
        ),
        # ... mais produtos
    ]
    
    for product in products:
        db.add(product)
    db.commit()

def seed_admin_user(db: Session):
    admin = User(
        name="Admin",
        email="admin@cafe.com",
        password_hash=hash_password("admin123"),
        role=UserRole.ADMIN
    )
    db.add(admin)
    db.commit()
```

## 🧪 Testes de Banco

### Configuração de Teste

```python
# tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base

@pytest.fixture
def db_session():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    yield session
    
    session.close()
```

### Testes de Modelo

```python
# tests/test_models.py
def test_create_user(db_session):
    user = User(
        name="Test User",
        email="test@example.com",
        password_hash="hashed_password"
    )
    db_session.add(user)
    db_session.commit()
    
    assert user.id is not None
    assert user.role == UserRole.CUSTOMER
    assert user.is_active is True

def test_create_product(db_session):
    category = Category(name="Test Category", slug="test-category")
    db_session.add(category)
    db_session.commit()
    
    product = Product(
        name="Test Product",
        price=19.99,
        weight=250,
        category_id=category.id
    )
    db_session.add(product)
    db_session.commit()
    
    assert product.id is not None
    assert product.category.name == "Test Category"
```

## 🔐 Segurança

### Configurações de Segurança

```python
# Configurações de conexão segura
DATABASE_URL = "postgresql://user:password@localhost:5432/cafe?sslmode=require"

# Pool de conexões
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    echo=False  # Não mostrar SQL em produção
)
```

### Backup e Restore

```bash
# Backup PostgreSQL
pg_dump -h localhost -U user -d cafe > backup.sql

# Restore PostgreSQL
psql -h localhost -U user -d cafe < backup.sql

# Backup automatizado
0 2 * * * pg_dump -h localhost -U user -d cafe | gzip > /backups/cafe_$(date +\%Y\%m\%d).sql.gz
```

## 📊 Monitoramento

### Métricas de Performance

```python
# Middleware para logging de queries
import time
from sqlalchemy import event

@event.listens_for(engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.time()

@event.listens_for(engine, "after_cursor_execute")
def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - context._query_start_time
    if total > 0.1:  # Log queries que demoram mais de 100ms
        logger.warning(f"Slow query: {total:.2f}s - {statement[:100]}...")
```

### Health Check

```python
def check_database_health(db: Session):
    try:
        db.execute("SELECT 1")
        return {"status": "healthy", "timestamp": datetime.utcnow()}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

---

Para mais informações sobre queries específicas, consulte os arquivos de modelo em [`apps/api/src/models/`](../apps/api/src/models/).