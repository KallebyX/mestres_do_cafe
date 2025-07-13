/**
 * Email validation utilities
 */

/**
 * Validate email format ensuring no ':' anywhere in the email
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Remove whitespace
  const cleanEmail = email.trim();
  
  // Check that email doesn't contain ':' anywhere
  if (cleanEmail.includes(':')) {
    return false;
  }
  
  // Check for @ symbol
  if (!cleanEmail.includes('@')) {
    return false;
  }

  // Split email into local and domain parts
  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domainPart] = parts;

  // Basic checks
  if (!localPart || !domainPart) {
    return false;
  }

  // Basic domain validation
  if (!domainPart.includes('.') || domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return false;
  }

  return true;
};

/**
 * Validate and clean email (only trim whitespace)
 * @param {string} email - Email to validate and clean
 * @returns {object} - {isValid: boolean, email: string, error?: string}
 */
export const validateAndCleanEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      email: '',
      error: 'Email is required'
    };
  }

  const cleaned = email.trim();
  
  if (!cleaned) {
    return {
      isValid: false,
      email: '',
      error: 'Email is required'
    };
  }

  if (!validateEmail(cleaned)) {
    return {
      isValid: false,
      email: cleaned,
      error: 'Invalid email format'
    };
  }

  return {
    isValid: true,
    email: cleaned
  };
};

/**
 * Password validation
 * @param {string} password - Password to validate
 * @returns {object} - {isValid: boolean, error?: string}
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      error: 'Password is required'
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters long'
    };
  }

  return {
    isValid: true
  };
};

/**
 * Name validation
 * @param {string} name - Name to validate
 * @returns {object} - {isValid: boolean, error?: string}
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      error: 'Name is required'
    };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters long'
    };
  }

  return {
    isValid: true
  };
};