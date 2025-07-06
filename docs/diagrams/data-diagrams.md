# 🗄️ Diagramas de Dados - Mestres Café Enterprise

## Visão Geral

Esta seção contém todos os diagramas relacionados à arquitetura de dados do sistema Mestres Café Enterprise, incluindo modelo entidade-relacionamento, diagramas de classes e estruturas de índices.

## 1. Modelo Entidade-Relacionamento (ERD)

### Core E-commerce Entities

```mermaid
erDiagram
    USERS {
        int id PK
        string email UK
        string password_hash
        string full_name
        string phone
        datetime created_at
        datetime updated_at
        boolean is_active
        boolean is_verified
        string verification_token
    }

    PRODUCTS {
        int id PK
        string name
        string slug UK
        text description
        decimal price
        decimal cost_price
        string sku UK
        int stock_quantity
        int category_id FK
        string brand
        json attributes
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    CATEGORIES {
        int id PK
        string name
        string slug UK
        text description
        int parent_id FK
        int sort_order
        boolean is_active
        datetime created_at
    }

    CARTS {
        int id PK
        int user_id FK
        string session_id
        datetime created_at
        datetime updated_at
    }

    CART_ITEMS {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
        decimal unit_price
        datetime added_at
    }

    ORDERS {
        int id PK
        string order_number UK
        int user_id FK
        decimal subtotal
        decimal tax_amount
        decimal shipping_amount
        decimal discount_amount
        decimal total_amount
        string status
        json shipping_address
        json billing_address
        datetime created_at
        datetime updated_at
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
        decimal total_price
        string product_name
        json product_attributes
    }

    USERS ||--o{ CARTS : owns
    USERS ||--o{ ORDERS : places
    CATEGORIES ||--o{ CATEGORIES : "parent-child"
    CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--o{ CART_ITEMS : "added to"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered as"
    CARTS ||--o{ CART_ITEMS : contains
    ORDERS ||--o{ ORDER_ITEMS : contains
```

### Payment and Financial Entities

```mermaid
erDiagram
    PAYMENTS {
        int id PK
        int order_id FK
        string payment_method
        string gateway_provider
        string gateway_transaction_id
        decimal amount
        string currency
        string status
        json gateway_response
        datetime created_at
        datetime updated_at
    }

    PAYMENT_METHODS {
        int id PK
        int user_id FK
        string type
        string provider
        json encrypted_data
        boolean is_default
        datetime created_at
        datetime expires_at
    }

    FINANCIAL_TRANSACTIONS {
        int id PK
        int order_id FK
        int payment_id FK
        string transaction_type
        decimal amount
        string currency
        string description
        string reference_number
        datetime transaction_date
        datetime created_at
    }

    DISCOUNT_COUPONS {
        int id PK
        string code UK
        string type
        decimal value
        decimal minimum_amount
        int usage_limit
        int used_count
        datetime valid_from
        datetime valid_until
        boolean is_active
        datetime created_at
    }

    COUPON_USAGE {
        int id PK
        int coupon_id FK
        int order_id FK
        int user_id FK
        decimal discount_amount
        datetime used_at
    }

    ORDERS ||--o{ PAYMENTS : "paid by"
    USERS ||--o{ PAYMENT_METHODS : owns
    ORDERS ||--o{ FINANCIAL_TRANSACTIONS : generates
    PAYMENTS ||--o{ FINANCIAL_TRANSACTIONS : creates
    ORDERS ||--o{ COUPON_USAGE : uses
    DISCOUNT_COUPONS ||--o{ COUPON_USAGE : "used in"
```

### Inventory and Stock Management

```mermaid
erDiagram
    INVENTORY {
        int id PK
        int product_id FK
        int warehouse_id FK
        int current_stock
        int reserved_stock
        int reorder_point
        int max_stock_level
        datetime last_updated
    }

    WAREHOUSES {
        int id PK
        string name
        string code UK
        json address
        string manager_name
        string contact_phone
        boolean is_active
        datetime created_at
    }

    STOCK_MOVEMENTS {
        int id PK
        int product_id FK
        int warehouse_id FK
        string movement_type
        int quantity
        string reference_type
        int reference_id
        string notes
        int user_id FK
        datetime created_at
    }

    SUPPLIERS {
        int id PK
        string name
        string code UK
        string contact_name
        string email
        string phone
        json address
        string payment_terms
        boolean is_active
        datetime created_at
    }

    PURCHASE_ORDERS {
        int id PK
        string po_number UK
        int supplier_id FK
        decimal total_amount
        string status
        datetime order_date
        datetime expected_date
        datetime received_date
        string notes
        datetime created_at
    }

    PURCHASE_ORDER_ITEMS {
        int id PK
        int purchase_order_id FK
        int product_id FK
        int ordered_quantity
        int received_quantity
        decimal unit_cost
        decimal total_cost
    }

    PRODUCTS ||--o{ INVENTORY : "stocked in"
    WAREHOUSES ||--o{ INVENTORY : stores
    INVENTORY ||--o{ STOCK_MOVEMENTS : tracks
    SUPPLIERS ||--o{ PURCHASE_ORDERS : receives
    PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_ITEMS : contains
    PRODUCTS ||--o{ PURCHASE_ORDER_ITEMS : "purchased as"
```

### Customer Relationship Management (CRM)

```mermaid
erDiagram
    CUSTOMERS {
        int id PK
        int user_id FK
        string customer_type
        string company_name
        string tax_id
        date birth_date
        string gender
        json preferences
        decimal lifetime_value
        int loyalty_points
        datetime last_purchase
        datetime created_at
    }

    LEADS {
        int id PK
        string email
        string name
        string phone
        string source
        string status
        json custom_fields
        int assigned_to FK
        datetime contacted_at
        datetime converted_at
        datetime created_at
    }

    CAMPAIGNS {
        int id PK
        string name
        string type
        string status
        json target_criteria
        datetime start_date
        datetime end_date
        decimal budget
        json performance_metrics
        datetime created_at
    }

    CAMPAIGN_CONTACTS {
        int id PK
        int campaign_id FK
        int customer_id FK
        string contact_method
        string status
        datetime sent_at
        datetime opened_at
        datetime clicked_at
    }

    CUSTOMER_INTERACTIONS {
        int id PK
        int customer_id FK
        string interaction_type
        string channel
        string subject
        text content
        int staff_id FK
        datetime interaction_date
        datetime created_at
    }

    LOYALTY_PROGRAMS {
        int id PK
        string name
        string type
        json rules
        int points_per_currency
        decimal currency_per_point
        boolean is_active
        datetime created_at
    }

    LOYALTY_TRANSACTIONS {
        int id PK
        int customer_id FK
        int program_id FK
        string transaction_type
        int points
        decimal amount
        string description
        int order_id FK
        datetime transaction_date
    }

    USERS ||--|| CUSTOMERS : "is a"
    USERS ||--o{ LEADS : "assigned to"
    CUSTOMERS ||--o{ CAMPAIGN_CONTACTS : "targeted by"
    CAMPAIGNS ||--o{ CAMPAIGN_CONTACTS : includes
    CUSTOMERS ||--o{ CUSTOMER_INTERACTIONS : has
    CUSTOMERS ||--o{ LOYALTY_TRANSACTIONS : earns
    LOYALTY_PROGRAMS ||--o{ LOYALTY_TRANSACTIONS : governs
```

### Content Management and Blog

```mermaid
erDiagram
    BLOG_POSTS {
        int id PK
        string title
        string slug UK
        text excerpt
        text content
        string featured_image
        string status
        int author_id FK
        int category_id FK
        json seo_data
        datetime published_at
        datetime created_at
        datetime updated_at
    }

    BLOG_CATEGORIES {
        int id PK
        string name
        string slug UK
        text description
        int parent_id FK
        int sort_order
        boolean is_active
        datetime created_at
    }

    BLOG_TAGS {
        int id PK
        string name
        string slug UK
        string color
        datetime created_at
    }

    BLOG_POST_TAGS {
        int post_id FK
        int tag_id FK
    }

    BLOG_COMMENTS {
        int id PK
        int post_id FK
        int user_id FK
        int parent_id FK
        text content
        string status
        datetime created_at
        datetime updated_at
    }

    COURSES {
        int id PK
        string title
        string slug UK
        text description
        decimal price
        string difficulty_level
        int duration_hours
        string instructor_name
        string featured_image
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    COURSE_MODULES {
        int id PK
        int course_id FK
        string title
        text description
        int sort_order
        boolean is_active
        datetime created_at
    }

    COURSE_LESSONS {
        int id PK
        int module_id FK
        string title
        text content
        string video_url
        json resources
        int duration_minutes
        int sort_order
        boolean is_active
        datetime created_at
    }

    COURSE_ENROLLMENTS {
        int id PK
        int course_id FK
        int user_id FK
        decimal paid_amount
        string status
        datetime enrolled_at
        datetime completed_at
        decimal progress_percentage
    }

    USERS ||--o{ BLOG_POSTS : authors
    BLOG_CATEGORIES ||--o{ BLOG_POSTS : categorizes
    BLOG_CATEGORIES ||--o{ BLOG_CATEGORIES : "parent-child"
    BLOG_POSTS ||--o{ BLOG_POST_TAGS : tagged
    BLOG_TAGS ||--o{ BLOG_POST_TAGS : tags
    BLOG_POSTS ||--o{ BLOG_COMMENTS : receives
    USERS ||--o{ BLOG_COMMENTS : writes
    COURSES ||--o{ COURSE_MODULES : contains
    COURSE_MODULES ||--o{ COURSE_LESSONS : includes
    COURSES ||--o{ COURSE_ENROLLMENTS : enrolls
    USERS ||--o{ COURSE_ENROLLMENTS : enrolls
```

## 2. Diagrama de Classes (Domain Model)

### E-commerce Domain

```mermaid
classDiagram
    class User {
        +int id
        +string email
        +string passwordHash
        +string fullName
        +string phone
        +boolean isActive
        +boolean isVerified
        +DateTime createdAt
        +authenticate(password): boolean
        +updateProfile(data): void
        +generateVerificationToken(): string
    }

    class Product {
        +int id
        +string name
        +string slug
        +string description
        +decimal price
        +decimal costPrice
        +string sku
        +int stockQuantity
        +Category category
        +boolean isActive
        +calculateDiscount(coupon): decimal
        +updateStock(quantity): void
        +isInStock(): boolean
    }

    class Category {
        +int id
        +string name
        +string slug
        +string description
        +Category parent
        +List~Product~ products
        +boolean isActive
        +getFullPath(): string
        +getChildren(): List~Category~
    }

    class Cart {
        +int id
        +User user
        +string sessionId
        +List~CartItem~ items
        +DateTime createdAt
        +addItem(product, quantity): void
        +removeItem(productId): void
        +updateQuantity(productId, quantity): void
        +calculateTotal(): decimal
        +clear(): void
    }

    class CartItem {
        +int id
        +Product product
        +int quantity
        +decimal unitPrice
        +DateTime addedAt
        +calculateSubtotal(): decimal
    }

    class Order {
        +int id
        +string orderNumber
        +User user
        +List~OrderItem~ items
        +decimal subtotal
        +decimal taxAmount
        +decimal shippingAmount
        +decimal discountAmount
        +decimal totalAmount
        +OrderStatus status
        +Address shippingAddress
        +Address billingAddress
        +processPayment(payment): boolean
        +updateStatus(status): void
        +calculateTotals(): void
    }

    class OrderItem {
        +int id
        +Product product
        +int quantity
        +decimal unitPrice
        +decimal totalPrice
        +string productName
        +Map~string, object~ productAttributes
        +calculateTotal(): decimal
    }

    class Payment {
        +int id
        +Order order
        +string paymentMethod
        +string gatewayProvider
        +string gatewayTransactionId
        +decimal amount
        +string currency
        +PaymentStatus status
        +Map~string, object~ gatewayResponse
        +process(): boolean
        +refund(amount): boolean
    }

    User ||--o{ Cart : owns
    User ||--o{ Order : places
    Cart ||--o{ CartItem : contains
    Order ||--o{ OrderItem : contains
    Order ||--o{ Payment : "paid by"
    Category ||--o{ Product : contains
    Category ||--o{ Category : "parent-child"
    Product ||--o{ CartItem : "added to"
    Product ||--o{ OrderItem : "ordered as"
```

### Inventory Domain

```mermaid
classDiagram
    class Inventory {
        +int id
        +Product product
        +Warehouse warehouse
        +int currentStock
        +int reservedStock
        +int reorderPoint
        +int maxStockLevel
        +DateTime lastUpdated
        +updateStock(quantity, movementType): void
        +reserveStock(quantity): boolean
        +releaseReservedStock(quantity): void
        +needsReorder(): boolean
    }

    class Warehouse {
        +int id
        +string name
        +string code
        +Address address
        +string managerName
        +string contactPhone
        +boolean isActive
        +List~Inventory~ inventories
        +getAvailableStock(productId): int
        +transferStock(targetWarehouse, productId, quantity): void
    }

    class StockMovement {
        +int id
        +Product product
        +Warehouse warehouse
        +MovementType movementType
        +int quantity
        +string referenceType
        +int referenceId
        +string notes
        +User user
        +DateTime createdAt
        +record(): void
    }

    class Supplier {
        +int id
        +string name
        +string code
        +string contactName
        +string email
        +string phone
        +Address address
        +string paymentTerms
        +boolean isActive
        +List~PurchaseOrder~ purchaseOrders
        +createPurchaseOrder(items): PurchaseOrder
    }

    class PurchaseOrder {
        +int id
        +string poNumber
        +Supplier supplier
        +List~PurchaseOrderItem~ items
        +decimal totalAmount
        +PurchaseOrderStatus status
        +DateTime orderDate
        +DateTime expectedDate
        +DateTime receivedDate
        +string notes
        +submit(): void
        +receive(items): void
        +calculateTotal(): decimal
    }

    class PurchaseOrderItem {
        +int id
        +Product product
        +int orderedQuantity
        +int receivedQuantity
        +decimal unitCost
        +decimal totalCost
        +calculateTotal(): decimal
        +isFullyReceived(): boolean
    }

    Product ||--o{ Inventory : "stocked as"
    Warehouse ||--o{ Inventory : stores
    Inventory ||--o{ StockMovement : "tracked by"
    Supplier ||--o{ PurchaseOrder : receives
    PurchaseOrder ||--o{ PurchaseOrderItem : contains
    Product ||--o{ PurchaseOrderItem : "purchased as"
```

## 3. Índices e Performance

### Estratégia de Indexação

```mermaid
graph TB
    subgraph "Primary Indexes"
        PK_Users[users.id PRIMARY]
        PK_Products[products.id PRIMARY]
        PK_Orders[orders.id PRIMARY]
        PK_OrderItems[order_items.id PRIMARY]
    end

    subgraph "Unique Indexes"
        UK_UserEmail[users.email UNIQUE]
        UK_ProductSku[products.sku UNIQUE]
        UK_OrderNumber[orders.order_number UNIQUE]
        UK_CategorySlug[categories.slug UNIQUE]
    end

    subgraph "Foreign Key Indexes"
        FK_OrderUser[orders.user_id]
        FK_OrderItemOrder[order_items.order_id]
        FK_OrderItemProduct[order_items.product_id]
        FK_ProductCategory[products.category_id]
    end

    subgraph "Query Optimization Indexes"
        IDX_ProductActive[products.is_active]
        IDX_OrderStatus[orders.status]
        IDX_OrderCreated[orders.created_at]
        IDX_UserActive[users.is_active, users.is_verified]
    end

    subgraph "Composite Indexes"
        COMP_ProductCategoryActive[products(category_id, is_active)]
        COMP_OrderUserStatus[orders(user_id, status)]
        COMP_StockMovementProduct[stock_movements(product_id, created_at)]
    end

    subgraph "Full-Text Search"
        FTS_ProductName[products.name, products.description]
        FTS_BlogContent[blog_posts.title, blog_posts.content]
        FTS_CustomerName[customers.name, customers.company_name]
    end
```

### Performance Patterns

```mermaid
graph LR
    subgraph "Read Optimization"
        ReadReplica[Read Replicas]
        MaterializedViews[Materialized Views]
        CachedQueries[Cached Queries]
    end

    subgraph "Write Optimization"
        BatchInserts[Batch Inserts]
        AsyncProcessing[Async Processing]
        EventSourcing[Event Sourcing]
    end

    subgraph "Data Partitioning"
        DatePartition[Date-based Partitioning]
        HashPartition[Hash Partitioning]
        RangePartition[Range Partitioning]
    end

    subgraph "Caching Strategy"
        RedisCache[Redis Cache]
        ApplicationCache[Application Cache]
        CDNCache[CDN Cache]
    end

    ReadReplica --> CachedQueries
    MaterializedViews --> RedisCache
    BatchInserts --> AsyncProcessing
    EventSourcing --> DatePartition
    HashPartition --> ApplicationCache
    RangePartition --> CDNCache
```

## 4. Data Flow Diagrams

### Order Processing Data Flow

```mermaid
graph TB
    subgraph "User Actions"
        Browse[Browse Products]
        AddCart[Add to Cart]
        Checkout[Checkout]
    end

    subgraph "Data Processing"
        ValidateStock[Validate Stock]
        ReserveItems[Reserve Items]
        ProcessPayment[Process Payment]
        CreateOrder[Create Order]
    end

    subgraph "Data Storage"
        ProductDB[(Product Data)]
        CartDB[(Cart Data)]
        OrderDB[(Order Data)]
        PaymentDB[(Payment Data)]
        InventoryDB[(Inventory Data)]
    end

    subgraph "External Systems"
        PaymentGateway[Payment Gateway]
        EmailService[Email Service]
        InventorySystem[Inventory System]
    end

    Browse --> ProductDB
    AddCart --> CartDB
    Checkout --> ValidateStock
    ValidateStock --> ProductDB
    ValidateStock --> InventoryDB
    ReserveItems --> InventoryDB
    ProcessPayment --> PaymentGateway
    ProcessPayment --> PaymentDB
    CreateOrder --> OrderDB
    CreateOrder --> EmailService
    CreateOrder --> InventorySystem
```

### Analytics Data Pipeline

```mermaid
graph LR
    subgraph "Data Sources"
        WebEvents[Web Events]
        APILogs[API Logs]
        DatabaseChanges[Database Changes]
        ExternalData[External Data]
    end

    subgraph "Data Ingestion"
        EventCollector[Event Collector]
        LogAggregator[Log Aggregator]
        ChangeDataCapture[Change Data Capture]
        ETLPipeline[ETL Pipeline]
    end

    subgraph "Data Processing"
        StreamProcessor[Stream Processor]
        BatchProcessor[Batch Processor]
        DataValidator[Data Validator]
        DataEnricher[Data Enricher]
    end

    subgraph "Data Storage"
        DataWarehouse[(Data Warehouse)]
        DataLake[(Data Lake)]
        CacheLayer[Cache Layer]
        SearchIndex[Search Index]
    end

    subgraph "Data Consumption"
        Analytics[Analytics Dashboard]
        ReportingAPI[Reporting API]
        MLPipeline[ML Pipeline]
        AlertingSystem[Alerting System]
    end

    WebEvents --> EventCollector
    APILogs --> LogAggregator
    DatabaseChanges --> ChangeDataCapture
    ExternalData --> ETLPipeline

    EventCollector --> StreamProcessor
    LogAggregator --> BatchProcessor
    ChangeDataCapture --> DataValidator
    ETLPipeline --> DataEnricher

    StreamProcessor --> DataWarehouse
    BatchProcessor --> DataLake
    DataValidator --> CacheLayer
    DataEnricher --> SearchIndex

    DataWarehouse --> Analytics
    DataLake --> ReportingAPI
    CacheLayer --> MLPipeline
    SearchIndex --> AlertingSystem
```

## 5. Data Migration Strategy

### Migration Phases

```mermaid
gantt
    title Data Migration Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1
    Schema Creation    :2025-01-01, 2025-01-15
    Core Data Migration:2025-01-16, 2025-01-31
    section Phase 2
    Historical Data    :2025-02-01, 2025-02-28
    Data Validation    :2025-03-01, 2025-03-15
    section Phase 3
    Performance Tuning :2025-03-16, 2025-03-31
    Go Live           :2025-04-01, 2025-04-01
```

### Migration Architecture

```mermaid
graph TB
    subgraph "Source Systems"
        LegacyDB[(Legacy Database)]
        ExcelFiles[Excel Files]
        CSVAPI[CSV/API Data]
    end

    subgraph "Migration Tools"
        ETLTool[ETL Tool]
        DataValidator[Data Validator]
        ConflictResolver[Conflict Resolver]
    end

    subgraph "Target System"
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis Cache)]
        SearchEngine[Search Engine]
    end

    subgraph "Validation"
        DataQuality[Data Quality Checks]
        BusinessRules[Business Rules Validation]
        PerformanceTests[Performance Tests]
    end

    LegacyDB --> ETLTool
    ExcelFiles --> ETLTool
    CSVAPI --> ETLTool

    ETLTool --> DataValidator
    DataValidator --> ConflictResolver
    ConflictResolver --> PostgreSQL
    PostgreSQL --> Redis
    PostgreSQL --> SearchEngine

    PostgreSQL --> DataQuality
    Redis --> BusinessRules
    SearchEngine --> PerformanceTests
```

## Conclusão

Esta documentação de dados fornece uma visão completa da arquitetura de dados do sistema Mestres Café Enterprise, incluindo:

- **Modelo de dados detalhado** com todas as entidades e relacionamentos
- **Diagrama de classes** mostrando o design orientado a objetos
- **Estratégias de indexação** para otimização de performance
- **Fluxos de dados** críticos do sistema
- **Estratégia de migração** de dados legados

Essa estrutura garante escalabilidade, performance e integridade dos dados em todas as operações do sistema.
