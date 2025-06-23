// Importar APIs do Supabase em vez do backend Node.js
import { supabase } from './supabase.js';
import { 
  getAdminStats, 
  getAdminUsers, 
  getAdminOrders, 
  getMyOrders,
  updateUser,
  deleteUser,
  updateOrderStatus,
  getAnalyticsData,
  getFinancialData
} from './supabase-admin-full.js';

import {
  getAllCustomers,
  getAdminCustomers,
  createManualCustomer,
  toggleAnyCustomerStatus
} from './supabase-admin-api.js';

import {
  getAllProducts,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  updateProductStock,
  getFeaturedProducts,
  getProductById,
  getProductByIdAdmin,
  getProductsByCategory,
  getProductsWithFilters
} from './supabase-products.js';

// =============================================
// CONFIGURAÇÃO BASE (MANTIDA PARA COMPATIBILIDADE)
// =============================================

const API_BASE_URL = 'http://localhost:5000/api';

// =============================================
// AUTH API - USANDO SUPABASE
// =============================================

export const authAPI = {
  // Login
  async login({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Buscar dados completos do usuário
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const userData = {
          id: data.user.id,
          email: data.user.email,
          ...userProfile
        };

        // Salvar no localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('access_token', data.session.access_token);

        return {
          success: true,
          user: userData,
          token: data.session.access_token
        };
      }

      throw new Error('Login falhou');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  // Registro
  async register(userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            user_type: userData.user_type || 'customer'
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        user: data.user,
        message: 'Usuário registrado com sucesso'
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  },

  // Logout
  logout() {
    try {
      supabase.auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  },

  // Verificar token
  async verifyToken() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        this.logout();
        return { success: false, error: 'Token inválido' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      this.logout();
      return { success: false, error: error.message };
    }
  },

  // Obter usuário atual
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  },

  // Obter token
  getToken() {
    try {
      return localStorage.getItem('access_token');
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  },

  // Demo login para testes
  async demoLogin() {
    try {
      return await this.login({
        email: 'daniel@mestres-do-cafe.com',
        password: 'admin123'
      });
    } catch (error) {
      console.error('Erro no demo login:', error);
      throw error;
    }
  },

  // Reset de senha
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'Email de recuperação enviado'
      };
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      throw error;
    }
  },

  // Atualizar senha
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'Senha atualizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  }
};

// =============================================
// ADMIN API - USANDO SUPABASE
// =============================================

export const adminAPI = {
  // Estatísticas do dashboard
  async getStats() {
    try {
      const response = await getAdminStats();
      if (!response.success) {
        throw new Error(response.error);
      }
      return { stats: response.stats };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },

  // Gerenciamento de usuários
  async getUsers() {
    try {
      const response = await getAdminUsers();
      if (!response.success) {
        throw new Error(response.error);
      }
      return { users: response.users };
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      const response = await updateUser(userId, userData);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      const response = await deleteUser(userId);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  },

  // Gerenciamento de pedidos
  async getOrders() {
    try {
      const response = await getAdminOrders();
      if (!response.success) {
        throw new Error(response.error);
      }
      return { orders: response.orders };
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const response = await updateOrderStatus(orderId, status);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  },

  // Analytics
  async getAnalytics(timeRange = '30d') {
    try {
      const response = await getAnalyticsData(timeRange);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados de analytics:', error);
      throw error;
    }
  },

  // Financeiro
  async getFinancialData(timeRange = '30d') {
    try {
      const response = await getFinancialData(timeRange);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      throw error;
    }
  }
};

// =============================================
// ORDERS API - USANDO SUPABASE
// =============================================

export const ordersAPI = {
  async getAll(filters = {}) {
    try {
      const response = await getAdminOrders(filters);
      if (!response.success) {
        throw new Error(response.error);
      }
      return { orders: response.orders };
    } catch (error) {
      console.error('Erro ao buscar todos os pedidos:', error);
      throw error;
    }
  },

  async getUserOrders(userId) {
    try {
      // Validar se o userId foi fornecido
      if (!userId || userId === 'undefined') {
        console.error('❌ getUserOrders: userId é obrigatório:', userId);
        throw new Error('ID do usuário é obrigatório');
      }

      console.log('📦 Buscando pedidos para usuário:', userId);
      const response = await getMyOrders(userId);
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      return response.orders;
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      throw error;
    }
  },

  async updateStatus(orderId, newStatus) {
    try {
      const response = await updateOrderStatus(orderId, newStatus);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.order;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }
};

// =============================================
// PRODUCTS API - USANDO SUPABASE
// =============================================

export const productsAPI = {
  // Buscar todos os produtos ativos
  async getAll(filters = {}) {
    try {
      const response = filters ? await getProductsWithFilters(filters) : await getAllProducts();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

  // Buscar todos os produtos (incluindo inativos) - para admin
  async getAllAdmin() {
    try {
      const response = await getAllProductsAdmin();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos admin:', error);
      throw error;
    }
  },

  // Buscar produtos em destaque
  async getFeatured() {
    try {
      const response = await getFeaturedProducts();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      throw error;
    }
  },

  // Buscar produto por ID
  async getById(id) {
    try {
      const response = await getProductById(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produto por ID:', error);
      throw error;
    }
  },

  // Buscar produto por ID (admin)
  async getByIdAdmin(id) {
    try {
      const response = await getProductByIdAdmin(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produto por ID (admin):', error);
      throw error;
    }
  },

  // Buscar produtos por categoria
  async getByCategory(category) {
    try {
      const response = await getProductsByCategory(category);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      throw error;
    }
  },

  // Criar produto
  async create(productData) {
    try {
      const response = await createProduct(productData);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  // Atualizar produto
  async update(id, productData) {
    try {
      const response = await updateProduct(id, productData);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  // Deletar produto
  async delete(id) {
    try {
      const response = await deleteProduct(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  },

  // Ativar/Desativar produto
  async toggleStatus(id, isActive) {
    try {
      const response = await toggleProductStatus(id, isActive);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      throw error;
    }
  },

  // Atualizar estoque
  async updateStock(id, stock) {
    try {
      const response = await updateProductStock(id, stock);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw error;
    }
  }
};

// =============================================
// CUSTOMERS API - USANDO SUPABASE 
// =============================================

export const customersAPI = {
  async getAll(filters = {}) {
    try {
      const response = await getAllCustomers(filters);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.customers;
    } catch (error) {
      console.error('Erro ao buscar todos os clientes:', error);
      throw error;
    }
  },

  async getAdminCreated(filters = {}) {
    try {
      const response = await getAdminCustomers(filters);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.customers;
    } catch (error) {
      console.error('Erro ao buscar clientes do admin:', error);
      throw error;
    }
  },

  async create(customerData) {
    try {
      const response = await createManualCustomer(customerData);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.customer;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },

  async toggleStatus(customerId) {
    try {
      const response = await toggleAnyCustomerStatus(customerId);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
      throw error;
    }
  }
};

// =============================================
// LEGACY FUNCTIONS (MANTIDAS PARA COMPATIBILIDADE)
// =============================================

// Função auxiliar para fazer requisições (não mais usada)
const makeRequest = async (endpoint, options = {}) => {
  console.warn('⚠️ makeRequest() é legacy - usando Supabase APIs diretamente');
  throw new Error('Esta função não é mais usada. Use as APIs do Supabase diretamente.');
};

// Export das funções principais
export { makeRequest };

// Export default para compatibilidade
export default {
  authAPI,
  adminAPI,
  ordersAPI,
  productsAPI,
  customersAPI,
  makeRequest
};

