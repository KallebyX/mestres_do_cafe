import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário para combinar classes CSS com Tailwind
 * Combina clsx e tailwind-merge para resolver conflitos de classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor monetário em Real brasileiro
 */
export function formatCurrency(value, options = {}) {
  const {
    locale = 'pt-BR',
    currency = 'BRL',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

/**
 * Formata um número
 */
export function formatNumber(value, options = {}) {
  const {
    locale = 'pt-BR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

/**
 * Função de delay para async/await
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Capitaliza a primeira letra de uma string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Trunca uma string se ela for maior que o limite
 */
export function truncate(str, limit = 50) {
  if (!str) return '';
  if (str.length <= limit) return str;
  return str.slice(0, limit) + '...';
}

/**
 * Remove acentos de uma string
 */
export function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera um ID único simples
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Verifica se um valor está vazio (null, undefined, string vazia, array vazio, objeto vazio)
 */
export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export default {
  cn,
  formatCurrency,
  formatNumber,
  delay,
  capitalize,
  truncate,
  removeAccents,
  generateId,
  isEmpty,
  debounce,
  throttle,
};