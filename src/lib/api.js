// API Configuration
const API_BASE_URL = 'http://localhost:5000';



// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// Authentication API
export const authAPI = {
  async register(userData) {
    try {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return {
        success: true,
        data: response,
        user: response.user,
        token: response.access_token
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async login(credentials) {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return {
        success: true,
        data: response,
        user: response.user,
        token: response.access_token
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async verifyToken() {
    try {
      const response = await apiRequest('/api/auth/verify-token');
      
      if (response.valid && response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        return {
          success: true,
          user: response.user
        };
      }
      
      return { success: false };
    } catch (error) {
      this.logout();
      return { success: false, error: error.message };
    }
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return localStorage.getItem('access_token');
  }
};

// Products API
export const productsAPI = {
  async getAll() {
    try {
      const response = await apiRequest('/api/products');
      return {
        success: true,
        products: response.products || [],
        total: response.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        products: [],
        total: 0
      };
    }
  },

  async getById(id) {
    try {
      const response = await apiRequest(`/api/products/${id}`);
      return {
        success: true,
        product: response.product
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        product: null
      };
    }
  },

  async getFeatured() {
    try {
      const response = await apiRequest('/api/products/featured');
      return {
        success: true,
        products: response.products || [],
        total: response.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        products: [],
        total: 0
      };
    }
  }
};

// Admin Products API
export const adminProductsAPI = {
  async getAll() {
    try {
      const response = await apiRequest('/api/admin/products');
      return {
        success: true,
        products: response.products || [],
        total: response.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        products: [],
        total: 0
      };
    }
  },

  async create(productData) {
    try {
      const response = await apiRequest('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
      return {
        success: true,
        product: response.product,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async update(id, productData) {
    try {
      const response = await apiRequest(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
      return {
        success: true,
        product: response.product,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async delete(id) {
    try {
      const response = await apiRequest(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Gamification API
export const gamificationAPI = {
  async getProfile() {
    try {
      const response = await apiRequest('/api/gamification/profile');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async getPointsHistory() {
    try {
      const response = await apiRequest('/api/gamification/points-history');
      return {
        success: true,
        history: response.history || [],
        total: response.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        history: [],
        total: 0
      };
    }
  },

  async addPoints(points, reason) {
    try {
      const response = await apiRequest('/api/gamification/add-points', {
        method: 'POST',
        body: JSON.stringify({ points, reason }),
      });
      return {
        success: true,
        message: response.message,
        user: response.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async getLeaderboard() {
    try {
      const response = await apiRequest('/api/gamification/leaderboard');
      return {
        success: true,
        leaderboard: response.leaderboard || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        leaderboard: []
      };
    }
  }
};

// Cart API
export const cartAPI = {
  async get() {
    try {
      const response = await apiRequest('/api/cart');
      return {
        success: true,
        cart: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async addItem(productId, quantity = 1) {
    try {
      const response = await apiRequest('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      return {
        success: true,
        cart: response.cart,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Coupons API
export const couponsAPI = {
  async validate(code) {
    try {
      const response = await apiRequest('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      return {
        success: true,
        valid: response.valid,
        coupon: response.coupon
      };
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: error.message
      };
    }
  }
};

// Notifications API
export const notificationsAPI = {
  async getAll() {
    try {
      const response = await apiRequest('/api/notifications');
      return {
        success: true,
        notifications: response.notifications || [],
        total: response.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        notifications: [],
        total: 0
      };
    }
  }
};

// Admin Stats API
export const adminStatsAPI = {
  async get() {
    try {
      const response = await apiRequest('/api/admin/stats');
      return {
        success: true,
        stats: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Health Check API
export const healthAPI = {
  async check() {
    try {
      const response = await apiRequest('/api/health');
      return {
        success: true,
        status: response.status,
        timestamp: response.timestamp
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Export default object with all APIs
const api = {
  auth: authAPI,
  products: productsAPI,
  adminProducts: adminProductsAPI,
  gamification: gamificationAPI,
  cart: cartAPI,
  coupons: couponsAPI,
  notifications: notificationsAPI,
  adminStats: adminStatsAPI,
  health: healthAPI
};

export default api;

