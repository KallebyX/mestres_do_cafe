import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AccountActivationPage from '../../../src/pages/AccountActivationPage';

// Mock do contexto de autenticação
const mockActivateAccount = vi.fn();
const mockNavigate = vi.fn();

// Mock do React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock do contexto de autenticação
vi.mock('../../../src/contexts/SupabaseAuthContext', () => ({
  useSupabaseAuth: () => ({
    user: {
      id: 'user-123',
      email: 'joao@test.com',
      name: 'João Silva',
      pendente_ativacao: true
    }),
    loading: false,
    error: null,
    activateAdminCreatedAccount: mockActivateAccount
  })
}));

const Wrapper = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

describe('AccountActivationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockActivateAccount.mockResolvedValue({
      success: true,
      message: 'Conta ativada com sucesso!'
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Renderização inicial', () => {
    it('deve renderizar título e elementos principais', () => {
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      expect(screen.getByText('🔐 Ative sua Conta')).toBeInTheDocument();
      expect(screen.getByText('Defina sua senha para acessar o sistema')).toBeInTheDocument();
      expect(screen.getByText(/sua conta foi criada pelo administrador/i)).toBeInTheDocument();
    });

    it('deve renderizar formulário de ativação', () => {
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ativar conta/i })).toBeInTheDocument();
    });

    it('deve exibir informações do usuário', () => {
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('joao@test.com')).toBeInTheDocument();
    });

    it('deve exibir dicas de segurança', () => {
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      expect(screen.getByText(/sua senha deve conter/i)).toBeInTheDocument();
      expect(screen.getByText(/pelo menos 8 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/uma letra maiúscula/i)).toBeInTheDocument();
      expect(screen.getByText(/um número/i)).toBeInTheDocument();
      expect(screen.getByText(/um caractere especial/i)).toBeInTheDocument();
    });
  });

  describe('Validação de senha', () => {
    it('deve validar senha muito curta', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      await user.type(passwordInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/senha deve ter pelo menos 8 caracteres/i)).toBeInTheDocument();
      });
    });

    it('deve validar senha sem letra maiúscula', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      await user.type(passwordInput, 'senha123!');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/senha deve conter pelo menos uma letra maiúscula/i)).toBeInTheDocument();
      });
    });

    it('deve validar senha sem número', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      await user.type(passwordInput, 'MinhaSenh@');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/senha deve conter pelo menos um número/i)).toBeInTheDocument();
      });
    });

    it('deve validar senha sem caractere especial', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      await user.type(passwordInput, 'MinhaSenha123');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/senha deve conter pelo menos um caractere especial/i)).toBeInTheDocument();
      });
    });

    it('deve validar confirmação de senha diferente', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const confirmInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(passwordInput, 'MinhaSenha123!');
      await user.type(confirmInput, 'OutraSenha456@');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument();
      });
    });

    it('deve aceitar senha válida', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const confirmInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(passwordInput, 'MinhaSenha123!');
      await user.type(confirmInput, 'MinhaSenha123!');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockActivateAccount).toHaveBeenCalledWith('MinhaSenha123!');
      });
    });
  });

  describe('Indicador de força da senha', () => {
    it('deve mostrar força fraca para senha simples', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      await user.type(passwordInput, '123');
      
      await waitFor(() => {
        expect(screen.getByText(/fraca/i)).toBeInTheDocument();
        expect(screen.getByText(/fraca/i)).toHaveClass('text-red-600');
      });
    });

    it('deve mostrar força média para senha parcialmente segura', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      await user.type(passwordInput, 'Senha123');
      
      await waitFor(() => {
        expect(screen.getByText(/média/i)).toBeInTheDocument();
        expect(screen.getByText(/média/i)).toHaveClass('text-yellow-600');
      });
    });

    it('deve mostrar força forte para senha segura', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      await user.type(passwordInput, 'MinhaSenha123!');
      
      await waitFor(() => {
        expect(screen.getByText(/forte/i)).toBeInTheDocument();
        expect(screen.getByText(/forte/i)).toHaveClass('text-green-600');
      });
    });

    it('deve atualizar indicador em tempo real', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      
      // Senha fraca
      await user.type(passwordInput, '123');
      await waitFor(() => {
        expect(screen.getByText(/fraca/i)).toBeInTheDocument();
      });
      
      // Adiciona mais caracteres para tornar média
      await user.type(passwordInput, 'abc');
      await waitFor(() => {
        expect(screen.getByText(/média/i)).toBeInTheDocument();
      });
      
      // Torna forte
      await user.clear(passwordInput);
      await user.type(passwordInput, 'MinhaSenha123!');
      await waitFor(() => {
        expect(screen.getByText(/forte/i)).toBeInTheDocument();
      });
    });
  });

  describe('Submissão do formulário', () => {
    it('deve ativar conta com sucesso', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const confirmInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(passwordInput, 'MinhaSenha123!');
      await user.type(confirmInput, 'MinhaSenha123!');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockActivateAccount).toHaveBeenCalledWith('MinhaSenha123!');
        expect(screen.getByText(/conta ativada com sucesso/i)).toBeInTheDocument();
      });
      
      // Deve redirecionar
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/marketplace');
      });
    });

    it('deve mostrar loading durante ativação', async () => {
      const user = userEvent.setup();
      
      // Mock que demora para resolver
      mockActivateAccount.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const confirmInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(passwordInput, 'MinhaSenha123!');
      await user.type(confirmInput, 'MinhaSenha123!');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      // Deve mostrar loading
      expect(screen.getByText(/ativando/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Aguarda resolução
      await waitFor(() => {
        expect(screen.queryByText(/ativando/i)).not.toBeInTheDocument();
      });
    });

    it('deve exibir erro ao falhar na ativação', async () => {
      const user = userEvent.setup();
      mockActivateAccount.mockResolvedValue({
        success: false,
        error: 'Erro ao ativar conta'
      });
      
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const confirmInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(passwordInput, 'MinhaSenha123!');
      await user.type(confirmInput, 'MinhaSenha123!');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/erro ao ativar conta/i)).toBeInTheDocument();
      });
    });

    it('deve tratar erro de rede', async () => {
      const user = userEvent.setup();
      mockActivateAccount.mockRejectedValue(new Error('Network error'));
      
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const confirmInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(passwordInput, 'MinhaSenha123!');
      await user.type(confirmInput, 'MinhaSenha123!');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument();
      });
    });
  });

  describe('Interações do formulário', () => {
    it('deve alternar visibilidade da senha', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const toggleButton = screen.getAllByRole('button', { name: /mostrar\/ocultar senha/i })[0];
      
      // Inicialmente deve ser password
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Clica para mostrar
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Clica para ocultar
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('deve alternar visibilidade da confirmação de senha', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const confirmInput = screen.getByLabelText(/confirmar senha/i);
      const toggleButton = screen.getAllByRole('button', { name: /mostrar\/ocultar senha/i })[1];
      
      // Inicialmente deve ser password
      expect(confirmInput).toHaveAttribute('type', 'password');
      
      // Clica para mostrar
      await user.click(toggleButton);
      expect(confirmInput).toHaveAttribute('type', 'text');
    });

    it('deve limpar erros ao corrigir campos', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const confirmInput = screen.getByLabelText(/confirmar senha/i);
      
      // Cria erro
      await user.type(passwordInput, 'MinhaSenha123!');
      await user.type(confirmInput, 'OutraSenha456@');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument();
      });
      
      // Corrige erro
      await user.clear(confirmInput);
      await user.type(confirmInput, 'MinhaSenha123!');
      
      await waitFor(() => {
        expect(screen.queryByText(/senhas não coincidem/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Checklist de requisitos', () => {
    it('deve mostrar checklist de requisitos da senha', () => {
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      expect(screen.getByText(/pelo menos 8 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/uma letra maiúscula/i)).toBeInTheDocument();
      expect(screen.getByText(/um número/i)).toBeInTheDocument();
      expect(screen.getByText(/um caractere especial/i)).toBeInTheDocument();
    });

    it('deve marcar requisitos atendidos', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      await user.type(passwordInput, 'MinhaSenha123!');
      
      await waitFor(() => {
        // Todos os requisitos devem estar marcados como atendidos
        const checkmarks = screen.getAllByText('✅');
        expect(checkmarks).toHaveLength(4); // 4 requisitos
      });
    });

    it('deve mostrar X para requisitos não atendidos', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      await user.type(passwordInput, 'abc'); // Senha fraca
      
      await waitFor(() => {
        // Deve ter X para requisitos não atendidos
        const xMarks = screen.getAllByText('❌');
        expect(xMarks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Estados especiais', () => {
    it('deve mostrar estado sem usuário', () => {
      // Mock sem usuário
      vi.mocked(vi.importActual('../../../src/contexts/SupabaseAuthContext')).mockReturnValue({
        useSupabaseAuth: () => ({
          user: null,
          loading: false,
          error: null
        })
      });
      
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      expect(screen.getByText(/carregando dados do usuário/i)).toBeInTheDocument();
    });

    it('deve mostrar loading quando contexto está carregando', () => {
      vi.mocked(vi.importActual('../../../src/contexts/SupabaseAuthContext')).mockReturnValue({
        useSupabaseAuth: () => ({
          user: null,
          loading: true,
          error: null
        })
      });
      
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });

    it('deve mostrar erro do contexto', () => {
      vi.mocked(vi.importActual('../../../src/contexts/SupabaseAuthContext')).mockReturnValue({
        useSupabaseAuth: () => ({
          user: null,
          loading: false,
          error: 'Erro de autenticação'
        })
      });
      
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      expect(screen.getByText(/erro de autenticação/i)).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels adequados para todos os campos', () => {
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    });

    it('deve ter estrutura de heading apropriada', () => {
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const heading = screen.getByRole('heading', { name: /ative sua conta/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('deve ter aria-describedby para campos com erro', async () => {
      const user = userEvent.setup();
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const passwordInput = screen.getByLabelText(/nova senha/i);
      await user.type(passwordInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /ativar conta/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('aria-describedby');
      });
    });

    it('deve ter aria-live para mensagens dinâmicas', () => {
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      const strengthIndicator = screen.getByText(/força da senha/i).closest('[aria-live]');
      expect(strengthIndicator).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Responsividade', () => {
    it('deve adaptar layout para mobile', () => {
      // Mock viewport mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      // Elementos principais devem estar presentes
      expect(screen.getByText('🔐 Ative sua Conta')).toBeInTheDocument();
      expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument();
    });

    it('deve manter funcionalidade em telas pequenas', async () => {
      const user = userEvent.setup();
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320
      });
      
      render(<AccountActivationPage />, { wrapper: Wrapper });
      
      // Funcionalidade deve funcionar normalmente
      const passwordInput = screen.getByLabelText(/nova senha/i);
      await user.type(passwordInput, 'MinhaSenha123!');
      
      await waitFor(() => {
        expect(screen.getByText(/forte/i)).toBeInTheDocument();
      });
    });
  });
}); 