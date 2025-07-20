# 🎯 Configuração Final de Webhooks MercadoPago

## ✅ Status Atual

### Servidores Ativos
- **Flask Backend**: `http://localhost:5001` ✅
- **Vite Frontend**: `http://localhost:3000` ✅  
- **Túnel SSH**: `https://143ca128a2fd9a9839a0bcc71b1f214e.serveo.net` ✅

### Webhook Endpoints Testados
- **Local**: `http://localhost:5001/api/payments/mercadopago/webhook` ✅ (Funcionando)
- **Público**: `https://143ca128a2fd9a9839a0bcc71b1f214e.serveo.net/api/payments/mercadopago/webhook` 🔄 (Testando)

## 📋 URLs para Configuração no MercadoPago

### Webhook Principal
```
https://143ca128a2fd9a9839a0bcc71b1f214e.serveo.net/api/payments/mercadopago/webhook
```

### Webhook Transparente (Opcional)
```  
https://143ca128a2fd9a9839a0bcc71b1f214e.serveo.net/api/payments/mercadopago/transparent/webhook
```

## 🔧 Como Configurar no Painel MercadoPago

### 1. Acesse o Dashboard
- URL: https://www.mercadopago.com.br/developers/
- Entre com suas credenciais de teste
- Vá para "Webhooks" ou "Notificações"

### 2. Criar Webhook
1. **Nome**: `MestresdoCafe Webhook`
2. **URL**: `https://143ca128a2fd9a9839a0bcc71b1f214e.serveo.net/api/payments/mercadopago/webhook`
3. **Eventos**:
   - ✅ payment (pagamentos)
   - ✅ plan (planos)  
   - ✅ subscription (assinaturas)
   - ✅ invoice (faturas)
   - ✅ point_integration_wh (integração)

### 3. Salvar e Ativar
- Clique em "Salvar" 
- Verifique se o status está "Ativo"
- Teste uma notificação se possível

## 🧪 Testes de Validação

### Teste Local (Confirmado ✅)
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"123"}}' \
  http://localhost:5001/api/payments/mercadopago/webhook
```

**Resposta esperada:** `{"status": "ok"}`

### Teste Público (Em andamento 🔄)
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"test"}}' \
  https://143ca128a2fd9a9839a0bcc71b1f214e.serveo.net/api/payments/mercadopago/webhook
```

## 🚨 Troubleshooting

### Se o Webhook Não Responder
1. **Verificar túnel SSH ativo**:
   ```bash
   # No terminal, confirmar se mostra:
   # Forwarding HTTP traffic from https://143ca128a2fd9a9839a0bcc71b1f214e.serveo.net
   ```

2. **Testar conectividade**:
   ```bash
   curl -I https://143ca128a2fd9a9839a0bcc71b1f214e.serveo.net
   ```

3. **Verificar logs do Flask**:
   - Monitorar terminal 1 para requisições webhook
   - Procurar por logs: "Webhook processed successfully"

### Se a URL Mudar
- O serveo.net pode gerar nova URL se a conexão SSH for perdida
- Reconectar: `ssh -R 80:localhost:5001 serveo.net`
- Atualizar URL no painel MercadoPago

## 📊 Logs e Monitoramento

### Logs Esperados no Flask
```
2025-07-20 20:49:30 - mestres_cafe - INFO - Webhook processed successfully: {'type': 'payment', 'data': {'id': '123'}}
```

### Códigos de Status
- `200` - Webhook processado com sucesso
- `400` - Dados inválidos ou erro de validação  
- `401` - Falha na validação da assinatura
- `500` - Erro interno do servidor

## 🔐 Segurança

### Validação de Assinatura
- O webhook valida assinatura via header `X-Signature`
- Em produção, sempre validar assinaturas
- Usar HTTPS obrigatoriamente

### Headers de Segurança
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY  
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'none'
```

## 🚀 Próximos Passos

1. **Aguardar confirmação** do teste público via serveo.net
2. **Configurar webhook** no painel MercadoPago com a URL fornecida
3. **Realizar pagamento teste** para validar notificações
4. **Monitorar logs** para confirmar recebimento de webhooks
5. **Documentar** qualquer erro ou problema encontrado

## 📝 Notas Importantes

- **URL Temporária**: A URL do serveo.net é temporária
- **Manter Túnel Ativo**: O comando SSH deve permanecer rodando
- **Ambiente de Teste**: Esta configuração é para testes - em produção usar domínio próprio
- **Credenciais**: Usar sempre credenciais de teste durante desenvolvimento

---

**Status da Configuração**: 🟡 Em andamento (aguardando confirmação do teste público)
**Última atualização**: 2025-07-20 20:50