/**
 * Configurações do MercadoPago Checkout Transparente
 * ==================================================
 * 
 * Este arquivo centraliza todas as configurações do MercadoPago
 * para uso no frontend da aplicação.
 */

// Configurações base
export const MERCADO_PAGO_CONFIG = {
  // Chaves públicas (ambiente detectado automaticamente)
  publicKeys: {
    test: 'TEST-6470757372800949-072017-f45dc4b7ff499723f495a8525cfc9112-1211284486',
    production: '' // A ser configurado em produção
  },
  
  // URLs da API
  apiUrls: {
    development: 'http://localhost:5000/api/payments/mercadopago',
    production: '/api/payments/mercadopago'
  },
  
  // Configurações do SDK
  sdk: {
    version: 'v2',
    locale: 'pt-BR'
  },
  
  // Métodos de pagamento disponíveis
  paymentMethods: {
    card: {
      enabled: true,
      brands: ['visa', 'mastercard', 'amex', 'elo', 'hipercard'],
      installments: {
        min: 1,
        max: 12,
        freeInstallments: 3
      }
    },
    pix: {
      enabled: true,
      expirationMinutes: 60
    },
    boleto: {
      enabled: true,
      daysToExpire: 3
    }
  },
  
  // Configurações de UI
  ui: {
    theme: 'light',
    colors: {
      primary: '#0066cc',
      secondary: '#6c757d',
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107'
    },
    styles: {
      borderRadius: '0.375rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }
  }
};

// Utilitários para configuração
export const MercadoPagoUtils = {
  /**
   * Detecta o ambiente atual
   */
  getEnvironment() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    return 'production';
  },

  /**
   * Obtém a chave pública baseada no ambiente
   */
  getPublicKey() {
    const env = this.getEnvironment();
    const key = env === 'development' ? 
      MERCADO_PAGO_CONFIG.publicKeys.test : 
      MERCADO_PAGO_CONFIG.publicKeys.production;
    
    if (!key) {
      throw new Error(`Chave pública do MercadoPago não configurada para ambiente: ${env}`);
    }
    
    return key;
  },

  /**
   * Obtém a URL da API baseada no ambiente
   */
  getApiUrl() {
    const env = this.getEnvironment();
    return MERCADO_PAGO_CONFIG.apiUrls[env];
  },

  /**
   * Valida se o método de pagamento está habilitado
   */
  isPaymentMethodEnabled(method) {
    return MERCADO_PAGO_CONFIG.paymentMethods[method]?.enabled || false;
  },

  /**
   * Obtém configurações de parcelamento
   */
  getInstallmentConfig() {
    return MERCADO_PAGO_CONFIG.paymentMethods.card.installments;
  },

  /**
   * Formata valor para exibição
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  },

  /**
   * Valida dados básicos de pagamento
   */
  validatePaymentData(data) {
    const errors = [];

    if (!data.amount || data.amount <= 0) {
      errors.push('Valor deve ser maior que zero');
    }

    if (!data.payer_email || !this.isValidEmail(data.payer_email)) {
      errors.push('Email inválido');
    }

    if (!data.payer_doc_number) {
      errors.push('CPF/CNPJ obrigatório');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valida formato de email
   */
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
};

// Configurações específicas para cada método de pagamento
export const PAYMENT_METHOD_CONFIG = {
  card: {
    fields: [
      {
        name: 'card_number',
        label: 'Número do cartão',
        type: 'text',
        required: true,
        mask: '0000 0000 0000 0000',
        validation: 'card'
      },
      {
        name: 'expiry_month',
        label: 'Mês',
        type: 'select',
        required: true,
        options: Array.from({length: 12}, (_, i) => ({
          value: String(i + 1).padStart(2, '0'),
          label: String(i + 1).padStart(2, '0')
        }))
      },
      {
        name: 'expiry_year',
        label: 'Ano',
        type: 'select',
        required: true,
        options: Array.from({length: 10}, (_, i) => {
          const year = new Date().getFullYear() + i;
          return { value: String(year).slice(-2), label: String(year) };
        })
      },
      {
        name: 'cvv',
        label: 'CVV',
        type: 'text',
        required: true,
        mask: '000',
        validation: 'cvv'
      },
      {
        name: 'cardholder_name',
        label: 'Nome no cartão',
        type: 'text',
        required: true,
        validation: 'name'
      }
    ]
  },
  
  pix: {
    fields: [
      {
        name: 'payer_first_name',
        label: 'Nome',
        type: 'text',
        required: true,
        validation: 'name'
      },
      {
        name: 'payer_last_name', 
        label: 'Sobrenome',
        type: 'text',
        required: true,
        validation: 'name'
      }
    ]
  },
  
  boleto: {
    fields: [
      {
        name: 'payer_first_name',
        label: 'Nome',
        type: 'text',
        required: true,
        validation: 'name'
      },
      {
        name: 'payer_last_name',
        label: 'Sobrenome', 
        type: 'text',
        required: true,
        validation: 'name'
      }
    ]
  }
};

// Estados de pagamento com suas descrições
export const PAYMENT_STATES = {
  pending: {
    label: 'Pendente',
    color: 'warning',
    description: 'Aguardando processamento'
  },
  approved: {
    label: 'Aprovado',
    color: 'success', 
    description: 'Pagamento aprovado'
  },
  rejected: {
    label: 'Rejeitado',
    color: 'error',
    description: 'Pagamento rejeitado'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'error',
    description: 'Pagamento cancelado'
  },
  refunded: {
    label: 'Reembolsado',
    color: 'info',
    description: 'Pagamento reembolsado'
  },
  charged_back: {
    label: 'Estorno',
    color: 'error',
    description: 'Chargeback realizado'
  }
};

// Códigos de erro comuns
export const ERROR_CODES = {
  'cc_rejected_insufficient_amount': 'Saldo insuficiente',
  'cc_rejected_bad_filled_card_number': 'Número do cartão inválido',
  'cc_rejected_bad_filled_date': 'Data de validade inválida',
  'cc_rejected_bad_filled_security_code': 'Código de segurança inválido',
  'cc_rejected_bad_filled_other': 'Dados do cartão inválidos',
  'cc_rejected_call_for_authorize': 'Autorização negada pelo banco',
  'cc_rejected_card_disabled': 'Cartão desabilitado',
  'cc_rejected_duplicated_payment': 'Pagamento duplicado',
  'cc_rejected_high_risk': 'Pagamento de alto risco',
  'cc_rejected_max_attempts': 'Muitas tentativas de pagamento',
  'cc_rejected_other_reason': 'Pagamento rejeitado',
  'pix_not_found': 'PIX não encontrado',
  'boleto_expired': 'Boleto expirado'
};

export default MERCADO_PAGO_CONFIG;