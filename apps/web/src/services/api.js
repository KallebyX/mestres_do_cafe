// Cliente API Local - Mestres do Café
const API_BASE_URL = window.location.origin + '/api';

// Função para fazer requisições HTTP
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

// Funções de autenticação
export const auth = {
  async signUp(email, password, userData = {}) {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...userData }),
    });
  },

  async signIn(email, password) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result.data?.token) {
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    
    return result;
  },

  async signOut() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    return { error: null };
  },

  async getUser() {
    const user = localStorage.getItem('user');
    return user ? { data: { user: JSON.parse(user) }, error: null } : { data: { user: null }, error: null };
  },

  async resetPassword(email) {
    return await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
};

// Funções para produtos
export const products = {
  async getAll() {
    return await apiRequest('/products');
  },

  async getById(id) {
    return await apiRequest(`/products/${id}`);
  },

  async create(product) {
    return await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async update(id, product) {
    return await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  async delete(id) {
    return await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  }
};

// Funções para carrinho
export const cart = {
  async get() {
    return await apiRequest('/cart');
  },

  async add(productId, quantity = 1) {
    return await apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  async update(itemId, quantity) {
    return await apiRequest(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  async remove(itemId) {
    return await apiRequest(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  },

  async clear() {
    return await apiRequest('/cart/clear', {
      method: 'DELETE',
    });
  }
};

// Funções para pedidos
export const orders = {
  async getAll() {
    return await apiRequest('/orders');
  },

  async getById(id) {
    return await apiRequest(`/orders/${id}`);
  },

  async create(orderData) {
    return await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
};

// Funções para blog
export const blog = {
  async getPosts() {
    return await apiRequest('/blog/posts');
  },

  async getPost(id) {
    return await apiRequest(`/blog/posts/${id}`);
  },

  async createPost(post) {
    return await apiRequest('/blog/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }
};

// Funções para cursos
export const courses = {
  async getAll() {
    return await apiRequest('/courses');
  },

  async getById(id) {
    return await apiRequest(`/courses/${id}`);
  },

  async enroll(courseId) {
    return await apiRequest(`/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }
};

// Funções para fórum
export const forum = {
  async getTopics() {
    return await apiRequest('/forum/topics');
  },

  async getTopic(id) {
    return await apiRequest(`/forum/topics/${id}`);
  },

  async createTopic(topic) {
    return await apiRequest('/forum/topics', {
      method: 'POST',
      body: JSON.stringify(topic),
    });
  }
};

// Funções para gamificação
export const gamification = {
  async getUserStats() {
    return await apiRequest('/gamification/stats');
  },

  async getBadges() {
    return await apiRequest('/gamification/badges');
  },

  async getLeaderboard() {
    return await apiRequest('/gamification/leaderboard');
  }
};

// Exportar cliente principal para compatibilidade
export const supabase = {
  auth,
  from: (table) => ({
    select: (columns = '*') => ({
      async execute() {
        return await apiRequest(`/${table}`);
      }
    }),
    insert: (data) => ({
      async execute() {
        return await apiRequest(`/${table}`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    }),
    update: (data) => ({
      eq: (column, value) => ({
        async execute() {
          return await apiRequest(`/${table}/${value}`, {
            method: 'PUT',
            body: JSON.stringify(data),
          });
        }
      })
    }),
    delete: () => ({
      eq: (column, value) => ({
        async execute() {
          return await apiRequest(`/${table}/${value}`, {
            method: 'DELETE',
          });
        }
      })
    })
  })
};

export default { auth, products, cart, orders, blog, courses, forum, gamification, supabase };

