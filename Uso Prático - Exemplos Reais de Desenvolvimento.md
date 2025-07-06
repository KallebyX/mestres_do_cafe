# Uso Prático - Exemplos Reais de Desenvolvimento

## 🎯 Cenários Reais de Uso

Agora que você tem tudo configurado, vamos ver exemplos práticos de como usar a configuração no desenvolvimento do projeto Mestres do Café.

## 📝 Exemplo 1: Análise de Código Existente

### Cenário
Você está revisando um componente React existente e quer melhorá-lo.

### Como Fazer

1. **Abra o arquivo** `apps/web/src/components/ProductCard.tsx`
2. **Selecione todo o código** (Ctrl+A)
3. **Pressione Ctrl+K** para abrir o chat
4. **Digite este prompt:**

```
Analise este componente ProductCard considerando:

1. Padrões TypeScript rigorosos do projeto Mestres do Café
2. Otimizações de performance (memoização, lazy loading)
3. Acessibilidade e UX para e-commerce de café
4. Integração com React Query para dados
5. Consistência com design system Tailwind
6. Error handling e loading states
7. Testabilidade

Sugira melhorias específicas seguindo a arquitetura Clean do projeto.
```

### Resposta Esperada

O Claude deve analisar o código e sugerir melhorias como:
- Adicionar React.memo para otimização
- Melhorar tipos TypeScript
- Implementar error boundaries
- Sugerir testes unitários
- Otimizar acessibilidade

## 🚀 Exemplo 2: Implementar Nova Feature

### Cenário
Implementar sistema de avaliações de produtos.

### Passo a Passo

#### 1. Planejamento da Feature

**Prompt inicial:**
```
Preciso implementar um sistema de avaliações de produtos no Mestres do Café.

Requisitos:
- Clientes podem avaliar produtos comprados (1-5 estrelas + comentário)
- Moderação de comentários por admins
- Exibição de média e distribuição de avaliações
- Filtros por nota na listagem

Considerando a arquitetura Clean + DDD do projeto:
1. Projete os modelos de domínio
2. Defina as APIs necessárias
3. Planeje os componentes React
4. Sugira estratégia de testes

Stack: React + TypeScript + Flask + SQLAlchemy + PostgreSQL
```

#### 2. Implementação Backend

**Selecione a pasta** `apps/api/src/models/` e use este prompt:
```
Implemente o modelo Review para o sistema de avaliações:

Requisitos técnicos:
- Seguir padrões SQLAlchemy do projeto
- Relacionamentos com Product e User
- Validações de negócio (nota 1-5, comentário opcional)
- Timestamps de criação/atualização
- Soft delete para moderação
- Índices para performance

Inclua type hints e docstrings Google style.
```

#### 3. Implementação Frontend

**Crie novo arquivo** `apps/web/src/components/ProductReviews.tsx` e use:
```
Crie componente ProductReviews para exibir avaliações:

Funcionalidades:
- Exibir lista de avaliações com paginação
- Mostrar média e distribuição de estrelas
- Formulário para nova avaliação (usuários logados)
- Loading states e error handling
- Responsivo (mobile-first)

Padrões do projeto:
- TypeScript rigoroso com interfaces
- Tailwind CSS para styling
- React Query para dados
- React Hook Form para formulário
- Error boundaries

Inclua props interface e testes unitários básicos.
```

## 🐛 Exemplo 3: Debugging de Problema

### Cenário
API de produtos retornando erro 500 esporadicamente.

### Como Debugar

1. **Colete informações do erro:**
   - Logs do backend
   - Request que falhou
   - Contexto do usuário

2. **Use este prompt:**
```
Debug erro 500 na API de produtos do Mestres do Café:

**Erro:**
- Endpoint: GET /api/products?category=espresso
- Status: 500 Internal Server Error
- Frequência: ~10% das requests
- Usuário: cliente logado

**Logs:**
```
[2025-01-06 10:30:15] ERROR: SQLAlchemy IntegrityError in products.py:45
[2025-01-06 10:30:15] ERROR: (psycopg2.errors.UniqueViolation) duplicate key value violates unique constraint
[2025-01-06 10:30:15] ERROR: DETAIL: Key (slug)=(cafe-especial-brasil) already exists.
```

**Contexto do Sistema:**
- Flask + SQLAlchemy + PostgreSQL
- Clean Architecture (Controller → Service → Repository)
- Cache Redis ativo
- Deploy no Render

Analise possíveis causas e sugira correção seguindo padrões do projeto.
```

### Resposta Esperada

O Claude deve identificar:
- Problema de concorrência na geração de slugs
- Sugerir implementação de slug único
- Propor tratamento de erro apropriado
- Recomendar testes de concorrência

## 🔄 Exemplo 4: Refatoração de Código Legacy

### Cenário
Refatorar serviço de produtos para melhor aderência à Clean Architecture.

### Como Fazer

1. **Abra** `apps/api/src/services/product_service.py`
2. **Selecione o código** que precisa refatoração
3. **Use este prompt:**

```
Refatore este ProductService para melhor aderência à Clean Architecture:

**Problemas identificados:**
- Lógica de negócio misturada com acesso a dados
- Dependências diretas do SQLAlchemy
- Métodos muito grandes e complexos
- Falta de injeção de dependência
- Testes difíceis de escrever

**Objetivos da refatoração:**
1. Implementar Repository pattern
2. Separar lógica de negócio
3. Adicionar interfaces/abstrações
4. Facilitar testes unitários
5. Seguir princípios SOLID

Mantenha compatibilidade com APIs existentes e siga padrões DDD do projeto.
```

## 📊 Exemplo 5: Code Review Automatizado

### Cenário
Revisar Pull Request antes de merge.

### Como Fazer

1. **Abra os arquivos modificados** no PR
2. **Para cada arquivo, use:**

```
Code review deste arquivo considerando:

**Critérios de Qualidade:**
1. Aderência aos padrões do projeto Mestres do Café
2. Segurança (validação de entrada, sanitização)
3. Performance (queries otimizadas, cache)
4. Testabilidade e cobertura
5. Documentação e comentários
6. Compatibilidade com arquitetura existente

**Verificações Específicas:**
- TypeScript: tipos explícitos, interfaces bem definidas
- Python: type hints, docstrings, PEP 8
- React: hooks apropriados, memoização quando necessário
- Flask: validação Pydantic, error handling

Forneça feedback construtivo e sugestões específicas.
```

## 🧪 Exemplo 6: Geração de Testes

### Cenário
Criar testes para nova funcionalidade.

### Como Fazer

**Para testes unitários Python:**
```
Gere testes unitários para a classe ProductService:

**Métodos a testar:**
- create_product()
- update_product()
- delete_product()
- get_products_by_category()

**Requisitos:**
- Usar pytest e fixtures
- Mocks para dependências externas
- Testes de casos de sucesso e erro
- Validação de regras de negócio
- Cobertura mínima 90%

Siga padrões de teste do projeto e estrutura AAA (Arrange, Act, Assert).
```

**Para testes React:**
```
Crie testes para o componente ProductCard:

**Cenários a testar:**
- Renderização com dados válidos
- Estados de loading e erro
- Interações do usuário (cliques, hover)
- Acessibilidade (screen readers)
- Responsividade

**Ferramentas:**
- Jest + React Testing Library
- Mock Service Worker para APIs
- Testes de snapshot quando apropriado

Inclua setup e teardown necessários.
```

## 🔧 Exemplo 7: Otimização de Performance

### Cenário
Melhorar performance da página de listagem de produtos.

### Como Fazer

```
Otimize a performance da listagem de produtos:

**Problemas atuais:**
- Carregamento lento com muitos produtos (500ms+)
- Re-renders desnecessários
- Imagens não otimizadas
- Queries N+1 no backend

**Análise necessária:**
1. Backend: queries SQLAlchemy, eager loading
2. Frontend: memoização React, lazy loading
3. Cache: estratégias Redis
4. Imagens: WebP, lazy loading, CDN

**Implementação:**
- Mantenha compatibilidade com APIs
- Siga padrões de performance do projeto
- Inclua métricas de melhoria
- Testes de carga quando necessário

Stack: React + Flask + PostgreSQL + Redis
```

## 📱 Exemplo 8: Implementação Mobile-First

### Cenário
Criar componente responsivo para mobile.

### Como Fazer

```
Implemente componente ProductGrid responsivo:

**Requisitos:**
- Mobile-first design
- Grid adaptativo (1 col mobile, 2-4 desktop)
- Touch-friendly (botões 44px+)
- Performance em dispositivos lentos
- Acessibilidade completa

**Tecnologias:**
- React + TypeScript
- Tailwind CSS (breakpoints sm, md, lg, xl)
- Intersection Observer para lazy loading
- React Query para dados

**Padrões do projeto:**
- Componentes funcionais com hooks
- Props interfaces explícitas
- Error boundaries
- Testes em múltiplos viewports

Inclua exemplos de uso e documentação.
```

## 🔐 Exemplo 9: Implementação de Segurança

### Cenário
Adicionar autenticação 2FA.

### Como Fazer

```
Implemente autenticação 2FA no Mestres do Café:

**Requisitos de segurança:**
- TOTP (Time-based One-Time Password)
- QR code para setup
- Códigos de backup
- Rate limiting
- Logs de auditoria

**Arquitetura:**
- Backend: Flask + JWT + Redis
- Frontend: React + TypeScript
- Biblioteca: pyotp (Python), qrcode.js (React)

**Implementação:**
1. Modelos de dados (User.two_factor_secret)
2. APIs de setup e verificação
3. Middleware de validação
4. Componentes React para UI
5. Testes de segurança

Siga padrões de segurança enterprise e OWASP guidelines.
```

## 📈 Exemplo 10: Monitoramento e Métricas

### Cenário
Implementar dashboard de métricas de negócio.

### Como Fazer

```
Crie dashboard de métricas para o Mestres do Café:

**Métricas necessárias:**
- Vendas por período (diário, mensal)
- Produtos mais vendidos
- Taxa de conversão
- Valor médio do pedido
- Satisfação do cliente (avaliações)

**Implementação:**
- Backend: queries otimizadas, cache Redis
- Frontend: gráficos com Chart.js ou D3
- Real-time: WebSockets para atualizações
- Export: PDF/Excel para relatórios

**Arquitetura:**
- Repository pattern para queries complexas
- Service layer para cálculos
- React components para visualização
- Responsive design para mobile

Inclua testes de performance e validação de dados.
```

## 🎯 Dicas para Máxima Efetividade

### 1. Sempre Forneça Contexto
```
❌ "Crie um componente de botão"
✅ "Crie componente Button para o projeto Mestres do Café seguindo padrões TypeScript e Tailwind CSS estabelecidos"
```

### 2. Seja Específico sobre Padrões
```
❌ "Refatore este código"
✅ "Refatore seguindo Clean Architecture e padrões DDD do projeto, mantendo compatibilidade com APIs existentes"
```

### 3. Inclua Requisitos Técnicos
```
❌ "Implemente autenticação"
✅ "Implemente autenticação JWT com refresh tokens, seguindo padrões de segurança enterprise do projeto Flask + PostgreSQL"
```

### 4. Mencione Testes e Qualidade
```
❌ "Crie uma API"
✅ "Crie API REST com validação Pydantic, testes unitários, documentação OpenAPI, seguindo padrões do projeto"
```

## 🔍 Verificação de Qualidade

### Checklist para Cada Interação

- [ ] Claude mencionou o projeto "Mestres do Café"?
- [ ] Sugestões seguem Clean Architecture?
- [ ] Código inclui TypeScript rigoroso?
- [ ] Python tem type hints e docstrings?
- [ ] Testes foram considerados?
- [ ] Padrões de segurança foram seguidos?
- [ ] Performance foi considerada?
- [ ] Documentação foi incluída?

### Sinais de Configuração Funcionando

✅ **Bom:**
- Claude menciona padrões específicos do projeto
- Sugestões são consistentes com arquitetura
- Código gerado segue convenções estabelecidas
- Inclui considerações de teste e segurança

❌ **Ruim:**
- Sugestões genéricas sem contexto
- Código não segue padrões do projeto
- Falta de considerações arquiteturais
- Ausência de testes ou documentação

---

**Pronto!** Agora você tem exemplos práticos de como usar a configuração de engenharia de contexto no desenvolvimento real do projeto Mestres do Café. A chave é sempre fornecer contexto específico e aproveitar o conhecimento que o Claude tem sobre o projeto através da configuração.

