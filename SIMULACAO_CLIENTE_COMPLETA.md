# Simulação Completa do Fluxo de Cliente - Mestres do Café Enterprise

## 📋 Cenário de Simulação

**Você é um cliente que está descobrindo a plataforma Mestres do Café pela primeira vez. Você ouvi falar sobre os cafés especiais e quer fazer sua primeira compra.**

## 🔄 Fluxo Completo da Simulação

### 1. Cadastro de Cliente
```bash
# Endpoint: POST /api/auth/register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria.silva@email.com",
    "password": "senha123",
    "phone": "(11) 99999-9999"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid-gerado",
    "email": "maria.silva@email.com",
    "username": "maria.silva",
    "full_name": "Maria Silva",
    "is_admin": false,
    "role": "customer",
    "points": 0,
    "level": "bronze"
  }
}
```

### 2. Login do Cliente
```bash
# Endpoint: POST /api/auth/login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.silva@email.com",
    "password": "senha123"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "access_token": "jwt-token-aqui",
  "user": {
    "id": "uuid-do-usuario",
    "email": "maria.silva@email.com",
    "username": "maria.silva",
    "name": "Maria Silva",
    "is_admin": false,
    "user_type": "customer",
    "points": 0,
    "level": "bronze"
  }
}
```

### 3. Navegar no Marketplace
```bash
# Endpoint: GET /api/products (listar produtos)
curl -X GET "http://localhost:5001/api/products?page=1&per_page=12" \
  -H "Authorization: Bearer jwt-token-aqui"
```

**Resposta esperada:**
```json
{
  "products": [
    {
      "id": "produto-uuid",
      "name": "Café Especial Santos",
      "description": "Café 100% arábica da região de Santos",
      "price": 25.90,
      "category": "especial",
      "image_url": "https://...",
      "stock_quantity": 50,
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 60
  }
}
```

### 4. Adicionar Produto ao Carrinho
```bash
# Endpoint: POST /api/cart/items
curl -X POST http://localhost:5001/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt-token-aqui" \
  -d '{
    "user_id": "uuid-do-usuario",
    "product_id": "produto-uuid",
    "quantity": 2
  }'
```

**Resposta esperada:**
```json
{
  "message": "Produto adicionado ao carrinho"
}
```

### 5. Visualizar Carrinho
```bash
# Endpoint: GET /api/cart
curl -X GET "http://localhost:5001/api/cart?user_id=uuid-do-usuario" \
  -H "Authorization: Bearer jwt-token-aqui"
```

**Resposta esperada:**
```json
{
  "items": [
    {
      "id": "cart-item-uuid",
      "product_id": "produto-uuid",
      "quantity": 2,
      "product": {
        "id": "produto-uuid",
        "name": "Café Especial Santos",
        "price": 25.90,
        "image_url": "https://...",
        "stock_quantity": 50
      },
      "subtotal": 51.80
    }
  ],
  "total": 51.80,
  "items_count": 1
}
```

### 6. Calcular Frete
```bash
# Endpoint: POST /api/checkout/shipping-options
curl -X POST http://localhost:5001/api/checkout/shipping-options \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt-token-aqui" \
  -d '{
    "session_token": "session-token",
    "user_id": "uuid-do-usuario",
    "destination_cep": "01310-100",
    "products": [
      {
        "product_id": "produto-uuid",
        "quantity": 2,
        "weight": 0.5
      }
    ]
  }'
```

**Resposta esperada:**
```json
{
  "message": "Opções de frete calculadas com sucesso",
  "shipping_options": [
    {
      "id": "shipping-uuid",
      "carrier_name": "Correios",
      "service_name": "PAC",
      "price": 12.00,
      "delivery_time": 7,
      "description": "Entrega padrão dos Correios"
    },
    {
      "id": "shipping-uuid-2",
      "carrier_name": "Correios",
      "service_name": "SEDEX",
      "price": 18.00,
      "delivery_time": 3,
      "description": "Entrega expressa dos Correios"
    }
  ]
}
```

### 7. Iniciar Checkout
```bash
# Endpoint: POST /api/checkout/start
curl -X POST http://localhost:5001/api/checkout/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt-token-aqui" \
  -d '{
    "user_id": "uuid-do-usuario"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Checkout iniciado com sucesso",
  "session_token": "checkout-session-token",
  "checkout_session": {
    "session_token": "checkout-session-token",
    "user_id": "uuid-do-usuario",
    "status": "cart_review",
    "cart_total": 51.80,
    "cart_data": [
      {
        "product_id": "produto-uuid",
        "name": "Café Especial Santos",
        "price": 25.90,
        "quantity": 2,
        "subtotal": 51.80
      }
    ]
  }
}
```

### 8. Finalizar Compra
```bash
# Endpoint: POST /api/checkout/complete
curl -X POST http://localhost:5001/api/checkout/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt-token-aqui" \
  -d '{
    "session_token": "checkout-session-token",
    "user_id": "uuid-do-usuario",
    "shipping_data": {
      "street": "Rua das Flores, 123",
      "number": "123",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "cep": "01310-100",
      "phone": "(11) 99999-9999",
      "delivery_instructions": "Portão azul"
    },
    "payment_data": {
      "method": "pix",
      "installments": 1
    },
    "cart_data": [
      {
        "product_id": "produto-uuid",
        "price": 25.90,
        "quantity": 2,
        "subtotal": 51.80
      }
    ],
    "totals": {
      "subtotal": 51.80,
      "shipping_total": 12.00,
      "tax_total": 0.00,
      "discount_total": 0.00,
      "final_total": 63.80
    }
  }'
```

**Resposta esperada:**
```json
{
  "message": "Checkout finalizado com sucesso",
  "order": {
    "id": "order-uuid",
    "order_number": "MC20250715123456ABCD1234",
    "total_amount": 63.80,
    "status": "pending"
  }
}
```

## 🔍 Pontos de Verificação Durante a Simulação

### Após Cadastro:
- ✅ Usuário criado no sistema
- ✅ Perfil de cliente (customer) configurado
- ✅ Pontos de gamificação inicial (0)
- ✅ Nível bronze atribuído

### Após Login:
- ✅ JWT token gerado
- ✅ Sessão de usuário criada
- ✅ Dados do perfil retornados

### Após Adicionar ao Carrinho:
- ✅ Produto adicionado ao carrinho
- ✅ Carrinho criado/atualizado para o usuário
- ✅ Estoque não alterado (apenas na finalização)

### Após Cálculo de Frete:
- ✅ Opções de frete calculadas
- ✅ Diferentes modalidades disponíveis
- ✅ Preços e prazos estimados

### Após Finalizar Compra:
- ✅ Pedido criado no sistema
- ✅ Estoque automaticamente reduzido
- ✅ Carrinho limpo
- ✅ Cliente atualizado no CRM
- ✅ Número de pedido gerado

## 📱 Simulação via Interface Web

### Acesso à Interface:
1. **URL**: `http://localhost:5001`
2. **Página de cadastro**: `/register`
3. **Página de login**: `/login`
4. **Marketplace**: `/marketplace`
5. **Carrinho**: `/carrinho`
6. **Checkout**: `/checkout`
7. **Pedidos**: `/pedidos`

### Fluxo na Interface:
1. **Registro**: Preencher formulário de cadastro
2. **Login**: Fazer login com as credenciais
3. **Navegar**: Explorar produtos no marketplace
4. **Adicionar**: Clicar em "Adicionar ao carrinho"
5. **Visualizar**: Ir para página do carrinho
6. **Calcular**: Inserir CEP e calcular frete
7. **Finalizar**: Prosseguir para checkout
8. **Pagar**: Selecionar método de pagamento
9. **Confirmar**: Finalizar pedido

## 🎯 Resultados Esperados

### No Sistema:
- ✅ Novo usuário cadastrado
- ✅ Cliente no CRM
- ✅ Pedido registrado
- ✅ Estoque atualizado
- ✅ Pagamento processado

### No Banco de Dados:
- ✅ Registro na tabela `users`
- ✅ Registro na tabela `customers`
- ✅ Registro na tabela `orders`
- ✅ Registro na tabela `order_items`
- ✅ Atualização na tabela `products` (estoque)

## 🚨 Troubleshooting

### Possíveis Problemas:
1. **Erro 404**: Verificar se a API está rodando
2. **Erro 401**: Verificar token JWT
3. **Erro 400**: Verificar dados obrigatórios
4. **Erro 500**: Verificar logs do servidor

### Comandos de Verificação:
```bash
# Verificar se API está rodando
curl -X GET http://localhost:5001/api/health

# Verificar usuário atual
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer jwt-token-aqui"

# Verificar produtos disponíveis
curl -X GET http://localhost:5001/api/products
```

## 📊 Métricas de Sucesso

### KPIs da Simulação:
- ✅ Tempo total do fluxo: < 5 minutos
- ✅ Taxa de sucesso: 100%
- ✅ Estoque corretamente atualizado
- ✅ Pedido visível no admin
- ✅ Cliente registrado no CRM

Este prompt simula um cliente real fazendo uma compra completa na plataforma, testando todos os endpoints e funcionalidades principais do sistema.