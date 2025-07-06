# 🏛️ Arquitetura de Sistema - Mestres Café Enterprise

> **Documentação técnica detalhada da arquitetura do sistema**

---

## 📋 Visão Geral

O **Mestres Café Enterprise** é construído seguindo uma **arquitetura monolítica bem estruturada** com preparação para evolução a **microsserviços**. O sistema implementa padrões modernos de desenvolvimento full-stack com foco em **escalabilidade**, **manutenibilidade** e **performance**.

### 🎯 **Características Arquiteturais**

- **Monorepo**: Código unificado com workspaces organizados
- **Full-Stack**: Frontend React + Backend Flask integrados
- **API-First**: Arquitetura orientada a APIs RESTful
- **Cloud-Ready**: Containerização completa com Docker
- **Microservices-Ready**: Preparado para decomposição futura

---

## 🏗️ Arquitetura de Alto Nível

```mermaid
graph TB
    subgraph "🌐 Internet & CDN"
        USERS[👥 Usuários]
        CDN[🌍 CDN<br/>Assets Estáticos]
    end

    subgraph "🔒 Edge Layer"
        LB[⚖️ Load Balancer<br/>Nginx]
        WAF[🛡️ Web Application Firewall]
        SSL[🔐 SSL Termination]
    end

    subgraph "📱 Presentation Layer"
        WEB[🖥️ React SPA<br/>Port: 3000]
        PWA[📱 Progressive Web App]
        ADMIN[⚙️ Admin Dashboard]
    end

    subgraph "🔀 API Gateway"
        GATEWAY[🚪 API Gateway<br/>Route Management]
        CORS[🌐 CORS Handler]
        RATE[⏱️ Rate Limiting]
    end

    subgraph "⚙️ Application Layer"
        API[🔧 Flask API<br/>Port: 5001]
        AUTH[🔐 Auth Service<br/>JWT Manager]
        BG[⚡ Background Jobs<br/>Celery Tasks]
        QUEUE[📬 Message Queue<br/>Redis]
    end

    subgraph "💾 Data Layer"
        DB[(🗄️ PostgreSQL<br/>Primary Database)]
        CACHE[(⚡ Redis Cache<br/>Sessions & Data)]
        FILES[📁 File Storage<br/>Local/S3]
        BACKUP[(💾 Backup Storage<br/>Point-in-time)]
    end

    subgraph "📊 Observability Layer"
        METRICS[📈 Prometheus<br/>Metrics Collection]
        LOGS[📝 Centralized Logs<br/>ELK Stack]
        MONITOR[🔍 Grafana<br/>Dashboards]
        ALERT[🚨 AlertManager<br/>Notifications]
    end

    USERS --> CDN
    USERS --> LB
    CDN --> WEB
    LB --> SSL
    SSL --> WAF
    WAF --> GATEWAY

    GATEWAY --> WEB
    GATEWAY --> CORS
    GATEWAY --> RATE
    CORS --> API
    RATE --> API

    WEB --> PWA
    WEB --> ADMIN

    API --> AUTH
    API --> BG
    BG --> QUEUE
    API --> DB
    API --> CACHE
    API --> FILES

    DB --> BACKUP
    API --> METRICS
    API --> LOGS
    METRICS --> MONITOR
    LOGS --> MONITOR
    MONITOR --> ALERT
```

---

## 🧩 Componentes Principais

### 🎨 **Frontend Components**

```mermaid
graph TB
    subgraph "🖥️ React Application"
        APP[App.jsx<br/>Root Component]
        ROUTER[React Router<br/>Navigation]
        LAYOUT[Layout Components<br/>Header, Footer, Sidebar]
    end

    subgraph "🔐 Authentication"
        AUTH_CTX[AuthContext<br/>Global Auth State]
        AUTH_GUARD[AuthGuard<br/>Route Protection]
        LOGIN[Login/Register<br/>Forms]
    end

    subgraph "🛒 E-commerce"
        PRODUCT[ProductCard<br/>Product Display]
        CART[CartDropdown<br/>Shopping Cart]
        CHECKOUT[CheckoutPage<br/>Payment Flow]
        ORDER[OrderHistory<br/>User Orders]
    end

    subgraph "👨‍💼 Admin/ERP"
        DASHBOARD[AdminDashboard<br/>Overview]
        CRM[CRM Components<br/>Customer Management]
        INVENTORY[Inventory Management<br/>Stock Control]
        REPORTS[Reports & Analytics<br/>Business Intelligence]
    end

    subgraph "🎮 Extra Features"
        BLOG[Blog System<br/>Content Management]
        COURSE[Course Platform<br/>Learning Management]
        GAMIFY[Gamification<br/>Points & Rewards]
        NEWSLETTER[Newsletter<br/>Marketing]
    end

    subgraph "🔧 UI Components"
        BUTTON[Button Components<br/>Shadcn/UI]
        MODAL[Modal/Dialog<br/>Interactions]
        FORM[Form Components<br/>Input Validation]
        TABLE[Table Components<br/>Data Display]
    end

    APP --> ROUTER
    APP --> AUTH_CTX
    ROUTER --> LAYOUT
    ROUTER --> AUTH_GUARD
    AUTH_GUARD --> LOGIN

    LAYOUT --> PRODUCT
    LAYOUT --> CART
    LAYOUT --> CHECKOUT
    LAYOUT --> ORDER

    AUTH_GUARD --> DASHBOARD
    DASHBOARD --> CRM
    DASHBOARD --> INVENTORY
    DASHBOARD --> REPORTS

    LAYOUT --> BLOG
    LAYOUT --> COURSE
    LAYOUT --> GAMIFY
    LAYOUT --> NEWSLETTER

    PRODUCT --> BUTTON
    CART --> MODAL
    CHECKOUT --> FORM
    REPORTS --> TABLE
```

### ⚙️ **Backend Components**

```mermaid
graph TB
    subgraph "🔧 Flask Application"
        APP[app.py<br/>Application Factory]
        CONFIG[Configuration<br/>Environment Setup]
        BLUEPRINTS[Blueprint Registration<br/>Route Organization]
    end

    subgraph "🛣️ Route Controllers"
        AUTH_ROUTE[auth.py<br/>Authentication]
        PRODUCT_ROUTE[products.py<br/>Product Management]
        ORDER_ROUTE[orders.py<br/>Order Processing]
        ADMIN_ROUTE[admin.py<br/>Administration]
    end

    subgraph "📊 Business Logic"
        AUTH_SERVICE[AuthService<br/>JWT & Permissions]
        PRODUCT_SERVICE[ProductService<br/>Catalog Logic]
        ORDER_SERVICE[OrderService<br/>Order Processing]
        EMAIL_SERVICE[EmailService<br/>Notifications]
    end

    subgraph "🗄️ Data Models"
        USER_MODEL[User Model<br/>Authentication]
        PRODUCT_MODEL[Product Model<br/>Catalog]
        ORDER_MODEL[Order Model<br/>Transactions]
        CRM_MODEL[CRM Models<br/>Customer Data]
    end

    subgraph "🔌 External Integrations"
        PAYMENT[Payment Gateway<br/>Stripe/PayPal]
        EMAIL[Email Provider<br/>SendGrid/SES]
        STORAGE[File Storage<br/>AWS S3]
        ANALYTICS[Analytics<br/>Google Analytics]
    end

    subgraph "🛡️ Middleware"
        CORS_MID[CORS Middleware<br/>Cross-Origin]
        AUTH_MID[Auth Middleware<br/>JWT Validation]
        RATE_MID[Rate Limiting<br/>API Protection]
        ERROR_MID[Error Handler<br/>Exception Management]
    end

    APP --> CONFIG
    APP --> BLUEPRINTS
    BLUEPRINTS --> AUTH_ROUTE
    BLUEPRINTS --> PRODUCT_ROUTE
    BLUEPRINTS --> ORDER_ROUTE
    BLUEPRINTS --> ADMIN_ROUTE

    AUTH_ROUTE --> AUTH_SERVICE
    PRODUCT_ROUTE --> PRODUCT_SERVICE
    ORDER_ROUTE --> ORDER_SERVICE

    AUTH_SERVICE --> USER_MODEL
    PRODUCT_SERVICE --> PRODUCT_MODEL
    ORDER_SERVICE --> ORDER_MODEL

    ORDER_SERVICE --> PAYMENT
    AUTH_SERVICE --> EMAIL
    PRODUCT_SERVICE --> STORAGE

    APP --> CORS_MID
    APP --> AUTH_MID
    APP --> RATE_MID
    APP --> ERROR_MID
```

---

## 🔄 Fluxos de Sistema

### 🔐 **Fluxo de Autenticação**

```mermaid
sequenceDiagram
    participant U as 👤 Usuário
    participant F as 🖥️ Frontend
    participant G as 🚪 API Gateway
    participant A as ⚙️ Auth Service
    participant D as 🗄️ Database
    participant R as ⚡ Redis Cache

    Note over U,R: Processo de Login
    U->>F: 1. Inserir credenciais
    F->>G: 2. POST /api/auth/login
    G->>A: 3. Validar request
    A->>D: 4. Verificar usuário
    D-->>A: 5. Dados do usuário
    A->>A: 6. Gerar JWT tokens
    A->>R: 7. Armazenar refresh token
    A-->>G: 8. Retornar tokens + user data
    G-->>F: 9. Response com auth data
    F->>F: 10. Salvar no AuthContext
    F-->>U: 11. Redirecionar para dashboard

    Note over U,R: Renovação de Token
    F->>G: 12. Request com token expirado
    G->>A: 13. Validar token
    A->>R: 14. Verificar refresh token
    R-->>A: 15. Token válido
    A->>A: 16. Gerar novo access token
    A-->>G: 17. Novo token
    G-->>F: 18. Response com novo token
    F->>F: 19. Atualizar AuthContext
```

### 🛒 **Fluxo de E-commerce**

```mermaid
sequenceDiagram
    participant C as 🛒 Cliente
    participant F as 🖥️ Frontend
    participant A as ⚙️ API
    participant D as 🗄️ Database
    participant P as 💳 Payment Gateway
    participant E as 📧 Email Service

    Note over C,E: Processo de Compra
    C->>F: 1. Adicionar produto ao carrinho
    F->>A: 2. POST /api/cart/add
    A->>D: 3. Salvar item no carrinho
    D-->>A: 4. Carrinho atualizado
    A-->>F: 5. Response de sucesso
    F-->>C: 6. Feedback visual

    Note over C,E: Checkout
    C->>F: 7. Iniciar checkout
    F->>A: 8. POST /api/orders/create
    A->>D: 9. Criar pedido
    A->>P: 10. Processar pagamento
    P-->>A: 11. Confirmação de pagamento
    A->>D: 12. Atualizar status do pedido
    A->>D: 13. Atualizar estoque
    A->>E: 14. Enviar email de confirmação
    E-->>A: 15. Email enviado
    A-->>F: 16. Pedido confirmado
    F-->>C: 17. Página de sucesso
```

### 📊 **Fluxo de CRM/ERP**

```mermaid
sequenceDiagram
    participant A as 👨‍💼 Admin
    participant D as 🖥️ Dashboard
    participant API as ⚙️ API
    participant DB as 🗄️ Database
    participant C as ⚡ Cache
    participant R as 📊 Reports

    Note over A,R: Gestão de Clientes
    A->>D: 1. Acessar dashboard CRM
    D->>API: 2. GET /api/crm/customers
    API->>C: 3. Verificar cache
    alt Cache Miss
        API->>DB: 4a. Query clientes
        DB-->>API: 5a. Dados dos clientes
        API->>C: 6a. Salvar no cache
    else Cache Hit
        C-->>API: 4b. Dados do cache
    end
    API-->>D: 7. Lista de clientes
    D-->>A: 8. Visualizar clientes

    Note over A,R: Análise de Dados
    A->>D: 9. Solicitar relatório
    D->>API: 10. GET /api/reports/sales
    API->>DB: 11. Query agregada
    DB-->>API: 12. Dados do relatório
    API->>R: 13. Gerar relatório
    R-->>API: 14. Relatório processado
    API-->>D: 15. Dados formatados
    D-->>A: 16. Exibir dashboard
```

---

## 🎯 Padrões Arquiteturais

### 🏗️ **Clean Architecture**

```mermaid
graph TB
    subgraph "🎯 Domain Layer"
        ENTITIES[📊 Entities<br/>Business Objects]
        USE_CASES[🎯 Use Cases<br/>Business Logic]
        INTERFACES[🔌 Interfaces<br/>Contracts]
    end

    subgraph "⚙️ Application Layer"
        SERVICES[🔧 Services<br/>Application Logic]
        CONTROLLERS[🎮 Controllers<br/>Request Handlers]
        MIDDLEWARE[🛡️ Middleware<br/>Cross-cutting]
    end

    subgraph "🔌 Infrastructure Layer"
        REPOSITORIES[🗄️ Repositories<br/>Data Access]
        EXTERNAL[🌐 External APIs<br/>Third-party]
        FRAMEWORK[🏗️ Framework<br/>Flask/React]
    end

    subgraph "📱 Presentation Layer"
        UI[🖥️ User Interface<br/>React Components]
        API[📡 API Endpoints<br/>REST/GraphQL]
        VIEWS[👁️ Views<br/>Templates]
    end

    USE_CASES --> ENTITIES
    SERVICES --> USE_CASES
    CONTROLLERS --> SERVICES
    CONTROLLERS --> MIDDLEWARE

    REPOSITORIES --> CONTROLLERS
    EXTERNAL --> SERVICES
    FRAMEWORK --> CONTROLLERS

    UI --> API
    API --> CONTROLLERS
    VIEWS --> UI
```

### 🔄 **Event-Driven Architecture**

```mermaid
graph LR
    subgraph "🎬 Event Producers"
        USER_ACTION[👤 User Actions]
        SYSTEM_EVENT[⚙️ System Events]
        EXTERNAL_EVENT[🌐 External Events]
    end

    subgraph "📬 Event Bus"
        QUEUE[📫 Message Queue<br/>Redis/RabbitMQ]
        DISPATCHER[📮 Event Dispatcher]
    end

    subgraph "👂 Event Consumers"
        EMAIL_HANDLER[📧 Email Handler]
        NOTIFICATION[🔔 Notification Service]
        ANALYTICS[📊 Analytics Processor]
        AUDIT[📝 Audit Logger]
    end

    USER_ACTION --> QUEUE
    SYSTEM_EVENT --> QUEUE
    EXTERNAL_EVENT --> QUEUE

    QUEUE --> DISPATCHER
    DISPATCHER --> EMAIL_HANDLER
    DISPATCHER --> NOTIFICATION
    DISPATCHER --> ANALYTICS
    DISPATCHER --> AUDIT
```

---

## 🔧 Decisões Arquiteturais

### 📋 **ADR (Architecture Decision Records)**

#### **ADR-001: Monorepo vs Multi-repo**

- **Decisão**: Adotar estrutura monorepo
- **Contexto**: Facilitar compartilhamento de código e coordenação de releases
- **Consequências**:
  - ✅ Melhor sincronização entre frontend/backend
  - ✅ Simplified dependency management
  - ❌ Repositório mais pesado

#### **ADR-002: Flask vs FastAPI**

- **Decisão**: Utilizar Flask 3.0
- **Contexto**: Maior maturidade e ecossistema estabelecido
- **Consequências**:
  - ✅ Comunidade ativa e documentação extensa
  - ✅ Flexibilidade para customização
  - ❌ Performance inferior ao FastAPI

#### **ADR-003: PostgreSQL vs MongoDB**

- **Decisão**: PostgreSQL como banco principal
- **Contexto**: Dados relacionais complexos e ACID compliance
- **Consequências**:
  - ✅ Integridade referencial garantida
  - ✅ Query optimization avançada
  - ❌ Menos flexibilidade para dados não estruturados

#### **ADR-004: Context API vs Redux**

- **Decisão**: Context API para state management
- **Contexto**: Simplicidade e redução de boilerplate
- **Consequências**:
  - ✅ Menos complexidade de setup
  - ✅ Performance adequada para escala atual
  - ❌ Limitações para state complexo

### 🎯 **Design Principles**

```mermaid
mindmap
  root((🎯 Design<br/>Principles))
    🔄 SOLID
      Single Responsibility
      Open/Closed
      Liskov Substitution
      Interface Segregation
      Dependency Inversion
    📏 DRY
      Don't Repeat Yourself
      Code Reusability
      Maintainability
    🔧 KISS
      Keep It Simple
      Minimal Complexity
      Clear Intent
    ⚡ Performance
      Lazy Loading
      Caching Strategy
      Query Optimization
    🔒 Security
      Defense in Depth
      Principle of Least Privilege
      Fail Secure
```

---

## 🚀 Escalabilidade

### 📈 **Horizontal Scaling Strategy**

```mermaid
graph TB
    subgraph "🌐 Load Balancer Layer"
        LB[⚖️ Nginx Load Balancer]
        LB --> HEALTH[🏥 Health Checks]
    end

    subgraph "📱 Frontend Scaling"
        CDN[🌍 CDN Distribution]
        STATIC[📁 Static Assets]
        PWA[📱 Progressive Web App]
    end

    subgraph "⚙️ Backend Scaling"
        API1[🔧 API Instance 1]
        API2[🔧 API Instance 2]
        API3[🔧 API Instance 3]
        APINEW[🔧 API Instance N...]
    end

    subgraph "💾 Database Scaling"
        MASTER[(🗄️ PostgreSQL Master)]
        REPLICA1[(📖 Read Replica 1)]
        REPLICA2[(📖 Read Replica 2)]
        CACHE_CLUSTER[⚡ Redis Cluster]
    end

    subgraph "📬 Queue Scaling"
        QUEUE1[📫 Queue Instance 1]
        QUEUE2[📫 Queue Instance 2]
        WORKERS[👷 Background Workers]
    end

    LB --> API1
    LB --> API2
    LB --> API3
    LB --> APINEW

    CDN --> STATIC
    CDN --> PWA

    API1 --> MASTER
    API2 --> REPLICA1
    API3 --> REPLICA2

    API1 --> CACHE_CLUSTER
    API2 --> CACHE_CLUSTER
    API3 --> CACHE_CLUSTER

    API1 --> QUEUE1
    API2 --> QUEUE2
    QUEUE1 --> WORKERS
    QUEUE2 --> WORKERS
```

### 🔄 **Microservices Transition Plan**

```mermaid
graph TB
    subgraph "🎯 Phase 1: Monolith Decomposition"
        MONOLITH[🏗️ Current Monolith]
        AUTH_MS[🔐 Auth Microservice]
        PRODUCT_MS[📦 Product Microservice]
        ORDER_MS[🛒 Order Microservice]
    end

    subgraph "🎯 Phase 2: Domain Services"
        CRM_MS[👥 CRM Microservice]
        INVENTORY_MS[📊 Inventory Microservice]
        FINANCE_MS[💰 Finance Microservice]
        NOTIFICATION_MS[🔔 Notification Microservice]
    end

    subgraph "🎯 Phase 3: Supporting Services"
        ANALYTICS_MS[📈 Analytics Microservice]
        MEDIA_MS[📁 Media Microservice]
        SEARCH_MS[🔍 Search Microservice]
        REPORT_MS[📊 Report Microservice]
    end

    subgraph "🔌 Integration Layer"
        API_GATEWAY[🚪 API Gateway]
        SERVICE_MESH[🕸️ Service Mesh]
        EVENT_BUS[📬 Event Bus]
    end

    MONOLITH --> AUTH_MS
    MONOLITH --> PRODUCT_MS
    MONOLITH --> ORDER_MS

    AUTH_MS --> CRM_MS
    PRODUCT_MS --> INVENTORY_MS
    ORDER_MS --> FINANCE_MS

    CRM_MS --> ANALYTICS_MS
    INVENTORY_MS --> MEDIA_MS
    FINANCE_MS --> SEARCH_MS
    ORDER_MS --> REPORT_MS

    API_GATEWAY --> AUTH_MS
    API_GATEWAY --> PRODUCT_MS
    API_GATEWAY --> ORDER_MS
    SERVICE_MESH --> API_GATEWAY
    EVENT_BUS --> SERVICE_MESH
```

---

## 🔍 Monitoramento Arquitetural

### 📊 **Observability Stack**

```mermaid
graph TB
    subgraph "📏 Metrics Collection"
        PROM[📈 Prometheus<br/>Time Series DB]
        EXPORTERS[🔌 Exporters<br/>Node, Container, Custom]
        GRAFANA[📊 Grafana<br/>Visualization]
    end

    subgraph "📝 Logging"
        FLUENTD[📋 Fluentd<br/>Log Collector]
        ELASTIC[🔍 Elasticsearch<br/>Search Engine]
        KIBANA[👁️ Kibana<br/>Log Analysis]
    end

    subgraph "🔍 Tracing"
        JAEGER[🔗 Jaeger<br/>Distributed Tracing]
        OPENTEL[📡 OpenTelemetry<br/>Instrumentation]
    end

    subgraph "🚨 Alerting"
        ALERT_MGR[⚠️ AlertManager<br/>Alert Routing]
        SLACK[💬 Slack<br/>Notifications]
        EMAIL[📧 Email<br/>Critical Alerts]
    end

    EXPORTERS --> PROM
    PROM --> GRAFANA
    PROM --> ALERT_MGR

    FLUENTD --> ELASTIC
    ELASTIC --> KIBANA

    OPENTEL --> JAEGER

    ALERT_MGR --> SLACK
    ALERT_MGR --> EMAIL
```

---

## 📋 Conclusão

A arquitetura do **Mestres Café Enterprise** foi projetada para balancear **simplicidade operacional** com **preparação para o futuro**. A estrutura monolítica atual oferece facilidade de desenvolvimento e deploy, enquanto os padrões implementados facilitam a evolução para microsserviços quando necessário.

### 🎯 **Pontos Fortes**

- **Arquitetura bem estruturada** com separação clara de responsabilidades
- **Padrões modernos** implementados (Clean Architecture, DDD)
- **Escalabilidade horizontal** preparada
- **Observabilidade completa** implementada

### 🚀 **Próximos Passos**

- **Performance optimization** contínua
- **Microservices decomposition** planejada
- **Cloud-native transition** preparada
- **Advanced monitoring** expandido

---

_Documento técnico mantido pela equipe de arquitetura_
_Última atualização: Janeiro 2025_
