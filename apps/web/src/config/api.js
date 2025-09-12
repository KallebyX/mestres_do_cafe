import axios from 'axios';

// Configuração da API baseada no ambiente
const API_CONFIG = {
  development: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    timeout: 10000,
  },
  production: {
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000, // Maior timeout em produção devido a cold starts
  },
  staging: {
    baseURL: import.meta.env.VITE_API_URL || 'https://mestres-cafe-api-staging.onrender.com/api',
    timeout: 20000,
  }
};

// Detectar ambiente
const environment = import.meta.env.MODE || 'development';

// Exportar configuração do ambiente atual
export const apiConfig = API_CONFIG[environment] || API_CONFIG.development;

// URL base da API
export const API_BASE_URL = apiConfig.baseURL;

// Função helper para construir URLs da API
export const buildApiUrl = (endpoint) => {
  // Remove barra inicial se existir
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // Garante que não há barra dupla
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Headers padrão para requisições
export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Configuração do Axios (se usado)
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: apiConfig.timeout,
  headers: defaultHeaders,
  withCredentials: true, // Para cookies/sessões
};

// Log da configuração em desenvolvimento
if (environment === 'development') {
  console.log('🔧 API Config:', {
    environment,
    baseURL: API_BASE_URL,
    timeout: apiConfig.timeout
  });
}

// Função helper para validar resposta da API
export const validateApiResponse = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  throw new Error(`API Error: ${response.status} ${response.statusText}`);
};

// Função para criar instância do Axios configurada
export const createApiClient = () => {
  const instance = axios.create(axiosConfig);
  
  // Interceptor para adicionar token de autorização
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Interceptor para tratar respostas
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expirado, redirecionar para login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  
  return instance;
};

// Cliente API padrão
export const apiClient = createApiClient();