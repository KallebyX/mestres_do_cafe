# Guia de Testes - MercadoPago Checkout Transparente

## Visão Geral

Este guia fornece instruções passo-a-passo para testar todos os métodos de pagamento implementados no MercadoPago Checkout Transparente.

## Pré-requisitos

### 1. Configuração do Ambiente
Certifique-se de que as credenciais de teste estão configuradas no arquivo `.env`:

```bash
# Obtenha suas credenciais em: https://www.mercadopago.com.br/developers/panel/app
MP_ACCESS_TOKEN_TEST=TEST-YOUR_ACCESS_TOKEN_HERE
MP_PUBLIC_KEY_TEST=TEST-YOUR_PUBLIC_KEY_HERE
MP_ENVIRONMENT=sandbox
```

### 2. Aplicação Rodando
```bash
# Backend (API)
cd apps/api
python -m flask run --host=0.0.0.0 --port=5000

# Frontend (Web)
cd apps/web
npm run dev
```

## 🎯 Códigos de Status para Testes (Nome do Portador)

Para testar diferentes resultados de pagamento, **use os códigos abaixo como nome do titular do cartão**:

| Status | Nome do Portador | Descrição | CPF |
|--------|------------------|-----------|-----|
| ✅ **APRO** | APRO | Pagamento aprovado | 123.456.789-09 |
| ❌ **OTHE** | OTHE | Recusado por erro geral | 123.456.789-09 |
| ⏳ **CONT** | CONT | Pagamento pendente | - |
| 📞 **CALL** | CALL | Recusado - validação para autorizar | - |
| 💰 **FUND** | FUND | Recusado por quantia insuficiente | - |
| 🔒 **SECU** | SECU | Recusado por código de segurança inválido | - |
| 📅 **EXPI** | EXPI | Recusado por data de vencimento | - |
| 📝 **FORM** | FORM | Recusado por erro no formulário | - |

## Testes de Cartão de Crédito

### Cartões de Teste Universais

**Estes cartões funcionam com qualquer código de status acima:**

| Bandeira | Número | CVV | Data |
|----------|--------|-----|------|
| Visa | 4235 6477 2802 5682 | 123 | 11/30 |
| Mastercard | 5031 4332 1540 6351 | 123 | 11/30 |
| American Express | 3753 651535 56885 | 1234 | 11/30 |
| Elo Débito | 5067 7667 8388 8311 | 123 | 11/30 |

### Contas de Teste Configuradas

| Conta | Usuário | Senha | CPF |
|-------|---------|-------|-----|
| Comprador 1 | TESTUSER455207672 | wgp1TIzKQa | 191.191.191-00 |
| Comprador 2 | TESTUSER1275950592 | QNtB66sL0P | 111.444.777-35 |

### Passo a Passo - Teste de Cartão

1. **Acesse a página de checkout**
   - URL: `http://localhost:3000/checkout`
   - Crie um pedido de teste

2. **Selecione o método "Cartão de Crédito"**
   ```javascript
   // Dados do formulário
   const cardData = {
     number: "4235 6477 2802 5682",
     expiry_month: "11",
     expiry_year: "30",
     cvv: "123",
     cardholder_name: "APRO", // Use códigos: APRO, OTHE, CONT, etc.
     cardholder_doc_number: "12345678909" // CPF específico para APRO/OTHE
   };
   ```

3. **Preencha os dados e submeta**
   - Verifique se a tokenização está funcionando
   - Observe o status retornado: `approved`

4. **Verifique no banco de dados**
   ```sql
   SELECT * FROM payments 
   WHERE provider = 'mercado_pago' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

### 📋 Cenários de Teste por Status Code

#### ✅ Cenário 1: Pagamento Aprovado (APRO)
```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "test-order-approved",
    "payment_method_id": "visa",
    "token": "CARD_TOKEN_HERE",
    "installments": 1,
    "payer_email": "test_user_12345678909@testuser.com",
    "payer_first_name": "APRO",
    "payer_last_name": "TEST",
    "payer_doc_type": "CPF",
    "payer_doc_number": "12345678909"
  }'
```

#### ❌ Cenário 2: Pagamento Rejeitado - Erro Geral (OTHE)
```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "test-order-rejected",
    "payment_method_id": "visa",
    "token": "CARD_TOKEN_HERE",
    "installments": 1,
    "payer_email": "test_user_12345678909@testuser.com",
    "payer_first_name": "OTHE",
    "payer_last_name": "TEST",
    "payer_doc_type": "CPF",
    "payer_doc_number": "12345678909"
  }'
```

#### ⏳ Cenário 3: Pagamento Pendente (CONT)
```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "test-order-pending",
    "payment_method_id": "visa",
    "token": "CARD_TOKEN_HERE",
    "installments": 1,
    "payer_email": "testuser455207672@testuser.com",
    "payer_first_name": "CONT",
    "payer_last_name": "TEST",
    "payer_doc_type": "CPF",
    "payer_doc_number": "19119119100"
  }'
```

#### 📞 Cenário 4: Rejeição - Validação Necessária (CALL)
```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "test-order-call-auth",
    "payment_method_id": "mastercard",
    "token": "CARD_TOKEN_HERE",
    "installments": 1,
    "payer_email": "testuser1275950592@testuser.com",
    "payer_first_name": "CALL",
    "payer_last_name": "TEST",
    "payer_doc_type": "CPF",
    "payer_doc_number": "11144477735"
  }'
```

#### 💰 Cenário 5: Saldo Insuficiente (FUND)
```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "test-order-insufficient",
    "payment_method_id": "mastercard",
    "token": "CARD_TOKEN_HERE",
    "installments": 1,
    "payer_email": "testuser1275950592@testuser.com",
    "payer_first_name": "FUND",
    "payer_last_name": "TEST",
    "payer_doc_type": "CPF",
    "payer_doc_number": "11144477735"
  }'
```

#### 🔒 Cenário 6: CVV Inválido (SECU)
```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "test-order-security",
    "payment_method_id": "elo",
    "token": "CARD_TOKEN_HERE",
    "installments": 1,
    "payer_email": "testuser1275950592@testuser.com",
    "payer_first_name": "SECU",
    "payer_last_name": "TEST",
    "payer_doc_type": "CPF",
    "payer_doc_number": "11144477735"
  }'
```

#### 📅 Cenário 7: Data Expirada (EXPI)
```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "test-order-expired",
    "payment_method_id": "amex",
    "token": "CARD_TOKEN_HERE",
    "installments": 1,
    "payer_email": "testuser455207672@testuser.com",
    "payer_first_name": "EXPI",
    "payer_last_name": "TEST",
    "payer_doc_type": "CPF",
    "payer_doc_number": "19119119100"
  }'
```

#### 📝 Cenário 8: Erro no Formulário (FORM)
```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "test-order-form-error",
    "payment_method_id": "visa",
    "token": "CARD_TOKEN_HERE",
    "installments": 1,
    "payer_email": "testuser455207672@testuser.com",
    "payer_first_name": "FORM",
    "payer_last_name": "TEST",
    "payer_doc_type": "CPF",
    "payer_doc_number": "19119119100"
  }'
```

### 📊 Resultados Esperados por Status

| Status Code | Resultado Esperado | Status Detail |
|-------------|-------------------|---------------|
| APRO | `"status": "approved"` | `accredited` |
| OTHE | `"status": "rejected"` | `cc_rejected_other_reason` |
| CONT | `"status": "pending"` | `pending_contingency` |
| CALL | `"status": "rejected"` | `cc_rejected_call_for_authorize` |
| FUND | `"status": "rejected"` | `cc_rejected_insufficient_amount` |
| SECU | `"status": "rejected"` | `cc_rejected_bad_filled_security_code` |
| EXPI | `"status": "rejected"` | `cc_rejected_bad_filled_date` |
| FORM | `"status": "rejected"` | `cc_rejected_bad_filled_other` |

## Testes de PIX

### Dados de Teste PIX

| Campo | Valor de Teste |
|-------|----------------|
| Email | test_user_19119119100@testuser.com |
| CPF | 191.191.191-00 |
| Nome | Test |
| Sobrenome | User |

### Passo a Passo - Teste PIX

1. **Selecione o método "PIX"**
2. **Preencha os dados**
   ```javascript
   const pixData = {
     payer_email: "test_user_19119119100@testuser.com",
     payer_first_name: "Test",
     payer_last_name: "User",
     payer_doc_type: "CPF",
     payer_doc_number: "19119119100"
   };
   ```

3. **Submeta o pagamento**
4. **Verifique o QR Code gerado**

### Teste da API PIX

```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "test-order-pix-123",
    "payment_method_id": "pix",
    "payer_email": "test_user_19119119100@testuser.com",
    "payer_first_name": "Test",
    "payer_last_name": "User",
    "payer_doc_type": "CPF",
    "payer_doc_number": "19119119100",
    "pix_expiration": 3600
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "payment_id": "uuid-here",
  "mp_payment_id": 123456789,
  "status": "pending",
  "status_detail": "pending_waiting_payment",
  "amount": 95.0,
  "pix_data": {
    "qr_code": "00020126580014br.gov.bcb.pix...",
    "qr_code_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "pix_key": "pix_key_here"
  }
}
```

### Simulação de Pagamento PIX

Para simular o pagamento no ambiente de testes:
1. Acesse: `https://www.mercadopago.com.br/developers/panel/testing`
2. Use a conta de teste do comprador
3. Faça o "pagamento" do PIX gerado

## Testes de Boleto

### Passo a Passo - Teste Boleto

1. **Selecione o método "Boleto Bancário"**
2. **Preencha os dados**
   ```javascript
   const boletoData = {
     payer_email: "test_user_19119119100@testuser.com",
     payer_first_name: "Test",
     payer_last_name: "User",
     payer_doc_type: "CPF",
     payer_doc_number: "19119119100"
   };
   ```

### Teste da API Boleto

```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "test-order-boleto-123",
    "payment_method_id": "bolbradesco",
    "payer_email": "test_user_19119119100@testuser.com",
    "payer_first_name": "Test",
    "payer_last_name": "User",
    "payer_doc_type": "CPF",
    "payer_doc_number": "19119119100"
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "payment_id": "uuid-here",
  "mp_payment_id": 123456789,
  "status": "pending",
  "status_detail": "pending_waiting_payment",
  "amount": 100.0,
  "boleto_data": {
    "ticket_url": "https://www.mercadopago.com/mlb/payments/ticket/...",
    "barcode": "03399.63290 64000.001014 45678.901018 4 89470000010000"
  }
}
```

## Testes de Webhooks

### Configuração do Webhook Local

1. **Use ngrok para expor localhost**
   ```bash
   ngrok http 5000
   ```

2. **Configure no painel do MercadoPago**
   - URL: `https://your-ngrok-url.ngrok.io/api/payments/mercadopago/webhook`
   - Eventos: payment, merchant_order

### Teste Manual de Webhook

```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: signature_here" \
  -d '{
    "action": "payment.updated",
    "api_version": "v1",
    "data": {
      "id": "123456789"
    },
    "date_created": "2024-01-01T00:00:00.000Z",
    "id": 987654321,
    "live_mode": false,
    "type": "payment",
    "user_id": YOUR_USER_ID_HERE
  }'
```

### Verificação de Assinatura

Para verificar se a validação de assinatura está funcionando:

```python
import hmac
import hashlib

def test_webhook_signature():
    secret = "your_webhook_secret"
    payload = b'{"test": "data"}'
    
    signature = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    print(f"Signature: {signature}")
```

## Testes de Validação

### Teste de Validação de CPF

```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/validate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "payer_doc_type": "CPF",
    "payer_doc_number": "123.456.789-00",
    "payer_email": "invalid-email"
  }'
```

**Resultado Esperado:**
```json
{
  "success": false,
  "errors": [
    "CPF inválido",
    "Email do pagador inválido"
  ]
}
```

### Teste de Validação de Cartão

```bash
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/validate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method_id": "visa",
    "card_number": "1234567890123456",
    "expiry_month": "13",
    "expiry_year": "20",
    "cvv": "12"
  }'
```

**Resultado Esperado:**
```json
{
  "success": false,
  "errors": [
    "Número do cartão inválido",
    "Mês deve estar entre 1 e 12",
    "Cartão expirado",
    "CVV deve ter 3 dígitos"
  ]
}
```

## Testes de Performance

### Teste de Carga Básica

```bash
# Instalar ApacheBench
sudo apt-get install apache2-utils

# Teste com 100 requisições, 10 concorrentes
ab -n 100 -c 10 -H "Content-Type: application/json" \
   -p payment_data.json \
   http://localhost:5000/api/payments/mercadopago/transparent/process-payment
```

### Monitoramento de Logs

```bash
# Monitorar logs da aplicação
tail -f apps/api/logs/app.log | grep "mercado_pago"

# Monitorar logs específicos de pagamento
tail -f apps/api/logs/app.log | grep "Payment processed"
```

## Checklist de Testes

### ✅ Funcionalidades Básicas

- [ ] Criação de token de cartão
- [ ] Processamento de pagamento com cartão
- [ ] Processamento de pagamento com PIX
- [ ] Processamento de pagamento com boleto
- [ ] Validação de dados de entrada
- [ ] Tratamento de erros
- [ ] Webhook de notificação

### ✅ Validações

- [ ] Validação de CPF
- [ ] Validação de CNPJ
- [ ] Validação de email
- [ ] Validação de número de cartão (Luhn)
- [ ] Validação de CVV
- [ ] Validação de data de validade

### ✅ Segurança

- [ ] Tokenização de cartões
- [ ] Validação de assinatura de webhooks
- [ ] Sanitização de dados de entrada
- [ ] Logs de segurança

### ✅ Interface do Usuário

- [ ] Seleção de método de pagamento
- [ ] Formulários responsivos
- [ ] Validação em tempo real
- [ ] Estados de loading
- [ ] Tratamento de erros visuais
- [ ] QR Code para PIX
- [ ] Redirecionamento para boleto

### ✅ Integração

- [ ] Comunicação com API do MercadoPago
- [ ] Persistência no banco de dados
- [ ] Atualização de status via webhook
- [ ] Integração com sistema de pedidos
- [ ] Logs estruturados

## Troubleshooting

### Problemas Comuns

1. **Token inválido**
   - Verificar credenciais no `.env`
   - Confirmar ambiente (sandbox/production)

2. **Webhook não funciona**
   - Verificar URL configurada no painel
   - Testar conectividade com ngrok

3. **Pagamento sempre rejeitado**
   - Usar cartões de teste corretos
   - Verificar nome no cartão (APRO/OTHE)

4. **Erro de validação**
   - Verificar middleware aplicado nos endpoints
   - Confirmar dados de entrada no formato correto

### Logs Importantes

```bash
# Verificar logs de erro
grep "ERROR" apps/api/logs/app.log

# Verificar logs de pagamento
grep "Payment processed" apps/api/logs/app.log

# Verificar logs de webhook
grep "Webhook processed" apps/api/logs/app.log
```

## Relatório de Testes

Após executar todos os testes, documente os resultados:

```markdown
## Relatório de Testes - MercadoPago

**Data**: 2024-01-XX
**Ambiente**: Sandbox
**Status**: ✅ Todos os testes passaram

### Resumo
- Cartão de Crédito: ✅ 10/10 testes
- PIX: ✅ 5/5 testes  
- Boleto: ✅ 3/3 testes
- Webhooks: ✅ 5/5 testes
- Validações: ✅ 8/8 testes

### Observações
- Tempo médio de resposta: 450ms
- Taxa de sucesso: 100%
- Webhooks funcionando corretamente
```

---

**Próximo passo**: Após validar todos os testes, a integração estará pronta para migração para ambiente de produção.