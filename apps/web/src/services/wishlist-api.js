import { apiRequest } from './api';

// Serviços de Wishlist/Favoritos
export const wishlistAPI = {
  // Obter lista de favoritos do usuário
  async getWishlist() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Login necessário' };
      }

      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar favoritos');
      }

      return {
        success: true,
        data: data.items || []
      };
    } catch (error) {
      console.error('Erro ao carregar wishlist:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Adicionar produto aos favoritos
  async addToWishlist(productId) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Login necessário' };
      }

      const response = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao adicionar aos favoritos');
      }

      return {
        success: true,
        message: 'Produto adicionado aos favoritos!'
      };
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Remover produto dos favoritos
  async removeFromWishlist(productId) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Login necessário' };
      }

      const response = await fetch(`/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover dos favoritos');
      }

      return {
        success: true,
        message: 'Produto removido dos favoritos!'
      };
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Verificar se produto está nos favoritos
  async isInWishlist(productId) {
    try {
      const result = await this.getWishlist();
      if (!result.success) return false;
      
      return result.data.some(item => item.product_id === productId);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  },

  // Toggle - adicionar ou remover dos favoritos
  async toggleWishlist(productId) {
    try {
      const isInList = await this.isInWishlist(productId);
      
      if (isInList) {
        return await this.removeFromWishlist(productId);
      } else {
        return await this.addToWishlist(productId);
      }
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default wishlistAPI;