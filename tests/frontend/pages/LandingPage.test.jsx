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
    it('deve renderizar seção hero com texto principal', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Cafés Especiais')).toBeInTheDocument();
      expect(screen.getByText('Direto do Produtor')).toBeInTheDocument();
      expect(screen.getByText(/Descubra sabores únicos dos melhores cafés especiais do Brasil/i)).toBeInTheDocument();
    });

    it('deve mostrar call-to-action principal', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText(/explorar cafés/i)).toBeInTheDocument();
      expect(screen.getByText(/ver processo/i)).toBeInTheDocument();
    });

    it('deve renderizar estatísticas', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('1000+')).toBeInTheDocument();
      expect(screen.getByText('Clientes Satisfeitos')).toBeInTheDocument();
      expect(screen.getByText('50+')).toBeInTheDocument();
      expect(screen.getByText('Variedades Premium')).toBeInTheDocument();
    });

    it('deve mostrar avaliação dos clientes', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('4.9/5')).toBeInTheDocument();
      expect(screen.getByText('Avaliação dos Clientes')).toBeInTheDocument();
    });
  })

  describe('Seção de funcionalidades', () => {
    it('deve renderizar seção de qualidade', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Qualidade em Cada Detalhe')).toBeInTheDocument();
      expect(screen.getByText('Cafés Especiais Certificados')).toBeInTheDocument();
      expect(screen.getByText('Entrega Rápida e Segura')).toBeInTheDocument();
    });

    it('deve mostrar sistema de gamificação', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Sistema de Gamificação')).toBeInTheDocument();
      expect(screen.getByText(/Ganhe pontos a cada compra/i)).toBeInTheDocument();
    });

    it('deve mostrar compra segura', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Compra 100% Segura')).toBeInTheDocument();
      expect(screen.getByText(/Transações protegidas com SSL/i)).toBeInTheDocument();
    });
  })

  describe('Produtos em destaque', () => {
    it('deve carregar e exibir produtos em destaque', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('Bourbon Amarelo Premium')).toBeInTheDocument()
      expect(screen.getByText('Geisha Especial')).toBeInTheDocument()
      expect(screen.getByText('Blend Signature')).toBeInTheDocument()
    })

    it('deve mostrar preços dos produtos', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('R$ 45,90')).toBeInTheDocument()
      expect(screen.getByText('R$ 89,90')).toBeInTheDocument()
      expect(screen.getByText('R$ 39,90')).toBeInTheDocument()
    })

    it('deve mostrar botões de adicionar ao carrinho', () => {
      renderWithContexts(<LandingPage />)
      
      const addToCartButtons = screen.getAllByText(/adicionar/i)
      expect(addToCartButtons).toHaveLength(3)
    })

    it('deve mostrar badges dos produtos', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('Mais Vendido')).toBeInTheDocument()
      expect(screen.getByText('Premium')).toBeInTheDocument()
      expect(screen.getByText('Novo')).toBeInTheDocument()
    })
  })

  describe('Navegação e interações', () => {
    it('deve navegar para marketplace ao clicar em "Explorar Cafés"', () => {
      renderWithContexts(<LandingPage />)
      
      const marketplaceButton = screen.getByText(/explorar cafés/i)
      fireEvent.click(marketplaceButton)
      
      expect(marketplaceButton.closest('a')).toHaveAttribute('href', '/marketplace')
    })

    it('deve navegar para marketplace ao clicar em "Ver Todos os Cafés"', () => {
      renderWithContexts(<LandingPage />)
      
      const viewAllButton = screen.getByText(/ver todos os cafés/i)
      expect(viewAllButton.closest('a')).toHaveAttribute('href', '/marketplace')
    })

    it('deve navegar para registro ao clicar em "Criar Conta Grátis"', () => {
      renderWithContexts(<LandingPage />)
      
      const registerButton = screen.getByText(/criar conta grátis/i)
      expect(registerButton.closest('a')).toHaveAttribute('href', '/registro')
    })
  })

  describe('Seção de depoimentos', () => {
    it('deve exibir depoimentos de clientes', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText(/o que nossos clientes dizem/i)).toBeInTheDocument();
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.getByText('João Santos')).toBeInTheDocument();
      expect(screen.getByText('Ana Costa')).toBeInTheDocument();
    });

    it('deve mostrar roles dos clientes', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Empresária')).toBeInTheDocument();
      expect(screen.getByText('Chef')).toBeInTheDocument();
      expect(screen.getByText('Barista')).toBeInTheDocument();
    });

    it('deve mostrar comentários dos clientes', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText(/a qualidade dos cafés é excepcional/i)).toBeInTheDocument();
      expect(screen.getByText(/trabalho com café há 15 anos/i)).toBeInTheDocument();
    });
  })

  describe('Seção CTA final', () => {
    it('deve mostrar call-to-action final', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText(/comece sua jornada no/i)).toBeInTheDocument()
      expect(screen.getByText(/mundo dos cafés especiais/i)).toBeInTheDocument()
    })

    it('deve mostrar informações sobre pontos de boas-vindas', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText(/ganhe 100 pontos de boas-vindas/i)).toBeInTheDocument()
    })
  })

  describe('Responsividade', () => {
    it('deve adaptar layout para mobile', () => {
      renderWithContexts(<LandingPage />);
      
      // Verificar se elementos principais estão presentes
      expect(screen.getByText('Cafés Especiais')).toBeInTheDocument();
      expect(screen.getByText('Nossos Cafés Especiais')).toBeInTheDocument();
    })

    it('deve mostrar produtos em grid responsivo', () => {
      renderWithContexts(<LandingPage />)
      
      const products = [
        screen.getByText('Bourbon Amarelo Premium'),
        screen.getByText('Geisha Especial'),
        screen.getByText('Blend Signature')
      ]
      
      products.forEach(product => {
        expect(product).toBeInTheDocument()
      })
    })
  })

  describe('Elementos visuais e interações', () => {
    it('deve mostrar certificação SCA', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Certificação SCA')).toBeInTheDocument();
    })

    it('deve mostrar avaliações com estrelas nos produtos', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('4.8')).toBeInTheDocument()
      expect(screen.getByText('4.9')).toBeInTheDocument()
      expect(screen.getByText('4.7')).toBeInTheDocument()
    })

    it('deve mostrar descrições dos produtos', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('Notas de chocolate e caramelo')).toBeInTheDocument()
      expect(screen.getByText('Floral e cítrico excepcional')).toBeInTheDocument()
      expect(screen.getByText('Equilíbrio perfeito e cremoso')).toBeInTheDocument()
    })

    it('deve mostrar origens dos produtos', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('Montanhas de Minas')).toBeInTheDocument()
      expect(screen.getByText('Fazenda São Benedito')).toBeInTheDocument()
      expect(screen.getByText('Seleção Especial')).toBeInTheDocument()
    })
  })
}) 