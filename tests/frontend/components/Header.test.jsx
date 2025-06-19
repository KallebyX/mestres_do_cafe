import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../../../src/components/Header'
import AuthContext from '../../../src/contexts/AuthContext'
import CartContext from '../../../src/contexts/CartContext'

// Mock do useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock dos contextos
const mockAuthContext = {
  user: null,
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: vi.fn(() => false),
  hasPermission: vi.fn(() => false)
};

const mockCartContext = {
  items: [],
  getCartCount: vi.fn(() => 0),
  addItem: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
  getTotal: vi.fn(() => 0)
};

// Componente helper para renderizar com contextos
const renderWithContexts = (component, authOverrides = {}, cartOverrides = {}) => {
  const authValue = { ...mockAuthContext, ...authOverrides };
  const cartValue = { ...mockCartContext, ...cartOverrides };
  
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <CartContext.Provider value={cartValue}>
          {component}
        </CartContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('Renderização básica', () => {
    it('deve renderizar o logo com título', () => {
      renderWithContexts(<Header />)
      
      expect(screen.getByText('Mestres do Café')).toBeInTheDocument()
      expect(screen.getByText('Torrefação Artesanal')).toBeInTheDocument()
    })

    it('deve renderizar links de navegação', () => {
      renderWithContexts(<Header />)
      
      expect(screen.getByRole('link', { name: /início/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /marketplace/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /gamificação/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /sobre/i })).toBeInTheDocument()
    })

    it('deve mostrar botões de login e registro quando não logado', () => {
      renderWithContexts(<Header />)
      
      expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /cadastrar/i })).toBeInTheDocument()
    })
  })

  describe('Estado do usuário logado', () => {
    it('deve mostrar botão do carrinho quando logado', () => {
      const loggedUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com'
      }
      
      renderWithContexts(<Header />, { user: loggedUser, isAuthenticated: () => true })
      
      const cartLink = screen.getByRole('link', { name: '🛒' })
      expect(cartLink).toBeInTheDocument()
    })

    it('deve mostrar menu do usuário quando logado', () => {
      const loggedUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com'
      }
      
      renderWithContexts(<Header />, { user: loggedUser, isAuthenticated: () => true })
      
      expect(screen.getByText('João')).toBeInTheDocument()
      expect(screen.getByText('JS')).toBeInTheDocument() // Iniciais
    })

    it('deve abrir dropdown do usuário ao clicar', () => {
      const loggedUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com'
      }
      
      renderWithContexts(<Header />, { user: loggedUser, isAuthenticated: () => true })
      
      const userButton = screen.getByText('João')
      fireEvent.click(userButton)
      
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument()
      expect(screen.getByText('Meus Pedidos')).toBeInTheDocument()
    })

    it('deve chamar logout ao clicar em Sair', () => {
      const mockLogout = vi.fn()
      const loggedUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com'
      }
      
      renderWithContexts(<Header />, { 
        user: loggedUser, 
        isAuthenticated: () => true,
        logout: mockLogout 
      })
      
      const userButton = screen.getByText('João')
      fireEvent.click(userButton)
      
      const logoutButton = screen.getByText('Sair')
      fireEvent.click(logoutButton)
      
      expect(mockLogout).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('deve mostrar contador do carrinho', () => {
      const loggedUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com'
      }
      
      renderWithContexts(<Header />, { 
        user: loggedUser, 
        isAuthenticated: () => true 
      }, { 
        getCartCount: () => 3 
      })
      
      expect(screen.getByText('3')).toBeInTheDocument() // Contador do carrinho
    })
  })

  describe('Responsividade', () => {
    it('deve mostrar botão de menu mobile', () => {
      renderWithContexts(<Header />)
      
      const mobileMenuButton = screen.getByRole('button')
      expect(mobileMenuButton).toBeInTheDocument()
    })

    it('deve alternar menu mobile ao clicar no botão', () => {
      renderWithContexts(<Header />)
      
      const mobileMenuButton = screen.getByRole('button')
      fireEvent.click(mobileMenuButton)
      
      // Verificar se o menu mobile expandiu mostrando links com emojis
      expect(screen.getByText('🏠 Início')).toBeInTheDocument()
      expect(screen.getByText('🛍️ Marketplace')).toBeInTheDocument()
      expect(screen.getByText('🏆 Gamificação')).toBeInTheDocument()
    })

    it('deve fechar menu mobile ao clicar em um link', () => {
      renderWithContexts(<Header />)
      
      const mobileMenuButton = screen.getByRole('button')
      fireEvent.click(mobileMenuButton)
      
      const homeLink = screen.getByText('🏠 Início')
      fireEvent.click(homeLink)
      
      // O menu deve fechar (links mobile não devem estar mais visíveis)
      expect(screen.queryByText('🏠 Início')).not.toBeInTheDocument()
    })
  })

  describe('Estados de loading', () => {
    it('deve mostrar estado normal quando não está carregando', () => {
      renderWithContexts(<Header />, { loading: false })
      
      expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /cadastrar/i })).toBeInTheDocument()
    })

    it('deve continuar mostrando botões mesmo durante loading (implementação atual)', () => {
      renderWithContexts(<Header />, { loading: true })
      
      // Na implementação atual, os botões ainda aparecem durante loading
      expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /cadastrar/i })).toBeInTheDocument()
    })
  })

  describe('Gamificação', () => {
    it('deve ter link para gamificação na navegação', () => {
      renderWithContexts(<Header />)
      
      const gamificationLink = screen.getByRole('link', { name: /gamificação/i })
      expect(gamificationLink).toBeInTheDocument()
      expect(gamificationLink).toHaveAttribute('href', '/gamificacao')
    })
  })
}) 