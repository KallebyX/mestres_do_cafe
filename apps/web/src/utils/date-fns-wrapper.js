// Date-fns wrapper para reduzir bundle size
// Importa apenas as funções necessárias

import {
  addDays as _addDays,
  addMonths as _addMonths,
  differenceInDays as _differenceInDays,
  differenceInHours as _differenceInHours,
  differenceInMinutes as _differenceInMinutes,
  differenceInMonths as _differenceInMonths,
  endOfDay as _endOfDay,
  endOfMonth as _endOfMonth,
  endOfWeek as _endOfWeek,
  format as _format,
  formatDistance as _formatDistance,
  formatDistanceToNow as _formatDistanceToNow,
  formatRelative as _formatRelative,
  getDay as _getDay,
  isAfter as _isAfter,
  isBefore as _isBefore,
  isSameDay as _isSameDay,
  isSameMonth as _isSameMonth,
  isToday as _isToday,
  isValid as _isValid,
  isYesterday as _isYesterday,
  parseISO as _parseISO,
  startOfDay as _startOfDay,
  startOfMonth as _startOfMonth,
  startOfWeek as _startOfWeek,
  subDays as _subDays,
  subMonths as _subMonths
} from 'date-fns';

// Re-exportar com os mesmos nomes
export const addDays = _addDays;
export const addMonths = _addMonths;
export const differenceInDays = _differenceInDays;
export const differenceInHours = _differenceInHours;
export const differenceInMinutes = _differenceInMinutes;
export const differenceInMonths = _differenceInMonths;
export const endOfDay = _endOfDay;
export const endOfMonth = _endOfMonth;
export const endOfWeek = _endOfWeek;
export const format = _format;
export const formatDistance = _formatDistance;
export const formatDistanceToNow = _formatDistanceToNow;
export const formatRelative = _formatRelative;
export const getDay = _getDay;
export const isAfter = _isAfter;
export const isBefore = _isBefore;
export const isSameDay = _isSameDay;
export const isSameMonth = _isSameMonth;
export const isToday = _isToday;
export const isValid = _isValid;
export const isYesterday = _isYesterday;
export const parseISO = _parseISO;
export const startOfDay = _startOfDay;
export const startOfMonth = _startOfMonth;
export const startOfWeek = _startOfWeek;
export const subDays = _subDays;
export const subMonths = _subMonths;

// Criar objeto ptBR temporário até resolver importação do locale
export const ptBR = { locale: 'pt-BR' };

// Funções customizadas comuns
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? _parseISO(date) : date;
  return _isValid(parsed) ? _format(parsed, formatStr) : '';
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? _parseISO(date) : date;
  return _isValid(parsed) ? _format(parsed, 'dd/MM/yyyy HH:mm') : '';
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

export const formatPercentage = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value || 0);
};