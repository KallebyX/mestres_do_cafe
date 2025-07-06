# 🗄️ Especificações de Database - Mestres Café Enterprise

## Visão Geral

Este documento contém todas as especificações detalhadas do banco de dados do sistema Mestres Café Enterprise, incluindo schema DDL completo, índices, constraints, procedures e views.

## 1. Configuração do PostgreSQL

### Configurações de Performance

```sql
-- postgresql.conf
# Memory Settings
shared_buffers = 256MB                    # 25% da RAM disponível
effective_cache_size = 1GB                # 75% da RAM disponível
work_mem = 4MB                            # Para operações de ordenação
maintenance_work_mem = 64MB               # Para operações de manutenção
wal_buffers = 16MB                        # Buffers para WAL

# Checkpoint Settings
checkpoint_completion_target = 0.9        # Distribuir checkpoint I/O
checkpoint_timeout = 5min                 # Intervalo entre checkpoints
max_wal_size = 4GB                       # Tamanho máximo dos WAL files
min_wal_size = 1GB                       # Tamanho mínimo dos WAL files

# Query Planning
default_statistics_target = 100          # Estatísticas para planner
random_page_cost = 1.1                   # Para SSDs
effective_io_concurrency = 200           # Para storage rápido

# Connection Settings
max_connections = 200                     # Máximo de conexões
shared_preload_libraries = 'pg_stat_statements'  # Extensões

# Logging
log_statement = 'mod'                     # Log DDL/DML statements
log_min_duration_statement = 1000        # Log queries > 1s
log_checkpoints = on                      # Log checkpoints
log_connections = on                      # Log connections
log_disconnections = on                   # Log disconnections
```

### Extensões Requeridas

```sql
-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
```

## 2. Schema DDL Completo

### Core User Management

```sql
-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de associação usuário-role
CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- Inserir roles padrão
INSERT INTO roles (name, description, permissions) VALUES
('super_admin', 'Super Administrador', '["*"]'),
('admin', 'Administrador', '["users:*", "products:*", "orders:*", "reports:read"]'),
('manager', 'Gerente', '["products:read", "orders:*", "reports:read"]'),
('employee', 'Funcionário', '["orders:read", "orders:update", "customers:read"]'),
('customer', 'Cliente', '["profile:*", "orders:own", "cart:*"]');
```

### Product Catalog

```sql
-- Categorias de produtos
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Produtos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    detailed_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(50),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    category_id INTEGER REFERENCES categories(id),
    brand VARCHAR(100),
    weight DECIMAL(8,3),
    dimensions JSONB,
    attributes JSONB DEFAULT '{}',
    specifications JSONB DEFAULT '{}',
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(500),
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Imagens de produtos
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    file_size INTEGER,
    mime_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Variações de produtos
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    attributes JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Shopping Cart & Orders

```sql
-- Carrinho de compras
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cart_user_or_session CHECK (
        (user_id IS NOT NULL AND session_id IS NULL) OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    )
);

CREATE TRIGGER update_carts_updated_at 
    BEFORE UPDATE ON carts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Itens do carrinho
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id, variant_id)
);

-- Pedidos
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'pending_payment', 'paid', 'processing', 
        'shipped', 'delivered', 'cancelled', 'refunded'
    )),
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Endereços em JSONB para flexibilidade
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    
    -- Informações de entrega
    shipping_method VARCHAR(50),
    tracking_code VARCHAR(100),
    estimated_delivery DATE,
    delivered_at TIMESTAMP,
    
    -- Cupons e promoções
    coupon_code VARCHAR(50),
    coupon_discount DECIMAL(10,2) DEFAULT 0,
    
    -- Observações
    notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar número do pedido
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'MST-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                       LPAD(NEW.id::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Itens do pedido
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    variant_id INTEGER REFERENCES product_variants(id),
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_attributes JSONB DEFAULT '{}'
);
```

### Payment System

```sql
-- Métodos de pagamento salvos
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit_card', 'debit_card', 'pix', 'bank_transfer')),
    provider VARCHAR(50) NOT NULL,
    token VARCHAR(255) NOT NULL,
    last_four_digits VARCHAR(4),
    brand VARCHAR(20),
    expires_at DATE,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pagamentos
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    payment_method_id INTEGER REFERENCES payment_methods(id),
    gateway_provider VARCHAR(50) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    payment_type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    installments INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded'
    )),
    gateway_response JSONB,
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### Inventory Management

```sql
-- Depósitos/Armazéns
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address JSONB NOT NULL,
    manager_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estoque por depósito
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    current_stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    reorder_point INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    last_count_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, variant_id, warehouse_id)
);

-- Movimentações de estoque
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN (
        'purchase', 'sale', 'adjustment', 'transfer', 'return', 'loss'
    )),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    reference_type VARCHAR(20),
    reference_id INTEGER,
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fornecedores
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB,
    tax_id VARCHAR(20),
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Pedidos de compra
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INTEGER REFERENCES suppliers(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled'
    )),
    total_amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'BRL',
    order_date DATE DEFAULT CURRENT_DATE,
    expected_date DATE,
    received_date DATE,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_purchase_orders_updated_at 
    BEFORE UPDATE ON purchase_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Itens do pedido de compra
CREATE TABLE purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    variant_id INTEGER REFERENCES product_variants(id),
    ordered_quantity INTEGER NOT NULL CHECK (ordered_quantity > 0),
    received_quantity INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (ordered_quantity * unit_cost) STORED
);
```

### Customer Relationship Management

```sql
-- Informações estendidas do cliente
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    customer_type VARCHAR(20) DEFAULT 'individual' CHECK (customer_type IN ('individual', 'corporate')),
    company_name VARCHAR(255),
    tax_id VARCHAR(20),
    customer_group VARCHAR(50),
    credit_limit DECIMAL(10,2) DEFAULT 0,
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    first_purchase_date DATE,
    last_purchase_date DATE,
    loyalty_points INTEGER DEFAULT 0,
    referral_code VARCHAR(20) UNIQUE,
    referred_by VARCHAR(20),
    acquisition_source VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Endereços dos clientes
CREATE TABLE customer_addresses (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing', 'both')),
    label VARCHAR(50),
    recipient_name VARCHAR(255),
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) DEFAULT 'BR',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_customer_addresses_updated_at 
    BEFORE UPDATE ON customer_addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Leads
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    company VARCHAR(255),
    source VARCHAR(50),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN (
        'new', 'contacted', 'qualified', 'proposal', 'negotiation', 
        'won', 'lost', 'unqualified'
    )),
    score INTEGER DEFAULT 0,
    custom_fields JSONB DEFAULT '{}',
    notes TEXT,
    assigned_to INTEGER REFERENCES users(id),
    converted_to_customer_id INTEGER REFERENCES customers(id),
    last_contacted_at TIMESTAMP,
    converted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Interações com clientes
CREATE TABLE customer_interactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN (
        'call', 'email', 'meeting', 'chat', 'note', 'task'
    )),
    channel VARCHAR(20) CHECK (channel IN (
        'phone', 'email', 'whatsapp', 'chat', 'in_person', 'video_call'
    )),
    subject VARCHAR(255),
    content TEXT,
    outcome VARCHAR(50),
    next_action VARCHAR(255),
    next_action_date DATE,
    staff_id INTEGER REFERENCES users(id),
    interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_or_lead CHECK (
        (customer_id IS NOT NULL AND lead_id IS NULL) OR 
        (customer_id IS NULL AND lead_id IS NOT NULL)
    )
);
```

### Content Management

```sql
-- Categorias do blog
CREATE TABLE blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES blog_categories(id),
    sort_order INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts do blog
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    author_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES blog_categories(id),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(500),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tags do blog
CREATE TABLE blog_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#007bff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relacionamento post-tag
CREATE TABLE blog_post_tags (
    post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Comentários do blog
CREATE TABLE blog_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES blog_comments(id),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_blog_comments_updated_at 
    BEFORE UPDATE ON blog_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 3. Índices de Performance

### Índices Principais

```sql
-- Índices únicos (já criados automaticamente)
-- users(email), products(slug), orders(order_number), etc.

-- Índices de chave estrangeira
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse_id ON inventory(warehouse_id);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX idx_blog_comments_post_id ON blog_comments(post_id);

-- Índices compostos para queries frequentes
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_products_active_featured ON products(is_active, is_featured);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
CREATE INDEX idx_cart_items_cart_product ON cart_items(cart_id, product_id);
CREATE INDEX idx_inventory_product_warehouse ON inventory(product_id, warehouse_id);
CREATE INDEX idx_stock_movements_product_date ON stock_movements(product_id, created_at);
CREATE INDEX idx_blog_posts_status_published ON blog_posts(status, published_at);

-- Índices parciais para performance
CREATE INDEX idx_orders_pending ON orders(created_at) WHERE status = 'pending';
CREATE INDEX idx_orders_processing ON orders(created_at) WHERE status IN ('paid', 'processing');
CREATE INDEX idx_products_active ON products(id) WHERE is_active = true;
CREATE INDEX idx_products_featured ON products(id) WHERE is_featured = true;
CREATE INDEX idx_users_active ON users(id) WHERE is_active = true;
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at) WHERE status = 'published';

-- Índices para ordenação
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_orders_created_at_desc ON orders(created_at DESC);
CREATE INDEX idx_blog_posts_published_at_desc ON blog_posts(published_at DESC);

-- Índices para busca full-text
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_blog_posts_search ON blog_posts USING gin(to_tsvector('portuguese', title || ' ' || content));
CREATE INDEX idx_customers_search ON customers USING gin(to_tsvector('portuguese', COALESCE(company_name, '') || ' ' || COALESCE((SELECT full_name FROM users WHERE id = user_id), '')));

-- Índices trigram para busca aproximada
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_users_name_trgm ON users USING gin(full_name gin_trgm_ops);
```

### Índices para Analytics

```sql
-- Índices para relatórios e analytics
CREATE INDEX idx_orders_analytics ON orders(created_at, status, total_amount);
CREATE INDEX idx_order_items_analytics ON order_items(product_id, quantity, total_price);
CREATE INDEX idx_products_analytics ON products(category_id, sales_count, rating_average);
CREATE INDEX idx_payments_analytics ON payments(created_at, status, amount);
CREATE INDEX idx_stock_movements_analytics ON stock_movements(created_at, movement_type, product_id);

-- Índices para dashboards em tempo real
CREATE INDEX idx_orders_today ON orders(created_at) WHERE created_at >= CURRENT_DATE;
CREATE INDEX idx_payments_today ON payments(created_at) WHERE created_at >= CURRENT_DATE;
CREATE INDEX idx_users_today ON users(created_at) WHERE created_at >= CURRENT_DATE;
```

## 4. Views Materializadas

### View de Produtos com Informações Completas

```sql
CREATE MATERIALIZED VIEW mv_products_full AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.original_price,
    p.sku,
    p.stock_quantity,
    p.rating_average,
    p.rating_count,
    p.sales_count,
    p.is_featured,
    p.is_active,
    c.name as category_name,
    c.slug as category_slug,
    (
        SELECT json_agg(
            json_build_object(
                'id', pi.id,
                'url', pi.url,
                'thumbnail_url', pi.thumbnail_url,
                'alt_text', pi.alt_text,
                'is_primary', pi.is_primary
            ) ORDER BY pi.sort_order, pi.is_primary DESC
        )
        FROM product_images pi 
        WHERE pi.product_id = p.id
    ) as images,
    (
        SELECT SUM(i.available_stock)
        FROM inventory i
        WHERE i.product_id = p.id
    ) as total_stock,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

-- Índices para a view materializada
CREATE UNIQUE INDEX idx_mv_products_full_id ON mv_products_full(id);
CREATE INDEX idx_mv_products_full_category ON mv_products_full(category_slug);
CREATE INDEX idx_mv_products_full_featured ON mv_products_full(is_featured);
CREATE INDEX idx_mv_products_full_price ON mv_products_full(price);
CREATE INDEX idx_mv_products_full_rating ON mv_products_full(rating_average);
CREATE INDEX idx_mv_products_full_search ON mv_products_full USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));

-- Refresh automático
CREATE OR REPLACE FUNCTION refresh_mv_products_full()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_products_full;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_mv_products_full_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_mv_products_full();
```

### View de Relatório de Vendas

```sql
CREATE MATERIALIZED VIEW mv_sales_report AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_revenue,
    AVG(o.total_amount) as average_order_value,
    COUNT(DISTINCT o.user_id) as unique_customers,
    SUM(oi.quantity) as total_items_sold,
    p.category_id,
    c.name as category_name
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN categories c ON p.category_id = c.id
WHERE o.status IN ('paid', 'processing', 'shipped', 'delivered')
GROUP BY DATE(o.created_at), p.category_id, c.name
ORDER BY sale_date DESC, total_revenue DESC;

-- Índices para relatórios
CREATE INDEX idx_mv_sales_report_date ON mv_sales_report(sale_date);
CREATE INDEX idx_mv_sales_report_category ON mv_sales_report(category_id);
CREATE INDEX idx_mv_sales_report_revenue ON mv_sales_report(total_revenue);
```

## 5. Procedures e Functions

### Função para Atualização de Estoque

```sql
CREATE OR REPLACE FUNCTION update_product_stock(
    p_product_id INTEGER,
    p_warehouse_id INTEGER,
    p_quantity INTEGER,
    p_movement_type VARCHAR(20),
    p_reference_type VARCHAR(20) DEFAULT NULL,
    p_reference_id INTEGER DEFAULT NULL,
    p_user_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
    new_stock INTEGER;
BEGIN
    -- Verificar se o produto existe
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
        RAISE EXCEPTION 'Produto não encontrado: %', p_product_id;
    END IF;
    
    -- Verificar se o depósito existe
    IF NOT EXISTS (SELECT 1 FROM warehouses WHERE id = p_warehouse_id) THEN
        RAISE EXCEPTION 'Depósito não encontrado: %', p_warehouse_id;
    END IF;
    
    -- Obter estoque atual
    SELECT current_stock INTO current_stock
    FROM inventory
    WHERE product_id = p_product_id AND warehouse_id = p_warehouse_id;
    
    -- Se não existe registro de estoque, criar um
    IF current_stock IS NULL THEN
        INSERT INTO inventory (product_id, warehouse_id, current_stock)
        VALUES (p_product_id, p_warehouse_id, 0);
        current_stock := 0;
    END IF;
    
    -- Calcular novo estoque
    IF p_movement_type IN ('purchase', 'return', 'adjustment_positive') THEN
        new_stock := current_stock + p_quantity;
    ELSIF p_movement_type IN ('sale', 'loss', 'adjustment_negative') THEN
        new_stock := current_stock - p_quantity;
        -- Verificar se não ficará negativo
        IF new_stock < 0 THEN
            RAISE EXCEPTION 'Estoque insuficiente. Atual: %, Tentativa: %', current_stock, p_quantity;
        END IF;
    ELSE
        RAISE EXCEPTION 'Tipo de movimentação inválido: %', p_movement_type;
    END IF;
    
    -- Atualizar estoque
    UPDATE inventory
    SET current_stock = new_stock, last_updated = CURRENT_TIMESTAMP
    WHERE product_id = p_product_id AND warehouse_id = p_warehouse_id;
    
    -- Registrar movimentação
    INSERT INTO stock_movements (
        product_id, warehouse_id, movement_type, quantity, 
        reference_type, reference_id, user_id
    ) VALUES (
        p_product_id, p_warehouse_id, p_movement_type, p_quantity,
        p_reference_type, p_reference_id, p_user_id
    );
    
    -- Atualizar estoque total do produto
    UPDATE products
    SET stock_quantity = (
        SELECT COALESCE(SUM(current_stock), 0)
        FROM inventory
        WHERE product_id = p_product_id
    )
    WHERE id = p_product_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### Função para Cálculo de Preço com Desconto

```sql
CREATE OR REPLACE FUNCTION calculate_discounted_price(
    p_original_price DECIMAL(10,2),
    p_coupon_code VARCHAR(50) DEFAULT NULL,
    p_customer_id INTEGER DEFAULT NULL
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    final_price DECIMAL(10,2);
    discount_amount DECIMAL(10,2) := 0;
    coupon_record RECORD;
    customer_discount DECIMAL(5,2) := 0;
BEGIN
    final_price := p_original_price;
    
    -- Aplicar desconto de cupom se fornecido
    IF p_coupon_code IS NOT NULL THEN
        SELECT * INTO coupon_record
        FROM discount_coupons
        WHERE code = p_coupon_code
        AND is_active = true
        AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
        AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
        AND (usage_limit IS NULL OR used_count < usage_limit);
        
        IF FOUND THEN
            IF coupon_record.type = 'percentage' THEN
                discount_amount := p_original_price * (coupon_record.value / 100);
            ELSIF coupon_record.type = 'fixed' THEN
                discount_amount := coupon_record.value;
            END IF;
            
            -- Aplicar desconto mínimo se especificado
            IF coupon_record.minimum_amount IS NOT NULL AND p_original_price < coupon_record.minimum_amount THEN
                discount_amount := 0;
            END IF;
        END IF;
    END IF;
    
    -- Aplicar desconto de cliente VIP (exemplo)
    IF p_customer_id IS NOT NULL THEN
        SELECT CASE 
            WHEN c.total_spent >= 10000 THEN 0.15  -- 15% para clientes VIP
            WHEN c.total_spent >= 5000 THEN 0.10   -- 10% para clientes premium
            WHEN c.total_spent >= 1000 THEN 0.05   -- 5% para clientes frequentes
            ELSE 0
        END INTO customer_discount
        FROM customers c
        WHERE id = p_customer_id;
        
        IF customer_discount > 0 THEN
            discount_amount := discount_amount + (p_original_price * customer_discount);
        END IF;
    END IF;
    
    final_price := p_original_price - discount_amount;
    
    -- Garantir que o preço não seja negativo
    IF final_price < 0 THEN
        final_price := 0;
    END IF;
    
    RETURN final_price;
END;
$$ LANGUAGE plpgsql;
```

### Procedure para Processamento de Pedido

```sql
CREATE OR REPLACE FUNCTION process_order(p_order_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    order_record RECORD;
    item_record RECORD;
    warehouse_id INTEGER := 1; -- Depósito principal
BEGIN
    -- Buscar o pedido
    SELECT * INTO order_record FROM orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido não encontrado: %', p_order_id;
    END IF;
    
    IF order_record.status != 'paid' THEN
        RAISE EXCEPTION 'Pedido deve estar pago para ser processado: %', p_order_id;
    END IF;
    
    -- Processar cada item do pedido
    FOR item_record IN 
        SELECT * FROM order_items WHERE order_id = p_order_id
    LOOP
        -- Reduzir estoque
        PERFORM update_product_stock(
            item_record.product_id,
            warehouse_id,
            item_record.quantity,
            'sale',
            'order',
            p_order_id,
            order_record.user_id
        );
        
        -- Atualizar contador de vendas do produto
        UPDATE products
        SET sales_count = sales_count + item_record.quantity
        WHERE id = item_record.product_id;
    END LOOP;
    
    -- Atualizar status do pedido
    UPDATE orders
    SET status = 'processing',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_order_id;
    
    -- Atualizar estatísticas do cliente
    UPDATE customers
    SET total_orders = total_orders + 1,
        total_spent = total_spent + order_record.total_amount,
        last_purchase_date = CURRENT_DATE,
        lifetime_value = total_spent + order_record.total_amount
    WHERE user_id = order_record.user_id;
    
    -- Calcular novo valor médio do pedido
    UPDATE customers
    SET average_order_value = total_spent / NULLIF(total_orders, 0)
    WHERE user_id = order_record.user_id;
    
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao processar pedido %: %', p_order_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

## 6. Constraints e Validações

### Constraints de Integridade

```sql
-- Constraint para garantir que o preço seja positivo
ALTER TABLE products ADD CONSTRAINT chk_products_price_positive 
    CHECK (price > 0);

-- Constraint para garantir que a quantidade seja positiva
ALTER TABLE cart_items ADD CONSTRAINT chk_cart_items_quantity_positive 
    CHECK (quantity > 0);

ALTER TABLE order_items ADD CONSTRAINT chk_order_items_quantity_positive 
    CHECK (quantity > 0);

-- Constraint para garantir que o total do pedido seja consistente
ALTER TABLE orders ADD CONSTRAINT chk_orders_total_positive 
    CHECK (total_amount >= 0);

-- Constraint para garantir datas válidas
ALTER TABLE orders ADD CONSTRAINT chk_orders_delivery_after_creation 
    CHECK (estimated_delivery IS NULL OR estimated_delivery >= DATE(created_at));

-- Constraint para garantir que apenas um endereço seja padrão por cliente
CREATE UNIQUE INDEX idx_customer_addresses_default_unique 
    ON customer_addresses(customer_id) 
    WHERE is_default = true;

-- Constraint para garantir que apenas uma imagem seja principal por produto
CREATE UNIQUE INDEX idx_product_images_primary_unique 
    ON product_images(product_id) 
    WHERE is_primary = true;

-- Constraint para garantir que estoque não seja negativo
ALTER TABLE inventory ADD CONSTRAINT chk_inventory_stock_non_negative 
    CHECK (current_stock >= 0 AND reserved_stock >= 0);
```

### Triggers de Validação

```sql
-- Trigger para validar email único ignorando case
CREATE OR REPLACE FUNCTION validate_unique_email()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE LOWER(email) = LOWER(NEW.email) 
        AND id != COALESCE(NEW.id, 0)
    ) THEN
        RAISE EXCEPTION 'Email já está em uso: %', NEW.email;
    END IF;
    
    -- Normalizar email para lowercase
    NEW.email := LOWER(NEW.email);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_unique_email_trigger
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_unique_email();

-- Trigger para atualizar contador de comentários no post
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_posts 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE blog_posts 
        SET comment_count = comment_count - 1 
        WHERE id = OLD.post_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comment_count_trigger
    AFTER INSERT OR DELETE ON blog_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comment_count();
```

## 7. Backup e Manutenção

### Script de Backup Automatizado

```sql
-- Função para criar backup
CREATE OR REPLACE FUNCTION create_backup()
RETURNS TEXT AS $$
DECLARE
    backup_name TEXT;
    backup_path TEXT;
BEGIN
    backup_name := 'mestres_cafe_' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYY_MM_DD_HH24_MI_SS');
    backup_path := '/var/lib/postgresql/backups/' || backup_name || '.sql';
    
    -- Este comando seria executado fora do PostgreSQL
    -- pg_dump mestres_cafe > backup_path
    
    RETURN backup_path;
END;
$$ LANGUAGE plpgsql;

-- Procedure para limpeza de dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- Remover carrinho abandonados há mais de 30 dias
    DELETE FROM carts 
    WHERE updated_at < CURRENT_DATE - INTERVAL '30 days'
    AND user_id IS NULL;
    
    -- Arquivar pedidos antigos (mais de 2 anos)
    UPDATE orders 
    SET status = 'archived'
    WHERE created_at < CURRENT_DATE - INTERVAL '2 years'
    AND status IN ('delivered', 'cancelled');
    
    -- Remover logs de movimentação de estoque antigos (mais de 1 ano)
    DELETE FROM stock_movements
    WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
    
    -- Limpar tokens de verificação expirados
    UPDATE users 
    SET verification_token = NULL,
        reset_password_token = NULL
    WHERE reset_password_expires < CURRENT_TIMESTAMP;
    
    RAISE NOTICE 'Limpeza de dados concluída em %', CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
```

### Monitoramento de Performance

```sql
-- View para monitorar queries lentas
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY mean_time DESC;

-- View para monitorar tamanho das tabelas
CREATE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs,
    histogram_bounds
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Função para reindexar automaticamente
CREATE OR REPLACE FUNCTION reindex_if_needed()
RETURNS VOID AS $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename IN ('products', 'orders', 'users', 'inventory')
    LOOP
        EXECUTE 'REINDEX TABLE ' || table_record.tablename;
        RAISE NOTICE 'Reindexed table: %', table_record.tablename;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## Conclusão

Esta documentação de especificações de banco de dados fornece uma referência completa para o sistema Mestres Café Enterprise, incluindo:

- **Schema DDL completo** com todas as tabelas e relacionamentos
- **Índices otimizados** para performance em queries frequentes
- **Views materializadas** para relatórios e analytics
- **Procedures e functions** para operações complexas
- **Constraints e validações** para integridade dos dados
- **Scripts de backup** e manutenção automatizada

O banco de dados foi projetado para alta performance, escalabilidade e integridade, suportando todas as funcionalidades do sistema e-commerce, ERP e CRM.