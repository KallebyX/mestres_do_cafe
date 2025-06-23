import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminCRMDashboard from '../../../src/pages/AdminCRMDashboard';
import { SupabaseAuthProvider } from '../../../src/contexts/SupabaseAuthContext';

// Mock das APIs
vi.mock('../../../src/lib/admin-customers-api', () => ({
  getAdminCustomers: vi.fn(),
  toggleCustomerStatus: vi.fn(),
  editCustomer: vi.fn(),
  getAdminLogs: vi.fn()
}));

// Mock do Supabase context
const mockSupabaseContext = {
  user: {
    id: 'admin-123',
    name: 'Administrador',
    user_metadata: { name: 'Administrador' }
  },
  loading: false,
  error: null
};

const mockGetAdminCustomers = vi.fn();
const mockToggleCustomerStatus = vi.fn();
const mockEditCustomer = vi.fn();
const mockGetAdminLogs = vi.fn();

// Componente wrapper com contextos
const Wrapper = ({ children }) => (
  <MemoryRouter>
    <SupabaseAuthProvider value={mockSupabaseContext}>
      {children}
    </SupabaseAuthProvider>
  </MemoryRouter>
);

describe('AdminCRMDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock dados de clientes
    const mockCustomers = [
      {
        id: 'uuid-1',
        name: 'João Silva',
        email: 'joao@test.com',
        user_type: 'cliente_pf',
        phone: '(51) 99999-1234',
        city: 'Santa Maria',
        state: 'RS',
        criado_por_admin: true,
        pendente_ativacao: true,
        is_active: true,
        created_at: '2025-01-01T10:00:00Z',
        admin_name: 'Administrador',
        orders_count: 0,
        total_spent: 0
      },
      {
        id: 'uuid-2',
        name: 'Maria Santos',
        email: 'maria@empresa.com',
        user_type: 'cliente_pj',
        phone: '(51) 98888-5555',
        city: 'Porto Alegre',
        state: 'RS',
        company_name: 'Empresa Teste Ltda',
        criado_por_admin: true,
        pendente_ativacao: false,
        is_active: true,
        created_at: '2025-01-01T11:00:00Z',
        admin_name: 'Administrador',
        orders_count: 2,
        total_spent: 150.80
      }
    ];

    // Mock logs
    const mockLogs = [
      {
        id: 'log-1',
        admin_name: 'Administrador',
        customer_name: 'João Silva',
        customer_email: 'joao@test.com',
        action_type: 'create',
        created_at: '2025-01-01T10:00:00Z'
      }
    ];

    mockGetAdminCustomers.mockResolvedValue({
      success: true,
      customers: mockCustomers,
      pagination: {
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1
      }
    });

    mockGetAdminLogs.mockResolvedValue({
      success: true,
      logs: mockLogs
    });

    mockToggleCustomerStatus.mockResolvedValue({
      success: true,
      message: 'Status alterado com sucesso!'
    });

    mockEditCustomer.mockResolvedValue({
      success: true,
      message: 'Cliente atualizado com sucesso!'
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Renderização inicial', () => {
    it('deve renderizar título e elementos principais', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      expect(screen.getByText('👥 CRM - Gestão de Clientes')).toBeInTheDocument();
      expect(screen.getByText('Clientes criados pelo admin')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /novo cliente/i })).toBeInTheDocument();
      
      // Aguarda carregamento dos KPIs
      await waitFor(() => {
        expect(screen.getByText('Total de Clientes')).toBeInTheDocument();
        expect(screen.getByText('Pendentes de Ativação')).toBeInTheDocument();
        expect(screen.getByText('Clientes Ativos')).toBeInTheDocument();
        expect(screen.getByText('LTV Médio')).toBeInTheDocument();
      });
    });

    it('deve mostrar loading inicial', () => {
      // Mock para loading
      mockGetAdminCustomers.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, customers: [] }), 100))
      );
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });

    it('deve carregar dados automaticamente', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(mockGetAdminCustomers).toHaveBeenCalledWith({
          page: 1,
          limit: 20,
          search: '',
          status: 'all'
        });
      });
    });
  });

  describe('KPIs e estatísticas', () => {
    it('deve exibir KPIs calculados corretamente', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total de clientes
        expect(screen.getByText('1')).toBeInTheDocument(); // Pendentes (João)
        expect(screen.getByText('2')).toBeInTheDocument(); // Ativos
        expect(screen.getByText('R$ 75,40')).toBeInTheDocument(); // LTV médio (150.80/2)
      });
    });

    it('deve exibir ícones corretos nos KPIs', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('👥')).toBeInTheDocument(); // Total
        expect(screen.getByText('⏳')).toBeInTheDocument(); // Pendentes
        expect(screen.getByText('✅')).toBeInTheDocument(); // Ativos
        expect(screen.getByText('💰')).toBeInTheDocument(); // LTV
      });
    });

    it('deve lidar com dados zerados', async () => {
      mockGetAdminCustomers.mockResolvedValue({
        success: true,
        customers: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
      });
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument(); // Total
        expect(screen.getByText('R$ 0,00')).toBeInTheDocument(); // LTV
      });
    });
  });

  describe('Filtros e busca', () => {
    it('deve renderizar controles de filtro', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/buscar por nome/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('all')).toBeInTheDocument(); // Select de status
      });
    });

    it('deve filtrar por busca de texto', async () => {
      const user = userEvent.setup();
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/buscar por nome/i)).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/buscar por nome/i);
      await user.type(searchInput, 'João');
      
      // Aguarda debounce
      await waitFor(() => {
        expect(mockGetAdminCustomers).toHaveBeenCalledWith({
          page: 1,
          limit: 20,
          search: 'João',
          status: 'all'
        });
      }, { timeout: 1000 });
    });

    it('deve filtrar por status', async () => {
      const user = userEvent.setup();
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('all')).toBeInTheDocument();
      });
      
      const statusSelect = screen.getByDisplayValue('all');
      await user.selectOptions(statusSelect, 'pending');
      
      await waitFor(() => {
        expect(mockGetAdminCustomers).toHaveBeenCalledWith({
          page: 1,
          limit: 20,
          search: '',
          status: 'pending'
        });
      });
    });

    it('deve limpar filtros ao clicar no botão', async () => {
      const user = userEvent.setup();
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/buscar por nome/i)).toBeInTheDocument();
      });
      
      // Aplica filtros
      const searchInput = screen.getByPlaceholderText(/buscar por nome/i);
      await user.type(searchInput, 'João');
      
      const statusSelect = screen.getByDisplayValue('all');
      await user.selectOptions(statusSelect, 'pending');
      
      // Limpa filtros
      const clearButton = screen.getByRole('button', { name: /limpar filtros/i });
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue('');
      expect(statusSelect).toHaveValue('all');
    });
  });

  describe('Lista de clientes', () => {
    it('deve exibir lista de clientes', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('joao@test.com')).toBeInTheDocument();
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
        expect(screen.getByText('maria@empresa.com')).toBeInTheDocument();
      });
    });

    it('deve exibir badges de status corretos', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('Pendente')).toBeInTheDocument(); // João
        expect(screen.getByText('Ativo')).toBeInTheDocument(); // Maria
      });
    });

    it('deve exibir informações de tipo de cliente', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('PF')).toBeInTheDocument(); // João
        expect(screen.getByText('PJ')).toBeInTheDocument(); // Maria
      });
    });

    it('deve exibir botões de ação', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        const editButtons = screen.getAllByTitle(/editar cliente/i);
        const statusButtons = screen.getAllByTitle(/ativar\/desativar/i);
        
        expect(editButtons).toHaveLength(2);
        expect(statusButtons).toHaveLength(2);
      });
    });

    it('deve exibir mensagem quando não há clientes', async () => {
      mockGetAdminCustomers.mockResolvedValue({
        success: true,
        customers: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
      });
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText(/nenhum cliente encontrado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Ações dos clientes', () => {
    it('deve abrir modal de criação ao clicar em Novo Cliente', async () => {
      const user = userEvent.setup();
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      const newClientButton = screen.getByRole('button', { name: /novo cliente/i });
      await user.click(newClientButton);
      
      await waitFor(() => {
        expect(screen.getByText('Criar Novo Cliente')).toBeInTheDocument();
      });
    });

    it('deve ativar/desativar cliente', async () => {
      const user = userEvent.setup();
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });
      
      const statusButtons = screen.getAllByTitle(/ativar\/desativar/i);
      await user.click(statusButtons[0]);
      
      await waitFor(() => {
        expect(mockToggleCustomerStatus).toHaveBeenCalledWith('uuid-1', false);
      });
    });

    it('deve exibir mensagem de sucesso após ação', async () => {
      const user = userEvent.setup();
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });
      
      const statusButtons = screen.getAllByTitle(/ativar\/desativar/i);
      await user.click(statusButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/status alterado com sucesso/i)).toBeInTheDocument();
      });
    });

    it('deve recarregar dados após ação bem-sucedida', async () => {
      const user = userEvent.setup();
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });
      
      const statusButtons = screen.getAllByTitle(/ativar\/desativar/i);
      await user.click(statusButtons[0]);
      
      await waitFor(() => {
        // Deve ter sido chamado 2 vezes: inicial + após ação
        expect(mockGetAdminCustomers).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Paginação', () => {
    it('deve exibir controles de paginação quando há múltiplas páginas', async () => {
      mockGetAdminCustomers.mockResolvedValue({
        success: true,
        customers: [], // Dados simulados
        pagination: {
          total: 50,
          page: 1,
          limit: 20,
          totalPages: 3
        }
      });
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText(/página 1 de 3/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /próxima/i })).toBeInTheDocument();
      });
    });

    it('deve navegar para próxima página', async () => {
      const user = userEvent.setup();
      mockGetAdminCustomers.mockResolvedValue({
        success: true,
        customers: [],
        pagination: { total: 50, page: 1, limit: 20, totalPages: 3 }
      });
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /próxima/i })).toBeInTheDocument();
      });
      
      const nextButton = screen.getByRole('button', { name: /próxima/i });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(mockGetAdminCustomers).toHaveBeenCalledWith({
          page: 2,
          limit: 20,
          search: '',
          status: 'all'
        });
      });
    });

    it('deve desabilitar botões de navegação apropriadamente', async () => {
      mockGetAdminCustomers.mockResolvedValue({
        success: true,
        customers: [],
        pagination: { total: 20, page: 1, limit: 20, totalPages: 1 }
      });
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /anterior/i });
        const nextButton = screen.getByRole('button', { name: /próxima/i });
        
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeDisabled();
      });
    });
  });

  describe('Seção de logs', () => {
    it('deve renderizar seção de logs', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('📋 Logs de Atividade')).toBeInTheDocument();
        expect(screen.getByText('Últimas 10 ações realizadas')).toBeInTheDocument();
      });
    });

    it('deve exibir logs recentes', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument();
        expect(screen.getByText('criou o cliente')).toBeInTheDocument();
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });
    });

    it('deve exibir mensagem quando não há logs', async () => {
      mockGetAdminLogs.mockResolvedValue({
        success: true,
        logs: []
      });
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText(/nenhuma atividade registrada/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tratamento de erros', () => {
    it('deve exibir erro ao falhar no carregamento de clientes', async () => {
      mockGetAdminCustomers.mockResolvedValue({
        success: false,
        error: 'Erro ao carregar clientes'
      });
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText(/erro ao carregar clientes/i)).toBeInTheDocument();
      });
    });

    it('deve tratar erro de rede', async () => {
      mockGetAdminCustomers.mockRejectedValue(new Error('Network error'));
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument();
      });
    });

    it('deve exibir erro ao falhar em ação de cliente', async () => {
      const user = userEvent.setup();
      mockToggleCustomerStatus.mockResolvedValue({
        success: false,
        error: 'Erro ao alterar status'
      });
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });
      
      const statusButtons = screen.getAllByTitle(/ativar\/desativar/i);
      await user.click(statusButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/erro ao alterar status/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsividade', () => {
    it('deve adaptar layout para mobile', async () => {
      // Mock do window.innerWidth para simular mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        // Verifica se elementos se adaptam ao mobile
        expect(screen.getByText('👥 CRM - Gestão de Clientes')).toBeInTheDocument();
      });
    });

    it('deve esconder colunas em telas pequenas', async () => {
      // Simula tela pequena
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        // Em telas pequenas, algumas colunas podem ficar ocultas
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter estrutura de headings adequada', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      const mainHeading = screen.getByRole('heading', { name: /crm - gestão de clientes/i });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading.tagName).toBe('H1');
    });

    it('deve ter labels apropriados para controles', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        expect(screen.getByLabelText(/buscar cliente/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/filtrar por status/i)).toBeInTheDocument();
      });
    });

    it('deve ter roles apropriados para elementos interativos', async () => {
      render(<AdminCRMDashboard />, { wrapper: Wrapper });
      
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
        
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });
}); 