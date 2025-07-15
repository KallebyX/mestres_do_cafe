# 🚀 Configuração do Mercado Pago - Mestres do Café

## 📋 Pré-requisitos

1. **Conta no Mercado Pago**
   - Acesse [developers.mercadopago.com](https://developers.mercadopago.com)
   - Crie uma conta de desenvolvedor
   - Ative sua aplicação

2. **Credenciais necessárias:**
   - Access Token (para backend)
   - Public Key (para frontend)
   - Webhook Secret (para validação)

## 🔧 Configuração Backend

### 1. Configurar variáveis de ambiente

No arquivo `.env`, substitua os valores pelos seus tokens reais:

```env
# Mercado Pago Configuration
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-XXXXXXXXXX-XXXXXXXXXX
MERCADO_PAGO_PUBLIC_KEY=APP_USR-XXXXXXXXXX-XXXXXXXXXX
MERCADO_PAGO_WEBHOOK_SECRET=XXXXXXXXXX
MERCADO_PAGO_ENVIRONMENT=sandbox  # ou production
MERCADO_PAGO_NOTIFICATION_URL=https://seudominio.com/api/payments/mercadopago/webhook
```

### 2. Onde encontrar as credenciais

1. **Access Token e Public Key:**
   - Acesse [Mercado Pago Developers](https://developers.mercadopago.com)
   - Vá em "Suas integrações"
   - Selecione sua aplicação
   - Na aba "Credenciais" você encontrará:
     - **Sandbox**: Para testes
     - **Production**: Para produção

2. **Webhook Secret:**
   - Na mesma seção de credenciais
   - Ou configure um na seção "Webhooks"

### 3. Configurar Webhooks

1. Acesse a seção "Webhooks" na sua aplicação
2. Adicione a URL: `https://seudominio.com/api/payments/mercadopago/webhook`
3. Selecione os eventos:
   - `payment`
   - `plan`
   - `subscription`
   - `invoice`

## 🎨 Configuração Frontend

### 1. SDK do Mercado Pago

O componente `MercadoPagoCheckout` já carrega automaticamente o SDK:

```javascript
// Carregado automaticamente
https://sdk.mercadopago.com/js/v2
```

### 2. Usando os componentes

```jsx
import MercadoPagoCheckout from './components/MercadoPagoCheckout';
import PaymentStatusTracker from './components/PaymentStatusTracker';

// Checkout
<MercadoPagoCheckout
  orderId="order-123"
  amount={99.90}
  customerData={{
    name: "João Silva",
    email: "joao@email.com",
    docType: "CPF",
    docNumber: "12345678901",
    phone: "11999999999",
    address: {
      street: "Rua das Flores",
      number: "123",
      zipCode: "01234-567"
    }
  }}
  onSuccess={(data) => console.log('Pagamento aprovado:', data)}
  onError={(error) => console.log('Erro no pagamento:', error)}
  onPending={(data) => console.log('Pagamento pendente:', data)}
/>

// Tracker de status
<PaymentStatusTracker
  paymentId="payment-123"
  onStatusChange={(newStatus, oldStatus) => {
    console.log(`Status mudou de ${oldStatus} para ${newStatus}`);
  }}
/>
```

## 🔒 Sistema de Escrow

O sistema já está integrado com escrow automático:

1. **Pagamento aprovado** → Automaticamente vai para escrow (`held`)
2. **Produto entregue** → Contador de 7 dias
3. **Após 7 dias** → Elegível para liberação automática
4. **Liberação** → Valor transferido para o vendedor

### Configurar Split Payments

Para marketplace com múltiplos vendedores:

```javascript
// No backend, o serviço já calcula automaticamente
const marketplaceFee = mp_service.calculate_marketplace_fee(amount, vendorId);
```

## 📱 Métodos de Pagamento Suportados

### Checkout Pro (Recomendado)
- ✅ Pix
- ✅ Cartão de crédito/débito
- ✅ Boleto bancário
- ✅ Dinheiro em conta Mercado Pago
- ✅ Parcelamento em até 12x

### Checkout Transparente
- ✅ Cartão de crédito
- ✅ Parcelamento personalizado

## 🛠️ Endpoints da API

### Criar Preferência (Checkout Pro)
```bash
POST /api/payments/mercadopago/create-preference
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": "uuid",
  "payer_name": "Nome Completo",
  "payer_email": "email@exemplo.com",
  "payer_doc_number": "12345678901"
}
```

### Processar Pagamento Direto
```bash
POST /api/payments/mercadopago/process-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": "uuid",
  "payment_method_id": "visa",
  "token": "card_token",
  "installments": 1,
  "payer_email": "email@exemplo.com"
}
```

### Consultar Status
```bash
GET /api/payments/mercadopago/payment/{payment_id}
Authorization: Bearer <token>
```

### Estornar Pagamento
```bash
POST /api/payments/mercadopago/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_id": "uuid",
  "amount": 50.00  // opcional para estorno parcial
}
```

## 🧪 Testes

### Dados de Teste (Sandbox)

**Cartões de Teste:**
- **Aprovado:** 4013 4013 4013 4013
- **Rejeitado:** 4000 0000 0000 0002
- **Pendente:** 4000 0000 0000 0051

**CPF de Teste:** 12345678909

**CVV:** Qualquer (123)

**Validade:** Qualquer data futura (12/25)

### Webhook de Teste

Para testar localmente, use ngrok:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta local
ngrok http 5001

# Usar URL gerada no webhook
https://abc123.ngrok.io/api/payments/mercadopago/webhook
```

## 🚨 Troubleshooting

### Erro: "Mercado Pago not configured"
- ✅ Verifique se `MERCADO_PAGO_ACCESS_TOKEN` está definido
- ✅ Confirme que não está como `YOUR_ACCESS_TOKEN_HERE`

### Webhook não está funcionando
- ✅ Verifique se a URL está acessível publicamente
- ✅ Confirme se o `MERCADO_PAGO_WEBHOOK_SECRET` está correto
- ✅ Teste a URL manualmente

### Pagamento não vai para escrow
- ✅ Verifique se o produto tem `vendor_id` associado
- ✅ Confirme que o pagamento foi aprovado (`status: approved`)

### Split payment não funciona
- ✅ Verifique se o vendedor tem conta no Mercado Pago
- ✅ Confirme se o `marketplace_fee` está sendo calculado

## 📚 Recursos Adicionais

- [Documentação Oficial MP](https://www.mercadopago.com.br/developers)
- [SDK JavaScript](https://github.com/mercadopago/sdk-js)
- [Webhook Events](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [Cartões de Teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards)

## ✅ Checklist de Produção

- [ ] Credenciais de produção configuradas
- [ ] Webhook URL atualizadas para domínio real
- [ ] SSL/HTTPS configurado
- [ ] Testes realizados em produção
- [ ] Monitoramento de logs ativo
- [ ] Backup de configurações
- [ ] Documentação da equipe atualizada

## 🔐 Segurança

### Boas práticas implementadas:
- ✅ Tokens nunca expostos no frontend
- ✅ Validação de assinatura de webhook
- ✅ Tokenização de cartões no frontend
- ✅ Logs de transações
- ✅ Sistema de escrow para marketplace
- ✅ Validação de permissões por usuário

---

**🚀 Sistema 100% funcional e pronto para produção!**

Para começar, apenas substitua os tokens no arquivo `.env` pelos seus tokens reais do Mercado Pago.