import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

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

// Mock das novas APIs de administração de clientes
vi.mock('../src/lib/admin-customers-api', () => ({
  createCustomer: vi.fn().mockResolvedValue({
    success: true,
    customer: {
      id: 'mock-customer-id',
      name: 'João Silva',
      email: 'joao@test.com',
      user_type: 'cliente_pf',
      criado_por_admin: true,
      pendente_ativacao: true
    },
    message: 'Cliente criado com sucesso!'
  }),
  getAdminCustomers: vi.fn().mockResolvedValue({
    success: true,
    customers: [
      {
        id: 'mock-customer-1',
        name: 'João Silva',
        email: 'joao@test.com',
        user_type: 'cliente_pf',
        criado_por_admin: true,
        pendente_ativacao: true,
        is_active: true,
        admin_name: 'Administrador',
        orders_count: 0,
        total_spent: 0
      }
    ],
    pagination: {
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1
    }
  }),
  editCustomer: vi.fn().mockResolvedValue({
    success: true,
    message: 'Cliente atualizado com sucesso!'
  }),
  toggleCustomerStatus: vi.fn().mockResolvedValue({
    success: true,
    message: 'Status alterado com sucesso!'
  }),
  getAdminLogs: vi.fn().mockResolvedValue({
    success: true,
    logs: [
      {
        id: 'mock-log-1',
        admin_name: 'Administrador',
        customer_name: 'João Silva',
        customer_email: 'joao@test.com',
        action_type: 'create',
        created_at: '2025-01-01T10:00:00Z'
      }
    ]
  }),
  validateCPF: vi.fn().mockReturnValue(true),
  validateCNPJ: vi.fn().mockReturnValue(true),
  formatCPF: vi.fn((cpf) => cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || ''),
  formatCNPJ: vi.fn((cnpj) => cnpj?.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') || ''),
  formatPhone: vi.fn((phone) => phone?.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') || ''),
  formatCEP: vi.fn((cep) => cep?.replace(/(\d{5})(\d{3})/, '$1-$2') || ''),
  searchCEP: vi.fn().mockResolvedValue({
    address: 'Rua das Flores',
    neighborhood: 'Centro',
    city: 'Santa Maria',
    state: 'RS'
  })
}))

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

// Garantir que o módulo seja válido
export {} 