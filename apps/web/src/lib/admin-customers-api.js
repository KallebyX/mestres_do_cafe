// Admin customers API service
export const adminCustomersAPI = {
  getAll: async () => {
    try {
      // Mock implementation
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: 'Erro ao buscar clientes' };
    }
  },

  create: async (customerData) => {
    try {
      // Mock implementation
      return { success: true, data: customerData };
    } catch (error) {
      return { success: false, error: 'Erro ao criar cliente' };
    }
  },

  update: async (id, customerData) => {
    try {
      // Mock implementation
      return { success: true, data: customerData };
    } catch (error) {
      return { success: false, error: 'Erro ao atualizar cliente' };
    }
  },

  delete: async (id) => {
    try {
      // Mock implementation
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: 'Erro ao deletar cliente' };
    }
  }
};

// Utility functions
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return cpf;
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

export const validateCPF = (cpf) => {
  if (!cpf) return false;
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  const cleaned = cnpj.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
  }
  return cnpj;
};

export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.length === 14;
};

export const formatCEP = (cep) => {
  if (!cep) return '';
  const cleaned = cep.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{5})(\d{3})$/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  return cep;
};

export const validateCEP = (cep) => {
  if (!cep) return false;
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
};

export const searchCEP = async (cep) => {
  // Mock function for CEP search
  return { success: true, data: { address: '', city: '', state: '' } };
};

export const fetchAddressByCEP = async (cep) => {
  // Mock function for address fetch by CEP
  return { success: true, data: { address: '', city: '', state: '', neighborhood: '' } };
};

export default adminCustomersAPI;