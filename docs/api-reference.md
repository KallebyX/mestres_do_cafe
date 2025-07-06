# 📡 API Reference

Este documento detalha todos os endpoints disponíveis na API do Café Enterprise.

## 🔗 Base URL

```
# Desenvolvimento
http://localhost:5000/api

# Produção
https://api.seudominio.com/api
```

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

### Headers Obrigatórios

```http
Authorization: Bearer <seu-jwt-token>
Content-Type: application/json
```

### Exemplo de Request

```javascript
fetch('/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## 👤 Autenticação

### POST /auth/register

Registra um novo usuário.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "role": "customer"
  }
}
```

### POST /auth/login

Autentica um usuário existente.

**Request Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "role": "customer"
  }
}
```

### POST /auth/refresh

Renova o token de acesso.

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### POST /auth/logout

Faz logout do usuário.

## 🛍️ Produtos

### GET /products

Lista todos os produtos com paginação.

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `per_page`: Items por página (padrão: 20, máximo: 100)
- `category_id`: Filtrar por categoria
- `search`: Buscar por nome
- `min_price`: Preço mínimo
- `max_price`: Preço máximo

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Café Especial Arábica",
      "description": "Café de origem única...",
      "price": 29.90,
      "weight": 250,
      "origin": "Minas Gerais",
      "sca_score": 85,
      "flavor_notes": ["chocolate", "caramelo"],
      "stock_quantity": 50,
      "category": {
        "id": 1,
        "name": "Café Especial"
      },
      "images": ["url1", "url2"]
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "pages": 5
  }
}
```

### GET /products/{id}

Retorna um produto específico.

**Response:**
```json
{
  "id": 1,
  "name": "Café Especial Arábica",
  "description": "Café de origem única...",
  "price": 29.90,
  "weight": 250,
  "origin": "Minas Gerais",
  "sca_score": 85,
  "flavor_notes": ["chocolate", "caramelo"],
  "stock_quantity": 50,
  "category": {
    "id": 1,
    "name": "Café Especial"
  },
  "images": ["url1", "url2"],
  "reviews": [
    {
      "id": 1,
      "user": "Maria Silva",
      "rating": 5,
      "comment": "Excelente café!",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /products *(Admin only)*

Cria um novo produto.

**Request Body:**
```json
{
  "name": "Café Especial Arábica",
  "description": "Café de origem única...",
  "price": 29.90,
  "weight": 250,
  "origin": "Minas Gerais",
  "sca_score": 85,
  "flavor_notes": ["chocolate", "caramelo"],
  "stock_quantity": 50,
  "category_id": 1
}
```

### PUT /products/{id} *(Admin only)*

Atualiza um produto existente.

### DELETE /products/{id} *(Admin only)*

Remove um produto.

## 🛒 Carrinho

### GET /cart

Retorna o carrinho do usuário atual.

**Response:**
```json
{
  "id": 1,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Café Especial Arábica",
        "price": 29.90
      },
      "quantity": 2,
      "subtotal": 59.80
    }
  ],
  "total": 59.80,
  "items_count": 2
}
```

### POST /cart/items

Adiciona item ao carrinho.

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

### PUT /cart/items/{id}

Atualiza quantidade de um item.

**Request Body:**
```json
{
  "quantity": 3
}
```

### DELETE /cart/items/{id}

Remove item do carrinho.

## 📦 Pedidos

### GET /orders

Lista pedidos do usuário.

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "status": "confirmed",
      "total": 89.70,
      "created_at": "2024-01-15T10:30:00Z",
      "items": [
        {
          "product": "Café Especial Arábica",
          "quantity": 3,
          "price": 29.90
        }
      ],
      "shipping_address": {
        "street": "Rua das Flores, 123",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01234-567"
      }
    }
  ]
}
```

### POST /orders

Cria um novo pedido.

**Request Body:**
```json
{
  "shipping_address": {
    "street": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567"
  },
  "payment_method": "credit_card",
  "payment_details": {
    "card_token": "card_token_from_payment_gateway"
  }
}
```

### GET /orders/{id}

Retorna detalhes de um pedido específico.

## 👥 Usuários

### GET /users/profile

Retorna perfil do usuário atual.

**Response:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "role": "customer",
  "created_at": "2024-01-01T00:00:00Z",
  "profile": {
    "phone": "+55 11 99999-9999",
    "birth_date": "1990-01-01",
    "addresses": [
      {
        "id": 1,
        "street": "Rua das Flores, 123",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01234-567",
        "is_default": true
      }
    ]
  }
}
```

### PUT /users/profile

Atualiza perfil do usuário.

## 📊 Dashboard *(Admin only)*

### GET /admin/dashboard/stats

Retorna estatísticas gerais.

**Response:**
```json
{
  "total_users": 1234,
  "total_orders": 567,
  "total_revenue": 45678.90,
  "pending_orders": 23,
  "monthly_stats": {
    "users_growth": 15.2,
    "orders_growth": 8.7,
    "revenue_growth": 12.3
  }
}
```

## 📂 Categorias

### GET /categories

Lista todas as categorias.

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Café Especial",
      "slug": "cafe-especial",
      "description": "Cafés de alta qualidade...",
      "products_count": 25
    }
  ]
}
```

## 📧 Newsletter

### POST /newsletter/subscribe

Inscreve email na newsletter.

**Request Body:**
```json
{
  "email": "joao@exemplo.com",
  "name": "João Silva"
}
```

## 🔍 Busca

### GET /search

Busca geral no sistema.

**Query Parameters:**
- `q`: Termo de busca
- `type`: Tipo (products, orders, users)
- `limit`: Limite de resultados

## ❌ Códigos de Erro

### 400 - Bad Request
```json
{
  "error": "Dados inválidos",
  "details": {
    "email": ["Este campo é obrigatório"],
    "password": ["Senha deve ter pelo menos 6 caracteres"]
  }
}
```

### 401 - Unauthorized
```json
{
  "error": "Token inválido ou expirado"
}
```

### 403 - Forbidden
```json
{
  "error": "Acesso negado"
}
```

### 404 - Not Found
```json
{
  "error": "Recurso não encontrado"
}
```

### 429 - Too Many Requests
```json
{
  "error": "Muitas requisições. Tente novamente em 60 segundos"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Erro interno do servidor"
}
```

## 🔄 Rate Limiting

- **Limit**: 100 requests por minuto por IP
- **Header de resposta**: `X-RateLimit-Remaining`
- **Reset**: `X-RateLimit-Reset`

## 📝 Versionamento

- **Versão atual**: v1
- **Header**: `X-API-Version: 1`
- **URL**: `/api/v1/...` (opcional)

## 🧪 Ambiente de Teste

```bash
# Base URL de teste
https://api-staging.seudominio.com/api

# Usuário de teste
email: test@exemplo.com
password: teste123
```

## 📚 SDKs e Wrappers

### JavaScript/TypeScript
```javascript
import { CafeAPI } from '@cafe/api-client'

const api = new CafeAPI({
  baseURL: 'https://api.seudominio.com/api',
  token: 'seu-token'
})

const products = await api.products.list()
```

### Python
```python
from cafe_api import CafeClient

client = CafeClient(
    base_url='https://api.seudominio.com/api',
    token='seu-token'
)

products = client.products.list()
```

---

**Para mais informações**, consulte a [documentação interativa](https://api.seudominio.com/docs) gerada automaticamente.