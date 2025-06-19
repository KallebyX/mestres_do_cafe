# 📋 ESPECIFICAÇÕES TÉCNICAS MESTRES DO CAFÉ

> **Base**: Prompts detalhados fornecidos pelo cliente  
> **Atualizado**: 10/06/2025

## 🏗️ ARQUITETURA GERAL

### **Estrutura de Diretórios**

```
mestres-do-cafe/
├── frontend/                 # React.js Application
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── common/       # Header, Footer, Loading
│   │   │   ├── marketplace/  # ProductCard, Cart, Checkout
│   │   │   ├── map/          # MapContainer, LocationMarker
│   │   │   ├── admin/        # Dashboard, Forms, Lists
│   │   │   ├── auth/         # Login, Register
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── pages/            # Páginas principais
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API calls
│   │   ├── contexts/         # React contexts
│   │   └── lib/              # Utilities, helpers
│   └── public/               # Assets estáticos
│
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── models/           # Database models
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Auth, validation, CORS
│   │   ├── routes/           # API routes
│   │   ├── integrations/     # Egestor, WhatsApp, Maps
│   │   └── utils/            # Helpers, database
│   ├── database/
│   │   ├── migrations/       # DB schema changes
│   │   ├── seeds/            # Initial data
│   │   └── schema.sql        # Database structure
│   └── config/               # Environment configs
│
└── docs/                     # Documentação
    ├── api/                  # API documentation
    ├── deployment/           # Deploy guides
    └── user-manuals/         # User guides
```

---

## 🗄️ BANCO DE DADOS - POSTGRESQL

### **Schema Simplificado (Principais Tabelas)**

```sql
-- Usuários (PF/PJ unificado)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tipo VARCHAR(20) CHECK (tipo IN ('pessoa_fisica', 'pessoa_juridica', 'admin')),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- PF
    nome_completo VARCHAR(255),
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    
    -- PJ  
    razao_social VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE,
    responsavel_nome VARCHAR(255),
    
    -- Gamificação
    pontos_totais INTEGER DEFAULT 0,
    nivel VARCHAR(20) DEFAULT 'bronze',
    
    -- Integração
    egestor_id INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Produtos
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    origin VARCHAR(255),
    roast_level VARCHAR(50),
    flavor_notes TEXT,
    acidity VARCHAR(20),
    bitterness VARCHAR(20),
    stock_quantity INTEGER DEFAULT 0,
    images TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    egestor_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pedidos
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE,
    user_id UUID REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(30) DEFAULT 'pending',
    egestor_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Localizações (Mapa)
CREATE TABLE locations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(30) CHECK (type IN ('cafeteria', 'revendedor', 'loja_principal')),
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    phone VARCHAR(20),
    opening_hours JSONB,
    rating DECIMAL(3,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- WhatsApp
CREATE TABLE whatsapp_conversations (
    id UUID PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    customer_id UUID REFERENCES users(id),
    current_flow VARCHAR(100),
    context JSONB DEFAULT '{}',
    last_message_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 APIs E ENDPOINTS

### **Estrutura de Rotas**

```javascript
// Autenticação
POST   /api/auth/register           # Cadastro PF/PJ
POST   /api/auth/login              # Login
GET    /api/auth/profile            # Perfil do usuário
PUT    /api/auth/profile            # Atualizar perfil

// Produtos & Marketplace
GET    /api/products                # Listar com filtros avançados
GET    /api/products/:id            # Detalhes do produto
POST   /api/cart/add                # Adicionar ao carrinho
GET    /api/cart                    # Ver carrinho
POST   /api/orders                  # Finalizar compra

// Mapa de Cafeterias
GET    /api/locations               # Listar localizações
GET    /api/locations/nearby        # Por geolocalização
GET    /api/locations/:id           # Detalhes

// WhatsApp
POST   /api/whatsapp/webhook        # Receber mensagens
POST   /api/whatsapp/send           # Enviar mensagens

// Admin
GET    /api/admin/dashboard         # Métricas
GET    /api/admin/users             # Gerenciar clientes
GET    /api/admin/products          # Gerenciar produtos
```

---

## 🎮 SISTEMA DE GAMIFICAÇÃO

### **Regras de Pontuação**

```javascript
// Pessoa Física
const PF_RULES = {
  pointsPerReal: 1,
  levels: {
    bronze: { min: 0, discount: 0, gift: 'Adesivo' },
    prata: { min: 500, discount: 5, gift: 'Caneca' },
    ouro: { min: 1500, discount: 10, gift: 'Kit Degustação' },
    diamante: { min: 3000, discount: 15, gift: 'Curso Online' }
  }
};

// Pessoa Jurídica  
const PJ_RULES = {
  pointsPerReal: 2,
  volumeMultipliers: {
    1000: 1.5,   // Acima R$ 1k
    5000: 2.0,   // Acima R$ 5k  
    10000: 3.0   // Acima R$ 10k
  },
  levels: {
    bronze: { min: 0, discount: 2, gift: 'Material POS' },
    prata: { min: 2000, discount: 8, gift: 'Treinamento Barista' },
    ouro: { min: 8000, discount: 15, gift: 'Equipamento Profissional' },
    diamante: { min: 20000, discount: 25, gift: 'Consultoria Exclusiva' }
  }
};
```

---

## 🤖 AUTOMAÇÃO WHATSAPP

### **Fluxos de Atendimento**

```
👋 Olá! Bem-vindo à *Mestres do Café*! ☕

Escolha uma opção:
1️⃣ Ver nossos cafés especiais
2️⃣ Fazer um pedido
3️⃣ Acompanhar meu pedido  
4️⃣ Falar com atendente
5️⃣ Conhecer nossa história
6️⃣ Localizar pontos de venda
```

### **Automações Programadas**

```javascript
const AUTOMATIONS = {
  // Carrinho abandonado
  abandonedCart: [
    { delay: '1h', message: 'Você esqueceu alguns cafés no seu carrinho ☕' },
    { delay: '24h', message: 'Volte e ganhe 10% OFF com VOLTA10 🎁' },
    { delay: '72h', message: 'Última chance! Seus cafés especiais te esperam' }
  ],
  
  // Aniversário
  birthday: {
    message: '🎉 Parabéns! Ganhe 20% OFF de aniversário com ANIVER20'
  },
  
  // Reativação (30 dias sem comprar)
  reactivation: {
    message: 'Sentimos sua falta! Volte com 15% OFF usando VOLTEI15'
  }
};
```

---

## 🗺️ GOOGLE MAPS INTEGRATION

### **Configuração**

```javascript
const MAP_CONFIG = {
  center: { lat: -29.6842, lng: -53.8069 }, // Santa Maria, RS
  zoom: 12,
  markers: {
    cafeteria: '/icons/coffee-cup.svg',
    revendedor: '/icons/store.svg', 
    loja_principal: '/icons/main-store.svg'
  }
};

// Funcionalidades
- Geolocalização do usuário
- Busca por proximidade
- Filtros (tipo, distância, avaliação)
- Direções integradas
- Modal com detalhes do local
```

---

## 🔄 INTEGRAÇÃO EGESTOR

### **Sincronização Bidirecional**

```javascript
const EGESTOR_SYNC = {
  // Clientes: Sistema → Egestor
  syncCustomer: async (customer) => {
    const egestorData = {
      nome: customer.nome_completo || customer.razao_social,
      cpfCnpj: customer.cpf || customer.cnpj,
      emails: [{ email: customer.email }],
      fones: [{ fone: customer.phone }]
    };
    
    return await egestorAPI.createContact(egestorData);
  },
  
  // Produtos: Egestor → Sistema  
  syncProducts: async () => {
    const products = await egestorAPI.getProducts();
    // Atualizar estoque local
  },
  
  // Pedidos: Sistema → Egestor
  syncOrder: async (order) => {
    const egestorOrder = {
      contato_id: order.user.egestor_id,
      itens: order.items,
      situacao: 10 // Orçamento
    };
    
    return await egestorAPI.createSale(egestorOrder);
  }
};
```

---

## 💳 MERCADO PAGO INTEGRATION

### **Métodos de Pagamento**

```javascript
const PAYMENT_METHODS = {
  credit_card: {
    installments: 12,
    brands: ['visa', 'mastercard', 'amex', 'elo']
  },
  pix: {
    expiration: 30 // minutos
  },
  bank_transfer: true
};

// Fluxo de Pagamento
1. Criar preferência no MP
2. Redirecionar cliente
3. Receber webhook de confirmação
4. Atualizar status do pedido
5. Sincronizar com Egestor
```

---

## 🚀 DEPLOY E INFRAESTRUTURA

### **Frontend (Vercel)**
```yaml
# vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### **Backend (Render)**
```yaml
# render.yaml
services:
  - type: web
    name: mestres-cafe-api
    env: node
    buildCommand: npm install
    startCommand: npm start
```

### **Banco (Supabase)**
- PostgreSQL hospedado
- Backup automático
- SSL configurado

---

## 🔒 SEGURANÇA & PERFORMANCE

### **Autenticação**
```javascript
// JWT com refresh tokens
const JWT_CONFIG = {
  accessToken: { expiresIn: '15m' },
  refreshToken: { expiresIn: '7d' }
};

// Rate limiting
const RATE_LIMITS = {
  auth: '5 req/15min',
  api: '100 req/15min'
};
```

### **Performance**
- Lazy loading de componentes
- Cache de dados frequentes  
- Otimização de imagens
- CDN para assets estáticos
- Paginação em listas grandes

---

## 📊 MÉTRICAS E MONITORAMENTO

### **KPIs Importantes**
- Conversão visitante → cadastro
- Taxa de abandono do carrinho
- Engajamento WhatsApp
- Tempo de resposta da API
- Uptime do sistema

### **Alertas**
- Falha nas integrações
- Erro 5xx em alta frequência
- Tempo de resposta > 2s
- Estoque baixo

---

## 📱 STACK TECNOLÓGICA FINAL

### **Frontend**
- ✅ React.js 19.1.0
- ✅ Vite 6.3.5  
- ✅ TailwindCSS 4.1.7
- ✅ Radix UI (shadcn/ui)
- ✅ React Router DOM
- ✅ React Hook Form + Zod

### **Backend** (a implementar)
- Node.js + Express.js
- PostgreSQL (Supabase)
- JWT Authentication
- bcrypt (senhas)

### **Integrações** (a implementar)
- Egestor API
- Google Maps API
- Z-API (WhatsApp)
- Mercado Pago
- Correios (frete)

---

## 🎯 PRÓXIMAS AÇÕES

### **Semana 1 (10-16/06)**
1. ✅ Setup backend Node.js
2. ✅ Configurar PostgreSQL
3. ✅ Implementar APIs básicas
4. ✅ Integrar frontend com backend

### **Semana 2 (17-23/06)**
1. Sistema de pontuação PF/PJ
2. Integração Egestor
3. Dashboard de clientes

### **Semana 3 (24-30/06)**  
1. Mapa interativo
2. Automação WhatsApp
3. Templates de mensagens

### **Semana 4 (01-07/07)**
1. Gateway de pagamento
2. Testes completos
3. Otimizações

### **Semana 5 (08-10/07)**
1. Deploy em produção
2. Documentação final
3. Entrega oficial

---

*Especificações v1.0 - Kalleby Evangelho Mota - 10/06/2025* 