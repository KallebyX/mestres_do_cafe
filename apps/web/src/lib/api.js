/* eslint-disable no-console */
/**
 * API Library - Mestres do Café
 * Biblioteca centralizada para gerenciar conexões com APIs e serviços externos
 *
 * IMPORTANTE: Este projeto NÃO usa Supabase - apenas Flask API + PostgreSQL
 */

import { productsAPI, reviewsAPI, authAPI, analyticsAPI } from '../services/api.js';

// Exportar APIs principais do sistema Flask
export {
  authAPI,
  productsAPI,
  cartAPI,
  ordersAPI,
  checkoutApi,
  analyticsAPI,
  stockAPI,
  newsletterAPI,
  blogAPI,
  reviewsAPI,
  wishlistAPI,
  financialAPI,
  hrAPI,
  notificationAPI,
  reportsAPI,
  shippingAPI
} from '../services/api.js';

// Export default da instância do axios
export { default } from '../services/api.js';

// =============================================
// FUNÇÃO GENÉRICA DE REQUISIÇÃO À API
// =============================================

/**
 * Função genérica para fazer requisições à API
 * @param {string} endpoint - Endpoint da API (ex: '/admin/stats')
 * @param {object} options - Opções da requisição (method, body, etc.)
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const { default: api } = await import('../services/api.js');
    
    const config = {
      method: options.method || 'GET',
      ...options
    };
    
    // Se há body, adicionar aos dados da requisição
    if (options.body) {
      config.data = options.body;
    }
    
    const response = await api.request({
      url: endpoint,
      ...config
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Erro em apiRequest:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Erro na requisição'
    };
  }
};

// =============================================
// FUNÇÕES ADMINISTRATIVAS DE USUÁRIOS
// =============================================

/**
 * Criar novo usuário admin
 * @param {object} userData - Dados do usuário
 */
export const createUserAdmin = async (userData) => {
  try {
    console.log('🔐 createUserAdmin chamado com dados:', userData);
    const response = await authAPI.register(userData);
    console.log('✅ createUserAdmin - resposta da API:', response.success);
    return response;
  } catch (error) {
    console.error('❌ Erro em createUserAdmin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao criar usuário admin'
    };
  }
};

/**
 * Atualizar usuário admin existente
 * @param {string} userId - ID do usuário
 * @param {object} userData - Dados do usuário para atualizar
 */
export const updateUserAdmin = async (userId, userData) => {
  try {
    console.log('🔐 updateUserAdmin chamado com ID:', userId, 'e dados:', userData);
    const response = await authAPI.updateProfile(userData);
    console.log('✅ updateUserAdmin - resposta da API:', response.success);
    return response;
  } catch (error) {
    console.error('❌ Erro em updateUserAdmin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao atualizar usuário admin'
    };
  }
};

// =============================================
// FUNÇÕES UTILITÁRIAS ESPECÍFICAS
// =============================================

/**
 * Função genérica para buscar dados filtrados
 * @param {string} table - Nome da tabela/endpoint
 * @param {object} filters - Filtros a aplicar
 * @param {object} options - Opções como limit, orderBy, etc.
 */
export const getFiltered = async (table, filters = {}, options = {}) => {
  try {
    // Para produtos, usar a API específica
    if (table === 'products') {
      const queryParams = { ...filters };
      
      // Aplicar opções de ordenação e limite
      if (options.limit) queryParams.limit = options.limit;
      if (options.orderBy) queryParams.order_by = options.orderBy;
      if (options.ascending !== undefined) queryParams.ascending = options.ascending;
      
      const result = await productsAPI.getAll(queryParams);
      return result;
    }
    
    // Para outras tabelas, retornar erro informativo
    return {
      success: false,
      error: `Endpoint '${table}' não implementado. Este projeto usa apenas Flask API + PostgreSQL.`
    };
    
  } catch (error) {
    console.error('❌ Erro em getFiltered:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar dados filtrados'
    };
  }
};

/**
 * Buscar todos os produtos (wrapper para compatibilidade)
 * @param {object} filters - Filtros opcionais
 */
export const getAllProducts = async (filters = {}) => {
  try {
    console.log('🛍️ getAllProducts chamado com filtros:', filters);
    const response = await productsAPI.getAll(filters);
    console.log('✅ getAllProducts - resposta da API:', response.success);
    return response;
  } catch (error) {
    console.error('❌ Erro em getAllProducts:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar todos os produtos'
    };
  }
};

/**
 * Buscar testimonials em destaque (reviews do banco PostgreSQL)
 * @param {number} limit - Número máximo de testimonials
 */
export const getFeaturedTestimonials = async (limit = 3) => {
  try {
    // Usar API real do Flask para buscar reviews em destaque do banco PostgreSQL
    const response = await reviewsAPI.getFeatured({ limit });
    
    if (response.success && response.data) {
      // Mapear reviews para formato de testimonials para compatibilidade com LandingPage
      const testimonials = response.data.reviews?.map(review => ({
        id: review.id,
        name: review.user?.name || 'Cliente Anônimo',
        role: 'Cliente Verificado', // Pode ser expandido futuramente
        location: 'Brasil', // Pode ser expandido futuramente
        rating: review.rating,
        comment: review.comment,
        avatar_url: review.user?.avatar_url || null,
        is_featured: review.is_featured,
        created_at: review.created_at
      })) || [];

      console.log('✅ getFeaturedTestimonials - Dados reais do PostgreSQL carregados:', testimonials.length);

      return {
        success: true,
        data: testimonials.slice(0, limit)
      };
    } else {
      console.warn('⚠️ Nenhuma review em destaque encontrada no banco');
      return {
        success: true,
        data: []
      };
    }

  } catch (error) {
    console.error('❌ Erro em getFeaturedTestimonials:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar testimonials em destaque do banco PostgreSQL',
      data: []
    };
  }
};

/**
 * Buscar produto por ID com seus preços por peso
 * @param {number|string} productId - ID do produto
 */
export const getProductById = async (productId) => {
  try {
    console.log('🛍️ getProductById chamado com ID:', productId);
    const response = await productsAPI.getById(productId);
    console.log('✅ getProductById - resposta da API:', response.success);
    return response;
  } catch (error) {
    console.error('❌ Erro em getProductById:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar produto por ID'
    };
  }
};

// =============================================
// FUNÇÕES ADMINISTRATIVAS ESPECÍFICAS
// =============================================

/**
 * Buscar estatísticas do dashboard
 */
export const getStats = async () => {
  try {
    const response = await analyticsAPI.getStats();
    return response;
  } catch (error) {
    console.error('❌ Erro em getStats:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar estatísticas'
    };
  }
};

/**
 * Buscar todos os usuários (admin)
 */
export const getUsers = async () => {
  try {
    const response = await apiRequest('/api/admin/users');
    return response;
  } catch (error) {
    console.error('❌ Erro em getUsers:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar usuários'
    };
  }
};

/**
 * Buscar todos os produtos (admin)
 */
export const getAllProductsAdmin = async () => {
  try {
    const response = await apiRequest('/api/admin/products');
    return response;
  } catch (error) {
    console.error('❌ Erro em getAllProductsAdmin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar produtos'
    };
  }
};

/**
 * Buscar todos os pedidos (admin)
 */
export const getAllOrdersAdmin = async () => {
  try {
    const response = await apiRequest('/api/admin/orders');
    return response;
  } catch (error) {
    console.error('❌ Erro em getAllOrdersAdmin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar pedidos'
    };
  }
};

/**
 * Buscar todos os posts do blog (admin)
 */
export const getAllBlogPostsAdmin = async () => {
  try {
    const response = await apiRequest('/api/admin/blog');
    return response;
  } catch (error) {
    console.error('❌ Erro em getAllBlogPostsAdmin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar posts do blog'
    };
  }
};

/**
 * Buscar top produtos por receita
 */
export const getTopProductsByRevenue = async (limit = 5) => {
  try {
    const response = await apiRequest(`/api/admin/analytics/top-products?limit=${limit}`);
    return response;
  } catch (error) {
    console.error('❌ Erro em getTopProductsByRevenue:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar top produtos'
    };
  }
};

/**
 * Deletar produto (admin)
 */
export const deleteProductAdmin = async (productId) => {
  try {
    const response = await apiRequest(`/api/admin/products/${productId}`, { method: 'DELETE' });
    return response;
  } catch (error) {
    console.error('❌ Erro em deleteProductAdmin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao deletar produto'
    };
  }
};

/**
 * Deletar usuário (admin)
 */
export const deleteUserAdmin = async (userId) => {
  try {
    const response = await apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' });
    return response;
  } catch (error) {
    console.error('❌ Erro em deleteUserAdmin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao deletar usuário'
    };
  }
};

/**
 * Deletar pedido (admin)
 */
export const deleteOrderAdmin = async (orderId) => {
  try {
    const response = await apiRequest(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
    return response;
  } catch (error) {
    console.error('❌ Erro em deleteOrderAdmin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao deletar pedido'
    };
  }
};

/**
 * Alternar status do produto (admin)
 */
export const toggleProductStatusAdmin = async (productId, isActive) => {
  try {
    const response = await apiRequest(`/api/admin/products/${productId}/toggle-status`, {
      method: 'PUT',
      body: { is_active: isActive }
    });
    return response;
  } catch (error) {
    console.error('❌ Erro em toggleProductStatusAdmin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao alterar status do produto'
    };
  }
};

/**
 * Alternar status do usuário (admin)
 */
export const toggleUserStatusAdmin = async (userId, isActive) => {
  try {
    const response = await apiRequest(`/api/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
      body: { is_active: isActive }
    });
    return response;
  } catch (error) {
    console.error('❌ Erro em toggleUserStatusAdmin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao alterar status do usuário'
    };
  }
};

/**
 * Atualizar status do pedido (admin)
 */
export const updateOrderStatusAdmin = async (orderId, status) => {
  try {
    const response = await apiRequest(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status }
    });
    return response;
  } catch (error) {
    console.error('❌ Erro em updateOrderStatusAdmin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao atualizar status do pedido'
    };
  }
};
