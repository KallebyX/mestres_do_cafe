# Simulação Completa do Fluxo de Admin - Mestres do Café Enterprise

## 📋 Cenário de Simulação

**Você é um administrador da plataforma Mestres do Café que precisa monitorar e gerenciar os pedidos dos clientes. Você fará login no sistema admin e verificará os detalhes completos de um pedido recém-criado.**

## 🔄 Fluxo Completo da Simulação de Admin

### 1. Login do Admin
```bash
# Endpoint: POST /api/auth/login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mestrescafe.com",
    "password": "admin123"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "access_token": "jwt-admin-token-aqui",
  "user": {
    "id": "admin-uuid",
    "email": "admin@mestrescafe.com",
    "username": "admin",
    "name": "Administrador",
    "is_admin": true,
    "user_type": "admin",
    "points": 0,
    "level": "admin"
  }
}
```

### 2. Visualizar Lista de Pedidos
```bash
# Endpoint: GET /api/orders (listar todos os pedidos)
curl -X GET "http://localhost:5001/api/orders?page=1&per_page=20" \
  -H "Authorization: Bearer jwt-admin-token-aqui"
```

**Resposta esperada:**
```json
{
  "orders": [
    {
      "id": "order-uuid",
      "user_id": "uuid-do-usuario",
      "user_name": "Maria Silva",
      "total_amount": 63.80,
      "status": "pending",
      "payment_status": "pending",
      "created_at": "2025-07-15T10:30:00Z",
      "items_count": 1
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 1,
    "total": 1
  }
}
```

### 3. Visualizar Detalhes do Pedido Específico
```bash
# Endpoint: GET /api/orders/{order_id}
curl -X GET "http://localhost:5001/api/orders/order-uuid" \
  -H "Authorization: Bearer jwt-admin-token-aqui"
```

**Resposta esperada:**
```json
{
  "order": {
    "id": "order-uuid",
    "user_id": "uuid-do-usuario",
    "user_name": "Maria Silva",
    "order_number": "MC20250715123456ABCD1234",
    "total_amount": 63.80,
    "subtotal": 51.80,
    "shipping_cost": 12.00,
    "tax_amount": 0.00,
    "status": "pending",
    "payment_status": "pending",
    "shipping_address": {
      "street": "Rua das Flores, 123",
      "number": "123",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "cep": "01310-100",
      "country": "Brasil",
      "delivery_instructions": "Portão azul"
    },
    "created_at": "2025-07-15T10:30:00Z",
    "items": [
      {
        "id": "order-item-uuid",
        "product_id": "produto-uuid",
        "product_name": "Café Especial Santos",
        "product_image": "https://...",
        "quantity": 2,
        "unit_price": 25.90,
        "total_price": 51.80
      }
    ]
  }
}
```

### 4. Visualizar Dados do Cliente
```bash
# Endpoint: GET /api/customers/{customer_id}
curl -X GET "http://localhost:5001/api/customers/uuid-do-usuario" \
  -H "Authorization: Bearer jwt-admin-token-aqui"
```

**Resposta esperada:**
```json
{
  "id": "uuid-do-usuario",
  "name": "Maria Silva",
  "email": "maria.silva@email.com",
  "phone": "(11) 99999-9999",
  "cpf_cnpj": null,
  "birth_date": null,
  "customer_type": "individual",
  "company_name": null,
  "source": null,
  "status": "active",
  "total_orders": 1,
  "total_spent": 63.80,
  "avg_order_value": 63.80,
  "last_order_date": "2025-07-15T10:30:00Z",
  "acquisition_date": "2025-07-15T10:25:00Z",
  "is_subscribed": true,
  "preferences": {},
  "address_street": "Rua das Flores, 123",
  "address_number": "123",
  "address_neighborhood": "Centro",
  "address_city": "São Paulo",
  "address_state": "SP",
  "address_cep": "01310-100",
  "addresses": [],
  "created_at": "2025-07-15T10:25:00Z",
  "updated_at": "2025-07-15T10:30:00Z"
}
```

### 5. Verificar Status de Pagamento
```bash
# Endpoint: GET /api/payments/{order_id}
curl -X GET "http://localhost:5001/api/payments/order-uuid" \
  -H "Authorization: Bearer jwt-admin-token-aqui"
```

**Resposta esperada:**
```json
{
  "order_id": "order-uuid",
  "payment_status": "pending",
  "payment_method": "pix",
  "total_amount": 63.80,
  "payment_date": null,
  "transaction_id": null,
  "payment_details": {
    "method": "pix",
    "installments": 1,
    "status": "pending"
  },
  "created_at": "2025-07-15T10:30:00Z"
}
```

### 6. Verificar Etiqueta de Frete
```bash
# Endpoint: GET /api/shipping/melhor-envio/order/{order_id}
curl -X GET "http://localhost:5001/api/shipping/melhor-envio/order/order-uuid" \
  -H "Authorization: Bearer jwt-admin-token-aqui"
```

**Resposta esperada:**
```json
{
  "order_id": "order-uuid",
  "shipping_status": "pending",
  "tracking_code": null,
  "carrier": "Correios",
  "service": "PAC",
  "estimated_delivery": "2025-07-22T10:30:00Z",
  "shipping_cost": 12.00,
  "shipping_label": null,
  "created_at": "2025-07-15T10:30:00Z"
}
```

### 7. Verificar Estoque do Produto
```bash
# Endpoint: GET /api/products/{product_id}
curl -X GET "http://localhost:5001/api/products/produto-uuid" \
  -H "Authorization: Bearer jwt-admin-token-aqui"
```

**Resposta esperada:**
```json
{
  "id": "produto-uuid",
  "name": "Café Especial Santos",
  "description": "Café 100% arábica da região de Santos",
  "price": 25.90,
  "category": "especial",
  "stock_quantity": 48,
  "is_active": true,
  "created_at": "2025-07-15T08:00:00Z",
  "updated_at": "2025-07-15T10:30:00Z"
}
```

### 8. Verificar Documentos e Comprovantes
```bash
# Endpoint: GET /api/admin/orders/{order_id}/documents
curl -X GET "http://localhost:5001/api/admin/orders/order-uuid/documents" \
  -H "Authorization: Bearer jwt-admin-token-aqui"
```

**Resposta esperada:**
```json
{
  "order_id": "order-uuid",
  "documents": [
    {
      "type": "invoice",
      "name": "Nota Fiscal",
      "url": "https://documents.mestrescafe.com/invoices/order-uuid.pdf",
      "status": "generated",
      "created_at": "2025-07-15T10:30:00Z"
    },
    {
      "type": "shipping_label",
      "name": "Etiqueta de Envio",
      "url": "https://documents.mestrescafe.com/labels/order-uuid.pdf",
      "status": "pending",
      "created_at": null
    }
  ]
}
```

### 9. Analytics e Métricas do Pedido
```bash
# Endpoint: GET /api/analytics/orders/{order_id}
curl -X GET "http://localhost:5001/api/analytics/orders/order-uuid" \
  -H "Authorization: Bearer jwt-admin-token-aqui"
```

**Resposta esperada:**
```json
{
  "order_id": "order-uuid",
  "metrics": {
    "processing_time": "2 minutos",
    "customer_acquisition": "novo_cliente",
    "payment_conversion": "pending",
    "shipping_region": "SP",
    "order_value_category": "medium",
    "product_categories": ["especial"],
    "profit_margin": 45.2,
    "customer_lifetime_value": 63.80
  },
  "timeline": [
    {
      "event": "order_created",
      "timestamp": "2025-07-15T10:30:00Z",
      "description": "Pedido criado pelo cliente"
    },
    {
      "event": "payment_pending",
      "timestamp": "2025-07-15T10:30:00Z",
      "description": "Aguardando pagamento PIX"
    },
    {
      "event": "stock_updated",
      "timestamp": "2025-07-15T10:30:00Z",
      "description": "Estoque reduzido automaticamente"
    }
  ]
}
```

## 🖥️ Simulação via Interface Web Admin

### Acesso ao Admin:
1. **URL**: `http://localhost:5001/admin`
2. **Login**: `/admin/login` (se diferente do login principal)
3. **Dashboard**: `/admin/dashboard`
4. **Pedidos**: `/admin/orders` ou `/admin/vendas`
5. **Clientes**: `/admin/crm`
6. **Produtos**: `/admin/estoque`
7. **Relatórios**: `/admin/analytics`

### Fluxo na Interface Admin:
1. **Login**: Fazer login como admin
2. **Dashboard**: Visualizar métricas gerais
3. **Pedidos**: Ir para aba de pedidos
4. **Filtrar**: Filtrar por data/status se necessário
5. **Selecionar**: Clicar no pedido específico
6. **Detalhes**: Visualizar todos os detalhes do pedido
7. **Cliente**: Clicar no nome do cliente para ver perfil
8. **Pagamento**: Verificar status do pagamento
9. **Envio**: Verificar status da etiqueta
10. **Estoque**: Confirmar redução do estoque

## 🔍 Informações Completas que o Admin Deve Ver

### 📊 Dados do Pedido:
- ✅ **ID do Pedido**: order-uuid
- ✅ **Número do Pedido**: MC20250715123456ABCD1234
- ✅ **Status**: pending
- ✅ **Valor Total**: R$ 63,80
- ✅ **Data**: 15/07/2025 10:30
- ✅ **Método de Pagamento**: PIX

### 👤 Dados do Cliente:
- ✅ **Nome**: Maria Silva
- ✅ **Email**: maria.silva@email.com
- ✅ **Telefone**: (11) 99999-9999
- ✅ **Tipo**: Pessoa Física
- ✅ **Total Gasto**: R$ 63,80
- ✅ **Primeiro Pedido**: Sim
- ✅ **Endereço**: Rua das Flores, 123 - Centro - São Paulo/SP

### 💳 Status de Pagamento:
- ✅ **Status**: Pendente
- ✅ **Método**: PIX
- ✅ **Valor**: R$ 63,80
- ✅ **Data de Vencimento**: 48h
- ✅ **ID da Transação**: Aguardando

### 🏷️ Etiqueta de Frete:
- ✅ **Transportadora**: Correios
- ✅ **Serviço**: PAC
- ✅ **Prazo**: 7 dias úteis
- ✅ **Valor**: R$ 12,00
- ✅ **Código de Rastreamento**: Será gerado após pagamento
- ✅ **Status**: Aguardando pagamento

### 📋 Comprovantes e Documentos:
- ✅ **Nota Fiscal**: Gerada automaticamente
- ✅ **Boleto/PIX**: Disponível para download
- ✅ **Etiqueta**: Será gerada após confirmação do pagamento
- ✅ **Termo de Entrega**: Disponível
- ✅ **Comprovante de Pagamento**: Pendente

### 📦 Controle de Estoque:
- ✅ **Produto**: Café Especial Santos
- ✅ **Quantidade Vendida**: 2 unidades
- ✅ **Estoque Anterior**: 50 unidades
- ✅ **Estoque Atual**: 48 unidades
- ✅ **Redução Automática**: ✅ Sim
- ✅ **Alerta de Estoque**: Não (ainda acima do mínimo)

### 📈 Métricas e Analytics:
- ✅ **Margem de Lucro**: 45,2%
- ✅ **Tempo de Processamento**: 2 minutos
- ✅ **Região de Entrega**: São Paulo/SP
- ✅ **Categoria do Pedido**: Médio valor
- ✅ **Cliente**: Novo
- ✅ **Canal de Aquisição**: Site/Marketplace

## 🚀 Comandos Rápidos para Verificação

### Status Geral do Sistema:
```bash
# Verificar se todos os serviços estão funcionando
curl -X GET http://localhost:5001/api/health

# Verificar total de pedidos
curl -X GET http://localhost:5001/api/orders \
  -H "Authorization: Bearer jwt-admin-token-aqui"

# Verificar total de clientes
curl -X GET http://localhost:5001/api/customers \
  -H "Authorization: Bearer jwt-admin-token-aqui"
```

### Relatórios Rápidos:
```bash
# Pedidos do dia
curl -X GET "http://localhost:5001/api/orders?date=2025-07-15" \
  -H "Authorization: Bearer jwt-admin-token-aqui"

# Produtos com estoque baixo
curl -X GET "http://localhost:5001/api/products?stock_alert=true" \
  -H "Authorization: Bearer jwt-admin-token-aqui"
```

## 📋 Checklist de Verificação do Admin

### ✅ Verificações Obrigatórias:
- [ ] Pedido aparece na lista de pedidos
- [ ] Dados do cliente estão completos
- [ ] Status de pagamento está correto
- [ ] Valor total está correto
- [ ] Endereço de entrega está completo
- [ ] Estoque foi reduzido automaticamente
- [ ] Etiqueta de frete está sendo processada
- [ ] Documentos estão sendo gerados
- [ ] Métricas estão sendo coletadas
- [ ] Timeline do pedido está completa

### 🔍 Ações Possíveis do Admin:
- [ ] Alterar status do pedido
- [ ] Gerar etiqueta de envio
- [ ] Enviar comprovante por email
- [ ] Cancelar pedido (se necessário)
- [ ] Contatar cliente
- [ ] Gerar relatório
- [ ] Atualizar estoque manualmente
- [ ] Configurar alertas

## 🎯 Resultado Final da Simulação

Após completar esta simulação, o admin terá uma visão completa de:

1. **Pedido**: Todos os detalhes do pedido MC20250715123456ABCD1234
2. **Cliente**: Perfil completo de Maria Silva
3. **Pagamento**: Status PIX pendente
4. **Envio**: Frete calculado e etiqueta em processamento
5. **Estoque**: Redução automática confirmada
6. **Documentos**: Nota fiscal gerada, outros pendentes
7. **Métricas**: Analytics completas do pedido

Este prompt simula um administrador monitorando um pedido real, verificando todos os aspectos críticos do sistema de e-commerce.