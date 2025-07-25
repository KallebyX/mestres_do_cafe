/* eslint-disable no-console */
import axios from 'axios';
import { apiConfig } from '../config/api.js';

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Desabilitado temporariamente para resolver CORS
});

// Interceptador para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    // Adicionar token se existir
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erros de autenticação
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =============================================
// SERVIÇOS DE AUTENTICAÇÃO
// =============================================

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao fazer login' 
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao fazer registro' 
      };
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao fazer logout' 
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar usuário' 
      };
    }
  },

  resetPassword: async (email) => {
    try {
      const response = await api.post('/api/auth/reset-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao redefinir senha' 
      };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao atualizar perfil' 
      };
    }
  }
};

// =============================================
// SERVIÇOS DE PRODUTOS
// =============================================

export const productsAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/api/products', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar produtos'
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/api/products/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar produto'
      };
    }
  },

  create: async (productData) => {
    try {
      const response = await api.post('/api/products', productData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar produto'
      };
    }
  },

  update: async (id, productData) => {
    try {
      const response = await api.put(`/api/products/${id}`, productData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar produto'
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/products/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao deletar produto'
      };
    }
  },

  getFeatured: async () => {
    try {
      const response = await api.get('/api/products/featured');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar produtos em destaque'
      };
    }
  },

  getByCategory: async (category) => {
    try {
      const response = await api.get(`/api/products/category/${category}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar produtos por categoria'
      };
    }
  }
};

// =============================================
// SERVIÇOS DE CARRINHO
// =============================================

export const cartAPI = {
  getCart: async () => {
    try {
      const response = await api.get('/api/cart/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar carrinho'
      };
    }
  },

  // ✅ CORRIGIDO: Usar URLs corretas do backend
  addItem: async (productId, quantity = 1, productPriceId = null, weight = null) => {
    try {
      const payload = {
        product_id: productId,
        quantity
      };
      
      // Adicionar campos de peso se fornecidos
      if (productPriceId) payload.product_price_id = productPriceId;
      if (weight) payload.weight = weight;
      
      console.log('🛒 cartAPI.addItem payload:', payload);
      
      const response = await api.post('/api/cart/add', payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao adicionar item ao carrinho'
      };
    }
  },

  // Alias para compatibilidade
  add: async (productId, quantity = 1, productPriceId = null, weight = null) => {
    return cartAPI.addItem(productId, quantity, productPriceId, weight);
  },

  // Método addToCart usado pelo CartContext
  addToCart: async (productId, quantity = 1, productPriceId = null, weight = null) => {
    return cartAPI.addItem(productId, quantity, productPriceId, weight);
  },

  updateItem: async (productId, quantity) => {
    try {
      const response = await api.put(`/api/cart/${productId}`, { quantity });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar item do carrinho'
      };
    }
  },

  // Alias para compatibilidade
  update: async (productId, quantity) => {
    return cartAPI.updateItem(productId, quantity);
  },

  removeItem: async (productId) => {
    try {
      const response = await api.delete(`/api/cart/${productId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao remover item do carrinho'
      };
    }
  },

  // Alias para compatibilidade
  remove: async (productId) => {
    return cartAPI.removeItem(productId);
  },

  clearCart: async () => {
    try {
      const response = await api.delete('/api/cart/clear');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao limpar carrinho'
      };
    }
  },

  // Alias para compatibilidade
  clear: async () => {
    return cartAPI.clearCart();
  }
};

// =============================================
// SERVIÇOS DE PEDIDOS
// =============================================

export const ordersAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/orders', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar pedidos' 
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar pedido' 
      };
    }
  },

  create: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao criar pedido' 
      };
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao atualizar status do pedido' 
      };
    }
  }
};

// =============================================
// SERVIÇOS DE CHECKOUT
// =============================================

export const checkoutApi = {
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/checkout/create-order', orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao criar pedido' 
      };
    }
  },

  processPayment: async (paymentData) => {
    try {
      const response = await api.post('/checkout/process-payment', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao processar pagamento' 
      };
    }
  },

  calculateShipping: async (shippingData) => {
    try {
      const response = await api.post('/checkout/calculate-shipping', shippingData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao calcular frete' 
      };
    }
  }
};

// =============================================
// SERVIÇOS DE ADMINISTRAÇÃO
// =============================================

export const analyticsAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/api/admin/analytics/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar estatísticas' 
      };
    }
  },

  getChartData: async (type, period = '30d') => {
    try {
      const response = await api.get(`/admin/analytics/charts/${type}`, { params: { period } });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar dados do gráfico' 
      };
    }
  }
};

export const stockAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/admin/stock');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar estoque' 
      };
    }
  },

  update: async (productId, stockData) => {
    try {
      const response = await api.put(`/admin/stock/${productId}`, stockData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao atualizar estoque' 
      };
    }
  }
};

// =============================================
// SERVIÇOS DE NEWSLETTER
// =============================================

export const newsletterAPI = {
  subscribe: async (email) => {
    try {
      const response = await api.post('/newsletter/subscribe', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao se inscrever na newsletter'
      };
    }
  },

  send: async (newsletterData) => {
    try {
      const endpoint = newsletterData.type === 'email' ? '/newsletter/email' : '/newsletter/whatsapp';
      const response = await api.post(endpoint, newsletterData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao enviar newsletter'
      };
    }
  },

  getStatus: async () => {
    try {
      const response = await api.get('/newsletter/whatsapp/status');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao verificar status do WhatsApp'
      };
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/newsletter/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter estatísticas da newsletter'
      };
    }
  }
};

// =============================================
// SERVIÇOS ADICIONAIS
// =============================================

export const blogAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/blog');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar posts do blog' 
      };
    }
  },

  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/blog/${slug}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar post' 
      };
    }
  }
};

export const reviewsAPI = {
  getByProduct: async (productId) => {
    try {
      const response = await api.get(`/api/reviews/product/${productId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar avaliações'
      };
    }
  },

  create: async (reviewData) => {
    try {
      const response = await api.post('/api/reviews', reviewData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar avaliação'
      };
    }
  },

  getFeatured: async (params = {}) => {
    try {
      const response = await api.get('/api/reviews/featured', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar avaliações em destaque'
      };
    }
  }
};

export const wishlistAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/wishlist');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar lista de desejos' 
      };
    }
  },

  add: async (productId) => {
    try {
      const response = await api.post('/wishlist', { product_id: productId });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao adicionar à lista de desejos' 
      };
    }
  },

  remove: async (productId) => {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao remover da lista de desejos' 
      };
    }
  }
};

// Serviços extras para compatibilidade
export const financialAPI = {
  getReports: async () => {
    try {
      const response = await api.get('/admin/financial/reports');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar relatórios financeiros' 
      };
    }
  }
};

export const hrAPI = {
  getEmployees: async () => {
    try {
      const response = await api.get('/admin/hr/employees');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar funcionários' 
      };
    }
  }
};

export const notificationAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/notifications');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar notificações'
      };
    }
  },

  // Método específico para getNotifications (usado pelo NotificationContext)
  getNotifications: async (userId) => {
    try {
      const response = await api.get('/notifications', userId ? { params: { user_id: userId } } : {});
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar notificações'
      };
    }
  },

  createNotification: async (notificationData) => {
    try {
      const response = await api.post('/notifications', notificationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar notificação'
      };
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao marcar notificação como lida'
      };
    }
  }
};

export const reportsAPI = {
  generate: async (reportType, filters = {}) => {
    try {
      const response = await api.post('/admin/reports/generate', { type: reportType, filters });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao gerar relatório' 
      };
    }
  }
};

export const shippingAPI = {
  calculate: async (shippingData) => {
    try {
      const response = await api.post('/shipping/calculate', shippingData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao calcular frete' 
      };
    }
  }
};

// Exportar instância do axios para uso direto se necessário
export default api;