import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import Header from '@/components/Header'

// Mock da API real
let mockApiResponse = null
global.fetch = vi.fn().mockImplementation((url, options) => {
  const mockResponses = {
    'http://localhost:5000/api/auth/login': {
      success: true,
      data: {
        access_token: 'mock-jwt-token',
        user: {
          id: 1,
          name: 'João Silva',
          email: 'joao@test.com',
          user_type: 'cliente_pf'
        },
        message: 'Login realizado com sucesso'
      }
    },
    'http://localhost:5000/api/auth/register': {
      success: true,
      data: {
        access_token: 'mock-jwt-token',
        user: {
          id: 2,
          name: 'Maria Santos',
          email: 'maria@test.com',
          user_type: 'cliente_pf',
          points: 100
        },
        welcome_points: 100,
        message: 'Usuário criado com sucesso! Você ganhou 100 pontos de boas-vindas!'
      }
    },
    'http://localhost:5000/api/auth/verify-token': {
      valid: true,
      user: {
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com',
        user_type: 'cliente_pf'
      }
    }
  }

  const response = mockApiResponse || mockResponses[url]
  
  return Promise.resolve({
    ok: response?.success !== false,
    status: response?.success === false ? 400 : 200,
    json: () => Promise.resolve(response?.success === false ? { error: response.error } : response)
  })
})

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {component}
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Authentication Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiResponse = null
    localStorage.clear()
  })

  describe('Login Flow', () => {
    it('deve realizar login completo com sucesso', async () => {
      renderWithProviders(<LoginPage />)

      // Preencher formulário
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      fireEvent.change(emailInput, { target: { value: 'joao@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'senha123' } })

      // Submeter formulário
      fireEvent.click(submitButton)

      // Verificar loading
      expect(screen.getByText(/carregando/i)).toBeInTheDocument()

      // Aguardar sucesso
      await waitFor(() => {
        expect(screen.getByText(/login realizado com sucesso/i)).toBeInTheDocument()
      })

      // Verificar se token foi salvo
      expect(localStorage.getItem('access_token')).toBe('mock-jwt-token')
      expect(localStorage.getItem('user')).toContain('João Silva')
    })

    it('deve mostrar erro para credenciais inválidas', async () => {
      mockApiResponse = {
        success: false,
        error: 'Email ou senha incorretos'
      }

      renderWithProviders(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      fireEvent.change(emailInput, { target: { value: 'joao@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'senhaerrada' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email ou senha incorretos/i)).toBeInTheDocument()
      })

      // Verificar que não salvou dados
      expect(localStorage.getItem('access_token')).toBeNull()
    })

    it('deve validar campos obrigatórios', async () => {
      renderWithProviders(<LoginPage />)

      const submitButton = screen.getByRole('button', { name: /entrar/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument()
        expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
      })
    })
  })

  describe('Register Flow', () => {
    it('deve realizar cadastro PF completo', async () => {
      renderWithProviders(<RegisterPage />)

      // Passo 1: Informações básicas
      const nameInput = screen.getByLabelText(/nome completo/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^senha/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)

      fireEvent.change(nameInput, { target: { value: 'Maria Santos' } })
      fireEvent.change(emailInput, { target: { value: 'maria@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'senha123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'senha123' } })

      // Selecionar tipo de usuário
      const pfRadio = screen.getByLabelText(/pessoa física/i)
      fireEvent.click(pfRadio)

      // Avançar para próximo passo
      const nextButton = screen.getByText(/continuar/i)
      fireEvent.click(nextButton)

      // Passo 2: Dados pessoais
      await waitFor(() => {
        expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument()
      })

      const cpfInput = screen.getByLabelText(/cpf/i)
      const phoneInput = screen.getByLabelText(/telefone/i)
      const addressInput = screen.getByLabelText(/endereço/i)
      const cityInput = screen.getByLabelText(/cidade/i)
      const stateSelect = screen.getByLabelText(/estado/i)
      const zipInput = screen.getByLabelText(/cep/i)

      fireEvent.change(cpfInput, { target: { value: '111.444.777-35' } })
      fireEvent.change(phoneInput, { target: { value: '(11) 99999-9999' } })
      fireEvent.change(addressInput, { target: { value: 'Rua Teste, 123' } })
      fireEvent.change(cityInput, { target: { value: 'São Paulo' } })
      fireEvent.change(stateSelect, { target: { value: 'SP' } })
      fireEvent.change(zipInput, { target: { value: '01234-567' } })

      // Finalizar cadastro
      const registerButton = screen.getByRole('button', { name: /criar conta/i })
      fireEvent.click(registerButton)

      // Verificar sucesso
      await waitFor(() => {
        expect(screen.getByText(/usuário criado com sucesso/i)).toBeInTheDocument()
        expect(screen.getByText(/100 pontos de boas-vindas/i)).toBeInTheDocument()
      })

      // Verificar dados salvos
      expect(localStorage.getItem('access_token')).toBe('mock-jwt-token')
      expect(localStorage.getItem('user')).toContain('Maria Santos')
    })

    it('deve validar CPF em tempo real', async () => {
      renderWithProviders(<RegisterPage />)

      // Navegar para step 2
      const pfRadio = screen.getByLabelText(/pessoa física/i)
      fireEvent.click(pfRadio)
      
      fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Test' } })
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } })
      fireEvent.change(screen.getByLabelText(/^senha/i), { target: { value: 'senha123' } })
      fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'senha123' } })

      const nextButton = screen.getByText(/continuar/i)
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument()
      })

      // CPF inválido
      const cpfInput = screen.getByLabelText(/cpf/i)
      fireEvent.change(cpfInput, { target: { value: '111.444.777-34' } })
      fireEvent.blur(cpfInput)

      await waitFor(() => {
        expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument()
      })

      // CPF válido
      fireEvent.change(cpfInput, { target: { value: '111.444.777-35' } })
      fireEvent.blur(cpfInput)

      await waitFor(() => {
        expect(screen.queryByText(/cpf inválido/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Header Integration', () => {
    it('deve atualizar header após login', async () => {
      // Renderizar header sem usuário
      renderWithProviders(<Header />)

      expect(screen.getByText(/entrar/i)).toBeInTheDocument()
      expect(screen.getByText(/cadastrar/i)).toBeInTheDocument()

      // Simular login bem-sucedido
      localStorage.setItem('access_token', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com'
      }))

      // Re-renderizar para refletir mudanças
      renderWithProviders(<Header />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
        expect(screen.queryByText(/entrar/i)).not.toBeInTheDocument()
      })
    })

    it('deve mostrar menu do usuário quando logado', async () => {
      localStorage.setItem('access_token', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com',
        user_type: 'cliente_pf'
      }))

      renderWithProviders(<Header />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      // Clicar no nome do usuário
      const userButton = screen.getByText('João Silva')
      fireEvent.click(userButton)

      expect(screen.getByText(/meu perfil/i)).toBeInTheDocument()
      expect(screen.getByText(/pedidos/i)).toBeInTheDocument()
      expect(screen.getByText(/sair/i)).toBeInTheDocument()
    })
  })

  describe('Token Verification', () => {
    it('deve verificar token válido ao carregar página', async () => {
      localStorage.setItem('access_token', 'mock-jwt-token')

      renderWithProviders(<Header />)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/auth/verify-token',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-jwt-token'
            })
          })
        )
      })
    })

    it('deve limpar dados para token inválido', async () => {
      localStorage.setItem('access_token', 'invalid-token')
      
      mockApiResponse = {
        success: false,
        error: 'Token inválido'
      }

      renderWithProviders(<Header />)

      await waitFor(() => {
        expect(localStorage.getItem('access_token')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
      })
    })
  })

  describe('Error Handling', () => {
    it('deve lidar com erro de rede', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      renderWithProviders(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      fireEvent.change(emailInput, { target: { value: 'joao@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'senha123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar mensagem genérica para erro desconhecido', async () => {
      mockApiResponse = {
        success: false,
        error: 'Erro interno do servidor'
      }

      renderWithProviders(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      fireEvent.change(emailInput, { target: { value: 'joao@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'senha123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/erro interno do servidor/i)).toBeInTheDocument()
      })
    })
  })
}) 