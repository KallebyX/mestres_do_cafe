// API para gerenciamento de clientes criados pelo admin
import { supabase } from "../lib/api.js"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Função auxiliar para fazer requests com auth
const apiRequest = async (endpoint, options = {}) => {
  // Usar token JWT próprio em vez do Supabase
  const token = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Criar cliente manual
export const createManualCustomer = async (customerData) => {
  try {
    const response = await apiRequest('/api/admin/customers/create-customer', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
    
    return {
      success: true,
      data: response.customer,
      message: response.message
    };
  } catch (error) {
    console.error('Erro ao criar cliente manual:', error);
    return {
      success: false,
      error: error.message || 'Erro ao criar cliente'
    };
  }
};

// Listar clientes criados pelo admin
export const getAdminCustomers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    
    const response = await apiRequest(`/api/admin/customers/admin-customers?${queryParams}`);
    
    return {
      success: true,
      customers: response.customers || [],
      pagination: response.pagination || {}
    };
  } catch (error) {
    console.error('Erro ao buscar clientes do admin:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar clientes',
      customers: [],
      pagination: {}
    };
  }
};

// Editar cliente criado pelo admin
export const editAdminCustomer = async (customerId, customerData) => {
  try {
    const response = await apiRequest(`/api/admin/customers/edit-customer/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    });
    
    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    console.error('Erro ao editar cliente:', error);
    return {
      success: false,
      error: error.message || 'Erro ao editar cliente'
    };
  }
};

// Ativar/desativar cliente
export const toggleCustomerStatus = async (customerId, isActive) => {
  try {
    const response = await apiRequest(`/api/admin/customers/toggle-status/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive })
    });
    
    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    console.error('Erro ao alterar status do cliente:', error);
    return {
      success: false,
      error: error.message || 'Erro ao alterar status'
    };
  }
};

// Buscar logs de ações do admin
export const getAdminLogs = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params.action_type) queryParams.append('action_type', params.action_type);
    
    const response = await apiRequest(`/api/admin/customers/admin-logs?${queryParams}`);
    
    return {
      success: true,
      logs: response.logs || []
    };
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar logs',
      logs: []
    };
  }
};

// Funções de validação
export const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder < 10 ? remainder : 0;
  
  if (parseInt(cpf.charAt(9)) !== digit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder < 10 ? remainder : 0;
  
  return parseInt(cpf.charAt(10)) === digit2;
};

export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  
  cnpj = cnpj.replace(/[^\d]/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights[i];
  }
  
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cnpj.charAt(12)) !== digit1) return false;
  
  weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights[i];
  }
  
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cnpj.charAt(13)) === digit2;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatCPF = (cpf) => {
  if (!cpf) return '';
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  cnpj = cnpj.replace(/[^\d]/g, '');
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  phone = phone.replace(/[^\d]/g, '');
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

export const formatCEP = (cep) => {
  if (!cep) return '';
  cep = cep.replace(/[^\d]/g, '');
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// Função para buscar CEP (ViaCEP API gratuita)
export const fetchAddressByCEP = async (cep) => {
  try {
    cep = cep.replace(/[^\d]/g, '');
    if (cep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }
    
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return {
      success: true,
      address: {
        street: data.logradouro,
        district: data.bairro,
        city: data.localidade,
        state: data.uf,
        cep: data.cep
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Erro ao buscar CEP'
    };
  }
};

// Listar TODOS os clientes do sistema (admin + auto-cadastrados)
export const getAllCustomers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.source) queryParams.append('source', params.source);
    if (params.status) queryParams.append('status', params.status);
    
    const response = await apiRequest(`/api/admin/customers/all-customers?${queryParams}`);
    
    return {
      success: true,
      customers: response.customers || [],
      pagination: response.pagination || {}
    };
  } catch (error) {
    console.error('Erro ao buscar todos os clientes:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar clientes',
      customers: [],
      pagination: {}
    };
  }
};

// Ativar/desativar qualquer cliente (admin ou auto-cadastrado)
export const toggleAnyCustomerStatus = async (customerId, isActive) => {
  try {
    const response = await apiRequest(`/api/admin/customers/toggle-any-customer-status/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive })
    });
    
    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    console.error('Erro ao alterar status do cliente:', error);
    return {
      success: false,
      error: error.message || 'Erro ao alterar status'
    };
  }
};

// =============================================
// FUNCTIONS EXPORTS
// =============================================

export default {
  createManualCustomer,
  getAdminCustomers,
  editAdminCustomer,
  toggleCustomerStatus,
  getAdminLogs,
  getAllCustomers,
  toggleAnyCustomerStatus,
  validateCPF,
  validateCNPJ,
  validateEmail,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  fetchAddressByCEP
}; 