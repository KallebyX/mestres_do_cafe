// Unified constants to eliminate duplication

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    PROFILE: '/users/profile'
  },
  PRODUCTS: {
    GET_ALL: '/products',
    GET_BY_ID: (id) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories'
  },
  ORDERS: {
    GET_ALL: '/orders',
    GET_BY_ID: (id) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE: (id) => `/orders/${id}`,
    DELETE: (id) => `/orders/${id}`,
    BY_USER: (userId) => `/orders/user/${userId}`
  },
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: (id) => `/cart/${id}`,
    REMOVE: (id) => `/cart/${id}`,
    CLEAR: '/cart/clear'
  },
  BLOG: {
    GET_POSTS: '/blog/posts',
    GET_POST: (id) => `/blog/posts/${id}`,
    CREATE_POST: '/blog/posts',
    UPDATE_POST: (id) => `/blog/posts/${id}`,
    DELETE_POST: (id) => `/blog/posts/${id}`,
    CATEGORIES: '/blog/categories'
  },
  ADMIN: {
    STATS: '/api/admin/stats',
    USERS: '/api/admin/users',
    PRODUCTS: '/api/admin/products',
    ORDERS: '/api/admin/orders',
    ANALYTICS: '/api/admin/analytics'
  }
};

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  CUSTOMER: 'customer'
};

/**
 * Order statuses
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

/**
 * Payment statuses
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

/**
 * Product categories
 */
export const PRODUCT_CATEGORIES = [
  'Café em Grãos',
  'Café Moído',
  'Café Solúvel',
  'Café Especial',
  'Café Orgânico',
  'Café Descafeinado',
  'Bebidas Quentes',
  'Acessórios',
  'Equipamentos',
  'Doces e Sobremesas'
];

/**
 * Roast levels
 */
export const ROAST_LEVELS = [
  'Torra Clara',
  'Torra Média',
  'Torra Média-Escura',
  'Torra Escura',
  'Torra Francesa',
  'Torra Italiana'
];

/**
 * Coffee origins
 */
export const COFFEE_ORIGINS = [
  'Brasil',
  'Colômbia',
  'Etiópia',
  'Jamaica',
  'Guatemala',
  'Costa Rica',
  'Peru',
  'Equador',
  'Honduras',
  'Nicaragua'
];

/**
 * Priority levels
 */
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

/**
 * File types
 */
export const FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  VIDEOS: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  AUDIO: ['mp3', 'wav', 'ogg', 'aac', 'flac']
};

/**
 * Max file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  AUDIO: 10 * 1024 * 1024 // 10MB
};

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 11,
    PATTERN: /^\d{10,11}$/
  },
  CPF: {
    LENGTH: 11,
    PATTERN: /^\d{11}$/
  },
  CNPJ: {
    LENGTH: 14,
    PATTERN: /^\d{14}$/
  },
  CEP: {
    LENGTH: 8,
    PATTERN: /^\d{8}$/
  }
};

/**
 * Date formats
 */
export const DATE_FORMATS = {
  DEFAULT: 'DD/MM/YYYY',
  LONG: 'DD de MMMM de YYYY',
  SHORT: 'DD/MM',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
  ISO: 'YYYY-MM-DD'
};

/**
 * Currency formats
 */
export const CURRENCY_FORMATS = {
  BRL: {
    locale: 'pt-BR',
    currency: 'BRL',
    symbol: 'R$'
  },
  USD: {
    locale: 'en-US',
    currency: 'USD',
    symbol: '$'
  },
  EUR: {
    locale: 'de-DE',
    currency: 'EUR',
    symbol: '€'
  }
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  FORM_VALIDATION: 500,
  API_CALLS: 1000,
  RESIZE: 100
};

/**
 * Cache durations (in milliseconds)
 */
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  USER_PREFERENCES: 'user_preferences',
  DASHBOARD_CONFIG: 'dashboard_config'
};

/**
 * Theme colors
 */
export const THEME_COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  SECONDARY: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  }
};

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

/**
 * Z-index values
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
  LOADING: 1090
};

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

/**
 * Coffee grind sizes
 */
export const GRIND_SIZES = [
  'Extra Grossa',
  'Grossa',
  'Média Grossa',
  'Média',
  'Média Fina',
  'Fina',
  'Extra Fina'
];

/**
 * Brewing methods
 */
export const BREWING_METHODS = [
  'Espresso',
  'Filtro',
  'Prensa Francesa',
  'Aeropress',
  'Chemex',
  'V60',
  'Moka',
  'Cold Brew'
];

/**
 * Coffee flavors
 */
export const COFFEE_FLAVORS = [
  'Chocolate',
  'Caramelo',
  'Frutas Vermelhas',
  'Frutas Cítricas',
  'Nozes',
  'Floral',
  'Especiarias',
  'Baunilha',
  'Mel',
  'Tabaco'
];

/**
 * Default configuration
 */
export const DEFAULT_CONFIG = {
  LANGUAGE: 'pt-BR',
  CURRENCY: 'BRL',
  TIMEZONE: 'America/Sao_Paulo',
  DATE_FORMAT: 'DD/MM/YYYY',
  ITEMS_PER_PAGE: 10,
  THEME: 'light'
};

/**
 * API configuration
 */
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  DARK_MODE: true,
  MULTI_LANGUAGE: true,
  ANALYTICS: true,
  CHAT_SUPPORT: true,
  PUSH_NOTIFICATIONS: true,
  SOCIAL_LOGIN: true,
  PAYMENT_GATEWAY: true,
  SHIPPING_CALCULATOR: true
};

/**
 * Social media platforms
 */
export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  YOUTUBE: 'youtube',
  WHATSAPP: 'whatsapp',
  TELEGRAM: 'telegram'
};

/**
 * Contact types
 */
export const CONTACT_TYPES = {
  SUPPORT: 'support',
  SALES: 'sales',
  BILLING: 'billing',
  TECHNICAL: 'technical',
  PARTNERSHIP: 'partnership'
};

/**
 * Shipping methods
 */
export const SHIPPING_METHODS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  OVERNIGHT: 'overnight',
  PICKUP: 'pickup'
};

/**
 * Payment methods
 */
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PIX: 'pix',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash'
};

export default {
  API_ENDPOINTS,
  HTTP_STATUS,
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PRODUCT_CATEGORIES,
  ROAST_LEVELS,
  COFFEE_ORIGINS,
  PRIORITY_LEVELS,
  NOTIFICATION_TYPES,
  FILE_TYPES,
  MAX_FILE_SIZES,
  VALIDATION_RULES,
  DATE_FORMATS,
  CURRENCY_FORMATS,
  PAGINATION,
  DEBOUNCE_DELAYS,
  CACHE_DURATIONS,
  STORAGE_KEYS,
  THEME_COLORS,
  BREAKPOINTS,
  Z_INDEX,
  ANIMATION_DURATIONS,
  GRIND_SIZES,
  BREWING_METHODS,
  COFFEE_FLAVORS,
  DEFAULT_CONFIG,
  API_CONFIG,
  FEATURE_FLAGS,
  SOCIAL_PLATFORMS,
  CONTACT_TYPES,
  SHIPPING_METHODS,
  PAYMENT_METHODS
};