// Unified validation utilities to eliminate duplication

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: 'Email é obrigatório' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Email inválido' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate password strength
 */
export const validatePassword = (password, minLength = 8) => {
  if (!password) return { isValid: false, message: 'Senha é obrigatória' };
  
  if (password.length < minLength) {
    return { isValid: false, message: `Senha deve ter pelo menos ${minLength} caracteres` };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos um número' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos um caractere especial' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate CPF
 */
export const validateCPF = (cpf) => {
  if (!cpf) return { isValid: false, message: 'CPF é obrigatório' };
  
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) {
    return { isValid: false, message: 'CPF deve ter 11 dígitos' };
  }
  
  // Check for known invalid CPFs
  const invalidCPFs = [
    '00000000000', '11111111111', '22222222222', '33333333333',
    '44444444444', '55555555555', '66666666666', '77777777777',
    '88888888888', '99999999999'
  ];
  
  if (invalidCPFs.includes(cleaned)) {
    return { isValid: false, message: 'CPF inválido' };
  }
  
  // Validate CPF algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) {
    return { isValid: false, message: 'CPF inválido' };
  }
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) {
    return { isValid: false, message: 'CPF inválido' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate CNPJ
 */
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return { isValid: false, message: 'CNPJ é obrigatório' };
  
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) {
    return { isValid: false, message: 'CNPJ deve ter 14 dígitos' };
  }
  
  // Check for known invalid CNPJs
  if (/^(\d)\1{13}$/.test(cleaned)) {
    return { isValid: false, message: 'CNPJ inválido' };
  }
  
  // Validate CNPJ algorithm
  let size = cleaned.length - 2;
  let numbers = cleaned.substring(0, size);
  let digits = cleaned.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return { isValid: false, message: 'CNPJ inválido' };
  }
  
  size = size + 1;
  numbers = cleaned.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return { isValid: false, message: 'CNPJ inválido' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  if (!phone) return { isValid: false, message: 'Telefone é obrigatório' };
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10 || cleaned.length > 11) {
    return { isValid: false, message: 'Telefone deve ter 10 ou 11 dígitos' };
  }
  
  // Check for valid area codes (basic validation)
  const areaCode = cleaned.substring(0, 2);
  const validAreaCodes = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', // São Paulo
    '21', '22', '24', // Rio de Janeiro
    '27', '28', // Espírito Santo
    '31', '32', '33', '34', '35', '37', '38', // Minas Gerais
    '41', '42', '43', '44', '45', '46', // Paraná
    '47', '48', '49', // Santa Catarina
    '51', '53', '54', '55', // Rio Grande do Sul
    '61', // Distrito Federal
    '62', '64', // Goiás
    '63', // Tocantins
    '65', '66', // Mato Grosso
    '67', // Mato Grosso do Sul
    '68', // Acre
    '69', // Rondônia
    '71', '73', '74', '75', '77', // Bahia
    '79', // Sergipe
    '81', '87', // Pernambuco
    '82', // Alagoas
    '83', // Paraíba
    '84', // Rio Grande do Norte
    '85', '88', // Ceará
    '86', '89', // Piauí
    '91', '93', '94', // Pará
    '92', '97', // Amazonas
    '95', // Roraima
    '96', // Amapá
    '98', '99' // Maranhão
  ];
  
  if (!validAreaCodes.includes(areaCode)) {
    return { isValid: false, message: 'Código de área inválido' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate CEP
 */
export const validateCEP = (cep) => {
  if (!cep) return { isValid: false, message: 'CEP é obrigatório' };
  
  const cleaned = cep.replace(/\D/g, '');
  
  if (cleaned.length !== 8) {
    return { isValid: false, message: 'CEP deve ter 8 dígitos' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, message: `${fieldName} é obrigatório` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value, minLength, fieldName) => {
  if (!value) return { isValid: false, message: `${fieldName} é obrigatório` };
  
  if (value.length < minLength) {
    return { isValid: false, message: `${fieldName} deve ter pelo menos ${minLength} caracteres` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value, maxLength, fieldName) => {
  if (!value) return { isValid: true, message: '' };
  
  if (value.length > maxLength) {
    return { isValid: false, message: `${fieldName} deve ter no máximo ${maxLength} caracteres` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate numeric value
 */
export const validateNumeric = (value, fieldName) => {
  if (!value) return { isValid: false, message: `${fieldName} é obrigatório` };
  
  if (isNaN(value)) {
    return { isValid: false, message: `${fieldName} deve ser um número` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate positive number
 */
export const validatePositiveNumber = (value, fieldName) => {
  if (!value) return { isValid: false, message: `${fieldName} é obrigatório` };
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, message: `${fieldName} deve ser um número` };
  }
  
  if (numValue <= 0) {
    return { isValid: false, message: `${fieldName} deve ser maior que zero` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate date format
 */
export const validateDate = (date, fieldName) => {
  if (!date) return { isValid: false, message: `${fieldName} é obrigatório` };
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: `${fieldName} deve ser uma data válida` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate future date
 */
export const validateFutureDate = (date, fieldName) => {
  const dateValidation = validateDate(date, fieldName);
  if (!dateValidation.isValid) return dateValidation;
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (dateObj <= now) {
    return { isValid: false, message: `${fieldName} deve ser uma data futura` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate URL
 */
export const validateURL = (url, fieldName) => {
  if (!url) return { isValid: false, message: `${fieldName} é obrigatório` };
  
  try {
    new URL(url);
    return { isValid: true, message: '' };
  } catch (e) {
    return { isValid: false, message: `${fieldName} deve ser uma URL válida` };
  }
};

/**
 * Validate product data
 */
export const validateProductData = (product) => {
  const errors = {};
  
  const nameValidation = validateRequired(product.name, 'Nome');
  if (!nameValidation.isValid) errors.name = nameValidation.message;
  
  const priceValidation = validatePositiveNumber(product.price, 'Preço');
  if (!priceValidation.isValid) errors.price = priceValidation.message;
  
  const categoryValidation = validateRequired(product.category, 'Categoria');
  if (!categoryValidation.isValid) errors.category = categoryValidation.message;
  
  if (product.description) {
    const descriptionValidation = validateMaxLength(product.description, 1000, 'Descrição');
    if (!descriptionValidation.isValid) errors.description = descriptionValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user data
 */
export const validateUserData = (user) => {
  const errors = {};
  
  const nameValidation = validateRequired(user.name, 'Nome');
  if (!nameValidation.isValid) errors.name = nameValidation.message;
  
  const emailValidation = validateEmail(user.email);
  if (!emailValidation.isValid) errors.email = emailValidation.message;
  
  if (user.password) {
    const passwordValidation = validatePassword(user.password);
    if (!passwordValidation.isValid) errors.password = passwordValidation.message;
  }
  
  if (user.phone) {
    const phoneValidation = validatePhone(user.phone);
    if (!phoneValidation.isValid) errors.phone = phoneValidation.message;
  }
  
  if (user.cpf) {
    const cpfValidation = validateCPF(user.cpf);
    if (!cpfValidation.isValid) errors.cpf = cpfValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate order data
 */
export const validateOrderData = (order) => {
  const errors = {};
  
  const customerValidation = validateRequired(order.customer_id, 'Cliente');
  if (!customerValidation.isValid) errors.customer_id = customerValidation.message;
  
  if (!order.items || order.items.length === 0) {
    errors.items = 'Pelo menos um item é obrigatório';
  }
  
  const totalValidation = validatePositiveNumber(order.total, 'Total');
  if (!totalValidation.isValid) errors.total = totalValidation.message;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Generic form validation
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const rule of fieldRules) {
      const validation = rule.validator(value, rule.fieldName || field);
      if (!validation.isValid) {
        errors[field] = validation.message;
        break; // Stop at first error for this field
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};