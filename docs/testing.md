# 🧪 Testes - Guia Completo

Este documento fornece informações detalhadas sobre como executar e escrever testes no projeto Café Enterprise.

## 🎯 Estratégia de Testes

### Pirâmide de Testes

```
        ┌─────────────────┐
        │   E2E Tests     │  ← Poucos, mas críticos
        │   (Cypress)     │
        └─────────────────┘
       ┌─────────────────────┐
       │ Integration Tests   │  ← Médio volume
       │ (API + Database)    │
       └─────────────────────┘
      ┌─────────────────────────┐
      │     Unit Tests          │  ← Muitos e rápidos
      │ (Components + Functions)│
      └─────────────────────────┘
```

### Tipos de Testes

1. **Unit Tests**: Testam funções e componentes isolados
2. **Integration Tests**: Testam a comunicação entre módulos
3. **End-to-End Tests**: Testam fluxos completos da aplicação
4. **Performance Tests**: Testam carga e performance
5. **Security Tests**: Testam vulnerabilidades

## 🔧 Configuração de Testes

### Frontend (React + Vite)

#### Dependências
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "vitest": "^0.34.6",
    "jsdom": "^22.1.0",
    "@vitest/ui": "^0.34.6",
    "happy-dom": "^10.0.3"
  }
}
```

#### Configuração Vitest
```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}'
      ]
    }
  }
})
```

#### Setup de Testes
```js
// src/test/setup.js
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Limpar após cada teste
afterEach(() => {
  cleanup()
})

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock do fetch
global.fetch = vi.fn()
```

### Backend (Flask + Python)

#### Dependências
```txt
pytest==7.4.2
pytest-cov==4.1.0
pytest-mock==3.11.1
pytest-asyncio==0.21.1
factory-boy==3.3.0
faker==19.6.2
httpx==0.25.0
```

#### Configuração pytest
```ini
# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --cov=src
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
```

#### Configuração conftest.py
```python
# tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database import Base, get_db
from src.app import app
import tempfile
import os

@pytest.fixture
def db_session():
    """Fixture para sessão de banco de dados de teste"""
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    yield session
    
    session.close()

@pytest.fixture
def client(db_session):
    """Fixture para cliente de teste Flask"""
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with app.test_client() as client:
        yield client
    
    app.dependency_overrides.clear()

@pytest.fixture
def authenticated_client(client, db_session):
    """Cliente autenticado para testes"""
    # Criar usuário de teste
    user = create_test_user(db_session)
    
    # Fazer login
    response = client.post('/api/auth/login', json={
        'email': user.email,
        'password': 'testpass123'
    })
    
    token = response.json['access_token']
    
    # Configurar headers
    client.environ_base['HTTP_AUTHORIZATION'] = f'Bearer {token}'
    
    return client
```

## 📝 Escrevendo Testes

### Testes de Componentes (Frontend)

#### Teste Básico de Componente
```jsx
// src/components/__tests__/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../ui/button'

describe('Button', () => {
  it('renderiza com texto correto', () => {
    render(<Button>Clique aqui</Button>)
    expect(screen.getByText('Clique aqui')).toBeInTheDocument()
  })

  it('chama onClick quando clicado', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Clique aqui</Button>)
    
    fireEvent.click(screen.getByText('Clique aqui'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('aplica classe CSS correta', () => {
    render(<Button variant="primary">Botão</Button>)
    expect(screen.getByText('Botão')).toHaveClass('btn-primary')
  })
})
```

#### Teste de Contexto
```jsx
// src/contexts/__tests__/AuthContext.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider, useAuth } from '../AuthContext'

// Componente de teste
function TestComponent() {
  const { user, login, logout, isAuthenticated } = useAuth()
  
  return (
    <div>
      <span data-testid="auth-status">
        {isAuthenticated ? 'Autenticado' : 'Não autenticado'}
      </span>
      <span data-testid="user-name">{user?.name || 'Sem usuário'}</span>
      <button onClick={() => login('test@test.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  it('inicia com estado não autenticado', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Não autenticado')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Sem usuário')
  })

  it('faz login com sucesso', async () => {
    // Mock da API
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'fake-token',
        user: { id: 1, name: 'Teste', email: 'test@test.com' }
      })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    fireEvent.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado')
      expect(screen.getByTestId('user-name')).toHaveTextContent('Teste')
    })
  })
})
```

### Testes de API (Backend)

#### Teste de Endpoint
```python
# tests/test_products.py
import pytest
from src.models.product import Product
from src.models.category import Category

def test_get_products(client, db_session):
    """Testa listagem de produtos"""
    # Criar categoria
    category = Category(name="Café Especial", slug="cafe-especial")
    db_session.add(category)
    db_session.commit()
    
    # Criar produto
    product = Product(
        name="Café Teste",
        price=29.90,
        weight=250,
        category_id=category.id
    )
    db_session.add(product)
    db_session.commit()
    
    # Testar endpoint
    response = client.get('/api/products')
    assert response.status_code == 200
    
    data = response.json
    assert len(data['products']) == 1
    assert data['products'][0]['name'] == "Café Teste"

def test_create_product_unauthorized(client):
    """Testa criação de produto sem autenticação"""
    response = client.post('/api/products', json={
        'name': 'Novo Produto',
        'price': 19.99,
        'weight': 250
    })
    assert response.status_code == 401

def test_create_product_authorized(authenticated_client, db_session):
    """Testa criação de produto com admin"""
    # Criar categoria
    category = Category(name="Teste", slug="teste")
    db_session.add(category)
    db_session.commit()
    
    response = authenticated_client.post('/api/products', json={
        'name': 'Novo Produto',
        'price': 19.99,
        'weight': 250,
        'category_id': category.id
    })
    
    assert response.status_code == 201
    assert response.json['name'] == 'Novo Produto'
```

#### Teste de Modelo
```python
# tests/test_models.py
import pytest
from src.models.user import User, UserRole
from src.models.product import Product
from src.models.cart import Cart, CartItem

def test_user_creation(db_session):
    """Testa criação de usuário"""
    user = User(
        name="João Silva",
        email="joao@teste.com",
        password_hash="hashed_password"
    )
    db_session.add(user)
    db_session.commit()
    
    assert user.id is not None
    assert user.role == UserRole.CUSTOMER
    assert user.is_active is True

def test_product_validation(db_session):
    """Testa validação de produto"""
    # Produto sem nome deve falhar
    with pytest.raises(ValueError):
        product = Product(price=10.0, weight=250)
        db_session.add(product)
        db_session.commit()

def test_cart_total_calculation(db_session):
    """Testa cálculo do total do carrinho"""
    # Criar usuário e produtos
    user = User(name="Teste", email="teste@email.com", password_hash="hash")
    product1 = Product(name="Produto 1", price=10.0, weight=250)
    product2 = Product(name="Produto 2", price=20.0, weight=500)
    
    db_session.add_all([user, product1, product2])
    db_session.commit()
    
    # Criar carrinho
    cart = Cart(user_id=user.id)
    db_session.add(cart)
    db_session.commit()
    
    # Adicionar itens
    item1 = CartItem(cart_id=cart.id, product_id=product1.id, quantity=2)
    item2 = CartItem(cart_id=cart.id, product_id=product2.id, quantity=1)
    
    db_session.add_all([item1, item2])
    db_session.commit()
    
    # Calcular total
    total = sum(item.product.price * item.quantity for item in cart.items)
    assert total == 40.0  # (10 * 2) + (20 * 1)
```

### Testes End-to-End (E2E)

#### Configuração Cypress
```js
// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
  },
})
```

#### Teste de Fluxo Completo
```js
// cypress/e2e/purchase-flow.cy.js
describe('Fluxo de Compra', () => {
  beforeEach(() => {
    // Configurar dados de teste
    cy.task('db:seed')
    cy.visit('/')
  })

  it('deve permitir compra completa', () => {
    // Navegar para marketplace
    cy.get('[data-testid="marketplace-link"]').click()
    
    // Selecionar produto
    cy.get('[data-testid="product-card"]').first().click()
    
    // Adicionar ao carrinho
    cy.get('[data-testid="add-to-cart-btn"]').click()
    
    // Verificar notificação
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .should('contain', 'Produto adicionado ao carrinho')
    
    // Ir para carrinho
    cy.get('[data-testid="cart-icon"]').click()
    cy.get('[data-testid="cart-dropdown"]').should('be.visible')
    
    // Verificar item no carrinho
    cy.get('[data-testid="cart-item"]').should('have.length', 1)
    
    // Finalizar compra
    cy.get('[data-testid="checkout-btn"]').click()
    
    // Fazer login
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="login-btn"]').click()
    
    // Preencher dados de entrega
    cy.get('[data-testid="address-input"]').type('Rua Teste, 123')
    cy.get('[data-testid="city-input"]').type('São Paulo')
    cy.get('[data-testid="state-select"]').select('SP')
    cy.get('[data-testid="zip-input"]').type('01234-567')
    
    // Confirmar pedido
    cy.get('[data-testid="confirm-order-btn"]').click()
    
    // Verificar sucesso
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .should('contain', 'Pedido realizado com sucesso')
    
    // Verificar redirecionamento
    cy.url().should('include', '/order-success')
  })
})
```

#### Comandos Customizados
```js
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then((response) => {
    localStorage.setItem('access_token', response.body.access_token)
  })
})

Cypress.Commands.add('addToCart', (productId, quantity = 1) => {
  cy.request({
    method: 'POST',
    url: '/api/cart/items',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: { product_id: productId, quantity }
  })
})
```

## 🔍 Testes de Performance

### Configuração Locust
```python
# locustfile.py
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Executar ao iniciar cada usuário"""
        self.login()
    
    def login(self):
        """Fazer login"""
        response = self.client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.client.headers.update({
                "Authorization": f"Bearer {self.token}"
            })
    
    @task(3)
    def view_products(self):
        """Visualizar produtos"""
        self.client.get("/api/products")
    
    @task(2)
    def view_product_detail(self):
        """Visualizar detalhes do produto"""
        self.client.get("/api/products/1")
    
    @task(1)
    def add_to_cart(self):
        """Adicionar ao carrinho"""
        self.client.post("/api/cart/items", json={
            "product_id": 1,
            "quantity": 1
        })
    
    @task(1)
    def view_cart(self):
        """Visualizar carrinho"""
        self.client.get("/api/cart")
```

### Executar Testes de Performance
```bash
# Instalar Locust
pip install locust

# Executar teste local
locust -f locustfile.py --host=http://localhost:5000

# Executar em modo headless
locust -f locustfile.py --host=http://localhost:5000 --users 100 --spawn-rate 10 --run-time 60s --headless
```

## 📊 Cobertura de Testes

### Configuração Coverage.py
```ini
# .coveragerc
[run]
source = src
omit = 
    */tests/*
    */venv/*
    */migrations/*
    */__pycache__/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
```

### Relatórios de Cobertura
```bash
# Frontend
npm run test:coverage

# Backend
pytest --cov=src --cov-report=html --cov-report=term

# Visualizar relatório
open htmlcov/index.html
```

## 🚀 Executando Testes

### Scripts package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open"
  }
}
```

### Comandos Python
```bash
# Executar todos os testes
pytest

# Executar com cobertura
pytest --cov

# Executar testes específicos
pytest tests/test_products.py

# Executar com verbose
pytest -v

# Executar apenas testes que falharam
pytest --lf
```

## 🐳 Testes em Docker

### Dockerfile para Testes
```dockerfile
# Dockerfile.test
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências
COPY requirements-test.txt .
RUN pip install -r requirements-test.txt

# Copiar código
COPY . .

# Executar testes
CMD ["pytest", "--cov=src", "--cov-report=xml"]
```

### Docker Compose para Testes
```yaml
# docker-compose.test.yml
version: '3.8'

services:
  test-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_pass
    ports:
      - "5433:5432"

  test-api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.test
    depends_on:
      - test-db
    environment:
      DATABASE_URL: postgresql://test_user:test_pass@test-db:5432/test_db
    volumes:
      - ./apps/api:/app
    command: pytest --cov=src --cov-report=xml

  test-web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.test
    volumes:
      - ./apps/web:/app
    command: npm run test:coverage
```

## 📋 Checklist de Testes

### Antes de Fazer Commit
- [ ] Todos os testes unitários passando
- [ ] Cobertura de código > 80%
- [ ] Testes de integração passando
- [ ] Linting sem erros
- [ ] Tipos TypeScript sem erros

### Antes de Deploy
- [ ] Testes E2E passando
- [ ] Testes de performance OK
- [ ] Smoke tests em staging
- [ ] Rollback testado

### Para Cada Feature
- [ ] Testes unitários escritos
- [ ] Testes de integração quando necessário
- [ ] Documentação atualizada
- [ ] Casos de erro cobertos

## 🎯 Boas Práticas

### Nomenclatura
```js
// ❌ Ruim
test('test1', () => {})

// ✅ Bom
test('deve retornar erro 400 quando email é inválido', () => {})
```

### Estrutura AAA
```js
test('deve calcular total do carrinho corretamente', () => {
  // Arrange (Preparar)
  const items = [
    { price: 10, quantity: 2 },
    { price: 20, quantity: 1 }
  ]
  
  // Act (Executar)
  const total = calculateCartTotal(items)
  
  // Assert (Verificar)
  expect(total).toBe(40)
})
```

### Mocks e Stubs
```js
// Mock de API
vi.mock('../api', () => ({
  getProducts: vi.fn().mockResolvedValue([
    { id: 1, name: 'Produto 1', price: 10 }
  ])
}))

// Spy em função
const consoleSpy = vi.spyOn(console, 'log')
expect(consoleSpy).toHaveBeenCalledWith('Expected message')
```

## 🔧 Ferramentas de Teste

### Recomendadas
- **Frontend**: Vitest, Testing Library, Cypress
- **Backend**: pytest, factory-boy, faker
- **API**: Postman, Insomnia, Thunder Client
- **Performance**: Locust, Artillery, k6
- **Visual**: Chromatic, Percy

### Configuração CI/CD
```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run tests
      run: |
        pytest --cov=src --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

---

Para mais informações sobre testes específicos, consulte os arquivos de teste em [`tests/`](../tests/) e [`cypress/`](../cypress/).