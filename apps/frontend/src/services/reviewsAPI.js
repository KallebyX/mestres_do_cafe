import api from './api';

export const reviewsAPI = {
  // Obter avaliações de um produto
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response;
  },

  // Obter estatísticas básicas de um produto
  getProductStats: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}/stats`);
    return response;
  },

  // Obter estatísticas avançadas de um produto (premium)
  getEnhancedProductStats: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}/enhanced-stats`);
    return response;
  },

  // Criar nova avaliação
  createReview: async (productId, reviewData) => {
    const response = await api.post(`/reviews/product/${productId}`, reviewData);
    return response;
  },

  // Atualizar avaliação existente
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response;
  },

  // Deletar avaliação
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response;
  },

  // ===== FUNCIONALIDADES PREMIUM =====

  // Votar se uma avaliação é útil ou não
  voteReviewHelpful: async (reviewId, voteData) => {
    const response = await api.post(`/reviews/${reviewId}/helpful`, voteData);
    return response;
  },

  // Adicionar resposta da empresa
  addCompanyResponse: async (reviewId, responseData) => {
    const response = await api.post(`/reviews/${reviewId}/response`, responseData);
    return response;
  },

  // Obter avaliações em destaque
  getFeaturedReviews: async (params = {}) => {
    const response = await api.get('/reviews/featured', { params });
    return response;
  },

  // Moderar avaliação (aprovar/reprovar/destacar)
  moderateReview: async (reviewId, moderationData) => {
    const response = await api.put(`/reviews/${reviewId}/moderate`, moderationData);
    return response;
  },

  // ===== MÉTODOS UTILITÁRIOS =====

  // Obter avaliações por filtros específicos
  getReviewsByFilters: async (filters = {}) => {
    const response = await api.get('/reviews', { params: filters });
    return response;
  },

  // Obter avaliações de um usuário
  getUserReviews: async (userId, params = {}) => {
    const response = await api.get(`/users/${userId}/reviews`, { params });
    return response;
  },

  // Reportar avaliação (se implementado no futuro)
  reportReview: async (reviewId, reportData) => {
    const response = await api.post(`/reviews/${reviewId}/report`, reportData);
    return response;
  },

  // Marcar avaliação como verificada (para admins)
  verifyReview: async (reviewId) => {
    const response = await api.put(`/reviews/${reviewId}/verify`);
    return response;
  },

  // ===== ANÁLISES E RELATÓRIOS =====

  // Obter relatório de avaliações por período
  getReviewsReport: async (params = {}) => {
    const response = await api.get('/reviews/reports', { params });
    return response;
  },

  // Obter tendências de avaliações
  getReviewsTrends: async (params = {}) => {
    const response = await api.get('/reviews/trends', { params });
    return response;
  },

  // Obter comparação de produtos por avaliações
  compareProductReviews: async (productIds = []) => {
    const response = await api.get('/reviews/compare', { 
      params: { product_ids: productIds.join(',') }
    });
    return response;
  },

  // ===== EXPORT/IMPORT =====

  // Exportar avaliações em formato CSV/Excel
  exportReviews: async (format = 'csv', filters = {}) => {
    const response = await api.get('/reviews/export', { 
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response;
  },

  // Importar avaliações em lote
  importReviews: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    const response = await api.post('/reviews/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // ===== CONFIGURAÇÕES E PREFERENCES =====

  // Obter configurações de moderação
  getModerationSettings: async () => {
    const response = await api.get('/reviews/moderation/settings');
    return response;
  },

  // Atualizar configurações de moderação
  updateModerationSettings: async (settings) => {
    const response = await api.put('/reviews/moderation/settings', settings);
    return response;
  },

  // Obter palavras-chave bloqueadas
  getBlockedKeywords: async () => {
    const response = await api.get('/reviews/moderation/blocked-keywords');
    return response;
  },

  // Adicionar palavra-chave bloqueada
  addBlockedKeyword: async (keyword) => {
    const response = await api.post('/reviews/moderation/blocked-keywords', { keyword });
    return response;
  },

  // Remover palavra-chave bloqueada
  removeBlockedKeyword: async (keywordId) => {
    const response = await api.delete(`/reviews/moderation/blocked-keywords/${keywordId}`);
    return response;
  },

  // ===== NOTIFICAÇÕES =====

  // Obter notificações de novas avaliações
  getReviewNotifications: async (params = {}) => {
    const response = await api.get('/reviews/notifications', { params });
    return response;
  },

  // Marcar notificação como lida
  markNotificationAsRead: async (notificationId) => {
    const response = await api.put(`/reviews/notifications/${notificationId}/read`);
    return response;
  },

  // Configurar alertas de avaliação
  configureReviewAlerts: async (settings) => {
    const response = await api.put('/reviews/notifications/settings', settings);
    return response;
  }
};

// Exportar como padrão e nomeado para flexibilidade
export default reviewsAPI;