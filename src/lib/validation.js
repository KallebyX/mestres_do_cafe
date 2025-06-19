// Funções de validação para CPF e CNPJ

// Validar CPF
export function validateCPF(cpf) {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (casos inválidos)
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder < 10 ? remainder : 0;
  
  if (parseInt(cpf.charAt(9)) !== digit1) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder < 10 ? remainder : 0;
  
  return parseInt(cpf.charAt(10)) === digit2;
}

// Validar CNPJ
export function validateCNPJ(cnpj) {
  if (!cnpj) return false;
  
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais (casos inválidos)
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validação do primeiro dígito verificador
  let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights[i];
  }
  
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cnpj.charAt(12)) !== digit1) return false;
  
  // Validação do segundo dígito verificador
  weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights[i];
  }
  
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cnpj.charAt(13)) === digit2;
}

// Formatação de CPF
export function formatCPF(cpf) {
  if (!cpf) return '';
  
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Limitar a 11 dígitos
  cpf = cpf.substring(0, 11);
  
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return cpf.replace(/(\d{3})(\d+)/, '$1.$2');
  if (cpf.length <= 9) return cpf.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
}

// Formatação de CNPJ
export function formatCNPJ(cnpj) {
  if (!cnpj) return '';
  
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Limitar a 14 dígitos
  cnpj = cnpj.substring(0, 14);
  
  if (cnpj.length <= 2) return cnpj;
  if (cnpj.length <= 5) return cnpj.replace(/(\d{2})(\d+)/, '$1.$2');
  if (cnpj.length <= 8) return cnpj.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  if (cnpj.length <= 12) return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
}

// Formatação de telefone
export function formatPhone(phone) {
  if (!phone) return '';
  
  phone = phone.replace(/[^\d]/g, '');
  
  // Limitar a 11 dígitos
  phone = phone.substring(0, 11);
  
  if (phone.length <= 2) return phone.length === 2 ? `(${phone}) ` : phone;
  if (phone.length === 3) return `(${phone.substring(0, 2)}) ${phone.substring(2)}`;
  if (phone.length === 4) return `(${phone.substring(0, 2)}) ${phone.substring(2)}`;
  if (phone.length === 5) return `(${phone.substring(0, 2)}) ${phone.substring(2)}`;
  if (phone.length === 6) return `(${phone.substring(0, 2)}) ${phone.substring(2)}`;
  if (phone.length === 7) return `(${phone.substring(0, 2)}) ${phone.substring(2)}`;
  if (phone.length === 10) return `(${phone.substring(0, 2)}) ${phone.substring(2, 6)}-${phone.substring(6)}`;
  if (phone.length === 11) return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`;
  
  return phone;
}

// Formatação de CEP
export function formatCEP(cep) {
  if (!cep) return '';
  
  cep = cep.replace(/[^\d]/g, '');
  
  // Limitar a 8 dígitos
  cep = cep.substring(0, 8);
  
  if (cep.length <= 5) return cep;
  return cep.replace(/(\d{5})(\d{1,3})/, '$1-$2');
}

// Função para remover máscaras
export function removeMask(value) {
  if (!value) return '';
  return value.replace(/[^\w]/g, '');
}

// Máscara de entrada para CPF
export function maskCPF(value) {
  value = value.replace(/[^\d]/g, '');
  value = value.substring(0, 11);
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return value;
}

// Máscara de entrada para CNPJ
export function maskCNPJ(value) {
  value = value.replace(/[^\d]/g, '');
  value = value.substring(0, 14);
  value = value.replace(/(\d{2})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1/$2');
  value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  return value;
}

// Validação de email
export function validateEmail(email) {
  if (!email) return false;
  
  // Remove espaços em branco
  email = email.trim();
  
  // Regex mais restritiva para email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Verifica se não tem pontos consecutivos
  if (email.includes('..')) return false;
  
  return emailRegex.test(email);
}

// Validação de telefone brasileiro
export function validatePhone(phone) {
  if (!phone) return false;
  
  // Remove caracteres não numéricos
  const phoneNumbers = phone.replace(/[^\d]/g, '');
  
  // Aceita telefones com 10 ou 11 dígitos
  if (phoneNumbers.length === 10) {
    // Telefone fixo: (11) 2333-4444, (11) 3333-4444, ..., (11) 9333-4444
    return /^[1-9]{2}[2-9]\d{7}$/.test(phoneNumbers);
  } else if (phoneNumbers.length === 11) {
    // Telefone celular: (11) 99999-9999
    return /^[1-9]{2}9\d{8}$/.test(phoneNumbers);
  }
  
  return false;
}

// Máscara de telefone
export function maskPhone(value) {
  value = value.replace(/[^\d]/g, '');
  value = value.substring(0, 11);
  value = value.replace(/(\d{2})(\d)/, '($1) $2');
  value = value.replace(/(\d{4})(\d)/, '$1-$2');
  value = value.replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
  return value;
}

// Validação de CEP
export function validateCEP(cep) {
  if (!cep) return false;
  
  // Remove caracteres não numéricos
  const cepNumbers = cep.replace(/[^\d]/g, '');
  
  // Verifica se tem exatamente 8 dígitos
  return cepNumbers.length === 8;
}

// Máscara de CEP
export function maskCEP(value) {
  value = value.replace(/[^\d]/g, '');
  value = value.substring(0, 8);
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  return value;
} 