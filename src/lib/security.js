// 🔐 MÓDULO DE SEGURANÇA ENTERPRISE
// Validação, sanitização e proteção contra ataques

import DOMPurify from 'dompurify';

// =============================================
// SANITIZAÇÃO DE DADOS
// =============================================

/**
 * Sanitiza strings para prevenir XSS
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove scripts maliciosos
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  }).trim();
};

/**
 * Sanitiza HTML permitindo apenas tags seguras
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return input;
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: []
  });
};

/**
 * Sanitiza input de SQL injection (básico)
 */
export const sanitizeSQL = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove caracteres perigosos para SQL
  return input
    .replace(/['"`;\\]/g, '')
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b/gi, '')
    .trim();
};

// =============================================
// VALIDAÇÕES ROBUSTAS
// =============================================

/**
 * Validação robusta de email
 */
export const validateEmailSecurity = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // Sanitizar primeiro
  email = sanitizeString(email).toLowerCase().trim();
  
  // Verificações de segurança
  if (email.length > 254) return false; // RFC 5321
  if (email.includes('..')) return false; // Pontos consecutivos
  if (email.includes('+')) {
    // Limitar alias para prevenir spam
    const parts = email.split('@');
    if (parts[0].split('+').length > 2) return false;
  }
  
  // Regex robusto
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email);
};

/**
 * Validação segura de senha
 */
export const validatePasswordSecurity = (password) => {
  if (!password || typeof password !== 'string') return { isValid: false, errors: ['Senha é obrigatória'] };
  
  const errors = [];
  
  // Comprimento mínimo
  if (password.length < 8) errors.push('Senha deve ter pelo menos 8 caracteres');
  if (password.length > 128) errors.push('Senha muito longa (máximo 128 caracteres)');
  
  // Complexidade
  if (!/[a-z]/.test(password)) errors.push('Senha deve conter pelo menos uma letra minúscula');
  if (!/[A-Z]/.test(password)) errors.push('Senha deve conter pelo menos uma letra maiúscula');
  if (!/[0-9]/.test(password)) errors.push('Senha deve conter pelo menos um número');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Senha deve conter pelo menos um caractere especial');
  
  // Verificar padrões comuns (fracos)
  const weakPatterns = [
    /123456/,
    /qwerty/,
    /password/i,
    /admin/i,
    /^(.)\1{7,}$/, // Caracteres repetidos
  ];
  
  if (weakPatterns.some(pattern => pattern.test(password))) {
    errors.push('Senha muito comum ou fraca');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validação segura de telefone brasileiro
 */
export const validatePhoneSecurity = (phone) => {
  if (!phone) return { isValid: true, sanitized: '' }; // Opcional
  
  // Sanitizar
  const sanitized = sanitizeString(phone).replace(/[^\d]/g, '');
  
  // Validar comprimento
  if (sanitized.length < 10 || sanitized.length > 11) {
    return { isValid: false, errors: ['Telefone deve ter 10 ou 11 dígitos'] };
  }
  
  // Validar formato brasileiro
  const phoneRegex = /^[1-9]{2}[2-9]\d{7,8}$/;
  if (!phoneRegex.test(sanitized)) {
    return { isValid: false, errors: ['Formato de telefone inválido'] };
  }
  
  return { isValid: true, sanitized };
};

// =============================================
// VALIDAÇÃO DE DADOS DE ENTRADA
// =============================================

/**
 * Validador principal para dados de usuário
 */
export const validateUserData = (userData) => {
  const errors = [];
  const sanitized = {};
  
  // Nome
  if (!userData.name) {
    errors.push('Nome é obrigatório');
  } else {
    const name = sanitizeString(userData.name);
    if (name.length < 2) errors.push('Nome deve ter pelo menos 2 caracteres');
    if (name.length > 100) errors.push('Nome muito longo (máximo 100 caracteres)');
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) errors.push('Nome deve conter apenas letras e espaços');
    sanitized.name = name;
  }
  
  // Email
  if (!userData.email) {
    errors.push('Email é obrigatório');
  } else if (!validateEmailSecurity(userData.email)) {
    errors.push('Email inválido');
  } else {
    sanitized.email = sanitizeString(userData.email).toLowerCase().trim();
  }
  
  // Telefone
  const phoneValidation = validatePhoneSecurity(userData.phone);
  if (!phoneValidation.isValid) {
    errors.push(...phoneValidation.errors);
  } else {
    sanitized.phone = phoneValidation.sanitized;
  }
  
  // CPF/CNPJ
  if (userData.cpf_cnpj) {
    const document = sanitizeString(userData.cpf_cnpj).replace(/[^\d]/g, '');
    if (document.length === 11) {
      if (!isValidCPF(document)) errors.push('CPF inválido');
      else sanitized.cpf_cnpj = document;
    } else if (document.length === 14) {
      if (!isValidCNPJ(document)) errors.push('CNPJ inválido');
      else sanitized.cpf_cnpj = document;
    } else {
      errors.push('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

// =============================================
// PROTEÇÃO CONTRA RATE LIMITING
// =============================================

const requestCounts = new Map();
const RATE_LIMIT = 100; // requests por minuto
const RATE_WINDOW = 60000; // 1 minuto

/**
 * Verificar rate limiting por IP/usuário
 */
export const checkRateLimit = (identifier) => {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW;
  
  if (!requestCounts.has(identifier)) {
    requestCounts.set(identifier, []);
  }
  
  const requests = requestCounts.get(identifier);
  
  // Remove requests antigas
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: Math.ceil((recentRequests[0] + RATE_WINDOW) / 1000)
    };
  }
  
  // Adiciona request atual
  recentRequests.push(now);
  requestCounts.set(identifier, recentRequests);
  
  return {
    allowed: true,
    remaining: RATE_LIMIT - recentRequests.length,
    resetTime: Math.ceil((now + RATE_WINDOW) / 1000)
  };
};

// =============================================
// FUNÇÕES AUXILIARES SEGURAS
// =============================================

/**
 * Validação segura de CPF
 */
const isValidCPF = (cpf) => {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  
  return checkDigit === parseInt(cpf.charAt(10));
};

/**
 * Validação segura de CNPJ
 */
const isValidCNPJ = (cnpj) => {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i];
  }
  let checkDigit = sum % 11;
  checkDigit = checkDigit < 2 ? 0 : 11 - checkDigit;
  if (checkDigit !== parseInt(cnpj.charAt(12))) return false;
  
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i];
  }
  checkDigit = sum % 11;
  checkDigit = checkDigit < 2 ? 0 : 11 - checkDigit;
  
  return checkDigit === parseInt(cnpj.charAt(13));
};

/**
 * Gerar token CSRF seguro
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Verificar origem da requisição
 */
export const validateOrigin = (origin, allowedOrigins = []) => {
  const defaultAllowed = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://mestres-do-cafe.vercel.app'
  ];
  
  const allowed = [...defaultAllowed, ...allowedOrigins];
  return allowed.includes(origin);
};

// =============================================
// LOGS DE SEGURANÇA
// =============================================

/**
 * Log de evento de segurança
 */
export const logSecurityEvent = (event, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator?.userAgent || 'Unknown',
    url: window?.location?.href || 'Unknown'
  };
  
  // Em produção, enviar para serviço de logs
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrar com serviço de logs (ex: Sentry, LogRocket)
    console.warn('🔐 Security Event:', logEntry);
  } else {
    console.warn('🔐 Security Event:', logEntry);
  }
};

// =============================================
// EXPORTAÇÕES
// =============================================

export default {
  sanitizeString,
  sanitizeHTML,
  sanitizeSQL,
  validateEmailSecurity,
  validatePasswordSecurity,
  validatePhoneSecurity,
  validateUserData,
  checkRateLimit,
  generateCSRFToken,
  validateOrigin,
  logSecurityEvent
};