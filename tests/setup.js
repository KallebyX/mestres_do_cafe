import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock do Supabase ANTES de importar qualquer coisa que o use
vi.mock('../src/lib/supabase', () => {
  const mockFrom = () => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnValue({
      data: null,
      error: null
    }),
    then: vi.fn((resolve) => resolve({ data: [], error: null }))
  });

  const mockSupabase = {
    from: vi.fn(mockFrom),
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      signIn: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ unsubscribe: vi.fn() }))
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
      }))
    }
  };

  return { supabase: mockSupabase };
});

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock do fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
)

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock do IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock do React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
  BrowserRouter: ({ children }) => children,
  MemoryRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ children }) => children,
  Link: ({ children }) => children,
  NavLink: ({ children }) => children
}))

// Mock das APIs com dados de teste realistas baseados na implementação
const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  user_type: 'cliente_pf',
  points: 100,
  level: 'Bronze'
}

const mockProducts = [
  { 
    id: 1, 
    name: 'Bourbon Amarelo Premium', 
    price: 45.90, 
    image: '☕',
    description: 'Notas de chocolate e caramelo, corpo encorpado com acidez equilibrada.',
    stock: 50,
    rating: 4.8,
    category: 'especiais',
    active: true
  },
  { 
    id: 2, 
    name: 'Geisha Especial', 
    price: 89.90, 
    image: '🌟',
    description: 'Café premium com notas florais e frutadas.',
    stock: 30,
    rating: 4.9,
    category: 'especiais',
    active: true
  },
  { 
    id: 3, 
    name: 'Blend Signature', 
    price: 39.90, 
    image: '🔥',
    description: 'Nosso blend exclusivo com equilíbrio perfeito.',
    stock: 100,
    rating: 4.7,
    category: 'blends',
    active: true
  }
]

// Mock da API completa
vi.mock('../src/lib/api', () => ({
  authAPI: {
    register: vi.fn().mockResolvedValue({
      success: true,
      user: mockUser,
      token: 'mock-token',
      data: { user: mockUser, access_token: 'mock-token' }
    }),
    login: vi.fn().mockResolvedValue({
      success: true,
      user: mockUser,
      token: 'mock-token',
      data: { user: mockUser, access_token: 'mock-token' }
    }),
    verifyToken: vi.fn().mockResolvedValue({
      success: true,
      user: mockUser
    }),
    logout: vi.fn(),
    getCurrentUser: vi.fn(() => mockUser),
    getToken: vi.fn(() => 'mock-token')
  },
  productsAPI: {
    getAll: vi.fn().mockResolvedValue({
      success: true,
      products: mockProducts,
      total: mockProducts.length
    }),
    getById: vi.fn().mockResolvedValue({
      success: true,
      product: mockProducts[0]
    }),
    getFeatured: vi.fn().mockResolvedValue({
      success: true,
      products: mockProducts.slice(0, 2),
      total: 2
    })
  },
  adminAPI: {
    getStats: vi.fn().mockResolvedValue({ 
      success: true, 
      stats: { 
        totalProducts: 10, 
        totalOrders: 5, 
        totalUsers: 50 
      } 
    }),
    getProducts: vi.fn().mockResolvedValue({
      success: true,
      products: mockProducts,
      total: mockProducts.length
    }),
    createProduct: vi.fn().mockResolvedValue({
      success: true,
      product: mockProducts[0],
      message: 'Produto criado com sucesso'
    }),
    updateProduct: vi.fn().mockResolvedValue({
      success: true,
      product: mockProducts[0],
      message: 'Produto atualizado com sucesso'
    }),
    deleteProduct: vi.fn().mockResolvedValue({
      success: true,
      message: 'Produto excluído com sucesso'
    })
  },
  gamificationAPI: {
    getProfile: vi.fn().mockResolvedValue({
      success: true,
      profile: {
        points: 100,
        level: 'Bronze',
        nextLevel: 'Prata',
        pointsToNext: 400
      }
    }),
    addPoints: vi.fn().mockResolvedValue({
      success: true,
      points: 150,
      message: 'Pontos adicionados com sucesso'
    }),
    getLeaderboard: vi.fn().mockResolvedValue({
      success: true,
      leaderboard: [mockUser]
    })
  },
  cartAPI: {
    get: vi.fn().mockResolvedValue({
      success: true,
      cart: {
        items: [],
        total: 0,
        itemsCount: 0
      }
    }),
    addItem: vi.fn().mockResolvedValue({
      success: true,
      cart: {
        items: [{ ...mockProducts[0], quantity: 1 }],
        total: 45.90,
        itemsCount: 1
      }
    })
  },
  cartUtils: {
    updateCartCount: vi.fn(),
    getCartItemsCount: vi.fn(() => 0),
    saveCart: vi.fn((cartData) => {
      // Simular salvamento real no localStorage
      localStorage.setItem('cart', JSON.stringify(cartData))
    }),
    getCart: vi.fn(() => {
      // Simular carregamento real do localStorage
      const cart = localStorage.getItem('cart')
      if (!cart) return { items: [], total: 0 }
      try {
        return JSON.parse(cart)
      } catch {
        return { items: [], total: 0 }
      }
    }),
    clearCart: vi.fn(() => {
      // Simular limpeza real do localStorage
      localStorage.removeItem('cart')
    })
  }
}))

// Cleanup após cada teste
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})

// Comentado o mock automático da admin-customers-api para permitir testes específicos
// O mock específico de cada teste individual terá prioridade
// vi.mock('../src/lib/admin-customers-api', () => ({...}))

// Mock do contexto de autenticação Supabase
vi.mock('../src/contexts/SupabaseAuthContext', () => ({
  useSupabaseAuth: vi.fn(() => ({
    user: {
      id: 'mock-user-id',
      email: 'user@test.com',
      name: 'Test User',
      pendente_ativacao: false
    },
    loading: false,
    error: null,
    activateAdminCreatedAccount: vi.fn().mockResolvedValue({
      success: true,
      message: 'Conta ativada com sucesso!'
    })
  })),
  SupabaseAuthProvider: ({ children }) => children
}))

// Mock do supabase-products
vi.mock('../src/lib/supabase-products', () => {
  const mockProducts = [
    { 
      id: 1, 
      name: 'Bourbon Amarelo Premium', 
      price: 45.90, 
      images: ['https://example.com/coffee1.jpg'],
      description: 'Notas de chocolate e caramelo, corpo encorpado com acidez equilibrada.',
      stock: 50,
      rating: 4.8,
      category: 'especiais',
      is_active: true,
      is_featured: true,
      origin: 'Brasil',
      roast_level: 'medium',
      sca_score: 86
    },
    { 
      id: 2, 
      name: 'Geisha Especial', 
      price: 89.90, 
      images: ['https://example.com/coffee2.jpg'],
      description: 'Café premium com notas florais e frutadas.',
      stock: 30,
      rating: 4.9,
      category: 'especiais',
      is_active: true,
      is_featured: true,
      origin: 'Colômbia',
      roast_level: 'light',
      sca_score: 92
    },
    { 
      id: 3, 
      name: 'Blend Signature', 
      price: 39.90, 
      images: ['https://example.com/coffee3.jpg'],
      description: 'Nosso blend exclusivo com equilíbrio perfeito.',
      stock: 100,
      rating: 4.7,
      category: 'blends',
      is_active: true,
      is_featured: false,
      origin: 'Brasil/Colômbia',
      roast_level: 'medium-dark',
      sca_score: 84
    }
  ];

  return {
    getAllProducts: vi.fn().mockResolvedValue({ 
      success: true, 
      data: mockProducts 
    }),
    getAllProductsAdmin: vi.fn().mockResolvedValue({ 
      success: true, 
      data: mockProducts 
    }),
    getFeaturedProducts: vi.fn().mockResolvedValue({ 
      success: true, 
      data: mockProducts.filter(p => p.is_featured) 
    }),
    getProductById: vi.fn((id) => {
      const product = mockProducts.find(p => p.id === parseInt(id));
      return Promise.resolve({
        success: !!product,
        data: product || null,
        error: product ? null : 'Produto não encontrado'
      });
    }),
    createProduct: vi.fn().mockResolvedValue({
      success: true,
      data: mockProducts[0],
      message: 'Produto criado com sucesso!'
    }),
    updateProduct: vi.fn().mockResolvedValue({
      success: true,
      data: mockProducts[0],
      message: 'Produto atualizado com sucesso!'
    }),
    deleteProduct: vi.fn().mockResolvedValue({
      success: true,
      message: 'Produto removido com sucesso!'
    }),
    formatPrice: vi.fn((price) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price);
    }),
    getProductImage: vi.fn((product) => {
      return product.images?.[0] || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400';
    })
  };
});

// Mock do supabaseClient
vi.mock('../src/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: null
      }),
      then: vi.fn((resolve) => resolve({ data: [], error: null }))
    }))
  },
  testimonials: {
    getFiltered: vi.fn().mockResolvedValue({
      success: true,
      data: []
    }),
    getFeatured: vi.fn().mockResolvedValue({
      success: true,
      data: []
    })
  },
  products: {
    getFiltered: vi.fn().mockResolvedValue({
      success: true,
      data: [
        { 
          id: 1, 
          name: 'Bourbon Amarelo Premium', 
          price: 45.90, 
          images: ['https://example.com/coffee1.jpg'],
          description: 'Notas de chocolate e caramelo',
          is_featured: true
        },
        { 
          id: 2, 
          name: 'Geisha Especial', 
          price: 89.90, 
          images: ['https://example.com/coffee2.jpg'],
          description: 'Café premium com notas florais',
          is_featured: true
        }
      ]
    })
  }
}));

// Garantir que o módulo seja válido
export {} 