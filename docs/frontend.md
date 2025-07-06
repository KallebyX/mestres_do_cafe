# 🎨 Frontend - Guia do Desenvolvedor

Este documento fornece informações detalhadas sobre o desenvolvimento frontend do Café Enterprise.

## 🏗️ Arquitetura Frontend

### Stack Tecnológico
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Roteamento**: React Router DOM
- **Estado Global**: Context API
- **HTTP Client**: Fetch API nativo
- **Formulários**: React Hook Form
- **Validação**: Yup
- **Ícones**: Lucide React
- **Animações**: Framer Motion

### Estrutura de Pastas

```
apps/web/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes UI básicos
│   │   ├── forms/          # Componentes de formulário
│   │   └── layout/         # Componentes de layout
│   ├── contexts/           # Contextos do React
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilitários e APIs
│   ├── pages/             # Páginas da aplicação
│   ├── styles/            # Estilos globais
│   └── utils/             # Funções utilitárias
├── public/                # Arquivos públicos
└── index.html            # HTML principal
```

## 📦 Componentes

### Componentes UI Base

#### Button
```jsx
import { Button } from '@/components/ui/button'

<Button variant="primary" size="md" onClick={handleClick}>
  Clique aqui
</Button>
```

**Variantes disponíveis:**
- `primary`, `secondary`, `outline`, `ghost`, `destructive`

**Tamanhos disponíveis:**
- `sm`, `md`, `lg`

#### Input
```jsx
import { Input } from '@/components/ui/input'

<Input 
  type="email" 
  placeholder="Digite seu email"
  value={email}
  onChange={setEmail}
/>
```

#### Card
```jsx
import { Card, CardHeader, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <h2>Título do Card</h2>
  </CardHeader>
  <CardContent>
    <p>Conteúdo do card</p>
  </CardContent>
</Card>
```

### Componentes de Layout

#### Header
```jsx
import { Header } from '@/components/Header'

<Header />
```

**Funcionalidades:**
- Logo da marca
- Menu de navegação
- Carrinho de compras
- Menu do usuário (logado/deslogado)

#### Footer
```jsx
import { Footer } from '@/components/Footer'

<Footer />
```

## 🔗 Roteamento

### Configuração das Rotas

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/customer" element={<CustomerDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### Rotas Protegidas

```jsx
import { ProtectedRoute } from '@/components/ProtectedRoute'

<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## 🎯 Gerenciamento de Estado

### Context API

#### AuthContext
```jsx
import { useAuth } from '@/contexts/AuthContext'

function Component() {
  const { user, login, logout, isAuthenticated } = useAuth()
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Bem-vindo, {user.name}!</p>
      ) : (
        <p>Você não está logado</p>
      )}
    </div>
  )
}
```

#### CartContext
```jsx
import { useCart } from '@/contexts/CartContext'

function Component() {
  const { 
    items, 
    addItem, 
    removeItem, 
    updateQuantity,
    total,
    itemsCount 
  } = useCart()
  
  return (
    <div>
      <p>Itens no carrinho: {itemsCount}</p>
      <p>Total: R$ {total.toFixed(2)}</p>
    </div>
  )
}
```

#### NotificationContext
```jsx
import { useNotification } from '@/contexts/NotificationContext'

function Component() {
  const { showNotification } = useNotification()
  
  const handleSuccess = () => {
    showNotification('Operação realizada com sucesso!', 'success')
  }
  
  return (
    <button onClick={handleSuccess}>
      Executar ação
    </button>
  )
}
```

## 🔌 Integração com API

### Configuração Base

```jsx
// lib/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }
    
    // Adicionar token de autenticação se disponível
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },
  
  get: (endpoint) => api.request(endpoint),
  post: (endpoint, data) => api.request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data) => api.request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint) => api.request(endpoint, {
    method: 'DELETE',
  }),
}
```

### Hooks para API

```jsx
// hooks/useProducts.js
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await api.get('/products')
        setProducts(data.products)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])
  
  return { products, loading, error }
}
```

## 🎨 Estilização

### Tailwind CSS

#### Classes Utilitárias Comuns
```css
/* Layout */
.container { @apply max-w-6xl mx-auto px-4; }
.card { @apply bg-white rounded-lg shadow-md p-6; }
.btn { @apply px-4 py-2 rounded-lg font-semibold transition-colors; }

/* Cores do tema */
.text-primary { @apply text-amber-600; }
.bg-primary { @apply bg-amber-600; }
.text-secondary { @apply text-amber-900; }
.bg-secondary { @apply bg-amber-100; }
```

#### Componentes Customizados
```jsx
// Exemplo de Card Product
function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-amber-600">
            R$ {product.price.toFixed(2)}
          </span>
          <Button variant="primary">
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </div>
  )
}
```

## 📱 Responsividade

### Breakpoints
```css
/* Tailwind breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Exemplo de Layout Responsivo
```jsx
function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

## 🔄 Formulários

### React Hook Form + Yup

```jsx
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().min(6, 'Senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória'),
})

function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  })
  
  const onSubmit = (data) => {
    console.log(data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input 
          {...register('name')}
          placeholder="Nome completo"
        />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      
      <div>
        <input 
          {...register('email')}
          type="email"
          placeholder="Email"
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      
      <div>
        <input 
          {...register('password')}
          type="password"
          placeholder="Senha"
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      
      <button type="submit">Registrar</button>
    </form>
  )
}
```

## 🔔 Notificações

### Sistema de Toast

```jsx
// contexts/NotificationContext.jsx
import { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  
  const showNotification = (message, type = 'info') => {
    const id = Date.now()
    const notification = { id, message, type }
    
    setNotifications(prev => [...prev, notification])
    
    // Remove após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }
  
  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)
```

## 🧪 Testes

### Testing Library

```jsx
// __tests__/components/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## 🚀 Performance

### Otimizações

#### Lazy Loading
```jsx
import { lazy, Suspense } from 'react'

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function App() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AdminDashboard />
    </Suspense>
  )
}
```

#### Memo para Componentes
```jsx
import { memo } from 'react'

const ProductCard = memo(({ product }) => {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </div>
  )
})
```

#### useMemo para Cálculos
```jsx
import { useMemo } from 'react'

function Cart({ items }) {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])
  
  return <p>Total: R$ {total.toFixed(2)}</p>
}
```

## 🔧 Configuração de Desenvolvimento

### Vite Config
```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

### Variáveis de Ambiente
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Café Enterprise
VITE_APP_VERSION=1.0.0

# .env.production
VITE_API_BASE_URL=https://api.seudominio.com
VITE_APP_NAME=Café Enterprise
VITE_APP_VERSION=1.0.0
```

## 📦 Build e Deploy

### Build para Produção
```bash
npm run build
```

### Análise do Bundle
```bash
npm run analyze
```

### Deploy
```bash
npm run preview  # Testar build localmente
npm run deploy   # Deploy para produção
```

## 🎯 Boas Práticas

### Estrutura de Componentes
```jsx
// Exemplo de estrutura ideal
function ProductCard({ product, onAddToCart }) {
  // 1. Hooks no topo
  const [isLoading, setIsLoading] = useState(false)
  const { showNotification } = useNotification()
  
  // 2. Funções de manipulação
  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await onAddToCart(product)
      showNotification('Produto adicionado ao carrinho!', 'success')
    } catch (error) {
      showNotification('Erro ao adicionar produto', 'error')
    } finally {
      setIsLoading(false)
    }
  }
  
  // 3. Render condicional
  if (!product) return null
  
  // 4. JSX principal
  return (
    <div className="product-card">
      {/* Conteúdo */}
    </div>
  )
}
```

### Nomenclatura
- **Componentes**: PascalCase (`ProductCard`)
- **Funções**: camelCase (`handleAddToCart`)
- **Constantes**: UPPER_CASE (`API_BASE_URL`)
- **Arquivos**: kebab-case (`product-card.jsx`)

### Importações
```jsx
// 1. Imports de bibliotecas
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Imports de componentes
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 3. Imports de hooks/utils
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

// 4. Imports de estilos
import './styles.css'
```

---

Para mais detalhes sobre componentes específicos, consulte o código-fonte em [`apps/web/src/components/`](../apps/web/src/components/).