import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerCreateModal from '../../../src/components/CustomerCreateModal';

// Mock das APIs
vi.mock('../../../src/lib/admin-customers-api', () => ({
  createCustomer: vi.fn(),
  formatCPF: vi.fn((cpf) => cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || ''),
  formatCNPJ: vi.fn((cnpj) => cnpj?.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') || ''),
  formatPhone: vi.fn((phone) => phone?.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') || ''),
  formatCEP: vi.fn((cep) => cep?.replace(/(\d{5})(\d{3})/, '$1-$2') || ''),
  searchCEP: vi.fn(),
  validateCPF: vi.fn(),
  validateCNPJ: vi.fn()
}));

const mockCreateCustomer = vi.fn();
const mockSearchCEP = vi.fn();
const mockValidateCPF = vi.fn();
const mockValidateCNPJ = vi.fn();

// Atualizar mocks
vi.mocked(mockCreateCustomer);
vi.mocked(mockSearchCEP);
vi.mocked(mockValidateCPF);
vi.mocked(mockValidateCNPJ);

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn()
};

describe('CustomerCreateModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockCreateCustomer.mockResolvedValue({
      success: true,
      customer: { id: 'uuid-123', name: 'João Silva' },
      message: 'Cliente criado com sucesso!'
    });
    
    mockSearchCEP.mockResolvedValue({
      address: 'Rua das Flores',
      neighborhood: 'Centro',
      city: 'Santa Maria',
      state: 'RS'
    });
    
    mockValidateCPF.mockReturnValue(true);
    mockValidateCNPJ.mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Renderização básica', () => {
    it('deve renderizar modal quando aberto', () => {
      render(<CustomerCreateModal {...defaultProps} />);
      
      expect(screen.getByText('Criar Novo Cliente')).toBeInTheDocument();
      expect(screen.getByText('Tipo de Cliente')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pessoa física/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pessoa jurídica/i })).toBeInTheDocument();
    });

    it('não deve renderizar quando fechado', () => {
      render(<CustomerCreateModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Criar Novo Cliente')).not.toBeInTheDocument();
    });

    it('deve renderizar campos básicos para PF por padrão', () => {
      render(<CustomerCreateModal {...defaultProps} />);
      
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    });
  });

  describe('Alternância entre PF e PJ', () => {
    it('deve alternar para campos de PJ ao clicar no botão', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      const pjButton = screen.getByRole('button', { name: /pessoa jurídica/i });
      await user.click(pjButton);
      
      expect(screen.getByLabelText(/nome do responsável/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/segmento/i)).toBeInTheDocument();
    });

    it('deve voltar para campos de PF ao clicar no botão', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      // Vai para PJ
      const pjButton = screen.getByRole('button', { name: /pessoa jurídica/i });
      await user.click(pjButton);
      
      // Volta para PF
      const pfButton = screen.getByRole('button', { name: /pessoa física/i });
      await user.click(pfButton);
      
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/razão social/i)).not.toBeInTheDocument();
    });

    it('deve manter estado visual dos botões ativos', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      const pfButton = screen.getByRole('button', { name: /pessoa física/i });
      const pjButton = screen.getByRole('button', { name: /pessoa jurídica/i });
      
      // PF deve estar ativo inicialmente
      expect(pfButton).toHaveClass('bg-blue-600');
      expect(pjButton).toHaveClass('bg-gray-200');
      
      // Clica em PJ
      await user.click(pjButton);
      
      // PJ deve estar ativo agora
      expect(pjButton).toHaveClass('bg-blue-600');
      expect(pfButton).toHaveClass('bg-gray-200');
    });
  });

  describe('Validação de formulário', () => {
    it('deve exibir erro para campos obrigatórios vazios', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /criar cliente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      });
    });

    it('deve validar formato de email', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'email-invalido');
      
      const submitButton = screen.getByRole('button', { name: /criar cliente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it('deve validar CPF para pessoa física', async () => {
      const user = userEvent.setup();
      mockValidateCPF.mockReturnValue(false);
      
      render(<CustomerCreateModal {...defaultProps} />);
      
      const cpfInput = screen.getByLabelText(/cpf/i);
      await user.type(cpfInput, '123.456.789-00');
      
      const submitButton = screen.getByRole('button', { name: /criar cliente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument();
      });
    });

    it('deve validar CNPJ para pessoa jurídica', async () => {
      const user = userEvent.setup();
      mockValidateCNPJ.mockReturnValue(false);
      
      render(<CustomerCreateModal {...defaultProps} />);
      
      // Muda para PJ
      const pjButton = screen.getByRole('button', { name: /pessoa jurídica/i });
      await user.click(pjButton);
      
      const cnpjInput = screen.getByLabelText(/cnpj/i);
      await user.type(cnpjInput, '12.345.678/0001-00');
      
      const submitButton = screen.getByRole('button', { name: /criar cliente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/cnpj inválido/i)).toBeInTheDocument();
      });
    });

    it('deve limpar erros ao corrigir campos', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      // Submete formulário vazio para gerar erros
      const submitButton = screen.getByRole('button', { name: /criar cliente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      });
      
      // Corrige o nome
      const nameInput = screen.getByLabelText(/nome completo/i);
      await user.type(nameInput, 'João Silva');
      
      await waitFor(() => {
        expect(screen.queryByText(/nome é obrigatório/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Busca de CEP', () => {
    it('deve buscar endereço automaticamente ao preencher CEP', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      const cepInput = screen.getByLabelText(/cep/i);
      await user.type(cepInput, '97010123');
      
      // Simula perda de foco para disparar busca
      fireEvent.blur(cepInput);
      
      await waitFor(() => {
        expect(mockSearchCEP).toHaveBeenCalledWith('97010123');
      });
      
      // Verifica se os campos foram preenchidos
      await waitFor(() => {
        expect(screen.getByDisplayValue('Rua das Flores')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Centro')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Santa Maria')).toBeInTheDocument();
        expect(screen.getByDisplayValue('RS')).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando CEP não for encontrado', async () => {
      const user = userEvent.setup();
      mockSearchCEP.mockResolvedValue({
        error: 'CEP não encontrado'
      });
      
      render(<CustomerCreateModal {...defaultProps} />);
      
      const cepInput = screen.getByLabelText(/cep/i);
      await user.type(cepInput, '00000000');
      fireEvent.blur(cepInput);
      
      await waitFor(() => {
        expect(screen.getByText(/cep não encontrado/i)).toBeInTheDocument();
      });
    });

    it('deve mostrar loading durante busca de CEP', async () => {
      const user = userEvent.setup();
      // Mock que demora para resolver
      mockSearchCEP.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ address: 'Rua Teste' }), 100))
      );
      
      render(<CustomerCreateModal {...defaultProps} />);
      
      const cepInput = screen.getByLabelText(/cep/i);
      await user.type(cepInput, '97010123');
      fireEvent.blur(cepInput);
      
      // Deve mostrar loading
      expect(screen.getByText(/buscando cep/i)).toBeInTheDocument();
      
      // Aguarda resolução
      await waitFor(() => {
        expect(screen.queryByText(/buscando cep/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Formatação de campos', () => {
    it('deve formatar CPF conforme digitação', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      const cpfInput = screen.getByLabelText(/cpf/i);
      await user.type(cpfInput, '11144477735');
      
      // Verifica se a formatação foi aplicada
      expect(cpfInput.value).toBe('111.444.777-35');
    });

    it('deve formatar CNPJ conforme digitação', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      // Muda para PJ
      const pjButton = screen.getByRole('button', { name: /pessoa jurídica/i });
      await user.click(pjButton);
      
      const cnpjInput = screen.getByLabelText(/cnpj/i);
      await user.type(cnpjInput, '11222333000181');
      
      expect(cnpjInput.value).toBe('11.222.333/0001-81');
    });

    it('deve formatar telefone conforme digitação', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      const phoneInput = screen.getByLabelText(/telefone/i);
      await user.type(phoneInput, '51999991234');
      
      expect(phoneInput.value).toBe('(51) 99999-1234');
    });

    it('deve formatar CEP conforme digitação', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      const cepInput = screen.getByLabelText(/cep/i);
      await user.type(cepInput, '97010123');
      
      expect(cepInput.value).toBe('97010-123');
    });
  });

  describe('Submissão do formulário', () => {
    it('deve criar cliente PF com sucesso', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      // Preenche formulário PF
      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
      await user.type(screen.getByLabelText(/email/i), 'joao@test.com');
      await user.type(screen.getByLabelText(/cpf/i), '11144477735');
      await user.type(screen.getByLabelText(/telefone/i), '51999991234');
      
      const submitButton = screen.getByRole('button', { name: /criar cliente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreateCustomer).toHaveBeenCalledWith({
          name: 'João Silva',
          email: 'joao@test.com',
          user_type: 'cliente_pf',
          cpf_cnpj: '11144477735',
          phone: '51999991234',
          address: '',
          neighborhood: '',
          city: '',
          state: '',
          zip_code: '',
          observacao: ''
        });
      });
      
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('deve criar cliente PJ com sucesso', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      // Muda para PJ
      const pjButton = screen.getByRole('button', { name: /pessoa jurídica/i });
      await user.click(pjButton);
      
      // Preenche formulário PJ
      await user.type(screen.getByLabelText(/nome do responsável/i), 'Maria Santos');
      await user.type(screen.getByLabelText(/email/i), 'maria@empresa.com');
      await user.type(screen.getByLabelText(/cnpj/i), '11222333000181');
      await user.type(screen.getByLabelText(/razão social/i), 'Empresa Teste Ltda');
      await user.selectOptions(screen.getByLabelText(/segmento/i), 'cafeteria');
      await user.type(screen.getByLabelText(/telefone/i), '51988885555');
      
      const submitButton = screen.getByRole('button', { name: /criar cliente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreateCustomer).toHaveBeenCalledWith({
          name: 'Maria Santos',
          email: 'maria@empresa.com',
          user_type: 'cliente_pj',
          cpf_cnpj: '11222333000181',
          company_name: 'Empresa Teste Ltda',
          company_segment: 'cafeteria',
          phone: '51988885555',
          address: '',
          neighborhood: '',
          city: '',
          state: '',
          zip_code: '',
          observacao: ''
        });
      });
    });

    it('deve exibir erro ao falhar na criação', async () => {
      const user = userEvent.setup();
      mockCreateCustomer.mockResolvedValue({
        success: false,
        error: 'Email já existe'
      });
      
      render(<CustomerCreateModal {...defaultProps} />);
      
      // Preenche dados válidos
      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
      await user.type(screen.getByLabelText(/email/i), 'joao@test.com');
      
      const submitButton = screen.getByRole('button', { name: /criar cliente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email já existe/i)).toBeInTheDocument();
      });
    });

    it('deve mostrar loading durante submissão', async () => {
      const user = userEvent.setup();
      mockCreateCustomer.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      render(<CustomerCreateModal {...defaultProps} />);
      
      // Preenche dados mínimos
      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
      await user.type(screen.getByLabelText(/email/i), 'joao@test.com');
      
      const submitButton = screen.getByRole('button', { name: /criar cliente/i });
      await user.click(submitButton);
      
      // Deve mostrar loading
      expect(screen.getByText(/criando/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Aguarda resolução
      await waitFor(() => {
        expect(screen.queryByText(/criando/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Interações do modal', () => {
    it('deve fechar modal ao clicar no X', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: /fechar/i });
      await user.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('deve fechar modal ao clicar em Cancelar', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('deve fechar modal ao pressionar Escape', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('deve limpar formulário ao fechar e reabrir', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<CustomerCreateModal {...defaultProps} />);
      
      // Preenche alguns campos
      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
      await user.type(screen.getByLabelText(/email/i), 'joao@test.com');
      
      // Fecha modal
      rerender(<CustomerCreateModal {...defaultProps} isOpen={false} />);
      
      // Reabre modal
      rerender(<CustomerCreateModal {...defaultProps} isOpen={true} />);
      
      // Campos devem estar limpos
      expect(screen.getByLabelText(/nome completo/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels corretos para todos os campos', () => {
      render(<CustomerCreateModal {...defaultProps} />);
      
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    });

    it('deve ter estrutura de heading adequada', () => {
      render(<CustomerCreateModal {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { name: /criar novo cliente/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });

    it('deve ter role de dialog', () => {
      render(<CustomerCreateModal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('deve ter aria-describedby para mensagens de erro', async () => {
      const user = userEvent.setup();
      render(<CustomerCreateModal {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /criar cliente/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/nome completo/i);
        expect(nameInput).toHaveAttribute('aria-describedby');
      });
    });
  });
}); 