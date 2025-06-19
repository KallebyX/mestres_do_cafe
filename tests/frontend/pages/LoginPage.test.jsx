import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../../../src/pages/LoginPage'
import AuthContext from '../../../src/contexts/AuthContext'

// Mock do useNavigate
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  const mockLogin = vi.fn()
  
  const mockAuthContextValue = {
    user: null,
    isAuthenticated: false,
    login: mockLogin,
    logout: vi.fn(),
    register: vi.fn(),
    loading: false
  }

  const renderWithContext = (contextValue = mockAuthContextValue) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={contextValue}>
          <LoginPage />
        </AuthContext.Provider>
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização básica', () => {
    it('deve renderizar todos os elementos principais da página', () => {
      renderWithContext()
      
      // Verificar título principal
      expect(screen.getByText('Bem-vindo de volta!')).toBeInTheDocument()
      
      // Verificar subtítulo
      expect(screen.getByText('Acesse sua conta e explore nossos cafés especiais')).toBeInTheDocument()
      
      // Verificar formulário
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /entrar na conta/i })).toBeInTheDocument()
      
      // Verificar links
      expect(screen.getByText(/esqueci minha senha/i)).toBeInTheDocument()
      expect(screen.getByText(/cadastre-se gratuitamente/i)).toBeInTheDocument()
      expect(screen.getByText(/voltar ao início/i)).toBeInTheDocument()
    })

    it('deve renderizar o logo e marca da empresa', () => {
      renderWithContext()
      
      // Verificar presença da marca
      expect(screen.getAllByText('Mestres do Café')).toHaveLength(2) // Desktop e mobile
      expect(screen.getByText('Cafés especiais certificados SCA')).toBeInTheDocument()
    })

    it('deve renderizar as features na coluna lateral', () => {
      renderWithContext()
      
      expect(screen.getByText('Cafés Premium')).toBeInTheDocument()
      expect(screen.getByText('Seleção exclusiva de grãos especiais certificados SCA')).toBeInTheDocument()
      
      expect(screen.getByText('Compra Segura')).toBeInTheDocument()
      expect(screen.getByText('Transações protegidas e dados seguros')).toBeInTheDocument()
      
      expect(screen.getByText('Qualidade Garantida')).toBeInTheDocument()
      expect(screen.getByText('Torrefação artesanal e frescor em cada entrega')).toBeInTheDocument()
    })

    it('deve renderizar o depoimento do cliente', () => {
      renderWithContext()
      
      expect(screen.getByText(/a melhor experiência em café especial/i)).toBeInTheDocument()
      expect(screen.getByText('Maria Silva')).toBeInTheDocument()
      expect(screen.getByText('Cliente há 2 anos')).toBeInTheDocument()
    })
  })

  describe('Funcionalidade do formulário', () => {
    it('deve permitir inserir dados nos campos de input', () => {
      renderWithContext()
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('deve alternar visibilidade da senha ao clicar no ícone', () => {
      renderWithContext()
      
      const passwordInput = screen.getByLabelText(/senha/i)
      const toggleButton = screen.getByRole('button', { name: '' }) // Botão sem texto
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('deve submeter o formulário com dados válidos', async () => {
      mockLogin.mockResolvedValue({ success: true })
      
      renderWithContext()
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      const submitButton = screen.getByRole('button', { name: /entrar na conta/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('deve navegar para marketplace após login bem-sucedido', async () => {
      mockLogin.mockResolvedValue({ success: true })
      
      renderWithContext()
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      const submitButton = screen.getByRole('button', { name: /entrar na conta/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/marketplace')
      })
    })

    it('deve mostrar erro quando login falhar', async () => {
      mockLogin.mockResolvedValue({ 
        success: false, 
        error: 'Credenciais inválidas' 
      })
      
      renderWithContext()
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      const submitButton = screen.getByRole('button', { name: /entrar na conta/i })
      
      fireEvent.change(emailInput, { target: { value: 'invalid@email.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
      })
    })

    it('deve mostrar loading durante submit', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), 100)
      }))
      
      renderWithContext()
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      const submitButton = screen.getByRole('button', { name: /entrar na conta/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Entrando...')).toBeInTheDocument()
      })
    })
  })

  describe('Navegação e Links', () => {
    it('deve ter link para página de cadastro', () => {
      renderWithContext()
      
      const registerLink = screen.getByText(/cadastre-se gratuitamente/i)
      expect(registerLink).toHaveAttribute('href', '/registro')
    })

    it('deve ter link para recuperação de senha', () => {
      renderWithContext()
      
      const forgotPasswordLink = screen.getByText(/esqueci minha senha/i)
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
    })

    it('deve ter link para voltar ao início', () => {
      renderWithContext()
      
      const homeLink = screen.getByText(/voltar ao início/i)
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })

  describe('Componentes de UI', () => {
    it('deve ter checkbox "Lembrar de mim"', () => {
      renderWithContext()
      
      const checkbox = screen.getByLabelText(/lembrar de mim/i)
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })

    it('deve renderizar indicadores de confiança', () => {
      renderWithContext()
      
      expect(screen.getByText('SSL Seguro')).toBeInTheDocument()
      expect(screen.getByText('SCA Certificado')).toBeInTheDocument()
      expect(screen.getByText('Premium')).toBeInTheDocument()
    })

    it('deve limpar erro quando usuário digitar', async () => {
      mockLogin.mockResolvedValue({ 
        success: false, 
        error: 'Erro de teste' 
      })
      
      renderWithContext()
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      const submitButton = screen.getByRole('button', { name: /entrar na conta/i })
      
      // Preencher campos e submeter para gerar erro
      fireEvent.change(emailInput, { target: { value: 'test@email.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Erro de teste')).toBeInTheDocument()
      })
      
      // Digitar deve limpar o erro
      fireEvent.change(emailInput, { target: { value: 'novo@email.com' } })
      
      await waitFor(() => {
        expect(screen.queryByText('Erro de teste')).not.toBeInTheDocument()
      })
    })
  })

  describe('Responsividade', () => {
    it('deve mostrar logo mobile em telas pequenas', () => {
      renderWithContext()
      
      // O logo mobile está sempre renderizado, mas oculto por CSS em desktop
      const logos = screen.getAllByText('Mestres do Café')
      expect(logos.length).toBeGreaterThanOrEqual(1)
    })

    it('deve manter funcionalidade em diferentes tamanhos de tela', () => {
      renderWithContext()
      
      // Verificar elementos essenciais independente do tamanho da tela
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /entrar na conta/i })).toBeInTheDocument()
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter campos com labels apropriados', () => {
      renderWithContext()
      
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/lembrar de mim/i)).toBeInTheDocument()
    })

    it('deve ter estrutura semântica adequada', () => {
      renderWithContext()
      
      // Verificar que existe um formulário (pode não ter role="form" explícito)
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
      
      // Verificar campos de entrada
      expect(screen.getByRole('textbox', { name: /e-mail/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    })

    it('deve ter botão de submit acessível', () => {
      renderWithContext()
      
      const submitButton = screen.getByRole('button', { name: /entrar na conta/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('deve ter mensagens de erro acessíveis quando exibidas', async () => {
      mockLogin.mockResolvedValue({ 
        success: false, 
        error: 'Erro de autenticação' 
      })
      
      renderWithContext()
      
      const emailInput = screen.getByLabelText(/e-mail/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      const submitButton = screen.getByRole('button', { name: /entrar na conta/i })
      
      // Preencher campos e submeter para gerar erro
      fireEvent.change(emailInput, { target: { value: 'test@email.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        const errorElement = screen.getByText('Erro de autenticação')
        expect(errorElement).toBeInTheDocument()
      })
    })

    it('deve ter placeholders descritivos', () => {
      renderWithContext()
      
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument()
    })
  })
}) 