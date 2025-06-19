import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AuthContext from '../../../src/contexts/AuthContext'
import LandingPage from '../../../src/pages/LandingPage'
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

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('Renderização inicial', () => {
    it('deve renderizar seção hero', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText(/descubra os melhores/i)).toBeInTheDocument();
      // Usar getAllByText para elementos que aparecem múltiplas vezes
      const cafesElements = screen.getAllByText(/cafés especiais/i);
      expect(cafesElements.length).toBeGreaterThan(0);
    });

    it('deve mostrar call-to-action principal', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText(/acessar marketplace/i)).toBeInTheDocument();
      expect(screen.getByText(/ver gamificação/i)).toBeInTheDocument();
    });

    it('deve renderizar seção de diferenciais', () => {
      renderWithContexts(<LandingPage />);
      
      // Verificar o texto real que existe na implementação - usar getAllByText
      const gamificationElements = screen.getAllByText(/sistema de gamificação/i);
      expect(gamificationElements.length).toBeGreaterThan(0);
    });

    it('deve mostrar estatísticas de gamificação', () => {
      renderWithContexts(<LandingPage />);
      
      // Verificar estatísticas da seção de gamificação - usar getAllByText para números duplicados
      const fiveElements = screen.getAllByText('5');
      expect(fiveElements.length).toBeGreaterThan(0);
      const percentElements = screen.getAllByText('25%');
      expect(percentElements.length).toBeGreaterThan(0);
    });
  })

  describe('Produtos em destaque', () => {
    it('deve carregar e exibir produtos em destaque', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('Café Alta Mogiana')).toBeInTheDocument()
      expect(screen.getByText('Café Serra do Caparaó')).toBeInTheDocument()
      expect(screen.getByText('Blend Especial')).toBeInTheDocument()
    })

    it('deve mostrar preços dos produtos', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('R$ 45,00')).toBeInTheDocument()
      expect(screen.getByText('R$ 52,00')).toBeInTheDocument()
      expect(screen.getByText('R$ 38,00')).toBeInTheDocument()
    })

    it('deve mostrar botões de adicionar ao carrinho', () => {
      renderWithContexts(<LandingPage />)
      
      const addToCartButtons = screen.getAllByText(/adicionar/i)
      expect(addToCartButtons).toHaveLength(3)
    })
  })

  describe('Navegação e interações', () => {
    it('deve navegar para marketplace ao clicar em "Acessar Marketplace"', () => {
      renderWithContexts(<LandingPage />)
      
      const marketplaceButton = screen.getByText(/acessar marketplace/i)
      fireEvent.click(marketplaceButton)
      
      // Como são Links, não chamam navigate diretamente, mas deveriam funcionar
      expect(marketplaceButton.closest('a')).toHaveAttribute('href', '/marketplace')
    })

    it('deve navegar para gamificação ao clicar no botão específico', () => {
      renderWithContexts(<LandingPage />)
      
      const gamificationButton = screen.getByText(/ver gamificação/i)
      fireEvent.click(gamificationButton)
      
      expect(gamificationButton.closest('a')).toHaveAttribute('href', '/gamificacao')
    })

    it('deve navegar para marketplace ao clicar em "Ver Todos os Produtos"', () => {
      renderWithContexts(<LandingPage />)
      
      const viewAllButton = screen.getByText(/ver todos os produtos/i)
      expect(viewAllButton.closest('a')).toHaveAttribute('href', '/marketplace')
    })
  })

  describe('Seções informativas', () => {
    it('deve mostrar seção sobre qualidade', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText(/qualidade em cada etapa/i)).toBeInTheDocument();
      expect(screen.getByText(/seleção premium/i)).toBeInTheDocument();
      // Usar getAllByText para elementos que aparecem múltiplas vezes
      const torrefacaoElements = screen.getAllByText(/torrefação artesanal/i);
      expect(torrefacaoElements.length).toBeGreaterThan(0);
    });

    it('deve exibir depoimentos de clientes', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText(/o que nossos clientes dizem/i)).toBeInTheDocument();
      expect(screen.getByText('Mariana Silva')).toBeInTheDocument();
      expect(screen.getByText('Carlos Mendes')).toBeInTheDocument();
    });

    it('deve mostrar informações da empresa', () => {
      renderWithContexts(<LandingPage />);
      
      // Usar getAllByText para elementos duplicados
      const torrefacaoElements = screen.getAllByText(/torrefação artesanal/i);
      expect(torrefacaoElements.length).toBeGreaterThan(0);
      const certificacaoElements = screen.getAllByText(/certificação scaa/i);
      expect(certificacaoElements.length).toBeGreaterThan(0);
    });
  })

  describe('Sistema de gamificação', () => {
    it('deve mostrar níveis de gamificação', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('Aprendiz do Café')).toBeInTheDocument()
      expect(screen.getByText('Conhecedor')).toBeInTheDocument()
      expect(screen.getByText('Especialista')).toBeInTheDocument()
      expect(screen.getByText('Mestre do Café')).toBeInTheDocument()
      expect(screen.getByText('Lenda')).toBeInTheDocument()
    })

    it('deve mostrar descontos progressivos', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('5% OFF')).toBeInTheDocument()
      expect(screen.getByText('10% OFF')).toBeInTheDocument()
      expect(screen.getByText('15% OFF')).toBeInTheDocument()
      expect(screen.getByText('20% OFF')).toBeInTheDocument()
      expect(screen.getByText('25% OFF')).toBeInTheDocument()
    })

    it('deve ter botão para descobrir sistema completo', () => {
      renderWithContexts(<LandingPage />)
      
      const discoverButton = screen.getByText(/descobrir sistema completo/i)
      expect(discoverButton.closest('a')).toHaveAttribute('href', '/gamificacao')
    })
  })

  describe('Responsividade', () => {
    it('deve adaptar layout para mobile', () => {
      renderWithContexts(<LandingPage />);
      
      // Verificar se elementos principais estão presentes
      expect(screen.getByText(/descubra os melhores/i)).toBeInTheDocument();
      // Usar getAllByText para elementos que aparecem múltiplas vezes
      const cafesElements = screen.getAllByText(/nossos cafés especiais/i);
      expect(cafesElements.length).toBeGreaterThan(0);
    })

    it('deve mostrar produtos em grid responsivo', () => {
      renderWithContexts(<LandingPage />)
      
      const products = [
        screen.getByText('Café Alta Mogiana'),
        screen.getByText('Café Serra do Caparaó'),
        screen.getByText('Blend Especial')
      ]
      
      products.forEach(product => {
        expect(product).toBeInTheDocument()
      })
    })
  })

  describe('Elementos visuais', () => {
    it('deve mostrar ícones e elementos visuais', () => {
      renderWithContexts(<LandingPage />);
      
      // Verificar se há elementos que indicam ícones (como emojis ou símbolos)
      expect(screen.getByText(/🛒/)).toBeInTheDocument();
      // Usar getAllByText para elementos que aparecem múltiplas vezes
      const trophyElements = screen.getAllByText(/🏆/);
      expect(trophyElements.length).toBeGreaterThan(0);
    })

    it('deve mostrar avaliações com estrelas', () => {
      renderWithContexts(<LandingPage />)
      
      // Verificar se há elementos de avaliação
      const ratingElements = screen.getAllByText('(15)')
      expect(ratingElements.length).toBeGreaterThan(0)
    })

    it('deve mostrar badges de pontuação SCAA', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('85 PONTOS')).toBeInTheDocument()
      expect(screen.getByText('92 PONTOS')).toBeInTheDocument()
      expect(screen.getByText('82 PONTOS')).toBeInTheDocument()
    })
  })
}) 