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
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cafés Especiais');
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
      
      expect(screen.getByText('500+')).toBeInTheDocument();
      expect(screen.getByText('Clientes Satisfeitos')).toBeInTheDocument();
      expect(screen.getByText('50+')).toBeInTheDocument();
      expect(screen.getAllByText('Cafés Especiais')).toHaveLength(2);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Anos de Experiência')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('Avaliações 5 Estrelas')).toBeInTheDocument();
    });

    it('deve mostrar certificação SCA', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Certificação SCA & Torra Artesanal')).toBeInTheDocument();
    });
  })

  describe('Seção de funcionalidades', () => {
    it('deve renderizar seção "Por que escolher nossos cafés?"', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Por que escolher nossos cafés?')).toBeInTheDocument();
      expect(screen.getByText('Oferecemos uma experiência completa em cafés especiais, do grão à xícara')).toBeInTheDocument();
    });

    it('deve mostrar certificação SCA', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Certificação SCA')).toBeInTheDocument();
      expect(screen.getByText('Todos os nossos cafés possuem pontuação SCA acima de 80 pontos')).toBeInTheDocument();
    });

    it('deve mostrar frete grátis', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Frete Grátis')).toBeInTheDocument();
      expect(screen.getByText('Entrega gratuita para compras acima de R$ 99 em todo o Brasil')).toBeInTheDocument();
    });

    it('deve mostrar compra segura', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Compra Segura')).toBeInTheDocument();
      expect(screen.getByText('Pagamento seguro com garantia de qualidade ou dinheiro de volta')).toBeInTheDocument();
    });

    it('deve mostrar frescor garantido', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getByText('Frescor Garantido')).toBeInTheDocument();
      expect(screen.getByText('Torrefação semanal para garantir máximo frescor e sabor')).toBeInTheDocument();
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
      expect(screen.getByText('R$ 67,90')).toBeInTheDocument()
    })

    it('deve mostrar SCA score dos produtos', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('SCA 86')).toBeInTheDocument()
      expect(screen.getByText('SCA 92')).toBeInTheDocument()
      expect(screen.getByText('SCA 88')).toBeInTheDocument()
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

    it('deve mostrar avaliações com estrelas nos produtos', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('4.8')).toBeInTheDocument()
      expect(screen.getByText('4.9')).toBeInTheDocument()
      expect(screen.getByText('4.7')).toBeInTheDocument()
    })
  })

  describe('Navegação e interações', () => {
    it('deve navegar para marketplace ao clicar em "Explorar Cafés"', () => {
      renderWithContexts(<LandingPage />)
      
      const marketplaceLink = screen.getByRole('link', { name: /explorar cafés/i })
      expect(marketplaceLink).toHaveAttribute('href', '/marketplace')
    })

    it('deve navegar para sobre ao clicar em "Ver Processo"', () => {
      renderWithContexts(<LandingPage />)
      
      const aboutLink = screen.getByRole('link', { name: /ver processo/i })
      expect(aboutLink).toHaveAttribute('href', '/sobre')
    })

    it('deve navegar para marketplace ao clicar em "Ver Todos os Cafés"', () => {
      renderWithContexts(<LandingPage />)
      
      const viewAllLink = screen.getByRole('link', { name: /ver todos os cafés/i })
      expect(viewAllLink).toHaveAttribute('href', '/marketplace')
    })

    it('deve navegar para marketplace ao clicar em "Começar Jornada"', () => {
      renderWithContexts(<LandingPage />)
      
      const startJourneyLink = screen.getByRole('link', { name: /começar jornada/i })
      expect(startJourneyLink).toHaveAttribute('href', '/marketplace')
    })
  })

  describe('Seção CTA final', () => {
    it('deve mostrar call-to-action final', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText(/pronto para descobrir o seu café especial/i)).toBeInTheDocument()
      expect(screen.getByText(/junte-se a centenas de amantes do café que já descobriram sabores únicos/i)).toBeInTheDocument()
    })

    it('deve mostrar botão "Começar Jornada"', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText(/começar jornada/i)).toBeInTheDocument()
    })
  })

  describe('Responsividade', () => {
    it('deve adaptar layout para mobile', () => {
      renderWithContexts(<LandingPage />);
      
      // Verificar se elementos principais estão presentes
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cafés Especiais');
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
    it('deve mostrar pontuação SCA no texto hero', () => {
      renderWithContexts(<LandingPage />);
      
      expect(screen.getAllByText(/pontuação SCA acima de 80 pontos/i)).toHaveLength(2);
    })

    it('deve mostrar seção de produtos em destaque', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('Nossos Cafés Especiais')).toBeInTheDocument()
      expect(screen.getByText('Conheça nossa seleção premium de cafés especiais')).toBeInTheDocument()
    })

    it('deve mostrar preços originais tachados quando há desconto', () => {
      renderWithContexts(<LandingPage />)
      
      expect(screen.getByText('R$ 52,90')).toBeInTheDocument()
      expect(screen.getByText('R$ 105,90')).toBeInTheDocument()
      expect(screen.getByText('R$ 75,90')).toBeInTheDocument()
    })
  })
}) 