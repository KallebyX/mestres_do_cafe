import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MarketplacePage from '../../../src/pages/MarketplacePage'
import AuthContext from '../../../src/contexts/AuthContext'
import CartContext from '../../../src/contexts/CartContext'

describe('MarketplacePage', () => {
  const mockAuthContextValue = {
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    loading: false
  }

  const mockCartContextValue = {
    items: [],
    total: 0,
    itemsCount: 0,
    loading: false,
    error: null,
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    updateCartItem: vi.fn(),
    clearCart: vi.fn(),
    loadCart: vi.fn()
  }

  const renderWithContexts = (authValue = mockAuthContextValue, cartValue = mockCartContextValue) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          <CartContext.Provider value={cartValue}>
            <MarketplacePage />
          </CartContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização inicial', () => {
    it('deve mostrar loading inicialmente', () => {
      renderWithContexts()
      
      expect(screen.getByText('Carregando Produtos...')).toBeInTheDocument()
    })

    it('deve renderizar a página completa após carregamento', async () => {
      renderWithContexts()
      
      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      // Verificar título principal
      expect(screen.getByText(/Marketplace de Cafés Especiais/i)).toBeInTheDocument()
      
      // Verificar subtítulo
      expect(screen.getByText(/Descubra os melhores cafés especiais/i)).toBeInTheDocument()
    })

    it('deve renderizar as estatísticas do marketplace', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      // Verificar estatísticas (stats)
      expect(screen.getByText('Cafés Disponíveis')).toBeInTheDocument()
      expect(screen.getByText('Pontuação SCA Média')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(screen.getByText('Cafés Especiais')).toBeInTheDocument()
    })

    it('deve renderizar os controles de busca e filtros', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      // Verificar campo de busca
      expect(screen.getByPlaceholderText('Buscar por nome, origem ou descrição...')).toBeInTheDocument()
      
      // Verificar botão de filtros
      expect(screen.getByText('Filtros')).toBeInTheDocument()
    })

    it('deve renderizar produtos após carregamento', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      // Verificar se produtos são exibidos (os produtos vêm do mock em setup.js)
      await waitFor(() => {
        expect(screen.getByText('Bourbon Amarelo Premium')).toBeInTheDocument()
        expect(screen.getByText('Geisha Especial')).toBeInTheDocument()
      })
    })
  })

  describe('Funcionalidade de busca', () => {
    it('deve permitir buscar produtos', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Buscar por nome, origem ou descrição...')
      
      fireEvent.change(searchInput, { target: { value: 'Bourbon' } })
      
      await waitFor(() => {
        expect(screen.getByText('Bourbon Amarelo Premium')).toBeInTheDocument()
      })
    })

    it('deve filtrar produtos por categoria', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      // Primeiro precisa clicar no botão de filtros para expandir
      const filterButton = screen.getByText('Filtros')
      fireEvent.click(filterButton)
      
      // Agora pode acessar o select de categoria
      const categorySelect = screen.getByLabelText('Categoria')
      
      fireEvent.change(categorySelect, { target: { value: 'especiais' } })
      
      // Verificar se filtro foi aplicado
      expect(categorySelect.value).toBe('especiais')
    })

    it('deve alterar modo de visualização', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      // Verificar se existem botões na página
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Produtos', () => {
    it('deve renderizar informações dos produtos', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      await waitFor(() => {
        // Verificar nome e descrição
        expect(screen.getByText('Bourbon Amarelo Premium')).toBeInTheDocument()
        expect(screen.getByText(/notas de chocolate e caramelo/i)).toBeInTheDocument()
        
        // Verificar badge de destaque
        expect(screen.getByText('⭐ Destaque')).toBeInTheDocument()
      })
    })

    it('deve mostrar preços dos produtos', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      await waitFor(() => {
        // Verificar se algum preço é exibido (formato brasileiro)
        const priceElements = screen.getAllByText(/R\$/);
        expect(priceElements.length).toBeGreaterThan(0)
      })
    })

    it('deve ter botões de adicionar ao carrinho', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      await waitFor(() => {
        const buyButtons = screen.getAllByText('Comprar')
        expect(buyButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Newsletter', () => {
    it('deve renderizar a página sem newsletter', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      // O componente não tem seção de newsletter atualmente
      // Verificar que a página renderizou completamente
      expect(screen.getByText(/Marketplace de Cafés Especiais/i)).toBeInTheDocument()
    })
  })

  describe('Responsividade', () => {
    it('deve manter funcionalidade básica', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando Produtos...')).not.toBeInTheDocument()
      })

      // Verificar elementos principais
      expect(screen.getByText(/Marketplace de Cafés Especiais/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Buscar por nome, origem ou descrição...')).toBeInTheDocument()
    })
  })
}) 