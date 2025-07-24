/**
 * Serviço de integração com MercadoPago - Frontend
 * Conecta com as APIs reais do backend MercadoPago
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class MercadoPagoAPI {
  constructor() {
    // Chave pública do MercadoPago (sandbox para desenvolvimento)
    this.publicKey = process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY || 'TEST-your-public-key';
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const token = localStorage.getItem('token');
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🔄 MercadoPago API Request: ${endpoint}`, {
        method: defaultOptions.method || 'GET',
        body: defaultOptions.body ? JSON.parse(defaultOptions.body) : null
      });

      const response = await fetch(url, defaultOptions);
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`❌ MercadoPago API Error: ${endpoint}`, {
          status: response.status,
          error: data.error,
          details: data.details
        });
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ MercadoPago API Success: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`💥 MercadoPago API Exception: ${endpoint}`, error);
      throw error;
    }
  }

  // ========== CHECKOUT PRO (PREFERENCE) ========== //

  /**
   * Criar preferência para Checkout Pro
   */
  async createPreference(orderData) {
    return this.makeRequest('/api/payments/mercadopago/create-preference', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // ========== CHECKOUT TRANSPARENTE ========== //

  /**
   * Criar token de cartão para Checkout Transparente
   */
  async createCardToken(cardData) {
    return this.makeRequest('/api/payments/mercadopago/transparent/create-card-token', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }

  /**
   * Processar pagamento transparente (PIX, Cartão, Boleto)
   */
  async processTransparentPayment(paymentData) {
    return this.makeRequest('/api/payments/mercadopago/transparent/process-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  /**
   * Validar dados de pagamento antes do processamento
   */
  async validatePaymentData(paymentData) {
    return this.makeRequest('/api/payments/mercadopago/transparent/validate-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  /**
   * Obter opções de parcelamento
   */
  async getInstallments(amount, paymentMethodId) {
    const params = new URLSearchParams({
      amount: amount.toString(),
      payment_method_id: paymentMethodId,
    });
    
    return this.makeRequest(`/api/payments/mercadopago/transparent/installments?${params}`);
  }

  // ========== MÉTODOS DE PAGAMENTO ========== //

  /**
   * Obter métodos de pagamento disponíveis
   */
  async getPaymentMethods() {
    return this.makeRequest('/api/payments/mercadopago/payment-methods');
  }

  /**
   * Obter métodos de pagamento para Checkout Transparente
   */
  async getTransparentPaymentMethods() {
    return this.makeRequest('/api/payments/mercadopago/transparent/payment-methods');
  }

  // ========== PAGAMENTO STATUS ========== //

  /**
   * Obter status de um pagamento
   */
  async getPaymentStatus(paymentId) {
    return this.makeRequest(`/api/payments/mercadopago/payment/${paymentId}`);
  }

  // ========== UTILITÁRIOS ========== //

  /**
   * Mapear método de pagamento do frontend para MercadoPago
   */
  mapPaymentMethod(frontendMethod) {
    const methodMap = {
      'pix': 'pix',
      'credit_card': 'visa', // Será determinado pelo BIN do cartão
      'debit_card': 'visa',  // Será determinado pelo BIN do cartão
      'boleto': 'bolbradesco'
    };
    
    return methodMap[frontendMethod] || frontendMethod;
  }

  /**
   * Detectar bandeira do cartão baseado no BIN
   */
  detectCardBrand(cardNumber) {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    // Visa
    if (cleanNumber.startsWith('4')) {
      return 'visa';
    }
    
    // Mastercard
    if (cleanNumber.startsWith('5') || 
        (cleanNumber.startsWith('2') && parseInt(cleanNumber.substr(0, 4)) >= 2221 && parseInt(cleanNumber.substr(0, 4)) <= 2720)) {
      return 'master';
    }
    
    // American Express
    if (cleanNumber.startsWith('34') || cleanNumber.startsWith('37')) {
      return 'amex';
    }
    
    // Elo
    if (cleanNumber.startsWith('636368') || 
        cleanNumber.startsWith('504175') || 
        cleanNumber.startsWith('509048') || 
        cleanNumber.startsWith('627780')) {
      return 'elo';
    }
    
    return 'visa'; // Default
  }

  /**
   * Validar dados do cartão
   */
  validateCardData(cardData) {
    const errors = [];
    
    if (!cardData.card_number || cardData.card_number.replace(/\D/g, '').length < 13) {
      errors.push('Número do cartão inválido');
    }
    
    if (!cardData.cardholder_name || cardData.cardholder_name.trim().length < 2) {
      errors.push('Nome do portador é obrigatório');
    }
    
    if (!cardData.expiry_month || cardData.expiry_month < 1 || cardData.expiry_month > 12) {
      errors.push('Mês de expiração inválido');
    }
    
    if (!cardData.expiry_year || cardData.expiry_year < new Date().getFullYear()) {
      errors.push('Ano de expiração inválido');
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      errors.push('CVV inválido');
    }
    
    // Verificar se cartão expirou
    const currentDate = new Date();
    const expiryDate = new Date(cardData.expiry_year, cardData.expiry_month - 1);
    
    if (expiryDate < currentDate) {
      errors.push('Cartão expirado');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatar dados do cartão para tokenização
   */
  formatCardDataForToken(cardData) {
    const cleanCardNumber = cardData.number.replace(/\D/g, '');
    const [expiryMonth, expiryYear] = cardData.expiry.split('/');
    
    return {
      card_number: cleanCardNumber,
      expiry_month: parseInt(expiryMonth),
      expiry_year: parseInt(`20${expiryYear}`),
      cvv: cardData.cvv,
      cardholder_name: cardData.name,
    };
  }

  /**
   * Formatar dados para pagamento PIX
   */
  formatPixPaymentData(orderData, payerData) {
    return {
      order_id: orderData.order_id,
      amount: orderData.amount,
      payment_method_id: 'pix',
      payer_email: payerData.email,
      payer_first_name: payerData.first_name || '',
      payer_last_name: payerData.last_name || '',
      payer_doc_type: 'CPF',
      payer_doc_number: payerData.doc_number,
      description: `Compra Mestres do Café - Pedido ${orderData.order_number}`,
      pix_expiration: 30, // 30 minutos
    };
  }

  /**
   * Formatar dados para pagamento com cartão
   */
  formatCardPaymentData(orderData, payerData, cardToken, installments = 1) {
    const paymentMethodId = this.detectCardBrand(cardToken.first_six_digits);
    
    return {
      order_id: orderData.order_id,
      amount: orderData.amount,
      payment_method_id: paymentMethodId,
      token: cardToken.token,
      installments: installments,
      payer_email: payerData.email,
      payer_first_name: payerData.first_name || '',
      payer_last_name: payerData.last_name || '',
      payer_doc_type: 'CPF',
      payer_doc_number: payerData.doc_number,
      description: `Compra Mestres do Café - Pedido ${orderData.order_number}`,
      enable_3ds: true,
    };
  }

  /**
   * Formatar dados para pagamento com boleto
   */
  formatBoletoPaymentData(orderData, payerData) {
    return {
      order_id: orderData.order_id,
      amount: orderData.amount,
      payment_method_id: 'bolbradesco',
      payer_email: payerData.email,
      payer_first_name: payerData.first_name || '',
      payer_last_name: payerData.last_name || '',
      payer_doc_type: 'CPF',
      payer_doc_number: payerData.doc_number,
      description: `Compra Mestres do Café - Pedido ${orderData.order_number}`,
    };
  }

  // ========== FLUXO COMPLETO DE PAGAMENTO ========== //

  /**
   * Processar pagamento completo baseado no método escolhido
   */
  async processPayment(paymentType, paymentData, orderData) {
    console.log(`🎯 Processing ${paymentType} payment`, { paymentData, orderData });

    try {
      switch (paymentType) {
        case 'pix':
          return await this.processPixPayment(paymentData, orderData);
        
        case 'credit_card':
        case 'debit_card':
          return await this.processCardPayment(paymentData, orderData);
        
        case 'boleto':
          return await this.processBoletoPayment(paymentData, orderData);
        
        default:
          throw new Error(`Método de pagamento não suportado: ${paymentType}`);
      }
    } catch (error) {
      console.error(`❌ Payment processing failed for ${paymentType}:`, error);
      throw error;
    }
  }

  /**
   * Processar pagamento PIX
   */
  async processPixPayment(paymentData, orderData) {
    const pixData = this.formatPixPaymentData(orderData, paymentData);
    return await this.processTransparentPayment(pixData);
  }

  /**
   * Processar pagamento com cartão
   */
  async processCardPayment(paymentData, orderData) {
    // 1. Criar token do cartão
    const cardTokenData = this.formatCardDataForToken(paymentData.cardData);
    const tokenResponse = await this.createCardToken(cardTokenData);
    
    if (!tokenResponse.success) {
      throw new Error('Falha ao processar dados do cartão');
    }
    
    // 2. Processar pagamento com token
    const cardPaymentData = this.formatCardPaymentData(
      orderData, 
      paymentData, 
      tokenResponse, 
      paymentData.cardData.installments
    );
    
    return await this.processTransparentPayment(cardPaymentData);
  }

  /**
   * Processar pagamento com boleto
   */
  async processBoletoPayment(paymentData, orderData) {
    const boletoData = this.formatBoletoPaymentData(orderData, paymentData);
    return await this.processTransparentPayment(boletoData);
  }
}

// Instância singleton
export const mercadoPagoAPI = new MercadoPagoAPI();
export default mercadoPagoAPI;