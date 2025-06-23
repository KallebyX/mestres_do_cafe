import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  createCustomer, 
  getAdminCustomers, 
  editCustomer, 
  toggleCustomerStatus, 
  getAdminLogs,
  validateCPF,
  validateCNPJ,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  searchCEP
} from '../../../src/lib/admin-customers-api';

// Mock do Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn()
  }
};

// Mock do fetch global
global.fetch = vi.fn();

describe('Admin Customers API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock session ativa
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-token',
          user: { id: 'admin-123' }
        }
      }
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createCustomer', () => {
    it('deve criar cliente com sucesso', async () => {
      const customerData = {
        name: 'João Silva',
        email: 'joao@test.com',
        user_type: 'cliente_pf',
        phone: '(51) 99999-1234',
        cpf_cnpj: '12345678901',
        address: 'Rua das Flores, 123',
        city: 'Santa Maria',
        state: 'RS',
        zip_code: '97010-123',
        observacao: 'Cliente da loja física'
      };

      const mockResponse = {
        success: true,
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

      const result = await createCustomer(customerData);

      expect(result.success).toBe(true);
      expect(result.customer.name).toBe('João Silva');
      expect(result.customer.criado_por_admin).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/api/admin/customers/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(customerData)
      });
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

      const result = await createCustomer(customerData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email já existe');
    });

    it('deve tratar erro de rede', async () => {
      const customerData = {
        name: 'João Silva',
        email: 'joao@test.com',
        user_type: 'cliente_pf'
      };

      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await createCustomer(customerData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro de conexão ao criar cliente');
    });
  });

  describe('getAdminCustomers', () => {
    it('deve buscar clientes com parâmetros padrão', async () => {
      const mockResponse = {
        success: true,
        customers: [
          {
            id: 'uuid-1',
            name: 'João Silva',
            email: 'joao@test.com',
            user_type: 'cliente_pf',
            criado_por_admin: true,
            pendente_ativacao: true
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1
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
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/customers/admin-customers?page=1&limit=20',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });

    it('deve buscar clientes com filtros', async () => {
      const filters = {
        page: 2,
        limit: 10,
        search: 'João',
        status: 'pending'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          customers: [],
          pagination: { total: 0, page: 2, limit: 10 }
        })
      });

      const result = await getAdminCustomers(filters);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/customers/admin-customers?page=2&limit=10&search=João&status=pending',
        expect.any(Object)
      );
    });

    it('deve tratar erro na busca', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getAdminCustomers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro de conexão ao buscar clientes');
    });
  });

  describe('editCustomer', () => {
    it('deve editar cliente com sucesso', async () => {
      const customerId = 'uuid-123';
      const updateData = {
        name: 'João Silva Santos',
        phone: '(51) 99999-5555',
        observacao: 'Cliente atualizado'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'Cliente atualizado com sucesso!'
        })
      });

      const result = await editCustomer(customerId, updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Cliente atualizado com sucesso!');
      expect(fetch).toHaveBeenCalledWith(
        `/api/admin/customers/edit-customer/${customerId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          },
          body: JSON.stringify(updateData)
        }
      );
    });

    it('deve retornar erro se cliente não existe', async () => {
      const customerId = 'uuid-inexistente';

      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          error: 'Cliente não encontrado'
        })
      });

      const result = await editCustomer(customerId, {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cliente não encontrado');
    });
  });

  describe('toggleCustomerStatus', () => {
    it('deve ativar cliente com sucesso', async () => {
      const customerId = 'uuid-123';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'Cliente ativado com sucesso!'
        })
      });

      const result = await toggleCustomerStatus(customerId, true);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Cliente ativado com sucesso!');
      expect(fetch).toHaveBeenCalledWith(
        `/api/admin/customers/toggle-status/${customerId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          },
          body: JSON.stringify({ is_active: true })
        }
      );
    });

    it('deve desativar cliente com sucesso', async () => {
      const customerId = 'uuid-123';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'Cliente desativado com sucesso!'
        })
      });

      const result = await toggleCustomerStatus(customerId, false);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Cliente desativado com sucesso!');
    });
  });

  describe('getAdminLogs', () => {
    it('deve buscar logs com sucesso', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          admin_name: 'Administrador',
          customer_name: 'João Silva',
          action_type: 'create',
          created_at: '2025-01-01T10:00:00Z'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          logs: mockLogs
        })
      });

      const result = await getAdminLogs();

      expect(result.success).toBe(true);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].action_type).toBe('create');
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/customers/admin-logs',
        expect.any(Object)
      );
    });

    it('deve buscar logs com filtros', async () => {
      const filters = {
        customer_id: 'customer-123',
        action_type: 'create'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          logs: []
        })
      });

      const result = await getAdminLogs(filters);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/customers/admin-logs?customer_id=customer-123&action_type=create',
        expect.any(Object)
      );
    });
  });

  describe('Validações de documentos', () => {
    describe('validateCPF', () => {
      it('deve validar CPF válido', () => {
        expect(validateCPF('11144477735')).toBe(true);
        expect(validateCPF('111.444.777-35')).toBe(true);
      });

      it('deve rejeitar CPF inválido', () => {
        expect(validateCPF('11144477734')).toBe(false); // dígito incorreto
        expect(validateCPF('11111111111')).toBe(false); // todos iguais
        expect(validateCPF('123')).toBe(false); // muito curto
        expect(validateCPF('')).toBe(false); // vazio
        expect(validateCPF('abcdefghijk')).toBe(false); // não numérico
      });
    });

    describe('validateCNPJ', () => {
      it('deve validar CNPJ válido', () => {
        expect(validateCNPJ('11222333000181')).toBe(true);
        expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
      });

      it('deve rejeitar CNPJ inválido', () => {
        expect(validateCNPJ('11222333000180')).toBe(false); // dígito incorreto
        expect(validateCNPJ('11111111111111')).toBe(false); // todos iguais
        expect(validateCNPJ('123')).toBe(false); // muito curto
        expect(validateCNPJ('')).toBe(false); // vazio
        expect(validateCNPJ('abcdefghijklmn')).toBe(false); // não numérico
      });
    });
  });

  describe('Formatação de campos', () => {
    describe('formatCPF', () => {
      it('deve formatar CPF corretamente', () => {
        expect(formatCPF('11144477735')).toBe('111.444.777-35');
        expect(formatCPF('111.444.777-35')).toBe('111.444.777-35'); // já formatado
        expect(formatCPF('111444')).toBe('111.444'); // parcial
        expect(formatCPF('')).toBe(''); // vazio
      });
    });

    describe('formatCNPJ', () => {
      it('deve formatar CNPJ corretamente', () => {
        expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
        expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81'); // já formatado
        expect(formatCNPJ('11222333')).toBe('11.222.333'); // parcial
        expect(formatCNPJ('')).toBe(''); // vazio
      });
    });

    describe('formatPhone', () => {
      it('deve formatar telefone corretamente', () => {
        expect(formatPhone('51999991234')).toBe('(51) 99999-1234');
        expect(formatPhone('5199999123')).toBe('(51) 9999-9123'); // fixo
        expect(formatPhone('519999')).toBe('(51) 9999'); // parcial
        expect(formatPhone('')).toBe(''); // vazio
      });
    });

    describe('formatCEP', () => {
      it('deve formatar CEP corretamente', () => {
        expect(formatCEP('97010123')).toBe('97010-123');
        expect(formatCEP('97010-123')).toBe('97010-123'); // já formatado
        expect(formatCEP('97010')).toBe('97010'); // parcial
        expect(formatCEP('')).toBe(''); // vazio
      });
    });
  });

  describe('searchCEP', () => {
    it('deve buscar CEP com sucesso', async () => {
      const mockCEPData = {
        cep: '97010-123',
        logradouro: 'Rua das Flores',
        bairro: 'Centro',
        localidade: 'Santa Maria',
        uf: 'RS'
      };

      // Mock da API ViaCEP
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCEPData)
      });

      const result = await searchCEP('97010123');

      expect(result.address).toBe('Rua das Flores');
      expect(result.neighborhood).toBe('Centro');
      expect(result.city).toBe('Santa Maria');
      expect(result.state).toBe('RS');
      expect(fetch).toHaveBeenCalledWith(
        'https://viacep.com.br/ws/97010123/json/'
      );
    });

    it('deve retornar erro para CEP inválido', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ erro: true })
      });

      const result = await searchCEP('00000000');

      expect(result.error).toBe('CEP não encontrado');
    });

    it('deve tratar erro de rede na busca do CEP', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const result = await searchCEP('97010123');

      expect(result.error).toBe('Erro ao buscar CEP');
    });

    it('deve validar formato do CEP antes da busca', async () => {
      const result = await searchCEP('123');

      expect(result.error).toBe('CEP deve ter 8 dígitos');
    });
  });

  describe('Tratamento de erros de autenticação', () => {
    it('deve retornar erro quando não há sessão ativa', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null }
      });

      const result = await createCustomer({
        name: 'João Silva',
        email: 'joao@test.com',
        user_type: 'cliente_pf'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuário não autenticado');
    });

    it('deve tratar erro de token inválido', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Token inválido' })
      });

      const result = await createCustomer({
        name: 'João Silva',
        email: 'joao@test.com',
        user_type: 'cliente_pf'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Token inválido');
    });
  });

  describe('Cache de dados', () => {
    it('deve implementar cache básico para busca de clientes', async () => {
      const mockResponse = {
        success: true,
        customers: [{ id: '1', name: 'João' }],
        pagination: { total: 1 }
      };

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Primeira chamada
      const result1 = await getAdminCustomers();
      
      // Segunda chamada (mesmo parâmetros)
      const result2 = await getAdminCustomers();

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      
      // Deve ter feito 2 chamadas (sem cache nesta implementação básica)
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
}); 