# 📡 Especificações de API - Mestres Café Enterprise

## Visão Geral

Este documento contém todas as especificações detalhadas da API REST do sistema Mestres Café Enterprise, incluindo endpoints, contratos, schemas de request/response e códigos de erro.

## 1. Informações Gerais da API

### Base URL e Versionamento

```yaml
base_url: "https://api.mestrescafe.com"
version: "v1"
full_base_url: "https://api.mestrescafe.com/api/v1"
```

### Autenticação

```yaml
authentication:
  type: "Bearer Token (JWT)"
  header: "Authorization: Bearer <token>"
  token_lifetime: 3600  # segundos
  refresh_token_lifetime: 2592000  # 30 dias
```

### Padrões de Response

```json
{
  "success_response": {
    "success": true,
    "data": "object | array",
    "message": "string (optional)",
    "meta": {
      "timestamp": "ISO 8601",
      "request_id": "uuid"
    }
  },
  "error_response": {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "Human readable message",
      "details": "object (optional)"
    },
    "meta": {
      "timestamp": "ISO 8601",
      "request_id": "uuid"
    }
  }
}
```

## 2. Autenticação e Autorização

### POST /api/v1/auth/register

**Descrição**: Registra um novo usuário no sistema

**Request Body:**
```json
{
  "email": "string (required, email format)",
  "password": "string (required, min 8 chars)",
  "full_name": "string (required, min 2 chars)",
  "phone": "string (optional, valid phone)",
  "accept_terms": "boolean (required, must be true)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "João Silva",
      "phone": "+5511999999999",
      "is_verified": false,
      "created_at": "2025-01-06T19:00:00Z"
    },
    "verification_token": "abc123..."
  },
  "message": "User registered successfully. Please verify your email."
}
```

### POST /api/v1/auth/login

**Descrição**: Autentica um usuário e retorna tokens JWT

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "João Silva",
      "roles": ["customer"]
    }
  }
}
```

### POST /api/v1/auth/refresh

**Descrição**: Renova o access token usando refresh token

**Request Body:**
```json
{
  "refresh_token": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "expires_in": 3600
  }
}
```

### POST /api/v1/auth/logout

**Descrição**: Invalida o token atual do usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

## 3. Gestão de Usuários

### GET /api/v1/users/profile

**Descrição**: Retorna o perfil do usuário autenticado

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "João Silva",
    "phone": "+5511999999999",
    "birth_date": "1990-01-01",
    "is_verified": true,
    "preferences": {
      "newsletter": true,
      "notifications": true,
      "language": "pt-BR"
    },
    "addresses": [
      {
        "id": 1,
        "type": "home",
        "street": "Rua das Flores, 123",
        "city": "São Paulo",
        "state": "SP",
        "postal_code": "01234-567",
        "country": "BR",
        "is_default": true
      }
    ],
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-06T19:00:00Z"
  }
}
```

### PUT /api/v1/users/profile

**Descrição**: Atualiza o perfil do usuário autenticado

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "full_name": "string (optional)",
  "phone": "string (optional)",
  "birth_date": "string (optional, YYYY-MM-DD)",
  "preferences": {
    "newsletter": "boolean (optional)",
    "notifications": "boolean (optional)",
    "language": "string (optional)"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "João Silva Santos",
    "updated_at": "2025-01-06T19:05:00Z"
  },
  "message": "Profile updated successfully"
}
```

## 4. Catálogo de Produtos

### GET /api/v1/products

**Descrição**: Lista produtos com filtros e paginação

**Query Parameters:**
```
page: integer (default: 1)
per_page: integer (default: 20, max: 100)
category_id: integer (optional)
search: string (optional)
min_price: decimal (optional)
max_price: decimal (optional)
sort_by: string (optional: name, price, created_at)
sort_order: string (optional: asc, desc)
in_stock: boolean (optional)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Café Arábica Premium",
        "slug": "cafe-arabica-premium",
        "description": "Café 100% arábica de alta qualidade...",
        "price": 29.90,
        "original_price": 35.90,
        "discount_percentage": 16.7,
        "sku": "CAF-ARA-001",
        "stock_quantity": 150,
        "category": {
          "id": 1,
          "name": "Cafés Especiais",
          "slug": "cafes-especiais"
        },
        "brand": "Mestres Café",
        "images": [
          {
            "id": 1,
            "url": "https://cdn.mestrescafe.com/products/cafe-arabica-1.jpg",
            "alt": "Café Arábica Premium",
            "is_primary": true
          }
        ],
        "attributes": {
          "weight": "500g",
          "origin": "Minas Gerais",
          "roast_level": "Medium",
          "certification": "Organic"
        },
        "rating": {
          "average": 4.8,
          "count": 245
        },
        "is_active": true,
        "created_at": "2025-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 156,
      "pages": 8,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### GET /api/v1/products/{id}

**Descrição**: Retorna detalhes de um produto específico

**Path Parameters:**
```
id: integer (required)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Café Arábica Premium",
    "slug": "cafe-arabica-premium",
    "description": "Descrição completa do produto...",
    "detailed_description": "Descrição detalhada com HTML...",
    "price": 29.90,
    "cost_price": 18.50,
    "sku": "CAF-ARA-001",
    "stock_quantity": 150,
    "category": {
      "id": 1,
      "name": "Cafés Especiais",
      "slug": "cafes-especiais",
      "breadcrumb": ["Home", "Produtos", "Cafés Especiais"]
    },
    "brand": "Mestres Café",
    "images": [
      {
        "id": 1,
        "url": "https://cdn.mestrescafe.com/products/cafe-arabica-1.jpg",
        "thumbnail_url": "https://cdn.mestrescafe.com/products/thumbs/cafe-arabica-1.jpg",
        "alt": "Café Arábica Premium",
        "is_primary": true,
        "sort_order": 1
      }
    ],
    "attributes": {
      "weight": "500g",
      "origin": "Minas Gerais",
      "roast_level": "Medium",
      "certification": "Organic",
      "caffeine_content": "High",
      "flavor_notes": ["Chocolate", "Caramel", "Nuts"]
    },
    "specifications": {
      "dimensions": "15x10x5 cm",
      "weight": "500g",
      "shelf_life": "12 months",
      "storage": "Cool, dry place"
    },
    "seo": {
      "meta_title": "Café Arábica Premium - Mestres Café",
      "meta_description": "Experimente nosso Café Arábica Premium...",
      "keywords": ["café", "arábica", "premium", "especial"]
    },
    "rating": {
      "average": 4.8,
      "count": 245,
      "distribution": {
        "5": 180,
        "4": 45,
        "3": 15,
        "2": 3,
        "1": 2
      }
    },
    "related_products": [2, 3, 4, 5],
    "is_active": true,
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-06T15:30:00Z"
  }
}
```

## 5. Carrinho de Compras

### GET /api/v1/cart

**Descrição**: Retorna o carrinho do usuário autenticado

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Café Arábica Premium",
          "price": 29.90,
          "image": "https://cdn.mestrescafe.com/products/thumbs/cafe-arabica-1.jpg"
        },
        "quantity": 2,
        "unit_price": 29.90,
        "subtotal": 59.80,
        "added_at": "2025-01-06T18:30:00Z"
      }
    ],
    "summary": {
      "items_count": 1,
      "total_quantity": 2,
      "subtotal": 59.80,
      "discount": 0.00,
      "shipping": 15.00,
      "tax": 0.00,
      "total": 74.80
    },
    "created_at": "2025-01-06T18:30:00Z",
    "updated_at": "2025-01-06T18:35:00Z"
  }
}
```

### POST /api/v1/cart/items

**Descrição**: Adiciona um item ao carrinho

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "product_id": "integer (required)",
  "quantity": "integer (required, min: 1)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 2,
      "product": {
        "id": 2,
        "name": "Café Bourbon Premium",
        "price": 32.90
      },
      "quantity": 1,
      "unit_price": 32.90,
      "subtotal": 32.90,
      "added_at": "2025-01-06T19:00:00Z"
    },
    "cart_summary": {
      "items_count": 2,
      "total_quantity": 3,
      "subtotal": 92.70,
      "total": 107.70
    }
  },
  "message": "Item added to cart successfully"
}
```

### PUT /api/v1/cart/items/{item_id}

**Descrição**: Atualiza a quantidade de um item no carrinho

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
```
item_id: integer (required)
```

**Request Body:**
```json
{
  "quantity": "integer (required, min: 1)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "quantity": 3,
      "subtotal": 89.70
    },
    "cart_summary": {
      "items_count": 2,
      "total_quantity": 4,
      "subtotal": 122.60,
      "total": 137.60
    }
  },
  "message": "Cart item updated successfully"
}
```

### DELETE /api/v1/cart/items/{item_id}

**Descrição**: Remove um item do carrinho

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
```
item_id: integer (required)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cart_summary": {
      "items_count": 1,
      "total_quantity": 1,
      "subtotal": 32.90,
      "total": 47.90
    }
  },
  "message": "Item removed from cart successfully"
}
```

## 6. Gestão de Pedidos

### POST /api/v1/orders

**Descrição**: Cria um novo pedido a partir do carrinho

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "shipping_address": {
    "street": "string (required)",
    "number": "string (required)",
    "complement": "string (optional)",
    "neighborhood": "string (required)",
    "city": "string (required)",
    "state": "string (required)",
    "postal_code": "string (required)",
    "country": "string (required, default: BR)"
  },
  "billing_address": {
    "same_as_shipping": "boolean (default: true)",
    "street": "string (conditional)",
    "number": "string (conditional)",
    "complement": "string (optional)",
    "neighborhood": "string (conditional)",
    "city": "string (conditional)",
    "state": "string (conditional)",
    "postal_code": "string (conditional)",
    "country": "string (conditional)"
  },
  "payment_method": {
    "type": "string (required: credit_card, debit_card, pix, boleto)",
    "installments": "integer (optional, 1-12)",
    "card_token": "string (required for cards)",
    "save_card": "boolean (optional, default: false)"
  },
  "coupon_code": "string (optional)",
  "notes": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1001,
      "order_number": "MST-2025-001001",
      "status": "pending_payment",
      "items": [
        {
          "id": 1,
          "product": {
            "id": 1,
            "name": "Café Arábica Premium",
            "sku": "CAF-ARA-001"
          },
          "quantity": 2,
          "unit_price": 29.90,
          "total_price": 59.80
        }
      ],
      "summary": {
        "subtotal": 59.80,
        "discount": 5.98,
        "shipping": 15.00,
        "tax": 0.00,
        "total": 68.82
      },
      "shipping_address": {
        "street": "Rua das Flores, 123",
        "city": "São Paulo",
        "state": "SP",
        "postal_code": "01234-567"
      },
      "payment": {
        "method": "credit_card",
        "installments": 3,
        "status": "pending"
      },
      "estimated_delivery": "2025-01-13",
      "created_at": "2025-01-06T19:10:00Z"
    },
    "payment_url": "https://payment.gateway.com/checkout/xyz123"
  },
  "message": "Order created successfully"
}
```

### GET /api/v1/orders

**Descrição**: Lista pedidos do usuário autenticado

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page: integer (default: 1)
per_page: integer (default: 10)
status: string (optional: pending, paid, processing, shipped, delivered, cancelled)
date_from: string (optional, YYYY-MM-DD)
date_to: string (optional, YYYY-MM-DD)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1001,
        "order_number": "MST-2025-001001",
        "status": "processing",
        "total": 68.82,
        "items_count": 1,
        "created_at": "2025-01-06T19:10:00Z",
        "estimated_delivery": "2025-01-13"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### GET /api/v1/orders/{order_id}

**Descrição**: Retorna detalhes de um pedido específico

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
```
order_id: integer (required)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "order_number": "MST-2025-001001",
    "status": "processing",
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Café Arábica Premium",
          "sku": "CAF-ARA-001",
          "image": "https://cdn.mestrescafe.com/products/thumbs/cafe-arabica-1.jpg"
        },
        "quantity": 2,
        "unit_price": 29.90,
        "total_price": 59.80
      }
    ],
    "summary": {
      "subtotal": 59.80,
      "discount": 5.98,
      "shipping": 15.00,
      "tax": 0.00,
      "total": 68.82
    },
    "shipping_address": {
      "street": "Rua das Flores, 123",
      "number": "456",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "postal_code": "01234-567",
      "country": "BR"
    },
    "billing_address": {
      "same_as_shipping": true
    },
    "payment": {
      "method": "credit_card",
      "installments": 3,
      "status": "paid",
      "paid_at": "2025-01-06T19:15:00Z"
    },
    "tracking": {
      "code": "BR123456789BR",
      "url": "https://tracking.correios.com.br/BR123456789BR",
      "carrier": "Correios",
      "status": "in_transit"
    },
    "timeline": [
      {
        "status": "pending_payment",
        "timestamp": "2025-01-06T19:10:00Z",
        "description": "Pedido criado, aguardando pagamento"
      },
      {
        "status": "paid",
        "timestamp": "2025-01-06T19:15:00Z",
        "description": "Pagamento confirmado"
      },
      {
        "status": "processing",
        "timestamp": "2025-01-07T09:00:00Z",
        "description": "Pedido em processamento"
      }
    ],
    "estimated_delivery": "2025-01-13",
    "created_at": "2025-01-06T19:10:00Z",
    "updated_at": "2025-01-07T09:00:00Z"
  }
}
```

## 7. Códigos de Erro

### Códigos HTTP e Significados

```yaml
http_codes:
  200: "OK - Sucesso"
  201: "Created - Recurso criado com sucesso"
  204: "No Content - Sucesso sem conteúdo de retorno"
  400: "Bad Request - Dados inválidos na requisição"
  401: "Unauthorized - Token inválido ou expirado"
  403: "Forbidden - Sem permissão para acessar o recurso"
  404: "Not Found - Recurso não encontrado"
  409: "Conflict - Conflito (ex: email já existe)"
  422: "Unprocessable Entity - Dados válidos mas não processáveis"
  429: "Too Many Requests - Rate limit excedido"
  500: "Internal Server Error - Erro interno do servidor"
  503: "Service Unavailable - Serviço temporariamente indisponível"
```

### Códigos de Erro Customizados

```yaml
error_codes:
  # Authentication & Authorization
  AUTH_INVALID_CREDENTIALS: "Credenciais inválidas"
  AUTH_TOKEN_EXPIRED: "Token expirado"
  AUTH_TOKEN_INVALID: "Token inválido"
  AUTH_ACCOUNT_DISABLED: "Conta desabilitada"
  AUTH_EMAIL_NOT_VERIFIED: "Email não verificado"
  AUTH_PERMISSION_DENIED: "Permissão negada"
  
  # User Management
  USER_NOT_FOUND: "Usuário não encontrado"
  USER_EMAIL_EXISTS: "Email já está em uso"
  USER_INVALID_EMAIL: "Email inválido"
  USER_WEAK_PASSWORD: "Senha muito fraca"
  
  # Products
  PRODUCT_NOT_FOUND: "Produto não encontrado"
  PRODUCT_OUT_OF_STOCK: "Produto fora de estoque"
  PRODUCT_INSUFFICIENT_STOCK: "Estoque insuficiente"
  PRODUCT_INACTIVE: "Produto inativo"
  
  # Cart & Orders
  CART_EMPTY: "Carrinho vazio"
  CART_ITEM_NOT_FOUND: "Item não encontrado no carrinho"
  ORDER_NOT_FOUND: "Pedido não encontrado"
  ORDER_ALREADY_PROCESSED: "Pedido já processado"
  ORDER_CANNOT_BE_CANCELLED: "Pedido não pode ser cancelado"
  
  # Payment
  PAYMENT_FAILED: "Falha no pagamento"
  PAYMENT_DECLINED: "Pagamento recusado"
  PAYMENT_INVALID_METHOD: "Método de pagamento inválido"
  PAYMENT_AMOUNT_MISMATCH: "Valor do pagamento não confere"
  
  # Validation
  VALIDATION_REQUIRED_FIELD: "Campo obrigatório"
  VALIDATION_INVALID_FORMAT: "Formato inválido"
  VALIDATION_VALUE_TOO_LONG: "Valor muito longo"
  VALIDATION_VALUE_TOO_SHORT: "Valor muito curto"
  
  # Rate Limiting
  RATE_LIMIT_EXCEEDED: "Limite de requisições excedido"
  
  # System
  MAINTENANCE_MODE: "Sistema em manutenção"
  FEATURE_DISABLED: "Funcionalidade desabilitada"
  EXTERNAL_SERVICE_ERROR: "Erro em serviço externo"
```

### Exemplos de Respostas de Erro

```json
{
  "error_401_example": {
    "success": false,
    "error": {
      "code": "AUTH_TOKEN_EXPIRED",
      "message": "Token expirado. Faça login novamente.",
      "details": {
        "expired_at": "2025-01-06T18:00:00Z"
      }
    },
    "meta": {
      "timestamp": "2025-01-06T19:00:00Z",
      "request_id": "req_abc123"
    }
  },
  "error_422_example": {
    "success": false,
    "error": {
      "code": "VALIDATION_REQUIRED_FIELD",
      "message": "Dados de validação falharam",
      "details": {
        "fields": {
          "email": ["Campo obrigatório"],
          "password": ["Senha deve ter pelo menos 8 caracteres"]
        }
      }
    },
    "meta": {
      "timestamp": "2025-01-06T19:00:00Z",
      "request_id": "req_def456"
    }
  }
}
```

## 8. Rate Limiting

### Limites por Endpoint

```yaml
rate_limits:
  authentication:
    "/api/v1/auth/login": "5 requests per minute"
    "/api/v1/auth/register": "3 requests per minute"
    "/api/v1/auth/refresh": "10 requests per minute"
    
  general:
    "/api/v1/products": "60 requests per minute"
    "/api/v1/cart/*": "30 requests per minute"
    "/api/v1/orders": "20 requests per minute"
    
  admin:
    "/api/v1/admin/*": "100 requests per minute"
    
  default: "30 requests per minute"
```

### Headers de Rate Limiting

```yaml
response_headers:
  "X-RateLimit-Limit": "Limite máximo de requisições"
  "X-RateLimit-Remaining": "Requisições restantes"
  "X-RateLimit-Reset": "Timestamp quando o limite será resetado"
  "Retry-After": "Segundos para tentar novamente (quando limit excedido)"
```

## 9. Webhooks

### Eventos Disponíveis

```yaml
webhook_events:
  user:
    - "user.created"
    - "user.updated"
    - "user.verified"
    
  order:
    - "order.created"
    - "order.paid"
    - "order.processing"
    - "order.shipped"
    - "order.delivered"
    - "order.cancelled"
    
  payment:
    - "payment.successful"
    - "payment.failed"
    - "payment.refunded"
    
  product:
    - "product.created"
    - "product.updated"
    - "product.stock_low"
```

### Estrutura do Webhook

```json
{
  "webhook_payload": {
    "id": "evt_abc123",
    "event": "order.paid",
    "created_at": "2025-01-06T19:15:00Z",
    "data": {
      "object": "order",
      "id": 1001,
      "order_number": "MST-2025-001001",
      "status": "paid",
      "total": 68.82,
      "user_id": 123
    },
    "webhook": {
      "id": "wh_def456",
      "url": "https://your-app.com/webhooks/mestres-cafe"
    }
  }
}
```

## Conclusão

Esta documentação de API fornece uma referência completa para integração com o sistema Mestres Café Enterprise, incluindo:

- **Endpoints detalhados** com todos os parâmetros e respostas
- **Schemas de validação** para requests e responses
- **Sistema de autenticação** JWT robusto
- **Códigos de erro** padronizados e informativos
- **Rate limiting** para proteção da API
- **Webhooks** para notificações em tempo real

A API segue padrões REST e oferece uma experiência consistente para desenvolvedores.