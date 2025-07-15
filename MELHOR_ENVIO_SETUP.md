# Integração Melhor Envio - Guia de Configuração

## Visão Geral

A integração com o Melhor Envio está implementada e fornece funcionalidades completas de:
- Cálculo de frete em tempo real
- Criação de etiquetas de envio
- Rastreamento de encomendas
- Notificações via webhook
- Integração com sistema de escrow

## Configuração das Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```bash
# Melhor Envio API Configuration
MELHOR_ENVIO_TOKEN=your_api_token_here
MELHOR_ENVIO_CLIENT_ID=your_client_id_here
MELHOR_ENVIO_CLIENT_SECRET=your_client_secret_here
MELHOR_ENVIO_SANDBOX=true  # true para testes, false para produção
```

## Como Obter as Credenciais

### 1. Criar Conta no Melhor Envio
1. Acesse https://melhorenvio.com.br/
2. Crie uma conta empresarial
3. Acesse o painel de desenvolvedor

### 2. Criar Aplicação
1. No painel, vá em "Integrações" > "Aplicações"
2. Clique em "Nova Aplicação"
3. Preencha os dados:
   - **Nome**: Mestres do Café
   - **Redirect URI**: `http://localhost:5001/api/shipping/melhor-envio/callback`
   - **Scopes**: Selecione todos os necessários

### 3. Obter Token de Acesso

#### Opção A: Via OAuth2 (Recomendado)
1. Acesse: `https://sandbox.melhorenvio.com.br/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:5001/api/shipping/melhor-envio/callback&response_type=code&scope=cart-read cart-write companies-read companies-write coupons-read coupons-write notifications-read orders-read products-read products-write purchases-read shipping-calculate shipping-cancel shipping-checkout shipping-companies shipping-generate shipping-preview shipping-print shipping-share shipping-tracking ecommerce-shipping`

2. Autorize a aplicação
3. O sistema retornará o token que deve ser configurado em `MELHOR_ENVIO_TOKEN`

#### Opção B: Token Manual
1. No painel do Melhor Envio, vá em "Tokens"
2. Gere um novo token com os scopes necessários
3. Use este token em `MELHOR_ENVIO_TOKEN`

## Funcionalidades Implementadas

### 1. Cálculo de Frete
- **Endpoint**: `POST /api/shipping/melhor-envio/calculate`
- **Componente**: `ShippingCalculator.jsx`
- Calcula opções de frete em tempo real

### 2. Criação de Etiquetas
- **Endpoint**: `POST /api/shipping/melhor-envio/create-shipment`
- **Permissões**: Admin ou Vendor
- Cria etiquetas de envio para pedidos

### 3. Rastreamento
- **Endpoint**: `GET /api/shipping/melhor-envio/track/{code}`
- **Componente**: `ShippingTracker.jsx`
- Rastreamento em tempo real com auto-refresh

### 4. Gestão de Envios
- **Endpoint**: `GET /api/shipping/melhor-envio/orders`
- **Componente**: `ShippingAdmin.jsx`
- Interface completa para gestão de envios

### 5. Webhooks
- **Endpoint**: `POST /api/shipping/melhor-envio/webhook`
- Recebe notificações de mudança de status
- Integração automática com sistema de escrow

## Integração com Escrow

O sistema está integrado com o escrow para:
- **Pagamento Retido**: Quando um produto é enviado, o pagamento fica em escrow
- **Liberação Automática**: Quando o produto é entregue (status "delivered"), o pagamento é liberado automaticamente
- **Disputas**: Em caso de problemas, o sistema mantém o pagamento retido

## Estrutura de Arquivos

```
apps/api/src/
├── services/melhor_envio_service.py    # Serviço principal da API
├── controllers/routes/melhor_envio.py  # Endpoints da API
└── models/                             # Modelos relacionados

apps/web/src/components/
├── ShippingCalculator.jsx              # Calculadora de frete
├── ShippingTracker.jsx                 # Rastreamento
└── ShippingAdmin.jsx                   # Painel administrativo
```

## Endpoints da API

### Cálculo de Frete
```http
POST /api/shipping/melhor-envio/calculate
Content-Type: application/json

{
  "origin_cep": "97010-000",
  "destination_cep": "01310-100",
  "products": [
    {
      "name": "Café Premium",
      "weight": 0.5,
      "width": 10,
      "height": 10,
      "length": 15,
      "quantity": 1,
      "price": 35.90
    }
  ]
}
```

### Criar Envio
```http
POST /api/shipping/melhor-envio/create-shipment
Authorization: Bearer {token}
Content-Type: application/json

{
  "order_id": "uuid-do-pedido",
  "service_id": 1,
  "insurance": true
}
```

### Rastrear Envio
```http
GET /api/shipping/melhor-envio/track/{tracking_code}
```

### Listar Envios
```http
GET /api/shipping/melhor-envio/orders
Authorization: Bearer {token}
```

## Modo de Fallback

Quando as credenciais não estão configuradas, o sistema funciona em modo de fallback:
- **Cálculo de Frete**: Retorna cotações estimadas baseadas em CEP
- **Rastreamento**: Retorna dados simulados para teste
- **Notificação**: Indica que está usando dados simulados

## Testando a Integração

### 1. Teste de Cálculo
1. Acesse a página de produto
2. Use o componente de cálculo de frete
3. Teste com diferentes CEPs

### 2. Teste de Envio (Admin)
1. Faça login como admin
2. Acesse um pedido pago
3. Crie uma etiqueta de envio
4. Verifique se o tracking code foi gerado

### 3. Teste de Rastreamento
1. Use um código de rastreamento válido
2. Verifique se o status é atualizado
3. Teste o auto-refresh

## Produção

Para usar em produção:
1. Altere `MELHOR_ENVIO_SANDBOX=false`
2. Use credenciais de produção
3. Configure webhook URL pública
4. Teste com pedidos reais

## Troubleshooting

### Erro: "Token inválido"
- Verifique se `MELHOR_ENVIO_TOKEN` está correto
- Regenere o token se necessário

### Erro: "CEP não encontrado"
- Verifique se o CEP está no formato correto
- Use CEPs válidos para teste

### Webhook não funciona
- Configure URL pública acessível
- Verifique logs do servidor
- Teste endpoint manualmente

## Logs e Monitoramento

O sistema registra logs detalhados para:
- Cálculos de frete
- Criação de envios
- Atualizações de rastreamento
- Processamento de webhooks

Verifique os logs em caso de problemas para debug detalhado.