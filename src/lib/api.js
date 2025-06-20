// API Configuration - Auto detect environment
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : `${window.location.protocol}//${window.location.host}`;

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

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      } catch {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error.message);
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
  },

  // Demo login para testes
  async demoLogin(email = 'cliente@teste.com', password = '123456') {
    try {
      const response = await apiRequest('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
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

// Admin API (geral)
export const adminAPI = {
  async getStats() {
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
  },

  async getProducts() {
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

  async createProduct(productData) {
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

  async updateProduct(id, productData) {
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

  async deleteProduct(id) {
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
  },

  // Blog management
  async getBlogs() {
    try {
      const response = await apiRequest('/api/admin/blogs');
      return {
        success: true,
        blogs: response.blogs || [],
        total: response.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        blogs: [],
        total: 0
      };
    }
  },

  async createBlog(blogData) {
    try {
      const response = await apiRequest('/api/admin/blogs', {
        method: 'POST',
        body: JSON.stringify(blogData),
      });
      return {
        success: true,
        blog: response.blog,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async updateBlog(id, blogData) {
    try {
      const response = await apiRequest(`/api/admin/blogs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(blogData),
      });
      return {
        success: true,
        blog: response.blog,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async deleteBlog(id) {
    try {
      const response = await apiRequest(`/api/admin/blogs/${id}`, {
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
  },

  // Orders management
  async getOrders() {
    try {
      const response = await apiRequest('/api/admin/orders');
      return {
        success: true,
        orders: response.orders || [],
        total: response.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        orders: [],
        total: 0
      };
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const response = await apiRequest(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return {
        success: true,
        order: response.order,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Users management
  async getUsers() {
    try {
      const response = await apiRequest('/api/admin/users');
      return {
        success: true,
        users: response.users || [],
        total: response.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        users: [],
        total: 0
      };
    }
  },

  async updateUser(id, userData) {
    try {
      const response = await apiRequest(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return {
        success: true,
        user: response.user,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async deleteUser(id) {
    try {
      const response = await apiRequest(`/api/admin/users/${id}`, {
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

// Blog API
export const blogAPI = {
  async getAll(page = 1, limit = 10, category = null) {
    try {
      let url = `/api/blog?page=${page}&limit=${limit}`;
      if (category) url += `&category=${category}`;
      
      const response = await apiRequest(url);
      return {
        success: true,
        blogs: response.blogs || [],
        total: response.total || 0,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        blogs: [],
        total: 0
      };
    }
  },

  async getById(id) {
    try {
      const response = await apiRequest(`/api/blog/${id}`);
      return {
        success: true,
        blog: response.blog
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        blog: null
      };
    }
  },

  async getFeatured() {
    try {
      const response = await apiRequest('/api/blog/featured');
      return {
        success: true,
        blogs: response.blogs || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        blogs: []
      };
    }
  },

  async getByCategory(category, page = 1, limit = 10) {
    try {
      const response = await apiRequest(`/api/blog/category/${category}?page=${page}&limit=${limit}`);
      return {
        success: true,
        blogs: response.blogs || [],
        total: response.total || 0,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        blogs: [],
        total: 0
      };
    }
  },

  async search(query, page = 1, limit = 10) {
    try {
      const response = await apiRequest(`/api/blog/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return {
        success: true,
        blogs: response.blogs || [],
        total: response.total || 0,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        blogs: [],
        total: 0
      };
    }
  },

  async create(blogData) {
    try {
      const response = await apiRequest('/api/blog', {
        method: 'POST',
        body: JSON.stringify(blogData),
      });
      return {
        success: true,
        blog: response.blog,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async update(id, blogData) {
    try {
      const response = await apiRequest(`/api/blog/${id}`, {
        method: 'PUT',
        body: JSON.stringify(blogData),
      });
      return {
        success: true,
        blog: response.blog,
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
      const response = await apiRequest(`/api/blog/${id}`, {
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
  },

  async like(id) {
    try {
      const response = await apiRequest(`/api/blog/${id}/like`, {
        method: 'POST',
      });
      return {
        success: true,
        likes: response.likes,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async addComment(id, commentData) {
    try {
      const response = await apiRequest(`/api/blog/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData),
      });
      return {
        success: true,
        comment: response.comment,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async getComments(id, page = 1, limit = 20) {
    try {
      const response = await apiRequest(`/api/blog/${id}/comments?page=${page}&limit=${limit}`);
      return {
        success: true,
        comments: response.comments || [],
        total: response.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        comments: [],
        total: 0
      };
    }
  }
};

// Orders API
export const ordersAPI = {
  async getAll() {
    try {
      const response = await apiRequest('/api/admin/orders');
      return {
        success: true,
        orders: response.orders || [],
        total: response.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        orders: [],
        total: 0
      };
    }
  },

  async getById(id) {
    try {
      const response = await apiRequest(`/api/admin/orders/${id}`);
      return {
        success: true,
        order: response.order
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        order: null
      };
    }
  },

  async create(orderData) {
    try {
      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      return {
        success: true,
        order: response.order,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async updateStatus(id, status) {
    try {
      const response = await apiRequest(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return {
        success: true,
        order: response.order,
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
      const response = await apiRequest(`/api/admin/orders/${id}`, {
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
  },

  async getUserOrders() {
    try {
      const response = await apiRequest('/api/orders/my-orders');
      return {
        success: true,
        orders: response.orders || [],
        total: response.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        orders: [],
        total: 0
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

// WhatsApp API
export const whatsappAPI = {
  async getStatus() {
    try {
      const response = await apiRequest('/api/whatsapp/status');
      return {
        success: true,
        status: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async sendMessage(phone, message) {
    try {
      const response = await apiRequest('/api/whatsapp/send-message', {
        method: 'POST',
        body: JSON.stringify({ phone, message }),
      });
      return {
        success: true,
        result: response.result,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async sendBroadcast(phones, message) {
    try {
      const response = await apiRequest('/api/whatsapp/broadcast', {
        method: 'POST',
        body: JSON.stringify({ phones, message }),
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
  },

  async getQRCode() {
    try {
      const response = await apiRequest('/api/whatsapp/qr-code');
      return {
        success: true,
        qrCode: response.qrCode,
        connected: response.connected,
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

// Maps API
export const mapsAPI = {
  async getAllLocations() {
    try {
      const response = await apiRequest('/api/locations');
      return {
        success: true,
        locations: response.locations || [],
        total: response.total || 0,
        center: response.center,
        deliveryInfo: response.deliveryInfo
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        locations: [],
        total: 0
      };
    }
  },

  async getLocationById(id) {
    try {
      const response = await apiRequest(`/api/locations/${id}`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async getLocationsByType(type) {
    try {
      const response = await apiRequest(`/api/locations/type/${type}`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async findNearestLocation(latitude, longitude, type = 'loja') {
    try {
      const response = await apiRequest('/api/locations/nearest', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude, type }),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async checkDeliveryArea(address) {
    try {
      const response = await apiRequest('/api/delivery/check-area', {
        method: 'POST',
        body: JSON.stringify({ address }),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async geocodeAddress(address) {
    try {
      const response = await apiRequest('/api/maps/geocode', {
        method: 'POST',
        body: JSON.stringify({ address }),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async reverseGeocode(latitude, longitude) {
    try {
      const response = await apiRequest('/api/maps/reverse-geocode', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude }),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async getRoute(fromLat, fromLng, toLat, toLng) {
    try {
      const response = await apiRequest('/api/maps/route', {
        method: 'POST',
        body: JSON.stringify({ fromLat, fromLng, toLat, toLng }),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async findNearbyCafes(latitude, longitude, radius = 5000) {
    try {
      const response = await apiRequest('/api/maps/nearby-cafes', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude, radius }),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async getDeliveryStats() {
    try {
      const response = await apiRequest('/api/delivery/stats');
      return response;
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

// Cart utilities
export const cartUtils = {
  updateCartCount() {
    const cartCount = this.getCartItemsCount();
    const cartBadges = document.querySelectorAll('.cart-count-badge');
    cartBadges.forEach(badge => {
      badge.textContent = cartCount;
      badge.style.display = cartCount > 0 ? 'inline-block' : 'none';
    });
  },

  getCartItemsCount() {
    const cart = localStorage.getItem('cart');
    if (!cart) return 0;
    
    try {
      const cartData = JSON.parse(cart);
      return cartData.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    } catch {
      return 0;
    }
  },

  saveCart(cartData) {
    localStorage.setItem('cart', JSON.stringify(cartData));
    this.updateCartCount();
  },

  getCart() {
    const cart = localStorage.getItem('cart');
    if (!cart) return { items: [], total: 0 };
    
    try {
      return JSON.parse(cart);
    } catch {
      return { items: [], total: 0 };
    }
  },

  clearCart() {
    localStorage.removeItem('cart');
    this.updateCartCount();
  }
};

// Export default object with all APIs
const api = {
  auth: authAPI,
  products: productsAPI,
  admin: adminAPI,
  orders: ordersAPI,
  blog: blogAPI,
  gamification: gamificationAPI,
  cart: cartAPI,
  coupons: couponsAPI,
  notifications: notificationsAPI,
  whatsapp: whatsappAPI,
  maps: mapsAPI,
  health: healthAPI,
  cartUtils: cartUtils
};

export default api;

