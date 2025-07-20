# MercadoPago Checkout Transparente - Guia de Instalação
=========================================================

Este documento fornece instruções completas para configurar e usar a integração MercadoPago Checkout Transparente na aplicação MestresdoCafe.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Instalação](#-instalação)
- [Configuração das Credenciais](#-configuração-das-credenciais)
- [Execução dos Testes](#-execução-dos-testes)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Usar](#-como-usar)
- [Configuração para Produção](#-configuração-para-produção)
- [Troubleshooting](#-troubleshooting)
- [Suporte](#-suporte)

## 🚀 Visão Geral

A integração MercadoPago Checkout Transparente oferece:

- **Pagamentos com Cartão**: Visa, Mastercard, Amex, Elo, Hipercard
- **PIX**: Pagamento instantâneo com QR Code
- **Boleto Bancário**: Geração automática de boletos
- **Webhooks**: Notificações automáticas de mudança de status
- **Tokenização**: Segurança máxima para dados de cartão
- **3D Secure**: Autenticação adicional para transações
- **Marketplace**: Suporte a split de pagamentos

## 📦 Pré-requisitos

### Ambiente de Desenvolvimento

```bash
# Versões mínimas
Node.js >= 16.x
Python >= 3.9
PostgreSQL >= 12.x
```

### Conta MercadoPago

1. Conta no [MercadoPago Developers](https://www.mercadopago.com.br/developers)
2. Credenciais de teste configuradas
3. Webhook configurado (opcional para testes)

## ⚙️ Configuração do Ambiente

### 1. Clone e Configure o Projeto

```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]
cd mestres_cafe_enterprise

# Configure o ambiente Python (Backend)
cd apps/api
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instale dependências Python
pip install -r requirements.txt

# Configure o ambiente Node.js (Frontend)
cd ../web
npm install
```

### 2. Configuração do Banco de Dados

```bash
# Execute as migrações
cd apps/api
python -m alembic upgrade head

# Ou execute o setup inicial se necessário
python src/database.py
```

## 🔐 Configuração das Credenciais

### 1. Arquivo .env (Backend)

Crie o arquivo `apps/api/.env` baseado no `.env.example`:

```bash
# Copie o arquivo de exemplo
cd apps/api
cp .env.example .env
```

Configure as variáveis do MercadoPago:

```env
# Credenciais MercadoPago (TESTE)
MP_ACCESS_TOKEN_TEST=TEST-6470757372800949-072017-f45dc4b7ff499723f495a8525cfc9112-1211284486
MP_PUBLIC_KEY_TEST=TEST-6470757372800949-072017-f45dc4b7ff499723f495a8525cfc9112-1211284486
MP_ENVIRONMENT=sandbox

# Configurações da Aplicação MercadoPago
MP_APPLICATION_ID=1211284486
MP_APPLICATION_NUMBER=6470757372800949

# Configurações Avançadas
MP_ENABLE_3DS=true
MP_ENABLE_TOKENIZATION=true
MP_MARKETPLACE_FEE_PERCENTAGE=2.5
MP_WEBHOOK_SECRET=your_webhook_secret_here

# URLs
MP_WEBHOOK_URL=http://localhost:5000/api/payments/mercadopago/webhook
MP_SUCCESS_URL=http://localhost:3000/checkout/success
MP_FAILURE_URL=http://localhost:3000/checkout/failure
MP_PENDING_URL=http://localhost:3000/checkout/pending
```

### 2. Configuração Frontend

O frontend detecta automaticamente o ambiente baseado na URL. Para desenvolvimento local, as credenciais de teste são usadas automaticamente.

## 🎯 Instalação

### 1. Backend (API)

```bash
cd apps/api

# Ative o ambiente virtual
source venv/bin/activate

# Instale dependências específicas do MercadoPago
pip install mercadopago==2.2.0

# Execute a aplicação
python -m flask run --host=0.0.0.0 --port=5000
```

### 2. Frontend (Web)

```bash
cd apps/web

# Instale dependências (se não fez antes)
npm install

# Execute em modo de desenvolvimento
npm run dev
```

### 3. Verificação da Instalação

Acesse:
- Backend: http://localhost:5000/api/health
- Frontend: http://localhost:3000
- API MercadoPago: http://localhost:5000/api/payments/mercadopago/transparent/payment-methods

## 🧪 Execução dos Testes

### 1. Testes Automatizados

```bash
# Execute o script de setup e testes
cd scripts
python setup_mercadopago_tests.py

# Ou execute apenas os testes
python setup_mercadopago_tests.py --test-only

# Ou execute apenas o setup
python setup_mercadopago_tests.py --setup-only
```

### 2. Testes Manuais

Consulte o arquivo [`docs/MERCADO_PAGO_GUIA_TESTES.md`](docs/MERCADO_PAGO_GUIA_TESTES.md) para instruções detalhadas de testes manuais.

### 3. Cartões de Teste

| Bandeira | Número | CVV | Validade | Nome | Status |
|----------|--------|-----|----------|------|--------|
| Visa | 4235 6477 2802 5682 | 123 | 11/25 | APRO | Aprovado |
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | OTHE | Rejeitado |
| Mastercard | 5031 4332 1540 6351 | 123 | 11/25 | APRO | Aprovado |
| Amex | 3753 651535 56885 | 1234 | 11/25 | APRO | Aprovado |

**CPF de Teste**: 191.191.191-00

## 📁 Estrutura do Projeto

```
mestres_cafe_enterprise/
├── apps/
│   ├── api/                          # Backend Flask
│   │   ├── .env.example              # Configurações de exemplo
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   └── mercado_pago_service.py    # Serviço principal
│   │   │   ├── controllers/routes/
│   │   │   │   └── mercado_pago.py           # Endpoints da API
│   │   │   ├── middleware/
│   │   │   │   └── mercado_pago_validation.py # Validações
│   │   │   └── models/
│   │   │       └── payments.py              # Modelos de pagamento
│   │   └── requirements.txt          # Dependências Python
│   └── web/                         # Frontend React
│       ├── src/
│       │   ├── components/
│       │   │   └── MercadoPagoTransparentCheckout.jsx
│       │   ├── hooks/
│       │   │   └── useMercadoPago.js        # Hook customizado
│       │   ├── config/
│       │   │   └── mercadopago.js          # Configurações
│       │   └── examples/
│       │       └── CheckoutIntegration.jsx  # Exemplo de integração
├── docs/
│   ├── MERCADO_PAGO_CHECKOUT_TRANSPARENTE.md  # Documentação técnica
│   └── MERCADO_PAGO_GUIA_TESTES.md           # Guia de testes
└── scripts/
    └── setup_mercadopago_tests.py           # Script de testes
```

## 🎮 Como Usar

### 1. Integração Básica

```jsx
import React from 'react';
import { useMercadoPago } from '../hooks/useMercadoPago';
import MercadoPagoTransparentCheckout from '../components/MercadoPagoTransparentCheckout';

function CheckoutPage() {
  const { isLoaded, processPayment } = useMercadoPago({
    onPaymentSuccess: (result) => {
      console.log('Pagamento aprovado:', result);
      // Redirecionar para página de sucesso
    },
    onPaymentError: (error) => {
      console.error('Erro no pagamento:', error);
      // Exibir mensagem de erro
    }
  });

  const handlePayment = async (paymentData) => {
    return await processPayment({
      ...paymentData,
      amount: 100.00,
      description: 'Compra no site'
    });
  };

  if (!isLoaded) {
    return <div>Carregando...</div>;
  }

  return (
    <MercadoPagoTransparentCheckout
      amount={100.00}
      orderId="order-123"
      onPaymentSubmit={handlePayment}
    />
  );
}
```

### 2. Processamento Backend

```python
from services.mercado_pago_service import MercadoPagoService

# Inicializar serviço
mp_service = MercadoPagoService()

# Processar pagamento
payment_data = {
    'order_id': 'order-123',
    'payment_method_id': 'visa',
    'token': 'card_token_here',
    'amount': 100.00,
    'payer_email': 'user@example.com'
}

result = mp_service.process_transparent_payment(payment_data)
print(f"Status: {result['status']}")
```

## 🚀 Configuração para Produção

### 1. Obtenha Credenciais de Produção

1. Acesse o [Painel do MercadoPago](https://www.mercadopago.com.br/developers/panel)
2. Complete o processo de verificação da conta
3. Obtenha as credenciais de produção

### 2. Atualize as Configurações

```env
# Substitua as credenciais no .env
MP_ACCESS_TOKEN=PROD-your-production-access-token
MP_PUBLIC_KEY=PROD-your-production-public-key
MP_ENVIRONMENT=production

# Configure webhook de produção
MP_WEBHOOK_URL=https://yourdomain.com/api/payments/mercadopago/webhook
```

### 3. Configure Webhooks

1. Acesse **Suas Integrações > Webhooks** no painel
2. Adicione: `https://yourdomain.com/api/payments/mercadopago/webhook`
3. Selecione eventos: `payment`, `merchant_order`

### 4. Teste em Produção

```bash
# Execute testes com credenciais de produção
python scripts/setup_mercadopago_tests.py --production
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Credenciais

```
❌ Credenciais de teste do MercadoPago não configuradas
```

**Solução**: Verifique se as variáveis `MP_ACCESS_TOKEN_TEST` e `MP_PUBLIC_KEY_TEST` estão configuradas no `.env`

#### 2. SDK não Carrega

```
❌ Falha ao carregar SDK do MercadoPago
```

**Solução**: 
- Verifique conexão com internet
- Desabilite bloqueadores de script
- Teste em modo incógnito

#### 3. Pagamento Rejeitado

```
❌ cc_rejected_bad_filled_card_number
```

**Solução**: Use cartões de teste válidos (consulte tabela acima)

#### 4. Webhook não Funciona

```
❌ Webhook signature validation failed
```

**Solução**: 
- Configure `MP_WEBHOOK_SECRET`
- Use ngrok para desenvolvimento local
- Verifique se a URL está acessível

### Logs e Debug

```bash
# Ativar logs detalhados
export FLASK_ENV=development
export FLASK_DEBUG=1

# Verificar logs
tail -f apps/api/logs/app.log | grep "mercado_pago"
```

### Verificação de Saúde

```bash
# Status da API
curl http://localhost:5000/api/health

# Métodos de pagamento
curl http://localhost:5000/api/payments/mercadopago/transparent/payment-methods

# Validação de dados
curl -X POST http://localhost:5000/api/payments/mercadopago/transparent/validate-payment \
  -H "Content-Type: application/json" \
  -d '{"payer_doc_number":"19119119100","payer_email":"test@test.com"}'
```

## 📞 Suporte

### Documentação Adicional

- [Documentação Técnica Completa](docs/MERCADO_PAGO_CHECKOUT_TRANSPARENTE.md)
- [Guia de Testes Detalhado](docs/MERCADO_PAGO_GUIA_TESTES.md)
- [Exemplo de Integração](apps/web/src/examples/CheckoutIntegration.jsx)

### Links Úteis

- [Documentação MercadoPago](https://www.mercadopago.com.br/developers/pt/guides)
- [Status da API MercadoPago](https://status.mercadopago.com/)
- [Comunidade Developers](https://www.mercadopago.com.br/developers/pt/community)

### Contato

Para dúvidas específicas da implementação:

- Consulte os arquivos de documentação na pasta `/docs`
- Execute o script de diagnóstico: `python scripts/setup_mercadopago_tests.py`
- Verifique os logs da aplicação em `apps/api/logs/`

---

## 📋 Checklist de Implementação

- [x] ⚙️ Configuração das credenciais de teste
- [x] 🔧 Implementação do serviço MercadoPago
- [x] 📡 Endpoints da API configurados  
- [x] 🛡️ Middleware de validação implementado
- [x] 🎨 Componente React funcional
- [x] 🔗 Hooks de integração criados
- [x] 📝 Documentação completa
- [x] 🧪 Scripts de teste automatizados
- [x] 🌐 Exemplo de integração funcional
- [ ] 🚀 Configuração para produção
- [ ] ✅ Testes em ambiente real
- [ ] 📊 Monitoramento configurado

**Status**: ✅ **Implementação Completa para Ambiente de Teste**

A integração MercadoPago Checkout Transparente está totalmente implementada e pronta para testes. Siga este guia para configurar o ambiente e executar validações antes de migrar para produção.