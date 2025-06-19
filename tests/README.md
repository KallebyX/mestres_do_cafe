# 🧪 Testes - Mestres do Café

Este projeto conta com uma suíte completa de testes para garantir qualidade e confiabilidade.

## 📁 Estrutura de Testes

```
tests/
├── frontend/              # Testes do React (Vitest + Testing Library)
│   ├── components/        # Testes de componentes
│   ├── pages/            # Testes de páginas
│   ├── contexts/         # Testes de contextos React
│   └── utils/            # Testes de utilitários
├── integration/          # Testes de integração frontend+backend
└── setup.js              # Configuração global dos testes

server/tests/             # Testes do backend (Jest + Supertest)
├── api/                  # Testes de endpoints
├── auth/                 # Testes de autenticação
├── products/             # Testes de produtos
├── gamification/         # Testes de gamificação
└── setup.js              # Configuração global do backend
```

## 🚀 Como Executar os Testes

### Frontend (Vitest)

```bash
# Executar todos os testes do frontend
npm run test

# Modo watch (executa automaticamente quando arquivos mudam)
npm run test:watch

# Executar uma vez só
npm run test:run

# Com cobertura de código
npm run test:coverage

# Interface visual (opcional)
npm run test:ui
```

### Backend (Jest)

```bash
# Executar testes do backend
npm run test:backend

# Modo watch
npm run test:backend:watch

# Apenas os testes do backend com cobertura
cd server && npm run test:coverage
```

### Todos os Testes

```bash
# Executar frontend + backend
npm run test:all

# Validação completa (lint + testes)
npm run validate
```

## 📋 Tipos de Testes

### 🎨 Frontend Tests

#### Componentes
- **Header.test.jsx**: Navegação, estado de login, responsividade
- **Footer.test.jsx**: Links, informações de contato
- **UI Components**: Botões, formulários, modais

#### Páginas
- **LandingPage.test.jsx**: Hero section, produtos em destaque, CTAs
- **LoginPage.test.jsx**: Formulário, validações, integração com API
- **RegisterPage.test.jsx**: Steps, validações PF/PJ, máscaras
- **MarketplacePage.test.jsx**: Filtros, busca, paginação
- **ProductPage.test.jsx**: Detalhes do produto, carrinho, avaliações

#### Utilitários
- **validation.test.js**: CPF, CNPJ, email, telefone, CEP
- **api.test.js**: Funções de API, tratamento de erro
- **utils.test.js**: Formatação, máscaras, helpers

### 🔧 Backend Tests

#### API Endpoints
- **health.test.js**: Health check, status da API
- **auth.test.js**: Login, registro, verificação de token
- **products.test.js**: CRUD de produtos, filtros, busca
- **gamification.test.js**: Pontos, níveis, leaderboard

#### Funcionalidades
- **Validações**: CPF, CNPJ, email, senhas
- **Autenticação**: JWT, middleware, permissões
- **Autorização**: Admin vs cliente, rotas protegidas
- **Gamificação**: Cálculo de pontos, níveis, histórico

### 🔗 Integration Tests

#### Fluxos Completos
- **auth-flow.test.js**: Login → Header → Navegação
- **register-flow.test.js**: Cadastro → Pontos → Dashboard
- **shopping-flow.test.js**: Produto → Carrinho → Checkout

## 📊 Cobertura de Código

### Metas de Cobertura
- **Frontend**: ≥ 80% de cobertura
- **Backend**: ≥ 85% de cobertura
- **Utilitários**: ≥ 95% de cobertura

### Relatórios
```bash
# Gerar relatório de cobertura
npm run test:coverage

# Visualizar no navegador
open coverage/index.html
```

## 🔧 Configuração

### Frontend (Vitest)
- **Arquivo**: `vitest.config.js`
- **Environment**: happy-dom
- **Setup**: `tests/setup.js`
- **Aliases**: `@/` → `src/`

### Backend (Jest)
- **Arquivo**: `server/jest.config.js`
- **Environment**: node
- **Setup**: `server/tests/setup.js`
- **Database**: Mock JSON files

## 🎯 Boas Práticas

### Estrutura de Testes
```javascript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup antes de cada teste
  })

  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Nomenclatura
- **Arquivos**: `*.test.{js,jsx}` ou `*.spec.{js,jsx}`
- **Describe**: Nome do componente ou funcionalidade
- **It**: Comportamento esperado em português

### Mocks
```javascript
// API Mock
vi.mock('@/lib/api', () => ({
  default: {
    auth: { login: vi.fn() }
  }
}))

// Component Mock
vi.mock('@/components/Header', () => ({
  default: () => <div>Mocked Header</div>
}))
```

### Helpers
```javascript
// Helper para renderizar com contextos
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}
```

## 🐛 Debugging

### Frontend
```bash
# Debug com Chrome DevTools
npm run test:ui

# Console logs nos testes
console.log('Debug info:', variable)
```

### Backend
```bash
# Debug com Node.js inspector
cd server && node --inspect-brk node_modules/.bin/jest

# Logs específicos
console.log('API Response:', response.body)
```

## 📝 Comandos Úteis

```bash
# Executar teste específico
npm test -- Header.test.jsx

# Executar testes que contém uma palavra
npm test -- --grep "login"

# Executar apenas testes modificados
npm test -- --changed

# Limpar cache de testes
npm test -- --clearCache
```

## 🚨 CI/CD

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    npm ci
    npm run validate
    npm run test:coverage
```

### Pré-commit Hooks
```json
{
  "pre-commit": [
    "npm run lint",
    "npm run test:run"
  ]
}
```

## 📚 Recursos

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest Docs](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)

---

## 🎯 Próximos Passos

- [ ] Testes E2E com Playwright
- [ ] Testes de performance
- [ ] Testes de acessibilidade
- [ ] Integração com SonarQube
- [ ] Testes de API com Postman/Newman 