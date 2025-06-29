import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  createManualCustomer,
  getAdminCustomers, 
  editAdminCustomer,
  toggleCustomerStatus, 
  getAdminLogs,
  validateCPF,
  validateCNPJ,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  fetchAddressByCEP
} from '../../../src/lib/admin-customers-api';

// Mock do localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock do fetch global
global.fetch = vi.fn();

describe('Admin Customers API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock token ativo no localStorage
    mockLocalStorage.getItem.mockReturnValue('mock-jwt-token');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createManualCustomer', () => {
    it('deve criar cliente com sucesso', async () => {
      const customerData = {
        name: 'João Silva',
        email: 'joao@test.com',
        user_type: 'cliente_pf'
      };

      const mockResponse = {
        customer: {
          id: 'uuid-123',
          ...customerData,
          criado_por_admin: true,
          pendente_ativacao: true
        },
        message: 'Cliente criado com sucesso!'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await createManualCustomer(customerData);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('João Silva');
      expect(result.data.criado_por_admin).toBe(true);
    });

    it('deve retornar erro quando API falha', async () => {
      const customerData = {
        name: 'João Silva',
        email: 'joao@test.com',
        user_type: 'cliente_pf'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Email já existe' })
      });

      const result = await createManualCustomer(customerData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email já existe');
    });
  });

  describe('getAdminCustomers', () => {
    it('deve buscar clientes com sucesso', async () => {
      const mockResponse = {
        customers: [
          {
            id: 'uuid-1',
            name: 'João Silva',
            email: 'joao@test.com',
            user_type: 'cliente_pf'
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 20
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getAdminCustomers();

      expect(result.success).toBe(true);
      expect(result.customers).toHaveLength(1);
      expect(result.customers[0].name).toBe('João Silva');
    });
  });

  describe('Validações de documentos', () => {
    describe('validateCPF', () => {
      it('deve validar CPF válido', () => {
        expect(validateCPF('11144477735')).toBe(true);
        expect(validateCPF('111.444.777-35')).toBe(true);
      });

      it('deve rejeitar CPF inválido', () => {
        expect(validateCPF('11144477734')).toBe(false);
        expect(validateCPF('11111111111')).toBe(false);
        expect(validateCPF('123')).toBe(false);
        expect(validateCPF('')).toBe(false);
      });
    });

    describe('validateCNPJ', () => {
      it('deve validar CNPJ válido', () => {
        expect(validateCNPJ('11222333000181')).toBe(true);
        expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
      });

      it('deve rejeitar CNPJ inválido', () => {
        expect(validateCNPJ('11222333000180')).toBe(false);
        expect(validateCNPJ('11111111111111')).toBe(false);
        expect(validateCNPJ('123')).toBe(false);
        expect(validateCNPJ('')).toBe(false);
      });
    });
  });

  describe('Formatação de campos', () => {
    describe('formatCPF', () => {
      it('deve formatar CPF corretamente', () => {
        expect(formatCPF('11144477735')).toBe('111.444.777-35');
        expect(formatCPF('111.444.777-35')).toBe('111.444.777-35');
        expect(formatCPF('')).toBe('');
      });
    });

    describe('formatCNPJ', () => {
      it('deve formatar CNPJ corretamente', () => {
        expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
        expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81');
        expect(formatCNPJ('')).toBe('');
      });
    });

    describe('formatPhone', () => {
      it('deve formatar telefone corretamente', () => {
        expect(formatPhone('51999991234')).toBe('(51) 99999-1234');
        expect(formatPhone('5133334444')).toBe('(51) 3333-4444');
        expect(formatPhone('')).toBe('');
      });
    });

    describe('formatCEP', () => {
      it('deve formatar CEP corretamente', () => {
        expect(formatCEP('97010123')).toBe('97010-123');
        expect(formatCEP('97010-123')).toBe('97010-123');
        expect(formatCEP('')).toBe('');
      });
    });
  });

  describe('fetchAddressByCEP', () => {
    it('deve validar formato do CEP antes da busca', async () => {
      const result = await fetchAddressByCEP('123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('CEP deve ter 8 dígitos');
    });

    it('deve retornar erro para CEP não encontrado', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ erro: true })
      });

      const result = await fetchAddressByCEP('00000000');

      expect(result.success).toBe(false);
      expect(result.error).toBe('CEP não encontrado');

      global.fetch = originalFetch;
    });
  });
}); 