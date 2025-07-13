// Configuração da API baseada no ambiente
const API_CONFIG = {
  development: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
    timeout: 10000,
  },
  production: {
    baseURL: import.meta.env.VITE_API_URL || 'https://mestres-cafe-api.onrender.com',
    timeout: 30000, // Maior timeout em produção devido a cold starts
  },
  staging: {
    baseURL: import.meta.env.VITE_API_URL || 'https://mestres-cafe-api-staging.onrender.com',
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
  }