// API configuration and utilities - SIMULANDO BACKEND COM LOCALSTORAGE
const API_BASE_URL = 'http://localhost:5000/api';

// Mock Data Storage
const MOCK_USERS_KEY = 'mestres_cafe_users';
const MOCK_PRODUCTS_KEY = 'mestres_cafe_products';

// Initialize mock data
function initMockData() {
  if (!localStorage.getItem(MOCK_USERS_KEY)) {
    const defaultUsers = [
      {
        id: 1,
        name: 'Administrador',
        email: 'admin@mestrescafe.com.br',
        password: 'admin123', // Em produção seria hasheado
        user_type: 'admin',
        phone: '(11) 99999-9999',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(MOCK_PRODUCTS_KEY)) {
    const defaultProducts = [
      {
        id: 1,
        name: 'Café Bourbon Amarelo Premium',
        description: 'Café especial da região do Cerrado Mineiro',
        price: 45.90,
        original_price: 52.90,
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
        origin: 'Cerrado Mineiro, MG',
        roast_level: 'Médio',
        flavor_notes: 'Chocolate, Caramelo, Nozes',
        stock_quantity: 50,
        is_featured: true
      },
      {
        id: 2,
        name: 'Café Geisha Especial',
        description: 'Variedade Geisha cultivada nas montanhas do Sul de Minas',
        price: 89.90,
        original_price: 105.90,
        image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
        origin: 'Sul de Minas, MG',
        roast_level: 'Claro',
        flavor_notes: 'Floral, Cítrico, Bergamota',
        stock_quantity: 25,
        is_featured: true
      }
    ];
    localStorage.setItem(MOCK_PRODUCTS_KEY, JSON.stringify(defaultProducts));
  }
}

// Initialize on load
initMockData();

// Helper functions for mock data
function getMockUsers() {
  return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function generateToken(user) {
  // Simple mock token - em produção seria JWT real
  return btoa(JSON.stringify({ id: user.id, email: user.email, user_type: user.user_type, name: user.name }));
}

function validateToken(token) {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

// Mock API delay
function mockDelay(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Auth utilities
export const authUtils = {
  getToken: () => localStorage.getItem('auth_token'),
  setToken: (token) => localStorage.setItem('auth_token', token),
  removeToken: () => localStorage.removeItem('auth_token'),
  getUser: () => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem('auth_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('auth_user'),
  isAuthenticated: () => !!localStorage.getItem('auth_token'),
  isAdmin: () => {
    const user = authUtils.getUser();
    return user && user.user_type === 'admin';
  }
};

// Mock API request helper
const mockApiRequest = async (endpoint, options = {}) => {
  await mockDelay(); // Simular delay de rede
  
  try {
    // Login endpoint
    if (endpoint === '/auth/login' && options.method === 'POST') {
      const { email, password } = JSON.parse(options.body);
      const users = getMockUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Email ou senha incorretos');
      }
      
      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        message: 'Login realizado com sucesso',
        access_token: token,
        user: userWithoutPassword
      };
    }
    
    // Register endpoint
    if (endpoint === '/auth/register' && options.method === 'POST') {
      const userData = JSON.parse(options.body);
      const users = getMockUsers();
      
      // Check if email exists
      if (users.find(u => u.email === userData.email)) {
        throw new Error('Email já está em uso');
      }
      
      const newUser = {
        id: users.length + 1,
        ...userData,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      users.push(newUser);
      saveMockUsers(users);
      
      const token = generateToken(newUser);
      const { password: _, ...userWithoutPassword } = newUser;
      
      return {
        message: 'Usuário criado com sucesso',
        access_token: token,
        user: userWithoutPassword
      };
    }
    
    // Verify token endpoint
    if (endpoint === '/auth/verify-token') {
      const token = authUtils.getToken();
      if (!token) {
        throw new Error('Token não encontrado');
      }
      
      const decoded = validateToken(token);
      if (!decoded) {
        throw new Error('Token inválido');
      }
      
      const users = getMockUsers();
      const user = users.find(u => u.id === decoded.id);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        valid: true,
        user: userWithoutPassword
      };
    }
    
    // Products endpoint
    if (endpoint.startsWith('/products')) {
      const products = JSON.parse(localStorage.getItem(MOCK_PRODUCTS_KEY) || '[]');
      return { products, total: products.length };
    }
    
    throw new Error('Endpoint não implementado no mock');
    
  } catch (error) {
    console.error('Mock API Error:', error);
    throw error;
  }
};

// API request helper - usando mock por enquanto
const apiRequest = async (endpoint, options = {}) => {
  // Comentando a requisição real e usando mock
  // const token = authUtils.getToken();
  // const config = {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     ...(token && { Authorization: `Bearer ${token}` }),
  //     ...options.headers,
  //   },
  //   ...options,
  // };

  // try {
  //   const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  //   const data = await response.json();
    
  //   if (!response.ok) {
  //     throw new Error(data.error || 'Erro na requisição');
  //   }
    
  //   return data;
  // } catch (error) {
  //   console.error('API Error:', error);
  //   throw error;
  // }

  // Usando mock API por enquanto
  return await mockApiRequest(endpoint, options);
};

// Auth API
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  getProfile: () => apiRequest('/auth/profile'),
  
  updateProfile: (userData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  verifyToken: () => apiRequest('/auth/verify-token'),
};

// Products API
export const productsAPI = {
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products/${queryString ? `?${queryString}` : ''}`);
  },
  
  getProduct: (id) => apiRequest(`/products/${id}`),
  
  getCategories: () => apiRequest('/products/categories'),
  
  getCart: () => apiRequest('/products/cart'),
  
  addToCart: (item) => apiRequest('/products/cart', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  
  updateCartItem: (itemId, data) => apiRequest(`/products/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  removeFromCart: (itemId) => apiRequest(`/products/cart/${itemId}`, {
    method: 'DELETE',
  }),
  
  clearCart: () => apiRequest('/products/cart/clear', {
    method: 'DELETE',
  }),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders/${queryString ? `?${queryString}` : ''}`);
  },
  
  getOrder: (id) => apiRequest(`/orders/${id}`),
  
  cancelOrder: (id) => apiRequest(`/orders/${id}/cancel`, {
    method: 'PUT',
  }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => apiRequest('/admin/dashboard'),
  
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  
  toggleUserStatus: (userId) => apiRequest(`/admin/users/${userId}/toggle-status`, {
    method: 'PUT',
  }),
  
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/products${queryString ? `?${queryString}` : ''}`);
  },
  
  createProduct: (productData) => apiRequest('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  
  updateProduct: (productId, productData) => apiRequest(`/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  updateOrderStatus: (orderId, statusData) => apiRequest(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  }),
  
  createCategory: (categoryData) => apiRequest('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  }),
};

// Cart utilities
export const cartUtils = {
  getCartCount: () => {
    const cart = localStorage.getItem('cart_items');
    if (!cart) return 0;
    const items = JSON.parse(cart);
    return items.reduce((total, item) => total + item.quantity, 0);
  },
  
  updateCartCount: () => {
    const event = new CustomEvent('cartUpdated');
    window.dispatchEvent(event);
  }
};

export default {
  authAPI,
  productsAPI,
  ordersAPI,
  adminAPI,
  authUtils,
  cartUtils,
};

