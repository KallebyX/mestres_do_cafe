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
      
      expect(screen.getByText('Carregando cafés especiais...')).toBeInTheDocument()
    })

    it('deve renderizar a página completa após carregamento', async () => {
      renderWithContexts()
      
      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      // Verificar título principal
      expect(screen.getByText('Cafés')).toBeInTheDocument()
      expect(screen.getByText('Especiais')).toBeInTheDocument()
      
      // Verificar subtítulo
      expect(screen.getByText(/descubra nossa seleção exclusiva/i)).toBeInTheDocument()
    })

    it('deve renderizar as features do marketplace', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      // Verificar features
      expect(screen.getByText('Certificação SCA')).toBeInTheDocument()
      expect(screen.getByText('Frete Grátis')).toBeInTheDocument()
      expect(screen.getByText('Compra Segura')).toBeInTheDocument()
      expect(screen.getByText('Frescor Garantido')).toBeInTheDocument()
    })

    it('deve renderizar os controles de busca e filtros', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      // Verificar campo de busca
      expect(screen.getByPlaceholderText('Buscar cafés...')).toBeInTheDocument()
      
      // Verificar filtros
      expect(screen.getByDisplayValue('Todos os Cafés (6)')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Ordenar por Nome')).toBeInTheDocument()
    })

    it('deve renderizar produtos após carregamento', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      // Verificar se produtos são exibidos
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
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Buscar cafés...')
      
      fireEvent.change(searchInput, { target: { value: 'Bourbon' } })
      
      await waitFor(() => {
        expect(screen.getByText('Bourbon Amarelo Premium')).toBeInTheDocument()
      })
    })

    it('deve filtrar produtos por categoria', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      const categorySelect = screen.getByDisplayValue('Todos os Cafés (6)')
      
      fireEvent.change(categorySelect, { target: { value: 'premium' } })
      
      // Verificar se filtro foi aplicado
      expect(categorySelect.value).toBe('premium')
    })

    it('deve alterar modo de visualização', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      // Verificar botões de visualização existem
      const gridButtons = screen.getAllByRole('button')
      expect(gridButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Produtos', () => {
    it('deve renderizar informações dos produtos', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      await waitFor(() => {
        // Verificar nome e descrição
        expect(screen.getByText('Bourbon Amarelo Premium')).toBeInTheDocument()
        expect(screen.getByText(/notas de chocolate e caramelo/i)).toBeInTheDocument()
        
        // Verificar badge
        expect(screen.getByText('Mais Vendido')).toBeInTheDocument()
      })
    })

    it('deve mostrar preços dos produtos', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      await waitFor(() => {
        // Verificar se algum preço é exibido (formato brasileiro)
        expect(screen.getByText(/R\$ 45,90/)).toBeInTheDocument()
        expect(screen.getByText(/R\$ 89,90/)).toBeInTheDocument()
      })
    })

    it('deve ter botões de adicionar ao carrinho', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      await waitFor(() => {
        const addButtons = screen.getAllByText('Adicionar')
        expect(addButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Newsletter', () => {
    it('deve renderizar seção de newsletter', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      // Verificar newsletter
      expect(screen.getByText('Receba Ofertas Exclusivas')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Seu melhor e-mail')).toBeInTheDocument()
      expect(screen.getByText('Inscrever')).toBeInTheDocument()
    })

    it('deve permitir inserir email na newsletter', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      const emailInput = screen.getByPlaceholderText('Seu melhor e-mail')
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      
      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  describe('Responsividade', () => {
    it('deve manter funcionalidade básica', async () => {
      renderWithContexts()
      
      await waitFor(() => {
        expect(screen.queryByText('Carregando cafés especiais...')).not.toBeInTheDocument()
      })

      // Verificar elementos principais
      expect(screen.getByText('Cafés')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Buscar cafés...')).toBeInTheDocument()
    })
  })
}) 