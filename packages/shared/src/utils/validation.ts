/**
 * Utilitários de validação compartilhados
 */

import { z } from 'zod';

// ============================================================================
// SCHEMAS DE VALIDAÇÃO BASE
// ============================================================================

export const emailSchema = z.string().email('Email inválido');
export const phoneSchema = z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido');
export const cpfSchema = z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido');
export const cnpjSchema = z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido');
export const cepSchema = z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido');

export const passwordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/\d/, 'Senha deve conter pelo menos um número')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial');

// ============================================================================
// SCHEMAS DE USUÁRIO
// ============================================================================

export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema.optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Você deve aceitar os termos'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional(),
});

export const userProfileSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema.optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['M', 'F', 'O']).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
});

// ============================================================================
// SCHEMAS DE PRODUTO
// ============================================================================

export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  shortDescription: z.string().max(300).optional(),
  price: z.number().positive('Preço deve ser positivo'),
  comparePrice: z.number().positive().optional(),
  sku: z.string().min(1, 'SKU é obrigatório'),
  weight: z.number().positive('Peso deve ser positivo'),
  categoryId: z.number().positive('Categoria é obrigatória'),
  stockQuantity: z.number().min(0, 'Estoque não pode ser negativo'),
  minStockLevel: z.number().min(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  tags: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  parentId: z.number().positive().optional(),
  isActive: z.boolean(),
});

// ============================================================================
// SCHEMAS DE PEDIDO
// ============================================================================

export const addressSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  company: z.string().max(100).optional(),
  addressLine1: z.string().min(5).max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  postalCode: cepSchema,
  country: z.string().length(2, 'País deve ter 2 caracteres'),
  phone: phoneSchema.optional(),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().positive(),
    variantId: z.number().positive().optional(),
    quantity: z.number().positive(),
  })).min(1, 'Pedido deve ter pelo menos um item'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'pix', 'boleto']),
  notes: z.string().max(500).optional(),
});

// ============================================================================
// SCHEMAS DE BLOG
// ============================================================================

export const blogPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(50),
  excerpt: z.string().max(300).optional(),
  categoryId: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  publishedAt: z.string().optional(),
});

// ============================================================================
// SCHEMAS DE CURSO
// ============================================================================

export const courseSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(50),
  shortDescription: z.string().max(300).optional(),
  price: z.number().min(0),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  durationHours: z.number().positive(),
  maxStudents: z.number().positive().optional(),
  categoryId: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
});

export const lessonSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(500).optional(),
  content: z.string().min(10),
  videoUrl: z.string().url().optional(),
  durationMinutes: z.number().positive(),
  position: z.number().min(1),
  isFree: z.boolean(),
});

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO CUSTOMIZADAS
// ============================================================================

/**
 * Valida CPF
 */
export function validateCPF(cpf: string): boolean {
  // Remove formatação
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Valida dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Valida CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Valida primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  // Valida segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleanCNPJ.charAt(13))) return false;
  
  return true;
}

/**
 * Valida força da senha
 */
export function validatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Comprimento
  if (password.length >= 8) score += 1;
  else feedback.push('Use pelo menos 8 caracteres');
  
  if (password.length >= 12) score += 1;
  
  // Caracteres
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Adicione letras minúsculas');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Adicione letras maiúsculas');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Adicione números');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Adicione caracteres especiais');
  
  // Padrões comuns
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push('Evite repetir caracteres');
  
  if (!/123|abc|qwe|password|admin/i.test(password)) score += 1;
  else feedback.push('Evite sequências comuns');
  
  return { score, feedback };
}

/**
 * Valida formato de arquivo
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Valida tamanho de arquivo
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Valida URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida slug (URL amigável)
 */
export function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Gera slug a partir de texto
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
}

/**
 * Valida coordenadas geográficas
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Valida horário de funcionamento
 */
export function validateBusinessHours(hours: string): boolean {
  // Formato: "09:00-18:00"
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hours);
}

/**
 * Valida cor hexadecimal
 */
export function validateHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Valida número de cartão de crédito (algoritmo de Luhn)
 */
export function validateCreditCard(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Valida CVV do cartão
 */
export function validateCVV(cvv: string, cardType?: string): boolean {
  const cleanCVV = cvv.replace(/\D/g, '');
  
  if (cardType === 'amex') {
    return cleanCVV.length === 4;
  }
  
  return cleanCVV.length === 3;
}

/**
 * Valida data de expiração do cartão
 */
export function validateCardExpiry(month: string, year: string): boolean {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
}

// ============================================================================
// UTILITÁRIOS DE SANITIZAÇÃO
// ============================================================================

/**
 * Sanitiza entrada de texto
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Remove espaços extras
    .replace(/[<>]/g, ''); // Remove caracteres perigosos
}

/**
 * Sanitiza HTML básico
 */
export function sanitizeHTML(html: string): string {
  // Remove scripts e outros elementos perigosos
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: URLs
}

/**
 * Sanitiza número de telefone
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Formata número de telefone
 */
export function formatPhone(phone: string): string {
  const clean = sanitizePhone(phone);
  
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  
  return phone;
}

/**
 * Formata CPF
 */
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '');
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CEP
 */
export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, '');
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata data brasileira
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

/**
 * Formata data e hora brasileira
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const schemas = {
  email: emailSchema,
  phone: phoneSchema,
  cpf: cpfSchema,
  cnpj: cnpjSchema,
  cep: cepSchema,
  password: passwordSchema,
  userRegistration: userRegistrationSchema,
  userLogin: userLoginSchema,
  userProfile: userProfileSchema,
  product: productSchema,
  category: categorySchema,
  address: addressSchema,
  order: orderSchema,
  blogPost: blogPostSchema,
  course: courseSchema,
  lesson: lessonSchema,
};

export const validators = {
  validateCPF,
  validateCNPJ,
  validatePasswordStrength,
  validateFileType,
  validateFileSize,
  validateURL,
  validateSlug,
  validateCoordinates,
  validateBusinessHours,
  validateHexColor,
  validateCreditCard,
  validateCVV,
  validateCardExpiry,
};

export const sanitizers = {
  sanitizeText,
  sanitizeHTML,
  sanitizePhone,
};

export const formatters = {
  formatPhone,
  formatCPF,
  formatCNPJ,
  formatCEP,
  formatCurrency,
  formatDate,
  formatDateTime,
  generateSlug,
};

