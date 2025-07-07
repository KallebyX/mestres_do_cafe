const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class CheckoutAPI {
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição para ${endpoint}:`, error);
      throw error;
    }
  }

  // Iniciar processo de checkout
  async startCheckout(data) {
    return this.makeRequest('/api/checkout/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Validar CEP
  async validateCEP(data) {
    return this.makeRequest('/api/checkout/validate-cep', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Calcular opções de frete
  async calculateShipping(data) {
    return this.makeRequest('/api/checkout/shipping-options', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Aplicar cupom de desconto
  async applyCoupon(data) {
    return this.makeRequest('/api/checkout/apply-coupon', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Finalizar checkout
  async completeCheckout(data) {
    return this.makeRequest('/api/checkout/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Obter métodos de pagamento disponíveis
  async getPaymentMethods() {
    return this.makeRequest('/api/checkout/payment-methods');
  }

  // Buscar carrinhos abandonados (para admin)
  async getAbandonedCarts() {
    return this.makeRequest('/api/checkout/abandoned-carts');
  }
}

export const checkoutAPI = new CheckoutAPI();
export default checkoutAPI;