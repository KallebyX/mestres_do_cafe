// Unified formatting utilities to eliminate duplication

/**
 * Format currency values
 */
export const formatCurrency = (value, currency = 'BRL') => {
  if (value === null || value === undefined) return 'R$ 0,00';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

/**
 * Format numbers with thousands separator
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue);
};

/**
 * Format dates consistently
 */
export const formatDate = (date, format = 'default') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    default: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    short: {
      month: '2-digit',
      day: '2-digit'
    },
    datetime: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }
  };
  
  return new Intl.DateTimeFormat('pt-BR', options[format] || options.default).format(dateObj);
};

/**
 * Format time from date
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} dia${days > 1 ? 's' : ''} atrás`;
  } else if (hours > 0) {
    return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
  } else if (minutes > 0) {
    return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
  } else {
    return 'Agora mesmo';
  }
};

/**
 * Format phone numbers
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Format CPF
 */
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  
  return cpf;
};

/**
 * Format CNPJ
 */
export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  
  return cnpj;
};

/**
 * Format CEP
 */
export const formatCEP = (cep) => {
  if (!cep) return '';
  
  const cleaned = cep.replace(/\D/g, '');
  
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return cep;
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format status badges
 */
export const formatStatus = (status) => {
  const statusMap = {
    active: { label: 'Ativo', color: 'green' },
    inactive: { label: 'Inativo', color: 'red' },
    pending: { label: 'Pendente', color: 'yellow' },
    approved: { label: 'Aprovado', color: 'green' },
    rejected: { label: 'Rejeitado', color: 'red' },
    draft: { label: 'Rascunho', color: 'gray' },
    published: { label: 'Publicado', color: 'blue' },
    processing: { label: 'Processando', color: 'blue' },
    completed: { label: 'Concluído', color: 'green' },
    cancelled: { label: 'Cancelado', color: 'red' }
  };
  
  return statusMap[status] || { label: status, color: 'gray' };
};

/**
 * Format priority levels
 */
export const formatPriority = (priority) => {
  const priorityMap = {
    low: { label: 'Baixa', color: 'green' },
    medium: { label: 'Média', color: 'yellow' },
    high: { label: 'Alta', color: 'red' },
    urgent: { label: 'Urgente', color: 'red' }
  };
  
  return priorityMap[priority] || { label: priority, color: 'gray' };
};

/**
 * Format order status
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    pending: { label: 'Pendente', color: 'yellow' },
    processing: { label: 'Processando', color: 'blue' },
    shipped: { label: 'Enviado', color: 'purple' },
    delivered: { label: 'Entregue', color: 'green' },
    cancelled: { label: 'Cancelado', color: 'red' },
    refunded: { label: 'Reembolsado', color: 'orange' }
  };
  
  return statusMap[status] || { label: status, color: 'gray' };
};

/**
 * Format payment status
 */
export const formatPaymentStatus = (status) => {
  const statusMap = {
    pending: { label: 'Pendente', color: 'yellow' },
    paid: { label: 'Pago', color: 'green' },
    failed: { label: 'Falhou', color: 'red' },
    refunded: { label: 'Reembolsado', color: 'orange' },
    cancelled: { label: 'Cancelado', color: 'red' }
  };
  
  return statusMap[status] || { label: status, color: 'gray' };
};