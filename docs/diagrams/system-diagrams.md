# 🏗️ Diagramas de Sistema - Mestres Café Enterprise

## Visão Geral

Esta seção contém todos os diagramas arquiteturais do sistema Mestres Café Enterprise, fornecendo representações visuais da estrutura, componentes e fluxos do sistema.

## 1. Arquitetura de Alto Nível

### Visão Geral do Sistema

```mermaid
graph TB
    subgraph "Frontend Layer"
        Web[React Web App]
        Mobile[Mobile App]
        Admin[Admin Dashboard]
    end

    subgraph "API Gateway"
        Gateway[NGINX/Load Balancer]
        Auth[Authentication Service]
    end

    subgraph "Backend Services"
        API[Flask API Server]
        Workers[Background Workers]
        Cache[Redis Cache]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        Files[File Storage]
        Logs[Log Storage]
    end

    subgraph "External Services"
        Payment[Payment Gateway]
        Email[Email Service]
        SMS[SMS Service]
        Maps[Maps API]
    end

    Web --> Gateway
    Mobile --> Gateway
    Admin --> Gateway

    Gateway --> Auth
    Gateway --> API

    API --> Cache
    API --> DB
    API --> Workers
    API --> Payment
    API --> Email
    API --> SMS
    API --> Maps

    Workers --> DB
    Workers --> Files
    Workers --> Logs
```

### Arquitetura de Componentes

```mermaid
graph LR
    subgraph "Presentation Layer"
        UI[User Interface]
        Components[React Components]
        Pages[Page Routes]
    end

    subgraph "Business Layer"
        Controllers[API Controllers]
        Services[Business Services]
        Models[Domain Models]
    end

    subgraph "Data Access Layer"
        ORM[SQLAlchemy ORM]
        Repositories[Data Repositories]
        Migrations[Database Migrations]
    end

    subgraph "Infrastructure Layer"
        Auth[Authentication]
        Cache[Caching]
        Queue[Task Queue]
        Storage[File Storage]
    end

    UI --> Controllers
    Components --> Services
    Pages --> Models

    Controllers --> Services
    Services --> Models
    Models --> ORM

    ORM --> Repositories
    Repositories --> Migrations

    Services --> Auth
    Services --> Cache
    Services --> Queue
    Services --> Storage
```

## 2. Fluxos de Dados Principais

### Fluxo de E-commerce (Pedido)

```mermaid
sequenceDiagram
    participant User
    participant Web
    participant API
    participant DB
    participant Payment
    participant Email

    User->>Web: Adicionar produto ao carrinho
    Web->>API: POST /api/cart/items
    API->>DB: Salvar item no carrinho
    DB-->>API: Confirmação
    API-->>Web: Item adicionado
    Web-->>User: Atualizar UI

    User->>Web: Finalizar pedido
    Web->>API: POST /api/orders
    API->>DB: Criar pedido
    API->>Payment: Processar pagamento
    Payment-->>API: Confirmação pagamento
    API->>DB: Atualizar status pedido
    API->>Email: Enviar confirmação
    Email-->>API: Email enviado
    API-->>Web: Pedido confirmado
    Web-->>User: Mostrar confirmação
```

### Fluxo de Autenticação JWT

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant DB

    Client->>API: POST /auth/login {email, password}
    API->>Auth: Validar credenciais
    Auth->>DB: Buscar usuário
    DB-->>Auth: Dados do usuário
    Auth->>Auth: Validar senha
    Auth->>Auth: Gerar JWT token
    Auth-->>API: Token JWT
    API-->>Client: {token, user_data}

    Note over Client: Cliente armazena token

    Client->>API: GET /api/protected (Authorization: Bearer token)
    API->>Auth: Validar token
    Auth->>Auth: Verificar assinatura
    Auth->>Auth: Verificar expiração
    Auth-->>API: Token válido + user_data
    API->>DB: Executar operação
    DB-->>API: Resultado
    API-->>Client: Resposta autorizada
```

### Fluxo de Gerenciamento de Estoque

```mermaid
graph TB
    subgraph "Entrada de Estoque"
        Purchase[Compra] --> Receive[Recebimento]
        Receive --> Update[Atualizar Estoque]
    end

    subgraph "Controle de Estoque"
        Stock[Estoque Atual] --> Reserve[Reservar]
        Reserve --> Validate[Validar Disponibilidade]
        Validate --> Allocate[Alocar para Pedido]
    end

    subgraph "Saída de Estoque"
        Order[Pedido] --> CheckStock[Verificar Estoque]
        CheckStock --> Deduct[Deduzir Estoque]
        Deduct --> Ship[Enviar Produto]
    end

    subgraph "Alertas"
        Monitor[Monitor Estoque] --> LowStock[Estoque Baixo]
        LowStock --> Alert[Alerta para Compras]
        Alert --> AutoOrder[Pedido Automático]
    end

    Update --> Stock
    Allocate --> Order
    Ship --> Monitor
```

## 3. Módulos e Microserviços

### Arquitetura Modular Atual

```mermaid
graph TB
    subgraph "Core Modules"
        Auth[Authentication]
        User[User Management]
        Product[Product Catalog]
        Order[Order Management]
    end

    subgraph "E-commerce Modules"
        Cart[Shopping Cart]
        Payment[Payment Processing]
        Shipping[Shipping Management]
        Inventory[Inventory Control]
    end

    subgraph "ERP Modules"
        Finance[Financial Management]
        Purchase[Purchase Management]
        Production[Production Planning]
        Reports[Reporting & Analytics]
    end

    subgraph "CRM Modules"
        Customer[Customer Management]
        Lead[Lead Management]
        Campaign[Campaign Management]
        Support[Customer Support]
    end

    subgraph "Content Modules"
        Blog[Blog Management]
        Course[Course Management]
        Newsletter[Newsletter]
        Gamification[Gamification]
    end

    Auth --> User
    User --> Customer
    Product --> Cart
    Cart --> Order
    Order --> Payment
    Order --> Shipping
    Order --> Inventory
    Inventory --> Purchase
    Purchase --> Finance
    Finance --> Reports
    Customer --> Lead
    Lead --> Campaign
    Campaign --> Newsletter
```

### Preparação para Microserviços (v2.0)

```mermaid
graph TB
    subgraph "API Gateway"
        Gateway[Kong/Ambassador]
        LB[Load Balancer]
    end

    subgraph "Authentication Service"
        AuthMS[Auth Microservice]
        AuthDB[(Auth Database)]
    end

    subgraph "Product Service"
        ProductMS[Product Microservice]
        ProductDB[(Product Database)]
        ProductCache[Product Cache]
    end

    subgraph "Order Service"
        OrderMS[Order Microservice]
        OrderDB[(Order Database)]
        OrderQueue[Order Queue]
    end

    subgraph "Payment Service"
        PaymentMS[Payment Microservice]
        PaymentDB[(Payment Database)]
        PaymentGW[Payment Gateway]
    end

    subgraph "Inventory Service"
        InventoryMS[Inventory Microservice]
        InventoryDB[(Inventory Database)]
        InventoryEvents[Inventory Events]
    end

    subgraph "Notification Service"
        NotificationMS[Notification Microservice]
        EmailQueue[Email Queue]
        SMSQueue[SMS Queue]
    end

    Gateway --> AuthMS
    Gateway --> ProductMS
    Gateway --> OrderMS
    Gateway --> PaymentMS
    Gateway --> InventoryMS

    AuthMS --> AuthDB
    ProductMS --> ProductDB
    ProductMS --> ProductCache
    OrderMS --> OrderDB
    OrderMS --> OrderQueue
    PaymentMS --> PaymentDB
    PaymentMS --> PaymentGW
    InventoryMS --> InventoryDB
    InventoryMS --> InventoryEvents

    OrderQueue --> NotificationMS
    InventoryEvents --> NotificationMS
    NotificationMS --> EmailQueue
    NotificationMS --> SMSQueue
```

## 4. Integração de Sistemas

### Integração com Sistemas Externos

```mermaid
graph LR
    subgraph "Mestres Café System"
        API[Main API]
        DB[(Database)]
        Queue[Task Queue]
    end

    subgraph "Payment Systems"
        Stripe[Stripe]
        PayPal[PayPal]
        PicPay[PicPay]
        Pix[PIX]
    end

    subgraph "Logistics"
        Correios[Correios]
        Loggi[Loggi]
        UberFlash[Uber Flash]
    end

    subgraph "Communication"
        SendGrid[SendGrid]
        Twilio[Twilio]
        WhatsApp[WhatsApp API]
    end

    subgraph "Analytics"
        GA[Google Analytics]
        Mixpanel[Mixpanel]
        Hotjar[Hotjar]
    end

    subgraph "Infrastructure"
        AWS[AWS Services]
        Cloudflare[Cloudflare]
        Sentry[Sentry]
    end

    API --> Stripe
    API --> PayPal
    API --> PicPay
    API --> Pix

    Queue --> Correios
    Queue --> Loggi
    Queue --> UberFlash

    Queue --> SendGrid
    Queue --> Twilio
    Queue --> WhatsApp

    API --> GA
    API --> Mixpanel
    API --> Hotjar

    API --> AWS
    API --> Cloudflare
    API --> Sentry
```

### Arquitetura de Events e Messaging

```mermaid
graph TB
    subgraph "Event Producers"
        OrderService[Order Service]
        PaymentService[Payment Service]
        InventoryService[Inventory Service]
        UserService[User Service]
    end

    subgraph "Event Infrastructure"
        EventBus[Event Bus/Redis]
        EventStore[Event Store]
        DeadLetter[Dead Letter Queue]
    end

    subgraph "Event Consumers"
        EmailService[Email Service]
        AnalyticsService[Analytics Service]
        ReportingService[Reporting Service]
        AuditService[Audit Service]
    end

    OrderService --> EventBus
    PaymentService --> EventBus
    InventoryService --> EventBus
    UserService --> EventBus

    EventBus --> EventStore
    EventBus --> EmailService
    EventBus --> AnalyticsService
    EventBus --> ReportingService
    EventBus --> AuditService

    EventBus --> DeadLetter
```

## 5. Padrões Arquiteturais Implementados

### Clean Architecture

```mermaid
graph TB
    subgraph "Frameworks & Drivers"
        Web[Web Interface]
        DB[Database]
        External[External APIs]
    end

    subgraph "Interface Adapters"
        Controllers[Controllers]
        Gateways[Gateways]
        Presenters[Presenters]
    end

    subgraph "Application Business Rules"
        UseCases[Use Cases]
        Services[Application Services]
    end

    subgraph "Enterprise Business Rules"
        Entities[Entities]
        DomainServices[Domain Services]
    end

    Web --> Controllers
    Controllers --> UseCases
    UseCases --> Entities
    UseCases --> Gateways
    Gateways --> DB
    Gateways --> External
    UseCases --> Presenters
    Presenters --> Web
```

### Domain Driven Design (DDD)

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[User Interface]
        API[REST API]
    end

    subgraph "Application Layer"
        AppServices[Application Services]
        DTOs[Data Transfer Objects]
        Commands[Commands]
        Queries[Queries]
    end

    subgraph "Domain Layer"
        Aggregates[Aggregates]
        Entities[Domain Entities]
        ValueObjects[Value Objects]
        DomainServices[Domain Services]
        DomainEvents[Domain Events]
    end

    subgraph "Infrastructure Layer"
        Repositories[Repositories]
        ExternalServices[External Services]
        EventHandlers[Event Handlers]
    end

    UI --> AppServices
    API --> AppServices
    AppServices --> Commands
    AppServices --> Queries
    Commands --> Aggregates
    Queries --> Repositories
    Aggregates --> Entities
    Aggregates --> ValueObjects
    Aggregates --> DomainServices
    Aggregates --> DomainEvents
    DomainEvents --> EventHandlers
    Repositories --> ExternalServices
```

## 6. Evolução da Arquitetura

### Roadmap Arquitetural

```mermaid
timeline
    title Evolução da Arquitetura Mestres Café

    section v1.0 - MVP
        Monólito bem estruturado : Clean Architecture
                                 : DDD principles
                                 : Basic monitoring

    section v1.1 - Modularity
        Módulos bem definidos : Event-driven architecture
                             : Advanced caching
                             : Performance optimization

    section v1.2 - Microservices Ready
        Bounded contexts : Service boundaries
                        : Event sourcing
                        : CQRS implementation

    section v2.0 - Full Microservices
        Distributed system : Service mesh
                          : Advanced monitoring
                          : Cloud-native deployment
```

### Migração para Cloud-Native

```mermaid
graph TB
    subgraph "Current State (v1.0)"
        Monolith[Monolithic App]
        SingleDB[(Single Database)]
        BasicMonitoring[Basic Monitoring]
    end

    subgraph "Transition State (v1.5)"
        ModularMonolith[Modular Monolith]
        ServiceBoundaries[Service Boundaries]
        Events[Event Architecture]
    end

    subgraph "Target State (v2.0)"
        Microservices[Microservices]
        ServiceMesh[Service Mesh]
        DistributedDB[(Distributed Databases)]
        CloudNative[Cloud-Native Platform]
    end

    Monolith --> ModularMonolith
    SingleDB --> ServiceBoundaries
    BasicMonitoring --> Events

    ModularMonolith --> Microservices
    ServiceBoundaries --> ServiceMesh
    Events --> DistributedDB
    ServiceMesh --> CloudNative
```

## Conclusão

Esta documentação visual fornece uma compreensão clara da arquitetura do sistema Mestres Café Enterprise, mostrando:

- **Estrutura de alto nível** e componentes principais
- **Fluxos de dados** críticos do sistema
- **Padrões arquiteturais** implementados
- **Roadmap de evolução** para microserviços

Os diagramas servem como referência para desenvolvimento, manutenção e evolução do sistema, garantindo que toda a equipe tenha uma visão unificada da arquitetura.
