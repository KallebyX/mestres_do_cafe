# Configuração de Webhooks MercadoPago

## URL Pública Gerada

O túnel SSH foi estabelecido com sucesso! A porta 5001 (Flask backend) agora está exposta publicamente através do serveo.net.

## Endpoints de Webhook para Configurar

### 1. Webhook Principal
```
https://[subdomain].serveo.net/api/payments/mercadopago/webhook
```

### 2. Webhook Transparente
```
https://[subdomain].serveo.net/api/payments/mercadopago/transparent/webhook
```

## Como Configurar no Painel MercadoPago

### Passo 1: Acessar o Painel
1. Acesse: https://www.mercadopago.com.br/developers/
2. Entre com suas credenciais de teste
3. Vá em "Webhooks" ou "Notificações"

### Passo 2: Configurar Webhook
1. Clique em "Criar webhook" ou "Adicionar notificação"
2. **Nome**: MestresdoCafe Webhook
3. **URL**: `https://[subdomain].serveo.net/api/payments/mercadopago/webhook`
4. **Eventos para notificar**:
   - payment (pagamentos)
   - plan (assinaturas)
   - subscription (assinaturas)
   - invoice (faturas)
   - point_integration_wh (integração)

### Passo 3: Configurar Webhook Transparente (Opcional)
1. Criar segundo webhook:
2. **Nome**: MestresdoCafe Transparente
3. **URL**: `https://[subdomain].serveo.net/api/payments/mercadopago/transparent/webhook`
4. **Eventos**: mesmos eventos acima

## Testar a Configuração

### 1. Verificar se os Endpoints Estão Funcionando
```bash
curl -X GET "https://[subdomain].serveo.net/api/payments/mercadopago/webhook"
```

Resposta esperada:
```json
{
  "message": "MercadoPago webhook endpoint is ready",
  "status": "active"
}
```

### 2. Simular um Webhook
```bash
curl -X POST "https://[subdomain].serveo.net/api/payments/mercadopago/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.created",
    "api_version": "v1",
    "data": {
      "id": "123456789"
    },
    "date_created": "2024-01-01T00:00:00Z",
    "id": 12345,
    "live_mode": false,
    "type": "payment",
    "user_id": "USER_ID"
  }'
```

## Logs dos Webhooks

Os webhooks são logados automaticamente. Verifique os logs do Flask para monitorar:

```
INFO - Webhook recebido: payment.created para pagamento ID: 123456789
INFO - Processando webhook payment.created...
INFO - Webhook processado com sucesso
```

## Eventos Suportados

### payment.*
- `payment.created` - Pagamento criado
- `payment.updated` - Pagamento atualizado  
- `payment.cancelled` - Pagamento cancelado

### Outros Eventos
- `plan.*` - Eventos de planos de assinatura
- `subscription.*` - Eventos de assinatura
- `invoice.*` - Eventos de fatura
- `point_integration_wh.*` - Eventos de integração

## Troubleshooting

### URL Não Responde
- Verificar se o túnel SSH está ativo
- Confirmar se Flask está rodando na porta 5001
- Testar conectividade: `curl https://[subdomain].serveo.net`

### Webhook Não Recebe Notificações
- Verificar configuração no painel MercadoPago
- Confirmar que a URL está correta
- Verificar logs do Flask para erros

### Erro 500 no Webhook
- Verificar se o banco de dados está conectado
- Confirmar se as tabelas necessárias existem
- Verificar logs detalhados do Flask

## Importante

⚠️ **Manter o Túnel Ativo**: O comando SSH deve permanecer rodando para que os webhooks funcionem.

⚠️ **URL Temporária**: A URL do serveo.net é temporária e pode mudar se a conexão for perdida.

⚠️ **Ambiente de Teste**: Esta configuração é para testes. Em produção, use um domínio próprio e HTTPS configurado.