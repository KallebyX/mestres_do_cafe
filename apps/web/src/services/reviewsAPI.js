// Reviews API Service
// Comunicação com o backend Flask para operações de avaliações

const API_BASE_URL = 'http://localhost:5001';

class ReviewsAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Métodos auxiliares
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      // Retornar resposta padronizada com success
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('API Request Error:', error);
      // Retornar erro padronizado
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== AVALIAÇÕES BÁSICAS =====

  // Buscar todas as avaliações de um produto
  async getReviews(productId, options = {}) {
    // Se options for um número, é a forma antiga (page)
    if (typeof options === 'number') {
      options = { page: options, limit: arguments[2] || 10 };
    }
    
    const {
      page = 1,
      limit = 10,
      rating = '',
      sort_by = '',
      search = ''
    } = options;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (rating) params.append('rating', rating);
    if (sort_by) params.append('sort_by', sort_by);
    if (search) params.append('search', search);
    
    console.log('🔍 ReviewsAPI.getReviews - params:', params.toString());
    
    const response = await this.makeRequest(`/api/reviews/product/${productId}?${params}`);
    
    // Garantir que a resposta tenha a estrutura esperada
    if (response.success && response.data) {
      return {
        success: true,
        reviews: response.data.reviews || [],
        pagination: response.data.pagination || {}
      };
    }
    
    return response;
  }

  // Buscar avaliação específica por ID
  async getReviewById(reviewId) {
    return this.makeRequest(`/api/reviews/${reviewId}`);
  }

  // Criar nova avaliação
  async createReview(productId, reviewData) {
    return this.makeRequest(`/api/reviews/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  // Atualizar avaliação existente
  async updateReview(reviewId, reviewData) {
    return this.makeRequest(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData)
    });
  }

  // Deletar avaliação
  async deleteReview(reviewId) {
    return this.makeRequest(`/api/reviews/${reviewId}`, {
      method: 'DELETE'
    });
  }

  // ===== ESTATÍSTICAS E MÉTRICAS =====

  // Obter estatísticas detalhadas do produto
  async getProductStats(productId) {
    return this.makeRequest(`/api/reviews/product/${productId}/stats`);
  }

  // Obter distribuição de ratings
  async getRatingDistribution(productId) {
    return this.makeRequest(`/api/reviews/product/${productId}/rating-distribution`);
  }

  // Obter métricas de engajamento
  async getEngagementMetrics(productId) {
    return this.makeRequest(`/api/reviews/product/${productId}/engagement`);
  }

  // ===== MODERAÇÃO E ADMINISTRAÇÃO =====

  // Listar avaliações pendentes de moderação
  async getPendingReviews(page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return this.makeRequest(`/api/reviews/pending?${params}`);
  }

  // Aprovar avaliação
  async approveReview(reviewId, adminUserId) {
    return this.makeRequest(`/api/reviews/${reviewId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ admin_user_id: adminUserId })
    });
  }

  // Rejeitar avaliação
  async rejectReview(reviewId, adminUserId, reason = '') {
    return this.makeRequest(`/api/reviews/${reviewId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ 
        admin_user_id: adminUserId,
        reason: reason
      })
    });
  }

  // Destacar avaliação
  async highlightReview(reviewId, adminUserId) {
    return this.makeRequest(`/api/reviews/${reviewId}/highlight`, {
      method: 'POST',
      body: JSON.stringify({ admin_user_id: adminUserId })
    });
  }

  // ===== AVALIAÇÕES EM DESTAQUE =====

  // Obter avaliações em destaque
  async getFeaturedReviews(productId, limit = 3) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    return this.makeRequest(`/api/reviews/product/${productId}/featured?${params}`);
  }

  // Obter avaliações recentes
  async getRecentReviews(productId, limit = 5) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    return this.makeRequest(`/api/reviews/product/${productId}/recent?${params}`);
  }

  // ===== SISTEMA DE VOTOS =====

  // Marcar avaliação como útil
  async markReviewHelpful(reviewId, userId) {
    return this.makeRequest(`/api/reviews/${reviewId}/helpful`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    });
  }

  // Remover voto de útil
  async removeHelpfulVote(reviewId, userId) {
    return this.makeRequest(`/api/reviews/${reviewId}/helpful`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId })
    });
  }

  // Obter contagem de votos úteis
  async getHelpfulVotes(reviewId) {
    return this.makeRequest(`/api/reviews/${reviewId}/helpful-count`);
  }

  // ===== RESPOSTAS DA EMPRESA =====

  // Responder a uma avaliação
  async respondToReview(reviewId, responseData) {
    return this.makeRequest(`/api/reviews/${reviewId}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
  }

  // Obter respostas de uma avaliação
  async getReviewResponses(reviewId) {
    return this.makeRequest(`/api/reviews/${reviewId}/responses`);
  }

  // Atualizar resposta
  async updateResponse(responseId, responseData) {
    return this.makeRequest(`/api/reviews/responses/${responseId}`, {
      method: 'PUT',
      body: JSON.stringify(responseData)
    });
  }

  // Deletar resposta
  async deleteResponse(responseId) {
    return this.makeRequest(`/api/reviews/responses/${responseId}`, {
      method: 'DELETE'
    });
  }

  // ===== FILTROS E BUSCA =====

  // Filtrar avaliações
  async getFilteredReviews(productId, filters = {}) {
    const params = new URLSearchParams();
    
    // Adicionar filtros aos parâmetros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return this.makeRequest(`/api/reviews/product/${productId}?${params}`);
  }

  // Buscar avaliações por texto
  async searchReviews(productId, searchTerm, page = 1, limit = 10) {
    const params = new URLSearchParams({
      q: searchTerm,
      page: page.toString(),
      limit: limit.toString()
    });
    
    return this.makeRequest(`/api/reviews/product/${productId}/search?${params}`);
  }

  // ===== RELATÓRIOS E ANALYTICS =====

  // Obter relatório de avaliações
  async getReviewsReport(productId, dateRange = null) {
    const params = new URLSearchParams();
    
    if (dateRange) {
      params.append('start_date', dateRange.startDate);
      params.append('end_date', dateRange.endDate);
    }
    
    return this.makeRequest(`/api/reviews/product/${productId}/report?${params}`);
  }

  // Obter tendências de avaliações
  async getReviewTrends(productId, period = '30d') {
    const params = new URLSearchParams({
      period: period
    });
    
    return this.makeRequest(`/api/reviews/product/${productId}/trends?${params}`);
  }

  // ===== UPLOAD DE IMAGENS =====

  // Upload de imagem para avaliação
  async uploadReviewImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return this.makeRequest('/api/reviews/upload-image', {
      method: 'POST',
      body: formData,
      headers: {
        // Não definir Content-Type para FormData
      }
    });
  }

  // ===== VALIDAÇÃO E UTILIDADES =====

  // Validar se usuário pode avaliar produto
  async canUserReview(productId, userId) {
    return this.makeRequest(`/api/reviews/product/${productId}/can-review/${userId}`);
  }

  // Obter avaliação existente do usuário
  async getUserReview(productId, userId) {
    return this.makeRequest(`/api/reviews/product/${productId}/user/${userId}`);
  }
}

// Singleton instance
const reviewsAPI = new ReviewsAPI();

export default reviewsAPI;